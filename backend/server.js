import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import db from './db.js';
import { campusLogger } from './middleware/campusLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { validateURL, validateValidityMinutes, validateShortcode } from './validators.js';

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: false }));
app.use(campusLogger);

// ✅ single PORT definition
const PORT = process.env.PORT || 5000;
const HOSTNAME = process.env.HOSTNAME || 'http://localhost';

// Utility functions
function nowISO() {
  return new Date().toISOString();
}
function addMinutesISO(mins) {
  return new Date(Date.now() + mins * 60 * 1000).toISOString();
}
function guessCoarseLocation(req) {
  return (
    req.headers['cf-ipcountry'] ||
    req.headers['x-vercel-ip-country'] ||
    'unknown'
  );
}

/** Root endpoint */
app.get('/', (req, res) =>
  res.json({ message: '🚀 URL Shortener API running', ts: nowISO() })
);

/** Health check */
app.get('/health', (req, res) => res.json({ ok: true, ts: nowISO() }));

/** client telemetry (optional) */
app.post('/client-telemetry', (req, res) => res.status(204).end());

/** list all short urls */
app.get('/shorturls', async (req, res, next) => {
  try {
    const rows = await db.listUrls();
    const counts = await db.countClicksByShortcode();
    res.json(
      rows.map((r) => ({
        shortcode: r.shortcode,
        originalUrl: r.original_url,
        createdAt: r.created_at,
        expiry: r.expiry,
        totalClicks: counts[r.shortcode] || 0,
      }))
    );
  } catch (e) {
    next(e);
  }
});

/** create short url */
app.post('/shorturls', async (req, res, next) => {
  try {
    const { url, validity, shortcode } = req.body || {};

    if (!validateURL(url)) {
      const err = new Error('Invalid or missing `url`. Must be a valid http(s) URL.');
      err.status = 400;
      err.code = 'INVALID_URL';
      throw err;
    }
    if (!validateValidityMinutes(validity)) {
      const err = new Error('`validity` must be a positive integer (minutes).');
      err.status = 400;
      err.code = 'INVALID_VALIDITY';
      throw err;
    }
    if (!validateShortcode(shortcode)) {
      const err = new Error('`shortcode` must be 3-32 chars, alphanumeric/underscore/dash.');
      err.status = 400;
      err.code = 'INVALID_SHORTCODE';
      throw err;
    }

    const mins = validity ?? 30;
    let code = shortcode || '';

    if (code) {
      const existing = await db.getUrl(code);
      if (existing) {
        const err = new Error('Shortcode already in use.');
        err.status = 409;
        err.code = 'SHORTCODE_TAKEN';
        throw err;
      }
    } else {
      for (let i = 0; i < 10; i++) {
        const candidate = nanoid(6).replace(/[^A-Za-z0-9_-]/g, '');
        const existing = await db.getUrl(candidate);
        if (!existing) {
          code = candidate;
          break;
        }
      }
      if (!code) {
        const err = new Error('Failed to generate a unique shortcode.');
        err.status = 500;
        err.code = 'GENERATION_FAILED';
        throw err;
      }
    }

    const expiry = addMinutesISO(mins);
    await db.insertUrl({
      shortcode: code,
      original_url: url,
      created_at: nowISO(),
      expiry,
    });

    const shortLink = `${HOSTNAME}:${PORT}/${code}`;
    res.status(201).json({ shortLink, expiry });
  } catch (e) {
    next(e);
  }
});

/** get stats for shortcode */
app.get('/shorturls/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const rec = await db.getUrl(code);
    if (!rec) {
      const err = new Error('Shortcode not found.');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    const clicks = await db.listClicksFor(code);
    res.json({
      shortcode: code,
      originalUrl: rec.original_url,
      createdAt: rec.created_at,
      expiry: rec.expiry,
      totalClicks: clicks.length,
      clicks,
    });
  } catch (e) {
    next(e);
  }
});

/** redirect */
app.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const rec = await db.getUrl(code);
    if (!rec) {
      const err = new Error('Shortcode not found.');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    const now = new Date();
    const exp = new Date(rec.expiry);
    if (now > exp) {
      const err = new Error('Short link is expired.');
      err.status = 410;
      err.code = 'EXPIRED';
      throw err;
    }
    const ts = now.toISOString();
    const referrer = req.headers['referer'] || req.headers['referrer'] || null;
    const ip = (
      req.headers['x-forwarded-for'] || req.socket?.remoteAddress || ''
    ).toString();
    const location = guessCoarseLocation(req);
    await db.insertClick({ shortcode: code, ts, referrer, ip, location });

    res.redirect(302, rec.original_url);
  } catch (e) {
    next(e);
  }
});

// Error handler middleware
app.use(errorHandler);

// ✅ Only one clean listen call
app.listen(PORT, () => {
  console.log(`✅ Server running at ${HOSTNAME}:${PORT}`);
});

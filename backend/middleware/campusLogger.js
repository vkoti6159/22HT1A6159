/**
 * Mandatory custom logging middleware (no console.* or built-in loggers)
 * - Appends structured JSON lines to logs/<YYYY-MM-DD>.log
 */
import fs from 'fs';
import path from 'path';

const LOG_DIR = process.env.LOG_DIR || 'logs';
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

function writeLog(line) {
  const day = new Date().toISOString().slice(0, 10);
  const file = path.join(LOG_DIR, `${day}.log`);
  fs.appendFile(file, line + "\n", () => {});
}

export function campusLogger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl } = req;
  const rid = Math.random().toString(36).slice(2, 10);

  let bodyPreview;
  try {
    if (req.body) {
      bodyPreview = JSON.stringify(req.body);
      if (bodyPreview.length > 800) bodyPreview = bodyPreview.slice(0, 800) + '…';
    }
  } catch {}

  res.on('finish', () => {
    const ms = Date.now() - start;
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      rid,
      method,
      url: originalUrl,
      status: res.statusCode,
      ms,
      ip: (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString(),
      ref: req.headers['referer'] || req.headers['referrer'] || undefined,
      body: bodyPreview
    });
    writeLog(line);
  });

  next();
}

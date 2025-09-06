import React, { useState } from 'react'
import { Paper, Typography, Button, Stack, Alert, Divider, List, ListItem, ListItemText } from '@mui/material'
import UrlRow from '../components/UrlRow'

const API = (import.meta.env.VITE_API_BASE || 'http://localhost:8080');

function isValidUrl(s) {
  try { const u = new URL(s); return ['http:', 'https:'].includes(u.protocol); } catch { return false; }
}
function isIntString(s) {
  if (s === '' || s === undefined) return true;
  const n = Number(s);
  return Number.isInteger(n) && n > 0;
}
function isShortcodeValid(s) {
  if (!s) return true;
  return /^[A-Za-z0-9_-]{3,32}$/.test(s);
}

export default function ShortenerPage() {
  const [rows, setRows] = useState(Array.from({ length: 5 }, () => ({ url: '', validity: '', shortcode: '' })));
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const updateRow = (idx, newRow) => {
    const next = rows.slice(); next[idx] = newRow; setRows(next);
  };

  const validate = () => {
    for (const r of rows) {
      if (!r.url && !r.validity && !r.shortcode) continue; // empty line
      if (!isValidUrl(r.url)) return 'Each non-empty row must include a valid http(s) URL.';
      if (!isIntString(r.validity)) return '`validity` must be a positive integer (minutes).';
      if (!isShortcodeValid(r.shortcode)) return '`shortcode` must be 3-32 chars [A-Za-z0-9_-].';
    }
    return null;
  };

  const submit = async () => {
    setError(null);
    const v = validate();
    if (v) { setError(v); return; }

    const payloads = rows.filter(r => r.url).map(r => ({
      url: r.url,
      ...(r.validity ? { validity: Number(r.validity) } : {}),
      ...(r.shortcode ? { shortcode: r.shortcode } : {}),
    }));
    if (payloads.length === 0) { setError('Please provide at least one URL.'); return; }

    setBusy(true);
    try {
      const responses = await Promise.all(payloads.map(p =>
        fetch(`${API}/shorturls`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        }).then(async r => {
          const j = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(j?.error?.message || 'Request failed');
          return j;
        })
      ));
      setResults(responses);
      // send minimal telemetry (logged by backend middleware)
      fetch(`${API}/client-telemetry`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'batch_create', count: responses.length })});
    } catch (e) {
      setError(e.message);
    } finally { setBusy(false); }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Shorten URLs (up to 5)</Typography>
      {rows.map((r, i) => <UrlRow key={i} index={i} row={r} onChange={updateRow} />)}
      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
      <Button variant="contained" onClick={submit} disabled={busy}>Create Short Links</Button>

      {results.length > 0 && <>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>Results</Typography>
        <List>
          {results.map((r, i) => (
            <ListItem key={i} divider>
              <ListItemText
                primary={r.shortLink}
                secondary={`Expires at: ${r.expiry}`}
              />
            </ListItem>
          ))}
        </List>
      </>}
    </Paper>
  )
}

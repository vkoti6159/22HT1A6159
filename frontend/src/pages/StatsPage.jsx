import React, { useEffect, useState } from 'react'
import { Paper, Typography, List, ListItem, ListItemText, Divider, Link as MLink, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent } from '@mui/material'

const API = (import.meta.env.VITE_API_BASE || 'http://localhost:8080');

export default function StatsPage() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(null);

  const load = async () => {
    setBusy(true); setError(null);
    try {
      const r = await fetch(`${API}/shorturls`);
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error?.message || 'Failed to load');
      setItems(j);
    } catch (e) {
      setError(e.message);
    } finally { setBusy(false); }
  };

  useEffect(() => { load(); }, []);

  const openDetails = async (code) => {
    try {
      const r = await fetch(`${API}/shorturls/${code}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error?.message || 'Failed to load details');
      setDetails(j); setOpen(true);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Short URLs — Statistics</Typography>
      <Button onClick={load} variant="outlined" sx={{ mb: 2 }}>Refresh</Button>
      {busy && <CircularProgress />}
      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
      {!busy && !error && <List>
        {items.map((it) => (
          <ListItem key={it.shortcode} divider secondaryAction={
            <Button variant="text" onClick={() => openDetails(it.shortcode)}>Details</Button>
          }>
            <ListItemText
              primary={<MLink href={`${API.replace('http://localhost:8080','http://localhost:8080')}/${it.shortcode}`} target="_blank" rel="noreferrer">{`${API}/${it.shortcode}`}</MLink>}
              secondary={`Created: ${it.createdAt}  |  Expires: ${it.expiry}  |  Clicks: ${it.totalClicks}`}
            />
          </ListItem>
        ))}
      </List>}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Details — {details?.shortcode}</DialogTitle>
        <DialogContent dividers>
          {details && <>
            <Typography>Original URL: {details.originalUrl}</Typography>
            <Typography>Created: {details.createdAt}</Typography>
            <Typography>Expiry: {details.expiry}</Typography>
            <Typography sx={{ mt: 2, mb: 1 }}>Clicks: {details.totalClicks}</Typography>
            <Divider sx={{ mb: 2 }} />
            {details.clicks?.length === 0 && <Typography variant="body2">No clicks yet.</Typography>}
            {details.clicks?.map((c, i) => (
              <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>
                {c.ts} — referrer: {c.referrer || 'n/a'} — ip: {c.ip || 'n/a'} — location: {c.location || 'unknown'}
              </Typography>
            ))}
          </>}
        </DialogContent>
      </Dialog>
    </Paper>
  )
}

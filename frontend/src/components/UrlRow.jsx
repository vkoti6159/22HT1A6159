import React from 'react'
import { TextField, Grid } from '@mui/material'

export default function UrlRow({ index, row, onChange }) {
  const handle = (key) => (e) => onChange(index, { ...row, [key]: e.target.value });

  return (
    <Grid container spacing={2} sx={{ mb: 1 }}>
      <Grid item xs={12} md={6}>
        <TextField
          label="Original URL"
          value={row.url}
          onChange={handle('url')}
          fullWidth
          required
          placeholder="https://example.com/page"
        />
      </Grid>
      <Grid item xs={6} md={3}>
        <TextField
          label="Validity (minutes)"
          value={row.validity}
          onChange={handle('validity')}
          fullWidth
          placeholder="30"
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
        />
      </Grid>
      <Grid item xs={6} md={3}>
        <TextField
          label="Preferred Shortcode"
          value={row.shortcode}
          onChange={handle('shortcode')}
          fullWidth
          placeholder="optional"
        />
      </Grid>
    </Grid>
  )
}

import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material'

export default function App() {
  const loc = useLocation();
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>URL Shortener</Typography>
          <Button color="inherit" component={Link} to="/" disabled={loc.pathname === '/'}>Shorten</Button>
          <Button color="inherit" component={Link} to="/stats" disabled={loc.pathname === '/stats'}>Statistics</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Outlet />
      </Container>
    </>
  )
}

const hostname = window.location.hostname;
export const API_BASE = hostname === 'localhost'
  ? 'http://localhost:3002'
  : `https://${hostname}`;

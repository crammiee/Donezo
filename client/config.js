const hostname = window.location.hostname;
export const API_BASE = hostname === 'localhost' || hostname === '127.0.0.1'
  ? 'http://localhost:3002'
  : 'https://donezo-311l.onrender.com';

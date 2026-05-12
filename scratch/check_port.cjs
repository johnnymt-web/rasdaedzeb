const net = require('net');

const host = 'uaowjueunmmjnggddaej.supabase.co';
const port = 5432;

const socket = new net.Socket();
socket.setTimeout(5000);

socket.on('connect', () => {
  console.log(`Successfully connected to ${host}:${port}`);
  socket.destroy();
});

socket.on('timeout', () => {
  console.log(`Connection to ${host}:${port} timed out`);
  socket.destroy();
});

socket.on('error', (err) => {
  console.log(`Connection to ${host}:${port} failed: ${err.message}`);
  socket.destroy();
});

socket.connect(port, host);

/**
 * Optional WebSocket Server (server.js)
 * Menjalankan server realtime ringan berbasis Node.js untuk koneksi multi-device HP/Tablet di jaringan Wi-Fi lokal.
 * Cara jalankan: node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// Simple HTTP File Server for serving game static files over Wi-Fi
const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.json': 'application/json'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Realtime Broadcast Hub
let clients = [];
server.on('upgrade', (request, socket, head) => {
  // Simple WebSocket handshaker
  const key = request.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return;
  }

  const crypto = require('crypto');
  const digest = crypto.createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');

  const headers = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${digest}`
  ];

  socket.write(headers.join('\r\n') + '\r\n\r\n');
  clients.push(socket);

  socket.on('data', (buffer) => {
    // Broadcast received frame to all other clients
    clients.forEach(client => {
      if (client !== socket && client.writable) {
        client.write(buffer);
      }
    });
  });

  socket.on('close', () => {
    clients = clients.filter(c => c !== socket);
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🏆 Server Realtime Detektif Lingkungan Aktif!`);
  console.log(`Buka browser di HP/Laptop lain pada port: http://localhost:${PORT}`);
  console.log(`====================================================`);
});

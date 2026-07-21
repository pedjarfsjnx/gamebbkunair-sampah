/**
 * Realtime Multi-Laptop Web & WebSocket Server (server.js)
 * Menjalankan server HTTP & WebSocket realtime berbasis Node.js untuk koneksi multi-laptop di jaringan Wi-Fi lokal.
 * Dilengkapi dengan RFC6455 compliant WebSocket frame unmasking & relay engine.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 8080;

// Simple HTTP File Server for serving game static files over Wi-Fi
const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  const ext = path.extname(filePath);
  
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
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

// RFC6455 WebSocket Parser & Framer
function parseAndUnmaskFrame(buffer) {
  if (buffer.length < 2) return null;
  
  const fin = (buffer[0] & 0x80) === 0x80;
  const opcode = buffer[0] & 0x0f;
  const isMasked = (buffer[1] & 0x80) === 0x80;
  let payloadLength = buffer[1] & 0x7f;
  
  let offset = 2;
  if (payloadLength === 126) {
    if (buffer.length < 4) return null;
    payloadLength = buffer.readUInt16BE(2);
    offset = 4;
  } else if (payloadLength === 127) {
    if (buffer.length < 10) return null;
    payloadLength = buffer.readUInt32BE(6);
    offset = 10;
  }
  
  let payloadData = Buffer.alloc(payloadLength);
  if (isMasked) {
    if (buffer.length < offset + 4 + payloadLength) return null;
    const maskKey = buffer.slice(offset, offset + 4);
    offset += 4;
    for (let i = 0; i < payloadLength; i++) {
      payloadData[i] = buffer[offset + i] ^ maskKey[i % 4];
    }
  } else {
    if (buffer.length < offset + payloadLength) return null;
    buffer.copy(payloadData, 0, offset, offset + payloadLength);
  }
  
  return { fin, opcode, payload: payloadData };
}

function createUnmaskedFrame(payloadBuffer) {
  const len = payloadBuffer.length;
  let header;
  
  if (len <= 125) {
    header = Buffer.alloc(2);
    header[0] = 0x81; // FIN=1, Text Opcode=1
    header[1] = len;  // MASK=0, len
  } else if (len <= 65535) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeUInt32BE(0, 2);
    header.writeUInt32BE(len, 6);
  }
  
  return Buffer.concat([header, payloadBuffer]);
}

// Realtime WebSocket Broadcast Hub
let clients = [];

server.on('upgrade', (request, socket, head) => {
  const key = request.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return;
  }

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
    const frame = parseAndUnmaskFrame(buffer);
    if (!frame) return;

    // If text frame or ping frame
    if (frame.opcode === 0x1) {
      const broadcastFrame = createUnmaskedFrame(frame.payload);
      
      // Relay to ALL connected laptops (including sender for acknowledgment or filtering)
      clients.forEach(client => {
        if (client.writable) {
          try {
            client.write(broadcastFrame);
          } catch (e) {}
        }
      });
    } else if (frame.opcode === 0x8) {
      // Close frame
      socket.end();
    }
  });

  socket.on('close', () => {
    clients = clients.filter(c => c !== socket);
  });

  socket.on('error', () => {
    clients = clients.filter(c => c !== socket);
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🏆 Server Realtime Detektif Lingkungan Aktif!`);
  console.log(`Buka browser di HP/Laptop lain pada port: http://localhost:${PORT}`);
  console.log(`====================================================`);
});

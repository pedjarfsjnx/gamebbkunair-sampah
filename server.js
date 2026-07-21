/**
 * Realtime Multi-Laptop Web & WebSocket Server (server.js)
 * RFC6455 WebSocket dengan TCP stream buffering yang benar.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 8080;

// HTTP File Server
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
      res.end(content);
    }
  });
});

// ─── RFC6455 Frame Parser (with TCP stream reassembly) ───────────────────────

/**
 * Hitung total ukuran frame WebSocket dari buffer (termasuk header + masking key + payload).
 * Return 0 jika data belum cukup (stream belum lengkap).
 */
function getFrameByteSize(buffer) {
  if (buffer.length < 2) return 0;
  const isMasked = (buffer[1] & 0x80) === 0x80;
  let payloadLength = buffer[1] & 0x7f;
  let headerEnd = 2;

  if (payloadLength === 126) {
    if (buffer.length < 4) return 0;
    payloadLength = buffer.readUInt16BE(2);
    headerEnd = 4;
  } else if (payloadLength === 127) {
    if (buffer.length < 10) return 0;
    // Gunakan hanya 32-bit bawah (pesan game tidak akan > 4GB)
    payloadLength = buffer.readUInt32BE(6);
    headerEnd = 10;
  }

  const maskLen = isMasked ? 4 : 0;
  const totalSize = headerEnd + maskLen + payloadLength;

  if (buffer.length < totalSize) return 0; // belum lengkap
  return totalSize;
}

/**
 * Unmask dan parse satu frame WebSocket dari buffer (frame harus sudah lengkap).
 */
function parseFrame(buffer) {
  const opcode = buffer[0] & 0x0f;
  const isMasked = (buffer[1] & 0x80) === 0x80;
  let payloadLength = buffer[1] & 0x7f;
  let offset = 2;

  if (payloadLength === 126) {
    payloadLength = buffer.readUInt16BE(2);
    offset = 4;
  } else if (payloadLength === 127) {
    payloadLength = buffer.readUInt32BE(6);
    offset = 10;
  }

  const payload = Buffer.alloc(payloadLength);
  if (isMasked) {
    const maskKey = buffer.slice(offset, offset + 4);
    offset += 4;
    for (let i = 0; i < payloadLength; i++) {
      payload[i] = buffer[offset + i] ^ maskKey[i % 4];
    }
  } else {
    buffer.copy(payload, 0, offset, offset + payloadLength);
  }

  return { opcode, payload };
}

/**
 * Buat frame WebSocket tanpa mask (server → client) untuk teks.
 */
function createTextFrame(payloadBuffer) {
  const len = payloadBuffer.length;
  let header;

  if (len <= 125) {
    header = Buffer.alloc(2);
    header[0] = 0x81;
    header[1] = len;
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

// ─── WebSocket Broadcast Hub ─────────────────────────────────────────────────

let clients = [];

server.on('upgrade', (request, socket) => {
  const key = request.headers['sec-websocket-key'];
  if (!key) { socket.destroy(); return; }

  const digest = crypto.createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');

  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    `Sec-WebSocket-Accept: ${digest}\r\n\r\n`
  );

  // Per-socket TCP stream buffer (KRITIS: mencegah pesan hilang saat frame terfragmentasi)
  socket._wsBuf = Buffer.alloc(0);

  clients.push(socket);

  socket.on('data', (chunk) => {
    // Gabungkan chunk baru dengan sisa buffer sebelumnya
    socket._wsBuf = Buffer.concat([socket._wsBuf, chunk]);

    // Proses semua frame lengkap yang ada di buffer
    while (true) {
      const frameSize = getFrameByteSize(socket._wsBuf);
      if (frameSize === 0) break; // belum ada frame lengkap, tunggu data berikutnya

      const frameBuffer = socket._wsBuf.slice(0, frameSize);
      socket._wsBuf = socket._wsBuf.slice(frameSize); // konsumsi frame dari buffer

      const frame = parseFrame(frameBuffer);

      if (frame.opcode === 0x1) {
        // Text frame: broadcast ke SEMUA klien (termasuk pengirim — JS client menyaring sendiri)
        const outFrame = createTextFrame(frame.payload);
        clients.forEach(client => {
          if (client.writable) {
            try { client.write(outFrame); } catch (e) {}
          }
        });
      } else if (frame.opcode === 0x9) {
        // Ping → kirim Pong
        const pong = Buffer.alloc(2);
        pong[0] = 0x8A; pong[1] = 0;
        try { socket.write(pong); } catch (e) {}
      } else if (frame.opcode === 0x8) {
        // Close
        socket.end();
        break;
      }
    }
  });

  socket.on('close', () => { clients = clients.filter(c => c !== socket); });
  socket.on('error', () => { clients = clients.filter(c => c !== socket); });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🏆 Server Realtime Detektif Lingkungan Aktif!`);
  console.log(`Buka browser di http://localhost:${PORT}`);
  console.log(`Untuk multi-device: http://<IP-Laptop-Guru>:${PORT}`);
  console.log(`====================================================`);
});

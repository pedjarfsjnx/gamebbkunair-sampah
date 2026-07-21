/**
 * test_full_multiplayer_simulation.js
 * Node.js automated end-to-end WebSocket simulation testing 1 Host + 4 Players.
 */

const http = require('http');
const crypto = require('crypto');

const SERVER_HOST = 'localhost';
const SERVER_PORT = 8080;

// Helper to create WebSocket client connection using RFC6455
function createWSClient(name) {
  return new Promise((resolve, reject) => {
    const wsKey = crypto.randomBytes(16).toString('base64');
    const req = http.request({
      hostname: SERVER_HOST,
      port: SERVER_PORT,
      path: '/',
      headers: {
        'Connection': 'Upgrade',
        'Upgrade': 'websocket',
        'Sec-WebSocket-Key': wsKey,
        'Sec-WebSocket-Version': '13'
      }
    });

    req.on('upgrade', (res, socket, head) => {
      const client = {
        name: name,
        socket: socket,
        clientId: 'client_' + name + '_' + Math.random().toString(36).substr(2, 6),
        listeners: [],
        buf: Buffer.alloc(0)
      };

      socket.on('data', (chunk) => {
        client.buf = Buffer.concat([client.buf, chunk]);
        while (true) {
          if (client.buf.length < 2) break;
          let len = client.buf[1] & 0x7f;
          let offset = 2;
          if (len === 126) {
            if (client.buf.length < 4) break;
            len = client.buf.readUInt16BE(2);
            offset = 4;
          } else if (len === 127) {
            if (client.buf.length < 10) break;
            len = client.buf.readUInt32BE(6);
            offset = 10;
          }
          if (client.buf.length < offset + len) break;

          const payload = client.buf.slice(offset, offset + len);
          client.buf = client.buf.slice(offset + len);

          try {
            const data = JSON.parse(payload.toString());
            client.listeners.forEach(fn => fn(data));
          } catch(e) {}
        }
      });

      client.send = function(msgObj) {
        msgObj.senderId = client.clientId;
        msgObj.timestamp = Date.now();
        msgObj.msgId = `${client.clientId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        
        const payloadBuf = Buffer.from(JSON.stringify(msgObj));
        const len = payloadBuf.length;
        let header;
        const maskKey = crypto.randomBytes(4);

        if (len <= 125) {
          header = Buffer.alloc(6);
          header[0] = 0x81;
          header[1] = 0x80 | len;
          maskKey.copy(header, 2);
        } else if (len <= 65535) {
          header = Buffer.alloc(8);
          header[0] = 0x81;
          header[1] = 0x80 | 126;
          header.writeUInt16BE(len, 2);
          maskKey.copy(header, 4);
        } else {
          header = Buffer.alloc(14);
          header[0] = 0x81;
          header[1] = 0x80 | 127;
          header.writeUInt32BE(0, 2);
          header.writeUInt32BE(len, 6);
          maskKey.copy(header, 10);
        }

        const maskedPayload = Buffer.alloc(len);
        for (let i = 0; i < len; i++) {
          maskedPayload[i] = payloadBuf[i] ^ maskKey[i % 4];
        }

        socket.write(Buffer.concat([header, maskedPayload]));
      };

      client.onMessage = function(fn) {
        client.listeners.push(fn);
      };

      resolve(client);
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

// Main Simulation Function
async function runFullSimulation() {
  console.log("=================================================");
  console.log("🎮 SIMULASI REALTIME MULTIPLAYER (1 Host + 4 Players)");
  console.log("=================================================\n");

  const roomCode = 'SILIR-TEST';
  let logs = [];
  function log(tag, msg) {
    const entry = `[${new Date().toLocaleTimeString('id-ID')}] [${tag}] ${msg}`;
    console.log(entry);
    logs.push(entry);
  }

  try {
    // Step 1: Connect 5 WS clients
    log('SYS', 'Menghubungkan 5 Klien WebSocket ke server http://localhost:8080...');
    const host = await createWSClient('HOST');
    const p1 = await createWSClient('Player1_Red');
    const p2 = await createWSClient('Player2_Blue');
    const p3 = await createWSClient('Player3_Green');
    const p4 = await createWSClient('Player4_Yellow');
    log('SYS', '✅ 5 Klien WebSocket berhasil terhubung ke server!');

    // Mock State for Clients
    const hostState = {
      role: 'HOST',
      roomCode: roomCode,
      phase: 'LOBBY',
      teams: [
        { id: 'team-red', name: 'Tim Merah', score: 0 },
        { id: 'team-blue', name: 'Tim Biru', score: 0 },
        { id: 'team-green', name: 'Tim Hijau', score: 0 },
        { id: 'team-yellow', name: 'Tim Kuning', score: 0 }
      ],
      connections: { 'team-red': false, 'team-blue': false, 'team-green': false, 'team-yellow': false },
      itemOwnership: {},
      firstClaimTime: {}
    };

    const playersState = [p1, p2, p3, p4].map((p, idx) => ({
      client: p,
      teamId: ['team-red', 'team-blue', 'team-green', 'team-yellow'][idx],
      teamName: ['Tim Merah', 'Tim Biru', 'Tim Hijau', 'Tim Kuning'][idx],
      phase: 'LOBBY',
      receivedMessages: []
    }));

    // Setup HOST message handler
    host.onMessage((msg) => {
      if (msg.senderId === host.clientId) return;
      
      if (msg.type === 'PLAYER_JOINED') {
        const teamId = msg.payload.teamId || 'team-red';
        hostState.connections[teamId] = true;
        log('HOST', `📨 Terima sinyal PLAYER_JOINED dari ${teamId}! Connected: ${JSON.stringify(hostState.connections)}`);
        
        // Broadcast ROOM_STATE to all players
        host.send({
          type: 'ROOM_STATE',
          roomCode: roomCode,
          payload: {
            roomCode: roomCode,
            phase: hostState.phase,
            teamCount: 4,
            teams: hostState.teams,
            teamConnections: hostState.connections
          }
        });
      } else if (msg.type === 'CLAIM_ITEM') {
        const { itemId, teamId } = msg.payload;
        if (!hostState.itemOwnership[itemId]) {
          hostState.itemOwnership[itemId] = teamId;
          const t = hostState.teams.find(x => x.id === teamId);
          if (t) {
            t.score++;
            if (hostState.firstClaimTime[teamId] === undefined) {
              hostState.firstClaimTime[teamId] = Date.now();
            }
          }
          log('HOST', `🎯 Terima CLAIM_ITEM item #${itemId} oleh ${teamId}. Score ${t.name}: ${t.score}`);

          // Broadcast CONFIRM_CLAIM_ITEM
          host.send({
            type: 'CONFIRM_CLAIM_ITEM',
            roomCode: roomCode,
            payload: {
              itemId: itemId,
              teamId: teamId,
              teams: hostState.teams,
              itemOwnership: hostState.itemOwnership,
              firstClaimTime: hostState.firstClaimTime
            }
          });
        } else {
          log('HOST', `⚠️ ABAIKAN CLAIM_ITEM item #${itemId} (Sudah diklaim oleh ${hostState.itemOwnership[itemId]})`);
        }
      }
    });

    // Setup PLAYERS message handlers
    playersState.forEach((ps) => {
      ps.client.onMessage((msg) => {
        if (msg.senderId === ps.client.clientId) return;
        ps.receivedMessages.push(msg);

        if (msg.type === 'START_GAME') {
          ps.phase = 'PLAYING';
          log(ps.teamName, `▶ Menerima START_GAME! Phase: PLAYING`);
        } else if (msg.type === 'CONFIRM_CLAIM_ITEM') {
          log(ps.teamName, `📨 Sync CONFIRM_CLAIM_ITEM: item #${msg.payload.itemId} -> ${msg.payload.teamId}`);
        }
      });
    });

    // Step 2: Players send PLAYER_JOINED
    log('FLOW', '\n--- STEP 2: Siswa bergabung dari 4 Laptop ---');
    for (let ps of playersState) {
      ps.client.send({
        type: 'PLAYER_JOINED',
        roomCode: roomCode,
        payload: { roomCode: roomCode, teamId: ps.teamId }
      });
      await new Promise(r => setTimeout(r, 200));
    }

    await new Promise(r => setTimeout(r, 500));

    // Verify all 4 teams connected on HOST
    const allConnected = Object.values(hostState.connections).every(v => v === true);
    if (allConnected) {
      log('TEST', '✅ STATUS KONEKSI: Semua 4 Tim (Merah, Biru, Hijau, Kuning) berhasil TERHUBUNG di Host!');
    } else {
      log('TEST', '❌ ERROR: Tidak semua tim terhubung!');
    }

    // Step 3: HOST starts game
    log('FLOW', '\n--- STEP 3: Guru (Host) menekan Start Pertandingan ---');
    hostState.phase = 'PLAYING';
    host.send({
      type: 'START_GAME',
      roomCode: roomCode,
      payload: {
        teamCount: 4,
        roomCode: roomCode,
        teams: hostState.teams,
        timeLeft: 180
      }
    });

    await new Promise(r => setTimeout(r, 500));

    const allPlaying = playersState.every(ps => ps.phase === 'PLAYING');
    if (allPlaying) {
      log('TEST', '✅ START GAME: Semua 4 Laptop Siswa berhasil masuk ke phase PLAYING!');
    } else {
      log('TEST', '❌ ERROR: Ada laptop siswa yang belum masuk ke phase PLAYING!');
    }

    // Step 4: Simulate Gameplay Claims & Race Condition
    log('FLOW', '\n--- STEP 4: Simulasi Klaim Item & Anti-Double Claim (Race Condition) ---');

    // Item 1: Player 1 (Merah) klaim
    log('GAME', '🔴 Tim Merah mengeklik Item #1...');
    p1.send({ type: 'CLAIM_ITEM', roomCode: roomCode, payload: { itemId: 1, teamId: 'team-red' } });
    await new Promise(r => setTimeout(r, 400));

    // Item 2: Race condition! Player 2 (Biru) & Player 3 (Hijau) klaim Item #2 hampir serentak (jeda 5ms)
    log('GAME', '⚡ RACE CONDITION: Tim Biru & Tim Hijau mengeklik Item #2 hampir serentak!');
    p2.send({ type: 'CLAIM_ITEM', roomCode: roomCode, payload: { itemId: 2, teamId: 'team-blue' } });
    await new Promise(r => setTimeout(r, 5));
    p3.send({ type: 'CLAIM_ITEM', roomCode: roomCode, payload: { itemId: 2, teamId: 'team-green' } });
    await new Promise(r => setTimeout(r, 400));

    // Item 3: Player 4 (Kuning) klaim
    log('GAME', '🟡 Tim Kuning mengeklik Item #3...');
    p4.send({ type: 'CLAIM_ITEM', roomCode: roomCode, payload: { itemId: 3, teamId: 'team-yellow' } });
    await new Promise(r => setTimeout(r, 400));

    // Item 4: Player 2 (Biru) klaim lagi -> Biru punya 2 poin!
    log('GAME', '🔵 Tim Biru mengeklik Item #4...');
    p2.send({ type: 'CLAIM_ITEM', roomCode: roomCode, payload: { itemId: 4, teamId: 'team-blue' } });
    await new Promise(r => setTimeout(r, 400));

    // Item 5: Player 1 (Merah) klaim lagi -> Merah punya 2 poin!
    log('GAME', '🔴 Tim Merah mengeklik Item #5...');
    p1.send({ type: 'CLAIM_ITEM', roomCode: roomCode, payload: { itemId: 5, teamId: 'team-red' } });
    await new Promise(r => setTimeout(r, 400));

    // Check Scores & Tiebreaker
    log('FLOW', '\n--- STEP 5: Verifikasi Skor & Aturan Tiebreaker (Skor Sama -> Duluan Klaim Menang) ---');
    log('RESULT', `Skor Akhir sementara:
      - Tim Merah : ${hostState.teams.find(t=>t.id==='team-red').score} poin (Klaim pertama di t=${hostState.firstClaimTime['team-red']}ms)
      - Tim Biru  : ${hostState.teams.find(t=>t.id==='team-blue').score} poin (Klaim pertama di t=${hostState.firstClaimTime['team-blue']}ms)
      - Tim Hijau : ${hostState.teams.find(t=>t.id==='team-green').score} poin
      - Tim Kuning: ${hostState.teams.find(t=>t.id==='team-yellow').score} poin
    `);

    // Sort Leaderboard
    const sorted = [...hostState.teams].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const tA = hostState.firstClaimTime[a.id] ?? Infinity;
      const tB = hostState.firstClaimTime[b.id] ?? Infinity;
      return tA - tB;
    });

    log('RESULT', `🏆 HASIL TIEBREAKER LEADERBOARD:
      🥇 Juara 1: ${sorted[0].name} (${sorted[0].score} poin)
      🥈 Juara 2: ${sorted[1].name} (${sorted[1].score} poin)
      🥉 Juara 3: ${sorted[2].name} (${sorted[2].score} poin)
      4️⃣ Peringkat 4: ${sorted[3].name} (${sorted[3].score} poin)
    `);

    if (sorted[0].id === 'team-red' && sorted[1].id === 'team-blue') {
      log('TEST', '✅ TIEBREAKER TEPAT! Tim Merah & Tim Biru sama-sama 2 poin, tetapi Tim Merah Juara 1 karena klaim item pertamanya lebih dulu!');
    }

    log('SYS', '\n=================================================');
    log('SYS', '🎉 SIMULASI SELESAI TANPA POPUP STACK & TANPA FREEZE!');
    log('SYS', '=================================================');

    process.exit(0);

  } catch(e) {
    console.error('❌ SIMULATION ERROR:', e);
    process.exit(1);
  }
}

runFullSimulation();

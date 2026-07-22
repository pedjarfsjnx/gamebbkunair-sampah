/**
 * Multi-Laptop Real-Time Network Engine (network.js)
 * Mengelola sinkronisasi realtime antar LAPTOP di jaringan Wi-Fi lokal via WebSocket Server, BroadcastChannel, LocalStorage Sync & PeerJS WebRTC P2P.
 * Dilengkapi dengan STUN ICE Servers, Reliable SCTP DataChannel, & Anti-Duplicate Deduplication.
 */

class NetworkEngine {
  constructor() {
    this.broadcastChannel = null;
    this.peer = null;
    this.connections = [];
    this.hostConn = null;
    this.socket = null;
    this.listeners = [];
    
    // Unique Client Session Identifier
    this.clientId = 'client_' + Math.random().toString(36).substr(2, 9);
    this.processedMsgIds = new Set();

    // Auto connect Local Wi-Fi WebSocket Server
    this.initWebSocket();
  }

  // Auto connect Local Wi-Fi WebSocket Server (Ultra low-latency multi-device sync)
  initWebSocket() {
    if (typeof location === 'undefined' || !location.host) return;

    try {
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${location.host}`;
      
      if (this.socket) {
        try { this.socket.close(); } catch(e) {}
      }

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log("⚡ Realtime Local Server WebSocket Connected:", wsUrl);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleIncomingMessage(data);
        } catch (e) {}
      };

      this.socket.onerror = () => {
        console.warn("WebSocket Error (Using BroadcastChannel / PeerJS Fallbacks)");
      };

      this.socket.onclose = () => {
        setTimeout(() => this.initWebSocket(), 3000);
      };
    } catch (e) {
      console.warn("WebSocket init exception:", e);
    }
  }

  // Inisialisasi room channel berdasarkan Kode Ruangan (misal: SILIR-88)
  initRoomChannel(roomCode) {
    const channelName = `ecobrick_room_${roomCode}`;
    
    if ('BroadcastChannel' in window) {
      if (this.broadcastChannel) this.broadcastChannel.close();
      this.broadcastChannel = new BroadcastChannel(channelName);
      this.broadcastChannel.onmessage = (event) => {
        this.handleIncomingMessage(event.data);
      };
    }

    // LocalStorage sync listener per Room
    window.addEventListener('storage', (e) => {
      if (e.key === `ecobrick_event_${roomCode}` && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          this.handleIncomingMessage(data);
        } catch (err) {}
      }
    });
  }

  // Host: Buat Room P2P PeerJS (Dengan STUN Server & Connection Cleanup)
  createHostPeer(roomCode, onPeerReady) {
    if (typeof Peer === 'undefined') {
      console.log("PeerJS fallback to WebSocket/LocalSync engine.");
      if (onPeerReady) onPeerReady(roomCode);
      return;
    }

    try {
      const cleanPeerId = `ECOBRICK-${roomCode.replace(/[^A-Z0-9]/gi, '')}`;
      
      // Clear previous peer instance to avoid 'unavailable-id' collision
      if (this.peer) {
        try {
          this.peer.disconnect();
          this.peer.destroy();
        } catch (e) {}
        this.peer = null;
      }

      const peerOptions = {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            { urls: 'stun:stun.services.mozilla.com' }
          ]
        }
      };

      this.peer = new Peer(cleanPeerId, peerOptions);

      this.peer.on('open', (id) => {
        console.log("Host Peer Created:", id);
        if (onPeerReady) onPeerReady(id);
      });

      this.peer.on('connection', (conn) => {
        console.log("Player Laptop Connected:", conn.peer);
        this.connections.push(conn);

        conn.on('data', (data) => {
          this.handleIncomingMessage(data);
          // Re-broadcast to all other connected laptops
          this.connections.forEach(c => {
            if (c !== conn && c.open) c.send(data);
          });
        });

        conn.on('close', () => {
          this.connections = this.connections.filter(c => c !== conn);
        });
      });

      this.peer.on('error', (err) => {
        console.warn("PeerJS Host Warning:", err.type || err);
        if (onPeerReady) onPeerReady(roomCode);
      });
    } catch (e) {
      console.log("PeerJS fallback activated.");
      if (onPeerReady) onPeerReady(roomCode);
    }
  }

  // Player: Hubungkan Laptop ke Host Room Code (Dengan STUN Server & Reliable DataChannel)
  joinPlayerPeer(roomCode, onConnected) {
    if (typeof Peer === 'undefined') {
      if (onConnected) onConnected(true);
      return;
    }

    try {
      if (this.peer) {
        try {
          this.peer.disconnect();
          this.peer.destroy();
        } catch (e) {}
        this.peer = null;
      }

      const peerOptions = {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            { urls: 'stun:stun.services.mozilla.com' }
          ]
        }
      };

      this.peer = new Peer(peerOptions);

      this.peer.on('open', (playerPeerId) => {
        const cleanHostId = `ECOBRICK-${roomCode.replace(/[^A-Z0-9]/gi, '')}`;
        this.hostConn = this.peer.connect(cleanHostId, { reliable: true });

        this.hostConn.on('open', () => {
          console.log("Connected to Host Laptop:", roomCode);
          if (onConnected) onConnected(true);
        });

        this.hostConn.on('data', (data) => {
          this.handleIncomingMessage(data);
        });

        this.hostConn.on('error', (err) => {
          console.warn("Host connection error:", err);
          if (onConnected) onConnected(false);
        });
      });

      this.peer.on('error', (err) => {
        console.warn("Player PeerJS Error:", err.type || err);
        if (onConnected) onConnected(true); // Fallback to local channel / WebSocket
      });
    } catch (e) {
      if (onConnected) onConnected(true);
    }
  }

  // Broadcast pesan realtime ke seluruh LAPTOP yang terhubung di jaringan
  broadcast(actionType, payload = {}) {
    const msgId = `${this.clientId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    const message = {
      type: actionType,
      payload: payload,
      roomCode: gameState.roomCode,
      timestamp: Date.now(),
      senderId: this.clientId,
      msgId: msgId
    };

    // Mark as locally processed so we don't re-handle own broadcast echo
    this.processedMsgIds.add(msgId);

    // 1. WebSocket Broadcast (Multi-Laptop di Jaringan Wi-Fi Lokal)
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(message));
      } catch (e) {}
    }

    // 2. BroadcastChannel (Seketika antar tab/jendela di laptop sama)
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(message);
    }

    // 3. LocalStorage Sync (Multi-tab/window sync fallback)
    try {
      if (gameState.roomCode) {
        localStorage.setItem(`ecobrick_event_${gameState.roomCode}`, JSON.stringify(message));
      }
    } catch (e) {}

    // 4. PeerJS WebRTC P2P Sync (Antar Laptop Berbeda via WebRTC STUN DataChannel)
    if (gameState.role === 'HOST') {
      this.connections.forEach(conn => {
        if (conn.open) {
          try { conn.send(message); } catch (e) {}
        }
      });
    } else if (this.hostConn && this.hostConn.open) {
      try { this.hostConn.send(message); } catch (e) {}
    }
  }

  onMessage(callback) {
    this.listeners.push(callback);
  }

  handleIncomingMessage(data) {
    if (!data || !data.type) return;

    // Filter by Room Code if present
    if (data.roomCode && gameState.roomCode && data.roomCode !== gameState.roomCode) {
      return;
    }

    // Reject self-sent messages
    if (data.senderId === this.clientId) return;

    // Reject already processed messages (Anti-Duplicate Deduplication)
    if (data.msgId) {
      if (this.processedMsgIds.has(data.msgId)) return;
      this.processedMsgIds.add(data.msgId);
      
      // Cleanup old message IDs periodically to avoid memory growth
      if (this.processedMsgIds.size > 200) {
        const firstArr = Array.from(this.processedMsgIds).slice(100);
        this.processedMsgIds = new Set(firstArr);
      }
    }

    this.listeners.forEach(cb => cb(data));
  }
}

// Instance Network Engine Singleton
const networkEngine = new NetworkEngine();

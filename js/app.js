/**
 * Multi-Laptop Game Controller (app.js)
 * Host Proyektor Guru (Spectator Mode) vs Player Controller (Laptop Siswa)
 * Mengontrol alur Pembuatan Room Host, Indikator Real-Time Tim Joined, Spectator Display & Host Controls,
 * Realtime WebRTC/P2P Claim, Host Authority Claim Confirmation, Sync Timer, 1 Laptop = 1 Tim Enforcement, dan Victory Podium.
 *
 * BUGFIXES (5-Player Simulation):
 * - [FIX-1] CLAIM_ITEM dari jaringan sekarang hanya update state+visual, TIDAK tampilkan popup (hanya pengirim & HOST yang tampilkan popup)
 * - [FIX-2] Double-claim guard: cek isClaimed sebelum executeItemClaim di handler jaringan
 * - [FIX-3] renderPlayerJoinModal tidak lagi dipanggil otomatis dari ROOM_STATE setelah player sudah join
 * - [FIX-4] Player join menggunakan teamCount dari Host, bukan hardcode 4
 * - [FIX-5] Anti-popup-stack: cek gameState.phase !== 'PLAYING' sebelum tampilkan popup klaim
 */

class AppController {
  constructor() {
    this.timerInterval = null;
    this.selectedTeamCount = 2;
    this.selectedTimerDuration = 180; // Default 3 Menit
    this.autoResumeTimeout = null;
    this.isWrongClickCooldown = false;
    this._countIntervals = []; // track all active countIntervals to avoid duplicates
    this._hasJoinedRoom = false; // track if player has successfully joined
  }

  init() {
    networkEngine.onMessage((msg) => this.handleNetworkEvent(msg));
    uiManager.renderHotspots(MISTAKES_DATA, (item, e) => this.handleHitspotClick(item, e));

    const gameScene = document.getElementById('game-scene');
    if (gameScene) {
      gameScene.addEventListener('click', (e) => this.handleBackgroundClick(e));
    }

    if (uiManager.btnLens) {
      uiManager.btnLens.onclick = () => this.handleUseLens();
    }

    if (uiManager.btnSound) {
      uiManager.btnSound.onclick = () => {
        const isMuted = soundEngine.toggleMute();
        uiManager.btnSound.innerText = isMuted ? '🔇' : '🔊';
      };
    }

    this.showRoleSelectionModal();
  }

  // Step 1: Role Selection Modal
  showRoleSelectionModal() {
    const roleHTML = `
      <p><strong>Selamat Datang di Multi-Laptop Online Room System!</strong></p>
      <p style="margin-top: 8px;">Pilih peran laptop ini:</p>
      
      <div class="role-selector-box">
        <button id="btn-role-host" class="btn-role-option">
          <span style="font-size: 2.2rem;">🖥️</span>
          <div>
            <div><strong>Buat Ruangan Proyektor (Host Guru)</strong></div>
            <div style="font-size: 0.85rem; opacity: 0.8; font-weight: normal;">Untuk Laptop Guru yang disambung ke Proyektor Kelas (Spectator Display).</div>
          </div>
        </button>

        <button id="btn-role-player" class="btn-role-option">
          <span style="font-size: 2.2rem;">🎮</span>
          <div>
            <div><strong>Masuk Ruangan (Laptop Pemain / Siswa)</strong></div>
            <div style="font-size: 0.85rem; opacity: 0.8; font-weight: normal;">Untuk Laptop Siswa (1 Laptop Mewakili 1 Tim Siswa).</div>
          </div>
        </button>
      </div>
    `;

    uiManager.showModal({
      icon: "💻",
      title: "Pilih Peran Laptop",
      bodyHTML: roleHTML,
      buttonText: "⚡ Mode 1-Layar Proyektor (Uji Coba)",
      onButtonClick: () => {
        gameState.role = 'HOST';
        gameState.setupTeams(2);
        uiManager.updateHeader();
        this.startGame();
      }
    });

    setTimeout(() => {
      const btnHost = document.getElementById('btn-role-host');
      const btnPlayer = document.getElementById('btn-role-player');
      if (btnHost) btnHost.onclick = () => this.setupHostRoom();
      if (btnPlayer) btnPlayer.onclick = () => this.setupPlayerJoin();
    }, 100);
  }

  // Setup Role HOST
  setupHostRoom() {
    gameState.role = 'HOST';
    const roomCode = gameState.generateRoomCode();
    gameState.setupTeams(this.selectedTeamCount);
    gameState.setTimerDuration(this.selectedTimerDuration);
    networkEngine.initRoomChannel(roomCode);
    uiManager.renderRoomCodeBanner(roomCode);

    networkEngine.createHostPeer(roomCode, () => {
      console.log("Host Peer Active:", roomCode);
    });

    this.renderHostLobbyModal(roomCode);
  }

  // Render Host Lobby Modal
  renderHostLobbyModal(roomCode) {
    let teamStatusHTML = '';
    gameState.teams.forEach(team => {
      const isConnected = gameState.teamConnections[team.id];
      teamStatusHTML += `
        <div class="team-status-card" style="border-left: 6px solid ${team.color};">
          <div><span>${team.badge}</span> <strong>${team.name}</strong></div>
          <span class="${isConnected ? 'badge-status-connected' : 'badge-status-waiting'}">
            ${isConnected ? '🟢 Terhubung' : '⏳ Menunggu...'}
          </span>
        </div>
      `;
    });

    const hasPlayers = gameState.hasAnyPlayerJoined();

    const hostHTML = `
      <div style="background: #FFF9C4; padding: 12px; border-radius: 16px; margin-bottom: 12px; border: 3.5px solid var(--ink-dark); box-shadow: 3px 3px 0px var(--ink-dark);">
        <span style="font-size: 0.85rem; font-weight: 700;">KODE RUANGAN:</span>
        <h2 style="color: #C62828; font-size: 2.3rem; margin: 2px 0; letter-spacing: 3px; font-family: var(--font-heading);">${roomCode}</h2>
        <span style="font-size: 0.85rem; color: #444;">Tampilkan kode ini di proyektor agar laptop siswa dapat bergabung!</span>
      </div>

      <div style="display: flex; gap: 14px; flex-wrap: wrap; justify-content: space-between;">
        <div style="flex: 1; min-width: 180px;">
          <p style="font-weight: 700; margin-bottom: 6px;">Pilih Jumlah Tim:</p>
          <div class="lobby-team-selector">
            <button class="btn-team-count ${this.selectedTeamCount === 2 ? 'selected' : ''}" data-count="2">2 Tim</button>
            <button class="btn-team-count ${this.selectedTeamCount === 3 ? 'selected' : ''}" data-count="3">3 Tim</button>
            <button class="btn-team-count ${this.selectedTeamCount === 4 ? 'selected' : ''}" data-count="4">4 Tim</button>
          </div>
        </div>

        <div style="flex: 1; min-width: 180px;">
          <p style="font-weight: 700; margin-bottom: 6px;">Durasi Timer Misi:</p>
          <div class="lobby-team-selector">
            <button class="btn-timer-dur ${this.selectedTimerDuration === 180 ? 'selected' : ''}" data-time="180">⏱️ 3 Menit</button>
            <button class="btn-timer-dur ${this.selectedTimerDuration === 300 ? 'selected' : ''}" data-time="300">⏱️ 5 Menit</button>
            <button class="btn-timer-dur ${this.selectedTimerDuration === 9999 ? 'selected' : ''}" data-time="9999">♾️ Bebas</button>
          </div>
        </div>
      </div>

      <p style="margin-top: 14px; font-weight: 700;">Status Koneksi Laptop Siswa (Real-Time):</p>
      <div class="host-lobby-team-status-grid" id="host-team-status-grid">
        ${teamStatusHTML}
      </div>
    `;

    uiManager.showModal({
      icon: "🖥️",
      title: "Ruangan Host Terbuat (Proyektor Guru)",
      bodyHTML: hostHTML,
      buttonText: hasPlayers ? "🚀 Mulai Pertandingan Real-Time" : "⏳ Menunggu Laptop Siswa Bergabung...",
      onButtonClick: () => {
        if (!hasPlayers) {
          alert("Menunggu setidaknya 1 Laptop Siswa terhubung ke ruangan terlebih dahulu!");
          this.renderHostLobbyModal(roomCode);
          return;
        }

        gameState.setTimerDuration(this.selectedTimerDuration);

        this.startGame();
        networkEngine.broadcast('START_GAME', {
          teamCount: this.selectedTeamCount,
          roomCode: roomCode,
          teams: gameState.teams,
          timeLeft: gameState.maxTimeSeconds
        });
      }
    });

    if (uiManager.modalActionBtn) {
      uiManager.modalActionBtn.disabled = !hasPlayers;
    }

    setTimeout(() => {
      const btnsCount = document.querySelectorAll('.btn-team-count');
      btnsCount.forEach(btn => {
        btn.onclick = (e) => {
          btnsCount.forEach(b => b.classList.remove('selected'));
          e.currentTarget.classList.add('selected');
          this.selectedTeamCount = parseInt(e.currentTarget.getAttribute('data-count')) || 2;
          gameState.setupTeams(this.selectedTeamCount);
          this.broadcastRoomState();
          this.renderHostLobbyModal(roomCode);
        };
      });

      const btnsTime = document.querySelectorAll('.btn-timer-dur');
      btnsTime.forEach(btn => {
        btn.onclick = (e) => {
          btnsTime.forEach(b => b.classList.remove('selected'));
          e.currentTarget.classList.add('selected');
          this.selectedTimerDuration = parseInt(e.currentTarget.getAttribute('data-time')) || 180;
          gameState.setTimerDuration(this.selectedTimerDuration);
          this.broadcastRoomState();
        };
      });
    }, 100);
  }

  broadcastRoomState() {
    networkEngine.broadcast('ROOM_STATE', {
      roomCode: gameState.roomCode,
      teamCount: gameState.activeTeamsCount,
      teams: gameState.teams,
      teamConnections: gameState.teamConnections,
      timeLeft: gameState.maxTimeSeconds
    });
  }

  // Setup Role PLAYER
  setupPlayerJoin() {
    gameState.role = 'PLAYER';
    this._hasJoinedRoom = false;
    this.renderPlayerJoinModal();
  }

  renderPlayerJoinModal() {
    // Only render if player hasn't joined yet (FIX-3: prevent re-rendering after join)
    if (this._hasJoinedRoom) return;

    // ALWAYS show all 4 teams regardless of host team count
    // (team count restriction is Host's concern, not player's selection UI)
    const presets = [
      { id: 'team-red', name: '🔴 Tim Merah', color: '#FFEBEE', textColor: '#C62828' },
      { id: 'team-blue', name: '🔵 Tim Biru', color: '#E3F2FD', textColor: '#1565C0' },
      { id: 'team-green', name: '🟢 Tim Hijau', color: '#E8F5E9', textColor: '#2E7D32' },
      { id: 'team-yellow', name: '🟡 Tim Kuning', color: '#FFFDE7', textColor: '#F57F17' }
    ];

    // Auto-select first available if current choice is taken
    const myCurrentOk = presets.some(t => t.id === gameState.myTeamId && !gameState.teamConnections[t.id]);
    if (!myCurrentOk) {
      const firstFree = presets.find(t => !gameState.teamConnections[t.id]);
      if (firstFree) gameState.myTeamId = firstFree.id;
    }

    let teamSelectHTML = '';
    presets.forEach(t => {
      const isTaken = !!gameState.teamConnections[t.id];
      const isSelected = gameState.myTeamId === t.id && !isTaken;
      teamSelectHTML += `
        <button class="team-select-btn ${isSelected ? 'selected' : ''} ${isTaken ? 'taken-disabled' : ''}"
                data-team="${t.id}"
                ${isTaken ? 'disabled' : ''}
                style="background: ${isTaken ? '#CFD8DC' : t.color}; color: ${isTaken ? '#78909C' : t.textColor}; border: 3px solid var(--ink-dark);">
          ${t.name} ${isTaken ? '<small>(Sudah Diambil)</small>' : ''}
        </button>
      `;
    });

    const playerHTML = `
      <p>Masukkan Kode Ruangan yang tampil di layar Proyektor Host Guru:</p>
      <div class="room-input-container">
        <input type="text" id="input-room-code" class="room-input-field" placeholder="SILIR-XXXX" maxlength="10" value="${gameState.roomCode || ''}">
      </div>
      <p style="margin-top: 10px; font-weight: 700;">Pilih Tim Laptop Ini (1 Laptop Mewakili 1 Tim):</p>
      <div class="team-select-grid" id="team-select-grid">
        ${teamSelectHTML}
      </div>
    `;

    uiManager.showModal({
      icon: "🎮",
      title: "Masuk Ruangan Pemain",
      bodyHTML: playerHTML,
      buttonText: "🔌 Hubungkan Ke Host Proyektor",
      onButtonClick: () => {
        const inputEl = document.getElementById('input-room-code');
        let enteredCode = inputEl ? inputEl.value.trim().toUpperCase() : '';

        if (!enteredCode) {
          alert("Mohon masukkan Kode Ruangan terlebih dahulu!");
          return;
        }

        if (!enteredCode.startsWith('SILIR-')) {
          enteredCode = `SILIR-${enteredCode}`;
        }

        gameState.roomCode = enteredCode;
        // [FIX-4] Don't override team count; use whatever Host set via ROOM_STATE
        networkEngine.initRoomChannel(enteredCode);

        networkEngine.joinPlayerPeer(enteredCode, (success) => {
          console.log("Player Connected Status:", success);
        });

        this._hasJoinedRoom = true; // [FIX-3] Mark as joined so modal won't re-render

        networkEngine.broadcast('PLAYER_JOINED', {
          roomCode: enteredCode,
          teamId: gameState.myTeamId
        });

        this.showPlayerWaitingLobby(enteredCode);
      }
    });

    setTimeout(() => {
      const teamBtns = document.querySelectorAll('.team-select-btn:not(.taken-disabled)');
      teamBtns.forEach(btn => {
        btn.onclick = (e) => {
          teamBtns.forEach(b => b.classList.remove('selected'));
          e.currentTarget.classList.add('selected');
          gameState.myTeamId = e.currentTarget.getAttribute('data-team') || 'team-red';
        };
      });
    }, 100);
  }

  // Player Waiting Lobby
  showPlayerWaitingLobby(roomCode) {
    const myTeam = gameState.activeTeam;
    const waitingHTML = `
      <div style="background: #E8F5E9; padding: 14px; border-radius: 16px; margin: 12px 0; border: 3.5px solid var(--ink-dark); text-align: center; box-shadow: 3px 3px 0px var(--ink-dark);">
        <span style="font-size: 0.85rem; font-weight: 700;">TERHUBUNG KE RUANGAN:</span>
        <h2 style="color: #2E7D32; font-size: 2.1rem; margin: 2px 0; letter-spacing: 2px; font-family: var(--font-heading);">${roomCode}</h2>
        <div style="margin: 10px 0; padding: 8px 14px; background: ${myTeam.color}; color: white; border-radius: 14px; display: inline-block; font-weight: 900; border: 2px solid var(--ink-dark);">
          ${myTeam.badge} Tim Kamu: ${myTeam.name}
        </div>
        <p style="margin-top: 8px; color: #1B5E20; font-weight: 700;">⏳ Menunggu Guru (Host Proyektor) menekan tombol "Mulai Pertandingan"...</p>
        <p id="ping-status-txt" style="font-size: 0.8rem; color: #78909C; margin-top: 4px;">📡 Mengirim sinyal ke Host setiap 3 detik...</p>
      </div>
    `;

    uiManager.showModal({
      icon: "⏳",
      title: "Ruangan Pemain Terhubung",
      bodyHTML: waitingHTML,
      buttonText: "🔄 Ping Ulang ke Host",
      onButtonClick: () => {
        networkEngine.broadcast('PLAYER_JOINED', {
          roomCode: roomCode,
          teamId: gameState.myTeamId
        });
        if (gameState.phase === 'LOBBY') {
          this.showPlayerWaitingLobby(roomCode);
        }
      }
    });

    if (uiManager.modalActionBtn) {
      uiManager.modalActionBtn.disabled = false;
    }

    // Auto-ping Host every 3 seconds until game starts
    // This ensures Host registers Player even if first message was missed
    if (this._pingInterval) clearInterval(this._pingInterval);
    this._pingInterval = setInterval(() => {
      if (gameState.phase !== 'LOBBY') {
        clearInterval(this._pingInterval);
        return;
      }
      networkEngine.broadcast('PLAYER_JOINED', {
        roomCode: roomCode,
        teamId: gameState.myTeamId
      });
      const txt = document.getElementById('ping-status-txt');
      if (txt) txt.textContent = '📡 Sinyal terkirim ke Host... (' + new Date().toLocaleTimeString() + ')';
    }, 3000);
  }

  // Start Playing Phase
  startGame() {
    gameState.phase = 'PLAYING';
    uiManager.hideModal();
    uiManager.updateHeader();
    uiManager.updateTimerDisplay(gameState.timeLeft);
    this.startTimerLoop();
  }

  startTimerLoop() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (gameState.phase !== 'PLAYING') return;

      if (gameState.timeLeft < 9000) {
        gameState.timeLeft--;
      }
      gameState.inactivitySeconds++;

      uiManager.updateTimerDisplay(gameState.timeLeft);

      // Host Authority: Broadcast Timer Sync every 5 seconds
      if (gameState.role === 'HOST' && gameState.timeLeft % 5 === 0) {
        networkEngine.broadcast('SYNC_TIMER', { timeLeft: gameState.timeLeft });
      }

      if (gameState.inactivitySeconds >= gameState.hintIntervalSeconds && gameState.hintsGiven < gameState.maxHints) {
        this.triggerAutoHint();
      }

      if (gameState.timeLeft <= 0) {
        this.handleTimeout();
      }
    }, 1000);
  }

  stopTimerLoop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  triggerAutoHint() {
    const unfound = gameState.getUnclaimedItems(MISTAKES_DATA);
    if (unfound.length === 0) return;
    const targetItem = unfound[Math.floor(Math.random() * unfound.length)];
    gameState.hintsGiven++;
    gameState.inactivitySeconds = 0;
    uiManager.showHintToast(targetItem.hint);
  }

  // Handler click hotspot oleh Pemain
  handleHitspotClick(item, event) {
    if (gameState.phase !== 'PLAYING') return;

    if (gameState.role === 'HOST') {
      uiManager.showHintToast('🖥️ Layar Proyektor Host (Mode Spectator - Siswa menjawab dari Laptop Pemain)');
      return;
    }

    if (this.isWrongClickCooldown) return;
    if (gameState.isClaimed(item.id)) return;

    const claimingTeam = gameState.activeTeam;

    // Broadcast ke semua laptop lain (termasuk HOST)
    networkEngine.broadcast('CLAIM_ITEM', {
      itemId: item.id,
      teamId: claimingTeam.id
    });

    // Execute lokal dengan popup (pengirim = yang klik)
    this.executeItemClaim(item.id, claimingTeam.id, event, true);
  }

  /**
   * Execute Item Claim
   * @param {number} itemId
   * @param {string} teamId
   * @param {Event|null} event - mouse event for visual marker
   * @param {boolean} showPopup - true hanya di pengirim dan HOST
   */
  executeItemClaim(itemId, teamId, event, showPopup = false) {
    const item = MISTAKES_DATA.find(i => i.id === itemId);
    if (!item) return;

    // [FIX-2] Guard double-claim: jika sudah diklaim, jangan proses lagi
    if (gameState.isClaimed(itemId)) return;

    const claimed = gameState.claimItem(itemId, teamId);
    if (!claimed) return; // another race condition guard

    const ownerTeam = gameState.getOwner(itemId) || gameState.teams[0];

    // Audio & Visual feedback
    soundEngine.playCorrect();

    if (event) {
      const rect = uiManager.viewport.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      uiManager.showCorrectPulseMarker(x, y);
    }

    // Update visual layer (semua laptop)
    uiManager.updateHeader();
    uiManager.renderHotspots(MISTAKES_DATA, (i, e) => this.handleHitspotClick(i, e));

    if (gameState.role === 'HOST') {
      gameState.nextTurn();
      uiManager.updateHeader();

      // HOST: Re-broadcast state final ke semua 4 player (authority confirmation)
      networkEngine.broadcast('CONFIRM_CLAIM_ITEM', {
        itemId: itemId,
        teamId: teamId,
        teams: gameState.teams,
        itemOwnership: gameState.itemOwnership
      });
    }

    // [FIX-5] Hanya tampilkan popup di: (a) laptop yang klik, (b) HOST spectator
    // Laptop player lain hanya update visual/skor tanpa popup
    if (!showPopup) return;

    // [FIX-5] Anti popup-stack: jangan tampilkan kalau sudah PAUSED
    if (gameState.phase === 'PAUSED') return;

    gameState.phase = 'PAUSED';

    // Clear all existing countdown intervals
    this._countIntervals.forEach(id => clearInterval(id));
    this._countIntervals = [];

    if (this.autoResumeTimeout) clearTimeout(this.autoResumeTimeout);

    let countdownSecs = 4;
    const getBtnText = (s) => `➡ Lanjut Rebutan Item (${s}s)`;

    uiManager.showModal({
      icon: item.icon,
      title: `${ownerTeam.badge} ${ownerTeam.name} Berhasil Mengklaim!`,
      imageSrc: item.imageSrc,
      bodyHTML: `
        <div style="background: ${ownerTeam.color}; color: white; padding: 6px 14px; border-radius: 12px; font-weight: 700; display: inline-block; margin-bottom: 12px; border: 2px solid var(--ink-dark); box-shadow: 2px 2px 0px var(--ink-dark);">
          +1 Poin Bintang untuk ${ownerTeam.name}!
        </div>
        <h4 style="color: #2E7D32; margin-bottom: 8px;">${item.title}</h4>
        <p>${item.description}</p>
      `,
      buttonText: getBtnText(countdownSecs),
      onButtonClick: () => {
        this._countIntervals.forEach(id => clearInterval(id));
        this._countIntervals = [];
        this.resumePlayPhase();
      }
    });

    const countId = setInterval(() => {
      countdownSecs--;
      if (uiManager.modalActionBtn && gameState.phase === 'PAUSED') {
        uiManager.modalActionBtn.innerText = getBtnText(Math.max(0, countdownSecs));
      }
      if (countdownSecs <= 0) {
        clearInterval(countId);
        this._countIntervals = this._countIntervals.filter(id => id !== countId);
        this.resumePlayPhase();
      }
    }, 1000);
    this._countIntervals.push(countId);
  }

  resumePlayPhase() {
    uiManager.hideModal();
    if (gameState.isComplete) {
      this.handleVictory();
    } else {
      gameState.phase = 'PLAYING';
    }
  }

  // Handler klik background salah
  handleBackgroundClick(event) {
    if (gameState.phase !== 'PLAYING') return;
    if (gameState.role === 'HOST') return;
    if (this.isWrongClickCooldown) return;

    this.isWrongClickCooldown = true;

    const rect = uiManager.viewport.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    soundEngine.playWrong();
    uiManager.showWrongTag(x, y);

    setTimeout(() => {
      this.isWrongClickCooldown = false;
    }, 1500);
  }

  handleUseLens() {
    if (gameState.phase !== 'PLAYING') return;
    if (gameState.role === 'HOST') {
      uiManager.showHintToast('🖥️ Layar Proyektor Host (Lensa dipicu oleh Laptop Pemain)');
      return;
    }
    if (gameState.useLens()) {
      uiManager.triggerLensGlow(MISTAKES_DATA);
      networkEngine.broadcast('USE_LENS', {});
    }
  }

  // Realtime Network Event Handler
  handleNetworkEvent(data) {
    switch (data.type) {

      case 'PLAYER_JOINED':
        if (gameState.role === 'HOST') {
          gameState.markTeamConnected(data.payload.teamId || 'team-red', true);

          if (gameState.phase === 'LOBBY') {
            this.renderHostLobbyModal(gameState.roomCode);
          }

          // Broadcast full room state back to all connected players
          networkEngine.broadcast('ROOM_STATE', {
            roomCode: gameState.roomCode,
            phase: gameState.phase,
            teamCount: gameState.activeTeamsCount,
            teams: gameState.teams,
            teamConnections: gameState.teamConnections,
            itemOwnership: gameState.itemOwnership,
            timeLeft: gameState.timeLeft,
            lensUsed: gameState.lensUsed
          });

          // If already in game, give late-joiner the START_GAME event
          if (gameState.phase === 'PLAYING') {
            networkEngine.broadcast('START_GAME', {
              teamCount: gameState.activeTeamsCount,
              roomCode: gameState.roomCode,
              teams: gameState.teams,
              itemOwnership: gameState.itemOwnership,
              timeLeft: gameState.timeLeft
            });
          }
        }
        break;

      case 'ROOM_STATE':
        if (gameState.role === 'PLAYER') {
          // [FIX-4] Sync team count from Host
          const hostTeamCount = data.payload.teamCount || 2;
          gameState.setupTeams(hostTeamCount);

          if (data.payload.teamConnections) {
            gameState.teamConnections = { ...data.payload.teamConnections };
          }
          if (data.payload.teams) {
            data.payload.teams.forEach(t => {
              const localT = gameState.teams.find(lt => lt.id === t.id);
              if (localT) localT.score = t.score;
            });
          }
          if (data.payload.itemOwnership) {
            gameState.itemOwnership = { ...data.payload.itemOwnership };
          }
          if (data.payload.lensUsed) {
            gameState.lensUsed = true;
          }
          if (data.payload.timeLeft) {
            gameState.timeLeft = data.payload.timeLeft;
          }

          uiManager.updateHeader();
          uiManager.renderHotspots(MISTAKES_DATA, (item, e) => this.handleHitspotClick(item, e));

          // [FIX-3] Only re-render player join modal if NOT yet joined
          if (gameState.phase === 'LOBBY' && !this._hasJoinedRoom) {
            this.renderPlayerJoinModal();
          }

          if (data.payload.phase === 'PLAYING' && gameState.phase !== 'PLAYING') {
            this.startGame();
          }
        }
        break;

      case 'START_GAME':
        // [FIX-4] Sync team count from Host START_GAME payload
        gameState.setupTeams(data.payload.teamCount || 2);
        if (data.payload.teams) {
          data.payload.teams.forEach(t => {
            const localT = gameState.teams.find(lt => lt.id === t.id);
            if (localT) localT.score = t.score;
          });
        }
        if (data.payload.itemOwnership) {
          gameState.itemOwnership = { ...data.payload.itemOwnership };
        }
        if (data.payload.timeLeft) gameState.timeLeft = data.payload.timeLeft;
        uiManager.updateHeader();
        uiManager.renderHotspots(MISTAKES_DATA, (item, e) => this.handleHitspotClick(item, e));
        this.startGame();
        break;

      case 'SYNC_TIMER':
        if (gameState.role === 'PLAYER' && data.payload.timeLeft !== undefined) {
          gameState.timeLeft = data.payload.timeLeft;
          uiManager.updateTimerDisplay(gameState.timeLeft);
        }
        break;

      case 'CLAIM_ITEM': {
        const { itemId: cItemId, teamId: cTeamId } = data.payload;

        // [FIX-2] Guard: skip if already claimed (race condition between tabs)
        if (gameState.isClaimed(cItemId)) break;

        // HOST projector screen: show popup as spectator display
        // Other player laptops: update visual/score silently without popup
        const amHost = gameState.role === 'HOST';
        this.executeItemClaim(cItemId, cTeamId, null, amHost);
        break;
      }

      case 'CONFIRM_CLAIM_ITEM':
        // [FIX-1] Host authority state correction broadcast to all 4 players
        if (gameState.role === 'PLAYER') {
          if (data.payload.itemOwnership) {
            gameState.itemOwnership = { ...data.payload.itemOwnership };
          }
          if (data.payload.teams) {
            data.payload.teams.forEach(t => {
              const localT = gameState.teams.find(lt => lt.id === t.id);
              if (localT) localT.score = t.score;
            });
          }
          uiManager.updateHeader();
          uiManager.renderHotspots(MISTAKES_DATA, (item, e) => this.handleHitspotClick(item, e));
        }
        break;

      case 'USE_LENS':
        gameState.useLens();
        uiManager.triggerLensGlow(MISTAKES_DATA);
        break;

      case 'RESET_GAME':
        this._countIntervals.forEach(id => clearInterval(id));
        this._countIntervals = [];
        gameState.resetRound();
        uiManager.renderHotspots(MISTAKES_DATA, (item, e) => this.handleHitspotClick(item, e));
        this.startGame();
        break;
    }
  }

  handleVictory() {
    gameState.phase = 'FINISHED';
    this.stopTimerLoop();
    this._countIntervals.forEach(id => clearInterval(id));
    this._countIntervals = [];

    uiManager.startConfetti();
    soundEngine.playWin();

    const leaderboard = gameState.getLeaderboard();

    setTimeout(() => {
      uiManager.showVictoryPodium(leaderboard, () => {
        networkEngine.broadcast('RESET_GAME', { roomCode: gameState.roomCode });
        gameState.resetRound();
        uiManager.renderHotspots(MISTAKES_DATA, (item, e) => this.handleHitspotClick(item, e));
        this.startGame();
      });
    }, 600);
  }

  handleTimeout() {
    gameState.phase = 'TIMEOUT';
    this.stopTimerLoop();
    this._countIntervals.forEach(id => clearInterval(id));
    this._countIntervals = [];

    const leaderboard = gameState.getLeaderboard();

    uiManager.showVictoryPodium(leaderboard, () => {
      networkEngine.broadcast('RESET_GAME', { roomCode: gameState.roomCode });
      gameState.resetRound();
      uiManager.renderHotspots(MISTAKES_DATA, (item, e) => this.handleHitspotClick(item, e));
      this.startGame();
    });
  }
}

// Inisialisasi App Controller saat DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
});

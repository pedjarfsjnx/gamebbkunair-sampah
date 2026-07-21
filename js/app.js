/**
 * Multi-Laptop Game Controller (app.js)
 * Host Proyektor Guru (Spectator Mode) vs Player Controller (Laptop Siswa)
 * Mengontrol alur Pembuatan Room Host, Indikator Real-Time Tim Joined, Spectator Display & Host Controls,
 * Realtime WebRTC/P2P Claim, Sync Timer, 1 Laptop = 1 Tim Enforcement, dan Victory Podium.
 */

class AppController {
  constructor() {
    this.timerInterval = null;
    this.selectedTeamCount = 2;
    this.selectedTimerDuration = 180; // Default 3 Menit
    this.autoResumeTimeout = null;
    this.isWrongClickCooldown = false;
  }

  init() {
    // Connect to Network Sync Engine & listen to incoming realtime messages across laptops
    networkEngine.onMessage((msg) => this.handleNetworkEvent(msg));

    // Render hotspot di scene dengan aset gambar HD
    uiManager.renderHotspots(MISTAKES_DATA, (item, e) => this.handleHitspotClick(item, e));

    // Bind event background miss click (salah)
    const gameScene = document.getElementById('game-scene');
    if (gameScene) {
      gameScene.addEventListener('click', (e) => this.handleBackgroundClick(e));
    }

    // Bind Detective Lens Button
    if (uiManager.btnLens) {
      uiManager.btnLens.onclick = () => this.handleUseLens();
    }

    // Bind Sound Control Toggle
    if (uiManager.btnSound) {
      uiManager.btnSound.onclick = () => {
        const isMuted = soundEngine.toggleMute();
        uiManager.btnSound.innerText = isMuted ? '🔇' : '🔊';
      };
    }

    // Show Multi-Laptop Role Selection Modal (Host vs Player)
    this.showRoleSelectionModal();
  }

  // Step 1: Role Selection Modal (Host Proyektor Guru vs Laptop Pemain Siswa)
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

  // Setup Role HOST (Laptop Proyektor Guru - SPECTATOR MODE)
  setupHostRoom() {
    gameState.role = 'HOST';
    const roomCode = gameState.generateRoomCode();
    gameState.setupTeams(this.selectedTeamCount);
    gameState.setTimerDuration(this.selectedTimerDuration);
    networkEngine.initRoomChannel(roomCode);

    uiManager.renderRoomCodeBanner(roomCode);

    // Create PeerJS Host Room
    networkEngine.createHostPeer(roomCode, () => {
      console.log("Host Peer Active:", roomCode);
    });

    this.renderHostLobbyModal(roomCode);
  }

  // Render Host Lobby Modal dengan Indikator Tim Joined & Timer Selector Real-Time
  renderHostLobbyModal(roomCode) {
    let teamStatusHTML = '';
    gameState.teams.forEach(team => {
      const isConnected = gameState.teamConnections[team.id];
      teamStatusHTML += `
        <div class="team-status-card" style="border-left: 6px solid ${team.color};">
          <div>
            <span>${team.badge}</span> <strong>${team.name}</strong>
          </div>
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
        <div style="flex: 1; min-width: 200px;">
          <p style="font-weight: 700; margin-bottom: 6px;">Pilih Jumlah Tim:</p>
          <div class="lobby-team-selector">
            <button class="btn-team-count ${this.selectedTeamCount === 2 ? 'selected' : ''}" data-count="2">2 Tim</button>
            <button class="btn-team-count ${this.selectedTeamCount === 3 ? 'selected' : ''}" data-count="3">3 Tim</button>
            <button class="btn-team-count ${this.selectedTeamCount === 4 ? 'selected' : ''}" data-count="4">4 Tim</button>
          </div>
        </div>

        <div style="flex: 1; min-width: 200px;">
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

    // Bind Controls
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

  // Setup Role PLAYER (Laptop Siswa - PLAYER CONTROLLER MODE)
  setupPlayerJoin() {
    gameState.role = 'PLAYER';

    // 1 Laptop = 1 Tim Enforcement
    let teamSelectHTML = '';
    const presets = [
      { id: 'team-red', name: '🔴 Tim Merah', color: '#FFEBEE', textColor: '#C62828' },
      { id: 'team-blue', name: '🔵 Tim Biru', color: '#E3F2FD', textColor: '#1565C0' },
      { id: 'team-green', name: '🟢 Tim Hijau', color: '#E8F5E9', textColor: '#2E7D32' },
      { id: 'team-yellow', name: '🟡 Tim Kuning', color: '#FFFDE7', textColor: '#F57F17' }
    ];

    presets.forEach((t, idx) => {
      const isTaken = gameState.teamConnections[t.id];
      const isSelected = (gameState.myTeamId === t.id && !isTaken) || (idx === 0 && !isTaken);
      teamSelectHTML += `
        <button class="team-select-btn ${isSelected ? 'selected' : ''} ${isTaken ? 'taken-disabled' : ''}" 
                data-team="${t.id}" 
                ${isTaken ? 'disabled' : ''} 
                style="background: ${isTaken ? '#CFD8DC' : t.color}; color: ${isTaken ? '#78909C' : t.textColor};">
          ${t.name} ${isTaken ? '(Sudah Diambil)' : ''}
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
          this.setupPlayerJoin();
          return;
        }

        // Auto normalize room code (e.g. "BW6K" -> "SILIR-BW6K")
        if (!enteredCode.startsWith('SILIR-')) {
          enteredCode = `SILIR-${enteredCode}`;
        }

        gameState.roomCode = enteredCode;
        gameState.setupTeams(4);
        networkEngine.initRoomChannel(enteredCode);

        // Connect PeerJS Player to Host
        networkEngine.joinPlayerPeer(enteredCode, (success) => {
          console.log("Player Connected Status:", success);
        });

        // Notify Host that player joined with chosen team
        networkEngine.broadcast('PLAYER_JOINED', { 
          roomCode: enteredCode, 
          teamId: gameState.myTeamId 
        });

        // Show Waiting Lobby Screen for Player until Host launches game
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

  // Display Waiting Lobby Modal for Player until Host launches game
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
      </div>
    `;

    uiManager.showModal({
      icon: "⏳",
      title: "Ruangan Pemain Terhubung",
      bodyHTML: waitingHTML,
      buttonText: "🔄 Cek Status Ruangan",
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
  }

  // Start Playing Phase
  startGame() {
    gameState.phase = 'PLAYING';
    uiManager.hideModal();
    uiManager.updateHeader();
    uiManager.updateTimerDisplay(gameState.timeLeft);
    this.startTimerLoop();
  }

  // Timer Tick Interval (1s)
  startTimerLoop() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (gameState.phase !== 'PLAYING') return;

      if (gameState.timeLeft < 9000) {
        gameState.timeLeft--;
      }
      gameState.inactivitySeconds++;

      uiManager.updateTimerDisplay(gameState.timeLeft);

      // Host Authority: Broadcast Timer Sync every 5 seconds to keep all laptops locked in sync
      if (gameState.role === 'HOST' && gameState.timeLeft % 5 === 0) {
        networkEngine.broadcast('SYNC_TIMER', { timeLeft: gameState.timeLeft });
      }

      // System Auto-Hint setiap 25 detik inaktivitas
      if (gameState.inactivitySeconds >= gameState.hintIntervalSeconds && gameState.hintsGiven < gameState.maxHints) {
        this.triggerAutoHint();
      }

      // Time Out Check (180 Detik Habis)
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

  // Trigger Hint Otomatis
  triggerAutoHint() {
    const unfound = gameState.getUnclaimedItems(MISTAKES_DATA);
    if (unfound.length === 0) return;

    const targetItem = unfound[Math.floor(Math.random() * unfound.length)];
    gameState.hintsGiven++;
    gameState.inactivitySeconds = 0;

    uiManager.showHintToast(targetItem.hint);
  }

  // Handler Realtime Click pada Hotspot Kesalahan
  handleHitspotClick(item, event) {
    if (gameState.phase !== 'PLAYING') return;

    // SPECTATOR MODE GUARD: Host Proyektor CANNOT click or answer items!
    if (gameState.role === 'HOST') {
      uiManager.showHintToast('🖥️ Layar Proyektor Host (Mode Spectator - Siswa menjawab dari Laptop Pemain)');
      return;
    }

    // Jika sedang cooldown klik salah, abaikan
    if (this.isWrongClickCooldown) return;

    // Jika sudah diklaim tim lain, abaikan
    if (gameState.isClaimed(item.id)) return;

    const claimingTeam = gameState.activeTeam;

    // Broadcast Realtime Claim across all connected laptops
    networkEngine.broadcast('CLAIM_ITEM', {
      itemId: item.id,
      teamId: claimingTeam.id
    });

    // Execute Local Claim
    this.executeItemClaim(item.id, claimingTeam.id, event);
  }

  // Execute Item Claim Logic across Host & Player Laptops
  executeItemClaim(itemId, teamId, event) {
    const item = MISTAKES_DATA.find(i => i.id === itemId);
    if (!item) return;

    const claimed = gameState.claimItem(itemId, teamId);
    if (!claimed && gameState.isClaimed(itemId)) return;

    const ownerTeam = gameState.getOwner(itemId) || gameState.teams[0];

    // Audio SFX Correct Ding!
    soundEngine.playCorrect();

    // Visual Marker Ring
    if (event) {
      const rect = uiManager.viewport.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      uiManager.showCorrectPulseMarker(x, y);
    }

    // Update Header Scorecards & Hotspots Layer across laptops
    uiManager.updateHeader();
    uiManager.renderHotspots(MISTAKES_DATA, (i, e) => this.handleHitspotClick(i, e));

    if (gameState.role === 'HOST') {
      gameState.nextTurn();
      uiManager.updateHeader();
    }

    gameState.phase = 'PAUSED';

    // Clear previous auto-resume timer if active
    if (this.autoResumeTimeout) clearTimeout(this.autoResumeTimeout);

    // Auto-Resume Timer Counter (4 Seconds auto resume to prevent blocking multiplayer flow)
    let countdownSecs = 4;
    const getBtnText = (s) => `➡ Lanjut Rebutan Item (${s}s)`;

    // Show Educational Popup with Team Claim Banner & Image Preview
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
        if (this.autoResumeTimeout) clearTimeout(this.autoResumeTimeout);
        this.resumePlayPhase();
      }
    });

    // Auto countdown interval for modal auto-resume
    const countInterval = setInterval(() => {
      countdownSecs--;
      if (uiManager.modalActionBtn && gameState.phase === 'PAUSED') {
        uiManager.modalActionBtn.innerText = getBtnText(Math.max(0, countdownSecs));
      }
      if (countdownSecs <= 0) {
        clearInterval(countInterval);
        this.resumePlayPhase();
      }
    }, 1000);
  }

  resumePlayPhase() {
    uiManager.hideModal();
    if (gameState.isComplete) {
      this.handleVictory();
    } else {
      gameState.phase = 'PLAYING';
    }
  }

  // Handler Klik Salah pada Background (dengan 1.5 detik Anti-Spam Cooldown Penalty)
  handleBackgroundClick(event) {
    if (gameState.phase !== 'PLAYING') return;

    // SPECTATOR MODE GUARD for Host Proyektor
    if (gameState.role === 'HOST') return;

    // Anti-Spam Click Lock (1.5s Cooldown)
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

  // Handler Lensa Detektif
  handleUseLens() {
    if (gameState.phase !== 'PLAYING') return;

    // SPECTATOR MODE GUARD for Host Proyektor
    if (gameState.role === 'HOST') {
      uiManager.showHintToast('🖥️ Layar Proyektor Host (Lensa dipicu oleh Laptop Pemain)');
      return;
    }

    if (gameState.useLens()) {
      uiManager.triggerLensGlow(MISTAKES_DATA);
      networkEngine.broadcast('USE_LENS', {});
    }
  }

  // Listen to Incoming Realtime Network Sync Messages across Laptops
  handleNetworkEvent(data) {
    switch (data.type) {
      case 'PLAYER_JOINED':
        if (gameState.role === 'HOST') {
          if (data.payload.teamId) {
            gameState.markTeamConnected(data.payload.teamId, true);
          } else {
            gameState.markTeamConnected('team-red', true);
          }

          // Update Host Lobby live UI indicators
          if (gameState.phase === 'LOBBY') {
            this.renderHostLobbyModal(gameState.roomCode);
          }

          // Broadcast updated room state to all players
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

          // If game is already playing, send START_GAME to force late-join player into game phase!
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
          gameState.setupTeams(data.payload.teamCount || 2);
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

          // Refresh Player Join UI if still in player selection modal
          if (gameState.phase === 'LOBBY') {
            const teamBtns = document.querySelectorAll('.team-select-btn');
            teamBtns.forEach(btn => {
              const tid = btn.getAttribute('data-team');
              if (gameState.teamConnections[tid] && gameState.myTeamId !== tid) {
                btn.classList.add('taken-disabled');
                btn.disabled = true;
              }
            });
          }

          // If host is already PLAYING, transition late-joining player into game!
          if (data.payload.phase === 'PLAYING' && gameState.phase !== 'PLAYING') {
            this.startGame();
          }
        }
        break;

      case 'START_GAME':
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

      case 'CLAIM_ITEM':
        this.executeItemClaim(data.payload.itemId, data.payload.teamId, null);
        break;

      case 'USE_LENS':
        gameState.useLens();
        uiManager.triggerLensGlow(MISTAKES_DATA);
        break;

      case 'RESET_GAME':
        gameState.resetRound();
        uiManager.renderHotspots(MISTAKES_DATA, (item, e) => this.handleHitspotClick(item, e));
        this.startGame();
        break;
    }
  }

  // Victory Handler (All 10 Items Claimed) -> Victory Podium Screen
  handleVictory() {
    gameState.phase = 'FINISHED';
    this.stopTimerLoop();

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

  // Timeout Handler (180s Expired)
  handleTimeout() {
    gameState.phase = 'TIMEOUT';
    this.stopTimerLoop();

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

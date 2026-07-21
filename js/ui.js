/**
 * UI Renderer & DOM Controller (Direct User ICONs & Fallback Resilience Engine)
 * Mengatur tampilan visual, render hotspot HD item, scorecards tim realtime, Kode Ruangan, modal preview, dan victory podium.
 */

class UIManager {
  constructor() {
    this.viewport = document.getElementById('game-viewport');
    this.sceneContainer = document.getElementById('hotspot-layer');
    this.teamScorecardsContainer = document.getElementById('team-scorecards-container');
    this.teamSelectorPills = document.getElementById('team-selector-pills');
    this.timerBox = document.getElementById('timer-box');
    this.timerText = document.getElementById('timer-text');
    this.progressBar = document.getElementById('progress-bar-fill');
    this.btnLens = document.getElementById('btn-lens');
    this.btnSound = document.getElementById('btn-sound');

    // Room Code Banner
    this.roomCodeBanner = document.getElementById('room-code-banner');
    this.roomCodeText = document.getElementById('room-code-text');
    
    // Modal Elements
    this.modalOverlay = document.getElementById('modal-overlay');
    this.modalIcon = document.getElementById('modal-icon');
    this.modalTitle = document.getElementById('modal-title');
    this.modalBody = document.getElementById('modal-body');
    this.modalActionBtn = document.getElementById('modal-action-btn');

    // Confetti Engine
    this.confettiCanvas = document.getElementById('confetti-canvas');
    this.ctx = this.confettiCanvas ? this.confettiCanvas.getContext('2d') : null;
    this.confettiParticles = [];
    this.isConfettiRunning = false;
  }

  // Render Kode Ruangan Banner di Header Host Laptop
  renderRoomCodeBanner(roomCode) {
    if (this.roomCodeBanner && this.roomCodeText) {
      this.roomCodeText.innerText = roomCode;
      this.roomCodeBanner.style.display = 'flex';
    }
  }

  // Render 5 Static Good Ecobrick Decorative Bottles on Rack Shelf using User's assets/ICON/ecobrick.png.png
  renderShelfDecorativeBottles() {
    const decorativePositions = [
      { left: 75.8, top: 55.5, width: 5.5, height: 8.5 }, // Top shelf slot 1
      { left: 88.7, top: 55.5, width: 5.5, height: 8.5 }, // Top shelf slot 4
      { left: 75.8, top: 64.5, width: 5.5, height: 8.5 }, // Bottom shelf slot 1
      { left: 83.5, top: 64.5, width: 5.5, height: 8.5 }, // Bottom shelf slot 3
      { left: 88.7, top: 64.5, width: 5.5, height: 8.5 }  // Bottom shelf slot 4
    ];

    decorativePositions.forEach(pos => {
      const bottleEl = document.createElement('div');
      bottleEl.className = 'shelf-static-bottle';
      bottleEl.style.left = `${pos.left}%`;
      bottleEl.style.top = `${pos.top}%`;
      bottleEl.style.width = `${pos.width}%`;
      bottleEl.style.height = `${pos.height}%`;

      const img = document.createElement('img');
      img.src = 'assets/ICON/ecobrick.png.png';
      img.alt = 'Ecobrick Sempurna SD Siliragung';

      img.onerror = () => {
        if (img.src.endsWith('.png.png')) {
          img.src = 'assets/ICON/ecobrick.png';
        } else if (img.src.includes('assets/ICON/')) {
          img.src = 'assets/images/items/ecobrick.png';
        }
      };

      bottleEl.appendChild(img);
      this.sceneContainer.appendChild(bottleEl);
    });
  }

  // Render 10 Hitbox Hotspot Kesalahan ke Layar dengan Aset Gambar Ikon Pengguna (Resilient Multi-path Loader)
  renderHotspots(mistakesData, onHitspotClick) {
    this.sceneContainer.innerHTML = '';
    
    // Render Static Good Ecobrick Decorative Bottles on Rack Shelf using User's ecobrick.png
    this.renderShelfDecorativeBottles();

    mistakesData.forEach(item => {
      const el = document.createElement('div');
      el.className = 'hotspot-item';
      el.id = `hotspot-${item.id}`;
      el.style.left = `${item.bounds.left}%`;
      el.style.top = `${item.bounds.top}%`;
      el.style.width = `${item.bounds.width}%`;
      el.style.height = `${item.bounds.height}%`;
      el.setAttribute('title', item.name);

      // Render User Icon Graphic with Automatic Fallback Handling
      if (item.imageSrc) {
        const img = document.createElement('img');
        img.src = item.imageSrc;
        img.alt = item.name;
        img.className = 'hotspot-item-img';

        // Auto fallback if primary path fails
        img.onerror = () => {
          if (img.src.includes('assets/ICON/')) {
            img.src = item.fallbackSrc || `assets/images/items/${item.imageSrc.split('/').pop()}`;
          } else if (img.src.endsWith('.png.png')) {
            img.src = img.src.replace('.png.png', '.png');
          } else if (img.src.endsWith('.png')) {
            img.src = img.src.replace('.png', '.svg');
          }
        };

        el.appendChild(img);
      }

      // Check Realtime Item Claim Ownership
      const ownerTeam = gameState.getOwner(item.id);
      if (ownerTeam) {
        el.classList.add('claimed');
        el.style.setProperty('--claim-color', ownerTeam.color);

        // Render Claimed Flag Badge
        const flag = document.createElement('div');
        flag.className = 'claimed-team-flag';
        flag.style.setProperty('--claim-color', ownerTeam.color);
        flag.innerHTML = `${ownerTeam.badge} ${ownerTeam.name}`;
        el.appendChild(flag);
      }

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onHitspotClick(item, e);
      });

      this.sceneContainer.appendChild(el);
    });
  }

  // Update Header Multi-Player Scorecards
  updateHeader() {
    if (this.teamScorecardsContainer) {
      this.teamScorecardsContainer.innerHTML = '';

      if (gameState.role === 'HOST') {
        const tag = document.createElement('div');
        tag.className = 'spectator-header-tag';
        tag.innerHTML = '🖥️ LAYAR PROYEKTOR GURU (SPECTATOR)';
        this.teamScorecardsContainer.appendChild(tag);
      }

      gameState.teams.forEach((team, idx) => {
        const isMyTeam = (gameState.role === 'PLAYER' && team.id === gameState.myTeamId);
        const card = document.createElement('div');
        card.className = `team-score-card ${isMyTeam ? 'active-turn' : ''}`;
        card.style.border = `3px solid ${team.color}`;
        card.innerHTML = `
          <span class="team-badge-icon">${team.badge}</span>
          <span class="team-name-text" style="color: ${team.color};">${team.name} ${isMyTeam ? '<small style="font-size: 0.75rem;">(Kamu)</small>' : ''}</span>
          <span class="team-score-val" style="background: ${team.color};">⭐ ${team.score}</span>
        `;
        this.teamScorecardsContainer.appendChild(card);
      });
    }

    // Update Bottom Team Selector Pills
    if (this.teamSelectorPills) {
      this.teamSelectorPills.innerHTML = '';

      if (gameState.role === 'PLAYER') {
        // Player Laptop: Display locked team indicator badge
        const myTeam = gameState.activeTeam;
        const badgeEl = document.createElement('div');
        badgeEl.className = 'team-pill-btn active';
        badgeEl.style.cursor = 'default';
        badgeEl.style.background = myTeam.color;
        badgeEl.style.color = '#FFFFFF';
        badgeEl.style.border = '2.5px solid var(--ink-dark)';
        badgeEl.innerHTML = `<span>${myTeam.badge}</span> <span>Tim Kamu: ${myTeam.name}</span>`;
        this.teamSelectorPills.appendChild(badgeEl);
      } else {
        // Host Laptop / 1-Screen Mode: Interactive team selector pills
        gameState.teams.forEach((team, idx) => {
          const pill = document.createElement('button');
          pill.className = `team-pill-btn ${idx === gameState.currentTeamIndex ? 'active' : ''}`;
          pill.innerHTML = `<span>${team.badge}</span> <span>${team.name}</span>`;
          pill.onclick = (e) => {
            e.stopPropagation();
            gameState.currentTeamIndex = idx;
            this.updateHeader();
          };
          this.teamSelectorPills.appendChild(pill);
        });
      }
    }

    // Update Progress Bar
    if (this.progressBar) {
      const percentage = (gameState.totalClaimed / gameState.totalMistakes) * 100;
      this.progressBar.style.width = `${percentage}%`;
    }
  }

  // Format & Update Display Timer (MM:SS)
  updateTimerDisplay(secondsLeft) {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    
    if (this.timerText) {
      this.timerText.innerText = formatted;
    }

    if (this.timerBox) {
      this.timerBox.classList.remove('warning', 'danger');
      if (secondsLeft <= 30) {
        this.timerBox.classList.add('danger');
      } else if (secondsLeft <= 60) {
        this.timerBox.classList.add('warning');
      }
    }
  }

  // Tampilkan Marker Lingkaran Merah Pulsing saat Benar
  showCorrectPulseMarker(x, y) {
    const marker = document.createElement('div');
    marker.className = 'correct-pulse-marker';
    marker.style.left = `${x}px`;
    marker.style.top = `${y}px`;
    this.viewport.appendChild(marker);

    setTimeout(() => {
      if (marker.parentNode) marker.parentNode.removeChild(marker);
    }, 900);
  }

  // Tampilkan Tag ❌ "Coba lagi!" saat Salah Klik
  showWrongTag(x, y) {
    const tag = document.createElement('div');
    tag.className = 'wrong-feedback-tag';
    tag.innerText = '❌ Coba lagi!';
    tag.style.left = `${x}px`;
    tag.style.top = `${y}px`;
    this.viewport.appendChild(tag);

    setTimeout(() => {
      if (tag.parentNode) tag.parentNode.removeChild(tag);
    }, 850);
  }

  // Tampilkan Toast Hint di Kiri Bawah
  showHintToast(text) {
    const oldToast = document.querySelector('.hint-toast');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'hint-toast';
    toast.innerText = text;
    this.viewport.appendChild(toast);

    soundEngine.playHint();

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
      }
    }, 5000);
  }

  // Sorot Seluruh Kesalahan yang Belum Ditemukan dengan Lensa Detektif
  triggerLensGlow(allMistakes) {
    const unfound = gameState.getUnclaimedItems(allMistakes);
    unfound.forEach(item => {
      const el = document.getElementById(`hotspot-${item.id}`);
      if (el) el.classList.add('lens-highlight');
    });

    if (this.btnLens) {
      this.btnLens.disabled = true;
      this.btnLens.innerHTML = '<span>🔍</span> <span>Sudah digunakan</span>';
    }

    soundEngine.playLens();

    setTimeout(() => {
      unfound.forEach(item => {
        const el = document.getElementById(`hotspot-${item.id}`);
        if (el) el.classList.remove('lens-highlight');
      });
    }, 2000);
  }

  // Modal Dialog Popup General dengan Resilient Image Loader
  showModal({ icon, title, bodyHTML, imageSrc, buttonText, onButtonClick }) {
    if (this.modalIcon) this.modalIcon.innerText = icon || '💡';
    if (this.modalTitle) this.modalTitle.innerText = title || '';
    
    let contentHTML = '';
    if (imageSrc) {
      contentHTML += `<div class="modal-item-preview"><img src="${imageSrc}" alt="${title}" class="preview-img" onerror="if(this.src.includes('assets/ICON/')){this.src=this.src.replace('assets/ICON/','assets/images/items/');}else if(this.src.endsWith('.png.png')){this.src=this.src.replace('.png.png','.png');}"></div>`;
    }
    contentHTML += bodyHTML || '';

    if (this.modalBody) this.modalBody.innerHTML = contentHTML;
    
    if (this.modalActionBtn) {
      this.modalActionBtn.innerText = buttonText || 'Lanjut';
      this.modalActionBtn.onclick = () => {
        this.hideModal();
        if (onButtonClick) onButtonClick();
      };
    }

    if (this.modalOverlay) {
      this.modalOverlay.classList.add('active');
    }
  }

  // Tampilkan Modal Panggung Pemenang (Victory Podium Screen)
  showVictoryPodium(leaderboard, onReplayClick) {
    const winner = leaderboard[0];
    let podiumHTML = `
      <p style="font-size: 1.1rem; margin-bottom: 10px;"><strong>Pertandingan Multi-Laptop Selesai!</strong></p>
      <h3 style="color: ${winner.color}; font-size: 1.6rem; margin-bottom: 15px;">🎉 Selamat untuk ${winner.badge} ${winner.name}!</h3>
      <div class="podium-container">
    `;

    leaderboard.forEach((team, idx) => {
      const rankNum = idx + 1;
      podiumHTML += `
        <div class="podium-card rank-${rankNum}">
          <div class="podium-rank-num">#${rankNum}</div>
          <div>${team.badge}</div>
          <div class="podium-team-name">${team.name}</div>
          <div class="podium-score">⭐ ${team.score}</div>
        </div>
      `;
    });

    podiumHTML += `</div><p style="margin-top: 15px;">Semua tim hebat telah belajar pentingnya Ecobrick dan menjaga lingkungan sekolah!</p>`;

    this.showModal({
      icon: "🏆",
      title: "Panggung Juara Detektif",
      bodyHTML: podiumHTML,
      buttonText: "🔄 Main Lagi / Reset Misi",
      onButtonClick: onReplayClick
    });
  }

  hideModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.remove('active');
    }
  }

  // Confetti Animation Engine
  startConfetti() {
    if (!this.confettiCanvas || !this.ctx) return;
    this.confettiCanvas.width = this.viewport.clientWidth;
    this.confettiCanvas.height = this.viewport.clientHeight;

    const colors = ['#4CAF50', '#FFD54F', '#87CEEB', '#E53935', '#FF4081', '#00E676'];
    this.confettiParticles = [];

    for (let i = 0; i < 150; i++) {
      this.confettiParticles.push({
        x: Math.random() * this.confettiCanvas.width,
        y: Math.random() * this.confettiCanvas.height - this.confettiCanvas.height,
        size: Math.random() * 9 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 3.5 + 2,
        speedX: Math.random() * 2 - 1,
        rotation: Math.random() * 360,
        rotSpeed: Math.random() * 6 - 3
      });
    }

    this.isConfettiRunning = true;
    this.animateConfetti();

    setTimeout(() => {
      this.isConfettiRunning = false;
      if (this.ctx) this.ctx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
    }, 3500);
  }

  animateConfetti() {
    if (!this.isConfettiRunning || !this.ctx) return;

    this.ctx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

    this.confettiParticles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotSpeed;

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.ctx.restore();
    });

    requestAnimationFrame(() => this.animateConfetti());
  }
}

// Instance UI Manager Singleton
const uiManager = new UIManager();

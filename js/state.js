/**
 * Multi-Laptop Game State Manager (state.js)
 * Mengelola role (HOST vs PLAYER), Kode Ruangan multi-laptop, tim/pemain, klaim kepemilikan item, dan leaderboard.
 */

class GameState {
  constructor() {
    this.totalMistakes = 20;
    this.maxTimeSeconds = 180; // 3 Menit (180 Detik)
    this.hintIntervalSeconds = 25;
    this.maxHints = 3;

    // Default Team Preset Definitions
    this.teamPresets = [
      { id: 'team-red', name: 'Tim Merah', color: '#E53935', badge: '🔴', score: 0 },
      { id: 'team-blue', name: 'Tim Biru', color: '#1E88E5', badge: '🔵', score: 0 },
      { id: 'team-green', name: 'Tim Hijau', color: '#4CAF50', badge: '🟢', score: 0 },
      { id: 'team-yellow', name: 'Tim Kuning', color: '#FFB300', badge: '🟡', score: 0 }
    ];

    this.resetState();
  }

  resetState() {
    this.phase = 'LOBBY'; // 'LOBBY' | 'PLAYING' | 'PAUSED' | 'FINISHED' | 'TIMEOUT'
    this.role = 'HOST'; // 'HOST' (Laptop Proyektor Guru) | 'PLAYER' (Laptop Pemain Siswa)
    this.roomCode = ''; // Kode Ruangan Multi-Laptop (misal: SILIR-88)
    this.myTeamId = 'team-red'; // Tim yang ditugaskan ke laptop ini
    
    this.activeTeamsCount = 2; // Default 2 Tim (Dapat dipilih 2, 3, atau 4 tim)
    this.teams = [];
    this.teamConnections = { 'team-red': false, 'team-blue': false, 'team-green': false, 'team-yellow': false };
    this.currentTeamIndex = 0; // Tim yang aktif memilih di 1 layar
    this.itemOwnership = {}; // Map { itemId: teamId } misal { 1: 'team-red', 3: 'team-green' }
    
    this.timeLeft = this.maxTimeSeconds;
    this.inactivitySeconds = 0;
    this.hintsGiven = 0;
    this.lensUsed = false;
  }

  // Set Durasi Timer Pertandingan (180s = 3m, 300s = 5m, 9999s = Tanpa Batas)
  setTimerDuration(seconds) {
    this.maxTimeSeconds = seconds;
    this.timeLeft = seconds;
  }

  markTeamConnected(teamId, isConnected = true) {
    if (this.teamConnections.hasOwnProperty(teamId)) {
      this.teamConnections[teamId] = isConnected;
    }
  }

  hasAnyPlayerJoined() {
    return this.teams.some(t => this.teamConnections[t.id] === true);
  }

  // Reset ronde pertandingan baru tanpa menghapus room code atau tim
  resetRound() {
    this.phase = 'PLAYING';
    this.itemOwnership = {};
    this.firstClaimTime = {}; // Reset waktu klaim pertama per tim
    this.timeLeft = this.maxTimeSeconds;
    this.inactivitySeconds = 0;
    this.hintsGiven = 0;
    this.lensUsed = false;
    this.currentTeamIndex = 0;
    if (this.teams) {
      this.teams.forEach(t => t.score = 0);
    }
  }

  // Setup tim berdasarkan pilihan lobby (2-4 tim)
  setupTeams(count) {
    this.activeTeamsCount = Math.min(Math.max(count, 2), 4);
    this.teams = this.teamPresets.slice(0, this.activeTeamsCount).map(t => ({
      ...t,
      score: 0
    }));
    this.firstClaimTime = {}; // { teamId: timestamp ms } — waktu berhasil klaim pertama kali
  }

  // Bersihkan dan format Kode Ruangan secara otomatis (mencegah bug SILIR-SILIR 2LSZ)
  sanitizeRoomCode(raw) {
    if (!raw) return '';
    const clean = raw.toUpperCase().replace(/SILIR/g, '').replace(/[^A-Z0-9]/g, '');
    const codePart = clean.slice(-4);
    return codePart ? `SILIR-${codePart}` : raw.toUpperCase();
  }

  // Hasilkan Kode Ruangan acak (4 huruf/angka)
  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.roomCode = `SILIR-${code}`;
    return this.roomCode;
  }

  get activeTeam() {
    if (this.role === 'PLAYER') {
      return this.teams.find(t => t.id === this.myTeamId) || this.teamPresets.find(t => t.id === this.myTeamId) || this.teamPresets[0];
    }
    return this.teams[this.currentTeamIndex] || this.teamPresets[this.currentTeamIndex] || this.teamPresets[0];
  }

  get totalClaimed() {
    return Object.keys(this.itemOwnership).length;
  }

  get isComplete() {
    return this.totalClaimed >= this.totalMistakes;
  }

  isClaimed(itemId) {
    return !!this.itemOwnership[itemId];
  }

  getOwner(itemId) {
    const teamId = this.itemOwnership[itemId];
    return this.teams.find(t => t.id === teamId) || null;
  }

  // Klaim item oleh tim tertentu
  claimItem(itemId, teamId) {
    if (!this.isClaimed(itemId)) {
      this.itemOwnership[itemId] = teamId;
      const team = this.teams.find(t => t.id === teamId);
      if (team) {
        team.score++;
        // Catat waktu klaim PERTAMA tim ini (dipakai sebagai tiebreaker skor sama)
        if (!this.firstClaimTime) this.firstClaimTime = {};
        if (this.firstClaimTime[teamId] === undefined) {
          this.firstClaimTime[teamId] = Date.now();
        }
      }
      this.inactivitySeconds = 0;
      return true;
    }
    return false;
  }

  // Rotasi giliran tim (untuk mode 1-layar proyektor)
  nextTurn() {
    this.currentTeamIndex = (this.currentTeamIndex + 1) % this.teams.length;
  }

  // Ambil leaderboard peringkat tim
  // Tiebreaker: skor sama → yang lebih duluan klaim item pertamanya menang
  getLeaderboard() {
    const firstClaim = this.firstClaimTime || {};
    return [...this.teams].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score; // Skor lebih tinggi dulu
      // Skor sama → yang lebih duluan klaim menang (timestamp lebih kecil = lebih awal)
      const tA = firstClaim[a.id] ?? Infinity;
      const tB = firstClaim[b.id] ?? Infinity;
      return tA - tB;
    });
  }

  useLens() {
    if (!this.lensUsed) {
      this.lensUsed = true;
      return true;
    }
    return false;
  }

  getUnclaimedItems(allData) {
    return allData.filter(item => !this.isClaimed(item.id));
  }
}

// Instance Game State Singleton
const gameState = new GameState();

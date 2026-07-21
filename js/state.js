/**
 * Multi-Laptop Game State Manager (state.js)
 * Mengelola role (HOST vs PLAYER), Kode Ruangan multi-laptop, tim/pemain, klaim kepemilikan item, dan leaderboard.
 */

class GameState {
  constructor() {
    this.totalMistakes = 10;
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
    this.currentTeamIndex = 0; // Tim yang aktif memilih di 1 layar
    this.itemOwnership = {}; // Map { itemId: teamId } misal { 1: 'team-red', 3: 'team-green' }
    
    this.timeLeft = this.maxTimeSeconds;
    this.inactivitySeconds = 0;
    this.hintsGiven = 0;
    this.lensUsed = false;
  }

  // Reset ronde pertandingan baru tanpa menghapus room code atau tim
  resetRound() {
    this.phase = 'PLAYING';
    this.itemOwnership = {};
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
      return this.teams.find(t => t.id === this.myTeamId) || this.teams[0];
    }
    return this.teams[this.currentTeamIndex] || this.teams[0];
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

  // Ambil leaderboard peringkat tim (diurutkan dari skor tertinggi)
  getLeaderboard() {
    return [...this.teams].sort((a, b) => b.score - a.score);
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

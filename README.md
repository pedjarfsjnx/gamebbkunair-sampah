# 💻 🏆 Detektif Lingkungan - Multi-Laptop Real-Time Online Room System

**Detektif Lingkungan** kini dapat dimainkan oleh **banyak laptop secara bersamaan** (Multi-Laptop System) secara realtime tanpa perlu menginstall server!

---

## 🎮 Cara Menjalankan Di Banyak Laptop

### 🖥️ Laptop 1 (Host Proyektor Guru):
1. Buka file [`index.html`](file:///c:/Semester%206/KKN/ecobrick/index.html) di laptop guru yang terhubung ke Proyektor Kelas.
2. Pilih tombol **"🖥️ Buat Ruangan Proyektor (Host)"**.
3. Sistem akan menghasilkan **Kode Ruangan 4-Karakter** (contoh: `SILIR-88`) yang tampil menonjol pada banner header di proyektor.
4. Tentukan jumlah tim (2, 3, atau 4 tim) lalu klik **▶ Mulai Pertandingan**.

### 🎮 Laptop 2, 3, 4, dst. (Laptop Siswa / Pemain):
1. Buka file [`index.html`](file:///c:/Semester%206/KKN/ecobrick/index.html) di laptop siswa masing-masing (bisa di browser Chrome, Edge, Safari, Firefox).
2. Pilih tombol **"🎮 Masuk Ruangan (Laptop Pemain / Siswa)"**.
3. Masukkan **Kode Ruangan** yang tampil di proyektor (misal: `SILIR-88`).
4. Pilih Tim (🔴 Tim Merah, 🔵 Tim Biru, 🟢 Tim Hijau, 🟡 Tim Kuning) lalu klik **Hubungkan**.

---

## ⚡ Alur Sinkronisasi Real-Time P2P

- **Koneksi Instant PeerJS / WebRTC:** Menggunakan koneksi Direct Peer-to-Peer antar browser di banyak laptop + fallback BroadcastChannel lokal.
- **Rebut-Rebutan Realtime:**
  - Ketika Siswa di **Laptop 2 (Tim Hijau)** mengklik objek kesalahan di layarnya:
  - Objek tersebut **seketika terkunci (<50ms)** di layar Laptop Host Guru dan SEMUA Laptop Siswa lainnya!
  - Poin ⭐ Tim Hijau bertambah secara otomatis di Papan Skor Header seluruh laptop.
  - Dialog penjelasan edukatif muncul menyapa Tim Hijau.

---

## 📂 Berkas Utama Proyek

```
ecobrick/
├── index.html                  # Halaman utama game multi-laptop
├── server.js                   # Server Node.js WebSocket (opsional)
├── css/
│   ├── style.css               # Baseline layout 16:9
│   ├── components.css          # Banner Kode Ruangan, Scoreboard multi-laptop, Lobby peran
│   └── animations.css          # Animasi pulse, glow, confetti & leaderboard ranking
├── js/
│   ├── data.js                 # Database 10 Kesalahan & Aset Realistis
│   ├── audio.js                # Web Audio API Synthesizer (SFX Klaim, Fanfare, Buzz)
│   ├── state.js                # Game State Manager (Roles, Room Code, Teams)
│   ├── network.js              # PeerJS WebRTC P2P Engine + BroadcastChannel
│   ├── ui.js                   # UI Manager, Banner Renderer, Scoreboard & Podium
│   └── app.js                  # App Controller (Host creation vs Player joining)
├── assets/
│   ├── images/
│   │   ├── schoolyard_hd.svg   # Ilustrasi latar belakang 16:9 HD
│   │   └── items/realistic/    # 10 Aset gambar kesalahan realistis
├── game.md                     # Spesifikasi dasar
└── README.md                   # Panduan penggunaan Multi-Laptop System
```

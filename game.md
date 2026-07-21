# 🕵️ Detektif Lingkungan

## Deskripsi

**Detektif Lingkungan** adalah mini game edukatif interaktif berbasis web yang mengajak siswa SD mengenali kebiasaan baik dan buruk terhadap lingkungan, sebagai media pembelajaran sebelum praktik membuat **Ecobrick**.

Siswa berperan sebagai **Detektif Lingkungan** yang mendapat misi menemukan berbagai kesalahan tersembunyi di sebuah ilustrasi halaman sekolah. Setiap kesalahan yang ditemukan langsung dijelaskan alasannya, sehingga siswa tidak hanya bermain, tetapi juga belajar sambil mengingat kembali materi yang sudah disampaikan.

Game dimainkan secara klasikal (dipandu guru/fasilitator KKN, dijawab bersama-sama oleh siswa) di proyektor kelas, dengan durasi sekitar **3–4 menit**.

---

## Tujuan Pembelajaran

- Mengulang dan menguatkan materi cara membuat Ecobrick yang sudah diajarkan.
- Melatih kemampuan observasi dan berpikir kritis siswa.
- Meningkatkan partisipasi aktif seluruh siswa di kelas.
- Membantu siswa membedakan kebiasaan yang benar dan salah terhadap sampah plastik dan lingkungan.
- Menjadi jembatan/selingan yang menyenangkan menuju sesi praktik membuat Ecobrick.

---

## Alur Permainan

### 1. Opening

Saat halaman dibuka, muncul popup pembuka (overlay gelap transparan di belakangnya).

**Judul**
🕵️ Detektif Lingkungan

**Isi**

> Halo, Detektif!
> Hari ini kita mendapat tugas dari Desa Siliragung untuk menjaga lingkungan sekolah.
> Namun ternyata masih ada beberapa kebiasaan yang kurang baik di halaman sekolah ini.
> Tugas kalian adalah menemukan **10 kesalahan** yang tersembunyi di dalam gambar.
> Kalau berhasil menemukan semuanya sebelum waktu habis, kalian akan menjadi **Detektif Lingkungan Hebat!**

**Tombol**
▶ Mulai Misi

---

### 2. Tampilan Utama

**Background**
Ilustrasi kartun halaman sekolah, gaya flat/vector, warna cerah, resolusi 16:9 agar pas untuk proyektor.

**Elemen ilustrasi (netral, bukan kesalahan):**
- Pohon dan semak
- Rumput
- Bangku taman
- Tempat sampah (dengan label pilah: organik/anorganik)
- Anak-anak bermain bola/lompat tali
- Gerobak/rak hasil karya Ecobrick
- Sungai kecil dengan ikan
- Bunga-bunga
- Jalan setapak berpaving
- Gedung kelas dengan mading

Semua elemen kesalahan **menyatu secara alami** dengan ilustrasi (tidak menonjol berlebihan) agar siswa benar-benar perlu mengamati, tapi tetap cukup jelas untuk anak SD (lihat bagian *Tingkat Kesulitan*).

---

## Header

| Kiri | Tengah | Kanan |
|---|---|---|
| 🕵️ Detektif Lingkungan | ⭐ Skor: 0 / 10 | ⏰ 03:00 |

Progress bar tipis di bawah header menunjukkan persentase kesalahan yang sudah ditemukan (0–100%).

---

## Cara Bermain

1. Guru/fasilitator menampilkan game di proyektor.
2. Siswa menunjuk lokasi yang menurut mereka salah.
3. Guru mengklik lokasi tersebut mewakili siswa.
4. **Jika benar:**
   - Lingkaran merah pulsing muncul di lokasi objek.
   - Popup penjelasan muncul (judul kesalahan + alasan + ikon relevan).
   - Efek suara "ding" + skor bertambah 1.
   - Objek berubah menjadi highlight hijau transparan dan tidak bisa diklik ulang.
   - Progress bar dan bintang di header diperbarui.
5. **Jika salah (mengklik area kosong/objek netral):**
   - Muncul ikon ❌ singkat di titik klik disertai teks "Coba lagi!".
   - Efek suara "buzz".
   - Tidak ada pengurangan skor maupun waktu — supaya anak tidak takut mencoba.

---

## Daftar Kesalahan (Total 10)

### Kesalahan 1 — Botol plastik dibuang ke sungai
**Lokasi:** mengapung di sungai kecil.
**Popup:**
> Botol plastik tidak boleh dibuang ke sungai karena dapat mencemari air dan membahayakan hewan yang hidup di dalamnya.

### Kesalahan 2 — Bungkus snack dibuang di rumput
**Lokasi:** tergeletak di rerumputan dekat bangku.
**Popup:**
> Sampah plastik seperti bungkus snack sebaiknya dibuang pada tempatnya, atau dikumpulkan untuk dijadikan bahan Ecobrick.

### Kesalahan 3 — Kulit pisang dimasukkan ke dalam Ecobrick
**Lokasi:** terlihat menyembul dari salah satu botol Ecobrick.
**Popup:**
> Ecobrick hanya boleh diisi sampah plastik yang bersih dan kering — sampah organik seperti kulit pisang akan membusuk dan merusak Ecobrick.

### Kesalahan 4 — Anak membakar sampah plastik
**Lokasi:** ada asap kecil dan api dari tumpukan sampah plastik di sudut halaman.
**Popup:**
> Membakar plastik menghasilkan asap beracun yang berbahaya bagi kesehatan paru-paru dan mencemari udara.

### Kesalahan 5 — Ecobrick belum dipadatkan
**Lokasi:** botol terlihat masih longgar/kempis di rak hasil karya.
**Popup:**
> Ecobrick harus dipadatkan sepenuhnya menggunakan tongkat kayu agar kuat, keras, dan bisa dimanfaatkan menjadi meja, kursi, atau produk lainnya.

### Kesalahan 6 — Sedotan dan tutup botol berserakan di rumput
**Lokasi:** dekat tempat sampah, belum dikumpulkan.
**Popup:**
> Sedotan dan tutup botol plastik yang kecil tetap harus dikumpulkan — jangan dibiarkan berserakan, karena tetap bisa dijadikan isian Ecobrick.

### Kesalahan 7 — Tisu basah dimasukkan ke dalam Ecobrick
**Lokasi:** terlihat menyembul dari botol Ecobrick lain di rak.
**Popup:**
> Ecobrick tidak boleh diisi tisu basah atau bahan yang lembap, karena bisa menimbulkan jamur dan bau di dalam botol.

### Kesalahan 8 — Plastik kotor langsung dimasukkan ke Ecobrick
**Lokasi:** kemasan plastik bekas makanan yang masih terlihat kotor, di dekat rak Ecobrick.
**Popup:**
> Plastik bekas makanan atau minuman harus dicuci bersih dan dikeringkan dulu sebelum dijadikan isian Ecobrick, agar tidak bau dan berjamur.

### Kesalahan 9 — Sampah organik dan plastik tercampur di tempat sampah
**Lokasi:** tempat sampah berlabel pilah, tapi isinya campur aduk.
**Popup:**
> Sampah harus dipilah sesuai jenisnya — sampah organik dan sampah plastik dibuang di tempat yang berbeda agar plastik lebih mudah didaur ulang atau dijadikan Ecobrick.

### Kesalahan 10 — Bungkus permen dibuang sembarangan padahal tempat sampah ada di dekatnya
**Lokasi:** seorang anak melempar bungkus permen ke rumput, tepat di sebelah tempat sampah.
**Popup:**
> Meskipun terlihat sepele, membuang sampah sembarangan padahal tempat sampah ada di dekat kita tetap merupakan kebiasaan yang tidak baik terhadap lingkungan.

---

## Fitur Interaktif Tambahan

### 🔍 Lensa Detektif (fitur unggulan)

Di bagian bawah layar terdapat ikon:

**🔍 Gunakan Lensa Detektif**

- Saat diklik, layar menjadi sedikit lebih gelap (overlay hitam transparan) dan **semua** objek kesalahan yang belum ditemukan berkilau (glow kuning) selama 2 detik.
- **Hanya bisa digunakan 1 kali** selama permainan.
- Setelah dipakai, ikon berubah abu-abu/nonaktif dengan label "Sudah digunakan".
- Tujuan: mendorong siswa mencoba mencari sendiri dulu ("Kita coba cari sendiri dulu, kalau mentok baru pakai lensa"), sekaligus memberi rasa permainan yang lebih "sungguhan" ketimbang sekadar mencari gambar.

### Badge Pencapaian (opsional, menambah rasa pencapaian)

Setiap kelipatan 5 kesalahan ditemukan, muncul notifikasi kecil di pojok layar:
- 5/10 → "🥉 Detektif Pemula!"
- 10/10 → "🥇 Detektif Hebat!"

---

## Progress & Skor

Ditampilkan sebagai kombinasi angka dan bintang di header:

```
⭐⭐☆☆☆☆☆☆☆☆   2 / 10
⭐⭐⭐⭐⭐☆☆☆☆☆   5 / 10
⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐   10 / 10
```

Progress bar horizontal di bawah header mengisi secara halus (animasi transisi ±0.3 detik) setiap kali skor bertambah.

---

## Timer

**Total waktu: 180 detik (3 menit)**

- Timer ditampilkan dalam format `MM:SS`, berubah warna:
  - Putih saat waktu tersisa > 60 detik
  - Kuning saat 30–60 detik
  - Merah berkedip pelan saat < 30 detik
- Apabila waktu habis sebelum semua kesalahan ditemukan:
  - Permainan otomatis berhenti.
  - Seluruh kesalahan yang belum ditemukan langsung ditandai dan ditampilkan popup ringkasannya satu per satu.
  - Guru dapat menjelaskan sisanya secara langsung kepada siswa.
  - Tetap muncul apresiasi: "Kerja bagus! Yuk kita pelajari sisanya bersama-sama." (tanpa kesan "kalah").

---

## Sistem Hint

- Jika **25 detik** berlalu tanpa ada jawaban benar, muncul hint pertama.
- Jika **25 detik** berikutnya masih tidak ada jawaban benar, muncul hint kedua.
- Maksimal **3 hint** selama permainan (menyesuaikan jumlah kesalahan yang lebih banyak).
- Contoh hint:
  1. 💡 "Coba perhatikan area sungai."
  2. 💡 "Coba lihat rak Ecobrick lebih teliti."
  3. 💡 "Ada sesuatu yang aneh di dekat tempat sampah."
- Hint muncul sebagai balon kecil di pojok bawah layar, hilang otomatis setelah 5 detik.

---

## Tingkat Kesulitan

- Ditujukan untuk siswa SD, sehingga objek kesalahan dibuat **cukup jelas** secara visual (warna/posisi kontras), tidak tersembunyi ekstrem.
- Ukuran area klik (hitbox) objek dibuat lebih besar dari ukuran visualnya agar mudah diklik/ditunjuk anak-anak.
- Tidak ada penalti skor maupun waktu untuk jawaban salah, agar anak tetap berani mencoba tanpa takut salah.

---

## Animasi & Efek

### Hover
- Objek yang bisa diklik sedikit membesar (scale 1.05x) saat kursor berada di atasnya.
- Muncul efek glow tipis berwarna kuning pucat sebagai penanda "bisa diklik".

### Jawaban Benar
- Lingkaran merah muncul dengan animasi "pulse" (membesar-mengecil 2x) lalu berubah menjadi highlight hijau.
- Popup slide-in dari bawah dengan sedikit efek bounce.
- Efek suara: 🔔 Ding!

### Jawaban Salah
- Ikon ❌ muncul singkat (fade in-out, ±0.8 detik) di titik klik.
- Efek suara: ❌ Buzz!

### Semua Kesalahan Ditemukan
- Animasi confetti memenuhi layar (±3 detik).
- Efek suara: 🎉 Tepuk tangan/fanfare singkat.
- Popup kemenangan muncul:

  > 🎉 Selamat!
  > Kalian berhasil menemukan semua kesalahan dan resmi menjadi
  > 🕵️ **Detektif Lingkungan Hebat!**
  > Hari ini kalian telah belajar menjaga lingkungan sekolah dari kebiasaan yang salah.
  > Sekarang saatnya membuktikan kemampuan kalian dengan membuat Ecobrick sungguhan!

  **Tombol:** ➡ Lanjut Praktik Ecobrick

---

## Palet Warna

| Peran | Warna | Kode |
|---|---|---|
| Primary | Hijau | `#4CAF50` |
| Secondary | Biru Langit | `#87CEEB` |
| Accent | Kuning | `#FFD54F` |
| Danger/Salah | Merah | `#E53935` |
| Background | Hijau muda dengan ilustrasi kartun | `#E8F5E9` |

Semua warna dipilih agar cerah, hangat, dan ramah anak.

---

## Responsivitas

Dirancang utama untuk:
- Laptop guru
- Ditampilkan via proyektor
- Resolusi 16:9 (misalnya 1280×720 atau 1920×1080)

Elemen UI (header, tombol, popup) menggunakan ukuran relatif (`vw`/`vh`/`%`) agar tetap proporsional di berbagai ukuran layar proyeksi.

---

## Teknologi

- HTML5
- CSS3 (termasuk CSS animation/transition untuk semua efek)
- JavaScript (Vanilla, tanpa framework)
- Seluruh aset (gambar, suara) berjalan **offline**, tanpa koneksi internet — penting karena kondisi jaringan di lokasi KKN mungkin terbatas.

---

## Struktur Folder

```
detektif-lingkungan/
│
├── index.html
├── style.css
├── script.js
│
├── assets/
│   ├── images/
│   │   ├── background.png
│   │   ├── bottle-river.png
│   │   ├── wrapper.png
│   │   ├── banana-peel.png
│   │   ├── smoke.png
│   │   ├── ecobrick-loose.png
│   │   ├── straw-cap.png
│   │   ├── wet-tissue.png
│   │   ├── dirty-plastic.png
│   │   ├── mixed-trash.png
│   │   └── candy-wrapper.png
│   ├── icons/
│   │   ├── lens-icon.png
│   │   ├── star.png
│   │   └── timer.png
│   └── sounds/
│       ├── correct.mp3
│       ├── wrong.mp3
│       └── win.mp3
│
└── README.md
```

---

## Diagram Alur Permainan

```
Opening (Popup Cerita)
        │
        ▼
   Mulai Misi
        │
        ▼
 Cari 10 Kesalahan
        │
        ▼
   Klik / Tunjuk Objek
        │
   ┌────┴─────┐
   ▼          ▼
 Benar       Salah
   │          │
   ▼          ▼
 Popup     "Coba lagi!"
Penjelasan     │
   │           ▼
   ▼        (kembali mencari)
Skor + Progress
Bertambah
   │
   ▼
Semua 10 Ditemukan? ──Belum──▶ (lanjut mencari / waktu jalan terus)
   │ Ya
   ▼
Confetti + Popup Menang
   │
   ▼
Lanjut Praktik Ecobrick
```

---

## Catatan Pedagogis

Game ini **bukan bertujuan menguji atau menilai** siswa, melainkan menjadi media pembelajaran yang menyenangkan dan partisipatif. Setiap jawaban benar selalu diikuti penjelasan singkat agar siswa memahami alasan di balik setiap perilaku yang benar maupun salah — bukan sekadar menghafal lokasi objek. Tidak adanya penalti untuk jawaban salah memastikan seluruh siswa, termasuk yang kurang percaya diri, tetap berani berpartisipasi.

Dengan 10 kesalahan (dari sebelumnya 5), cakupan materi menjadi lebih luas — tidak hanya soal Ecobrick itu sendiri, tapi juga kebiasaan pemilahan sampah dan menjaga lingkungan sekolah secara umum — sehingga permainan lebih kaya tanpa kehilangan fokus edukatifnya.
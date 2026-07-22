/**
 * Data 20 Kesalahan Lingkungan (Direct User Icons Path Version)
 * Berisi definisi lokasi hitbox (dalam persentase %), judul, penjelasan edukatif, hint, ikon, dan berkas gambar dari folder assets/ICON/.
 */

const MISTAKES_DATA = [
  {
    id: 1,
    name: "Botol Plastik di Sungai (Sisi Kiri)",
    title: "🌊 Botol Plastik Dibuang ke Sungai",
    description: "Botol plastik tidak boleh dibuang ke sungai karena dapat mencemari air, menyumbat aliran sungai hingga menyebabkan banjir, dan membahayakan hewan yang hidup di dalamnya.",
    hint: "💡 Coba perhatikan area sungai kecil di sebelah kiri bawah.",
    icon: "🍾",
    imageSrc: "assets/ICON/item1_bottle_river.png.png",
    fallbackSrc: "assets/images/items/item1_bottle_river.png.png",
    bounds: { left: 9.5, top: 74, width: 8.5, height: 9.5 }
  },
  {
    id: 2,
    name: "Bungkus Snack di Rumput Taman",
    title: "🍿 Bungkus Snack Dibuang di Rumput",
    description: "Sampah plastik seperti bungkus snack sebaiknya dibuang pada tempatnya, atau dikumpulkan untuk dijadikan bahan isian Ecobrick.",
    hint: "💡 Coba lihat di rerumputan dekat bangku taman.",
    icon: "🍿",
    imageSrc: "assets/ICON/item2_snack_wrapper.png.png",
    fallbackSrc: "assets/images/items/item2_snack_wrapper.png.png",
    bounds: { left: 15.5, top: 63, width: 6.5, height: 7.5 }
  },
  {
    id: 3,
    name: "Kulit Pisang dalam Ecobrick (Rak Atas)",
    title: "🍌 Kulit Pisang Dimasukkan ke Ecobrick",
    description: "Ecobrick hanya boleh diisi sampah plastik yang bersih dan kering — sampah organik seperti kulit pisang akan membusuk dan merusak Ecobrick.",
    hint: "💡 Coba perhatikan botol-botol di rak karya Ecobrick di sebelah kanan (rak atas).",
    icon: "🍌",
    imageSrc: "assets/ICON/item3_banana_ecobrick.png.png",
    fallbackSrc: "assets/images/items/item3_banana_ecobrick.png.png",
    bounds: { left: 80.5, top: 55, width: 6, height: 8.5 }
  },
  {
    id: 4,
    name: "Membakar Sampah Plastik",
    title: "🔥 Anak Membakar Sampah Plastik",
    description: "Membakar plastik menghasilkan asap beracun yang sangat berbahaya bagi kesehatan paru-paru dan mencemari udara sekitar.",
    hint: "💡 Ada asap dan api kecil di sudut kanan bawah halaman sekolah.",
    icon: "🔥",
    imageSrc: "assets/ICON/item4_burning_plastic.png.png",
    fallbackSrc: "assets/images/items/item4_burning_plastic.png.png",
    bounds: { left: 90.5, top: 73, width: 9, height: 16 }
  },
  {
    id: 5,
    name: "Ecobrick Belum Dipadatkan (Rak Atas)",
    title: "📦 Ecobrick Belum Dipadatkan",
    description: "Ecobrick harus dipadatkan sepenuhnya menggunakan tongkat kayu agar kuat, keras, dan bisa dimanfaatkan menjadi meja, kursi, atau produk lainnya.",
    hint: "💡 Lihat rak Ecobrick atas, ada botol yang terlihat longgar dan kempis.",
    icon: "📦",
    imageSrc: "assets/ICON/item5_loose_ecobrick.png.png",
    fallbackSrc: "assets/images/items/item5_loose_ecobrick.png.png",
    bounds: { left: 84.5, top: 55.5, width: 6, height: 8.5 }
  },
  {
    id: 6,
    name: "Sedotan dan Tutup Botol Berserakan",
    title: "🥤 Sedotan dan Tutup Botol Berserakan",
    description: "Sedotan dan tutup botol plastik yang kecil tetap harus dikumpulkan — jangan dibiarkan berserakan, karena tetap bisa dijadikan isian Ecobrick.",
    hint: "💡 Ada sedotan dan tutup botol kecil berceceran di rumput dekat tempat sampah.",
    icon: "🥤",
    imageSrc: "assets/ICON/item6_straws_caps.png.png",
    fallbackSrc: "assets/images/items/item6_straws_caps.png.png",
    bounds: { left: 54, top: 67, width: 7.5, height: 8 }
  },
  {
    id: 7,
    name: "Tisu Basah dalam Ecobrick (Rak Bawah)",
    title: "🧻 Tisu Basah Dimasukkan ke Ecobrick",
    description: "Ecobrick tidak boleh diisi tisu basah atau bahan yang lembap, karena bisa menimbulkan jamur dan bau di dalam botol.",
    hint: "💡 Cek botol Ecobrick di bagian rak bawah.",
    icon: "🧻",
    imageSrc: "assets/ICON/item7_wet_tissue_ecobrick.png.png",
    fallbackSrc: "assets/images/items/item7_wet_tissue_ecobrick.png.png",
    bounds: { left: 79, top: 64.5, width: 6, height: 8.5 }
  },
  {
    id: 8,
    name: "Plastik Kotor Langsung Dimasukkan",
    title: "🧽 Plastik Kotor Langsung Dimasukkan",
    description: "Plastik bekas makanan atau minuman harus dicuci bersih dan dikeringkan dulu sebelum dijadikan isian Ecobrick, agar tidak bau dan berjamur.",
    hint: "💡 Ada kemasan plastik kotor berminyak di dekat bawah rak Ecobrick.",
    icon: "🧽",
    imageSrc: "assets/ICON/item8_dirty_plastic.png.png",
    fallbackSrc: "assets/images/items/item8_dirty_plastic.png.png",
    bounds: { left: 71.5, top: 68.5, width: 7, height: 8.5 }
  },
  {
    id: 9,
    name: "Sampah Organik di Tempat Sampah Organik",
    title: "♻️ Sampah Organik & Plastik Tercampur",
    description: "Sampah harus dipilah sesuai jenisnya — sampah organik dan sampah plastik dibuang di tempat yang berbeda agar plastik lebih mudah didaur ulang atau dijadikan Ecobrick.",
    hint: "💡 Coba lihat tempat sampah hijau (organik), ada kemasan plastik tercampur di atasnya.",
    icon: "♻️",
    imageSrc: "assets/ICON/item9_mixed_trash_bin.png.png",
    fallbackSrc: "assets/images/items/item9_mixed_trash_bin.png.png",
    bounds: { left: 57.5, top: 54.5, width: 6.5, height: 8.5 }
  },
  {
    id: 10,
    name: "Bungkus Permen Dibuang Sembarangan",
    title: "🍬 Bungkus Permen Dibuang Sembarangan",
    description: "Meskipun terlihat sepele, membuang sampah sembarangan padahal tempat sampah ada di dekat kita tetap merupakan kebiasaan yang tidak baik terhadap lingkungan.",
    hint: "💡 Lihat anak yang melempar bungkus permen tepat di samping tempat sampah.",
    icon: "🍬",
    imageSrc: "assets/ICON/item10_candy_wrapper.png.png",
    fallbackSrc: "assets/images/items/item10_candy_wrapper.png.png",
    bounds: { left: 69.5, top: 61.5, width: 6.5, height: 7.5 }
  },
  {
    id: 11,
    name: "Botol Plastik Terapung di Ujung Sungai",
    title: "🌊 Botol Plastik Terapung di Ujung Danau",
    description: "Sampah botol plastik di air laut atau sungai dapat tertelan oleh ikan dan kura-kura, merusak ekosistem air.",
    hint: "💡 Coba lihat di sudut kiri paling bawah tempat air sungai mengalir.",
    icon: "🍾",
    imageSrc: "assets/ICON/item1_bottle_river.png.png",
    fallbackSrc: "assets/images/items/item1_bottle_river.png.png",
    bounds: { left: 4.5, top: 82, width: 8.5, height: 9.5 }
  },
  {
    id: 12,
    name: "Bungkus Snack di Bawah Batang Pohon",
    title: "🍿 Bungkus Makanan di Rumput Depan",
    description: "Plastik bungkus makanan butuh waktu ratusan tahun untuk terurai. Kumpulkan dan padatkan menjadi Ecobrick!",
    hint: "💡 Coba lihat di dekat rumput dekat bangku taman sebelah kiri.",
    icon: "🍿",
    imageSrc: "assets/ICON/item2_snack_wrapper.png.png",
    fallbackSrc: "assets/images/items/item2_snack_wrapper.png.png",
    bounds: { left: 22.5, top: 67, width: 6.5, height: 7.5 }
  },
  {
    id: 13,
    name: "Kulit Pisang di Botol Rak Kiri",
    title: "🍌 Sampah Organik dalam Botol Ecobrick",
    description: "Ingat, Ecobrick HANYA untuk plastik bersih. Masukkan sisa makanan ke dalam wadah kompos pupuk tanaman.",
    hint: "💡 Coba perhatikan botol paling kiri di rak atas karya Ecobrick.",
    icon: "🍌",
    imageSrc: "assets/ICON/item3_banana_ecobrick.png.png",
    fallbackSrc: "assets/images/items/item3_banana_ecobrick.png.png",
    bounds: { left: 75.8, top: 55, width: 6, height: 8.5 }
  },
  {
    id: 14,
    name: "Asap Tebal Pembakaran Plastik",
    title: "🔥 Asap Pembakaran Sampah Beracun",
    description: "Asap hitam pembakaran plastik merilis dioksin yang memicu kanker. Jangan pernah membakar sampah plastik!",
    hint: "💡 Coba perhatikan asap yang membubung di atas tumpukan sampah kanan.",
    icon: "🔥",
    imageSrc: "assets/ICON/item4_burning_plastic.png.png",
    fallbackSrc: "assets/images/items/item4_burning_plastic.png.png",
    bounds: { left: 91.5, top: 62, width: 8, height: 11 }
  },
  {
    id: 15,
    name: "Ecobrick Kempis di Rak Bawah",
    title: "📦 Botol Ecobrick Kurang Padat",
    description: "Botol Ecobrick yang masih kempis jika ditekan harus ditambah plastik lagi hingga keras seperti batu.",
    hint: "💡 Perhatikan botol paling kanan di rak bawah Ecobrick.",
    icon: "📦",
    imageSrc: "assets/ICON/item5_loose_ecobrick.png.png",
    fallbackSrc: "assets/images/items/item5_loose_ecobrick.png.png",
    bounds: { left: 88.7, top: 64.5, width: 6, height: 8.5 }
  },
  {
    id: 16,
    name: "Sedotan Plastik di Jalan Setapak",
    title: "🥤 Sedotan Plastik di Jalanan",
    description: "Sedotan plastik sekali pakai merupakan salah satu sampah yang paling sering mencemari lingkungan.",
    hint: "💡 Ada sedotan plastik terjatuh di sepanjang garis jalan setapak tengah.",
    icon: "🥤",
    imageSrc: "assets/ICON/item6_straws_caps.png.png",
    bounds: { left: 38.5, top: 73, width: 7, height: 7.5 }
  },
  {
    id: 17,
    name: "Tisu Basah di Botol Rak Bawah",
    title: "🧻 Bahan Basah dalam Botol Ecobrick",
    description: "Pastikan semua plastik yang masuk botol sudah benar-benar kering sebelum dimasukkan ke Ecobrick.",
    hint: "💡 Lihat botol ketiga di rak bawah Ecobrick.",
    icon: "🧻",
    imageSrc: "assets/ICON/item7_wet_tissue_ecobrick.png.png",
    fallbackSrc: "assets/images/items/item7_wet_tissue_ecobrick.png.png",
    bounds: { left: 83.5, top: 64.5, width: 6, height: 8.5 }
  },
  {
    id: 18,
    name: "Kemasan Plastik Berminyak di Depan Bangku",
    title: "🧽 Plastik Makanan Belum Dicuci",
    description: "Cuci plastik bekas makanan dengan sabun dan keringkan di bawah sinar matahari sebelum dibuat Ecobrick.",
    hint: "💡 Coba perhatikan di tanah dekat anak perempuan dan bangku sekolah.",
    icon: "🧽",
    imageSrc: "assets/ICON/item8_dirty_plastic.png.png",
    fallbackSrc: "assets/images/items/item8_dirty_plastic.png.png",
    bounds: { left: 28.5, top: 64.5, width: 6.5, height: 7.5 }
  },
  {
    id: 19,
    name: "Sampah Organik di Tempat Sampah Anorganik",
    title: "♻️ Tempat Sampah Anorganik Tercampur Organik",
    description: "Tempat sampah biru untuk plastik, kaleng, dan kaca. Jangan mencampurnya dengan sampah sisa makanan!",
    hint: "💡 Coba lihat tempat sampah biru (anorganik), ada sampah bercampur.",
    icon: "♻️",
    imageSrc: "assets/ICON/item9_mixed_trash_bin.png.png",
    fallbackSrc: "assets/images/items/item9_mixed_trash_bin.png.png",
    bounds: { left: 62.5, top: 54.5, width: 6.5, height: 8.5 }
  },
  {
    id: 20,
    name: "Bungkus Permen di Pinggir Sungai",
    title: "🍬 Sampah Plastik Kecil di Tepian Air",
    description: "Sampah sekecil bungkus permen tetap berdampak buruk jika terbawa angin masuk ke aliran air.",
    hint: "💡 Ada bungkus permen kecil di tanah tepi pinggir sungai kolam.",
    icon: "🍬",
    imageSrc: "assets/ICON/item10_candy_wrapper.png.png",
    fallbackSrc: "assets/images/items/item10_candy_wrapper.png.png",
    bounds: { left: 16.5, top: 76, width: 6.5, height: 7.5 }
  }
];

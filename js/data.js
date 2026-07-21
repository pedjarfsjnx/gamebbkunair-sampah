/**
 * Data 10 Kesalahan Lingkungan (Direct User Icons Path Version)
 * Berisi definisi lokasi hitbox (dalam persentase %), judul, penjelasan edukatif, hint, ikon, dan berkas gambar dari folder assets/ICON/.
 */

const MISTAKES_DATA = [
  {
    id: 1,
    name: "Botol Plastik di Sungai",
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
    name: "Bungkus Snack di Rumput",
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
    name: "Kulit Pisang dalam Ecobrick",
    title: "🍌 Kulit Pisang Dimasukkan ke Ecobrick",
    description: "Ecobrick hanya boleh diisi sampah plastik yang bersih dan kering — sampah organik seperti kulit pisang akan membusuk dan merusak Ecobrick.",
    hint: "💡 Coba perhatikan botol-botol di rak karya Ecobrick di sebelah kanan.",
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
    name: "Ecobrick Belum Dipadatkan",
    title: "📦 Ecobrick Belum Dipadatkan",
    description: "Ecobrick harus dipadatkan sepenuhnya menggunakan tongkat kayu agar kuat, keras, dan bisa dimanfaatkan menjadi meja, kursi, atau produk lainnya.",
    hint: "💡 Lihat rak Ecobrick, ada botol yang terlihat longgar dan kempis.",
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
    name: "Tisu Basah dalam Ecobrick",
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
    name: "Sampah Tercampur di Tempat Sampah",
    title: "♻️ Sampah Organik & Plastik Tercampur",
    description: "Sampah harus dipilah sesuai jenisnya — sampah organik dan sampah plastik dibuang di tempat yang berbeda agar plastik lebih mudah didaur ulang atau dijadikan Ecobrick.",
    hint: "💡 Coba lihat tempat sampah berlabel pilah, isinya bercampur aduk.",
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
  }
];

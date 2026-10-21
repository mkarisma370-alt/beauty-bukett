
// =====================================================
// 1. KONFIGURASI USAHA
// Isi placeholder dengan data usaha yang benar.
// Nomor WhatsApp hanya ditulis di satu tempat.
// =====================================================

const NOMOR_WA = "6287729127589";
const AKUN_INSTAGRAM = "[akun-instagram]";

const LINK_MAPS =
  "https://www.google.com/maps/search/?api=1&query=Beauty%20Bukett%20Singosari";

// =====================================================
// 2. DATA KATALOG
// Nama dan detail produk di bawah bersifat sementara.
// Harga, isi buket, ukuran, dan stok belum diberikan.
// =====================================================

const PRODUK = [
  {
    id: 1,
    nama: "Midnight Bloom",
    gambar: "img/buket-1.jpeg",
    deskripsi: "Mawar merah glitter dengan wrapping hitam, untaian mutiara, dan kupu-kupu berkilau.",
    kategori: "buket",
    tag: ["Mawar"]
  },
  {
    id: 2,
    nama: "Red Rose Graduation",
    gambar: "img/buket-2.jpeg",
    deskripsi: "Mawar merah glitter dengan wrapping hitam dan pita ucapan Happy Graduation.",
    kategori: "buket",
    tag: ["Mawar", "Wisuda"]
  },
  {
    id: 3,
    nama: "Sweet Pink Hampers",
    gambar: "img/buket-3.jpeg",
    deskripsi: "Box hampers pink berisi boneka, camilan, dan rangkaian bunga mungil.",
    kategori: "buket",
    tag: ["Hampers", "Camilan"]
  },
  {
    id: 4,
    nama: "Strawberry Milk Bouquet",
    gambar: "img/buket-4.jpeg",
    deskripsi: "Buket susu rasa stroberi dengan wrapping pink dan pita merah.",
    kategori: "buket",
    tag: ["Camilan"]
  },
  {
    id: 5,
    nama: "Royal Blue Money Bouquet",
    gambar: "img/buket-5.jpeg",
    deskripsi: "Buket uang dengan wrapping biru royal, bunga kering, dan kartu ucapan.",
    kategori: "buket",
    tag: ["Uang"]
  },
  {
    id: 6,
    nama: "Chunky Sunflower Bouquet",
    gambar: "img/buket-6.jpeg",
    deskripsi: "Buket cokelat dengan wrapping hitam, bunga matahari, dan pita putih.",
    kategori: "buket",
    tag: ["Camilan"]
  }
];

// =====================================================
// 3. REFERENSI ELEMEN HTML
// Mengambil elemen yang diperlukan untuk interaksi.
// =====================================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const productGrid = $("#productGrid");
const searchInput = $("#searchInput");
const clearSearch = $("#clearSearch");
const resultCount = $("#resultCount");
const emptyState = $("#emptyState");
const detailBackdrop = $("#detailBackdrop");
const detailContent = $("#detailContent");
const toast = $("#toast");

let filterAktif = "all";
let urutanAktif = "default";
let produkAktif = null;
let toastTimer = null;

// =====================================================
// 4. PENYIMPANAN LOKAL
// Menyimpan favorit dan riwayat pada browser perangkat.
// Tidak menyimpan data pribadi pelanggan.
// =====================================================

function bacaPenyimpanan(kunci, nilaiAwal) {
  try {
    const nilai = localStorage.getItem(kunci);
    return nilai ? JSON.parse(nilai) : nilaiAwal;
  } catch {
    return nilaiAwal;
  }
}

function simpanPenyimpanan(kunci, nilai) {
  try {
    localStorage.setItem(kunci, JSON.stringify(nilai));
  } catch {
    tampilkanToast("Penyimpanan browser tidak tersedia.");
  }
}

let favorit = bacaPenyimpanan("beautyBukettFavorit", []);
let riwayat = bacaPenyimpanan("beautyBukettRiwayat", []);

if (!Array.isArray(favorit)) favorit = [];
if (!Array.isArray(riwayat)) riwayat = [];

// =====================================================
// 5. SAPAAN SAAT PENGUNJUNG MASUK
// Menggunakan waktu lokal perangkat pengunjung.
// =====================================================

function aturSapaan() {
  const jam = new Date().getHours();
  let sapaan = "Selamat datang";

  if (jam >= 4 && jam < 11) sapaan = "Selamat pagi, welcome";
  else if (jam >= 11 && jam < 15) sapaan = "Selamat siang, welcome";
  else if (jam >= 15 && jam < 18) sapaan = "Selamat sore, welcome";
  else sapaan = "Selamat malam, welcome";

  $("#welcomeGreeting").textContent = sapaan;
}

// =====================================================
// 6. FORMAT GAMBAR
// Jika gambar belum tersedia, tampilkan pengganti visual.
// =====================================================

function siapkanGambar(img, nama) {
  img.alt = nama;
  img.addEventListener("error", () => {
    if (img.dataset.fallbackUsed === "true") return;

    img.dataset.fallbackUsed = "true";
    img.removeAttribute("src");
    img.classList.add("image-missing");
    img.alt = `${nama} — file gambar belum tersedia`;
  }, { once: true });
}

// =====================================================
// 7. NOTIFIKASI TOAST
// Menampilkan pesan kecil setelah tindakan pengguna.
// =====================================================

function tampilkanToast(pesan) {
  toast.textContent = pesan;
  toast.classList.add("visible");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("visible");
  }, 2600);
}

// =====================================================
// 8. MEMBUAT KARTU PRODUK
// Setiap kartu mempunyai detail, favorit, dan pesan WA.
// =====================================================

function buatKartu(produk, indeks) {
  const isFavorit = favorit.includes(produk.id);

  const article = document.createElement("article");
  article.className = "product-card";
  article.style.animationDelay = `${Math.min(indeks * 65, 350)}ms`;

  const media = document.createElement("div");
  media.className = "product-media";

  const img = document.createElement("img");
  img.className = "product-image";
  img.src = produk.gambar;
  img.loading = "lazy";
  siapkanGambar(img, produk.nama);
  media.appendChild(img);

  const badge = document.createElement("span");
  badge.className = "product-badge";
  badge.textContent = `BUKET 0${produk.id}`;
  media.appendChild(badge);

  const favoriteButton = document.createElement("button");
  favoriteButton.type = "button";
  favoriteButton.className = `favorite-button${isFavorit ? " is-favorite" : ""}`;
  favoriteButton.textContent = isFavorit ? "♥" : "♡";
  favoriteButton.setAttribute("aria-label", isFavorit
    ? `Hapus ${produk.nama} dari favorit`
    : `Tambahkan ${produk.nama} ke favorit`);
  favoriteButton.setAttribute("aria-pressed", String(isFavorit));
  favoriteButton.addEventListener("click", () => ubahFavorit(produk.id));
  media.appendChild(favoriteButton);

  const detailButton = document.createElement("button");
  detailButton.type = "button";
  detailButton.className = "quick-view";
  detailButton.textContent = "Lihat detail ↗";
  detailButton.addEventListener("click", () => bukaDetail(produk.id));
  media.appendChild(detailButton);

  const info = document.createElement("div");
  info.className = "product-info";

  const titleRow = document.createElement("div");
  titleRow.className = "product-title-row";

  const title = document.createElement("h3");
  title.className = "product-title";
  title.textContent = produk.nama;

  const number = document.createElement("span");
  number.className = "product-number";
  number.textContent = `0${produk.id}`;

  titleRow.append(title, number);

  const description = document.createElement("p");
  description.className = "product-description";
  description.textContent = produk.deskripsi;

  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = "Harga: tanyakan kepada penjual";

  const actions = document.createElement("div");
  actions.className = "product-actions";

  const detailLink = document.createElement("button");
  detailLink.type = "button";
  detailLink.className = "button button-glass";
  detailLink.textContent = "Detail";
  detailLink.addEventListener("click", () => bukaDetail(produk.id));

  const orderLink = document.createElement("button");
  orderLink.type = "button";
  orderLink.className = "button button-light";
  orderLink.textContent = "Pesan via WA ↗";
  orderLink.addEventListener("click", () => pesanViaWhatsApp(produk));

  actions.append(detailLink, orderLink);
  info.append(titleRow, description, price, actions);
  article.append(media, info);

  return article;
}

// =====================================================
// 9. FILTER, PENCARIAN, DAN PENGURUTAN
// Menampilkan produk berdasarkan pilihan pengunjung.
// =====================================================

function dapatkanProdukTersaring() {
  const kataKunci = searchInput.value.trim().toLocaleLowerCase("id");

  let hasil = PRODUK.filter((produk) => {
    const cocokKata =
      produk.nama.toLocaleLowerCase("id").includes(kataKunci) ||
      produk.deskripsi.toLocaleLowerCase("id").includes(kataKunci);

    const cocokFilter =
      filterAktif === "all" ||
      (filterAktif === "buket" && produk.kategori === "buket") ||
      (filterAktif === "favorites" && favorit.includes(produk.id));

    return cocokKata && cocokFilter;
  });

  if (urutanAktif === "az") {
    hasil.sort((a, b) => a.nama.localeCompare(b.nama, "id"));
  } else if (urutanAktif === "za") {
    hasil.sort((a, b) => b.nama.localeCompare(a.nama, "id"));
  }

  return hasil;
}

function renderProduk() {
  const hasil = dapatkanProdukTersaring();

  productGrid.replaceChildren();
  resultCount.textContent = String(hasil.length);
  clearSearch.hidden = !searchInput.value;

  hasil.forEach((produk, indeks) => {
    productGrid.appendChild(buatKartu(produk, indeks));
  });

  emptyState.hidden = hasil.length !== 0;
  productGrid.hidden = hasil.length === 0;

  $("#favoriteCount").textContent = String(favorit.length);
  renderRiwayat();
}

function resetFilter() {
  filterAktif = "all";
  urutanAktif = "default";
  searchInput.value = "";
  $("#sortSelect").value = "default";

  $$(".filter-pill").forEach((tombol) => {
    tombol.classList.toggle("active", tombol.dataset.filter === "all");
  });

  renderProduk();
}

// =====================================================
// 10. FAVORIT
// Menambah atau menghapus produk dari daftar favorit.
// =====================================================

function ubahFavorit(id) {
  if (favorit.includes(id)) {
    favorit = favorit.filter((nomor) => nomor !== id);
    tampilkanToast("Produk dihapus dari favorit.");
  } else {
    favorit.push(id);
    tampilkanToast("Produk ditambahkan ke favorit.");
  }

  simpanPenyimpanan("beautyBukettFavorit", favorit);
  renderProduk();
}

$("#showFavorites").addEventListener("click", () => {
  filterAktif = "favorites";

  $$(".filter-pill").forEach((tombol) => {
    tombol.classList.toggle("active", tombol.dataset.filter === "favorites");
  });

  renderProduk();
  $("#koleksi").scrollIntoView({ behavior: "smooth" });
});

// =====================================================
// 11. RIWAYAT PRODUK
// Maksimal enam produk yang terakhir dilihat.
// =====================================================

function catatRiwayat(id) {
  riwayat = [id, ...riwayat.filter((nomor) => nomor !== id)].slice(0, 6);
  simpanPenyimpanan("beautyBukettRiwayat", riwayat);
  renderRiwayat();
}

function renderRiwayat() {
  const section = $("#recentSection");
  const list = $("#recentList");
  const daftar = riwayat
    .map((id) => PRODUK.find((produk) => produk.id === id))
    .filter(Boolean);

  list.replaceChildren();
  section.hidden = daftar.length === 0;

  daftar.forEach((produk) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recent-item";

    const img = document.createElement("img");
    img.src = produk.gambar;
    img.loading = "lazy";
    siapkanGambar(img, produk.nama);

    const title = document.createElement("strong");
    title.textContent = produk.nama;

    button.append(img, title);
    button.addEventListener("click", () => bukaDetail(produk.id));
    list.appendChild(button);
  });
}

// =====================================================
// 12. DETAIL PRODUK
// Detail memuat foto, deskripsi, dan tindakan WhatsApp.
// =====================================================

function bukaDetail(id) {
  const produk = PRODUK.find((item) => item.id === id);
  if (!produk) return;

  produkAktif = produk;
  catatRiwayat(id);

  detailContent.replaceChildren();

  const layout = document.createElement("div");
  layout.className = "detail-layout";

  const gallery = document.createElement("div");
  const mainImage = document.createElement("img");
  mainImage.className = "detail-main-image";
  mainImage.src = produk.gambar;
  siapkanGambar(mainImage, produk.nama);
  gallery.appendChild(mainImage);

  const thumbs = document.createElement("div");
  thumbs.className = "detail-thumbs";

  const thumb = document.createElement("button");
  thumb.type = "button";
  thumb.className = "detail-thumb active";
  thumb.setAttribute("aria-label", `Lihat foto ${produk.nama}`);

  const thumbImage = document.createElement("img");
  thumbImage.src = produk.gambar;
  thumbImage.loading = "lazy";
  siapkanGambar(thumbImage, produk.nama);
  thumb.appendChild(thumbImage);
  thumb.addEventListener("click", () => {
    mainImage.src = produk.gambar;
    siapkanGambar(mainImage, produk.nama);
  });
  thumbs.appendChild(thumb);
  gallery.appendChild(thumbs);

  const copy = document.createElement("div");
  copy.className = "detail-copy";

  const eyebrow = document.createElement("span");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = `KOLEKSI BUKET 0${produk.id}`;

  const title = document.createElement("h2");
  title.id = "detailName";
  title.textContent = produk.nama;

  const description = document.createElement("p");
  description.textContent = produk.deskripsi;

  const note = document.createElement("p");
  note.textContent =
    "Informasi jenis bunga, isi rangkaian, ukuran, dan ketersediaan belum dicantumkan. Silakan tanyakan langsung kepada penjual.";

  const price = document.createElement("div");
  price.className = "detail-price";
  price.textContent = "Harga: tanyakan kepada penjual";

  const actions = document.createElement("div");
  actions.className = "detail-actions";

  const orderButton = document.createElement("button");
  orderButton.type = "button";
  orderButton.className = "button button-light";
  orderButton.textContent = "Tanyakan & pesan via WhatsApp ↗";
  orderButton.addEventListener("click", () => pesanViaWhatsApp(produk));

  const favoriteButton = document.createElement("button");
  favoriteButton.type = "button";
  favoriteButton.className = "button button-glass";
  favoriteButton.textContent = favorit.includes(id)
    ? "♥ Hapus dari favorit"
    : "♡ Tambahkan ke favorit";

  favoriteButton.addEventListener("click", () => {
    ubahFavorit(id);
    favoriteButton.textContent = favorit.includes(id)
      ? "♥ Hapus dari favorit"
      : "♡ Tambahkan ke favorit";
  });

  actions.append(orderButton, favoriteButton);
  copy.append(eyebrow, title, description, note, price, actions);
  layout.append(gallery, copy);
  detailContent.appendChild(layout);

  detailBackdrop.hidden = false;
  document.body.classList.add("lock-scroll");
  $("#closeDetail").focus();
}

function tutupDetail() {
  detailBackdrop.hidden = true;
  document.body.classList.remove("lock-scroll");
  produkAktif = null;
}

$("#closeDetail").addEventListener("click", tutupDetail);

detailBackdrop.addEventListener("click", (event) => {
  if (event.target === detailBackdrop) tutupDetail();
});

// =====================================================
// 13. PESAN VIA WHATSAPP
// Tautan hanya dapat digunakan setelah nomor diganti.
// =====================================================

function nomorWhatsAppValid() {
  return /^\d{9,15}$/.test(NOMOR_WA) &&
    !NOMOR_WA.includes("x");
}

function buatPesanWhatsApp(teks) {
  if (!nomorWhatsAppValid()) {
    tampilkanToast("Nomor WhatsApp belum diatur. Isi NOMOR_WA di script.js.");
    return;
  }

  const url = `https://wa.me/${NOMOR_WA}?text=${encodeURIComponent(teks)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function pesanViaWhatsApp(produk) {
  const pesan = [
    "Halo Beauty Bukett Singosari, saya ingin bertanya tentang produk:",
    "",
    `Nama produk: ${produk.nama}`,
    `Kode katalog: 0${produk.id}`,
    `Harga: ingin ditanyakan`,
    "",
    "Mohon informasi harga dan ketersediaannya. Terima kasih."
  ].join("\n");

  buatPesanWhatsApp(pesan);
}

// =====================================================
// 14. TAUTAN KONTAK
// WhatsApp, Instagram, dan Maps memakai satu konfigurasi.
// =====================================================

function aturKontak() {
  $("#mapsLink").href = LINK_MAPS;

  const instagramValid =
    AKUN_INSTAGRAM !== "[akun-instagram]" &&
    AKUN_INSTAGRAM.trim().length > 0;

  if (instagramValid) {
    const username = AKUN_INSTAGRAM.replace(/^@/, "");
    $("#instagramLink").href =
      `https://www.instagram.com/${encodeURIComponent(username)}/`;
    $("#instagramLabel").textContent = `@${username}`;
  } else {
    $("#instagramLink").href = "https://www.instagram.com/";
    $("#instagramLabel").textContent = "Atur akun Instagram";
  }

  const bukaWhatsAppUmum = (event) => {
    event.preventDefault();
    buatPesanWhatsApp(
      "Halo Beauty Bukett Singosari, saya ingin bertanya tentang katalog buket bunga."
    );
  };

  $("#whatsappContact").addEventListener("click", bukaWhatsAppUmum);
  $("#floatingWA").addEventListener("click", (event) => {
    event.preventDefault();
    buatPesanWhatsApp(
      "Halo Beauty Bukett Singosari, saya ingin bertanya tentang buket bunga."
    );
  });
}

// =====================================================
// 15. PENCARIAN DAN FILTER
// Seluruh kontrol diperbarui tanpa memuat ulang halaman.
// =====================================================

searchInput.addEventListener("input", renderProduk);

clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  renderProduk();
  searchInput.focus();
});

$$(".filter-pill").forEach((tombol) => {
  tombol.addEventListener("click", () => {
    filterAktif = tombol.dataset.filter;

    $$(".filter-pill").forEach((item) => {
      item.classList.toggle("active", item === tombol);
    });

    renderProduk();
  });
});

$("#sortSelect").addEventListener("change", (event) => {
  urutanAktif = event.target.value;
  renderProduk();
});

$("#resetFilters").addEventListener("click", resetFilter);

$("#focusSearch").addEventListener("click", () => {
  $("#koleksi").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => searchInput.focus({ preventScroll: true }), 450);
});

$("#mobileSearch").addEventListener("click", () => {
  $("#koleksi").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => searchInput.focus({ preventScroll: true }), 450);
});

$("#clearRecent").addEventListener("click", () => {
  riwayat = [];
  simpanPenyimpanan("beautyBukettRiwayat", riwayat);
  renderRiwayat();
  tampilkanToast("Riwayat produk dibersihkan.");
});

// =====================================================
// 16. INDIKATOR PROGRES SCROLL
// Menampilkan seberapa jauh pengunjung menggulir halaman.
// =====================================================

function perbaruiProgres() {
  const root = document.documentElement;
  const jarak = root.scrollHeight - root.clientHeight;
  const progres = jarak > 0 ? (root.scrollTop / jarak) * 100 : 0;

  $("#scrollProgress").style.width = `${progres}%`;
}

window.addEventListener("scroll", perbaruiProgres, { passive: true });
window.addEventListener("resize", perbaruiProgres);

// =====================================================
// 17. TUTUP MODAL DENGAN TOMBOL ESCAPE
// Menambah kemudahan navigasi keyboard.
// =====================================================

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !detailBackdrop.hidden) {
    tutupDetail();
  }
});

// =====================================================
// 18. INISIALISASI WEBSITE
// Menjalankan pengaturan ketika halaman siap.
// =====================================================

function mulaiWebsite() {
  aturSapaan();
  aturKontak();
  renderProduk();
  perbaruiProgres();
}

mulaiWebsite();

// =====================================================
// APP.JS — 5 HALAMAN + 20 FITUR BARU BEAUTY BUKETT
// Dimuat SETELAH script.js dan features.js.
// File lama tidak diubah sama sekali: fitur di sini hanya
// membungkus (wrap) fungsi lama, persis seperti features.js.
//
// Daftar fitur baru:
//  1. Layar sapaan pembuka yang elegan (sekali per sesi)
//  2. Sapaan personal dengan nama pengunjung
//  3. Lima halaman (Beranda, Katalog, Tentang, Kontak, Layanan)
//     + transisi halaman & indikator tab "liquid lens"
//  4. Spotlight: cari buket, halaman, dan fitur (⌘K / Ctrl+K)
//  5. Notifikasi gaya Dynamic Island + animasi tutup modal yang halus
//  6. Menu cepat tekan-lama / klik kanan pada kartu produk
//  7. "Kejutkan aku" — buket acak dengan animasi mesin slot
//  8. Kuis pencari buket (3 pertanyaan → rekomendasi)
//  9. Studio kartu ucapan + unduh PNG
// 10. Pengingat momen penting + ekspor ke kalender (.ics)
// 11. Formulir kontak → WhatsApp dengan validasi
// 12. Kode QR WhatsApp
// 13. Jam operasional mingguan + hitung mundur buka/tutup
// 14. Simpan kontak (vCard) & salin nomor
// 15. FAQ dengan pencarian & sorotan kata
// 16. Kamus arti bunga (kartu balik)
// 17. Galeri + lightbox (zoom, geser, panah)
// 18. Pusat kontrol: warna aksen, ukuran teks, kurangi animasi
// 19. Efek kelopak bunga berjatuhan di Beranda
// 20. Tanyakan semua favorit sekaligus via WhatsApp
// =====================================================
(() => {
  "use strict";

  // ---------- KONFIGURASI (sesuaikan dengan data usaha) ----------
  // Jam operasional WIB. Indeks 0 = Minggu ... 6 = Sabtu. null = libur.
  // Samakan dengan JAM di features.js agar status di header konsisten.
  const JAM_OPERASIONAL = [[8, 21], [8, 21], [8, 21], [8, 21], [8, 21], [8, 21], [8, 21]];
  const TAHUN_BERDIRI = 2017;
  const NAMA_USAHA = "Beauty Bukett Singosari";
  const QR_LIB = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";

  // ---------- Utilitas ----------
  const doc = document, root = doc.documentElement;
  const q = (s, c = doc) => c.querySelector(s);
  const qa = (s, c = doc) => [...c.querySelectorAll(s)];
  const el = (html) => { const t = doc.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} }
  };
  const gerakDikurangi = () => root.dataset.motion === "reduce" || matchMedia("(prefers-reduced-motion: reduce)").matches;
  const getar = (ms = 10) => { try { navigator.userActivation?.hasBeenActive && navigator.vibrate?.(ms); } catch {} };
  const notif = (t) => (typeof tampilkanToast === "function" ? tampilkanToast(t) : null);
  const waValid = () => typeof nomorWhatsAppValid === "function" ? nomorWhatsAppValid() : /^\d{9,15}$/.test(NOMOR_WA);
  const salam = (j = new Date().getHours()) =>
    j >= 4 && j < 11 ? "Selamat pagi" : j >= 11 && j < 15 ? "Selamat siang" : j >= 15 && j < 18 ? "Selamat sore" : "Selamat malam";
  const namaTamu = () => String(store.get("bbNama", "") || "").trim();
  const produkById = (id) => PRODUK.find((p) => p.id === id);
  const tglIndo = (d, o = { day: "numeric", month: "long", year: "numeric" }) => new Intl.DateTimeFormat("id-ID", o).format(d);
  const unduhFile = (nama, isi, tipe) => {
    const url = URL.createObjectURL(isi instanceof Blob ? isi : new Blob([isi], { type: tipe }));
    const a = el(`<a hidden></a>`); a.href = url; a.download = nama; doc.body.append(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
  };
  const salin = (teks, pesan) => {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(teks).then(() => notif(pesan), () => notif(teks));
    else notif(teks);
  };
  const bagikanTautan = (judul, teks, url) => {
    if (navigator.share) navigator.share({ title: judul, text: teks, url }).catch(() => {});
    else salin(url, "Tautan disalin.");
  };

  const IK = {
    home: '<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
    chat: '<path d="M5 19l1.2-3.6A7.5 7.5 0 1 1 9 18.3z"/>',
    star: '<path d="M12 3l2.4 5.2L20 9l-4 4 1 5.6-5-2.8-5 2.8 1-5.6-4-4 5.6-.8z"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="15" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="9" cy="15" r="1"/>',
    card: '<rect x="3.5" y="5.5" width="17" height="13" rx="3"/><path d="m4 7 8 6 8-6"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    flower: '<circle cx="12" cy="12" r="2.4"/><path d="M12 9.6c-2.6-5.4 2.6-5.4 0 0M14.4 12c5.4-2.6 5.4 2.6 0 0M12 14.4c2.6 5.4-2.6 5.4 0 0M9.6 12c-5.4 2.6-5.4-2.6 0 0"/>',
    motion: '<path d="M3 12h3l2.5-6 4.5 12 2.5-6H21"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/>',
    bag: '<path d="M6 8h12l-1 12H7z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
    share: '<path d="M12 15V4M8 8l4-4 4 4"/><path d="M6 12v7h12v-7"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>',
    replay: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/>',
    question: '<circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>',
    phone: '<rect x="7" y="3" width="10" height="18" rx="3"/><path d="M11 18h2"/>',
    bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'
  };
  const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${IK[k] || ""}</svg>`;

  // =====================================================
  // SISTEM POP-UP (animasi pegas dari titik sentuhan)
  // =====================================================
  let titik = null;
  doc.addEventListener("pointerdown", (e) => (titik = { x: e.clientX, y: e.clientY, t: Date.now() }), true);
  const tumpukan = [];

  function bukaPop(isi, { kelas = "", label = "Dialog" } = {}) {
    const bd = el(`<div class="pop-bd ${kelas}"><div class="pop glass" role="dialog" aria-modal="true"></div></div>`);
    const pop = bd.firstElementChild;
    pop.setAttribute("aria-label", label);
    const x = el(`<button class="pop-x" type="button" aria-label="Tutup">×</button>`);
    pop.append(x, isi);
    const api = { bd, pop, onClose: null, kembali: doc.activeElement };
    api.tutup = () => tutupPop(api);
    x.onclick = api.tutup;
    bd.addEventListener("click", (e) => { if (e.target === bd) api.tutup(); });
    doc.body.append(bd);
    root.classList.add("pop-open");
    if (titik && Date.now() - titik.t < 1500 && !kelas.includes("spot")) {
      pop.style.transformOrigin = `${titik.x - pop.offsetLeft}px ${titik.y - pop.offsetTop}px`;
    }
    tumpukan.push(api);
    requestAnimationFrame(() => {
      const f = pop.querySelector("[data-fokus]") || x;
      f.focus({ preventScroll: true });
    });
    return api;
  }

  function tutupPop(api) {
    if (api.tertutup) return;
    api.tertutup = true;
    tumpukan.splice(tumpukan.indexOf(api), 1);
    api.bd.classList.add("out");
    api.onClose?.();
    setTimeout(() => { api.bd.remove(); if (!tumpukan.length) root.classList.remove("pop-open"); }, gerakDikurangi() ? 0 : 290);
    try { api.kembali?.focus?.({ preventScroll: true }); } catch {}
  }

  // =====================================================
  // FITUR 3 — ROUTER 5 HALAMAN + TRANSISI
  // =====================================================
  const RUTE = { beranda: "beranda", koleksi: "koleksi", katalog: "koleksi", tentang: "tentang", kontak: "kontak", layanan: "layanan" };
  const SLUG = { beranda: "beranda", koleksi: "katalog", tentang: "tentang", kontak: "kontak", layanan: "layanan" };
  let halaman = null;
  const sudahDibuka = new Set();

  function dariUrl() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    if (/^produk-\d+$/.test(h)) return "koleksi";
    return RUTE[h] || "beranda";
  }

  function ke(nama, { push = true, atas = true } = {}) {
    const target = RUTE[nama] || "beranda";
    const pindah = target !== halaman;
    if (pindah) {
      qa(".page").forEach((p) => {
        const on = p.dataset.page === target;
        p.hidden = !on;
        p.classList.remove("page-enter");
        if (on && halaman !== null && !gerakDikurangi()) { void p.offsetWidth; p.classList.add("page-enter"); }
      });
      if (halaman !== null) getar(8);
      halaman = target;
      const judul = q(`.page[data-page="${target}"]`)?.dataset.title || "Beranda";
      doc.title = `${judul} · ${NAMA_USAHA}`;
      tandaiNav();
      saatHalamanTampil(target);
    }
    if (atas) window.scrollTo({ top: 0, behavior: pindah ? "instant" : "smooth" });
    if (push) {
      const url = "#/" + SLUG[target];
      if (location.hash !== url) history.pushState(null, "", url);
    }
    if (typeof perbaruiProgres === "function") perbaruiProgres();
    aturKelopak();
  }

  function gulirKe(sel) {
    const t = q(sel);
    if (t) requestAnimationFrame(() => t.scrollIntoView({ behavior: gerakDikurangi() ? "auto" : "smooth", block: "start" }));
  }

  function pergi(nama, sel) { ke(nama); if (sel) setTimeout(() => gulirKe(sel), 60); }

  // Tautan "#koleksi", "#tentang", dst. menjadi perpindahan halaman
  doc.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    if (a.id === "whatsappContact" || a.id === "floatingWA") return; // ditangani script.js
    const h = a.getAttribute("href").slice(1).replace(/^\//, "");
    if (a.hasAttribute("data-jump")) { e.preventDefault(); gulirKe("#" + h); return; }
    if (a.classList.contains("back-top")) { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (h in RUTE) { e.preventDefault(); ke(h); }
  }, true);

  // Tombol lama yang menggulir ke katalog: tampilkan halaman katalog dulu
  doc.addEventListener("click", (e) => {
    if (e.target.closest("#focusSearch, #mobileSearch, #showFavorites") && halaman !== "koleksi") ke("koleksi");
  }, true);

  addEventListener("popstate", () => ke(dariUrl(), { push: false }));

  // Indikator tab "liquid lens"
  const navs = qa(".desktop-nav, .mobile-nav");
  navs.forEach((n) => { n.prepend(el(`<span class="nav-lens" aria-hidden="true"></span>`)); });
  q(".desktop-nav")?.classList.add("has-lens");

  function tandaiNav() {
    navs.forEach((n) => {
      let aktif = null;
      qa("a", n).forEach((a) => {
        const on = RUTE[a.getAttribute("href").slice(1)] === halaman;
        a.classList.toggle("is-active", on);
        on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
        if (on) aktif = a;
      });
      geserLensa(n, aktif);
    });
  }

  function geserLensa(n, a) {
    const lens = q(".nav-lens", n);
    if (!lens) return;
    if (!a || !a.offsetWidth) { lens.style.opacity = "0"; return; }
    const awal = lens.style.opacity === "1";
    lens.style.opacity = "1";
    lens.style.width = a.offsetWidth + "px";
    lens.style.height = a.offsetHeight + "px";
    lens.style.transform = `translate(${a.offsetLeft}px, ${a.offsetTop}px)`;
    if (awal) { lens.classList.remove("squish"); void lens.offsetWidth; lens.classList.add("squish"); }
  }
  addEventListener("resize", () => navs.forEach((n) => geserLensa(n, q("a.is-active", n))));
  doc.fonts?.ready.then(() => navs.forEach((n) => geserLensa(n, q("a.is-active", n))));

  // Header mengecil halus saat digulir
  const header = q(".site-header");
  addEventListener("scroll", () => header?.classList.toggle("compact", scrollY > 40), { passive: true });

  // Inisialisasi isi yang hanya perlu dimuat saat halamannya dibuka
  function saatHalamanTampil(h) {
    if (sudahDibuka.has(h)) return;
    sudahDibuka.add(h);
    if (h === "kontak") { muatPeta(); buatQR(); }
    if (h === "tentang") jalankanStatistik();
  }

  // =====================================================
  // FITUR 5 — Animasi tutup modal detail + transisi antar produk
  // =====================================================
  let menutup = false;
  const _tutupDetail = tutupDetail;
  tutupDetail = () => {
    if (detailBackdrop.hidden || menutup) return;
    menutup = true;
    detailBackdrop.classList.add("closing");
    setTimeout(() => {
      detailBackdrop.classList.remove("closing");
      menutup = false;
      _tutupDetail();
      history.replaceState(null, "", "#/" + SLUG[halaman || "beranda"]);
    }, gerakDikurangi() ? 0 : 300);
  };

  const _bukaDetail = bukaDetail;
  bukaDetail = (id) => {
    const sebelumnya = !detailBackdrop.hidden && produkAktif ? produkAktif.id : null;
    _bukaDetail(id);
    if (sebelumnya && sebelumnya !== id && !gerakDikurangi()) {
      const iA = PRODUK.findIndex((p) => p.id === sebelumnya), iB = PRODUK.findIndex((p) => p.id === id);
      detailContent.style.setProperty("--swap-x", (iB > iA ? 24 : -24) + "px");
      detailContent.classList.remove("swap"); void detailContent.offsetWidth; detailContent.classList.add("swap");
    }
  };

  // =====================================================
  // FITUR 1 & 2 — SAPAAN PEMBUKA + NAMA PENGUNJUNG
  // =====================================================
  function hurufAnimasi(target, teks, nama) {
    target.replaceChildren();
    let i = 0;
    const tulis = (str, kelas = "") => [...str].forEach((c) => {
      const s = doc.createElement("span");
      s.className = "ch" + (c === " " ? " sp" : "") + (kelas ? " " + kelas : "");
      s.style.setProperty("--i", i++);
      s.textContent = c === " " ? " " : c;
      target.append(s);
    });
    tulis(teks);
    if (nama) { tulis(", "); tulis(nama, "nm"); }
    target.setAttribute("aria-label", nama ? `${teks}, ${nama}` : teks);
  }

  function sapaHero() {
    const g = q("#welcomeGreeting");
    if (!g) return;
    const n = namaTamu();
    if (n) g.textContent = `${salam()}, ${n} ✿`;
    else if (typeof aturSapaan === "function") aturSapaan();
  }

  function masukSitus() {
    doc.body.classList.add("entered");
    setTimeout(ingatkanMomenDekat, 1600);
  }

  function intro() {
    const box = q("#intro");
    if (!box || !root.classList.contains("intro-on")) { box?.remove(); masukSitus(); return; }
    box.classList.add("js"); // matikan pengaman CSS: JS sudah mengendalikan intro
    const now = new Date();
    const jam = String(now.getHours()).padStart(2, "0") + "." + String(now.getMinutes()).padStart(2, "0");
    q("#introTime").textContent = `${tglIndo(now, { weekday: "long", day: "numeric", month: "long" })} · ${jam}`;
    const n = namaTamu();
    hurufAnimasi(q("#introGreet"), salam(), n);
    q("#introSub").textContent = n ? "Senang melihatmu kembali di Beauty Bukett." : "Selamat datang di Beauty Bukett Singosari";

    let selesai = false, autoTimer;
    const keluar = () => {
      if (selesai) return;
      selesai = true;
      clearTimeout(autoTimer);
      try { sessionStorage.setItem("bbIntro", "1"); } catch {}
      box.classList.add("leaving");
      setTimeout(masukSitus, gerakDikurangi() ? 0 : 320);
      setTimeout(() => { root.classList.remove("intro-on"); root.classList.add("no-intro"); box.remove(); }, gerakDikurangi() ? 0 : 1000);
    };
    const otomatis = (ms) => {
      box.style.setProperty("--dur", ms + "ms");
      box.classList.add("auto");
      autoTimer = setTimeout(keluar, ms);
    };

    const tanyaNama = !n && !store.get("bbNamaDitanya", false);
    if (tanyaNama) {
      setTimeout(() => {
        if (selesai) return;
        const f = q("#introName");
        f.hidden = false;
        if (matchMedia("(hover: hover)").matches) q("#introInput").focus({ preventScroll: true });
      }, gerakDikurangi() ? 0 : 1650);
      q("#introName").addEventListener("submit", (e) => {
        e.preventDefault();
        const v = q("#introInput").value.trim().slice(0, 24);
        store.set("bbNamaDitanya", true);
        if (v) { store.set("bbNama", v); sapaHero(); }
        keluar();
        if (v) setTimeout(() => notif(`Halo, ${v}! Selamat menjelajah ✿`), 1300);
      });
    } else {
      otomatis(gerakDikurangi() ? 900 : 3000);
      box.addEventListener("click", (e) => { if (!e.target.closest("form")) keluar(); });
    }
    q("#introSkip").addEventListener("click", (e) => { e.stopPropagation(); if (tanyaNama) store.set("bbNamaDitanya", true); keluar(); });
    addEventListener("keydown", function k(e) {
      if (selesai) { removeEventListener("keydown", k); return; }
      if (e.key === "Escape" || (e.key === "Enter" && !tanyaNama)) { keluar(); }
    });
  }

  // =====================================================
  // FITUR 4 — SPOTLIGHT (⌘K / Ctrl+K)
  // =====================================================
  let spotAktif = null;

  function daftarSpotlight() {
    const hal = [
      ["Beranda", "Halaman utama", "home", "beranda"],
      ["Katalog", "Semua buket", "grid", "koleksi"],
      ["Tentang", "Cerita Beauty Bukett", "info", "tentang"],
      ["Kontak", "WhatsApp, jam buka, peta", "chat", "kontak"],
      ["Layanan", "Cara pesan, kuis, kartu, FAQ", "star", "layanan"]
    ].map(([t, s, ic, h]) => ({ g: "Halaman", t, s, ic, kw: h, run: () => ke(h) }));
    const prod = PRODUK.map((p) => ({ g: "Buket", t: p.nama, s: (p.tag || []).join(" · "), img: p.gambar, kw: p.deskripsi, run: () => bukaDetail(p.id) }));
    const temaBtn = q('.header-actions button[aria-label="Ganti tema"]');
    const aksi = [
      { t: "Kejutkan aku", s: "Pilihkan buket acak", ic: "dice", kw: "acak random", run: kejutan },
      { t: "Kuis cari buket", s: "3 pertanyaan singkat", ic: "star", kw: "rekomendasi", run: () => pergi("layanan", "#kuis") },
      { t: "Desain kartu ucapan", s: "Tulis & unduh PNG", ic: "card", kw: "ucapan greeting", run: () => pergi("layanan", "#kartu") },
      { t: "Pengingat momen", s: "Ulang tahun, anniversary", ic: "cal", kw: "kalender tanggal", run: () => pergi("layanan", "#momen") },
      { t: "Pesan custom", s: "Kirim detail via WhatsApp", ic: "chat", kw: "custom order", run: bukaCustom },
      { t: "Keranjang tanya", s: "Tanya beberapa buket sekaligus", ic: "bag", kw: "cart", run: () => q('.header-actions button[aria-label="Keranjang tanya"]')?.click() },
      { t: "Tampilkan favorit", s: "Buket yang kamu simpan", ic: "heart", kw: "suka", run: () => q("#showFavorites")?.click() },
      { t: "Ganti mode terang/gelap", s: "Tema tampilan", ic: root.dataset.theme === "light" ? "moon" : "sun", kw: "tema dark light", run: () => temaBtn?.click() },
      { t: "Pusat kontrol", s: "Warna aksen, ukuran teks, animasi", ic: "motion", kw: "pengaturan setting", run: bukaControl },
      { t: "Pertanyaan umum (FAQ)", s: "Jawaban cepat", ic: "question", kw: "bantuan", run: () => pergi("layanan", "#faq") },
      { t: "Chat WhatsApp", s: "Tanya langsung ke penjual", ic: "phone", kw: "hubungi wa", run: () => buatPesanWhatsApp("Halo Beauty Bukett Singosari, saya ingin bertanya tentang buket bunga.") }
    ].map((a) => ({ g: "Aksi", ...a }));
    return [...hal, ...prod, ...aksi];
  }

  function bukaSpotlight() {
    if (spotAktif) return spotAktif.tutup();
    const semua = daftarSpotlight();
    const isi = el(`<div>
      <div class="spot-field">${svg("search")}<input data-fokus type="search" placeholder="Cari buket, halaman, atau fitur" aria-label="Spotlight" autocomplete="off"><kbd>esc</kbd></div>
      <div class="spot-list" role="listbox"></div></div>`);
    const api = bukaPop(isi, { kelas: "spot", label: "Spotlight" });
    spotAktif = api;
    api.onClose = () => (spotAktif = null);
    const input = q("input", isi), list = q(".spot-list", isi);
    let hasil = [], sel = 0;

    const render = () => {
      const kata = input.value.trim().toLocaleLowerCase("id").split(/\s+/).filter(Boolean);
      hasil = semua.filter((it) => {
        const teks = `${it.t} ${it.s} ${it.kw || ""} ${it.g}`.toLocaleLowerCase("id");
        return kata.every((k) => teks.includes(k));
      });
      sel = Math.min(sel, Math.max(0, hasil.length - 1));
      list.replaceChildren();
      if (!hasil.length) { list.append(el(`<div class="spot-empty">Tidak ada hasil untuk “${esc(input.value)}”.</div>`)); return; }
      let grup = "";
      hasil.forEach((it, i) => {
        if (it.g !== grup) { grup = it.g; list.append(el(`<div class="spot-group">${grup.toUpperCase()}</div>`)); }
        const b = el(`<button type="button" class="spot-item" role="option">
          ${it.img ? `<img src="${esc(it.img)}" alt="">` : `<span class="si-ic">${svg(it.ic)}</span>`}
          <span><strong>${esc(it.t)}</strong><small>${esc(it.s)}</small></span><span class="si-go">↵</span></button>`);
        b.classList.toggle("sel", i === sel);
        b.setAttribute("aria-selected", String(i === sel));
        b.onmouseenter = () => { sel = i; tandai(); };
        b.onclick = () => jalankan(i);
        list.append(b);
      });
    };
    const tandai = () => qa(".spot-item", list).forEach((b, i) => {
      b.classList.toggle("sel", i === sel);
      b.setAttribute("aria-selected", String(i === sel));
      if (i === sel) b.scrollIntoView({ block: "nearest" });
    });
    const jalankan = (i) => { const it = hasil[i]; if (!it) return; api.tutup(); setTimeout(it.run, 60); };

    input.addEventListener("input", () => { sel = 0; render(); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); e.stopPropagation(); sel = (sel + 1) % Math.max(1, hasil.length); tandai(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); e.stopPropagation(); sel = (sel - 1 + hasil.length) % Math.max(1, hasil.length); tandai(); }
      else if (e.key === "Enter") { e.preventDefault(); jalankan(sel); }
    });
    render();
  }

  // =====================================================
  // FITUR 6 — MENU TEKAN-LAMA / KLIK KANAN PADA KARTU
  // =====================================================
  let ctxAktif = null;
  const idKartu = (c) => +c.querySelector(".product-number")?.textContent;
  const cariKartu = (id) => qa(".product-card").find((c) => idKartu(c) === id);

  function bagikanProduk(p) {
    const url = location.href.split("#")[0] + `#produk-${p.id}`;
    bagikanTautan(p.nama, `Lihat ${p.nama} dari Beauty Bukett`, url);
  }

  function bukaCtx(card) {
    if (ctxAktif) return;
    const id = idKartu(card), p = produkById(id);
    if (!p) return;
    getar(14);
    const fav = favorit.includes(id);
    const diCart = card.querySelector(".cart-add")?.classList.contains("in");
    const bd = el(`<div class="ctx-bd" role="dialog" aria-modal="true">
      <div class="ctx-preview"><img alt=""><div><strong></strong></div></div>
      <div class="ctx-menu glass" role="menu"></div></div>`);
    bd.setAttribute("aria-label", `Menu cepat ${p.nama}`);
    q("img", bd).src = p.gambar;
    q("strong", bd).textContent = p.nama;
    const menu = q(".ctx-menu", bd);
    const item = [
      ["Lihat detail", "eye", () => bukaDetail(id)],
      [fav ? "Hapus dari favorit" : "Tambah ke favorit", "heart", () => ubahFavorit(id)],
      [diCart ? "Keluarkan dari keranjang" : "Masukkan ke keranjang", "bag", () => cariKartu(id)?.querySelector(".cart-add")?.click()],
      ["Bagikan", "share", () => bagikanProduk(p)],
      ["Tanya via WhatsApp", "chat", () => pesanViaWhatsApp(p)]
    ];
    item.forEach(([t, ic, fn]) => {
      const b = el(`<button type="button" role="menuitem"><span>${esc(t)}</span>${svg(ic)}</button>`);
      b.onclick = () => { tutupCtx(); setTimeout(fn, 120); };
      menu.append(b);
    });
    const tutupCtx = () => {
      if (!ctxAktif) return;
      ctxAktif = null;
      bd.classList.add("out");
      setTimeout(() => bd.remove(), gerakDikurangi() ? 0 : 260);
    };
    bd.addEventListener("click", (e) => { if (e.target === bd) tutupCtx(); });
    ctxAktif = { tutup: tutupCtx };
    const r0 = card.querySelector(".product-media").getBoundingClientRect();
    doc.body.append(bd);
    const prev = q(".ctx-preview", bd), r1 = prev.getBoundingClientRect();
    if (!gerakDikurangi() && prev.animate) {
      prev.style.transformOrigin = "0 0";
      prev.animate([
        { transform: `translate(${r0.left - r1.left}px, ${r0.top - r1.top}px) scale(${r0.width / r1.width})`, opacity: .6 },
        { transform: "none", opacity: 1 }
      ], { duration: 560, easing: "cubic-bezier(.2,1.25,.3,1)" });
    }
    q("button", menu).focus({ preventScroll: true });
  }

  let lpTimer = null, lpAwal = null, lpJalan = false, lpKartu = null;
  const batalLp = () => { clearTimeout(lpTimer); lpTimer = null; lpKartu?.classList.remove("pressing"); };
  productGrid.addEventListener("touchstart", (e) => {
    const c = e.target.closest(".product-card");
    if (!c || e.touches.length > 1 || e.target.closest("button")) return;
    lpJalan = false; lpKartu = c;
    lpAwal = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    lpTimer = setTimeout(() => { c.classList.add("pressing"); lpTimer = setTimeout(() => { lpJalan = true; batalLp(); bukaCtx(c); }, 330); }, 150);
  }, { passive: true });
  productGrid.addEventListener("touchmove", (e) => {
    if (!lpTimer || !lpAwal) return;
    const t = e.touches[0];
    if (Math.hypot(t.clientX - lpAwal.x, t.clientY - lpAwal.y) > 10) batalLp();
  }, { passive: true });
  productGrid.addEventListener("touchend", (e) => { batalLp(); if (lpJalan) e.preventDefault(); });
  productGrid.addEventListener("touchcancel", batalLp);
  productGrid.addEventListener("contextmenu", (e) => {
    const c = e.target.closest(".product-card");
    if (!c) return;
    e.preventDefault();
    batalLp();
    bukaCtx(c);
  });

  // =====================================================
  // FITUR 7 — KEJUTKAN AKU (buket acak, animasi slot)
  // =====================================================
  let terakhirAcak = null;
  function kejutan() {
    PRODUK.forEach((p) => { const i = new Image(); i.src = p.gambar; });
    const isi = el(`<div><h3>Kejutkan aku</h3><p class="pop-sub">Biar kami yang memilihkan buket untukmu hari ini.</p>
      <div class="slot"><img alt=""></div><p class="slot-name" aria-live="polite">…</p>
      <div class="pop-actions"><button class="button button-glass" type="button" data-a="ulang">Acak lagi</button>
      <button class="button button-light" type="button" data-a="lihat" data-fokus>Lihat detail</button></div></div>`);
    const api = bukaPop(isi, { label: "Kejutkan aku" });
    const slot = q(".slot", isi), img = q("img", slot), nama = q(".slot-name", isi);
    let timer = null, hasil = null;
    const putar = () => {
      clearTimeout(timer);
      const calon = PRODUK.filter((p) => p.id !== terakhirAcak);
      const akhir = calon[Math.floor(Math.random() * calon.length)];
      terakhirAcak = akhir.id; hasil = null;
      slot.classList.add("spinning"); slot.classList.remove("landed");
      nama.textContent = "Mengacak…";
      const total = gerakDikurangi() ? 1 : 16;
      let n = 0;
      const langkah = () => {
        n++;
        const p = n >= total ? akhir : PRODUK[(n + akhir.id) % PRODUK.length];
        img.src = p.gambar; img.alt = p.nama;
        if (n < total) timer = setTimeout(langkah, 45 + n * n * 1.5);
        else { slot.classList.remove("spinning"); slot.classList.add("landed"); nama.textContent = akhir.nama; hasil = akhir; getar(18); }
      };
      langkah();
    };
    q('[data-a="ulang"]', isi).onclick = putar;
    q('[data-a="lihat"]', isi).onclick = () => { if (!hasil) return; const id = hasil.id; api.tutup(); setTimeout(() => bukaDetail(id), 200); };
    api.onClose = () => clearTimeout(timer);
    putar();
  }

  function bukaCustom() {
    q('.header-actions button[aria-label="Keranjang tanya"]')?.click();
    q('.sheet .seg button[data-p="1"]')?.click();
  }

  // =====================================================
  // FITUR 18 — PUSAT KONTROL (aksen, teks, animasi, dll.)
  // =====================================================
  const AKSEN = [
    ["", "Bawaan", "linear-gradient(135deg,#ffb3d6,#d3b8ff)"],
    ["rose", "Rose", "#ffb3d6"], ["lavender", "Lavender", "#cbb5ff"],
    ["sky", "Langit", "#9fd8ff"], ["mint", "Mint", "#9ef0c9"], ["gold", "Emas", "#ffd79a"]
  ];

  function bukaControl() {
    const isi = el(`<div><h3>Pusat kontrol</h3><p class="pop-sub">Atur tampilan sesuai seleramu. Tersimpan di perangkat ini.</p><div class="cc-grid"></div></div>`);
    const api = bukaPop(isi, { kelas: "cc", label: "Pusat kontrol" });
    const grid = q(".cc-grid", isi);
    const temaBtn = q('.header-actions button[aria-label="Ganti tema"]');

    const tile = (kelas, html, fn) => { const b = el(`<button type="button" class="cc-tile ${kelas}">${html}</button>`); b.onclick = () => fn(b); grid.append(b); return b; };
    const toggleTile = (judul, ic, get, set) => {
      const b = tile("wide", "", () => { set(!get()); draw(); });
      const draw = () => { b.classList.toggle("on", get()); b.setAttribute("aria-pressed", String(get())); b.innerHTML = `${svg(typeof ic === "function" ? ic() : ic)}<strong>${judul()}<small>${get() ? "Aktif" : "Nonaktif"}</small></strong>`; };
      draw();
    };

    toggleTile(() => (root.dataset.theme === "light" ? "Mode terang" : "Mode gelap"), () => (root.dataset.theme === "light" ? "sun" : "moon"),
      () => root.dataset.theme !== "light", () => temaBtn?.click());
    toggleTile(() => "Kelopak bunga", "flower", () => store.get("bbKelopak", true), (v) => { store.set("bbKelopak", v); aturKelopak(); });
    tile("round", `${svg("search")}<strong>Cari</strong>`, () => { api.tutup(); setTimeout(bukaSpotlight, 80); });
    tile("round", `${svg("dice")}<strong>Acak</strong>`, () => { api.tutup(); setTimeout(kejutan, 80); });
    tile("round", `${svg("bag")}<strong>Keranjang</strong>`, () => { api.tutup(); q('.header-actions button[aria-label="Keranjang tanya"]')?.click(); });
    tile("round", `${svg("share")}<strong>Bagikan</strong>`, () => bagikanTautan(NAMA_USAHA, "Katalog buket bunga Beauty Bukett Singosari", location.href.split("#")[0]));
    toggleTile(() => "Kurangi animasi", "motion", () => root.dataset.motion === "reduce", (v) => {
      v ? (root.dataset.motion = "reduce") : delete root.dataset.motion;
      store.set("bbGerak", v ? "reduce" : null); aturKelopak();
    });
    tile("wide", `${svg("replay")}<strong>Putar sapaan<small>Lihat layar pembuka lagi</small></strong>`, () => {
      try { sessionStorage.removeItem("bbIntro"); } catch {}
      location.reload();
    });

    const aksen = el(`<div class="cc-section"><small>WARNA AKSEN</small><div class="cc-swatches"></div></div>`);
    AKSEN.forEach(([v, nama, warna]) => {
      const b = el(`<button type="button" aria-label="${nama}" title="${nama}"></button>`);
      b.style.background = warna;
      b.classList.toggle("on", (root.dataset.accent || "") === v);
      b.onclick = () => {
        v ? (root.dataset.accent = v) : delete root.dataset.accent;
        store.set("bbAksen", v || null);
        qa("button", aksen).forEach((x) => x.classList.toggle("on", x === b));
      };
      q(".cc-swatches", aksen).append(b);
    });
    grid.append(aksen);

    const teks = el(`<div class="cc-section"><small>UKURAN TEKS</small><div class="cc-seg">
      <button type="button" data-t="s" style="font-size:.75rem">A</button><button type="button" data-t="" style="font-size:.9rem">A</button><button type="button" data-t="l" style="font-size:1.1rem">A</button></div></div>`);
    qa("button", teks).forEach((b) => {
      b.classList.toggle("on", (root.dataset.text || "") === b.dataset.t);
      b.setAttribute("aria-label", { s: "Teks kecil", "": "Teks normal", l: "Teks besar" }[b.dataset.t]);
      b.onclick = () => {
        b.dataset.t ? (root.dataset.text = b.dataset.t) : delete root.dataset.text;
        store.set("bbTeks", b.dataset.t || null);
        qa("button", teks).forEach((x) => x.classList.toggle("on", x === b));
        navs.forEach((n) => geserLensa(n, q("a.is-active", n)));
      };
    });
    grid.append(teks);

    const nama = el(`<form class="cc-section"><small>NAMA SAPAAN</small><div class="cc-name"><input maxlength="24" placeholder="Nama panggilan" aria-label="Nama panggilan"><button type="submit">Simpan</button></div></form>`);
    q("input", nama).value = namaTamu();
    nama.onsubmit = (e) => {
      e.preventDefault();
      const v = q("input", nama).value.trim().slice(0, 24);
      v ? store.set("bbNama", v) : store.del("bbNama");
      store.set("bbNamaDitanya", true);
      sapaHero();
      notif(v ? `Siap, ${v}! Sapaanmu sudah diperbarui.` : "Nama sapaan dihapus.");
    };
    grid.append(nama);
  }

  // =====================================================
  // FITUR 20 — TANYAKAN SEMUA FAVORIT VIA WA
  // =====================================================
  const favAsk = el(`<div class="fav-ask glass" id="favAsk" hidden><span></span><button class="button button-light" type="button">Tanyakan semua via WA ↗</button></div>`);
  productGrid.before(favAsk);
  q("button", favAsk).onclick = () => {
    const daftar = favorit.map(produkById).filter(Boolean);
    if (!daftar.length) return;
    buatPesanWhatsApp(["Halo Beauty Bukett Singosari, saya tertarik dengan buket favorit saya:", "",
      ...daftar.map((p, i) => `${i + 1}. ${p.nama} (kode 0${p.id})`), "", "Mohon info harga dan ketersediaannya. Terima kasih."].join("\n"));
  };
  function perbaruiFavAsk() {
    const n = favorit.filter((id) => produkById(id)).length;
    favAsk.hidden = n === 0;
    q("span", favAsk).textContent = `♥ ${n} buket favorit tersimpan`;
  }
  const _render = renderProduk;
  renderProduk = () => { _render(); perbaruiFavAsk(); };

  // =====================================================
  // BERANDA: aksi cepat, sorotan, galeri (FITUR 17)
  // =====================================================
  const AKSI_CEPAT = {
    quiz: () => pergi("layanan", "#kuis"),
    surprise: kejutan,
    card: () => pergi("layanan", "#kartu"),
    custom: bukaCustom
  };
  qa(".quick-tile").forEach((b) => (b.onclick = () => AKSI_CEPAT[b.dataset.act]?.()));
  q("#heroSpotlight")?.addEventListener("click", bukaSpotlight);
  q("#openControl")?.addEventListener("click", bukaControl);
  qa("[data-open-control]").forEach((b) => b.addEventListener("click", bukaControl));
  const metaK = q("#metaKoleksi"); if (metaK) metaK.textContent = PRODUK.length;

  const rail = q("#homeRail");
  if (rail) {
    PRODUK.forEach((p) => {
      const b = el(`<button class="rail-card" type="button"><img alt="" loading="lazy"><span class="rc-num">BUKET 0${p.id}</span><span class="rc-glass"><strong></strong><small></small></span></button>`);
      q("img", b).src = p.gambar; q("img", b).alt = p.nama;
      q("strong", b).textContent = p.nama;
      q("small", b).textContent = (p.tag || []).join(" · ") || "Buket";
      b.onclick = () => bukaDetail(p.id);
      rail.append(b);
    });
    qa("[data-rail]").forEach((b) => (b.onclick = () => {
      const w = (rail.firstElementChild?.offsetWidth || 260) + 16;
      rail.scrollBy({ left: +b.dataset.rail * w, behavior: gerakDikurangi() ? "auto" : "smooth" });
    }));
  }

  const GALERI = [
    { src: "img/foto-utama.jpeg", t: "Beauty Bukett", s: "Singosari" },
    ...PRODUK.map((p) => ({ src: p.gambar, t: p.nama, s: `Buket 0${p.id}` }))
  ];
  const galeri = q("#galleryGrid");
  if (galeri) {
    GALERI.forEach((g, i) => {
      const b = el(`<button class="gallery-item ${i % 3 === 0 ? "tall" : i % 3 === 2 ? "wide" : ""}" type="button"><img alt="" loading="lazy"></button>`);
      q("img", b).src = g.src; q("img", b).alt = g.t;
      b.setAttribute("aria-label", `Perbesar foto ${g.t}`);
      b.onclick = () => bukaGaleri(i);
      galeri.append(b);
    });
  }

  let glbAktif = null;
  function bukaGaleri(indeks) {
    let i = indeks;
    const bd = el(`<div class="glb" role="dialog" aria-modal="true" aria-label="Galeri foto">
      <img class="glb-img" alt=""><button class="glb-x" type="button" aria-label="Tutup">×</button>
      <div class="glb-ui"><button type="button" data-d="-1" aria-label="Foto sebelumnya">‹</button>
      <div class="glb-cap" aria-live="polite"><span></span><small></small></div>
      <button type="button" data-d="1" aria-label="Foto berikutnya">›</button></div></div>`);
    const img = q(".glb-img", bd);
    const thumb = (n) => qa(".gallery-item img")[n];
    const isi = (n) => {
      const g = GALERI[n];
      img.src = g.src; img.alt = g.t;
      q(".glb-cap span", bd).textContent = g.t;
      q(".glb-cap small", bd).textContent = `${g.s} · ${n + 1}/${GALERI.length}`;
    };
    const flip = (dari, balik = false) => {
      if (!dari || gerakDikurangi() || !img.animate) return null;
      const a = dari.getBoundingClientRect(), b = img.getBoundingClientRect();
      if (!a.width || !b.width) return null;
      const t = `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(${a.width / b.width})`;
      const k = [{ transform: t, borderRadius: "40px" }, { transform: "none", borderRadius: "26px" }];
      return img.animate(balik ? k.reverse() : k, { duration: balik ? 380 : 620, easing: balik ? "cubic-bezier(.4,0,.2,1)" : "cubic-bezier(.2,1.2,.3,1)", fill: "forwards" });
    };
    isi(i);
    doc.body.append(bd);
    root.classList.add("pop-open");
    (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => { bd.classList.add("open"); flip(thumb(i)); });

    const geser = (d) => {
      i = (i + d + GALERI.length) % GALERI.length;
      if (gerakDikurangi() || !img.animate) return isi(i);
      img.animate([{ transform: "none", opacity: 1 }, { transform: `translateX(${-d * 50}px) scale(.96)`, opacity: 0 }], { duration: 180, easing: "ease-in", fill: "forwards" })
        .finished.then(() => {
          isi(i);
          img.animate([{ transform: `translateX(${d * 50}px) scale(.96)`, opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 420, easing: "cubic-bezier(.2,1.2,.3,1)", fill: "forwards" });
        });
    };
    const tutup = () => {
      if (!glbAktif) return;
      glbAktif = null;
      bd.classList.remove("open");
      const t = thumb(i), r = t?.getBoundingClientRect();
      const terlihat = r && r.bottom > 0 && r.top < innerHeight;
      const an = terlihat ? flip(t, true) : null;
      if (!an) img.style.cssText += ";transition:opacity .3s,transform .3s;opacity:0;transform:scale(.9)";
      setTimeout(() => { bd.remove(); if (!tumpukan.length) root.classList.remove("pop-open"); }, gerakDikurangi() ? 0 : 400);
    };
    glbAktif = { tutup, geser };
    qa("[data-d]", bd).forEach((b) => (b.onclick = (e) => { e.stopPropagation(); geser(+b.dataset.d); }));
    q(".glb-x", bd).onclick = tutup;
    bd.addEventListener("click", (e) => { if (e.target === bd) tutup(); });
    let sx = 0, sy = 0;
    bd.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    bd.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) geser(dx < 0 ? 1 : -1);
      else if (dy > 90) tutup();
    }, { passive: true });
    q(".glb-x", bd).focus({ preventScroll: true });
  }

  // =====================================================
  // TENTANG: statistik + FITUR 16 arti bunga
  // =====================================================
  const sTahun = q("#statTahun"), sKol = q("#statKoleksi"), sTipe = q("#statTipe");
  if (sTahun) sTahun.dataset.count = Math.max(1, new Date().getFullYear() - TAHUN_BERDIRI);
  if (sKol) sKol.dataset.count = PRODUK.length;
  if (sTipe) sTipe.dataset.count = new Set(PRODUK.flatMap((p) => p.tag || [])).size;

  function jalankanStatistik() {
    const angka = qa("#statsGrid [data-count]");
    const hitung = (b) => {
      const akhir = +b.dataset.count, awal = b.dataset.plain ? akhir - 17 : 0;
      if (gerakDikurangi()) { b.textContent = akhir; return; }
      const t0 = performance.now(), dur = 1400;
      const f = (t) => {
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
        b.textContent = Math.round(awal + (akhir - awal) * e);
        if (k < 1) requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    };
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { hitung(en.target); io.unobserve(en.target); } }), { threshold: .5 });
    angka.forEach((b) => io.observe(b));
  }

  const ARTI = [
    ["Mawar merah", "#e23a5b", "Cinta, gairah, dan penghargaan yang mendalam."],
    ["Mawar pink", "#ff9cc2", "Kasih sayang, kekaguman, dan rasa terima kasih."],
    ["Mawar putih", "#f4f1ea", "Ketulusan, awal yang baru, dan rasa hormat."],
    ["Bunga matahari", "#ffc83a", "Keceriaan, kehangatan, dan kesetiaan."],
    ["Tulip", "#ff7a59", "Cinta yang tulus dan harapan baik."],
    ["Lily", "#fff3cf", "Kemurnian dan doa baik untuk penerimanya."],
    ["Baby's breath", "#ffffff", "Kasih yang abadi dan ketulusan hati."],
    ["Lavender", "#b79cf0", "Ketenangan, keanggunan, dan pengabdian."]
  ];
  const mg = q("#meaningGrid");
  if (mg) ARTI.forEach(([nama, warna, arti]) => {
    const b = el(`<button class="flip" type="button" aria-pressed="false"><span class="flip-inner">
      <span class="flip-face flip-front"><i class="flip-dot"></i><span><strong></strong><br><small>Tekan untuk melihat makna</small></span></span>
      <span class="flip-face flip-back"><b>MAKNA</b><p></p></span></span></button>`);
    q(".flip-dot", b).style.background = `radial-gradient(circle at 35% 30%, #fff8, transparent 40%), ${warna}`;
    q("strong", b).textContent = nama;
    q("p", b).textContent = arti;
    b.setAttribute("aria-label", `${nama}: ${arti}`);
    b.onclick = () => { b.classList.toggle("on"); b.setAttribute("aria-pressed", String(b.classList.contains("on"))); };
    mg.append(b);
  });

  // =====================================================
  // KONTAK: FITUR 11 form, 12 QR, 13 jam, 14 vCard, peta
  // =====================================================
  const form = q("#formKontak");
  if (form) {
    const pilih = q("#fkPerlu");
    qa("button", pilih).forEach((b) => (b.onclick = () => qa("button", pilih).forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", String(x === b)); })));
    const tgl = q("#fkTanggal");
    const hari = new Date(); hari.setMinutes(hari.getMinutes() - hari.getTimezoneOffset());
    tgl.min = hari.toISOString().slice(0, 10);
    const pesan = q("#fkPesan"), hitung = q("#fkHitung");
    pesan.addEventListener("input", () => (hitung.textContent = pesan.value.length));
    qa("input, textarea", form).forEach((i) => i.addEventListener("input", () => i.closest(".field")?.classList.remove("err")));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nama = q("#fkNama"), salah = [];
      if (!nama.value.trim()) salah.push(nama);
      if (pesan.value.trim().length < 10) salah.push(pesan);
      qa(".field", form).forEach((f) => f.classList.remove("err"));
      if (salah.length) {
        salah.forEach((i) => { const f = i.closest(".field"); void f.offsetWidth; f.classList.add("err"); });
        salah[0].focus();
        getar(30);
        return;
      }
      const perlu = q("button.on", pilih)?.dataset.v || "Tanya";
      const tanggal = tgl.value ? tglIndo(new Date(tgl.value + "T00:00:00")) : "-";
      buatPesanWhatsApp([`Halo Beauty Bukett Singosari, saya ${nama.value.trim()}.`, "", `Keperluan: ${perlu}`, `Tanggal dibutuhkan: ${tanggal}`, "", pesan.value.trim()].join("\n"));
    });
  }

  function statusJam() {
    const wib = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const hari = wib.getDay(), menit = wib.getHours() * 60 + wib.getMinutes();
    const jadwal = JAM_OPERASIONAL[hari];
    const buka = !!jadwal && menit >= jadwal[0] * 60 && menit < jadwal[1] * 60;
    const durasi = (m) => { const j = Math.floor(m / 60), s = m % 60; return j ? `${j} jam ${s} menit` : `${s} menit`; };
    let teks;
    if (buka) teks = `Tutup dalam ${durasi(jadwal[1] * 60 - menit)}`;
    else {
      teks = "Jadwal belum diatur";
      for (let d = 0; d < 8; d++) {
        const h = (hari + d) % 7, j = JAM_OPERASIONAL[h];
        if (!j) continue;
        const mulai = d * 1440 + j[0] * 60;
        if (mulai > menit) { teks = `Buka lagi dalam ${durasi(mulai - menit)}`; break; }
      }
    }
    return { buka, teks, hari };
  }

  function renderJam() {
    const list = q("#jamList");
    if (!list) return;
    const { buka, teks, hari } = statusJam();
    const st = q("#jamStatus");
    st.textContent = buka ? "Sedang buka" : "Sedang tutup";
    st.classList.toggle("tutup", !buka);
    q("#jamHitung").textContent = teks;
    const NAMA_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const f = (n) => String(n).padStart(2, "0") + ".00";
    list.replaceChildren();
    [1, 2, 3, 4, 5, 6, 0].forEach((h) => {
      const j = JAM_OPERASIONAL[h];
      const li = el(`<li><span>${NAMA_HARI[h]}${h === hari ? " · hari ini" : ""}</span><span>${j ? `${f(j[0])} – ${f(j[1])} WIB` : "Libur"}</span></li>`);
      li.classList.toggle("today", h === hari);
      list.append(li);
    });
  }
  renderJam();
  setInterval(renderJam, 30000);

  let qrSiap = false;
  const muatSkrip = (src) => new Promise((ok, gagal) => { const s = doc.createElement("script"); s.src = src; s.onload = ok; s.onerror = gagal; doc.head.append(s); });
  async function buatQR() {
    const box = q("#qrBox");
    if (!box || qrSiap) return;
    if (!waValid()) { box.textContent = "Nomor WA belum diatur"; return; }
    qrSiap = true;
    const url = `https://wa.me/${NOMOR_WA}`;
    try {
      if (!window.QRCode) await muatSkrip(QR_LIB);
      box.replaceChildren();
      new QRCode(box, { text: url, width: 260, height: 260, colorDark: "#171323", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
      box.title = url;
      box.setAttribute("role", "img");
      box.setAttribute("aria-label", `Kode QR menuju ${url}`);
    } catch {
      qrSiap = false;
      box.replaceChildren(el(`<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#171323;font-size:.72rem;text-align:center">QR tidak dapat dimuat.<br>Buka wa.me ↗</a>`));
    }
  }

  q("#simpanKontak")?.addEventListener("click", () => {
    if (!waValid()) return notif("Nomor WhatsApp belum diatur.");
    const halamanWeb = /^https?:/.test(location.href) ? `URL:${location.href.split("#")[0]}\r\n` : "";
    const vcf = `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${NAMA_USAHA}\r\nORG:${NAMA_USAHA}\r\nTEL;TYPE=CELL:+${NOMOR_WA}\r\n${halamanWeb}NOTE:Buket bunga · Singosari\r\nEND:VCARD\r\n`;
    unduhFile("Beauty-Bukett-Singosari.vcf", vcf, "text/vcard");
    notif("Kontak siap disimpan ke ponselmu.");
  });
  q("#salinNomor")?.addEventListener("click", () => salin("+" + NOMOR_WA, "Nomor WhatsApp disalin."));

  function muatPeta() {
    const box = q("#mapFrame");
    if (!box) return;
    const f = el(`<iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Peta lokasi Beauty Bukett Singosari"></iframe>`);
    let qry = "Beauty Bukett Singosari";
    try { qry = new URL(LINK_MAPS).searchParams.get("query") || qry; } catch {}
    f.src = `https://www.google.com/maps?q=${encodeURIComponent(qry)}&output=embed`;
    box.replaceChildren(f);
  }

  // =====================================================
  // LAYANAN: FITUR 8 kuis, 9 kartu, 10 momen, 15 FAQ
  // =====================================================
  const KUIS = [
    { q: "Untuk acara apa buketnya?", o: [["🎓", "Wisuda", { Wisuda: 4, Mawar: 1 }], ["🎂", "Ulang tahun", { Camilan: 2, Hampers: 2, Uang: 1 }], ["💞", "Anniversary / romantis", { Mawar: 4 }], ["🎁", "Hadiah kejutan", { Hampers: 2, Uang: 2, Camilan: 1 }]] },
    { q: "Isi seperti apa yang paling disukai penerimanya?", o: [["🌹", "Bunga", { Mawar: 3, "@bunga": 2 }], ["🍫", "Camilan", { Camilan: 4 }], ["💵", "Uang", { Uang: 5 }], ["🧸", "Boneka & hampers", { Hampers: 5 }]] },
    { q: "Nuansa warna favoritnya?", o: [["🖤", "Merah & hitam", { "@merah": 2, "@hitam": 2 }], ["🌸", "Pink manis", { "@pink": 3 }], ["💙", "Biru elegan", { "@biru": 3 }], ["🌻", "Cerah ceria", { "@matahari": 3, "@stroberi": 1 }]] }
  ];
  const kuis = { langkah: 0, jawab: [] };
  const kartuKuis = q("#quizCard");

  function renderKuis() {
    if (!kartuKuis) return;
    kartuKuis.replaceChildren();
    const titik = KUIS.map((_, i) => `<i class="${i <= kuis.langkah ? "on" : ""}"></i>`).join("");
    if (kuis.langkah < KUIS.length) {
      const s = KUIS[kuis.langkah];
      const v = el(`<div><div class="quiz-top"><span class="eyebrow">KUIS PENCARI BUKET · ${kuis.langkah + 1}/${KUIS.length}</span><div class="quiz-dots">${titik}</div></div>
        <h2 class="quiz-q"></h2><div class="quiz-opts"></div>
        <div class="quiz-foot">${kuis.langkah ? '<button class="link-btn" type="button" data-k="back">← Kembali</button>' : "<span></span>"}<small style="color:var(--muted);font-size:.7rem">Jawab 3 pertanyaan, dapatkan rekomendasi.</small></div></div>`);
      q(".quiz-q", v).textContent = s.q;
      s.o.forEach(([emo, label], i) => {
        const b = el(`<button class="quiz-opt" type="button"><span>${emo}</span>${esc(label)}</button>`);
        b.onclick = () => { kuis.jawab[kuis.langkah] = i; kuis.langkah++; getar(8); renderKuis(); };
        q(".quiz-opts", v).append(b);
      });
      q('[data-k="back"]', v)?.addEventListener("click", () => { kuis.langkah--; renderKuis(); });
      kartuKuis.append(v);
    } else {
      const skor = PRODUK.map((p) => {
        let s = 0;
        const desk = p.deskripsi.toLocaleLowerCase("id");
        kuis.jawab.forEach((j, i) => Object.entries(KUIS[i].o[j][2]).forEach(([k, w]) => {
          if (k.startsWith("@") ? desk.includes(k.slice(1)) : (p.tag || []).includes(k)) s += w;
        }));
        return { p, s };
      }).sort((a, b) => b.s - a.s || a.p.id - b.p.id).slice(0, 2);
      const v = el(`<div><div class="quiz-top"><span class="eyebrow">REKOMENDASI UNTUKMU</span><div class="quiz-dots">${titik}</div></div>
        <h2 class="quiz-q">Dua buket ini paling <em>cocok.</em></h2><div class="quiz-result"></div>
        <div class="quiz-foot"><button class="link-btn" type="button" data-k="ulang">Ulangi kuis</button>
        <button class="button button-light" type="button" data-k="wa">Tanyakan keduanya ↗</button></div></div>`);
      skor.forEach(({ p }) => {
        const r = el(`<div class="qr-item"><img alt=""><div><strong></strong><small></small><div class="mini"><button type="button">Detail</button><button type="button">Tanya WA</button></div></div></div>`);
        q("img", r).src = p.gambar; q("img", r).alt = p.nama;
        q("strong", r).textContent = p.nama;
        q("small", r).textContent = p.deskripsi;
        const [d, w] = qa(".mini button", r);
        d.onclick = () => bukaDetail(p.id);
        w.onclick = () => pesanViaWhatsApp(p);
        q(".quiz-result", v).append(r);
      });
      q('[data-k="ulang"]', v).onclick = () => { kuis.langkah = 0; kuis.jawab = []; renderKuis(); };
      q('[data-k="wa"]', v).onclick = () => buatPesanWhatsApp(["Halo Beauty Bukett Singosari, dari kuis di website saya tertarik dengan:", "",
        ...skor.map(({ p }, i) => `${i + 1}. ${p.nama} (kode 0${p.id})`), "", "Mohon info harga dan ketersediaannya. Terima kasih."].join("\n"));
      kartuKuis.append(v);
    }
  }
  renderKuis();

  // ---- Studio kartu ucapan ----
  const TEMPLATE = {
    "Wisuda": "Selamat wisuda! Semua lelah dan perjuanganmu akhirnya berbuah manis. Bangga sekali padamu.",
    "Ulang tahun": "Selamat ulang tahun! Semoga tahun ini penuh tawa, sehat selalu, dan mimpi-mimpimu satu per satu terwujud.",
    "Anniversary": "Terima kasih sudah memilih berjalan bersamaku. Selamat anniversary, sayang.",
    "Terima kasih": "Terima kasih untuk semua kebaikanmu. Mungkin kecil bagimu, tapi besar artinya bagiku.",
    "Semangat": "Kamu lebih kuat dari yang kamu kira. Semangat terus, aku selalu mendukungmu."
  };
  const GAYA = {
    blush: { bg: ["#fff4f8", "#ffd9e7", "#f8bfd5"], ink: "#4a2034" },
    midnight: { bg: ["#2c2546", "#171323", "#0d0b16"], ink: "#f3ecff" },
    lavender: { bg: ["#faf6ff", "#e2d6ff", "#cdb9fa"], ink: "#2e2152" },
    sage: { bg: ["#fbfdf8", "#dde9d6", "#c3d8b9"], ink: "#24361f" }
  };
  const ku = { gaya: "blush" };
  const kuEl = { untuk: q("#kuUntuk"), pesan: q("#kuPesan"), dari: q("#kuDari"), prev: q("#kuPreview") };

  function renderKartu(bump) {
    if (!kuEl.prev) return;
    q("#kuPrevUntuk").textContent = kuEl.untuk.value.trim() || "kamu";
    q("#kuPrevPesan").textContent = kuEl.pesan.value.trim() || "Tulis ucapanmu di sini.";
    q("#kuPrevDari").textContent = kuEl.dari.value.trim() || namaTamu() || "aku";
    q("#kuHitung").textContent = kuEl.pesan.value.length;
    kuEl.prev.className = `greeting-card g-${ku.gaya}`;
    if (bump && !gerakDikurangi()) { void kuEl.prev.offsetWidth; kuEl.prev.classList.add("bump"); }
  }

  if (kuEl.prev) {
    const tpl = q("#kuTemplate");
    Object.keys(TEMPLATE).forEach((k) => {
      const b = el(`<button type="button">${esc(k)}</button>`);
      b.onclick = () => { qa("button", tpl).forEach((x) => x.classList.toggle("on", x === b)); kuEl.pesan.value = TEMPLATE[k]; renderKartu(true); };
      tpl.append(b);
    });
    [kuEl.untuk, kuEl.pesan, kuEl.dari].forEach((i) => i.addEventListener("input", () => renderKartu()));
    qa("#kuGaya button").forEach((b) => (b.onclick = () => {
      ku.gaya = b.dataset.g;
      qa("#kuGaya button").forEach((x) => x.classList.toggle("on", x === b));
      renderKartu(true);
    }));
    q("#kuSalin").onclick = () => salin(`Untuk ${q("#kuPrevUntuk").textContent}\n\n${q("#kuPrevPesan").textContent}\n\n— ${q("#kuPrevDari").textContent}`, "Teks kartu disalin.");
    q("#kuPakai").onclick = () => {
      const c = q("#cUcap");
      if (c) c.value = kuEl.pesan.value.trim() || q("#kuPrevPesan").textContent;
      bukaCustom();
    };
    q("#kuUnduh").onclick = unduhKartu;
    renderKartu();
  }

  function bungkusTeks(ctx, teks, lebar) {
    const baris = [];
    teks.split(/\n/).forEach((par) => {
      let b = "";
      par.split(/\s+/).forEach((kata) => {
        const coba = b ? b + " " + kata : kata;
        if (ctx.measureText(coba).width > lebar && b) { baris.push(b); b = kata; } else b = coba;
      });
      baris.push(b);
    });
    return baris;
  }

  async function unduhKartu() {
    const W = 1080, H = 1350, g = GAYA[ku.gaya];
    try { await Promise.all([doc.fonts.load('italic 500 64px "Playfair Display"'), doc.fonts.load('500 34px "DM Sans"')]); } catch {}
    let logo = null;
    try { logo = new Image(); logo.src = "img/logo.jpeg"; await logo.decode(); } catch { logo = null; }

    const gambar = (pakaiLogo) => {
      const c = doc.createElement("canvas"); c.width = W; c.height = H;
      const x = c.getContext("2d");
      x.save();
      x.beginPath(); x.roundRect ? x.roundRect(0, 0, W, H, 70) : x.rect(0, 0, W, H); x.clip();
      const gr = x.createLinearGradient(0, 0, W * .55, H);
      gr.addColorStop(0, g.bg[0]); gr.addColorStop(.6, g.bg[1]); gr.addColorStop(1, g.bg[2]);
      x.fillStyle = gr; x.fillRect(0, 0, W, H);
      // ornamen bunga
      const bunga = (cx, cy, r, a) => {
        x.save(); x.translate(cx, cy); x.globalAlpha = a; x.fillStyle = g.ink;
        for (let i = 0; i < 8; i++) { x.rotate(Math.PI / 4); x.beginPath(); x.ellipse(0, -r * .55, r * .22, r * .45, 0, 0, Math.PI * 2); x.fill(); }
        x.restore();
      };
      bunga(W - 60, 70, 260, .1); bunga(40, H - 330, 200, .06);
      x.fillStyle = g.ink; x.textBaseline = "alphabetic";
      x.globalAlpha = .7; x.font = '500 34px "DM Sans", sans-serif'; x.fillText("Untuk", 110, 200);
      const lebarUntuk = x.measureText("Untuk").width;
      x.globalAlpha = 1; x.font = 'italic 500 58px "Playfair Display", Georgia, serif';
      x.fillText(q("#kuPrevUntuk").textContent, 110 + lebarUntuk + 18, 200);
      x.font = 'italic 500 66px "Playfair Display", Georgia, serif';
      const baris = bungkusTeks(x, q("#kuPrevPesan").textContent, W - 220).slice(0, 8);
      const lh = 96, mulai = 300 + (720 - baris.length * lh) / 2 + 60;
      baris.forEach((b, i) => x.fillText(b, 110, mulai + i * lh));
      x.font = '600 36px "DM Sans", sans-serif'; x.textAlign = "right"; x.globalAlpha = .85;
      x.fillText("— " + q("#kuPrevDari").textContent, W - 110, 1110);
      x.globalAlpha = .3; x.fillRect(110, 1185, W - 220, 2);
      x.globalAlpha = .55; x.textAlign = "center"; x.font = '600 24px "DM Sans", sans-serif';
      if ("letterSpacing" in x) x.letterSpacing = "6px";
      x.fillText("BEAUTY BUKETT SINGOSARI", W / 2, 1262);
      if (pakaiLogo && logo) {
        x.globalAlpha = 1; x.save(); x.beginPath(); x.arc(W - 160, 1110 - 150, 48, 0, Math.PI * 2); x.clip();
        x.drawImage(logo, W - 208, 1110 - 198, 96, 96); x.restore();
      }
      x.restore();
      return c;
    };

    const simpan = (c) => new Promise((ok, gagal) => { try { c.toBlob((b) => (b ? ok(b) : gagal()), "image/png"); } catch (e) { gagal(e); } });
    let blob;
    try { blob = await simpan(gambar(true)); } catch { try { blob = await simpan(gambar(false)); } catch { return notif("Gagal membuat gambar kartu."); } }
    const slug = (q("#kuPrevUntuk").textContent || "kartu").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "kartu";
    unduhFile(`kartu-ucapan-${slug}.png`, blob);
    notif("Kartu ucapan berhasil diunduh ✿");
  }

  // ---- Pengingat momen ----
  const listMomen = q("#listMomen");
  const ambilMomen = () => { const m = store.get("bbMomen", []); return Array.isArray(m) ? m : []; };
  function berikutnya(tgl) {
    const [, m, d] = tgl.split("-").map(Number);
    const kini = new Date(); kini.setHours(0, 0, 0, 0);
    let n = new Date(kini.getFullYear(), m - 1, d);
    if (n < kini) n = new Date(kini.getFullYear() + 1, m - 1, d);
    return { tanggal: n, hari: Math.round((n - kini) / 864e5) };
  }
  const labelHari = (h) => (h === 0 ? "Hari ini! 🎉" : h === 1 ? "Besok" : `${h} hari lagi`);

  function icsMomen(m) {
    const { tanggal } = berikutnya(m.tgl);
    const f = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    const besok = new Date(tanggal); besok.setDate(besok.getDate() + 1);
    const e = (s) => String(s).replace(/([,;\\])/g, "\\$1");
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    const judul = e(`${m.acara} ${m.nama}`);
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Beauty Bukett Singosari//Pengingat//ID", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      `UID:${m.id}@beautybukett`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${f(tanggal)}`, `DTEND;VALUE=DATE:${f(besok)}`, "RRULE:FREQ=YEARLY",
      `SUMMARY:${judul}`, `DESCRIPTION:${e("Jangan lupa pesan buket di Beauty Bukett Singosari ✿")}`,
      "BEGIN:VALARM", "TRIGGER:-P3D", "ACTION:DISPLAY", `DESCRIPTION:${judul} 3 hari lagi`, "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  }

  function renderMomen() {
    if (!listMomen) return;
    const data = ambilMomen().map((m) => ({ m, ...berikutnya(m.tgl) })).sort((a, b) => a.hari - b.hari);
    listMomen.replaceChildren();
    if (!data.length) { listMomen.append(el(`<div class="moment-empty">Belum ada pengingat. Tambahkan tanggal penting orang tersayang ✿</div>`)); return; }
    data.forEach(({ m, tanggal, hari }) => {
      const r = el(`<div class="moment glass"><div class="moment-day"><b>${tanggal.getDate()}</b><small>${tglIndo(tanggal, { month: "short" })}</small></div>
        <div><strong></strong><small><span class="${hari <= 7 ? "soon" : ""}">${labelHari(hari)}</span> · ${tglIndo(tanggal, { weekday: "long" })}</small></div>
        <div class="moment-act"><button type="button" aria-label="Tambah ke kalender" title="Tambah ke kalender">${svg("cal")}</button>
        <button type="button" aria-label="Pesan buket via WhatsApp" title="Pesan buket">${svg("chat")}</button>
        <button type="button" aria-label="Hapus pengingat" title="Hapus">${svg("trash")}</button></div></div>`);
      q("strong", r).textContent = `${m.acara} · ${m.nama}`;
      const [cal, wa, del] = qa(".moment-act button", r);
      cal.onclick = () => { unduhFile(`pengingat-${m.nama.replace(/\W+/g, "-")}.ics`, icsMomen(m), "text/calendar"); notif("File kalender diunduh. Buka untuk menambahkan."); };
      wa.onclick = () => buatPesanWhatsApp(`Halo Beauty Bukett Singosari, saya ingin memesan buket untuk ${m.acara.toLowerCase()} ${m.nama} pada ${tglIndo(tanggal)}. Mohon info pilihan dan harganya. Terima kasih.`);
      del.onclick = () => {
        r.classList.add("leaving");
        setTimeout(() => { store.set("bbMomen", ambilMomen().filter((x) => x.id !== m.id)); renderMomen(); }, gerakDikurangi() ? 0 : 280);
      };
      listMomen.append(r);
    });
  }

  q("#formMomen")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nama = q("#mmNama"), tgl = q("#mmTanggal");
    const salah = [nama.value.trim() ? null : nama, tgl.value ? null : tgl].filter(Boolean);
    qa("#formMomen .field").forEach((f) => f.classList.remove("err"));
    if (salah.length) { salah.forEach((i) => i.closest(".field").classList.add("err")); salah[0].focus(); return; }
    const data = ambilMomen();
    data.push({ id: Date.now().toString(36), nama: nama.value.trim(), acara: q("#mmAcara").value, tgl: tgl.value });
    store.set("bbMomen", data);
    nama.value = ""; tgl.value = "";
    renderMomen();
    notif("Pengingat disimpan di perangkat ini.");
  });
  renderMomen();

  function ingatkanMomenDekat() {
    try { if (sessionStorage.getItem("bbMomenIngat")) return; sessionStorage.setItem("bbMomenIngat", "1"); } catch {}
    const dekat = ambilMomen().map((m) => ({ m, ...berikutnya(m.tgl) })).filter((x) => x.hari <= 7).sort((a, b) => a.hari - b.hari)[0];
    if (dekat) notif(`Ingat: ${dekat.m.acara.toLowerCase()} ${dekat.m.nama} ${labelHari(dekat.hari).toLowerCase()} ✿`);
  }

  // ---- FAQ ----
  const FAQ = [
    ["Bagaimana cara memesan buket?", "Pilih buket di halaman Katalog, lalu tekan “Pesan via WA”. Pesan berisi nama dan kode buket akan otomatis tersusun di WhatsApp. Kamu juga bisa menanyakan beberapa buket sekaligus lewat Keranjang tanya."],
    ["Berapa harga buketnya?", "Harga belum dicantumkan di website karena bisa berbeda sesuai isi, ukuran, dan permintaan. Silakan tanyakan langsung lewat WhatsApp untuk harga terbaru."],
    ["Apakah bisa pesan buket custom?", "Bisa. Gunakan menu “Pesan custom” untuk mengirim nama, acara, budget, tanggal dibutuhkan, dan ucapan kartu dalam satu pesan WhatsApp."],
    ["Kapan sebaiknya memesan?", "Sebaiknya hubungi kami lebih awal, terutama menjelang musim wisuda atau hari besar. Waktu pengerjaan akan dikonfirmasi langsung oleh penjual."],
    ["Apakah bisa diantar?", "Tanyakan ketersediaan dan biaya pengantaran ke lokasimu melalui WhatsApp. Pengambilan langsung juga bisa disepakati dengan penjual."],
    ["Di mana lokasi Beauty Bukett?", "Beauty Bukett berada di Singosari. Buka halaman Kontak untuk melihat peta dan tautan Google Maps."],
    ["Bisakah saya menambahkan kartu ucapan?", "Tentu. Rancang ucapanmu di Studio kartu ucapan pada halaman Layanan, lalu pakai teksnya di pesan custom atau unduh sebagai gambar."],
    ["Apakah data saya disimpan oleh website?", "Favorit, riwayat, keranjang tanya, nama sapaan, dan pengingat momen hanya tersimpan di browser perangkatmu sendiri. Formulir kontak tidak menyimpan apa pun dan hanya membuka WhatsApp."]
  ];
  const faqList = q("#faqList");
  function sorot(teks, kata) {
    const frag = doc.createDocumentFragment();
    if (!kata) { frag.append(teks); return frag; }
    const re = new RegExp(`(${kata.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    teks.split(re).forEach((bag, i) => { if (i % 2) { const m = doc.createElement("mark"); m.textContent = bag; frag.append(m); } else frag.append(bag); });
    return frag;
  }
  function renderFaq() {
    if (!faqList) return;
    const kata = (q("#faqCari")?.value || "").trim();
    const k = kata.toLocaleLowerCase("id");
    faqList.replaceChildren();
    const cocok = FAQ.filter(([t, j]) => !k || (t + " " + j).toLocaleLowerCase("id").includes(k));
    if (!cocok.length) { faqList.append(el(`<div class="moment-empty">Belum ada jawaban untuk itu. Tanyakan langsung lewat WhatsApp, ya.</div>`)); return; }
    cocok.forEach(([t, j], i) => {
      const it = el(`<div class="faq-item glass"><button class="faq-q" type="button" aria-expanded="false"><span></span><i aria-hidden="true">+</i></button><div class="faq-a" role="region"><div><p></p></div></div></div>`);
      q(".faq-q span", it).append(sorot(t, kata));
      q("p", it).append(sorot(j, kata));
      const btn = q(".faq-q", it);
      btn.onclick = () => { const on = it.classList.toggle("on"); btn.setAttribute("aria-expanded", String(on)); };
      if (k && i === 0) { it.classList.add("on"); btn.setAttribute("aria-expanded", "true"); }
      faqList.append(it);
    });
  }
  q("#faqCari")?.addEventListener("input", renderFaq);
  renderFaq();

  // =====================================================
  // FITUR 19 — KELOPAK BUNGA BERJATUHAN (Beranda)
  // =====================================================
  const kel = { cv: null, ctx: null, item: [], raf: 0, w: 0, h: 0 };
  function ukurKelopak() {
    if (!kel.cv) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    kel.w = innerWidth; kel.h = innerHeight;
    kel.cv.width = kel.w * dpr; kel.cv.height = kel.h * dpr;
    kel.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const kelopakBaru = (atas) => ({
    x: Math.random() * kel.w, y: atas ? -20 - Math.random() * kel.h * .3 : Math.random() * kel.h,
    r: 5 + Math.random() * 7, vy: .35 + Math.random() * .6, vx: (Math.random() - .5) * .3,
    rot: Math.random() * 6.28, vr: (Math.random() - .5) * .03, ph: Math.random() * 6.28,
    c: ["255,179,214", "203,181,255", "255,214,231", "255,255,255"][Math.floor(Math.random() * 4)]
  });
  function mulaiKelopak() {
    if (!kel.cv) {
      kel.cv = el(`<canvas class="petals" aria-hidden="true"></canvas>`);
      doc.body.prepend(kel.cv);
      kel.ctx = kel.cv.getContext("2d");
      addEventListener("resize", ukurKelopak);
    }
    ukurKelopak();
    kel.cv.style.transition = "opacity .8s"; kel.cv.style.opacity = "1";
    const jumlah = innerWidth < 640 ? 12 : 20;
    kel.item = Array.from({ length: jumlah }, () => kelopakBaru(false));
    const loop = (t) => {
      const x = kel.ctx;
      x.clearRect(0, 0, kel.w, kel.h);
      kel.item.forEach((p, i) => {
        p.y += p.vy; p.x += p.vx + Math.sin(t / 1400 + p.ph) * .45; p.rot += p.vr;
        if (p.y > kel.h + 20) kel.item[i] = kelopakBaru(true);
        x.save(); x.translate(p.x, p.y); x.rotate(p.rot);
        x.fillStyle = `rgba(${p.c},.45)`;
        x.beginPath(); x.ellipse(0, 0, p.r * .55, p.r, 0, 0, Math.PI * 2); x.fill();
        x.restore();
      });
      kel.raf = requestAnimationFrame(loop);
    };
    kel.raf = requestAnimationFrame(loop);
  }
  function hentikanKelopak() {
    cancelAnimationFrame(kel.raf); kel.raf = 0;
    if (kel.cv) { kel.cv.style.opacity = "0"; setTimeout(() => !kel.raf && kel.ctx?.clearRect(0, 0, kel.w, kel.h), 800); }
  }
  function aturKelopak() {
    const mau = store.get("bbKelopak", true) && halaman === "beranda" && !gerakDikurangi() && !doc.hidden;
    if (mau && !kel.raf) mulaiKelopak();
    else if (!mau && kel.raf) hentikanKelopak();
  }
  doc.addEventListener("visibilitychange", aturKelopak);

  // =====================================================
  // PAPAN KETIK: ⌘K, Esc untuk lapisan baru, panah galeri
  // =====================================================
  addEventListener("keydown", (e) => {
    const mengetik = /INPUT|TEXTAREA|SELECT/.test(doc.activeElement?.tagName || "");
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); e.stopImmediatePropagation(); bukaSpotlight(); return; }
    if (e.key === "Escape") {
      if (ctxAktif) { ctxAktif.tutup(); e.stopImmediatePropagation(); }
      else if (glbAktif) { glbAktif.tutup(); e.stopImmediatePropagation(); }
      else if (tumpukan.length) { tumpukan[tumpukan.length - 1].tutup(); e.stopImmediatePropagation(); }
      return;
    }
    if (glbAktif && (e.key === "ArrowRight" || e.key === "ArrowLeft")) { glbAktif.geser(e.key === "ArrowRight" ? 1 : -1); e.stopImmediatePropagation(); return; }
    if (e.key === "/" && !mengetik && halaman !== "koleksi" && !tumpukan.length) { ke("koleksi"); setTimeout(() => q("#koleksi")?.scrollIntoView({ behavior: "smooth" }), 40); }
  }, true);

  // =====================================================
  // MULAI
  // =====================================================
  ke(dariUrl(), { push: false, atas: false });
  sapaHero();
  perbaruiFavAsk();
  intro();
})();

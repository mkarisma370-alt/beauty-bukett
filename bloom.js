// =====================================================
// [BARU] BLOOM LAYER — Beauty Bukett
// Dimuat paling akhir. Tidak mengubah file lama; hanya menambah:
//  1. Menyembunyikan tanggal & jam di layar pembuka
//  2. Animasi bunga mekar + kelopak jatuh saat masuk web
//  3. Latar belakang bergerak (mesh, blob, bokeh, bunga garis)
//  4. Pop up khusus "Suka" (favorit)
//  5. Pop up khusus keranjang + tampilan keranjang yang diperbarui
// =====================================================
(() => {
  const doc = document, root = doc.documentElement, body = doc.body;
  const q = (s, el = doc) => el.querySelector(s);
  const qa = (s, el = doc) => [...el.querySelectorAll(s)];
  const H = (h) => { const t = doc.createElement("template"); t.innerHTML = h.trim(); return t.content.firstElementChild; };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const tenang = () => root.dataset.motion === "reduce" || matchMedia("(prefers-reduced-motion: reduce)").matches;
  const produkById = (id) => (typeof PRODUK !== "undefined" ? PRODUK.find((p) => p.id === id) : null);

  // ---------------------------------------------------
  // 1. Hilangkan tanggal & jam di layar pembuka
  // ---------------------------------------------------
  const waktu = q("#introTime");
  if (waktu) { waktu.textContent = ""; waktu.setAttribute("aria-hidden", "true"); }

  // ---------------------------------------------------
  // Pembuat bunga SVG (mekar berlapis)
  // ---------------------------------------------------
  let uid = 0;
  const KELOPAK = "M100 100C77 77 79 36 100 13C121 36 123 77 100 100Z";
  function bunga(kelas = "") {
    const id = "bbxf" + ++uid;
    const lapis = [
      { n: 8, s: 1, off: 0, g: "a", d: 0 },
      { n: 8, s: .8, off: 22.5, g: "b", d: .22 },
      { n: 6, s: .54, off: 15, g: "c", d: .44 }
    ];
    let k = 0, kel = "";
    lapis.forEach((l) => {
      for (let i = 0; i < l.n; i++) {
        kel += `<g class="bbx-p" style="--a:${l.off + (360 / l.n) * i}deg;--s:${l.s};--d:${l.d}s;--k:${k++}"><path d="${KELOPAK}" fill="url(#${id}${l.g})"/></g>`;
      }
    });
    let benang = "";
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      benang += `<circle class="bbx-st" style="--k:${i}" cx="${(100 + Math.cos(a) * 19).toFixed(1)}" cy="${(100 + Math.sin(a) * 19).toFixed(1)}" r="2.6"/>`;
    }
    const lg = (n, c) => `<linearGradient id="${id}${n}" gradientUnits="userSpaceOnUse" x1="100" y1="100" x2="100" y2="13">${c.map((w, i) => `<stop offset="${i / (c.length - 1)}" stop-color="${w}"/>`).join("")}</linearGradient>`;
    return H(`<svg class="bbx-flower ${kelas}" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        ${lg("a", ["#b8327c", "#ff7ab8", "#ffd9ea"])}
        ${lg("b", ["#6f3fc4", "#b48cff", "#efe6ff"])}
        ${lg("c", ["#ff5fa8", "#ffb3d6", "#ffffff"])}
        <radialGradient id="${id}o"><stop offset="0" stop-color="#fff6cf"/><stop offset="1" stop-color="#ffb347"/></radialGradient>
      </defs>
      <g class="bbx-petals">${kel}</g>
      <g class="bbx-core"><circle cx="100" cy="100" r="14" fill="url(#${id}o)"/>${benang}</g>
    </svg>`);
  }

  // Kelopak jatuh (CSS)
  const WARNA = [["#ffd1e6", "#ff7ab8"], ["#efe6ff", "#a77bff"], ["#ffffff", "#ffb3d6"], ["#ffe3c4", "#ff9fb8"], ["#dff3ff", "#9fd8ff"]];
  function hujanKelopak(n, { awal = false } = {}) {
    const box = H(`<div class="bbx-fall" aria-hidden="true"></div>`);
    for (let i = 0; i < n; i++) {
      const [c1, c2] = WARNA[i % WARNA.length];
      const dur = rnd(5.5, 10);
      const i_ = H(`<i></i>`);
      i_.style.cssText = `--x:${rnd(-2, 100).toFixed(1)}vw;--dur:${dur.toFixed(2)}s;--del:${(awal ? rnd(-dur, 0) : rnd(0, 2.4)).toFixed(2)}s;--sz:${rnd(9, 20).toFixed(1)}px;--sw:${rnd(18, 60).toFixed(0)}px;--r:${rnd(240, 720).toFixed(0)}deg;--c1:${c1};--c2:${c2};--o:${rnd(.55, .95).toFixed(2)}`;
      box.append(i_);
    }
    return box;
  }

  // Ledakan kelopak dari titik tengah
  function ledakan(x = innerWidth / 2, y = innerHeight / 2, n = 34, z = 1060) {
    if (tenang()) return;
    const box = H(`<div class="bbx-burst" aria-hidden="true"></div>`);
    box.style.zIndex = z;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd(-.2, .2), jarak = rnd(.45, .95) * Math.max(innerWidth, innerHeight);
      const [c1, c2] = WARNA[i % WARNA.length];
      const p = H(`<i></i>`);
      p.style.cssText = `left:${x}px;top:${y}px;--dx:${(Math.cos(a) * jarak).toFixed(0)}px;--dy:${(Math.sin(a) * jarak).toFixed(0)}px;--r:${rnd(-540, 540).toFixed(0)}deg;--sz:${rnd(10, 24).toFixed(0)}px;--c1:${c1};--c2:${c2};--t:${rnd(.9, 1.5).toFixed(2)}s`;
      box.append(p);
    }
    body.append(box);
    setTimeout(() => box.remove(), 1700);
  }

  // Munculkan isi situs dengan lembut
  function ungkapSitus() {
    body.classList.remove("bbx-reveal");
    void body.offsetWidth;
    body.classList.add("bbx-reveal");
    setTimeout(() => body.classList.remove("bbx-reveal"), 1500);
  }

  // ---------------------------------------------------
  // 2. Animasi pembuka: bunga mekar + kelopak jatuh
  // ---------------------------------------------------
  const intro = q("#intro");
  const introAktif = intro && root.classList.contains("intro-on") && intro.isConnected;

  if (introAktif) {
    // Sapaan pertama: hias layar sapaan yang sudah ada
    const orb = q(".intro-orb", intro);
    if (orb) orb.prepend(bunga(tenang() ? "open" : "bloom"));
    q(".intro-bg", intro)?.after(hujanKelopak(innerWidth < 640 ? 18 : 30));
    // Saat sapaan ditutup: masuk lewat bunga
    const mo = new MutationObserver(() => {
      if (!intro.classList.contains("leaving")) return;
      mo.disconnect();
      const r = orb?.getBoundingClientRect();
      ledakan(r ? r.left + r.width / 2 : innerWidth / 2, r ? r.top + r.height / 2 : innerHeight / 2, 40, 1060);
      setTimeout(ungkapSitus, 280);
    });
    mo.observe(intro, { attributes: true, attributeFilter: ["class"] });
  } else if (!tenang()) {
    // Kunjungan berikutnya: layar mekar singkat
    const splash = H(`<div class="bbx-splash" role="presentation">
      <div class="bbx-splash-bg"><i></i><i></i><i></i></div>
      <div class="bbx-splash-center">
        <div class="bbx-splash-flower"></div>
        <img class="bbx-splash-logo" src="img/logo.jpeg" alt="">
      </div>
      <div class="bbx-splash-text">
        <strong>${"Beauty Bukett".split("").map((c, i) => `<span style="--i:${i}">${c === " " ? "&nbsp;" : c}</span>`).join("")}</strong>
        <small>Singosari · Flower Atelier</small>
      </div>
      <button class="bbx-splash-skip" type="button">Masuk</button>
    </div>`);
    q(".bbx-splash-flower", splash).append(bunga("bloom"));
    splash.prepend(hujanKelopak(innerWidth < 640 ? 18 : 30));
    body.append(splash);
    root.classList.add("bbx-splash-on");
    let selesai = false;
    const masuk = () => {
      if (selesai) return; selesai = true;
      splash.classList.add("out");
      ledakan(innerWidth / 2, innerHeight / 2 - 30, 38, 1210);
      setTimeout(() => { root.classList.remove("bbx-splash-on"); ungkapSitus(); }, 380);
      setTimeout(() => splash.remove(), 1300);
    };
    const t = setTimeout(masuk, 2700);
    splash.addEventListener("click", () => { clearTimeout(t); masuk(); });
    addEventListener("keydown", function k(e) {
      removeEventListener("keydown", k);
      if (!selesai && (e.key === "Escape" || e.key === "Enter")) { clearTimeout(t); masuk(); }
    });
  }

  // ---------------------------------------------------
  // 3. Latar belakang bergerak
  // ---------------------------------------------------
  const latar = q(".aurora-background");
  if (latar) {
    const BUNGA_GARIS = (n) => {
      let d = "";
      for (let i = 0; i < n; i++) d += `<path d="${KELOPAK}" transform="rotate(${(360 / n) * i} 100 100)"/>`;
      return `<svg viewBox="0 0 200 200">${d}<circle cx="100" cy="100" r="12"/></svg>`;
    };
    const bg = H(`<div class="bbx-bg" aria-hidden="true">
      <div class="bbx-mesh"></div>
      <div class="bbx-layer l1"><i class="bbx-blob b1"></i><i class="bbx-blob b2"></i><i class="bbx-blob b3"></i></div>
      <div class="bbx-layer l2 bbx-flora"></div>
      <div class="bbx-layer l3 bbx-bokeh"></div>
      <div class="bbx-shine"></div>
    </div>`);
    const flora = q(".bbx-flora", bg), bokeh = q(".bbx-bokeh", bg);
    [[8, "8%", "18%", 190, 70], [6, "78%", "12%", 140, 90], [10, "86%", "64%", 230, 80], [5, "14%", "74%", 120, 100], [8, "48%", "42%", 90, 120], [12, "60%", "88%", 160, 75]]
      .forEach(([n, x, y, s, dur], i) => {
        const f = H(`<span>${BUNGA_GARIS(n)}</span>`);
        f.style.cssText = `left:${x};top:${y};--s:${s}px;--dur:${dur}s;--fl:${14 + i * 3}s;--dir:${i % 2 ? -1 : 1}`;
        flora.append(f);
      });
    const nb = innerWidth < 640 ? 14 : 24;
    for (let i = 0; i < nb; i++) {
      const b = H(`<i></i>`);
      const dur = rnd(18, 38);
      b.style.cssText = `left:${rnd(0, 100).toFixed(1)}%;--sz:${rnd(4, 14).toFixed(1)}px;--dur:${dur.toFixed(1)}s;--del:${rnd(-dur, 0).toFixed(1)}s;--tw:${rnd(2.5, 5).toFixed(1)}s;--sx:${rnd(-60, 60).toFixed(0)}px`;
      bokeh.append(b);
    }
    latar.append(bg);

    // Parallax lembut mengikuti kursor & gulir
    let px = 0, py = 0, raf = 0;
    const tulis = () => {
      raf = 0;
      bg.style.setProperty("--px", px.toFixed(3));
      bg.style.setProperty("--py", py.toFixed(3));
      bg.style.setProperty("--sy", Math.min(scrollY / Math.max(innerHeight, 1), 6).toFixed(3));
    };
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX / innerWidth * 2 - 1; py = e.clientY / innerHeight * 2 - 1;
      if (!raf) raf = requestAnimationFrame(tulis);
    }, { passive: true });
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(tulis); }, { passive: true });
    tulis();
  }

  // ---------------------------------------------------
  // Utilitas pop up
  // ---------------------------------------------------
  const IKON = {
    heart: '<path d="M12 21s-7.6-4.7-9.7-9.4C.9 8.3 3 4.4 6.7 4.4c2.1 0 3.6 1.1 5.3 3.1 1.7-2 3.2-3.1 5.3-3.1 3.7 0 5.8 3.9 4.4 7.2C19.6 16.3 12 21 12 21Z"/>',
    bag: '<path d="M5.5 8.5h13l-1.1 11.2a1.5 1.5 0 0 1-1.5 1.3H8.1a1.5 1.5 0 0 1-1.5-1.3L5.5 8.5Z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/>',
    check: '<path d="m5 12.5 4.2 4.2L19 7"/>',
    wa: '<path d="M5 19l1.2-3.6A7.5 7.5 0 1 1 9 18.3z"/>'
  };
  const svg = (n, cls = "") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${IKON[n]}</svg>`;

  // Bisukan toast lama sebentar agar tidak dobel dengan pop up
  let senyapT;
  function senyapkanToast() {
    body.classList.add("bbx-quiet");
    clearTimeout(senyapT);
    senyapT = setTimeout(() => body.classList.remove("bbx-quiet"), 3200);
  }

  // Penghitung waktu tutup otomatis yang bisa dijeda
  function pengatur(el, ms, tutup) {
    let sisa = ms, mulai = Date.now(), t = setTimeout(tutup, ms);
    const bar = q(".bbx-timer i", el);
    if (bar) bar.style.animationDuration = ms + "ms";
    const jeda = () => { clearTimeout(t); sisa -= Date.now() - mulai; el.classList.add("paused"); };
    const lanjut = () => { mulai = Date.now(); clearTimeout(t); t = setTimeout(tutup, Math.max(sisa, 600)); el.classList.remove("paused"); };
    el.addEventListener("pointerenter", jeda);
    el.addEventListener("pointerleave", lanjut);
    el.addEventListener("focusin", jeda);
    return () => clearTimeout(t);
  }

  // ---------------------------------------------------
  // 4. Pop up khusus SUKA (favorit)
  // ---------------------------------------------------
  let likeAktif = null;
  function popSuka(p) {
    likeAktif?.tutup(true);
    const jumlah = typeof favorit !== "undefined" ? favorit.length : 1;
    const bd = H(`<div class="bbx-pop-bd bbx-like" role="dialog" aria-modal="true" aria-label="Ditambahkan ke favorit">
      <div class="bbx-card">
        <button class="bbx-x" type="button" aria-label="Tutup">×</button>
        <div class="bbx-like-visual">
          <span class="bbx-ring"></span><span class="bbx-ring r2"></span><span class="bbx-ring r3"></span>
          <div class="bbx-like-photo"><img alt=""></div>
          <span class="bbx-like-heart">${svg("heart")}</span>
          <div class="bbx-mini"></div>
        </div>
        <span class="bbx-eyebrow">${svg("heart", "i")} DISIMPAN KE FAVORIT</span>
        <h3>Kamu menyukai <em></em></h3>
        <p class="bbx-sub"><b>${jumlah}</b> buket favorit tersimpan di perangkatmu. Tanyakan semuanya sekaligus kapan saja.</p>
        <div class="bbx-actions">
          <button class="bbx-btn primary" type="button" data-a="lihat">${svg("heart")} Lihat favorit</button>
          <button class="bbx-btn ghost" type="button" data-a="lanjut">Lanjut jelajah</button>
        </div>
        <div class="bbx-timer"><i></i></div>
      </div>
    </div>`);
    const img = q(".bbx-like-photo img", bd);
    img.src = p.gambar; img.alt = p.nama;
    q("h3 em", bd).textContent = p.nama;
    const mini = q(".bbx-mini", bd);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2, d = rnd(70, 120);
      const h = H(`<span>${svg("heart")}</span>`);
      h.style.cssText = `--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${(Math.sin(a) * d).toFixed(0)}px;--sz:${rnd(10, 18).toFixed(0)}px;--dl:${rnd(.25, .45).toFixed(2)}s;--c:${["#ff7ab8", "#ffb3d6", "#c9a6ff", "#ffffff"][i % 4]}`;
      mini.append(h);
    }
    body.append(bd);
    navigator.vibrate?.([12, 40, 18]);
    senyapkanToast();

    let berhenti;
    const tutup = (cepat) => {
      if (!bd.isConnected || bd.classList.contains("out")) return;
      berhenti?.();
      if (likeAktif?.el === bd) likeAktif = null;
      if (cepat) { bd.remove(); return; }
      bd.classList.add("out");
      setTimeout(() => bd.remove(), 380);
    };
    berhenti = pengatur(q(".bbx-card", bd), 4200, () => tutup());
    likeAktif = { el: bd, tutup };
    bd.addEventListener("click", (e) => {
      if (e.target === bd || e.target.closest(".bbx-x") || e.target.closest('[data-a="lanjut"]')) tutup();
      else if (e.target.closest('[data-a="lihat"]')) {
        tutup();
        if (typeof detailBackdrop !== "undefined" && !detailBackdrop.hidden && typeof tutupDetail === "function") tutupDetail();
        setTimeout(() => q("#showFavorites")?.click(), 120);
      }
    });
    setTimeout(() => q('[data-a="lihat"]', bd)?.focus({ preventScroll: true }), 50);
  }

  // ---------------------------------------------------
  // 5. Pop up khusus KERANJANG
  // ---------------------------------------------------
  const tombolKeranjang = () => q('.header-actions button[aria-label="Keranjang tanya"]');
  const bacaCart = () => { try { const v = JSON.parse(localStorage.getItem("bbCart")); return Array.isArray(v) ? v : null; } catch { return null; } };

  // Catat titik klik terakhir untuk animasi "terbang ke keranjang"
  let klikTerakhir = null;
  doc.addEventListener("click", (e) => {
    const t = e.target.closest?.(".cart-add, .ctx-menu button, .detail-modal button, .bbx-btn");
    if (t) klikTerakhir = { el: t, waktu: Date.now() };
  }, true);

  function terbang(p) {
    if (tenang()) return;
    const tujuan = tombolKeranjang();
    if (!tujuan) return;
    let sumber = null;
    if (klikTerakhir && Date.now() - klikTerakhir.waktu < 1500 && klikTerakhir.el.isConnected) {
      sumber = klikTerakhir.el.closest(".product-card")?.querySelector(".product-media img")
        || klikTerakhir.el.closest(".detail-modal")?.querySelector("img")
        || klikTerakhir.el;
    }
    if (!sumber) sumber = qa(".product-card").find((c) => +q(".product-number", c)?.textContent === p.id)?.querySelector("img");
    if (!sumber) return;
    const a = sumber.getBoundingClientRect(), b = tujuan.getBoundingClientRect();
    if (!a.width || !b.width) return;
    const s = Math.min(a.width, a.height, 120);
    const f = H(`<img class="bbx-fly" alt="">`);
    f.src = p.gambar;
    f.style.cssText = `left:${a.left + a.width / 2 - s / 2}px;top:${a.top + a.height / 2 - s / 2}px;width:${s}px;height:${s}px;--tx:${(b.left + b.width / 2) - (a.left + a.width / 2)}px;--ty:${(b.top + b.height / 2) - (a.top + a.height / 2)}px`;
    body.append(f);
    setTimeout(() => {
      f.remove();
      tujuan.classList.remove("bbx-bump"); void tujuan.offsetWidth; tujuan.classList.add("bbx-bump");
    }, 820);
  }

  let cartAktif = null;
  function popKeranjang(p, isi) {
    cartAktif?.tutup(true);
    const daftar = isi.map(produkById).filter(Boolean);
    const lebih = Math.max(daftar.length - 5, 0);
    const el = H(`<div class="bbx-cartpop" role="status" aria-live="polite">
      <div class="bbx-cp-glow"></div>
      <div class="bbx-cp-head">
        <span class="bbx-cp-bag">${svg("bag")}<b>${daftar.length}</b></span>
        <div class="bbx-cp-title"><small>KERANJANG TANYA</small><strong>Berhasil ditambahkan</strong></div>
        <button class="bbx-x" type="button" aria-label="Tutup">×</button>
      </div>
      <div class="bbx-cp-item">
        <img alt="">
        <div><b></b><small></small></div>
        <span class="bbx-cp-check">${svg("check")}</span>
      </div>
      <div class="bbx-cp-stack">
        <div class="bbx-cp-thumbs"></div>
        <span>${daftar.length} buket siap ditanyakan</span>
      </div>
      <div class="bbx-actions">
        <button class="bbx-btn primary" type="button" data-a="lihat">${svg("bag")} Lihat keranjang</button>
        <button class="bbx-btn ghost" type="button" data-a="wa">${svg("wa")} Tanya via WA</button>
      </div>
      <div class="bbx-timer"><i></i></div>
    </div>`);
    const img = q(".bbx-cp-item img", el);
    img.src = p.gambar; img.alt = p.nama;
    q(".bbx-cp-item b", el).textContent = p.nama;
    q(".bbx-cp-item small", el).textContent = `Kode 0${p.id}${p.tag?.length ? " · " + p.tag.join(", ") : ""}`;
    const th = q(".bbx-cp-thumbs", el);
    daftar.slice(-5).forEach((x, i) => {
      const t = H(`<img alt="">`); t.src = x.gambar; t.alt = x.nama; t.style.setProperty("--i", i);
      th.append(t);
    });
    if (lebih) th.append(H(`<span class="more">+${lebih}</span>`));
    body.append(el);
    senyapkanToast();
    requestAnimationFrame(() => el.classList.add("in"));

    let berhenti;
    const tutup = (cepat) => {
      if (!el.isConnected || el.classList.contains("out")) return;
      berhenti?.();
      if (cartAktif?.el === el) cartAktif = null;
      if (cepat) { el.remove(); return; }
      el.classList.add("out");
      setTimeout(() => el.remove(), 420);
    };
    berhenti = pengatur(el, 5000, () => tutup());
    cartAktif = { el, tutup };
    el.addEventListener("click", (e) => {
      if (e.target.closest(".bbx-x")) tutup();
      else if (e.target.closest('[data-a="lihat"]')) {
        tutup();
        if (typeof detailBackdrop !== "undefined" && !detailBackdrop.hidden && typeof tutupDetail === "function") tutupDetail();
        setTimeout(() => tombolKeranjang()?.click(), 100);
      } else if (e.target.closest('[data-a="wa"]')) { tutup(); q("#cartSend")?.click(); }
    });
  }

  // Tampilan lembar keranjang yang diperbarui
  const lembar = q(".sheet-bd");
  if (lembar) {
    lembar.classList.add("bbx-cart");
    const pane = q('[data-pane="0"]', lembar), list = q("#cartList");
    const kepala = H(`<div class="bbx-cart-head">
      <span class="bbx-cart-icon">${svg("bag")}</span>
      <div><h3>Keranjang tanya</h3><p><b class="n">0</b> buket · harga & stok dikonfirmasi via WhatsApp</p></div>
    </div>`);
    const kaki = H(`<p class="bbx-cart-note">✿ Semua buket akan dikirim dalam satu pesan WhatsApp yang rapi.</p>`);
    pane?.prepend(kepala);
    q("#cartSend")?.before(kaki);
    const rapikan = () => {
      if (!list) return;
      const baris = qa(".ci", list);
      q(".n", kepala).textContent = baris.length;
      kaki.hidden = !baris.length;
      baris.forEach((r, i) => {
        r.style.setProperty("--i", i);
        r.dataset.n = String(i + 1).padStart(2, "0");
        const nama = q("strong", r)?.textContent;
        const p = typeof PRODUK !== "undefined" ? PRODUK.find((x) => x.nama === nama) : null;
        if (p && !q("small", r)) {
          const s = H(`<small></small>`);
          s.textContent = `Kode 0${p.id}${p.tag?.length ? " · " + p.tag.join(", ") : ""}`;
          q("strong", r).append(s);
        }
      });
      // perbaiki gambar keranjang kosong (path lama tanpa folder img/)
      const kosong = q(".empty-cart img", list);
      if (kosong && /(^|\/)foto-utama\.jpeg$/.test(kosong.getAttribute("src")) && !kosong.getAttribute("src").startsWith("img/")) kosong.src = "img/foto-utama.jpeg";
    };
    if (list) new MutationObserver(rapikan).observe(list, { childList: true });
    rapikan();
  }

  // ---------------------------------------------------
  // Deteksi perubahan favorit & keranjang
  // (membungkus renderProduk, dipanggil setelah setiap perubahan)
  // ---------------------------------------------------
  let favSebelum = typeof favorit !== "undefined" ? [...favorit] : [];
  let cartSebelum = bacaCart() || [];
  function periksa() {
    if (typeof favorit !== "undefined") {
      const baru = favorit.filter((id) => !favSebelum.includes(id));
      favSebelum = [...favorit];
      const p = baru.length === 1 ? produkById(baru[0]) : null;
      if (p && body.classList.contains("entered")) setTimeout(() => popSuka(p), 60);
    }
    const isi = bacaCart();
    if (isi) {
      const baru = isi.filter((id) => !cartSebelum.includes(id));
      cartSebelum = [...isi];
      const p = baru.length === 1 ? produkById(baru[0]) : null;
      if (p && body.classList.contains("entered")) { terbang(p); setTimeout(() => popKeranjang(p, isi), 260); }
    }
  }
  if (typeof renderProduk === "function") {
    const _renderProduk = renderProduk;
    renderProduk = function () {
      const hasil = _renderProduk.apply(this, arguments);
      try { periksa(); } catch {}
      return hasil;
    };
  }

  // Esc menutup pop up baru
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (likeAktif) { likeAktif.tutup(); e.stopImmediatePropagation(); }
    else if (cartAktif) { cartAktif.tutup(); }
  }, true);
})();

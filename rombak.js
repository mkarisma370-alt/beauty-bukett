// =====================================================
// [BARU] ROMBAK UI — Beauty Bukett
// Dimuat paling akhir. Tidak mengubah file lama; hanya menambah:
//  1. Pembuka elegan: logo + nama (Brittany Signature) lalu transisi masuk web
//  2. Tombol & pop up RIWAYAT (liquid glass)
//  3. Pop up khusus tombol SUKA / favorit (liquid glass)
//  4. Jam buka 14.00–22.00 setiap hari, mengikuti jam di perangkat (HP)
//  5. Halaman Tentang yang lebih detail
//  6. Efek interaktif: riak sentuh, kilau kaca mengikuti jari/kursor, muncul saat digulir
// =====================================================
(() => {
  const doc = document, root = doc.documentElement, body = doc.body;
  const q = (s, el = doc) => el.querySelector(s);
  const qa = (s, el = doc) => [...el.querySelectorAll(s)];
  const H = (h) => { const t = doc.createElement("template"); t.innerHTML = h.trim(); return t.content.firstElementChild; };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const tenang = () => root.dataset.motion === "reduce" || matchMedia("(prefers-reduced-motion: reduce)").matches;
  const produk = () => ((typeof PRODUK !== "undefined") ? PRODUK : []);
  const byId = (id) => produk().find((p) => p.id === id);
  const listFav = () => ((typeof favorit !== "undefined") ? favorit : []);
  const listRiw = () => ((typeof riwayat !== "undefined") ? riwayat : []);
  const getar = (ms = 10) => { try { navigator.vibrate?.(ms); } catch {} };
  const L = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const S = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  // ---------- Jam operasional (waktu lokal perangkat) ----------
  const JAM = { buka: 2, tutup: 22 };               // 02.00 – 22.00, setiap hari
  const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const dua = (n) => String(n).padStart(2, "0");
  const fJam = (h) => `${dua(h)}.00`;
  const durasi = (m) => { const j = Math.floor(m / 60), s = m % 60; return j ? (s ? `${j} jam ${s} menit` : `${j} jam`) : `${Math.max(s, 1)} menit`; };
  function statusToko(now = new Date()) {
    const m = now.getHours() * 60 + now.getMinutes();
    const b = JAM.buka * 60, t = JAM.tutup * 60;
    const buka = m >= b && m < t;
    const sisa = buka ? t - m : (m < b ? b - m : 1440 - m + b);
    const pct = buka ? (m - b) / (t - b) : 0;
    return { buka, sisa, m, pct, now };
  }

  // ---------- Ikon ----------
  const IK = {
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    hist: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3 4.5v4h4"/><path d="M12 8v4.2l2.8 1.8"/>',
    heart: '<path d="M12 20.5s-7.6-4.6-9.6-9.3C1 8 3.1 4.4 6.7 4.4c2.1 0 3.6 1.1 5.3 3.1 1.7-2 3.2-3.1 5.3-3.1 3.6 0 5.7 3.6 4.3 6.8-2 4.7-9.6 9.3-9.6 9.3Z"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    wa: '<path d="M4.5 19.5l1.2-3.6A7.8 7.8 0 1 1 8.6 18.5z"/><path d="M9.2 9.3c.3 2 1.6 3.6 3.6 4.4l1-1 1.7.9c-.2 1-.9 1.6-1.9 1.6-3 0-5.8-2.8-5.8-5.8 0-1 .6-1.7 1.6-1.9l.9 1.7z"/>',
    map: '<path d="M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0 1 13 0c0 5.3-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>',
    arrow: '<path d="M7 17 17 7M9 7h8v8"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>'
  };
  const ik = (n, c = "") => `<svg class="rb-ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${IK[n]}</svg>`;

  // =====================================================
  // 1. PEMBUKA: LOGO + NAMA, LALU TRANSISI MASUK WEB
  // =====================================================
  // Sapaan lama & layar bunga sebelumnya diselesaikan diam-diam di balik pembuka baru
  const introLama = q("#intro");
  if (introLama && root.classList.contains("intro-on")) q("#introSkip")?.click();
  q(".bbx-splash")?.click();

  const pembuka = H(`<div class="rb-intro" role="dialog" aria-label="Beauty Bukett Singosari">
    <div class="rb-intro-bg" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="rb-intro-stage">
      <div class="rb-intro-logo">
        <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="56"/></svg>
        <img src="img/logo.jpeg" alt="Logo Beauty Bukett">
      </div>
      <div class="rb-intro-name"><span>Beauty Bukett</span><i class="rb-pen" aria-hidden="true"></i></div>
      <span class="rb-intro-line" aria-hidden="true"></span>
      <p class="rb-intro-cap">Singosari · Flower Atelier</p>
    </div>
    <button class="rb-intro-skip" type="button">Lewati</button>
  </div>`);
  body.append(pembuka);
  root.classList.add("rb-ready", "rb-intro-on");

  let introSelesai = false, introT;
  function masukWeb() {
    if (introSelesai) return; introSelesai = true;
    clearTimeout(introT);
    pembuka.classList.add("out");
    root.classList.add("rb-entering");
    // putar ulang animasi masuk bawaan agar terlihat setelah pembuka
    body.classList.remove("entered"); void body.offsetWidth; body.classList.add("entered");
    setTimeout(() => root.classList.remove("rb-intro-on"), 200);
    setTimeout(() => { pembuka.remove(); root.classList.remove("rb-entering"); }, 1500);
  }
  pembuka.addEventListener("click", masukWeb);
  addEventListener("keydown", function k(e) {
    if (introSelesai) { removeEventListener("keydown", k); return; }
    if (e.key === "Enter" || e.key === "Escape" || e.key === " ") { e.preventDefault(); masukWeb(); }
  });
  const fontSiap = Promise.race([
    doc.fonts?.load?.('400 64px "Brittany Signature"').catch(() => {}) || Promise.resolve(),
    new Promise((r) => setTimeout(r, 1600))
  ]);
  fontSiap.then(() => {
    if (introSelesai) return;
    pembuka.classList.add("play");
    introT = setTimeout(masukWeb, tenang() ? 1200 : 3700);
  });

  // =====================================================
  // KERANGKA POP UP LIQUID GLASS
  // =====================================================
  let popAktif = null;
  function bukaPop({ id, ikon, nada = "pink", judul, sub = "", isi, kaki }) {
    popAktif?.tutup(true);
    const bd = H(`<div class="rb-bd" id="${id}">
      <section class="rb-pop" role="dialog" aria-modal="true" aria-labelledby="${id}-t">
        <div class="rb-grab" aria-hidden="true"></div>
        <header class="rb-pop-head">
          <span class="rb-pop-ic ${nada}">${ik(ikon)}</span>
          <div class="rb-pop-tt"><h3 id="${id}-t"></h3><p></p></div>
          <button class="rb-close" type="button" aria-label="Tutup">${ik("x")}</button>
        </header>
        <div class="rb-pop-body"></div>
        <footer class="rb-pop-foot"></footer>
      </section>
    </div>`);
    const pop = q(".rb-pop", bd);
    q("h3", bd).textContent = judul;
    q(".rb-pop-tt p", bd).innerHTML = sub;
    if (isi) q(".rb-pop-body", bd).append(isi);
    if (kaki) q(".rb-pop-foot", bd).append(kaki); else q(".rb-pop-foot", bd).remove();
    body.append(bd);
    root.classList.add("rb-lock");
    getar(8);
    const kembali = doc.activeElement;
    requestAnimationFrame(() => { bd.classList.add("in"); q(".rb-close", bd).focus({ preventScroll: true }); });

    let tertutup = false;
    const api = {
      el: bd, pop,
      setSub: (h) => (q(".rb-pop-tt p", bd).innerHTML = h),
      tutup(cepat) {
        if (tertutup) return; tertutup = true;
        if (popAktif === api) popAktif = null;
        api.onTutup?.();
        root.classList.remove("rb-lock");
        if (cepat) { bd.remove(); return; }
        bd.classList.remove("in"); bd.classList.add("out");
        pop.style.transform = "";
        setTimeout(() => bd.remove(), 460);
        kembali?.focus?.({ preventScroll: true });
      }
    };
    bd.addEventListener("click", (e) => { if (e.target === bd || e.target.closest(".rb-close")) api.tutup(); });

    // Geser ke bawah untuk menutup (HP)
    let y0 = null, dy = 0, t0 = 0;
    const mulai = (e) => {
      if (innerWidth > 700 || e.target.closest("button")) return;
      y0 = e.clientY; dy = 0; t0 = Date.now(); pop.classList.add("drag");
      pop.setPointerCapture?.(e.pointerId);
    };
    const gerak = (e) => {
      if (y0 === null) return;
      dy = Math.max(0, e.clientY - y0);
      pop.style.transform = `translateY(${dy}px)`;
      bd.style.setProperty("--rb-fade", String(Math.max(0, 1 - dy / 420)));
    };
    const lepas = () => {
      if (y0 === null) return;
      pop.classList.remove("drag");
      const cepat = dy / Math.max(Date.now() - t0, 1) > .6;
      y0 = null; bd.style.removeProperty("--rb-fade");
      if (dy > 110 || (cepat && dy > 30)) api.tutup(); else pop.style.transform = "";
    };
    [q(".rb-grab", bd), q(".rb-pop-head", bd)].forEach((h) => {
      h.addEventListener("pointerdown", mulai);
      h.addEventListener("pointermove", gerak);
      h.addEventListener("pointerup", lepas);
      h.addEventListener("pointercancel", lepas);
    });
    popAktif = api;
    return api;
  }
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popAktif) { popAktif.tutup(); e.stopImmediatePropagation(); }
  }, true);
  const tombol = (html, kelas, fn) => { const b = H(`<button class="rb-btn ${kelas}" type="button">${html}</button>`); b.onclick = fn; return b; };
  const bukaDetailAman = (id) => { popAktif?.tutup(); setTimeout(() => { if (typeof bukaDetail === "function") bukaDetail(id); }, 220); };
  const keKatalog = () => q('.mobile-nav a[href="#koleksi"]')?.click() || (location.hash = "#koleksi");

  // =====================================================
  // 2. RIWAYAT
  // =====================================================
  let waktuLihat = L("bbRiwayatWaktu", {});
  if (typeof catatRiwayat === "function") {
    const _catat = catatRiwayat;
    catatRiwayat = function (id) {
      const hasil = _catat.apply(this, arguments);
      waktuLihat[id] = Date.now(); S("bbRiwayatWaktu", waktuLihat);
      perbaruiBadge();
      return hasil;
    };
  }
  const relatif = (t) => {
    if (!t) return "Dilihat sebelumnya";
    const d = Math.round((Date.now() - t) / 60000);
    if (d < 1) return "Baru saja";
    if (d < 60) return `${d} menit lalu`;
    const j = Math.round(d / 60); if (j < 24) return `${j} jam lalu`;
    const h = Math.round(j / 24); if (h === 1) return "Kemarin";
    return `${h} hari lalu`;
  };

  const tblRiwayat = H(`<button class="glass-icon rb-hist-btn" type="button" aria-label="Riwayat dilihat" title="Riwayat">${ik("hist")}<span class="count-badge rb-badge">0</span></button>`);
  const fav = q("#showFavorites");
  if (fav) fav.before(tblRiwayat); else q(".header-actions")?.append(tblRiwayat);
  function perbaruiBadge() {
    const n = listRiw().filter(byId).length;
    const b = q(".rb-badge", tblRiwayat);
    b.textContent = n; b.hidden = !n;
  }
  perbaruiBadge();

  function bukaRiwayat() {
    const isi = H(`<div class="rb-hist"></div>`);
    const kaki = H(`<div class="rb-foot-row"></div>`);
    let api;
    const render = () => {
      isi.replaceChildren(); kaki.replaceChildren();
      const daftar = listRiw().map(byId).filter(Boolean);
      api?.setSub(daftar.length ? `${daftar.length} buket terakhir yang kamu buka` : "Belum ada buket yang dibuka");
      if (!daftar.length) {
        isi.append(H(`<div class="rb-empty">
          <span class="rb-empty-ic">${ik("hist")}</span>
          <h4>Riwayat masih kosong</h4>
          <p>Buka detail sebuah buket di katalog, nanti akan muncul di sini supaya mudah dilihat lagi.</p>
        </div>`));
        kaki.append(tombol(`${ik("grid")} Jelajahi katalog`, "primary", () => { api.tutup(); keKatalog(); }));
        return;
      }
      daftar.forEach((p, i) => {
        const suka = listFav().includes(p.id);
        const r = H(`<article class="rb-hist-item" style="--i:${i}">
          <button class="rb-hist-main" type="button">
            <span class="rb-thumb"><img alt="" loading="lazy"></span>
            <span class="rb-hist-tx"><strong></strong><small></small><em>${ik("eye")}<span></span></em></span>
          </button>
          <button class="rb-mini-btn rb-like${suka ? " on" : ""}" type="button" aria-pressed="${suka}" aria-label="${suka ? "Hapus dari" : "Tambah ke"} favorit">${ik("heart")}</button>
          <button class="rb-mini-btn" type="button" data-hapus aria-label="Hapus dari riwayat">${ik("x")}</button>
        </article>`);
        q("img", r).src = p.gambar;
        q("strong", r).textContent = p.nama;
        q("small", r).textContent = `Kode 0${p.id}${p.tag?.length ? " · " + p.tag.join(", ") : ""}`;
        q("em span", r).textContent = relatif(waktuLihat[p.id]);
        q(".rb-hist-main", r).onclick = () => bukaDetailAman(p.id);
        q(".rb-like", r).onclick = (e) => {
          const b = e.currentTarget; b.classList.add("pop");
          if (typeof ubahFavorit === "function") ubahFavorit(p.id);
          const on = listFav().includes(p.id);
          b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on));
          setTimeout(() => b.classList.remove("pop"), 500);
        };
        q("[data-hapus]", r).onclick = () => {
          r.classList.add("leave"); getar(8);
          setTimeout(() => {
            if ((typeof riwayat !== "undefined")) {
              riwayat = riwayat.filter((x) => x !== p.id);
              if (typeof simpanPenyimpanan === "function") simpanPenyimpanan("beautyBukettRiwayat", riwayat);
              if (typeof renderRiwayat === "function") renderRiwayat();
            }
            perbaruiBadge(); render();
          }, 320);
        };
        isi.append(r);
      });
      let yakin = false;
      const hapus = tombol(`${ik("trash")} Hapus semua`, "ghost", () => {
        if (!yakin) { yakin = true; hapus.innerHTML = `${ik("trash")} Yakin hapus?`; hapus.classList.add("warn"); setTimeout(() => { yakin = false; hapus.innerHTML = `${ik("trash")} Hapus semua`; hapus.classList.remove("warn"); }, 2600); return; }
        q("#clearRecent")?.click();
        if ((typeof riwayat !== "undefined") && riwayat.length) { riwayat = []; if (typeof simpanPenyimpanan === "function") simpanPenyimpanan("beautyBukettRiwayat", riwayat); }
        waktuLihat = {}; S("bbRiwayatWaktu", waktuLihat);
        perbaruiBadge(); render();
      });
      kaki.append(hapus, tombol(`${ik("grid")} Buka katalog`, "primary", () => { api.tutup(); keKatalog(); }));
    };
    api = bukaPop({ id: "rbRiwayat", ikon: "hist", nada: "violet", judul: "Riwayat dilihat", isi, kaki });
    render();
  }
  tblRiwayat.addEventListener("click", bukaRiwayat);

  // =====================================================
  // 3. POP UP FAVORIT (tombol ♡ di atas)
  // =====================================================
  let lewatkan = false;
  addEventListener("click", (e) => {
    const t = e.target.closest?.("#showFavorites");
    if (!t || lewatkan) return;
    e.preventDefault(); e.stopImmediatePropagation();
    bukaFavorit();
  }, true);

  function bukaFavorit() {
    const isi = H(`<div class="rb-fav"></div>`);
    const kaki = H(`<div class="rb-foot-row"></div>`);
    let api;
    const render = () => {
      isi.replaceChildren(); kaki.replaceChildren();
      const daftar = listFav().map(byId).filter(Boolean);
      api?.setSub(daftar.length ? `<b>${daftar.length}</b> buket yang kamu sukai` : "Tekan ♡ pada buket untuk menyimpannya");
      if (!daftar.length) {
        isi.append(H(`<div class="rb-empty">
          <span class="rb-empty-ic heart">${ik("heart")}</span>
          <h4>Belum ada favorit</h4>
          <p>Simpan buket yang kamu suka dengan menekan ♡. Semua tersimpan di perangkatmu sendiri.</p>
        </div>`));
        kaki.append(tombol(`${ik("grid")} Cari buket favorit`, "primary", () => { api.tutup(); keKatalog(); }));
        return;
      }
      const grid = H(`<div class="rb-fav-grid"></div>`);
      daftar.forEach((p, i) => {
        const c = H(`<article class="rb-fav-card" style="--i:${i}">
          <button class="rb-fav-img" type="button" aria-label="Lihat detail"><img alt="" loading="lazy"></button>
          <button class="rb-fav-heart" type="button" aria-label="Hapus dari favorit">${ik("heart")}</button>
          <div class="rb-fav-tx"><strong></strong><small></small></div>
        </article>`);
        const img = q("img", c); img.src = p.gambar; img.alt = p.nama;
        q("strong", c).textContent = p.nama;
        q("small", c).textContent = (p.tag || []).join(" · ") || "Buket";
        q(".rb-fav-img", c).onclick = () => bukaDetailAman(p.id);
        q(".rb-fav-heart", c).onclick = () => {
          c.classList.add("leave"); getar(12);
          setTimeout(() => { if (typeof ubahFavorit === "function") ubahFavorit(p.id); render(); }, 360);
        };
        grid.append(c);
      });
      isi.append(grid);
      kaki.append(
        tombol(`${ik("grid")} Di katalog`, "ghost", () => { api.tutup(); lewatkan = true; q("#showFavorites")?.click(); lewatkan = false; }),
        tombol(`${ik("wa")} Tanyakan semua`, "primary wa", () => {
          if (typeof buatPesanWhatsApp !== "function") return;
          buatPesanWhatsApp(["Halo Beauty Bukett Singosari, saya tertarik dengan buket favorit saya:", "",
            ...daftar.map((p, i) => `${i + 1}. ${p.nama} (kode 0${p.id})`), "", "Mohon info harga dan ketersediaannya. Terima kasih."].join("\n"));
        })
      );
    };
    api = bukaPop({ id: "rbFavorit", ikon: "heart", nada: "pink", judul: "Favoritku", isi, kaki });
    render();
  }

  // =====================================================
  // 4. JAM BUKA (14.00 – 22.00, waktu lokal perangkat)
  // =====================================================
  const pemakai = new Set();
  const lingkar = (r, a0, a1) => {
    const p = (a) => { const t = (a - 90) * Math.PI / 180; return [100 + r * Math.cos(t), 100 + r * Math.sin(t)]; };
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  };
  let dialN = 0;
  function dial() {
    const gid = "rbDialG" + ++dialN;
    const el = H(`<div class="rb-dial">
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb3d6"/><stop offset="1" stop-color="#b48cff"/></linearGradient></defs>
        <circle class="trk" cx="100" cy="100" r="84"/>
        <path class="opn" stroke="url(#${gid})" d="${lingkar(84, JAM.buka * 15, JAM.tutup * 15)}"/>
        ${[0, 6, 12, 18].map((h) => { const t = (h * 15 - 90) * Math.PI / 180; return `<text x="${(100 + 66 * Math.cos(t)).toFixed(1)}" y="${(100 + 66 * Math.sin(t) + 3.5).toFixed(1)}">${dua(h)}</text>`; }).join("")}
        <g class="hand"><line x1="100" y1="100" x2="100" y2="24"/><circle cx="100" cy="16" r="6.5"/></g>
        <circle class="pin" cx="100" cy="100" r="3.5"/>
      </svg>
      <div class="rb-dial-c"><b class="rb-live-time">--.--</b><small class="rb-live-sec">--</small></div>
    </div>`);
    return el;
  }
  function segarkan(el) {
    const s = statusToko();
    const n = s.now;
    qa(".rb-live-time", el).forEach((x) => (x.textContent = `${dua(n.getHours())}.${dua(n.getMinutes())}`));
    qa(".rb-live-sec", el).forEach((x) => (x.textContent = `${dua(n.getSeconds())} detik`));
    qa(".rb-live-date", el).forEach((x) => (x.textContent = `${HARI[n.getDay()]}, ${n.getDate()} ${BULAN[n.getMonth()]}`));
    qa(".rb-live-state", el).forEach((x) => { x.textContent = s.buka ? "Sedang buka" : "Sedang tutup"; x.classList.toggle("tutup", !s.buka); });
    qa(".rb-live-count", el).forEach((x) => (x.textContent = s.buka ? `Tutup dalam ${durasi(s.sisa)}` : `Buka lagi dalam ${durasi(s.sisa)}`));
    qa(".rb-live-bar i", el).forEach((x) => (x.style.transform = `scaleX(${s.buka ? s.pct : 0})`));
    qa(".rb-dial .hand", el).forEach((x) => (x.style.transform = `rotate(${(s.m + n.getSeconds() / 60) / 4}deg)`));
    qa(".rb-dial", el).forEach((x) => x.classList.toggle("tutup", !s.buka));
    qa(".rb-week li", el).forEach((li) => li.classList.toggle("today", +li.dataset.h === n.getDay()));
  }
  const minggu = () => {
    const ul = H(`<ul class="rb-week"></ul>`);
    [1, 2, 3, 4, 5, 6, 0].forEach((h) => ul.append(H(`<li data-h="${h}"><span>${HARI[h]}</span><span>${fJam(JAM.buka)} – ${fJam(JAM.tutup)}</span></li>`)));
    return ul;
  };
  const panelJam = () => {
    const w = H(`<div class="rb-hours">
      <div class="rb-hours-top"></div>
      <div class="rb-hours-info">
        <span class="rb-live-state">—</span>
        <p class="rb-live-date">&nbsp;</p>
        <p class="rb-live-count">&nbsp;</p>
        <div class="rb-live-bar" aria-hidden="true"><i></i></div>
        <small class="rb-hours-note">Jam mengikuti waktu di perangkatmu · buka setiap hari</small>
      </div>
    </div>`);
    q(".rb-hours-top", w).append(dial());
    w.append(minggu());
    return w;
  };
  setInterval(() => pemakai.forEach((el) => (el.isConnected ? segarkan(el) : pemakai.delete(el))), 1000);
  const pakai = (el) => { pemakai.add(el); segarkan(el); return el; };

  // Chip status di header (menggantikan tampilan chip lama)
  const chip = H(`<button class="rb-status" type="button" aria-label="Lihat jam buka"><i></i><b class="rb-chip-a"></b><small class="rb-chip-b"></small></button>`);
  const chipLama = q(".header-actions .status-chip");
  if (chipLama) chipLama.after(chip); else q(".header-actions")?.prepend(chip);
  const segarChip = () => {
    const s = statusToko();
    chip.classList.toggle("tutup", !s.buka);
    q(".rb-chip-a", chip).textContent = s.buka ? "Buka" : "Tutup";
    q(".rb-chip-b", chip).textContent = s.buka ? `· s/d ${fJam(JAM.tutup)}` : `· buka ${fJam(JAM.buka)}`;
  };
  segarChip(); setInterval(segarChip, 15000);
  function bukaJam() {
    const isi = pakai(panelJam());
    const kaki = H(`<div class="rb-foot-row"></div>`);
    kaki.append(
      tombol(`${ik("map")} Lokasi`, "ghost", () => open((typeof LINK_MAPS !== "undefined") ? LINK_MAPS : "https://www.google.com/maps/search/?api=1&query=Beauty%20Bukett%20Singosari", "_blank", "noopener")),
      tombol(`${ik("wa")} Chat WhatsApp`, "primary wa", () => typeof buatPesanWhatsApp === "function" && buatPesanWhatsApp("Halo Beauty Bukett Singosari, saya ingin bertanya tentang buket."))
    );
    bukaPop({ id: "rbJam", ikon: "clock", nada: "green", judul: "Jam buka", sub: `Setiap hari · ${fJam(JAM.buka)} – ${fJam(JAM.tutup)}`, isi, kaki });
  }
  chip.addEventListener("click", bukaJam);

  // Kartu jam di halaman Kontak (menggantikan tampilan kartu lama)
  const jamLama = q("#jamBuka");
  if (jamLama) {
    const kartu = H(`<div class="rb-hours-card glass"><div class="rb-hc-head"><span class="eyebrow">JAM OPERASIONAL</span><span class="rb-live-state">—</span></div></div>`);
    kartu.append(panelJam());
    q(".rb-hours-info .rb-live-state", kartu)?.remove();
    jamLama.before(kartu); jamLama.classList.add("rb-diganti");
    pakai(kartu);
  }

  // =====================================================
  // 5. HALAMAN TENTANG LEBIH DETAIL
  // =====================================================
  const hTentang = q('[data-page="tentang"]');
  if (hTentang) {
    const tahun = new Date().getFullYear() - 2017;
    const cerita = H(`<section class="rb-story section-shell" id="ceritaKami">
      <div class="section-heading"><div>
        <span class="eyebrow">CERITA KAMI</span>
        <h2>Dari Singosari, <em>dirangkai dengan hati.</em></h2>
        <p>Perjalanan kecil sebuah UMKM buket bunga — dari satu rangkaian ke banyak momen bahagia.</p>
      </div></div>
      <div class="rb-story-grid">
        <aside class="rb-story-card glass rb-rv">
          <span class="rb-sig">Beauty Bukett</span>
          <p>Kami percaya buket bukan sekadar hadiah. Ia adalah cara mengatakan <em>“aku bangga”</em>, <em>“selamat”</em>, atau <em>“terima kasih”</em> tanpa harus banyak kata.</p>
          <p>Karena itu setiap pesanan dirangkai satu per satu: warna dipilih, wrapping disusun, pita diikat, lalu kartu ucapan ditulis sesuai cerita pemesannya.</p>
          <div class="rb-facts">
            <span><b>2017</b><small>Mulai merangkai</small></span>
            <span><b>${tahun}+ th</b><small>Berkarya</small></span>
            <span><b>Setiap hari</b><small>${fJam(JAM.buka)} – ${fJam(JAM.tutup)}</small></span>
          </div>
        </aside>
        <ol class="rb-timeline">
          <li class="rb-rv"><span class="dot"></span><small>2017</small><h3>Awal mula</h3><p>Beauty Bukett Singosari berdiri sebagai UMKM yang menjual buket bunga untuk warga sekitar Singosari.</p></li>
          <li class="rb-rv"><span class="dot"></span><small>Berkembang</small><h3>Lebih dari sekadar bunga</h3><p>Selain buket mawar, kami merangkai hampers, buket camilan, hingga buket uang untuk berbagai acara.</p></li>
          <li class="rb-rv"><span class="dot"></span><small>Ciri khas</small><h3>Detail yang personal</h3><p>Wrapping, warna, pita, dan kartu ucapan disesuaikan dengan permintaan — tidak ada dua pesanan yang benar-benar sama.</p></li>
          <li class="rb-rv"><span class="dot"></span><small>Hari ini</small><h3>Mudah dipesan dari mana saja</h3><p>Lihat katalog di website ini, simpan favorit, lalu tanyakan harga dan pesan langsung lewat WhatsApp.</p></li>
        </ol>
      </div>
    </section>`);

    // Kategori dari katalog
    const tagMap = new Map();
    produk().forEach((p) => (p.tag || []).forEach((t) => { if (!tagMap.has(t)) tagMap.set(t, []); tagMap.get(t).push(p); }));
    const KET = { Mawar: "Klasik & romantis", Wisuda: "Untuk hari kelulusan", Hampers: "Kado lengkap dalam kotak", Camilan: "Manis & menyenangkan", Uang: "Hadiah praktis yang berkesan" };
    const kategori = H(`<section class="rb-cats section-shell">
      <div class="section-heading"><div>
        <span class="eyebrow">YANG KAMI RANGKAI</span>
        <h2>Pilihan <em>untuk setiap cerita.</em></h2>
        <p>Tekan salah satu untuk langsung melihat buketnya di katalog.</p>
      </div></div>
      <div class="rb-cat-grid"></div>
    </section>`);
    [...tagMap].forEach(([t, ps], i) => {
      const c = H(`<button class="rb-cat glass rb-rv" type="button" style="--i:${i}">
        <span class="rb-cat-img"><img alt="" loading="lazy"></span>
        <span class="rb-cat-tx"><strong></strong><small></small></span>
        <span class="rb-cat-n">${ps.length}</span>
        <span class="rb-cat-go">${ik("arrow")}</span>
      </button>`);
      q("img", c).src = ps[0].gambar;
      q("strong", c).textContent = t;
      q("small", c).textContent = KET[t] || `${ps.length} buket`;
      c.onclick = () => {
        keKatalog();
        setTimeout(() => {
          const chipTipe = qa(".type-chips button").find((b) => b.textContent.trim() === t);
          chipTipe?.click();
          q("#koleksi")?.scrollIntoView({ behavior: tenang() ? "auto" : "smooth", block: "start" });
        }, 260);
      };
      q(".rb-cat-grid", kategori).append(c);
    });

    // Detail yang kami perhatikan (bisa dibuka-tutup)
    const DETAIL = [
      ["01", "Pemilihan bunga", "Bunga dan isian dipilih menyesuaikan acara dan budget — dari mawar klasik hingga bunga matahari yang ceria.", "Ceritakan acara dan warna kesukaan penerima, kami bantu pilihkan kombinasi yang cocok."],
      ["02", "Wrapping & warna", "Paduan warna wrapping disusun agar serasi: hitam elegan, pink manis, biru royal, atau sesuai warna favorit penerima.", "Kamu bisa mengirim contoh foto atau warna yang diinginkan lewat WhatsApp."],
      ["03", "Pita & aksen", "Pita, mutiara, kupu-kupu, atau tulisan ucapan seperti “Happy Graduation” menjadi sentuhan akhir.", "Aksen bisa ditambah atau dikurangi sesuai selera dan budget."],
      ["04", "Kartu ucapan", "Tulis sendiri pesannya, atau rancang kartu di halaman Layanan.", "Teks kartu dari Studio kartu ucapan bisa langsung dipakai di pesan custom."]
    ];
    const detail = H(`<section class="rb-craft section-shell">
      <div class="section-heading"><div>
        <span class="eyebrow">DETAIL YANG KAMI PERHATIKAN</span>
        <h2>Kecil, <em>tapi berarti.</em></h2>
        <p>Tekan setiap kartu untuk membaca lebih lanjut.</p>
      </div></div>
      <div class="rb-craft-grid"></div>
    </section>`);
    DETAIL.forEach(([no, j, p, lebih]) => {
      const c = H(`<button class="rb-craft-card glass rb-rv" type="button" aria-expanded="false">
        <span class="rb-craft-no">${no}</span><span class="rb-craft-plus" aria-hidden="true"></span>
        <h3>${esc(j)}</h3><p>${esc(p)}</p>
        <div class="rb-craft-more"><div><p>${esc(lebih)}</p></div></div>
      </button>`);
      c.onclick = () => { const on = c.getAttribute("aria-expanded") !== "true"; c.setAttribute("aria-expanded", String(on)); getar(6); };
      q(".rb-craft-grid", detail).append(c);
    });

    // Jam buka & lokasi (langsung, mengikuti jam HP)
    const kunjungi = H(`<section class="rb-visit section-shell" id="jamLokasi">
      <div class="rb-visit-card glass rb-rv">
        <div class="rb-visit-dial"></div>
        <div class="rb-visit-copy">
          <span class="eyebrow">JAM BUKA & LOKASI</span>
          <h2>Buka <em>setiap hari.</em></h2>
          <p class="rb-visit-hours"><b>${fJam(JAM.buka)} – ${fJam(JAM.tutup)}</b> · Senin sampai Minggu</p>
          <p class="rb-visit-st"><span class="rb-live-state">—</span> <span class="rb-live-count"></span></p>
          <div class="rb-live-bar" aria-hidden="true"><i></i></div>
          <p class="rb-visit-note">Jam di atas mengikuti waktu di perangkatmu. Pesan di luar jam buka tetap bisa dikirim lewat WhatsApp dan akan kami balas saat toko buka.</p>
          <div class="rb-visit-actions">
            <a class="button button-light" href="${(typeof LINK_MAPS !== "undefined") ? LINK_MAPS : "https://www.google.com/maps/search/?api=1&query=Beauty%20Bukett%20Singosari"}" target="_blank" rel="noopener noreferrer">Buka Google Maps ↗</a>
            <a class="button button-glass" href="#kontak">Hubungi kami</a>
          </div>
        </div>
      </div>
    </section>`);
    q(".rb-visit-dial", kunjungi).append(dial());
    pakai(kunjungi);

    const about = q(".about-section", hTentang), stats = q(".stats-section", hTentang), values = q(".values-section", hTentang);
    about ? about.after(cerita) : hTentang.append(cerita);
    (stats || cerita).after(kategori);
    (values || kategori).after(detail);
    detail.after(kunjungi);
  }

  // =====================================================
  // 6. EFEK INTERAKTIF
  // =====================================================
  // Muncul saat digulir (elemen baru)
  const rvObs = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("rb-in"); rvObs.unobserve(e.target); }
  }), { threshold: .12, rootMargin: "0px 0px -6% 0px" }) : null;
  qa(".rb-rv").forEach((el, i) => { el.style.setProperty("--d", (i % 4) * 70 + "ms"); rvObs ? rvObs.observe(el) : el.classList.add("rb-in"); });

  // Riak sentuh pada tombol
  const SEL_RIAK = ".button, .glass-icon, .filter-pill, .quick-tile, .rb-btn, .rb-status, .mobile-nav a, .mobile-nav button, .rb-cat, .rb-craft-card, .contact-card, .seg button, .chip-select button";
  doc.addEventListener("pointerdown", (e) => {
    if (tenang()) return;
    const t = e.target.closest?.(SEL_RIAK);
    if (!t) return;
    if (getComputedStyle(t).position === "static") t.style.position = "relative";
    let wadah = t.querySelector(":scope > .rb-ripples");
    if (!wadah) { wadah = H(`<span class="rb-ripples" aria-hidden="true"></span>`); t.append(wadah); }
    const r = t.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.2;
    const d = H(`<i></i>`);
    d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    wadah.append(d);
    setTimeout(() => d.remove(), 700);
  }, { passive: true });

  // Kilau kaca mengikuti kursor / jari
  let rafK = 0, ev = null;
  addEventListener("pointermove", (e) => {
    ev = e; if (rafK) return;
    rafK = requestAnimationFrame(() => {
      rafK = 0;
      const g = ev.target.closest?.(".glass, .rb-pop");
      if (!g || g.classList.contains("product-card")) return;
      const r = g.getBoundingClientRect();
      g.style.setProperty("--mx", ((ev.clientX - r.left) / r.width * 100).toFixed(1) + "%");
      g.style.setProperty("--my", ((ev.clientY - r.top) / r.height * 100).toFixed(1) + "%");
    });
  }, { passive: true });

  // Cahaya lembut mengikuti kursor (desktop)
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const glow = H(`<div class="rb-cursor" aria-hidden="true"></div>`);
    body.append(glow);
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy, jalan = false;
    const loop = () => {
      gx += (tx - gx) * .12; gy += (ty - gy) * .12;
      glow.style.transform = `translate(${gx}px,${gy}px)`;
      if (Math.abs(tx - gx) + Math.abs(ty - gy) > .5) requestAnimationFrame(loop); else jalan = false;
    };
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX; ty = e.clientY; glow.classList.add("on");
      if (!jalan) { jalan = true; requestAnimationFrame(loop); }
    }, { passive: true });
    doc.addEventListener("pointerleave", () => glow.classList.remove("on"));
  }

  // Header mengecil saat digulir
  const header = q(".site-header");
  const cekGulir = () => header?.classList.toggle("rb-scrolled", scrollY > 24);
  addEventListener("scroll", cekGulir, { passive: true }); cekGulir();

  // Pintasan di Spotlight & tombol bawah: buka pop up baru lewat event kustom
  addEventListener("rb:riwayat", bukaRiwayat);
  addEventListener("rb:jam", bukaJam);
})();

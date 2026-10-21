// =====================================================
// [BARU] KACA 26 — lapisan bergaya iOS 26 (Liquid Glass)
// Dimuat paling akhir. Semua fitur lama tetap jalan; file ini hanya menambah:
//  1. Perbaikan nama di layar pembuka agar tidak terpotong
//  2. Pop up "Suka" baru + notifikasi "Dihapus" dengan tombol Urungkan
//  3. Pop up detail produk yang lebih pas (lihat kaca26.css)
//  4. Lembar Pesan custom & Ucapan yang diperbarui (chip, pratinjau langsung)
//  5. Interaksi ala iOS 26: kontrol tersegmentasi bergeser, tab bar mengecil saat
//     digulir, judul besar menyusut, kilau kaca mengikuti gerak HP, tekan "jelly"
// =====================================================
(() => {
  const doc = document, root = doc.documentElement, body = doc.body;
  const q = (s, el = doc) => el.querySelector(s);
  const qa = (s, el = doc) => [...el.querySelectorAll(s)];
  const H = (h) => { const t = doc.createElement("template"); t.innerHTML = h.trim(); return t.content.firstElementChild; };
  const tenang = () => root.dataset.motion === "reduce" || matchMedia("(prefers-reduced-motion: reduce)").matches;
  const getar = (ms = 8) => { try { navigator.vibrate?.(ms); } catch {} };
  const byId = (id) => (typeof PRODUK !== "undefined" ? PRODUK.find((p) => p.id === id) : null);
  const favs = () => (typeof favorit !== "undefined" ? favorit : []);
  const IK = {
    heart: '<path d="M12 20.5s-7.6-4.6-9.6-9.3C1 8 3.1 4.4 6.7 4.4c2.1 0 3.6 1.1 5.3 3.1 1.7-2 3.2-3.1 5.3-3.1 3.6 0 5.7 3.6 4.3 6.8-2 4.7-9.6 9.3-9.6 9.3Z"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    undo: '<path d="M9 7 4.5 11.5 9 16"/><path d="M5 11.5h9a5 5 0 0 1 0 10h-2"/>',
    wa: '<path d="M4.5 19.5l1.2-3.6A7.8 7.8 0 1 1 8.6 18.5z"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    check: '<path d="m5 12.5 4.2 4.2L19 7"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>'
  };
  const ik = (n, c = "") => `<svg class="k-ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${IK[n]}</svg>`;

  // =====================================================
  // 1. NAMA DI PEMBUKA: ukur tinta huruf agar tidak terpotong
  // =====================================================
  function pasNama() {
    const sp = q(".rb-intro-name span");
    if (!sp) return;
    sp.style.fontSize = ""; sp.style.padding = "";
    const cs = getComputedStyle(sp);
    let size = parseFloat(cs.fontSize);
    const ctx = doc.createElement("canvas").getContext("2d");
    const ukur = (s) => { ctx.font = `400 ${s}px ${cs.fontFamily}`; return ctx.measureText(sp.textContent); };
    let m = ukur(size);
    const kiri = () => Math.max(0, m.actualBoundingBoxLeft || 0);
    const kanan = () => Math.max(m.width, m.actualBoundingBoxRight || m.width);
    const batas = Math.min(innerWidth - 40, 980);
    const lebar = kiri() + kanan();
    if (lebar > batas) { size = Math.floor(size * batas / lebar); m = ukur(size); }
    const atas = Math.max(m.actualBoundingBoxAscent || size * .8, size * .8);
    const bawah = Math.max(m.actualBoundingBoxDescent || size * .25, size * .25);
    const padKiri = kiri() + size * .12;
    const padKanan = Math.max(0, kanan() - m.width) + size * .16;
    sp.style.fontSize = size + "px";
    sp.style.lineHeight = "1";
    sp.style.padding = `${Math.max(0, atas - size * .78) + size * .14}px ${padKanan}px ${bawah + size * .12}px ${padKiri}px`;
    sp.parentElement.style.marginLeft = `-${padKiri / 2}px`;
  }
  if (q(".rb-intro")) {
    pasNama();
    Promise.race([doc.fonts?.ready || Promise.resolve(), new Promise((r) => setTimeout(r, 1700))]).then(pasNama);
    doc.fonts?.load?.('400 64px "Brittany Signature"').then(pasNama).catch(() => {});
  }

  // =====================================================
  // 2. POP UP SUKA BARU (gaya iOS 26)
  // =====================================================
  let klik = null;
  doc.addEventListener("pointerdown", (e) => { klik = { x: e.clientX, y: e.clientY, t: Date.now() }; }, true);

  let likeAktif = null, diam = false;
  function popSuka(p) {
    likeAktif?.tutup(true);
    const daftar = favs().map(byId).filter(Boolean);
    const bd = H(`<div class="k-like-bd" role="dialog" aria-modal="true" aria-label="Ditambahkan ke favorit">
      <div class="k-like">
        <div class="k-like-media">
          <img alt="">
          <span class="k-like-glare" aria-hidden="true"></span>
          <button class="k-close" type="button" aria-label="Tutup">
            <svg class="k-ring" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="16"/></svg>${ik("x")}
          </button>
        </div>
        <div class="k-like-heart" aria-hidden="true">
          <span class="k-wave"></span><span class="k-wave w2"></span>
          ${ik("heart", "k-hfill")}
          <span class="k-burst"></span>
        </div>
        <div class="k-like-body">
          <small>Ditambahkan ke Favorit</small>
          <h3></h3>
          <p></p>
          <div class="k-like-stack"></div>
        </div>
        <div class="k-like-act">
          <button class="k-cap ghost" type="button" data-a="ok">Oke</button>
          <button class="k-cap tint" type="button" data-a="lihat">${ik("heart")} Lihat favorit</button>
        </div>
      </div>
    </div>`);
    const kartu = q(".k-like", bd);
    const img = q(".k-like-media img", bd); img.src = p.gambar; img.alt = p.nama;
    q("h3", bd).textContent = p.nama;
    q(".k-like-body p", bd).textContent = `${daftar.length} buket di favoritmu · tersimpan di perangkat ini`;
    const tumpuk = q(".k-like-stack", bd);
    daftar.slice(-6).forEach((x, i) => { const t = H(`<img alt="">`); t.src = x.gambar; t.alt = x.nama; t.style.setProperty("--i", i); tumpuk.append(t); });
    const burst = q(".k-burst", bd);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const s = H(`<i></i>`);
      s.style.cssText = `--dx:${(Math.cos(a) * 56).toFixed(0)}px;--dy:${(Math.sin(a) * 56).toFixed(0)}px;--c:${["#ff5fa8", "#ffb3d6", "#b48cff", "#7fd3ff"][i % 4]}`;
      burst.append(s);
    }
    // muncul dari titik tombol ♡ yang ditekan
    if (klik && Date.now() - klik.t < 1500) {
      bd.style.setProperty("--ox", klik.x - innerWidth / 2 + "px");
      bd.style.setProperty("--oy", klik.y - innerHeight / 2 + "px");
    }
    body.append(bd);
    body.classList.add("bbx-quiet");
    getar([10, 30, 14]);
    requestAnimationFrame(() => bd.classList.add("in"));

    let t, sisa = 4800, mulai = Date.now(), selesai = false;
    const ring = q(".k-ring circle", bd);
    ring.style.animationDuration = sisa + "ms";
    const tutup = (cepat) => {
      if (selesai) return; selesai = true; clearTimeout(t);
      if (likeAktif?.bd === bd) likeAktif = null;
      setTimeout(() => body.classList.remove("bbx-quiet"), 600);
      if (cepat) { bd.remove(); return; }
      bd.classList.remove("in"); bd.classList.add("out");
      setTimeout(() => bd.remove(), 520);
    };
    t = setTimeout(() => tutup(), sisa);
    kartu.addEventListener("pointerenter", () => { clearTimeout(t); sisa -= Date.now() - mulai; bd.classList.add("paused"); });
    kartu.addEventListener("pointerleave", () => { mulai = Date.now(); t = setTimeout(() => tutup(), Math.max(sisa, 900)); bd.classList.remove("paused"); });
    bd.addEventListener("click", (e) => {
      if (e.target === bd || e.target.closest(".k-close,[data-a=ok]")) tutup();
      else if (e.target.closest("[data-a=lihat]")) {
        tutup();
        if (typeof detailBackdrop !== "undefined" && !detailBackdrop.hidden && typeof tutupDetail === "function") tutupDetail();
        setTimeout(() => q("#showFavorites")?.click(), 160);
      }
    });
    // tilt kecil mengikuti jari/kursor
    kartu.addEventListener("pointermove", (e) => {
      const r = kartu.getBoundingClientRect();
      kartu.style.setProperty("--rx", ((e.clientY - r.top) / r.height - .5) * -6 + "deg");
      kartu.style.setProperty("--ry", ((e.clientX - r.left) / r.width - .5) * 8 + "deg");
      kartu.style.setProperty("--gx", ((e.clientX - r.left) / r.width) * 100 + "%");
    });
    kartu.addEventListener("pointerleave", () => { kartu.style.setProperty("--rx", "0deg"); kartu.style.setProperty("--ry", "0deg"); });
    likeAktif = { bd, tutup };
    setTimeout(() => q("[data-a=lihat]", bd)?.focus({ preventScroll: true }), 80);
  }

  // Notifikasi pulau: dihapus dari favorit + Urungkan
  let pulau = null;
  function pulauHapus(p) {
    pulau?.tutup(true);
    const el = H(`<div class="k-island" role="status">
      <img alt=""><div><b>Dihapus dari favorit</b><small></small></div>
      <button type="button" class="k-undo">${ik("undo")} Urungkan</button>
    </div>`);
    q("img", el).src = p.gambar; q("small", el).textContent = p.nama;
    body.append(el);
    body.classList.add("bbx-quiet");
    requestAnimationFrame(() => el.classList.add("in"));
    let selesai = false;
    const tutup = (cepat) => {
      if (selesai) return; selesai = true;
      if (pulau?.el === el) pulau = null;
      setTimeout(() => body.classList.remove("bbx-quiet"), 400);
      if (cepat) { el.remove(); return; }
      el.classList.remove("in"); setTimeout(() => el.remove(), 500);
    };
    const t = setTimeout(() => tutup(), 3800);
    q(".k-undo", el).onclick = () => {
      clearTimeout(t); diam = true;
      if (!favs().includes(p.id) && typeof ubahFavorit === "function") ubahFavorit(p.id);
      diam = false; getar(10);
      el.classList.add("done"); q("b", el).textContent = "Dikembalikan ke favorit";
      setTimeout(() => tutup(), 1100);
    };
    pulau = { el, tutup };
  }

  // Deteksi perubahan favorit (membungkus renderProduk yang sudah ada)
  let favLalu = [...favs()];
  if (typeof renderProduk === "function") {
    const _render = renderProduk;
    renderProduk = function () {
      const hasil = _render.apply(this, arguments);
      try {
        const kini = favs();
        const tambah = kini.filter((id) => !favLalu.includes(id));
        const kurang = favLalu.filter((id) => !kini.includes(id));
        favLalu = [...kini];
        if (!diam && body.classList.contains("entered")) {
          if (tambah.length === 1 && byId(tambah[0])) {
            // tutup pop up suka versi lama yang mungkin ikut muncul
            setTimeout(() => qa(".bbx-like .bbx-x").forEach((x) => x.click()), 150);
            setTimeout(() => popSuka(byId(tambah[0])), 90);
          } else if (kurang.length === 1 && byId(kurang[0]) && !q("#rbFavorit")) pulauHapus(byId(kurang[0]));
        }
      } catch {}
      return hasil;
    };
  }
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && likeAktif) { likeAktif.tutup(); e.stopImmediatePropagation(); }
  }, true);

  // =====================================================
  // 3. DETAIL PRODUK: penanda geser & kelas tata letak
  // =====================================================
  const modal = q(".detail-modal");
  if (modal) {
    modal.classList.add("k-detail");
    modal.prepend(H(`<span class="k-grab" aria-hidden="true"></span>`));
    // tombol navigasi & tutup dikelompokkan dalam satu kapsul kaca
    const grup = H(`<div class="k-detail-tools"></div>`);
    modal.append(grup);
    const rapikan = () => {
      ["dnav p", "dnav n"].forEach((k) => { const b = q("." + k.replace(" ", "."), modal); if (b && b.parentElement !== grup) grup.append(b); });
      const x = q(".modal-close", modal); if (x && x.parentElement !== grup) grup.append(x);
      const acts = q(".detail-actions", modal);
      if (acts && !acts.dataset.k) {
        acts.dataset.k = "1";
        const tombol = qa(".button", acts);
        tombol.forEach((b, i) => b.classList.add(i === 0 ? "k-act-main" : "k-act-sub"));
      }
    };
    new MutationObserver(rapikan).observe(modal, { childList: true, subtree: true });
    rapikan();
  }

  // =====================================================
  // 4. LEMBAR PESAN CUSTOM & UCAPAN
  // =====================================================
  const lembar = q(".sheet-bd .sheet");
  if (lembar) {
    lembar.classList.add("k-sheet");
    const pane1 = q('[data-pane="1"]', lembar), pane2 = q('[data-pane="2"]', lembar);
    const setNilai = (el, v) => { el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); };
    const chipBaris = (opsi, aktif, onPilih, kelas = "") => {
      const row = H(`<div class="k-chips ${kelas}" role="radiogroup"></div>`);
      opsi.forEach(([label, nilai]) => {
        const b = H(`<button type="button" role="radio"></button>`);
        b.textContent = label; b.dataset.v = nilai;
        b.onclick = () => { qa("button", row).forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", String(x === b)); }); onPilih(nilai); getar(6); };
        if (nilai === aktif) { b.classList.add("on"); b.setAttribute("aria-checked", "true"); }
        row.append(b);
      });
      return row;
    };

    if (pane1) {
      pane1.classList.add("k-form");
      const nama = q("#cNama"), acara = q("#cAcara"), budget = q("#cBudget"), tgl = q("#cTgl"), ucap = q("#cUcap");
      pane1.prepend(H(`<div class="k-pane-head"><span class="k-pane-ic">✿</span><div><h4>Pesan buket custom</h4><p>Isi seperlunya, pesan WhatsApp tersusun otomatis.</p></div></div>`));
      // chip acara (tetap sinkron dengan pilihan lama)
      if (acara) {
        const opsi = [...acara.options].map((o) => [o.textContent, o.value || o.textContent]);
        const row = chipBaris(opsi, acara.value, (v) => setNilai(acara, v));
        acara.classList.add("k-hide"); acara.after(row);
        acara.addEventListener("change", () => qa("button", row).forEach((x) => x.classList.toggle("on", x.dataset.v === acara.value)));
      }
      // budget cepat + format Rupiah
      if (budget) {
        const info = H(`<small class="k-help"></small>`);
        const row = chipBaris([["100rb", "100000"], ["150rb", "150000"], ["250rb", "250000"], ["500rb", "500000"]], "", (v) => setNilai(budget, v), "small");
        budget.after(row, info);
        const fmt = () => {
          const n = +String(budget.value).replace(/\D/g, "");
          info.textContent = n ? `≈ Rp ${n.toLocaleString("id-ID")}` : "Boleh dikosongkan bila belum pasti";
          qa("button", row).forEach((x) => x.classList.toggle("on", x.dataset.v === String(n)));
        };
        budget.addEventListener("input", fmt); fmt();
      }
      // tanggal cepat
      if (tgl) {
        const iso = (d) => { const z = new Date(d); z.setMinutes(z.getMinutes() - z.getTimezoneOffset()); return z.toISOString().slice(0, 10); };
        const hari = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
        const row = chipBaris([["Hari ini", hari(0)], ["Besok", hari(1)], ["Lusa", hari(2)], ["Minggu depan", hari(7)]], "", (v) => setNilai(tgl, v), "small");
        tgl.min = hari(0);
        tgl.after(row);
        tgl.addEventListener("change", () => qa("button", row).forEach((x) => x.classList.toggle("on", x.dataset.v === tgl.value)));
      }
      // hitung karakter ucapan
      if (ucap) {
        const c = H(`<small class="k-help right"><span>0</span>/200</small>`);
        ucap.maxLength = 200; ucap.after(c);
        const hit = () => (q("span", c).textContent = ucap.value.length);
        ucap.addEventListener("input", hit); hit();
      }
      // pratinjau pesan WhatsApp langsung
      const pv = H(`<div class="k-preview"><div class="k-pv-top">${ik("wa")}<b>Pratinjau pesan</b><small>WhatsApp</small></div><div class="k-bubble"><p></p><time></time></div></div>`);
      q("#cSend", pane1)?.before(pv);
      const tulis = () => {
        const v = (el) => (el?.value || "").trim() || "-";
        const tglTeks = tgl?.value ? new Date(tgl.value + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" }) : "-";
        const n = +String(budget?.value || "").replace(/\D/g, "");
        q("p", pv).textContent = ["Halo Beauty Bukett Singosari, saya ingin pesan buket custom:", "", `Nama: ${v(nama)}`, `Acara: ${acara?.value || "-"}`, `Budget: ${n ? "Rp " + n.toLocaleString("id-ID") : v(budget)}`, `Tanggal dibutuhkan: ${tglTeks}`, `Ucapan kartu: ${v(ucap)}`].join("\n");
        const d = new Date(); q("time", pv).textContent = `${String(d.getHours()).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")} ✓✓`;
      };
      [nama, acara, budget, tgl, ucap].forEach((el) => el?.addEventListener("input", tulis));
      [acara, tgl].forEach((el) => el?.addEventListener("change", tulis));
      tulis();
      // Isi ucapan dari tab Ucapan juga memperbarui pratinjau
      new MutationObserver(tulis).observe(pane1, { attributes: true, attributeFilter: ["hidden"] });
    }

    if (pane2) {
      pane2.classList.add("k-form");
      const gNama = q("#gNama"), gAcara = q("#gAcara"), out = q("#gOut");
      pane2.prepend(H(`<div class="k-pane-head"><span class="k-pane-ic violet">✎</span><div><h4>Ide ucapan kartu</h4><p>Tulis nama penerima, pilih acara, lalu salin atau pakai.</p></div></div>`));
      if (gAcara) {
        const opsi = [...gAcara.options].map((o) => [o.textContent, o.value || o.textContent]);
        const row = chipBaris(opsi, gAcara.value, (v) => setNilai(gAcara, v));
        gAcara.classList.add("k-hide"); gAcara.after(row);
      }
      // hias setiap kartu ucapan yang dibuat kode lama
      const hias = () => {
        qa(".gr", out).forEach((g, i) => {
          if (g.dataset.k) return;
          g.dataset.k = "1"; g.style.setProperty("--i", i);
          g.classList.add("k-quote");
          const [salin, pakai] = qa("button", g);
          if (salin) {
            salin.classList.add("k-mini"); salin.innerHTML = `${ik("copy")} Salin`;
            salin.addEventListener("click", () => { salin.classList.add("ok"); salin.innerHTML = `${ik("check")} Tersalin`; getar(8); setTimeout(() => { salin.classList.remove("ok"); salin.innerHTML = `${ik("copy")} Salin`; }, 1600); });
          }
          if (pakai) { pakai.classList.add("k-mini", "tint"); pakai.innerHTML = `${ik("spark")} Pakai di pesan custom`; }
        });
      };
      if (out) new MutationObserver(hias).observe(out, { childList: true });
      hias();
      if (gNama) gNama.placeholder = "Contoh: Rina";
    }
  }

  // =====================================================
  // 5. INTERAKSI ALA iOS 26
  // =====================================================
  // a) Kontrol tersegmentasi dengan "lensa" yang bergeser
  function segmen(wadah, selAktif) {
    if (!wadah || wadah.querySelector(":scope > .k-thumb")) return;
    wadah.classList.add("k-seg");
    const th = H(`<span class="k-thumb" aria-hidden="true"></span>`);
    wadah.prepend(th);
    let lalu = null;
    const geser = () => {
      const a = q(selAktif, wadah);
      if (!a || !a.offsetWidth) { th.style.opacity = "0"; return; }
      th.style.opacity = "1";
      th.style.width = a.offsetWidth + "px"; th.style.height = a.offsetHeight + "px";
      th.style.transform = `translate(${a.offsetLeft}px,${a.offsetTop}px)`;
      if (lalu && lalu !== a && !tenang()) th.animate([{ borderRadius: "999px" }, { borderRadius: "40% / 999px", filter: "brightness(1.08)" }, { borderRadius: "999px" }], { duration: 550, easing: "cubic-bezier(.22,1,.36,1)" });
      lalu = a;
    };
    // hanya bereaksi pada perubahan kelas tombol (bukan lensa itu sendiri / efek tekan)
    new MutationObserver((ms) => {
      if (ms.some((m) => m.target !== th && m.target.parentElement === wadah && !(m.oldValue || "").includes("k-jelly") && !m.target.classList.contains("k-jelly"))) geser();
    }).observe(wadah, { subtree: true, attributes: true, attributeFilter: ["class"], attributeOldValue: true });
    addEventListener("resize", geser);
    new ResizeObserver(geser).observe(wadah);
    geser();
  }
  segmen(q(".sheet .seg"), "button.on");
  segmen(q(".filter-pills"), ".filter-pill.active");
  qa(".chip-select").forEach((c) => segmen(c, "button.on"));

  // b) Tab bar & header mengecil saat menggulir ke bawah, kembali saat ke atas
  let yLalu = scrollY, rafG = 0;
  const gulir = () => {
    rafG = 0;
    const y = scrollY, d = y - yLalu;
    if (Math.abs(d) > 6) { root.classList.toggle("k-min", d > 0 && y > 140); yLalu = y; }
    // judul besar menyusut
    root.style.setProperty("--k-t", Math.min(Math.max(y / 180, 0), 1).toFixed(3));
    // sudut kilau kaca ikut bergeser saat menggulir
    root.style.setProperty("--k-sheen", (y * .04 % 360).toFixed(1) + "deg");
  };
  addEventListener("scroll", () => { if (!rafG) rafG = requestAnimationFrame(gulir); }, { passive: true });
  gulir();
  q(".mobile-nav")?.addEventListener("click", () => root.classList.remove("k-min"));

  // c) Kilau kaca mengikuti kemiringan HP (bila didukung, tanpa minta izin)
  addEventListener("deviceorientation", (e) => {
    if (e.gamma == null) return;
    root.style.setProperty("--k-tx", Math.max(-1, Math.min(1, e.gamma / 35)).toFixed(3));
    root.style.setProperty("--k-ty", Math.max(-1, Math.min(1, (e.beta - 45) / 35)).toFixed(3));
  }, { passive: true });
  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    root.style.setProperty("--k-tx", (e.clientX / innerWidth * 2 - 1).toFixed(3));
    root.style.setProperty("--k-ty", (e.clientY / innerHeight * 2 - 1).toFixed(3));
  }, { passive: true });

  // d) Tekan "jelly": tombol sedikit melar mengikuti arah jari
  const SEL = ".button, .glass-icon, .rb-btn, .k-cap, .rb-status, .quick-tile, .filter-pill, .mobile-nav a, .mobile-nav button, .k-chips button, .seg button, .chip-select button";
  doc.addEventListener("pointerdown", (e) => {
    if (tenang()) return;
    const b = e.target.closest?.(SEL); if (!b) return;
    b.classList.remove("k-jelly"); void b.offsetWidth; b.classList.add("k-jelly");
    if (b.closest(".mobile-nav")) getar(6);
  }, { passive: true });
  doc.addEventListener("animationend", (e) => { if (e.animationName === "kJelly") e.target.classList.remove("k-jelly"); });

  // e) Logo hero miring 3D mengikuti jari/kursor
  const panggung = q(".hero-logo-stage");
  if (panggung) {
    panggung.addEventListener("pointermove", (e) => {
      const r = panggung.getBoundingClientRect();
      panggung.style.setProperty("--lx", ((e.clientX - r.left) / r.width - .5).toFixed(3));
      panggung.style.setProperty("--ly", ((e.clientY - r.top) / r.height - .5).toFixed(3));
    });
    panggung.addEventListener("pointerleave", () => { panggung.style.setProperty("--lx", 0); panggung.style.setProperty("--ly", 0); });
  }

  // f) Tepi gulir kabur ala iOS (atas)
  body.append(H(`<div class="k-edge top" aria-hidden="true"></div>`));

  // g) Kaca membiaskan latar (efek lensa; hanya browser berbasis Chromium)
  if (navigator.userAgentData && !tenang()) {
    body.append(H(`<svg class="k-defs" width="0" height="0" aria-hidden="true" style="position:absolute">
      <filter id="kLensa" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" result="n"/>
        <feGaussianBlur in="n" stdDeviation="2" result="nb"/>
        <feDisplacementMap in="SourceGraphic" in2="nb" scale="38" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </svg>`));
    root.classList.add("k-refract");
  }
})();

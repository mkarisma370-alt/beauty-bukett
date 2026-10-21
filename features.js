// =====================================================
// FITUR TAMBAHAN BEAUTY BUKETT (dimuat setelah script.js)
// Tidak mengubah fitur lama; hanya membungkus fungsi yang ada.
// =====================================================
(() => {
  // Atur sesuai jam operasional sebenarnya (WIB, 24 jam)
  const JAM = { buka: 8, tutup: 21 };
  const INFO = [
    "Setiap buket dirangkai dengan hati ✿",
    "Tanya harga & ketersediaan lewat WhatsApp",
    "Tekan ♡ untuk menyimpan buket favoritmu",
    "Butuh model lain? Pakai Pesan custom"
  ];
  const UCAPAN = {
    "Wisuda": ["Selamat wisuda, {n}! Semua perjuangan akhirnya berbuah manis.", "Congrats, {n}! Semoga ilmunya jadi jalan menuju mimpi-mimpi besar."],
    "Ulang tahun": ["Selamat ulang tahun, {n}! Semoga hari-harimu penuh kebahagiaan.", "Happy birthday, {n}! Semoga semua doamu terkabul tahun ini."],
    "Anniversary": ["Selamat anniversary, {n}! Terima kasih sudah selalu ada.", "Untuk {n}: setiap hari bersamamu adalah hadiah terindah."],
    "Terima kasih": ["Terima kasih banyak, {n}! Kebaikanmu sangat berarti.", "Untuk {n}, dengan penuh rasa syukur."]
  };
  const S = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const L = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const H = (h) => { const t = document.createElement("template"); t.innerHTML = h.trim(); return t.content.firstElementChild; };
  const root = document.documentElement;
  let cart = L("bbCart", []), tipe = "all", lb = null;

  // 1. Mode terang / gelap
  const tema = () => root.dataset.theme || "dark";
  const temaBtn = H(`<button class="glass-icon" type="button" aria-label="Ganti tema" title="Mode terang/gelap"></button>`);
  const ikonTema = () => (temaBtn.textContent = tema() === "dark" ? "☾" : "☀");
  temaBtn.onclick = () => { root.dataset.theme = tema() === "dark" ? "light" : "dark"; S("bbTema", root.dataset.theme); ikonTema(); };
  ikonTema();

  // Bar info berputar
  const infoBar = H(`<div class="info-bar glass" role="status"><span></span></div>`);
  document.body.prepend(infoBar);
  let ii = 0; const it = infoBar.firstChild; it.textContent = INFO[0];
  setInterval(() => { it.classList.add("out"); setTimeout(() => { it.textContent = INFO[++ii % INFO.length]; it.classList.remove("out"); }, 400); }, 4500);

  // 2. Status buka / tutup (waktu WIB)
  const chip = H(`<span class="status-chip glass"><i></i><b></b></span>`);
  const pad = (n) => String(n).padStart(2, "0") + ".00";
  function statusToko() {
    const j = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })).getHours();
    const buka = j >= JAM.buka && j < JAM.tutup;
    chip.classList.toggle("tutup", !buka);
    chip.lastChild.textContent = buka ? `Buka · sampai ${pad(JAM.tutup)}` : `Tutup · buka ${pad(JAM.buka)}`;
  }
  statusToko(); setInterval(statusToko, 60000);

  // 4. Keranjang tanya: tombol di header + bar melayang
  const cartBtn = H(`<button class="glass-icon" type="button" aria-label="Keranjang tanya" title="Keranjang tanya">🛍<span class="count-badge" id="cartCount">0</span></button>`);
  $(".header-actions").prepend(chip, temaBtn, cartBtn);
  const cartBar = H(`<div class="cart-bar glass"><span id="cbText"></span><button class="button button-light" type="button">Lihat</button></div>`);
  document.body.append(cartBar);

  // Sheet bawah: Keranjang | Pesan custom | Ucapan
  const sheet = H(`<div class="sheet-bd" hidden><section class="sheet glass" role="dialog" aria-modal="true">
    <div class="grab"></div>
    <div class="seg"><button data-p="0">Keranjang</button><button data-p="1">Pesan custom</button><button data-p="2">Ucapan</button></div>
    <div data-pane="0"><div id="cartList"></div><button class="button button-light" id="cartSend" type="button">Kirim ke WhatsApp ↗</button></div>
    <div data-pane="1" hidden>
      <label>Nama kamu</label><input id="cNama" placeholder="Nama panggilan">
      <label>Acara</label><select id="cAcara"><option>Wisuda</option><option>Ulang tahun</option><option>Anniversary</option><option>Hadiah</option><option>Lainnya</option></select>
      <label>Budget</label><input id="cBudget" inputmode="numeric" placeholder="Contoh: 150000">
      <label>Tanggal dibutuhkan</label><input id="cTgl" type="date">
      <label>Ucapan di kartu</label><textarea id="cUcap" rows="3" placeholder="Tulis ucapan, atau buat di tab Ucapan"></textarea>
      <button class="button button-light" id="cSend" type="button">Kirim pesanan custom ↗</button></div>
    <div data-pane="2" hidden>
      <label>Nama penerima</label><input id="gNama" placeholder="Nama penerima">
      <label>Acara</label><select id="gAcara">${Object.keys(UCAPAN).map((k) => `<option>${k}</option>`).join("")}</select>
      <div id="gOut"></div></div>
  </section></div>`);
  document.body.append(sheet);
  const panes = $$("[data-pane]", sheet);
  function bukaSheet(p = 0) {
    sheet.hidden = false;
    $$(".seg button", sheet).forEach((b, i) => b.classList.toggle("on", i === p));
    panes.forEach((el) => (el.hidden = +el.dataset.pane !== p));
    if (p === 0) renderCart();
    if (p === 2) renderUcapan();
  }
  $$(".seg button", sheet).forEach((b) => (b.onclick = () => bukaSheet(+b.dataset.p)));
  sheet.onclick = (e) => { if (e.target === sheet) sheet.hidden = true; };
  cartBtn.onclick = cartBar.lastChild.onclick = () => bukaSheet(0);

  // Pesan custom (tidak disimpan di perangkat)
  $("#cSend").onclick = () => {
    const v = (id) => $(id).value.trim() || "-";
    buatPesanWhatsApp(["Halo Beauty Bukett Singosari, saya ingin pesan buket custom:", "", `Nama: ${v("#cNama")}`, `Acara: ${$("#cAcara").value}`, `Budget: ${v("#cBudget")}`, `Tanggal dibutuhkan: ${v("#cTgl")}`, `Ucapan kartu: ${v("#cUcap")}`].join("\n"));
  };

  // 5. Generator ucapan kartu
  function renderUcapan() {
    const n = $("#gNama").value.trim() || "kamu";
    const out = $("#gOut"); out.replaceChildren();
    UCAPAN[$("#gAcara").value].forEach((t) => {
      const teks = t.replaceAll("{n}", n);
      const d = H(`<div class="gr"><p></p><button type="button">Salin</button><button type="button">Pakai di pesan custom</button></div>`);
      d.firstChild.textContent = teks;
      const [a, b] = d.querySelectorAll("button");
      a.onclick = () => navigator.clipboard?.writeText(teks).then(() => tampilkanToast("Ucapan disalin."));
      b.onclick = () => { $("#cUcap").value = teks; bukaSheet(1); };
      out.append(d);
    });
  }
  $("#gNama").oninput = $("#gAcara").onchange = renderUcapan;

  // Isi keranjang
  const simpanCart = () => { S("bbCart", cart); renderCart(); renderProduk(); };
  function ubahCart(id) {
    cart = cart.includes(id) ? cart.filter((x) => x !== id) : [...cart, id];
    tampilkanToast(cart.includes(id) ? "Masuk ke keranjang tanya." : "Dihapus dari keranjang tanya.");
    simpanCart();
  }
  function renderCart() {
    const list = $("#cartList"); list.replaceChildren();
    $("#cartCount").textContent = cart.length;
    $("#cbText").textContent = `${cart.length} buket di keranjang tanya`;
    cartBar.classList.toggle("show", cart.length > 0);
    $("#cartSend").hidden = !cart.length;
    if (!cart.length) list.append(H(`<div class="empty-cart"><img src="foto-utama.jpeg" alt=""><p>Keranjang masih kosong. Tekan 🛍 pada buket untuk menanyakan beberapa sekaligus.</p></div>`));
    cart.map((id) => PRODUK.find((p) => p.id === id)).filter(Boolean).forEach((p) => {
      const r = H(`<div class="ci"><img alt=""><strong></strong><button type="button">Hapus</button></div>`);
      r.firstChild.src = p.gambar; r.children[1].textContent = p.nama;
      r.lastChild.onclick = () => ubahCart(p.id); list.append(r);
    });
  }
  $("#cartSend").onclick = () => buatPesanWhatsApp(["Halo Beauty Bukett Singosari, saya ingin menanyakan beberapa produk:", "", ...cart.map((id, i) => { const p = PRODUK.find((x) => x.id === id); return `${i + 1}. ${p.nama} (kode 0${p.id})`; }), "", "Mohon info harga dan ketersediaannya. Terima kasih."].join("\n"));

  // 11. Filter chip acara/tipe (membungkus filter lama)
  const _filter = dapatkanProdukTersaring;
  dapatkanProdukTersaring = () => _filter().filter((p) => tipe === "all" || (p.tag || []).includes(tipe));
  const chips = H(`<div class="type-chips" aria-label="Filter tipe"></div>`);
  ["all", ...new Set(PRODUK.flatMap((p) => p.tag || []))].forEach((t) => {
    const b = H(`<button type="button">${t === "all" ? "Semua tipe" : t}</button>`);
    b.classList.toggle("on", t === "all");
    b.onclick = () => { tipe = t; [...chips.querySelectorAll("button")].forEach((x) => x.classList.toggle("on", x === b)); renderProduk(); };
    chips.append(b);
  });
  $(".catalog-tools").after(chips);
  const _reset = resetFilter;
  resetFilter = () => { tipe = "all"; [...chips.querySelectorAll("button")].forEach((x, i) => x.classList.toggle("on", !i)); _reset(); };

  // 12. Tampilan grid / daftar
  const vt = H(`<div class="view-toggle"><button type="button" aria-label="Tampilan grid">▦</button><button type="button" aria-label="Tampilan daftar">☰</button></div>`);
  $(".catalog-tools").append(vt);
  const setView = (v) => { productGrid.classList.toggle("list", v === "list"); [...vt.children].forEach((b, i) => b.classList.toggle("on", (i === 1) === (v === "list"))); S("bbView", v); };
  [...vt.children].forEach((b, i) => (b.onclick = () => setView(i ? "list" : "grid")));
  setView(L("bbView", "grid"));

  // 13. Pencarian suara
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    const mic = H(`<button class="mic" type="button" aria-label="Cari dengan suara">🎙</button>`);
    $("#clearSearch").before(mic);
    mic.onclick = () => {
      const r = new SR(); r.lang = "id-ID";
      r.onstart = () => mic.classList.add("on");
      r.onend = () => mic.classList.remove("on");
      r.onresult = (e) => { searchInput.value = e.results[0][0].transcript.replace(/[.,]/g, ""); renderProduk(); };
      r.onerror = () => tampilkanToast("Suara tidak terbaca. Coba lagi.");
      r.start();
    };
  }

  // Tambahan pada tiap kartu setelah render (+ animasi hati & getar)
  const _render = renderProduk;
  renderProduk = () => {
    _render();
    $$(".product-card").forEach((c) => {
      const id = +c.querySelector(".product-number").textContent;
      const p = PRODUK.find((x) => x.id === id); if (!p) return;
      const b = H(`<button class="cart-add${cart.includes(id) ? " in" : ""}" type="button" aria-label="Tambah ${p.nama} ke keranjang tanya">🛍</button>`);
      b.onclick = () => ubahCart(id);
      c.querySelector(".product-media").append(b);
      c.querySelector(".product-title-row").after(H(`<div class="product-tags">${(p.tag || []).map((t) => `<span>${t}</span>`).join("")}</div>`));
    });
    $("#cartCount") && ($("#cartCount").textContent = cart.length);
    cartBar.classList.toggle("show", cart.length > 0);
  };
  productGrid.addEventListener("click", (e) => {
    const f = e.target.closest(".favorite-button"); if (!f || f.classList.contains("is-favorite")) return;
    const r = f.getBoundingClientRect(); navigator.vibrate?.(18);
    for (let i = 0; i < 7; i++) {
      const h = H(`<span class="heart">♥</span>`);
      h.style.cssText = `left:${r.left + 14}px;top:${r.top + 10}px;--x:${(Math.random() - .5) * 90}px;--y:${-30 - Math.random() * 70}px`;
      document.body.append(h); setTimeout(() => h.remove(), 950);
    }
  }, true);

  // 15. Efek miring 3D + sorot kaca pada kartu (mouse)
  productGrid.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const c = e.target.closest(".product-card"); if (!c) return;
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.style.transform = `perspective(900px) rotateX(${(.5 - y) * 6}deg) rotateY(${(x - .5) * 8}deg) translateY(-6px)`;
    c.style.setProperty("--mx", x * 100 + "%"); c.style.setProperty("--my", y * 100 + "%");
  });
  productGrid.addEventListener("pointerout", (e) => { const c = e.target.closest(".product-card"); if (c && !c.contains(e.relatedTarget)) c.style.transform = ""; });

  // Detail: navigasi, bagikan, zoom, serupa, keranjang, deep link
  const modal = $(".detail-modal");
  const nav = H(`<span><button class="dnav p" type="button" aria-label="Sebelumnya">‹</button><button class="dnav n" type="button" aria-label="Berikutnya">›</button></span>`);
  modal.append(...nav.children);
  const step = (d) => { const i = PRODUK.findIndex((p) => p.id === produkAktif.id); bukaDetail(PRODUK[(i + d + PRODUK.length) % PRODUK.length].id); };
  $(".dnav.p").onclick = () => step(-1); $(".dnav.n").onclick = () => step(1);
  let tx = 0;
  detailBackdrop.addEventListener("touchstart", (e) => (tx = e.touches[0].clientX), { passive: true });
  detailBackdrop.addEventListener("touchend", (e) => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 70 && produkAktif) step(d < 0 ? 1 : -1); }, { passive: true });

  const _buka = bukaDetail;
  bukaDetail = (id) => {
    _buka(id);
    const p = PRODUK.find((x) => x.id === id); if (!p) return;
    history.replaceState(null, "", `#produk-${id}`);
    const img = $(".detail-main-image");
    img.onclick = () => { lb = H(`<div class="lb"><img alt=""></div>`); lb.firstChild.src = img.src; lb.onclick = tutupLb; document.body.append(lb); };
    $(".detail-copy .eyebrow").after(H(`<div class="detail-tags">${(p.tag || []).map((t) => `<span>${t}</span>`).join("")}</div>`));
    const act = $(".detail-actions");
    const kb = H(`<button class="button button-glass" type="button"></button>`);
    const labelKb = () => (kb.textContent = cart.includes(id) ? "🛍 Hapus dari keranjang tanya" : "🛍 Masukkan ke keranjang tanya");
    labelKb(); kb.onclick = () => { ubahCart(id); labelKb(); };
    const sb = H(`<button class="button button-glass" type="button">Bagikan buket ↗</button>`);
    sb.onclick = () => {
      const url = location.href.split("#")[0] + `#produk-${id}`;
      if (navigator.share) navigator.share({ title: p.nama, text: `Lihat ${p.nama} dari Beauty Bukett`, url }).catch(() => {});
      else navigator.clipboard?.writeText(url).then(() => tampilkanToast("Tautan buket disalin."));
    };
    act.append(kb, sb);
    const mirip = PRODUK.filter((x) => x.id !== id).sort((a, b) => (b.tag || []).filter((t) => (p.tag || []).includes(t)).length - (a.tag || []).filter((t) => (p.tag || []).includes(t)).length).slice(0, 3);
    const rel = H(`<div class="detail-related"><small>Buket serupa</small><div></div></div>`);
    mirip.forEach((m) => { const b = H(`<button type="button"><img alt=""></button>`); b.firstChild.src = m.gambar; b.firstChild.alt = m.nama; b.title = m.nama; b.onclick = () => bukaDetail(m.id); rel.lastChild.append(b); });
    $(".detail-copy").append(rel);
  };
  const _tutup = tutupDetail;
  tutupDetail = () => { _tutup(); history.replaceState(null, "", location.pathname + location.search); };
  const tutupLb = () => { lb?.remove(); lb = null; };
  const dariHash = () => { const m = location.hash.match(/^#produk-(\d+)$/); if (m && detailBackdrop.hidden) bukaDetail(+m[1]); };
  addEventListener("hashchange", dariHash);

  // Pasang ulang handler lama agar memakai fungsi yang sudah diperluas
  searchInput.removeEventListener("input", _render);
  searchInput.addEventListener("input", () => renderProduk());
  $("#resetFilters").removeEventListener("click", _reset);
  $("#resetFilters").addEventListener("click", () => resetFilter());
  $("#closeDetail").removeEventListener("click", _tutup);
  $("#closeDetail").addEventListener("click", () => tutupDetail());

  // Papan ketik: Esc untuk lapisan baru, panah di detail, "/" untuk cari
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (lb) { tutupLb(); e.stopImmediatePropagation(); }
      else if (!sheet.hidden) { sheet.hidden = true; e.stopImmediatePropagation(); }
    } else if (!detailBackdrop.hidden && produkAktif) {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    } else if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      e.preventDefault(); $("#koleksi").scrollIntoView({ behavior: "smooth" }); setTimeout(() => searchInput.focus({ preventScroll: true }), 400);
    }
  }, true);

  // 14. Kembali ke atas dengan cincin progres
  const top = H(`<button class="to-top glass" type="button" aria-label="Kembali ke atas"><svg viewBox="0 0 46 46"><circle cx="23" cy="23" r="20"/></svg>↑</button>`);
  document.body.append(top);
  top.onclick = () => scrollTo({ top: 0, behavior: "smooth" });
  addEventListener("scroll", () => {
    const d = root.scrollHeight - root.clientHeight, p = d > 0 ? root.scrollTop / d : 0;
    top.classList.toggle("show", root.scrollTop > 500);
    top.querySelector("circle").style.strokeDashoffset = 126 * (1 - p);
  }, { passive: true });

  // Bar navigasi aktif sesuai bagian halaman + muncul perlahan
  const links = $$('.desktop-nav a, .mobile-nav a');
  const spy = new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  $$("#beranda,#koleksi,#tentang,#kontak").forEach((s) => spy.observe(s));
  const rv = new IntersectionObserver((es) => es.forEach((en) => en.isIntersecting && (en.target.classList.add("in"), rv.unobserve(en.target))), { threshold: .12 });
  $$(".section-heading,.about-glass,.contact-card").forEach((el) => { el.classList.add("rv"); rv.observe(el); });

  renderProduk();
  dariHash();
})();

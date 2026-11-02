/* =========================================================
   DompetKu — logika aplikasi
   ========================================================= */
(function () {
  'use strict';
  const VERSI = '1.0.0';

  // ---------- Utilitas dasar ----------
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* penyimpanan penuh/diblokir */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* abaikan */ } }
  };
  const nf = new Intl.NumberFormat('id-ID');
  const rp = n => (n < 0 ? '−' : '') + 'Rp ' + nf.format(Math.round(Math.abs(n || 0)));
  const pad2 = n => String(n).padStart(2, '0');
  const iso = d => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  const parseIso = s => { const p = String(s).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const startToday = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
  const todayIso = () => iso(new Date());
  const dayDiff = (a, b) => Math.round((b - a) / 864e5);
  const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const tglPanjang = s => { const d = parseIso(s); return HARI[d.getDay()] + ', ' + d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear(); };
  const tglPendek = s => { const d = parseIso(s); return d.getDate() + ' ' + BLN[d.getMonth()] + ' ' + d.getFullYear(); };
  const relHari = s => s === todayIso() ? 'Hari ini' : s === iso(addDays(new Date(), -1)) ? 'Kemarin' : tglPanjang(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const newId = () => 'A' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  const KAT_AWAL = {
    masuk: ['Gaji', 'Honor & Insentif', 'Bonus & THR', 'Usaha Sampingan', 'Hasil Investasi', 'Hadiah', 'Pengembalian Dana', 'Lainnya'],
    keluar: ['Makan & Minum', 'Belanja Harian', 'Transportasi', 'Tagihan & Utilitas', 'Pulsa & Internet', 'Kesehatan',
      'Pendidikan', 'Rumah Tangga', 'Pakaian & Perawatan', 'Hiburan & Liburan', 'Sosial & Donasi', 'Cicilan & Utang',
      'Tabungan & Investasi', 'Lainnya'],
    metode: ['Tunai', 'Transfer', 'QRIS']
  };
  const EMO = [[/makan|minum|kuliner|jajan|kopi/, '🍜'], [/belanja/, '🛒'], [/transport|bensin|parkir|ojek/, '🚗'],
    [/tagihan|listrik|utilitas|pdam/, '💡'], [/pulsa|internet|kuota/, '📱'], [/kesehatan|obat|dokter/, '💊'],
    [/pendidikan|sekolah|kursus|buku/, '🎓'], [/rumah/, '🏠'], [/pakaian|perawatan|salon/, '👕'], [/hiburan|liburan|wisata/, '🎬'],
    [/sosial|donasi|zakat|sedekah|infaq/, '🤝'], [/cicilan|utang|kredit/, '💳'], [/tabungan/, '🏦'], [/gaji/, '💼'],
    [/honor|insentif/, '🧾'], [/bonus|thr/, '🎁'], [/usaha|jualan|bisnis/, '🏪'], [/investasi|saham|dividen/, '📈'],
    [/hadiah/, '🎉'], [/pengembalian|refund/, '↩️'], [/lain/, '✨']];
  const emo = (k, j) => { const s = String(k).toLowerCase(); for (const [r, e] of EMO) if (r.test(s)) return e; return j === 'masuk' ? '💰' : '🏷️'; };
  const C_IN = '#1baf7a', C_OUT = '#e34948';

  const ICON = {
    up: '<svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 8v9H8"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    cloud: '<svg viewBox="0 0 24 24"><path d="M3 3l18 18M8 8a5 5 0 0 0-3.9 8.1A4 4 0 0 0 7 18h10M16.5 9.6A6 6 0 0 1 21 15.4"/></svg>',
    sync: '<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.34 5.66M20 4v7h-7"/></svg>',
    sheet: '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 3v18"/></svg>',
    tag: '<svg viewBox="0 0 24 24"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
    key: '<svg viewBox="0 0 24 24"><circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 9.2-9.2M17 6l3 3M15 8l2 2"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg>',
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
    link: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>'
  };
  const ILUS = `<svg class="ill" viewBox="0 0 120 96"><defs><linearGradient id="ig" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#4f7cff"/><stop offset="1" stop-color="#a855f7"/></linearGradient></defs>
    <ellipse cx="60" cy="88" rx="38" ry="5" fill="#eef0f6"/><rect x="18" y="26" width="84" height="56" rx="14" fill="url(#ig)" opacity=".95"/>
    <rect x="18" y="20" width="70" height="20" rx="10" fill="#c7d2fe"/><rect x="70" y="44" width="36" height="22" rx="11" fill="#fff" opacity=".95"/>
    <circle cx="82" cy="55" r="4" fill="#7b61ff"/><path d="M30 64h22" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/></svg>`;

  // ---------- State ----------
  const S = {
    cfg: LS.get('dk_cfg', null),
    server: LS.get('dk_cache', { transaksi: [], kategori: null, waktu: null, url: '' }),
    queue: LS.get('dk_queue', []),
    pref: LS.get('dk_pref', { metode: 'Tunai', jenis: 'keluar', hideTip: false }),
    period: LS.get('dk_period', { key: 'bulan' }),
    view: 'beranda',
    syncing: false, again: false, inflight: new Set(), lastError: null,
    hf: { jenis: 'semua', kat: '', waktu: 'semua', dari: '', sampai: '', q: '', limit: 80 },
    an: { katJenis: 'keluar', tren: 'harian' }
  };
  let _all = null;
  const dirty = () => { _all = null; };
  const simpanQueue = () => { LS.set('dk_queue', S.queue); dirty(); };
  const kategori = () => S.server.kategori || KAT_AWAL;

  /** Data server + perubahan yang belum terkirim (optimistic) */
  function allTx() {
    if (_all) return _all;
    const m = new Map(S.server.transaksi.map(t => [t.id, t]));
    for (const op of S.queue) {
      if (op.type === 'add' || op.type === 'update') m.set(op.tx.id, Object.assign({}, op.tx, { pending: true }));
      else if (op.type === 'delete') m.delete(op.id);
    }
    _all = Array.from(m.values()).sort((a, b) => b.tanggal.localeCompare(a.tanggal) || String(b.dibuat || '').localeCompare(String(a.dibuat || '')));
    return _all;
  }

  // ---------- Antrian (mode offline) ----------
  function enqueue(op) {
    op.qid = newId();
    const bebas = q => !S.inflight.has(q.qid);
    if (op.type === 'update') {
      const ada = S.queue.find(q => bebas(q) && (q.type === 'add' || q.type === 'update') && q.tx.id === op.tx.id);
      if (ada) { ada.tx = op.tx; simpanQueue(); return; }
    }
    if (op.type === 'delete') {
      const addTertunda = S.queue.some(q => bebas(q) && q.type === 'add' && q.tx.id === op.id);
      S.queue = S.queue.filter(q => !(bebas(q) && (q.type === 'add' || q.type === 'update') && q.tx.id === op.id));
      if (addTertunda) { simpanQueue(); return; } // belum pernah sampai server
    }
    S.queue.push(op);
    simpanQueue();
  }

  // ---------- API ----------
  async function api(action, payload) {
    if (S.cfg && S.cfg.url === 'demo') return demoApi(action, payload || {});
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);
    let res;
    try {
      res = await fetch(S.cfg.url, {
        method: 'POST', redirect: 'follow', signal: ctrl.signal,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(Object.assign({ action, pin: S.cfg.pin }, payload || {}))
      });
    } catch (e) {
      const err = new Error(e.name === 'AbortError' ? 'Koneksi terlalu lama.' : 'Tidak ada koneksi internet.');
      err.network = true; throw err;
    } finally { clearTimeout(timer); }
    let j;
    try { j = await res.json(); } catch (e) {
      const err = new Error('Server tidak merespons dengan benar. Cek URL Web App dan pastikan akses deploy "Siapa saja" (Anyone).');
      err.code = 'BAD_RESPONSE'; throw err;
    }
    if (!j.ok) { const err = new Error(j.error || 'Terjadi kesalahan.'); err.code = j.code; throw err; }
    return j.data;
  }

  function terapkanServer(d) {
    S.server = { transaksi: d.transaksi || [], kategori: d.kategori || null, waktu: d.waktu || new Date().toISOString(), url: d.url || S.server.url || '' };
    LS.set('dk_cache', S.server);
    dirty();
  }

  async function sinkron(opt) {
    opt = opt || {};
    if (!S.cfg) return;
    if (S.syncing) { S.again = true; S.againOpt = opt; return; }
    if (!navigator.onLine) {
      if (opt.notify) toast('info', 'Kamu sedang offline. Tersimpan di HP dan akan dikirim otomatis saat online.');
      setSync(); return;
    }
    S.syncing = true; setSync();
    const ops = S.queue.slice();
    ops.forEach(o => S.inflight.add(o.qid));
    try {
      const d = ops.length ? await api('batch', { ops }) : await api('list');
      if (ops.length) {
        const selesai = new Set(), gagal = [];
        (d.hasil || []).forEach(h => { selesai.add(h.qid); if (!h.ok) gagal.push(h); });
        S.queue = S.queue.filter(q => !selesai.has(q.qid));
        simpanQueue();
        if (gagal.length) toast('err', 'Gagal menyimpan: ' + gagal[0].error);
        else if (opt.notify) toast('ok', opt.notify);
        else toast('ok', ops.length + ' transaksi tertunda berhasil dikirim ke spreadsheet');
      } else if (opt.notify) toast('ok', opt.notify);
      terapkanServer(d);
      S.lastError = null;
    } catch (e) {
      S.lastError = e;
      if (e.network) { if (opt.notify) toast('info', 'Koneksi bermasalah. Tersimpan di HP dan akan dikirim otomatis.'); }
      else if (e.code === 'BAD_PIN') toast('err', 'PIN ditolak server. Buka Pengaturan → Ganti URL / PIN.');
      else toast('err', e.message);
    } finally {
      ops.forEach(o => S.inflight.delete(o.qid));
      S.syncing = false;
      setSync();
      render();
      if (S.again) { S.again = false; const o = S.againOpt; S.againOpt = null; sinkron(o); }
    }
  }

  function setSync() {
    const pill = $('#syncPill'), txt = pill.querySelector('.txt');
    const n = S.queue.length;
    let cls = 'ok', t = 'Tersinkron';
    if (S.syncing) { cls = 'busy'; t = 'Menyimpan…'; }
    else if (!navigator.onLine) { cls = n ? 'wait' : 'off'; t = n ? n + ' menunggu' : 'Offline'; }
    else if (S.lastError && !S.lastError.network) { cls = 'err'; t = 'Gagal sinkron'; }
    else if (n) { cls = 'wait'; t = n + ' menunggu'; }
    else if (S.cfg && S.cfg.url === 'demo') { cls = 'ok'; t = 'Mode contoh'; }
    pill.className = 'sync-pill ' + cls;
    txt.textContent = t;
    $('#refreshBtn').classList.toggle('spin', S.syncing);
  }

  // ---------- Toast ----------
  function toast(type, msg) {
    const box = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = `<span class="ti">${type === 'ok' ? ICON.check : type === 'err' ? ICON.x : ICON.cloud}</span><span>${esc(msg)}</span>`;
    box.appendChild(el);
    while (box.children.length > 3) box.firstChild.remove();
    const tutup = () => { el.classList.add('out'); setTimeout(() => el.remove(), 260); };
    el.addEventListener('click', tutup);
    setTimeout(tutup, type === 'err' ? 5500 : 3200);
  }

  // ---------- Periode ----------
  function rentang(p) {
    p = p || S.period;
    const t = startToday();
    let from, to, prevFrom, label, labelPrev;
    if (p.key === 'hari') { from = to = t; prevFrom = addDays(t, -1); label = 'Hari ini'; labelPrev = 'kemarin'; }
    else if (p.key === 'minggu') { const dow = (t.getDay() + 6) % 7; from = addDays(t, -dow); to = addDays(from, 6); prevFrom = addDays(from, -7); label = 'Minggu ini'; labelPrev = 'minggu lalu'; }
    else if (p.key === 'custom' && p.from && p.to) {
      from = parseIso(p.from); to = parseIso(p.to);
      const len = dayDiff(from, to) + 1; prevFrom = addDays(from, -len);
      label = tglPendek(p.from) + ' – ' + tglPendek(p.to); labelPrev = len + ' hari sebelumnya';
    } else {
      from = new Date(t.getFullYear(), t.getMonth(), 1); to = new Date(t.getFullYear(), t.getMonth() + 1, 0);
      prevFrom = new Date(t.getFullYear(), t.getMonth() - 1, 1); label = BULAN[t.getMonth()] + ' ' + t.getFullYear(); labelPrev = 'bulan lalu';
    }
    const berjalan = p.key !== 'custom' && t < to; // periode masih berlangsung
    const cmpEnd = berjalan ? t : to;
    const len = dayDiff(from, cmpEnd) + 1;
    let prevTo = addDays(prevFrom, len - 1);
    const batasPrev = addDays(from, -1);
    if (prevTo > batasPrev) prevTo = batasPrev;
    const avgEnd = to > t && from <= t ? t : to;
    return { from: iso(from), to: iso(to), cmpEnd: iso(cmpEnd), prevFrom: iso(prevFrom), prevTo: iso(prevTo),
      label, labelPrev: labelPrev + (berjalan ? ' (s.d. hari yang sama)' : ''), hariRata: dayDiff(from, avgEnd) + 1, panjang: dayDiff(from, to) + 1 };
  }

  function hitung(list, from, to) {
    const r = { masuk: 0, keluar: 0, katK: {}, katM: {}, n: 0 };
    for (const t of list) {
      if (t.tanggal < from || t.tanggal > to) continue;
      r.n++;
      if (t.jenis === 'masuk') { r.masuk += t.nominal; r.katM[t.kategori] = (r.katM[t.kategori] || 0) + t.nominal; }
      else { r.keluar += t.nominal; r.katK[t.kategori] = (r.katK[t.kategori] || 0) + t.nominal; }
    }
    r.saldo = r.masuk - r.keluar;
    return r;
  }

  function renderPeriodBars() {
    const p = S.period;
    const items = [['hari', 'Hari ini'], ['minggu', 'Minggu ini'], ['bulan', 'Bulan ini'],
      ['custom', p.key === 'custom' && p.from ? tglPendek(p.from).replace(/ \d{4}$/, '') + ' – ' + tglPendek(p.to).replace(/ \d{4}$/, '') : 'Custom 📅']];
    const html = items.map(([k, l]) => `<button class="pchip ${p.key === k ? 'on' : ''}" data-period="${k}">${esc(l)}</button>`).join('');
    $$('[data-period-bar]').forEach(b => { b.innerHTML = html; });
  }

  // ---------- Komponen ----------
  function txRow(t) {
    const masuk = t.jenis === 'masuk';
    const sub = [t.catatan, t.metode].filter(Boolean).join(' · ') || (masuk ? 'Pemasukan' : 'Pengeluaran');
    return `<button class="tx" data-tx="${esc(t.id)}">
      <span class="tx-ic ${masuk ? 'in' : ''}">${emo(t.kategori, t.jenis)}</span>
      <span class="tx-main"><b>${esc(t.kategori)}</b><span>${esc(sub)}</span></span>
      <span class="tx-amt num ${masuk ? 'in' : 'out'}">${masuk ? '+' : '−'}${rp(t.nominal).replace('−', '')}${t.pending ? '<small>menunggu kirim</small>' : ''}</span>
    </button>`;
  }

  function rankRows(obj, total, jenis, max) {
    const arr = Object.entries(obj).sort((a, b) => b[1] - a[1]);
    let rows = arr;
    if (max && arr.length > max) {
      const sisa = arr.slice(max - 1).reduce((s, x) => s + x[1], 0);
      rows = arr.slice(0, max - 1).concat([['Kategori lain', sisa]]);
    }
    const top = rows.length ? rows[0][1] : 1;
    return '<div class="rank">' + rows.map(([k, v]) => `
      <div class="rank-row"><span class="ic">${k === 'Kategori lain' ? '•••' : emo(k, jenis)}</span>
        <div><div class="rank-top"><b>${esc(k)}</b><span class="num">${rp(v)}<em>${total ? Math.round(v / total * 100) : 0}%</em></span></div>
        <div class="bar-track"><div class="bar-fill ${jenis === 'masuk' ? 'in' : ''}" style="width:${Math.max(2, v / top * 100)}%"></div></div></div>
      </div>`).join('') + '</div>';
  }

  function kosong(judul, teks, tombol) {
    return `<div class="empty card">${ILUS}<h4>${esc(judul)}</h4><p>${esc(teks)}</p>${tombol ? `<button class="btn btn-primary" data-act="add">${esc(tombol)}</button>` : ''}</div>`;
  }

  function skeleton() {
    return `<div class="skel" style="height:190px;border-radius:26px"></div>
      <div class="insights" style="margin-top:14px"><div class="skel" style="height:78px;grid-column:1/-1"></div><div class="skel" style="height:90px"></div><div class="skel" style="height:90px"></div></div>
      <div class="skel" style="height:22px;width:40%;margin:24px 0 12px"></div><div class="skel" style="height:240px"></div>`;
  }

  function deltaBadge(cur, prev) {
    if (!prev && !cur) return '<span class="delta flat">Sama</span>';
    if (!prev) return '<span class="delta flat">Belum ada data</span>';
    const pct = Math.round((cur - prev) / prev * 100);
    if (pct === 0) return '<span class="delta flat">Sama</span>';
    return pct > 0
      ? `<span class="delta up">${ICON.up}${pct}% lebih banyak</span>`
      : `<span class="delta down">${ICON.down}${Math.abs(pct)}% lebih hemat</span>`;
  }

  // ---------- Render: Beranda ----------
  function renderBeranda() {
    const box = $('#berandaBody');
    const all = allTx();
    if (!S.server.waktu && !all.length && (S.syncing || S.firstLoad)) { box.innerHTML = skeleton(); return; }
    const r = rentang();
    const s = hitung(all, r.from, r.to);
    const cmpNow = hitung(all, r.from, r.cmpEnd), prev = hitung(all, r.prevFrom, r.prevTo);
    const sAvg = hitung(all, r.from, iso(addDays(parseIso(r.from), r.hariRata - 1)));
    let html = '';

    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isIOS && !navigator.standalone && !S.pref.hideTip) {
      html += `<div class="card insight wide" style="margin-bottom:12px"><span class="ic">📲</span>
        <div style="flex:1"><b style="font-size:14px">Pasang ke Layar Utama</b><small>Ketuk ikon Bagikan di Safari, lalu “Tambahkan ke Layar Utama”.</small></div>
        <button class="icon-btn" data-act="hideTip" aria-label="Tutup tips">${ICON.x}</button></div>`;
    }

    html += `<section class="hero">
      <p class="hero-label">Saldo bersih · ${esc(r.label)}</p>
      <p class="hero-amount num">${rp(s.saldo)}</p>
      <div class="hero-split">
        <div class="hero-box"><p>${ICON.down}Pemasukan</p><b class="num">${rp(s.masuk)}</b></div>
        <div class="hero-box"><p>${ICON.up}Pengeluaran</p><b class="num">${rp(s.keluar)}</b></div>
      </div></section>`;

    if (!all.length) {
      html += '<div style="margin-top:14px">' + kosong('Belum ada transaksi', 'Catat pemasukan atau pengeluaran pertamamu. Cukup beberapa detik!', '+ Catat transaksi pertama') + '</div>';
      box.innerHTML = html; return;
    }

    const katArr = Object.entries(s.katK).sort((a, b) => b[1] - a[1]);
    const terbesar = katArr[0];
    html += '<div class="section-h"><h3>Insight</h3></div><div class="insights">';
    html += terbesar
      ? `<div class="card insight wide"><span class="ic">${emo(terbesar[0], 'keluar')}</span><div style="flex:1;min-width:0">
          <p>Pengeluaran terbesar</p><b>${esc(terbesar[0])}</b><small class="num">${rp(terbesar[1])} · ${Math.round(terbesar[1] / (s.keluar || 1) * 100)}% dari total pengeluaran</small></div></div>`
      : `<div class="card insight wide"><span class="ic">🌱</span><div><p>Pengeluaran terbesar</p><b>Belum ada pengeluaran</b><small>di periode ini</small></div></div>`;
    html += `<div class="card insight"><p>Rata-rata per hari</p><b class="num">${rp(sAvg.keluar / Math.max(1, r.hariRata))}</b><small>pengeluaran, ${r.hariRata} hari</small></div>`;
    html += `<div class="card insight"><p>Dibanding ${esc(r.labelPrev.replace(/ \(.*\)/, ''))}</p><b style="margin:4px 0">${deltaBadge(cmpNow.keluar, prev.keluar)}</b>
      <small class="num">${rp(cmpNow.keluar)} vs ${rp(prev.keluar)}</small></div>`;
    html += '</div>';

    html += '<div class="section-h"><h3>Pengeluaran per kategori</h3><button data-go="analisis">Detail</button></div>';
    html += katArr.length ? `<div class="card chart-card">${rankRows(s.katK, s.keluar, 'keluar', 5)}</div>`
      : '<div class="card chart-card"><p class="sub" style="margin:0">Belum ada pengeluaran di periode ini.</p></div>';

    html += '<div class="section-h"><h3>Transaksi terbaru</h3><button data-go="riwayat">Lihat semua</button></div>';
    html += `<div class="card tx-list">${all.slice(0, 6).map(txRow).join('')}</div>`;
    box.innerHTML = html;
  }

  // ---------- Render: Riwayat ----------
  function filterRiwayat() {
    const f = S.hf, t = startToday();
    let from = '', to = '';
    if (f.waktu === 'hari') from = to = iso(t);
    else if (f.waktu === 'minggu') { const r = rentang({ key: 'minggu' }); from = r.from; to = r.to; }
    else if (f.waktu === 'bulan') { const r = rentang({ key: 'bulan' }); from = r.from; to = r.to; }
    else if (f.waktu === 'bulanlalu') { from = iso(new Date(t.getFullYear(), t.getMonth() - 1, 1)); to = iso(new Date(t.getFullYear(), t.getMonth(), 0)); }
    else if (f.waktu === 'custom') { from = f.dari; to = f.sampai; }
    const q = f.q.trim().toLowerCase();
    const qAngka = q.replace(/[^\d]/g, '');
    return allTx().filter(x => {
      if (f.jenis !== 'semua' && x.jenis !== f.jenis) return false;
      if (f.kat && x.kategori !== f.kat) return false;
      if (from && x.tanggal < from) return false;
      if (to && x.tanggal > to) return false;
      if (q) {
        const teks = (x.kategori + ' ' + x.catatan + ' ' + x.metode).toLowerCase();
        if (!teks.includes(q) && !(qAngka && qAngka.length === q.replace(/[\s.rp]/g, '').length && String(x.nominal).includes(qAngka))) return false;
      }
      return true;
    });
  }

  function renderRiwayat() {
    const sel = $('#fKat');
    const k = kategori();
    const semuaKat = Array.from(new Set([...k.keluar, ...k.masuk, ...allTx().map(t => t.kategori)])).sort((a, b) => a.localeCompare(b, 'id'));
    const opsi = '<option value="">Semua kategori</option>' + semuaKat.map(c => `<option ${c === S.hf.kat ? 'selected' : ''}>${esc(c)}</option>`).join('');
    if (sel.innerHTML !== opsi) sel.innerHTML = opsi;

    const list = filterRiwayat();
    const box = $('#riwayatList');
    let masuk = 0, keluar = 0;
    list.forEach(t => { if (t.jenis === 'masuk') masuk += t.nominal; else keluar += t.nominal; });
    $('#riwayatSummary').innerHTML = list.length
      ? `<div><p>Pemasukan</p><b class="num" style="color:var(--in)">${rp(masuk)}</b></div><div><p>Pengeluaran</p><b class="num">${rp(keluar)}</b></div>` : '';

    if (!allTx().length) { box.innerHTML = kosong('Riwayat masih kosong', 'Transaksi yang kamu catat akan muncul di sini.', '+ Tambah transaksi'); return; }
    if (!list.length) { box.innerHTML = '<div class="empty"><h4>Tidak ada yang cocok</h4><p>Coba ubah kata kunci atau filter.</p></div>'; return; }

    const tampil = list.slice(0, S.hf.limit);
    const grup = [];
    tampil.forEach(t => { const g = grup[grup.length - 1]; if (g && g.tgl === t.tanggal) g.items.push(t); else grup.push({ tgl: t.tanggal, items: [t] }); });
    box.innerHTML = grup.map(g => {
      const net = g.items.reduce((s, t) => s + (t.jenis === 'masuk' ? t.nominal : -t.nominal), 0);
      return `<div class="day-h"><span>${esc(relHari(g.tgl))}</span><span class="num">${net >= 0 ? '+' : ''}${rp(net)}</span></div>
        <div class="card tx-list">${g.items.map(txRow).join('')}</div>`;
    }).join('') + (list.length > tampil.length ? `<button class="btn btn-soft more-btn" data-act="more">Tampilkan lebih banyak (${list.length - tampil.length} lagi)</button>` : '');
  }

  // ---------- Render: Analisis ----------
  function renderAnalisis() {
    const box = $('#analisisBody');
    const all = allTx();
    if (!all.length) { box.innerHTML = kosong('Belum ada data untuk dianalisis', 'Grafik akan muncul setelah kamu mencatat transaksi.', '+ Tambah transaksi'); return; }
    const r = rentang();
    const s = hitung(all, r.from, r.to);
    const jk = S.an.katJenis;
    const obj = jk === 'keluar' ? s.katK : s.katM, tot = jk === 'keluar' ? s.keluar : s.masuk;
    let html = `<div class="card chart-card">
      <div class="chart-head"><div><h3>Per kategori</h3><p class="sub">${esc(r.label)} · total ${rp(tot)}</p></div>
      <div class="mini-seg" data-an="katJenis"><button data-v="keluar" class="${jk === 'keluar' ? 'on' : ''}">Keluar</button><button data-v="masuk" class="${jk === 'masuk' ? 'on' : ''}">Masuk</button></div></div>
      ${Object.keys(obj).length ? rankRows(obj, tot, jk) : `<p class="sub">Belum ada ${jk === 'keluar' ? 'pengeluaran' : 'pemasukan'} di periode ini.</p>`}
    </div>`;

    const tr = S.an.tren;
    html += `<div class="card chart-card">
      <div class="chart-head"><div><h3>Tren</h3><p class="sub" id="trenSub"></p></div>
      <div class="mini-seg" data-an="tren"><button data-v="harian" class="${tr === 'harian' ? 'on' : ''}">Harian</button><button data-v="bulanan" class="${tr === 'bulanan' ? 'on' : ''}">Bulanan</button></div></div>
      <div class="legend"><span><i style="background:${C_IN}"></i>Pemasukan</span><span><i style="background:${C_OUT}"></i>Pengeluaran</span></div>
      <div class="chart" id="chTren"></div>
    </div>`;

    html += `<div class="card chart-card">
      <h3>Pemasukan vs Pengeluaran</h3><p class="sub">6 bulan terakhir · ketuk batang untuk detail</p>
      <div class="legend"><span><i style="background:${C_IN}"></i>Pemasukan</span><span><i style="background:${C_OUT}"></i>Pengeluaran</span></div>
      <div class="chart" id="chBanding"></div>
      <button class="table-toggle" data-act="tabel">Tampilkan tabel</button>
      <div id="tblBanding" hidden></div>
    </div>`;
    box.innerHTML = html;

    // data tren
    let labels = [], tips = [], vin = [], vout = [];
    if (tr === 'harian') {
      let from = parseIso(r.from), to = parseIso(r.to);
      const t = startToday();
      if (to > t && from <= t) to = t;
      let n = Math.min(dayDiff(from, to) + 1, 120);
      const diperluas = n < 7;
      if (diperluas) n = 14; // periode pendek: tampilkan 14 hari agar tren terlihat
      from = addDays(to, -(n - 1));
      const idx = {};
      for (let i = 0; i < n; i++) { const d = addDays(from, i); idx[iso(d)] = i; labels.push(String(d.getDate())); tips.push(tglPanjang(iso(d))); vin.push(0); vout.push(0); }
      all.forEach(x => { const i = idx[x.tanggal]; if (i === undefined) return; if (x.jenis === 'masuk') vin[i] += x.nominal; else vout[i] += x.nominal; });
      $('#trenSub').textContent = (diperluas ? '14 hari terakhir' : r.label) + ' · per hari';
    } else {
      const b = bulanan(12); labels = b.labels; tips = b.tips; vin = b.vin; vout = b.vout;
      $('#trenSub').textContent = '12 bulan terakhir · per bulan';
    }
    DKChart.line($('#chTren'), { labels, tipLabels: tips, aria: 'Tren pemasukan dan pengeluaran',
      series: [{ name: 'Masuk', color: C_IN, values: vin }, { name: 'Keluar', color: C_OUT, values: vout }] });

    const b6 = bulanan(6);
    DKChart.bars($('#chBanding'), { labels: b6.labels, tipLabels: b6.tips, aria: 'Pemasukan dan pengeluaran 6 bulan terakhir',
      series: [{ name: 'Pemasukan', color: C_IN, values: b6.vin }, { name: 'Pengeluaran', color: C_OUT, values: b6.vout }] });
    $('#tblBanding').innerHTML = `<table class="data-table num"><thead><tr><th>Bulan</th><th>Masuk</th><th>Keluar</th><th>Selisih</th></tr></thead><tbody>` +
      b6.tips.map((m, i) => `<tr><td>${m}</td><td>${rp(b6.vin[i])}</td><td>${rp(b6.vout[i])}</td><td>${rp(b6.vin[i] - b6.vout[i])}</td></tr>`).join('') + '</tbody></table>';
  }

  function bulanan(n) {
    const t = startToday(), labels = [], tips = [], vin = [], vout = [], idx = {};
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(t.getFullYear(), t.getMonth() - i, 1);
      idx[d.getFullYear() + '-' + pad2(d.getMonth() + 1)] = labels.length;
      labels.push(BLN[d.getMonth()]); tips.push(BULAN[d.getMonth()] + ' ' + d.getFullYear()); vin.push(0); vout.push(0);
    }
    allTx().forEach(x => { const i = idx[x.tanggal.slice(0, 7)]; if (i === undefined) return; if (x.jenis === 'masuk') vin[i] += x.nominal; else vout[i] += x.nominal; });
    return { labels, tips, vin, vout };
  }

  // ---------- Render: Pengaturan ----------
  function renderPengaturan() {
    const demo = S.cfg && S.cfg.url === 'demo';
    const n = S.queue.length;
    const waktu = S.server.waktu ? new Date(S.server.waktu) : null;
    const wTxt = waktu ? 'Terakhir sinkron ' + waktu.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Belum pernah sinkron';
    $('#pengaturanBody').innerHTML = `
      <div class="card set-group">
        <div class="set-row"><span class="ic">${ICON.sheet}</span><div><b>${demo ? 'Mode contoh (data tidak disimpan ke spreadsheet)' : 'Terhubung ke Google Sheets'}</b><span>${esc(wTxt)} · ${allTx().length} transaksi</span></div></div>
        <button class="set-row" data-act="sync"><span class="ic">${ICON.sync}</span><div><b>Sinkronkan sekarang</b><span>${n ? n + ' transaksi menunggu dikirim' : 'Semua data sudah terkirim'}</span></div></button>
        ${S.server.url ? `<a class="set-row" href="${esc(S.server.url)}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none"><span class="ic">${ICON.link}</span><div><b>Buka spreadsheet</b><span>Lihat data lengkap di Google Sheets</span></div></a>` : ''}
      </div>
      <div class="card set-group">
        <div class="set-row"><span class="ic">${ICON.tag}</span><div><b>Kategori & metode</b><span>Ubah daftarnya di sheet “Kategori” pada spreadsheet. Aplikasi mengikuti otomatis.</span></div></div>
        <div class="set-row"><span class="ic">${ICON.phone}</span><div><b>Mode offline aktif</b><span>Saat tanpa sinyal, transaksi disimpan di HP lalu dikirim otomatis begitu online.</span></div></div>
      </div>
      <div class="card set-group">
        <button class="set-row danger" data-act="logout"><span class="ic">${ICON.key}</span><div><b>${demo ? 'Keluar dari mode contoh' : 'Ganti URL / PIN'}</b><span>Putuskan perangkat ini & hubungkan ulang</span></div></button>
      </div>
      <p class="set-note">DompetKu v${VERSI} · Data tersimpan di Google Sheets milikmu sendiri.</p>`;
  }

  function render() {
    renderPeriodBars();
    setSync();
    const v = S.view;
    if (v === 'beranda') renderBeranda();
    else if (v === 'riwayat') renderRiwayat();
    else if (v === 'analisis') renderAnalisis();
    else renderPengaturan();
  }

  function pindahView(v) {
    S.view = v;
    $$('.view').forEach(s => s.classList.toggle('active', s.id === 'v-' + v));
    $$('.nav-btn').forEach(b => b.classList.toggle('on', b.dataset.view === v));
    window.scrollTo({ top: 0 });
    render();
  }

  // ---------- Bottom sheet ----------
  function bukaSheet(id) {
    $$('.sheet.show').forEach(s => { if (s.id !== id) tutupSatu(s); });
    const sh = $('#' + id), scrim = $('#scrim');
    sh.hidden = false; scrim.hidden = false;
    sh.scrollTop = 0;
    requestAnimationFrame(() => { sh.classList.add('show'); scrim.classList.add('show'); });
    document.body.style.overflow = 'hidden';
  }
  function tutupSatu(sh) {
    sh.classList.remove('show'); sh.style.transform = '';
    setTimeout(() => { if (!sh.classList.contains('show')) sh.hidden = true; }, 340);
  }
  function tutupSheet() {
    $$('.sheet').forEach(tutupSatu);
    const scrim = $('#scrim');
    scrim.classList.remove('show');
    setTimeout(() => { if (!$$('.sheet.show').length) scrim.hidden = true; }, 260);
    document.body.style.overflow = '';
    if (document.activeElement) document.activeElement.blur();
  }
  function seretTutup(sh) { // geser ke bawah untuk menutup
    let y0 = null, dy = 0;
    sh.addEventListener('touchstart', e => { if (sh.scrollTop > 0 || e.target.closest('input,select,.cats,.quick')) { y0 = null; return; } y0 = e.touches[0].clientY; dy = 0; }, { passive: true });
    sh.addEventListener('touchmove', e => {
      if (y0 === null) return;
      dy = e.touches[0].clientY - y0;
      if (dy > 0) { sh.style.transition = 'none'; sh.style.transform = `translateY(${dy}px)`; }
    }, { passive: true });
    sh.addEventListener('touchend', () => {
      if (y0 === null) return;
      sh.style.transition = '';
      if (dy > 110) tutupSheet(); else sh.style.transform = '';
      y0 = null;
    });
  }

  // ---------- Form transaksi ----------
  const F = { jenis: 'keluar', kategori: null, metode: 'Tunai', edit: null };

  function urutKategori(jenis) {
    const daftar = kategori()[jenis].slice();
    const batas = iso(addDays(new Date(), -120)), cnt = {};
    allTx().forEach(t => { if (t.jenis === jenis && t.tanggal >= batas) cnt[t.kategori] = (cnt[t.kategori] || 0) + 1; });
    const lain = daftar.filter(k => /^lain/i.test(k));
    return daftar.filter(k => !/^lain/i.test(k)).map((k, i) => [k, i]).sort((a, b) => (cnt[b[0]] || 0) - (cnt[a[0]] || 0) || a[1] - b[1]).map(x => x[0]).concat(lain);
  }

  function renderFormPilihan() {
    $$('#tJenis button').forEach(b => b.classList.toggle('on', b.dataset.v === F.jenis));
    let daftar = urutKategori(F.jenis);
    if (F.kategori && !daftar.includes(F.kategori)) daftar = [F.kategori].concat(daftar);
    $('#tKat').innerHTML = daftar.map(k => `<button type="button" class="cat ${k === F.kategori ? 'on' : ''}" data-k="${esc(k)}"><span class="e">${emo(k, F.jenis)}</span>${esc(k)}</button>`).join('');
    let met = kategori().metode.slice();
    if (F.metode && !met.includes(F.metode)) met = met.concat([F.metode]);
    $('#tMetode').innerHTML = met.map(m => `<button type="button" class="${m === F.metode ? 'on' : ''}" data-m="${esc(m)}">${esc(m)}</button>`).join('');
    const tg = $('#tTanggal').value;
    $$('.date-quick button').forEach(b => b.classList.toggle('on', iso(addDays(new Date(), Number(b.dataset.d))) === tg));
  }

  const angkaDari = s => parseInt(String(s).replace(/\D/g, ''), 10) || 0;
  function setNominal(n) { $('#tNominal').value = n ? nf.format(n) : ''; }

  function bukaForm(tx) {
    F.edit = tx || null;
    F.jenis = tx ? tx.jenis : (S.pref.jenis || 'keluar');
    F.kategori = tx ? tx.kategori : null;
    F.metode = tx ? (tx.metode || '') : (S.pref.metode || 'Tunai');
    $('#formTitle').textContent = tx ? 'Edit Transaksi' : 'Tambah Transaksi';
    $('#saveBtn').textContent = tx ? 'Simpan Perubahan' : 'Simpan';
    setNominal(tx ? tx.nominal : 0);
    $('#tTanggal').value = tx ? tx.tanggal : todayIso();
    $('#tCatatan').value = tx ? tx.catatan : '';
    $('#txErr').textContent = '';
    $('#amountWrap').classList.remove('bad');
    renderFormPilihan();
    bukaSheet('formSheet');
    if (!tx) $('#tNominal').focus({ preventScroll: true }); // langsung muncul keyboard angka
  }

  function simpanForm(e) {
    e.preventDefault();
    const n = angkaDari($('#tNominal').value);
    const err = $('#txErr'), wrap = $('#amountWrap');
    if (!n || n <= 0) {
      err.textContent = 'Nominal wajib diisi dan harus lebih dari 0.';
      wrap.classList.remove('bad'); void wrap.offsetWidth; wrap.classList.add('bad');
      $('#tNominal').focus(); return;
    }
    if (!F.kategori) { err.textContent = 'Pilih kategori dulu.'; $('#tKat').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    const tgl = $('#tTanggal').value || todayIso();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tgl)) { err.textContent = 'Tanggal tidak valid.'; return; }
    const lama = F.edit;
    const tx = {
      id: lama ? lama.id : newId(), jenis: F.jenis, tanggal: tgl, nominal: n, kategori: F.kategori,
      metode: F.metode || '', catatan: $('#tCatatan').value.trim().slice(0, 200),
      dibuat: lama ? (lama.dibuat || '') : new Date().toISOString()
    };
    if (lama) {
      const srv = S.server.transaksi.find(t => t.id === tx.id);
      enqueue({ type: 'update', tx, jenisLama: srv ? srv.jenis : lama.jenis });
    } else enqueue({ type: 'add', tx });
    S.pref.metode = F.metode; S.pref.jenis = F.jenis; LS.set('dk_pref', S.pref);
    if (navigator.vibrate) navigator.vibrate(15);
    tutupSheet();
    render();
    sinkron({ notify: lama ? 'Perubahan tersimpan ke spreadsheet' : (F.jenis === 'masuk' ? 'Pemasukan ' : 'Pengeluaran ') + rp(n) + ' tersimpan' });
  }

  // ---------- Detail & hapus ----------
  function bukaDetail(id) {
    const t = allTx().find(x => x.id === id);
    if (!t) return;
    const masuk = t.jenis === 'masuk';
    $('#detailBody').innerHTML = `
      <div class="detail-top">
        <div class="tx-ic ${masuk ? 'in' : ''}">${emo(t.kategori, t.jenis)}</div>
        <p>${masuk ? 'Pemasukan' : 'Pengeluaran'}</p>
        <div class="amt num ${masuk ? 'in' : ''}">${masuk ? '+' : '−'}${rp(t.nominal)}</div>
        ${t.pending ? '<span class="badge-pending">Menunggu dikirim ke spreadsheet</span>' : ''}
      </div>
      <div class="detail-list">
        <div><span>Kategori</span><b>${esc(t.kategori)}</b></div>
        <div><span>Tanggal</span><b>${esc(tglPanjang(t.tanggal))}</b></div>
        <div><span>Metode</span><b>${esc(t.metode || '—')}</b></div>
        <div><span>Catatan</span><b>${esc(t.catatan || '—')}</b></div>
      </div>
      <div class="detail-actions">
        <button class="btn btn-ghost" data-act="hapus" data-id="${esc(t.id)}">Hapus</button>
        <button class="btn btn-primary" data-act="edit" data-id="${esc(t.id)}">Edit</button>
      </div>`;
    bukaSheet('detailSheet');
  }

  function konfirmasi(judul, pesan, ya) {
    return new Promise(res => {
      const w = $('#confirm');
      $('#cTitle').textContent = judul; $('#cMsg').textContent = pesan; $('#cYes').textContent = ya || 'Hapus';
      w.hidden = false;
      const selesai = v => { w.hidden = true; $('#cYes').onclick = $('#cNo').onclick = w.onclick = null; res(v); };
      $('#cYes').onclick = () => selesai(true);
      $('#cNo').onclick = () => selesai(false);
      w.onclick = e => { if (e.target === w) selesai(false); };
      $('#cNo').focus();
    });
  }

  async function hapusTx(id) {
    const t = allTx().find(x => x.id === id);
    if (!t) return;
    const ok = await konfirmasi('Hapus transaksi?', `${t.kategori} · ${rp(t.nominal)} pada ${tglPendek(t.tanggal)}. Baris ini juga akan dihapus dari spreadsheet.`);
    if (!ok) return;
    const srv = S.server.transaksi.find(x => x.id === id);
    enqueue({ type: 'delete', id, jenis: srv ? srv.jenis : t.jenis });
    tutupSheet();
    render();
    if (S.queue.some(q => q.type === 'delete' && q.id === id)) sinkron({ notify: 'Transaksi dihapus' }); else toast('ok', 'Transaksi dihapus');
  }

  // ---------- Setup / login ----------
  function tampilSetup() {
    $('#app').hidden = true; $('#setup').hidden = false;
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isIOS && !navigator.standalone && !$('#iosTip')) {
      $('.setup-card').insertAdjacentHTML('beforebegin',
        '<p id="iosTip" class="card" style="padding:12px 14px;text-align:left;font-size:13px;color:var(--ink-2);margin:0 0 12px">📲 <b>Tips iPhone:</b> pasang dulu ke Layar Utama (Bagikan → Tambahkan ke Layar Utama), lalu hubungkan dari ikon tersebut. Data login di Safari dan di ikon Layar Utama terpisah.</p>');
    }
  }
  function tampilApp() {
    $('#setup').hidden = true; $('#app').hidden = false;
    const h = new Date().getHours();
    $('#hello').textContent = (h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam') + ' 👋';
    $('#todayLabel').textContent = tglPanjang(todayIso());
    render();
  }

  async function hubungkan(e) {
    e.preventDefault();
    const url = $('#setupUrl').value.trim(), pin = $('#setupPin').value.trim();
    const err = $('#setupErr');
    err.textContent = '';
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec\/?$/.test(url)) {
      err.textContent = /\/dev$/.test(url) ? 'Gunakan URL yang berakhiran /exec (bukan /dev).' : 'URL harus berbentuk https://script.google.com/macros/s/…/exec';
      return;
    }
    if (pin.length < 6) { err.textContent = 'PIN minimal 6 karakter.'; return; }
    const btn = $('#setupBtn');
    btn.disabled = true; btn.textContent = 'Menghubungkan…';
    S.cfg = { url, pin };
    try {
      await api('ping');
      LS.set('dk_cfg', S.cfg);
      S.server = { transaksi: [], kategori: null, waktu: null, url: '' };
      S.firstLoad = true;
      tampilApp();
      toast('ok', 'Berhasil terhubung ke spreadsheet!');
      await sinkron();
      S.firstLoad = false; render();
    } catch (ex) {
      S.cfg = null;
      err.textContent = ex.network ? 'Tidak bisa terhubung. Periksa internet atau URL.' : ex.message;
    } finally { btn.disabled = false; btn.textContent = 'Hubungkan'; }
  }

  async function keluar() {
    const n = S.queue.length;
    const ok = await konfirmasi('Putuskan perangkat ini?', n
      ? `Ada ${n} transaksi yang belum terkirim dan akan HILANG. Sinkronkan dulu jika memungkinkan.`
      : 'Data di spreadsheet tetap aman. Kamu perlu memasukkan URL & PIN lagi untuk masuk.', 'Putuskan');
    if (!ok) return;
    ['dk_cfg', 'dk_cache', 'dk_queue'].forEach(LS.del);
    S.cfg = null; S.queue = []; S.server = { transaksi: [], kategori: null, waktu: null, url: '' }; dirty();
    $('#setupPin').value = '';
    tampilSetup();
  }

  // ---------- Mode contoh (demo) ----------
  function demoApi(action, p) {
    let db = LS.get('dk_demo', null);
    if (!db) { db = demoSeed(); LS.set('dk_demo', db); }
    return new Promise(res => setTimeout(() => {
      const out = () => ({ transaksi: db.slice(), kategori: KAT_AWAL, waktu: new Date().toISOString(), url: '' });
      if (action === 'ping') return res({ kategori: KAT_AWAL });
      if (action === 'list') return res(out());
      const hasil = (p.ops || []).map(op => {
        if (op.type === 'add') { if (!db.some(t => t.id === op.tx.id)) db.push(Object.assign({}, op.tx)); }
        else if (op.type === 'update') { const i = db.findIndex(t => t.id === op.tx.id); if (i < 0) return { qid: op.qid, ok: false, error: 'Transaksi tidak ditemukan.' }; db[i] = Object.assign({}, db[i], op.tx); }
        else if (op.type === 'delete') db = db.filter(t => t.id !== op.id);
        return { qid: op.qid, ok: true };
      });
      LS.set('dk_demo', db);
      res(Object.assign(out(), { hasil }));
    }, 450));
  }

  function demoSeed() {
    let s = 20261102;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const pick = a => a[Math.floor(rnd() * a.length)];
    const tx = [], t = startToday();
    const harian = [['Makan & Minum', 12000, 55000, ['Makan siang', 'Kopi', 'Sarapan', 'Makan malam', '']], ['Transportasi', 10000, 45000, ['Bensin', 'Ojek online', 'Parkir']],
      ['Belanja Harian', 25000, 220000, ['Indomaret', 'Pasar', 'Sayur & lauk']], ['Hiburan & Liburan', 30000, 150000, ['Nonton', 'Jalan-jalan']],
      ['Pakaian & Perawatan', 50000, 250000, ['Potong rambut', 'Skincare']], ['Kesehatan', 25000, 180000, ['Apotek', 'Vitamin']], ['Sosial & Donasi', 20000, 100000, ['Kondangan', 'Sedekah']]];
    const bobot = [0.42, 0.22, 0.18, 0.06, 0.04, 0.04, 0.04];
    let k = 0;
    const push = (d, jenis, nominal, kat, met, cat) => tx.push({ id: 'D' + (k++), jenis, tanggal: iso(d), nominal: Math.round(nominal / 500) * 500, kategori: kat, metode: met, catatan: cat, dibuat: d.toISOString() });
    for (let i = 0; i < 190; i++) {
      const d = addDays(t, -i);
      const jml = rnd() < 0.12 ? 0 : 1 + Math.floor(rnd() * 3);
      for (let j = 0; j < jml; j++) {
        let r = rnd(), c = 0; while (c < bobot.length - 1 && r > bobot[c]) { r -= bobot[c]; c++; }
        const h = harian[c];
        push(d, 'keluar', h[1] + rnd() * (h[2] - h[1]), h[0], pick(['Tunai', 'QRIS', 'QRIS', 'Transfer']), pick(h[3]));
      }
      const tg = d.getDate();
      if (tg === 25) push(d, 'masuk', 8500000, 'Gaji', 'Transfer', 'Gaji bulanan');
      if (tg === 10) push(d, 'masuk', 1250000 + Math.floor(rnd() * 4) * 250000, 'Honor & Insentif', 'Transfer', 'Honor mengajar');
      if (tg === 18 && rnd() < 0.5) push(d, 'masuk', 300000 + rnd() * 700000, 'Usaha Sampingan', 'QRIS', 'Jualan online');
      if (tg === 5) { push(d, 'keluar', 420000 + rnd() * 120000, 'Tagihan & Utilitas', 'Transfer', 'Listrik & air'); push(d, 'keluar', 150000, 'Pulsa & Internet', 'Transfer', 'Paket data'); }
      if (tg === 1) push(d, 'keluar', 1000000, 'Tabungan & Investasi', 'Transfer', 'Setor tabungan');
      if (tg === 12) push(d, 'keluar', 1650000, 'Cicilan & Utang', 'Transfer', 'Cicilan motor');
    }
    return tx;
  }

  // ---------- Event ----------
  function pasangEvent() {
    $('#setupForm').addEventListener('submit', hubungkan);
    $('#demoBtn').addEventListener('click', async () => {
      S.cfg = { url: 'demo', pin: 'demo' }; LS.set('dk_cfg', S.cfg);
      S.firstLoad = true; tampilApp(); await sinkron(); S.firstLoad = false; render();
      toast('ok', 'Mode contoh aktif — data ini tidak masuk ke spreadsheet');
    });

    $$('.nav-btn').forEach(b => b.addEventListener('click', () => pindahView(b.dataset.view)));
    $('#fab').addEventListener('click', () => bukaForm(null));
    $('#refreshBtn').addEventListener('click', () => sinkron({ notify: 'Data diperbarui' }));
    $('#syncPill').addEventListener('click', () => sinkron({ notify: 'Data diperbarui' }));
    $('#scrim').addEventListener('click', tutupSheet);
    $$('[data-close]').forEach(b => b.addEventListener('click', tutupSheet));
    $$('.sheet').forEach(seretTutup);

    // delegasi klik di seluruh dokumen
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-tx],[data-go],[data-act],[data-period],[data-an] button');
      if (!t) return;
      if (t.dataset.tx) return bukaDetail(t.dataset.tx);
      if (t.dataset.go) return pindahView(t.dataset.go);
      if (t.dataset.period) {
        const k = t.dataset.period;
        if (k === 'custom') return bukaPeriode();
        S.period = { key: k }; LS.set('dk_period', S.period); return render();
      }
      if (t.parentElement && t.parentElement.dataset.an) { S.an[t.parentElement.dataset.an] = t.dataset.v; return render(); }
      const a = t.dataset.act;
      if (a === 'add') bukaForm(null);
      else if (a === 'edit') { const tx = allTx().find(x => x.id === t.dataset.id); tutupSheet(); setTimeout(() => bukaForm(tx), 200); }
      else if (a === 'hapus') hapusTx(t.dataset.id);
      else if (a === 'more') { S.hf.limit += 80; renderRiwayat(); }
      else if (a === 'sync') sinkron({ notify: 'Data diperbarui' });
      else if (a === 'logout') keluar();
      else if (a === 'hideTip') { S.pref.hideTip = true; LS.set('dk_pref', S.pref); render(); }
      else if (a === 'tabel') { const tb = $('#tblBanding'); tb.hidden = !tb.hidden; t.textContent = tb.hidden ? 'Tampilkan tabel' : 'Sembunyikan tabel'; }
    });

    // form
    $('#txForm').addEventListener('submit', simpanForm);
    $('#tJenis').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || b.dataset.v === F.jenis) return;
      F.jenis = b.dataset.v;
      if (F.kategori && !kategori()[F.jenis].includes(F.kategori)) F.kategori = null;
      renderFormPilihan();
    });
    $('#tKat').addEventListener('click', e => { const b = e.target.closest('.cat'); if (!b) return; F.kategori = b.dataset.k; $('#txErr').textContent = ''; renderFormPilihan(); });
    $('#tMetode').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; F.metode = F.metode === b.dataset.m ? '' : b.dataset.m; renderFormPilihan(); });
    $('#tNominal').addEventListener('input', e => {
      const n = Math.min(angkaDari(e.target.value), 9999999999999);
      setNominal(n);
      if (n) { $('#txErr').textContent = ''; $('#amountWrap').classList.remove('bad'); }
    });
    $('#quickAmt').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const a = Number(b.dataset.a);
      setNominal(a ? angkaDari($('#tNominal').value) + a : 0);
      $('#txErr').textContent = '';
    });
    $$('.date-quick button').forEach(b => b.addEventListener('click', () => { $('#tTanggal').value = iso(addDays(new Date(), Number(b.dataset.d))); renderFormPilihan(); }));
    $('#tTanggal').addEventListener('change', renderFormPilihan);

    // riwayat
    let tq;
    $('#q').addEventListener('input', e => { clearTimeout(tq); tq = setTimeout(() => { S.hf.q = e.target.value; S.hf.limit = 80; renderRiwayat(); }, 150); });
    $('#fJenis').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      S.hf.jenis = b.dataset.v; $$('#fJenis button').forEach(x => x.classList.toggle('on', x === b)); renderRiwayat();
    });
    $('#fKat').addEventListener('change', e => { S.hf.kat = e.target.value; renderRiwayat(); });
    $('#fWaktu').addEventListener('change', e => {
      S.hf.waktu = e.target.value;
      const custom = S.hf.waktu === 'custom';
      $('#fRange').hidden = !custom;
      if (custom && !S.hf.dari) { S.hf.dari = iso(addDays(new Date(), -30)); S.hf.sampai = todayIso(); $('#fDari').value = S.hf.dari; $('#fSampai').value = S.hf.sampai; }
      renderRiwayat();
    });
    $('#fDari').addEventListener('change', e => { S.hf.dari = e.target.value; renderRiwayat(); });
    $('#fSampai').addEventListener('change', e => { S.hf.sampai = e.target.value; renderRiwayat(); });

    // periode custom
    $('#pPreset').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const t = startToday(), p = b.dataset.p;
      let f, s = t;
      if (p === 'bulanlalu') { f = new Date(t.getFullYear(), t.getMonth() - 1, 1); s = new Date(t.getFullYear(), t.getMonth(), 0); }
      else if (p === 'tahun') f = new Date(t.getFullYear(), 0, 1);
      else f = addDays(t, -(Number(p) - 1));
      $('#pDari').value = iso(f); $('#pSampai').value = iso(s);
    });
    $('#pApply').addEventListener('click', () => {
      const f = $('#pDari').value, s = $('#pSampai').value;
      if (!f || !s) { $('#pErr').textContent = 'Isi kedua tanggal.'; return; }
      if (f > s) { $('#pErr').textContent = 'Tanggal "Dari" harus sebelum "Sampai".'; return; }
      $('#pErr').textContent = '';
      S.period = { key: 'custom', from: f, to: s }; LS.set('dk_period', S.period);
      tutupSheet(); render();
    });

    // koneksi & siklus hidup
    window.addEventListener('online', () => { setSync(); sinkron(); });
    window.addEventListener('offline', setSync);
    let terakhir = Date.now();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible' || !S.cfg) return;
      $('#todayLabel').textContent = tglPanjang(todayIso());
      if (S.queue.length || Date.now() - terakhir > 30000) { terakhir = Date.now(); sinkron(); }
    });
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (S.view === 'analisis') renderAnalisis(); }, 200); });
  }

  function bukaPeriode() {
    const r = rentang();
    $('#pDari').value = S.period.key === 'custom' ? S.period.from : r.from;
    $('#pSampai').value = S.period.key === 'custom' ? S.period.to : todayIso();
    $('#pErr').textContent = '';
    bukaSheet('periodSheet');
  }

  // ---------- Mulai ----------
  pasangEvent();
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  if (S.cfg) { tampilApp(); sinkron(); } else tampilSetup();
})();

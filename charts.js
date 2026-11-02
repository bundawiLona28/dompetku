/* =========================================================
   DompetKu — grafik SVG ringan (tanpa library, bisa offline)
   ========================================================= */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';

  function singkat(n) {
    const a = Math.abs(n);
    const f = (v, s) => (Math.round(v * 10) / 10).toString().replace('.', ',') + s;
    if (a >= 1e9) return f(n / 1e9, 'M');
    if (a >= 1e6) return f(n / 1e6, 'jt');
    if (a >= 1e3) return f(n / 1e3, 'rb');
    return String(Math.round(n));
  }
  function rupiah(n) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(n || 0)); }

  /** Skala sumbu-y "rapi": 0 .. max dengan 4 garis */
  function niceMax(v) {
    if (v <= 0) return 1000;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const m = v / p;
    const step = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
    return step * p;
  }

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function frame(host, H) {
    host.innerHTML = '';
    const W = Math.max(280, host.clientWidth || 320);
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img' });
    host.appendChild(svg);
    const tip = document.createElement('div');
    tip.className = 'tip';
    tip.hidden = true;
    host.appendChild(tip);
    return { W, svg, tip };
  }

  function yAxis(svg, W, H, pad, maxV) {
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const v = maxV * i / ticks;
      const y = pad.t + (H - pad.t - pad.b) * (1 - i / ticks);
      el('line', { x1: pad.l, x2: W - pad.r, y1: y, y2: y, class: 'grid' }, svg);
      const t = el('text', { x: pad.l - 6, y: y + 3.5, 'text-anchor': 'end', class: 'axis-t' }, svg);
      t.textContent = i === 0 ? '0' : singkat(v);
    }
  }

  function xLabels(svg, labels, xAt, H, pad, maxLabels) {
    const n = labels.length;
    const step = Math.max(1, Math.ceil(n / maxLabels));
    labels.forEach((lb, i) => {
      if (i % step !== 0 && i !== n - 1) return;
      if (i !== n - 1 && n - 1 - i < step * 0.6 && i % step === 0 && i !== 0) return;
      const t = el('text', { x: xAt(i), y: H - pad.b + 16, 'text-anchor': 'middle', class: 'axis-t' }, svg);
      t.textContent = lb;
    });
  }

  function showTip(host, tip, x, y, title, rows) {
    tip.innerHTML = '<b>' + title + '</b>' + rows.map(r =>
      `<div><span><i style="background:${r.color}"></i>${r.name}</span><span class="num">${rupiah(r.value)}</span></div>`).join('');
    tip.hidden = false;
    const W = host.clientWidth;
    const tw = tip.offsetWidth;
    const cx = Math.min(Math.max(x, tw / 2 + 2), W - tw / 2 - 2);
    tip.style.left = cx + 'px';
    tip.style.top = Math.max(0, y - tip.offsetHeight - 10) + 'px';
  }

  function bindPointer(host, svg, W, n, xAt, onIdx, onLeave) {
    const pick = (clientX) => {
      const r = svg.getBoundingClientRect();
      const x = (clientX - r.left) * (W / r.width);
      let best = 0, bd = Infinity;
      for (let i = 0; i < n; i++) { const d = Math.abs(xAt(i) - x); if (d < bd) { bd = d; best = i; } }
      onIdx(best);
    };
    svg.addEventListener('pointerdown', e => pick(e.clientX));
    svg.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || e.buttons) pick(e.clientX); });
    svg.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') onLeave(); });
    if (host._outside) document.removeEventListener('pointerdown', host._outside);
    host._outside = e => { if (!host.contains(e.target)) onLeave(); };
    document.addEventListener('pointerdown', host._outside, { passive: true });
  }

  /**
   * Grafik garis. opts = { labels:[], tipLabels:[], series:[{name,color,values:[]}] }
   */
  function line(host, opts) {
    const H = 210, pad = { t: 14, r: 46, b: 26, l: 40 };
    const { W, svg, tip } = frame(host, H);
    const n = opts.labels.length;
    const maxV = niceMax(Math.max(1, ...opts.series.flatMap(s => s.values)));
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    const xAt = i => pad.l + (n <= 1 ? iw / 2 : iw * i / (n - 1));
    const yAt = v => pad.t + ih * (1 - v / maxV);
    svg.setAttribute('aria-label', opts.aria || 'Grafik tren');
    yAxis(svg, W, H, pad, maxV);
    xLabels(svg, opts.labels, xAt, H, pad, W < 360 ? 5 : 7);

    const cross = el('line', { y1: pad.t, y2: H - pad.b, stroke: '#94a3b8', 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: 0 }, svg);
    const dots = [];
    const ends = [];
    opts.series.forEach(s => {
      const d = s.values.map((v, i) => (i ? 'L' : 'M') + xAt(i).toFixed(1) + ' ' + yAt(v).toFixed(1)).join(' ');
      if (n > 1) {
        const area = d + ` L${xAt(n - 1)} ${yAt(0)} L${xAt(0)} ${yAt(0)} Z`;
        el('path', { d: area, fill: s.color, opacity: 0.07 }, svg);
      }
      el('path', { d, fill: 'none', stroke: s.color, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
      if (n === 1) el('circle', { cx: xAt(0), cy: yAt(s.values[0]), r: 4, fill: s.color }, svg);
      dots.push(el('circle', { r: 5, fill: s.color, stroke: '#fff', 'stroke-width': 2, opacity: 0 }, svg));
      ends.push({ y: yAt(s.values[n - 1] || 0), name: s.name });
    });
    // label langsung di ujung garis (hindari tabrakan)
    if (ends.length === 2 && Math.abs(ends[0].y - ends[1].y) < 13) {
      const up = ends[0].y <= ends[1].y ? 0 : 1;
      ends[up].y -= 7; ends[1 - up].y += 7;
    }
    ends.forEach(e => {
      const t = el('text', { x: W - pad.r + 6, y: e.y + 4, class: 'end-t' }, svg);
      t.textContent = e.name;
    });

    bindPointer(host, svg, W, n, xAt, i => {
      cross.setAttribute('x1', xAt(i)); cross.setAttribute('x2', xAt(i)); cross.setAttribute('opacity', 1);
      let topY = H;
      opts.series.forEach((s, k) => {
        const y = yAt(s.values[i]);
        topY = Math.min(topY, y);
        dots[k].setAttribute('cx', xAt(i)); dots[k].setAttribute('cy', y); dots[k].setAttribute('opacity', 1);
      });
      const r = svg.getBoundingClientRect(), sc = r.width / W;
      showTip(host, tip, xAt(i) * sc, topY * sc, (opts.tipLabels || opts.labels)[i],
        opts.series.map(s => ({ name: s.name, color: s.color, value: s.values[i] })));
    }, () => {
      tip.hidden = true; cross.setAttribute('opacity', 0); dots.forEach(d => d.setAttribute('opacity', 0));
    });
  }

  /** Batang berkelompok. opts = { labels:[], tipLabels:[], series:[{name,color,values}] } */
  function bars(host, opts) {
    const H = 210, pad = { t: 14, r: 8, b: 26, l: 40 };
    const { W, svg, tip } = frame(host, H);
    const n = opts.labels.length, m = opts.series.length;
    const maxV = niceMax(Math.max(1, ...opts.series.flatMap(s => s.values)));
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    const slot = iw / n;
    const gap = 2;
    const bw = Math.min(18, (slot * 0.62 - gap * (m - 1)) / m);
    const groupW = bw * m + gap * (m - 1);
    const xAt = i => pad.l + slot * i + slot / 2;
    const yAt = v => pad.t + ih * (1 - v / maxV);
    svg.setAttribute('aria-label', opts.aria || 'Grafik batang');
    yAxis(svg, W, H, pad, maxV);
    xLabels(svg, opts.labels, xAt, H, pad, 12);

    const hl = el('rect', { y: pad.t, height: ih, rx: 8, fill: '#eef1ff', opacity: 0 }, svg);
    svg.insertBefore(hl, svg.firstChild.nextSibling);
    opts.series.forEach((s, k) => {
      s.values.forEach((v, i) => {
        if (v <= 0) return;
        const x = xAt(i) - groupW / 2 + k * (bw + gap);
        const y = yAt(v), h = yAt(0) - y;
        const r = Math.min(4, bw / 2, h);
        const d = `M${x} ${y + h} V${y + r} Q${x} ${y} ${x + r} ${y} H${x + bw - r} Q${x + bw} ${y} ${x + bw} ${y + r} V${y + h} Z`;
        el('path', { d, fill: s.color }, svg);
      });
    });
    bindPointer(host, svg, W, n, xAt, i => {
      hl.setAttribute('x', xAt(i) - Math.min(slot, groupW + 14) / 2);
      hl.setAttribute('width', Math.min(slot, groupW + 14));
      hl.setAttribute('opacity', 1);
      const top = Math.min(...opts.series.map(s => yAt(s.values[i])));
      const r = svg.getBoundingClientRect(), sc = r.width / W;
      showTip(host, tip, xAt(i) * sc, top * sc, (opts.tipLabels || opts.labels)[i],
        opts.series.map(s => ({ name: s.name, color: s.color, value: s.values[i] })));
    }, () => { tip.hidden = true; hl.setAttribute('opacity', 0); });
  }

  window.DKChart = { line, bars, singkat };
})();

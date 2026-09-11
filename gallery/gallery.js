/* 갤러리 공통 코드. 세 화면이 이것 하나를 쓴다.
 *
 * 분류: 운영 · 작성: 오흥재 · 2026-09-12 · 상태: 확정
 * 근거: gpt-6-astra high 설계 검토 (Claude/site-gallery-design-result.md)
 *
 * 여기 있는 규칙은 전부 그 검토가 지목한 실패를 막으려는 것이다.
 *  · 링크로 들어온 값은 색인에 있는 것만 받는다. 없는 값을 몰래 바꾸지 않는다
 *  · 경로는 색인이 적어 준 것만 쓴다. 판·모델 이름을 이어 붙여 만들지 않는다
 *  · 구간은 경계를 닫아 적는다. 1~49 는 49.5 를 빠뜨린다
 *  · 영상은 고른 것에만 src 를 건다. 84개를 한꺼번에 걸면 다 받아 온다
 */
'use strict';

const G = {};

/* 갤러리 뿌리 주소. **자기 스크립트가 어디서 왔는지로 잡는다.**
 *
 * 상대 경로(`../versions.json`)를 쓰면 안 된다. vercel.json 이
 * `trailingSlash: false` 라 `/gallery/view/` 가 `/gallery/view` 로 바뀌고,
 * 그러면 `../` 가 `/gallery/` 가 아니라 `/` 를 가리킨다. 로컬에서는 멀쩡하고
 * 배포에서만 404 가 난다.
 */
G.root = (function () {
  const self = document.currentScript && document.currentScript.src;
  if (!self) return '/gallery/';
  return self.replace(/gallery\.js(\?.*)?$/, '');
})();

G.at = function (path) { return G.root + String(path).replace(/^\/+/, ''); };

/* ── 색인 읽기 ──────────────────────────────────────────── */

G.loadJSON = async function (url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(url + ' 를 못 읽었다 (' + res.status + ')');
  return res.json();
};

/* 색인이 우리가 아는 모양인가. 모르는 모양이면 조용히 그리지 않는다. */
G.checkSchema = function (data, prefix) {
  const got = String(data && data.schema || '');
  if (!got.startsWith(prefix)) {
    throw new Error('모르는 색인 모양: ' + got + ' (기대: ' + prefix + '…)');
  }
  return data;
};

/* ── 구간 ───────────────────────────────────────────────── */

/* 경계를 닫아서 센다. `min_open`·`max_open` 이 열린 쪽을 말한다. */
G.inBand = function (value, band) {
  if (band.null) return value === null || value === undefined;
  if (value === null || value === undefined) return false;
  const lo = band.min_open ? value > band.min : value >= band.min;
  const hi = band.max_open ? value < band.max : value <= band.max;
  return lo && hi;
};

G.bandOf = function (value, bands) {
  return bands.find(b => G.inBand(value, b)) || null;
};

/* ── URL 상태 ───────────────────────────────────────────── */

/* 링크로 들어온 값을 **색인에 있는 것과 대조한다.** 없으면 버리고 알린다.
 * 몰래 첫 값으로 바꾸면 저장한 링크가 다른 화면을 연다. */
G.readParams = function (allowed) {
  const q = new URLSearchParams(location.search);
  const out = {};
  const rejected = [];

  for (const [key, values] of Object.entries(allowed)) {
    const raw = q.get(key);
    if (raw === null || raw === '') continue;
    const ok = values.find(v => String(v) === raw || G.sameNumber(v, raw));
    if (ok === undefined) { rejected.push(key + '=' + raw); continue; }
    out[key] = ok;
  }

  return { value: out, rejected };
};

/* `speed=1` 과 `speed=1.0` 을 같은 것으로 본다. 쓸 때는 하나로 통일한다. */
G.sameNumber = function (a, b) {
  const x = Number(a), y = Number(b);
  return Number.isFinite(x) && Number.isFinite(y) && x === y;
};

G.writeParams = function (state, replace) {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(state)) {
    if (value === null || value === undefined || value === '') continue;
    q.set(key, String(value));
  }
  const url = location.pathname + (q.toString() ? '?' + q : '');
  if (replace) history.replaceState(state, '', url);
  else history.pushState(state, '', url);
};

/* ── 영상 ───────────────────────────────────────────────── */

/* 고르기 전에는 src 를 걸지 않는다. 84개를 한꺼번에 걸면 미리 읽기가 돈다. */
G.attach = function (video, src) {
  if (video.getAttribute('src') === src) return video;
  video.setAttribute('src', src);
  video.load();
  return video;
};

G.detach = function (video) {
  video.pause();
  video.removeAttribute('src');
  video.load();
};

/* `play()` 는 비동기로 거절될 수 있다. 결과를 보고 실패한 열을 표시한다. */
G.play = function (video) {
  const p = video.play();
  return p && p.catch ? p.catch(err => ({ error: err })) : Promise.resolve();
};

G.fmtSeconds = function (s) {
  if (!Number.isFinite(s)) return '--:--';
  const m = Math.floor(s / 60);
  return m + ':' + String(Math.floor(s % 60)).padStart(2, '0') +
         '.' + String(Math.floor((s % 1) * 10));
};

/* ── 그리기 조각 ────────────────────────────────────────── */

G.rateClass = function (rate) {
  if (rate === null || rate === undefined) return '';
  if (rate === 0) return 'zero';
  if (rate < 50) return 'low';
  if (rate >= 90) return 'high';
  return '';
};

G.el = function (tag, attrs, children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'text') node.textContent = v;
    else if (k === 'class') node.className = v;
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  for (const child of (children || [])) {
    if (child) node.appendChild(child);
  }
  return node;
};

/* 조건 하나의 단추 줄. **남는 건수를 같이 적는다.** 0건인 선택지를 눌러
 * 빈 화면을 보게 두지 않는다. */
G.chipRow = function (label, values, current, countOf, onPick) {
  const row = G.el('div', { class: 'frow' }, [
    G.el('span', { class: 'flabel', text: label })
  ]);

  const add = (value, text) => {
    const n = countOf(value);
    const on = String(current) === String(value);
    const chip = G.el('button', {
      class: 'chip', type: 'button', 'aria-pressed': on ? 'true' : 'false',
      disabled: (n === 0 && !on) || null
    }, [
      G.el('span', { text: text }),
      G.el('span', { class: 'n', text: String(n) })
    ]);
    chip.addEventListener('click', () => onPick(on ? null : value));
    row.appendChild(chip);
  };

  add('', '전부');
  values.forEach(v => add(v, typeof v === 'number' ? v.toFixed(1) : String(v)));
  return row;
};

G.emptyBox = function (title, detail, onClear) {
  const box = G.el('div', { class: 'empty' }, [
    G.el('strong', { text: title }),
    G.el('div', { text: detail })
  ]);
  if (onClear) {
    const btn = G.el('button', { class: 'chip', type: 'button', text: '조건 모두 풀기' });
    btn.style.marginTop = '12px';
    btn.addEventListener('click', onClear);
    box.appendChild(btn);
  }
  return box;
};

G.warn = function (text, bad) {
  return G.el('div', { class: bad ? 'note bad' : 'note' }, [
    G.el('span', { text: text })
  ]);
};

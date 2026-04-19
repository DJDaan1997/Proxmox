function secToHMS(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function clsForDiff(diff) {
  return diff < 0 ? 'neg' : diff > 0 ? 'pos' : '';
}

function fmtPct(v) {
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

function addCoreRow(tbody, metric, ams, rot, diffSec, interp) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${metric}</td>
    <td>${ams}</td>
    <td>${rot}</td>
    <td class="${clsForDiff(diffSec)}">${diffSec === 0 ? '0:00' : (diffSec < 0 ? '-' : '+') + secToHMS(Math.abs(diffSec))}</td>
    <td>${interp}</td>
  `;
  tbody.appendChild(tr);
}

function createBars(container, labels, amsValues, rotValues) {
  const max = Math.max(...amsValues, ...rotValues);
  labels.forEach((label, i) => {
    const row = document.createElement('div');
    row.className = 'row';
    const aPct = (amsValues[i] / max) * 100;
    const rPct = (rotValues[i] / max) * 100;
    row.innerHTML = `
      <div class="label">${label}</div>
      <div class="track" title="Ams ${secToHMS(amsValues[i])} vs Rot ${secToHMS(rotValues[i])}">
        <div class="bar ams" style="width:${aPct}%"></div>
        <div class="bar rot" style="width:${rPct}%"></div>
      </div>
    `;
    container.appendChild(row);
  });
  const legend = document.createElement('div');
  legend.className = 'legend';
  legend.innerHTML = `<span style="color:#60a5fa">■ Amsterdam</span> &nbsp; <span style="color:#34d399">■ Rotterdam</span> (korter = sneller)`;
  container.appendChild(legend);
}

async function load() {
  const res = await fetch('../mabel_hyrox_2026_data.json');
  const data = await res.json();
  const ams = data.events.find((e) => e.event.includes('Amsterdam'));
  const rot = data.events.find((e) => e.event.includes('Rotterdam'));

  const cards = document.getElementById('kpi-cards');
  const kpis = [
    ['Eindtijd', `${ams.totals.finish_time} → ${rot.totals.finish_time}`, rot.totals.finish_seconds - ams.totals.finish_seconds, true],
    ['Totale Runs', `${ams.totals.run_total} → ${rot.totals.run_total}`, rot.totals.run_seconds - ams.totals.run_seconds, true],
    ['Totale Workouts', `${ams.totals.workout_total} → ${rot.totals.workout_total}`, rot.totals.workout_seconds - ams.totals.workout_seconds, true],
    ['Totale Roxzone', `${ams.totals.roxzone_total} → ${rot.totals.roxzone_total}`, rot.totals.roxzone_seconds - ams.totals.roxzone_seconds, true],
    ['Overall Rank', `${ams.totals.overall_rank} → ${rot.totals.overall_rank}`, rot.totals.overall_rank - ams.totals.overall_rank, false],
    ['AG Rank', `${ams.totals.ag_rank} → ${rot.totals.ag_rank}`, rot.totals.ag_rank - ams.totals.ag_rank, false]
  ];

  kpis.forEach(([k, v, d, isTime]) => {
    const c = document.createElement('article');
    c.className = 'card';
    const delta = isTime
      ? `${d < 0 ? '-' : '+'}${secToHMS(Math.abs(d))}`
      : `${d < 0 ? '' : '+'}${d} pos`;
    c.innerHTML = `<div class="k">${k}</div><div class="v">${v}</div><div class="d ${clsForDiff(d)}">Δ ${delta}</div>`;
    cards.appendChild(c);
  });

  const coreTBody = document.querySelector('#core-table tbody');
  addCoreRow(coreTBody, 'Totale eindtijd', ams.totals.finish_time, rot.totals.finish_time, rot.totals.finish_seconds - ams.totals.finish_seconds, 'Sterke verbetering');
  addCoreRow(coreTBody, 'Totale looptijd', ams.totals.run_total, rot.totals.run_total, rot.totals.run_seconds - ams.totals.run_seconds, 'Grootste winst');
  addCoreRow(coreTBody, 'Totale workouttijd', ams.totals.workout_total, rot.totals.workout_total, rot.totals.workout_seconds - ams.totals.workout_seconds, 'Kleine verbetering');
  addCoreRow(coreTBody, 'Totale Roxzone', ams.totals.roxzone_total, rot.totals.roxzone_total, rot.totals.roxzone_seconds - ams.totals.roxzone_seconds, 'Overgangen sneller');

  const runLabels = ams.runs.map((_, i) => `Run ${i + 1}`);
  const runA = ams.runs.map((t) => {
    const [m, s] = t.split(':').map(Number);
    return m * 60 + s;
  });
  const runR = rot.runs.map((t) => {
    const [m, s] = t.split(':').map(Number);
    return m * 60 + s;
  });
  createBars(document.getElementById('run-bars'), runLabels, runA, runR);

  const workoutNames = Object.keys(ams.workouts);
  const workA = workoutNames.map((w) => {
    const [m, s] = ams.workouts[w].split(':').map(Number);
    return m * 60 + s;
  });
  const workR = workoutNames.map((w) => {
    const [m, s] = rot.workouts[w].split(':').map(Number);
    return m * 60 + s;
  });
  createBars(document.getElementById('workout-bars'), workoutNames, workA, workR);

  const runTBody = document.querySelector('#run-table tbody');
  runLabels.forEach((label, i) => {
    const diff = runR[i] - runA[i];
    const pct = (diff / runA[i]) * 100;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${label}</td>
      <td>${ams.runs[i]}</td>
      <td>${rot.runs[i]}</td>
      <td class="${clsForDiff(diff)}">${diff}</td>
      <td class="${clsForDiff(diff)}">${fmtPct(pct)}</td>
    `;
    runTBody.appendChild(tr);
  });

  const workoutTBody = document.querySelector('#workout-table tbody');
  workoutNames.forEach((name, i) => {
    const diff = workR[i] - workA[i];
    const pct = (diff / workA[i]) * 100;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${name}</td>
      <td>${ams.workouts[name]}</td>
      <td>${rot.workouts[name]}</td>
      <td class="${clsForDiff(diff)}">${diff}</td>
      <td class="${clsForDiff(diff)}">${fmtPct(pct)}</td>
    `;
    workoutTBody.appendChild(tr);
  });
}

load().catch((err) => {
  document.body.innerHTML = `<pre style="color:#fca5a5;padding:1rem">Fout bij laden van data: ${err.message}</pre>`;
});

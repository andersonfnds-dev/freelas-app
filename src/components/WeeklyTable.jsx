import { useFirebase } from '../hooks/useFirebase';
import { msToLabel } from '../utils';

export default function WeeklyTable({ calYear, calMonth }) {
  const { workLog, dayEntries } = useFirebase();

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const weeks = [];
  let week = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(calYear, calMonth, d);
    const dow = (date.getDay() + 6) % 7;
    if (dow === 0 && week.length) { weeks.push(week); week = []; }
    week.push(d);
  }
  if (week.length) weeks.push(week);

  let monthTotal = 0;

  const rows = weeks.map((w, i) => {
    const first = w[0], last = w[w.length - 1];
    let ms = 0;
    w.forEach(d => {
      const key = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const timerMs = workLog[key] || 0;
      const manualMs = (dayEntries[key] || []).filter(e => !e.fromTimer).reduce((s, e) => s + e.ms, 0);
      ms += timerMs + manualMs;
    });
    monthTotal += ms;

    const fStr = `${String(first).padStart(2,'0')}/${String(calMonth+1).padStart(2,'0')}`;
    const lStr = `${String(last).padStart(2,'0')}/${String(calMonth+1).padStart(2,'0')}`;

    return (
      <tr key={i}>
        <td>
          <div style={{ fontWeight: 500, color: 'var(--text)' }}>Semana {i + 1}</div>
          <div className="week-range">{fStr} — {lStr}</div>
        </td>
        <td style={{ textAlign: 'right', fontWeight: 500, color: ms ? 'var(--green)' : 'var(--text2)' }}>
          {msToLabel(ms)}
        </td>
      </tr>
    );
  });

  return (
    <div className="card">
      <div className="card-title">Horas por semana</div>
      <table className="week-table">
        <thead>
          <tr>
            <th>Período</th>
            <th style={{ textAlign: 'right' }}>Horas</th>
          </tr>
        </thead>
        <tbody>
          {rows}
          <tr className="total">
            <td>Total do mês</td>
            <td>{msToLabel(monthTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

import { useState } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { MONTHS_PT, DAYS_PT, todayKey, msToLabel } from '../utils';
import WeeklyTable from './WeeklyTable';
import DayDetail from './DayDetail';

export default function Calendar() {
  const { workLog, dayEntries } = useFirebase();
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  const changeMonth = (dir) => {
    let m = calMonth + dir;
    let y = calYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setCalMonth(m);
    setCalYear(y);
  };

  if (selectedDay) {
    return <DayDetail dayKey={selectedDay} onBack={() => setSelectedDay(null)} />;
  }

  const todayStr = todayKey();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < offset; i++) {
    days.push(<div key={`e${i}`} className="cal-day empty" />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const timerMs = workLog[key] || 0;
    const manualMs = (dayEntries[key] || []).filter(e => !e.fromTimer).reduce((s, e) => s + e.ms, 0);
    const totalMs = timerMs + manualMs;
    const hasWork = timerMs > 0 || (dayEntries[key] && dayEntries[key].length > 0);

    let cls = 'cal-day';
    if (key === todayStr) cls += ' today';
    if (hasWork) cls += ' worked';

    days.push(
      <div key={d} className={cls} title={totalMs ? msToLabel(totalMs) : 'Sem registro'}
           onClick={() => setSelectedDay(key)}>
        {d}
        {hasWork && <div className="dot" />}
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="cal-header">
          <div className="cal-title">{MONTHS_PT[calMonth]} {calYear}</div>
          <div className="cal-nav">
            <button className="icon-btn" onClick={() => changeMonth(-1)}>&#8249;</button>
            <button className="icon-btn" onClick={() => changeMonth(1)}>&#8250;</button>
          </div>
        </div>
        <div className="cal-grid">
          {DAYS_PT.map(d => <div key={d} className="cal-dow">{d}</div>)}
          {days}
        </div>
        <div className="legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--green-light)', border: '1.5px solid var(--green)' }} />
            Dia trabalhado
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--accent-light)', border: '1.5px solid var(--accent)' }} />
            Hoje
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--bg3)', border: '1.5px solid var(--border)' }} />
            Sem registro
          </div>
        </div>
      </div>

      <WeeklyTable calYear={calYear} calMonth={calMonth} />
    </>
  );
}

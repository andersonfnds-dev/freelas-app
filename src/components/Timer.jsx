import { useState, useRef, useCallback } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { msToHMS, msToLabel, fmtTimeFromDate, todayKey } from '../utils';

export default function Timer() {
  const { workLog, dayEntries, save, toast } = useFirebase();
  const [display, setDisplay] = useState('00:00:00');
  const [subText, setSubText] = useState('Pronto para iniciar');
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);

  const intervalRef = useRef(null);
  const startRef = useRef(null);
  const elapsedRef = useRef(0);
  const actualStartRef = useRef(null);

  const tick = useCallback(() => {
    const current = elapsedRef.current + (Date.now() - startRef.current);
    setDisplay(msToHMS(current));
  }, []);

  const start = () => {
    if (running && !paused) return;
    if (paused) {
      setPaused(false);
      startRef.current = Date.now();
    } else {
      elapsedRef.current = 0;
      startRef.current = Date.now();
      actualStartRef.current = Date.now();
      setRunning(true);
    }
    setSubText('Trabalhando...');
    intervalRef.current = setInterval(tick, 500);
  };

  const pause = () => {
    if (!running || paused) return;
    clearInterval(intervalRef.current);
    elapsedRef.current += Date.now() - startRef.current;
    setPaused(true);
    setSubText('Pausado');
  };

  const stop = () => {
    if (!running) return;
    clearInterval(intervalRef.current);
    const total = elapsedRef.current + (paused ? 0 : Date.now() - startRef.current);
    setRunning(false);
    setPaused(false);
    elapsedRef.current = 0;

    const key = todayKey();

    const newWorkLog = { ...workLog, [key]: (workLog[key] || 0) + total };
    save('workLog', newWorkLog);

    const endTime = new Date();
    const startTime = new Date(actualStartRef.current || (Date.now() - total));
    const entries = dayEntries[key] ? [...dayEntries[key]] : [];
    entries.push({
      id: Date.now(),
      start: fmtTimeFromDate(startTime),
      end: fmtTimeFromDate(endTime),
      ms: total,
      fromTimer: true
    });
    const newDayEntries = { ...dayEntries, [key]: entries };
    save('dayEntries', newDayEntries);

    setDisplay('00:00:00');
    setSubText(`Sessão salva: ${msToLabel(total)}`);
    toast('Horas salvas! ' + msToLabel(total));
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="timer-card">
        <div>
          <div className="timer-display">{display}</div>
          <div className="timer-sub">{subText}</div>
        </div>
        <div className="timer-actions">
          {running && (
            <button className="btn btn-ghost btn-sm" onClick={paused ? start : pause}>
              {paused ? 'Retomar' : 'Pausar'}
            </button>
          )}
          {!running && (
            <button className="btn btn-primary" onClick={start}>Iniciar</button>
          )}
          {running && (
            <button className="btn btn-danger btn-sm" onClick={stop}>Parar</button>
          )}
        </div>
      </div>
    </div>
  );
}

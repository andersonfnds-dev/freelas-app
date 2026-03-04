import { useState, useRef, useEffect } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { WEEKDAYS_PT, MONTHS_PT_LOWER, DAY_PASSWORD, msToLabel, fmtTimeFromDate } from '../utils';
import Modal from './Modal';

export default function DayDetail({ dayKey, onBack }) {
  const { workLog, dayEntries, dayNotes, save, toast } = useFirebase();
  const [authOpen, setAuthOpen] = useState(false);
  const [horarioOpen, setHorarioOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [noteText, setNoteText] = useState(dayNotes[dayKey] || '');
  const passwordRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    setNoteText(dayNotes[dayKey] || '');
  }, [dayNotes, dayKey]);

  const [y, m, d] = dayKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dateLabel = `${WEEKDAYS_PT[date.getDay()]}, ${d} de ${MONTHS_PT_LOWER[m - 1]} de ${y}`;

  const timerMs = workLog[dayKey] || 0;
  const entries = dayEntries[dayKey] || [];
  const manualMs = entries.filter(e => !e.fromTimer).reduce((s, e) => s + e.ms, 0);
  const totalMs = timerMs + manualMs;

  const confirmAuth = () => {
    if (password !== DAY_PASSWORD) {
      toast('Senha incorreta');
      setPassword('');
      return;
    }
    setAuthOpen(false);
    setPassword('');
    const now = new Date();
    const hhmm = fmtTimeFromDate(now);
    setStartTime(hhmm);
    setEndTime(hhmm);
    setHorarioOpen(true);
  };

  const saveHorario = () => {
    if (!startTime || !endTime) { toast('Preencha os horários'); return; }
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMs = (sh * 60 + sm) * 60000;
    const endMs = (eh * 60 + em) * 60000;
    if (endMs <= startMs) { toast('O fim deve ser após o início'); return; }

    const ms = endMs - startMs;
    const newEntries = [...(dayEntries[dayKey] || []), { id: Date.now(), start: startTime, end: endTime, ms, fromTimer: false }];
    save('dayEntries', { ...dayEntries, [dayKey]: newEntries });
    setHorarioOpen(false);
    toast(`Horário adicionado: ${msToLabel(ms)}`);
  };

  const deleteEntry = (id) => {
    if (!confirm('Remover este horário?')) return;
    const newEntries = (dayEntries[dayKey] || []).filter(e => e.id !== id);
    save('dayEntries', { ...dayEntries, [dayKey]: newEntries });
    toast('Removido');
  };

  const saveNote = () => {
    const newNotes = { ...dayNotes };
    if (noteText.trim()) {
      newNotes[dayKey] = noteText;
    } else {
      delete newNotes[dayKey];
    }
    save('dayNotes', newNotes);
  };

  return (
    <>
      <button className="back-link" onClick={onBack}>&#8592; Voltar ao Calendário</button>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="day-view-header">
          <div>
            <div className="day-view-title">&#128336; <span>Registro de Horários — {dateLabel}</span></div>
            <div className="day-view-total">Total: {msToLabel(totalMs) || '0 min'}</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => { setPassword(''); setAuthOpen(true); }}>
            + Adicionar Horário
          </button>
        </div>

        <table className="week-table">
          <thead>
            <tr>
              <th>Início</th>
              <th>Fim</th>
              <th>Duração</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {!entries.length && !timerMs ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text3)', padding: '24px 0' }}>
                  Nenhum registro neste dia.
                </td>
              </tr>
            ) : (
              entries.map(e => (
                <tr key={e.id}>
                  <td>{e.start}</td>
                  <td>{e.end}</td>
                  <td>{msToLabel(e.ms)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="icon-btn" title="Remover" onClick={() => deleteEntry(e.id)}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-title">Observações do Dia</div>
        <textarea
          className="day-notes-area"
          placeholder="Descreva o que foi feito neste dia..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onBlur={saveNote}
        />
      </div>

      <Modal open={authOpen} onClose={() => setAuthOpen(false)}
        header={
          <div className="modal-header">
            <h3>Autenticação Necessária</h3>
            <button className="modal-close" onClick={() => setAuthOpen(false)}>&#215;</button>
          </div>
        }
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAuthOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={confirmAuth}>Confirmar</button>
          </>
        }
      >
        <p className="modal-subtitle">Digite a senha para adicionar este horário.</p>
        <div className="form-group">
          <label>Senha</label>
          <input
            type="password"
            ref={passwordRef}
            placeholder="Digite a senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') confirmAuth(); }}
            autoFocus
          />
        </div>
      </Modal>

      <Modal open={horarioOpen} onClose={() => setHorarioOpen(false)} title="Adicionar Horário"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setHorarioOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={saveHorario}>Salvar</button>
          </>
        }
      >
        <div className="form-group">
          <label>Início</label>
          <input type="time" ref={startRef} value={startTime} onChange={(e) => setStartTime(e.target.value)} autoFocus />
        </div>
        <div className="form-group">
          <label>Fim</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
      </Modal>
    </>
  );
}

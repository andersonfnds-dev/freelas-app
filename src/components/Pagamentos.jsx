import { useState } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { MONTHS_PT, VALOR_HORA, fmtBRL, fmtDate, esc, msToLabel, getMonthTotalMs } from '../utils';
import Modal from './Modal';

export default function Pagamentos() {
  const { workLog, dayEntries, pagamentos, save, toast } = useFirebase();
  const [pagYear, setPagYear] = useState(() => new Date().getFullYear());
  const [pagMonth, setPagMonth] = useState(() => new Date().getMonth());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [client, setClient] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('pendente');

  const changeMonth = (dir) => {
    let m = pagMonth + dir;
    let y = pagYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setPagMonth(m);
    setPagYear(y);
  };

  const totalMs = getMonthTotalMs(workLog, dayEntries, pagYear, pagMonth);
  const totalHours = totalMs / 3600000;
  const aReceber = totalHours * VALOR_HORA;
  const hoursLabel = msToLabel(totalMs);

  const monthPrefix = `${pagYear}-${String(pagMonth + 1).padStart(2, '0')}`;
  const monthPagamentos = (pagamentos || []).filter(p => p.date.startsWith(monthPrefix));

  let recebido = 0;
  monthPagamentos.forEach(p => { if (p.status === 'recebido') recebido += p.value; });
  const pendente = Math.max(0, aReceber - recebido);

  const openModal = (id) => {
    if (id != null) {
      const p = pagamentos.find(x => x.id === id);
      setEditingId(id);
      setClient(p.client);
      setValue(p.value);
      setDate(p.date);
      setStatus(p.status);
    } else {
      setEditingId(null);
      setClient('');
      setValue('');
      setDate(new Date().toISOString().split('T')[0]);
      setStatus('pendente');
    }
    setModalOpen(true);
  };

  const savePagamento = () => {
    const v = parseFloat(value);
    if (!client.trim() || isNaN(v) || !date) { toast('Preencha todos os campos'); return; }

    let newPagamentos;
    if (editingId != null) {
      newPagamentos = pagamentos.map(p => p.id === editingId ? { ...p, client: client.trim(), value: v, date, status } : p);
      toast('Pagamento atualizado');
    } else {
      newPagamentos = [...pagamentos, { id: Date.now(), client: client.trim(), value: v, date, status }];
      toast('Pagamento adicionado');
    }
    save('pagamentos', newPagamentos);
    setModalOpen(false);
  };

  const deletePagamento = (id) => {
    if (!confirm('Remover este pagamento?')) return;
    save('pagamentos', pagamentos.filter(x => x.id !== id));
    toast('Removido');
  };

  const toggleStatus = (id) => {
    const newPag = pagamentos.map(p =>
      p.id === id ? { ...p, status: p.status === 'recebido' ? 'pendente' : 'recebido' } : p
    );
    save('pagamentos', newPag);
  };

  const sorted = [...monthPagamentos].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="cal-header">
          <div className="cal-nav">
            <button className="icon-btn" onClick={() => changeMonth(-1)}>&#8592;</button>
          </div>
          <div className="cal-title">{MONTHS_PT[pagMonth]} {pagYear}</div>
          <div className="cal-nav">
            <button className="icon-btn" onClick={() => changeMonth(1)}>&#8594;</button>
          </div>
        </div>
        <div style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 13 }}>
          {hoursLabel} trabalhadas × {fmtBRL(VALOR_HORA)}/h
        </div>
      </div>

      <div className="pag-summary">
        <div className="summary-card">
          <div className="summary-label">A Receber</div>
          <div className="summary-value accent">{fmtBRL(aReceber)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Recebido</div>
          <div className="summary-value green">{fmtBRL(recebido)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Pendente</div>
          <div className="summary-value red">{fmtBRL(pendente)}</div>
        </div>
      </div>

      <div className="pag-header">
        <div className="pag-title">Pagamentos</div>
        <button className="btn btn-primary btn-sm" onClick={() => openModal()}>+ Adicionar</button>
      </div>

      <div className="pag-list">
        {!sorted.length ? (
          <div className="empty-state">
            <div className="icon">💸</div>
            <p>Nenhum pagamento registrado neste mês</p>
          </div>
        ) : sorted.map(p => (
          <div key={p.id} className="pag-item">
            <div className="pag-item-left">
              <div className="pag-item-client">{esc(p.client)}</div>
              <div className="pag-item-date">{fmtDate(p.date)}</div>
            </div>
            <div className="pag-item-right">
              <div className="pag-item-value">{fmtBRL(p.value)}</div>
              <span
                className={`badge ${p.status === 'recebido' ? 'badge-green' : 'badge-yellow'}`}
                style={{ cursor: 'pointer' }}
                onClick={() => toggleStatus(p.id)}
              >
                {p.status === 'recebido' ? 'Recebido' : 'Pendente'}
              </span>
              <div className="pag-item-actions">
                <button className="icon-btn" title="Editar" onClick={() => openModal(p.id)}>✏️</button>
                <button className="icon-btn" title="Remover" onClick={() => deletePagamento(p.id)}>🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editingId != null ? 'Editar Pagamento' : 'Novo Pagamento'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={savePagamento}>Salvar</button>
          </>
        }
      >
        <div className="form-group">
          <label>Cliente / Projeto</label>
          <input type="text" placeholder="Ex: Empresa XYZ" value={client} onChange={e => setClient(e.target.value)} autoFocus />
        </div>
        <div className="form-group">
          <label>Valor (R$)</label>
          <input type="number" placeholder="0,00" step="0.01" min="0" value={value} onChange={e => setValue(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Data</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="recebido">Recebido</option>
            <option value="pendente">Pendente</option>
          </select>
        </div>
      </Modal>
    </>
  );
}

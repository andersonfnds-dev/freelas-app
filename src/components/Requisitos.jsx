import { useState } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { esc } from '../utils';
import Modal from './Modal';

const prioColor = { alta: 'badge-red', media: 'badge-yellow', baixa: 'badge-gray' };
const prioLabel = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };

export default function Requisitos() {
  const { requisitos, save, toast } = useFirebase();
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [text, setText] = useState('');
  const [project, setProject] = useState('');
  const [priority, setPriority] = useState('alta');

  const filtered = (requisitos || []).filter(r => {
    const matchText = !filter || r.text.toLowerCase().includes(filter.toLowerCase()) || r.project.toLowerCase().includes(filter.toLowerCase());
    const matchStatus = statusFilter === 'all' || (statusFilter === 'done' ? r.done : !r.done);
    return matchText && matchStatus;
  });

  const saveRequisito = () => {
    if (!text.trim()) { toast('Informe a descrição'); return; }
    const newReq = [...requisitos, { id: Date.now(), text: text.trim(), project: project.trim(), priority, done: false }];
    save('requisitos', newReq);
    setModalOpen(false);
    setText('');
    setProject('');
    setPriority('alta');
    toast('Requisito adicionado');
  };

  const toggleReq = (id) => {
    const newReq = requisitos.map(r => r.id === id ? { ...r, done: !r.done } : r);
    save('requisitos', newReq);
  };

  const deleteReq = (id) => {
    save('requisitos', requisitos.filter(x => x.id !== id));
    toast('Removido');
  };

  return (
    <>
      <div className="pag-header" style={{ marginBottom: 14 }}>
        <div className="pag-title">Requisitos</div>
        <button className="btn btn-primary btn-sm" onClick={() => { setText(''); setProject(''); setPriority('alta'); setModalOpen(true); }}>
          + Adicionar
        </button>
      </div>

      <div className="input-row">
        <input type="text" placeholder="Filtrar por projeto..." value={filter} onChange={e => setFilter(e.target.value)} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">Todos</option>
          <option value="pending">Pendentes</option>
          <option value="done">Concluídos</option>
        </select>
      </div>

      <div className="req-list">
        {!filtered.length ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <p>Nenhum requisito encontrado</p>
          </div>
        ) : filtered.map(r => (
          <div key={r.id} className={`req-item ${r.done ? 'done' : ''}`}>
            <div className={`req-check ${r.done ? 'checked' : ''}`} onClick={() => toggleReq(r.id)}>
              {r.done ? '✓' : ''}
            </div>
            <div style={{ flex: 1 }}>
              <div className="req-text">{esc(r.text)}</div>
              {r.project && <div className="req-project">{esc(r.project)}</div>}
            </div>
            <span className={`badge ${prioColor[r.priority]}`}>{prioLabel[r.priority]}</span>
            <button className="icon-btn" onClick={() => deleteReq(r.id)}>🗑️</button>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Requisito"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={saveRequisito}>Salvar</button>
          </>
        }
      >
        <div className="form-group">
          <label>Descrição</label>
          <input type="text" placeholder="Ex: Criar tela de login" value={text} onChange={e => setText(e.target.value)} autoFocus />
        </div>
        <div className="form-group">
          <label>Projeto</label>
          <input type="text" placeholder="Ex: App Mobile" value={project} onChange={e => setProject(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Prioridade</label>
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>
      </Modal>
    </>
  );
}

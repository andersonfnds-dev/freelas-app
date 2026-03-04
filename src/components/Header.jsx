export default function Header({ activeSection, onChangeSection }) {
  const sections = [
    { id: 'calendario', label: 'Calendário' },
    { id: 'pagamentos', label: 'Pagamentos' },
    { id: 'requisitos', label: 'Requisitos' },
  ];

  return (
    <header>
      <div className="header-inner">
        <span className="logo">freelas</span>
        {sections.map(s => (
          <button
            key={s.id}
            className={`nav-btn ${activeSection === s.id ? 'active' : ''}`}
            onClick={() => onChangeSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </header>
  );
}

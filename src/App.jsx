import { useState, useRef, useEffect } from 'react';
import { FirebaseProvider, useFirebase } from './hooks/useFirebase';
import Header from './components/Header';
import Timer from './components/Timer';
import Calendar from './components/Calendar';
import Pagamentos from './components/Pagamentos';
import Requisitos from './components/Requisitos';
import './App.css';

function AppContent() {
  const [section, setSection] = useState('calendario');
  const { loading, toastMsg } = useFirebase();
  const toastRef = useRef(null);

  useEffect(() => {
    if (toastMsg) {
      toastRef.current?.classList.add('show');
    } else {
      toastRef.current?.classList.remove('show');
    }
  }, [toastMsg]);

  if (loading) {
    return (
      <>
        <Header activeSection={section} onChangeSection={setSection} />
        <main>
          <div className="empty-state">
            <p>Carregando...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header activeSection={section} onChangeSection={setSection} />
      <main>
        {section === 'calendario' && (
          <>
            <Timer />
            <Calendar />
          </>
        )}
        {section === 'pagamentos' && <Pagamentos />}
        {section === 'requisitos' && <Requisitos />}
      </main>
      <div className="toast" ref={toastRef}>{toastMsg}</div>
    </>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  );
}

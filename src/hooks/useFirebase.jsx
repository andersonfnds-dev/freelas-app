import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ref, set, onValue, get } from 'firebase/database';
import { db } from '../firebase';

const FirebaseContext = createContext(null);

const DATA_KEYS = ['workLog', 'dayEntries', 'dayNotes', 'pagamentos', 'requisitos'];
const DATA_DEFAULTS = {
  workLog: {}, dayEntries: {}, dayNotes: {}, pagamentos: [], requisitos: []
};

function loadLocal(key, def) {
  try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; }
}

export function FirebaseProvider({ children }) {
  const [workLog, setWorkLog] = useState({});
  const [dayEntries, setDayEntries] = useState({});
  const [dayNotes, setDayNotes] = useState({});
  const [pagamentos, setPagamentos] = useState([]);
  const [requisitos, setRequisitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef(null);
  const listenersSet = useRef(false);

  const setters = useRef({
    workLog: setWorkLog, dayEntries: setDayEntries, dayNotes: setDayNotes,
    pagamentos: setPagamentos, requisitos: setRequisitos
  });

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2500);
  }, []);

  const save = useCallback((key, val) => {
    set(ref(db, key), val);
  }, []);

  useEffect(() => {
    get(ref(db, '/')).then(snap => {
      const fbData = snap.val() || {};
      let migrated = false;

      DATA_KEYS.forEach(key => {
        if (fbData[key] != null) {
          setters.current[key](fbData[key]);
        } else {
          const local = loadLocal(key, DATA_DEFAULTS[key]);
          const hasData = Array.isArray(local) ? local.length > 0 : Object.keys(local).length > 0;
          if (hasData) {
            setters.current[key](local);
            set(ref(db, key), local);
            migrated = true;
          }
        }
      });

      setLoading(false);
      if (migrated) toast('Dados migrados para a nuvem');

      if (!listenersSet.current) {
        listenersSet.current = true;
        DATA_KEYS.forEach(key => {
          onValue(ref(db, key), snap => {
            const val = snap.val();
            setters.current[key](val ?? DATA_DEFAULTS[key]);
          });
        });
      }
    }).catch(err => {
      console.error('Firebase load failed, using localStorage:', err);
      DATA_KEYS.forEach(key => {
        setters.current[key](loadLocal(key, DATA_DEFAULTS[key]));
      });
      setLoading(false);
    });
  }, [toast]);

  const value = {
    workLog, dayEntries, dayNotes, pagamentos, requisitos,
    setWorkLog, setDayEntries, setDayNotes, setPagamentos, setRequisitos,
    save, loading, toastMsg, toast
  };

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
}

export function useFirebase() {
  return useContext(FirebaseContext);
}

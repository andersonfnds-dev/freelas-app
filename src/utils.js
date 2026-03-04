export const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                          'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
export const MONTHS_PT_LOWER = ['janeiro','fevereiro','março','abril','maio','junho',
                                 'julho','agosto','setembro','outubro','novembro','dezembro'];
export const DAYS_PT = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
export const WEEKDAYS_PT = ['domingo','segunda-feira','terça-feira','quarta-feira',
                             'quinta-feira','sexta-feira','sábado'];

export const VALOR_HORA = 80;
export const DAY_PASSWORD = '123456';

export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function msToHMS(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h,m,sec].map(x => String(x).padStart(2,'0')).join(':');
}

export function msToLabel(ms) {
  if (!ms) return '0 min';
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  const rm = m % 60;
  if (h === 0) return `${rm} min`;
  if (rm === 0) return `${h}h`;
  return `${h}h ${rm}min`;
}

export function fmtTimeFromDate(d) {
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

export function fmtBRL(v) {
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtDate(d) {
  if (!d) return '';
  const [y,m,day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export function esc(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

export function getMonthTotalMs(workLog, dayEntries, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let totalMs = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const timerMs = workLog[key] || 0;
    const manualMs = (dayEntries[key] || []).filter(e => !e.fromTimer).reduce((s, e) => s + e.ms, 0);
    totalMs += timerMs + manualMs;
  }
  return totalMs;
}

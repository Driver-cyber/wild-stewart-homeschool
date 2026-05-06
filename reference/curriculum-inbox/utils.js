/* Shared utilities, constants, status helpers */
const { useState, useEffect, useMemo, useCallback, useRef } = React;

window.STUDENTS = [
  { id: 'student_a', name: 'Student A', initial: 'A', color: 'oklch(0.55 0.11 38)' },
  { id: 'student_b', name: 'Student B', initial: 'B', color: 'oklch(0.55 0.09 200)' },
];

window.STATUS_ORDER = ['todo', 'progress', 'review', 'mastered'];
window.STATUS_LABELS = {
  todo: 'To do',
  progress: 'In progress',
  review: 'Needs review',
  mastered: 'Mastered',
};

window.STORAGE_KEY = 'kinder_curriculum_v2';

window.loadState = function() {
  try {
    const raw = localStorage.getItem(window.STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { progress: {}, notes: {}, assignments: {}, diagnostics: {} };
};

window.saveState = function(state) {
  try { localStorage.setItem(window.STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
};

window.unitRoman = function(n) {
  const r = ['I','II','III','IV','V','VI','VII','VIII'];
  return r[n - 1] || String(n);
};

// Date helpers for calendar
window.todayISO = function() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

window.formatDate = function(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

window.addDays = function(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

window.startOfWeekMonday = function(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0,0,0,0);
  return date;
};

window.monthGrid = function(year, month) {
  // returns array of 42 ISO date strings (6 weeks × 7 days), Mon-start
  const first = new Date(year, month, 1);
  const start = window.startOfWeekMonday(first);
  const grid = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    grid.push(d.toISOString().slice(0, 10));
  }
  return grid;
};

window.MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
window.WEEKDAY_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

/**
 * Attendance Manager - Modern Mobile Native App Engine
 */

const STORAGE_KEY = 'attendance_app_data_v3';

const DEFAULT_STATE = {
  settings: {
    targetPercentage: 75,
    includeSaturday: false,
    soundEnabled: true,
    snoozeMinutes: 5
  },
  timetable: {
    Monday: [
      { id: 'mon-1', subject: 'Mathematics', startTime: '09:00', endTime: '10:00', room: 'Room 101' },
      { id: 'mon-2', subject: 'Data Structures', startTime: '10:15', endTime: '11:15', room: 'Lab 2' },
      { id: 'mon-3', subject: 'Digital Electronics', startTime: '11:30', endTime: '12:30', room: 'Room 204' }
    ],
    Tuesday: [
      { id: 'tue-1', subject: 'Operating Systems', startTime: '09:00', endTime: '10:00', room: 'Room 102' },
      { id: 'tue-2', subject: 'Mathematics', startTime: '10:15', endTime: '11:15', room: 'Room 101' },
      { id: 'tue-3', subject: 'Data Structures Lab', startTime: '13:30', endTime: '15:30', room: 'Lab 1' }
    ],
    Wednesday: [
      { id: 'wed-1', subject: 'Computer Networks', startTime: '09:00', endTime: '10:00', room: 'Room 103' },
      { id: 'wed-2', subject: 'Operating Systems', startTime: '10:15', endTime: '11:15', room: 'Room 102' },
      { id: 'wed-3', subject: 'Data Structures', startTime: '11:30', endTime: '12:30', room: 'Lab 2' }
    ],
    Thursday: [
      { id: 'thu-1', subject: 'Digital Electronics', startTime: '09:00', endTime: '10:00', room: 'Room 204' },
      { id: 'thu-2', subject: 'Computer Networks', startTime: '10:15', endTime: '11:15', room: 'Room 103' },
      { id: 'thu-3', subject: 'Mathematics', startTime: '11:30', endTime: '12:30', room: 'Room 101' }
    ],
    Friday: [
      { id: 'fri-1', subject: 'Data Structures', startTime: '09:00', endTime: '10:00', room: 'Lab 2' },
      { id: 'fri-2', subject: 'Operating Systems Lab', startTime: '10:15', endTime: '12:15', room: 'Lab 3' },
      { id: 'fri-3', subject: 'Computer Networks', startTime: '13:30', endTime: '14:30', room: 'Room 103' }
    ],
    Saturday: []
  },
  records: [
    { id: 'rec-1', date: '2026-10-26', time: '10:00', subject: 'Mathematics', status: 'present', notes: '' },
    { id: 'rec-2', date: '2026-10-26', time: '11:15', subject: 'Data Structures', status: 'present', notes: '' },
    { id: 'rec-3', date: '2026-10-26', time: '12:30', subject: 'Digital Electronics', status: 'absent', notes: 'Doctor checkup' },
    { id: 'rec-4', date: '2026-10-27', time: '10:00', subject: 'Operating Systems', status: 'present', notes: '' },
    { id: 'rec-5', date: '2026-10-27', time: '11:15', subject: 'Mathematics', status: 'present', notes: '' },
    { id: 'rec-6', date: '2026-10-28', time: '10:00', subject: 'Computer Networks', status: 'present', notes: '' },
    { id: 'rec-7', date: '2026-10-28', time: '11:15', subject: 'Operating Systems', status: 'present', notes: '' },
    { id: 'rec-8', date: '2026-10-29', time: '10:00', subject: 'Digital Electronics', status: 'present', notes: '' },
    { id: 'rec-9', date: '2026-10-29', time: '11:15', subject: 'Computer Networks', status: 'absent', notes: 'Overslept' }
  ],
  promptedHistory: {}
};

class AppState {
  constructor() {
    this.data = this.load();
    this.activeDay = this.getTodayName();
    this.activePrompt = null;
    this.lastRecordedId = null;
    this.undoTimeout = null;
    this.snoozeQueue = {};
  }

  getTodayName() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = days[new Date().getDay()];
    return (d === 'Sunday') ? 'Monday' : d;
  }

  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_STATE,
          ...parsed,
          settings: { ...DEFAULT_STATE.settings, ...parsed.settings },
          timetable: { ...DEFAULT_STATE.timetable, ...parsed.timetable }
        };
      }
    } catch (e) {
      console.warn('Error loading localStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }

  getUniqueSubjects() {
    const subs = new Set();
    Object.values(this.data.timetable).forEach(list => {
      list.forEach(item => { if (item.subject) subs.add(item.subject); });
    });
    this.data.records.forEach(r => { if (r.subject) subs.add(r.subject); });
    return Array.from(subs).sort();
  }

  calculateStats() {
    const target = (this.data.settings.targetPercentage || 75) / 100;
    const overall = { attended: 0, absent: 0, cancelled: 0, total: 0, pct: 100, canBunk: 0, needAttend: 0 };
    const subjects = {};

    this.getUniqueSubjects().forEach(s => {
      subjects[s] = { subject: s, attended: 0, absent: 0, cancelled: 0, total: 0, pct: 100, canBunk: 0, needAttend: 0 };
    });

    this.data.records.forEach(r => {
      const s = r.subject || 'Unknown';
      if (!subjects[s]) {
        subjects[s] = { subject: s, attended: 0, absent: 0, cancelled: 0, total: 0, pct: 100, canBunk: 0, needAttend: 0 };
      }
      const st = (r.status || '').toLowerCase();
      if (st === 'present') {
        overall.attended++;
        overall.total++;
        subjects[s].attended++;
        subjects[s].total++;
      } else if (st === 'absent') {
        overall.absent++;
        overall.total++;
        subjects[s].absent++;
        subjects[s].total++;
      } else if (st === 'cancelled') {
        overall.cancelled++;
        subjects[s].cancelled++;
      }
    });

    this._computeMetrics(overall, target);
    Object.values(subjects).forEach(sub => this._computeMetrics(sub, target));

    return { overall, subjects, targetPercentage: target * 100 };
  }

  _computeMetrics(stat, target) {
    if (stat.total === 0) {
      stat.pct = 100;
      stat.canBunk = 0;
      stat.needAttend = 0;
      stat.status = 'safe';
      return;
    }
    const pct = (stat.attended / stat.total) * 100;
    stat.pct = Math.round(pct * 10) / 10;

    if (pct >= target * 100) {
      stat.canBunk = Math.max(0, Math.floor((stat.attended - (target * stat.total)) / target));
      stat.needAttend = 0;
      stat.status = 'safe';
    } else {
      stat.canBunk = 0;
      const shortage = (target * stat.total) - stat.attended;
      stat.needAttend = Math.max(1, Math.ceil(shortage / (1 - target)));
      stat.status = pct < (target * 100 - 10) ? 'danger' : 'warn';
    }
  }

  addRecord(subject, status, dateStr = null, timeStr = null, notes = '') {
    const now = new Date();
    const d = dateStr || now.toISOString().split('T')[0];
    const t = timeStr || now.toTimeString().slice(0, 5);
    const newRec = {
      id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      date: d,
      time: t,
      subject: subject.trim(),
      status: status.toLowerCase(),
      notes: notes.trim()
    };
    this.data.records.unshift(newRec);
    this.save();
    return newRec;
  }

  toggleRecordStatus(id) {
    const rec = this.data.records.find(r => r.id === id);
    if (rec) {
      if (rec.status === 'present') rec.status = 'absent';
      else if (rec.status === 'absent') rec.status = 'present';
      else rec.status = 'present';
      this.save();
    }
  }

  deleteRecord(id) {
    this.data.records = this.data.records.filter(r => r.id !== id);
    this.save();
  }

  updateRecord(id, subject, status, dateStr, timeStr, notes) {
    const rec = this.data.records.find(r => r.id === id);
    if (rec) {
      rec.subject = subject.trim();
      rec.status = status.toLowerCase();
      rec.date = dateStr;
      rec.time = timeStr;
      rec.notes = notes.trim();
      this.save();
    }
  }

  addLecture(day, subject, startTime, endTime, room) {
    if (!this.data.timetable[day]) this.data.timetable[day] = [];
    const newLec = {
      id: 'lec-' + Date.now(),
      subject: subject.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      room: room.trim()
    };
    this.data.timetable[day].push(newLec);
    this.data.timetable[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    this.save();
  }

  updateLecture(id, day, subject, startTime, endTime, room) {
    Object.keys(this.data.timetable).forEach(d => {
      this.data.timetable[d] = this.data.timetable[d].filter(l => l.id !== id);
    });
    if (!this.data.timetable[day]) this.data.timetable[day] = [];
    this.data.timetable[day].push({ id, subject: subject.trim(), startTime: startTime.trim(), endTime: endTime.trim(), room: room.trim() });
    this.data.timetable[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    this.save();
  }

  deleteLecture(id) {
    Object.keys(this.data.timetable).forEach(d => {
      this.data.timetable[d] = this.data.timetable[d].filter(l => l.id !== id);
    });
    this.save();
  }
}

const state = new AppState();

// Web Audio API Synthesizer chime for alerts
function playNotificationChime() {
  if (!state.data.settings.soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const playTone = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    playTone(587.33, 0, 0.18); // D5
    playTone(880.00, 0.12, 0.32); // A5
  } catch (e) {
    console.log('Audio chime not ready yet');
  }

  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200]);
  }
}

// Background Time Monitor for Lecture End Alerts
function checkLectureTimes() {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[now.getDay()];

  const isMonitored = (dayName !== 'Sunday') && (dayName !== 'Saturday' || state.data.settings.includeSaturday);
  if (!isMonitored) return;

  const todayStr = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().slice(0, 5);
  const timetableToday = state.data.timetable[dayName] || [];

  timetableToday.forEach(lec => {
    if (!lec.endTime) return;

    const promptKey = `${todayStr}_${lec.id}`;
    if (state.snoozeQueue[promptKey] && now < state.snoozeQueue[promptKey]) return;
    if (state.data.promptedHistory[promptKey]) return;

    const [h, m] = lec.endTime.split(':').map(Number);
    const endMinutes = h * 60 + m;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (currentMinutes >= endMinutes && (currentMinutes - endMinutes) <= 240) {
      const alreadyLogged = state.data.records.some(r => r.date === todayStr && r.subject.toLowerCase() === lec.subject.toLowerCase());
      if (!alreadyLogged) {
        state.data.promptedHistory[promptKey] = now.toISOString();
        state.save();
        triggerLecturePrompt(lec, todayStr, promptKey);
      }
    }
  });

  updateUpcomingBanner();
}

function updateUpcomingBanner() {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5);
  const timetableToday = state.data.timetable[dayName] || [];

  const next = timetableToday.find(l => l.endTime > currentTime);
  const banner = document.getElementById('headerStatus');
  if (banner) {
    if (next) {
      banner.textContent = `⏰ Next: ${next.subject} (Ends ${next.endTime})`;
    } else {
      banner.textContent = `🎉 All lectures finished for today!`;
    }
  }
}

// Trigger Bottom Sheet Prompt
function triggerLecturePrompt(lec, dateStr, promptKey) {
  state.activePrompt = { lecture: lec, date: dateStr, promptKey };
  document.getElementById('promptSubject').textContent = lec.subject;
  document.getElementById('promptTimeRoom').textContent = `${lec.startTime} - ${lec.endTime} • ${lec.room || 'No Room Specified'}`;

  document.getElementById('promptActionView').style.display = 'block';
  document.getElementById('promptUndoView').style.display = 'none';

  openModal('modalLecturePrompt');
  playNotificationChime();

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('⏰ Lecture Finished: ' + lec.subject, {
      body: `Did you attend ${lec.subject} (${lec.startTime} - ${lec.endTime})? Tap to mark attendance.`,
      icon: 'icon-192.png'
    });
  }
}

// UI Rendering Functions
function renderDashboard() {
  const stats = state.calculateStats();
  const overall = stats.overall;
  const target = stats.targetPercentage;

  document.getElementById('overallPercentage').textContent = `${overall.pct.toFixed(1)}%`;
  document.getElementById('targetBadge').textContent = `Goal: ${target.toFixed(0)}%`;
  document.getElementById('statAttended').textContent = overall.attended;
  document.getElementById('statTotal').textContent = overall.total;
  document.getElementById('statAbsent').textContent = overall.absent;
  document.getElementById('statCancelled').textContent = overall.cancelled;

  // Animate SVG circular progress gauge
  const circle = document.getElementById('gaugeProgressCircle');
  const circumference = 440; // 2 * pi * 70 = 439.82
  const offset = circumference * (1 - Math.min(100, Math.max(0, overall.pct)) / 100);
  circle.style.strokeDashoffset = offset;

  const pctElem = document.getElementById('overallPercentage');
  const adviceElem = document.getElementById('attendanceAdvice');

  if (overall.pct >= target) {
    circle.style.stroke = 'var(--color-present)';
    pctElem.style.color = 'var(--color-present)';
    adviceElem.className = 'advisor-banner advisor-safe';
    adviceElem.innerHTML = `<span>🟢</span> Safe Zone: You can safely miss <b>${overall.canBunk}</b> class(es) and remain above ${target.toFixed(0)}%`;
  } else if (overall.pct >= (target - 10)) {
    circle.style.stroke = 'var(--color-warn)';
    pctElem.style.color = 'var(--color-warn)';
    adviceElem.className = 'advisor-banner advisor-warn';
    adviceElem.innerHTML = `<span>🟡</span> Warning: You must attend <b>${overall.needAttend}</b> consecutive class(es) to hit ${target.toFixed(0)}%`;
  } else {
    circle.style.stroke = 'var(--color-absent)';
    pctElem.style.color = 'var(--color-absent)';
    adviceElem.className = 'advisor-banner advisor-danger';
    adviceElem.innerHTML = `<span>🔴</span> Shortage Alert: You must attend <b>${overall.needAttend}</b> consecutive class(es) to hit ${target.toFixed(0)}%`;
  }

  // Subject List
  const container = document.getElementById('subjectListContainer');
  container.innerHTML = '';

  const subList = Object.values(stats.subjects);
  if (subList.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 24px; color: var(--text-muted);">No subjects found. Add classes in the Schedule tab!</div>`;
    return;
  }

  subList.forEach(sub => {
    const card = document.createElement('div');
    card.className = 'subject-card';

    let badgeColor = 'var(--color-present)';
    let note = `Safe to bunk: ${sub.canBunk}`;
    if (sub.pct < target) {
      badgeColor = sub.pct < (target - 10) ? 'var(--color-absent)' : 'var(--color-warn)';
      note = `Must attend: ${sub.needAttend}`;
    }

    card.innerHTML = `
      <div class="sub-header-row">
        <span class="sub-title">${sub.subject}</span>
        <span class="sub-pct-chip" style="background: ${badgeColor};">${sub.pct.toFixed(1)}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${Math.min(100, sub.pct)}%; background: ${badgeColor};"></div>
      </div>
      <div class="sub-footer-row">
        <span class="sub-stat-text">${sub.attended}/${sub.total} Classes • ${note}</span>
        <div class="sub-btn-group">
          <button class="btn-chip btn-chip-green" onclick="quickAddAttendance('${sub.subject}', 'present')">+ Present</button>
          <button class="btn-chip btn-chip-red" onclick="quickAddAttendance('${sub.subject}', 'absent')">+ Absent</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function quickAddAttendance(subject, status) {
  state.addRecord(subject, status);
  renderDashboard();
  renderHistory();
  updateUpcomingBanner();
}

function renderTimetable() {
  const day = state.activeDay;
  const list = state.data.timetable[day] || [];
  const container = document.getElementById('timetableListContainer');
  container.innerHTML = '';

  document.querySelectorAll('.day-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.day === day);
  });

  if (list.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 36px 20px; background: var(--bg-card); border-radius: 18px; border: 1px solid var(--border-subtle); color: var(--text-muted);">
        No lectures scheduled for <b>${day}</b>.<br><span style="font-size: 0.8rem; margin-top: 6px; display: inline-block;">Tap <b>+ Add Lecture</b> above to add your classes.</span>
      </div>
    `;
    return;
  }

  list.forEach(lec => {
    const row = document.createElement('div');
    row.className = 'timetable-row';
    row.innerHTML = `
      <div class="time-badge">
        <div class="time-start">${lec.startTime}</div>
        <div class="time-end">${lec.endTime}</div>
      </div>
      <div class="lec-details">
        <div class="lec-name">${lec.subject}</div>
        <div class="lec-meta">📍 ${lec.room || 'No Room Specified'}</div>
      </div>
      <div class="lec-row-actions">
        <button class="btn-chip btn-chip-blue" onclick="openEditLecture('${lec.id}')">✏️</button>
        <button class="btn-chip btn-chip-red" onclick="deleteLectureSlot('${lec.id}')">🗑️</button>
      </div>
    `;
    container.appendChild(row);
  });
}

function renderHistory() {
  const container = document.getElementById('historyListContainer');
  container.innerHTML = '';

  const subFilter = document.getElementById('filterSubject').value;
  const statusFilter = document.getElementById('filterStatus').value;

  const filterSelect = document.getElementById('filterSubject');
  const currentVal = filterSelect.value;
  filterSelect.innerHTML = '<option value="All">All Subjects</option>';
  state.getUniqueSubjects().forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    if (s === currentVal) opt.selected = true;
    filterSelect.appendChild(opt);
  });

  let records = [...state.data.records];
  if (subFilter && subFilter !== 'All') {
    records = records.filter(r => r.subject === subFilter);
  }
  if (statusFilter && statusFilter !== 'All') {
    records = records.filter(r => r.status === statusFilter);
  }

  if (records.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 24px; color: var(--text-muted);">No attendance records found.</div>`;
    return;
  }

  records.forEach(r => {
    const row = document.createElement('div');
    row.className = 'history-card-row';

    let badgeClass = 'badge-present';
    let badgeText = 'PRESENT';
    if (r.status === 'absent') { badgeClass = 'badge-absent'; badgeText = 'ABSENT'; }
    else if (r.status === 'cancelled') { badgeClass = 'badge-cancelled'; badgeText = 'CANCELLED'; }

    row.innerHTML = `
      <div class="hist-left">
        <div class="hist-subject-name">${r.subject}</div>
        <div class="hist-timestamp">📅 ${r.date} ${r.time} ${r.notes ? '• ' + r.notes : ''}</div>
      </div>
      <div class="hist-right-actions">
        <span class="status-badge ${badgeClass}">${badgeText}</span>
        <button class="btn-toggle-quick" onclick="toggleRecord('${r.id}')" title="1-Tap Toggle between Present and Absent">🔄 Toggle</button>
        <button class="btn-chip btn-chip-blue" onclick="openEditRecord('${r.id}')">✏️</button>
        <button class="btn-chip btn-chip-red" onclick="deleteRecordItem('${r.id}')">🗑️</button>
      </div>
    `;
    container.appendChild(row);
  });
}

function toggleRecord(id) {
  state.toggleRecordStatus(id);
  renderDashboard();
  renderHistory();
}

function deleteRecordItem(id) {
  if (confirm('Delete this attendance entry?')) {
    state.deleteRecord(id);
    renderDashboard();
    renderHistory();
  }
}

function deleteLectureSlot(id) {
  if (confirm('Remove this lecture slot from schedule?')) {
    state.deleteLecture(id);
    renderTimetable();
    updateUpcomingBanner();
  }
}

// Modal Helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

// Dialog Handlers
function openAddLecture() {
  document.getElementById('modalLectureTitle').textContent = 'Add Lecture Slot';
  document.getElementById('lecEditId').value = '';
  document.getElementById('lecDay').value = state.activeDay;
  document.getElementById('lecSubject').value = '';
  document.getElementById('lecStartTime').value = '10:00';
  document.getElementById('lecEndTime').value = '11:00';
  document.getElementById('lecRoom').value = '';
  openModal('modalLectureEditor');
}

function openEditLecture(id) {
  let found = null;
  let foundDay = state.activeDay;
  Object.keys(state.data.timetable).forEach(d => {
    const l = state.data.timetable[d].find(item => item.id === id);
    if (l) { found = l; foundDay = d; }
  });
  if (!found) return;

  document.getElementById('modalLectureTitle').textContent = 'Edit Lecture Slot';
  document.getElementById('lecEditId').value = found.id;
  document.getElementById('lecDay').value = foundDay;
  document.getElementById('lecSubject').value = found.subject;
  document.getElementById('lecStartTime').value = found.startTime;
  document.getElementById('lecEndTime').value = found.endTime;
  document.getElementById('lecRoom').value = found.room || '';
  openModal('modalLectureEditor');
}

function openAddManualRecord() {
  document.getElementById('modalRecordTitle').textContent = 'Add Past Attendance';
  document.getElementById('recEditId').value = '';
  document.getElementById('recSubject').value = '';
  document.getElementById('recStatus').value = 'present';
  document.getElementById('recDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('recTime').value = new Date().toTimeString().slice(0, 5);
  document.getElementById('recNotes').value = '';
  openModal('modalRecordEditor');
}

function openEditRecord(id) {
  const r = state.data.records.find(item => item.id === id);
  if (!r) return;
  document.getElementById('modalRecordTitle').textContent = 'Edit Attendance Record';
  document.getElementById('recEditId').value = r.id;
  document.getElementById('recSubject').value = r.subject;
  document.getElementById('recStatus').value = r.status;
  document.getElementById('recDate').value = r.date;
  document.getElementById('recTime').value = r.time;
  document.getElementById('recNotes').value = r.notes || '';
  openModal('modalRecordEditor');
}

// Prompt Modal Logic
function handlePromptChoice(status) {
  if (!state.activePrompt) return;

  const lec = state.activePrompt.lecture;
  const rec = state.addRecord(lec.subject, status, state.activePrompt.date, lec.endTime);
  state.lastRecordedId = rec.id;

  renderDashboard();
  renderHistory();

  document.getElementById('promptActionView').style.display = 'none';
  document.getElementById('promptUndoView').style.display = 'block';

  const label = status === 'present' ? 'PRESENT ✅' : (status === 'absent' ? 'ABSENT ❌' : 'CANCELLED ⚪');
  document.getElementById('undoStatusText').textContent = `Marked as: ${label}`;

  if (state.undoTimeout) clearTimeout(state.undoTimeout);
  state.undoTimeout = setTimeout(() => {
    closeModal('modalLecturePrompt');
  }, 5000);
}

function handlePromptUndo() {
  if (state.undoTimeout) clearTimeout(state.undoTimeout);
  if (state.lastRecordedId) {
    state.deleteRecord(state.lastRecordedId);
    state.lastRecordedId = null;
    renderDashboard();
    renderHistory();
  }
  document.getElementById('promptActionView').style.display = 'block';
  document.getElementById('promptUndoView').style.display = 'none';
}

function handlePromptSnooze() {
  if (state.activePrompt) {
    const key = state.activePrompt.promptKey;
    state.snoozeQueue[key] = new Date(Date.now() + 5 * 60 * 1000);
  }
  closeModal('modalLecturePrompt');
}

// Calendar Export
function exportToCalendarICS() {
  let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Attendance Manager//EN\r\nCALSCALE:GREGORIAN\r\n";
  const dayMap = { Monday: 'MO', Tuesday: 'TU', Wednesday: 'WE', Thursday: 'TH', Friday: 'FR', Saturday: 'SA' };

  Object.entries(state.data.timetable).forEach(([day, lectures]) => {
    const byDay = dayMap[day];
    if (!byDay) return;

    lectures.forEach(lec => {
      const [sh, sm] = lec.startTime.split(':');
      const [eh, em] = lec.endTime.split(':');
      icsContent += "BEGIN:VEVENT\r\n";
      icsContent += `SUMMARY:${lec.subject}\r\n`;
      icsContent += `DESCRIPTION:Lecture Attendance Alert for ${lec.subject}\r\n`;
      icsContent += `LOCATION:${lec.room || 'College'}\r\n`;
      icsContent += `RRULE:FREQ=WEEKLY;BYDAY=${byDay}\r\n`;
      icsContent += `DTSTART:20261102T${sh}${sm}00\r\n`;
      icsContent += `DTEND:20261102T${eh}${em}00\r\n`;
      icsContent += "BEGIN:VALARM\r\nTRIGGER:PT0M\r\nACTION:DISPLAY\r\nDESCRIPTION:Class ended! Mark attendance now.\r\nEND:VALARM\r\n";
      icsContent += "END:VEVENT\r\n";
    });
  });

  icsContent += "END:VCALENDAR\r\n";
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "college_timetable.ics";
  a.click();
  URL.revokeObjectURL(url);
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const tabId = 'tab-' + btn.dataset.tab;
      document.getElementById(tabId).classList.add('active');

      if (btn.dataset.tab === 'dashboard') renderDashboard();
      if (btn.dataset.tab === 'timetable') renderTimetable();
      if (btn.dataset.tab === 'history') renderHistory();
    });
  });

  document.querySelectorAll('.day-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.activeDay = chip.dataset.day;
      renderTimetable();
    });
  });

  document.getElementById('btnNotifyPermission').addEventListener('click', () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          alert('🔔 Notifications enabled! You will receive alerts at lecture end times.');
          playNotificationChime();
        } else {
          alert('Notifications were blocked. Please enable them in your phone site settings.');
        }
      });
    } else {
      alert('Notifications are not supported in this browser.');
    }
  });

  document.getElementById('btnQuickTestPrompt').addEventListener('click', () => {
    const testLec = {
      id: 'test-demo',
      subject: 'Data Structures & Algorithms',
      startTime: '10:00',
      endTime: '11:00',
      room: 'Computer Lab 2'
    };
    triggerLecturePrompt(testLec, new Date().toISOString().split('T')[0], 'test_prompt');
  });

  document.getElementById('btnPromptPresent').addEventListener('click', () => handlePromptChoice('present'));
  document.getElementById('btnPromptAbsent').addEventListener('click', () => handlePromptChoice('absent'));
  document.getElementById('btnPromptCancel').addEventListener('click', () => handlePromptChoice('cancelled'));
  document.getElementById('btnPromptSnooze').addEventListener('click', handlePromptSnooze);
  document.getElementById('btnPromptUndo').addEventListener('click', handlePromptUndo);
  document.getElementById('btnPromptDone').addEventListener('click', () => closeModal('modalLecturePrompt'));

  document.getElementById('btnAddLecture').addEventListener('click', openAddLecture);
  document.getElementById('formLecture').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('lecEditId').value;
    const day = document.getElementById('lecDay').value;
    const sub = document.getElementById('lecSubject').value;
    const st = document.getElementById('lecStartTime').value;
    const et = document.getElementById('lecEndTime').value;
    const room = document.getElementById('lecRoom').value;

    if (id) state.updateLecture(id, day, sub, st, et, room);
    else state.addLecture(day, sub, st, et, room);

    state.activeDay = day;
    closeModal('modalLectureEditor');
    renderTimetable();
    renderDashboard();
    updateUpcomingBanner();
  });

  document.getElementById('btnAddManualRecord').addEventListener('click', openAddManualRecord);
  document.getElementById('formRecord').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('recEditId').value;
    const sub = document.getElementById('recSubject').value;
    const st = document.getElementById('recStatus').value;
    const d = document.getElementById('recDate').value;
    const t = document.getElementById('recTime').value;
    const notes = document.getElementById('recNotes').value;

    if (id) state.updateRecord(id, sub, st, d, t, notes);
    else state.addRecord(sub, st, d, t, notes);

    closeModal('modalRecordEditor');
    renderHistory();
    renderDashboard();
  });

  document.getElementById('filterSubject').addEventListener('change', renderHistory);
  document.getElementById('filterStatus').addEventListener('change', renderHistory);

  document.getElementById('settingTarget').value = state.data.settings.targetPercentage;
  document.getElementById('settingIncludeSat').checked = state.data.settings.includeSaturday;
  document.getElementById('settingSound').checked = state.data.settings.soundEnabled;

  document.getElementById('btnSaveSettings').addEventListener('click', () => {
    state.data.settings.targetPercentage = parseFloat(document.getElementById('settingTarget').value) || 75;
    state.data.settings.includeSaturday = document.getElementById('settingIncludeSat').checked;
    state.data.settings.soundEnabled = document.getElementById('settingSound').checked;
    state.save();
    document.getElementById('satPill').style.display = state.data.settings.includeSaturday ? 'block' : 'none';
    renderDashboard();
    alert('Preferences saved successfully!');
  });

  document.getElementById('btnExportCalendar').addEventListener('click', exportToCalendarICS);

  document.getElementById('btnExportJSON').addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.data, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", "attendance_backup.json");
    dl.click();
  });

  document.getElementById('btnResetData').addEventListener('click', () => {
    if (confirm('Reset all data to default samples?')) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  });

  renderDashboard();
  renderTimetable();
  renderHistory();
  updateUpcomingBanner();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW registration error:', err));
  }

  setInterval(checkLectureTimes, 5000);
});

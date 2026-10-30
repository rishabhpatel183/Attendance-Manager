/**
 * Attendance Manager - Upcoming Class Focus & Thinkable Safe-Bunk Calculator
 */

const STORAGE_KEY = 'attendance_pure_clean_v8';

// 100% Clean Default State with NO pre-filled subjects
const DEFAULT_STATE = {
  settings: {
    targetPercentage: 75,
    includeSaturday: false,
    soundEnabled: true,
    snoozeMinutes: 5
  },
  timetable: {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: []
  },
  records: [],
  promptedHistory: {}
};

class AppState {
  constructor() {
    this.data = this.load();
    this.activeDay = this.getTodayName();
    this.activePrompt = null;
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

  // Dashboard subjects strictly derive from active timetable schedule!
  getUniqueSubjects() {
    const subs = new Set();
    Object.values(this.data.timetable).forEach(list => {
      list.forEach(item => {
        if (item && item.subject && item.subject.trim()) {
          subs.add(item.subject.trim());
        }
      });
    });
    return Array.from(subs).sort((a, b) => a.localeCompare(b));
  }

  calculateStats() {
    const target = (this.data.settings.targetPercentage || 75) / 100;
    const overall = { attended: 0, absent: 0, cancelled: 0, total: 0, pct: null, canBunk: 0, needAttend: 0, hasRecords: false };
    const subjects = {};

    const uniqueSubs = this.getUniqueSubjects();
    uniqueSubs.forEach(s => {
      subjects[s] = { subject: s, attended: 0, absent: 0, cancelled: 0, total: 0, pct: null, canBunk: 0, needAttend: 0, hasRecords: false };
    });

    this.data.records.forEach(r => {
      const s = (r.subject || '').trim();
      // Only process records for subjects currently active in the schedule
      if (!subjects[s]) return;

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
      stat.pct = null; // No records till now (NOT 100%!)
      stat.canBunk = 0;
      stat.needAttend = 0;
      stat.hasRecords = false;
      stat.status = 'none';
      return;
    }

    stat.hasRecords = true;
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

  // Find the upcoming lecture and its next safe-bunk prediction
  getUpcomingLectureDetails() {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[now.getDay()];
    const currentTime = now.toTimeString().slice(0, 5);

    // Check today first
    const todayList = this.data.timetable[currentDay] || [];
    let nextLec = todayList.find(l => l.endTime > currentTime);
    let dayLabel = "Today";

    // If no more lectures today, check future days
    if (!nextLec) {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      if (this.data.settings.includeSaturday) dayOrder.push('Saturday');

      const startIdx = dayOrder.indexOf(currentDay);
      for (let i = 1; i <= 6; i++) {
        const nextDayName = dayOrder[(startIdx + i) % dayOrder.length];
        const nextDayList = this.data.timetable[nextDayName] || [];
        if (nextDayList.length > 0) {
          nextLec = nextDayList[0];
          dayLabel = nextDayName;
          break;
        }
      }
    }

    if (!nextLec) return null;

    // Calculate prediction specifically for this subject!
    const stats = this.calculateStats();
    const target = this.data.settings.targetPercentage || 75;
    const subStat = stats.subjects[nextLec.subject] || { attended: 0, total: 0, pct: null, hasRecords: false };

    let prediction = {};
    if (!subStat.hasRecords) {
      prediction = {
        hasRecords: false,
        currentPct: null,
        bunkPct: 0.0,
        attendPct: 100.0,
        canBunk: false,
        advice: "First lecture of this subject! Attend to start at 100%."
      };
    } else {
      const att = subStat.attended;
      const tot = subStat.total;
      const bunkPct = Math.round((att / (tot + 1)) * 1000) / 10;
      const attendPct = Math.round(((att + 1) / (tot + 1)) * 1000) / 10;
      const canBunk = bunkPct >= target;

      prediction = {
        hasRecords: true,
        currentPct: subStat.pct,
        attended: att,
        total: tot,
        bunkPct: bunkPct,
        attendPct: attendPct,
        canBunk: canBunk,
        advice: canBunk
          ? `😎 Safe to Bunk! Your attendance will be ${bunkPct}% (still above ${target}%).`
          : `⚠️ Must Attend! If you bunk, attendance drops to ${bunkPct}% (below ${target}%).`
      };
    }

    return {
      lecture: nextLec,
      dayLabel: dayLabel,
      prediction: prediction
    };
  }

  // Get most recently marked attendance record
  getLastUpdatedRecord() {
    if (!this.data.records || this.data.records.length === 0) return null;
    return this.data.records[0]; // records are sorted newest first
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
      return rec;
    }
    return null;
  }

  deleteRecord(id) {
    const rec = this.data.records.find(r => r.id === id);
    this.data.records = this.data.records.filter(r => r.id !== id);
    this.save();
    return rec;
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
    let removedSubject = null;
    Object.keys(this.data.timetable).forEach(d => {
      const found = this.data.timetable[d].find(l => l.id === id);
      if (found) removedSubject = found.subject;
      this.data.timetable[d] = this.data.timetable[d].filter(l => l.id !== id);
    });

    if (removedSubject) {
      const subjectLower = removedSubject.trim().toLowerCase();
      // Check if this subject is still in any other timetable slot
      const stillInTimetable = Object.values(this.data.timetable).some(list =>
        list.some(l => l.subject && l.subject.trim().toLowerCase() === subjectLower)
      );

      if (!stillInTimetable) {
        // Completely remove records for this deleted subject so it disappears from dashboard
        this.data.records = this.data.records.filter(r =>
          r.subject && r.subject.trim().toLowerCase() !== subjectLower
        );
      }
    }

    this.save();
    return removedSubject;
  }
}

const state = new AppState();

// Bottom Floating Toast (Small, Unobtrusive Undo / Redo at bottom)
let toastTimer = null;
function showBottomToast(message, actionText, actionCallback) {
  const toastContainer = document.getElementById('bottomToast');
  const msgElem = document.getElementById('toastMessage');
  const btnAction = document.getElementById('btnToastUndo');

  if (!toastContainer || !msgElem || !btnAction) return;

  if (toastTimer) clearTimeout(toastTimer);

  msgElem.textContent = message;
  btnAction.textContent = actionText;

  const newBtn = btnAction.cloneNode(true);
  btnAction.parentNode.replaceChild(newBtn, btnAction);

  newBtn.addEventListener('click', () => {
    if (actionCallback) actionCallback();
  });

  toastContainer.classList.add('active');

  toastTimer = setTimeout(() => {
    toastContainer.classList.remove('active');
  }, 4500);
}

function hideBottomToast() {
  const toastContainer = document.getElementById('bottomToast');
  if (toastContainer) toastContainer.classList.remove('active');
  if (toastTimer) clearTimeout(toastTimer);
}

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
      gain.gain.setValueAtTime(0.25, ctx.currentTime + start);
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
  const upcoming = state.getUpcomingLectureDetails();
  const banner = document.getElementById('headerStatus');
  if (banner) {
    if (upcoming) {
      banner.textContent = `⏰ ${upcoming.dayLabel}: ${upcoming.lecture.subject} (${upcoming.lecture.startTime})`;
    } else {
      banner.textContent = `No scheduled classes`;
    }
  }
}

// Trigger Bottom Sheet Prompt
function triggerLecturePrompt(lec, dateStr, promptKey) {
  state.activePrompt = { lecture: lec, date: dateStr, promptKey };
  document.getElementById('promptSubject').textContent = lec.subject;
  document.getElementById('promptTimeRoom').textContent = `${lec.startTime} - ${lec.endTime} • ${lec.room || 'No Room Specified'}`;

  openModal('modalLecturePrompt');
  playNotificationChime();

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('⏰ Lecture Finished: ' + lec.subject, {
      body: `Did you attend ${lec.subject} (${lec.startTime} - ${lec.endTime})? Tap to mark attendance.`,
      icon: 'icon-192.png'
    });
  }
}

// Prompt Choice Handler
function handlePromptChoice(status) {
  if (!state.activePrompt) return;

  const lec = state.activePrompt.lecture;
  const rec = state.addRecord(lec.subject, status, state.activePrompt.date, lec.endTime);

  closeModal('modalLecturePrompt');

  renderDashboard();
  renderHistory();

  const label = status === 'present' ? 'Present ✅' : (status === 'absent' ? 'Absent ❌' : 'Cancelled ⚪');
  
  showBottomToast(`Marked ${lec.subject} as ${label}`, '↩️ Undo', () => {
    state.deleteRecord(rec.id);
    renderDashboard();
    renderHistory();
    showBottomToast(`Undone: ${lec.subject}`, '↪️ Redo', () => {
      state.addRecord(lec.subject, status, rec.date, rec.time);
      renderDashboard();
      renderHistory();
      hideBottomToast();
    });
  });
}

function handlePromptSnooze() {
  if (state.activePrompt) {
    const key = state.activePrompt.promptKey;
    state.snoozeQueue[key] = new Date(Date.now() + 5 * 60 * 1000);
  }
  closeModal('modalLecturePrompt');
  showBottomToast(`Snoozed for 5 minutes ⏱`, 'Dismiss', hideBottomToast);
}

// UI Rendering Functions
function renderDashboard() {
  const uniqueSubs = state.getUniqueSubjects();
  const heroContainer = document.getElementById('heroFocusContainer');
  const lastContainer = document.getElementById('lastUpdatedContainer');
  const overallContainer = document.getElementById('overallSummaryContainer');
  const overallSummaryText = document.getElementById('overallSummaryText');
  const breakdownSection = document.getElementById('subjectBreakdownSection');
  const subContainer = document.getElementById('subjectListContainer');

  // CASE 1: NO subjects added to schedule yet!
  if (uniqueSubs.length === 0) {
    if (overallContainer) overallContainer.style.display = 'none';
    if (breakdownSection) breakdownSection.style.display = 'none';
    if (lastContainer) lastContainer.innerHTML = '';
    if (subContainer) subContainer.innerHTML = '';

    heroContainer.innerHTML = `
      <div class="empty-state-box" style="margin-top: 10px; padding: 32px 18px;">
        <div class="empty-state-icon" style="font-size: 2.5rem;">🎓</div>
        <div class="empty-state-title" style="font-size: 1.15rem; margin-bottom: 6px;">No Subjects Added Yet</div>
        <div class="empty-state-sub" style="font-size: 0.82rem; max-width: 300px; margin: 0 auto 18px auto; color: var(--text-muted); line-height: 1.4;">
          Add your lectures in the Schedule tab to start tracking your attendance and predicting safe bunks.
        </div>
        <button class="btn-cta-primary" style="max-width: 220px; margin: 0 auto; display: block;" onclick="openAddLecture()">+ Add Your First Lecture</button>
      </div>
    `;
    return;
  }

  // CASE 2: Subjects ARE added to schedule!
  if (overallContainer) overallContainer.style.display = 'flex';
  if (breakdownSection) breakdownSection.style.display = 'block';

  const stats = state.calculateStats();
  const overall = stats.overall;
  const target = stats.targetPercentage;
  const upcomingData = state.getUpcomingLectureDetails();
  const lastRecord = state.getLastUpdatedRecord();

  // 1. Overall Summary Text (NEVER 100% when no records exist!)
  if (!overall.hasRecords) {
    overallSummaryText.textContent = `No records till now`;
    overallSummaryText.style.color = `var(--text-muted)`;
  } else {
    overallSummaryText.textContent = `${overall.pct.toFixed(1)}% (${overall.attended}/${overall.total} attended)`;
    overallSummaryText.style.color = overall.pct >= target ? `var(--color-present)` : `var(--color-absent)`;
  }

  // 2. Main Hero Focus: Upcoming Class & Thinkable Safe-Bunk Calculator
  if (upcomingData) {
    const lec = upcomingData.lecture;
    const pred = upcomingData.prediction;
    const isSafe = pred.canBunk;

    const currentScoreHtml = pred.hasRecords 
      ? `<span class="sub-current-val" style="color: ${pred.currentPct >= target ? 'var(--color-present)' : 'var(--color-absent)'}">${pred.currentPct.toFixed(1)}% (${pred.attended}/${pred.total})</span>`
      : `<span style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted);">No records till now</span>`;

    const impactChipsHtml = pred.hasRecords ? `
      <div class="bunk-impact-row">
        <div class="impact-chip">
          <div style="color: var(--text-muted); font-size: 0.7rem;">IF YOU BUNK</div>
          <div style="font-size: 0.95rem; font-weight: 900; color: ${pred.bunkPct >= target ? 'var(--color-present)' : 'var(--color-absent)'}">${pred.bunkPct}%</div>
        </div>
        <div class="impact-chip">
          <div style="color: var(--text-muted); font-size: 0.7rem;">IF YOU ATTEND</div>
          <div style="font-size: 0.95rem; font-weight: 900; color: var(--color-present);">${pred.attendPct}%</div>
        </div>
      </div>
    ` : `
      <div class="bunk-impact-row">
        <div class="impact-chip">
          <div style="color: var(--text-muted); font-size: 0.7rem;">IF YOU BUNK</div>
          <div style="font-size: 0.95rem; font-weight: 900; color: var(--color-absent);">0.0%</div>
        </div>
        <div class="impact-chip">
          <div style="color: var(--text-muted); font-size: 0.7rem;">IF YOU ATTEND</div>
          <div style="font-size: 0.95rem; font-weight: 900; color: var(--color-present);">100.0%</div>
        </div>
      </div>
    `;

    heroContainer.innerHTML = `
      <div class="upcoming-hero-card">
        <div class="card-top-badge-row">
          <span class="badge-tag-upcoming">⏰ Upcoming Class (${upcomingData.dayLabel})</span>
          <span class="target-goal-chip">Target: ${target}%</span>
        </div>
        
        <h2 class="upcoming-subject-title">${lec.subject}</h2>
        <div class="upcoming-time-meta">⏰ ${lec.startTime} - ${lec.endTime} • 📍 ${lec.room || 'No Room Specified'}</div>

        <div class="upcoming-stats-strip">
          <span class="sub-current-lbl">Current Subject Attendance:</span>
          ${currentScoreHtml}
        </div>

        <div class="bunk-decision-box ${isSafe ? 'bunk-box-safe' : 'bunk-box-danger'}">
          <div class="bunk-decision-title ${isSafe ? 'bunk-decision-safe-text' : 'bunk-decision-danger-text'}">
            <span>${isSafe ? '😎' : '⚠️'}</span> ${pred.advice}
          </div>
          ${impactChipsHtml}
        </div>
      </div>
    `;
  } else {
    // If no upcoming classes found in timetable
    heroContainer.innerHTML = `
      <div class="empty-state-box" style="padding: 18px 16px;">
        <div class="empty-state-icon" style="font-size: 1.6rem; margin-bottom: 4px;">📅</div>
        <div class="empty-state-title" style="font-size: 0.95rem;">All classes done for today!</div>
        <div class="empty-state-sub" style="margin-bottom: 0;">Check your Schedule tab for upcoming days.</div>
      </div>
    `;
  }

  // 3. Last Class Updated Strip (Only if last record belongs to an active subject)
  if (lastRecord && uniqueSubs.includes(lastRecord.subject)) {
    const isPres = lastRecord.status === 'present';
    const stIcon = isPres ? '✅' : (lastRecord.status === 'absent' ? '❌' : '⚪');
    const stColor = isPres ? 'var(--color-present)' : (lastRecord.status === 'absent' ? 'var(--color-absent)' : 'var(--text-muted)');
    const stText = isPres ? 'Present' : (lastRecord.status === 'absent' ? 'Absent' : 'Cancelled');

    lastContainer.innerHTML = `
      <div class="last-updated-strip">
        <div class="last-up-left">
          <span class="last-up-icon">${stIcon}</span>
          <div>
            <div class="last-up-title">Last Class: ${lastRecord.subject} (${stText})</div>
            <div class="last-up-time">📅 ${lastRecord.date} at ${lastRecord.time}</div>
          </div>
        </div>
        <button class="btn-toggle-quick" onclick="toggleRecord('${lastRecord.id}')" title="1-Tap Toggle">🔄 Toggle</button>
      </div>
    `;
  } else {
    lastContainer.innerHTML = ``;
  }

  // 4. Subject Cards List
  subContainer.innerHTML = '';
  const subList = Object.values(stats.subjects);

  subList.forEach(sub => {
    const card = document.createElement('div');
    card.className = 'subject-card';

    let badgeColor = 'var(--text-muted)';
    let badgeText = 'No records till now';
    let note = '0 lectures conducted';
    let progressPct = 0;

    if (sub.hasRecords) {
      progressPct = sub.pct;
      badgeText = `${sub.pct.toFixed(1)}%`;
      if (sub.pct >= target) {
        badgeColor = 'var(--color-present)';
        note = `Safe to bunk: ${sub.canBunk}`;
      } else {
        badgeColor = sub.pct < (target - 10) ? 'var(--color-absent)' : 'var(--color-warn)';
        note = `Must attend: ${sub.needAttend}`;
      }
    }

    card.innerHTML = `
      <div class="sub-header-row">
        <span class="sub-title">${sub.subject}</span>
        <span class="sub-pct-chip" style="background: ${badgeColor};">${badgeText}</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${progressPct}%; background: ${badgeColor};"></div>
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
  const rec = state.addRecord(subject, status);
  renderDashboard();
  renderHistory();
  updateUpcomingBanner();

  const label = status === 'present' ? 'Present ✅' : 'Absent ❌';
  showBottomToast(`Marked ${subject} as ${label}`, '↩️ Undo', () => {
    state.deleteRecord(rec.id);
    renderDashboard();
    renderHistory();
  });
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
      <div class="empty-state-box">
        <div class="empty-state-icon">📅</div>
        <div class="empty-state-title">No Lectures for ${day}</div>
        <div class="empty-state-sub">Tap below to add classes scheduled on this day.</div>
        <button class="btn-chip btn-chip-blue" style="margin: 0 auto; padding: 10px 20px;" onclick="openAddLecture()">+ Add Lecture for ${day}</button>
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
    container.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-title">No Attendance Records Yet</div>
        <div class="empty-state-sub">As your lectures finish, pop-ups will record your attendance here. You can also add past entries manually.</div>
        <button class="btn-chip btn-chip-blue" style="margin: 0 auto; padding: 10px 20px;" onclick="openAddManualRecord()">+ Add Past Entry</button>
      </div>
    `;
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
  const updated = state.toggleRecordStatus(id);
  renderDashboard();
  renderHistory();
  if (updated) {
    const label = updated.status === 'present' ? 'Present ✅' : 'Absent ❌';
    showBottomToast(`Switched ${updated.subject} to ${label}`, '↩️ Revert', () => {
      state.toggleRecordStatus(id);
      renderDashboard();
      renderHistory();
    });
  }
}

function deleteRecordItem(id) {
  const deleted = state.deleteRecord(id);
  renderDashboard();
  renderHistory();
  if (deleted) {
    showBottomToast(`Deleted record for ${deleted.subject}`, '↩️ Undo', () => {
      state.addRecord(deleted.subject, deleted.status, deleted.date, deleted.time, deleted.notes);
      renderDashboard();
      renderHistory();
    });
  }
}

function deleteLectureSlot(id) {
  const removedSubject = state.deleteLecture(id);
  renderTimetable();
  updateUpcomingBanner();
  renderDashboard();
  renderHistory();
  showBottomToast(removedSubject ? `Removed ${removedSubject} from schedule & dashboard` : `Removed lecture slot`, 'Dismiss', hideBottomToast);
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

// Standalone / App Mode Detection to hide "Get the Mobile App" banner in app
function checkAppMode() {
  const isStandalone = 
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://') ||
    window.location.search.includes('mode=standalone') ||
    window.location.search.includes('source=pwa') ||
    localStorage.getItem('app_installed_mode') === 'true' ||
    localStorage.getItem('dismiss_install_banner') === 'true';

  const banner = document.getElementById('downloadBanner');
  if (banner) {
    if (isStandalone) {
      banner.style.display = 'none';
      if (window.location.search.includes('mode=standalone') || window.navigator.standalone) {
        localStorage.setItem('app_installed_mode', 'true');
      }
    } else {
      banner.style.display = 'flex';
    }
  }
}

function dismissAppBanner() {
  const banner = document.getElementById('downloadBanner');
  if (banner) banner.style.display = 'none';
  localStorage.setItem('dismiss_install_banner', 'true');
}

// PWA Install Prompt Capture
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const btn = document.getElementById('btnInstallPwa');
  if (btn) btn.style.display = 'inline-flex';
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Check standalone mode immediately
  checkAppMode();

  const btnDismiss = document.getElementById('btnDismissBanner');
  if (btnDismiss) btnDismiss.addEventListener('click', dismissAppBanner);

  const btnApk = document.getElementById('btnDownloadApkLink');
  if (btnApk) {
    btnApk.addEventListener('click', () => {
      localStorage.setItem('dismiss_install_banner', 'true');
      setTimeout(checkAppMode, 300);
    });
  }

  // Navigation
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

  const dashAddBtn = document.getElementById('btnDashAddLec');
  if (dashAddBtn) dashAddBtn.addEventListener('click', openAddLecture);

  // Install PWA Button Click
  const btnInstall = document.getElementById('btnInstallPwa');
  if (btnInstall) {
    btnInstall.addEventListener('click', () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then(() => {
          deferredInstallPrompt = null;
        });
      } else {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIOS) {
          alert('🍏 On iPhone: Tap the Share button at the bottom of Safari, then tap "Add to Home Screen" (➕).');
        } else {
          alert('🤖 On Android: Tap the 3 dots menu in Chrome, then tap "Install app" (or click the 📥 APK button to download the APK directly!).');
        }
      }
    });
  }

  // Notification Permission
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
      subject: 'Sample Lecture',
      startTime: '10:00',
      endTime: '11:00',
      room: 'Room 101'
    };
    triggerLecturePrompt(testLec, new Date().toISOString().split('T')[0], 'test_prompt');
  });

  // Prompt Buttons
  document.getElementById('btnPromptPresent').addEventListener('click', () => handlePromptChoice('present'));
  document.getElementById('btnPromptAbsent').addEventListener('click', () => handlePromptChoice('absent'));
  document.getElementById('btnPromptCancel').addEventListener('click', () => handlePromptChoice('cancelled'));
  document.getElementById('btnPromptSnooze').addEventListener('click', handlePromptSnooze);

  // Form Lecture
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
    showBottomToast(`Saved lecture: ${sub}`, 'Dismiss', hideBottomToast);
  });

  // Form Record
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
    showBottomToast(`Saved record for ${sub}`, 'Dismiss', hideBottomToast);
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
    showBottomToast('Preferences saved successfully!', 'Dismiss', hideBottomToast);
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
    if (confirm('Clear all attendance data and timetable?')) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  });

  renderDashboard();
  renderTimetable();
  renderHistory();
  updateUpcomingBanner();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW error:', err));
  }

  setInterval(checkLectureTimes, 5000);
});

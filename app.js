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
    snoozeMinutes: 10,
    popupEnabled: true
  },
  timetable: {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: []
  },
  baseAttendance: {}, // { [subject]: { attended: number, total: number } }
  records: [],
  promptedHistory: {},
  dayAbsent: {} // { [dateStr]: true }
};

// 12-Hour Clock Formatter (e.g. "13:40" -> "01:40 PM", "08:30" -> "08:30 AM")
function format12h(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return timeStr || '';
  const clean = timeStr.trim();
  if (/AM|PM/i.test(clean)) return clean;
  const parts = clean.split(':');
  if (parts.length < 2) return clean;
  let h = parseInt(parts[0], 10);
  const m = parts[1].padStart(2, '0');
  if (isNaN(h)) return clean;
  let ampm = 'AM';
  if (h >= 12) {
    ampm = 'PM';
    if (h > 12) h -= 12;
  } else if (h === 0) {
    h = 12;
  }
  const hStr = h < 10 ? `0${h}` : `${h}`;
  return `${hStr}:${m} ${ampm}`;
}

// Convert "11:10", "12:50", "01:40", "01:40 PM", "13:40" into minutes from midnight (0..1439)
function timeStrToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return -1;
  const clean = timeStr.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return -1;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = (match[3] || '').toUpperCase();
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  // If no AM/PM provided and hour is between 1 and 6, assume afternoon college lecture (13:00 to 18:00)
  if (!ampm && h >= 1 && h <= 6) h += 12;
  return h * 60 + m;
}

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
        const data = {
          ...DEFAULT_STATE,
          ...parsed,
          settings: { ...DEFAULT_STATE.settings, ...parsed.settings },
          timetable: { ...DEFAULT_STATE.timetable, ...parsed.timetable },
          baseAttendance: { ...(parsed.baseAttendance || {}) },
          dayAbsent: { ...(parsed.dayAbsent || {}) }
        };

        // Self-healing migration: Ensure every lecture slot has a guaranteed unique ID
        const seenIds = new Set();
        Object.keys(data.timetable || {}).forEach(day => {
          (data.timetable[day] || []).forEach(lec => {
            if (!lec.id || seenIds.has(lec.id)) {
              lec.id = 'lec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9) + '-' + Math.floor(Math.random() * 100000);
            }
            seenIds.add(lec.id);
          });
        });

        return data;
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

  // Get real-time cumulative stats for a single subject before any edit
  getCurrentSubjectStats(subject) {
    const s = (subject || '').trim();
    const base = (this.data.baseAttendance && this.data.baseAttendance[s]) || { attended: 0, total: 0 };
    let att = base.attended || 0;
    let tot = base.total || 0;

    (this.data.records || []).forEach(r => {
      if ((r.subject || '').trim().toLowerCase() !== s.toLowerCase()) return;
      if (r.archived || r.type === 'adjustment' || r.status === 'edited') return;
      const st = (r.status || '').toLowerCase();
      if (st === 'present') {
        att++;
        tot++;
      } else if (st === 'absent') {
        tot++;
      }
    });

    return {
      attended: att,
      total: tot,
      absent: Math.max(0, tot - att),
      hasRecords: tot > 0
    };
  }

  calculateStats() {
    const target = (this.data.settings.targetPercentage || 75) / 100;
    const overall = { attended: 0, absent: 0, cancelled: 0, total: 0, pct: null, canBunk: 0, needAttend: 0, hasRecords: false };
    const subjects = {};

    const uniqueSubs = this.getUniqueSubjects();
    uniqueSubs.forEach(s => {
      const base = (this.data.baseAttendance && this.data.baseAttendance[s]) || { attended: 0, total: 0 };
      const baseAtt = base.attended || 0;
      const baseTot = base.total || 0;
      const baseAbs = Math.max(0, baseTot - baseAtt);

      subjects[s] = {
        subject: s,
        attended: baseAtt,
        absent: baseAbs,
        cancelled: 0,
        total: baseTot,
        pct: null,
        canBunk: 0,
        needAttend: 0,
        hasRecords: baseTot > 0
      };

      overall.attended += baseAtt;
      overall.absent += baseAbs;
      overall.total += baseTot;
      if (baseTot > 0) overall.hasRecords = true;
    });

    this.data.records.forEach(r => {
      const s = (r.subject || '').trim();
      // Only process records for subjects currently active in the schedule
      if (!subjects[s]) return;

      // Skip adjustment/edit records and archived records to prevent double-counting on baseAttendance!
      if (r.archived || r.type === 'adjustment' || r.status === 'edited') return;

      const st = (r.status || '').toLowerCase();
      if (st === 'present') {
        overall.attended++;
        overall.total++;
        subjects[s].attended++;
        subjects[s].total++;
        subjects[s].hasRecords = true;
        overall.hasRecords = true;
      } else if (st === 'absent') {
        overall.absent++;
        overall.total++;
        subjects[s].absent++;
        subjects[s].total++;
        subjects[s].hasRecords = true;
        overall.hasRecords = true;
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
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const todayStr = now.toISOString().split('T')[0];

    // Check today first
    const todayList = this.data.timetable[currentDay] || [];
    const sortedToday = [...todayList].sort((a, b) => timeStrToMinutes(a.startTime) - timeStrToMinutes(b.startTime));

    let nextLec = null;
    let dayLabel = "Today";

    for (let i = 0; i < sortedToday.length; i++) {
      const lec = sortedToday[i];
      const startMin = timeStrToMinutes(lec.startTime);
      // If lecture has already started or passed, skip to find next upcoming lecture
      if (startMin <= currentMinutes) continue;

      // Check if user already marked attendance for this class today ahead of time
      const subLower = lec.subject.trim().toLowerCase();
      const loggedCount = this.data.records.filter(r => r.date === todayStr && r.subject.trim().toLowerCase() === subLower).length;
      const priorCount = sortedToday.slice(0, i + 1).filter(x => x.subject.trim().toLowerCase() === subLower).length;
      if (loggedCount >= priorCount) continue;

      nextLec = lec;
      break;
    }

    // If no more upcoming lectures today, check future days
    if (!nextLec) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDayIdx = now.getDay();
      for (let i = 1; i <= 7; i++) {
        const targetDayIdx = (currentDayIdx + i) % 7;
        const targetDayName = dayNames[targetDayIdx];
        if (targetDayName === 'Sunday') continue;
        if (targetDayName === 'Saturday' && !this.data.settings.includeSaturday) continue;
        const dayList = this.data.timetable[targetDayName] || [];
        if (dayList.length > 0) {
          const sortedNextDay = [...dayList].sort((a, b) => timeStrToMinutes(a.startTime) - timeStrToMinutes(b.startTime));
          nextLec = sortedNextDay[0];
          dayLabel = (i === 1) ? 'Tomorrow' : targetDayName;
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

    // If attendance was logged for today, dismiss any active prompt or snooze for this subject
    const todayStr = now.toISOString().split('T')[0];
    if (d === todayStr) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const todayName = days[now.getDay()];
      const todayList = this.data.timetable[todayName] || [];
      const subLower = subject.trim().toLowerCase();
      const matchLectures = todayList.filter(l => l.subject.trim().toLowerCase() === subLower);
      const loggedCount = this.data.records.filter(r => r.date === todayStr && r.subject.trim().toLowerCase() === subLower).length;

      matchLectures.forEach((lec, idx) => {
        if (loggedCount > idx) {
          const promptKey = `${todayStr}_${lec.id}`;
          if (this.snoozeQueue) delete this.snoozeQueue[promptKey];
          if (!this.data.promptedHistory) this.data.promptedHistory = {};
          this.data.promptedHistory[promptKey] = 'completed';
        }
      });

      if (this.activePrompt && this.activePrompt.lecture.subject.trim().toLowerCase() === subLower) {
        closeModal('modalLecturePrompt');
        this.activePrompt = null;
      }
    }

    this.save();
    return newRec;
  }

  toggleRecordStatus(id) {
    const rec = this.data.records.find(r => r.id === id);
    if (rec) {
      if (rec.type === 'adjustment' || rec.status === 'edited') return null;
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
    if (!rec) return null;

    if (rec.type === 'adjustment') {
      const s = rec.subject;
      if (rec.hadBase) {
        if (!this.data.baseAttendance) this.data.baseAttendance = {};
        this.data.baseAttendance[s] = { attended: rec.prevBaseAttended, total: rec.prevBaseTotal };
      } else {
        if (this.data.baseAttendance) delete this.data.baseAttendance[s];
      }
      // Unarchive prior records for this subject
      (this.data.records || []).forEach(r => {
        if ((r.subject || '').trim().toLowerCase() === (s || '').trim().toLowerCase() && r.id !== id) {
          r.archived = false;
        }
      });
    }

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
    const randPart = Math.random().toString(36).substring(2, 9) + '-' + Math.floor(Math.random() * 100000);
    const newLec = {
      id: 'lec-' + Date.now() + '-' + randPart,
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

  setSubjectAttendance(subject, attended, total, reason = 'Direct Attendance Edit') {
    const s = subject.trim();
    if (!this.data.baseAttendance) this.data.baseAttendance = {};

    const prev = this.getCurrentSubjectStats(s);
    const newAtt = Math.max(0, parseInt(attended) || 0);
    const newTot = Math.max(newAtt, parseInt(total) || 0);
    const newAbs = Math.max(0, newTot - newAtt);

    // If identical to current counts, avoid generating redundant log
    if (prev.hasRecords && prev.attended === newAtt && prev.total === newTot) {
      return null;
    }

    const prevAtt = prev.attended || 0;
    const prevTot = prev.total || 0;
    const prevAbs = prev.absent || 0;
    const diffAtt = newAtt - prevAtt;
    const diffAbs = newAbs - prevAbs;

    const hadBase = Boolean(this.data.baseAttendance && this.data.baseAttendance[s]);
    const prevBaseAtt = hadBase ? (this.data.baseAttendance[s].attended || 0) : 0;
    const prevBaseTot = hadBase ? (this.data.baseAttendance[s].total || 0) : 0;

    // Archive prior individual records for this subject so they don't double count on top of baseAttendance
    if (Array.isArray(this.data.records)) {
      this.data.records.forEach(r => {
        if ((r.subject || '').trim().toLowerCase() === s.toLowerCase() && r.type !== 'adjustment') {
          r.archived = true;
        }
      });
    }

    if (newTot === 0 && newAtt === 0) {
      delete this.data.baseAttendance[s];
    } else {
      this.data.baseAttendance[s] = { attended: newAtt, total: newTot };
    }

    // Insert clear single adjustment block into History
    const now = new Date();
    const editRec = {
      id: 'rec-edit-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      type: 'adjustment',
      status: 'edited',
      subject: s,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      prevAttended: prevAtt,
      prevTotal: prevTot,
      prevAbsent: prevAbs,
      newAttended: newAtt,
      newTotal: newTot,
      newAbsent: newAbs,
      diffAttended: diffAtt,
      diffAbsent: diffAbs,
      hadPriorRecords: prev.hasRecords,
      hadBase: hadBase,
      prevBaseAttended: prevBaseAtt,
      prevBaseTotal: prevBaseTot,
      notes: reason
    };

    if (!Array.isArray(this.data.records)) this.data.records = [];
    this.data.records.unshift(editRec);
    this.save();
    return editRec;
  }

  deleteSubjectCompletely(subject) {
    const sLower = subject.trim().toLowerCase();

    // 1. Remove all timetable slots for this subject from every day
    Object.keys(this.data.timetable).forEach(d => {
      this.data.timetable[d] = this.data.timetable[d].filter(l => 
        (l.subject || '').trim().toLowerCase() !== sLower
      );
    });

    // 2. Remove from base attendance
    if (this.data.baseAttendance) {
      Object.keys(this.data.baseAttendance).forEach(k => {
        if (k.trim().toLowerCase() === sLower) {
          delete this.data.baseAttendance[k];
        }
      });
    }

    // 3. Remove all history records
    this.data.records = this.data.records.filter(r => 
      (r.subject || '').trim().toLowerCase() !== sLower
    );

    // 4. Remove prompted history
    if (this.data.promptedHistory) {
      Object.keys(this.data.promptedHistory).forEach(k => {
        if (k.toLowerCase().includes(sLower)) {
          delete this.data.promptedHistory[k];
        }
      });
    }

    // 5. Clear snoozes
    Object.keys(this.snoozeQueue).forEach(k => {
      if (k.toLowerCase().includes(sLower)) {
        delete this.snoozeQueue[k];
      }
    });

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
        // Completely remove from every part of the app!
        this.deleteSubjectCompletely(removedSubject);
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

// Get all unrecorded lectures scheduled for today whose start time has arrived
function getPendingLecturesToday() {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[now.getDay()];

  const isMonitored = (dayName !== 'Sunday') && (dayName !== 'Saturday' || state.data.settings.includeSaturday);
  if (!isMonitored) return [];
  if (state.data.settings.popupEnabled === false) return [];

  const todayStr = now.toISOString().split('T')[0];
  if (state.data.dayAbsent && state.data.dayAbsent[todayStr]) return [];

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const timetableToday = state.data.timetable[dayName] || [];
  const sortedToday = [...timetableToday].sort((a, b) => timeStrToMinutes(a.startTime) - timeStrToMinutes(b.startTime));

  const pending = [];

  sortedToday.forEach((lec, idx) => {
    if (!lec.startTime) return;

    const promptKey = `${todayStr}_${lec.id}`;
    if (state.data.promptedHistory && state.data.promptedHistory[promptKey] === 'completed') {
      return;
    }

    const subLower = lec.subject.trim().toLowerCase();
    const loggedCountToday = state.data.records.filter(r => 
      r.date === todayStr && r.subject.trim().toLowerCase() === subLower
    ).length;
    const priorCountOfThisSub = sortedToday.slice(0, idx + 1).filter(x => 
      x.subject.trim().toLowerCase() === subLower
    ).length;

    if (loggedCountToday >= priorCountOfThisSub) {
      if (state.snoozeQueue) delete state.snoozeQueue[promptKey];
      if (!state.data.promptedHistory) state.data.promptedHistory = {};
      state.data.promptedHistory[promptKey] = 'completed';
      return;
    }

    if (state.snoozeQueue && state.snoozeQueue[promptKey]) {
      const snoozeExpiry = new Date(state.snoozeQueue[promptKey]);
      if (now < snoozeExpiry) {
        return; // still in snooze
      }
    }

    const startMinutes = timeStrToMinutes(lec.startTime);
    if (startMinutes < 0) return;

    // Has lecture started today?
    if (currentMinutes >= startMinutes) {
      pending.push({ lecture: lec, date: todayStr, promptKey: promptKey });
    }
  });

  return pending;
}

// Background Time Monitor for Lecture Start Attendance Alerts
function checkLectureTimes() {
  if (state.data.settings.popupEnabled === false) {
    updateUpcomingBanner();
    return;
  }

  const pending = getPendingLecturesToday();
  if (pending.length === 0) {
    updateUpcomingBanner();
    return;
  }

  // If a prompt modal is currently open on screen, do not disrupt the user
  const modal = document.getElementById('modalLecturePrompt');
  if (modal && modal.classList.contains('open') && state.activePrompt) {
    updateUpcomingBanner();
    return;
  }

  // Take the first pending lecture in the queue!
  const nextItem = pending[0];
  triggerLecturePrompt(nextItem.lecture, nextItem.date, nextItem.promptKey, pending.length);
  updateUpcomingBanner();
}

function updateUpcomingBanner() {
  const upcoming = state.getUpcomingLectureDetails();
  const banner = document.getElementById('headerStatus');
  if (banner) {
    if (upcoming) {
      banner.textContent = `⏰ ${upcoming.dayLabel}: ${upcoming.lecture.subject} (${format12h(upcoming.lecture.startTime)})`;
    } else {
      banner.textContent = `No scheduled classes`;
    }
  }
}

// Trigger Bottom Sheet Prompt
function triggerLecturePrompt(lec, dateStr, promptKey, queueCount = 1) {
  state.activePrompt = { lecture: lec, date: dateStr, promptKey };
  document.getElementById('promptSubject').textContent = lec.subject;
  document.getElementById('promptTimeRoom').textContent = `${format12h(lec.startTime)} - ${format12h(lec.endTime)} • ${lec.room || 'No Room Specified'}`;

  const queueTag = document.getElementById('promptQueueTag');
  if (queueTag) {
    if (queueCount > 1) {
      queueTag.textContent = `🔔 LECTURE ATTENDANCE • 1 OF ${queueCount} PENDING`;
    } else {
      queueTag.textContent = `🔔 LECTURE ATTENDANCE`;
    }
  }

  // Live Attendance Impact Calculation for this lecture (Smart Action Tile)
  const stats = state.calculateStats();
  const target = state.data.settings.targetPercentage || 75;
  const subStat = stats.subjects[lec.subject] || { attended: 0, total: 0, pct: null, hasRecords: false };
  let attendPct = 100.0;
  let bunkPct = 0.0;
  let bunkColor = '#f87171';
  let attSubText = '100.0% (Start)';
  let absSubText = '0.0%';

  if (subStat.hasRecords) {
    const att = subStat.attended;
    const tot = subStat.total;
    attendPct = Math.round(((att + 1) / (tot + 1)) * 1000) / 10;
    bunkPct = Math.round((att / (tot + 1)) * 1000) / 10;
    bunkColor = bunkPct >= target ? '#4ade80' : '#f87171';

    const diffAtt = Math.round((attendPct - subStat.pct) * 10) / 10;
    const diffAbs = Math.round((bunkPct - subStat.pct) * 10) / 10;

    attSubText = diffAtt > 0 ? `${attendPct.toFixed(1)}% (+${diffAtt.toFixed(1)}%)` : `${attendPct.toFixed(1)}%`;
    absSubText = diffAbs < 0 ? `${bunkPct.toFixed(1)}% (${diffAbs.toFixed(1)}%)` : `${bunkPct.toFixed(1)}%`;
  }

  const btnPres = document.getElementById('btnPromptPresent');
  const btnAbs = document.getElementById('btnPromptAbsent');
  if (btnPres) {
    btnPres.innerHTML = `
      <span class="tile-main-label">✅ Present</span>
      <span class="tile-sub-metric" style="color: #4ade80;">${attSubText}</span>
    `;
  }
  if (btnAbs) {
    btnAbs.innerHTML = `
      <span class="tile-main-label">❌ Absent</span>
      <span class="tile-sub-metric" style="color: ${bunkColor};">${absSubText}</span>
    `;
  }

  openModal('modalLecturePrompt');
  playNotificationChime();

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('⏰ Attendance Check: ' + lec.subject, {
      body: `Did you attend ${lec.subject} (${format12h(lec.startTime)} - ${format12h(lec.endTime)})? Tap to mark attendance.`,
      icon: 'icon-192.png'
    });
  }
}

// Prompt Choice Handler
function handlePromptChoice(status) {
  if (!state.activePrompt) return;

  const lec = state.activePrompt.lecture;
  const key = state.activePrompt.promptKey;

  // Mark completed in history and clear snooze
  if (!state.data.promptedHistory) state.data.promptedHistory = {};
  state.data.promptedHistory[key] = 'completed';
  if (state.snoozeQueue) delete state.snoozeQueue[key];
  state.save();

  const rec = state.addRecord(lec.subject, status, state.activePrompt.date, lec.startTime || lec.endTime);

  closeModal('modalLecturePrompt');
  state.activePrompt = null;

  renderDashboard();
  renderHistory();
  updateUpcomingBanner();

  const label = status === 'present' ? 'Present ✅' : (status === 'absent' ? 'Absent ❌' : 'Cancelled ⚪');

  // Check if there are more pending lectures in the queue today!
  const remaining = getPendingLecturesToday();
  if (remaining.length > 0) {
    // Sequentially present next lecture 1-by-1 smoothly!
    setTimeout(() => {
      checkLectureTimes();
    }, 280);
  } else {
    showBottomToast(`Marked ${lec.subject} as ${label}`, '↩️ Undo', () => {
      state.deleteRecord(rec.id);
      renderDashboard();
      renderHistory();
      updateUpcomingBanner();
      showBottomToast(`Undone: ${lec.subject}`, '↪️ Redo', () => {
        state.addRecord(lec.subject, status, rec.date, rec.time);
        renderDashboard();
        renderHistory();
        updateUpcomingBanner();
        hideBottomToast();
      });
    });
  }
}

function handlePromptSnooze() {
  if (state.activePrompt) {
    const key = state.activePrompt.promptKey;
    state.snoozeQueue[key] = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes snooze!
  }
  closeModal('modalLecturePrompt');
  state.activePrompt = null;
  showBottomToast(`Snoozed for 10 minutes ⏱`, 'Dismiss', hideBottomToast);
}

// Mark Absent for entire day
function markDayAbsent() {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[now.getDay()];

  if (dayName === 'Sunday') {
    showBottomToast('Today is Sunday! No classes scheduled.', 'Dismiss', hideBottomToast);
    return;
  }
  if (dayName === 'Saturday' && !state.data.settings.includeSaturday) {
    showBottomToast('Saturday is not in your active schedule.', 'Dismiss', hideBottomToast);
    return;
  }

  const todayStr = now.toISOString().split('T')[0];
  const timetableToday = state.data.timetable[dayName] || [];

  if (timetableToday.length === 0) {
    showBottomToast(`No lectures scheduled for today (${dayName}).`, 'Dismiss', hideBottomToast);
    return;
  }

  if (state.data.dayAbsent && state.data.dayAbsent[todayStr]) {
    showBottomToast(`Already marked absent for all lectures today! 🏖`, 'Dismiss', hideBottomToast);
    return;
  }

  const confirmMsg = `Mark yourself Absent for ALL ${timetableToday.length} scheduled lectures today (${dayName})?\n\nThis will log Absent for each lecture and disable attendance pop-ups for today.`;
  if (!confirm(confirmMsg)) return;

  const addedRecIds = [];
  timetableToday.forEach(lec => {
    const promptKey = `${todayStr}_${lec.id}`;
    const rec = state.addRecord(lec.subject, 'absent', todayStr, lec.startTime, 'Whole Day Absent');
    addedRecIds.push(rec.id);

    if (state.snoozeQueue) delete state.snoozeQueue[promptKey];
    if (!state.data.promptedHistory) state.data.promptedHistory = {};
    state.data.promptedHistory[promptKey] = 'completed';
  });

  if (!state.data.dayAbsent) state.data.dayAbsent = {};
  state.data.dayAbsent[todayStr] = true;
  state.save();

  closeModal('modalLecturePrompt');
  state.activePrompt = null;

  renderDashboard();
  renderHistory();
  updateUpcomingBanner();

  showBottomToast(`Marked Absent for all ${timetableToday.length} lectures today! 🚫`, '↩️ Undo', () => {
    addedRecIds.forEach(id => state.deleteRecord(id));
    if (state.data.dayAbsent) delete state.data.dayAbsent[todayStr];
    timetableToday.forEach(lec => {
      const promptKey = `${todayStr}_${lec.id}`;
      if (state.data.promptedHistory) delete state.data.promptedHistory[promptKey];
    });
    state.save();
    renderDashboard();
    renderHistory();
    updateUpcomingBanner();
    showBottomToast('Full day absent undone.', 'Dismiss', hideBottomToast);
  });
}

// Pop-up Alert ON/OFF Toggle
function updatePopupToggleButton() {
  const btn = document.getElementById('btnTogglePopup');
  const icon = document.getElementById('popupToggleIcon');
  const text = document.getElementById('popupToggleText');
  if (!btn || !icon || !text) return;

  const isEnabled = state.data.settings.popupEnabled !== false;
  if (isEnabled) {
    btn.classList.remove('is-off');
    icon.textContent = '🔔';
    text.textContent = 'Pop-ups ON';
    btn.title = 'Lecture pop-ups are currently ON. Tap to turn OFF.';
  } else {
    btn.classList.add('is-off');
    icon.textContent = '🔕';
    text.textContent = 'Pop-ups OFF';
    btn.title = 'Lecture pop-ups are currently OFF. Tap to turn ON.';
  }
}

function toggleLecturePopups() {
  state.data.settings.popupEnabled = !(state.data.settings.popupEnabled !== false);
  state.save();
  updatePopupToggleButton();

  if (state.data.settings.popupEnabled) {
    showBottomToast('Lecture Pop-ups turned ON 🔔', 'Dismiss', hideBottomToast);
    checkLectureTimes();
  } else {
    closeModal('modalLecturePrompt');
    state.activePrompt = null;
    showBottomToast('Lecture Pop-ups turned OFF 🔕', 'Dismiss', hideBottomToast);
  }
}

// UI Rendering Functions
function renderDashboard() {
  updatePopupToggleButton();
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
      <div class="empty-state-box" style="margin-top: 10px; padding: 30px 18px; border: 1px solid var(--border-subtle); background: #050505;">
        <div class="empty-state-icon" style="font-size: 2.6rem; margin-bottom: 6px;">✨</div>
        <div class="empty-state-title" style="font-size: 1.18rem; margin-bottom: 6px; font-weight: 800;">No Lectures Added Yet</div>
        <div class="empty-state-sub" style="font-size: 0.82rem; max-width: 320px; margin: 0 auto 18px auto; color: var(--text-muted); line-height: 1.45;">
          Upload a timetable photo or paste schedule text — our AI will automatically create all your weekly lectures in seconds!
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px; max-width: 270px; margin: 0 auto;">
          <button class="btn-chip-ai" style="width: 100%; font-size: 0.88rem; padding: 12px 16px; border-radius: 12px; justify-content: center; font-weight: 900; box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);" onclick="openScheduleCreatorModal()">
            <span>✨</span> Scan Timetable with AI
          </button>
          <button class="btn-chip btn-chip-slate" style="width: 100%; padding: 10px 14px; font-size: 0.82rem; font-weight: 700; border-radius: 12px; justify-content: center;" onclick="openAddLecture()">
            + Add Lecture Manually
          </button>
        </div>
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
        <div class="upcoming-time-meta">⏰ ${format12h(lec.startTime)} - ${format12h(lec.endTime)} • 📍 ${lec.room || 'No Room Specified'}</div>

        <div class="upcoming-stats-strip">
          <span class="sub-current-lbl">Current Subject Attendance:</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            ${currentScoreHtml}
            <button class="btn-link-edit" onclick="openDirectAttendanceModal('${lec.subject}')" title="Edit attendance numbers">✏️ Edit</button>
          </div>
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

  // 3. Last Action Updated Strip (Only if last record belongs to an active subject)
  if (lastRecord && uniqueSubs.includes(lastRecord.subject)) {
    const isEdit = lastRecord.type === 'adjustment' || lastRecord.status === 'edited';

    if (isEdit) {
      const att = lastRecord.newAttended || 0;
      const tot = lastRecord.newTotal || 0;
      const safeSub = lastRecord.subject.replace(/'/g, "\\'");
      lastContainer.innerHTML = `
        <div class="last-updated-strip">
          <div class="last-up-left">
            <span class="last-up-icon">✏️</span>
            <div>
              <div class="last-up-title">${lastRecord.subject}: Adjusted to ${att}/${tot}</div>
              <div class="last-up-time">📅 ${lastRecord.date} at ${format12h(lastRecord.time)}</div>
            </div>
          </div>
          <button class="btn-link-edit" onclick="openDirectAttendanceModal('${safeSub}')" title="Edit attendance numbers">✏️ Edit</button>
        </div>
      `;
    } else {
      const isPres = lastRecord.status === 'present';
      const stIcon = isPres ? '✅' : (lastRecord.status === 'absent' ? '❌' : '⚪');
      const stText = isPres ? 'Present' : (lastRecord.status === 'absent' ? 'Absent' : 'Cancelled');

      lastContainer.innerHTML = `
        <div class="last-updated-strip">
          <div class="last-up-left">
            <span class="last-up-icon">${stIcon}</span>
            <div>
              <div class="last-up-title">Last Class: ${lastRecord.subject} (${stText})</div>
              <div class="last-up-time">📅 ${lastRecord.date} at ${format12h(lastRecord.time)}</div>
            </div>
          </div>
          <button class="btn-toggle-quick" onclick="toggleRecord('${lastRecord.id}')" title="1-Tap Toggle">🔄 Toggle</button>
        </div>
      `;
    }
  } else {
    lastContainer.innerHTML = ``;
  }

  // 4. Subject Cards List
  subContainer.innerHTML = '';
  const subList = Object.values(stats.subjects);

  subList.forEach(sub => {
    const card = document.createElement('div');
    card.className = 'subject-card';

    let badgeStyle = 'background: rgba(255, 255, 255, 0.08); color: #d4d4d8; border: 1px solid rgba(255, 255, 255, 0.16);';
    let badgeText = 'No records';
    let bunkAdviceText = '0 lectures conducted';
    let bunkAdviceColor = 'var(--text-muted)';
    let progressPct = 0;
    let progressColor = 'rgba(255, 255, 255, 0.15)';

    if (sub.hasRecords) {
      progressPct = sub.pct;
      badgeText = `${sub.pct.toFixed(1)}%`;
      if (sub.pct >= target) {
        badgeStyle = 'background: rgba(34, 197, 94, 0.14); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.32);';
        progressColor = '#22c55e';
        bunkAdviceText = `😎 Safe to bunk: ${sub.canBunk} class${sub.canBunk === 1 ? '' : 'es'}`;
        bunkAdviceColor = '#4ade80';
      } else {
        badgeStyle = 'background: rgba(239, 68, 68, 0.14); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.32);';
        progressColor = '#ef4444';
        bunkAdviceText = `⚠️ Must attend: ${sub.needAttend} class${sub.needAttend === 1 ? '' : 'es'}`;
        bunkAdviceColor = '#f87171';
      }
    }

    const safeSub = sub.subject.replace(/'/g, "\\'");

    // Live Projected Percentage & Delta for Next Attendance Action (Option 1: Smart Action Tiles)
    let attendPct = 100.0;
    let bunkPct = 0.0;
    let bunkColor = '#f87171';
    let attSubText = '100.0% (Start)';
    let absSubText = '0.0%';

    if (sub.hasRecords) {
      const att = sub.attended;
      const tot = sub.total;
      attendPct = Math.round(((att + 1) / (tot + 1)) * 1000) / 10;
      bunkPct = Math.round((att / (tot + 1)) * 1000) / 10;
      bunkColor = bunkPct >= target ? '#4ade80' : '#f87171';

      const diffAtt = Math.round((attendPct - sub.pct) * 10) / 10;
      const diffAbs = Math.round((bunkPct - sub.pct) * 10) / 10;

      attSubText = diffAtt > 0 ? `${attendPct.toFixed(1)}% (+${diffAtt.toFixed(1)}%)` : `${attendPct.toFixed(1)}%`;
      absSubText = diffAbs < 0 ? `${bunkPct.toFixed(1)}% (${diffAbs.toFixed(1)}%)` : `${bunkPct.toFixed(1)}%`;
    }

    card.innerHTML = `
      <div class="sub-header-row">
        <div style="flex: 1; min-width: 0;">
          <h3 class="sub-title">${sub.subject}</h3>
          <div class="sub-stat-text" style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
            ${sub.hasRecords ? `Attended: <strong style="color: #fff;">${sub.attended}</strong> / <strong style="color: #fff;">${sub.total}</strong> Classes` : 'No attendance recorded yet'}
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="sub-pct-chip" style="${badgeStyle}; padding: 3px 9px; border-radius: 8px; font-size: 0.76rem; font-weight: 800;">${badgeText}</span>
          <button class="btn-icon-subtle" onclick="confirmDeleteSubject('${safeSub}')" title="Delete subject from schedule">🗑️</button>
        </div>
      </div>

      <div class="progress-track" style="margin: 10px 0 6px 0;">
        <div class="progress-fill" style="width: ${progressPct}%; background: ${progressColor};"></div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 0.75rem;">
        <span style="color: ${bunkAdviceColor}; font-weight: 700;">${bunkAdviceText}</span>
        <button class="btn-link-edit" onclick="openDirectAttendanceModal('${safeSub}')" style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 700; padding: 2px 4px;">✏️ Edit</button>
      </div>

      <div class="sub-action-grid">
        <button type="button" class="btn-action-tile tile-present" onclick="quickAddAttendance('${safeSub}', 'present')">
          <span class="tile-main-label">✅ Present</span>
          <span class="tile-sub-metric" style="color: #4ade80;">${attSubText}</span>
        </button>
        <button type="button" class="btn-action-tile tile-absent" onclick="quickAddAttendance('${safeSub}', 'absent')">
          <span class="tile-main-label">❌ Absent</span>
          <span class="tile-sub-metric" style="color: ${bunkColor};">${absSubText}</span>
        </button>
      </div>
    `;
    subContainer.appendChild(card);
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
        <div class="time-start">${format12h(lec.startTime)}</div>
        <div class="time-end">${format12h(lec.endTime)}</div>
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
    records = records.filter(r => (r.subject || '').trim() === subFilter);
  }
  if (statusFilter && statusFilter !== 'All') {
    if (statusFilter === 'edited') {
      records = records.filter(r => r.status === 'edited' || r.type === 'adjustment');
    } else {
      records = records.filter(r => r.status === statusFilter && r.type !== 'adjustment');
    }
  }

  if (records.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-title">No Attendance Records Yet</div>
        <div class="empty-state-sub">Marking attendance from the Dashboard, upcoming class alerts, and attendance edits will automatically appear here.</div>
      </div>
    `;
    return;
  }

  records.forEach(r => {
    // 1. Direct Attendance Edit / Adjustment Single Block
    if (r.type === 'adjustment' || r.status === 'edited') {
      const prevAtt = r.prevAttended || 0;
      const prevTot = r.prevTotal || 0;
      const prevAbs = r.prevAbsent ?? Math.max(0, prevTot - prevAtt);
      const prevPct = prevTot > 0 ? ((prevAtt / prevTot) * 100).toFixed(1) + '%' : '0.0%';

      const newAtt = r.newAttended || 0;
      const newTot = r.newTotal || 0;
      const newAbs = r.newAbsent ?? Math.max(0, newTot - newAtt);
      const newPct = newTot > 0 ? ((newAtt / newTot) * 100).toFixed(1) + '%' : '0.0%';

      const diffAtt = r.diffAttended ?? (newAtt - prevAtt);
      const diffAbs = r.diffAbsent ?? (newAbs - prevAbs);

      let deltaText = '';
      if (!r.hadPriorRecords && prevTot === 0) {
        deltaText = `Initial Setup: ${newAtt} Present, ${newAbs} Absent (${newAtt}/${newTot})`;
      } else {
        const attSign = diffAtt >= 0 ? `+${diffAtt}` : `${diffAtt}`;
        const absSign = diffAbs >= 0 ? `+${diffAbs}` : `${diffAbs}`;
        deltaText = `Edited afterwards: ${attSign} Present, ${absSign} Absent`;
      }

      const card = document.createElement('div');
      card.className = 'history-edit-block';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div style="font-weight: 800; font-size: 0.96rem; color: #fff;">
            ${r.subject}
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="status-badge badge-edited">✏️ EDITED</span>
            <button class="btn-icon-subtle" onclick="deleteRecordItem('${r.id}')" title="Delete this edit log" style="font-size: 0.85rem;">🗑️</button>
          </div>
        </div>

        <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; gap: 5px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
            <span style="color: var(--text-muted);">Attendance Before Edit:</span>
            <span style="font-weight: 700; color: #d4d4d8;">${r.hadPriorRecords ? `${prevAtt} / ${prevTot} (${prevPct})` : 'No prior records (0/0)'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
            <span style="color: var(--text-muted);">New Attendance Set:</span>
            <span style="font-weight: 800; color: #fff;">${newAtt} / ${newTot} (${newPct})</span>
          </div>
          <div style="border-top: 1px dashed rgba(255, 255, 255, 0.12); padding-top: 5px; margin-top: 2px; font-size: 0.76rem; color: var(--accent-cyan); font-weight: 800;">
            📊 ${deltaText}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">
          <span>📅 ${r.date} • ${format12h(r.time)}</span>
          <span style="font-style: italic;">${r.notes || 'Direct Edit'}</span>
        </div>
      `;
      container.appendChild(card);
      return;
    }

    // 2. Regular Individual Class Record
    const row = document.createElement('div');
    row.className = 'history-card-row';

    let badgeClass = 'badge-present';
    let badgeText = 'PRESENT';
    if (r.status === 'absent') { badgeClass = 'badge-absent'; badgeText = 'ABSENT'; }
    else if (r.status === 'cancelled') { badgeClass = 'badge-cancelled'; badgeText = 'CANCELLED'; }

    const time12 = format12h(r.time);
    const metaNote = r.archived 
      ? `• <span style="color: var(--text-muted); font-style: italic;">(Prior to edit)</span>` 
      : (r.notes ? `• ${r.notes}` : '');

    row.innerHTML = `
      <div class="hist-left">
        <div class="hist-subject-name">${r.subject}</div>
        <div class="hist-timestamp">📅 ${r.date} at ${time12} ${metaNote}</div>
      </div>
      <div class="hist-right-actions">
        <span class="status-badge ${badgeClass}">${badgeText}</span>
        ${!r.archived ? `<button class="btn-toggle-quick" onclick="toggleRecord('${r.id}')" title="1-Tap Toggle between Present and Absent">🔄 Toggle</button>` : ''}
        ${!r.archived ? `<button class="btn-chip btn-chip-blue" onclick="openEditRecord('${r.id}')">✏️</button>` : ''}
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
    const isAdj = deleted.type === 'adjustment';
    const msg = isAdj ? `Deleted edit log for ${deleted.subject}` : `Deleted record for ${deleted.subject}`;
    showBottomToast(msg, '↩️ Undo', () => {
      if (isAdj) {
        state.setSubjectAttendance(deleted.subject, deleted.newAttended, deleted.newTotal, deleted.notes || 'Restored Edit');
      } else {
        state.addRecord(deleted.subject, deleted.status, deleted.date, deleted.time, deleted.notes);
      }
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

// ================= WEEKLY ATTENDANCE MATRIX LOGIC =================
let weeklyOffset = 0;
let activeSlotContext = null;

function toLocalDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getWeekDateRange(offset = 0) {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1 is Monday ...
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday + (offset * 7));
  monday.setHours(0, 0, 0, 0);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekDates = {};

  daysOfWeek.forEach((dName, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates[dName] = {
      dateStr: toLocalDateStr(d),
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: d
    };
  });

  const satOrFri = state.data.settings.includeSaturday ? weekDates['Saturday'] : weekDates['Friday'];
  const label = `${weekDates['Monday'].displayDate} – ${satOrFri.displayDate}${offset === 0 ? ' (This Week)' : (offset === -1 ? ' (Last Week)' : (offset === 1 ? ' (Next Week)' : ''))}`;

  return { monday, weekDates, label };
}

function getSlotRecord(lec, dayLectures, dateStr) {
  const subLower = lec.subject.trim().toLowerCase();
  const dayRecords = state.data.records.filter(r => r.date === dateStr && r.subject.trim().toLowerCase() === subLower);
  if (dayRecords.length === 0) return null;

  // Try matching by exact time if available
  const matchByTime = dayRecords.find(r => r.time === lec.startTime || r.time === lec.endTime);
  if (matchByTime) return matchByTime;

  // Otherwise match by chronological occurrence
  const sameSubLectures = dayLectures.filter(l => l.subject.trim().toLowerCase() === subLower);
  const myIndexInSub = sameSubLectures.indexOf(lec);
  const sortedDayRecs = [...dayRecords].sort((a, b) => timeStrToMinutes(a.time) - timeStrToMinutes(b.time));
  return sortedDayRecs[myIndexInSub] || sortedDayRecs[0];
}

function renderWeeklyMatrix() {
  const container = document.getElementById('weeklyMatrixContainer');
  const summaryStrip = document.getElementById('weeklySummaryStrip');
  const rangeLabel = document.getElementById('weeklyRangeLabel');
  if (!container) return;

  const { weekDates, label } = getWeekDateRange(weeklyOffset);
  if (rangeLabel) rangeLabel.textContent = label;

  const now = new Date();
  const todayStr = toLocalDateStr(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const target = state.data.settings.targetPercentage || 75;

  const daysToShow = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  if (state.data.settings.includeSaturday) daysToShow.push('Saturday');

  let weekTotalAttended = 0;
  let weekTotalHeld = 0;
  let weekTotalScheduled = 0;

  let matrixHtml = '';

  daysToShow.forEach(dayName => {
    const dayInfo = weekDates[dayName];
    const dateStr = dayInfo.dateStr;
    const isToday = dateStr === todayStr;
    const isFutureDay = dateStr > todayStr;

    const timetableList = state.data.timetable[dayName] || [];
    const sortedLectures = [...timetableList].sort((a, b) => timeStrToMinutes(a.startTime) - timeStrToMinutes(b.startTime));

    let dayAttended = 0;
    let dayHeld = 0;
    let slotsHtml = '';

    if (sortedLectures.length === 0) {
      slotsHtml = `
        <div style="font-size: 0.78rem; color: var(--text-muted); font-style: italic; padding: 6px 4px;">
          No lectures scheduled on ${dayName}.
        </div>
      `;
    } else {
      sortedLectures.forEach(lec => {
        weekTotalScheduled++;
        const rec = getSlotRecord(lec, sortedLectures, dateStr);

        let status = 'upcoming'; // default
        let badgeText = '⏳ Scheduled';
        let blockClass = 'slot-block-upcoming';

        if (rec) {
          if (rec.status === 'present') {
            status = 'present';
            badgeText = '✅ Present';
            blockClass = 'slot-block-present';
            dayAttended++;
            dayHeld++;
            weekTotalAttended++;
            weekTotalHeld++;
          } else if (rec.status === 'absent') {
            status = 'absent';
            badgeText = '❌ Absent';
            blockClass = 'slot-block-absent';
            dayHeld++;
            weekTotalHeld++;
          } else if (rec.status === 'cancelled') {
            status = 'cancelled';
            badgeText = '⚪ Free / Cancelled';
            blockClass = 'slot-block-cancelled';
          }
        } else {
          // No record logged yet
          const startMin = timeStrToMinutes(lec.startTime);
          if (isFutureDay || (isToday && startMin > currentMinutes)) {
            // Hasn't happened yet -> Clean White as requested
            status = 'upcoming';
            badgeText = '⏳ Upcoming';
            blockClass = 'slot-block-upcoming';
          } else {
            // Past or ongoing but unrecorded -> White box
            status = 'unrecorded';
            badgeText = '⏳ Not Marked';
            blockClass = 'slot-block-upcoming';
          }
        }

        const safeSub = lec.subject.replace(/'/g, "\\'");
        const safeRoom = (lec.room || '').replace(/'/g, "\\'");
        const recId = rec ? rec.id : '';

        slotsHtml += `
          <div class="slot-block ${blockClass}" onclick="openSlotDetailsModal('${safeSub}', '${dayName}', '${dateStr}', '${lec.startTime}', '${lec.endTime}', '${safeRoom}', '${status}', '${recId}')">
            <div class="slot-left">
              <div class="slot-title">${lec.subject}</div>
              <div class="slot-time">⏰ ${format12h(lec.startTime)} - ${format12h(lec.endTime)} • 📍 ${lec.room || 'No Room'}</div>
            </div>
            <div class="slot-badge">${badgeText}</div>
          </div>
        `;
      });
    }

    const dayStatText = dayHeld > 0 
      ? `${dayAttended}/${dayHeld} attended (${Math.round((dayAttended/dayHeld)*100)}%)`
      : `${sortedLectures.length} scheduled`;

    matrixHtml += `
      <div class="week-day-group ${isToday ? 'is-today' : ''}">
        <div class="week-day-header">
          <div class="week-day-name">
            ${dayName} • <span style="font-weight: 600; color: var(--text-muted); margin-left: 4px;">${dayInfo.displayDate}</span>
            ${isToday ? '<span class="week-day-badge-today">TODAY</span>' : ''}
          </div>
          <div class="week-day-stat">${dayStatText}</div>
        </div>
        <div class="week-slots-list">
          ${slotsHtml}
        </div>
      </div>
    `;
  });

  container.innerHTML = matrixHtml;

  // Render Weekly Summary Strip
  if (summaryStrip) {
    const weekPct = weekTotalHeld > 0 ? (weekTotalAttended / weekTotalHeld) * 100 : null;
    const pctColor = weekPct === null ? 'var(--text-muted)' : (weekPct >= target ? 'var(--color-present)' : 'var(--color-absent)');
    const pctText = weekPct === null ? 'N/A' : `${weekPct.toFixed(1)}%`;

    summaryStrip.innerHTML = `
      <div class="weekly-stat-box">
        <div class="weekly-stat-val" style="color: ${pctColor};">${pctText}</div>
        <div class="weekly-stat-lbl">Week Score</div>
      </div>
      <div class="weekly-stat-box" style="text-align: center;">
        <div class="weekly-stat-val" style="color: #fff;">${weekTotalAttended} / ${weekTotalHeld}</div>
        <div class="weekly-stat-lbl">Attended / Held</div>
      </div>
      <div class="weekly-stat-box" style="text-align: right;">
        <div class="weekly-stat-val" style="color: #93c5fd;">${weekTotalScheduled}</div>
        <div class="weekly-stat-lbl">Total Scheduled</div>
      </div>
    `;
  }
}

// Open Slot Details Bottom Sheet (DOES NOT TOGGLE, opens full details and edit options)
function openSlotDetailsModal(subject, dayName, dateStr, startTime, endTime, room, currentStatus, recordId) {
  activeSlotContext = { subject, dayName, dateStr, startTime, endTime, room, currentStatus, recordId };

  document.getElementById('slotModalSubject').textContent = subject;
  document.getElementById('slotModalMeta').textContent = `${dayName}, ${dateStr} • ${format12h(startTime)} - ${format12h(endTime)} • 📍 ${room || 'No Room Specified'}`;

  const statusContainer = document.getElementById('slotModalStatusPill');
  if (statusContainer) {
    let pillHtml = '';
    if (currentStatus === 'present') {
      pillHtml = `<span style="font-size: 0.82rem; font-weight: 800; padding: 5px 12px; border-radius: 20px; background: rgba(34, 197, 94, 0.15); border: 1px solid #22c55e; color: #4ade80;">Current Status: ✅ Present</span>`;
    } else if (currentStatus === 'absent') {
      pillHtml = `<span style="font-size: 0.82rem; font-weight: 800; padding: 5px 12px; border-radius: 20px; background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #f87171;">Current Status: ❌ Absent</span>`;
    } else if (currentStatus === 'cancelled') {
      pillHtml = `<span style="font-size: 0.82rem; font-weight: 800; padding: 5px 12px; border-radius: 20px; background: rgba(113, 113, 122, 0.15); border: 1px solid #71717a; color: #a1a1aa;">Current Status: ⚪ Free / Cancelled</span>`;
    } else {
      pillHtml = `<span style="font-size: 0.82rem; font-weight: 800; padding: 5px 12px; border-radius: 20px; background: #1c1c1e; border: 1px solid #ffffff; color: #ffffff;">Current Status: ⏳ Haven't Happened / Scheduled</span>`;
    }
    statusContainer.innerHTML = pillHtml;
  }

  openModal('modalSlotDetails');
}

function saveSlotAttendance(status) {
  if (!activeSlotContext) return;

  const { subject, dateStr, startTime, recordId } = activeSlotContext;

  if (recordId) {
    const rec = state.data.records.find(r => r.id === recordId);
    if (rec) {
      rec.status = status;
      state.save();
    } else {
      state.addRecord(subject, status, dateStr, startTime);
    }
  } else {
    state.addRecord(subject, status, dateStr, startTime);
  }

  closeModal('modalSlotDetails');
  activeSlotContext = null;

  renderWeeklyMatrix();
  renderDashboard();
  renderHistory();
  updateUpcomingBanner();

  const label = status === 'present' ? 'Present ✅' : (status === 'absent' ? 'Absent ❌' : 'Cancelled ⚪');
  showBottomToast(`Updated ${subject} to ${label}`, 'Dismiss', hideBottomToast);
}

function clearSlotAttendance() {
  if (!activeSlotContext) return;

  const { subject, recordId } = activeSlotContext;
  if (recordId) {
    state.deleteRecord(recordId);
  }

  closeModal('modalSlotDetails');
  activeSlotContext = null;

  renderWeeklyMatrix();
  renderDashboard();
  renderHistory();
  updateUpcomingBanner();

  showBottomToast(`Cleared attendance record for ${subject}`, 'Dismiss', hideBottomToast);
}

// Modal Helpers
function openModal(modalId) {
  let id = modalId;
  if ((id === 'modalAiTimetable' || id === 'modalQuickImport') && !document.getElementById(id)) {
    id = 'modalScheduleCreator';
  }
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
  let id = modalId;
  if ((id === 'modalAiTimetable' || id === 'modalQuickImport') && !document.getElementById(id)) {
    id = 'modalScheduleCreator';
  }
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
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
  document.getElementById('lecPastAttended').value = '';
  document.getElementById('lecPastTotal').value = '';
  const aiBanner = document.getElementById('modalLectureAiBanner');
  if (aiBanner) aiBanner.style.display = 'flex';
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

  const stats = state.calculateStats();
  const subStat = stats.subjects[found.subject];

  const aiBanner = document.getElementById('modalLectureAiBanner');
  if (aiBanner) aiBanner.style.display = 'none';

  document.getElementById('modalLectureTitle').textContent = 'Edit Lecture Slot';
  document.getElementById('lecEditId').value = found.id;
  document.getElementById('lecDay').value = foundDay;
  document.getElementById('lecSubject').value = found.subject;
  document.getElementById('lecStartTime').value = found.startTime;
  document.getElementById('lecEndTime').value = found.endTime;
  document.getElementById('lecRoom').value = found.room || '';
  document.getElementById('lecPastAttended').value = subStat && subStat.hasRecords ? subStat.attended : '';
  document.getElementById('lecPastTotal').value = subStat && subStat.hasRecords ? subStat.total : '';
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

// Direct Set Subject Attendance Handlers
function openDirectAttendanceModal(subject) {
  const stats = state.calculateStats();
  const subStat = stats.subjects[subject] || { attended: 0, total: 0, hasRecords: false };

  document.getElementById('modalSetAttendanceTitle').textContent = `✏️ Edit Attendance: ${subject}`;
  document.getElementById('setAttSubject').value = subject;
  document.getElementById('setAttSubjectName').textContent = subject;
  document.getElementById('inputAttendedCount').value = subStat.hasRecords ? subStat.attended : '';
  document.getElementById('inputTotalCount').value = subStat.hasRecords ? subStat.total : '';

  updateSetAttendancePreview();
  openModal('modalSetAttendance');
}

function updateSetAttendancePreview() {
  const attVal = document.getElementById('inputAttendedCount').value;
  const totVal = document.getElementById('inputTotalCount').value;
  const previewSpan = document.getElementById('setAttPreviewPct');

  if (totVal === '' || totVal === null) {
    previewSpan.textContent = 'Enter counts above';
    previewSpan.style.color = 'var(--text-muted)';
    return;
  }

  const att = parseInt(attVal) || 0;
  const tot = parseInt(totVal) || 0;
  const target = state.data.settings.targetPercentage || 75;

  if (tot === 0 && att === 0) {
    previewSpan.textContent = 'No records (0/0)';
    previewSpan.style.color = 'var(--text-muted)';
    return;
  }
  if (att > tot) {
    previewSpan.textContent = '⚠️ Attended cannot exceed Total!';
    previewSpan.style.color = 'var(--color-absent)';
    return;
  }

  const pct = Math.round((att / tot) * 1000) / 10;
  let statusText = '';
  if (pct >= target) {
    const canBunk = Math.max(0, Math.floor((att - ((target / 100) * tot)) / (target / 100)));
    statusText = ` • Safe to bunk: ${canBunk}`;
    previewSpan.style.color = 'var(--color-present)';
  } else {
    const shortage = ((target / 100) * tot) - att;
    const needAttend = Math.max(1, Math.ceil(shortage / (1 - (target / 100))));
    statusText = ` • Must attend: ${needAttend}`;
    previewSpan.style.color = 'var(--color-absent)';
  }

  previewSpan.textContent = `${pct.toFixed(1)}% (${att}/${tot})${statusText}`;
}

// Complete Deletion of Subject Across Entire App
function confirmDeleteSubject(subject) {
  if (confirm(`Delete "${subject}" from entire app?\n\nThis will permanently remove it from:\n• Dashboard\n• Weekly Schedule\n• Attendance History`)) {
    state.deleteSubjectCompletely(subject);
    renderDashboard();
    renderTimetable();
    renderHistory();
    updateUpcomingBanner();
    showBottomToast(`Deleted "${subject}" from entire app`, 'Dismiss', hideBottomToast);
  }
}

// Master Edit All Attendance Modal Handlers
function openEditAllAttendanceModal() {
  const uniqueSubs = state.getUniqueSubjects();
  if (uniqueSubs.length === 0) {
    showBottomToast('No subjects in schedule to edit.', 'Dismiss', hideBottomToast);
    return;
  }

  const container = document.getElementById('editAllSubsList');
  if (!container) return;
  container.innerHTML = '';

  const stats = state.calculateStats();
  const target = state.data.settings.targetPercentage || 75;

  uniqueSubs.forEach(s => {
    const subStat = stats.subjects[s] || { attended: 0, total: 0, hasRecords: false };
    const row = document.createElement('div');
    row.className = 'edit-all-sub-row';

    let scoreBadge = '';
    if (subStat.hasRecords) {
      const color = subStat.pct >= target ? 'var(--color-present)' : 'var(--color-absent)';
      scoreBadge = `<span style="font-size: 0.74rem; font-weight: 800; color: ${color};">${subStat.pct.toFixed(1)}%</span>`;
    }

    row.innerHTML = `
      <div style="font-weight: 800; font-size: 0.90rem; color: #fff; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span>${s}</span>
        ${scoreBadge}
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>
          <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 4px; font-weight: 600;">Attended</label>
          <input type="number" min="0" class="form-input-box edit-all-att-input" data-subject="${s.replace(/"/g, '&quot;')}" value="${subStat.hasRecords ? subStat.attended : ''}" placeholder="0" style="padding: 8px 10px; font-size: 0.88rem; font-weight: 800; color: var(--color-present);">
        </div>
        <div>
          <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 4px; font-weight: 600;">Total Held</label>
          <input type="number" min="0" class="form-input-box edit-all-tot-input" data-subject="${s.replace(/"/g, '&quot;')}" value="${subStat.hasRecords ? subStat.total : ''}" placeholder="0" style="padding: 8px 10px; font-size: 0.88rem; font-weight: 800; color: #fff;">
        </div>
      </div>
    `;
    container.appendChild(row);
  });

  openModal('modalEditAllAttendance');
}

function saveAllSubjectAttendance() {
  const attInputs = document.querySelectorAll('.edit-all-att-input');
  const totInputs = document.querySelectorAll('.edit-all-tot-input');

  const updates = [];

  for (let i = 0; i < attInputs.length; i++) {
    const subject = attInputs[i].getAttribute('data-subject');
    const attVal = attInputs[i].value.trim();
    const totVal = totInputs[i].value.trim();

    if (totVal === '' && attVal === '') {
      continue;
    }

    const att = parseInt(attVal, 10) || 0;
    const tot = parseInt(totVal, 10) || 0;

    if (att > tot) {
      alert(`For "${subject}": Classes attended (${att}) cannot be greater than Total classes held (${tot}).`);
      return;
    }

    updates.push({ subject, att, tot });
  }

  updates.forEach(u => {
    state.setSubjectAttendance(u.subject, u.att, u.tot, 'Bulk Master Attendance Edit');
  });

  state.save();
  closeModal('modalEditAllAttendance');
  renderDashboard();
  renderHistory();
  updateUpcomingBanner();
  showBottomToast(`🎉 Successfully updated attendance for ${updates.length} subjects!`, 'Dismiss', hideBottomToast);
}

// ================= UNIFIED TIMETABLE CREATOR (AI PHOTO SCAN + INSTANT TEXT) =================
// Active Cloudflare Worker URL: 100% Zero-Key Photo Scanning for ALL students!
let CLOUDFLARE_WORKER_URL = 'https://attendance-scan.rishabhpatelme01.workers.dev';
let currentAiImage = null;
let detectedSchedule = [];

function openScheduleCreatorModal() {
  const savedKey = localStorage.getItem('gemini_api_key') || '';
  const keyInput = document.getElementById('aiApiKeyInput');
  if (keyInput) keyInput.value = savedKey;

  const keyCard = document.getElementById('aiApiKeyCard');
  const zeroKeyBadge = document.getElementById('aiZeroKeyBadge');
  const isWorkerReady = Boolean(CLOUDFLARE_WORKER_URL && CLOUDFLARE_WORKER_URL.trim().length > 0);

  if (keyCard) {
    keyCard.style.display = isWorkerReady ? 'none' : 'block';
  }
  if (zeroKeyBadge) {
    zeroKeyBadge.style.display = isWorkerReady ? 'block' : 'none';
  }

  switchAiTab('image');
  resetAiScanner();
  openModal('modalScheduleCreator');
}

// Backwards compatibility aliases
function openQuickImportModal() { openScheduleCreatorModal(); }
function openAiTimetableModal() { openScheduleCreatorModal(); }

function switchAiTab(tabName) {
  const tabImage = document.getElementById('tabBtnAiImage');
  const tabText = document.getElementById('tabBtnAiText');
  const contentImage = document.getElementById('aiTabContentImage');
  const contentText = document.getElementById('aiTabContentText');

  if (tabName === 'image') {
    if (tabImage) tabImage.classList.add('active');
    if (tabText) tabText.classList.remove('active');
    if (contentImage) contentImage.classList.add('active');
    if (contentText) contentText.classList.remove('active');
  } else {
    if (tabText) tabText.classList.add('active');
    if (tabImage) tabImage.classList.remove('active');
    if (contentText) contentText.classList.add('active');
    if (contentImage) contentImage.classList.remove('active');
  }
}

function resetAiScanner() {
  currentAiImage = null;
  detectedSchedule = [];
  const fileInput = document.getElementById('aiFileInput');
  if (fileInput) fileInput.value = '';
  const prompt = document.getElementById('dropAreaPrompt');
  const preview = document.getElementById('dropAreaPreview');
  const loader = document.getElementById('aiLoadingIndicator');
  const results = document.getElementById('aiResultsContainer');
  const parsedList = document.getElementById('aiParsedList');

  if (prompt) prompt.style.display = 'block';
  if (preview) preview.style.display = 'none';
  if (loader) loader.style.display = 'none';
  if (results) results.style.display = 'none';
  if (parsedList) parsedList.innerHTML = '';
}

function resetQuickImport() { resetAiScanner(); }

function toggleApiKeyVisibility() {
  const keyInput = document.getElementById('aiApiKeyInput');
  if (keyInput) {
    keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
  }
}

function handleAiImageSelection(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Downscale mobile camera photos to max 1400px & 0.85 quality for lightning-fast 1-second upload
      const MAX_DIM = 1400;
      let width = img.width;
      let height = img.height;

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = 'image/jpeg';
      const fullDataUrl = canvas.toDataURL(mimeType, 0.85);
      const base64Data = fullDataUrl.split(',')[1];

      currentAiImage = { base64: base64Data, mimeType: mimeType };

      const imgPreview = document.getElementById('aiImgPreview');
      if (imgPreview) imgPreview.src = fullDataUrl;
      const prompt = document.getElementById('dropAreaPrompt');
      const preview = document.getElementById('dropAreaPreview');
      if (prompt) prompt.style.display = 'none';
      if (preview) preview.style.display = 'block';
    };
    img.onerror = () => {
      alert('Could not read image file. Please try another photo or screenshot.');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

const SYSTEM_TIMETABLE_PROMPT = `You are an expert college and university timetable schedule extractor.
Your job is to examine the provided timetable image (or text) and extract ALL classes into a structured weekly schedule.

Rules:
1. Day: Must be one of "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday". Normalize abbreviations (MON -> Monday, TUE -> Tuesday, etc.).
2. Times: Must be 24-hour HH:MM format (e.g. "08:30", "11:10", "12:00", "13:40", "14:20", "15:10", "16:00", "16:50").
   - VERY IMPORTANT: College afternoon hours starting with 1, 2, 3, 4, 5, 6 MUST be converted to PM (e.g. 1:40 -> "13:40", 2:20 -> "14:20", 3:10 -> "15:10", 4:00 -> "16:00", 4:50 -> "16:50").
3. Multi-period Labs/Practicals: When a lab or practical (e.g. "SE(P)", "CN(P)", "DSC(P)", "Lab") spans 2 or more consecutive period slots (e.g. Period 9 at 03:10-04:00 and Period 10 at 04:00-04:50), merge them into a single entry from the start of the first period to the end of the last period (e.g. "15:10" to "16:50").
4. Parallel Elective Subjects: If a time slot has multiple elective subjects listed (e.g. "AT", "NO SQL", "CC"), extract EACH elective subject as its own separate class in the list so the student can easily tap ✕ to delete the ones they aren't taking.
5. Rooms: Extract room or lab codes (e.g. "V124", "LV303", "Room 201") into the "room" field. Remove room codes from the subject name.
6. Clean Subject Names: Remove teacher initials (e.g. "(MPC)", "[ASH]") and batch tags (e.g. "5CSE-O") from the subject name.
7. Exclude: Strictly skip non-class slots like "LUNCH", "RECESS", "BREAK", "Activities", "Sports", "Library", "Mentor", or empty cells.

Return a JSON object strictly matching this schema:
{
  "schedule": [
    {
      "day": "Monday",
      "subject": "Computer Networks (CN)",
      "startTime": "12:00",
      "endTime": "12:50",
      "room": "V124"
    }
  ]
}`;

// Dynamic Google Model Auto-Discovery: Queries Google's ListModels API directly with user's key
async function getWorkingGeminiModel(cleanKey) {
  const versions = ['v1beta', 'v1'];
  for (const ver of versions) {
    try {
      const url = `https://generativelanguage.googleapis.com/${ver}/models?key=${encodeURIComponent(cleanKey)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.models && Array.isArray(data.models)) {
          const contentModels = data.models.filter(m => 
            Array.isArray(m.supportedGenerationMethods) && 
            m.supportedGenerationMethods.includes('generateContent')
          );

          // Fast vision model priorities
          const preferred = [
            'gemini-2.0-flash',
            'gemini-2.0-flash-exp',
            'gemini-1.5-flash-latest',
            'gemini-1.5-flash',
            'gemini-1.5-flash-8b',
            'gemini-2.5-flash',
            'gemini-1.5-pro-latest',
            'gemini-1.5-pro'
          ];

          for (const pref of preferred) {
            const match = contentModels.find(m => m.name === `models/${pref}` || m.name.endsWith(`/${pref}`));
            if (match) {
              const modelName = match.name.replace(/^models\//, '');
              console.log(`[Gemini] Auto-discovered active model: ${ver}/${modelName}`);
              return { ver, model: modelName };
            }
          }

          if (contentModels.length > 0) {
            const modelName = contentModels[0].name.replace(/^models\//, '');
            console.log(`[Gemini] Using available model: ${ver}/${modelName}`);
            return { ver, model: modelName };
          }
        }
      } else if (res.status === 400) {
        const errJson = await res.json().catch(() => ({}));
        if (errJson.error && errJson.error.message && errJson.error.message.includes('API_KEY_INVALID')) {
          throw new Error('Invalid API Key. Please verify that you copied your key correctly from Google AI Studio.');
        }
      }
    } catch (e) {
      if (e.message.includes('Invalid API Key')) throw e;
      console.warn(`[Gemini] ListModels check on ${ver} failed:`, e);
    }
  }

  // Fallback default
  return { ver: 'v1beta', model: 'gemini-2.0-flash' };
}

async function callGemini(parts, apiKey) {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error('Please enter a Google Gemini API Key.');
  }

  const statusElem = document.getElementById('aiLoadingStatus');
  if (statusElem) statusElem.textContent = 'Discovering available AI models on Google servers...';

  // Discover working model directly from user's key
  const detected = await getWorkingGeminiModel(cleanKey);

  // Prioritized list of candidates to try
  const tryList = [
    detected,
    { ver: 'v1beta', model: 'gemini-2.0-flash' },
    { ver: 'v1beta', model: 'gemini-1.5-flash-latest' },
    { ver: 'v1', model: 'gemini-1.5-flash' },
    { ver: 'v1beta', model: 'gemini-1.5-flash' }
  ];

  const seen = new Set();
  const uniqueList = tryList.filter(item => {
    const k = `${item.ver}/${item.model}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  let lastErr = null;

  for (const { ver, model } of uniqueList) {
    if (statusElem) statusElem.textContent = `Analyzing timetable with Google AI (${model})...`;
    try {
      const url = `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`;
      const payload = {
        contents: [{
          parts: [
            { text: SYSTEM_TIMETABLE_PROMPT },
            ...parts
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = (errJson.error && errJson.error.message) ? errJson.error.message : `${res.status} ${res.statusText}`;
        lastErr = new Error(errMsg);

        if (res.status === 400 && errMsg.includes('API_KEY_INVALID')) {
          throw new Error('Invalid API Key. Please verify your Google Gemini API key from Google AI Studio.');
        }

        if (res.status === 404 || errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('not supported')) {
          console.warn(`Model ${ver}/${model} not supported, trying next candidate...`);
          continue;
        }

        throw lastErr;
      }

      const json = await res.json();
      if (!json.candidates || !json.candidates[0] || !json.candidates[0].content) {
        throw new Error('No timetable data returned. Please ensure the timetable image is clear and well-lit.');
      }

      let text = json.candidates[0].content.parts[0].text.trim();
      if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
      }

      return JSON.parse(text);
    } catch (e) {
      lastErr = e;
      if (e.message.includes('Invalid API Key')) throw e;
      const msg = e.message.toLowerCase();
      if (msg.includes('not found') || msg.includes('not supported') || msg.includes('404')) {
        continue;
      }
      throw e;
    }
  }

  throw lastErr || new Error('Could not connect to Google AI. Please check your API key.');
}

async function runAiImageScan() {
  if (!currentAiImage) {
    alert('Please select or take a photo of your timetable first.');
    return;
  }

  const loader = document.getElementById('aiLoadingIndicator');
  const status = document.getElementById('aiLoadingStatus');
  const resultsBox = document.getElementById('aiResultsContainer');
  if (loader) loader.style.display = 'block';
  if (resultsBox) resultsBox.style.display = 'none';

  // PATH 1: Cloudflare Worker (100% Zero-Key for All Students)
  if (CLOUDFLARE_WORKER_URL && CLOUDFLARE_WORKER_URL.trim().length > 0) {
    if (status) status.textContent = 'Scanning timetable photo with Cloud AI (Zero setup)...';
    try {
      const res = await fetch(CLOUDFLARE_WORKER_URL.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: currentAiImage.base64,
          mimeType: currentAiImage.mimeType || 'image/jpeg'
        })
      });

      const data = await res.json().catch(() => ({}));
      if (loader) loader.style.display = 'none';

      if (!res.ok || !data.success || !Array.isArray(data.schedule) || data.schedule.length === 0) {
        throw new Error(data.error || 'No classes detected in timetable image.');
      }

      renderScheduleReview(data.schedule);
      return;
    } catch (workerErr) {
      console.warn('Cloud worker scan error:', workerErr);
      if (loader) loader.style.display = 'none';
      alert('Cloud Scan Notice: ' + workerErr.message + '\n\nYou can also paste a personal Gemini key below to scan directly.');
      // Fall through to direct key check
    }
  }

  // PATH 2: Direct Google Gemini API Key
  const keyInput = document.getElementById('aiApiKeyInput');
  const key = (keyInput ? keyInput.value : '').trim();
  if (!key) {
    if (loader) loader.style.display = 'none';
    alert('A free Google Gemini API Key is required to scan timetable photos.\n\n1. Tap "Get Free Key ↗" (takes 15 seconds from Google AI Studio).\n2. Paste your key in the box.\n\nYour phone will save it forever!');
    if (keyInput) keyInput.focus();
    return;
  }

  localStorage.setItem('gemini_api_key', key);
  if (loader) loader.style.display = 'block';
  if (status) status.textContent = 'Connecting to Google AI...';

  try {
    const result = await callGemini([
      { text: 'Extract the full weekly schedule from this timetable image.' },
      {
        inlineData: {
          mimeType: currentAiImage.mimeType || 'image/jpeg',
          data: currentAiImage.base64
        }
      }
    ], key);

    if (loader) loader.style.display = 'none';

    if (!result || !result.schedule || result.schedule.length === 0) {
      alert('No classes could be recognized from this image. Please ensure the timetable grid, days, and times are clearly visible.');
      return;
    }

    renderScheduleReview(result.schedule);
  } catch (err) {
    if (loader) loader.style.display = 'none';
    console.error('AI Scan Error:', err);
    alert('AI Scan Failed: ' + err.message);
  }
}

// Smart Client-side Timetable Parser (Works 100% offline without any API key or external network)
function parseTimetableClientSide(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const dayAliases = {
    mon: 'Monday', monday: 'Monday',
    tue: 'Tuesday', tues: 'Tuesday', tuesday: 'Tuesday',
    wed: 'Wednesday', wednesday: 'Wednesday',
    thu: 'Thursday', thur: 'Thursday', thurs: 'Thursday', thursday: 'Thursday',
    fri: 'Friday', friday: 'Friday',
    sat: 'Saturday', saturday: 'Saturday'
  };

  let currentDay = 'Monday';
  const schedule = [];

  const timeRegex = /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:-|to)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i;

  function to24h(str, isEnd) {
    if (!str) return isEnd ? '11:00' : '10:00';
    let clean = str.trim().toLowerCase();
    const isPM = clean.includes('pm');
    const isAM = clean.includes('am');
    clean = clean.replace(/am|pm/g, '').trim();

    let [h, m] = clean.includes(':') ? clean.split(':').map(Number) : [parseInt(clean, 10), 0];
    if (isNaN(h)) h = 10;
    if (isNaN(m)) m = 0;

    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    if (!isPM && !isAM && h >= 1 && h <= 6) h += 12;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  const ignoreWords = ['lunch', 'recess', 'break', 'activities', 'activity', 'sports', 'mentor', 'library'];

  lines.forEach(line => {
    const lower = line.toLowerCase().replace(/[:\-_,]/g, '').trim();
    if (dayAliases[lower]) {
      currentDay = dayAliases[lower];
      return;
    }

    const firstWord = line.split(/[\s:,\-]/)[0].toLowerCase();
    if (dayAliases[firstWord]) {
      currentDay = dayAliases[firstWord];
    }

    if (ignoreWords.some(w => line.toLowerCase().includes(w))) {
      return;
    }

    const match = line.match(timeRegex);
    if (match) {
      const startTime = to24h(match[1], false);
      const endTime = to24h(match[2], true);

      let subject = line.replace(match[0], '').replace(new RegExp(`^${currentDay}[:\\s]*`, 'i'), '').trim();
      let room = '';

      // Extract bracketed room like [V124] or [LV303]
      const bracketRoom = subject.match(/\[([A-Za-z0-9\-_ ]+)\]/);
      if (bracketRoom) {
        room = bracketRoom[1].trim();
        subject = subject.replace(bracketRoom[0], '').trim();
      } else {
        const roomMatch = subject.match(/(?:room|hall|lab|rm|lh)\s*[:#]?\s*([a-z0-9\-]+)/i);
        if (roomMatch) {
          room = roomMatch[0];
          subject = subject.replace(roomMatch[0], '').trim();
        }
      }

      // Remove teacher initials in brackets/parentheses like (MPC) or [ASH]
      subject = subject.replace(/\([A-Za-z0-9\-_ ]+\)/g, ' ').replace(/\[[A-Za-z0-9\-_ ]+\]/g, ' ');
      // Remove batch codes like 5CSE-O or 5CSE
      subject = subject.replace(/\b\d+[A-Za-z]+(?:-[A-Za-z0-9]+)?\b/g, ' ');
      // Clean up punctuation and whitespace
      subject = subject.replace(/[:\-]/g, ' ').replace(/\s+/g, ' ').trim();

      if (subject.length > 0 && !ignoreWords.some(w => subject.toLowerCase() === w)) {
        schedule.push({
          day: currentDay,
          subject: subject,
          startTime: startTime,
          endTime: endTime,
          room: room
        });
      }
    }
  });

  return schedule;
}

function runAiTextScan() {
  const textarea = document.getElementById('quickImportTextarea');
  const text = (textarea ? textarea.value : '').trim();
  if (!text) {
    alert('Please enter or paste your timetable text first.');
    return;
  }

  const schedule = parseTimetableClientSide(text);
  if (!schedule || schedule.length === 0) {
    alert('Could not detect any class times from this text.\n\nMake sure your text has:\n1. A day name (e.g. Monday)\n2. Time slot (e.g. 10:00 - 11:00 or 1:40 - 2:20)\n3. Subject name (e.g. Mathematics)');
    return;
  }

  renderScheduleReview(schedule);
}


// Disambiguation & Review State
let rawDetectedSchedule = [];
let disambiguationModel = null;
let userElectiveChoices = {};
let userDailyLabChoices = {};

// 24-Hour Time Normalizer with College Period Snapping
function normalizeTime24(timeStr, isEnd = false) {
  if (!timeStr || typeof timeStr !== 'string') return isEnd ? '11:00' : '10:00';
  let clean = timeStr.trim().toLowerCase();
  const isPM = clean.includes('pm');
  const isAM = clean.includes('am');
  clean = clean.replace(/am|pm/g, '').trim();
  const parts = clean.split(':');
  let h = parseInt(parts[0], 10);
  let m = parts.length > 1 ? parseInt(parts[1], 10) : 0;
  if (isNaN(h)) h = 10;
  if (isNaN(m)) m = 0;

  // College timetable heuristic: Hours 1-6 are strictly PM
  if (isPM && h < 12) h += 12;
  else if (isAM && h === 12) h = 0;
  else if (!isAM && !isPM) {
    if (h >= 1 && h <= 6) h += 12; // 1:40 -> 13:40, 2:20 -> 14:20, 3:10 -> 15:10, 4:00 -> 16:00, 4:50 -> 16:50
  }

  // Canonical period snapping (Medicaps / Indian college standard grid)
  const totalMins = h * 60 + m;
  const canonicalMins = [
    8 * 60 + 30,  // 08:30 (Period I start)
    9 * 60 + 20,  // 09:20 (Period I end / Period II start)
    10 * 60 + 10, // 10:10 (Period II end)
    10 * 60 + 20, // 10:20 (Period III start)
    11 * 60 + 10, // 11:10 (Period III end / Period IV start)
    12 * 60 + 0,  // 12:00 (Period IV end / Period V start)
    12 * 60 + 50, // 12:50 (Period V end / Lunch start)
    13 * 60 + 40, // 13:40 (Lunch end / Period VII start)
    14 * 60 + 20, // 14:20 (Period VII end / Period VIII start)
    15 * 60 + 10, // 15:10 (Period VIII end / Period IX & Lab start)
    16 * 60 + 0,  // 16:00 (Period IX end / Period X start)
    16 * 60 + 50  // 16:50 (Period X / Lab end)
  ];

  for (const cMin of canonicalMins) {
    if (Math.abs(totalMins - cMin) <= 6) {
      h = Math.floor(cMin / 60);
      m = cMin % 60;
      break;
    }
  }

  const hStr = h < 10 ? `0${h}` : `${h}`;
  const mStr = m < 10 ? `0${m}` : `${m}`;
  return `${hStr}:${mStr}`;
}

function isScheduleOverlapping(c1, c2) {
  if (c1.day !== c2.day) return false;
  return !(c1.endTime <= c2.startTime || c1.startTime >= c2.endTime);
}

function cleanBaseSubject(s) {
  return (s || '').replace(/\s*\([Pp]\)/g, '').trim();
}

// Smart Post-Processor: Cleans subjects, normalizes period times, & merges 2-period practical labs
function cleanAndMergeSchedule(rawSchedule) {
  if (!Array.isArray(rawSchedule)) return [];

  const knownFaculty = /\b(?:MPC|ASH|KJ|SY|M3|AJK|AG|DIS|ABJ|SSF3|NF13|AC|LJ|NIB)\b/i;

  const cleaned = rawSchedule.map(item => {
    let sub = (item.subject || '').trim();
    let room = (item.room || '').trim();

    // Check if practical lab (P), [P], Lab, or Practical
    const isPractical = /\([Pp]\)/i.test(sub) || /\[[Pp]\]/i.test(sub) || /[A-Za-z0-9]+\([Pp]\)/i.test(sub) || /\b(?:Lab|Practical)\b/i.test(sub);

    // Extract true rooms from brackets: [V124], [LV303], [V026], [LV203], [V226], etc.
    const bracketMatches = sub.match(/\[([A-Za-z0-9\-_ ]+)\]/g);
    if (bracketMatches) {
      bracketMatches.forEach(bm => {
        const inner = bm.replace(/[\[\]]/g, '').trim();
        if (/^(?:LV|V|LAB|ROOM)[-_ ]?\d+/i.test(inner) || /^(?:LV\d+|V\d+|LAB\d*)/i.test(inner)) {
          if (!room) room = inner;
        }
        sub = sub.replace(bm, ' ');
      });
    }

    if (room && knownFaculty.test(room)) {
      room = '';
    }

    // Strip section / batch tags without destroying subjects like DSC (Data Science)
    sub = sub.replace(/5CSE[-_ ]?[A-Za-z0-9\+\-]+/gi, ' ');
    sub = sub.replace(/\b5CSE\b/gi, ' ');
    sub = sub.replace(/\b[A-Za-z](?:\+[A-Za-z])+\b/gi, ' ');
    sub = sub.replace(/\b(?:Batch|Sec|Section)\s*[-_0-9A-Za-z]+\b/gi, ' ');
    sub = sub.replace(/AI-[ABC]/gi, ' ');
    sub = sub.replace(/\b(?:BSc|AI-A|AI-B|AI-C)\b/gi, ' ');

    // Strip teacher initials
    sub = sub.replace(/\([A-Za-z0-9]{2,4}\)/g, ' ');
    sub = sub.replace(/\[[A-Za-z0-9]{2,4}\]/g, ' ');
    sub = sub.replace(/\b(?:MPC|ASH|KJ|SY|M3|AJK|AG|DIS|ABJ|SSF3|NF13|AC|LJ|NIB)\b/gi, ' ');

    // Remove (P) temporarily to clean core name
    sub = sub.replace(/\([Pp]\)/g, ' ').replace(/\[[Pp]\]/g, ' ').replace(/\b[Pp]\b/g, ' ');
    sub = sub.replace(/[\[\]\(\):]/g, ' ').replace(/\s+/g, ' ').trim();
    sub = sub.replace(/[-–]+$/, '').trim();

    // Re-attach (P) if practical
    if (isPractical) {
      sub = `${sub} (P)`;
    }

    const sTime = normalizeTime24(item.startTime, false);
    const eTime = normalizeTime24(item.endTime, true);

    return {
      day: item.day,
      subject: sub,
      startTime: sTime,
      endTime: eTime,
      room: room
    };
  }).filter(item => item.subject && item.subject.length > 0);

  // Auto-merge consecutive periods for the SAME practical class into a single combined session (e.g. 15:10 - 16:50)
  const merged = [];
  const dayOrder = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
  cleaned.sort((a, b) => {
    if (a.day !== b.day) return (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
    return a.startTime.localeCompare(b.startTime);
  });

  cleaned.forEach(item => {
    const isItemLab = item.subject.includes('(P)');
    const prev = merged.find(m => 
      m.day === item.day && 
      m.subject.toLowerCase() === item.subject.toLowerCase() && 
      (m.endTime === item.startTime || m.startTime === item.endTime)
    );

    if (prev && (isItemLab || prev.subject.toLowerCase() === item.subject.toLowerCase())) {
      if (prev.endTime === item.startTime) {
        prev.endTime = item.endTime;
      } else if (prev.startTime === item.endTime) {
        prev.startTime = item.startTime;
      }
      if (!prev.room && item.room) prev.room = item.room;
    } else {
      merged.push({ ...item });
    }
  });

  return merged;
}

// Build Disambiguation Model: Separates Recurring Electives from Daily Lab Slots
function buildDisambiguationModel(schedule) {
  const slotGroups = [];
  const assigned = new Set();

  for (let i = 0; i < schedule.length; i++) {
    if (assigned.has(i)) continue;
    const group = [schedule[i]];
    assigned.add(i);

    for (let j = i + 1; j < schedule.length; j++) {
      if (assigned.has(j)) continue;
      if (group.some(g => isScheduleOverlapping(g, schedule[j]))) {
        group.push(schedule[j]);
        assigned.add(j);
      }
    }

    if (group.length > 1) {
      slotGroups.push(group);
    }
  }

  const labSlots = [];
  const theorySlots = [];

  slotGroups.forEach(grp => {
    const hasLab = grp.some(c => c.subject.includes('(P)'));
    if (hasLab) {
      labSlots.push(grp);
    } else {
      theorySlots.push(grp);
    }
  });

  // 1. Identify Recurring Theory Electives across the semester
  const electiveGroups = [];
  const handledTheoryIndices = new Set();
  const theoryBaseSets = theorySlots.map(grp => new Set(grp.map(c => cleanBaseSubject(c.subject))));

  for (let i = 0; i < theorySlots.length; i++) {
    if (handledTheoryIndices.has(i)) continue;
    const setA = theoryBaseSets[i];

    const matchingIndices = [i];
    for (let j = i + 1; j < theorySlots.length; j++) {
      if (handledTheoryIndices.has(j)) continue;
      const setB = theoryBaseSets[j];

      let common = 0;
      setA.forEach(s => { if (setB.has(s)) common++; });

      if (common >= 2 || (setA.size >= 2 && common === setA.size)) {
        matchingIndices.push(j);
      }
    }

    matchingIndices.forEach(idx => handledTheoryIndices.add(idx));

    const allBaseSubjects = new Set();
    matchingIndices.forEach(idx => {
      theorySlots[idx].forEach(c => allBaseSubjects.add(cleanBaseSubject(c.subject)));
    });

    const options = Array.from(allBaseSubjects);
    const days = Array.from(new Set(matchingIndices.map(idx => theorySlots[idx][0].day)));

    electiveGroups.push({
      id: `elective_${electiveGroups.length + 1}`,
      title: `Elective Track: ${options.slice(0, 3).join(' / ')}`,
      days: days,
      options: options,
      defaultChoice: options[0]
    });
  }

  // 2. Identify Daily Lab Choices (asked per-day)
  const dailyLabChoices = labSlots.map((grp, idx) => {
    const day = grp[0].day;
    const options = Array.from(new Set(grp.map(c => c.subject)));
    return {
      id: `lab_${day.toLowerCase()}_${idx}`,
      day: day,
      startTime: grp[0].startTime,
      endTime: grp[0].endTime,
      title: `${day} Lab (${format12h(grp[0].startTime)} - ${format12h(grp[0].endTime)})`,
      options: options,
      defaultChoice: options[0],
      slotGroup: grp
    };
  });

  return { electiveGroups, dailyLabChoices, allSlotGroups: slotGroups };
}

// Render Disambiguation Wizard Cards
function renderDisambiguationWizard() {
  const wizardContainer = document.getElementById('aiWizardContainer');
  const wizardCards = document.getElementById('aiWizardCards');
  if (!wizardContainer || !wizardCards) return;

  const hasElectives = disambiguationModel && disambiguationModel.electiveGroups.length > 0;
  const hasDailyLabs = disambiguationModel && disambiguationModel.dailyLabChoices.length > 0;

  if (!hasElectives && !hasDailyLabs) {
    wizardContainer.style.display = 'none';
    wizardCards.innerHTML = '';
    return;
  }

  wizardContainer.style.display = 'block';
  let html = '';

  // Render Elective Groups
  if (hasElectives) {
    disambiguationModel.electiveGroups.forEach(grp => {
      const selected = userElectiveChoices[grp.id];
      html += `
        <div class="wizard-group-card">
          <div class="wizard-group-header">
            <span class="wizard-group-title">📚 ${grp.title}</span>
            <span class="wizard-group-badge">Days: ${grp.days.join(', ')}</span>
          </div>
          <div class="wizard-group-sub">Select your enrolled elective (will automatically apply to all days):</div>
          <div class="wizard-options-grid">
            ${grp.options.map(opt => `
              <button type="button" class="wizard-chip ${opt === selected ? 'active' : ''}" onclick="selectElectiveOption('${grp.id}', '${opt.replace(/'/g, "\\'")}')">
                ${opt === selected ? '✓ ' : ''}${opt}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    });
  }

  // Render Daily Lab Choices
  if (hasDailyLabs) {
    disambiguationModel.dailyLabChoices.forEach(lab => {
      const selected = userDailyLabChoices[lab.id];
      html += `
        <div class="wizard-group-card">
          <div class="wizard-group-header">
            <span class="wizard-group-title">🔬 ${lab.title}</span>
            <span class="wizard-group-badge" style="background: rgba(0, 195, 255, 0.15); color: var(--accent-cyan);">${lab.day}</span>
          </div>
          <div class="wizard-group-sub">Select which practical batch you attend on this day:</div>
          <div class="wizard-options-grid">
            ${lab.options.map(opt => `
              <button type="button" class="wizard-chip ${opt === selected ? 'active' : ''}" onclick="selectDailyLabOption('${lab.id}', '${opt.replace(/'/g, "\\'")}')">
                ${opt === selected ? '✓ ' : ''}${opt}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    });
  }

  wizardCards.innerHTML = html;
}

// User Selection Handlers
function selectElectiveOption(groupId, option) {
  userElectiveChoices[groupId] = option;

  // Auto-sync any lab matching this elective (e.g. if NO SQL picked, auto-pick NO SQL (P))
  const baseChosen = cleanBaseSubject(option).toLowerCase();
  if (disambiguationModel && disambiguationModel.dailyLabChoices) {
    disambiguationModel.dailyLabChoices.forEach(lab => {
      const matchingLabOpt = lab.options.find(opt => cleanBaseSubject(opt).toLowerCase() === baseChosen);
      if (matchingLabOpt) {
        userDailyLabChoices[lab.id] = matchingLabOpt;
      }
    });
  }

  renderDisambiguationWizard();
  applyDisambiguationAndRenderList();
}

function selectDailyLabOption(labId, option) {
  userDailyLabChoices[labId] = option;
  renderDisambiguationWizard();
  applyDisambiguationAndRenderList();
}

// Filter Schedule by User Selections
function computeFilteredSchedule(rawList, electiveChoices, dailyLabChoices) {
  const resolved = [];
  const dayGroups = {};
  rawList.forEach(c => {
    if (!dayGroups[c.day]) dayGroups[c.day] = [];
    dayGroups[c.day].push(c);
  });

  const electiveVals = Object.values(electiveChoices || {}).map(v => v.toLowerCase());

  Object.keys(dayGroups).forEach(day => {
    const list = dayGroups[day];
    const visited = new Set();
    const clusters = [];

    for (let i = 0; i < list.length; i++) {
      if (visited.has(i)) continue;
      const cluster = [list[i]];
      visited.add(i);
      for (let j = i + 1; j < list.length; j++) {
        if (visited.has(j)) continue;
        if (cluster.some(c => isScheduleOverlapping(c, list[j]))) {
          cluster.push(list[j]);
          visited.add(j);
        }
      }
      clusters.push(cluster);
    }

    clusters.forEach(cluster => {
      if (cluster.length === 1) {
        resolved.push(cluster[0]);
        return;
      }

      const isLab = cluster.some(c => c.subject.includes('(P)'));
      if (isLab) {
        let chosenLab = null;
        if (disambiguationModel && disambiguationModel.dailyLabChoices) {
          for (const lab of disambiguationModel.dailyLabChoices) {
            if (lab.day === day && isScheduleOverlapping(lab, cluster[0])) {
              const picked = dailyLabChoices[lab.id];
              chosenLab = cluster.find(c => c.subject.toLowerCase() === (picked || '').toLowerCase());
              break;
            }
          }
        }
        if (!chosenLab) {
          chosenLab = cluster.find(c => electiveVals.includes(cleanBaseSubject(c.subject).toLowerCase()));
        }
        resolved.push(chosenLab || cluster[0]);
        return;
      }

      // Theory elective cluster
      let chosenTheory = null;
      for (const eVal of electiveVals) {
        const found = cluster.find(c => cleanBaseSubject(c.subject).toLowerCase() === eVal);
        if (found) {
          chosenTheory = found;
          break;
        }
      }
      resolved.push(chosenTheory || cluster[0]);
    });
  });

  const dayOrder = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
  resolved.sort((a, b) => {
    if (a.day !== b.day) return (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
    return a.startTime.localeCompare(b.startTime);
  });

  return resolved;
}

function renderPreviewItems(classes) {
  const container = document.getElementById('aiParsedList');
  const badge = document.getElementById('aiDetectedCountBadge');
  const btnSave = document.getElementById('btnConfirmAiImport');
  if (!container) return;

  container.innerHTML = '';
  const daysSet = new Set(classes.map(c => c.day));
  if (badge) badge.textContent = `Ready: ${classes.length} Classes across ${daysSet.size} Days`;
  if (btnSave) btnSave.textContent = `✅ Save My Timetable (${classes.length} Classes)`;

  classes.forEach((c, idx) => {
    const item = document.createElement('div');
    item.className = 'ai-parsed-item';
    item.style.cssText = 'background: #0d0d0d; border: 1px solid var(--border-subtle); border-radius: 10px; padding: 10px 12px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center; gap: 8px;';
    item.innerHTML = `
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 800;">${c.day} • ${format12h(c.startTime)} - ${format12h(c.endTime)}</div>
        <div style="font-size: 0.88rem; font-weight: 700; color: #fff; margin-top: 2px;">${c.subject}</div>
        ${c.room ? `<div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px;">📍 ${c.room}</div>` : ''}
      </div>
      <button type="button" class="btn-icon-subtle" onclick="removeDetectedItem(${idx})" title="Remove class" style="color: var(--color-absent); font-size: 1.1rem; padding: 4px 8px; background: none; border: none; cursor: pointer;">✕</button>
    `;
    container.appendChild(item);
  });
}

function applyDisambiguationAndRenderList() {
  detectedSchedule = computeFilteredSchedule(rawDetectedSchedule, userElectiveChoices, userDailyLabChoices);
  renderPreviewItems(detectedSchedule);
}

function renderScheduleReview(classes) {
  rawDetectedSchedule = cleanAndMergeSchedule(classes);
  disambiguationModel = buildDisambiguationModel(rawDetectedSchedule);

  userElectiveChoices = {};
  userDailyLabChoices = {};

  if (disambiguationModel) {
    disambiguationModel.electiveGroups.forEach(grp => {
      userElectiveChoices[grp.id] = grp.options[0];
    });

    disambiguationModel.dailyLabChoices.forEach(lab => {
      let matchedOption = lab.options[0];
      const electiveVals = Object.values(userElectiveChoices);
      for (const opt of lab.options) {
        const baseOpt = cleanBaseSubject(opt);
        if (electiveVals.some(v => v.toLowerCase() === baseOpt.toLowerCase())) {
          matchedOption = opt;
          break;
        }
      }
      userDailyLabChoices[lab.id] = matchedOption;
    });
  }

  renderDisambiguationWizard();
  applyDisambiguationAndRenderList();

  const resultsBox = document.getElementById('aiResultsContainer');
  if (resultsBox) {
    resultsBox.style.display = 'block';
    resultsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function removeDetectedItem(index) {
  if (detectedSchedule && detectedSchedule.length > index) {
    detectedSchedule.splice(index, 1);
  }
  if (!detectedSchedule || detectedSchedule.length === 0) {
    const resultsBox = document.getElementById('aiResultsContainer');
    if (resultsBox) resultsBox.style.display = 'none';
  } else {
    renderPreviewItems(detectedSchedule);
  }
}

function confirmScheduleImport() {
  if (!detectedSchedule || detectedSchedule.length === 0) return;

  const replaceCheckbox = document.getElementById('aiReplaceExisting');
  const shouldReplace = replaceCheckbox ? replaceCheckbox.checked : true;

  if (shouldReplace) {
    Object.keys(state.data.timetable).forEach(d => {
      state.data.timetable[d] = [];
    });
  }

  let hasSaturday = false;
  detectedSchedule.forEach(c => {
    if (c.day === 'Saturday') hasSaturday = true;
    state.addLecture(c.day, c.subject, c.startTime, c.endTime, c.room || '');
  });

  if (hasSaturday) {
    state.data.settings.includeSaturday = true;
    const satPill = document.getElementById('satPill');
    if (satPill) satPill.style.display = 'block';
    state.save();
  }

  closeModal('modalScheduleCreator');
  closeModal('modalQuickImport');
  closeModal('modalAiTimetable');

  renderTimetable();
  renderDashboard();
  renderHistory();
  updateUpcomingBanner();
  showBottomToast(`🎉 Successfully saved ${detectedSchedule.length} classes to your schedule!`, 'Dismiss', hideBottomToast);
}

function loadQuickImportExample() {
  const example = `Monday:
10:00 - 11:00 Mathematics [Room 201]
11:10 - 12:00 Physics [Room 102]
01:40 - 02:20 Computer Networks [V124]
03:10 - 04:50 Programming Lab [Lab 3]

Tuesday:
09:00 - 10:00 Data Structures [Room 205]
10:00 - 11:00 Operating Systems [Room 205]
11:10 - 12:00 Software Engineering [Room 201]
01:40 - 03:10 OS Lab [Lab 2]

Wednesday:
10:00 - 11:00 Mathematics [Room 201]
11:10 - 12:00 Physics [Room 102]
01:40 - 02:20 Computer Networks [V124]

Thursday:
09:00 - 10:00 Data Structures [Room 205]
10:00 - 11:00 Operating Systems [Room 205]
01:40 - 03:10 Networks Lab [Lab 1]

Friday:
10:00 - 11:00 Mathematics [Room 201]
11:10 - 12:00 Software Engineering [Room 201]
01:40 - 02:20 Environmental Studies [Auditorium]`;

  const textarea = document.getElementById('quickImportTextarea');
  if (textarea) {
    textarea.value = example;
    runAiTextScan();
  }
}

async function pasteFromClipboard() {
  const textarea = document.getElementById('quickImportTextarea');
  if (!textarea) return;
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText();
      if (text && text.trim().length > 0) {
        textarea.value = text;
        runAiTextScan();
        return;
      }
    }
  } catch (e) {
    console.warn('Clipboard read error:', e);
  }
  textarea.focus();
  textarea.select();
  showBottomToast('Please long-press and tap Paste inside the box.', 'OK', hideBottomToast);
}

// Global window exposure for inline handlers & backward compatibility
window.openScheduleCreatorModal = openScheduleCreatorModal;
window.openQuickImportModal = openScheduleCreatorModal;
window.openAiTimetableModal = openScheduleCreatorModal;
window.switchAiTab = switchAiTab;
window.resetAiScanner = resetAiScanner;
window.resetQuickImport = resetAiScanner;
window.toggleApiKeyVisibility = toggleApiKeyVisibility;
window.runAiImageScan = runAiImageScan;
window.runAiTextScan = runAiTextScan;
window.runQuickImportParse = runAiTextScan;
window.renderScheduleReview = renderScheduleReview;
window.removeDetectedItem = removeDetectedItem;
window.removeQuickParsedItem = removeDetectedItem;
window.removeAiParsedItem = removeDetectedItem;
window.selectElectiveOption = selectElectiveOption;
window.selectDailyLabOption = selectDailyLabOption;
window.format12h = format12h;
window.openEditAllAttendanceModal = openEditAllAttendanceModal;
window.saveAllSubjectAttendance = saveAllSubjectAttendance;
window.confirmScheduleImport = confirmScheduleImport;
window.confirmQuickScheduleImport = confirmScheduleImport;
window.confirmAiScheduleImport = confirmScheduleImport;
window.loadQuickImportExample = loadQuickImportExample;
window.pasteFromClipboard = pasteFromClipboard;

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
      if (btn.dataset.tab === 'weekly') renderWeeklyMatrix();
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

  const dashAiBtn = document.getElementById('btnDashAiTimetable');
  if (dashAiBtn) dashAiBtn.addEventListener('click', openScheduleCreatorModal);

  const dashTopAddBtn = document.getElementById('btnDashTopAdd');
  if (dashTopAddBtn) dashTopAddBtn.addEventListener('click', openAddLecture);

  const dashTopAiBtn = document.getElementById('btnDashTopAi');
  if (dashTopAiBtn) dashTopAiBtn.addEventListener('click', openScheduleCreatorModal);

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
          alert('🤖 Direct Install (Zero Warnings):\n\n1. In Chrome, tap the 3 dots (⋮) at top right.\n2. Tap "Install app" (or "Add to Home screen").\n\nThis installs the verified app directly onto your phone with ZERO security alerts or APK warnings!');
        }
      }
    });
  }

  // Pop-up Alert ON/OFF Toggle Button
  const btnToggle = document.getElementById('btnTogglePopup');
  if (btnToggle) btnToggle.addEventListener('click', toggleLecturePopups);
  updatePopupToggleButton();

  // Mark Whole Day Absent Button on Dashboard
  const btnDayAbs = document.getElementById('btnMarkDayAbsent');
  if (btnDayAbs) btnDayAbs.addEventListener('click', markDayAbsent);

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
    const sub = document.getElementById('lecSubject').value.trim();
    const st = document.getElementById('lecStartTime').value;
    const et = document.getElementById('lecEndTime').value;
    const room = document.getElementById('lecRoom').value;
    const pastAttVal = document.getElementById('lecPastAttended').value;
    const pastTotVal = document.getElementById('lecPastTotal').value;

    if (id) state.updateLecture(id, day, sub, st, et, room);
    else state.addLecture(day, sub, st, et, room);

    // Save past attendance if entered
    if (pastTotVal !== '' && pastTotVal !== null && !isNaN(parseInt(pastTotVal))) {
      const pastAtt = parseInt(pastAttVal) || 0;
      const pastTot = parseInt(pastTotVal) || 0;
      if (pastAtt > pastTot) {
        alert('Classes attended cannot exceed total classes held.');
        return;
      }
      state.setSubjectAttendance(sub, pastAtt, pastTot, 'Schedule Past Attendance Setup');
    }

    state.activeDay = day;
    closeModal('modalLectureEditor');
    renderTimetable();
    renderDashboard();
    renderHistory();
    updateUpcomingBanner();
    showBottomToast(`Saved lecture: ${sub}`, 'Dismiss', hideBottomToast);
  });

  // Form Set Subject Attendance
  const inputAtt = document.getElementById('inputAttendedCount');
  const inputTot = document.getElementById('inputTotalCount');
  if (inputAtt) inputAtt.addEventListener('input', updateSetAttendancePreview);
  if (inputTot) inputTot.addEventListener('input', updateSetAttendancePreview);

  document.getElementById('formSetAttendance').addEventListener('submit', (e) => {
    e.preventDefault();
    const sub = document.getElementById('setAttSubject').value.trim();
    const att = parseInt(document.getElementById('inputAttendedCount').value) || 0;
    const tot = parseInt(document.getElementById('inputTotalCount').value) || 0;

    if (att > tot) {
      alert('Classes attended cannot exceed total classes held.');
      return;
    }

    state.setSubjectAttendance(sub, att, tot, 'Dashboard Direct Edit');
    closeModal('modalSetAttendance');
    renderDashboard();
    renderHistory();
    updateUpcomingBanner();
    showBottomToast(`Saved attendance for ${sub}: ${att}/${tot} classes`, 'Dismiss', hideBottomToast);
  });

  // Timetable Schedule Creator Event Listeners
  const btnAi = document.getElementById('btnAiTimetable');
  if (btnAi) btnAi.addEventListener('click', openScheduleCreatorModal);

  const aiFileInput = document.getElementById('aiFileInput');
  if (aiFileInput) {
    aiFileInput.addEventListener('change', function () {
      if (this.files && this.files[0]) {
        handleAiImageSelection(this.files[0]);
      }
    });
  }

  const btnAiImgScan = document.getElementById('btnRunAiImageScan');
  if (btnAiImgScan) btnAiImgScan.addEventListener('click', runAiImageScan);

  const btnRunQuickParse = document.getElementById('btnRunQuickParse');
  if (btnRunQuickParse) btnRunQuickParse.addEventListener('click', runAiTextScan);

  const btnConfirmAi = document.getElementById('btnConfirmAiImport');
  if (btnConfirmAi) btnConfirmAi.addEventListener('click', confirmScheduleImport);

  // Form Record
  const btnAddManual = document.getElementById('btnAddManualRecord');
  if (btnAddManual) btnAddManual.addEventListener('click', openAddManualRecord);
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

  // Weekly Matrix Controls
  const btnPrevW = document.getElementById('btnWeeklyPrev');
  if (btnPrevW) btnPrevW.addEventListener('click', () => { weeklyOffset--; renderWeeklyMatrix(); });

  const btnNextW = document.getElementById('btnWeeklyNext');
  if (btnNextW) btnNextW.addEventListener('click', () => { weeklyOffset++; renderWeeklyMatrix(); });

  const btnThisW = document.getElementById('btnWeeklyThisWeek');
  if (btnThisW) btnThisW.addEventListener('click', () => { weeklyOffset = 0; renderWeeklyMatrix(); });

  const btnSlotPres = document.getElementById('btnSlotMarkPresent');
  if (btnSlotPres) btnSlotPres.addEventListener('click', () => saveSlotAttendance('present'));

  const btnSlotAbs = document.getElementById('btnSlotMarkAbsent');
  if (btnSlotAbs) btnSlotAbs.addEventListener('click', () => saveSlotAttendance('absent'));

  const btnSlotCanc = document.getElementById('btnSlotMarkCancelled');
  if (btnSlotCanc) btnSlotCanc.addEventListener('click', () => saveSlotAttendance('cancelled'));

  const btnSlotClr = document.getElementById('btnSlotClearRecord');
  if (btnSlotClr) btnSlotClr.addEventListener('click', clearSlotAttendance);

  renderDashboard();
  renderTimetable();
  renderWeeklyMatrix();
  renderHistory();
  updateUpcomingBanner();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW error:', err));
  }

  setInterval(checkLectureTimes, 5000);
});

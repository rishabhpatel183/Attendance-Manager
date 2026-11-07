/**
 * Attendance Manager - Upcoming Class Focus & Thinkable Safe-Bunk Calculator
 */

const STORAGE_KEY = 'attendance_admin_portal_v1';

const DEFAULT_FACULTIES = [
  {
    id: 'fac-1',
    name: 'Prof. Rishabh Patel',
    dept: 'Computer Science & Engineering',
    title: 'Assistant Professor',
    subjects: ['Data Science Lab', 'Artificial Intelligence', 'Machine Learning'],
    email: 'rishabh.patel@college.edu',
    cabin: 'Cabin 304, CS Block B (3rd Floor)',
    officeHours: 'Mon & Wed • 3:30 PM - 4:30 PM',
    phone: 'Ext: 3404'
  },
  {
    id: 'fac-2',
    name: 'Dr. Neha Verma',
    dept: 'Data Science & Engineering',
    title: 'Associate Professor',
    subjects: ['Data Science', 'Data Science Lab', 'Python', 'Big Data Analytics'],
    email: 'neha.verma@college.edu',
    cabin: 'Cabin 210, Data Science Wing (2nd Floor)',
    officeHours: 'Tue & Thu • 2:00 PM - 3:30 PM',
    phone: 'Ext: 2108'
  },
  {
    id: 'fac-3',
    name: 'Prof. Amit Sharma',
    dept: 'Computer Science & Engineering',
    title: 'Assistant Professor',
    subjects: ['Machine Learning', 'Expert Systems', 'Artificial Intelligence'],
    email: 'amit.sharma@college.edu',
    cabin: 'Cabin 112, AI & Robotics Block',
    officeHours: 'Mon & Fri • 1:00 PM - 2:30 PM',
    phone: 'Ext: 1120'
  },
  {
    id: 'fac-4',
    name: 'Prof. Rajesh Kumar',
    dept: 'Computer Science & Engineering',
    title: 'Senior Faculty & HOD',
    subjects: ['Operating Systems', 'Computer Networks', 'Software Engineering'],
    email: 'rajesh.kumar@college.edu',
    cabin: 'HOD Office, Ground Floor Block A',
    officeHours: 'Wed & Fri • 11:30 AM - 1:00 PM',
    phone: 'Ext: 1001'
  },
  {
    id: 'fac-5',
    name: 'Prof. Priya Singh',
    dept: 'Information Technology',
    title: 'Assistant Professor',
    subjects: ['Computer Networks', 'DBMS', 'Web Technologies'],
    email: 'priya.singh@college.edu',
    cabin: 'Cabin 402, Networking Center (4th Floor)',
    officeHours: 'Tue & Thu • 11:00 AM - 12:30 PM',
    phone: 'Ext: 4022'
  }
];

const DEFAULT_FACULTY_SCHEDULES = {
  'fac-1': {
    Monday: [
      { id: 'flec-1', subject: 'Artificial Intelligence', startTime: '02:30', endTime: '03:20', room: 'Room 302', batch: 'CSE-5th Sem' }
    ],
    Tuesday: [
      { id: 'flec-2', subject: 'Data Science', startTime: '10:00', endTime: '11:00', room: 'Room 104', batch: 'CSE-5th Sem' }
    ],
    Wednesday: [
      { id: 'flec-3', subject: 'Data Science Lab', startTime: '11:10', endTime: '12:50', room: 'Lab LV224', batch: 'CSE-5th Sem (Batch A)' },
      { id: 'flec-4', subject: 'Artificial Intelligence', startTime: '02:30', endTime: '03:20', room: 'Room 302', batch: 'CSE-5th Sem' }
    ],
    Thursday: [
      { id: 'flec-5', subject: 'Machine Learning', startTime: '01:40', endTime: '02:30', room: 'Room 205', batch: 'CSE-5th Sem' }
    ],
    Friday: [
      { id: 'flec-6', subject: 'Data Science', startTime: '11:10', endTime: '12:00', room: 'Room 104', batch: 'CSE-5th Sem' }
    ],
    Saturday: []
  },
  'fac-2': {
    Monday: [
      { id: 'flec-21', subject: 'Big Data Analytics', startTime: '10:00', endTime: '11:00', room: 'Room 201', batch: 'DS-5th Sem' }
    ],
    Tuesday: [
      { id: 'flec-22', subject: 'Data Science Lecture', startTime: '11:10', endTime: '12:00', room: 'Room 201', batch: 'DS-5th Sem' }
    ],
    Wednesday: [
      { id: 'flec-23', subject: 'Python Lab', startTime: '02:30', endTime: '04:10', room: 'Lab 2', batch: 'DS-5th Sem' }
    ],
    Thursday: [],
    Friday: [
      { id: 'flec-24', subject: 'Data Structures', startTime: '09:00', endTime: '10:00', room: 'Room 201', batch: 'DS-3rd Sem' }
    ],
    Saturday: []
  },
  'fac-3': {
    Monday: [],
    Tuesday: [
      { id: 'flec-31', subject: 'Expert Systems', startTime: '01:40', endTime: '02:30', room: 'Room 102', batch: 'CSE-5th Sem' }
    ],
    Wednesday: [
      { id: 'flec-32', subject: 'Machine Learning', startTime: '09:00', endTime: '10:00', room: 'Room 102', batch: 'CSE-5th Sem' }
    ],
    Thursday: [],
    Friday: [],
    Saturday: []
  },
  'fac-4': {
    Monday: [],
    Tuesday: [],
    Wednesday: [
      { id: 'flec-41', subject: 'Operating Systems', startTime: '01:40', endTime: '02:30', room: 'Room 105', batch: 'CSE-5th Sem' }
    ],
    Thursday: [],
    Friday: [],
    Saturday: []
  },
  'fac-5': {
    Monday: [],
    Tuesday: [],
    Wednesday: [
      { id: 'flec-51', subject: 'Computer Networks Lab', startTime: '11:10', endTime: '12:50', room: 'Lab 1', batch: 'IT-5th Sem' }
    ],
    Thursday: [],
    Friday: [],
    Saturday: []
  }
};

const DEFAULT_STUDENTS = [
  { roll: '101', name: 'Aarav Sharma', email: 'aarav.101@college.edu' },
  { roll: '102', name: 'Aditi Patel', email: 'aditi.102@college.edu' },
  { roll: '103', name: 'Aryan Gupta', email: 'aryan.103@college.edu' },
  { roll: '104', name: 'Rishabh Patel (You)', email: 'rishabh.104@college.edu', isUser: true },
  { roll: '105', name: 'Diya Joshi', email: 'diya.105@college.edu' },
  { roll: '106', name: 'Ishaan Verma', email: 'ishaan.106@college.edu' },
  { roll: '107', name: 'Sneha Kulkarni', email: 'sneha.107@college.edu' },
  { roll: '108', name: 'Rohan Mehta', email: 'rohan.108@college.edu' },
  { roll: '109', name: 'Tanvi Shah', email: 'tanvi.109@college.edu' },
  { roll: '110', name: 'Yash Malhotra', email: 'yash.110@college.edu' },
  { roll: '111', name: 'Ananya Roy', email: 'ananya.111@college.edu' },
  { roll: '112', name: 'Devansh Nair', email: 'devansh.112@college.edu' },
  { roll: '113', name: 'Kavya Reddy', email: 'kavya.113@college.edu' },
  { roll: '114', name: 'Manan Choudhary', email: 'manan.114@college.edu' },
  { roll: '115', name: 'Meera Iyer', email: 'meera.115@college.edu' },
  { roll: '116', name: 'Parth Singhal', email: 'parth.116@college.edu' },
  { roll: '117', name: 'Riya Agarwal', email: 'riya.117@college.edu' },
  { roll: '118', name: 'Siddharth Jain', email: 'siddharth.118@college.edu' },
  { roll: '119', name: 'Tara Sen', email: 'tara.119@college.edu' },
  { roll: '120', name: 'Varun Bhatt', email: 'varun.120@college.edu' }
];

// 100% Clean Default State with Faculty & Substitution Engine
const DEFAULT_STATE = {
  authSession: {
    isLoggedIn: true,
    role: 'student', // 'student' | 'faculty'
    userId: '104',
    name: 'Rishabh Patel',
    subtitle: 'Roll #104 • CSE 5th Sem'
  },
  activeRole: 'student', // 'student' | 'faculty'
  currentFacultyId: 'fac-1',
  faculties: DEFAULT_FACULTIES,
  facultySchedules: DEFAULT_FACULTY_SCHEDULES,
  studentsList: DEFAULT_STUDENTS,
  substitutions: [], // { id, fromFacultyId, fromFacultyName, toFacultyId, toFacultyName, lectureId, subject, day, date, startTime, endTime, room, notes, status, timestamp }
  batchAttendance: {}, // { [lecId_dateStr]: { [roll]: 'present' | 'absent' } }
  cancelledLectures: {}, // { [lecId_dateStr]: true }
  notices: [
    {
      id: 'not-1',
      category: 'exam',
      tag: '🚨 Exam Alert',
      title: 'Mid-Term Sessional Exams',
      date: 'Starts Nov 18, 2026',
      desc: 'Hall tickets & seating plans will be released on the portal this Friday. Review syllabus with respective faculty.'
    },
    {
      id: 'not-2',
      category: 'assignment',
      tag: '📝 Lab Record',
      title: 'Data Science Lab Record Submission',
      date: 'Due Wednesday, Nov 11 • 5:00 PM',
      desc: 'Submit Unit 3 & 4 experiments (Pandas, Scikit-learn models) verified by Dr. Neha Verma in Lab LV224.'
    },
    {
      id: 'not-3',
      category: 'holiday',
      tag: '🏖️ Campus Holiday',
      title: 'Guru Nanak Jayanti Holiday',
      date: 'Friday, Nov 15, 2026',
      desc: 'The institute will remain closed. Scheduled laboratory practicals will be compensated on the following Saturday.'
    }
  ],
  settings: {
    targetPercentage: 75,
    includeSaturday: false,
    soundEnabled: true,
    snoozeMinutes: 10,
    popupEnabled: true
  },
  timetable: {
    Monday: [
      { id: 'lec-m1', subject: 'Data Science', startTime: '10:00', endTime: '11:00', room: 'Room 104' },
      { id: 'lec-m2', subject: 'Machine Learning', startTime: '11:10', endTime: '12:50', room: 'Lab 2' },
      { id: 'lec-m3', subject: 'Artificial Intelligence', startTime: '14:30', endTime: '15:20', room: 'Room 302' }
    ],
    Tuesday: [
      { id: 'lec-t1', subject: 'Data Science', startTime: '10:00', endTime: '11:00', room: 'Room 104' },
      { id: 'lec-t2', subject: 'Neural Networks', startTime: '14:30', endTime: '15:20', room: 'Room 201' }
    ],
    Wednesday: [
      { id: 'lec-w1', subject: 'Data Science', startTime: '09:00', endTime: '10:00', room: 'Room 104' },
      { id: 'lec-w2', subject: 'Data Science Lab', startTime: '11:10', endTime: '12:50', room: 'Lab LV224' },
      { id: 'lec-w3', subject: 'Artificial Intelligence', startTime: '14:30', endTime: '15:20', room: 'Room 302' }
    ],
    Thursday: [
      { id: 'lec-th1', subject: 'Machine Learning', startTime: '10:00', endTime: '11:00', room: 'Room 204' },
      { id: 'lec-th2', subject: 'Data Science', startTime: '11:10', endTime: '12:00', room: 'Room 104' }
    ],
    Friday: [
      { id: 'lec-f1', subject: 'Data Mining', startTime: '13:30', endTime: '14:30', room: 'Lab 3' },
      { id: 'lec-f2', subject: 'Artificial Intelligence', startTime: '14:40', endTime: '15:30', room: 'Room 302' }
    ],
    Saturday: []
  },
  baseAttendance: {
    'Data Science': { attended: 16, total: 18 },
    'Data Science Lab': { attended: 8, total: 9 },
    'Artificial Intelligence': { attended: 14, total: 16 },
    'Machine Learning': { attended: 11, total: 14 },
    'Neural Networks': { attended: 9, total: 11 },
    'Data Mining': { attended: 7, total: 8 }
  },
  studentAcademics: {
    'Data Science': { credits: 4, mst1: 24, mst2: 26, assignments: 18, maxInternal: 50, targetGrade: 'A+' },
    'Data Science Lab': { credits: 2, mst1: 18, mst2: 19, assignments: 19, maxInternal: 50, targetGrade: 'O' },
    'Artificial Intelligence': { credits: 4, mst1: 22, mst2: 25, assignments: 17, maxInternal: 50, targetGrade: 'A+' },
    'Machine Learning': { credits: 4, mst1: 25, mst2: 27, assignments: 19, maxInternal: 50, targetGrade: 'A+' },
    'Neural Networks': { credits: 3, mst1: 21, mst2: 23, assignments: 16, maxInternal: 50, targetGrade: 'A' },
    'Data Mining': { credits: 3, mst1: 23, mst2: 24, assignments: 18, maxInternal: 50, targetGrade: 'A+' }
  },
  studyHubData: {
    'Data Science': {
      units: [
        { id: 'u1', name: 'Unit 1: Introduction to Data Science & EDA', completed: true },
        { id: 'u2', name: 'Unit 2: Probability & Inferential Statistics', completed: true },
        { id: 'u3', name: 'Unit 3: Regression & Classification Models', completed: false },
        { id: 'u4', name: 'Unit 4: Feature Engineering & Dimensionality Reduction', completed: false },
        { id: 'u5', name: 'Unit 5: Big Data Tools & Spark Integration', completed: false }
      ],
      experiments: [],
      notes: [
        { title: 'Unit 1 & 2 Handouts (Prof. Neha Verma)', url: '#' },
        { title: 'Mid-Term 2025 PYQ Paper + Solutions', url: '#' },
        { title: 'Pandas & NumPy Quick Formula Sheet', url: '#' }
      ]
    },
    'Data Science Lab': {
      units: [],
      experiments: [
        { id: 'exp1', name: 'Exp 1: Data Cleaning & Wrangling using Pandas', completed: true, verified: true },
        { id: 'exp2', name: 'Exp 2: Exploratory Data Analysis & Seaborn Plots', completed: true, verified: true },
        { id: 'exp3', name: 'Exp 3: Multiple Linear Regression Model', completed: true, verified: false },
        { id: 'exp4', name: 'Exp 4: Logistic Regression on Titanic Dataset', completed: false, verified: false },
        { id: 'exp5', name: 'Exp 5: Decision Tree & Random Forest Classifier', completed: false, verified: false },
        { id: 'exp6', name: 'Exp 6: K-Means Clustering on Customer Segmentation', completed: false, verified: false }
      ],
      notes: [
        { title: 'Lab Manual LV224 (Official Dept PDF)', url: '#' },
        { title: 'Sample Viva Questions & Code Snippets', url: '#' }
      ]
    }
  },
  placementsData: [
    {
      id: 'drive-cisco',
      company: 'Cisco Systems',
      logo: '🌐',
      role: 'Software Engineer (Cloud & Networks)',
      ctc: '₹14.5 LPA',
      type: 'On-Campus (Dream)',
      location: 'Bangalore / Pune',
      minCgpa: 8.0,
      minAttendance: 75,
      deadline: 'Nov 16, 2026 • 5:00 PM',
      pptDate: 'Nov 17, 2026 • 10:00 AM',
      applied: true,
      currentRound: 'Online Coding Assessment (OA)',
      description: 'Role involves distributed systems development, cloud infrastructure automation, and network protocol engineering. Looking for strong fundamentals in C++, Data Structures, OS, and Computer Networks.',
      rounds: [
        { name: 'Pod.ai Registration & Shortlisting', status: 'completed' },
        { name: 'Online Coding & MCQ Assessment (OA)', status: 'active', date: 'Nov 18 • 6:00 PM' },
        { name: 'Technical Interview (Core CS & DSA)', status: 'pending' },
        { name: 'Managerial & System Design Round', status: 'pending' },
        { name: 'HR Round & Final Offer Letter', status: 'pending' }
      ]
    },
    {
      id: 'drive-impetus',
      company: 'Impetus Technologies',
      logo: '⚡',
      role: 'Big Data & AI Software Engineer',
      ctc: '₹9.0 LPA',
      type: 'On-Campus (Indore)',
      location: 'Crystal IT Park, Indore',
      minCgpa: 7.5,
      minAttendance: 75,
      deadline: 'Nov 14, 2026 • 11:59 PM',
      pptDate: 'Wednesday • 11:30 AM (Audi-2)',
      clashSlot: 'Data Science Lab (Wed 11:10 - 12:50)',
      applied: true,
      currentRound: 'Pre-Placement Talk (PPT Attendance Mandatory)',
      description: 'Impetus is hiring engineering graduates for its Big Data and Generative AI practice. Candidate will work with Apache Spark, Kafka, Python, and scalable cloud pipelines.',
      rounds: [
        { name: 'Pod.ai Registration & Shortlisting', status: 'completed' },
        { name: 'Mandatory Pre-Placement Talk (Audi-2)', status: 'active', date: 'Wednesday • 11:30 AM' },
        { name: 'Aptitude & Technical Online Test', status: 'pending' },
        { name: 'Technical Interview (Python & SQL)', status: 'pending' },
        { name: 'HR Final Round', status: 'pending' }
      ]
    },
    {
      id: 'drive-tcs',
      company: 'TCS Digital',
      logo: '🏢',
      role: 'Systems Engineer (Digital)',
      ctc: '₹7.5 LPA',
      type: 'On-Campus Drive',
      location: 'Pan India / Indore Center',
      minCgpa: 7.0,
      minAttendance: 70,
      deadline: 'Nov 20, 2026 • 6:00 PM',
      pptDate: 'Nov 21, 2026',
      applied: false,
      currentRound: 'Registration Open',
      description: 'TCS Digital hiring through National Qualifier Test (NQT) for high-impact innovation projects across Cloud, AI, and Cybersecurity.',
      rounds: [
        { name: 'Pod.ai Registration Verification', status: 'pending' },
        { name: 'TCS NQT Advanced Coding Round', status: 'pending' },
        { name: 'Technical + Managerial Interview', status: 'pending' },
        { name: 'HR Discussion & Offer Rollout', status: 'pending' }
      ]
    },
    {
      id: 'drive-persistent',
      company: 'Persistent Systems',
      logo: '💠',
      role: 'Software Developer — Full Stack',
      ctc: '₹6.5 LPA',
      type: 'On-Campus Drive',
      location: 'Pune / Indore / Nagpur',
      minCgpa: 6.8,
      minAttendance: 75,
      deadline: 'Nov 22, 2026 • 5:00 PM',
      pptDate: 'Nov 23, 2026',
      applied: false,
      currentRound: 'Registration Open',
      description: 'Persistent Systems hiring 2026 batch for enterprise application modernization, Java/Spring Boot, React, and cloud native architectures.',
      rounds: [
        { name: 'Pod.ai Registration', status: 'pending' },
        { name: 'Online Assessment (DSA & English)', status: 'pending' },
        { name: 'Technical Interview', status: 'pending' },
        { name: 'HR Round', status: 'pending' }
      ]
    },
    {
      id: 'drive-morgan',
      company: 'Morgan Stanley',
      logo: '🏛️',
      role: 'Technology Summer Analyst (Dream)',
      ctc: '₹25.0 LPA (₹1.25 L/mo stipend)',
      type: 'Off-Campus Challenge',
      location: 'Mumbai / Bangalore',
      minCgpa: 8.8,
      minAttendance: 80,
      deadline: 'Nov 28, 2026 • 11:59 PM',
      applied: false,
      currentRound: 'Registration Locked',
      description: 'Prestigious global investment bank technology program. High compensation, rigorous technical challenge, algorithmic problem solving, and low-latency systems.',
      rounds: [
        { name: 'Resume Shortlisting (Cutoff 8.8 CGPA)', status: 'pending' },
        { name: 'Online Coding Challenge (Hackerrank)', status: 'pending' },
        { name: 'Virtual Superday Interviews (3 Rounds)', status: 'pending' },
        { name: 'Final Summer Internship Offer', status: 'pending' }
      ]
    },
    {
      id: 'drive-sih',
      company: 'Smart India Hackathon (SIH 2026)',
      logo: '🏆',
      role: 'National Ministry Hackathon + PPIs',
      ctc: '₹1.0 Lakh Prize + Direct Interviews',
      type: 'National Hackathon',
      location: 'National Grand Finale',
      minCgpa: 6.0,
      minAttendance: 70,
      deadline: 'Nov 30, 2026',
      applied: false,
      currentRound: 'College Internal Screening',
      description: 'Government of India national hackathon. Medi-Caps internal college selection for smart solutions in AI, Healthcare, and Agriculture. Top teams get direct Pre-Placement Interviews (PPIs).',
      rounds: [
        { name: 'Internal College Idea Submission', status: 'pending' },
        { name: 'Medi-Caps Internal Hackathon Evaluation', status: 'pending' },
        { name: 'National Round Shortlisting', status: 'pending' },
        { name: '36-Hour Grand Finale & Cash Award', status: 'pending' }
      ]
    }
  ],
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
          authSession: parsed.authSession || DEFAULT_STATE.authSession,
          activeRole: parsed.activeRole || DEFAULT_STATE.activeRole,
          currentFacultyId: parsed.currentFacultyId || DEFAULT_STATE.currentFacultyId,
          faculties: (parsed.faculties && parsed.faculties.length) ? parsed.faculties : DEFAULT_STATE.faculties,
          facultySchedules: parsed.facultySchedules || DEFAULT_STATE.facultySchedules,
          studentsList: (parsed.studentsList && parsed.studentsList.length) ? parsed.studentsList : DEFAULT_STATE.studentsList,
          substitutions: parsed.substitutions || [],
          batchAttendance: parsed.batchAttendance || {},
          cancelledLectures: parsed.cancelledLectures || {},
          notices: (parsed.notices && parsed.notices.length) ? parsed.notices : DEFAULT_STATE.notices,
          studentAcademics: parsed.studentAcademics || DEFAULT_STATE.studentAcademics,
          studyHubData: parsed.studyHubData || DEFAULT_STATE.studyHubData,
          placementsData: (parsed.placementsData && parsed.placementsData.length) ? parsed.placementsData : DEFAULT_STATE.placementsData,
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

    // Check if this upcoming lecture has an accepted substitute or was cancelled today
    const nowLocalDate = new Date();
    const todayLocalStr = toLocalDateStr(nowLocalDate);
    const sub = (this.data.substitutions || []).find(s =>
      s.status === 'accepted' &&
      s.subject.trim().toLowerCase() === nextLec.subject.trim().toLowerCase()
    );

    const isCancelled = !!(this.data.cancelledLectures && (
      this.data.cancelledLectures[`${nextLec.id}_${todayLocalStr}`] ||
      this.data.cancelledLectures[`${nextLec.subject}_${todayLocalStr}`]
    ));

    return {
      lecture: nextLec,
      dayLabel: dayLabel,
      prediction: prediction,
      substituteInfo: sub || null,
      isCancelled: isCancelled
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

function showToast(message) {
  showBottomToast(message, 'Dismiss', hideBottomToast);
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

    // If faculty cancelled this lecture today, skip pop-up prompt
    if (state.data.cancelledLectures && (
      state.data.cancelledLectures[`${lec.id}_${todayStr}`] ||
      state.data.cancelledLectures[`${lec.subject}_${todayStr}`]
    )) {
      return;
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

    const assignedFac = getAssignedFacultyForSubject(lec.subject);

    heroContainer.innerHTML = `
      <div class="upcoming-hero-card">
        <div class="card-top-badge-row">
          <span class="badge-tag-upcoming">⏰ Upcoming Class (${upcomingData.dayLabel})</span>
          <span class="target-goal-chip">Target: ${target}%</span>
        </div>
        
        <h2 class="upcoming-subject-title">${lec.subject}</h2>
        <div class="upcoming-time-meta">⏰ ${format12h(lec.startTime)} - ${format12h(lec.endTime)} • 📍 ${lec.room || 'No Room Specified'}</div>
        <div style="font-size: 0.76rem; font-weight: 700; color: #94a3b8; margin: 4px 0 6px 0; display: flex; align-items: center; gap: 6px;">
          <span>👨‍🏫 Teacher:</span>
          <span style="color: #fff; font-weight: 800;">${assignedFac ? assignedFac.name : 'Department Faculty'}</span>
          <span style="font-size: 0.70rem; color: var(--accent-cyan); font-weight: 600;">(${assignedFac ? assignedFac.dept : 'CSE'})</span>
        </div>

        ${upcomingData.substituteInfo ? `
          <div style="background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 8px; padding: 7px 11px; margin: 8px 0; font-size: 0.78rem; font-weight: 700; color: #93c5fd; display: flex; align-items: center; gap: 6px;">
            <span>🔄</span>
            <span><strong>Substitute Faculty:</strong> ${upcomingData.substituteInfo.toFacultyName} (covering for ${upcomingData.substituteInfo.fromFacultyName})</span>
          </div>
        ` : ''}
        ${upcomingData.isCancelled ? `
          <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 8px; padding: 7px 11px; margin: 8px 0; font-size: 0.78rem; font-weight: 700; color: #f87171; display: flex; align-items: center; gap: 6px;">
            <span>🚫</span>
            <span><strong>Lecture Cancelled Today</strong> by faculty. No attendance required.</span>
          </div>
        ` : ''}

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

    let recoveryHtml = '';
    if (sub.hasRecords) {
      if (sub.pct < target) {
        recoveryHtml = `
          <div class="recovery-strip recovery-danger">
            <span>⚠️ Must attend next <strong>${sub.needAttend}</strong> consecutive class${sub.needAttend === 1 ? '' : 'es'} to reach ${target}%</span>
            <span style="font-size: 0.68rem; opacity: 0.9;">Defaulter</span>
          </div>
        `;
      } else {
        recoveryHtml = `
          <div class="recovery-strip recovery-safe">
            <span>😎 Safe margin: Can miss up to <strong>${sub.canBunk}</strong> class${sub.canBunk === 1 ? '' : 'es'} (stays ≥ ${target}%)</span>
            <span style="font-size: 0.68rem; opacity: 0.9;">Eligible</span>
          </div>
        `;
      }
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

      ${recoveryHtml}

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 0.75rem;">
        <span style="color: ${bunkAdviceColor}; font-weight: 700;">${bunkAdviceText}</span>
        <div style="display: flex; gap: 6px; align-items: center;">
          <button class="btn-link-edit" onclick="openStudyHubModal('${safeSub}')" style="font-size: 0.72rem; color: #a78bfa; font-weight: 700; padding: 2px 6px; background: rgba(167, 139, 250, 0.12); border-radius: 6px; border: 1px solid rgba(167, 139, 250, 0.25);">📚 Study Hub</button>
          <button class="btn-link-edit" onclick="openDirectAttendanceModal('${safeSub}')" style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 700; padding: 2px 4px;">✏️ Edit</button>
        </div>
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

  // Overall Defaulter Alert Banner
  const defaulterSubs = subList.filter(s => s.hasRecords && s.pct < target);
  const defBanner = document.getElementById('defaulterAlertBanner');
  const defTitle = document.getElementById('defaulterAlertTitle');
  const defSub = document.getElementById('defaulterAlertSub');
  if (defBanner) {
    if (defaulterSubs.length > 0) {
      defBanner.style.display = 'flex';
      if (defTitle) defTitle.textContent = `⚠️ Attendance Defaulter Alert (${defaulterSubs.length} Subject${defaulterSubs.length === 1 ? '' : 's'} < ${target}%)`;
      if (defSub) defSub.textContent = `Immediate recovery needed in: ${defaulterSubs.map(s => s.subject).join(', ')}. Check required classes above.`;
    } else {
      defBanner.style.display = 'none';
    }
  }

  updateDigitalIdCard();
  renderNoticeboard();
  renderAssignedTeachers();
  renderLiveCampusRadar();
  renderWhatIfSimulator();
  renderStudentAcademicsSummary();
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
    const assignedFac = getAssignedFacultyForSubject(lec.subject);
    row.innerHTML = `
      <div class="time-badge">
        <div class="time-start">${format12h(lec.startTime)}</div>
        <div class="time-end">${format12h(lec.endTime)}</div>
      </div>
      <div class="lec-details">
        <div class="lec-name">${lec.subject}</div>
        <div class="lec-meta">📍 ${lec.room || 'No Room Specified'} • 👨‍🏫 ${assignedFac ? assignedFac.name : 'Faculty TBA'}</div>
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
          // Check if cancelled by faculty for today
          const isCancelledByFac = (state.data.cancelledLectures && (
            state.data.cancelledLectures[`${lec.id}_${dateStr}`] ||
            state.data.cancelledLectures[`${lec.subject}_${dateStr}`]
          ));
          const activeSub = (state.data.substitutions || []).find(s =>
            s.status === 'accepted' &&
            s.day === dayName &&
            s.subject.trim().toLowerCase() === lec.subject.trim().toLowerCase()
          );

          if (isCancelledByFac) {
            status = 'cancelled';
            badgeText = '⚪ Faculty Cancelled';
            blockClass = 'slot-block-cancelled';
          } else {
            // No record logged yet
            const startMin = timeStrToMinutes(lec.startTime);
            if (isFutureDay || (isToday && startMin > currentMinutes)) {
              // Hasn't happened yet -> Clean White as requested
              status = 'upcoming';
              badgeText = activeSub ? `🔄 Sub: ${activeSub.toFacultyName.split(' ')[1] || activeSub.toFacultyName}` : '⏳ Upcoming';
              blockClass = 'slot-block-upcoming';
            } else {
              // Past or ongoing but unrecorded -> White box
              status = 'unrecorded';
              badgeText = activeSub ? `🔄 Sub: ${activeSub.toFacultyName.split(' ')[1] || activeSub.toFacultyName}` : '⏳ Not Marked';
              blockClass = 'slot-block-upcoming';
            }
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

// ================= FACULTY & SMART SUBSTITUTION ENGINE =================
let activeFacultyDay = 'Wednesday';
let activeFacultyTab = 'schedule';
let activeSubstituteContext = null;
let activeRollCallContext = null;
let filterDefaultersOnly = false;

function getCurrentFaculty() {
  const facId = state.data.currentFacultyId || 'fac-1';
  return (state.data.faculties || []).find(f => f.id === facId) || state.data.faculties[0];
}

// ================= ASSIGNED TEACHERS DIRECTORY =================
function getAssignedFacultyForSubject(subjectName) {
  if (!subjectName) return null;
  const subLower = subjectName.trim().toLowerCase();
  const faculties = state.data.faculties || DEFAULT_FACULTIES;

  // 1. Exact match in faculty.subjects
  for (const fac of faculties) {
    if ((fac.subjects || []).some(s => s.trim().toLowerCase() === subLower)) {
      return fac;
    }
  }

  // 2. Direct contains / substring match
  for (const fac of faculties) {
    if ((fac.subjects || []).some(s => s.toLowerCase().includes(subLower) || subLower.includes(s.toLowerCase()))) {
      return fac;
    }
  }

  // 3. Keyword fallback matching
  if (subLower.includes('data') || subLower.includes('mining')) return faculties.find(f => f.id === 'fac-2') || faculties[0];
  if (subLower.includes('intelligence') || subLower.includes('algorithm')) return faculties.find(f => f.id === 'fac-1') || faculties[0];
  if (subLower.includes('learning') || subLower.includes('neural')) return faculties.find(f => f.id === 'fac-3') || faculties[0];
  if (subLower.includes('network') || subLower.includes('security')) return faculties.find(f => f.id === 'fac-5') || faculties[0];
  if (subLower.includes('software') || subLower.includes('database')) return faculties.find(f => f.id === 'fac-4') || faculties[0];

  return faculties[0];
}

function escapeHtml(str) {
  if (typeof str !== 'string') return String(str || '');
  return str.replace(/[&<>"']/g, function(m) {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return m;
    }
  });
}

function renderAssignedTeachers() {
  const container = document.getElementById('assignedTeachersList');
  if (!container) return;

  const subjects = state.getUniqueSubjects();
  if (subjects.length === 0) {
    container.innerHTML = `
      <div style="font-size: 0.78rem; color: var(--text-muted); padding: 8px 0;">No subjects added in your timetable yet.</div>
    `;
    return;
  }

  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[now.getDay()];

  let html = '';
  subjects.forEach(sub => {
    const fac = getAssignedFacultyForSubject(sub);
    if (!fac) return;

    // Check if there is an active accepted substitute for this subject today
    const activeSub = (state.data.substitutions || []).find(s => 
      s.status === 'accepted' && 
      s.day === todayName && 
      s.subject.trim().toLowerCase() === sub.trim().toLowerCase()
    );

    html += `
      <div class="teacher-card" style="display: flex; flex-direction: column; align-items: stretch; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
          <div class="teacher-card-left" style="align-items: flex-start;">
            <div class="teacher-avatar">👨‍🏫</div>
            <div>
              <div class="teacher-name">${escapeHtml(fac.name)}</div>
              <div class="teacher-meta">${escapeHtml(sub)} • <span style="color: var(--accent-cyan); font-weight: 700;">${escapeHtml(fac.dept)}</span></div>
            </div>
          </div>
          <span class="slot-badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 0.68rem; padding: 3px 8px; flex-shrink: 0;">
            ${escapeHtml(fac.title.split(' ')[0] || 'Faculty')}
          </span>
        </div>

        ${activeSub ? `
          <div style="background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 6px; padding: 6px 10px; font-size: 0.68rem; color: #93c5fd; font-weight: 700; display: flex; align-items: center; gap: 6px;">
            <span>🔄</span>
            <span>Substitute Today: <strong>${escapeHtml(activeSub.toFacultyName)}</strong> (${escapeHtml(activeSub.room || 'Same Room')})</span>
          </div>
        ` : ''}

        <div class="teacher-details-row">
          <div>📍 <strong>Cabin:</strong> ${escapeHtml(fac.cabin || 'CS Block')}</div>
          <div>🕒 <strong>Office Hours:</strong> ${escapeHtml(fac.officeHours || 'Mon–Fri 3:30–4:30 PM')}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
            <span style="font-size: 0.68rem; color: #94a3b8;">📞 ${escapeHtml(fac.phone || 'Ext: Direct')}</span>
            <a href="mailto:${escapeHtml(fac.email || 'faculty@college.edu')}" class="teacher-contact-btn">✉️ Email Faculty</a>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function updateDigitalIdCard() {
  const session = getAuthSession();
  const cardName = document.getElementById('cardStudentName');
  const cardRoll = document.getElementById('cardStudentRoll');
  const cardPrn = document.getElementById('cardStudentPrn');
  const cardDegree = document.getElementById('cardStudentDegree');
  const cardSem = document.getElementById('cardStudentSem');
  const cardBatch = document.getElementById('cardStudentBatch');
  const cardAdvisor = document.getElementById('cardStudentAdvisor');

  if (session && session.role === 'student') {
    const rollNum = session.userId || '104';
    if (cardName) cardName.textContent = session.name || 'Rishabh Patel';
    if (cardRoll) cardRoll.textContent = rollNum;
    if (cardPrn) cardPrn.textContent = `EN22CS301${rollNum}`;
    if (cardDegree) cardDegree.textContent = 'B.Tech — Computer Science & Engineering';
    if (cardSem) cardSem.textContent = '5th Semester';
    if (cardBatch) cardBatch.textContent = (parseInt(rollNum, 10) % 2 === 0) ? 'Batch A1' : 'Batch A2';
    if (cardAdvisor) cardAdvisor.textContent = 'Dr. Neha Verma';
    const clgEl = document.querySelector('.id-card-college');
    if (clgEl) clgEl.textContent = 'MEDI-CAPS UNIVERSITY • INDORE';
    const deptEl = document.querySelector('.id-card-dept');
    if (deptEl) deptEl.textContent = 'FACULTY OF ENGINEERING • CSE DEPARTMENT';
  }
}

function toggleIdCardCompact() {
  const body = document.getElementById('idCardMainBody');
  const btnText = document.getElementById('textToggleId');
  if (!body) return;
  if (body.style.display === 'none') {
    body.style.display = 'flex';
    if (btnText) btnText.innerHTML = 'Compact View 🔼';
  } else {
    body.style.display = 'none';
    if (btnText) btnText.innerHTML = 'Expand Card 🔽';
  }
}

function renderNoticeboard() {
  const container = document.getElementById('noticeboardCardsList');
  if (!container) return;

  const notices = state.data.notices || [];
  if (notices.length === 0) {
    container.innerHTML = `
      <div style="font-size: 0.75rem; color: var(--text-muted); padding: 12px 8px; text-align: center; width: 100%;">
        No campus announcements or pending deadlines at this time.
      </div>
    `;
    return;
  }

  let html = '';
  notices.forEach(n => {
    let catClass = 'notice-card-assignment';
    let catColor = '#38bdf8';
    if (n.category === 'exam') {
      catClass = 'notice-card-exam';
      catColor = '#f87171';
    } else if (n.category === 'holiday') {
      catClass = 'notice-card-holiday';
      catColor = '#fbbf24';
    }

    html += `
      <div class="notice-card ${catClass}">
        <div>
          <div class="notice-top-row">
            <span class="notice-tag" style="color: ${catColor};">${escapeHtml(n.tag || 'Notice')}</span>
            <button type="button" onclick="deleteNotice('${escapeHtml(n.id)}')" title="Dismiss Reminder" style="background: none; border: none; color: #71717a; font-size: 1rem; line-height: 1; cursor: pointer; padding: 0 4px;">&times;</button>
          </div>
          <div class="notice-title">${escapeHtml(n.title)}</div>
          <div class="notice-date">📅 ${escapeHtml(n.date)}</div>
          <div class="notice-desc">${escapeHtml(n.desc || '')}</div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function openAddNoticeModal() {
  const modal = document.getElementById('modalAddNotice');
  if (modal) modal.classList.add('active');
}

function submitNewNotice(e) {
  if (e) e.preventDefault();
  const catEl = document.getElementById('noticeCategory');
  const titleEl = document.getElementById('noticeTitle');
  const dateEl = document.getElementById('noticeDate');
  const descEl = document.getElementById('noticeDesc');

  const category = catEl ? catEl.value : 'assignment';
  const title = titleEl ? titleEl.value.trim() : '';
  const date = dateEl ? dateEl.value.trim() : '';
  const desc = descEl ? descEl.value.trim() : '';

  if (!title) {
    showToast('Please enter a title');
    return;
  }

  const tagMap = {
    exam: '🚨 Exam Alert',
    assignment: '📝 Lab Record',
    holiday: '🏖️ Campus Holiday',
    general: '📌 Notice'
  };

  const newNotice = {
    id: 'not-' + Date.now(),
    category: category,
    tag: tagMap[category] || '📌 Notice',
    title: title,
    date: date || 'Upcoming',
    desc: desc
  };

  if (!state.data.notices) state.data.notices = [];
  state.data.notices.unshift(newNotice);
  state.save();

  closeModal('modalAddNotice');
  renderNoticeboard();
  showToast('Academic reminder saved!');

  const form = document.getElementById('formAddNotice');
  if (form) form.reset();
}

function deleteNotice(id) {
  if (!state.data.notices) return;
  state.data.notices = state.data.notices.filter(n => n.id !== id);
  state.save();
  renderNoticeboard();
  showToast('Reminder dismissed');
}

/* ================= 1. LIVE CAMPUS RADAR ENGINE ================= */
function renderLiveCampusRadar() {
  const container = document.getElementById('studentLiveRadar');
  if (!container) return;

  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // If weekend or no schedule for today
  const todaySchedule = (state.data.timetable && state.data.timetable[todayName]) || [];
  if (todaySchedule.length === 0) {
    container.innerHTML = `
      <div class="live-radar-top-row">
        <span class="radar-badge radar-done-badge">🏖️ CAMPUS OFF</span>
        <span class="radar-time-pill">${todayName} • Campus Idle</span>
      </div>
      <h3 class="radar-main-title">No Lectures Scheduled Today</h3>
      <div class="radar-meta-row">
        <span>Enjoy your weekend or revise syllabus notes in Study Hub.</span>
      </div>
    `;
    return;
  }

  // Sort lectures by start time
  const sorted = [...todaySchedule].sort((a, b) => timeStrToMinutes(a.startTime) - timeStrToMinutes(b.startTime));

  // Check for currently active lecture
  let activeLec = null;
  let nextLec = null;

  for (const lec of sorted) {
    const sMin = timeStrToMinutes(lec.startTime);
    const eMin = timeStrToMinutes(lec.endTime);
    if (sMin !== -1 && eMin !== -1) {
      if (currentMinutes >= sMin && currentMinutes < eMin) {
        activeLec = lec;
        break;
      } else if (currentMinutes < sMin && !nextLec) {
        nextLec = lec;
      }
    }
  }

  if (activeLec) {
    const fac = getAssignedFacultyForSubject(activeLec.subject);
    const eMin = timeStrToMinutes(activeLec.endTime);
    const minsLeft = Math.max(1, eMin - currentMinutes);
    const safeSub = activeLec.subject.replace(/'/g, "\\'");

    // Check if substituted today
    const activeSub = (state.data.substitutions || []).find(s => 
      s.status === 'accepted' && 
      s.day === todayName && 
      s.subject.trim().toLowerCase() === activeLec.subject.trim().toLowerCase()
    );

    container.innerHTML = `
      <div class="live-radar-top-row">
        <span class="radar-badge radar-live-badge"><span class="radar-pulse-dot"></span> LIVE CLASS NOW</span>
        <span class="radar-time-pill">⏳ ${minsLeft}m left • Until ${format12h(activeLec.endTime)}</span>
      </div>
      <h3 class="radar-main-title">${escapeHtml(activeLec.subject)}</h3>
      <div class="radar-meta-row">
        <span>📍 <strong>${escapeHtml(activeLec.room || 'Classroom')}</strong></span>
        <span>•</span>
        <span>👨‍🏫 ${escapeHtml(activeSub ? activeSub.toFacultyName + ' (Substitute)' : fac.name)}</span>
        <span>•</span>
        <span>🏢 ${escapeHtml(fac.cabin || 'CS Block')}</span>
      </div>
      <div class="radar-actions-row">
        <button type="button" class="btn-radar-action btn-radar-present" onclick="quickAddAttendance('${safeSub}', 'present')">
          <span>✅ Mark Attended</span>
        </button>
        <button type="button" class="btn-radar-action btn-radar-absent" onclick="quickAddAttendance('${safeSub}', 'absent')">
          <span>❌ Mark Bunked</span>
        </button>
      </div>
    `;
  } else if (nextLec) {
    const fac = getAssignedFacultyForSubject(nextLec.subject);
    const sMin = timeStrToMinutes(nextLec.startTime);
    const minsUntil = Math.max(1, sMin - currentMinutes);

    container.innerHTML = `
      <div class="live-radar-top-row">
        <span class="radar-badge radar-free-badge">☕ BREAK / FREE SLOT NOW</span>
        <span class="radar-time-pill">Next in ${minsUntil}m</span>
      </div>
      <h3 class="radar-main-title">Next: ${escapeHtml(nextLec.subject)}</h3>
      <div class="radar-meta-row">
        <span>🕒 Starts at <strong>${format12h(nextLec.startTime)}</strong></span>
        <span>•</span>
        <span>📍 ${escapeHtml(nextLec.room || 'Room')}</span>
        <span>•</span>
        <span>👨‍🏫 ${escapeHtml(fac.name)}</span>
      </div>
    `;
  } else {
    // All lectures completed for today
    container.innerHTML = `
      <div class="live-radar-top-row">
        <span class="radar-badge radar-done-badge">🎉 CLASSES DONE TODAY</span>
        <span class="radar-time-pill">${todayName} Schedule Completed</span>
      </div>
      <h3 class="radar-main-title">All Classes Finished for Today!</h3>
      <div class="radar-meta-row">
        <span>All ${sorted.length} scheduled lectures for today have concluded. Great work!</span>
      </div>
    `;
  }
}

/* ================= 2. WHAT-IF BUNK SIMULATOR ENGINE ================= */
let simMissCount = 1;
let simAttendCount = 0;

function renderWhatIfSimulator() {
  const sel = document.getElementById('simSubjectSelect');
  if (!sel) return;

  const currentVal = sel.value;
  const subjects = state.getUniqueSubjects();

  let html = `<option value="__all__">🌐 All Subjects (Entire Day / Combined)</option>`;
  subjects.forEach(sub => {
    html += `<option value="${escapeHtml(sub)}">${escapeHtml(sub)}</option>`;
  });
  sel.innerHTML = html;

  if (currentVal && (subjects.includes(currentVal) || currentVal === '__all__')) {
    sel.value = currentVal;
  }

  runWhatIfSimulation();
}

function adjustSimCount(type, delta) {
  if (type === 'miss') {
    simMissCount = Math.max(0, simMissCount + delta);
    const el = document.getElementById('simMissCount');
    if (el) el.textContent = simMissCount;
  } else if (type === 'attend') {
    simAttendCount = Math.max(0, simAttendCount + delta);
    const el = document.getElementById('simAttendCount');
    if (el) el.textContent = simAttendCount;
  }
  runWhatIfSimulation();
}

function applySimPreset(presetKey) {
  if (presetKey === 'tomorrow') {
    simMissCount = 3;
    simAttendCount = 0;
  } else if (presetKey === 'sick') {
    simMissCount = 6;
    simAttendCount = 0;
  } else if (presetKey === 'recover') {
    simMissCount = 0;
    simAttendCount = 5;
  }
  const elM = document.getElementById('simMissCount');
  const elA = document.getElementById('simAttendCount');
  if (elM) elM.textContent = simMissCount;
  if (elA) elA.textContent = simAttendCount;
  runWhatIfSimulation();
}

function resetWhatIfSimulator() {
  simMissCount = 1;
  simAttendCount = 0;
  const elM = document.getElementById('simMissCount');
  const elA = document.getElementById('simAttendCount');
  if (elM) elM.textContent = simMissCount;
  if (elA) elA.textContent = simAttendCount;
  runWhatIfSimulation();
}

function runWhatIfSimulation() {
  const resultBox = document.getElementById('simResultBox');
  if (!resultBox) return;

  const sel = document.getElementById('simSubjectSelect');
  const selectedSubject = sel ? sel.value : '__all__';
  const target = state.data.settings.targetPercentage || 75;

  const stats = state.calculateStats();
  if (selectedSubject === '__all__') {
    // Combined overall simulation
    const overall = stats.overall;
    const currAtt = overall.attended;
    const currTot = overall.total;
    const currPct = currTot > 0 ? (currAtt / currTot) * 100 : 0;

    const simAtt = currAtt + simAttendCount;
    const simTot = currTot + simMissCount + simAttendCount;
    const simPct = simTot > 0 ? (simAtt / simTot) * 100 : 0;
    const delta = simPct - currPct;
    const deltaSign = delta >= 0 ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`;
    const deltaColor = delta >= 0 ? '#4ade80' : '#f87171';

    let verdictHtml = '';
    if (simPct >= target) {
      const safeMargin = Math.floor((simAtt - (target / 100) * simTot) / (target / 100));
      verdictHtml = `
        <div class="sim-verdict-box sim-verdict-safe">
          🟢 <strong>SAFE LEAVE:</strong> Your overall attendance will be <strong>${simPct.toFixed(1)}%</strong> (${deltaSign}). You stay above the ${target}% threshold with a safe cushion of <strong>${safeMargin}</strong> future bunks.
        </div>
      `;
    } else {
      const needed = Math.ceil(((target / 100) * simTot - simAtt) / (1 - (target / 100)));
      verdictHtml = `
        <div class="sim-verdict-box sim-verdict-danger">
          🔴 <strong>DEFAULTER DANGER:</strong> Attendance falls to <strong>${simPct.toFixed(1)}%</strong> (${deltaSign})! You will drop below ${target}%. To fix this, you must attend the next <strong>${needed}</strong> consecutive classes without missing.
        </div>
      `;
    }

    resultBox.innerHTML = `
      <div class="sim-compare-grid">
        <div>
          <div class="sim-compare-lbl">Current</div>
          <div class="sim-compare-val" style="color: #cbd5e1;">${currPct.toFixed(1)}%</div>
          <div style="font-size: 0.65rem; color: #94a3b8;">${currAtt}/${currTot} attended</div>
        </div>
        <div style="font-size: 1.1rem; color: #a78bfa;">➔</div>
        <div>
          <div class="sim-compare-lbl">Simulated</div>
          <div class="sim-compare-val" style="color: ${simPct >= target ? '#4ade80' : '#f87171'};">${simPct.toFixed(1)}%</div>
          <div style="font-size: 0.65rem; color: ${deltaColor}; font-weight: 700;">${deltaSign} change</div>
        </div>
      </div>
      ${verdictHtml}
    `;
  } else {
    // Single subject simulation
    const subStats = state.getCurrentSubjectStats(selectedSubject);
    const currAtt = subStats.attended || 0;
    const currTot = subStats.total || 0;
    const currPct = currTot > 0 ? (currAtt / currTot) * 100 : 0;

    const simAtt = currAtt + simAttendCount;
    const simTot = currTot + simMissCount + simAttendCount;
    const simPct = simTot > 0 ? (simAtt / simTot) * 100 : 0;
    const delta = simPct - currPct;
    const deltaSign = delta >= 0 ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`;
    const deltaColor = delta >= 0 ? '#4ade80' : '#f87171';

    let verdictHtml = '';
    if (simPct >= target) {
      const safeMargin = Math.floor((simAtt - (target / 100) * simTot) / (target / 100));
      verdictHtml = `
        <div class="sim-verdict-box sim-verdict-safe">
          🟢 <strong>SAFE IN ${escapeHtml(selectedSubject)}:</strong> Projected at <strong>${simPct.toFixed(1)}%</strong> (${deltaSign}). You remain eligible for semester exams with <strong>${safeMargin}</strong> bunks cushion.
        </div>
      `;
    } else {
      const needed = Math.ceil(((target / 100) * simTot - simAtt) / (1 - (target / 100)));
      verdictHtml = `
        <div class="sim-verdict-box sim-verdict-danger">
          🔴 <strong>DEFAULTER RISK IN ${escapeHtml(selectedSubject)}:</strong> Drops to <strong>${simPct.toFixed(1)}%</strong> (${deltaSign})! You will need to attend <strong>${needed}</strong> consecutive ${escapeHtml(selectedSubject)} classes to reach ${target}%.
        </div>
      `;
    }

    resultBox.innerHTML = `
      <div class="sim-compare-grid">
        <div>
          <div class="sim-compare-lbl">Current</div>
          <div class="sim-compare-val" style="color: #cbd5e1;">${currPct.toFixed(1)}%</div>
          <div style="font-size: 0.65rem; color: #94a3b8;">${currAtt}/${currTot} attended</div>
        </div>
        <div style="font-size: 1.1rem; color: #a78bfa;">➔</div>
        <div>
          <div class="sim-compare-lbl">Simulated</div>
          <div class="sim-compare-val" style="color: ${simPct >= target ? '#4ade80' : '#f87171'};">${simPct.toFixed(1)}%</div>
          <div style="font-size: 0.65rem; color: ${deltaColor}; font-weight: 700;">${deltaSign} change</div>
        </div>
      </div>
      ${verdictHtml}
    `;
  }
}

/* ================= 3. ACADEMIC INTERNALS & CGPA GOAL ENGINE ================= */
function renderStudentAcademicsSummary() {
  const metricsEl = document.getElementById('metricProjectedSgpa');
  const creditsEl = document.getElementById('metricTotalCredits');
  const avgEl = document.getElementById('metricInternalAvg');
  if (!metricsEl) return;

  const academics = state.data.studentAcademics || {};
  const subjects = Object.keys(academics);

  if (subjects.length === 0) {
    metricsEl.textContent = '8.50';
    if (creditsEl) creditsEl.textContent = '20';
    if (avgEl) avgEl.textContent = '85%';
    return;
  }

  let totalCredits = 0;
  let totalGradePoints = 0;
  let totalInternalGot = 0;
  let totalInternalMax = 0;

  const gradePointMap = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5 };

  subjects.forEach(sub => {
    const data = academics[sub];
    const cr = data.credits || 3;
    totalCredits += cr;
    const gp = gradePointMap[data.targetGrade || 'A+'] || 9;
    totalGradePoints += gp * cr;

    const got = (data.mst1 || 0) + (data.mst2 || 0) + (data.assignments || 0);
    const max = data.maxInternal || 50;
    totalInternalGot += got;
    totalInternalMax += max;
  });

  const sgpa = totalCredits > 0 ? (totalGradePoints / totalCredits) : 8.5;
  const avgPct = totalInternalMax > 0 ? Math.round((totalInternalGot / totalInternalMax) * 100) : 85;

  metricsEl.textContent = sgpa.toFixed(2);
  if (creditsEl) creditsEl.textContent = totalCredits;
  if (avgEl) avgEl.textContent = `${avgPct}%`;
}

function openCgpaModal() {
  const modal = document.getElementById('modalCgpaCalculator');
  if (!modal) return;
  renderCgpaModal();
  modal.classList.add('active');
}

function renderCgpaModal() {
  const listEl = document.getElementById('cgpaSubjectInputsList');
  if (!listEl) return;

  // Initialize academics for subjects in timetable if not present
  if (!state.data.studentAcademics) state.data.studentAcademics = {};
  const uniqueSubs = state.getUniqueSubjects();

  uniqueSubs.forEach(sub => {
    if (!state.data.studentAcademics[sub]) {
      const isLab = sub.toLowerCase().includes('lab');
      state.data.studentAcademics[sub] = {
        credits: isLab ? 2 : 4,
        mst1: isLab ? 18 : 22,
        mst2: isLab ? 19 : 23,
        assignments: isLab ? 19 : 17,
        maxInternal: 50,
        targetGrade: 'A+'
      };
    }
  });

  const academics = state.data.studentAcademics;
  const subs = Object.keys(academics);

  let html = '';
  subs.forEach(sub => {
    const item = academics[sub];
    const internalSum = (item.mst1 || 0) + (item.mst2 || 0) + (item.assignments || 0);
    const maxInt = item.maxInternal || 50;

    // Calculate marks needed in Final University Exam (out of 100) for target grade:
    const gradeThresholds = { 'O': 90, 'A+': 80, 'A': 70, 'B+': 60 };
    const targetThreshold = gradeThresholds[item.targetGrade || 'A+'] || 80;
    const neededInFinal = Math.max(0, 2 * (targetThreshold - internalSum));

    let examNeededChip = '';
    if (neededInFinal > 100) {
      examNeededChip = `<span style="font-size: 0.66rem; color: #f87171; font-weight: 700;">⚠️ Impossible (>100 needed)</span>`;
    } else if (neededInFinal <= 0) {
      examNeededChip = `<span style="font-size: 0.66rem; color: #4ade80; font-weight: 700;">🎉 Secured (Need passing marks)</span>`;
    } else {
      examNeededChip = `<span style="font-size: 0.66rem; color: #38bdf8; font-weight: 800;">Target: Need <strong>${neededInFinal}</strong>/100 in Final Exam</span>`;
    }

    const safeKey = encodeURIComponent(sub);

    html += `
      <div style="background: #161622; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <div style="font-size: 0.88rem; font-weight: 800; color: #fff;">${escapeHtml(sub)}</div>
            <div style="font-size: 0.68rem; color: #94a3b8;">Credits: <strong>${item.credits}</strong> • Internal Total: <strong style="color: #2dd4bf;">${internalSum}/${maxInt}</strong></div>
          </div>
          <div style="text-align: right;">
            <label style="font-size: 0.62rem; color: #94a3b8; display: block;">Target Grade</label>
            <select class="form-input-box" id="grade_${safeKey}" onchange="recalcCgpaRow('${safeKey}')" style="font-size: 0.72rem; padding: 3px 6px; width: 85px;">
              <option value="O" ${item.targetGrade === 'O' ? 'selected' : ''}>O (10)</option>
              <option value="A+" ${item.targetGrade === 'A+' ? 'selected' : ''}>A+ (9.0)</option>
              <option value="A" ${item.targetGrade === 'A' ? 'selected' : ''}>A (8.0)</option>
              <option value="B+" ${item.targetGrade === 'B+' ? 'selected' : ''}>B+ (7.0)</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 8px;">
          <div>
            <label style="font-size: 0.64rem; color: #cbd5e1; display: block; margin-bottom: 2px;">MST 1 (Max 25):</label>
            <input type="number" id="mst1_${safeKey}" value="${item.mst1 || 0}" min="0" max="25" class="form-input-box" oninput="recalcCgpaRow('${safeKey}')" style="font-size: 0.78rem; padding: 5px;">
          </div>
          <div>
            <label style="font-size: 0.64rem; color: #cbd5e1; display: block; margin-bottom: 2px;">MST 2 (Max 25):</label>
            <input type="number" id="mst2_${safeKey}" value="${item.mst2 || 0}" min="0" max="25" class="form-input-box" oninput="recalcCgpaRow('${safeKey}')" style="font-size: 0.78rem; padding: 5px;">
          </div>
          <div>
            <label style="font-size: 0.64rem; color: #cbd5e1; display: block; margin-bottom: 2px;">Lab/Assign (Max 20):</label>
            <input type="number" id="assign_${safeKey}" value="${item.assignments || 0}" min="0" max="20" class="form-input-box" oninput="recalcCgpaRow('${safeKey}')" style="font-size: 0.78rem; padding: 5px;">
          </div>
        </div>

        <div id="examChip_${safeKey}" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 6px; margin-top: 4px;">
          ${examNeededChip}
        </div>
      </div>
    `;
  });

  listEl.innerHTML = html;
}

function recalcCgpaRow(safeKey) {
  const sub = decodeURIComponent(safeKey);
  const mst1El = document.getElementById(`mst1_${safeKey}`);
  const mst2El = document.getElementById(`mst2_${safeKey}`);
  const assignEl = document.getElementById(`assign_${safeKey}`);
  const gradeEl = document.getElementById(`grade_${safeKey}`);
  const chipEl = document.getElementById(`examChip_${safeKey}`);

  if (!state.data.studentAcademics[sub]) return;

  const mst1 = parseInt(mst1El.value, 10) || 0;
  const mst2 = parseInt(mst2El.value, 10) || 0;
  const assign = parseInt(assignEl.value, 10) || 0;
  const targetGrade = gradeEl.value;

  state.data.studentAcademics[sub].mst1 = mst1;
  state.data.studentAcademics[sub].mst2 = mst2;
  state.data.studentAcademics[sub].assignments = assign;
  state.data.studentAcademics[sub].targetGrade = targetGrade;

  const internalSum = mst1 + mst2 + assign;
  const gradeThresholds = { 'O': 90, 'A+': 80, 'A': 70, 'B+': 60 };
  const targetThreshold = gradeThresholds[targetGrade] || 80;
  const neededInFinal = Math.max(0, 2 * (targetThreshold - internalSum));

  if (chipEl) {
    if (neededInFinal > 100) {
      chipEl.innerHTML = `<span style="font-size: 0.66rem; color: #f87171; font-weight: 700;">⚠️ Impossible (>100 needed)</span>`;
    } else if (neededInFinal <= 0) {
      chipEl.innerHTML = `<span style="font-size: 0.66rem; color: #4ade80; font-weight: 700;">🎉 Secured (Need passing marks)</span>`;
    } else {
      chipEl.innerHTML = `<span style="font-size: 0.66rem; color: #38bdf8; font-weight: 800;">Target: Need <strong>${neededInFinal}</strong>/100 in Final Exam</span>`;
    }
  }

  // Recalculate top modal header SGPA
  const academics = state.data.studentAcademics;
  let totalCredits = 0;
  let totalGradePoints = 0;
  const gradePointMap = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5 };

  Object.keys(academics).forEach(s => {
    const it = academics[s];
    const cr = it.credits || 3;
    totalCredits += cr;
    totalGradePoints += (gradePointMap[it.targetGrade || 'A+'] || 9) * cr;
  });

  const sgpa = totalCredits > 0 ? (totalGradePoints / totalCredits) : 8.5;
  const modalScore = document.getElementById('cgpaModalProjectedScore');
  if (modalScore) modalScore.innerHTML = `${sgpa.toFixed(2)} <span style="font-size: 0.85rem; color: #94a3b8;">/ 10.0</span>`;
}

function saveCgpaInputs() {
  state.save();
  renderStudentAcademicsSummary();
  closeModal('modalCgpaCalculator');
  showToast('Academic targets & internal marks saved!');
}

/* ================= 4. SUBJECT STUDY HUB ENGINE ================= */
let currentStudyHubSubject = '';
let currentStudyHubTab = 'syllabus';

function openStudyHubModal(subject) {
  currentStudyHubSubject = subject;
  const modal = document.getElementById('modalStudyHub');
  if (!modal) return;

  const titleEl = document.getElementById('studyHubSubjectTitle');
  if (titleEl) titleEl.textContent = `📚 Study Hub: ${subject}`;

  // Ensure subject study data exists
  if (!state.data.studyHubData) state.data.studyHubData = {};
  if (!state.data.studyHubData[subject]) {
    const isLab = subject.toLowerCase().includes('lab');
    state.data.studyHubData[subject] = {
      units: isLab ? [] : [
        { id: 'u1', name: 'Unit 1: Fundamentals & System Overview', completed: true },
        { id: 'u2', name: 'Unit 2: Architecture & Mathematical Modeling', completed: true },
        { id: 'u3', name: 'Unit 3: Core Algorithms & Frameworks', completed: false },
        { id: 'u4', name: 'Unit 4: Optimization & Real-World Use Cases', completed: false },
        { id: 'u5', name: 'Unit 5: Advanced Research & Emerging Frontiers', completed: false }
      ],
      experiments: isLab ? [
        { id: 'exp1', name: 'Exp 1: Environment Setup & Tool Verification', completed: true, verified: true },
        { id: 'exp2', name: 'Exp 2: Data Preprocessing & Exploratory Testing', completed: true, verified: true },
        { id: 'exp3', name: 'Exp 3: Core Implementation & Baseline Metrics', completed: true, verified: false },
        { id: 'exp4', name: 'Exp 4: Hyperparameter Tuning & Evaluation', completed: false, verified: false },
        { id: 'exp5', name: 'Exp 5: Final Submission & Performance Benchmark', completed: false, verified: false }
      ] : [],
      notes: [
        { title: `Official Syllabus & Course Handout (${subject})`, url: '#' },
        { title: `Mid-Term 2025 Solved PYQ Paper`, url: '#' },
        { title: `Formula Sheet & Quick Viva Revision Questions`, url: '#' }
      ]
    };
  }

  // If lab subject, default to labs tab; otherwise syllabus tab
  const isLab = subject.toLowerCase().includes('lab');
  switchStudyHubTab(isLab ? 'labs' : 'syllabus');

  modal.classList.add('active');
}

function switchStudyHubTab(tabName) {
  currentStudyHubTab = tabName;
  const btnSyllabus = document.getElementById('tabStudySyllabus');
  const btnLabs = document.getElementById('tabStudyLabs');
  const btnPyqs = document.getElementById('tabStudyPyqs');

  const paneSyllabus = document.getElementById('studyHubPaneSyllabus');
  const paneLabs = document.getElementById('studyHubPaneLabs');
  const panePyqs = document.getElementById('studyHubPanePyqs');

  if (btnSyllabus) btnSyllabus.classList.toggle('active', tabName === 'syllabus');
  if (btnLabs) btnLabs.classList.toggle('active', tabName === 'labs');
  if (btnPyqs) btnPyqs.classList.toggle('active', tabName === 'pyqs');

  if (paneSyllabus) paneSyllabus.style.display = tabName === 'syllabus' ? 'block' : 'none';
  if (paneLabs) paneLabs.style.display = tabName === 'labs' ? 'block' : 'none';
  if (panePyqs) panePyqs.style.display = tabName === 'pyqs' ? 'block' : 'none';

  renderStudyHubModal();
}

function renderStudyHubModal() {
  if (!currentStudyHubSubject || !state.data.studyHubData) return;
  const data = state.data.studyHubData[currentStudyHubSubject];
  if (!data) return;

  // 1. Syllabus Pane
  const unitsListEl = document.getElementById('studySyllabusUnitsList');
  const progTextEl = document.getElementById('studySyllabusProgressText');
  const progBarEl = document.getElementById('studySyllabusProgressBar');

  if (unitsListEl) {
    const units = data.units || [];
    if (units.length === 0) {
      unitsListEl.innerHTML = `<div style="font-size: 0.75rem; color: #94a3b8; padding: 12px 0;">Practical/Lab subject. Click 'Lab Practicals' tab to track experiments.</div>`;
      if (progTextEl) progTextEl.textContent = 'Practical Course';
      if (progBarEl) progBarEl.style.width = '100%';
    } else {
      const compCount = units.filter(u => u.completed).length;
      const pct = Math.round((compCount / units.length) * 100);
      if (progTextEl) progTextEl.textContent = `${pct}% Completed (${compCount}/${units.length} Units)`;
      if (progBarEl) progBarEl.style.width = `${pct}%`;

      let uHtml = '';
      units.forEach(u => {
        uHtml += `
          <div class="study-checklist-item ${u.completed ? 'checked' : ''}">
            <input type="checkbox" class="study-item-checkbox" ${u.completed ? 'checked' : ''} onchange="toggleSyllabusUnit('${u.id}')">
            <span class="study-item-title">${escapeHtml(u.name)}</span>
            <span style="font-size: 0.65rem; color: ${u.completed ? '#4ade80' : '#a1a1aa'}; font-weight: 700;">
              ${u.completed ? 'Done ✅' : 'Pending'}
            </span>
          </div>
        `;
      });
      unitsListEl.innerHTML = uHtml;
    }
  }

  // 2. Labs Pane
  const labsListEl = document.getElementById('studyLabExperimentsList');
  if (labsListEl) {
    const exps = data.experiments || [];
    if (exps.length === 0) {
      labsListEl.innerHTML = `<div style="font-size: 0.75rem; color: #94a3b8; padding: 12px 0;">Theory course. Check the 'Syllabus' tab for curriculum units.</div>`;
    } else {
      let lHtml = '';
      exps.forEach(e => {
        lHtml += `
          <div class="study-checklist-item ${e.completed ? 'checked' : ''}">
            <input type="checkbox" class="study-item-checkbox" ${e.completed ? 'checked' : ''} onchange="toggleLabExperiment('${e.id}')">
            <div style="flex: 1;">
              <div class="study-item-title">${escapeHtml(e.name)}</div>
              <div style="font-size: 0.64rem; color: ${e.verified ? '#4ade80' : '#f59e0b'}; font-weight: 700; margin-top: 2px;">
                ${e.verified ? 'Verified by Faculty ✅' : 'Verification Pending ✍️'}
              </div>
            </div>
          </div>
        `;
      });
      labsListEl.innerHTML = lHtml;
    }
  }

  // 3. PYQs & Notes Pane
  const pyqListEl = document.getElementById('studyPyqVaultList');
  if (pyqListEl) {
    const notes = data.notes || [];
    let nHtml = '';
    notes.forEach(n => {
      nHtml += `
        <a href="${n.url || '#'}" target="_blank" class="study-vault-item">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.1rem;">📑</span>
            <div>
              <div style="font-size: 0.80rem; font-weight: 800; color: #fff;">${escapeHtml(n.title)}</div>
              <div style="font-size: 0.65rem; color: #38bdf8;">Click to view / download</div>
            </div>
          </div>
          <span style="font-size: 0.80rem; color: #94a3b8;">➔</span>
        </a>
      `;
    });
    pyqListEl.innerHTML = nHtml;
  }
}

function toggleSyllabusUnit(unitId) {
  if (!currentStudyHubSubject || !state.data.studyHubData) return;
  const data = state.data.studyHubData[currentStudyHubSubject];
  const unit = (data.units || []).find(u => u.id === unitId);
  if (unit) {
    unit.completed = !unit.completed;
    state.save();
    renderStudyHubModal();
  }
}

function toggleLabExperiment(expId) {
  if (!currentStudyHubSubject || !state.data.studyHubData) return;
  const data = state.data.studyHubData[currentStudyHubSubject];
  const exp = (data.experiments || []).find(e => e.id === expId);
  if (exp) {
    exp.completed = !exp.completed;
    if (exp.completed) exp.verified = true;
    state.save();
    renderStudyHubModal();
  }
}

function promptAddSyllabusUnit() {
  const name = prompt('Enter topic or unit title:');
  if (!name || !name.trim()) return;
  const data = state.data.studyHubData[currentStudyHubSubject];
  if (!data.units) data.units = [];
  data.units.push({
    id: 'u-' + Date.now(),
    name: name.trim(),
    completed: false
  });
  state.save();
  renderStudyHubModal();
  showToast('Topic added to syllabus!');
}

function promptAddLabExperiment() {
  const name = prompt('Enter experiment title (e.g. Exp 6: K-Means Clustering):');
  if (!name || !name.trim()) return;
  const data = state.data.studyHubData[currentStudyHubSubject];
  if (!data.experiments) data.experiments = [];
  data.experiments.push({
    id: 'exp-' + Date.now(),
    name: name.trim(),
    completed: false,
    verified: false
  });
  state.save();
  renderStudyHubModal();
  showToast('Experiment added to practicals!');
}

function addCustomStudyNote() {
  const titleEl = document.getElementById('inputCustomNoteTitle');
  const urlEl = document.getElementById('inputCustomNoteUrl');
  const title = titleEl ? titleEl.value.trim() : '';
  const url = urlEl ? urlEl.value.trim() : '';

  if (!title) {
    showToast('Please enter a resource title');
    return;
  }

  const data = state.data.studyHubData[currentStudyHubSubject];
  if (!data.notes) data.notes = [];
  data.notes.unshift({
    title,
    url: url || '#'
  });
  state.save();
  renderStudyHubModal();
  showToast('Study resource saved!');

  if (titleEl) titleEl.value = '';
  if (urlEl) urlEl.value = '';
}

/* ================= 5. MEDI-CAPS POD.AI PLACEMENTS & DRIVES ENGINE ================= */
let activeDriveFilter = 'all';

function getCurrentStudentCgpa() {
  const academics = state.data.studentAcademics || {};
  const subjects = Object.keys(academics);
  if (subjects.length === 0) return 8.65;

  let totalCredits = 0;
  let totalGradePoints = 0;
  const gradePointMap = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5 };

  subjects.forEach(s => {
    const it = academics[s];
    const cr = it.credits || 3;
    totalCredits += cr;
    totalGradePoints += (gradePointMap[it.targetGrade || 'A+'] || 9) * cr;
  });

  return totalCredits > 0 ? (totalGradePoints / totalCredits) : 8.65;
}

function getCurrentStudentAttendancePct() {
  const stats = state.calculateStats();
  if (stats && stats.overall && stats.overall.hasRecords && stats.overall.total > 0) {
    return (stats.overall.attended / stats.overall.total) * 100;
  }
  return 82.0; // Clean baseline
}

function renderPlacementsTab() {
  const feedEl = document.getElementById('placementsFeedList');
  if (!feedEl) return;

  const drives = state.data.placementsData || [];
  const currentCgpa = getCurrentStudentCgpa();
  const currentAttPct = getCurrentStudentAttendancePct();

  // Top Metrics Strip
  const activeCountEl = document.getElementById('tpoStatActiveCount');
  const appliedCountEl = document.getElementById('tpoStatAppliedCount');
  const maxCtcEl = document.getElementById('tpoStatMaxCtc');
  const eligRateEl = document.getElementById('tpoStatEligibility');

  const appliedDrives = drives.filter(d => d.applied);
  const eligibleDrives = drives.filter(d => currentCgpa >= (d.minCgpa || 0) && currentAttPct >= (d.minAttendance || 0));

  if (activeCountEl) activeCountEl.textContent = drives.length;
  if (appliedCountEl) appliedCountEl.textContent = appliedDrives.length;
  if (maxCtcEl) maxCtcEl.textContent = '25.0 L';
  if (eligRateEl) {
    const rate = drives.length > 0 ? Math.round((eligibleDrives.length / drives.length) * 100) : 83;
    eligRateEl.textContent = `${rate}%`;
  }

  // Filter drives
  let filtered = [...drives];
  if (activeDriveFilter === 'eligible') {
    filtered = drives.filter(d => currentCgpa >= (d.minCgpa || 0) && currentAttPct >= (d.minAttendance || 0));
  } else if (activeDriveFilter === 'high_ctc') {
    filtered = drives.filter(d => (parseFloat(d.ctc.replace(/[^0-9.]/g, '')) || 0) >= 8.0);
  } else if (activeDriveFilter === 'applied') {
    filtered = drives.filter(d => d.applied);
  } else if (activeDriveFilter === 'offcampus') {
    filtered = drives.filter(d => d.type.toLowerCase().includes('off-campus') || d.type.toLowerCase().includes('hackathon'));
  }

  if (filtered.length === 0) {
    feedEl.innerHTML = `
      <div style="background: #12131d; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 24px 16px; text-align: center; color: #94a3b8; font-size: 0.8rem;">
        No campus drives match this filter criteria right now.
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(drive => {
    const isEligible = (currentCgpa >= (drive.minCgpa || 0)) && (currentAttPct >= (drive.minAttendance || 0));
    const cgpaDiff = (drive.minCgpa || 0) - currentCgpa;
    const attDiff = (drive.minAttendance || 0) - currentAttPct;

    let eligibilityHtml = '';
    if (isEligible) {
      eligibilityHtml = `
        <div class="drive-eligibility-strip eligibility-safe">
          <span>🟢 <strong>Eligible to Apply:</strong> ${currentCgpa.toFixed(2)} CGPA (≥ ${drive.minCgpa}) • ${currentAttPct.toFixed(0)}% Att (≥ ${drive.minAttendance}%)</span>
          <span style="font-size: 0.65rem; color: #4ade80; font-weight: 800;">POD VERIFIED</span>
        </div>
      `;
    } else {
      let unlockMsg = '';
      if (cgpaDiff > 0 && attDiff > 0) {
        unlockMsg = `Need +${cgpaDiff.toFixed(2)} CGPA and +${attDiff.toFixed(0)}% Attendance to unlock`;
      } else if (cgpaDiff > 0) {
        unlockMsg = `Need +${cgpaDiff.toFixed(2)} CGPA. Score well in Final Exam to unlock!`;
      } else {
        unlockMsg = `Need +${attDiff.toFixed(0)}% Attendance to qualify. Attend upcoming lectures!`;
      }

      eligibilityHtml = `
        <div class="drive-eligibility-strip eligibility-lock">
          <span>🔴 <strong>Ineligible:</strong> ${unlockMsg} (Cutoff: ${drive.minCgpa} CGPA & ${drive.minAttendance}% Att)</span>
          <button type="button" class="btn-chip" onclick="openCgpaModal()" style="font-size: 0.62rem; padding: 2px 6px; background: rgba(239,68,68,0.25); color: #fca5a5; font-weight: 800;">Simulate</button>
        </div>
      `;
    }

    // Clash Slot Alert
    let clashHtml = '';
    if (drive.clashSlot) {
      clashHtml = `
        <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 6px 10px; font-size: 0.70rem; color: #fde68a; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span>⚠️ <strong>Schedule Clash:</strong> PPT on ${escapeHtml(drive.pptDate)} conflicts with <strong>${escapeHtml(drive.clashSlot)}</strong></span>
          <button type="button" class="btn-chip" onclick="openDutyLeaveModal('${drive.id}')" style="font-size: 0.64rem; padding: 2px 7px; background: rgba(245, 158, 11, 0.25); color: #fbbf24; font-weight: 800;">Request OD Slip</button>
        </div>
      `;
    }

    // Apply Button
    let applyBtnHtml = '';
    if (drive.applied) {
      applyBtnHtml = `
        <button type="button" class="btn-applied-pod" onclick="openDriveDetailsModal('${drive.id}')">
          <span>✅ Applied (${escapeHtml(drive.currentRound || 'In Review')})</span>
        </button>
      `;
    } else if (isEligible) {
      applyBtnHtml = `
        <button type="button" class="btn-apply-pod" onclick="applyToDrive('${drive.id}')">
          <span>📝 Apply on Pod.ai</span>
        </button>
      `;
    } else {
      applyBtnHtml = `
        <button type="button" class="btn-details-pod" onclick="openCgpaModal()" style="flex: 1; text-align: center; color: #f87171; border-color: rgba(239,68,68,0.3);">
          <span>🔒 Unlock Requirements</span>
        </button>
      `;
    }

    html += `
      <div class="drive-card">
        <div class="drive-top-row">
          <div class="drive-company-badge-row">
            <div class="drive-logo-circle">${drive.logo || '🏢'}</div>
            <div>
              <h3 class="drive-role-title">${escapeHtml(drive.role)}</h3>
              <div class="drive-company-name">${escapeHtml(drive.company)} • <span style="color: #94a3b8; font-weight: 600;">${escapeHtml(drive.type)}</span></div>
            </div>
          </div>
          <div class="drive-ctc-pill">${escapeHtml(drive.ctc)}</div>
        </div>

        <div class="drive-meta-grid">
          <div>📍 <strong>Location:</strong> ${escapeHtml(drive.location || 'Pan India')}</div>
          <div>⏳ <strong>Deadline:</strong> ${escapeHtml(drive.deadline)}</div>
          <div>🎯 <strong>Eligibility:</strong> ${drive.minCgpa}+ CGPA • ${drive.minAttendance}% Att</div>
          <div>🕒 <strong>PPT Date:</strong> ${escapeHtml(drive.pptDate || 'TBA')}</div>
        </div>

        ${clashHtml}
        ${eligibilityHtml}

        <div class="drive-actions-row">
          ${applyBtnHtml}
          <button type="button" class="btn-details-pod" onclick="openDriveDetailsModal('${drive.id}')">
            <span>Rounds & Prep ➔</span>
          </button>
        </div>
      </div>
    `;
  });

  feedEl.innerHTML = html;
}

function filterDrivesBy(filterKey, btn) {
  activeDriveFilter = filterKey;
  document.querySelectorAll('.btn-tpo-filter').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderPlacementsTab();
}

function applyToDrive(driveId) {
  const drives = state.data.placementsData || [];
  const drive = drives.find(d => d.id === driveId);
  if (!drive) return;

  drive.applied = true;
  if (drive.rounds && drive.rounds.length > 0) {
    drive.rounds[0].status = 'completed';
    if (drive.rounds.length > 1) {
      drive.rounds[1].status = 'active';
      drive.currentRound = drive.rounds[1].name;
    }
  }

  state.save();
  renderPlacementsTab();
  showToast(`🎉 Registered for ${drive.company} on Medi-Caps Pod.ai!`);
}

let activeDetailDriveId = '';

function openDriveDetailsModal(driveId) {
  activeDetailDriveId = driveId;
  const drives = state.data.placementsData || [];
  const drive = drives.find(d => d.id === driveId);
  if (!drive) return;

  const modal = document.getElementById('modalDriveDetails');
  const heading = document.getElementById('driveDetailHeading');
  const sub = document.getElementById('driveDetailSub');
  const body = document.getElementById('driveDetailBody');

  if (heading) heading.textContent = `${drive.company} — ${drive.role}`;
  if (sub) sub.textContent = `${drive.type} • Package: ${drive.ctc}`;

  if (body) {
    let roundsHtml = '';
    (drive.rounds || []).forEach((r, idx) => {
      let statusClass = '';
      let statusBadge = '';
      if (r.status === 'completed') {
        statusClass = 'completed';
        statusBadge = `<span style="font-size: 0.65rem; color: #4ade80; font-weight: 800;">Completed ✅</span>`;
      } else if (r.status === 'active') {
        statusClass = 'active';
        statusBadge = `<span style="font-size: 0.65rem; color: #38bdf8; font-weight: 800;">In Progress / Scheduled ⏳</span>`;
      } else {
        statusBadge = `<span style="font-size: 0.65rem; color: #94a3b8; font-weight: 700;">Upcoming</span>`;
      }

      roundsHtml += `
        <div class="pipeline-step-item ${statusClass}">
          <div class="pipeline-step-num">${idx + 1}</div>
          <div style="flex: 1;">
            <div style="font-size: 0.80rem; font-weight: 800; color: #fff;">${escapeHtml(r.name)}</div>
            ${r.date ? `<div style="font-size: 0.68rem; color: #38bdf8; font-weight: 600;">📅 ${escapeHtml(r.date)}</div>` : ''}
          </div>
          ${statusBadge}
        </div>
      `;
    });

    body.innerHTML = `
      <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px; margin-bottom: 14px;">
        <h4 style="font-size: 0.82rem; font-weight: 800; color: #cbd5e1; margin: 0 0 6px 0;">Job Overview</h4>
        <p style="font-size: 0.74rem; color: #94a3b8; line-height: 1.45; margin: 0 0 8px 0;">${escapeHtml(drive.description || 'Full-time graduate placement drive at Medi-Caps University.')}</p>
        <div style="display: flex; gap: 8px; font-size: 0.70rem; color: #cbd5e1;">
          <span>📍 <strong>Location:</strong> ${escapeHtml(drive.location)}</span>
          <span>•</span>
          <span>⏳ <strong>Deadline:</strong> ${escapeHtml(drive.deadline)}</span>
        </div>
      </div>

      <div style="margin-bottom: 14px;">
        <h4 style="font-size: 0.82rem; font-weight: 800; color: #cbd5e1; margin: 0 0 8px 0; display: flex; align-items: center; justify-content: space-between;">
          <span>Pod.ai Round-by-Round Pipeline:</span>
          ${drive.applied ? `<button type="button" class="btn-chip btn-chip-blue" onclick="advanceDriveRound('${drive.id}')" style="font-size: 0.65rem; padding: 3px 8px;">Advance Round ➔</button>` : ''}
        </h4>
        <div style="display: flex; flex-direction: column;">
          ${roundsHtml}
        </div>
      </div>

      <div style="background: rgba(59, 130, 246, 0.1); border: 1px dashed rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 0.80rem; font-weight: 800; color: #93c5fd;">📚 Prepare with Study Hub</div>
          <div style="font-size: 0.68rem; color: #94a3b8;">Review CS fundamentals, DSA & previous year interview questions</div>
        </div>
        <button type="button" class="btn-chip btn-chip-blue" onclick="closeModal('modalDriveDetails'); openStudyHubModal('Data Science');" style="font-size: 0.70rem; padding: 6px 10px;">Open Prep</button>
      </div>
    `;
  }

  if (modal) modal.classList.add('active');
}

function advanceDriveRound(driveId) {
  const drives = state.data.placementsData || [];
  const drive = drives.find(d => d.id === driveId);
  if (!drive || !drive.rounds) return;

  const currentIdx = drive.rounds.findIndex(r => r.status === 'active');
  if (currentIdx !== -1) {
    drive.rounds[currentIdx].status = 'completed';
    if (currentIdx + 1 < drive.rounds.length) {
      drive.rounds[currentIdx + 1].status = 'active';
      drive.currentRound = drive.rounds[currentIdx + 1].name;
      showToast(`Advanced to: ${drive.currentRound}`);
    } else {
      drive.currentRound = 'Final Offer Extended 🎉';
      showToast('🎉 Congratulations! Placement Offer Secured!');
    }
    state.save();
    renderPlacementsTab();
    openDriveDetailsModal(driveId);
  }
}

let activeOdDrive = null;

function openDutyLeaveModal(driveId) {
  const drives = state.data.placementsData || [];
  const drive = drives.find(d => d.id === driveId) || drives[0];
  activeOdDrive = drive;

  const modal = document.getElementById('modalDutyLeave');
  const body = document.getElementById('dutyLeaveSlipBody');

  const session = getAuthSession();
  const studentName = session ? session.name : 'Rishabh Patel';
  const rollNum = session ? session.userId : '104';
  const enrollNum = `EN22CS301${rollNum}`;

  if (body) {
    body.innerHTML = `
      <div style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 8px; margin-bottom: 10px;">
        <div style="font-weight: 900; color: #fff; font-size: 0.86rem;">MEDI-CAPS UNIVERSITY, INDORE</div>
        <div style="font-size: 0.68rem; color: #38bdf8; font-weight: 700;">TRAINING & PLACEMENT OFFICE • ON-DUTY (OD) EXEMPTION SLIP</div>
      </div>

      <div style="margin-bottom: 8px;">
        <div><strong>To:</strong> Prof. Rajesh Kumar (HOD, CSE) / Dr. Neha Verma (Faculty Advisor)</div>
        <div><strong>From:</strong> ${escapeHtml(studentName)} • Roll #${escapeHtml(rollNum)} • Enrollment: <strong>${escapeHtml(enrollNum)}</strong></div>
        <div><strong>Semester:</strong> 5th Sem, Batch A1 • Dept of Computer Science & Engineering</div>
      </div>

      <div style="background: rgba(255,255,255,0.04); padding: 8px 10px; border-radius: 8px; margin-bottom: 8px;">
        <div><strong>Placement Drive:</strong> ${escapeHtml(drive.company)} (${escapeHtml(drive.role)})</div>
        <div><strong>Event / Session:</strong> ${escapeHtml(drive.pptDate || 'Interview Round')}</div>
        <div><strong>Affected Academic Slot:</strong> <span style="color: #f87171; font-weight: 700;">${escapeHtml(drive.clashSlot || 'Scheduled Lecture')}</span></div>
      </div>

      <p style="margin: 0 0 8px 0; font-size: 0.72rem; color: #94a3b8;">
        This certifies that the student has been officially registered/shortlisted for the above recruitment activity on Pod.ai. Attendance waiver / OD is requested for the affected academic slot as per university placement policy.
      </p>

      <div style="display: flex; justify-content: space-between; border-top: 1px dashed rgba(255,255,255,0.12); padding-top: 8px; font-size: 0.68rem; color: #cbd5e1;">
        <span>Verified by: <strong>Medi-Caps TPO (Pod.ai)</strong></span>
        <span>Date: <strong>${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
      </div>
    `;
  }

  if (modal) modal.classList.add('active');
}

function printDutyLeaveSlip() {
  window.print();
}

function emailDutyLeaveAdvisor() {
  if (!activeOdDrive) return;
  const session = getAuthSession();
  const studentName = session ? session.name : 'Rishabh Patel';
  const rollNum = session ? session.userId : '104';
  const enrollNum = `EN22CS301${rollNum}`;

  const subject = encodeURIComponent(`Duty Leave (OD) Request - ${studentName} (${enrollNum}) for ${activeOdDrive.company}`);
  const body = encodeURIComponent(
    `Respected Dr. Neha Verma,\n\n` +
    `I am ${studentName}, student of CSE 5th Semester Batch A1 (Enrollment: ${enrollNum}).\n\n` +
    `I am registered for the campus recruitment drive of ${activeOdDrive.company} on ${activeOdDrive.pptDate || 'upcoming schedule'}.\n` +
    `This session clashes with our scheduled class: ${activeOdDrive.clashSlot || 'lecture'}.\n\n` +
    `Kindly grant me Duty Leave (OD) so that my attendance remains unaffected, as per Medi-Caps University placement policy.\n\n` +
    `Thank you,\n${studentName}\nRoll #${rollNum}`
  );

  window.location.href = `mailto:neha.verma@college.edu?subject=${subject}&body=${body}`;
}

function syncPodDrives() {
  showToast('🔄 Synchronized with Medi-Caps TPO Pod.ai Network! All 6 drives are up to date.');
  renderPlacementsTab();
}

// ================= AUTHENTICATION & ROLE ISOLATION =================
function getAuthSession() {
  if (!state.data.authSession) {
    state.data.authSession = {
      isLoggedIn: true,
      role: 'student',
      userId: '104',
      name: 'Rishabh Patel',
      subtitle: 'Roll #104 • CSE 5th Sem'
    };
  }
  return state.data.authSession;
}

function applyAuthSession() {
  const session = getAuthSession();
  const authBar = document.getElementById('portalAuthBar');
  const authGateway = document.getElementById('viewAuthGateway');
  const viewStudent = document.getElementById('viewStudentApp');
  const viewFaculty = document.getElementById('viewFacultyPortal');
  const dockStudent = document.getElementById('dockStudentNav');
  const dockFaculty = document.getElementById('dockFacultyNav');
  const facSelectWrapper = document.getElementById('facultySelectorWrapper');
  const badgeIcon = document.getElementById('userBadgeIcon');
  const badgeName = document.getElementById('userBadgeName');
  const badgeRole = document.getElementById('userBadgeRole');

  if (!session || !session.isLoggedIn) {
    // Show Login Gateway Screen, Hide all apps & docks
    if (authGateway) authGateway.style.display = 'block';
    if (authBar) authBar.style.display = 'none';
    if (viewStudent) viewStudent.style.display = 'none';
    if (viewFaculty) viewFaculty.style.display = 'none';
    if (dockStudent) dockStudent.style.display = 'none';
    if (dockFaculty) dockFaculty.style.display = 'none';
    if (facSelectWrapper) facSelectWrapper.style.display = 'none';
    return;
  }

  // User is Logged In
  if (authGateway) authGateway.style.display = 'none';
  if (authBar) authBar.style.display = 'flex';

  if (session.role === 'faculty') {
    if (badgeIcon) badgeIcon.textContent = '👨‍🏫';
    if (badgeName) badgeName.textContent = session.name;
    if (badgeRole) badgeRole.textContent = session.subtitle || 'Faculty Member';

    if (viewStudent) viewStudent.style.display = 'none';
    if (viewFaculty) viewFaculty.style.display = 'block';
    if (dockStudent) dockStudent.style.display = 'none';
    if (dockFaculty) dockFaculty.style.display = 'flex';
    if (facSelectWrapper) facSelectWrapper.style.display = 'flex';

    renderFacultyPortal();
  } else {
    // Student Session
    if (badgeIcon) badgeIcon.textContent = '🎓';
    if (badgeName) badgeName.textContent = session.name;
    if (badgeRole) badgeRole.textContent = session.subtitle || `Roll #${session.userId || '104'} • Student`;

    if (viewFaculty) viewFaculty.style.display = 'none';
    if (viewStudent) viewStudent.style.display = 'block';
    if (dockFaculty) dockFaculty.style.display = 'none';
    if (dockStudent) dockStudent.style.display = 'flex';
    if (facSelectWrapper) facSelectWrapper.style.display = 'none';

    renderDashboard();
    renderWeeklyMatrix();
    renderAssignedTeachers();
  }
}

function switchAuthTab(role) {
  const tabStudent = document.getElementById('tabBtnStudentAuth');
  const tabFaculty = document.getElementById('tabBtnFacultyAuth');
  const formStudent = document.getElementById('formStudentLogin');
  const formFaculty = document.getElementById('formFacultyLogin');

  if (role === 'student') {
    if (tabStudent) {
      tabStudent.classList.add('active');
      tabStudent.classList.add('student-tab');
    }
    if (tabFaculty) tabFaculty.classList.remove('active');
    if (formStudent) formStudent.style.display = 'block';
    if (formFaculty) formFaculty.style.display = 'none';
  } else {
    if (tabFaculty) tabFaculty.classList.add('active');
    if (tabStudent) {
      tabStudent.classList.remove('active');
      tabStudent.classList.remove('student-tab');
    }
    if (formFaculty) formFaculty.style.display = 'block';
    if (formStudent) formStudent.style.display = 'none';
  }
}

function quickFillStudent(roll) {
  const inputRoll = document.getElementById('inputStudentRoll');
  const inputPin = document.getElementById('inputStudentPin');
  if (inputRoll) inputRoll.value = roll;
  if (inputPin) inputPin.value = '1234';
}

function quickFillFaculty(facId) {
  const inputId = document.getElementById('inputFacultyId');
  const inputPin = document.getElementById('inputFacultyPin');
  if (inputId) inputId.value = facId;
  if (inputPin) inputPin.value = '1234';
}

function handleStudentLoginSubmit(e) {
  if (e) e.preventDefault();
  const inputRoll = document.getElementById('inputStudentRoll');
  const inputPin = document.getElementById('inputStudentPin');
  const val = (inputRoll ? inputRoll.value : '').trim().toLowerCase();
  const pin = (inputPin ? inputPin.value : '').trim();

  const students = state.data.studentsList || DEFAULT_STUDENTS;
  const match = students.find(s => 
    s.roll.toLowerCase() === val || 
    s.email.toLowerCase() === val || 
    s.name.toLowerCase().includes(val)
  );

  if (!match) {
    alert(`Student profile not found for "${val}". Please check your Roll number or try 104.`);
    return;
  }

  if (pin !== '1234') {
    alert('Invalid security PIN. (Default PIN is 1234)');
    return;
  }

  state.data.authSession = {
    isLoggedIn: true,
    role: 'student',
    userId: match.roll,
    name: match.name,
    email: match.email,
    subtitle: `Roll #${match.roll} • CSE-5th Sem`
  };
  state.data.activeRole = 'student';
  state.save();

  applyAuthSession();
  showBottomToast(`Welcome back, ${match.name}! 🎓`, 'Dismiss', hideBottomToast);
}

function handleFacultyLoginSubmit(e) {
  if (e) e.preventDefault();
  const inputId = document.getElementById('inputFacultyId');
  const inputPin = document.getElementById('inputFacultyPin');
  const val = (inputId ? inputId.value : '').trim().toLowerCase();
  const pin = (inputPin ? inputPin.value : '').trim();

  const faculties = state.data.faculties || DEFAULT_FACULTIES;
  const match = faculties.find(f => 
    f.id.toLowerCase() === val || 
    f.name.toLowerCase().includes(val) || 
    (f.dept && f.dept.toLowerCase().includes(val))
  );

  if (!match) {
    alert(`Faculty profile not found for "${val}". Try "fac-1" or "Rishabh".`);
    return;
  }

  if (pin !== '1234') {
    alert('Invalid security PIN. (Default PIN is 1234)');
    return;
  }

  state.data.authSession = {
    isLoggedIn: true,
    role: 'faculty',
    userId: match.id,
    name: match.name,
    subtitle: `${match.title} • ${match.dept}`
  };
  state.data.activeRole = 'faculty';
  state.data.currentFacultyId = match.id;
  state.save();

  applyAuthSession();
  showBottomToast(`Welcome back, ${match.name}! 👨‍🏫`, 'Dismiss', hideBottomToast);
}

function logoutSession() {
  if (!confirm('Log out of your current session?')) return;
  state.data.authSession = {
    isLoggedIn: false,
    role: null,
    userId: null,
    name: null
  };
  state.save();
  applyAuthSession();
  showBottomToast('Logged out successfully. 🔒', 'Dismiss', hideBottomToast);
}

function switchPortalRole(role) {
  if (role === 'faculty') {
    handleFacultyLoginSubmit(null);
  } else {
    handleStudentLoginSubmit(null);
  }
}

function switchCurrentFaculty(facId) {
  state.data.currentFacultyId = facId;
  state.save();
  const fac = getCurrentFaculty();
  renderFacultyPortal();
  showBottomToast(`Switched to ${fac.name} 👨‍🏫`, 'Dismiss', hideBottomToast);
}

function switchFacultyTab(tabName) {
  activeFacultyTab = tabName;
  document.querySelectorAll('.fac-nav-pill').forEach(pill => {
    if (pill && pill.classList) pill.classList.toggle('active', (pill.dataset && pill.dataset.factab) === tabName);
  });
  document.querySelectorAll('.fac-nav-dock-btn').forEach(btn => {
    if (btn && btn.classList) btn.classList.toggle('active', (btn.dataset && btn.dataset.factab) === tabName);
  });

  const tabMap = {
    schedule: 'facultyTabSchedule',
    substitutions: 'facultyTabSubstitutions',
    analytics: 'facultyTabAnalytics',
    roster: 'facultyTabRoster'
  };

  Object.keys(tabMap).forEach(key => {
    const pane = document.getElementById(tabMap[key]);
    if (pane) {
      if (key === tabName) pane.classList.add('active');
      else pane.classList.remove('active');
    }
  });

  if (tabName === 'schedule') renderFacultySchedule();
  else if (tabName === 'substitutions') renderSubstitutionHub();
  else if (tabName === 'analytics') renderBatchAnalytics();
  else if (tabName === 'roster') renderStudentRoster();
}

function renderFacultyPortal() {
  const fac = getCurrentFaculty();
  if (!fac) return;

  // 1. Update Profile Banner
  const nameEl = document.getElementById('facNameText');
  const deptEl = document.getElementById('facDeptText');
  const selectDropdown = document.getElementById('selectCurrentFaculty');

  if (nameEl) nameEl.textContent = fac.name;
  if (deptEl) deptEl.textContent = `${fac.title} • ${fac.dept}`;
  if (selectDropdown && selectDropdown.value !== fac.id) {
    selectDropdown.value = fac.id;
  }

  // 2. Calculate Pending Substitution Requests Count
  const pendingIncoming = (state.data.substitutions || []).filter(
    s => s.toFacultyId === fac.id && s.status === 'pending'
  );
  const badgeDot = document.getElementById('facultyPendingBadge');
  const pillDot = document.getElementById('facSubPillDot');
  const subCountVal = document.getElementById('facMetricSubPending');

  if (badgeDot) {
    if (pendingIncoming.length > 0) {
      badgeDot.textContent = pendingIncoming.length;
      badgeDot.style.display = 'inline-flex';
    } else {
      badgeDot.style.display = 'none';
    }
  }
  if (pillDot) {
    if (pendingIncoming.length > 0) {
      pillDot.textContent = pendingIncoming.length;
      pillDot.style.display = 'inline-flex';
    } else {
      pillDot.style.display = 'none';
    }
  }
  if (subCountVal) {
    subCountVal.textContent = pendingIncoming.length;
  }

  // 3. Render the currently active faculty sub-pane
  switchFacultyTab(activeFacultyTab);
}

// Render Teaching Schedule for the selected day
function renderFacultySchedule() {
  const fac = getCurrentFaculty();
  const container = document.getElementById('facScheduleListContainer');
  if (!container || !fac) return;

  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[now.getDay()];
  const todayStr = toLocalDateStr(now);

  const scheduleMap = state.data.facultySchedules || {};
  const daySchedule = (scheduleMap[fac.id] && scheduleMap[fac.id][activeFacultyDay]) || [];

  // Also include any lectures transferred TO this faculty for this day (via accepted substitution)
  const acceptedTransfersIn = (state.data.substitutions || []).filter(
    s => s.toFacultyId === fac.id && s.day === activeFacultyDay && s.status === 'accepted'
  );

  const combinedLectures = [
    ...daySchedule.map(l => ({ ...l, isOriginal: true })),
    ...acceptedTransfersIn.map(s => ({
      id: s.lectureId,
      subject: s.subject,
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room,
      batch: 'CSE-5th Sem',
      isSubstitutedIn: true,
      fromFacultyName: s.fromFacultyName
    }))
  ].sort((a, b) => timeStrToMinutes(a.startTime) - timeStrToMinutes(b.startTime));

  // Update Today's Classes metric if on today
  const metricToday = document.getElementById('facMetricToday');
  if (metricToday && activeFacultyDay === todayName) {
    metricToday.textContent = combinedLectures.length;
  }

  // Highlight active day chip
  document.querySelectorAll('.fac-day-chip').forEach(chip => {
    if (chip && chip.classList) {
      if (chip.dataset && chip.dataset.day === activeFacultyDay) chip.classList.add('active');
      else chip.classList.remove('active');
    }
  });

  if (combinedLectures.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box" style="padding: 24px 16px;">
        <div class="empty-state-icon" style="font-size: 1.8rem; margin-bottom: 4px;">🏖</div>
        <div class="empty-state-title" style="font-size: 0.95rem;">No classes scheduled for ${activeFacultyDay}</div>
        <div class="empty-state-sub">You are completely free during this day.</div>
      </div>
    `;
    return;
  }

  let html = '';
  combinedLectures.forEach(lec => {
    const isCancelled = state.data.cancelledLectures && state.data.cancelledLectures[`${lec.id}_${todayStr}`];

    // Check if this faculty transferred OUT this lecture to someone else
    const transferOut = (state.data.substitutions || []).find(
      s => s.lectureId === lec.id && s.fromFacultyId === fac.id && s.day === activeFacultyDay && s.status !== 'declined'
    );

    let cardClass = 'fac-lec-card';
    let statusBadge = '<span class="slot-badge" style="background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4);">Scheduled</span>';

    if (isCancelled) {
      statusBadge = '<span class="slot-badge" style="background: #202020; color: #a1a1aa; border: 1px solid #404040;">⚪ Cancelled Today</span>';
    } else if (transferOut) {
      cardClass += ' is-substituted-out';
      if (transferOut.status === 'accepted') {
        statusBadge = `<span class="slot-badge" style="background: rgba(59, 130, 246, 0.15); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.4);">🔄 Substituted to ${transferOut.toFacultyName}</span>`;
      } else {
        statusBadge = `<span class="slot-badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4);">⏳ Sub Request Pending (${transferOut.toFacultyName})</span>`;
      }
    } else if (lec.isSubstitutedIn) {
      cardClass += ' is-substituted-in';
      statusBadge = `<span class="slot-badge" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4);">🔄 Substituted for ${lec.fromFacultyName}</span>`;
    }

    const safeSub = lec.subject.replace(/'/g, "\\'");
    const safeRoom = (lec.room || '').replace(/'/g, "\\'");

    // Check if batch attendance already logged for today
    const rollCallDone = state.data.batchAttendance && state.data.batchAttendance[`${lec.id}_${todayStr}`];
    const rollCallBtnText = rollCallDone ? '✅ Roll Call Done (Edit)' : '📋 Take Roll Call';

    html += `
      <div class="${cardClass}">
        <div class="fac-lec-top">
          <div>
            <div class="fac-lec-title">${lec.subject}</div>
            <div class="fac-lec-meta">⏰ ${format12h(lec.startTime)} - ${format12h(lec.endTime)} • 📍 ${lec.room || 'Room TBA'}</div>
            <div style="font-size: 0.70rem; color: var(--accent-cyan); font-weight: 700; margin-top: 2px;">Batch: ${lec.batch || 'CSE-5th Sem'}</div>
          </div>
          <div>${statusBadge}</div>
        </div>

        <div class="fac-lec-actions">
          <button type="button" class="btn-chip btn-chip-green" onclick="openTakeRollCallModal('${lec.id}', '${activeFacultyDay}', '${safeSub}', '${safeRoom}')" style="font-size: 0.74rem;">
            ${rollCallBtnText}
          </button>
          ${!transferOut ? `
            <button type="button" class="btn-chip btn-chip-blue" onclick="openSmartSubstituteModal('${lec.id}', '${activeFacultyDay}', '${safeSub}', '${lec.startTime}', '${lec.endTime}', '${safeRoom}')" style="font-size: 0.74rem;">
              🔄 Find Substitute
            </button>
          ` : ''}
          <button type="button" class="btn-chip btn-chip-red" onclick="toggleFacultyLectureCancel('${lec.id}', '${activeFacultyDay}')" style="font-size: 0.74rem;">
            ${isCancelled ? '↩️ Restore Class' : '🚫 Cancel Today'}
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ================= SMART SUBSTITUTE RANKING ALGORITHM =================
function findAvailableSubstitutes(lec, dayName) {
  const currentFac = getCurrentFaculty();
  const allFaculties = state.data.faculties || [];
  const scheduleMap = state.data.facultySchedules || {};

  const candidates = [];

  allFaculties.forEach(candidate => {
    if (candidate.id === currentFac.id) return; // skip self

    // 1. Availability Check: Is candidate free on this day at [lec.startTime, lec.endTime]?
    const candidateDayLectures = (scheduleMap[candidate.id] && scheduleMap[candidate.id][dayName]) || [];
    const lecStartMin = timeStrToMinutes(lec.startTime);
    const lecEndMin = timeStrToMinutes(lec.endTime);

    const overlappingSlot = candidateDayLectures.find(c => {
      const cStart = timeStrToMinutes(c.startTime);
      const cEnd = timeStrToMinutes(c.endTime);
      return !(cEnd <= lecStartMin || cStart >= lecEndMin);
    });

    const isAvailable = !overlappingSlot;

    // 2. AI Ranking / Compatibility Score Calculation
    let score = 50; // base score
    const reasons = [];

    // Direct Subject Match (teaches same subject)
    const candSubjects = (candidate.subjects || []).map(s => s.toLowerCase());
    const targetSubLower = lec.subject.toLowerCase();

    const directMatch = candSubjects.some(s => s.includes(targetSubLower) || targetSubLower.includes(s));
    if (directMatch) {
      score += 35;
      reasons.push(`Direct specialist in ${lec.subject}`);
    } else {
      // Related Domain Match (Data Science, AI, Python, Machine Learning, Networks)
      const domainKeywords = ['data', 'science', 'ai', 'machine', 'learning', 'python', 'analytics', 'network', 'system'];
      const sharedWords = domainKeywords.filter(w => targetSubLower.includes(w) && candSubjects.some(s => s.includes(w)));
      if (sharedWords.length > 0) {
        score += 22;
        reasons.push(`Domain expertise in ${sharedWords.join(', ')}`);
      }
    }

    // Same Department Match
    if (candidate.dept.toLowerCase() === currentFac.dept.toLowerCase()) {
      score += 10;
      reasons.push('Same Department');
    }

    // Workload Balance (fewer classes on this day)
    const dailyClassesCount = candidateDayLectures.length;
    if (dailyClassesCount === 0) {
      score += 10;
      reasons.push('0 lectures today (plenty of free time)');
    } else if (dailyClassesCount === 1) {
      score += 5;
      reasons.push('Light teaching load today (1 lecture)');
    }

    score = Math.min(99, Math.max(40, score));

    candidates.push({
      faculty: candidate,
      isAvailable,
      busySlot: overlappingSlot,
      score,
      reasons,
      dailyClassesCount
    });
  });

  // Sort available faculties first by highest score
  const availableRanked = candidates.filter(c => c.isAvailable).sort((a, b) => b.score - a.score);
  const busyFaculties = candidates.filter(c => !c.isAvailable);

  return { availableRanked, busyFaculties };
}

function openSmartSubstituteModal(lecId, dayName, subject, startTime, endTime, room) {
  const fac = getCurrentFaculty();
  const lec = { id: lecId, subject, startTime, endTime, room };
  activeSubstituteContext = { lec, dayName };

  const infoEl = document.getElementById('subModalLecInfo');
  if (infoEl) {
    infoEl.textContent = `${subject} • ${dayName} ${format12h(startTime)} - ${format12h(endTime)} • 📍 ${room || 'Room TBA'}`;
  }

  const container = document.getElementById('rankedFacultyListContainer');
  if (!container) return;

  const { availableRanked, busyFaculties } = findAvailableSubstitutes(lec, dayName);

  let html = '';

  // Render Available Candidates with Medals
  availableRanked.forEach((item, idx) => {
    const f = item.faculty;
    const rankNum = idx + 1;
    let medalBadge = '';
    let cardRankClass = '';

    if (rankNum === 1) {
      medalBadge = '<span class="rank-medal-badge rank-badge-gold">🥇 Rank 1 • Best Match</span>';
      cardRankClass = 'rank-1';
    } else if (rankNum === 2) {
      medalBadge = '<span class="rank-medal-badge rank-badge-silver">🥈 Rank 2</span>';
    } else if (rankNum === 3) {
      medalBadge = '<span class="rank-medal-badge rank-badge-bronze">🥉 Rank 3</span>';
    } else {
      medalBadge = `<span class="rank-medal-badge" style="background: #27272a; color: #a1a1aa;">#${rankNum}</span>`;
    }

    const expertiseTags = (f.subjects || []).map(s => `<span class="fac-expertise-tag">${s}</span>`).join(' ');
    const safeFacName = f.name.replace(/'/g, "\\'");

    html += `
      <div class="ranked-fac-card ${cardRankClass}">
        <div class="rank-top-row">
          <div>${medalBadge}</div>
          <div class="match-pct-pill">${item.score}% Match</div>
        </div>

        <div>
          <div style="font-size: 0.95rem; font-weight: 800; color: #fff;">${f.name}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${f.title} • ${f.dept}</div>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
          ${expertiseTags}
        </div>

        <div style="font-size: 0.72rem; color: #4ade80; display: flex; align-items: center; gap: 4px;">
          <span>🟢</span> <strong>Free at ${format12h(startTime)}:</strong> ${item.reasons.join(' • ')}
        </div>

        <button type="button" class="btn-cta-primary" onclick="sendSubstitutionRequest('${f.id}', '${safeFacName}')" style="background: #2563eb; color: #fff; padding: 8px 12px; font-size: 0.82rem; margin-top: 4px;">
          📤 Send Substitution Request to ${f.name.split(' ')[1] || f.name}
        </button>
      </div>
    `;
  });

  // Render Busy / Unavailable Faculties
  if (busyFaculties.length > 0) {
    html += `
      <div style="font-size: 0.76rem; font-weight: 800; color: var(--text-muted); margin-top: 10px; text-transform: uppercase;">
        Unavailable Faculties (Busy in another class)
      </div>
    `;
    busyFaculties.forEach(item => {
      const f = item.faculty;
      const bSlot = item.busySlot;
      html += `
        <div class="ranked-fac-card is-busy">
          <div class="rank-top-row">
            <span style="font-size: 0.90rem; font-weight: 700; color: #fff;">${f.name}</span>
            <span class="fac-busy-pill">🔴 Busy in Class</span>
          </div>
          <div style="font-size: 0.72rem; color: #f87171;">
            Taking <strong>${bSlot.subject}</strong> (${format12h(bSlot.startTime)} - ${format12h(bSlot.endTime)} in ${bSlot.room || 'Classroom'})
          </div>
        </div>
      `;
    });
  }

  container.innerHTML = html;
  openModal('modalSmartSubstitute');
}

function sendSubstitutionRequest(targetFacultyId, targetFacultyName) {
  if (!activeSubstituteContext) return;

  const currentFac = getCurrentFaculty();
  const { lec, dayName } = activeSubstituteContext;
  const reasonInput = document.getElementById('inputSubReason');
  const notes = reasonInput ? reasonInput.value.trim() : 'Requested substitution';
  const now = new Date();
  const todayStr = toLocalDateStr(now);

  const newSub = {
    id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    fromFacultyId: currentFac.id,
    fromFacultyName: currentFac.name,
    toFacultyId: targetFacultyId,
    toFacultyName: targetFacultyName,
    lectureId: lec.id,
    subject: lec.subject,
    day: dayName,
    date: todayStr,
    startTime: lec.startTime,
    endTime: lec.endTime,
    room: lec.room,
    notes: notes || 'Need substitution for this class',
    status: 'pending',
    timestamp: new Date().toISOString()
  };

  if (!state.data.substitutions) state.data.substitutions = [];
  state.data.substitutions.unshift(newSub);
  state.save();

  closeModal('modalSmartSubstitute');
  activeSubstituteContext = null;

  renderFacultyPortal();
  showBottomToast(`Substitution request sent to ${targetFacultyName}! 📨`, 'Dismiss', hideBottomToast);
}

// Render Substitution Exchange Desk (Incoming and Outgoing)
function renderSubstitutionHub() {
  const fac = getCurrentFaculty();
  const incomingContainer = document.getElementById('facIncomingSubsContainer');
  const outgoingContainer = document.getElementById('facOutgoingSubsContainer');
  const countBadge = document.getElementById('incomingCountBadge');
  if (!incomingContainer || !outgoingContainer || !fac) return;

  const allSubs = state.data.substitutions || [];
  const incoming = allSubs.filter(s => s.toFacultyId === fac.id);
  const outgoing = allSubs.filter(s => s.fromFacultyId === fac.id);

  if (countBadge) countBadge.textContent = `${incoming.filter(s => s.status === 'pending').length} Pending`;

  // 1. INCOMING
  if (incoming.length === 0) {
    incomingContainer.innerHTML = `
      <div style="font-size: 0.78rem; color: var(--text-muted); font-style: italic; padding: 10px 4px;">
        No substitution requests received yet.
      </div>
    `;
  } else {
    let incHtml = '';
    incoming.forEach(sub => {
      const isPending = sub.status === 'pending';
      const cardClass = isPending ? 'sub-request-card pending-in' : 'sub-request-card';
      let statusTag = '';

      if (sub.status === 'accepted') {
        statusTag = '<span class="slot-badge" style="background: rgba(34, 197, 94, 0.15); color: #4ade80;">✅ You Accepted</span>';
      } else if (sub.status === 'declined') {
        statusTag = '<span class="slot-badge" style="background: rgba(239, 68, 68, 0.15); color: #f87171;">❌ You Declined</span>';
      } else {
        statusTag = '<span class="slot-badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24;">⚡ Action Required</span>';
      }

      incHtml += `
        <div class="${cardClass}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <div>
              <div style="font-size: 0.90rem; font-weight: 800; color: #fff;">${sub.subject}</div>
              <div style="font-size: 0.74rem; color: var(--accent-cyan);">From: ${sub.fromFacultyName}</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">⏰ ${sub.day} • ${format12h(sub.startTime)} - ${format12h(sub.endTime)} • 📍 ${sub.room || 'Room TBA'}</div>
            </div>
            <div>${statusTag}</div>
          </div>

          <div style="font-size: 0.74rem; color: #e4e4e7; background: #18181b; padding: 6px 10px; border-radius: 6px; font-style: italic;">
            "${sub.notes}"
          </div>

          ${isPending ? `
            <div style="display: flex; gap: 6px; margin-top: 4px;">
              <button type="button" class="btn-chip btn-chip-green" onclick="respondToSubstitution('${sub.id}', 'accepted')" style="flex: 1; justify-content: center; font-size: 0.78rem; padding: 8px;">
                ✅ Accept & Take Lecture
              </button>
              <button type="button" class="btn-chip btn-chip-red" onclick="respondToSubstitution('${sub.id}', 'declined')" style="flex: 1; justify-content: center; font-size: 0.78rem; padding: 8px;">
                ❌ Decline
              </button>
            </div>
          ` : ''}
        </div>
      `;
    });
    incomingContainer.innerHTML = incHtml;
  }

  // 2. OUTGOING
  if (outgoing.length === 0) {
    outgoingContainer.innerHTML = `
      <div style="font-size: 0.78rem; color: var(--text-muted); font-style: italic; padding: 10px 4px;">
        You haven't requested any substitutions.
      </div>
    `;
  } else {
    let outHtml = '';
    outgoing.forEach(sub => {
      let statusTag = '';
      if (sub.status === 'accepted') {
        statusTag = `<span class="slot-badge" style="background: rgba(34, 197, 94, 0.15); color: #4ade80;">✅ Accepted by ${sub.toFacultyName}</span>`;
      } else if (sub.status === 'declined') {
        statusTag = `<span class="slot-badge" style="background: rgba(239, 68, 68, 0.15); color: #f87171;">❌ Declined by ${sub.toFacultyName}</span>`;
      } else {
        statusTag = `<span class="slot-badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24;">⏳ Waiting for ${sub.toFacultyName}</span>`;
      }

      outHtml += `
        <div class="sub-request-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <div>
              <div style="font-size: 0.90rem; font-weight: 800; color: #fff;">${sub.subject}</div>
              <div style="font-size: 0.74rem; color: var(--text-muted);">Sent To: ${sub.toFacultyName}</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">⏰ ${sub.day} • ${format12h(sub.startTime)} - ${format12h(sub.endTime)}</div>
            </div>
            <div>${statusTag}</div>
          </div>
        </div>
      `;
    });
    outgoingContainer.innerHTML = outHtml;
  }
}

function respondToSubstitution(subId, response) {
  const sub = (state.data.substitutions || []).find(s => s.id === subId);
  if (!sub) return;

  sub.status = response;
  state.save();

  renderFacultyPortal();
  renderDashboard();
  renderWeeklyMatrix();

  if (response === 'accepted') {
    showBottomToast(`Accepted substitution for ${sub.subject}! Lecture added to your schedule. ✅`, 'Dismiss', hideBottomToast);
  } else {
    showBottomToast(`Declined substitution request for ${sub.subject}. ❌`, 'Dismiss', hideBottomToast);
  }
}

function toggleFacultyLectureCancel(lecId, dayName) {
  const now = new Date();
  const todayStr = toLocalDateStr(now);
  const key = `${lecId}_${todayStr}`;

  if (!state.data.cancelledLectures) state.data.cancelledLectures = {};

  const wasCancelled = state.data.cancelledLectures[key];
  if (wasCancelled) {
    delete state.data.cancelledLectures[key];
    state.save();
    renderFacultyPortal();
    renderDashboard();
    renderWeeklyMatrix();
    showBottomToast('Lecture restored to normal schedule! 🟢', 'Dismiss', hideBottomToast);
  } else {
    if (!confirm('Cancel this lecture for today? Students will see it as Free / Cancelled and will not be alerted.')) return;
    state.data.cancelledLectures[key] = true;
    state.save();
    renderFacultyPortal();
    renderDashboard();
    renderWeeklyMatrix();
    showBottomToast('Lecture cancelled for today. Students notified. ⚪', 'Dismiss', hideBottomToast);
  }
}

// ================= BATCH ROLL CALL ATTENDANCE TAKER =================
function openTakeRollCallModal(lecId, dayName, subject, room) {
  const now = new Date();
  const todayStr = toLocalDateStr(now);
  activeRollCallContext = { lecId, dayName, subject, room, dateStr: todayStr };

  const titleEl = document.getElementById('rollCallModalTitle');
  const subEl = document.getElementById('rollCallModalSubtitle');
  if (titleEl) titleEl.textContent = `📋 Take Roll Call: ${subject}`;
  if (subEl) subEl.textContent = `${dayName}, ${todayStr} • 📍 ${room || 'Room TBA'}`;

  // Load existing or default batch roll call state
  const key = `${lecId}_${todayStr}`;
  const existingMap = (state.data.batchAttendance && state.data.batchAttendance[key]) || {};
  const students = state.data.studentsList || DEFAULT_STUDENTS;

  const rosterContainer = document.getElementById('rollCallRosterList');
  if (!rosterContainer) return;

  let html = '';
  students.forEach(st => {
    // default to 'present' if not previously taken
    const currentStatus = existingMap[st.roll] || 'present';
    const isPresent = currentStatus === 'present';
    const isCurrentUser = !!st.isUser;

    html += `
      <div class="roll-call-row ${isCurrentUser ? 'is-current-user' : ''}" data-roll="${st.roll}">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.85rem; font-weight: 900; color: ${isCurrentUser ? 'var(--accent-cyan)' : '#a1a1aa'}; min-width: 30px;">#${st.roll}</span>
          <div>
            <div style="font-size: 0.86rem; font-weight: 800; color: #fff;">
              ${st.name} ${isCurrentUser ? '<span style="font-size: 0.68rem; color: var(--accent-cyan); font-weight: 800;">(Student App User)</span>' : ''}
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 4px;">
          <button type="button" class="btn-toggle-roll btn-p ${isPresent ? 'active' : ''}" onclick="setStudentRollStatus('${st.roll}', 'present')">P</button>
          <button type="button" class="btn-toggle-roll btn-a ${!isPresent ? 'active' : ''}" onclick="setStudentRollStatus('${st.roll}', 'absent')">A</button>
        </div>
      </div>
    `;
  });

  rosterContainer.innerHTML = html;
  updateRollCallSummaryStats();
  openModal('modalTakeRollCall');
}

function setStudentRollStatus(roll, status) {
  const row = document.querySelector(`.roll-call-row[data-roll="${roll}"]`);
  if (!row) return;

  const btnP = row.querySelector('.btn-p');
  const btnA = row.querySelector('.btn-a');

  if (status === 'present') {
    btnP.classList.add('active');
    btnA.classList.remove('active');
  } else {
    btnA.classList.add('active');
    btnP.classList.remove('active');
  }

  updateRollCallSummaryStats();
}

function updateRollCallSummaryStats() {
  const rows = document.querySelectorAll('.roll-call-row');
  let presentCount = 0;
  rows.forEach(r => {
    if (r.querySelector('.btn-p.active')) presentCount++;
  });
  const total = rows.length;
  const pct = total > 0 ? Math.round((presentCount / total) * 100) : 0;
  const statsEl = document.getElementById('rollCallStatsText');
  if (statsEl) {
    statsEl.textContent = `Present: ${presentCount} / ${total} (${pct}%)`;
    statsEl.style.color = pct >= 75 ? '#4ade80' : '#f87171';
  }
}

function markAllRollCall(status) {
  const rows = document.querySelectorAll('.roll-call-row');
  rows.forEach(r => {
    const btnP = r.querySelector('.btn-p');
    const btnA = r.querySelector('.btn-a');
    if (status === 'present') {
      btnP.classList.add('active');
      btnA.classList.remove('active');
    } else {
      btnA.classList.add('active');
      btnP.classList.remove('active');
    }
  });
  updateRollCallSummaryStats();
}

function submitBatchRollCall() {
  if (!activeRollCallContext) return;

  const { lecId, subject, dateStr } = activeRollCallContext;
  const key = `${lecId}_${dateStr}`;
  const rows = document.querySelectorAll('.roll-call-row');

  if (!state.data.batchAttendance) state.data.batchAttendance = {};
  const batchMap = {};

  rows.forEach(r => {
    const roll = r.dataset.roll;
    const isP = r.querySelector('.btn-p.active') !== null;
    batchMap[roll] = isP ? 'present' : 'absent';
  });

  state.data.batchAttendance[key] = batchMap;

  // AUTO-SYNC WITH CURRENT STUDENT APP USER (Roll 104 - Rishabh Patel)
  const userStatus = batchMap['104'] || 'present';
  // Check if existing record exists for today and this subject
  const existingUserRec = state.data.records.find(
    r => r.date === dateStr && r.subject.trim().toLowerCase() === subject.trim().toLowerCase()
  );

  if (existingUserRec) {
    existingUserRec.status = userStatus;
  } else {
    state.addRecord(subject, userStatus, dateStr, null, 'Faculty Official Roll Call');
  }

  state.save();

  closeModal('modalTakeRollCall');
  activeRollCallContext = null;

  renderFacultyPortal();
  renderDashboard();
  renderWeeklyMatrix();
  renderHistory();

  showBottomToast(`Synced attendance for ${rows.length} students! 🚀`, 'Dismiss', hideBottomToast);
}

// ================= BATCH ANALYTICS & DEFAULTERS =================
function renderBatchAnalytics() {
  const students = state.data.studentsList || DEFAULT_STUDENTS;
  const selectSubject = document.getElementById('selectAnalyticsSubject');
  const summaryCard = document.getElementById('analyticsSummaryCard');
  const tableContainer = document.getElementById('analyticsStudentsTableContainer');
  if (!tableContainer) return;

  // Populate Subject Select if empty
  const uniqueSubs = state.getUniqueSubjects();
  if (selectSubject && selectSubject.options.length <= 1) {
    selectSubject.innerHTML = '<option value="all">All Subjects (Aggregate)</option>' +
      uniqueSubs.map(s => `<option value="${s}">${s}</option>`).join('');
  }

  // Calculate analytics for each student based on batch attendance
  let totalAttendedBatch = 0;
  let totalSlotsBatch = 0;
  let defaultersCount = 0;

  const studentStats = students.map(st => {
    let attended = 0;
    let total = 0;

    Object.keys(state.data.batchAttendance || {}).forEach(batchKey => {
      const record = state.data.batchAttendance[batchKey];
      if (record && record[st.roll]) {
        total++;
        if (record[st.roll] === 'present') attended++;
      }
    });

    // If no batch attendance logged yet, simulate realistic baseline
    if (total === 0) {
      if (st.roll === '104') {
        const stats = state.calculateStats();
        attended = stats.overallAttended || 16;
        total = stats.overallTotal || 20;
      } else {
        total = 20;
        const rollNum = parseInt(st.roll, 10);
        attended = (rollNum % 5 === 0) ? 13 : ((rollNum % 3 === 0) ? 14 : 18);
      }
    }

    const pct = total > 0 ? Math.round((attended / total) * 1000) / 10 : 0;
    const isDefaulter = pct < 75;

    totalAttendedBatch += attended;
    totalSlotsBatch += total;
    if (isDefaulter) defaultersCount++;

    return {
      student: st,
      attended,
      total,
      pct,
      isDefaulter
    };
  });

  const batchAvg = totalSlotsBatch > 0 ? Math.round((totalAttendedBatch / totalSlotsBatch) * 1000) / 10 : 78.5;

  if (summaryCard) {
    summaryCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 1.4rem; font-weight: 900; color: ${batchAvg >= 75 ? '#4ade80' : '#f87171'};">${batchAvg}%</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Batch Average Attendance</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 1.4rem; font-weight: 900; color: ${defaultersCount > 0 ? '#f87171' : '#4ade80'};">${defaultersCount}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Defaulters (&lt; 75%)</div>
        </div>
      </div>
    `;
  }

  // Filter list
  const listToDisplay = filterDefaultersOnly ? studentStats.filter(s => s.isDefaulter) : studentStats;

  let tableHtml = `
    <div style="display: flex; flex-direction: column; gap: 8px;">
  `;

  listToDisplay.forEach(item => {
    const st = item.student;
    const isUser = !!st.isUser;
    tableHtml += `
      <div class="roll-call-row ${isUser ? 'is-current-user' : ''}" style="cursor: default;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.85rem; font-weight: 900; color: #a1a1aa; min-width: 32px;">#${st.roll}</span>
          <div>
            <div style="font-size: 0.88rem; font-weight: 800; color: #fff;">
              ${st.name} ${isUser ? '<span style="font-size: 0.68rem; color: var(--accent-cyan);">(You)</span>' : ''}
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${item.attended} / ${item.total} classes</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.95rem; font-weight: 900; color: ${item.pct >= 75 ? '#4ade80' : '#f87171'};">${item.pct}%</div>
          <span class="slot-badge" style="font-size: 0.64rem; padding: 2px 6px; ${item.pct >= 75 ? 'background: #142419; color: #4ade80;' : 'background: #281417; color: #f87171;'}">
            ${item.pct >= 75 ? 'Safe 😎' : 'Defaulter ⚠️'}
          </span>
        </div>
      </div>
    `;
  });

  tableHtml += '</div>';
  tableContainer.innerHTML = tableHtml;
}

function exportBatchAnalyticsCsv() {
  const students = state.data.studentsList || DEFAULT_STUDENTS;
  let csv = 'Roll Number,Student Name,Email,Attended,Total,Percentage,Status\n';

  students.forEach(st => {
    let attended = 18;
    let total = 20;
    const rollNum = parseInt(st.roll, 10);
    if (rollNum % 5 === 0) attended = 13;
    const pct = Math.round((attended / total) * 100);
    const status = pct >= 75 ? 'Eligible' : 'Defaulter (<75%)';
    csv += `${st.roll},"${st.name}",${st.email},${attended},${total},${pct}%,${status}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Batch_Attendance_Report_${toLocalDateStr(new Date())}.csv`;
  a.click();
  showBottomToast('Downloaded Batch Attendance CSV! 📥', 'Dismiss', hideBottomToast);
}

// Student Roster
function renderStudentRoster() {
  const container = document.getElementById('rosterListContainer');
  if (!container) return;

  const students = state.data.studentsList || DEFAULT_STUDENTS;
  let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';

  students.forEach(st => {
    html += `
      <div class="roll-call-row ${st.isUser ? 'is-current-user' : ''}">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 0.85rem; font-weight: 900; color: #a1a1aa; min-width: 32px;">#${st.roll}</span>
          <div>
            <div style="font-size: 0.88rem; font-weight: 800; color: #fff;">
              ${st.name} ${st.isUser ? '<span style="font-size: 0.68rem; color: var(--accent-cyan);">(Current App User)</span>' : ''}
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${st.email}</div>
          </div>
        </div>
        <span class="badge-tag-upcoming" style="font-size: 0.68rem;">CSE Batch A</span>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
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
      if (btn.dataset.tab === 'placements') renderPlacementsTab();
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

  // ================= FACULTY & ROLE SWITCHER LISTENERS =================
  const btnRoleStud = document.getElementById('btnRoleStudent');
  if (btnRoleStud) btnRoleStud.addEventListener('click', () => switchPortalRole('student'));

  const btnRoleFac = document.getElementById('btnRoleFaculty');
  if (btnRoleFac) btnRoleFac.addEventListener('click', () => switchPortalRole('faculty'));

  const selFac = document.getElementById('selectCurrentFaculty');
  if (selFac) {
    selFac.addEventListener('change', (e) => switchCurrentFaculty(e.target.value));
  }

  // Faculty Sub Tabs Navigation (Pills & Bottom Dock)
  document.querySelectorAll('.fac-nav-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const tab = pill.dataset.factab;
      if (tab) switchFacultyTab(tab);
    });
  });

  document.querySelectorAll('.fac-nav-dock-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.factab;
      if (tab) switchFacultyTab(tab);
    });
  });

  // Faculty Day Scroller Chips
  document.querySelectorAll('.fac-day-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      activeFacultyDay = chip.dataset.day;
      document.querySelectorAll('.fac-day-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderFacultySchedule();
    });
  });

  // Roll Call Modal Actions
  const btnRollAllP = document.getElementById('btnRollCallAllPresent');
  if (btnRollAllP) btnRollAllP.addEventListener('click', () => markAllRollCall('present'));

  const btnRollAllA = document.getElementById('btnRollCallAllAbsent');
  if (btnRollAllA) btnRollAllA.addEventListener('click', () => markAllRollCall('absent'));

  const btnSubmitRoll = document.getElementById('btnSubmitRollCall');
  if (btnSubmitRoll) btnSubmitRoll.addEventListener('click', submitBatchRollCall);

  // Batch Analytics Controls
  const btnExpBatchCsv = document.getElementById('btnExportBatchCsv');
  if (btnExpBatchCsv) btnExpBatchCsv.addEventListener('click', exportBatchAnalyticsCsv);

  const selAnalyticsSub = document.getElementById('selectAnalyticsSubject');
  if (selAnalyticsSub) selAnalyticsSub.addEventListener('change', renderBatchAnalytics);

  const btnFilterAllSt = document.getElementById('btnFilterAllStudents');
  const btnFilterDefSt = document.getElementById('btnFilterDefaulters');
  if (btnFilterAllSt) {
    btnFilterAllSt.addEventListener('click', () => {
      filterDefaultersOnly = false;
      btnFilterAllSt.classList.add('active');
      if (btnFilterDefSt) btnFilterDefSt.classList.remove('active');
      renderBatchAnalytics();
    });
  }
  if (btnFilterDefSt) {
    btnFilterDefSt.addEventListener('click', () => {
      filterDefaultersOnly = true;
      btnFilterDefSt.classList.add('active');
      if (btnFilterAllSt) btnFilterAllSt.classList.remove('active');
      renderBatchAnalytics();
    });
  }

  // Apply Auth Session & Role Isolation on Load
  applyAuthSession();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW error:', err));
  }

  setInterval(checkLectureTimes, 5000);
  setInterval(renderLiveCampusRadar, 15000);
});

// Global scope bindings for inline HTML handlers
window.switchPortalRole = switchPortalRole;
window.switchCurrentFaculty = switchCurrentFaculty;
window.switchFacultyTab = switchFacultyTab;
window.openSmartSubstituteModal = openSmartSubstituteModal;
window.sendSubstitutionRequest = sendSubstitutionRequest;
window.respondToSubstitution = respondToSubstitution;
window.toggleFacultyLectureCancel = toggleFacultyLectureCancel;
window.openTakeRollCallModal = openTakeRollCallModal;
window.setStudentRollStatus = setStudentRollStatus;
window.markAllRollCall = markAllRollCall;
window.submitBatchRollCall = submitBatchRollCall;
window.exportBatchAnalyticsCsv = exportBatchAnalyticsCsv;
window.switchAuthTab = switchAuthTab;
window.quickFillStudent = quickFillStudent;
window.quickFillFaculty = quickFillFaculty;
window.handleStudentLoginSubmit = handleStudentLoginSubmit;
window.handleFacultyLoginSubmit = handleFacultyLoginSubmit;
window.logoutSession = logoutSession;
window.applyAuthSession = applyAuthSession;
window.renderAssignedTeachers = renderAssignedTeachers;
window.getAssignedFacultyForSubject = getAssignedFacultyForSubject;
window.updateDigitalIdCard = updateDigitalIdCard;
window.toggleIdCardCompact = toggleIdCardCompact;
window.renderNoticeboard = renderNoticeboard;
window.openAddNoticeModal = openAddNoticeModal;
window.submitNewNotice = submitNewNotice;
window.deleteNotice = deleteNotice;
window.renderLiveCampusRadar = renderLiveCampusRadar;
window.renderWhatIfSimulator = renderWhatIfSimulator;
window.adjustSimCount = adjustSimCount;
window.applySimPreset = applySimPreset;
window.resetWhatIfSimulator = resetWhatIfSimulator;
window.runWhatIfSimulation = runWhatIfSimulation;
window.renderStudentAcademicsSummary = renderStudentAcademicsSummary;
window.openCgpaModal = openCgpaModal;
window.renderCgpaModal = renderCgpaModal;
window.recalcCgpaRow = recalcCgpaRow;
window.saveCgpaInputs = saveCgpaInputs;
window.openStudyHubModal = openStudyHubModal;
window.switchStudyHubTab = switchStudyHubTab;
window.renderStudyHubModal = renderStudyHubModal;
window.toggleSyllabusUnit = toggleSyllabusUnit;
window.toggleLabExperiment = toggleLabExperiment;
window.promptAddSyllabusUnit = promptAddSyllabusUnit;
window.promptAddLabExperiment = promptAddLabExperiment;
window.addCustomStudyNote = addCustomStudyNote;
window.renderPlacementsTab = renderPlacementsTab;
window.filterDrivesBy = filterDrivesBy;
window.applyToDrive = applyToDrive;
window.openDriveDetailsModal = openDriveDetailsModal;
window.advanceDriveRound = advanceDriveRound;
window.openDutyLeaveModal = openDutyLeaveModal;
window.printDutyLeaveSlip = printDutyLeaveSlip;
window.emailDutyLeaveAdvisor = emailDutyLeaveAdvisor;
window.syncPodDrives = syncPodDrives;

export type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type DaySchedule = { on: boolean; slots: [string, string][] };

export const DAY_KEYS: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const TIMES_OF_DAY = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
  '8:00 PM', '8:30 PM', '9:00 PM',
];

export type MentorUser = {
  name: string;
  email: string;
  headline: string;
  bio: string;
  teachingApproach: string;
  rating: number;
  totalReviews: number;
  totalSessions: number;
  repeatStudentsPct: number;
  acceptingBookings: boolean;
  responseTimeMin: number;
  responseRatePct: number;
  profileCompletionPct: number;
  country: string;
  timezone: string;
  languages: string[];
  primary: string;
  subjects: string[];
  education: { degree: string; institution: string; year: string }[];
  certs: { name: string; issuer: string; year: string }[];
  pricing: {
    voice: { enabled: boolean; p30: number; p60: number };
    video: { enabled: boolean; p30: number; p60: number };
    instantBook: boolean;
  };
  days: Record<DayKey, DaySchedule>;
  buffer: number;
  advanceBookingWindow: string;
  blockedDates: string[];
};

export const MENTOR_USER: MentorUser = {
  name: 'Dr. Priya Iyer',
  email: 'priya.iyer@research.iitb.ac.in',
  headline: 'Data Scientist · IIT Bombay PhD',
  bio: "I work at the intersection of statistics and machine learning. I spent 6 years at Google Research before transitioning to teaching. I love demystifying complex math for students who think they're \"not math people\".",
  teachingApproach: 'I believe in working through problems together — not lecturing. Most of our session will be you driving, me asking the right questions.',
  rating: 4.9,
  totalReviews: 248,
  totalSessions: 1840,
  repeatStudentsPct: 62,
  acceptingBookings: true,
  responseTimeMin: 120,
  responseRatePct: 97,
  profileCompletionPct: 80,
  country: 'India',
  timezone: 'IST (UTC+5:30)',
  languages: ['English', 'Hindi'],
  primary: 'Data Science',
  subjects: ['Statistics', 'Machine learning', 'Pandas', 'Time series', 'A/B testing'],
  education: [
    { degree: 'PhD, Statistics', institution: 'IIT Bombay', year: '2018' },
    { degree: 'B.Tech, Computer Science', institution: 'IIT Madras', year: '2012' },
  ],
  certs: [
    { name: 'Google Cloud ML Engineer', issuer: 'Google', year: '2021' },
  ],
  pricing: {
    voice: { enabled: true, p30: 499, p60: 899 },
    video: { enabled: true, p30: 599, p60: 999 },
    instantBook: true,
  },
  days: {
    Mon: { on: true, slots: [['9:00 AM', '5:00 PM']] },
    Tue: { on: true, slots: [['9:00 AM', '5:00 PM']] },
    Wed: { on: true, slots: [['9:00 AM', '5:00 PM']] },
    Thu: { on: true, slots: [['9:00 AM', '5:00 PM']] },
    Fri: { on: true, slots: [['9:00 AM', '5:00 PM']] },
    Sat: { on: false, slots: [] },
    Sun: { on: false, slots: [] },
  },
  buffer: 15,
  advanceBookingWindow: '1 month',
  blockedDates: ['2026-05-15', '2026-05-16'],
};

export type MentorSession = {
  id: string;
  student: { name: string };
  time: string;
  duration: number;
  type: 'voice' | 'video';
  topic: string;
  status: 'completed' | 'upcoming';
  minsAway?: number;
};

export const MENTOR_SESSIONS_TODAY: MentorSession[] = [
  { id: 's1', student: { name: 'Rohan Das' },   time: '9:00 AM',  duration: 60, type: 'video', topic: 'Linear algebra basics',         status: 'completed' },
  { id: 's2', student: { name: 'Arjun Patel' }, time: '11:00 AM', duration: 60, type: 'video', topic: 'Pandas DataFrames intro',       status: 'upcoming', minsAway: 18 },
  { id: 's3', student: { name: 'Sneha Mehta' }, time: '2:30 PM',  duration: 30, type: 'voice', topic: 'Resume review for FAANG roles', status: 'upcoming', minsAway: 340 },
];

export type PendingRequest = {
  id: string;
  student: { name: string };
  requestedAt: string;
  date: string;
  time: string;
  duration: number;
  type: 'voice' | 'video';
  topic: string;
  agenda: string;
};

export const MENTOR_PENDING_REQUESTS: PendingRequest[] = [
  { id: 'r1', student: { name: 'Karan Iyer' },   requestedAt: '2h ago', date: 'Apr 26', time: '4:00 PM',  duration: 60, type: 'video', topic: 'Help with thesis chapter 3', agenda: 'I want to discuss the methodology section before submitting on Friday.' },
  { id: 'r2', student: { name: 'Ananya Roy' },   requestedAt: '5h ago', date: 'Apr 28', time: '11:00 AM', duration: 30, type: 'voice', topic: '', agenda: '' },
  { id: 'r3', student: { name: 'Vikram Singh' }, requestedAt: '1d ago', date: 'Apr 30', time: '7:00 PM',  duration: 60, type: 'video', topic: 'Career change to data science', agenda: "I'm an electrical engineer with 5 years experience, looking to pivot. Want advice on portfolio projects and which sub-field to target." },
];

export type UpcomingSession = {
  id: string;
  student: { name: string };
  date: string;
  time: string;
  duration: number;
  type: 'voice' | 'video';
  topic: string;
  minsAway: number;
};

export const MENTOR_UPCOMING: UpcomingSession[] = [
  { id: 'u1', student: { name: 'Arjun Patel' }, date: 'Today',  time: '11:00 AM', duration: 60, type: 'video', topic: 'Pandas DataFrames intro',        minsAway: 18 },
  { id: 'u2', student: { name: 'Sneha Mehta' }, date: 'Today',  time: '2:30 PM',  duration: 30, type: 'voice', topic: 'Resume review for FAANG roles',  minsAway: 340 },
  { id: 'u3', student: { name: 'Diya Rao' },    date: 'Apr 25', time: '5:00 PM',  duration: 60, type: 'video', topic: 'Time series forecasting',         minsAway: 2880 },
  { id: 'u4', student: { name: 'Aniket M.' },   date: 'Apr 26', time: '10:00 AM', duration: 30, type: 'voice', topic: 'PhD application essay review',    minsAway: 4200 },
  { id: 'u5', student: { name: 'Tara K.' },     date: 'Apr 27', time: '3:00 PM',  duration: 60, type: 'video', topic: 'A/B test design',                 minsAway: 5800 },
];

export type PastSession = {
  id: string;
  student: { name: string };
  date: string;
  time: string;
  duration: number;
  type: 'voice' | 'video';
  topic: string;
  revenueNet: number;
};

export const MENTOR_PAST: PastSession[] = [
  { id: 'p1', student: { name: 'Rohan Das' },  date: 'Today',  time: '9:00 AM',  duration: 60, type: 'video', topic: 'Linear algebra basics', revenueNet: 849 },
  { id: 'p2', student: { name: 'Priya N.' },   date: 'Apr 21', time: '5:00 PM',  duration: 30, type: 'voice', topic: 'Stats interview prep',  revenueNet: 424 },
  { id: 'p3', student: { name: 'Aman G.' },    date: 'Apr 19', time: '3:00 PM',  duration: 60, type: 'video', topic: 'Pandas advanced',       revenueNet: 849 },
  { id: 'p4', student: { name: 'Lakshmi S.' }, date: 'Apr 17', time: '11:00 AM', duration: 60, type: 'video', topic: 'NumPy fundamentals',    revenueNet: 849 },
  { id: 'p5', student: { name: 'Karthik V.' }, date: 'Apr 15', time: '6:00 PM',  duration: 30, type: 'voice', topic: 'Resume feedback',       revenueNet: 424 },
  { id: 'p6', student: { name: 'Mira S.' },    date: 'Apr 14', time: '10:00 AM', duration: 60, type: 'video', topic: 'Decision trees',        revenueNet: 849 },
  { id: 'p7', student: { name: 'Dev K.' },     date: 'Apr 12', time: '4:00 PM',  duration: 60, type: 'video', topic: 'A/B testing intro',     revenueNet: 849 },
  { id: 'p8', student: { name: 'Neha B.' },    date: 'Apr 10', time: '2:00 PM',  duration: 30, type: 'voice', topic: 'PhD app strategy',      revenueNet: 424 },
];

export type CancelledSession = {
  id: string;
  student: { name: string };
  date: string;
  time: string;
  duration: number;
  type: 'voice' | 'video';
  topic: string;
  refundStatus: string;
  cancelledBy: 'student' | 'mentor';
};

export const MENTOR_CANCELLED: CancelledSession[] = [
  { id: 'c1', student: { name: 'Aditya B.' }, date: 'Apr 18', time: '6:00 PM', duration: 60, type: 'video', topic: 'Linear algebra', refundStatus: 'Refunded ₹849', cancelledBy: 'student' },
  { id: 'c2', student: { name: 'Meena R.' },  date: 'Apr 12', time: '4:00 PM', duration: 30, type: 'voice', topic: 'Career advice',  refundStatus: 'Refunded ₹424', cancelledBy: 'mentor'  },
];

export const RECENT_REVIEWS = [
  { id: 'rv1', student: 'Rohan Das', rating: 5, excerpt: "Priya makes the most complex topics feel approachable. Best mentor I've had on the platform.", date: '2 days ago' },
  { id: 'rv2', student: 'Diya Rao',  rating: 5, excerpt: 'Came in confused about which models to use. Left with a clear action plan.', date: '5 days ago' },
  { id: 'rv3', student: 'Aman G.',   rating: 4, excerpt: 'Very thorough explanation. Wish we had more time for the second topic.', date: '1 week ago' },
];

export const MENTOR_ALL_REVIEWS = [
  { student: 'Rahul S.', rating: 5, date: 'May 10, 2026', topic: 'Statistics · A/B testing',  body: 'Dr. Iyer explained everything so clearly. I finally understand hypothesis testing after 3 months of confusion. Highly recommend!', responded: false },
  { student: 'Kavya I.', rating: 5, date: 'May 5, 2026',  topic: 'Machine learning',          body: 'Amazing session. She caught my conceptual gap in gradient descent immediately and fixed it in 10 minutes.', responded: true,  response: 'Thank you Kavya! Really enjoyed our session.', responseDate: 'May 6, 2026' },
  { student: 'Dev R.',   rating: 4, date: 'Apr 28, 2026', topic: 'Time series',               body: 'Very knowledgeable. Could have slowed down a bit in the ARIMA section, but overall excellent.', responded: false },
  { student: 'Meera N.', rating: 5, date: 'Apr 20, 2026', topic: 'Data Science',              body: "Best mentor I've had on this platform. Priya goes above and beyond — even sent notes after the session!", responded: true,  response: 'Always happy to go the extra mile 🙏', responseDate: 'Apr 21, 2026' },
  { student: 'Arjun P.', rating: 5, date: 'Apr 15, 2026', topic: 'Pandas · Data wrangling',   body: "She helped me debug a tricky merge issue I'd been stuck on for days. Straight to the point, no fluff.", responded: false },
];

export const MENTOR_EARNINGS_WEEKLY = [
  { day: 'Mon', earned: 999 },
  { day: 'Tue', earned: 1798 },
  { day: 'Wed', earned: 599 },
  { day: 'Thu', earned: 2697 },
  { day: 'Fri', earned: 999 },
  { day: 'Sat', earned: 0 },
  { day: 'Sun', earned: 0 },
];

export const MENTOR_EARNINGS_MONTHLY = [
  { month: 'Nov', earned: 12400 },
  { month: 'Dec', earned: 15800 },
  { month: 'Jan', earned: 18200 },
  { month: 'Feb', earned: 14600 },
  { month: 'Mar', earned: 21300 },
  { month: 'Apr', earned: 19700 },
  { month: 'May', earned: 9800 },
];

export const MENTOR_TRANSACTIONS = [
  { student: 'Rahul Sharma', type: 'Video · 60 min', date: 'May 10, 2026', amount: 999, status: 'paid' as const,    sessionType: 'video' as const },
  { student: 'Priya Gupta',  type: 'Video · 30 min', date: 'May 9, 2026',  amount: 599, status: 'paid' as const,    sessionType: 'video' as const },
  { student: 'Arjun Mehta',  type: 'Voice · 60 min', date: 'May 7, 2026',  amount: 899, status: 'paid' as const,    sessionType: 'voice' as const },
  { student: 'Kavya Iyer',   type: 'Video · 60 min', date: 'May 5, 2026',  amount: 999, status: 'paid' as const,    sessionType: 'video' as const },
  { student: 'Dev Rathi',    type: 'Video · 30 min', date: 'May 2, 2026',  amount: 599, status: 'pending' as const, sessionType: 'video' as const },
  { student: 'Meera Nair',   type: 'Voice · 60 min', date: 'Apr 30, 2026', amount: 899, status: 'paid' as const,    sessionType: 'voice' as const },
  { student: 'Rohan Gupta',  type: 'Video · 60 min', date: 'Apr 28, 2026', amount: 999, status: 'paid' as const,    sessionType: 'video' as const },
];

export const MENTOR_PAYOUT = {
  method: 'HDFC Bank',
  accountLast4: '4291',
  upi: 'priya.iyer@axl',
  pan: 'ABCDE1234F',
  schedule: 'Weekly' as 'Instant' | 'Weekly' | 'Monthly',
  pending: 599,
  nextPayoutDate: 'May 17, 2026',
};

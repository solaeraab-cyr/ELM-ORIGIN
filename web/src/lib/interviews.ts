export type Coach = {
  id: number;
  name: string;
  title: string;
  rating: number;
  sessions: number;
  price: number;
  specialties: string[];
  next: string;
  online: boolean;
  placed: string;
};

export const INTERVIEW_COACHES: Coach[] = [
  { id: 1, name: 'Priya Sharma',    title: 'Data Scientist · Google',  rating: 4.9, sessions: 340, price: 1299, specialties: ['ML', 'System Design'], next: 'Tomorrow · 6:00 PM', online: true,  placed: '180+ at FAANG' },
  { id: 2, name: 'Arjun Mehta',     title: 'Senior Engineer · Stripe', rating: 4.9, sessions: 220, price: 1499, specialties: ['Coding', 'Behavioral'], next: 'Today · 9:00 PM',    online: true,  placed: '90+ at unicorns' },
  { id: 3, name: 'Dr. Elena Rossi', title: 'Admissions · Oxford',      rating: 5.0, sessions: 98,  price: 1999, specialties: ['MBA', 'PhD'],          next: 'Fri · 4:00 PM',      online: false, placed: 'Ivy League admits' },
  { id: 4, name: 'Karan Iyer',      title: 'IIT-B · Interview coach',  rating: 4.9, sessions: 410, price: 899,  specialties: ['JEE Viva', 'IIT prep'], next: 'Today · 7:30 PM',    online: true,  placed: '420+ at IITs' },
];

export const PEER_POOL = [
  { name: 'Dev R.',    level: 'L4', skill: 'DSA',          avatar: 'D', online: true,  xp: 2840 },
  { name: 'Ananya M.', level: 'L5', skill: 'System Design', avatar: 'A', online: true,  xp: 3920 },
  { name: 'Vikram S.', level: 'L3', skill: 'Behavioral',   avatar: 'V', online: true,  xp: 1460 },
  { name: 'Sara C.',   level: 'L4', skill: 'Product',      avatar: 'S', online: true,  xp: 2580 },
  { name: 'Rohan K.',  level: 'L5', skill: 'DSA',          avatar: 'R', online: false, xp: 4210 },
  { name: 'Mei L.',    level: 'L4', skill: 'SQL/Data',     avatar: 'M', online: true,  xp: 2910 },
];

export type InterviewUpcoming = {
  type: 'coach' | 'peer';
  with: string;
  topic: string;
  time: string;
  role: string;
  mins: number;
};

export const INTERVIEW_UPCOMING: InterviewUpcoming[] = [
  { type: 'coach', with: 'Priya Sharma', topic: 'Mock system design · Stripe onsite', time: 'Today · 9:00 PM',    role: 'Staff Eng', mins: 60 },
  { type: 'peer',  with: 'Dev R.',       topic: 'Two Sigma coding round — trade',     time: 'Tomorrow · 5:30 PM', role: 'SWE',       mins: 45 },
];

export const COMPANIES = [
  { name: 'Google', mono: 'G', qs: 142, tone: '#4285F4' },
  { name: 'Stripe', mono: 'S', qs: 88,  tone: '#635BFF' },
  { name: 'Amazon', mono: 'A', qs: 210, tone: '#FF9900' },
  { name: 'Meta',   mono: 'M', qs: 124, tone: '#0866FF' },
];

export const COMPANY_QUESTIONS: Record<string, { q: string; t: string; d: 'Easy' | 'Medium' | 'Hard'; freq: number }[]> = {
  Google: [
    { q: 'Design a URL shortener that handles 100M URLs per day.', t: 'System Design', d: 'Hard', freq: 47 },
    { q: 'Given two sorted arrays, find their median in O(log(min(m,n))).', t: 'Coding', d: 'Hard', freq: 38 },
    { q: 'Tell me about a time you disagreed with your manager.', t: 'Behavioral', d: 'Medium', freq: 62 },
    { q: 'Implement an LRU cache with O(1) get and put.', t: 'Coding', d: 'Medium', freq: 71 },
    { q: "How would you design YouTube's recommendation system?", t: 'System Design', d: 'Hard', freq: 29 },
    { q: 'Reverse a linked list iteratively and recursively.', t: 'Coding', d: 'Easy', freq: 84 },
    { q: 'Why Google? What product would you improve and how?', t: 'Behavioral', d: 'Easy', freq: 91 },
    { q: 'Design a rate limiter for an API.', t: 'System Design', d: 'Medium', freq: 44 },
  ],
  Stripe: [
    { q: 'Design a payment processing pipeline with idempotency.', t: 'System Design', d: 'Hard', freq: 56 },
    { q: 'Detect and merge overlapping intervals.', t: 'Coding', d: 'Medium', freq: 62 },
    { q: "Walk me through how you'd debug a slow API endpoint.", t: 'Behavioral', d: 'Medium', freq: 48 },
    { q: 'Implement a thread-safe in-memory key-value store.', t: 'Coding', d: 'Hard', freq: 33 },
    { q: "Tell me about the most complex system you've built end-to-end.", t: 'Behavioral', d: 'Medium', freq: 71 },
    { q: 'Design a webhook delivery system with retries.', t: 'System Design', d: 'Medium', freq: 39 },
    { q: 'Build a CLI tool that streams large CSV files.', t: 'Coding', d: 'Medium', freq: 27 },
    { q: 'Design Stripe Atlas — incorporation as an API.', t: 'System Design', d: 'Hard', freq: 18 },
  ],
  Amazon: [
    { q: 'Tell me about a time you had to deliver under tight deadline.', t: 'Behavioral', d: 'Easy', freq: 88 },
    { q: 'Implement a trie and use it for autocomplete.', t: 'Coding', d: 'Medium', freq: 54 },
    { q: "Design Amazon's product recommendation engine.", t: 'System Design', d: 'Hard', freq: 42 },
    { q: 'When did you take a calculated risk? What was the outcome?', t: 'Behavioral', d: 'Medium', freq: 67 },
    { q: 'Find the kth largest element in an unsorted array.', t: 'Coding', d: 'Easy', freq: 79 },
    { q: 'Design a warehouse package routing system.', t: 'System Design', d: 'Hard', freq: 31 },
    { q: 'How do you prioritize when everything is urgent?', t: 'Behavioral', d: 'Medium', freq: 58 },
    { q: 'Implement word break / dictionary problem.', t: 'Coding', d: 'Medium', freq: 41 },
  ],
  Meta: [
    { q: "Design Facebook's news feed ranking system.", t: 'System Design', d: 'Hard', freq: 58 },
    { q: 'Validate a binary search tree.', t: 'Coding', d: 'Medium', freq: 73 },
    { q: 'Tell me about a time you took ownership outside your role.', t: 'Behavioral', d: 'Medium', freq: 64 },
    { q: 'Find all anagrams in a string.', t: 'Coding', d: 'Medium', freq: 51 },
    { q: 'Design Instagram Stories.', t: 'System Design', d: 'Hard', freq: 36 },
    { q: 'Why Meta over Google or Apple?', t: 'Behavioral', d: 'Easy', freq: 82 },
    { q: 'Top K frequent elements.', t: 'Coding', d: 'Medium', freq: 49 },
    { q: 'Design a chat system for 1B users.', t: 'System Design', d: 'Hard', freq: 27 },
  ],
};

export type Mentor = {
  id: number;
  name: string;
  title: string;
  rating: number;
  reviews: number;
  students: number;
  price: number;
  subject: string;
  online: boolean;
  tags: string[];
};

export const MENTORS: Mentor[] = [
  { id: 1, name: 'Priya Sharma',    title: 'Data Scientist · Google',           rating: 4.9, reviews: 312, students: 1840, price: 599,  subject: 'Mathematics · Data Science',     online: true,  tags: ['Mathematics', 'Data Science', 'Python'] },
  { id: 2, name: 'Arjun Mehta',     title: 'Senior Engineer · Stripe',          rating: 4.8, reviews: 184, students: 920,  price: 799,  subject: 'Computer Science',               online: true,  tags: ['Computer Science', 'React', 'System Design'] },
  { id: 3, name: 'Dr. Elena Rossi', title: 'PhD · Cognitive Science · Oxford',  rating: 5.0, reviews: 98,  students: 340,  price: 999,  subject: 'Writing · Research',             online: false, tags: ['Writing', 'Research', 'Psychology'] },
  { id: 4, name: 'Karan Iyer',      title: 'IIT-JEE Coach · 8 yrs',             rating: 4.9, reviews: 521, students: 2400, price: 499,  subject: 'Physics · Mathematics',          online: true,  tags: ['Mathematics', 'Physics', 'JEE'] },
  { id: 5, name: 'Sara Chen',       title: 'Product Designer · Linear',         rating: 4.9, reviews: 142, students: 580,  price: 899,  subject: 'Design',                          online: false, tags: ['Design', 'UX', 'Portfolio Review'] },
  { id: 6, name: 'Dr. Rahul Nair',  title: 'Cardiologist · AIIMS',              rating: 4.9, reviews: 76,  students: 210,  price: 1299, subject: 'Medicine',                        online: false, tags: ['Medicine', 'NEET PG'] },
];

export const getMentor = (id: number | string): Mentor | undefined => {
  const n = typeof id === 'string' ? parseInt(id, 10) : id;
  return MENTORS.find(m => m.id === n);
};

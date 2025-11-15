/**
 * Student Service - Manages student data (CRUD operations)
 * Currently uses hardcoded data, will be replaced with API calls later
 */

export interface Student {
  id: string;
  name: string;
  age: number;
  gender: 'Nam' | 'Nữ';
}

// Hardcoded initial data - 2 sample students
let students: Student[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    age: 20,
    gender: 'Nam',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    age: 19,
    gender: 'Nữ',
  },
];

// Age options for dropdown (18-30)
export const AGE_OPTIONS = Array.from({ length: 13 }, (_, i) => i + 18);

// Gender options
export const GENDER_OPTIONS: ('Nam' | 'Nữ')[] = ['Nam', 'Nữ'];

/**
 * Get all students
 */
export function getAllStudents(): Student[] {
  return [...students];
}

/**
 * Get student by ID
 */
export function getStudentById(id: string): Student | undefined {
  return students.find(student => student.id === id);
}

/**
 * Create a new student
 */
export function createStudent(studentData: Omit<Student, 'id'>): Student {
  const newStudent: Student = {
    id: Date.now().toString(), // Simple ID generation
    ...studentData,
  };
  students.push(newStudent);
  return newStudent;
}

/**
 * Update an existing student
 */
export function updateStudent(id: string, studentData: Partial<Omit<Student, 'id'>>): Student | null {
  const index = students.findIndex(student => student.id === id);
  if (index === -1) {
    return null;
  }
  
  students[index] = {
    ...students[index],
    ...studentData,
  };
  
  return students[index];
}

/**
 * Delete a student
 */
export function deleteStudent(id: string): boolean {
  const index = students.findIndex(student => student.id === id);
  if (index === -1) {
    return false;
  }
  
  students.splice(index, 1);
  return true;
}


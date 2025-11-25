import axiosInstance from "../lib/axios";
import { API_BASE_URL } from "../config/apiUrls";

export interface Student {
  id: number;
  name: string;
  age: number;
  gender: "NAM" | "NU";
}

export type CreateStudentPayload = Omit<Student, "id">;
export type UpdateStudentPayload = Partial<Omit<Student, "id">>;

const STUDENT_ENDPOINT = `${API_BASE_URL}/api/students`;

// Age options for dropdown (18-30)
export const AGE_OPTIONS = Array.from({ length: 13 }, (_, i) => i + 18);

// Gender options aligned with backend enum
export const GENDER_OPTIONS: Student["gender"][] = ["NAM", "NU"];

export const GENDER_LABELS: Record<Student["gender"], string> = {
  NAM: "Nam",
  NU: "Nữ",
};

/**
 * Fetch all students from backend
 */
export async function getAllStudents(): Promise<Student[]> {
  const response = await axiosInstance.get<Student[]>(STUDENT_ENDPOINT);
  return response.data ?? [];
}

/**
 * Fetch student by ID
 */
export async function getStudentById(id: number): Promise<Student> {
  const response = await axiosInstance.get<Student>(`${STUDENT_ENDPOINT}/${id}`);
  return response.data;
}

/**
 * Create a new student
 */
export async function createStudent(payload: CreateStudentPayload): Promise<void> {
  await axiosInstance.post(STUDENT_ENDPOINT, payload);
}

/**
 * Update an existing student
 */
export async function updateStudent(
  id: number,
  payload: UpdateStudentPayload
): Promise<void> {
  await axiosInstance.put(`${STUDENT_ENDPOINT}/${id}`, payload);
}

/**
 * Delete a student
 */
export async function deleteStudent(id: number): Promise<void> {
  await axiosInstance.delete(`${STUDENT_ENDPOINT}/${id}`);
}


import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { authService, type UserData } from "../models/authService";
import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  type Student,
  AGE_OPTIONS,
  GENDER_OPTIONS,
} from "../models/studentService";
import { trackEvent } from "../lib/analytics";

type StudentFormState = {
  name: string;
  age: number;
  gender: Student["gender"];
};

export function useStudentController() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<StudentFormState>({
    name: "",
    age: 18,
    gender: "Nam",
  });
  const listRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef<number>(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authCheck = await authService.checkAuth();

        if (!authCheck.success || (!authCheck.data && !authCheck.user)) {
          navigate("/login", { replace: true });
          return;
        }

        const response = await authService.getCurrentUser();
        if (response.success && (response.data || response.user)) {
          const userData = (response.user || response.data) as UserData;
          setUser(userData);
          setError(null);

          trackEvent({
            category: "Student",
            action: "Page View",
            label: "Student Management",
          });
        } else {
          setError("Không thể lấy thông tin người dùng");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Không thể lấy thông tin người dùng"
        );
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    setStudents(getAllStudents());
    // eslint-disable-next-line no-console
    console.log("Loaded students from storage");
  }, []);

  useEffect(() => {
    const listElement = listRef.current;
    if (!listElement) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;
    let lastTrackedScroll = 0;

    const handleScroll = () => {
      const scrollTop = listElement.scrollTop;
      const scrollDirection = scrollTop > lastScrollTop.current ? "down" : "up";
      lastScrollTop.current = scrollTop;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollDiff = Math.abs(scrollTop - lastTrackedScroll);
        if (scrollDiff >= 100) {
          trackEvent({
            category: "Student",
            action: "Scroll",
            label: `Student List - ${scrollDirection}`,
            value: Math.floor(scrollTop / 100),
          });
          lastTrackedScroll = scrollTop;
        }
      }, 200);
    };

    listElement.addEventListener("scroll", handleScroll);
    return () => {
      listElement.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [students]);

  const openForm = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        age: student.age,
        gender: student.gender,
      });
    } else {
      setEditingStudent(null);
      setFormData({
        name: "",
        age: 18,
        gender: "Nam",
      });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingStudent(null);
    setFormData({
      name: "",
      age: 18,
      gender: "Nam",
    });
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.warning("Vui lòng nhập tên học sinh", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (editingStudent) {
      const updated = updateStudent(editingStudent.id, formData);
      if (updated) {
        setStudents(getAllStudents());
        trackEvent({
          category: "Student",
          action: "Update",
          label: `Student ID: ${updated.id}`,
        });
        toast.success("Cập nhật học sinh thành công!", {
          position: "top-right",
          autoClose: 3000,
        });
        closeForm();
      } else {
        toast.error("Không thể cập nhật học sinh. Vui lòng thử lại!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } else {
      const newStudent = createStudent(formData);
      setStudents(getAllStudents());
      trackEvent({
        category: "Student",
        action: "Create",
        label: `Student ID: ${newStudent.id}`,
      });
      toast.success("Thêm học sinh mới thành công!", {
        position: "top-right",
        autoClose: 3000,
      });
      closeForm();
    }
  };

  const deleteStudentById = async (id: string) => {
    const student = students.find((s) => s.id === id);
    const studentName = student?.name || "học sinh này";

    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: `Bạn có chắc chắn muốn xóa học sinh "${studentName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const deleted = deleteStudent(id);
      if (deleted) {
        setStudents(getAllStudents());
        trackEvent({
          category: "Student",
          action: "Delete",
          label: `Student ID: ${id}`,
        });
        toast.success("Xóa học sinh thành công!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Không thể xóa học sinh. Vui lòng thử lại!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({ ...prev, name: value }));
  };

  const handleAgeChange = (value: number) => {
    setFormData((prev) => ({ ...prev, age: value }));
  };

  const handleGenderChange = (value: Student["gender"]) => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  return {
    user,
    loading,
    error,
    students,
    isFormOpen,
    editingStudent,
    formData,
    ageOptions: AGE_OPTIONS,
    genderOptions: GENDER_OPTIONS,
    listRef,
    openForm,
    closeForm,
    submitForm,
    deleteStudent: deleteStudentById,
    handleNameChange,
    handleAgeChange,
    handleGenderChange,
  };
}


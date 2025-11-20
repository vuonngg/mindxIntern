import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { authService, type UserData } from "../services/authService";
import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  type Student,
  AGE_OPTIONS,
  GENDER_OPTIONS,
} from "../services/studentService";
import { trackEvent, trackButtonClick } from "../lib/analytics";
import Header from "../components/Header";
import "./StudentPage.css";

export default function StudentPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    age: 18,
    gender: "Nam" as "Nam" | "Nữ",
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
    // Load students from service
    setStudents(getAllStudents());
    console.log("Loaded students from storage");
  }, []);

  // Track scroll events
  useEffect(() => {
    const listElement = listRef.current;
    if (!listElement) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;
    let lastTrackedScroll = 0;

    const handleScroll = () => {
      const scrollTop = listElement.scrollTop;
      const scrollDirection = scrollTop > lastScrollTop.current ? "down" : "up";
      lastScrollTop.current = scrollTop;

      // Track scroll every 100px (throttled)
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

  const handleOpenForm = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        age: student.age,
        gender: student.gender,
      });
      trackButtonClick("Edit Student Button", "Student Page");
    } else {
      setEditingStudent(null);
      setFormData({
        name: "",
        age: 18,
        gender: "Nam",
      });
      trackButtonClick("Create Student Button", "Student Page");
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingStudent(null);
    setFormData({
      name: "",
      age: 18,
      gender: "Nam",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.warning("Vui lòng nhập tên học sinh", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (editingStudent) {
      // Update existing student
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
        handleCloseForm();
      } else {
        toast.error("Không thể cập nhật học sinh. Vui lòng thử lại!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } else {
      // Create new student
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
      handleCloseForm();
    }
  };

  const handleDelete = async (id: string) => {
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

  if (loading) {
    return (
      <div className="student-container">
        <div className="loading-spinner">Đang tải...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="student-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="student-container">
      <Header user={user} />

      <main className="student-main">
        <div className="student-content">
          <div className="student-header">
            <h1>Quản lý học sinh</h1>
            <button
              className="btn btn-primary"
              onClick={() => handleOpenForm()}
            >
              + Thêm học sinh
            </button>
          </div>

          {/* Student List */}
          <div className="student-list-container" ref={listRef}>
            {students.length === 0 ? (
              <div className="empty-state">
                <p>Chưa có học sinh nào. Hãy thêm học sinh mới!</p>
              </div>
            ) : (
              <div className="student-list">
                {students.map((student) => (
                  <div key={student.id} className="student-card">
                    <div className="student-info">
                      <h3>{student.name}</h3>
                      <div className="student-details">
                        <span className="detail-item">
                          <strong>Tuổi:</strong> {student.age}
                        </span>
                        <span className="detail-item">
                          <strong>Giới tính:</strong> {student.gender}
                        </span>
                      </div>
                    </div>
                    <div className="student-actions">
                      <button
                        className="btn btn-edit"
                        onClick={() => {
                          trackButtonClick(
                            "Edit Student Button",
                            "Student List"
                          );
                          handleOpenForm(student);
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-delete"
                        onClick={() => {
                          trackButtonClick(
                            "Delete Student Button",
                            "Student List"
                          );
                          handleDelete(student.id);
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingStudent ? "Sửa học sinh" : "Thêm học sinh mới"}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  trackButtonClick("Close Modal Button", "Student Form");
                  handleCloseForm();
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="student-form">
              <div className="form-group">
                <label htmlFor="name">Tên học sinh *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nhập tên học sinh"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="age">Tuổi *</label>
                <select
                  id="age"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: parseInt(e.target.value) })
                  }
                  required
                >
                  {AGE_OPTIONS.map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="gender">Giới tính *</label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gender: e.target.value as "Nam" | "Nữ",
                    })
                  }
                  required
                >
                  {GENDER_OPTIONS.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    trackButtonClick("Cancel Form Button", "Student Form");
                    handleCloseForm();
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={() => {
                    trackButtonClick(
                      editingStudent
                        ? "Update Submit Button"
                        : "Create Submit Button",
                      "Student Form"
                    );
                  }}
                >
                  {editingStudent ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

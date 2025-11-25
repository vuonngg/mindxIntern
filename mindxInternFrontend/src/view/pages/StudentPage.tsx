import { trackButtonClick } from "../../lib/analytics";
import Header from "../Header";
import "./StudentPage.css";
import { useStudentController } from "../../controllers/useStudentController";

export default function StudentPage() {
  const {
    user,
    loading,
    error,
    students,
    isFormOpen,
    editingStudent,
    formData,
    ageOptions,
    genderOptions,
    listRef,
    openForm,
    closeForm,
    submitForm,
    deleteStudent,
    handleNameChange,
    handleAgeChange,
    handleGenderChange,
  } = useStudentController();

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
              onClick={() => {
                trackButtonClick("Create Student Button", "Student Page");
                openForm();
              }}
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
                          openForm(student);
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
                          deleteStudent(student.id);
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
        <div
          className="modal-overlay"
          onClick={() => {
            trackButtonClick("Close Modal Overlay", "Student Form");
            closeForm();
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingStudent ? "Sửa học sinh" : "Thêm học sinh mới"}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  trackButtonClick("Close Modal Button", "Student Form");
                  closeForm();
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={submitForm} className="student-form">
              <div className="form-group">
                <label htmlFor="name">Tên học sinh *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Nhập tên học sinh"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="age">Tuổi *</label>
                <select
                  id="age"
                  value={formData.age}
                  onChange={(e) => handleAgeChange(parseInt(e.target.value))}
                  required
                >
                  {ageOptions.map((age) => (
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
                    handleGenderChange(e.target.value as "Nam" | "Nữ")
                  }
                  required
                >
                  {genderOptions.map((gender) => (
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
                    closeForm();
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

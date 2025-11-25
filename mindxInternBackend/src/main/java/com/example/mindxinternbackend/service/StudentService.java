package com.example.mindxinternbackend.service;

import com.example.mindxinternbackend.dao.StudentDao;
import com.example.mindxinternbackend.entity.Student;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentDao studentDao;

    public void createStudent(Student student) {
        if (student.getAge() == null || student.getAge() < 18 || student.getAge() > 50) {
            throw new IllegalArgumentException("Tuổi phải từ 18 đến 50.");
        }
        studentDao.create(student);
    }

    public Student findStudentById(Integer id) {
        Student student = studentDao.findById(id);

        if (student == null) {
            throw new RuntimeException("Không tìm thấy sinh viên với ID: " + id);
        }
        return student;
    }

    public List<Student> findAllStudents() {
        return studentDao.findAll();
    }

    public void updateStudent(Integer id, Student updatedStudent) {
        if (studentDao.findById(id) == null) {
            throw new RuntimeException("Không tìm thấy sinh viên cần cập nhật.");
        }

        studentDao.update(id, updatedStudent);
    }

    public void deleteStudent(Integer id) {
        studentDao.delete(id);
    }
}
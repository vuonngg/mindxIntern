package com.example.mindxinternbackend.dao;

import com.example.mindxinternbackend.entity.Student;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class StudentDaoImpl implements StudentDao {
    List<Student> students = new ArrayList<>();
    private Integer nextId = 1;

    public StudentDaoImpl() {
        students.add(new Student(1, "Hoàng Ngọc Vương", 22, Student.Gender.NAM));
        students.add(new Student(2, "Hoàng Nguyên Phúc", 22, Student.Gender.NAM));
        students.add(new Student(3, "Nguyễn Thu Ngọc", 22, Student.Gender.NU));
        this.nextId = 4;
    }

    @Override
    public Student findById(Integer id) {
        for (Student s : students) {
            if (s.getId() == id) {
                return s;
            }
        }
        return null;
    }

    @Override
    public List<Student> findAll() {
        System.out.println("lay ra thanh cong list student");

        return students;
    }

    @Override
    public void update(Integer id, Student student) {
        Student existingStudent = findById(id);
        if (existingStudent != null) {
            // Cập nhật thông tin student tìm được bằng thông tin mới
            existingStudent.setName(student.getName());
            existingStudent.setAge(student.getAge());
            existingStudent.setGender(student.getGender());
            System.out.println("cap nhat thanh cong student");
        }
    }

    @Override
    public void create(Student student) {

        student.setId(this.nextId);

        // 2. Thêm đối tượng sinh viên đã có ID vào List
        students.add(student);
        System.out.println("them thanh cong student");


        // 3. Tăng bộ đếm ID cho lần tạo tiếp theo
        this.nextId++;
    }

    @Override
    public void delete(Integer id) {
        Student studentToDelete = findById(id);
        if (studentToDelete != null) {
            students.remove(studentToDelete);
            System.out.println("xoa thanh cong student");

        }
    }
}

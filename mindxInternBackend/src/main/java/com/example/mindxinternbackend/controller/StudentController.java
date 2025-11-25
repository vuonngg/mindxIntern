package com.example.mindxinternbackend.controller;

import com.example.mindxinternbackend.entity.Student;
import com.example.mindxinternbackend.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    // CREATE (POST)
    @PostMapping
    public ResponseEntity<Void> createStudent(@RequestBody Student student) {
        studentService.createStudent(student);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    // READ ALL (GET)
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        List<Student> students = studentService.findAllStudents();
        return ResponseEntity.ok(students);
    }

    // READ BY ID (GET)
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Integer id) {
        Student student = studentService.findStudentById(id);
        return ResponseEntity.ok(student);
    }

    // UPDATE (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateStudent(@PathVariable Integer id, @RequestBody Student studentDetails) {
        studentService.updateStudent(id, studentDetails);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // DELETE (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Integer id) {
        studentService.deleteStudent(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
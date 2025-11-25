package com.example.mindxinternbackend.dao;

import com.example.mindxinternbackend.entity.Student;

import java.util.List;

public interface StudentDao {
    Student findById(Integer id) ;
    List<Student> findAll();
    void update(Integer id, Student student);
    void create(Student student);
    void delete(Integer id);
}

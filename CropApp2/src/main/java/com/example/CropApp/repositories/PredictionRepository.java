package com.example.CropApp.repositories;

import com.example.CropApp.entities.Prediction;
import com.example.CropApp.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Integer> {
    List<Prediction> findByUser(User user);
}

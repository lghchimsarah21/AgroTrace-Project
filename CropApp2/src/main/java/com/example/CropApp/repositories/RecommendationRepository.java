package com.example.CropApp.repositories;

import com.example.CropApp.entities.Recommendation;
import com.example.CropApp.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findByUser(User user);
}
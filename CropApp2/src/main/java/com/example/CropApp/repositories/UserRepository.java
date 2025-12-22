package com.example.CropApp.repositories;



import java.util.Optional;

import com.example.CropApp.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    Optional<User> findByUsernameOrEmail(String username, String email);
    User findByEmail(String email);

}
package com.example.CropApp.services;


import com.example.CropApp.entities.User;
import org.springframework.stereotype.Service;


public interface UserService {

    User findUserProfileByJwt(String jwt) throws Exception;

    User findUserByEmail(String email) throws Exception;

    User findUserById(Long userId) throws Exception;



}

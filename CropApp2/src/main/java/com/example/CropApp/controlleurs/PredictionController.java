package com.example.CropApp.controlleurs;

import com.example.CropApp.entities.Prediction;
import com.example.CropApp.entities.User;
import com.example.CropApp.services.PredictionService;
import com.example.CropApp.services.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    @Autowired
    private PredictionService predictionService;

    @Autowired
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;


    @PostMapping("/predict")
    public ResponseEntity<Map<String, Object>> predictCropYield(@RequestBody Map<String, Object> requestData, @RequestHeader("Authorization") String jwt) {
        try {
            System.out.println("Received predictionRequest: " + requestData);
            Map<String, Object> response = predictionService.callFlaskApi(requestData, jwt);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("ERROR in PredictionController: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }


    @GetMapping("/my-predictions")
    public ResponseEntity<List<Prediction>> getMyPredictions(@RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        try {
            List<Prediction> predictions = predictionService.getPredictionsForAuthenticatedUser(user);
            return ResponseEntity.ok(predictions);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }


    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> predictionDelete(@PathVariable Integer id) {
        predictionService.deletePrediciton(id);
        return ResponseEntity.ok("Prediction deleted");
    }
}
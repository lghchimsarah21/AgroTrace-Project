package com.example.CropApp.controlleurs;

import com.example.CropApp.entities.Recommendation;
import com.example.CropApp.entities.User;
import com.example.CropApp.services.RecommendationService;
import com.example.CropApp.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private UserService userService;

    /**
     * Générer une nouvelle recommandation
     */
    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateRecommendation(
            @RequestBody Map<String, Object> requestData,
            @RequestHeader("Authorization") String jwt) {

        try {
            System.out.println("Received requestData: " + requestData);

            // Appeler le service Flask via RecommendationService
            Map<String, Object> response = recommendationService.generateRecommendation(requestData, jwt);

            System.out.println("Flask response: " + response);

            if (response == null || response.isEmpty()) {
                throw new RuntimeException("Empty or null response from Flask service");
            }

            if (!response.containsKey("result")) {
                throw new RuntimeException("Expected key 'result' not found in response");
            }

            Object resultObject = response.get("result");
            if (resultObject == null) {
                throw new RuntimeException("The value associated with 'result' is null");
            }

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Une erreur s'est produite lors du traitement de la demande.");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Récupérer toutes les recommandations de l'utilisateur connecté
     */
    @GetMapping("/my-recommendations")
    public ResponseEntity<List<Recommendation>> getMyRecommendations(@RequestHeader("Authorization") String jwt) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            List<Recommendation> recommendations = recommendationService.getRecommendationsForAuthenticatedUser(user);
            return ResponseEntity.ok(recommendations);
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Supprimer une recommandation par son ID
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Map<String, Object>> deleteRecommendation(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            recommendationService.deleteRecommendation(id);
            response.put("message", "Recommendation deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            e.printStackTrace();
            response.put("error", "Failed to delete recommendation");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}

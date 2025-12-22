package com.example.CropApp.services;

import com.example.CropApp.entities.Recommendation;
import com.example.CropApp.entities.User;
import com.example.CropApp.repositories.RecommendationRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RecommendationService {

    private final RestTemplate restTemplate;

    @Autowired
    private UserService userService;

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    public RecommendationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Appel au service Flask pour générer une recommandation avec Circuit Breaker
     */
    @Transactional
    @CircuitBreaker(name = "flaskRecommendationService", fallbackMethod = "recommendationFallback")
    public Map<String, Object> generateRecommendation(Map<String, Object> inputData, String jwt) throws Exception {
        String flaskApiUrl = "http://apiprediction1:5000/crop-predict";

        // Préparer les en-têtes
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(inputData, headers);

        // Appel à Flask
        ResponseEntity<Map> response = restTemplate.postForEntity(flaskApiUrl, request, Map.class);

        if (response == null || response.getBody() == null) {
            throw new RuntimeException("La réponse de l'API Flask est vide ou invalide.");
        }

        Map<String, Object> responseBody = response.getBody();
        Map<String, Object> responsee = (Map<String, Object>) responseBody.get("response");
        Map<String, Object> result = (Map<String, Object>) responsee.get("result");

        Map<String, Object> formData = (Map<String, Object>) inputData.get("formdata");

        // Extraction de chart_data et détermination du crop recommandé
        Map<String, Double> chartData = (Map<String, Double>) result.get("chart_data");
        if (chartData == null || chartData.size() < 4) {
            throw new RuntimeException("Structure invalide dans la réponse Flask.");
        }

        String maxCrop = null;
        Double maxValue = Double.NEGATIVE_INFINITY;
        for (Map.Entry<String, Double> entry : chartData.entrySet()) {
            if (entry.getValue() > maxValue) {
                maxValue = entry.getValue();
                maxCrop = entry.getKey();
            }
        }

        // Extraction des valeurs spécifiques
        String recommendedCrop = maxCrop;
        Double temperature = Double.valueOf(result.get("temperature").toString());
        Double humidity = Double.valueOf(result.get("humidity").toString());
        Double rainfall = Double.valueOf(result.get("rainfall").toString());

        // Création et sauvegarde de la recommandation
        Recommendation recommendation = new Recommendation();
        recommendation.setNitrogen(Double.valueOf(formData.get("nitrogen").toString()));
        recommendation.setPhosphorous(Double.valueOf(formData.get("phosphorous").toString()));
        recommendation.setPottasium(Double.valueOf(formData.get("pottasium").toString()));
        recommendation.setPh(Double.valueOf(formData.get("ph").toString()));
        recommendation.setSeason(formData.get("season").toString());
        recommendation.setCity(formData.get("city").toString());
        recommendation.setTemperature(temperature);
        recommendation.setHumidity(humidity);
        recommendation.setRainfall(rainfall);
        recommendation.setResult(recommendedCrop);
        recommendation.setDate(LocalDateTime.now());

        User authenticatedUser = userService.findUserProfileByJwt(jwt);
        recommendation.setUser(authenticatedUser);

        Recommendation savedRecommendation = recommendationRepository.save(recommendation);

        Map<String, Object> finalResponse = new HashMap<>();
        finalResponse.put("id", savedRecommendation.getId());
        finalResponse.put("result", result);

        return finalResponse;
    }

    /**
     * Fallback si Flask est indisponible
     */
    public Map<String, Object> recommendationFallback(Map<String, Object> inputData, String jwt, Throwable t) {
        Map<String, Object> fallbackResponse = new HashMap<>();
        fallbackResponse.put("error", "Le service de recommandation est temporairement indisponible. Veuillez réessayer plus tard.");
        return fallbackResponse;
    }

    /**
     * Récupérer toutes les recommandations d’un utilisateur
     */
    public List<Recommendation> getRecommendationsForAuthenticatedUser(User user) {
        return recommendationRepository.findByUser(user);
    }

    /**
     * Supprimer une recommandation par ID
     */
    public void deleteRecommendation(Long id) {
        if (recommendationRepository.existsById(id)) {
            recommendationRepository.deleteById(id);
        } else {
            throw new RuntimeException("Recommendation not found with id: " + id);
        }
    }
}

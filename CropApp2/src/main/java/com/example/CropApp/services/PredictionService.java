package com.example.CropApp.services;

import com.example.CropApp.entities.Prediction;
import com.example.CropApp.entities.User;
import com.example.CropApp.repositories.PredictionRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
public class PredictionService {

    private final RestTemplate restTemplate;

    @Autowired
    private UserService userService;

    @Autowired
    private PredictionRepository predictionRepository;

    @Autowired
    public PredictionService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Transactional
    @CircuitBreaker(name = "flaskApiService", fallbackMethod = "flaskFallback")
    public Map<String, Object> callFlaskApi(Map<String, Object> requestData, String jwt) {
        String flaskApiUrl = "http://apiprediction1:5000/crop-yield-predict";

        if (requestData == null || !requestData.containsKey("formdata")) {
            return flaskFallback(requestData, jwt, new IllegalArgumentException("formdata manquant"));
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestData, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(flaskApiUrl, request, Map.class);

            if (response == null || response.getBody() == null) {
                return flaskFallback(requestData, jwt, new RuntimeException("Réponse Flask vide"));
            }

            Map<String, Object> responseBody = response.getBody();
            Map<String, Object> responsee = (Map<String, Object>) responseBody.getOrDefault("response", null);
            if (responsee == null) return flaskFallback(requestData, jwt, new RuntimeException("Clé 'response' manquante"));

            Map<String, Object> result = (Map<String, Object>) responsee.getOrDefault("result", null);
            if (result == null) return flaskFallback(requestData, jwt, new RuntimeException("Clé 'result' manquante"));

            // Extraction des champs
            Map<String, Object> formData = (Map<String, Object>) requestData.get("formdata");
            String city = (String) formData.get("city");
            String crop = (String) formData.get("crop");
            Float area = Float.valueOf(formData.get("area").toString());
            Float humidity = Float.valueOf(result.get("humidity").toString());
            Float temperature = Float.valueOf(result.get("temperature").toString());
            Float rainfall = Float.valueOf(result.get("rainfall").toString());
            Float prediction = Float.valueOf(result.get("prediction").toString());

            Prediction newPrediction = new Prediction();
            newPrediction.setCity(city);
            newPrediction.setCrop(crop);
            newPrediction.setArea(area);
            newPrediction.setHumidity(humidity);
            newPrediction.setTemperature(temperature);
            newPrediction.setRainfall(rainfall);
            newPrediction.setResult(prediction);
            newPrediction.setDate(LocalDateTime.now());
            newPrediction.setUser(userService.findUserProfileByJwt(jwt));

            Prediction savedPrediction = predictionRepository.save(newPrediction);

            Map<String, Object> finalResponse = new HashMap<>();
            finalResponse.put("id", savedPrediction.getId());
            finalResponse.put("result", result);

            return finalResponse;

        } catch (Exception e) {
            return flaskFallback(requestData, jwt, e);
        }
    }


    // Fallback si Flask est indisponible
    public Map<String, Object> flaskFallback(Map<String, Object> requestData, String jwt, Throwable t) {
        Map<String, Object> fallbackResponse = new HashMap<>();
        fallbackResponse.put("error", "Le service de prédiction est temporairement indisponible. Veuillez réessayer plus tard.");
        fallbackResponse.put("result", new HashMap<>()); // Ajouté pour éviter undefined
        return fallbackResponse;
    }
    public List<Prediction> getPredictionsForAuthenticatedUser(User user) {
        return predictionRepository.findByUser(user);
    }

    public void deletePrediciton(Integer id) {
        if (predictionRepository.existsById(id)) {
            predictionRepository.deleteById(id);
        } else {
            throw new RuntimeException("Prediction not found with id: " + id);
        }
    }
}

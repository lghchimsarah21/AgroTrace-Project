package com.example.CropApp.controlleurs;

import com.example.CropApp.repositories.RecommendationRepository;
import com.example.CropApp.services.EmailService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/emails")
public class EmailController {

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    private EmailService emailService;




    @PostMapping("/send-support")
    public ResponseEntity<String> sendSupportMessage(@RequestBody Map<String, String> request) {
        String message = request.get("message"); // Extract the "message" field from JSON
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Message cannot be empty");
        }

        emailService.sendToSupport(message);
        return ResponseEntity.ok("Message sent to support successfully!");
    }

    @PostMapping("/send-prediction/{id}")
    public ResponseEntity<String> sendPredictionEmail(@PathVariable Integer id, @RequestBody Map<String, String> requestBody) {
        try {
            String to = requestBody.get("email");

            // Vérification de l'email
            if (to == null || to.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("L'e-mail est requis.");
            }

            // Appel au service pour envoyer l'email
            emailService.sendPredictionEmail(to, id);

            return ResponseEntity.ok("E-mail envoyé avec succès à : " + to);
        } catch (MessagingException e) {
            return ResponseEntity.status(500).body("Erreur lors de l'envoi de l'e-mail : " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Erreur : " + e.getMessage());
        }
    }

    @PostMapping("/send-recommendation/{id}")
    public ResponseEntity<String> sendRecommendationEmail(@PathVariable Long id, @RequestBody Map<String, String> requestBody) {
        try {
            String to = requestBody.get("email");

            // Vérification de l'email
            if (to == null || to.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("L'e-mail est requis.");
            }

            // Appel au service pour envoyer l'email
            emailService.sendRecommendationEmail(to, id);

            return ResponseEntity.ok("E-mail envoyé avec succès à : " + to);
        } catch (MessagingException e) {
            return ResponseEntity.status(500).body("Erreur lors de l'envoi de l'e-mail : " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Erreur : " + e.getMessage());
        }
    }


}
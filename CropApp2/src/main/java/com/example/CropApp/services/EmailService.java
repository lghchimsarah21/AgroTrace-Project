package com.example.CropApp.services;

import com.example.CropApp.entities.Prediction;
import com.example.CropApp.entities.Recommendation;
import com.example.CropApp.repositories.PredictionRepository;
import com.example.CropApp.repositories.RecommendationRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private PredictionRepository predictionRepository;

    @Autowired
    private RecommendationRepository recommendationRepository;

    private static final String SUPPORT_EMAIL = "othmaanedbibih@gmail.com";
    @Value("${spring.mail.username}") // Your sender email
    private String fromEmail;


    public void sendToSupport(String message) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(SUPPORT_EMAIL);
            helper.setSubject("Support Request: Recommendation Issue");

            // Create a formatted HTML message
            String htmlContent = """
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #007BFF;">New Support Request</h2>
                    <p><strong>Message:</strong></p>
                    <blockquote style="background: #f8f9fa; padding: 10px; border-left: 5px solid #007BFF;">
                        %s
                    </blockquote>
                </body>
                </html>
                """.formatted(message);

            helper.setText(htmlContent, true); // Enable HTML content
            mailSender.send(mimeMessage);

        } catch (MessagingException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public void sendPredictionEmail(String to, Integer predictionId) throws MessagingException {
        if (to == null || to.isEmpty()) {
            throw new IllegalArgumentException("L'adresse e-mail du destinataire est obligatoire.");
        }

        Prediction prediction = predictionRepository.findById(predictionId)
                .orElseThrow(() -> new IllegalArgumentException("Aucune prédiction trouvée pour l'ID : " + predictionId));

        String subject = "Votre prédiction de rendement agricole";
        String content =
                "<div style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>" +
                        "<div style='text-align: center; padding: 20px; background-color: #f7f7f7;'>" +
                        "<img src='cid:logoImage' alt='Logo' style='max-width: 150px; margin-bottom: 20px;' />" +
                        "<h1 style='color: #0056b3;'>Votre Prédiction Agricole</h1>" +
                        "</div>" +
                        "<div style='padding: 20px;'>" +
                        "<p>Bonjour,</p>" +
                        "<p>Nous avons le plaisir de vous partager les résultats de votre prédiction agricole :</p>" +
                        "<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>" +
                        "<tr style='background-color: #f0f8ff;'>" +
                        "<th style='padding: 10px; border: 1px solid #ddd;'>Détail</th>" +
                        "<th style='padding: 10px; border: 1px solid #ddd;'>Valeur</th>" +
                        "</tr>" +
                        "<tr>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>Rendement estimé</td>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>" + prediction.getResult() + " kg</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>Température</td>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>" + prediction.getTemperature() + " °C</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>Humidité</td>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>" + prediction.getHumidity() + " %</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>Précipitations</td>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>" + prediction.getRainfall() + " mm</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>Ville</td>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>" + prediction.getCity() + "</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>Superficie</td>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>" + prediction.getArea() + " hectares</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>Type de culture</td>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>" + prediction.getCrop() + "</td>" +
                        "</tr>" +
                        "</table>" +
                        "<p>Merci d'utiliser notre service de prédiction agricole. Nous espérons que ces informations vous seront utiles.</p>" +
                        "<p style='font-size: 12px; color: #888;'>Cordialement,<br>L'équipe de Prédiction Agricole</p>" +
                        "</div>" +
                        "</div>";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setFrom("errobi200@gmail.com");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true);

        // Ajouter une image en tant que pièce jointe avec Content-ID
        ClassPathResource resource = new ClassPathResource("/static/logo.png"); // Chemin de l'image
        helper.addInline("logoImage", resource);

        mailSender.send(message);
    }

    public void sendRecommendationEmail(String to, Long recommendationId) throws MessagingException {
        if (to == null || to.isEmpty()) {
            throw new IllegalArgumentException("L'adresse e-mail du destinataire est obligatoire.");
        }

        // Récupérer la recommendation depuis la base de données
        Recommendation recommendation = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new IllegalArgumentException("Aucune recommendation trouvée pour l'ID : " + recommendationId));

        String subject = "Votre recommandation agricole personnalisée";
        String content =
                "<div style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>" +
                        "<div style='text-align: center; padding: 20px; background-color: #f7f7f7;'>" +
                        "<img src='cid:logoImage' alt='Logo' style='max-width: 150px; margin-bottom: 20px;' />" +
                        "<h1 style='color: #0056b3;'>Votre Recommandation Agricole</h1>" +
                        "</div>" +
                        "<div style='padding: 20px;'>" +
                        "<p>Bonjour,</p>" +
                        "<p>Voici votre recommandation agricole personnalisée :</p>" +
                        "<p>La culture la plus recommandée dans votre ferme est : " + recommendation.getResult() + "</p>" +
                        "<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>" +
                        "<tr style='background-color: #f0f8ff;'>" +
                        "<th style='padding: 10px; border: 1px solid #ddd;'>Détail</th>" +
                        "<th style='padding: 10px; border: 1px solid #ddd;'>Valeur</th>" +
                        "</tr>" +
                        "<tr>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>La culture recommendé</td>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>" + recommendation.getResult() + "</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>Température</td>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>" + recommendation.getTemperature() + " °C</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>Humidité</td>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>" + recommendation.getHumidity() + " %</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>Précipitations</td>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>" + recommendation.getRainfall() + " mm</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>Saison</td>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>" + recommendation.getSeason() + "</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>Ville</td>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>" + recommendation.getCity() + "</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>Azote (Nitrogen)</td>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>" + recommendation.getNitrogen() + "</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>Phosphore</td>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>" + recommendation.getPhosphorous() + "</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>Potassium</td>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>" + recommendation.getPottasium() + "</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>pH</td>" +
                        "<td style='padding: 10px; border: 1px solid #ddd;'>" + recommendation.getPh() + "</td>" +
                        "</tr>" +
                        "</table>" +
                        "<p>Merci d'utiliser notre service de recommandations agricoles.</p>" +
                        "<p style='font-size: 12px; color: #888;'>Cordialement,<br>L'équipe de Recommandation Agricole</p>" +
                        "</div>" +
                        "</div>";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setFrom("errobi200@gmail.com");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true);

        // Ajouter une image en tant que pièce jointe avec Content-ID
        ClassPathResource resource = new ClassPathResource("/static/logo.png"); // Chemin de l'image
        helper.addInline("logoImage", resource);

        mailSender.send(message);
    }


}
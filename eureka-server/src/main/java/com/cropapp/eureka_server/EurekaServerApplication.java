package com.cropapp.eureka_server;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * Eureka Server Application
 *
 * Service de découverte (Service Discovery) pour l'architecture microservices
 * Permet aux services de s'enregistrer et de se découvrir automatiquement
 *
 * Dashboard accessible sur : http://localhost:8761
 *
 * @author CropApp Team
 * @version 1.0.0
 */
@SpringBootApplication  // Active Spring Boot avec auto-configuration
@EnableEurekaServer    // Active Eureka Server - ANNOTATION CLÉE !
public class EurekaServerApplication {

	/**
	 * Point d'entrée de l'application
	 *
	 * @param args Arguments de ligne de commande
	 */
	public static void main(String[] args) {
		SpringApplication.run(EurekaServerApplication.class, args);

		// Message de démarrage dans la console
		System.out.println("\n" +
				"===============================================\n" +
				"   🌟 EUREKA SERVER STARTED SUCCESSFULLY 🌟   \n" +
				"===============================================\n" +
				"   Dashboard: http://localhost:8761          \n" +
				"   Status: Running                           \n" +
				"===============================================\n"
		);
	}
}

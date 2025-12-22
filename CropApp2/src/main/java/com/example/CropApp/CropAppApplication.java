package com.example.CropApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@SpringBootApplication
public class CropAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(CropAppApplication.class, args);
	}

}

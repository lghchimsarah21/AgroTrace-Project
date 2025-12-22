# Étape 1 : Utiliser une image JDK légère
FROM eclipse-temurin:17-jdk-alpine

# Étape 2 : Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Étape 3 : Copier le jar exécutable dans le conteneur
COPY target/eureka-server-0.0.1-SNAPSHOT.jar /app/eureka-server.jar

# Étape 4 : Exposer le port sur lequel Eureka écoute
EXPOSE 8761

# Étape 5 : Démarrer l'application
ENTRYPOINT ["java", "-jar", "/app/eureka-server.jar"]

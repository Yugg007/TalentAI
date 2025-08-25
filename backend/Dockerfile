FROM openjdk:21-jdk-slim
WORKDIR /app
COPY /target/ai-0.0.1-SNAPSHOT.jar app.jar
RUN ls -al /app
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
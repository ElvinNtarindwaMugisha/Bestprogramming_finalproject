# Use an official OpenJDK runtime as a parent image (Java 21 as specified in pom.xml)
FROM eclipse-temurin:21-jdk-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the built application JAR file to the container
# Ensure you build the app using 'mvn clean package' before building this image
COPY target/LOSTFOUNDIDCARDSYS-0.0.1-SNAPSHOT.jar app.jar

# Expose the application port
EXPOSE 8080

# Command to execute the application
ENTRYPOINT ["java", "-jar", "app.jar"]

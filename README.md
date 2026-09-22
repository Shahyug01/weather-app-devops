# Weather App DevOps Experiment 10

## Local run

```powershell
mvn clean package
mvn spring-boot:run
```

Open http://localhost:8080

## Docker

```powershell
mvn clean package -DskipTests
docker build -t YOUR_USERNAME/weather-app:1.0 .
docker run -p 8081:8080 YOUR_USERNAME/weather-app:1.0
```

## Notes

- Selenium tests expect the app to be running at http://localhost:8080.
- Chrome and a compatible driver must be available.
- Update the Docker Hub username in Jenkinsfile.
- Configure Jenkins credentials with ID: dockerhub-credentials.

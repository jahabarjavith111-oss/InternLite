# InternLite backend — Docker build for Render
# Build stage: Maven + JDK 17
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

# Run stage: slim JRE 17
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Render injects $PORT; default to 8082 locally
ENV PORT=8082
EXPOSE 8082
CMD ["sh", "-c", "java -Dserver.port=$PORT -jar app.jar"]

# Docker Common Patterns

Real-world patterns and workflows for common Docker use cases.

## Development Workflow

### Basic App Development

```bash
# Build and run a development container
docker build -t myapp:dev .
docker run -d -p 8080:80 --name myapp-dev myapp:dev
docker logs -f myapp-dev
docker exec -it myapp-dev bash
```

### Hot Reload Development

```bash
# Run with volume mount for live code updates
docker run -d \
  -p 8080:80 \
  -v $(pwd)/src:/app/src \
  --name myapp-dev \
  myapp:dev
```

## Multi-Stage Builds

### Production Build Pattern

```bash
# Build targeting specific stage
docker build --target production -t myapp:prod .

# Multi-stage Dockerfile example
# FROM node:18 AS build
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci
# COPY . .
# RUN npm run build
#
# FROM nginx:alpine AS production
# COPY --from=build /app/dist /usr/share/nginx/html
```

## Network Patterns

### Multi-Container Communication

```bash
# Create custom network
docker network create myapp-network

# Run database on network
docker run -d \
  --name database \
  --network myapp-network \
  -e POSTGRES_PASSWORD=secret \
  postgres:15

# Run app on same network (can access database by name)
docker run -d \
  --name app \
  --network myapp-network \
  -p 8080:80 \
  -e DATABASE_URL=postgres://database:5432/mydb \
  myapp:latest
```

### Service Discovery

```bash
# Containers on same network can discover each other by name
docker exec app ping database  # Works!
docker exec app curl http://api:3000/health  # Works!
```

## Volume Patterns

### Data Persistence

```bash
# Create named volume
docker volume create myapp-data

# Use volume in container
docker run -d \
  --name database \
  -v myapp-data:/var/lib/postgresql/data \
  postgres:15

# Backup volume data
docker run --rm \
  -v myapp-data:/data \
  -v $(pwd):/backup \
  ubuntu tar czf /backup/myapp-data-backup.tar.gz /data
```

### Bind Mounts for Development

```bash
# Mount current directory
docker run -d \
  -v $(pwd):/app \
  -w /app \
  --name dev-container \
  node:18 npm run dev
```

## Registry Operations

### Complete Registry Workflow

```bash
# Login to registry
docker login registry.example.com

# Build and tag image
docker build -t myapp:latest .
docker tag myapp:latest registry.example.com/myapp:v1.0.0
docker tag myapp:latest registry.example.com/myapp:latest

# Push to registry
docker push registry.example.com/myapp:v1.0.0
docker push registry.example.com/myapp:latest

# Pull from registry on another machine
docker pull registry.example.com/myapp:latest
docker run -d registry.example.com/myapp:latest
```

## Docker Compose Patterns

### Full Stack Application

```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:15
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: secret
    networks:
      - backend

  api:
    build: ./api
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://db:5432/mydb
    depends_on:
      - db
    networks:
      - backend
      - frontend

  web:
    build: ./web
    ports:
      - "80:80"
    depends_on:
      - api
    networks:
      - frontend

volumes:
  db-data:

networks:
  frontend:
  backend:
```

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Scale a service
docker compose up -d --scale api=3

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

## System Maintenance

### Complete Cleanup

```bash
# Stop all containers
docker stop $(docker ps -aq)

# Remove all containers
docker rm $(docker ps -aq)

# Remove all images
docker rmi $(docker images -q)

# Remove all volumes
docker volume rm $(docker volume ls -q)

# Remove all networks (except default)
docker network rm $(docker network ls -q)

# Or use system prune (safer)
docker system prune -a --volumes -f
```

### Selective Cleanup

```bash
# Remove only stopped containers
docker container prune -f

# Remove only unused images
docker image prune -a -f

# Remove only unused volumes
docker volume prune -f

# Remove only unused networks
docker network prune -f
```

## Debugging Patterns

### Inspect Running Container

```bash
# View container details
docker inspect container_name

# View logs with timestamps
docker logs -t --tail 100 container_name

# Follow logs in real-time
docker logs -f container_name

# Execute shell in container
docker exec -it container_name bash

# View resource usage
docker stats container_name
```

### Troubleshoot Container Startup

```bash
# Run container interactively to debug
docker run -it --entrypoint /bin/bash myapp:latest

# Override command
docker run -it myapp:latest /bin/sh

# View container exit code
docker ps -a
docker inspect --format='{{.State.ExitCode}}' container_name
```

## CI/CD Patterns

### Build and Push in CI

```bash
# Build with commit hash as tag
docker build -t myapp:${COMMIT_SHA} .
docker tag myapp:${COMMIT_SHA} myapp:latest

# Push to registry
docker login -u $DOCKER_USER -p $DOCKER_PASSWORD
docker push myapp:${COMMIT_SHA}
docker push myapp:latest
```

### Multi-Platform Builds

```bash
# Build for multiple architectures
docker buildx create --use
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t myapp:latest \
  --push \
  .
```

## Health Checks

### Container Health Monitoring

```bash
# Run with health check
docker run -d \
  --name myapp \
  --health-cmd "curl -f http://localhost/health || exit 1" \
  --health-interval 30s \
  --health-timeout 10s \
  --health-retries 3 \
  myapp:latest

# Check health status
docker inspect --format='{{.State.Health.Status}}' myapp
```

## Resource Limits

### Production Resource Management

```bash
# Run with resource constraints
docker run -d \
  --name myapp \
  --memory=512m \
  --memory-swap=1g \
  --cpus=1.5 \
  --restart=unless-stopped \
  myapp:latest

# Monitor resource usage
docker stats myapp
```

## Security Patterns

### Run as Non-Root User

```bash
# In Dockerfile:
# USER node
# Or override at runtime:
docker run -d --user 1000:1000 myapp:latest
```

### Read-Only Filesystem

```bash
# Run with read-only root filesystem
docker run -d \
  --read-only \
  --tmpfs /tmp \
  --tmpfs /var/run \
  myapp:latest
```

### Secrets Management

```bash
# Use environment variables (development only)
docker run -d -e SECRET_KEY=value myapp:latest

# Use Docker secrets (Swarm mode)
echo "my-secret-value" | docker secret create my-secret -
docker service create --secret my-secret myapp:latest

# Mount secrets as files
docker run -d \
  -v /path/to/secrets:/run/secrets:ro \
  myapp:latest
```

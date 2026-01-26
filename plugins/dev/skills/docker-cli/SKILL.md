---
name: docker-cli
description: Docker CLI expert for containerization. Use when users need to build, run, manage containers, images, networks, volumes, or compose applications.
allowed-tools: Bash(docker:*), Bash(docker-compose:*)
---

# Docker CLI Guide

Docker is a containerization platform that packages applications and dependencies into isolated containers. This guide provides essential workflows and quick references for common Docker operations.

## Quick Start

```bash
# Check Docker installation
docker --version

# Run your first container
docker run hello-world

# Run interactive container
docker run -it ubuntu bash

# Run container in background
docker run -d nginx

# List running containers
docker ps

# Stop a container
docker stop container_name
```

## Common Workflows

### Workflow 1: Build and Run an Application

```bash
# Create Dockerfile in your project directory
# Build image
docker build -t myapp:latest .

# Run container with port mapping
docker run -d -p 8080:80 --name myapp myapp:latest

# View logs
docker logs -f myapp

# Access container shell
docker exec -it myapp bash
```

### Workflow 2: Development with Hot Reload

```bash
# Run with volume mount for live code updates
docker run -d \
  -p 8080:80 \
  -v $(pwd)/src:/app/src \
  --name myapp-dev \
  myapp:dev

# Watch logs in real-time
docker logs -f myapp-dev

# Restart after configuration changes
docker restart myapp-dev
```

### Workflow 3: Multi-Container Application with Docker Compose

```bash
# Create docker-compose.yml with services
# Start all services
docker compose up -d

# View service logs
docker compose logs -f

# Scale a service
docker compose up -d --scale api=3

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

### Workflow 4: Push Image to Registry

```bash
# Login to registry
docker login

# Build and tag image
docker build -t myapp:latest .
docker tag myapp:latest username/myapp:v1.0.0
docker tag myapp:latest username/myapp:latest

# Push to registry
docker push username/myapp:v1.0.0
docker push username/myapp:latest
```

### Workflow 5: Debug Container Issues

```bash
# Check container status
docker ps -a

# View container logs
docker logs container_name

# Inspect container details
docker inspect container_name

# Run interactive shell for debugging
docker run -it --entrypoint /bin/bash myapp:latest

# Check container resource usage
docker stats container_name
```

## Decision Tree

**When to use which command:**

- **To run a new container**: Use `docker run` with appropriate flags
- **To execute commands in running container**: Use `docker exec -it container_name bash`
- **To build an image**: Use `docker build -t name:tag .`
- **To manage multiple services**: Use `docker compose up/down`
- **To check container status**: Use `docker ps` or `docker ps -a`
- **To view logs**: Use `docker logs -f container_name`
- **To clean up resources**: Use `docker system prune` or specific prune commands
- **For detailed command syntax**: See [Commands Reference](./reference/commands-reference.md)
- **For complex scenarios**: See [Common Patterns](./reference/common-patterns.md)
- **For troubleshooting**: See [Troubleshooting Guide](./reference/troubleshooting.md)

## Common Patterns

### Running Containers with Options

```bash
# With environment variables
docker run -e ENV_VAR=value -e API_KEY=secret myapp

# With resource limits
docker run --memory=512m --cpus=1.5 myapp

# With restart policy
docker run --restart=unless-stopped myapp

# With custom network
docker run --network mynetwork myapp

# With volume mount
docker run -v mydata:/app/data myapp
```

### Container-to-Container Communication

```bash
# Create custom network
docker network create myapp-network

# Run containers on same network
docker run -d --name database --network myapp-network postgres:15
docker run -d --name app --network myapp-network -p 8080:80 myapp

# Containers can now access each other by name
# Example: app can connect to database using hostname "database"
```

### Data Persistence

```bash
# Create named volume
docker volume create myapp-data

# Use volume in container
docker run -d -v myapp-data:/var/lib/postgresql/data postgres:15

# Backup volume data
docker run --rm \
  -v myapp-data:/data \
  -v $(pwd):/backup \
  ubuntu tar czf /backup/backup.tar.gz /data
```

## Troubleshooting

**Common Issues:**

1. **Container exits immediately**
   - Solution: Check logs with `docker logs container_name`
   - See: [Container Won't Start](./reference/troubleshooting.md#container-wont-start)

2. **Can't access service on published port**
   - Quick fix: Verify port mapping with `docker port container_name`
   - See: [Container Running But Not Accessible](./reference/troubleshooting.md#container-running-but-not-accessible)

3. **Permission denied errors**
   - Quick fix: Run with user flag `docker run -u $(id -u):$(id -g)`
   - See: [Permission Denied Errors](./reference/troubleshooting.md#permission-denied-errors)

4. **Disk space issues**
   - Quick fix: Clean up with `docker system prune -a --volumes`
   - See: [Disk Space Issues](./reference/troubleshooting.md#disk-space-issues)

5. **Network connectivity issues**
   - Quick fix: Check container network with `docker network inspect bridge`
   - See: [Network Issues](./reference/troubleshooting.md#cannot-connect-between-containers)

For detailed troubleshooting steps, see the [Troubleshooting Guide](./reference/troubleshooting.md).

## Reference Files

**Load as needed for detailed information:**

- **[Commands Reference](./reference/commands-reference.md)** - Complete CLI command documentation with all flags and options. Use when you need exact syntax or flag details for any Docker command.

- **[Common Patterns](./reference/common-patterns.md)** - Real-world patterns and workflows for development, multi-stage builds, networking, volumes, CI/CD, security, and production deployments. Use for implementing specific workflows or integrations.

- **[Troubleshooting Guide](./reference/troubleshooting.md)** - Detailed error messages, diagnosis steps, and resolution strategies for container, image, network, volume, performance, and system issues. Use when encountering errors or unexpected behavior.

**When to use each reference:**

- Use **Commands Reference** when you need exact syntax, flag combinations, or comprehensive command documentation
- Use **Common Patterns** for implementing multi-container setups, production configurations, or CI/CD pipelines
- Use **Troubleshooting** when containers won't start, services are unreachable, or you encounter permission/network/performance issues

## Resources

- Official Docs: https://docs.docker.com
- Docker Hub: https://hub.docker.com
- GitHub: https://github.com/docker
- Community: https://forums.docker.com

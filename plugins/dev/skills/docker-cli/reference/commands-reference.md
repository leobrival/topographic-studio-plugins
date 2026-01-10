# Docker CLI Commands Reference

Complete reference for all Docker CLI commands with detailed options and flags.

## Authentication & Registry

### `docker login`

Authenticate with Docker registry.

```bash
# Login to Docker Hub
docker login

# Login to specific registry
docker login registry.example.com

# Login with username
docker login -u myusername

# Show current user
docker info | grep Username
```

### `docker logout`

Log out from Docker registry.

```bash
# Logout from Docker Hub
docker logout

# Logout from specific registry
docker logout registry.example.com
```

## Container Management

### `docker run`

Create and start a new container.

```bash
# Run container interactively
docker run -it ubuntu bash

# Run container in background
docker run -d nginx

# Run with port mapping
docker run -p 8080:80 nginx

# Run with volume mount
docker run -v /host/path:/container/path ubuntu

# Run with environment variables
docker run -e ENV_VAR=value ubuntu

# Run with custom name
docker run --name mycontainer nginx

# Run with restart policy
docker run --restart=always nginx

# Run with resource limits
docker run --memory=512m --cpus=1 ubuntu
```

### `docker ps`

List containers.

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Show only container IDs
docker ps -q

# Show latest created container
docker ps -l

# Filter containers
docker ps --filter "status=running"
```

### `docker exec`

Execute commands in running containers.

```bash
# Run interactive shell
docker exec -it container_name bash

# Execute single command
docker exec container_name ls /app

# Execute as specific user
docker exec -u root container_name whoami

# Execute with working directory
docker exec -w /app container_name pwd
```

### `docker start` / `docker stop` / `docker restart`

Control container lifecycle.

```bash
# Start stopped container
docker start container_name

# Stop running container
docker stop container_name

# Restart container
docker restart container_name

# Force stop container
docker kill container_name

# Pause/unpause container
docker pause container_name
docker unpause container_name
```

### `docker logs`

View container logs.

```bash
# Show container logs
docker logs container_name

# Follow logs in real-time
docker logs -f container_name

# Show last N lines
docker logs --tail 100 container_name

# Show logs with timestamps
docker logs -t container_name

# Show logs since specific time
docker logs --since 2023-01-01 container_name
```

### `docker inspect`

Display detailed container information.

```bash
# Inspect container
docker inspect container_name

# Get specific information using format
docker inspect --format='{{.State.Status}}' container_name

# Get container IP address
docker inspect --format='{{.NetworkSettings.IPAddress}}' container_name
```

### `docker cp`

Copy files between container and host.

```bash
# Copy from container to host
docker cp container_name:/path/to/file /host/path

# Copy from host to container
docker cp /host/path container_name:/path/to/file

# Copy directory
docker cp /host/dir container_name:/container/dir
```

### `docker rm`

Remove containers.

```bash
# Remove stopped container
docker rm container_name

# Force remove running container
docker rm -f container_name

# Remove multiple containers
docker rm container1 container2

# Remove all stopped containers
docker container prune
```

## Image Management

### `docker images`

List local images.

```bash
# List all images
docker images

# List images with digests
docker images --digests

# List image IDs only
docker images -q

# Filter images
docker images --filter "dangling=true"
```

### `docker pull`

Download images from registry.

```bash
# Pull latest image
docker pull ubuntu

# Pull specific tag
docker pull ubuntu:20.04

# Pull from specific registry
docker pull registry.example.com/myimage:tag

# Pull all tags of an image
docker pull -a ubuntu
```

### `docker push`

Upload images to registry.

```bash
# Push image to registry
docker push myusername/myimage:tag

# Push to specific registry
docker push registry.example.com/myimage:tag

# Push all tags
docker push -a myusername/myimage
```

### `docker build`

Build images from Dockerfile.

```bash
# Build image from current directory
docker build .

# Build with custom tag
docker build -t myimage:tag .

# Build with custom Dockerfile
docker build -f custom.Dockerfile .

# Build with build arguments
docker build --build-arg ARG_NAME=value .

# Build without cache
docker build --no-cache .

# Build with specific target stage
docker build --target production .
```

### `docker tag`

Tag images.

```bash
# Tag image with new name
docker tag source_image target_image:tag

# Tag for registry push
docker tag myimage:latest registry.example.com/myimage:v1.0
```

### `docker rmi`

Remove images.

```bash
# Remove image
docker rmi image_name:tag

# Force remove image
docker rmi -f image_name

# Remove multiple images
docker rmi image1 image2

# Remove dangling images
docker image prune

# Remove all unused images
docker image prune -a
```

### `docker history`

Show image history.

```bash
# Show image layers
docker history image_name

# Show without truncation
docker history --no-trunc image_name
```

### `docker save` / `docker load`

Export and import images.

```bash
# Save image to tar file
docker save -o image.tar image_name

# Load image from tar file
docker load -i image.tar

# Save multiple images
docker save -o images.tar image1 image2
```

## Network Management

### `docker network ls`

List networks.

```bash
# List all networks
docker network ls

# Filter networks
docker network ls --filter driver=bridge
```

### `docker network create`

Create networks.

```bash
# Create bridge network
docker network create mynetwork

# Create with specific driver
docker network create --driver overlay mynetwork

# Create with subnet
docker network create --subnet=192.168.1.0/24 mynetwork

# Create with gateway
docker network create --gateway=192.168.1.1 mynetwork
```

### `docker network connect` / `docker network disconnect`

Manage container network connections.

```bash
# Connect container to network
docker network connect mynetwork container_name

# Disconnect container from network
docker network disconnect mynetwork container_name

# Connect with specific IP
docker network connect --ip 192.168.1.100 mynetwork container_name
```

### `docker network inspect`

Inspect network details.

```bash
# Inspect network
docker network inspect mynetwork

# Get specific information
docker network inspect --format='{{.IPAM.Config}}' mynetwork
```

### `docker network rm`

Remove networks.

```bash
# Remove network
docker network rm mynetwork

# Remove multiple networks
docker network rm network1 network2

# Remove all unused networks
docker network prune
```

## Volume Management

### `docker volume ls`

List volumes.

```bash
# List all volumes
docker volume ls

# Filter volumes
docker volume ls --filter dangling=true
```

### `docker volume create`

Create volumes.

```bash
# Create volume
docker volume create myvolume

# Create with specific driver
docker volume create --driver local myvolume

# Create with options
docker volume create --opt type=nfs myvolume
```

### `docker volume inspect`

Inspect volume details.

```bash
# Inspect volume
docker volume inspect myvolume

# Get mount point
docker volume inspect --format='{{.Mountpoint}}' myvolume
```

### `docker volume rm`

Remove volumes.

```bash
# Remove volume
docker volume rm myvolume

# Remove multiple volumes
docker volume rm volume1 volume2

# Remove all unused volumes
docker volume prune
```

## System Management

### `docker system df`

Show Docker disk usage.

```bash
# Show disk usage summary
docker system df

# Show detailed usage
docker system df -v
```

### `docker system prune`

Clean up unused resources.

```bash
# Remove unused containers, networks, images
docker system prune

# Remove everything including volumes
docker system prune --volumes

# Remove without confirmation
docker system prune -f

# Remove all unused images (not just dangling)
docker system prune -a
```

### `docker stats`

Show container resource usage.

```bash
# Show stats for all running containers
docker stats

# Show stats for specific containers
docker stats container1 container2

# Show stats without streaming
docker stats --no-stream
```

### `docker events`

Get real-time events from Docker daemon.

```bash
# Show all events
docker events

# Filter events by type
docker events --filter event=start

# Show events since specific time
docker events --since 2023-01-01
```

## Docker Compose Commands

### `docker compose up`

Start services.

```bash
# Start services defined in docker-compose.yml
docker compose up

# Start services in background
docker compose up -d

# Build and start services
docker compose up --build
```

### `docker compose down`

Stop services.

```bash
# Stop services
docker compose down

# Stop and remove volumes
docker compose down -v
```

### `docker compose logs`

View service logs.

```bash
# Show service logs
docker compose logs

# Follow logs
docker compose logs -f service_name
```

### `docker compose exec`

Execute commands in services.

```bash
# Execute command in service
docker compose exec service_name bash
```

### `docker compose ps`

List services.

```bash
# List services
docker compose ps
```

### `docker compose config`

Show configuration.

```bash
# Show service configuration
docker compose config
```

## Global Options

All Docker commands support these global flags:

- `--config` — Location of client config files
- `--context` — Name of the context to use
- `--debug` — Enable debug mode
- `--host` — Daemon socket(s) to connect to
- `--log-level` — Set the logging level
- `--tls` — Use TLS; implied by --tlsverify
- `--tlscacert` — Trust certs signed only by this CA
- `--tlscert` — Path to TLS certificate file
- `--tlskey` — Path to TLS key file
- `--tlsverify` — Use TLS and verify the remote
- `--version` — Print version information

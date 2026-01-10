# Docker Troubleshooting Guide

Common issues and solutions for Docker containers, images, networks, and volumes.

## Container Issues

### Container Won't Start

**Symptom:** Container exits immediately after starting

**Diagnosis:**
```bash
# Check container logs
docker logs container_name

# Check exit code
docker inspect --format='{{.State.ExitCode}}' container_name

# View full state
docker inspect container_name
```

**Common Causes:**
1. **Application crashes** → Check application logs
2. **Missing environment variables** → Verify with `docker inspect`
3. **Port already in use** → Use `docker ps` or `lsof -i :PORT`
4. **Entrypoint/CMD issues** → Test with `docker run -it --entrypoint /bin/sh image_name`

**Solutions:**
```bash
# Run interactively to debug
docker run -it --entrypoint /bin/bash myapp:latest

# Override entrypoint
docker run -it --entrypoint /bin/sh myapp:latest

# Check for port conflicts
lsof -i :8080
docker ps --filter "publish=8080"
```

### Container Running But Not Accessible

**Symptom:** Can't access service on published port

**Diagnosis:**
```bash
# Verify port mapping
docker port container_name

# Check if service is listening inside container
docker exec container_name netstat -tlnp

# Test from inside container
docker exec container_name curl localhost:80
```

**Solutions:**
```bash
# Ensure correct port mapping (host:container)
docker run -p 8080:80 myapp  # Maps container port 80 to host port 8080

# Check firewall rules
sudo ufw status
sudo iptables -L

# Verify container network
docker inspect --format='{{.NetworkSettings.IPAddress}}' container_name
```

### Permission Denied Errors

**Symptom:** Volume mount permission errors

**Diagnosis:**
```bash
# Check volume permissions
docker exec container_name ls -la /mounted/path

# Check user inside container
docker exec container_name whoami
docker exec container_name id
```

**Solutions:**
```bash
# Run as specific user
docker run -u $(id -u):$(id -g) -v $(pwd):/app myapp

# Fix permissions on host
sudo chown -R $(id -u):$(id -g) ./data

# Use named volume instead of bind mount
docker volume create myapp-data
docker run -v myapp-data:/app/data myapp
```

### Container Keeps Restarting

**Symptom:** Container in restart loop

**Diagnosis:**
```bash
# Check restart policy
docker inspect --format='{{.HostConfig.RestartPolicy.Name}}' container_name

# View logs for crash reason
docker logs --tail 50 container_name

# Watch events
docker events --filter container=container_name
```

**Solutions:**
```bash
# Remove restart policy temporarily
docker update --restart=no container_name

# Fix the underlying issue, then restore
docker update --restart=unless-stopped container_name
```

## Image Issues

### Image Build Fails

**Symptom:** `docker build` command fails

**Common Errors:**

**Error: "COPY failed: no source files"**
```bash
# Solution: Check .dockerignore isn't excluding needed files
cat .dockerignore

# Verify files exist
ls -la <path-to-files>
```

**Error: "failed to solve with frontend dockerfile.v0"**
```bash
# Solution: Syntax error in Dockerfile
# Check Dockerfile for typos, invalid instructions
docker build --progress=plain .  # Shows detailed error
```

**Error: "error checking context: can't stat"**
```bash
# Solution: Build context issue
# Don't build from root or large directory
# Create .dockerignore to exclude unnecessary files
```

### Image Too Large

**Symptom:** Image size is excessive

**Diagnosis:**
```bash
# Check image size
docker images myapp

# View layer sizes
docker history myapp:latest
docker history --no-trunc --format="{{.Size}}\t{{.CreatedBy}}" myapp:latest
```

**Solutions:**
```bash
# Use multi-stage builds
# Use smaller base images (alpine)
# Minimize layers
# Clean up in same RUN command:
RUN apt-get update && \
    apt-get install -y package && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Remove build dependencies after use
RUN apk add --no-cache --virtual .build-deps gcc && \
    # ... build steps ... && \
    apk del .build-deps
```

### Cannot Pull Image

**Symptom:** `docker pull` fails with authentication or network error

**Diagnosis:**
```bash
# Check Docker Hub rate limits
docker pull ratelimitpreview/test

# Verify authentication
docker login
cat ~/.docker/config.json

# Test network connectivity
ping registry-1.docker.io
curl -I https://registry-1.docker.io/v2/
```

**Solutions:**
```bash
# Login to registry
docker login
docker login registry.example.com

# Use authenticated pulls
docker pull username/image:tag

# For rate limits, authenticate or use mirror
docker login  # Increases rate limit
```

## Network Issues

### Cannot Connect Between Containers

**Symptom:** Containers can't communicate

**Diagnosis:**
```bash
# List networks
docker network ls

# Inspect network
docker network inspect bridge

# Check container networks
docker inspect --format='{{.NetworkSettings.Networks}}' container_name

# Test connectivity
docker exec container1 ping container2
```

**Solutions:**
```bash
# Ensure containers are on same network
docker network create mynetwork
docker network connect mynetwork container1
docker network connect mynetwork container2

# Or use docker-compose (automatic network)
docker-compose up
```

### DNS Resolution Fails

**Symptom:** Container can't resolve hostnames

**Diagnosis:**
```bash
# Check DNS settings
docker inspect --format='{{.HostConfig.Dns}}' container_name

# Test DNS inside container
docker exec container_name nslookup google.com
docker exec container_name cat /etc/resolv.conf
```

**Solutions:**
```bash
# Use custom DNS
docker run --dns 8.8.8.8 --dns 8.8.4.4 myapp

# Or configure daemon
# /etc/docker/daemon.json:
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}

# Restart Docker daemon
sudo systemctl restart docker
```

## Volume Issues

### Data Not Persisting

**Symptom:** Data lost after container restart

**Diagnosis:**
```bash
# Check if volume is mounted
docker inspect --format='{{.Mounts}}' container_name

# List volumes
docker volume ls

# Inspect volume
docker volume inspect myvolume
```

**Solutions:**
```bash
# Use named volume
docker volume create mydata
docker run -v mydata:/app/data myapp

# Or use bind mount with absolute path
docker run -v /absolute/path:/app/data myapp

# Verify mount
docker exec container ls -la /app/data
```

### Volume Permission Issues

**Symptom:** Can't write to volume

**Solutions:**
```bash
# Check ownership
docker exec container ls -ld /mounted/path

# Match container user with host user
docker run -u $(id -u):$(id -g) -v $(pwd):/data myapp

# Fix on host (for bind mounts)
sudo chown -R $(id -u):$(id -g) ./local-path
```

## Performance Issues

### Container Using Too Much Memory

**Diagnosis:**
```bash
# Check current usage
docker stats container_name

# Check limits
docker inspect --format='{{.HostConfig.Memory}}' container_name
```

**Solutions:**
```bash
# Set memory limit
docker run -m 512m myapp

# Set memory reservation (soft limit)
docker run --memory-reservation=256m myapp

# Set swap limit
docker run -m 512m --memory-swap=1g myapp

# Update running container
docker update --memory=512m container_name
```

### High CPU Usage

**Solutions:**
```bash
# Limit CPU
docker run --cpus=1.5 myapp

# Set CPU shares (relative weight)
docker run --cpu-shares=512 myapp

# Pin to specific CPUs
docker run --cpuset-cpus="0,1" myapp
```

## Registry Issues

### Push/Pull Timeouts

**Diagnosis:**
```bash
# Test network to registry
curl -I https://registry.example.com/v2/

# Check registry authentication
docker login registry.example.com
```

**Solutions:**
```bash
# Increase timeout in daemon config
# /etc/docker/daemon.json:
{
  "max-concurrent-downloads": 3,
  "max-concurrent-uploads": 5
}

# Use compression
docker save myapp | gzip > myapp.tar.gz

# Split large images into layers
# Use multi-stage builds
```

## System Issues

### Docker Daemon Won't Start

**Diagnosis:**
```bash
# Check daemon status
sudo systemctl status docker

# View daemon logs
sudo journalctl -u docker.service
sudo journalctl -u docker.service --since "1 hour ago"

# Check configuration
docker info
```

**Solutions:**
```bash
# Restart daemon
sudo systemctl restart docker

# Reset Docker (WARNING: removes all data)
docker system prune -a --volumes

# Check for corrupted daemon.json
sudo nano /etc/docker/daemon.json
# Ensure valid JSON

# Reinstall Docker (last resort)
sudo apt-get purge docker-ce
sudo apt-get install docker-ce
```

### Disk Space Issues

**Diagnosis:**
```bash
# Check disk usage
docker system df
docker system df -v

# Find large images
docker images --format "{{.Size}}\t{{.Repository}}:{{.Tag}}" | sort -h

# Find old containers
docker ps -a --format "{{.CreatedAt}}\t{{.Names}}"
```

**Solutions:**
```bash
# Clean up unused resources
docker system prune -a --volumes

# Remove specific items
docker container prune  # Stopped containers
docker image prune -a   # Unused images
docker volume prune     # Unused volumes
docker network prune    # Unused networks

# Set cleanup cron job
# Add to crontab: 0 2 * * * docker system prune -f
```

## Debug Tools

### Useful Debug Commands

```bash
# View detailed container info
docker inspect container_name | jq '.'

# Stream events in real-time
docker events --filter container=myapp

# Check container processes
docker top container_name

# View container filesystem changes
docker diff container_name

# Export container filesystem
docker export container_name > container.tar

# Run debugging tools
docker run --rm -it --net=container:myapp nicolaka/netshoot
```

### Enable Debug Logging

```bash
# Edit /etc/docker/daemon.json
{
  "debug": true,
  "log-level": "debug"
}

# Restart daemon
sudo systemctl restart docker

# View debug logs
sudo journalctl -u docker.service -f
```

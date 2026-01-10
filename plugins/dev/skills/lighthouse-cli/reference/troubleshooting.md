# Lighthouse Troubleshooting Guide

Common issues and solutions for Lighthouse audits, Chrome configuration, and report generation.

## Chrome Issues

### Chrome Won't Launch

**Symptom:** "Chrome could not be launched" or Chrome timeout error

**Diagnosis:**

```bash
# Check if Chrome is installed
which google-chrome      # Linux
which chromium           # Linux alternative
which "Google Chrome"    # macOS
where chrome.exe         # Windows

# Verify Chrome executable
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --version  # macOS
google-chrome --version  # Linux
```

**Solutions:**

```bash
# Specify Chrome path explicitly
lighthouse https://example.com --chrome-path=/path/to/chrome

# macOS example
lighthouse https://example.com --chrome-path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Linux example
lighthouse https://example.com --chrome-path=/usr/bin/google-chrome

# Install Chrome if missing
# macOS: brew install google-chrome
# Linux: apt-get install google-chrome-stable
# Windows: Download from google.com/chrome
```

### Chrome in Container/CI

**Symptom:** "Chrome could not be launched" in Docker or CI environment

**Solutions:**

```bash
# Add no-sandbox flag (needed in containers)
lighthouse https://example.com --chrome-flags="--no-sandbox"

# Combine with headless
lighthouse https://example.com --chrome-flags="--headless --no-sandbox"

# Dockerfile example
FROM node:18
RUN apt-get update && apt-get install -y chromium
ENV CHROME_PATH=/usr/bin/chromium
RUN npm install -g lighthouse
```

### Chrome Process Hangs

**Symptom:** Audit hangs and eventually times out

**Diagnosis:**

```bash
# Check running Chrome processes
ps aux | grep chrome

# Check system resources
top  # or htop

# Test basic Chrome launch
google-chrome --headless --version
```

**Solutions:**

```bash
# Kill hung Chrome processes
pkill -f chrome
pkill -f chromium

# Increase timeout
lighthouse https://example.com --timeout=120000

# Disable GPU (can help with resource issues)
lighthouse https://example.com --chrome-flags="--headless --disable-gpu"

# Run with memory limit
lighthouse https://example.com --chrome-flags="--headless --memory-pressure-off"
```

## Audit Failures

### Cannot Audit Localhost

**Symptom:** "Error: Listener closed" or "net::ERR_CONNECTION_REFUSED"

**Diagnosis:**

```bash
# Check if server is running
ps aux | grep "npm\|yarn\|bun"

# Test server is responding
curl http://localhost:3000

# Check port is correct
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

**Solutions:**

```bash
# Start your dev server first
npm run dev  # or your dev command

# Wait for server to be ready before auditing
sleep 3 && lighthouse http://localhost:3000

# Or use a script
npm run dev &
sleep 3
lighthouse http://localhost:3000
kill $!
```

### Audit Timeout

**Symptom:** "Audit timing out" or "Error: Timeout"

**Diagnosis:**

```bash
# Check if site is loading slowly
time curl https://example.com

# Test site responsiveness
curl -I https://example.com

# Monitor network
ping example.com
```

**Solutions:**

```bash
# Increase timeout (in milliseconds)
lighthouse https://example.com --timeout=60000   # 60 seconds

# For slow sites
lighthouse https://example.com --timeout=120000  # 2 minutes

# Increase page load wait time
lighthouse https://example.com --max-wait-for-load=60000

# Disable throttling (faster audit)
lighthouse https://example.com --throttling-method=provided
```

### Site Not Responding

**Symptom:** "Error: Unable to load the page" or connection timeout

**Diagnosis:**

```bash
# Check DNS resolution
nslookup example.com
dig example.com

# Test connectivity
ping example.com

# Check if site is online
curl -v https://example.com

# Check for CloudFlare/WAF blocking
curl -H "User-Agent: Mozilla/5.0" https://example.com
```

**Solutions:**

```bash
# Wait and retry
sleep 5 && lighthouse https://example.com

# Check site status
# Visit status page or uptime monitor

# Verify correct URL
lighthouse https://example.com  # not http://

# For authenticated sites, add headers
lighthouse https://example.com --extra-headers='{"Authorization":"Bearer token"}'
```

## Authentication Issues

### Headers Not Being Sent

**Symptom:** 401 Unauthorized or 403 Forbidden despite headers

**Diagnosis:**

```bash
# Test headers with curl
curl -H "Authorization: Bearer token123" https://example.com

# Check header format
# Headers should be valid JSON
echo '{"Authorization":"Bearer token123"}' | jq .
```

**Solutions:**

```bash
# Correct JSON format (double quotes required)
lighthouse https://example.com \
  --extra-headers='{"Authorization":"Bearer your-token-here"}'

# Escape quotes properly if needed
lighthouse https://example.com \
  --extra-headers='{"Authorization":"Bearer token with spaces"}'

# Multiple headers
lighthouse https://example.com \
  --extra-headers='{"Authorization":"Bearer token","X-API-Key":"key123"}'

# For cookies
lighthouse https://example.com \
  --extra-headers='{"Cookie":"sessionid=abc123; path=/"}'
```

### Token Expiration

**Symptom:** Audit works initially but later fails with 401

**Solutions:**

```bash
# Refresh token before audit
TOKEN=$(curl -s -X POST https://api.example.com/auth -d '{}' | jq -r .token)
lighthouse https://example.com --extra-headers="{\"Authorization\":\"Bearer $TOKEN\"}"

# Or manually refresh and run audit
```

## Report Generation Issues

### Report Not Generating

**Symptom:** Command runs but no report file created

**Diagnosis:**

```bash
# Check for errors in output
lighthouse https://example.com  # Watch full output

# Verify write permissions
ls -la ./
touch test.txt  # Can we write?
```

**Solutions:**

```bash
# Specify full path
lighthouse https://example.com --output-path=/full/path/to/report.html

# Ensure directory exists
mkdir -p ./reports
lighthouse https://example.com --output-path=./reports/report.html

# Check file permissions
chmod 755 ./reports

# Use absolute path
lighthouse https://example.com --output-path=$PWD/report.html

# Specify format explicitly
lighthouse https://example.com --output=html --output-path=./report.html
```

### Report File Permissions

**Symptom:** "Permission denied" when trying to open report

**Solutions:**

```bash
# Fix file permissions
chmod 644 report.html

# Fix directory permissions
chmod 755 ./reports

# Run with proper user
sudo lighthouse https://example.com  # Usually not needed

# Check owner
ls -la report.html
chown $USER report.html
```

### Large Report File Size

**Symptom:** HTML report is very large or crashes browser

**Solutions:**

```bash
# Generate JSON instead of HTML
lighthouse https://example.com --output=json

# Use separate formats
lighthouse https://example.com --output=html --output=json

# JSON takes much less space and is easier to analyze
jq . report.json  # View JSON

# Generate CSV for data analysis
lighthouse https://example.com --output=csv
```

## Network & Connectivity Issues

### DNS Resolution Fails

**Symptom:** "Error: getaddrinfo ENOTFOUND example.com"

**Diagnosis:**

```bash
# Test DNS
nslookup example.com
dig example.com
host example.com

# Test direct IP if available
ping 93.184.216.34
```

**Solutions:**

```bash
# Try again (temporary DNS issue)
sleep 5 && lighthouse https://example.com

# Check internet connection
ping 8.8.8.8

# Check DNS configuration
cat /etc/resolv.conf  # Linux
networksetup -getdnsservers en0  # macOS

# Use public DNS
# Add to /etc/resolv.conf or OS network settings:
# nameserver 8.8.8.8
# nameserver 8.8.4.4
```

### Certificate Errors

**Symptom:** "Error: certificate verify failed" or "untrusted certificate"

**Diagnosis:**

```bash
# Check certificate
openssl s_client -connect example.com:443

# Check certificate expiration
openssl x509 -noout -dates -in certificate.pem
```

**Solutions:**

```bash
# For self-signed certificates in development
lighthouse https://localhost:3000 --chrome-flags="--allow-insecure-localhost"

# Update certificate bundles
# macOS: /Applications/Python\ 3.x/Install\ Certificates.command
# Linux: apt-get install ca-certificates

# Check system time (certificate validation uses current date)
date
```

### Network Rate Limiting

**Symptom:** Repeated "Error: net::ERR_TOO_MANY_REDIRECTS" or slowness

**Solutions:**

```bash
# Add delay between audits
for url in $(cat urls.txt); do
  lighthouse $url --output=json
  sleep 10  # Wait 10 seconds between audits
done

# Use parallel with rate limit
cat urls.txt | parallel -j 1 -d '\n' lighthouse {}

# Distribute audits over time
```

## Performance & Resource Issues

### Audit Uses Too Much Memory

**Symptom:** Audit crashes or system runs out of memory

**Solutions:**

```bash
# Disable JavaScript execution if not needed
# (Lighthouse option if available)

# Disable network throttling (less memory usage)
lighthouse https://example.com --throttling-method=provided

# Run on a machine with more resources

# Close other applications
killall chrome  # Close any running Chrome instances
```

### Audit Takes Too Long

**Symptom:** Audit takes 5+ minutes

**Diagnosis:**

```bash
# Check site performance
curl -I https://example.com

# Check network conditions
ping -c 10 example.com
```

**Solutions:**

```bash
# Reduce audit scope
lighthouse https://example.com --only-categories=performance

# Disable throttling (faster)
lighthouse https://example.com --throttling-method=provided

# Reduce max load wait time
lighthouse https://example.com --max-wait-for-load=30000

# Headless mode (sometimes faster)
lighthouse https://example.com --chrome-flags="--headless"
```

## Scoring & Results Issues

### Scores Seem Inconsistent

**Symptom:** Same URL gets different scores on each audit

**Diagnosis:**

```bash
# Check audit conditions
# Lighthouse scores vary based on:
# - Network throttling
# - CPU throttling
# - System load
# - Server performance
# - Cache state
```

**Solutions:**

```bash
# Use same throttling settings
lighthouse https://example.com --throttling-method=provided

# Run multiple times and average
for i in {1..3}; do
  lighthouse https://example.com --output=json --output-path=audit-$i.json
done

# Average scores
jq '[.[].categories.performance.score] | add/length' audit-*.json

# Clear browser cache between runs
lighthouse https://example.com --chrome-flags="--disk-cache-dir=/tmp/none"
```

## Debugging

### Enable Verbose Logging

```bash
# Get detailed output
lighthouse https://example.com --verbose --output=json

# See all steps and timing
lighthouse https://example.com --verbose
```

### Inspect Audit Details

```bash
# View detailed audit results
lighthouse https://example.com --output=json | jq '.audits'

# Check specific audit
lighthouse https://example.com --output=json | jq '.audits["first-contentful-paint"]'

# View all opportunities
lighthouse https://example.com --output=json | jq '.audits | map(select(.scoreDisplayMode=="numeric"))'
```

### Check Lighthouse Version

```bash
# Verify version
lighthouse --version

# Upgrade to latest
npm install -g lighthouse@latest

# Check for breaking changes in release notes
# https://github.com/GoogleChrome/lighthouse/releases
```

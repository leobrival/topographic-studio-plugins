---
name: block-curl-pipe-shell
enabled: true
event: bash
pattern: curl.*\|\s*(sh|bash)
action: block
---

**Remote execution blocked: curl | sh**

Downloading and executing code directly from the Internet is extremely dangerous.

Secure alternatives:
1. Download the script: `curl -O url/script.sh`
2. Inspect the content: `cat script.sh`
3. Execute after verification: `bash script.sh`

---
name: block-wget-pipe-shell
enabled: true
event: bash
pattern: wget.*\|\s*(sh|bash)
action: block
---

**Remote execution blocked: wget | sh**

Downloading and executing code directly from the Internet is extremely dangerous.

Secure alternatives:
1. Download the script: `wget url/script.sh`
2. Inspect the content: `cat script.sh`
3. Execute after verification: `bash script.sh`

---
name: block-hardcoded-secrets
enabled: true
event: file
tool_matcher: Edit|Write
conditions:
  - field: file_path
    operator: not_contains
    pattern: .env
  - field: content
    operator: regex_match
    pattern: (API_KEY|SECRET|PASSWORD|TOKEN)\s*[=:]\s*["'][^"']{8,}["']
action: block
---

**Hardcoded secret detected**

Never hardcode API keys, secrets, passwords or tokens in code.

Use environment variables:
- Create a `.env` file
- Add `.env` to `.gitignore`
- Load with `dotenv` or equivalent

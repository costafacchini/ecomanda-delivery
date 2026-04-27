---
name: security-review
description: OWASP-aligned security checklist for auth, input validation, secrets, SQL injection, XSS, CSRF, rate limiting, and sensitive data handling.
trigger: User is touching auth, user input, secrets, payments, API endpoints, or sensitive data
auto: false
---

# Security Review

## Triggers

### Manual
- `/security-review`
- "check for security issues", "security audit"
- "is this secure?", "review auth/permissions"

### Suggested (not automatic — propose to user)
When you notice the user is:
- Implementing authentication or authorization
- Handling user input or file uploads
- Creating or modifying API endpoints
- Working with secrets, tokens, or credentials
- Implementing payments or storing sensitive data
- Integrating third-party services

---

Walk through each section relevant to the current change. Skip sections that don't apply. Every BLOCK item must be resolved before shipping.

## 1. Secrets Management

**BLOCK — never hardcode secrets:**
```
# Wrong
API_KEY = "sk-proj-xxxxx"
password = "hunter2"
```

**Right — always use environment variables:**
```
api_key = ENV["OPENAI_API_KEY"]  # Ruby
const apiKey = process.env.OPENAI_API_KEY  # JS
api_key = os.environ["OPENAI_API_KEY"]  # Python
```

Checklist:
- [ ] No hardcoded API keys, tokens, or passwords in source
- [ ] All secrets read from environment variables or secrets manager
- [ ] `.env` / `.env.local` in `.gitignore`
- [ ] No secrets in git history (`git log -p | grep -i secret`)
- [ ] Production secrets managed via platform (Heroku config, AWS Secrets Manager, etc.)

## 2. Input Validation

**Validate at every system boundary — API endpoints, webhooks, CLI args:**
- Validate type, format, length, and range
- Use allowlist validation (permit known-good), not blocklist
- Reject and return 400 for invalid input — never silently drop or coerce
- Error messages must not leak internal structure

Checklist:
- [ ] All user inputs validated before use
- [ ] File uploads: check size limit, MIME type, and extension
- [ ] No user input passed directly to system calls, eval, or template engines
- [ ] Validation errors return generic messages to users, detailed logs server-side

## 3. SQL Injection

**BLOCK — never concatenate user input into queries:**
```
# Wrong
"SELECT * FROM users WHERE email = '#{params[:email]}'"
f"SELECT * FROM users WHERE email = '{email}'"
```

**Right — always parameterized queries or ORM:**
```ruby
User.where(email: params[:email])                    # Rails ORM
User.where("email = ?", params[:email])              # Rails raw with param
```
```python
cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
```
```javascript
db.query("SELECT * FROM users WHERE email = $1", [email])
```

Checklist:
- [ ] All database queries use ORM or parameterized queries
- [ ] No string interpolation/concatenation in SQL
- [ ] Search/filter inputs sanitized before use in queries

## 4. Authentication & Authorization

**Auth checks must come before any data access or mutation:**

```
# Verify identity (authentication)
# Then verify permission (authorization)
# Then execute operation
```

Checklist:
- [ ] Every protected endpoint checks authentication before proceeding
- [ ] Authorization checked for the specific resource (not just "is logged in")
- [ ] Tokens stored in httpOnly cookies, not localStorage
- [ ] Session tokens rotated on privilege change (login, role change)
- [ ] Password reset tokens are single-use and expire
- [ ] Admin/privileged routes protected separately

## 5. XSS Prevention

**Never render unescaped user-controlled content as HTML:**

```javascript
// Wrong
element.innerHTML = userInput

// Right — use framework escaping
element.textContent = userInput   // DOM API
<p>{userInput}</p>                // React (auto-escapes)
```

For cases where HTML rendering is required, sanitize with an allowlist library (e.g., DOMPurify, Sanitize gem).

Checklist:
- [ ] User-provided content escaped in all output contexts (HTML, JS, URL, CSS)
- [ ] No `innerHTML`, `dangerouslySetInnerHTML`, `html_safe`, `raw` with unsanitized input
- [ ] Content Security Policy headers configured
- [ ] User-provided HTML sanitized with allowlist before rendering

## 6. CSRF Protection

Checklist:
- [ ] State-changing endpoints (POST/PUT/PATCH/DELETE) require CSRF token or SameSite cookie
- [ ] CSRF tokens validated server-side before processing
- [ ] Session cookies use `SameSite=Strict` or `SameSite=Lax`

## 7. Rate Limiting

Apply to all public-facing endpoints, stricter on expensive or sensitive ones:

- Authentication endpoints (login, password reset, 2FA): strict limits
- Search/query endpoints: per-user and per-IP limits
- Writes/mutations: per-user limits
- Unauthenticated endpoints: IP-based limits

Checklist:
- [ ] Rate limiting applied at API gateway or middleware level
- [ ] Auth endpoints rate-limited aggressively (e.g., 5 attempts/15 min)
- [ ] Rate limit responses return 429 with `Retry-After` header

## 8. Sensitive Data Exposure

**Never log or expose:**
- Passwords (even hashed)
- API keys, tokens, secrets
- Full credit card numbers, SSNs, PII beyond what's needed
- Stack traces in API responses

```
# Wrong
logger.info("User login: #{email}, #{password}")
render json: { error: e.message, backtrace: e.backtrace }

# Right
logger.info("User login attempt: user_id=#{user.id}")
render json: { error: "Something went wrong" }, status: 500
```

Checklist:
- [ ] No secrets or credentials in application logs
- [ ] API error responses return generic messages; details in server logs only
- [ ] PII handled per applicable regulations (GDPR, etc.)
- [ ] Database does not store plaintext passwords

## 9. Dependency Security

```bash
# Check for known vulnerabilities
npm audit        # Node
bundle audit     # Ruby (bundler-audit gem)
pip-audit        # Python
cargo audit      # Rust
```

Checklist:
- [ ] No known HIGH/CRITICAL vulnerabilities in dependencies
- [ ] Lock files committed (`package-lock.json`, `Gemfile.lock`, etc.)
- [ ] Dependabot or equivalent automated update checks enabled

## Pre-Ship Summary

Run this checklist before shipping any security-sensitive change:

- [ ] Secrets: no hardcoded values, all in env vars
- [ ] Input validation: all user inputs validated at entry points
- [ ] SQL injection: all queries parameterized
- [ ] XSS: user content escaped or sanitized
- [ ] CSRF: protection enabled on mutations
- [ ] Auth: authentication + authorization checked before data access
- [ ] Rate limiting: applied to sensitive endpoints
- [ ] Logging: no PII or secrets in logs
- [ ] Errors: stack traces not exposed to users
- [ ] Dependencies: no known critical vulnerabilities

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x     | ✅ Active support |

## Reporting Vulnerabilities

**⚠️ Do NOT open public issues for security vulnerabilities.**

### Preferred Method

Use GitHub Security Advisories: [Report a vulnerability](https://github.com/Fayeblade1488/Venice-ToolKit/security/advisories/new)

### Alternative Methods

- Email: fayeblade1488@gmail.com
- PGP Key: [link to public key]

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested mitigation (if known)
- Your contact information

## Response Timeline

- **Initial Response:** Within 48 hours
- **Status Updates:** Every 7 days until resolution
- **Fix Timeline:**
  - Critical: 30 days maximum
  - High: 90 days maximum
  - Medium/Low: Next major release

## Security Practices

- **Dependency Scanning:** Automated weekly scans (npm audit)
- **Static Analysis:** CodeQL runs on every PR
- **Secret Scanning:** Gitleaks prevents credential leaks
- **Supply Chain:** npm audit and package-lock.json verification
- **Code Review:** All changes require maintainer approval
- **Access Control:** Principle of least privilege

## Security Contact

For urgent security matters: fayeblade1488@gmail.com
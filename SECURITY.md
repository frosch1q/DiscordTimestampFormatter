# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.x     | ✅ Yes    |

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub Issues.**

If you discover a security vulnerability in this project, report it responsibly by opening a **[GitHub Security Advisory](https://github.com/Mori-Takahashi/DiscordTimestampFormatter/security/advisories/new)** or by contacting the maintainer directly.

Include the following information in your report:

- A description of the vulnerability and its potential impact
- Steps to reproduce the issue
- Affected version(s)
- Any suggested fix or mitigation, if applicable

You can expect an initial response within **72 hours**. If the vulnerability is confirmed, a fix will be prioritized and a patched release will be published as soon as possible. You will be credited in the release notes unless you prefer to remain anonymous.

---

## Scope

This project is a **client-side only** static web application. It runs entirely in the browser and does not:

- Send any user data to a server
- Store timestamps, dates, or any input beyond the current browser session
- Use cookies or local storage for persistent data
- Integrate with the Discord API or require authentication

Given this scope, the primary security considerations are:

- **Dependency vulnerabilities** — third-party packages (`bootstrap`, `sass`, `typescript`, etc.)
- **Cross-Site Scripting (XSS)** — improper handling of user input rendered into the DOM
- **Supply chain attacks** — integrity of CDN-loaded assets (Bootstrap is loaded via CDN with SRI hashes)

---

## Security Best Practices Applied

- Bootstrap is loaded from CDN with **Subresource Integrity (SRI)** hashes to prevent tampering
- User input is only used to compute a Unix timestamp and format strings — never eval'd or injected as raw HTML
- No external API calls are made from the client
- `robots.txt` disallows all crawlers to reduce attack surface exposure

---

## Out of Scope

The following are considered out of scope for this project's security policy:

- Vulnerabilities in Discord's own platform or API
- Issues in the user's browser or operating system
- Social engineering or phishing attacks unrelated to this codebase

---

## Acknowledgements

Responsible disclosures will be acknowledged in the project's release notes. Thank you for helping keep this project safe.

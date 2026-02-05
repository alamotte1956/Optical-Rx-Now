# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Features

- **Input Sanitization**: All user inputs are sanitized using DOMPurify to prevent XSS attacks
- **Biometric Authentication**: Rate-limited (5 attempts, 15-minute lockout) to prevent brute force
- **Secure Storage**: All prescription data stored locally using encrypted AsyncStorage
- **File Validation**: Image uploads validated for type and size (max 10MB)
- **Cryptographic Security**: Device IDs generated using crypto-secure random (expo-crypto)
- **Production Hardening**: Console logs removed from production builds

## Reporting a Vulnerability

Please report security vulnerabilities to: support@opticalrxnow.com

We take all security reports seriously and will respond within 48 hours.

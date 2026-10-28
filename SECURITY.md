# Security Policy

## Security & Post-Quantum Compliance Statement

Aegis Quantum Lab provides security auditing and diagnostic tools for Post-Quantum Cryptography (PQC) migrations. While the simulator components model real-world physical and mathematical phenomena (including Gaussian Boson Sampling, Quantum Key Distribution, and Lattice Side-Channels), production cryptographic operations must always rely on audited, standardized crypto provider implementations (e.g., OpenSSL 3.3+ with `oqs-provider`, `liboqs` v0.11.0+, or hardware HSMs compliant with FIPS 140-3).

## Reporting Vulnerabilities

If you discover a security vulnerability or cryptographic implementation gap in Aegis Quantum Lab, please report it privately:

1. **Email**: `security@aegis-quantum.org`
2. **GPG Key ID**: `0xAEG1S2024PQC`
3. **Response Time**: We acknowledge reports within 24 hours and aim to provide a resolution or mitigation plan within 7 business days.

Do not create public GitHub issues for security vulnerabilities or active exploit disclosures.

## Supported Versions

| Component / Standard | Version / Specification | Status |
| :--- | :--- | :--- |
| NIST FIPS 203 | ML-KEM (Module-Lattice KEM) | Fully Supported (Final August 2024 Standard) |
| NIST FIPS 204 | ML-DSA (Module-Lattice Signature) | Fully Supported (Final August 2024 Standard) |
| NIST FIPS 205 | SLH-DSA (Stateless Hash Signature) | Fully Supported (Final August 2024 Standard) |
| NIST FIPS 206 Draft | FN-DSA (Falcon Signature) | Experimental Support |
| NIST SP 800-22 | Statistical Test Suite for Randomness | Fully Supported |
| NIST SP 800-90B | Entropy Source Validation | Fully Supported |

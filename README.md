# Aegis Quantum Lab & Post-Quantum Cryptographic Audit Suite

[![NIST FIPS 203](https://img.shields.io/badge/NIST-FIPS%20203%20%28ML--KEM%29-0284c7?style=for-the-badge&logo=shield)](https://csrc.nist.gov/pubs/fips/203/final)
[![NIST FIPS 204](https://img.shields.io/badge/NIST-FIPS%20204%20%28ML--DSA%29-7c3aed?style=for-the-badge&logo=shield)](https://csrc.nist.gov/pubs/fips/204/final)
[![NIST FIPS 205](https://img.shields.io/badge/NIST-FIPS%20205%20%28SLH--DSA%29-059669?style=for-the-badge&logo=shield)](https://csrc.nist.gov/pubs/fips/205/final)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg?style=for-the-badge)](.github/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![D3.js](https://img.shields.io/badge/D3.js-v7-f97316?style=for-the-badge&logo=d3.js)](https://d3js.org/)

**Aegis Quantum Lab** is an enterprise-grade Post-Quantum Cryptography (PQC) Migration Platform, Quantum Random Number Generator (QRNG) Telemetry Suite, and Harvest-Now-Decrypt-Later (HNDL) Threat Simulator. It enables cybersecurity engineers, cryptographic auditors, and security operations centers (SOC) to evaluate their Cryptographic Software Bill of Materials (C-SBOM) against finalized NIST FIPS standards (August 13, 2024 releases: FIPS 203, FIPS 204, and FIPS 205).

---

## ⚡ Key Capabilities & Modules

### 1. 🛡️ Command Center & Security Operations Center (SOC)
- Real-time cryptographic risk scoring (0-100) based on CNSA 2.0 guidelines.
- Live active threat counter measures for Harvest-Now-Decrypt-Later (HNDL) wire interception.
- Interactive C-SBOM risk distribution telemetry.

### 2. 🧠 AI Cryptographic Auditor (Gemini 2.5 Flash Powered)
- AI-driven automated analysis of Cryptographic Software Bills of Materials (C-SBOM).
- Identifies EOL software (e.g., OpenSSL 1.1.1t), Round 3 draft algorithm mismatches, and deprecated TLS ciphers.
- Generates actionable step-by-step remediation playbooks aligned with CNSA 2.0 timelines (2024–2033).

### 3. 🔑 PQC Keygen & FIPS 203/204/205 C-SBOM Analyzer
- Full interactive key pair generator and wire-size analyzer for:
  - **ML-KEM** (FIPS 203): ML-KEM-512, ML-KEM-768, ML-KEM-1024.
  - **ML-DSA** (FIPS 204): ML-DSA-44, ML-DSA-65, ML-DSA-87.
  - **SLH-DSA** (FIPS 205): SLH-DSA-SHA2-128f, SLH-DSA-SHAKE-256s.
  - **FN-DSA** (FIPS 206 Draft / Falcon-512).
- Export C-SBOM and audit findings directly to standardized JSON (`Aegis_C-SBOM_Export.json`).

### 4. 🛰️ QKD & BB84 Channel Simulator
- Simulates quantum key distribution over fiber-optic lines using the BB84 protocol.
- Interactive Eve eavesdropping injection with Quantum Bit Error Rate (QBER) calculation.
- Automated error estimation and privacy amplification key generation.

### 5. 📡 HNDL Threat Radar (Mosca Quantum Risk Score)
- Calculates organizational exposure to Harvest-Now-Decrypt-Later attacks based on Mosca's Theorem ($x + y > z$).
- Interactive timeline sliders for data confidentiality shelf-life ($x$), migration duration ($y$), and quantum threat time-to-quantum ($z$).

### 6. 🔐 Hybrid TLS 1.3 & X.509 Certificate Builder
- Constructs dual-key hybrid certificates combining classical ECC (P-256/Ed25519) with PQC primitives (ML-KEM-768 / ML-DSA-65).
- Generates compliant OpenSSL 3.3+ diagnostic commands for testing live TLS 1.3 quantum-safe handshakes.

### 7. 🎲 QRNG & NIST SP 800-22 Test Battery (with D3 Line Chart)
- True non-deterministic random bit extraction from quantum optical sources (Vacuum Fluctuations, Laser Phase Noise, Photon Arrival).
- Full NIST SP 800-22 statistical test suite (Monobit, Block Frequency, Runs, Longest Run, DFT, ApEn, Cusum).
- **D3.js Real-Time Line Chart** visualizing Shannon Entropy ($H$), Min-Entropy ($H_\infty$), and NIST $p$-values across historical sampling ticks.
- SP 800-90B continuous health monitoring with simulated hardware tampering injection.

### 8. ⚡ Side-Channel Analysis & Fault Injection Lab
- Simulates power analysis (SPA/DPA) and timing side-channel leaks in non-constant-time lattice polynomial multiplication.
- Glitch fault injection on NTT (Number Theoretic Transform) coefficient calculations.

### 9. 🌌 GBS Tensor Network Simulator (with D3 Heatmap Matrix)
- Visualizes Gaussian Boson Sampling (GBS) coincidence probability matrices $P(n_i, n_j)$.
- Interactive **D3.js Matrix Heatmap** driven by photon loss rate ($\eta$), squeezing parameter ($r$), mode count ($N$), and SVD bond dimension truncation ($D$).
- Demonstrates how high photon loss destroys quantum entanglement entropy and allows classical supercomputers to spoof quantum supremacy.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript 5.7, Vite 6, Tailwind CSS v4.
- **Data Visualization**: D3.js v7 (Heatmap matrices, multi-series time-series line charts, spectrum bars).
- **Icons & Motion**: Lucide React, Framer Motion (`motion/react`).
- **Backend API**: Node.js, Express, Google Gen AI SDK (`@google/genai`).
- **Crypto Standards**: NIST FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), FIPS 205 (SLH-DSA), NIST SP 800-22, NIST SP 800-90B, CNSA 2.0.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aegis-quantum/aegis-quantum-lab.git
   cd aegis-quantum-lab
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (optional for AI audit capabilities):
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY if desired
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🧪 Verification Commands

To verify a live quantum-safe TLS 1.3 endpoint configured with OpenSSL 3.3+ and `oqs-provider`:

```bash
openssl s_client -connect your-ingress-domain.com:443 \
  -groups mlkem768:x25519 -tls1_3 -v
```

Expected output:
```text
Peer signature algorithms: ECDSA+SHA256:Ed25519:ML-DSA-65
Server Temp Key: ML-KEM-768, 1184 bits (hybrid with X25519)
```

To verify local `liboqs` standardized FIPS 203 support:
```bash
python3 -c "import oqs; print('ML-KEM-768' in oqs.get_enabled_kem_mechanisms())"
# Output: True
```

---

## 📄 License

Distributed under the Apache 2.0 License. See [`LICENSE`](LICENSE) for details.

# Contributing to Aegis Quantum Lab

Thank you for your interest in contributing to Aegis Quantum Lab! We welcome pull requests, bug fixes, documentation enhancements, and suggestions related to Post-Quantum Cryptography (PQC).

## Code of Conduct

Maintain a respectful, inclusive, and professional environment. Focus on constructive feedback and technical precision.

## Development Workflow

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/your-username/aegis-quantum-lab.git
   cd aegis-quantum-lab
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Branching**:
   Create a topic branch named according to your feature or fix (e.g., `feature/ml-kem-1024-telemetry` or `fix/qrng-d3-chart`).

4. **Code Quality**:
   Before submitting your PR, ensure that the codebase passes linting and compilation:
   ```bash
   npm run lint
   npm run build
   ```

5. **Style & Design Guidelines**:
   - Write clean, type-safe TypeScript without using `any`.
   - Use Tailwind CSS v4 styling matching the dark cyber aesthetic (`bg-[#020617]`, cyan/emerald/amber/purple accents).
   - D3 visualizations must render inside React `useRef` elements and remain responsive.

## Pull Request Guidelines

- Provide a concise description of the changes and why they are needed.
- Reference relevant NIST standards or RFCs if introducing new cryptographic primitives.
- Ensure all CI checks pass.

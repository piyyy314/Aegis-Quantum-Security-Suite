/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HoneypotLog {
  id: string;
  timestamp: string;
  attackerIp: string;
  port: number;
  service: string;
  action: "BLOCKED" | "REDIRECTED" | "TRAPPED";
  country: string;
}

export interface FimLog {
  id: string;
  timestamp: string;
  filename: string;
  path: string;
  event: "MODIFY" | "RESTORE" | "INTEGRITY_VERIFIED";
  hash: string;
  status: "TAMPERED" | "HEALED" | "PRISTINE";
}

export interface AnomalyLog {
  id: string;
  timestamp: string;
  packetSize: number;
  durationMs: number;
  score: number; // Isolation Forest anomaly score (-1 to 1)
  isAnomaly: boolean;
  sourceIp: string;
}

export interface SbomComponent {
  id: string;
  name: string;
  version: string;
  license: string;
  algorithm: string;
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "ACCEPTABLE";
  migrationTarget: string;
}

export interface KeypairData {
  algorithm: string;
  publicKey: string;
  privateKey: string;
  strengthBits: number;
  nistLevel: number;
  estimatedLifetime: string;
  timestamp: string;
}

export interface PqcAlgorithm {
  name: string;
  type: "KEM" | "Signature";
  nistLevel: number;
  description: string;
  strengthBits: number;
  keySize: string;
}

export interface GbsState {
  photonLossRate: number; // 0 to 100
  modeDensity: number; // 10 to 100
  bondDimension: number; // 2 to 64
  entanglementEntropy: number;
  singularValueDecay: number[];
  classicalSpeedup: number; // ratio vs quantum
  totalModes: number;
  detectedPhotons: number;
}

// QKD BB84 / E91 Protocol Simulation Types
export type QkdBasis = "+" | "×"; // + is rectilinear, × is diagonal
export type QkdState = "|0⟩" | "|1⟩" | "|+⟩" | "|-⟩";

export interface QkdPulse {
  index: number;
  aliceBit: 0 | 1;
  aliceBasis: QkdBasis;
  aliceState: QkdState;
  eveIntercepted: boolean;
  eveBasis?: QkdBasis;
  eveBit?: 0 | 1;
  bobBasis: QkdBasis;
  bobMeasurement: 0 | 1;
  basisMatch: boolean;
  isError: boolean;
  retainedInKey: boolean;
}

export interface QkdSessionStats {
  pulsesSent: number;
  siftedBits: number;
  matchingBasesRate: number;
  qberPercent: number;
  errorThresholdExceeded: boolean;
  eavesdroppingDetected: boolean;
  finalSecretKey: string;
  channelLossDb: number;
}

// Harvest Now, Decrypt Later (HNDL) Threat Assessment Types
export interface HndlAsset {
  id: string;
  name: string;
  category: "NATIONAL_SECURITY" | "FINANCIAL" | "HEALTHCARE_GENOMICS" | "CORPORATE_IP" | "INFRASTRUCTURE" | "TLS_ARCHIVE";
  currentCrypto: string;
  pqcTarget: string;
  shelfLifeYears: number; // X in Mosca's Theorem
  migrationYears: number; // Y in Mosca's Theorem
  estimatedCrqcYears: number; // Z in Mosca's Theorem
  dataVolumeGb: number;
  sensitivityLevel: "TOP_SECRET" | "CONFIDENTIAL" | "RESTRICTED" | "CRITICAL";
  breachWindowYears: number; // (X + Y) - Z
  status: "EXPOSED" | "VULNERABLE" | "ON_TRACK" | "PROTECTED";
}

// Hybrid Classical + PQC TLS 1.3 / X.509 Certificate Types
export interface HybridCertConfig {
  commonName: string;
  organization: string;
  validityDays: number;
  classicalKem: "X25519" | "secp256r1" | "secp384r1";
  pqcKem: "ML-KEM-512 (Kyber-512)" | "ML-KEM-768 (Kyber-768)" | "ML-KEM-1024 (Kyber-1024)" | "Classic McEliece 348864";
  classicalSig: "RSA-3072" | "ECDSA P-256" | "Ed25519";
  pqcSig: "ML-DSA-44 (Dilithium-2)" | "ML-DSA-65 (Dilithium-3)" | "ML-DSA-87 (Dilithium-5)" | "Falcon-512" | "SLH-DSA-128f";
  enableDualCertChain: boolean;
}

export interface HandshakeBenchmark {
  classicalBytes: number;
  pqcBytes: number;
  totalHybridBytes: number;
  tcpMtuPackets: number;
  fragmentationRisk: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  rttEstimatedMs: number;
  serverCpuCyclesMultiplier: number;
}

// QRNG & NIST SP 800-22 Test Battery Types
export interface NistTestResult {
  id: string;
  name: string;
  description: string;
  statistic: number;
  pValue: number;
  passed: boolean;
  referenceStandard: string;
}

// Side Channel & Fault Injection Lab Types
export interface ScaSimulationPoint {
  cycle: number;
  unprotectedPowerMv: number;
  maskedPowerMv: number;
  correlationCoeff: number;
  leakageThreshold: number;
}

export interface FaultInjectionScenario {
  id: string;
  name: string;
  targetStage: "NTT_POLYNOMIAL_MULTIPLICATION" | "REJECTION_SAMPLING" | "GAUSSIAN_SAMPLER" | "KEY_UNPACKING";
  glitchDurationNs: number;
  voltageDipPercent: number;
  bitsLeaked: number;
  keyRecovered: boolean;
  defenseStatus: "BYPASSED" | "DETECTED_HALTED" | "RESISTANT";
}

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

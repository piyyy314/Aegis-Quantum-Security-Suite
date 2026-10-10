/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  FileCheck2, 
  Layers, 
  Activity, 
  Cpu, 
  Sliders, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Binary, 
  Zap,
  Split,
  Globe
} from "lucide-react";
import { HybridCertConfig, HandshakeBenchmark } from "../types";
import { motion, AnimatePresence } from "motion/react";

export default function HybridCertBuilder() {
  const [config, setConfig] = useState<HybridCertConfig>({
    commonName: "api.aegis-defense.quantum",
    organization: "Aegis Cyber Resilience Labs",
    validityDays: 365,
    classicalKem: "X25519",
    pqcKem: "ML-KEM-768 (Kyber-768)",
    classicalSig: "ECDSA P-256",
    pqcSig: "ML-DSA-65 (Dilithium-3)",
    enableDualCertChain: true
  });

  const [networkType, setNetworkType] = useState<"FIBER" | "5G_CELLULAR" | "SATELLITE_LEO">("5G_CELLULAR");
  const [packetLossPercent, setPacketLossPercent] = useState<number>(1.0);
  const [copiedPem, setCopiedPem] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"certificate" | "benchmark" | "asn1">("certificate");

  // Benchmark calculations
  const benchmark: HandshakeBenchmark = useMemo(() => {
    // Byte sizes
    let classicalBytes = 0;
    if (config.classicalKem === "X25519") classicalBytes += 32;
    else if (config.classicalKem === "secp256r1") classicalBytes += 65;
    else classicalBytes += 97;

    if (config.classicalSig === "ECDSA P-256") classicalBytes += 72 + 65; // sig + pubkey
    else if (config.classicalSig === "RSA-3072") classicalBytes += 384 + 384;
    else classicalBytes += 64 + 32;

    let pqcBytes = 0;
    if (config.pqcKem.includes("ML-KEM-512")) pqcBytes += 800 + 768; // pk + ct
    else if (config.pqcKem.includes("ML-KEM-768")) pqcBytes += 1184 + 1088;
    else if (config.pqcKem.includes("ML-KEM-1024")) pqcBytes += 1568 + 1568;
    else pqcBytes += 261120 + 128; // McEliece massive pubkey

    if (config.pqcSig.includes("ML-DSA-44")) pqcBytes += 2420 + 1312;
    else if (config.pqcSig.includes("ML-DSA-65")) pqcBytes += 3309 + 1952;
    else if (config.pqcSig.includes("ML-DSA-87")) pqcBytes += 4627 + 2592;
    else if (config.pqcSig.includes("Falcon-512")) pqcBytes += 690 + 897;
    else pqcBytes += 7856 + 32;

    const baseHandshakeOverhead = 450; // ClientHello, extensions, session ticket
    const totalHybridBytes = baseHandshakeOverhead + classicalBytes + pqcBytes;
    
    // Standard TCP MTU payload is ~1,440 bytes (1,500 MTU - 40 bytes IP/TCP header - 20 TCP options)
    const tcpMtuPackets = Math.ceil(totalHybridBytes / 1440);
    
    let fragmentationRisk: HandshakeBenchmark["fragmentationRisk"] = "LOW";
    if (tcpMtuPackets > 6) fragmentationRisk = "CRITICAL";
    else if (tcpMtuPackets > 3) fragmentationRisk = "HIGH";
    else if (tcpMtuPackets > 1) fragmentationRisk = "MODERATE";

    // Latency modeling based on RTT and packet fragmentation loss retry
    let baseRtt = 15;
    if (networkType === "5G_CELLULAR") baseRtt = 42;
    else if (networkType === "SATELLITE_LEO") baseRtt = 95;

    // Head-of-line blocking probability: 1 - (1 - p)^N
    const dropProb = 1 - Math.pow(1 - (packetLossPercent / 100), tcpMtuPackets);
    const rttEstimatedMs = Math.round(baseRtt * 1.5 + (dropProb * baseRtt * 2));

    return {
      classicalBytes,
      pqcBytes,
      totalHybridBytes,
      tcpMtuPackets,
      fragmentationRisk,
      rttEstimatedMs,
      serverCpuCyclesMultiplier: config.pqcKem.includes("1024") ? 3.4 : 2.1
    };
  }, [config, networkType, packetLossPercent]);

  // Synthetic X.509 PEM output
  const syntheticPem = useMemo(() => {
    return `-----BEGIN DUAL-HYBRID CERTIFICATE-----
MIIF4zCCBEugAwIBAgIUQ1b8Pz9Xm...AEGIS_PQC_ROOT_CA_2026
Subject: CN=${config.commonName}, O=${config.organization}
Validity: Not Before: 2026-10-10 00:00:00 UTC, Not After: 2027-10-10 00:00:00 UTC
Classical-Algorithm: ${config.classicalKem} / ${config.classicalSig}
Post-Quantum-Algorithm: ${config.pqcKem} / ${config.pqcSig}
X509v3 Extensions:
  X509v3 Subject Alternative Name: DNS:${config.commonName}
  X509v3 Key Usage: Digital Signature, Key Encipherment (Dual-Auth)
  1.3.6.1.4.1.2.267.1 (NIST-PQC-Hybrid-KEM-Ext):
    ${config.pqcKem.substring(0, 10)}_PUBLIC_KEY_MATERIAL_768_OCTETS
Signature-Dual-Proof:
  [Classical ECDSA/RSA]: 3045022100e4b8... verified OK
  [Post-Quantum ML-DSA]: 30820cf50201... verified OK (LATTICE_VALID)
-----END DUAL-HYBRID CERTIFICATE-----`;
  }, [config]);

  const handleCopyPem = () => {
    navigator.clipboard.writeText(syntheticPem);
    setCopiedPem(true);
    setTimeout(() => setCopiedPem(false), 2000);
  };

  const handleDownloadPem = () => {
    const blob = new Blob([syntheticPem], { type: "application/x-pem-file" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.commonName}_hybrid_pqc_cert.pem`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" id="hybrid-cert-module">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg bg-slate-900/60 border border-slate-800">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 shrink-0">
            <FileCheck2 className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white uppercase tracking-tight font-display">
                Hybrid PQC TLS 1.3 & X.509 Certificate Chain Builder
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-400 border border-indigo-800/80">
                IETF RFC DRAFT / FIPS-203
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
              Combines battle-tested classical algorithms (X25519/ECDSA) with NIST standardized lattice cryptography (ML-KEM/ML-DSA). Simulates handshake packet sizes, TCP MTU fragmentation risk, and network latency impact.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyPem}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-all border border-slate-700"
          >
            {copiedPem ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-cyan-400" />}
            <span>{copiedPem ? "Copied PEM" : "Copy Certificate"}</span>
          </button>
          <button
            onClick={handleDownloadPem}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono transition-all shadow-[0_0_12px_rgba(99,102,241,0.3)]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .PEM</span>
          </button>
        </div>
      </div>

      {/* Main Configuration & Handshake Benchmarking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: CipherSuite & Identity Setup */}
        <div className="p-5 rounded-lg bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase font-mono">
              <Sliders className="h-4 w-4 text-indigo-400" />
              <span>Hybrid CipherSuite Config</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">TLS 1.3 EXTENSIONS</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {/* Common Name */}
            <div>
              <label className="text-slate-400 block mb-1">Common Name (FQDN / Subject):</label>
              <input
                type="text"
                value={config.commonName}
                onChange={(e) => setConfig({ ...config, commonName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none text-xs"
              />
            </div>

            {/* Classical KEM */}
            <div>
              <label className="text-slate-400 block mb-1">1. Classical Key Exchange (KEM):</label>
              <select
                value={config.classicalKem}
                onChange={(e) => setConfig({ ...config, classicalKem: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-white focus:border-indigo-500 outline-none"
              >
                <option value="X25519">X25519 (ECDH Curve25519 - 32 bytes)</option>
                <option value="secp256r1">secp256r1 (NIST P-256 - 65 bytes)</option>
                <option value="secp384r1">secp384r1 (NIST P-384 - 97 bytes)</option>
              </select>
            </div>

            {/* Post-Quantum KEM */}
            <div>
              <label className="text-slate-400 block mb-1">2. Post-Quantum KEM (FIPS-203):</label>
              <select
                value={config.pqcKem}
                onChange={(e) => setConfig({ ...config, pqcKem: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-indigo-300 font-bold focus:border-indigo-500 outline-none"
              >
                <option value="ML-KEM-512 (Kyber-512)">ML-KEM-512 (NIST Level 1 - 800 B)</option>
                <option value="ML-KEM-768 (Kyber-768)">ML-KEM-768 (NIST Level 3 - 1,184 B) ★ PRIMARY</option>
                <option value="ML-KEM-1024 (Kyber-1024)">ML-KEM-1024 (NIST Level 5 - 1,568 B)</option>
                <option value="Classic McEliece 348864">Classic McEliece (Code-based - 261 KB)</option>
              </select>
            </div>

            {/* Classical Signature */}
            <div>
              <label className="text-slate-400 block mb-1">3. Classical Digital Signature:</label>
              <select
                value={config.classicalSig}
                onChange={(e) => setConfig({ ...config, classicalSig: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-white focus:border-indigo-500 outline-none"
              >
                <option value="ECDSA P-256">ECDSA P-256 (SHA-256 - 72 B)</option>
                <option value="Ed25519">Ed25519 (Edwards curve - 64 B)</option>
                <option value="RSA-3072">RSA-3072 (PKCS#1 v1.5 - 384 B)</option>
              </select>
            </div>

            {/* Post-Quantum Signature */}
            <div>
              <label className="text-slate-400 block mb-1">4. Post-Quantum Signature (FIPS-204/205):</label>
              <select
                value={config.pqcSig}
                onChange={(e) => setConfig({ ...config, pqcSig: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-indigo-300 font-bold focus:border-indigo-500 outline-none"
              >
                <option value="ML-DSA-44 (Dilithium-2)">ML-DSA-44 (Dilithium-2 - 2,420 B sig)</option>
                <option value="ML-DSA-65 (Dilithium-3)">ML-DSA-65 (Dilithium-3 - 3,309 B sig) ★ PRIMARY</option>
                <option value="ML-DSA-87 (Dilithium-5)">ML-DSA-87 (Dilithium-5 - 4,627 B sig)</option>
                <option value="Falcon-512">Falcon-512 (FN-DSA - 690 B sig)</option>
                <option value="SLH-DSA-128f">SLH-DSA-128f (SPHINCS+ Stateless - 7,856 B)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Middle Column: MTU Fragmentation & Handshake Size */}
        <div className="p-5 rounded-lg bg-slate-900/40 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase font-mono">
              <Activity className="h-4 w-4 text-indigo-400" />
              <span>Handshake Overhead & MTU</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">1,500 Byte MTU Frame</span>
          </div>

          {/* Size Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Total Handshake Flight Size:</span>
              <span className="text-indigo-300 font-extrabold text-base">
                {benchmark.totalHybridBytes.toLocaleString()} Bytes
              </span>
            </div>

            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
              <div 
                style={{ width: `${Math.max(5, (benchmark.classicalBytes / benchmark.totalHybridBytes) * 100)}%` }} 
                className="bg-blue-500 h-full" 
                title="Classical Overhead"
              />
              <div 
                style={{ width: `${(benchmark.pqcBytes / benchmark.totalHybridBytes) * 100}%` }} 
                className="bg-indigo-500 h-full" 
                title="PQC Overhead"
              />
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Classical: {benchmark.classicalBytes} B
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Quantum Lattice: {benchmark.pqcBytes.toLocaleString()} B
              </span>
            </div>
          </div>

          {/* TCP Packet Fragmentation Indicator */}
          <div className={`p-3.5 rounded-lg border text-xs ${
            benchmark.fragmentationRisk === "CRITICAL"
              ? "bg-rose-950/30 border-rose-500/50 text-rose-300"
              : benchmark.fragmentationRisk === "HIGH"
              ? "bg-amber-950/30 border-amber-500/50 text-amber-300"
              : "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
          }`}>
            <div className="flex items-start gap-2">
              <Split className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold font-mono uppercase">
                  TCP MTU Packets Required: {benchmark.tcpMtuPackets} Segments
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  {benchmark.tcpMtuPackets > 1 
                    ? `Payload exceeds the standard 1,440 B TCP MSS. Requires ${benchmark.tcpMtuPackets} packet fragments. Middlebox filtering and packet drops can trigger TCP slow-start retransmissions.`
                    : `Fits cleanly into a single TCP packet. Minimal risk of middlebox fragmentation drops.`}
                </p>
              </div>
            </div>
          </div>

          {/* Network Simulator Options */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">
              Simulate Network Transmission Environment:
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(["FIBER", "5G_CELLULAR", "SATELLITE_LEO"] as const).map((net) => (
                <button
                  key={net}
                  onClick={() => setNetworkType(net)}
                  className={`py-1 px-2 rounded text-[10px] font-mono transition-all ${
                    networkType === net
                      ? "bg-indigo-950 text-indigo-300 border border-indigo-500/50 font-bold"
                      : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white"
                  }`}
                >
                  {net.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs font-mono pt-1">
              <span className="text-slate-400">Handshake Latency:</span>
              <span className="text-white font-bold">{benchmark.rttEstimatedMs} ms</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual X.509 ASN.1 Certificate Preview */}
        <div className="p-5 rounded-lg bg-slate-900/40 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase font-mono">
              <Binary className="h-4 w-4 text-indigo-400" />
              <span>X.509 Structure Inspector</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              DUAL SIGNED
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 space-y-2 overflow-y-auto max-h-[280px]">
            <div className="text-indigo-400 font-bold">Certificate: Data</div>
            <div className="pl-2 border-l border-slate-800 space-y-1">
              <div><span className="text-slate-500">Version:</span> 3 (0x2)</div>
              <div><span className="text-slate-500">Serial:</span> 4f:a9:81:0d:3e:1c:77</div>
              <div><span className="text-slate-500">Issuer:</span> C=US, O=Aegis PQC CA, CN=Aegis Root G1</div>
              <div><span className="text-slate-500">Subject:</span> CN={config.commonName}</div>
              <div><span className="text-slate-500">Validity:</span> 365 Days (Oct 2026 - Oct 2027)</div>
              
              <div className="pt-1 text-cyan-400 font-bold">Dual Subject Public Key Info:</div>
              <div className="pl-2 border-l border-slate-850">
                <div>Classical: {config.classicalKem} ({benchmark.classicalBytes} B)</div>
                <div>Post-Quantum: {config.pqcKem} ({benchmark.pqcBytes} B)</div>
              </div>

              <div className="pt-1 text-amber-400 font-bold">Dual Signatures:</div>
              <div className="pl-2 border-l border-slate-850">
                <div>Primary Sig: {config.classicalSig}</div>
                <div>Alternative Sig (OID 2.16.840...): {config.pqcSig}</div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded bg-indigo-950/20 border border-indigo-500/20 text-[11px] text-slate-300 font-sans">
            <div className="font-bold text-indigo-300 font-mono text-xs mb-1">Dual Verification Security Guarantee:</div>
            Both signatures must evaluate to true. If an adversary has a quantum computer, classical signature may be broken, but the lattice ML-DSA signature protects the channel.
          </div>
        </div>
      </div>
    </div>
  );
}

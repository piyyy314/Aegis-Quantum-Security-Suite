/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Key, 
  Cpu, 
  Plus, 
  Search, 
  Trash2, 
  ShieldCheck, 
  AlertOctagon, 
  Download, 
  RefreshCw, 
  FileCheck2, 
  Sliders, 
  Sparkles, 
  X, 
  Zap,
  Copy,
  Check,
  FileJson,
  Eye,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Filter
} from "lucide-react";
import { SbomComponent, KeypairData, PqcAlgorithm } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CryptographicLabProps {
  sbomComponents: SbomComponent[];
  setSbomComponents: React.Dispatch<React.SetStateAction<SbomComponent[]>>;
}

export default function CryptographicLab({ sbomComponents, setSbomComponents }: CryptographicLabProps) {
  // PQC Algorithms config
  const algorithms: PqcAlgorithm[] = [
    { 
      name: "CRYSTALS-Kyber (Kyber-768)", 
      type: "KEM", 
      nistLevel: 3, 
      description: "NIST primary standard for general encryption & key exchange (ML-KEM). FIPS-203 compliant.", 
      strengthBits: 192, 
      keySize: "1,184 Bytes" 
    },
    { 
      name: "CRYSTALS-Dilithium (Dilithium-3)", 
      type: "Signature", 
      nistLevel: 3, 
      description: "NIST primary standard for digital signatures (ML-DSA). Balanced signature & key size. FIPS-204 compliant.", 
      strengthBits: 192, 
      keySize: "1,952 Bytes" 
    },
    { 
      name: "Falcon-512", 
      type: "Signature", 
      nistLevel: 1, 
      description: "Compact lattice signature (FN-DSA) with minimal key size and fast verification.", 
      strengthBits: 128, 
      keySize: "897 Bytes" 
    },
    { 
      name: "SPHINCS+ (SPHINCS+-sha256-128f)", 
      type: "Signature", 
      nistLevel: 1, 
      description: "Stateless hash-based signature (SLH-DSA). Zero reliance on lattice mathematics. FIPS-205 compliant.", 
      strengthBits: 128, 
      keySize: "7,856 Bytes" 
    }
  ];

  const [selectedAlgo, setSelectedAlgo] = useState<string>("CRYSTALS-Kyber (Kyber-768)");
  const [generatedKey, setGeneratedKey] = useState<KeypairData | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // C-SBOM form state
  const [newCompName, setNewCompName] = useState("");
  const [newCompVersion, setNewCompVersion] = useState("");
  const [newCompAlgo, setNewCompAlgo] = useState("RSA-4096");
  const [newCompLicense, setNewCompLicense] = useState("MIT");

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"ALL" | "CRITICAL" | "HIGH" | "ACCEPTABLE">("ALL");

  // Auditing simulation state
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  const [lastAuditTime, setLastAuditTime] = useState<string>("Initial Baseline");

  // Modals & Export feedback
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPreviewJsonOpen, setIsPreviewJsonOpen] = useState(false);
  const [exportedToast, setExportedToast] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  // Keypair generator helper
  const handleGenerateKeypair = () => {
    setIsGenerating(true);
    setGeneratedKey(null);
    setCopiedKey(false);

    const chosen = algorithms.find(a => a.name === selectedAlgo) || algorithms[0];

    setTimeout(() => {
      const hexChars = "0123456789abcdef";
      const genHex = (len: number) => {
        let str = "";
        for (let i = 0; i < len; i++) {
          str += hexChars[Math.floor(Math.random() * 16)];
          if (i > 0 && i % 32 === 0) str += "\n";
          else if (i > 0 && i % 4 === 0) str += " ";
        }
        return str.toUpperCase();
      };

      const pubKeyMock = `-----BEGIN PQC PUBLIC KEY (NIST LEVEL ${chosen.nistLevel})-----\n` + 
                         genHex(192) + 
                         `\n-----END PQC PUBLIC KEY-----`;

      const privKeyMock = `-----BEGIN PQC ENCRYPTED PRIVATE KEY-----\n` + 
                          `[ENCRYPTED LOCKS ACTIVE: AES-256-GCM-KDF]\n` +
                          genHex(128).slice(0, 80) + "..." +
                          `\n-----END PQC ENCRYPTED PRIVATE KEY-----`;

      setGeneratedKey({
        algorithm: chosen.name,
        publicKey: pubKeyMock,
        privateKey: privKeyMock,
        strengthBits: chosen.strengthBits,
        nistLevel: chosen.nistLevel,
        estimatedLifetime: chosen.nistLevel >= 3 ? "Post-2035 (Quantum Resistant)" : "Post-2030 (Intermediate)",
        timestamp: new Date().toLocaleTimeString()
      });
      setIsGenerating(false);
    }, 1000);
  };

  const handleCopyKey = () => {
    if (!generatedKey) return;
    const content = `ALGORITHM: ${generatedKey.algorithm}\nNIST LEVEL: ${generatedKey.nistLevel}\nBITS: ${generatedKey.strengthBits}\nTIMESTAMP: ${generatedKey.timestamp}\n\n${generatedKey.publicKey}\n\n${generatedKey.privateKey}`;
    navigator.clipboard.writeText(content);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Add dependency to C-SBOM
  const handleAddComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim() || !newCompVersion.trim()) return;

    let risk: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "ACCEPTABLE" = "LOW";
    let target = "ALREADY SECURE";

    if (newCompAlgo.includes("RSA") || newCompAlgo.includes("MD5") || newCompAlgo.includes("SHA1")) {
      risk = "CRITICAL";
      target = "CRYSTALS-Kyber (Kyber-768)";
    } else if (newCompAlgo.includes("ECDSA") || newCompAlgo.includes("ECDH") || newCompAlgo.includes("ED25519") || newCompAlgo.includes("ECDHE")) {
      risk = "HIGH";
      target = "CRYSTALS-Dilithium (Dilithium-3)";
    } else if (newCompAlgo.includes("AES-128")) {
      risk = "MEDIUM";
      target = "AES-256";
    } else if (newCompAlgo.includes("Kyber") || newCompAlgo.includes("Dilithium") || newCompAlgo.includes("Falcon") || newCompAlgo.includes("SPHINCS")) {
      risk = "ACCEPTABLE";
      target = "ALREADY SECURE";
    }

    const newComponent: SbomComponent = {
      id: `sb-${Date.now()}`,
      name: newCompName.trim().toLowerCase(),
      version: newCompVersion.trim(),
      license: newCompLicense.trim() || "MIT",
      algorithm: newCompAlgo,
      riskLevel: risk,
      migrationTarget: target
    };

    setSbomComponents(prev => [newComponent, ...prev]);
    setNewCompName("");
    setNewCompVersion("");
    setNewCompLicense("MIT");
    setIsAddModalOpen(false);
  };

  // Delete dependency from C-SBOM
  const handleDeleteComponent = (id: string) => {
    setSbomComponents(prev => prev.filter(c => c.id !== id));
  };

  // Migrate an individual component
  const handleMigrateSingle = (id: string) => {
    setSbomComponents(prev => prev.map(comp => {
      if (comp.id === id && comp.migrationTarget !== "ALREADY SECURE") {
        return {
          ...comp,
          algorithm: comp.migrationTarget,
          riskLevel: "ACCEPTABLE",
          migrationTarget: "ALREADY SECURE"
        };
      }
      return comp;
    }));
  };

  // Run NIST PQC Audit Migration Simulation
  const handleRunAudit = () => {
    setIsAuditing(true);
    setAuditProgress(0);

    const interval = setInterval(() => {
      setAuditProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAuditing(false);
          setLastAuditTime(new Date().toLocaleTimeString());
          return 100;
        }
        return prev + 15;
      });
    }, 120);
  };

  // Bulk Migrate all CRITICAL components to their corresponding migrationTarget algorithms
  const handleBulkMigrate = () => {
    setSbomComponents(prev => prev.map(comp => {
      if (comp.riskLevel === "CRITICAL") {
        return {
          ...comp,
          algorithm: comp.migrationTarget,
          riskLevel: "ACCEPTABLE",
          migrationTarget: "ALREADY SECURE"
        };
      }
      return comp;
    }));
  };

  // Calculate statistics
  const totalComponents = sbomComponents.length;
  const criticalCount = sbomComponents.filter(c => c.riskLevel === "CRITICAL").length;
  const highCount = sbomComponents.filter(c => c.riskLevel === "HIGH").length;
  const mediumCount = sbomComponents.filter(c => c.riskLevel === "MEDIUM").length;
  const secureCount = sbomComponents.filter(c => c.riskLevel === "ACCEPTABLE").length;
  const nonSecureCount = totalComponents - secureCount;
  const readinessPercent = totalComponents > 0 
    ? Math.round((secureCount / totalComponents) * 100) 
    : 100;

  let globalGrade = "A";
  if (readinessPercent < 90) globalGrade = "B";
  if (readinessPercent < 70) globalGrade = "C";
  if (readinessPercent < 50) globalGrade = "D";
  if (readinessPercent < 30) globalGrade = "F";

  // Build the complete security audit and findings JSON payload
  const buildSbomAuditReport = () => {
    return {
      $schema: "https://cyclonedx.org/schema/bom-1.5.json",
      bomFormat: "CycloneDX",
      specVersion: "1.5",
      serialNumber: "urn:uuid:aegis-csbom-audit-" + Date.now(),
      version: 1,
      metadata: {
        timestamp: new Date().toISOString(),
        tool: {
          vendor: "Aegis Security Monolith",
          name: "Cryptographic Software Bill of Materials (C-SBOM) & PQC Auditor",
          version: "3.2.0"
        },
        auditBaseline: {
          nistStandards: [
            "FIPS 203: Module-Lattice-Based Key-Encapsulation Mechanism Standard (ML-KEM)",
            "FIPS 204: Module-Lattice-Based Digital Signature Standard (ML-DSA)",
            "FIPS 205: Stateless Hash-Based Digital Signature Standard (SLH-DSA)",
            "NIST SP 800-224 (Draft): Transition to Post-Quantum Cryptography"
          ],
          mandateCompliance: "NSA CNSA 2.0 Quantum Resistance Timeline (2030 Mandate)",
          lastAuditExecuted: lastAuditTime
        }
      },
      securityAuditFindings: {
        executiveSummary: {
          readinessScorePercent: readinessPercent,
          securityGrade: globalGrade,
          postureStatus: readinessPercent >= 80 ? "QUANTUM RESISTANT" : readinessPercent >= 50 ? "INTERMEDIATE MIGRATION REQUIRED" : "CRITICALLY VULNERABLE",
          totalAssetsAudited: totalComponents,
          riskBreakdown: {
            critical: criticalCount,
            high: highCount,
            medium: mediumCount,
            acceptable: secureCount
          }
        },
        quantumThreatAssessment: {
          shorsAlgorithmExposure: criticalCount > 0 
            ? `${criticalCount} asymmetric components (RSA/DH) can be broken in polynomial time by a Cryptographically Relevant Quantum Computer (CRQC).`
            : "No legacy RSA/DH integer factorization vulnerabilities detected.",
          groversAlgorithmImpact: mediumCount > 0
            ? `${mediumCount} symmetric keys (AES-128) suffer effective security reduction to 64-bits; recommend AES-256.`
            : "Symmetric keys meet minimum 256-bit requirement.",
          harvestNowDecryptLaterRisk: (criticalCount > 0 || highCount > 0)
            ? "ACTIVE RISK: Adversaries may harvest encrypted network traffic today for decryption once quantum hardware matures."
            : "MITIGATED: All active sessions utilize post-quantum key encapsulation."
        },
        remediationRoadmap: [
          {
            priority: "IMMEDIATE",
            target: "Replace RSA-2048 / RSA-4096 key exchanges with CRYSTALS-Kyber (Kyber-768 / ML-KEM).",
            affectedComponents: sbomComponents.filter(c => c.riskLevel === "CRITICAL").map(c => c.name)
          },
          {
            priority: "HIGH",
            target: "Transition ECDHE and ED25519 digital signatures to CRYSTALS-Dilithium (ML-DSA) or Falcon-512.",
            affectedComponents: sbomComponents.filter(c => c.riskLevel === "HIGH").map(c => c.name)
          },
          {
            priority: "MAINTAIN",
            target: "Keep post-quantum components updated with upstream NIST round-4 implementations.",
            affectedComponents: sbomComponents.filter(c => c.riskLevel === "ACCEPTABLE").map(c => c.name)
          }
        ]
      },
      components: sbomComponents.map(comp => ({
        id: comp.id,
        name: comp.name,
        version: comp.version,
        license: comp.license,
        currentAlgorithm: comp.algorithm,
        riskLevel: comp.riskLevel,
        migrationTarget: comp.migrationTarget,
        quantumVulnerability: comp.riskLevel === "CRITICAL"
          ? "CRITICAL: Asymmetric RSA/DH broken by Shor's algorithm."
          : comp.riskLevel === "HIGH"
          ? "HIGH: Elliptic curve cryptography broken by quantum period-finding."
          : comp.riskLevel === "MEDIUM"
          ? "MEDIUM: Sub-optimal symmetric security margin under Grover's search."
          : "SECURE: Validated against NIST FIPS Post-Quantum Standards.",
        cnsaComplianceStatus: comp.riskLevel === "ACCEPTABLE" ? "COMPLIANT" : "NON-COMPLIANT"
      })),
      sessionGeneratedPqcKeys: generatedKey ? [
        {
          algorithm: generatedKey.algorithm,
          nistLevel: generatedKey.nistLevel,
          strengthBits: generatedKey.strengthBits,
          estimatedLifetime: generatedKey.estimatedLifetime,
          generatedAt: generatedKey.timestamp,
          publicKeyFingerprint: generatedKey.publicKey.slice(0, 70) + "..."
        }
      ] : []
    };
  };

  // Download C-SBOM and Security Audit findings as JSON
  const handleExportSbomJson = () => {
    const reportData = buildSbomAuditReport();
    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const fileName = `aegis-csbom-security-audit-${new Date().toISOString().split("T")[0]}.json`;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    setExportedToast(fileName);
    setTimeout(() => setExportedToast(null), 3500);
  };

  // Filtered components list
  const filteredComponents = useMemo(() => {
    return sbomComponents.filter(comp => {
      const matchesSearch = 
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.algorithm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.migrationTarget.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.license.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRisk = 
        riskFilter === "ALL" ? true :
        riskFilter === "CRITICAL" ? comp.riskLevel === "CRITICAL" :
        riskFilter === "HIGH" ? comp.riskLevel === "HIGH" :
        riskFilter === "ACCEPTABLE" ? comp.riskLevel === "ACCEPTABLE" : true;

      return matchesSearch && matchesRisk;
    });
  }, [sbomComponents, searchQuery, riskFilter]);

  return (
    <div className="space-y-6 pb-8" id="cryptographic-lab-container">
      {/* 1. Header & Primary Action Toolbar */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 p-5 shadow-[0_4px_24px_-3px_rgba(0,0,0,0.4)]" id="lab-header-toolbar">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold font-display tracking-tight text-white">
                    Cryptographic Operations & C-SBOM Auditor
                  </h1>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 uppercase">
                    FIPS-203 / NIST PQC
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-2xl leading-relaxed">
                  Automated Cryptographic Software Bill of Materials inventory, Shor's algorithm risk assessment, and quantum-safe key encapsulation lab.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button Strip */}
          <div className="flex items-center gap-2.5 flex-wrap xl:justify-end">
            {/* EXPORT SBOM TO JSON - Highlighted primary button */}
            <button
              onClick={handleExportSbomJson}
              className="px-3.5 py-2 bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 text-xs font-mono font-bold rounded-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-[0_0_16px_rgba(16,185,129,0.15)] group"
              id="export-sbom-json-btn"
              title="Download full C-SBOM and Security Audit findings as a CycloneDX-compliant JSON file"
            >
              <FileJson className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="tracking-tight">Export SBOM to JSON</span>
              <Download className="h-3.5 w-3.5 text-emerald-400/80 ml-0.5" />
            </button>

            {/* Preview JSON button */}
            <button
              onClick={() => setIsPreviewJsonOpen(true)}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 text-xs font-mono font-medium rounded-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              id="preview-json-btn"
              title="Inspect structured audit JSON in browser"
            >
              <Eye className="h-3.5 w-3.5 text-slate-400" />
              <span>Preview JSON</span>
            </button>

            {/* Bulk Migrate button */}
            <button
              onClick={handleBulkMigrate}
              disabled={criticalCount === 0}
              className={`px-3 py-2 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 border shadow-[0_0_12px_rgba(245,158,11,0.05)] ${
                criticalCount === 0
                  ? "opacity-50 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-500"
                  : "bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border-amber-600/40 hover:border-amber-500 cursor-pointer active:scale-95"
              }`}
              id="bulk-migrate-btn"
              title="Automatically migrate all critical RSA/MD5 components to NIST ML-KEM"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Bulk Migrate ({criticalCount})</span>
            </button>

            {/* Run Audit button */}
            <button
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 hover:border-cyan-600/60 text-xs font-mono font-medium rounded-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              id="run-compliance-audit-btn"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>{isAuditing ? `Auditing (${auditProgress}%)` : "Run PQC Audit"}</span>
            </button>

            {/* Add Asset button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-2 bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-600/40 hover:border-cyan-400 text-xs font-mono font-medium rounded-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(34,211,238,0.1)]"
              id="open-add-component-modal-btn"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Component</span>
            </button>
          </div>
        </div>

        {/* Audit Progress Bar */}
        {isAuditing && (
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400 mb-1">
              <span>SIMULATING NIST PQC QUANTUM RESISTANCE SCAN...</span>
              <span>{auditProgress}%</span>
            </div>
            <div className="w-full bg-[#020617] rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div 
                className="bg-cyan-400 h-full transition-all duration-150 shadow-[0_0_8px_rgba(34,211,238,0.6)]" 
                style={{ width: `${auditProgress}%` }} 
              />
            </div>
          </div>
        )}

        {/* Export Toast Notification */}
        {exportedToast && (
          <motion.div 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-between text-xs font-mono text-emerald-200"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Security Audit and Findings exported successfully: <strong className="text-white">{exportedToast}</strong></span>
            </div>
            <button 
              onClick={() => setExportedToast(null)}
              className="text-emerald-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </div>

      {/* 2. Structured Executive KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="sbom-stats-row">
        {/* Metric 1 */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold tracking-wider">
              Total Assets
            </span>
            <Sliders className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100 font-mono tabular-nums">{totalComponents}</span>
            <span className="text-[10px] text-slate-500 font-mono">tracked packages</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-850 text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
            <span>Non-quantum-safe:</span>
            <span className="font-bold text-slate-200">{nonSecureCount}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-rose-400 uppercase font-semibold tracking-wider">
              Critical Risks
            </span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400 font-mono tabular-nums">{criticalCount}</span>
            <span className="text-[10px] text-rose-400/80 font-mono">Shor's vulnerable</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-850 text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
            <span>High risks:</span>
            <span className="font-bold text-amber-400">{highCount}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-cyan-400 uppercase font-semibold tracking-wider">
              PQC Readiness
            </span>
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-400 font-mono tabular-nums">{readinessPercent}%</span>
            <span className="text-[10px] text-cyan-400/80 font-mono">quantum safe</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-850">
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${readinessPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-400 uppercase font-semibold tracking-wider">
              NIST Posture
            </span>
            <FileCheck2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">{globalGrade}</span>
            <span className="text-[10px] text-slate-400 font-mono">FIPS-203 Compliance</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-850 text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span>CNSA 2.0 Target:</span>
            <span className="text-cyan-400 font-bold">2030 Mandate</span>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Keypair Lab (Left) + C-SBOM Inventory (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: NIST Post-Quantum Keypair Generator */}
        <div className="lg:col-span-5 bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 p-5 flex flex-col shadow-[0_4px_24px_-3px_rgba(0,0,0,0.4)]" id="key-generator-panel">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-100 font-display tracking-tight">
                PQC Keypair & Certificate Lab
              </h2>
            </div>
            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              NIST ROUND 4
            </span>
          </div>

          {/* Algorithm selector */}
          <div className="space-y-3 mb-4" id="algo-select-section">
            <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Select Target Algorithm
            </label>
            <select 
              value={selectedAlgo}
              onChange={(e) => setSelectedAlgo(e.target.value)}
              className="w-full bg-[#020617] border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500 transition-colors"
              id="algo-dropdown"
            >
              {algorithms.map((algo) => (
                <option key={algo.name} value={algo.name} className="bg-[#020617] text-slate-200">
                  {algo.name} ({algo.type})
                </option>
              ))}
            </select>

            {/* Algorithm details card */}
            {(() => {
              const current = algorithms.find(a => a.name === selectedAlgo) || algorithms[0];
              return (
                <div className="bg-[#020617]/70 rounded-lg p-3.5 border border-slate-800/80 text-xs text-slate-300 space-y-2.5">
                  <p className="leading-relaxed font-sans text-xs text-slate-300">
                    {current.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 pt-2.5 border-t border-slate-800/80 font-mono text-[11px]">
                    <div className="bg-slate-900/40 p-1.5 rounded border border-slate-850">
                      <span className="text-slate-500 block text-[9px] uppercase">NIST Standard Level</span>
                      <span className="text-cyan-400 font-bold">Level {current.nistLevel}</span>
                    </div>
                    <div className="bg-slate-900/40 p-1.5 rounded border border-slate-850">
                      <span className="text-slate-500 block text-[9px] uppercase">Public Key Size</span>
                      <span className="text-cyan-400 font-bold">{current.keySize}</span>
                    </div>
                    <div className="bg-slate-900/40 p-1.5 rounded border border-slate-850">
                      <span className="text-slate-500 block text-[9px] uppercase">Security Strength</span>
                      <span className="text-cyan-400 font-bold">{current.strengthBits} Bits</span>
                    </div>
                    <div className="bg-slate-900/40 p-1.5 rounded border border-slate-850">
                      <span className="text-slate-500 block text-[9px] uppercase">Cryptographic Type</span>
                      <span className="text-cyan-400 font-bold">{current.type}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Generate trigger */}
          <button
            onClick={handleGenerateKeypair}
            disabled={isGenerating}
            className={`w-full py-2.5 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isGenerating
                ? "bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed"
                : "bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.1)] active:scale-95"
            }`}
            id="generate-pqc-keys-btn"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                <span>Simulating Lattice Generation...</span>
              </>
            ) : (
              <>
                <Cpu className="h-3.5 w-3.5" />
                <span>Generate Post-Quantum Keypair</span>
              </>
            )}
          </button>

          {/* Key Output Buffer */}
          <div className="mt-4 bg-[#020617] rounded-lg border border-slate-800 p-3.5 flex flex-col font-mono relative" id="key-output-screen">
            <div className="text-[10px] text-cyan-400 font-bold tracking-wider mb-2 uppercase border-b border-slate-800 pb-2 flex justify-between items-center">
              <span>Cryptographic Output Buffer</span>
              {generatedKey ? (
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 text-[9px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    READY
                  </span>
                  <button
                    onClick={handleCopyKey}
                    className="text-slate-400 hover:text-cyan-300 p-1 rounded hover:bg-slate-800 transition-colors flex items-center gap-1 text-[9px] cursor-pointer"
                    title="Copy Keypair Buffer"
                  >
                    {copiedKey ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              ) : (
                <span className="text-slate-600 text-[9px]">IDLE</span>
              )}
            </div>

            <div className="max-h-[260px] overflow-y-auto space-y-3 pr-1 text-cyan-400/90 scrollbar-thin scrollbar-thumb-slate-800 text-[10px]" id="key-hex-scroll">
              {generatedKey ? (
                <div className="space-y-3 font-mono">
                  <div>
                    <div className="text-slate-500 text-[9px] uppercase font-bold mb-0.5">Algorithm:</div>
                    <div className="text-xs text-white font-sans font-semibold">{generatedKey.algorithm}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[9px] uppercase font-bold mb-0.5">Public Key Block:</div>
                    <pre className="p-2 bg-slate-950 rounded border border-slate-850 overflow-x-auto select-all leading-tight text-cyan-300 font-mono text-[9px]">
                      {generatedKey.publicKey}
                    </pre>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[9px] uppercase font-bold mb-0.5">Private Key Envelope (AES-GCM Encrypted):</div>
                    <pre className="p-2 bg-slate-950 rounded border border-slate-850 text-slate-500 select-none leading-tight font-mono text-[9px]">
                      {generatedKey.privateKey}
                    </pre>
                  </div>
                  <div className="pt-2 border-t border-slate-850 grid grid-cols-2 gap-1 text-[9px] text-slate-400 font-mono">
                    <div>TIMESTAMP: {generatedKey.timestamp}</div>
                    <div className="text-right text-emerald-400 font-bold">{generatedKey.estimatedLifetime}</div>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-600 text-center">
                  <Key className="h-8 w-8 text-slate-700 mb-2" />
                  <span className="font-mono text-xs max-w-[260px] leading-relaxed text-slate-400">
                    No keys generated in current session. Select an algorithm above and click Generate.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: C-SBOM Inventory & Security Audit Findings Table */}
        <div className="lg:col-span-7 bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 p-5 flex flex-col shadow-[0_4px_24px_-3px_rgba(0,0,0,0.4)]" id="sbom-panel">
          
          {/* Table Header & Controls */}
          <div className="border-b border-slate-800 pb-3 mb-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-100 font-display tracking-tight flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-cyan-400" />
                  <span>Cryptographic Bill of Materials (C-SBOM) Inventory</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing {filteredComponents.length} of {totalComponents} registered packages
                </p>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1 p-1 bg-[#020617] rounded-lg border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setRiskFilter("ALL")}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    riskFilter === "ALL" ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  All ({totalComponents})
                </button>
                <button
                  onClick={() => setRiskFilter("CRITICAL")}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    riskFilter === "CRITICAL" ? "bg-rose-950/80 text-rose-300 border border-rose-800/60 font-bold" : "text-rose-400 hover:text-rose-300"
                  }`}
                >
                  Critical ({criticalCount})
                </button>
                <button
                  onClick={() => setRiskFilter("HIGH")}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    riskFilter === "HIGH" ? "bg-amber-950/80 text-amber-300 border border-amber-800/60 font-bold" : "text-amber-400 hover:text-amber-300"
                  }`}
                >
                  High ({highCount})
                </button>
                <button
                  onClick={() => setRiskFilter("ACCEPTABLE")}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    riskFilter === "ACCEPTABLE" ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-bold" : "text-emerald-400 hover:text-emerald-300"
                  }`}
                >
                  Safe ({secureCount})
                </button>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter by component name, algorithm (e.g. RSA, Kyber), or license..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#020617] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                id="sbom-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* SBOM Table Container */}
          <div className="bg-[#020617] rounded-lg border border-slate-800 overflow-hidden flex flex-col" id="sbom-data-table">
            {/* Table Column Headers */}
            <div className="bg-slate-900/60 border-b border-slate-800 px-3 py-2.5 text-[10px] uppercase font-mono font-bold tracking-wider text-cyan-400 grid grid-cols-12 shrink-0 gap-2">
              <div className="col-span-4">Component & Version</div>
              <div className="col-span-3">Active Cryptography</div>
              <div className="col-span-2 text-center">Risk</div>
              <div className="col-span-3 text-right">PQC Migration & Action</div>
            </div>

            {/* Table Rows Body */}
            <div className="divide-y divide-slate-850/60 overflow-y-auto max-h-[420px] font-mono text-xs text-slate-300 scrollbar-thin scrollbar-thumb-slate-800" id="sbom-table-body">
              {filteredComponents.length > 0 ? (
                <AnimatePresence initial={false}>
                  {filteredComponents.map((comp) => (
                    <motion.div 
                      key={comp.id}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="px-3 py-3 grid grid-cols-12 items-center hover:bg-slate-900/30 transition-colors gap-2"
                    >
                      {/* Component & Version */}
                      <div className="col-span-4 min-w-0">
                        <div className="text-slate-100 font-semibold flex items-center gap-1.5 truncate">
                          <Sliders className="h-3 w-3 text-slate-500 shrink-0" />
                          <span className="truncate">{comp.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5 font-mono">
                          <span>v{comp.version}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-500">{comp.license}</span>
                        </div>
                      </div>

                      {/* Active Cryptography */}
                      <div className="col-span-3 min-w-0">
                        <span className={`text-xs font-mono font-medium block truncate ${
                          comp.riskLevel === "ACCEPTABLE" ? "text-emerald-400" :
                          comp.riskLevel === "CRITICAL" ? "text-rose-400" :
                          comp.riskLevel === "HIGH" ? "text-amber-400" : "text-slate-300"
                        }`}>
                          {comp.algorithm}
                        </span>
                        <span className="text-[9px] text-slate-500 font-sans block truncate">
                          {comp.riskLevel === "CRITICAL" ? "Vulnerable to Shor's" :
                           comp.riskLevel === "HIGH" ? "Pre-quantum curve" :
                           comp.riskLevel === "ACCEPTABLE" ? "Quantum resistant" : "Standard symmetric"}
                        </span>
                      </div>

                      {/* Risk Level Badge */}
                      <div className="col-span-2 text-center shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase inline-block ${
                          comp.riskLevel === "CRITICAL"
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : comp.riskLevel === "HIGH"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : comp.riskLevel === "MEDIUM"
                            ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                            : comp.riskLevel === "ACCEPTABLE"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                        }`}>
                          {comp.riskLevel}
                        </span>
                      </div>

                      {/* PQC Target & Action Buttons */}
                      <div className="col-span-3 flex items-center justify-end gap-1.5">
                        {comp.migrationTarget !== "ALREADY SECURE" ? (
                          <button
                            onClick={() => handleMigrateSingle(comp.id)}
                            className="px-2 py-1 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 rounded text-[10px] font-mono font-medium flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                            title={`Migrate to ${comp.migrationTarget}`}
                          >
                            <span>Migrate</span>
                            <ArrowRight className="h-2.5 w-2.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400/80 font-mono px-1.5 py-0.5 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Safe
                          </span>
                        )}

                        <button 
                          onClick={() => handleDeleteComponent(comp.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Remove from C-SBOM"
                          id={`delete-sbom-comp-${comp.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center">
                  <Filter className="h-6 w-6 text-slate-600 mb-2" />
                  <p className="text-xs font-mono">No components matching your filter.</p>
                  <button 
                    onClick={() => { setSearchQuery(""); setRiskFilter("ALL"); }}
                    className="mt-2 text-xs text-cyan-400 hover:underline cursor-pointer"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table Footer Standards Note */}
          <div className="mt-3 text-[10px] text-slate-500 font-mono flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 px-1">
            <span>* Mapped to NIST FIPS-203 (ML-KEM), FIPS-204 (ML-DSA) & FIPS-205 (SLH-DSA).</span>
            <span className="text-slate-400">
              Export format: <strong className="text-cyan-400">CycloneDX 1.5 JSON</strong>
            </span>
          </div>
        </div>

      </div>

      {/* 4. Add Component Modal Dialog */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="add-component-modal-backdrop">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="bg-[#0b1329] border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(34,211,238,0.15)] relative flex flex-col gap-4 font-mono text-xs"
              id="add-component-modal"
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                id="close-modal-btn"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Cpu className="h-4 w-4 text-cyan-400 animate-pulse" />
                <h3 className="text-sm font-semibold text-slate-100 font-display tracking-tight">
                  Register Software Asset in C-SBOM
                </h3>
              </div>

              <form onSubmit={handleAddComponent} className="space-y-4" id="modal-add-sbom-form">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Package / Component Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. libssh2, bouncycastle, node-jose"
                    value={newCompName}
                    onChange={(e) => setNewCompName(e.target.value)}
                    className="w-full bg-[#020617] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono placeholder:text-slate-700"
                    required
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Version
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1.10.0"
                      value={newCompVersion}
                      onChange={(e) => setNewCompVersion(e.target.value)}
                      className="w-full bg-[#020617] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono placeholder:text-slate-700"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      License
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MIT, Apache-2.0"
                      value={newCompLicense}
                      onChange={(e) => setNewCompLicense(e.target.value)}
                      className="w-full bg-[#020617] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Current Cryptography Implementation
                  </label>
                  <select
                    value={newCompAlgo}
                    onChange={(e) => setNewCompAlgo(e.target.value)}
                    className="w-full bg-[#020617] border border-slate-800 rounded-lg p-2.5 text-xs text-cyan-400 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="RSA-2048">RSA-2048 (Legacy RSA, Vulnerable to Shor's)</option>
                    <option value="RSA-4096">RSA-4096 (Legacy RSA, Vulnerable to Shor's)</option>
                    <option value="ECDHE-P384">ECDHE-P384 (Pre-Quantum Elliptic Curves)</option>
                    <option value="ED25519">ED25519 (Pre-Quantum Signature)</option>
                    <option value="AES-128">AES-128 (Symmetric Key, Needs 256-bit Upgrade)</option>
                    <option value="Kyber-768 (PQC)">Kyber-768 (NIST FIPS-203 Quantum Safe KEM)</option>
                    <option value="Dilithium-3 (PQC)">Dilithium-3 (NIST FIPS-204 Quantum Safe Signature)</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(34,211,238,0.1)]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Register Asset</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Preview JSON Modal */}
      <AnimatePresence>
        {isPreviewJsonOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="preview-json-modal-backdrop">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="bg-[#0b1329] border border-slate-800 rounded-xl max-w-3xl w-full p-6 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative flex flex-col max-h-[85vh] font-mono text-xs"
              id="preview-json-modal"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <FileJson className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-slate-100 font-display tracking-tight">
                    C-SBOM & Security Audit Findings (CycloneDX 1.5 JSON)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const report = buildSbomAuditReport();
                      navigator.clipboard.writeText(JSON.stringify(report, null, 2));
                      setCopiedJson(true);
                      setTimeout(() => setCopiedJson(false), 2000);
                    }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedJson ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedJson ? "Copied!" : "Copy JSON"}</span>
                  </button>

                  <button
                    onClick={handleExportSbomJson}
                    className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download File</span>
                  </button>

                  <button
                    onClick={() => setIsPreviewJsonOpen(false)}
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors ml-2 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-[#020617] rounded-lg border border-slate-800 p-4 scrollbar-thin scrollbar-thumb-slate-800">
                <pre className="text-[11px] text-cyan-300 leading-relaxed font-mono select-all">
                  {JSON.stringify(buildSbomAuditReport(), null, 2)}
                </pre>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
                <span>Standards: FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), FIPS 205 (SLH-DSA)</span>
                <button
                  onClick={() => setIsPreviewJsonOpen(false)}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded border border-slate-800 cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

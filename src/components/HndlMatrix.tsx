/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  ShieldAlert, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  FileText, 
  Download, 
  HelpCircle,
  Database,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Lock,
  Layers,
  Sparkles
} from "lucide-react";
import { HndlAsset } from "../types";
import { motion, AnimatePresence } from "motion/react";

export default function HndlMatrix() {
  const currentYear = 2026;

  // Global Mosca's parameters
  const [globalShelfLife, setGlobalShelfLife] = useState<number>(20); // X
  const [globalMigrationTime, setGlobalMigrationTime] = useState<number>(5); // Y
  const [crqcArrivalYears, setCrqcArrivalYears] = useState<number>(7); // Z (e.g. 2033)

  // Asset Inventory State
  const [assets, setAssets] = useState<HndlAsset[]>([
    {
      id: "hndl-1",
      name: "Diplomatic Cables & Defense Telemetry",
      category: "NATIONAL_SECURITY",
      currentCrypto: "RSA-4096 / ECC P-384",
      pqcTarget: "ML-KEM-1024 + ML-DSA-87",
      shelfLifeYears: 40,
      migrationYears: 6,
      estimatedCrqcYears: 7,
      dataVolumeGb: 1420,
      sensitivityLevel: "TOP_SECRET",
      breachWindowYears: (40 + 6) - 7,
      status: "EXPOSED"
    },
    {
      id: "hndl-2",
      name: "Genomic Sequencing & Clinical Trial Data",
      category: "HEALTHCARE_GENOMICS",
      currentCrypto: "RSA-2048 / AES-128-CBC",
      pqcTarget: "ML-KEM-768 + AES-256-GCM",
      shelfLifeYears: 50,
      migrationYears: 4,
      estimatedCrqcYears: 7,
      dataVolumeGb: 8900,
      sensitivityLevel: "CRITICAL",
      breachWindowYears: (50 + 4) - 7,
      status: "EXPOSED"
    },
    {
      id: "hndl-3",
      name: "Interbank SWIFT Settlement Records",
      category: "FINANCIAL",
      currentCrypto: "RSA-2048 / SHA-256",
      pqcTarget: "ML-DSA-65 (Dilithium-3)",
      shelfLifeYears: 25,
      migrationYears: 5,
      estimatedCrqcYears: 7,
      dataVolumeGb: 3200,
      sensitivityLevel: "CRITICAL",
      breachWindowYears: (25 + 5) - 7,
      status: "EXPOSED"
    },
    {
      id: "hndl-4",
      name: "Aerospace Propulsion CAD & Patent Secrets",
      category: "CORPORATE_IP",
      currentCrypto: "ECDSA P-256 / ECDH",
      pqcTarget: "Falcon-512 + ML-KEM-768",
      shelfLifeYears: 15,
      migrationYears: 3,
      estimatedCrqcYears: 7,
      dataVolumeGb: 650,
      sensitivityLevel: "RESTRICTED",
      breachWindowYears: (15 + 3) - 7,
      status: "VULNERABLE"
    },
    {
      id: "hndl-5",
      name: "External Gateway TLS Session Captures",
      category: "TLS_ARCHIVE",
      currentCrypto: "ECDHE-RSA-2048",
      pqcTarget: "X25519MLKEM768 Hybrid",
      shelfLifeYears: 10,
      migrationYears: 2,
      estimatedCrqcYears: 7,
      dataVolumeGb: 18500,
      sensitivityLevel: "CONFIDENTIAL",
      breachWindowYears: (10 + 2) - 7,
      status: "VULNERABLE"
    }
  ]);

  // Modal State for adding new asset
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetCategory, setNewAssetCategory] = useState<HndlAsset["category"]>("FINANCIAL");
  const [newAssetCrypto, setNewAssetCrypto] = useState("RSA-2048");
  const [newAssetTarget, setNewAssetTarget] = useState("ML-KEM-768");
  const [newAssetShelfLife, setNewAssetShelfLife] = useState(15);
  const [newAssetMigration, setNewAssetMigration] = useState(3);
  const [newAssetVolume, setNewAssetVolume] = useState(500);

  // Mosca's calculation for global slider
  const moscaBreachWindow = (globalShelfLife + globalMigrationTime) - crqcArrivalYears;
  const isGlobalCompromised = moscaBreachWindow > 0;
  const crqcEstimatedCalendarYear = currentYear + crqcArrivalYears;

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim()) return;

    const breachWindow = (newAssetShelfLife + newAssetMigration) - crqcArrivalYears;
    const status: HndlAsset["status"] = 
      breachWindow > 10 ? "EXPOSED" : breachWindow > 0 ? "VULNERABLE" : "ON_TRACK";

    const newObj: HndlAsset = {
      id: `hndl-${Date.now()}`,
      name: newAssetName.trim(),
      category: newAssetCategory,
      currentCrypto: newAssetCrypto,
      pqcTarget: newAssetTarget,
      shelfLifeYears: newAssetShelfLife,
      migrationYears: newAssetMigration,
      estimatedCrqcYears: crqcArrivalYears,
      dataVolumeGb: newAssetVolume,
      sensitivityLevel: "CRITICAL",
      breachWindowYears: breachWindow,
      status
    };

    setAssets([newObj, ...assets]);
    setIsAddModalOpen(false);
    setNewAssetName("");
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const handleDownloadReport = () => {
    const report = {
      title: "Aegis Post-Quantum HNDL Threat Assessment",
      timestamp: new Date().toISOString(),
      evaluationFramework: "Mosca's Theorem: X (Shelf-life) + Y (Migration Time) > Z (CRQC Arrival)",
      crqcEstimatedYear: crqcEstimatedCalendarYear,
      totalAssetsAnalyzed: assets.length,
      exposedAssetsCount: assets.filter(a => a.status === "EXPOSED").length,
      totalArchiveDataGb: assets.reduce((sum, a) => sum + a.dataVolumeGb, 0),
      assets: assets
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Aegis_HNDL_Risk_Matrix_${currentYear}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" id="hndl-matrix-module">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg bg-slate-900/60 border border-slate-800">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-amber-950/80 border border-amber-500/30 text-amber-400 shrink-0">
            <Clock className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white uppercase tracking-tight font-display">
                Harvest Now, Decrypt Later (HNDL) Threat Radar
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/80">
                MOSCA'S THEOREM (X + Y &gt; Z)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
              State-sponsored adversaries are actively intercepting and storing encrypted traffic today. When a Cryptographically Relevant Quantum Computer (CRQC) emerges, legacy RSA and ECC keys will be retroactively broken.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-all border border-slate-700"
          >
            <Plus className="h-3.5 w-3.5 text-cyan-400" />
            <span>Add Critical Asset</span>
          </button>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs font-mono transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Risk Audit</span>
          </button>
        </div>
      </div>

      {/* Mosca's Equation Interactive Simulator */}
      <div className="p-5 rounded-lg bg-slate-900/40 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-tight">
              Mosca's Theorem Vulnerability Engine
            </h3>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Estimated Q-Day Horizon: <span className="text-amber-400 font-bold">{crqcEstimatedCalendarYear}</span> (~{crqcArrivalYears} Years Remaining)
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* X: Shelf Life */}
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">X = Security Shelf-Life:</span>
              <span className="text-cyan-400 font-bold text-sm">{globalShelfLife} Years</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={globalShelfLife}
              onChange={(e) => setGlobalShelfLife(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              Duration encrypted data must remain confidential (healthcare, defense, finance).
            </p>
          </div>

          {/* Y: Migration Time */}
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Y = PQC Migration Time:</span>
              <span className="text-purple-400 font-bold text-sm">{globalMigrationTime} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={globalMigrationTime}
              onChange={(e) => setGlobalMigrationTime(Number(e.target.value))}
              className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              Time needed to inventory, standardize, and replace PKI infrastructure.
            </p>
          </div>

          {/* Z: CRQC Time */}
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Z = CRQC Quantum Collapse:</span>
              <span className="text-amber-400 font-bold text-sm">{crqcArrivalYears} Years</span>
            </div>
            <input
              type="range"
              min="3"
              max="20"
              step="1"
              value={crqcArrivalYears}
              onChange={(e) => setCrqcArrivalYears(Number(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              Years until quantum computer executes Shor's algorithm at 4,096 logical qubits.
            </p>
          </div>
        </div>

        {/* Mosca's Outcome Card */}
        <div className={`p-4 rounded-lg border text-xs flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isGlobalCompromised 
            ? "bg-rose-950/30 border-rose-500/40 text-rose-300" 
            : "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
        }`}>
          <div className="flex items-start gap-3">
            {isGlobalCompromised ? (
              <ShieldAlert className="h-6 w-6 text-rose-400 shrink-0" />
            ) : (
              <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm font-mono uppercase tracking-wide">
                {isGlobalCompromised 
                  ? `CRITICAL EXPOSURE: X + Y (${globalShelfLife + globalMigrationTime} yrs) > Z (${crqcArrivalYears} yrs)`
                  : `SAFE WINDOW: X + Y (${globalShelfLife + globalMigrationTime} yrs) ≤ Z (${crqcArrivalYears} yrs)`}
              </div>
              <p className="text-[11px] text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {isGlobalCompromised 
                  ? `Your data is already compromised under Store-Now-Decrypt-Later (SNDL). By the time you complete PQC migration, adversaries who archived today's ciphertexts will decrypt them ${moscaBreachWindow} years before their mandatory confidentiality expires.`
                  : `Migration timeline is ahead of the estimated CRQC arrival. Accelerated rollout of FIPS-203 ML-KEM ensures zero data breach window.`}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0 font-mono">
            <span className="text-[10px] text-slate-400 block uppercase">Adversary Breach Lead</span>
            <span className={`text-2xl font-extrabold ${isGlobalCompromised ? "text-rose-400" : "text-emerald-400"}`}>
              {isGlobalCompromised ? `+${moscaBreachWindow} YRS` : `0 YRS`}
            </span>
          </div>
        </div>
      </div>

      {/* Asset Inventory Table */}
      <div className="p-5 rounded-lg bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-tight">
              Classified Asset Inventory & Exposure Index ({assets.length} Repositories)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Total Tracked Encrypted Storage: {assets.reduce((sum, a) => sum + a.dataVolumeGb, 0).toLocaleString()} GB
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase">
                <th className="py-2.5 px-3">Data Repository</th>
                <th className="py-2.5 px-3">Legacy Crypto</th>
                <th className="py-2.5 px-3">PQC Target</th>
                <th className="py-2.5 px-3">Shelf-Life (X)</th>
                <th className="py-2.5 px-3">Migr. Time (Y)</th>
                <th className="py-2.5 px-3">Breach Window</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-200">{asset.name}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="uppercase text-cyan-400">{asset.category.replace("_", " ")}</span>
                      <span>•</span>
                      <span>{asset.dataVolumeGb} GB Archive</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60 text-[11px] font-bold">
                      {asset.currentCrypto}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 text-[11px] font-bold">
                      {asset.pqcTarget}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{asset.shelfLifeYears} yrs</td>
                  <td className="py-3 px-3 text-slate-300">{asset.migrationYears} yrs</td>
                  <td className="py-3 px-3">
                    <span className={`font-bold ${asset.breachWindowYears > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                      {asset.breachWindowYears > 0 ? `+${asset.breachWindowYears} yrs` : "0 yrs"}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {asset.status === "EXPOSED" ? (
                      <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold">
                        ACTIVE EXPOSURE
                      </span>
                    ) : asset.status === "VULNERABLE" ? (
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold">
                        HIGH RISK
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                        ON SCHEDULE
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Remove Asset"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Migration Mandates & Regulatory Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 font-mono">
            <ShieldCheck className="h-4 w-4" />
            <span>NSA CNSA 2.0 TIMELINE</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Mandates firmware & software signing transition to ML-DSA / LMS by 2025-2030, and national security systems to ML-KEM by 2033.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 font-mono">
            <ShieldCheck className="h-4 w-4" />
            <span>NIST FIPS 203/204/205</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Final post-quantum cryptographic standards officially published (August 2024). Deprecation of legacy RSA-2048 initiated.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 font-mono">
            <ShieldCheck className="h-4 w-4" />
            <span>PCI-DSS v4.0.1 COMPLIANCE</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Payment card industry crypto-agility requirement. Financial institutions must document migration plans for encrypted archives.
          </p>
        </div>
      </div>

      {/* Add Asset Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1329] border border-slate-700 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase font-mono">
                Register New Encrypted Asset
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddAsset} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Asset Name / Service</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Core Customer PII Database"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Classification Category</label>
                  <select
                    value={newAssetCategory}
                    onChange={(e) => setNewAssetCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-2 text-white focus:border-cyan-500 outline-none"
                  >
                    <option value="NATIONAL_SECURITY">National Security</option>
                    <option value="FINANCIAL">Financial</option>
                    <option value="HEALTHCARE_GENOMICS">Healthcare / Genomics</option>
                    <option value="CORPORATE_IP">Corporate IP</option>
                    <option value="TLS_ARCHIVE">TLS Session Archive</option>
                    <option value="INFRASTRUCTURE">Infrastructure</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Archive Size (GB)</label>
                  <input
                    type="number"
                    min="1"
                    value={newAssetVolume}
                    onChange={(e) => setNewAssetVolume(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Current Crypto</label>
                  <select
                    value={newAssetCrypto}
                    onChange={(e) => setNewAssetCrypto(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-2 text-white focus:border-cyan-500 outline-none"
                  >
                    <option value="RSA-2048">RSA-2048</option>
                    <option value="RSA-4096">RSA-4096</option>
                    <option value="ECDSA P-256">ECDSA P-256</option>
                    <option value="ECC P-384">ECC P-384</option>
                    <option value="AES-128-CBC">AES-128-CBC</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">PQC Replacement</label>
                  <select
                    value={newAssetTarget}
                    onChange={(e) => setNewAssetTarget(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-2 text-white focus:border-cyan-500 outline-none"
                  >
                    <option value="ML-KEM-768">ML-KEM-768 (Kyber-768)</option>
                    <option value="ML-KEM-1024">ML-KEM-1024</option>
                    <option value="ML-DSA-65">ML-DSA-65 (Dilithium-3)</option>
                    <option value="Falcon-512">Falcon-512</option>
                    <option value="SLH-DSA-128f">SLH-DSA-128f</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Shelf Life (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newAssetShelfLife}
                    onChange={(e) => setNewAssetShelfLife(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Migration Time (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newAssetMigration}
                    onChange={(e) => setNewAssetMigration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
                >
                  Add Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

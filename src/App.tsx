/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Lock, 
  Terminal, 
  Cpu, 
  Sparkles, 
  Activity, 
  Network,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Radio,
  FileCheck2,
  Gauge,
  Zap,
  Flame,
  Binary
} from "lucide-react";
import SocTerminal from "./components/SocTerminal";
import CryptographicLab from "./components/CryptographicLab";
import GbsPlayground from "./components/GbsPlayground";
import GeminiAuditor from "./components/GeminiAuditor";
import QkdSimulator from "./components/QkdSimulator";
import HndlMatrix from "./components/HndlMatrix";
import HybridCertBuilder from "./components/HybridCertBuilder";
import QrngEntropyLab from "./components/QrngEntropyLab";
import SideChannelLab from "./components/SideChannelLab";
import { SbomComponent } from "./types";
import { motion, AnimatePresence } from "motion/react";

type ActiveTabType = "soc" | "gemini" | "lab" | "qkd" | "hndl" | "hybrid" | "qrng" | "sca" | "gbs";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>("soc");
  const [currentTime, setCurrentTime] = useState<string>("");

  // Shared C-SBOM State so that additions/deletions immediately update the Gemini Auditor context!
  const [sbomComponents, setSbomComponents] = useState<SbomComponent[]>([
    { id: "sb-1", name: "openssl", version: "1.1.1t", license: "Apache-2.0", algorithm: "RSA-2048", riskLevel: "CRITICAL", migrationTarget: "CRYSTALS-Kyber (Kyber-768)" },
    { id: "sb-2", name: "liboqs", version: "0.8.0", license: "MIT", algorithm: "Kyber-768 (PQC)", riskLevel: "ACCEPTABLE", migrationTarget: "ALREADY SECURE" },
    { id: "sb-3", name: "jose-jwt", version: "4.1.0", license: "Apache-2.0", algorithm: "RSA-2048", riskLevel: "CRITICAL", migrationTarget: "CRYSTALS-Dilithium (Dilithium-3)" },
    { id: "sb-4", name: "nginx-ingress-controller", version: "1.3.0", license: "Apache-2.0", algorithm: "ECDHE-ECDSA-P256", riskLevel: "HIGH", migrationTarget: "CRYSTALS-Kyber (Kyber-1024)" },
    { id: "sb-5", name: "ssh-credential-vault", version: "2.4.2", license: "BSD-3-Clause", algorithm: "ED25519", riskLevel: "HIGH", migrationTarget: "Falcon-512" },
    { id: "sb-6", name: "aegis-core-secure-channel", version: "1.0.0", license: "Apache-2.0", algorithm: "Kyber-768 + AES-256-GCM", riskLevel: "ACCEPTABLE", migrationTarget: "ALREADY SECURE" }
  ]);

  // Keep a live running UTC / Local clock inside header
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans select-none antialiased selection:bg-cyan-500/20" id="main-cockpit">
      {/* 1. Header cockpit */}
      <header className="border-b border-slate-800 bg-[#020617] px-6 py-3 sticky top-0 z-50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-950/80 rounded flex items-center justify-center border border-cyan-500/40 shadow-[0_0_15px_rgba(8,145,178,0.3)] shrink-0">
            <span className="text-white font-display font-bold text-lg tracking-wider">A</span>
          </div>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
              <h1 className="text-base font-bold font-display tracking-tight text-white uppercase">
                Aegis Ultimate Security Suite
              </h1>
              <span className="self-start sm:self-auto text-[9px] font-mono font-medium tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/80 uppercase">
                PQC Monolith
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans font-medium tracking-tight mt-0.5">
              Decoy Honeypots • PQC ML-KEM/DSA • QKD BB84 • HNDL Mosca • Hybrid TLS 1.3 • QRNG NIST • SCA Side-Channel • Tensor GBS
            </p>
          </div>
        </div>

        {/* Dynamic Telemetry Status */}
        <div className="flex items-center gap-3 text-xs font-mono" id="header-telemetry">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/50 border border-slate-800 text-slate-400">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-[11px] font-mono">{currentTime}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/20 border border-emerald-500/20 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold tracking-wider font-mono">ALL_9_MODULES_ONLINE</span>
          </div>
        </div>
      </header>

      {/* 2. Responsive Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Sidebar for Desktop */}
        <aside className="w-64 border-r border-slate-800 bg-[#020617] p-4 flex flex-col shrink-0 hidden md:flex overflow-y-auto" id="sidebar-nav">
          <div className="space-y-5">
            {/* Group 1: Threat Center & AI */}
            <div>
              <div className="px-3 py-1 text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">
                Command & AI Defense
              </div>
              <nav className="mt-1.5 space-y-1">
                <button
                  onClick={() => setActiveTab("soc")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium tracking-tight transition-all text-left ${
                    activeTab === "soc"
                      ? "bg-slate-900 text-cyan-400 border border-slate-700 shadow-[0_0_12px_rgba(34,211,238,0.1)] font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                  }`}
                  id="sidebar-btn-soc"
                >
                  <Terminal className="h-4 w-4 shrink-0 text-cyan-400" />
                  <span>Command Center (SOC)</span>
                </button>

                <button
                  onClick={() => setActiveTab("gemini")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium tracking-tight transition-all text-left ${
                    activeTab === "gemini"
                      ? "bg-slate-900 text-cyan-400 border border-slate-700 shadow-[0_0_12px_rgba(34,211,238,0.1)] font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                  }`}
                  id="sidebar-btn-gemini"
                >
                  <Sparkles className="h-4 w-4 shrink-0 text-cyan-400" />
                  <span>AI Cryptographic Auditor</span>
                </button>
              </nav>
            </div>

            {/* Group 2: Post-Quantum Cryptography Suite */}
            <div>
              <div className="px-3 py-1 text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">
                Post-Quantum Cryptography
              </div>
              <nav className="mt-1.5 space-y-1">
                <button
                  onClick={() => setActiveTab("lab")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium tracking-tight transition-all text-left ${
                    activeTab === "lab"
                      ? "bg-slate-900 text-cyan-400 border border-slate-700 shadow-[0_0_12px_rgba(34,211,238,0.1)] font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                  }`}
                  id="sidebar-btn-lab"
                >
                  <Cpu className="h-4 w-4 shrink-0 text-cyan-400" />
                  <span>PQC Keygen & C-SBOM</span>
                </button>

                <button
                  onClick={() => setActiveTab("qkd")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium tracking-tight transition-all text-left ${
                    activeTab === "qkd"
                      ? "bg-slate-900 text-cyan-400 border border-slate-700 shadow-[0_0_12px_rgba(34,211,238,0.1)] font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                  }`}
                  id="sidebar-btn-qkd"
                >
                  <Radio className="h-4 w-4 shrink-0 text-cyan-400" />
                  <span>QKD & BB84 Channel</span>
                </button>

                <button
                  onClick={() => setActiveTab("hndl")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium tracking-tight transition-all text-left ${
                    activeTab === "hndl"
                      ? "bg-slate-900 text-amber-400 border border-slate-700 shadow-[0_0_12px_rgba(245,158,11,0.1)] font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                  }`}
                  id="sidebar-btn-hndl"
                >
                  <Clock className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>HNDL Threat Radar (Mosca)</span>
                </button>

                <button
                  onClick={() => setActiveTab("hybrid")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium tracking-tight transition-all text-left ${
                    activeTab === "hybrid"
                      ? "bg-slate-900 text-indigo-400 border border-slate-700 shadow-[0_0_12px_rgba(99,102,241,0.1)] font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                  }`}
                  id="sidebar-btn-hybrid"
                >
                  <FileCheck2 className="h-4 w-4 shrink-0 text-indigo-400" />
                  <span>Hybrid TLS 1.3 / X.509</span>
                </button>
              </nav>
            </div>

            {/* Group 3: Physical & Advanced Quantum Labs */}
            <div>
              <div className="px-3 py-1 text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">
                Hardware & Physical Labs
              </div>
              <nav className="mt-1.5 space-y-1">
                <button
                  onClick={() => setActiveTab("qrng")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium tracking-tight transition-all text-left ${
                    activeTab === "qrng"
                      ? "bg-slate-900 text-emerald-400 border border-slate-700 shadow-[0_0_12px_rgba(16,185,129,0.1)] font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                  }`}
                  id="sidebar-btn-qrng"
                >
                  <Gauge className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>QRNG & NIST SP 800-22</span>
                </button>

                <button
                  onClick={() => setActiveTab("sca")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium tracking-tight transition-all text-left ${
                    activeTab === "sca"
                      ? "bg-slate-900 text-rose-400 border border-slate-700 shadow-[0_0_12px_rgba(244,63,94,0.1)] font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                  }`}
                  id="sidebar-btn-sca"
                >
                  <Zap className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>Side-Channel & Fault Lab</span>
                </button>

                <button
                  onClick={() => setActiveTab("gbs")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium tracking-tight transition-all text-left ${
                    activeTab === "gbs"
                      ? "bg-slate-900 text-cyan-400 border border-slate-700 shadow-[0_0_12px_rgba(34,211,238,0.1)] font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                  }`}
                  id="sidebar-btn-gbs"
                >
                  <Network className="h-4 w-4 shrink-0 text-cyan-400" />
                  <span>GBS Tensor Simulator</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Threat level widget */}
          <div className="mt-auto pt-4">
            <div className="p-3.5 bg-slate-900/40 rounded-lg border border-slate-800">
              <p className="text-[10px] text-slate-500 mb-1.5 font-mono tracking-wider font-bold">MONOLITH THREAT INDEX</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-[12%] animate-pulse"></div>
                </div>
                <span className="text-xs font-mono text-cyan-400 font-bold tracking-wide">SECURE</span>
              </div>
              <div className="text-[9px] text-slate-600 font-mono mt-2 flex justify-between">
                <span>ACTIVE DEFENSES: 9/9</span>
                <span>FIPS-203: OK</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Horizontal Navigation Tabs */}
        <nav className="bg-[#020617] border-b border-slate-800 p-2 md:hidden overflow-x-auto scrollbar-none flex gap-1.5" id="navigation-tabs-mobile">
          <button
            onClick={() => setActiveTab("soc")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium tracking-tight whitespace-nowrap transition-all ${
              activeTab === "soc"
                ? "bg-slate-900 text-cyan-400 border border-slate-700 font-bold"
                : "text-slate-400"
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            SOC
          </button>
          
          <button
            onClick={() => setActiveTab("gemini")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium tracking-tight whitespace-nowrap transition-all ${
              activeTab === "gemini"
                ? "bg-slate-900 text-cyan-400 border border-slate-700 font-bold"
                : "text-slate-400"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Auditor
          </button>

          <button
            onClick={() => setActiveTab("lab")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium tracking-tight whitespace-nowrap transition-all ${
              activeTab === "lab"
                ? "bg-slate-900 text-cyan-400 border border-slate-700 font-bold"
                : "text-slate-400"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            PQC Lab
          </button>

          <button
            onClick={() => setActiveTab("qkd")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium tracking-tight whitespace-nowrap transition-all ${
              activeTab === "qkd"
                ? "bg-slate-900 text-cyan-400 border border-slate-700 font-bold"
                : "text-slate-400"
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            QKD
          </button>

          <button
            onClick={() => setActiveTab("hndl")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium tracking-tight whitespace-nowrap transition-all ${
              activeTab === "hndl"
                ? "bg-slate-900 text-amber-400 border border-slate-700 font-bold"
                : "text-slate-400"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            HNDL
          </button>

          <button
            onClick={() => setActiveTab("hybrid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium tracking-tight whitespace-nowrap transition-all ${
              activeTab === "hybrid"
                ? "bg-slate-900 text-indigo-400 border border-slate-700 font-bold"
                : "text-slate-400"
            }`}
          >
            <FileCheck2 className="h-3.5 w-3.5" />
            Hybrid TLS
          </button>

          <button
            onClick={() => setActiveTab("qrng")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium tracking-tight whitespace-nowrap transition-all ${
              activeTab === "qrng"
                ? "bg-slate-900 text-emerald-400 border border-slate-700 font-bold"
                : "text-slate-400"
            }`}
          >
            <Gauge className="h-3.5 w-3.5" />
            QRNG
          </button>

          <button
            onClick={() => setActiveTab("sca")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium tracking-tight whitespace-nowrap transition-all ${
              activeTab === "sca"
                ? "bg-slate-900 text-rose-400 border border-slate-700 font-bold"
                : "text-slate-400"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            Side-Channel
          </button>

          <button
            onClick={() => setActiveTab("gbs")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium tracking-tight whitespace-nowrap transition-all ${
              activeTab === "gbs"
                ? "bg-slate-900 text-cyan-400 border border-slate-700 font-bold"
                : "text-slate-400"
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            GBS
          </button>
        </nav>

        {/* 3. Main interactive content viewport */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#020617] h-full" id="cockpit-viewport">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="w-full h-full"
              id="rendered-viewport"
            >
              {activeTab === "soc" && <SocTerminal />}
              {activeTab === "gemini" && <GeminiAuditor sbomContext={sbomComponents} />}
              {activeTab === "lab" && (
                <CryptographicLab 
                  sbomComponents={sbomComponents} 
                  setSbomComponents={setSbomComponents} 
                />
              )}
              {activeTab === "qkd" && <QkdSimulator />}
              {activeTab === "hndl" && <HndlMatrix />}
              {activeTab === "hybrid" && <HybridCertBuilder />}
              {activeTab === "qrng" && <QrngEntropyLab />}
              {activeTab === "sca" && <SideChannelLab />}
              {activeTab === "gbs" && <GbsPlayground />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 4. Footer credits bar */}
      <footer className="border-t border-slate-800 py-3 px-6 text-center text-[10px] font-mono text-slate-600 bg-[#020617]">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>
            Aegis Quantum Security Suite v3.5.0 • Complete 9-Module Post-Quantum Defense & Cryptographic Research Suite
          </span>
          <span className="text-slate-500 flex items-center gap-1.5 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
            FIPS-203, FIPS-204, FIPS-205 & SP 800-22 COMPLIANT
          </span>
        </div>
      </footer>
    </div>
  );
}


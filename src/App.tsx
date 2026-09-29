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
  AlertTriangle
} from "lucide-react";
import SocTerminal from "./components/SocTerminal";
import CryptographicLab from "./components/CryptographicLab";
import GbsPlayground from "./components/GbsPlayground";
import GeminiAuditor from "./components/GeminiAuditor";
import { SbomComponent } from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"soc" | "lab" | "gbs" | "gemini">("soc");
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
              Decoy Honeypots • ML Network Anomalies • Quantum-Safe Cryptography (Kyber/Dilithium) • Tensor Simulator
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
            <span className="text-[10px] font-semibold tracking-wider font-mono">SYSTEM_OPERATIONAL</span>
          </div>
        </div>
      </header>

      {/* 2. Responsive Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Sidebar for Desktop */}
        <aside className="w-64 border-r border-slate-800 bg-[#020617] p-4 flex flex-col shrink-0 hidden md:flex" id="sidebar-nav">
          <div className="space-y-6">
            <div>
              <div className="px-3 py-1 text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">
                Security Core
              </div>
              <nav className="mt-2 space-y-1">
                <button
                  onClick={() => setActiveTab("soc")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium tracking-tight transition-all text-left ${
                    activeTab === "soc"
                      ? "bg-slate-900 text-cyan-400 border border-slate-700 shadow-[0_0_12px_rgba(34,211,238,0.1)] font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                  }`}
                  id="sidebar-btn-soc"
                >
                  <Terminal className="h-4 w-4 shrink-0" />
                  <span>Command Center (SOC)</span>
                </button>

                <button
                  onClick={() => setActiveTab("gemini")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium tracking-tight transition-all text-left ${
                    activeTab === "gemini"
                      ? "bg-slate-900 text-cyan-400 border border-slate-700 shadow-[0_0_12px_rgba(34,211,238,0.1)] font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                  }`}
                  id="sidebar-btn-gemini"
                >
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span>AI Cryptographic Auditor</span>
                </button>
              </nav>
            </div>

            <div>
              <div className="px-3 py-1 text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">
                Advanced Labs
              </div>
              <nav className="mt-2 space-y-1">
                <button
                  onClick={() => setActiveTab("lab")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium tracking-tight transition-all text-left ${
                    activeTab === "lab"
                      ? "bg-slate-900 text-cyan-400 border border-slate-700 shadow-[0_0_12px_rgba(34,211,238,0.1)] font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                  }`}
                  id="sidebar-btn-lab"
                >
                  <Cpu className="h-4 w-4 shrink-0" />
                  <span>PQC Keygen & SBOM</span>
                </button>

                <button
                  onClick={() => setActiveTab("gbs")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium tracking-tight transition-all text-left ${
                    activeTab === "gbs"
                      ? "bg-slate-900 text-cyan-400 border border-slate-700 shadow-[0_0_12px_rgba(34,211,238,0.1)] font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                  }`}
                  id="sidebar-btn-gbs"
                >
                  <Network className="h-4 w-4 shrink-0" />
                  <span>GBS Tensor Simulator</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Threat level widget */}
          <div className="mt-auto p-4 bg-slate-900/40 rounded-lg border border-slate-800">
            <p className="text-[10px] text-slate-500 mb-1.5 font-mono tracking-wider font-bold">MONOLITH THREAT INDEX</p>
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 w-[12%] animate-pulse"></div>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold tracking-wide">SECURE</span>
            </div>
            <div className="text-[9px] text-slate-600 font-mono mt-2 flex justify-between">
              <span>EDR_ALARM: OK</span>
              <span>PQC: ACTIVE</span>
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
            id="mobile-tab-soc"
          >
            <Terminal className="h-3.5 w-3.5" />
            SOC Decoy
          </button>
          
          <button
            onClick={() => setActiveTab("gemini")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium tracking-tight whitespace-nowrap transition-all ${
              activeTab === "gemini"
                ? "bg-slate-900 text-cyan-400 border border-slate-700 font-bold"
                : "text-slate-400"
            }`}
            id="mobile-tab-gemini"
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
            id="mobile-tab-lab"
          >
            <Cpu className="h-3.5 w-3.5" />
            PQC Lab
          </button>

          <button
            onClick={() => setActiveTab("gbs")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium tracking-tight whitespace-nowrap transition-all ${
              activeTab === "gbs"
                ? "bg-slate-900 text-cyan-400 border border-slate-700 font-bold"
                : "text-slate-400"
            }`}
            id="mobile-tab-gbs"
          >
            <Network className="h-3.5 w-3.5" />
            GBS Tensor
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
              {activeTab === "lab" && (
                <CryptographicLab 
                  sbomComponents={sbomComponents} 
                  setSbomComponents={setSbomComponents} 
                />
              )}
              {activeTab === "gbs" && <GbsPlayground />}
              {activeTab === "gemini" && <GeminiAuditor sbomContext={sbomComponents} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 4. Footer credits bar */}
      <footer className="border-t border-slate-800 py-3 px-6 text-center text-[10px] font-mono text-slate-600 bg-[#020617]">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>
            Aegis Quantum Security Suite v3.2.0 • Licensed for cryptographic research & audits
          </span>
          <span className="text-slate-500 flex items-center gap-1.5 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
            FIPS-203 COMPLIANT CODESYSTEM
          </span>
        </div>
      </footer>
    </div>
  );
}

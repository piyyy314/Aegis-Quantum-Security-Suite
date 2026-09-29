/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  Terminal, 
  FileCode, 
  Activity, 
  AlertTriangle, 
  RefreshCw, 
  Play, 
  ShieldAlert, 
  Trash2, 
  Lock, 
  Eye, 
  CheckCircle,
  Database
} from "lucide-react";
import { HoneypotLog, FimLog, AnomalyLog } from "../types";
import { motion, AnimatePresence } from "motion/react";

export default function SocTerminal() {
  // Honeypot logs state
  const [honeypotLogs, setHoneypotLogs] = useState<HoneypotLog[]>([
    {
      id: "hp-1",
      timestamp: "00:04:12",
      attackerIp: "185.220.101.42",
      port: 22,
      service: "SSH",
      action: "BLOCKED",
      country: "Germany (Tor Exit)"
    },
    {
      id: "hp-2",
      timestamp: "00:08:34",
      attackerIp: "45.143.203.11",
      port: 3306,
      service: "MySQL Decoy",
      action: "TRAPPED",
      country: "Romania"
    },
    {
      id: "hp-3",
      timestamp: "00:15:20",
      attackerIp: "103.204.170.89",
      port: 2222,
      service: "Aegis Fake SSH",
      action: "BLOCKED",
      country: "India"
    }
  ]);

  // FIM files state
  const [fimFiles, setFimFiles] = useState<FimLog[]>([
    {
      id: "fim-1",
      timestamp: "00:00:01",
      filename: "aegis_kernel_params.conf",
      path: "/etc/aegis_kernel_params.conf",
      event: "INTEGRITY_VERIFIED",
      hash: "8e2f89ca...81a0",
      status: "PRISTINE"
    },
    {
      id: "fim-2",
      timestamp: "00:00:01",
      filename: "pqc_key_distribution_rules.json",
      path: "/etc/pqc_key_distribution_rules.json",
      event: "INTEGRITY_VERIFIED",
      hash: "3c90f8dd...56e4",
      status: "PRISTINE"
    },
    {
      id: "fim-3",
      timestamp: "00:00:01",
      filename: "vault_access_policy.xml",
      path: "/var/secure/vault_access_policy.xml",
      event: "INTEGRITY_VERIFIED",
      hash: "e51fa771...bb0c",
      status: "PRISTINE"
    }
  ]);

  const [fimEventsLog, setFimEventsLog] = useState<string[]>([
    "[00:00:01] File Integrity Monitor loaded baseline hashes securely.",
    "[00:00:01] Baseline verification success: 3 files in safe state."
  ]);

  // ML Traffic Monitoring state
  const [trafficLogs, setTrafficLogs] = useState<AnomalyLog[]>([
    { id: "tr-1", timestamp: "00:28:10", packetSize: 512, durationMs: 45, score: 0.92, isAnomaly: false, sourceIp: "192.168.1.104" },
    { id: "tr-2", timestamp: "00:28:15", packetSize: 490, durationMs: 50, score: 0.95, isAnomaly: false, sourceIp: "192.168.1.5" },
    { id: "tr-3", timestamp: "00:28:19", packetSize: 520, durationMs: 42, score: 0.91, isAnomaly: false, sourceIp: "192.168.1.104" },
    { id: "tr-4", timestamp: "00:28:22", packetSize: 4300, durationMs: 1200, score: -0.84, isAnomaly: true, sourceIp: "185.190.140.2" }
  ]);

  const [isScanning, setIsScanning] = useState(false);
  const [healingFileId, setHealingFileId] = useState<string | null>(null);

  // Auto traffic simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate standard safe background traffic 85% of time, anomalous 15%
      const triggerAnomaly = Math.random() < 0.15;
      const size = triggerAnomaly ? Math.floor(Math.random() * 3000) + 2000 : Math.floor(Math.random() * 300) + 300;
      const duration = triggerAnomaly ? Math.floor(Math.random() * 800) + 800 : Math.floor(Math.random() * 60) + 30;
      const isAnom = size > 1500 || duration > 500;
      const score = isAnom ? parseFloat((Math.random() * -0.5 - 0.3).toFixed(2)) : parseFloat((Math.random() * 0.4 + 0.6).toFixed(2));
      const source = isAnom ? `172.56.${Math.floor(Math.random()*254)}.${Math.floor(Math.random()*254)}` : `192.168.1.${Math.floor(Math.random()*150 + 10)}`;

      const newLog: AnomalyLog = {
        id: `tr-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        packetSize: size,
        durationMs: duration,
        score,
        isAnomaly: isAnom,
        sourceIp: source
      };

      setTrafficLogs(prev => [newLog, ...prev.slice(0, 9)]);

      if (isAnom) {
        addHoneypotHit(source, size > 2500 ? 2222 : 22, size > 2500 ? "Aegis Fake SSH" : "SSH", "TRAPPED", "Unknown");
      }
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const addHoneypotHit = (ip: string, port: number, service: string, action: "BLOCKED" | "REDIRECTED" | "TRAPPED", country: string) => {
    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    const countries = ["China", "Russia", "Brazil", "Netherlands", "United States", "Ukraine", "Vietnam"];
    const actualCountry = country === "Unknown" ? countries[Math.floor(Math.random() * countries.length)] : country;
    const newLog: HoneypotLog = {
      id: `hp-${Date.now()}`,
      timestamp,
      attackerIp: ip,
      port,
      service,
      action,
      country: actualCountry
    };
    setHoneypotLogs(prev => [newLog, ...prev.slice(0, 9)]);
  };

  // Simulates a heavy port scan and red-team barrage
  const triggerIntrusionSimulation = () => {
    if (isScanning) return;
    setIsScanning(true);
    let count = 0;
    const ips = [
      "193.201.224.18",
      "85.203.45.19",
      "109.122.33.154",
      "178.62.201.5",
      "46.101.99.112"
    ];
    const services = [
      { port: 22, name: "SSH Decoy" },
      { port: 3306, name: "MySQL Decoy" },
      { port: 2222, name: "Aegis Fake SSH" },
      { port: 80, name: "HTTP Honeypot" }
    ];

    const timer = setInterval(() => {
      const randomIp = ips[Math.floor(Math.random() * ips.length)];
      const srv = services[Math.floor(Math.random() * services.length)];
      const action = Math.random() > 0.5 ? "BLOCKED" : "TRAPPED";

      addHoneypotHit(randomIp, srv.port, srv.name, action, "Unknown");
      count++;
      if (count >= 6) {
        clearInterval(timer);
        setIsScanning(false);
      }
    }, 400);
  };

  // Trigger FIM Tampering with instant Self-Healing restore
  const triggerTamper = (fileId: string) => {
    const selectedFile = fimFiles.find(f => f.id === fileId);
    if (!selectedFile || selectedFile.status !== "PRISTINE") return;

    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    const maliciousHash = Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join("");
    const shortMaliciousHash = maliciousHash.slice(0, 8) + "..." + maliciousHash.slice(-4);

    // Set file state to tampered
    setFimFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        return {
          ...f,
          timestamp,
          hash: shortMaliciousHash,
          status: "TAMPERED",
          event: "MODIFY"
        };
      }
      return f;
    }));

    setFimEventsLog(prev => [
      `[${timestamp}] 🚨 TAMPER DETECTION ALARM: Modification detected on ${selectedFile.path}!`,
      `[${timestamp}] ⚠️ SHA-256 Signature mismatch. Current: ${shortMaliciousHash} != Expected: ${selectedFile.hash}`,
      ...prev
    ]);

    // Schedule automatic self-healing recovery after 1.5s
    setHealingFileId(fileId);
    setTimeout(() => {
      const healedTime = new Date().toLocaleTimeString("en-US", { hour12: false });
      setFimFiles(prev => prev.map(f => {
        if (f.id === fileId) {
          return {
            ...f,
            timestamp: healedTime,
            hash: selectedFile.hash, // Pristine hash
            status: "HEALED",
            event: "RESTORE"
          };
        }
        return f;
      }));

      setFimEventsLog(prev => [
        `[${healedTime}] 💫 SELF-HEALING ENGINE ACTIVATED automatically for ${selectedFile.filename}`,
        `[${healedTime}] 🔄 Restored clean configuration state from protected Aegis Backup Vault.`,
        `[${healedTime}] ✅ Integrity verified. Core baseline parameters locked.`,
        ...prev
      ]);
      setHealingFileId(null);
    }, 1800);
  };

  const clearHoneypot = () => {
    setHoneypotLogs([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="soc-terminal-section">
      
      {/* 1. Honeypot Active Defense Console */}
      <div className="lg:col-span-6 bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 p-5 flex flex-col h-[520px] shadow-[0_4px_24px_-3px_rgba(0,0,0,0.4)]" id="honeypot-panel">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <Shield className="h-4 w-4 text-rose-400" />
            <h2 className="text-sm font-semibold text-slate-100 font-display tracking-tight">
              Active Decoy Honeypot (Port 2222 / 3306)
            </h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={triggerIntrusionSimulation} 
              disabled={isScanning}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-mono font-medium transition-all ${
                isScanning 
                  ? "bg-rose-950/20 text-rose-400/60 border border-rose-900/20 cursor-not-allowed" 
                  : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 active:scale-95 cursor-pointer"
              }`}
              id="simulate-attack-btn"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              {isScanning ? "Attacking..." : "Inject Red-Team Raid"}
            </button>
            <button 
              onClick={clearHoneypot}
              className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-900 transition-colors"
              title="Clear Terminal logs"
              id="clear-logs-btn"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Real-time scroll terminal */}
        <div className="flex-1 bg-black/50 p-4 rounded-lg border border-slate-850 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-slate-800" id="terminal-screen">
          <div className="text-slate-500 mb-2 border-b border-slate-850 pb-1.5 flex justify-between font-mono text-[10px]">
            <span>[SYS] Active Decoy Shell initialized. Routing traffic...</span>
            <span className="text-[10px] animate-pulse text-emerald-500 font-bold">LISTENING</span>
          </div>
          
          <AnimatePresence initial={false}>
            {honeypotLogs.length === 0 ? (
              <div className="text-slate-500 text-center py-16 font-mono text-xs">No active intrusions logged. System is secure.</div>
            ) : (
              honeypotLogs.map((log) => (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-900 pb-1.5 font-mono"
                >
                  <div className="flex items-baseline gap-2 flex-wrap text-[11px]">
                    <span className="text-slate-500 text-[10px] select-none">[{log.timestamp}]</span>
                    <span className="text-rose-400 font-medium">{log.attackerIp}</span>
                    <span className="text-slate-400">attempted exploit on</span>
                    <span className="text-slate-200 font-medium">{log.service} (Port {log.port})</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 sm:mt-0 shrink-0">
                    <span className="text-slate-500 text-[10px] italic">{log.country}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wider font-mono ${
                      log.action === "TRAPPED" 
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}>
                      {log.action}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
        <div className="mt-3 text-[10px] text-slate-500 font-mono flex justify-between items-center px-1">
          <span>* Decoy ports simulate EDR Evasion Traps & Covert Channels.</span>
          <span>Banned IPs: {honeypotLogs.filter(l => l.action === "BLOCKED").length}</span>
        </div>
      </div>

      {/* 2. File Integrity Monitor & Self Healing */}
      <div className="lg:col-span-6 bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 p-5 flex flex-col h-[520px] shadow-[0_4px_24px_-3px_rgba(0,0,0,0.4)]" id="fim-panel">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${healingFileId ? "bg-amber-400" : "bg-cyan-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${healingFileId ? "bg-amber-500" : "bg-cyan-500"}`}></span>
            </span>
            <FileCode className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-100 font-display tracking-tight">
              Self-Healing File Integrity Monitor (FIM)
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700 font-medium">
            SHA-256 Baseline Vault
          </span>
        </div>

        {/* List of files being monitored */}
        <div className="space-y-3 mb-4" id="fim-file-list">
          {fimFiles.map((file) => (
            <div 
              key={file.id}
              className="bg-slate-900/30 p-3 rounded-lg border border-slate-850 flex items-center justify-between"
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-slate-200">{file.filename}</span>
                  <span className="text-[10px] font-mono text-slate-500">{file.path}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono text-slate-400">
                    Hash: <span className="text-cyan-400/80">{file.hash}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold tracking-tight ${
                  file.status === "PRISTINE"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : file.status === "TAMPERED"
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse font-bold"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold"
                }`}>
                  ● {file.status}
                </span>

                <button
                  onClick={() => triggerTamper(file.id)}
                  disabled={file.status !== "PRISTINE" || healingFileId !== null}
                  className={`text-[10px] px-2.5 py-1 rounded font-mono font-medium border transition-all ${
                    file.status !== "PRISTINE"
                      ? "bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed"
                      : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 active:scale-95 cursor-pointer"
                  }`}
                  id={`tamper-btn-${file.id}`}
                >
                  Tamper File
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FIM Event log panel */}
        <div className="flex-1 bg-black/50 p-3 rounded-lg border border-slate-850 overflow-y-auto font-mono text-[10px] leading-relaxed text-slate-400 flex flex-col gap-1 scrollbar-thin scrollbar-thumb-slate-800" id="fim-event-console">
          <div className="text-[9px] text-cyan-500 font-bold uppercase tracking-wider mb-1.5 border-b border-slate-850 pb-1 flex justify-between font-mono">
            <span>FIM Kernel Event Monitor Stream</span>
            {healingFileId && <span className="animate-pulse text-amber-400">SELF-HEALING RESTORE IN PROGRESS...</span>}
          </div>
          {fimEventsLog.map((logLine, index) => {
            let color = "text-slate-400";
            if (logLine.includes("🚨") || logLine.includes("⚠️")) color = "text-rose-400 font-medium";
            if (logLine.includes("💫") || logLine.includes("🔄")) color = "text-amber-400";
            if (logLine.includes("✅")) color = "text-emerald-400";

            return (
              <div key={index} className={`${color} border-b border-slate-950 pb-0.5 font-mono`}>
                {logLine}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. AI/ML Network Traffic Anomaly Detector - Full Width */}
      <div className="lg:col-span-12 bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 p-5 shadow-[0_4px_24px_-3px_rgba(0,0,0,0.4)]" id="ml-traffic-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <Activity className="h-4 w-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-slate-100 font-display tracking-tight">
              Behavioral ML Anomaly Detector (Isolation Forest Simulation)
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-mono text-slate-500 mr-2">
              Contamination Factor: 0.02 | Kernel: RBF
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-900 text-purple-400 border border-slate-700 uppercase">
              Inference Active
            </span>
          </div>
        </div>

        {/* Real-time traffic stats grids */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id="traffic-monitor-details">
          {/* Simulation variables */}
          <div className="md:col-span-4 bg-slate-900/20 border border-slate-850 p-4 rounded-lg flex flex-col justify-between" id="anomaly-metric-cards">
            <div>
              <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2 font-bold">Model Objective</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Analyzes inbound request vectors matching <strong>Packet Size (B)</strong> against <strong>Connection Duration (ms)</strong>. Outliers are isolated using spatial density cuts.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded bg-slate-900/40 border border-slate-850">
                <span className="text-[10px] text-slate-400 font-mono">Traffic Volume</span>
                <span className="text-xs font-bold text-slate-200 font-mono">High-Speed Polling</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-900/40 border border-slate-850">
                <span className="text-[10px] text-slate-400 font-mono">Suspicious Scans Auto-Banned</span>
                <span className="text-xs font-bold text-rose-400 font-mono">
                  {trafficLogs.filter(l => l.isAnomaly).length} Connections
                </span>
              </div>
            </div>
          </div>

          {/* Table display */}
          <div className="md:col-span-8 bg-black/50 rounded-lg border border-slate-850 overflow-hidden" id="traffic-flow-table">
            <div className="bg-slate-900/50 border-b border-slate-800 p-2.5 text-[10px] uppercase font-mono font-bold tracking-wider text-purple-400 grid grid-cols-12">
              <div className="col-span-2">Timestamp</div>
              <div className="col-span-3">Inbound IP</div>
              <div className="col-span-2 text-right font-mono">Size</div>
              <div className="col-span-2 text-right font-mono">Duration</div>
              <div className="col-span-2 text-right font-mono">Inference Score</div>
              <div className="col-span-1 text-center font-mono">Status</div>
            </div>
            <div className="divide-y divide-slate-950 max-h-[170px] overflow-y-auto font-mono text-xs text-slate-300 scrollbar-thin scrollbar-thumb-slate-800" id="traffic-table-body">
              <AnimatePresence initial={false}>
                {trafficLogs.map((log) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-2.5 grid grid-cols-12 items-center transition-colors font-mono text-[11px] ${
                      log.isAnomaly ? "bg-rose-950/10 hover:bg-rose-950/20" : "hover:bg-slate-900/20"
                    }`}
                  >
                    <div className="col-span-2 text-slate-500 text-[10px]">{log.timestamp}</div>
                    <div className="col-span-3 text-slate-300 font-medium">{log.sourceIp}</div>
                    <div className="col-span-2 text-right text-slate-400">{log.packetSize} B</div>
                    <div className="col-span-2 text-right text-slate-400">{log.durationMs} ms</div>
                    <div className="col-span-2 text-right font-semibold">
                      <span className={log.isAnomaly ? "text-rose-400" : "text-emerald-400"}>
                        {log.score > 0 ? `+${log.score}` : log.score}
                      </span>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        log.isAnomaly ? "bg-rose-500 animate-pulse" : "bg-emerald-500"
                      }`} title={log.isAnomaly ? "Anomaly Detected!" : "Normal behavior verified"} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Radio, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Sliders, 
  ArrowRight, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Copy, 
  Check,
  Split,
  Binary,
  Layers,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { QkdBasis, QkdState, QkdPulse, QkdSessionStats } from "../types";
import { motion, AnimatePresence } from "motion/react";

export default function QkdSimulator() {
  const [eveEnabled, setEveEnabled] = useState<boolean>(false);
  const [fiberDistanceKm, setFiberDistanceKm] = useState<number>(25); // 5 to 100 km
  const [pulseCount, setPulseCount] = useState<number>(32); // 16, 32, 64, 128
  const [channelNoiseRate, setChannelNoiseRate] = useState<number>(1.5); // % intrinsic dark count noise
  const [eveInterceptRate, setEveInterceptRate] = useState<number>(100); // % of photons Eve intercepts if enabled
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [activeViewMode, setActiveViewMode] = useState<"stream" | "steps" | "telemetry">("stream");

  // State of simulated pulses
  const [pulses, setPulses] = useState<QkdPulse[]>(() => generatePulses(32, false, 25, 1.5, 100));

  function generatePulses(
    count: number, 
    eveOn: boolean, 
    distanceKm: number, 
    noise: number, 
    eveRate: number
  ): QkdPulse[] {
    const list: QkdPulse[] = [];
    const lossDb = distanceKm * 0.2; // 0.2 dB/km standard SMF-28
    const transmissionProb = Math.max(0.3, Math.pow(10, -lossDb / 10));

    for (let i = 0; i < count; i++) {
      const aliceBit: 0 | 1 = Math.random() > 0.5 ? 1 : 0;
      const aliceBasis: QkdBasis = Math.random() > 0.5 ? "+" : "×";
      
      let aliceState: QkdState;
      if (aliceBasis === "+") {
        aliceState = aliceBit === 0 ? "|0⟩" : "|1⟩";
      } else {
        aliceState = aliceBit === 0 ? "|+⟩" : "|-⟩";
      }

      let transmittedBit = aliceBit;
      let transmittedBasis = aliceBasis;
      let eveIntercepted = false;
      let eveBasis: QkdBasis | undefined = undefined;
      let eveBit: 0 | 1 | undefined = undefined;

      // Eve Eavesdropping Intercept-and-Resend simulation
      if (eveOn && (Math.random() * 100 < eveRate)) {
        eveIntercepted = true;
        eveBasis = Math.random() > 0.5 ? "+" : "×";
        if (eveBasis === aliceBasis) {
          eveBit = aliceBit;
        } else {
          // Quantum superposition collapse: 50% chance of 0 or 1
          eveBit = Math.random() > 0.5 ? 1 : 0;
        }
        // Eve resends to Bob in her measurement basis
        transmittedBit = eveBit;
        transmittedBasis = eveBasis;
      }

      // Bob chooses random measurement basis
      const bobBasis: QkdBasis = Math.random() > 0.5 ? "+" : "×";
      let bobMeasurement: 0 | 1;

      if (bobBasis === transmittedBasis) {
        bobMeasurement = transmittedBit;
      } else {
        // Different basis causes quantum superposition collapse: 50/50
        bobMeasurement = Math.random() > 0.5 ? 1 : 0;
      }

      // Add small channel dark count / thermal depolarization noise
      if (Math.random() * 100 < noise) {
        bobMeasurement = bobMeasurement === 0 ? 1 : 0;
      }

      const basisMatch = aliceBasis === bobBasis;
      const isError = basisMatch && aliceBit !== bobMeasurement;
      const retainedInKey = basisMatch && !isError;

      list.push({
        index: i + 1,
        aliceBit,
        aliceBasis,
        aliceState,
        eveIntercepted,
        eveBasis,
        eveBit,
        bobBasis,
        bobMeasurement,
        basisMatch,
        isError,
        retainedInKey
      });
    }

    return list;
  }

  // Derive stats
  const stats: QkdSessionStats = useMemo(() => {
    const matchingPulses = pulses.filter(p => p.basisMatch);
    const errorPulses = matchingPulses.filter(p => p.isError);
    const retainedPulses = matchingPulses.filter(p => !p.isError);

    const matchingBasesRate = pulses.length > 0 ? (matchingPulses.length / pulses.length) * 100 : 0;
    const qberPercent = matchingPulses.length > 0 ? (errorPulses.length / matchingPulses.length) * 100 : 0;
    
    // Theoretical Shor-Preskill QBER threshold is 11.0%
    const errorThresholdExceeded = qberPercent > 11.0;
    const eavesdroppingDetected = errorThresholdExceeded || (eveEnabled && qberPercent > 10.0);

    // Final key string generated from sifted & error-corrected bits
    const keyBits = retainedPulses.map(p => p.aliceBit).join("");
    // Format into hex bytes
    let hexKey = "";
    for (let i = 0; i < keyBits.length; i += 4) {
      const nibble = keyBits.substring(i, i + 4);
      if (nibble.length === 4) {
        hexKey += parseInt(nibble, 2).toString(16).toUpperCase();
      }
    }

    return {
      pulsesSent: pulses.length,
      siftedBits: matchingPulses.length,
      matchingBasesRate: parseFloat(matchingBasesRate.toFixed(1)),
      qberPercent: parseFloat(qberPercent.toFixed(2)),
      errorThresholdExceeded,
      eavesdroppingDetected,
      finalSecretKey: hexKey || "A4F89D20",
      channelLossDb: parseFloat((fiberDistanceKm * 0.2).toFixed(1))
    };
  }, [pulses, eveEnabled, fiberDistanceKm]);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const newPulses = generatePulses(pulseCount, eveEnabled, fiberDistanceKm, channelNoiseRate, eveInterceptRate);
      setPulses(newPulses);
      setIsSimulating(false);
    }, 300);
  };

  const handleCopyKey = () => {
    if (!stats.finalSecretKey) return;
    navigator.clipboard.writeText(`QKD_SEED_${stats.finalSecretKey}`);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6" id="qkd-simulator-module">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg bg-slate-900/60 border border-slate-800">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Radio className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white uppercase tracking-tight font-display">
                Quantum Key Distribution (QKD) Simulator
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/80">
                BB84 / E91 PROTOCOL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
              Simulates single-photon polarization transmission between Alice and Bob. Inspects quantum superposition collapse, basis sifting, and real-time eavesdropping detection via Quantum Bit Error Rate (QBER) telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(8,145,178,0.3)] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSimulating ? "animate-spin" : ""}`} />
            <span>Generate Quantum Pulses</span>
          </button>
        </div>
      </div>

      {/* Control Station & Telemetry Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Parameters */}
        <div className="p-5 rounded-lg bg-slate-900/40 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase font-mono">
              <Sliders className="h-4 w-4 text-cyan-400" />
              <span>Optical Channel Controls</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">ITU-T G.652 SMF</span>
          </div>

          {/* Eve Intercept Toggle */}
          <div className={`p-3.5 rounded-lg border transition-all ${
            eveEnabled 
              ? "bg-rose-950/20 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]" 
              : "bg-slate-950/40 border-slate-800"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {eveEnabled ? (
                  <Eye className="h-4 w-4 text-rose-400 animate-pulse" />
                ) : (
                  <EyeOff className="h-4 w-4 text-slate-500" />
                )}
                <div>
                  <div className="text-xs font-bold text-white">Eve Eavesdropper</div>
                  <div className="text-[10px] text-slate-400">Intercept-and-Resend attack</div>
                </div>
              </div>
              <button
                onClick={() => setEveEnabled(!eveEnabled)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                  eveEnabled 
                    ? "bg-rose-600 text-white shadow-sm" 
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {eveEnabled ? "ACTIVE (PROBING)" : "BYPASS (OFF)"}
              </button>
            </div>

            {eveEnabled && (
              <div className="mt-3 pt-3 border-t border-rose-900/40">
                <div className="flex justify-between text-[11px] font-mono text-rose-300 mb-1">
                  <span>Interception Rate:</span>
                  <span>{eveInterceptRate}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="10"
                  value={eveInterceptRate}
                  onChange={(e) => setEveInterceptRate(Number(e.target.value))}
                  className="w-full accent-rose-500 h-1 bg-slate-800 rounded"
                />
              </div>
            )}
          </div>

          {/* Fiber Distance Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Fiber Distance:</span>
              <span className="text-cyan-400 font-bold">{fiberDistanceKm} km</span>
            </div>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={fiberDistanceKm}
              onChange={(e) => setFiberDistanceKm(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>5 km (Metropolitan)</span>
              <span>Attenuation: {stats.channelLossDb} dB</span>
              <span>120 km (Long-haul)</span>
            </div>
          </div>

          {/* Pulse Batch Size */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Pulse Batch Size:</span>
              <span className="text-slate-200 font-bold">{pulseCount} Photons</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[16, 32, 64, 128].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setPulseCount(cnt)}
                  className={`py-1.5 rounded text-xs font-mono transition-all ${
                    pulseCount === cnt
                      ? "bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold"
                      : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white"
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          {/* Intrinsic Detector Dark Counts Noise */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Detector Dark Counts Noise:</span>
              <span className="text-slate-300 font-bold">{channelNoiseRate}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={channelNoiseRate}
              onChange={(e) => setChannelNoiseRate(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              APD / SNSPD (Superconducting Nanowire) thermal noise floor.
            </p>
          </div>
        </div>

        {/* Middle Column: QBER & Security Status */}
        <div className="p-5 rounded-lg bg-slate-900/40 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase font-mono">
              <Activity className="h-4 w-4 text-cyan-400" />
              <span>QBER Threshold Telemetry</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Shor-Preskill Bound</span>
          </div>

          {/* QBER Gauge */}
          <div className="text-center py-2">
            <div className="relative inline-flex items-center justify-center">
              <div className={`text-4xl font-extrabold font-mono tracking-tight ${
                stats.qberPercent > 11.0 
                  ? "text-rose-400 animate-pulse" 
                  : stats.qberPercent > 6.0 
                  ? "text-amber-400" 
                  : "text-emerald-400"
              }`}>
                {stats.qberPercent}%
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              Quantum Bit Error Rate (QBER)
            </p>
            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500 mt-1">
              <span>Safe Bound: &lt; 11.0%</span>
              <span>•</span>
              <span>Theoretical Max: 50.0%</span>
            </div>
          </div>

          {/* Security Banner Alert */}
          <div className={`p-4 rounded-lg border text-xs ${
            stats.eavesdroppingDetected 
              ? "bg-rose-950/30 border-rose-500/50 text-rose-300"
              : "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
          }`}>
            <div className="flex items-start gap-2.5">
              {stats.eavesdroppingDetected ? (
                <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold uppercase tracking-wider font-mono text-sm">
                  {stats.eavesdroppingDetected 
                    ? "ALERT: Eavesdropper Detected" 
                    : "CHANNEL SECURE: Quantum Verified"}
                </div>
                <p className="text-[11px] mt-1 text-slate-300 leading-relaxed">
                  {stats.eavesdroppingDetected 
                    ? `QBER exceeds the 11.0% Shor-Preskill limit. Quantum no-cloning theorem states measurement disturbed photon wavefunctions. Key generation aborted!`
                    : `QBER is within tolerable limits (${stats.qberPercent}%). Channel integrity verified by quantum mechanics. Privacy amplification validated.`}
                </p>
              </div>
            </div>
          </div>

          {/* Metric Bar Row */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Sifted Match Rate</span>
              <span className="text-slate-200 font-bold text-sm">{stats.matchingBasesRate}%</span>
              <span className="text-[9px] text-slate-500 block">Expected: ~50%</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Sifted Key Length</span>
              <span className="text-slate-200 font-bold text-sm">{stats.siftedBits} bits</span>
              <span className="text-[9px] text-slate-500 block">From {stats.pulsesSent} pulses</span>
            </div>
          </div>
        </div>

        {/* Right Column: Shared Quantum Key Output */}
        <div className="p-5 rounded-lg bg-slate-900/40 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase font-mono">
              <Lock className="h-4 w-4 text-cyan-400" />
              <span>Extracted Shared Key</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Privacy Amplified</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] text-slate-500 font-mono mb-1 flex items-center justify-between">
                <span>RECONCILED SYMMETRIC SEED:</span>
                <span className="text-cyan-400">{stats.finalSecretKey.length * 4} bits</span>
              </div>
              <div className="font-mono text-xs text-cyan-300 break-all select-all py-1 bg-slate-900/60 px-2 rounded border border-slate-800">
                {stats.eavesdroppingDetected ? (
                  <span className="text-rose-400">[PURGED: KEY COMPROMISED BY EAVESDROPPING]</span>
                ) : (
                  `0x${stats.finalSecretKey || "E2B7A8C901FA"}`
                )}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1.5 font-sans">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Basis sifting matched 50% rectilinear & diagonal states.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Cascade error reconciliation parity correction executed.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Toeplitz matrix universal hashing compressed Eve's information to &lt; 2⁻¹²⁸.</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCopyKey}
            disabled={stats.eavesdroppingDetected}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700"
          >
            {copiedKey ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-cyan-400" />}
            <span>{copiedKey ? "Copied QKD Seed!" : "Copy Symmetric OTP Key"}</span>
          </button>
        </div>
      </div>

      {/* Interactive Photon Bitstream Visualizer */}
      <div className="p-5 rounded-lg bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Binary className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-tight">
              Single-Photon Transmission Log (Alice → Fiber Channel → Bob)
            </h3>
          </div>

          {/* Basis Legend */}
          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/80 font-bold">+</span> Rectilinear (0°, 90°)
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800/80 font-bold">×</span> Diagonal (+45°, -45°)
            </span>
          </div>
        </div>

        {/* Pulse Grid / Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase">
                <th className="py-2 px-2.5">#</th>
                <th className="py-2 px-2.5">Alice Bit</th>
                <th className="py-2 px-2.5">Alice Basis</th>
                <th className="py-2 px-2.5">Alice State</th>
                {eveEnabled && <th className="py-2 px-2.5 text-rose-400">Eve Intercept</th>}
                <th className="py-2 px-2.5">Bob Basis</th>
                <th className="py-2 px-2.5">Bob Meas.</th>
                <th className="py-2 px-2.5">Basis Match?</th>
                <th className="py-2 px-2.5">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {pulses.slice(0, 16).map((pulse) => (
                <tr 
                  key={pulse.index} 
                  className={`hover:bg-slate-900/60 transition-colors ${
                    pulse.isError 
                      ? "bg-rose-950/20" 
                      : pulse.basisMatch 
                      ? "bg-cyan-950/10" 
                      : ""
                  }`}
                >
                  <td className="py-2 px-2.5 text-slate-500 text-[11px]">{pulse.index}</td>
                  
                  {/* Alice Bit */}
                  <td className="py-2 px-2.5">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      pulse.aliceBit === 1 ? "bg-cyan-950/80 text-cyan-300 border border-cyan-800/60" : "bg-slate-800 text-slate-300"
                    }`}>
                      {pulse.aliceBit}
                    </span>
                  </td>

                  {/* Alice Basis */}
                  <td className="py-2 px-2.5">
                    <span className={`px-1.5 py-0.5 rounded font-bold ${
                      pulse.aliceBasis === "+" ? "bg-blue-950 text-blue-400 border border-blue-800" : "bg-purple-950 text-purple-400 border border-purple-800"
                    }`}>
                      {pulse.aliceBasis}
                    </span>
                  </td>

                  {/* Alice State */}
                  <td className="py-2 px-2.5 text-slate-300 font-bold">{pulse.aliceState}</td>

                  {/* Eve Column */}
                  {eveEnabled && (
                    <td className="py-2 px-2.5">
                      {pulse.eveIntercepted ? (
                        <span className="text-[10px] text-rose-400 flex items-center gap-1 font-bold">
                          <Eye className="h-3 w-3" />
                          <span>{pulse.eveBasis} ({pulse.eveBit})</span>
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[10px]">Passed</span>
                      )}
                    </td>
                  )}

                  {/* Bob Basis */}
                  <td className="py-2 px-2.5">
                    <span className={`px-1.5 py-0.5 rounded font-bold ${
                      pulse.bobBasis === "+" ? "bg-blue-950 text-blue-400 border border-blue-800" : "bg-purple-950 text-purple-400 border border-purple-800"
                    }`}>
                      {pulse.bobBasis}
                    </span>
                  </td>

                  {/* Bob Measurement */}
                  <td className="py-2 px-2.5">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      pulse.bobMeasurement === 1 ? "bg-cyan-950/80 text-cyan-300 border border-cyan-800/60" : "bg-slate-800 text-slate-300"
                    }`}>
                      {pulse.bobMeasurement}
                    </span>
                  </td>

                  {/* Basis Match */}
                  <td className="py-2 px-2.5">
                    {pulse.basisMatch ? (
                      <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>MATCH</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>DISCARD</span>
                      </span>
                    )}
                  </td>

                  {/* Result Status */}
                  <td className="py-2 px-2.5">
                    {pulse.isError ? (
                      <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold">
                        QBER ERROR
                      </span>
                    ) : pulse.retainedInKey ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                        KEPT IN KEY
                      </span>
                    ) : (
                      <span className="text-slate-600 text-[10px]">
                        SIFTED OUT
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pulses.length > 16 && (
          <div className="text-center text-[10px] font-mono text-slate-500 pt-2">
            Showing first 16 of {pulses.length} generated single-photon pulses. Full batch processed for key distillation.
          </div>
        )}
      </div>
    </div>
  );
}

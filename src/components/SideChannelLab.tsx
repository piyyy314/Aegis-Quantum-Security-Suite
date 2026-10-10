/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Zap, 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  Sliders, 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  Layers, 
  Flame, 
  Eye, 
  Cpu, 
  CheckCircle2, 
  XCircle,
  Binary
} from "lucide-react";
import { ScaSimulationPoint, FaultInjectionScenario } from "../types";
import { motion } from "motion/react";

export default function SideChannelLab() {
  // Countermeasure Toggles
  const [maskingOrder, setMaskingOrder] = useState<0 | 1 | 2>(1); // 0 = unmasked, 1 = 1st order, 2 = 2nd order
  const [shuffleCoefficients, setShuffleCoefficients] = useState<boolean>(true);
  const [blindingNoiseLevel, setBlindingNoiseLevel] = useState<number>(30); // 0 to 100%
  const [isInjectingFault, setIsInjectingFault] = useState<boolean>(false);
  const [faultType, setFaultType] = useState<"CLOCK_GLITCH" | "LASER_VOLTAGE_DIP" | "EM_PROBE">("CLOCK_GLITCH");
  const [faultDetected, setFaultDetected] = useState<boolean>(false);

  // Scenarios for fault injection
  const [faultScenarios, setFaultScenarios] = useState<FaultInjectionScenario[]>([
    {
      id: "fi-1",
      name: "NTT Butterfly Modular Reduction Skip",
      targetStage: "NTT_POLYNOMIAL_MULTIPLICATION",
      glitchDurationNs: 8,
      voltageDipPercent: 45,
      bitsLeaked: 0,
      keyRecovered: false,
      defenseStatus: "RESISTANT"
    },
    {
      id: "fi-2",
      name: "Rejection Sampler Coefficient Clamping",
      targetStage: "REJECTION_SAMPLING",
      glitchDurationNs: 12,
      voltageDipPercent: 60,
      bitsLeaked: 0,
      keyRecovered: false,
      defenseStatus: "DETECTED_HALTED"
    },
    {
      id: "fi-3",
      name: "Secret Key Vector s[k] Deserialization",
      targetStage: "KEY_UNPACKING",
      glitchDurationNs: 5,
      voltageDipPercent: 30,
      bitsLeaked: 0,
      keyRecovered: false,
      defenseStatus: "RESISTANT"
    }
  ]);

  // Generate simulated power traces across 30 clock cycles of NTT polynomial operations
  const tracePoints: ScaSimulationPoint[] = useMemo(() => {
    const points: ScaSimulationPoint[] = [];
    const leakCycle = 14; // cycle where secret polynomial multiplication occurs

    for (let c = 1; c <= 30; c++) {
      // Base baseline CMOS switching power (mV)
      const basePower = 40 + Math.sin(c * 0.8) * 15 + (Math.random() * 4 - 2);
      
      // Unprotected power exhibits strong secret-data dependent spike at cycle 14
      let unprotectedPower = basePower;
      if (c === leakCycle) {
        unprotectedPower += 38.5; // Big Hamming-distance power surge
      } else if (Math.abs(c - leakCycle) === 1) {
        unprotectedPower += 12.0;
      }

      // Masked power trace (noise injection + shares cancellation)
      let maskedPower = basePower;
      if (maskingOrder === 0) {
        maskedPower = unprotectedPower;
      } else if (maskingOrder === 1) {
        // 1st order masking splits state into two shares s = s0 ^ s1
        maskedPower += (Math.random() * 8 - 4) + (blindingNoiseLevel * 0.15);
      } else {
        // 2nd order masking completely flattens Hamming weight leakage
        maskedPower += (Math.random() * 4 - 2) + (blindingNoiseLevel * 0.25);
      }

      // Correlation coefficient rho between power and secret key candidate hypothesis
      let correlation = 0.08 + Math.random() * 0.05;
      if (maskingOrder === 0 && c === leakCycle) {
        correlation = 0.88; // Highly vulnerable! Secret key byte easily recovered
      } else if (maskingOrder === 1 && c === leakCycle) {
        correlation = shuffleCoefficients ? 0.18 : 0.32;
      } else if (maskingOrder === 2) {
        correlation = 0.09; // Indistinguishable from background noise floor
      }

      points.push({
        cycle: c,
        unprotectedPowerMv: parseFloat(unprotectedPower.toFixed(2)),
        maskedPowerMv: parseFloat(maskedPower.toFixed(2)),
        correlationCoeff: parseFloat(correlation.toFixed(3)),
        leakageThreshold: 0.25 // Standard TVLA (Test Vector Leakage Assessment) threshold
      });
    }
    return points;
  }, [maskingOrder, shuffleCoefficients, blindingNoiseLevel]);

  // Max correlation reached
  const maxCorrelation = Math.max(...tracePoints.map(p => p.correlationCoeff));
  const isVulnerableToCpa = maxCorrelation > 0.25;

  const handleTriggerFault = () => {
    setIsInjectingFault(true);
    setFaultDetected(false);

    setTimeout(() => {
      setIsInjectingFault(false);
      // If masking and shuffling are on, defense detects fault and zeroes out registers
      if (maskingOrder >= 1 && shuffleCoefficients) {
        setFaultDetected(true);
      } else {
        setFaultDetected(false);
      }
    }, 400);
  };

  return (
    <div className="space-y-6" id="side-channel-lab-module">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg bg-slate-900/60 border border-slate-800">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/30 text-rose-400 shrink-0">
            <Zap className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white uppercase tracking-tight font-display">
                Physical Side-Channel & Fault Injection Resistance Lab
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/80">
                FIPS-140-3 / DPA & LFI BENCHMARK
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
              Analyzes microarchitectural power leakage during Number Theoretic Transform (NTT) operations in ML-KEM & ML-DSA. Simulates Differential Power Analysis (DPA/CPA) and Laser Fault Injection (LFI) against lattice hardware.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerFault}
            disabled={isInjectingFault}
            className="flex items-center gap-2 px-4 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] disabled:opacity-50"
          >
            <Flame className={`h-3.5 w-3.5 ${isInjectingFault ? "animate-bounce" : ""}`} />
            <span>Inject Physical Glitch</span>
          </button>
        </div>
      </div>

      {/* Control Station & Telemetry Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Masking & Hardware Countermeasures */}
        <div className="p-5 rounded-lg bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase font-mono">
              <Sliders className="h-4 w-4 text-rose-400" />
              <span>Countermeasure Switches</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">HARDWARE CO-PROCESSOR</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {/* Masking Order */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Boolean / Arithmetic Masking:</span>
                <span className="text-cyan-400 font-bold">
                  {maskingOrder === 0 ? "UNPROTECTED (0th)" : maskingOrder === 1 ? "1st Order (2 Shares)" : "2nd Order (3 Shares)"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {([0, 1, 2] as const).map((order) => (
                  <button
                    key={order}
                    onClick={() => setMaskingOrder(order)}
                    className={`py-1.5 rounded text-[11px] font-mono transition-all ${
                      maskingOrder === order
                        ? "bg-rose-950 text-rose-300 border border-rose-500/60 font-bold"
                        : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                    }`}
                  >
                    {order === 0 ? "Unmasked" : `${order}st Order`}
                  </button>
                ))}
              </div>
            </div>

            {/* Coefficient Shuffling */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Fisher-Yates Shuffling</div>
                <div className="text-[10px] text-slate-400">Randomize NTT butterfly loop execution</div>
              </div>
              <button
                onClick={() => setShuffleCoefficients(!shuffleCoefficients)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                  shuffleCoefficients ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                {shuffleCoefficients ? "ENABLED" : "OFF"}
              </button>
            </div>

            {/* Blinding Noise Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Clock Jitter & Noise Blinding:</span>
                <span className="text-white font-bold">{blindingNoiseLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={blindingNoiseLevel}
                onChange={(e) => setBlindingNoiseLevel(Number(e.target.value))}
                className="w-full accent-rose-400 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            {/* Fault Type Selection */}
            <div>
              <label className="text-slate-400 block mb-1">Fault Injection Vector:</label>
              <select
                value={faultType}
                onChange={(e) => setFaultType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-white focus:border-rose-500 outline-none text-xs"
              >
                <option value="CLOCK_GLITCH">Clock Jitter Glitch (Phase skip)</option>
                <option value="LASER_VOLTAGE_DIP">Sub-surface Laser Fault (LFI bit-flip)</option>
                <option value="EM_PROBE">Electromagnetic Pulse (EMFI)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Middle Column: Correlation Power Analysis (CPA) Leakage Status */}
        <div className="p-5 rounded-lg bg-slate-900/40 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase font-mono">
              <Activity className="h-4 w-4 text-rose-400" />
              <span>DPA / CPA Leakage Index</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">TVLA TEST BENCH</span>
          </div>

          <div className="text-center py-2">
            <div className="text-4xl font-extrabold font-mono tracking-tight text-white">
              <span className={isVulnerableToCpa ? "text-rose-400 animate-pulse" : "text-emerald-400"}>
                ρ = {maxCorrelation.toFixed(3)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              Peak Power-Key Correlation Coefficient
            </p>
            <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
              Critical Leakage Threshold: ρ &gt; 0.250
            </span>
          </div>

          {/* Vulnerability Banner */}
          <div className={`p-3.5 rounded-lg border text-xs ${
            isVulnerableToCpa 
              ? "bg-rose-950/30 border-rose-500/50 text-rose-300" 
              : "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
          }`}>
            <div className="flex items-start gap-2">
              {isVulnerableToCpa ? (
                <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold font-mono uppercase">
                  {isVulnerableToCpa 
                    ? "SIDE-CHANNEL KEY LEAK DETECTED" 
                    : "PROTECTED: CORRELATION FLATTENED"}
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  {isVulnerableToCpa 
                    ? "Hamming weight power consumption at cycle 14 correlates strongly with secret polynomial coefficients. An adversary with an oscilloscope can recover the ML-KEM private key in < 5,000 traces."
                    : "Higher-order masking shares split intermediate values. Correlation remains below the noise floor. Compliant with FIPS-140-3 physical security requirements."}
                </p>
              </div>
            </div>
          </div>

          {/* Fault Alarm Banner if injected */}
          {faultDetected && (
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Fault detected by dual-rail parity validator! Core registers zeroized safely.</span>
            </div>
          )}
        </div>

        {/* Right Column: Hardware Register & Security Specs */}
        <div className="p-5 rounded-lg bg-slate-900/40 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase font-mono">
              <Cpu className="h-4 w-4 text-rose-400" />
              <span>Lattice NTT Accelerator State</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">KYBER / DILITHIUM</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500">Polynomial Ring Modulus:</div>
              <div className="text-white font-bold">Rq = Zq[X]/(X^256 + 1), q = 3329</div>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500">Constant-Time Arithmetic Engine:</div>
              <div className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Montgomery & Barrett Reduction (No Data-Dependent Branches)</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500">Silicon Redundancy:</div>
              <div className="text-slate-300">Dual-core lockstep verification with instant panic wipe.</div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500">
            Certified evaluation against ISO/IEC 17825 Side-Channel standards.
          </div>
        </div>
      </div>

      {/* Visual Power Trace Oscilloscope */}
      <div className="p-5 rounded-lg bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-rose-400" />
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-tight">
              Power Consumption Trace Oscilloscope (Clock Cycles 1 to 30)
            </h3>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Unprotected Power Spike (Leak)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400" /> Masked Power Profile
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> Cycle 14 NTT Critical Point
            </span>
          </div>
        </div>

        {/* Trace Visualizer Grid */}
        <div className="h-44 w-full bg-slate-950/80 rounded-lg border border-slate-800 p-4 flex items-end gap-1.5 overflow-x-auto">
          {tracePoints.map((pt) => {
            const isLeakPoint = pt.cycle === 14;
            const barHeightPercent = Math.min(100, Math.max(10, (pt.maskedPowerMv / 85) * 100));

            return (
              <div key={pt.cycle} className="flex-1 flex flex-col items-center h-full justify-end group min-w-[14px]">
                {/* Tooltip on hover */}
                <div className="text-[9px] font-mono text-slate-500 group-hover:text-white transition-colors mb-1">
                  {pt.cycle}
                </div>
                <div 
                  style={{ height: `${barHeightPercent}%` }}
                  className={`w-full rounded-t transition-all ${
                    isLeakPoint && maskingOrder === 0
                      ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-pulse"
                      : isLeakPoint
                      ? "bg-amber-400"
                      : "bg-cyan-600/70 group-hover:bg-cyan-400"
                  }`}
                  title={`Cycle ${pt.cycle}: Power ${pt.maskedPowerMv} mV, Correlation: ${pt.correlationCoeff}`}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>Cycle 1: NTT Montgomery Setup</span>
          <span className="text-amber-400 font-bold">Cycle 14: Secret Coordinate Butterfly Multiply</span>
          <span>Cycle 30: Polynomial Writeback</span>
        </div>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Sliders, 
  Cpu, 
  Network, 
  Info, 
  TrendingUp, 
  SlidersHorizontal,
  RefreshCw,
  Gauge
} from "lucide-react";
import { GbsState } from "../types";
import { motion } from "motion/react";

export default function GbsPlayground() {
  const [lossRate, setLossRate] = useState<number>(75); // 0 to 95%
  const [modeDensity, setModeDensity] = useState<number>(40); // 10 to 100 modes
  const [bondDimension, setBondDimension] = useState<number>(8); // 2 to 64 max D
  const [simulationId, setSimulationId] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Derive quantum vs classical stats based on mathematical GBS rules
  const totalModes = modeDensity;
  
  // Entanglement entropy decays exponentially as loss rate increases (pure state -> mixed state)
  const entanglementEntropy = parseFloat(
    (3.2 * Math.exp(-lossRate / 35) * (modeDensity / 40)).toFixed(2)
  );

  // Speedup multiplier explodes as loss rate increases and bond dimension stays capped
  const rawSpeedup = Math.pow(1.8, (lossRate / 10)) * (64 / bondDimension);
  const classicalSpeedup = Math.round(rawSpeedup);

  // Required bond dimension to simulate exactly increases exponentially with modes, but collapses with high loss
  const rawRequiredBond = Math.round(
    Math.pow(2, (modeDensity / 12)) * Math.exp(-lossRate / 22)
  );
  const actualRequiredBond = Math.max(2, Math.min(rawRequiredBond, 512));

  // Accuracy of the classical SVD simulation relative to the noisy quantum state
  const accuracy = Math.round(
    Math.min(100, Math.max(45, 100 - (actualRequiredBond - bondDimension) * 0.8))
  );

  // Generate simulated singular values spectrum for the current state (SVD eigenvalues)
  const [singularValues, setSingularValues] = useState<number[]>([]);

  useEffect(() => {
    // Generate decaying list of singular values
    const vals: number[] = [];
    const decayFactor = 0.1 + (lossRate / 100) * 0.55; // higher loss = faster decay
    for (let i = 0; i < 12; i++) {
      const v = Math.exp(-i * decayFactor) * (1 - (i * 0.02));
      vals.push(Math.max(0.001, parseFloat(v.toFixed(3))));
    }
    setSingularValues(vals);
  }, [lossRate, bondDimension, simulationId]);

  const triggerResetSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSimulationId(prev => prev + 1);
      setIsSimulating(false);
    }, 800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="gbs-playground-container">
      
      {/* Introduction text banner */}
      <div className="lg:col-span-12 bg-slate-900/20 border border-slate-800 p-4 rounded-xl text-xs leading-relaxed text-slate-300" id="gbs-header-banner">
        <div className="flex gap-2.5 items-start">
          <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-slate-200 text-xs mb-1 font-sans">
              How classical supercomputers spoof &quot;Quantum Supremacy&quot; in Gaussian Boson Sampling
            </h3>
            <p className="text-slate-400">
              In GBS, photons are sent through an optical interferometer. Quantum computers claim supremacy because tracing all combinations is exponentially hard. However, in reality, quantum hardware suffers from massive <strong>Photon Loss</strong>. Classical tensor networks (such as MPS or PEPS) exploit this noise. Tracing out lost photons collapses quantum entanglement entropy, allowing classical computers to use <strong>Singular Value Decomposition (SVD)</strong> to truncate the tensor bonds and compute results in minutes!
            </p>
          </div>
        </div>
      </div>

      {/* Control Sliders Panel */}
      <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 p-5 flex flex-col justify-between h-[520px] shadow-[0_4px_24px_-3px_rgba(0,0,0,0.4)]" id="gbs-sliders-panel">
        <div className="space-y-6" id="gbs-sliders-flow">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-100 font-display tracking-tight">
              Simulation Control Deck
            </h2>
          </div>

          {/* 1. Photon Loss Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-400">Photon Loss Rate:</span>
              <span className="text-cyan-400 font-bold">{lossRate}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="95" 
              step="5"
              value={lossRate}
              onChange={(e) => setLossRate(parseInt(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-950 rounded-lg cursor-pointer h-1.5"
              id="loss-rate-slider"
            />
            <p className="text-[10px] text-slate-500 font-mono leading-tight">
              Higher loss destroys entanglement, speeding up SVD truncation exponentially.
            </p>
          </div>

          {/* 2. Mode Density */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-400">Quantum Modes (Qubits):</span>
              <span className="text-purple-400 font-bold">{modeDensity} Modes</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="100" 
              step="10"
              value={modeDensity}
              onChange={(e) => setModeDensity(parseInt(e.target.value))}
              className="w-full accent-purple-400 bg-slate-950 rounded-lg cursor-pointer h-1.5"
              id="mode-density-slider"
            />
            <p className="text-[10px] text-slate-500 font-mono leading-tight">
              Increases the size of the GBS linear optical interferometer grid.
            </p>
          </div>

          {/* 3. Max Bond Dimension */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-400">Max SVD Bond Dimension (D):</span>
              <span className="text-emerald-400 font-bold">D = {bondDimension}</span>
            </div>
            <input 
              type="range" 
              min="2" 
              max="64" 
              step="2"
              value={bondDimension}
              onChange={(e) => setBondDimension(parseInt(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-950 rounded-lg cursor-pointer h-1.5"
              id="bond-dim-slider"
            />
            <p className="text-[10px] text-slate-500 font-mono leading-tight">
              Sets the classical tensor compression limit. High D increases accuracy.
            </p>
          </div>
        </div>

        <button
          onClick={triggerResetSimulation}
          disabled={isSimulating}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 hover:border-slate-600 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all active:scale-95 mt-6 cursor-pointer shadow-[0_0_12px_rgba(34,211,238,0.05)]"
          id="reseed-gbs-btn"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSimulating ? "animate-spin" : ""}`} />
          {isSimulating ? "Regenerating Wavefunction..." : "Re-Seed Optical Interferometer"}
        </button>
      </div>

      {/* Mathematical visualization display panel */}
      <div className="lg:col-span-8 bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 p-5 flex flex-col justify-between h-[520px] shadow-[0_4px_24px_-3px_rgba(0,0,0,0.4)]" id="gbs-visual-panel">
        
        {/* Statistics headers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5" id="gbs-stats-row">
          <div className="bg-slate-900/20 p-2.5 rounded-lg border border-slate-850 text-center flex flex-col justify-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Entanglement Entropy</span>
            <span className="text-base font-bold text-cyan-400 font-mono mt-0.5">{entanglementEntropy} Nats</span>
          </div>
          <div className="bg-slate-900/20 p-2.5 rounded-lg border border-slate-850 text-center flex flex-col justify-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">D required for 100%</span>
            <span className="text-base font-bold text-purple-400 font-mono mt-0.5">{actualRequiredBond}</span>
          </div>
          <div className="bg-slate-900/20 p-2.5 rounded-lg border border-slate-850 text-center flex flex-col justify-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Simulation Speedup</span>
            <span className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              {classicalSpeedup.toLocaleString()}x
            </span>
          </div>
          <div className="bg-slate-900/20 p-2.5 rounded-lg border border-slate-850 text-center flex flex-col justify-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Sim. Fidelity (SVD)</span>
            <span className="text-base font-bold text-slate-200 font-mono mt-0.5">{accuracy}%</span>
          </div>
        </div>

        {/* Dynamic Interactive Interferometer Layout and Photon Loss indicator */}
        <div className="flex-1 bg-black/50 rounded-lg border border-slate-850 p-4 flex flex-col justify-between overflow-hidden" id="gbs-canvas-area">
          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-950 pb-1.5 mb-2 flex justify-between font-mono">
            <span>Interferometer Circuit Grid (Modes 1 to {totalModes})</span>
            <span>Active Loss Channel (Beam Splitters)</span>
          </div>

          {/* Graphical nodes */}
          <div className="flex-1 flex flex-col justify-center items-center gap-4 relative py-2" id="optical-nodes-grid">
            <div className="flex gap-4 sm:gap-7 items-center z-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center relative">
                  {/* Squeezed inputs */}
                  <span className="text-[8px] font-mono text-slate-500 mb-1">Mode {i+1}</span>
                  <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-[9px] font-bold text-slate-400 shadow-md">
                    S({i+1})
                  </div>
                </div>
              ))}
            </div>

            {/* Simulated beam splitters network and lost escaping photons */}
            <div className="h-10 w-full max-w-[450px] relative flex justify-around items-center" id="beamsplitter-layer">
              <svg className="absolute inset-0 w-full h-full stroke-slate-800 stroke-1 pointer-events-none">
                <path d="M 35,0 L 35,40 M 110,0 L 110,40 M 185,0 L 185,40 M 260,0 L 260,40 M 335,0 L 335,40 M 410,0 L 410,40" />
                <path d="M 35,20 L 410,20" strokeDasharray="3,3" />
              </svg>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-4 h-4 bg-purple-950/40 border border-purple-500/30 rounded rotate-45 flex items-center justify-center shadow-lg" title="Beam Splitter (50/50)">
                  <span className="text-[7px] font-mono text-purple-300 -rotate-45 font-bold">BS</span>
                </div>
              ))}
            </div>

            {/* Escaping photons environment */}
            <div className="flex gap-4 sm:gap-7 items-center z-10">
              {Array.from({ length: 6 }).map((_, i) => {
                // If lossRate is high, show escaping photons
                const showLoss = lossRate > 20 && i % 2 === 0;
                return (
                  <div key={i} className="flex flex-col items-center relative">
                    <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-[10px] font-bold text-cyan-400 relative">
                      Det
                      {showLoss && (
                        <span className="absolute -top-7 right-3 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      )}
                      {showLoss && (
                        <span className="absolute -top-7 right-3 w-2 h-2 rounded-full bg-rose-500" title="Photon Escaping / Loss detected" />
                      )}
                    </div>
                    <span className="text-[8px] font-mono text-slate-500 mt-1">Coinc.</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SVD Singular values bar spectrum showing decay */}
          <div className="border-t border-slate-950 pt-3.5" id="svd-spectrum-container">
            <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 uppercase tracking-tight mb-2">
              <span>SVD Singular Value Spectrum ({lossRate}% Loss Decay Profile)</span>
              <span className="text-cyan-400">Truncation Cutoff: D={bondDimension}</span>
            </div>
            <div className="flex items-end justify-between gap-1.5 h-16 bg-slate-950/70 p-2 rounded border border-slate-850" id="svd-bar-chart">
              {singularValues.map((val, index) => {
                const heightPercent = Math.max(3, val * 100);
                const isTruncated = index >= bondDimension;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    <div 
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        isTruncated 
                          ? "bg-slate-800/20" 
                          : "bg-gradient-to-t from-emerald-600 to-cyan-400 group-hover:from-emerald-500 group-hover:to-cyan-300"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[7px] font-mono text-slate-500 mt-1 select-none">λ{index+1}</span>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 bg-[#020617] border border-slate-800 rounded px-1.5 py-0.5 text-[8px] text-slate-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20 font-mono whitespace-nowrap">
                      Val: {val} {isTruncated ? "(TRUNCATED)" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
        
        <div className="mt-2 text-[10px] text-slate-500 font-mono flex justify-between items-center px-1">
          <span>* High photon loss collapses the multi-particle Fock space, allowing Matrix Product States compression.</span>
          <span className="text-cyan-400 font-bold">Bond Compression Factor: {actualRequiredBond > bondDimension ? Math.round((actualRequiredBond / bondDimension) * 10) / 10 : 1}x</span>
        </div>
      </div>

    </div>
  );
}

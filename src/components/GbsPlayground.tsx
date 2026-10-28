/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { 
  Zap, 
  Sliders, 
  Cpu, 
  Network, 
  Info, 
  TrendingUp, 
  SlidersHorizontal,
  RefreshCw,
  Gauge,
  Grid
} from "lucide-react";

export default function GbsPlayground() {
  const [lossRate, setLossRate] = useState<number>(75); // 0 to 95%
  const [modeDensity, setModeDensity] = useState<number>(12); // 8 to 20 modes for matrix rendering
  const [bondDimension, setBondDimension] = useState<number>(8); // 2 to 64 max D
  const [squeezing, setSqueezing] = useState<number>(1.2); // 0.2 to 2.0 squeezing parameter r
  const [simulationId, setSimulationId] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<{ i: number; j: number; val: number } | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Derive quantum vs classical stats based on mathematical GBS rules
  const totalModes = modeDensity;
  
  // Entanglement entropy decays exponentially as loss rate increases
  const entanglementEntropy = parseFloat(
    (3.2 * Math.exp(-lossRate / 35) * (squeezing / 1.0) * (modeDensity / 12)).toFixed(2)
  );

  // Speedup multiplier explodes as loss rate increases and bond dimension stays capped
  const rawSpeedup = Math.pow(1.8, (lossRate / 10)) * (64 / bondDimension) * (squeezing * 1.2);
  const classicalSpeedup = Math.round(rawSpeedup);

  // Required bond dimension
  const rawRequiredBond = Math.round(
    Math.pow(2, (modeDensity / 4)) * Math.exp(-lossRate / 22) * squeezing
  );
  const actualRequiredBond = Math.max(2, Math.min(rawRequiredBond, 512));

  // Accuracy of classical SVD simulation relative to noisy quantum state
  const accuracy = Math.round(
    Math.min(100, Math.max(45, 100 - (actualRequiredBond - bondDimension) * 0.8))
  );

  // Generate simulated singular values spectrum
  const [singularValues, setSingularValues] = useState<number[]>([]);

  useEffect(() => {
    const vals: number[] = [];
    const decayFactor = 0.1 + (lossRate / 100) * 0.55;
    for (let i = 0; i < 12; i++) {
      const v = Math.exp(-i * decayFactor) * (1 - (i * 0.02)) * (squeezing / 1.2);
      vals.push(Math.max(0.001, parseFloat(v.toFixed(3))));
    }
    setSingularValues(vals);
  }, [lossRate, bondDimension, squeezing, simulationId]);

  // Compute GBS probability matrix P(i, j) based on squeezing r, loss eta, and mode distance
  const matrixData = useRef<{ i: number; j: number; val: number }[]>([]);

  // D3 Heatmap Rendering Effect
  useEffect(() => {
    if (!svgRef.current) return;

    // Build N x N coincidence probability matrix data
    const N = modeDensity;
    const eta = (100 - lossRate) / 100; // transmission efficiency
    const data: { i: number; j: number; val: number }[] = [];

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        // Hafnian approximation kernel for Gaussian squeezed states with loss
        const dist = Math.abs(i - j);
        const coupling = Math.exp(-dist * 0.35);
        const squeezeTerm = Math.sinh(squeezing) * Math.cosh(squeezing);
        // Loss dampens off-diagonal phase coherence exponentially
        const coherence = dist === 0 ? 1.0 : Math.pow(eta, dist * 0.8);
        const rawP = squeezeTerm * coupling * coherence;
        // Normalize value between 0 and 1
        const val = parseFloat((Math.min(1.0, Math.max(0.001, rawP * (1 / (1 + dist * 0.2)))).toFixed(4)));
        data.push({ i, j, val });
      }
    }
    matrixData.current = data;

    // SVG Dimensions
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous renders

    const width = 440;
    const height = 300;
    const margin = { top: 25, right: 60, bottom: 30, left: 35 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleBand<number>()
      .domain(d3.range(N))
      .range([0, innerWidth])
      .padding(0.06);

    const yScale = d3
      .scaleBand<number>()
      .domain(d3.range(N))
      .range([0, innerHeight])
      .padding(0.06);

    // D3 Color Scale: Viridis / Cyber Cyan
    const colorScale = d3
      .scaleSequential<string>()
      .domain([0, 1])
      .interpolator(d3.interpolateTurbo);

    // Draw Heatmap Cells
    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.j) || 0)
      .attr("y", (d) => yScale(d.i) || 0)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("fill", (d) => colorScale(d.val))
      .attr("stroke", "#0f172a")
      .attr("stroke-width", 0.5)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .attr("stroke", "#38bdf8")
          .attr("stroke-width", 2);
        setSelectedCell(d);
      })
      .on("mouseout", function () {
        d3.select(this)
          .attr("stroke", "#0f172a")
          .attr("stroke-width", 0.5);
      });

    // Add X Axis (Modes)
    const xAxis = d3.axisBottom(xScale).tickFormat((d) => `M${Number(d) + 1}`);
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .style("fill", "#94a3b8")
      .style("font-size", "8px")
      .style("font-family", "monospace");

    // Add Y Axis (Modes)
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => `M${Number(d) + 1}`);
    g.append("g")
      .call(yAxis)
      .selectAll("text")
      .style("fill", "#94a3b8")
      .style("font-size", "8px")
      .style("font-family", "monospace");

    // Remove domain lines for clean look
    g.selectAll(".domain").attr("stroke", "#334155");
    g.selectAll(".tick line").attr("stroke", "#334155");

    // Add Colorbar Legend on the Right
    const legendWidth = 12;
    const legendHeight = innerHeight;
    const legendGroup = svg
      .append("g")
      .attr("transform", `translate(${width - margin.right + 15},${margin.top})`);

    const legendScale = d3.scaleLinear().domain([0, 1]).range([legendHeight, 0]);
    const legendAxis = d3.axisRight(legendScale).ticks(5).tickFormat(d3.format(".1f"));

    // Draw gradient bar
    const defs = svg.append("defs");
    const linearGradient = defs
      .append("linearGradient")
      .attr("id", "gbs-heatmap-legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");

    for (let i = 0; i <= 10; i++) {
      const p = i / 10;
      linearGradient
        .append("stop")
        .attr("offset", `${p * 100}%`)
        .attr("stop-color", colorScale(p));
    }

    legendGroup
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#gbs-heatmap-legend-gradient)")
      .attr("rx", 2);

    legendGroup
      .append("g")
      .attr("transform", `translate(${legendWidth},0)`)
      .call(legendAxis)
      .selectAll("text")
      .style("fill", "#64748b")
      .style("font-size", "7px")
      .style("font-family", "monospace");

    legendGroup.selectAll(".domain").attr("stroke", "#334155");
    legendGroup.selectAll(".tick line").attr("stroke", "#334155");

    // Title label inside SVG
    svg
      .append("text")
      .attr("x", margin.left)
      .attr("y", 15)
      .attr("fill", "#38bdf8")
      .style("font-size", "9px")
      .style("font-family", "monospace")
      .style("font-weight", "bold")
      .text(`D3 GBS Coincidence Matrix |P(n_i, n_j)|² (N = ${N} modes)`);

  }, [lossRate, modeDensity, squeezing, simulationId]);

  const triggerResetSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSimulationId((prev) => prev + 1);
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="gbs-playground-container">
      {/* Introduction Banner */}
      <div className="lg:col-span-12 bg-slate-900/40 border border-slate-800 p-4 rounded-xl text-xs leading-relaxed text-slate-300" id="gbs-header-banner">
        <div className="flex gap-2.5 items-start">
          <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-slate-200 text-xs mb-1 font-sans">
              Gaussian Boson Sampling (GBS) Quantum Supremacy & SVD Tensor Compression
            </h3>
            <p className="text-slate-400 font-sans">
              In GBS, squeezed vacuum photons enter an optical interferometer network. Calculating exact photon coincidence probability matrices P(n_i, n_j) = |Haf(A_S)|² / (Π n_i! * √|Ω|) requires calculating the <strong>Hafnian</strong> of sub-matrices—a #P-hard mathematical problem. However, in physical optical hardware, high <strong>Photon Loss Rates</strong> break multi-particle entanglement coherence, collapsing the state into a low-rank matrix that classical supercomputers spoof using <strong>Matrix Product States (MPS) & SVD Truncation</strong>!
            </p>
          </div>
        </div>
      </div>

      {/* Control Sliders Panel */}
      <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 p-5 flex flex-col justify-between shadow-[0_4px_24px_-3px_rgba(0,0,0,0.4)]" id="gbs-sliders-panel">
        <div className="space-y-5" id="gbs-sliders-flow">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-100 font-display tracking-tight">
              GBS Quantum Parameters
            </h2>
          </div>

          {/* 1. Squeezing Parameter r */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-400">Squeezing Parameter (r):</span>
              <span className="text-amber-400 font-bold">r = {squeezing.toFixed(1)}</span>
            </div>
            <input 
              type="range" 
              min="0.2" 
              max="2.0" 
              step="0.1"
              value={squeezing}
              onChange={(e) => setSqueezing(parseFloat(e.target.value))}
              className="w-full accent-amber-400 bg-slate-950 rounded-lg cursor-pointer h-1.5"
              id="squeezing-slider"
            />
            <p className="text-[10px] text-slate-500 font-mono leading-tight">
              Higher squeezing increases photon pair generation density & Hafnian complexity.
            </p>
          </div>

          {/* 2. Photon Loss Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-400">Photon Loss Rate (η):</span>
              <span className="text-cyan-400 font-bold">{lossRate}% Loss</span>
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
              Destroys off-diagonal phase coherence, speeding up SVD truncation exponentially.
            </p>
          </div>

          {/* 3. Quantum Modes */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-400">Interferometer Modes (N):</span>
              <span className="text-purple-400 font-bold">{modeDensity} Modes</span>
            </div>
            <input 
              type="range" 
              min="8" 
              max="20" 
              step="2"
              value={modeDensity}
              onChange={(e) => setModeDensity(parseInt(e.target.value))}
              className="w-full accent-purple-400 bg-slate-950 rounded-lg cursor-pointer h-1.5"
              id="mode-density-slider"
            />
            <p className="text-[10px] text-slate-500 font-mono leading-tight">
              Grid dimension N x N for the coincidence probability matrix.
            </p>
          </div>

          {/* 4. Max Bond Dimension */}
          <div className="space-y-1.5">
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
              Sets classical tensor truncation rank. High D increases exactness.
            </p>
          </div>
        </div>

        <button
          onClick={triggerResetSimulation}
          disabled={isSimulating}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 hover:border-slate-600 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all active:scale-95 mt-6 cursor-pointer shadow-[0_0_12px_rgba(34,211,238,0.05)]"
          id="reseed-gbs-btn"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSimulating ? "animate-spin" : ""}`} />
          {isSimulating ? "Recomputing Wavefunction..." : "Recalculate Probability Matrix"}
        </button>
      </div>

      {/* D3 Heatmap & Interactive Matrix Panel */}
      <div className="lg:col-span-8 bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 p-5 flex flex-col justify-between shadow-[0_4px_24px_-3px_rgba(0,0,0,0.4)]" id="gbs-visual-panel">
        {/* Statistics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4" id="gbs-stats-row">
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center flex flex-col justify-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Entanglement Entropy</span>
            <span className="text-sm font-bold text-cyan-400 font-mono mt-0.5">{entanglementEntropy} Nats</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center flex flex-col justify-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">D required for 100%</span>
            <span className="text-sm font-bold text-purple-400 font-mono mt-0.5">{actualRequiredBond}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center flex flex-col justify-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Classical Speedup</span>
            <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
              {classicalSpeedup.toLocaleString()}x
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center flex flex-col justify-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">SVD Sim Fidelity</span>
            <span className="text-sm font-bold text-amber-400 font-mono mt-0.5">{accuracy}%</span>
          </div>
        </div>

        {/* Interactive D3 SVG Heatmap Area */}
        <div className="flex-1 bg-black/60 rounded-lg border border-slate-800 p-3 flex flex-col justify-between relative min-h-[300px]">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-800/80 pb-2 mb-1">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <Grid className="h-3.5 w-3.5 text-cyan-400" />
              D3 Gaussian Boson Sampling Matrix
            </span>
            <span>
              {selectedCell ? (
                <span className="text-cyan-300 font-bold">
                  Mode({selectedCell.i + 1}, {selectedCell.j + 1}) Coincidence P = {selectedCell.val}
                </span>
              ) : (
                <span className="text-slate-500">Hover over matrix cells to inspect P(n_i, n_j)</span>
              )}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center relative w-full overflow-hidden">
            <svg ref={svgRef} className="w-full h-auto max-h-[290px] select-none" />
          </div>

          {/* SVD Spectrum bar chart footer */}
          <div className="border-t border-slate-800/80 pt-2.5 mt-2" id="svd-spectrum-container">
            <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 uppercase tracking-tight mb-1.5">
              <span>SVD Singular Value Spectrum ({lossRate}% Loss Decay)</span>
              <span className="text-cyan-400">Truncation Cutoff: D = {bondDimension}</span>
            </div>
            <div className="flex items-end justify-between gap-1 h-12 bg-slate-950 p-1.5 rounded border border-slate-850" id="svd-bar-chart">
              {singularValues.map((val, index) => {
                const heightPercent = Math.max(4, val * 100);
                const isTruncated = index >= bondDimension;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    <div 
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        isTruncated 
                          ? "bg-slate-800/30" 
                          : "bg-gradient-to-t from-emerald-600 to-cyan-400 group-hover:from-emerald-500 group-hover:to-cyan-300"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[7px] font-mono text-slate-500 mt-0.5 select-none">λ{index+1}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="mt-2 text-[10px] text-slate-500 font-mono flex justify-between items-center px-1">
          <span>* Squeezed vacuum states generate multi-mode entanglement rendered via D3 interpolator.</span>
          <span className="text-cyan-400 font-bold">Bond Compression Factor: {actualRequiredBond > bondDimension ? Math.round((actualRequiredBond / bondDimension) * 10) / 10 : 1}x</span>
        </div>
      </div>
    </div>
  );
}

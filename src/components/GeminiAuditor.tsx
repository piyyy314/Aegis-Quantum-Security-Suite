/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Sparkles, 
  Send, 
  Terminal, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw,
  HelpCircle,
  FileCode2,
  Lock
} from "lucide-react";
import { SbomComponent } from "../types";

interface GeminiAuditorProps {
  sbomContext: SbomComponent[];
}

export default function GeminiAuditor({ sbomContext }: GeminiAuditorProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const templates = [
    {
      title: "RSA-2048 Risks & Timelines",
      text: "Perform a complete Post-Quantum threat audit on legacy RSA-2048 keys. What is the specific risk of Store-Now-Decrypt-Later (SNDL) attacks and when is the official NIST/NSA timeline for deprecation?"
    },
    {
      title: "Kyber vs Dilithium Migration",
      text: "Draft a clear architectural plan to migrate our TLS handshake mechanism from ECDHE-RSA to CRYSTALS-Kyber (for KEM) and CRYSTALS-Dilithium (for signatures). Show a secure hybrid negotiation diagram representation."
    },
    {
      title: "Audit current C-SBOM context",
      text: "Examine our current Software Bill of Materials (C-SBOM). Identify the critical security holes, rank them by risk level, and detail concrete steps to patch each using post-quantum primitives."
    }
  ];

  const handleApplyTemplate = (text: string) => {
    setPrompt(text);
  };

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await fetch("/api/gemini/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          context: sbomContext
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to retrieve AI audit report.");
      }

      setResponse(data.text || "No report output from Gemini AI.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during client-server roundtrip.");
    } finally {
      setIsLoading(false);
    }
  };

  // Safe light markdown renderer using simple regex-based parser
  const renderMarkdown = (text: string) => {
    if (!text) return null;

    const lines = text.split("\n");
    let isInsideCodeBlock = false;
    let codeBlockContent: string[] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      // Code block start or end
      if (line.trim().startsWith("```")) {
        if (isInsideCodeBlock) {
          // close code block
          isInsideCodeBlock = false;
          elements.push(
            <pre key={`code-${idx}`} className="bg-slate-950 border border-slate-900 rounded-lg p-3.5 my-3 overflow-x-auto text-xs font-mono text-emerald-400 leading-normal selection:bg-slate-800">
              <code>{codeBlockContent.join("\n")}</code>
            </pre>
          );
          codeBlockContent = [];
        } else {
          // start code block
          isInsideCodeBlock = true;
        }
        return;
      }

      if (isInsideCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Headers
      if (line.startsWith("### ")) {
        elements.push(
          <h4 key={idx} className="text-sm font-bold font-sans text-white uppercase tracking-tight mt-4 mb-2 border-b border-slate-900 pb-1 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            {line.replace("### ", "")}
          </h4>
        );
        return;
      }
      if (line.startsWith("## ")) {
        elements.push(
          <h3 key={idx} className="text-base font-bold font-sans text-cyan-400 tracking-tight mt-5 mb-2.5 flex items-center gap-2">
            <Sparkles className="h-4 w-5 text-cyan-400" />
            {line.replace("## ", "")}
          </h3>
        );
        return;
      }
      if (line.startsWith("# ")) {
        elements.push(
          <h2 key={idx} className="text-lg font-bold font-sans text-white tracking-tight mt-6 mb-3">
            {line.replace("# ", "")}
          </h2>
        );
        return;
      }

      // Lists
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const cleanText = line.trim().replace(/^[-*]\s+/, "");
        elements.push(
          <li key={idx} className="ml-5 list-disc text-slate-300 text-xs leading-relaxed mb-1 font-sans">
            {parseInlineMarkdown(cleanText)}
          </li>
        );
        return;
      }

      // Default paragraph
      if (line.trim() === "") {
        elements.push(<div key={idx} className="h-2" />);
      } else {
        elements.push(
          <p key={idx} className="text-xs text-slate-300 leading-relaxed font-sans mb-2">
            {parseInlineMarkdown(line)}
          </p>
        );
      }
    });

    return <div className="space-y-1.5">{elements}</div>;
  };

  // Helper to parse bold, code spans inside a line
  const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    // Basic bold (**text**) and code (`code`) parser
    const parts: React.ReactNode[] = [];
    let currentText = text;
    let keyIdx = 0;

    while (currentText.length > 0) {
      const boldStart = currentText.indexOf("**");
      const codeStart = currentText.indexOf("`");

      // No markers left
      if (boldStart === -1 && codeStart === -1) {
        parts.push(<span key={keyIdx++}>{currentText}</span>);
        break;
      }

      // Handle bold first if it occurs earlier
      if (boldStart !== -1 && (codeStart === -1 || boldStart < codeStart)) {
        // Add text before bold
        if (boldStart > 0) {
          parts.push(<span key={keyIdx++}>{currentText.substring(0, boldStart)}</span>);
        }
        
        const boldEnd = currentText.indexOf("**", boldStart + 2);
        if (boldEnd !== -1) {
          const boldText = currentText.substring(boldStart + 2, boldEnd);
          parts.push(<strong key={keyIdx++} className="font-semibold text-white">{boldText}</strong>);
          currentText = currentText.substring(boldEnd + 2);
        } else {
          parts.push(<span key={keyIdx++}>**</span>);
          currentText = currentText.substring(boldStart + 2);
        }
      } else {
        // Handle code span
        if (codeStart > 0) {
          parts.push(<span key={keyIdx++}>{currentText.substring(0, codeStart)}</span>);
        }

        const codeEnd = currentText.indexOf("`", codeStart + 1);
        if (codeEnd !== -1) {
          const codeText = currentText.substring(codeStart + 1, codeEnd);
          parts.push(<code key={keyIdx++} className="bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-[11px] font-mono text-cyan-400">{codeText}</code>);
          currentText = currentText.substring(codeEnd + 1);
        } else {
          parts.push(<span key={keyIdx++}>`</span>);
          currentText = currentText.substring(codeStart + 1);
        }
      }
    }

    return parts;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="gemini-auditor-container">
      
      {/* 1. Prompt inputs & templates */}
      <div className="lg:col-span-5 bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 p-5 flex flex-col h-[520px] justify-between shadow-[0_4px_24px_-3px_rgba(0,0,0,0.4)]" id="auditor-input-panel">
        <div className="space-y-4" id="auditor-flows">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
            <h2 className="text-sm font-semibold text-slate-100 font-display tracking-tight">
              Aegis-AI Cryptographic Auditor
            </h2>
          </div>

          <p className="text-slate-400 text-xs font-sans leading-relaxed">
            Consult the AI Post-Quantum Cryptography analyst on quantum migration timelines, cipher suites vulnerabilities, code audits, or secure transition architectures.
          </p>

          {/* Quick templates */}
          <div className="space-y-2.5" id="templates-section">
            <span className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              Quick Audit Targets
            </span>
            <div className="flex flex-col gap-2" id="templates-list">
              {templates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl.text)}
                  className="w-full text-left bg-slate-900/20 hover:bg-slate-800/30 border border-slate-850 hover:border-slate-800 p-2.5 rounded-lg text-xs font-sans text-slate-300 hover:text-cyan-400 transition-all active:scale-[0.98] flex gap-2 items-start cursor-pointer"
                  id={`template-btn-${i}`}
                >
                  <HelpCircle className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{tpl.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input form */}
        <form onSubmit={handleRunAudit} className="space-y-3 mt-4" id="ai-auditor-form">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type custom security query or paste a code snippet here..."
            className="w-full bg-[#020617] border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-cyan-500/80 transition-colors resize-none h-[120px] font-sans leading-relaxed"
            id="prompt-textarea"
            required
          />

          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className={`w-full py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 hover:border-slate-600 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(34,211,238,0.05)]`}
            id="ai-submit-btn"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
                Analyzing Quantum Signatures...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Initiate Secure Cryptographic Audit
              </>
            )}
          </button>
        </form>
      </div>

      {/* 2. Response Screen */}
      <div className="lg:col-span-7 bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800 p-5 flex flex-col h-[520px] shadow-[0_4px_24px_-3px_rgba(0,0,0,0.4)]" id="auditor-output-panel">
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-850 pb-2 mb-3 flex justify-between font-mono">
          <span>AI Audit Response Buffer</span>
          <span>Security Level: LEVEL-5 CONFIDENTIAL</span>
        </div>

        <div className="flex-1 bg-black/50 rounded-lg border border-slate-850 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800" id="response-terminal">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-cyan-400 font-mono text-xs gap-3.5 py-16">
              <RefreshCw className="h-7 w-7 animate-spin text-cyan-400" />
              <div className="space-y-1">
                <p className="animate-pulse font-bold">PARSING ATTACK SURFACE VECTORS...</p>
                <p className="text-[10px] text-slate-500 font-sans">Retrieving NIST draft recommendations & compliance hashes</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-rose-400 font-mono text-xs gap-2.5 py-16">
              <AlertTriangle className="h-7 w-7 text-rose-500 animate-bounce" />
              <p className="font-bold">AUDIT INTERRUPTED</p>
              <p className="text-xs text-slate-400 max-w-sm font-sans leading-normal">{error}</p>
              <button
                type="button"
                onClick={handleRunAudit}
                className="mt-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 hover:border-slate-600 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry Request
              </button>
            </div>
          ) : response ? (
            <div className="text-slate-300 leading-relaxed select-text" id="ai-markdown-rendered">
              {renderMarkdown(response)}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center py-16">
              <Lock className="h-6 w-6 text-slate-800 mb-2" />
              <p className="text-xs font-mono max-w-xs leading-relaxed text-slate-500">
                Aegis-AI system idle. Submit an audit query to populate this response zone.
              </p>
              <p className="text-[10px] text-slate-700 mt-2 font-mono">Telemetry: SECURE_COMMS_TUNNEL_ACTIVE</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

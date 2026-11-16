import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Key,
  Server,
  Cpu,
  RefreshCw,
  CheckCircle,
  FileText,
  Building,
  EyeOff,
  Zap,
} from "lucide-react";

export const LandingSecurity: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const cryptoStages = [
    {
      title: "1. Client-Side Key Derivation",
      icon: Key,
      badge: "PBKDF2-HMAC-SHA256",
      desc: "Your master passphrase derives a 256-bit Key Encryption Key (KEK) directly in your browser. Raw secrets never leave your device.",
      terminal: "PBKDF2(passphrase, salt: 0x9f2a..., iterations: 100,000) => KEK: 256-bit AES-GCM",
      status: "Calculated in WebCrypto RAM",
      color: "border-indigo-500/50 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10",
    },
    {
      title: "2. Envelope Key Encapsulation",
      icon: Lock,
      badge: "AES-256-GCM",
      desc: "An ephemeral Data Encryption Key (DEK) is generated to wrap LLM provider tokens (Gemini, Claude, OpenAI) with 96-bit initialization vectors.",
      terminal: "DEK_cipher = AES_GCM_Encrypt(provider_key, IV, auth_tag: 0x44cd...) [Zero-Knowledge]",
      status: "Authenticated 128-bit Tag Verified",
      color: "border-cyan-500/50 text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10",
    },
    {
      title: "3. Zero-Plaintext Storage",
      icon: Server,
      badge: "PostgreSQL Ciphertext Only",
      desc: "Our Lakebase database only ever stores encrypted binary ciphertext. Without your client passphrase, decrypting database records is mathematically impossible.",
      terminal: "DB_RECORD: { byok_ciphertext: 'U2FsdGVkX1+9...', iv: '7a8b...', tag: '91ef...' }",
      status: "Plaintext Exposure: 0.00%",
      color: "border-purple-500/50 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10",
    },
    {
      title: "4. Ephemeral Enclave & Zeroing",
      icon: Cpu,
      badge: "Secure RAM Enclave",
      desc: "During DAG execution, secrets reside exclusively in isolated worker memory. Upon node completion, buffers are explicitly scrubbed and overwritten with zeroes.",
      terminal: "RAM_BUFFER.fill(0); crypto.getRandomValues(wipe_mask); // Complete memory sanitization",
      status: "Memory Zeroed in 2ms",
      color: "border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
    },
  ];

  const handleSimulateCycle = () => {
    setIsVerifying(true);
    let stage = 0;
    const timer = setInterval(() => {
      stage++;
      if (stage < cryptoStages.length) {
        setActiveStage(stage);
      } else {
        clearInterval(timer);
        setIsVerifying(false);
      }
    }, 700);
  };

  const securityFeatures = [
    {
      title: "SOC-2 Type II & Continuous Audit Logs",
      desc: "Every node invocation, user action, and approval decision generates an immutable, tamper-evident cryptographic log adhering to RFC 7807 standards.",
      icon: FileText,
      tag: "Auditability",
    },
    {
      title: "Zero Model Retraining Guarantee",
      desc: "NeuralDesk never stores, analyzes, or trains foundation models on your workflow prompts, intermediate reasoning states, or customer data.",
      icon: EyeOff,
      tag: "Data Privacy",
    },
    {
      title: "Dedicated VPC & Air-Gapped Deployments",
      desc: "Deploy the entire stack—frontend, Hono execution orchestrator, and PostgreSQL Lakebase—inside your AWS/GCP VPC or air-gapped Kubernetes cluster.",
      icon: Building,
      tag: "Enterprise Infrastructure",
    },
  ];

  return (
    <section id="security" className="relative py-24 md:py-32 bg-slate-50/50 dark:bg-charcoal-950/80 border-t border-slate-200 dark:border-slate-800/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Knowledge Security & Enclaves</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            Zero Plaintext.{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 dark:from-emerald-400 dark:via-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Client-Side Envelope Encryption.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Engineered for defense, regulated FinTech, and healthcare workloads. Your LLM keys and workflow payloads
            are mathematically locked before ever reaching network transport.
          </p>
        </div>

        {/* Interactive Cryptographic Pipeline Visualizer */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/90 shadow-xl dark:shadow-2xl p-6 sm:p-8 mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800/80 mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                  ENCRYPTION SPECIFICATION
                </span>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-600">•</span>
                <span className="text-xs font-mono text-slate-500">AES-256-GCM + PBKDF2</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Zero-Knowledge BYOK Pipeline
              </h3>
            </div>

            <button
              onClick={handleSimulateCycle}
              disabled={isVerifying}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold shadow-md transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin text-cyan-400" : ""}`} />
              <span>{isVerifying ? "Verifying Enclave..." : "Trace Encryption Flow"}</span>
            </button>
          </div>

          {/* 4 Interactive Cryptographic Stages */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {cryptoStages.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = activeStage === idx;
              return (
                <div
                  key={stage.title}
                  onClick={() => setActiveStage(idx)}
                  className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/20 shadow-md shadow-emerald-500/10 scale-[1.02]"
                      : "border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stage.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                      Step 0{idx + 1}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    {stage.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {stage.desc}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{stage.status}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time Enclave Inspection Console */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3 text-slate-400">
              <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>CRYPTOGRAPHIC ENCLAVE INSPECTOR // {cryptoStages[activeStage].badge}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                NONCE: 0x9f4b • STATUS: SECURE
              </span>
            </div>
            <div className="text-slate-300 text-xs leading-relaxed space-y-1">
              <div>
                <span className="text-cyan-400 font-semibold">&gt; OPERATION:</span>{" "}
                <span className="text-slate-200">{cryptoStages[activeStage].title}</span>
              </div>
              <div>
                <span className="text-emerald-400 font-semibold">&gt; EXECUTION:</span>{" "}
                <span className="text-emerald-300/90 font-mono">{cryptoStages[activeStage].terminal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillars of Security Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {securityFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-charcoal-950/80 shadow-md dark:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Production Hardened Standard</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

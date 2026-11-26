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
      status: "WebCrypto RAM",
    },
    {
      title: "2. Envelope Key Encapsulation",
      icon: Lock,
      badge: "AES-256-GCM",
      desc: "An ephemeral Data Encryption Key (DEK) is generated to wrap LLM provider tokens (Gemini, Claude, OpenAI) with 96-bit initialization vectors.",
      terminal: "DEK_cipher = AES_GCM_Encrypt(provider_key, IV, auth_tag: 0x44cd...) [Zero-Knowledge]",
      status: "128-bit Tag Verified",
    },
    {
      title: "3. Zero-Plaintext Storage",
      icon: Server,
      badge: "Ciphertext Only",
      desc: "Our Lakebase database only ever stores encrypted binary ciphertext. Without your client passphrase, decrypting database records is mathematically impossible.",
      terminal: "DB_RECORD: { byok_ciphertext: 'U2FsdGVkX1+9...', iv: '7a8b...', tag: '91ef...' }",
      status: "Plaintext Exposure: 0%",
    },
    {
      title: "4. Ephemeral Enclave & Zeroing",
      icon: Cpu,
      badge: "RAM Enclave",
      desc: "During DAG execution, secrets reside exclusively in isolated worker memory. Upon node completion, buffers are explicitly scrubbed and overwritten with zeroes.",
      terminal: "RAM_BUFFER.fill(0); crypto.getRandomValues(wipe_mask); // Complete memory sanitization",
      status: "Scrubbed in 2ms",
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
    }, 550);
  };

  const securityFeatures = [
    {
      title: "SOC-2 Type II audit logging",
      desc: "Every node invocation, user action, and approval decision generates an immutable, tamper-evident cryptographic log adhering to RFC 7807 standards.",
      icon: FileText,
      tag: "Auditability",
    },
    {
      title: "Zero model retraining guarantee",
      desc: "NeuralDesk never stores, analyzes, or trains foundation models on your workflow prompts, intermediate reasoning states, or customer data.",
      icon: EyeOff,
      tag: "Data Privacy",
    },
    {
      title: "Dedicated VPC & air-gapped deployments",
      desc: "Deploy the entire stack—frontend, Hono execution orchestrator, and PostgreSQL Lakebase—inside your AWS/GCP VPC or air-gapped Kubernetes cluster.",
      icon: Building,
      tag: "Enterprise Infrastructure",
    },
  ];

  return (
    <section id="security" className="py-20 md:py-28 bg-[#f5f7fa] dark:bg-[#0b0d14] border-b border-slate-200/70 dark:border-[rgba(238,240,245,0.06)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-mono text-slate-500 dark:text-[#7a8296] mb-2">
            Zero-Knowledge Security
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 dark:text-[#eef0f5] mb-3">
            Zero plaintext. Client-side envelope encryption.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-[#a3a9b8] leading-relaxed">
            Engineered for defense, regulated FinTech, and healthcare workloads. Your LLM keys and workflow payloads
            are mathematically locked before ever reaching network transport.
          </p>
        </div>

        {/* Interactive Cryptographic Pipeline Visualizer */}
        <div className="rounded-xl border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-white dark:bg-[#11141c] p-6 mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-[rgba(238,240,245,0.08)] mb-6 gap-3">
            <div>
              <div className="text-xs font-mono text-slate-500 dark:text-[#7a8296]">
                AES-256-GCM + PBKDF2 • Client RAM Enclave
              </div>
              <h3 className="text-base font-medium text-slate-900 dark:text-[#eef0f5] mt-0.5">
                Zero-knowledge BYOK cryptographic pipeline
              </h3>
            </div>

            <button
              onClick={handleSimulateCycle}
              disabled={isVerifying}
              className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#eef0f5] dark:hover:bg-white dark:text-[#0b0d14] text-xs font-mono inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
              <span>{isVerifying ? "Verifying..." : "Trace Flow"}</span>
            </button>
          </div>

          {/* 4 Interactive Cryptographic Stages */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            {cryptoStages.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = activeStage === idx;
              return (
                <button
                  key={stage.title}
                  onClick={() => setActiveStage(idx)}
                  className={`p-4 rounded-lg border text-left transition-colors cursor-pointer ${
                    isActive
                      ? "border-slate-900 bg-white dark:border-[#eef0f5] dark:bg-[#1a1e28]"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-[rgba(238,240,245,0.08)] dark:bg-[#11141c] dark:hover:border-[rgba(238,240,245,0.16)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded bg-slate-100 dark:bg-[#11141c] flex items-center justify-center text-slate-700 dark:text-[#a3a9b8]">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-[#7a8296]">
                      Step 0{idx + 1}
                    </span>
                  </div>

                  <h4 className="text-xs font-medium text-slate-900 dark:text-[#eef0f5] mb-1">
                    {stage.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-[#a3a9b8] leading-relaxed mb-3">
                    {stage.desc}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-[#4cc38a]">
                    <CheckCircle className="w-3 h-3" />
                    <span>{stage.status}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Enclave Inspection Console */}
          <div className="rounded-lg border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-slate-50 dark:bg-[#07080d] p-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[rgba(238,240,245,0.06)] mb-2 text-slate-500 dark:text-[#7a8296]">
              <span className="flex items-center gap-1.5 text-slate-800 dark:text-[#eef0f5] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>ENCLAVE // {cryptoStages[activeStage].badge}</span>
              </span>
              <span className="text-[11px]">STATUS: ENFORCED</span>
            </div>
            <div className="text-xs leading-relaxed space-y-1">
              <div>
                <span className="text-slate-500 dark:text-[#7a8296]">Operation:</span>{" "}
                <span className="text-slate-800 dark:text-[#eef0f5]">{cryptoStages[activeStage].title}</span>
              </div>
              <div className="truncate">
                <span className="text-emerald-600 dark:text-[#4cc38a]">Execution:</span>{" "}
                <span className="text-slate-700 dark:text-[#a3a9b8]">{cryptoStages[activeStage].terminal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillars of Security Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {securityFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-5 rounded-xl border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-white dark:bg-[#11141c] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1a1e28] flex items-center justify-center text-slate-700 dark:text-[#a3a9b8]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1a1e28] text-slate-600 dark:text-[#7a8296]">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-sm font-medium text-slate-900 dark:text-[#eef0f5] mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-[#a3a9b8] leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

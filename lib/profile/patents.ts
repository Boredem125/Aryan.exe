import type { Patent } from "@/types";

/* ============================================================
   PATENT VAULT — the deepest node in the puzzle.

   Titles for the 16 hardware-security filings are taken verbatim
   from the prior-art analysis in E:\Downloads\Patent\prior_art_checks.
   Metrics are only present where the figure already appears on a
   resume in resumes/ or in the revision log — nothing is estimated.

   Specification and claim text is deliberately NOT reproduced here.
   The site publishes titles, categories and headline results only.
   ============================================================ */

export const patents: Patent[] = [
  // ---- AI Security -----------------------------------------
  {
    id: "AI-01",
    category: "ai-security",
    title:
      "Hardware-Interposed Sampling-Firewall Apparatus for Physical Denial of Steganographic Covert-Channel Bandwidth in Large Language Model Token Output",
    metric: "82.1% mean covert-channel bandwidth reduction, scheme-agnostic",
  },
  {
    id: "AI-02",
    category: "ai-security",
    title:
      "Hardware-Timestamped Adversarial Challenge-Response System for Continuous Behavioral Integrity Verification and Physical Quarantine of Compromised Artificial Intelligence Agents",
    metric: "Physical disconnection within 4.33 ms of compromise detection",
  },
  {
    id: "AI-03",
    category: "ai-security",
    title:
      "Hardware Secure-Element Apparatus for Heartbeat-Authenticated Licensing Enforcement and Graduated Output-Gating of Deployed AI Inference Accelerators",
  },
  {
    id: "AI-04",
    category: "ai-security",
    title:
      "Decentralized Hardware-Signed Trust-Propagation and Physical Network-Interface Gating System for Byzantine-Resilient Autonomous Agent Swarms",
    metric:
      "Holds 73.8% composite accuracy at 30% colluding nodes where the software-only baseline collapses to 12.0% — a 6.16x advantage",
  },

  // ---- Digital Forensics -----------------------------------
  {
    id: "FOR-01",
    category: "forensics",
    title:
      "Hardware-Interposed Forensic Acquisition and Cross-Tenant Attribution System for Shared AI-Accelerator Memory",
    metric: "1.33x to 2.17x acquisition speedup over a driver-mediated baseline as tenant count rises",
  },
  {
    id: "FOR-02",
    category: "forensics",
    title:
      "Hardware Root-of-Trust Apparatus for Cryptographically Attested Binding of Machine-Learning Inference Outputs to Physically-Verified Weight-Memory Fingerprints",
  },
  {
    id: "FOR-03",
    category: "forensics",
    title:
      "Relay-Gated Evidence-Quarantine Apparatus with Fuse-Latched Write-Once Storage for Prompt-Injection-Resilient Forensic Evidence Ingestion",
    metric:
      "Post-hoc evidence alteration drops to effectively zero against 97.0% for a software-only baseline, at a cost of 10.32 ms",
  },
  {
    id: "FOR-04",
    category: "forensics",
    title:
      "Field-Programmable Forensic Co-Processor Appliance for Hardware-Attested Decomposition of Multi-Stage Generative Media Pipelines",
  },

  // ---- Malware Analysis ------------------------------------
  {
    id: "MAL-01",
    category: "malware",
    title:
      "Hardware Data-Diode Isolated Ingestion Apparatus for Prompt-Injection-Resilient Malware Analysis by Large Language Models",
    metric: "96.6% outbound-action containment against a 59.0% software-only baseline",
  },
  {
    id: "MAL-02",
    category: "malware",
    title:
      "Red/Blue LLM Agent Co-Evolution Certifying Malware Detection Rules with Side-Channel-Verified Mutation Equivalence and Hardware-Signed Certification",
  },
  {
    id: "MAL-03",
    category: "malware",
    title:
      "Physically Isolated Behavioral Detonation Apparatus for Hardware-Sensed Vetting and Drift-Gated Re-Validation of Agentic Tool Manifests",
  },
  {
    id: "MAL-04",
    category: "malware",
    title:
      "Hardware Weight-Memory Scanning Co-Processor and Relay-Gated Model Registry Apparatus for Detection, Extraction, and Interdiction of Steganographically Embedded Payloads in Neural Network Weights",
  },

  // ---- Web Application Security ----------------------------
  {
    id: "WEB-01",
    category: "web-app",
    title:
      "Hardware-Gated Semantic Micro-Challenge Apparatus for Physical-Layer Discrimination of Autonomous Language-Model-Driven Web Traffic",
  },
  {
    id: "WEB-02",
    category: "web-app",
    title:
      "Cryptographically Keyed Physical-Layer Timing Watermark Apparatus for Attribution and Tamper Detection in Web Content Delivery Networks",
  },
  {
    id: "WEB-03",
    category: "web-app",
    title:
      "Hardware Security Module-Gated Action-Graph Conformance System for Physical Interdiction of Hijacked Browser-Automation Agent Sessions",
    metric: "95.8% hijack detection accuracy at 5.35 ms gating latency — 8.8x faster than software",
  },
  {
    id: "WEB-04",
    category: "web-app",
    title:
      "Hardware-Traced Instruction-Pointer Correlation and Physical Circuit-Breaker System for Egress Containment of AI-Hallucinated Software Dependencies",
    metric: "96.2% detection accuracy with a 17.1x latency advantage",
  },

  // ---- Further filings -------------------------------------
  // TODO(aryan): titles for the remaining filings in this group are in
  // .docx files that could not be read this session. Add them here.
  {
    id: "OTH-01",
    category: "other",
    title:
      "Privacy-Safe SQL Query Framework with k-Anonymity, l-Diversity and Ed25519 Cryptographic Audit Trails for Secure Healthcare Data Access",
  },
  {
    id: "OTH-02",
    category: "other",
    title:
      "Carbon-Aware Cloud Scheduling System Optimizing Workload Placement Using Real-Time Carbon Intensity Data with SLA Compliance and Automated Failover",
  },
  {
    id: "OTH-03",
    category: "other",
    title:
      "Quantum-Inspired Adaptive Decision Routing (QIADR) Architecture Leveraging Superposition-Based Routing for Dynamic Neural Network Path Selection",
  },
];

export const patentCategories: {
  id: Patent["category"];
  label: string;
  blurb: string;
}[] = [
  {
    id: "ai-security",
    label: "AI Security",
    blurb:
      "Physical-layer controls on model behaviour — covert channels, agent integrity, licensing, swarm trust.",
  },
  {
    id: "forensics",
    label: "Digital Forensics",
    blurb:
      "Evidence acquisition and attestation that survives a compromised host.",
  },
  {
    id: "malware",
    label: "Malware Analysis",
    blurb:
      "Isolation apparatus for analysing hostile input with models that can be turned against you.",
  },
  {
    id: "web-app",
    label: "Web Application Security",
    blurb:
      "Discriminating and interdicting autonomous agent traffic at the physical layer.",
  },
  {
    id: "other",
    label: "Further Filings",
    blurb: "Privacy-preserving data access, carbon-aware scheduling, and routing architecture.",
  },
];

export const patentsByCategory = (cat: Patent["category"]) =>
  patents.filter((p) => p.category === cat);

/** Headline count used by the secret ending. */
export const patentCount = patents.length;

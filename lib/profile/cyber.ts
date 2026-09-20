import type { CyberDomain } from "@/types";

/* THE LAB — security work presented as an operating environment
   rather than a skills list. Each domain carries a terminal-log line
   that the CyberLab component prints before expanding the detail. */

export const cyberDomains: CyberDomain[] = [
  {
    id: "ai-sec",
    label: "AI Security",
    log: "loaded adversarial harness :: target=production LLM workflow",
    items: [
      "Identified and mitigated prompt injection and data-leakage risks in production LLM compliance workflows at UPL Limited.",
      "Designed output validation guardrails that prevented hallucinated values from corrupting CISO-level risk scores.",
      "Built agent authorization infrastructure separating capability from authority, with human-in-the-loop escalation for privileged calls.",
      "Research into physical-layer containment of model behaviour — covert channels, agent integrity verification, swarm trust propagation.",
    ],
  },
  {
    id: "soc",
    label: "SOC Operations",
    log: "attached to SIEM :: splunk // crowdstrike // cloudsek",
    items: [
      "Monitored and triaged security events in Splunk, analysing logs for IOCs and anomalous behaviour.",
      "Investigated endpoint threats through CrowdStrike Falcon.",
      "Tracked dark web exposure and data-leak signals via CloudSEK threat intelligence.",
      "Hardened Netskope DLP and CASB policies across cloud access, SaaS and endpoint channels.",
    ],
  },
  {
    id: "forensics",
    label: "Digital Forensics",
    log: "mounted evidence volume :: read-only :: hash verified",
    items: [
      "Built ARGUS — stylometry-based authorship attribution, deepfake detection and automated evidence correlation.",
      "Integrated OSINT collection with conventional disk forensics through Autopsy.",
      "Research into evidence acquisition and attestation that survives a compromised host.",
      "1st Place, CDAC/MeitY Cyber Forensics Hackathon — 70 teams.",
    ],
  },
  {
    id: "grc",
    label: "Governance, Risk & Compliance",
    log: "control framework loaded :: iso27001 // iso42001 // nist-csf",
    items: [
      "Co-authored a Third-Party Risk Management policy adopted by IS leadership at a Fortune 500.",
      "Ran end-to-end vendor evaluations: Statement of Applicability, ITGC/ITAC, SOC 2 review, MSA analysis.",
      "Applied the full risk lifecycle — identification, severity assessment, treatment, residual acceptance — across 40+ vendors.",
      "Conducted an enterprise-wide security risk assessment; recommendations adopted by the CISO team.",
    ],
  },
  {
    id: "appsec",
    label: "Application & Web Security",
    log: "scanning surface :: nmap // zap // nuclei",
    items: [
      "Penetration testing and vulnerability assessment across web application surfaces.",
      "Web application security and data privacy coursework at VIT.",
      "Research into physical-layer discrimination of autonomous agent web traffic.",
      "PII detection and redaction pipelines for privacy-heavy enterprise environments.",
    ],
  },
  {
    id: "behavioural",
    label: "Threat Detection",
    log: "isolation forest online :: window=sliding :: honeypot armed",
    items: [
      "Built PHANTOM TWIN — behavioural profiling across geo-location, device fingerprints and peak-hour patterns.",
      "Isolation Forest over a sliding-window heuristic engine targeting low-and-slow attack patterns.",
      "Honeypot routing for high-risk sessions rather than outright blocking.",
      "3rd Place, ThreatOps National Challenge at FINSEC'26, hosted by SentinelOne.",
    ],
  },
];

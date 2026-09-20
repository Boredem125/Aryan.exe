import type { Experience } from "@/types";

/* Note: the AI-Security, GRC and Amex resume variants scope the UPL
   internship as Jun 2026 – Jul 2026; the Honeywell and Mercedes variants
   say "Present". Using the bounded dates, which are the more recent and
   more specific of the two. */
export const experience: Experience[] = [
  {
    org: "UPL Limited",
    orgNote: "Fortune 500",
    role: "IS Governance Intern — GRC & AI Security",
    location: "Mumbai, India",
    start: "Jun 2026",
    end: "Jul 2026",
    highlights: [
      "Designed and deployed a live TPRM platform (42 parameters, 40+ vendors) with AI-assisted risk scoring aligned to ISO 27001, ISO 27701, ISO 42001 and NIST CSF; cut manual analyst effort by ~70% through Python/LLM automation across 12+ compliance processes.",
      "Identified and mitigated prompt injection and data-leakage risks in production LLM compliance workflows; designed output validation guardrails that stopped hallucination from corrupting CISO-level risk scores.",
      "Co-authored UPL's Third-Party Risk Management policy and secured IS leadership approval, formalising risk governance, assessment cadence and escalation procedures.",
      "Ran end-to-end vendor evaluations covering Statement of Applicability, physical controls, ITGC/ITAC assessment, SOC 2 report review and Master Service Agreement analysis; mapped identified risks to Business Continuity Plans.",
      "Conducted an enterprise-wide security risk assessment across UPL's technology infrastructure; produced risk treatment recommendations adopted by the CISO team.",
      "Monitored Splunk (SIEM) and triaged security events for IOCs; investigated endpoint threats via CrowdStrike Falcon (EDR); tracked dark web exposure through CloudSEK threat intelligence.",
      "Hardened Netskope DLP/CASB policies across cloud access, SaaS and endpoint channels; validated security requirements in Microsoft Azure native tooling (Azure Arc, Power Apps, Power Automate, SharePoint).",
    ],
    tags: ["GRC", "AI Security", "SOC", "TPRM", "Cloud Security"],
  },
  {
    org: "Headstarter AI",
    role: "Software Engineering Fellow",
    location: "Remote",
    start: "Jul 2024",
    end: "Sep 2024",
    highlights: [
      "Built and shipped five AI-powered projects across a 7-week accelerated fellowship, including an inventory management platform with third-party API integrations and authentication flows.",
      "Worked to weekly sprint deadlines under production-quality code review standards.",
    ],
    tags: ["AI", "Full-stack"],
  },
  {
    org: "Mad Over Growth Podcast",
    orgNote: "with Nitin Bajaj",
    role: "Podcast Outreach Intern",
    location: "Remote",
    start: "May 2025",
    end: "Jul 2025",
    highlights: [
      "Identified, contacted and secured high-profile guests (founders, CXOs) for podcast interviews.",
      "Managed guest schedules, confirmations and follow-ups end to end.",
      "Contributed to a channel with over 120M views.",
    ],
    tags: ["Outreach", "Communication"],
  },
  {
    org: "Body to Being Podcast",
    orgNote: "with Shlloka",
    role: "Podcast Outreach Intern",
    location: "Remote",
    start: "Dec 2025",
    end: "Present",
    highlights: [
      "Guest outreach and booking for founder and CXO interviews.",
      "Formal invitation writing across email, LinkedIn and WhatsApp.",
      "Interview scheduling and coordination.",
    ],
    tags: ["Outreach", "Communication"],
  },
  {
    org: "International Model United Nations Association",
    orgNote: "IMUNA",
    role: "International MUN Intern",
    location: "Guntur, Andhra Pradesh",
    start: "Jun 2023",
    end: "Aug 2023",
    highlights: [
      "Delivered speeches and moderated debates at international conferences.",
      "Researched global issues to produce briefing materials and conference messaging.",
      "Facilitated negotiation and conflict resolution between delegations.",
    ],
    tags: ["Public Speaking", "Research"],
  },
];

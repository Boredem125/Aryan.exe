import type { Education } from "@/types";

/* Note: the Outreach resume lists CGPA 9.1; every later variant lists 9.13.
   Taking the more recent and more precise figure. */
export const education: Education = {
  institution: "Vellore Institute of Technology",
  degree: "B.Tech",
  field: "Computer and Information Security",
  location: "Vellore, Tamil Nadu",
  cgpa: "9.13",
  start: "2023",
  end: "2027",
  coursework: [
    "Information Security",
    "Malware Analysis",
    "Penetration Testing & Vulnerability Analysis",
    "Digital Forensics",
    "Web Application Security",
    "Data Privacy & Protection",
    "Computer Networks",
    "Cloud Architecture & Design",
    "Software Engineering",
  ],
};

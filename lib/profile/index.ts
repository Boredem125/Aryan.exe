/* Single source of truth for everything the site knows.
   Consumed by /portfolio, lib/game/nodes.ts and lib/llm/prompt.ts. */

export { identity } from "./identity";
export { education } from "./education";
export { experience } from "./experience";
export { projects, featuredProjects, projectById } from "./projects";
export {
  patents,
  patentCategories,
  patentsByCategory,
  patentCount,
} from "./patents";
export { cyberDomains } from "./cyber";
export { achievements } from "./achievements";
export { leadership } from "./leadership";
export { skillGroups, allSkills } from "./skills";
export { certifications } from "./certifications";
export { contact } from "./contact";

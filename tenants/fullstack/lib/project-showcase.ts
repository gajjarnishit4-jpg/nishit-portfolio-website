import { projects } from "./projects";

// These captures show a parked domain or unrelated business, not the project.
export const pendingProjectCaptures = [projects[33], projects[48]];
export const showcaseProjects = projects.filter(
  (project) => !pendingProjectCaptures.includes(project),
);

// Each project belongs to one section; the portfolio contains the remainder.
export const heroProjects = [1, 8, 0, 12, 6, 2, 4].map(
  (index) => projects[index],
);
export const platformProjects = [10, 11, 13, 15, 19, 24].map(
  (index) => projects[index],
);
export const serviceProjects = [
  [9, 14, 16],
  [27, 28, 29],
  [18, 30, 32],
  [26, 36, 38],
  [3, 21, 25],
  [17, 20, 23],
].map((group) => group.map((index) => projects[index]));

const featured = new Set([
  ...heroProjects,
  ...platformProjects,
  ...serviceProjects.flat(),
]);
export const workProjects = showcaseProjects.filter(
  (project) => !featured.has(project),
);

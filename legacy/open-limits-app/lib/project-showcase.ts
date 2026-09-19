import { projects } from "./projects";

// These captures show a parked domain or unrelated business, not the project.
export const pendingProjectCaptures = [projects[34], projects[49]];
export const showcaseProjects = projects.filter(
  (project) => !pendingProjectCaptures.includes(project),
);

// Each project belongs to one section; the portfolio contains the remainder.
export const heroProjects = [1, 8, 0, 12, 6, 2, 4].map(
  (index) => projects[index],
);
export const platformProjects = [10, 11, 13, 15, 20, 25].map(
  (index) => projects[index],
);
export const serviceProjects = [
  [9, 14, 16],
  [28, 29, 30],
  [19, 31, 33],
  [27, 37, 39],
  [3, 22, 26],
  [18, 21, 24],
].map((group) => group.map((index) => projects[index]));

const featured = new Set([
  ...heroProjects,
  ...platformProjects,
  ...serviceProjects.flat(),
]);
export const workProjects = showcaseProjects.filter(
  (project) => !featured.has(project),
);

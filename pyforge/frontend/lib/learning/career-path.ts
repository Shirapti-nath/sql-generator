export interface CareerMilestone {
  id: string;
  title: string;
  description: string;
  skills: string[];
  xpRequired: number;
}

export const CAREER_MILESTONES: CareerMilestone[] = [
  {
    id: "explorer",
    title: "Python Explorer",
    description: "Run code, fix syntax errors, understand print and variables.",
    skills: ["print", "variables", "strings"],
    xpRequired: 0,
  },
  {
    id: "builder",
    title: "Logic Builder",
    description: "Comfortable with if/for, functions, and basic errors.",
    skills: ["conditionals", "loops", "functions"],
    xpRequired: 50,
  },
  {
    id: "data-hand",
    title: "Data Handler",
    description: "Load and explore data with Pandas.",
    skills: ["pandas", "csv", "eda"],
    xpRequired: 120,
  },
  {
    id: "viz",
    title: "Visualization Artist",
    description: "Create and save plots with Matplotlib.",
    skills: ["matplotlib", "plots"],
    xpRequired: 200,
  },
  {
    id: "ml-starter",
    title: "ML Starter",
    description: "Train/test splits and first sklearn models.",
    skills: ["sklearn", "train_test_split"],
    xpRequired: 300,
  },
  {
    id: "engineer",
    title: "ML Engineer Path",
    description: "Reproducible pipelines and quality habits.",
    skills: ["typing", "testing", "pipelines"],
    xpRequired: 450,
  },
];

export function currentMilestone(xp: number): CareerMilestone {
  let current = CAREER_MILESTONES[0];
  for (const m of CAREER_MILESTONES) {
    if (xp >= m.xpRequired) current = m;
  }
  return current;
}

export function nextMilestone(xp: number): CareerMilestone | null {
  return CAREER_MILESTONES.find((m) => m.xpRequired > xp) ?? null;
}

export function xpForRun(success: boolean, hadWarning: boolean): number {
  if (success) return hadWarning ? 8 : 12;
  return 3; // learning from failure
}

export function xpForDrill(): number {
  return 25;
}

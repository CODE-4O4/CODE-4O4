export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type MemberRole = "student" | "mentor" | "alumni";

export type FirestoreDateValue =
  | Date
  | string
  | number
  | { seconds: number; nanoseconds: number }
  | { _seconds: number; _nanoseconds: number }
  | { toDate: () => Date };

export type JoinRequestPayload = {
  displayName: string;
  email: string;
  phone: string;
  github?: string;
  portfolio?: string;
  interests: string[];
  experience: ExperienceLevel;
  goals: string;
  role: MemberRole;
  availability: string;
};

export type ActionResult = {
  ok: boolean;
  message: string;
  error?: string;
  // Optional user/profile returned by auth-related actions
  user?: ClubUser;
};

export type ClubUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: MemberRole | "admin";
  points: number;
  badges: number;
  phone?: string;
  github?: string;
  portfolio?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  experience?: ExperienceLevel;
  availability?: string;
  projectsCompleted?: number;
  createdAt?: FirestoreDateValue;
  updatedAt?: FirestoreDateValue;
};

export type FeatureCard = {
  title: string;
  description: string;
  highlight: string;
  icon: string;
};

export type ShowcaseProject = {
  id: string;
  title: string;
  description: string;
  status: "active" | "recruiting" | "waitlist" | "completed";
  members: number;
  tech: string[] | string;
  owner: string;
  ownerId?: string; // User ID of the project owner for permission checks
  summary?: string;
  githubUrl?: string;
  demoUrl?: string;
  docsUrl?: string;
  chatUrl?: string;
  latestUpdate?: string;
  createdAt?: FirestoreDateValue;
  updatedAt?: FirestoreDateValue;
};

export type ClubEvent = {
  id: string;
  title: string;
  summary: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  attendees: number;
  type: "workshop" | "hackathon" | "talk";
};

export type CalendarSession = {
  id: string;
  date: string;
  title: string;
  type: string;
  focus: string;
};

export type LeaderboardEntry = {
  id: string;
  rank: number;
  name: string;
  role: MemberRole | "admin";
  points: number;
  badges: number;
};

export type AdminRequest = {
  id: string;
  name: string;
  email: string;
  requestedAt: string;
  role: MemberRole;
  interests: string[];
  portfolio: string;
};

export type ProjectInterestRequest = {
  id: string;
  projectId: string;
  projectName: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
};

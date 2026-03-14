export type UserRole = "physician" | "cdi" | "coder" | "admin";

export type MockUser = {
  id: string;
  name: string;
  role: UserRole;
  email: string;
};

export const mockUsers: MockUser[] = [
  {
    id: "user_physician_1",
    name: "Dr. Avery Chen",
    role: "physician",
    email: "avery.chen@demo.medocai",
  },
  {
    id: "user_cdi_1",
    name: "Jordan Patel",
    role: "cdi",
    email: "jordan.patel@demo.medocai",
  },
  {
    id: "user_coder_1",
    name: "Riley Morgan",
    role: "coder",
    email: "riley.morgan@demo.medocai",
  },
  {
    id: "user_admin_1",
    name: "Casey Brooks",
    role: "admin",
    email: "casey.brooks@demo.medocai",
  },
];

export const roleLanding: Record<UserRole, string> = {
  physician: "/physician",
  cdi: "/cdi",
  coder: "/coder",
  admin: "/templates",
};

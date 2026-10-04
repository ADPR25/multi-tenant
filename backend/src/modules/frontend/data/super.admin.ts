export const SUPER_ADMIN_SIDEBAR = [
  {
    icon: "Settings",
    name: "Seguridad",
    children: [
      { icon: "User", name: "Usuarios", path: "/users" },
      { icon: "ShieldCheck", name: "Roles", path: "/roles" },
    ],
  },
  { icon: "Building2", name: "Empresas", path: "/companies" },
];

export const SUPER_ADMIN_ROUTES = [
  {
    path: "/users",
    name: "Usuarios",
    title: "Usuarios",
    componentPath: "@/views/iam/users/index.vue",
  },
  {
    path: "/roles",
    name: "Roles",
    title: "Roles",
    componentPath: "@/views/iam/roles/index.vue",
  },
  {
    path: "/companies",
    name: "Empresas",
    title: "Empresas",
    componentPath: "@/views/tenant/companies/index.vue",
  },
];

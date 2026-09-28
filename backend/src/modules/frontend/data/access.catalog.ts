export interface CatalogPermission {
  name: string;
  description: string;
}

export interface CatalogRoute {
  path: string;
  name: string;
  title: string;
  componentPath: string;
  icon?: string;
  permissions: string[];
}

export interface CatalogModule {
  name: string;
  icon: string;
  path?: string;
  children?: CatalogRoute[];
  permissions?: string[];
  componentPath?: string;
  title?: string;
}

export const ACCESS_CATALOG: CatalogModule[] = [
  {
    name: "IAM",
    icon: "Shield",
    children: [
      {
        path: "/users",
        name: "Usuarios",
        title: "Usuarios",
        componentPath: "@/views/iam/users/index.vue",
        icon: "Users",
        permissions: [
          "iam:users:create",
          "iam:users:read",
          "iam:users:update",
          "iam:users:delete",
        ],
      },
      {
        path: "/roles",
        name: "Roles",
        title: "Roles",
        componentPath: "@/views/iam/roles/index.vue",
        icon: "ShieldCheck",
        permissions: [
          "iam:roles:create",
          "iam:roles:read",
          "iam:roles:update",
          "iam:roles:delete",
        ],
      },
      {
        path: "/permissions",
        name: "Permisos",
        title: "Permisos",
        componentPath: "@/views/iam/permissions/index.vue",
        icon: "KeyRound",
        permissions: [
          "iam:permissions:create",
          "iam:permissions:read",
          "iam:permissions:update",
          "iam:permissions:delete",
        ],
      },
      {
        path: "/role-permissions",
        name: "Asignación",
        title: "Asignación de Permisos",
        componentPath: "@/views/iam/role-permissions/index.vue",
        icon: "ShieldPlus",
        permissions: [
          "iam:role-permissions:create",
          "iam:role-permissions:read",
          "iam:role-permissions:update",
          "iam:role-permissions:delete",
        ],
      },
    ],
  },
  {
    name: "Empresas",
    icon: "Building2",
    children: [
      {
        path: "/companies",
        name: "Empresas",
        title: "Todas las Empresas",
        componentPath: "@/views/tenant/companies/index.vue",
        icon: "Buildings",
        permissions: ["companies:create", "companies:read", "companies:update"],
      },
      {
        path: "/company/me",
        name: "Mi Empresa",
        title: "Mi Empresa",
        componentPath: "@/views/tenant/company/me.vue",
        icon: "Building",
        permissions: ["companies:read", "companies:update"],
      },
      {
        path: "/company-settings",
        name: "Configuración",
        title: "Configuración Empresa",
        componentPath: "@/views/tenant/company-settings/index.vue",
        icon: "Settings2",
        permissions: [
          "tenant:company-settings:create",
          "tenant:company-settings:read",
          "tenant:company-settings:update",
          "tenant:company-settings:delete",
        ],
      },
    ],
  },
  {
    name: "Inventario",
    icon: "Boxes",
    children: [
      {
        path: "/brands",
        name: "Marcas",
        title: "Marcas",
        componentPath: "@/views/inventory/brands/index.vue",
        icon: "Award",
        permissions: [
          "inventory:brands:create",
          "inventory:brands:read",
          "inventory:brands:update",
          "inventory:brands:state",
        ],
      },
      {
        path: "/categories",
        name: "Categorías",
        title: "Categorías",
        componentPath: "@/views/inventory/categories/index.vue",
        icon: "LayoutGrid",
        permissions: [
          "inventory:categories:create",
          "inventory:categories:read",
          "inventory:categories:update",
          "inventory:categories:state",
        ],
      },
      {
        path: "/warehouses",
        name: "Bodegas",
        title: "Bodegas",
        componentPath: "@/views/inventory/warehouses/index.vue",
        icon: "Warehouse",
        permissions: [
          "inventory:warehouse:create",
          "inventory:warehouse:read",
          "inventory:warehouse:update",
          "inventory:warehouse:state",
        ],
      },
      {
        path: "/uom",
        name: "Unidades",
        title: "Unidades de Medida",
        componentPath: "@/views/inventory/uom/index.vue",
        icon: "Ruler",
        permissions: [
          "inventory:uom:create",
          "inventory:uom:read",
          "inventory:uom:update",
        ],
      },
      {
        path: "/products",
        name: "Productos",
        title: "Productos",
        componentPath: "@/views/inventory/products/index.vue",
        icon: "Package",
        permissions: [
          "inventory:product:create",
          "inventory:product:read",
          "inventory:product:update",
          "inventory:product:state",
        ],
      },
    ],
  },
];

export const DEFAULT_SIDEBAR = ACCESS_CATALOG.map((m) => ({
  name: m.name,
  title: m.name,
  icon: m.icon,
  path: m.path,
  permissions: m.permissions,
  children: m.children?.map((c) => ({
    name: c.name,
    title: c.title,
    path: c.path,
    icon: c.icon,
    permissions: c.permissions,
  })),
}));

export const DEFAULT_ROUTES = ACCESS_CATALOG.flatMap((m) =>
  m.children
    ? m.children.map((c) => ({
        path: c.path,
        name: c.name.replace(/\s/g, ""),
        title: c.title,
        componentPath: c.componentPath,
      }))
    : [
        {
          path: m.path!,
          name: m.name.replace(/\s/g, ""),
          title: m.title || m.name,
          componentPath: m.componentPath!,
        },
      ],
);

export const ALL_PERMISSIONS_LIST = [
  ...new Map(
    ACCESS_CATALOG.flatMap((m) => {
      const routes = m.children || [m as any];
      return routes.flatMap((r: any) =>
        (r.permissions || []).map((name: string) => [
          name,
          { name, description: `${name} - ${r.title || r.name}` },
        ]),
      );
    }),
  ).values(),
];

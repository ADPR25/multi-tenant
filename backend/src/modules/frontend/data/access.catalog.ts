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
    name: "Seguridad",
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
          "iam:users:state",
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
          "iam:roles:assignment",
          "iam:roles:state",
        ],
      },
    ],
  },
  {
    name: "Terceros",
    icon: "Handshake",
    children: [
      {
        path: "/third-parties",
        name: "Terceros",
        title: "Terceros",
        componentPath: "@/views/third-parties/index.vue",
        icon: "UsersRound",
        permissions: [
          "third-parties:create",
          "third-parties:read",
          "third-parties:update",
          "third-parties:state",
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
          "inventory:uom:state",
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
      {
        path: "/stocks",
        name: "Stock",
        title: "Stock Actual",
        componentPath: "@/views/inventory/stocks/index.vue",
        icon: "Boxes",
        permissions: ["inventory:stocks:read"],
      },
      {
        path: "/stock-movements",
        name: "Movimientos",
        title: "Movimientos de Stock",
        componentPath: "@/views/inventory/stock-movements/index.vue",
        icon: "ArrowLeftRight",
        permissions: ["inventory:movements:create", "inventory:movements:read"],
      },
    ],
  },
  {
    name: "Proyectos",
    icon: "FolderKanban",
    children: [
      {
        path: "/projects",
        name: "Proyectos",
        title: "Proyectos",
        componentPath: "@/views/projects/index.vue",
        icon: "Briefcase",
        permissions: [
          "projects:create",
          "projects:read",
          "projects:update",
          "projects:state",
          "projects:delete",
        ],
      },
      {
        path: "/survey",
        name: "Encuestas",
        title: "Encuestas",
        componentPath: "@/views/surveys/survey/index.vue",
        icon: "ClipboardList",
        permissions: [
          "survey:create",
          "survey:read",
          "survey:update",
          "survey:state",
          "survey:delete",
        ],
      },
    ],
  },
  {
    name: "Contratación",
    icon: "FileSignature",
    children: [
      {
        path: "/contracts",
        name: "Contratos",
        title: "Contratos",
        componentPath: "@/views/hiring/contracts/index.vue",
        icon: "FileText",
        permissions: [
          "hiring:contract:create",
          "hiring:contract:read",
          "hiring:contract:update",
          "hiring:contract:state",
          "hiring:contract:delete",
        ],
      },
    ],
  },
  {
    name: "Documental",
    icon: "FolderArchive",
    children: [
      {
        path: "/documents/categories",
        name: "Categorías Doc",
        title: "Categorías Documentales",
        componentPath: "@/views/documents/categories/index.vue",
        icon: "LayoutGrid",
        permissions: [
          "documents:categories:create",
          "documents:categories:read",
          "documents:categories:update",
          "documents:categories:state",
        ],
      },
      {
        path: "/documents/types",
        name: "Tipos",
        title: "Tipos de Documento",
        componentPath: "@/views/documents/types/index.vue",
        icon: "FileType",
        permissions: [
          "documents:types:create",
          "documents:types:read",
          "documents:types:update",
          "documents:types:state",
        ],
      },
      {
        path: "/folders",
        name: "Carpetas",
        title: "Carpetas",
        componentPath: "@/views/documents/folders/index.vue",
        icon: "Folder",
        permissions: [
          "documents:folders:create",
          "documents:folders:read",
          "documents:folders:update",
          "documents:folders:state",
        ],
      },
      {
        path: "/documents/docs",
        name: "Documentos",
        title: "Gestión Documental",
        componentPath: "@/views/documents/docs/index.vue",
        icon: "Files",
        permissions: [
          "documents:docs:create",
          "documents:docs:read",
          "documents:docs:update",
          "documents:docs:state",
          "documents:docs:delete",
          "documents:docs:restore",
        ],
      },
      {
        path: "/documents/drive",
        name: "Drive",
        title: "Mi Drive Empresarial",
        componentPath: "@/views/documents/drive/index.vue",
        icon: "HardDrive",
        permissions: ["documents:drive:revisor"],
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
          path: m.path,
          name: m.name.replace(/\s/g, ""),
          title: m.title || m.name,
          componentPath: m.componentPath,
        },
      ],
);

export const ALL_PERMISSIONS_LIST: CatalogPermission[] = [
  ...new Map<string, CatalogPermission>(
    ACCESS_CATALOG.flatMap((m) => {
      const routes: CatalogRoute[] = m.children
        ? m.children
        : m.path
          ? [
              {
                path: m.path,
                name: m.name,
                title: m.title || m.name,
                componentPath: m.componentPath || "",
                permissions: m.permissions || [],
              },
            ]
          : [];

      return routes.flatMap((r) =>
        (r.permissions || []).map((name): [string, CatalogPermission] => [
          name,
          { name, description: `${name} - ${r.title || r.name}` },
        ]),
      );
    }),
  ).values(),
];

# nombre Name

- productos products
- categorias categories
- marcas brands
- unidades uom
- bodegas warehouses

# datos para entidad:

    categorias/categories
        name            (nombre, string, unico por empresa)
        description     (descripcion, string, opcional)
        isActive        (activo, boolean)

    marcas/brands
        name            (nombre, string, unico por empresa)
        isActive        (activo, boolean)

    unidades/uom
        name            (nombre, string) Ej: Unidad, Kilogramo
        shortName       (codigo corto, string, unico) Ej: UND, KG
        isActive        (activo, boolean)

    bodegas/warehouses
        name            (nombre, string)
        code            (codigo, string, unico por empresa) Ej: BOD-01
        address         (direccion, string, opcional)
        isActive        (activo, boolean)

    productos/products
        sku             (codigo, string, unico por empresa)
        name            (nombre, string)
        description     (descripcion, string, opcional)
        categoryId      (categoria, uuid, opcional)
        brandId         (marca, uuid, opcional)
        uomId           (unidad, uuid, obligatorio)
        warehouseId     (bodega principal, uuid, opcional)
        cost            (costo, decimal)
        price           (precio venta, decimal)
        minStock        (stock minimo, decimal)
        isActive        (activo, boolean)

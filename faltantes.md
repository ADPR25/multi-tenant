# DOCUMENTOS - Listo
- [x] Documentos, carpetas, categorías y tipos
- [x] Papelera: borrado lógico, restauración durante 30 días y purga diaria posterior, incluyendo el archivo almacenado

# DOCUMENTOS - Pendiente para vendible
- [ ] Versiones: historial por archivo con usuario y fecha
- [ ] Tags y metadata: etiquetas y campos personalizados por tipo
- [ ] Aprobaciones y workflows: borrador, revisión, aprobado y rechazado
- [ ] Compartir: enlaces públicos con expiración y contraseña
- [ ] Logs de acceso: vistas, descargas e impresiones
- [ ] Plantillas para generar documentos

# INVENTARIO - Listo
- [x] Productos, categorías, marcas, unidades, bodegas, stock y movimientos
- [x] Traslados entre bodegas desde la interfaz; el backend descuenta y acredita stock de forma atómica

# INVENTARIO - Pendiente para vendible
- [ ] Proveedores
- [ ] Órdenes de compra
- [ ] Ajustes de stock y conteos físicos
- [ ] Lotes y vencimientos
- [ ] Series e IMEIs
- [ ] Kardex y costeo promedio/FIFO/valorizado
- [ ] Reservas de stock para pedidos

# CONTRATACIÓN
- La fase v1 (terceros, tipos y contratos) se registra en [contratacion.md](contratacion.md).
- Documentos de contrato, otrosíes, hitos de pago y alertas siguen pendientes como fase premium.

# Validación
- Backend: ejecutar desde `backend`: `npx eslint src --ext ts --cache`
- Frontend: `pnpm run type-check` desde `frontend`
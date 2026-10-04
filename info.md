# DOCUMENTS - Listo:
* docs, folders, categories, types

# DOCUMENTS - falta para vendible:
* versions -> historial de cada archivo (v1, v2, v3) con quien lo subió
* tags / metadata -> etiquetas y campos personalizados por tipo (ej: para "contrato" pedir fecha inicio/fin)* approvals / workflows -> borrador -> en revisión -> aprobado / rechazado
* sharing / links -> link público con expiración y contraseña
* access_logs -> quien vio, descargó, imprimió cada doc (obligatorio para auditoría)
* trash -> papelera con restore de 30 días (ya tienes deletedAt pero sin endpoint de restore)
* templates -> plantillas para generar docs

# INVENTORY - Listo:
* products, categories, brands, uom, warehouses, stocks, stock-movements

# INVENTORY - falta para vendible:
* suppliers / vendors -> proveedores
* purchase_orders -> órdenes de compra a proveedores
* stock_transfers -> traslado entre bodegas (hoy solo tienes movements sueltos)
* stock_adjustments / inventory_counts -> conteo físico y ajuste por pérdida
* lots / batches + expirations -> lotes y vencimientos (clave si vendes a droguerías)
* serials -> series / IMEIs
* kardex / costing -> costo promedio, FIFO, valorizado - hoy tu stock-movements no calcula costo
* reservations -> reserva de stock para pedidos



# verificar siempre con:
npx eslint src --ext ts --cache
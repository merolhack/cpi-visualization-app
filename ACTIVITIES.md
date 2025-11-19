# Análisis de Completitud del Sistema IRPC

## ✅ Componentes Completados

### 1. Infraestructura Base
- ✅ Base de datos en Supabase con esquema completo
- ✅ Integración Next.js + Supabase
- ✅ Sistema de autenticación (login/registro)
- ✅ Edge Function para validación y optimización de imágenes
- ✅ Despliegue configurado (Vercel)

### 2. Frontend Público
- ✅ Página principal con visualización de datos
- ✅ Selector de país
- ✅ Gráfica de evolución de inflación (últimos 36 meses)
- ✅ Gráfica de comparación de precios por comercio
- ✅ Navbar con navegación según estado de autenticación

### 3. Panel del Voluntario (Parcial)
- ✅ Login y registro
- ✅ Recuperación de contraseña
- ✅ Formulario para agregar productos con foto
- ✅ Protección de rutas autenticadas

### 4. Backend/Crons (Implementados)
- ✅ Función RPC para registro de voluntarios
- ✅ Función RPC para agregar productos y precios
- ✅ Cron para cálculo de inflación de producto (configurado)
- ✅ Cron para cálculo de IRPC (configurado)

---

## ❌ Funcionalidades Faltantes

### 1. Página Principal (Incompleto)

**Falta:**
- ❌ Carrusel de productos con cambios importantes de precio (debajo de la gráfica principal)
  - Mostrar foto del producto
  - Precio anterior → Precio actual
  - Porcentaje de cambio anual
  - Fechas de las mediciones
- ❌ Número de WhatsApp visible (+525544332211)
- ❌ Estadísticas del sistema ("Contamos con X fotos de Y productos...")
- ❌ Sección de países disponibles con enlaces
- ❌ Enlaces a redes sociales (Instagram, X/Twitter)
- ❌ Enlace a "Metodología usada"
- ❌ Opciones "Ayuda siendo voluntario" y "Dona dinero"
- ❌ Buscador "Ver historial de precios de [producto]"

### 2. Página de Estadística de Producto

**Completamente faltante:**
- ❌ Ruta `/producto/[id]` o similar
- ❌ Mostrar nombre del producto y país
- ❌ Índice real de precios del producto específico
- ❌ Gráfica con múltiples líneas (una por combinación comercio/lugar)
- ❌ Botón "Descargar datos" con acceso a API
- ❌ Carrusel de evidencias fotográficas
- ❌ Listado de productos activos con más de 1 línea de precios

### 3. Panel del Voluntario (Muy Incompleto)

**Falta:**
- ❌ Página principal del panel mostrando:
  - Saldo de puntos actual
  - Lista de productos que necesitan actualización (>30 días)
  - Botones de acción (Agregar productos, Retirar puntos)
- ❌ Página "Actualizar precio" con:
  - Foto del producto
  - Historial de últimos 5 precios
  - Formulario para nuevo precio con foto
  - Opción "Ya no quiero dar seguimiento"
- ❌ Página "Agregar productos" con:
  - Filtros por país/lugar/comercio
  - Lista de productos por rama/categoría
  - Evitar productos actualizados en últimos 2 meses
  - Sistema de puntos por actualización
- ❌ Página "Retirar puntos" con:
  - Formulario de retiro a dirección Polygon
  - Historial de retiros
  - Últimos 100 movimientos de finanzas
- ❌ Sistema de puntos automático al agregar precios

### 4. Panel del Webmaster (Completamente Faltante)

**Todo falta:**
- ❌ Página principal con menú de opciones
- ❌ Gestión de voluntarios:
  - Alta de nuevos voluntarios
  - Editar voluntarios (nombre, whatsapp, país, suspender)
  - Gestionar retiros de puntos
- ❌ Gestión de productos:
  - Alta de productos
  - Editar productos (nombre, categoría, foto, comercios, activar/desactivar)
- ❌ Gestión de categorías:
  - Alta de categorías con rama asociada
- ❌ Gestión de comercios:
  - Alta de comercios
  - Editar comercios (nombre, categorías que vende)
- ❌ Administrar criterios de cálculo:
  - Agregar criterios (nombre, descripción, importancia, ponderación)
  - Editar criterios existentes

### 5. Funciones RPC Faltantes

**SQL/Supabase:**
- ❌ Función para obtener productos que necesitan actualización por voluntario
- ❌ Función para obtener saldo de puntos de voluntario
- ❌ Función para procesar retiros de puntos
- ❌ Función para obtener historial de productos con cambios importantes
- ❌ Función para obtener estadísticas del sistema
- ❌ Función para obtener datos de producto individual con múltiples líneas

### 6. Crons Faltantes

**Procesos automáticos:**
- ❌ Cron "Calcula inflación categoría y lugar" (cada 15 minutos)
- ❌ Cron "Calcula inflación categoría" (con ponderación por población)
- ❌ Cron para enviar emails diarios a voluntarios con productos pendientes
- ❌ Validación automática de precios (cambiar `valido` a false si no es lógico)

### 7. Sistema de Correos Electrónicos

**Completamente faltante:**
- ❌ Integración con servicio de email (Resend, SendGrid, etc.)
- ❌ Email de bienvenida a nuevos voluntarios
- ❌ Email diario de recordatorio (productos pendientes)
- ❌ Email de confirmación de retiro procesado
- ❌ Email de recuperación de contraseña mejorado

### 8. Políticas RLS Faltantes

**Seguridad:**
- ❌ Políticas para tabla `cpi_tracking` (seguimiento de productos)
- ❌ Políticas para tabla `cpi_withdrawals` (retiros)
- ❌ Políticas específicas para webmaster vs voluntario
- ❌ Políticas de actualización en tablas de inflación

### 9. Integraciones Externas

**Faltantes:**
- ❌ Integración con WhatsApp Business API (recibir fotos de precios)
- ❌ Sistema de tokens IRPC en red Polygon (blockchain)
- ❌ Envío automático de tokens a direcciones de retiro
- ❌ Integración con redes sociales (compartir datos)

### 10. Características de UX/UI

**Mejoras necesarias:**
- ❌ Sistema de búsqueda de productos
- ❌ Filtros avanzados en gráficas
- ❌ Exportación de datos (CSV, JSON)
- ❌ Modo oscuro
- ❌ Internacionalización (i18n) para múltiples países
- ❌ Responsive design optimizado para móviles
- ❌ PWA (Progressive Web App) para instalación
- ❌ Notificaciones push

---

## 📊 Resumen Cuantitativo

### Completitud General: ~25%

| Módulo | Completitud | Prioridad |
|--------|-------------|-----------|
| Infraestructura | 90% | Alta |
| Página Principal | 40% | Alta |
| Página de Producto | 0% | Media |
| Panel Voluntario | 20% | Alta |
| Panel Webmaster | 0% | Alta |
| Crons de Cálculo | 30% | Alta |
| Sistema de Emails | 0% | Media |
| Integraciones | 0% | Baja |

---

## 🎯 Prioridades Recomendadas

### Fase 1 (Crítico - MVP funcional)
1. Completar Panel del Voluntario (actualizar precios, ver puntos)
2. Sistema de puntos automático
3. Carrusel de productos en página principal
4. Cron de cálculo de inflación categoría/lugar

### Fase 2 (Importante - Operación básica)
5. Panel del Webmaster básico (gestión de voluntarios y productos)
6. Página de estadística de producto individual
7. Sistema de emails básico (bienvenida, recordatorios)
8. Gestión de retiros de puntos

### Fase 3 (Deseable - Mejoras)
9. Integración con WhatsApp
10. Sistema de tokens blockchain
11. Mejoras de UX/UI
12. Exportación de datos

¿Quieres que priorice el desarrollo de algún módulo específico o necesitas un plan de implementación detallado?

# Páginas para Metodología, Ayuda y Buscador de Productos

## 1. Página de Metodología## 2. Página de Ayuda/Voluntarios## 3. Componente Buscador de Productos## 4. Actualizar la página principal para incluir estos componentes## 5. Crear página placeholder para producto individual## Resumen de lo implementado

He creado las siguientes páginas y componentes:

### ✅ **1. Página de Metodología** (`/metodologia`)
- Explicación detallada de qué es el IRPC
- Proceso de recopilación de datos
- Fórmulas matemáticas del cálculo
- Criterios de evaluación
- Transparencia y validación
- Limitaciones del sistema

### ✅ **2. Página de Ayuda** (`/ayuda`)
- Sección "Conviértete en Voluntario"
- Requisitos y beneficios
- Botones de registro y WhatsApp
- Sección de donaciones con direcciones crypto
- Otras formas de contribuir
- Preguntas frecuentes

### ✅ **3. Componente Buscador** (`ProductSearch.tsx`)
- Búsqueda en tiempo real con debounce
- Muestra resultados mientras escribes
- Navegación a página de producto
- Autocompletado inteligente

### ✅ **4. Página Principal Actualizada**
- Integra el buscador de productos
- Enlaces a metodología y ayuda
- Número de WhatsApp visible
- Estadísticas del sistema
- Enlaces a países disponibles
- Enlaces a redes sociales

### ✅ **5. Página de Detalle de Producto** (`/producto/[id]`)
- Información del producto con foto
- Estadísticas (precio promedio, total registros)
- Tabla de historial de precios
- Placeholder para gráfica futura
- Galería de evidencias fotográficas
- Botón de descarga de datos (placeholder)

## Pasos para implementar:

1. **Crear los archivos en tu proyecto:**
   - `src/app/metodologia/page.tsx`
   - `src/app/ayuda/page.tsx`
   - `src/app/_components/ProductSearch.tsx`
   - `src/app/producto/[id]/page.tsx`
   - Reemplazar `src/app/page.tsx`

2. **Políticas RLS necesarias** (ejecutar en SQL Editor):

```sql
-- Permitir lectura pública de productos para el buscador
CREATE POLICY "Allow public read on products for search"
ON public.cpi_products FOR SELECT
TO anon, authenticated
USING (is_active_product = true);
```

3. **Verificar que funcione:**
   - Visita `/metodologia`
   - Visita `/ayuda`
   - Usa el buscador en la página principal
   - Haz clic en un producto para ver su detalle

Voy a actualizar los enlaces y crear el Panel del Voluntario completo.

## 1. Actualizar enlaces en las páginas existentes## 2. Crear funciones RPC necesarias para el Panel del Voluntario## 3. Crear página principal del Panel del VoluntarioDebido al límite de tokens, te proporcionaré un resumen de los archivos restantes que necesitas crear:

## Archivos adicionales necesarios:

### 4. **Página Actualizar Precio** - `src/app/panel/actualizar/[trackingId]/page.tsx`
- Muestra foto del producto
- Últimos 5 precios
- Formulario para nuevo precio con foto
- Botón "Ya no quiero dar seguimiento"

### 5. **Página Agregar Productos** - `src/app/panel/agregar-productos/page.tsx`
- Filtros por país/lugar/comercio
- Lista de productos por rama/categoría
- Checkboxes para seleccionar productos
- Excluye productos actualizados recientemente

### 6. **Página Retiros** - `src/app/panel/retiros/page.tsx`
- Muestra saldo actual
- Formulario de retiro (cantidad + dirección Polygon)
- Historial de últimos 10 retiros
- Últimos 100 movimientos de finanzas

### 7. **Página Historial** - `src/app/panel/historial/page.tsx`
- Tabla con últimos 100 movimientos
- Filtros por fecha
- Exportar a CSV

## Políticas RLS adicionales necesarias:

```sql
-- Para cpi_tracking
CREATE POLICY "Users can read their own tracking"
ON public.cpi_tracking FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracking"
ON public.cpi_tracking FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracking"
ON public.cpi_tracking FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
```

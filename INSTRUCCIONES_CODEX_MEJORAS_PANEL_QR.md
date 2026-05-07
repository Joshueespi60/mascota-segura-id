# INSTRUCCIONES PARA CODEX: MEJORAS DEL PANEL QR, ELIMINAR QR Y FLUJO QR → INICIO → REGISTRO

Proyecto: **MascotaSegura ID**  
Stack: **Vite + React + Supabase + Vercel**  
Fecha: 2026-05-06

## Objetivo general

Mejorar el sistema actual de QR únicos ya implementado para que:

1. El panel admin de QR no muestre una lista interminable de códigos en una sola vista.
2. Exista paginación o navegación por páginas cuando haya muchos QR.
3. Exista botón para eliminar QR y que se elimine realmente de Supabase.
4. El flujo público de QR no mande directamente al formulario, sino primero a la página de inicio/presentación.
5. Desde esa página de inicio, el usuario pueda tocar “Registrar mascota” y continuar con el registro vinculado al mismo `qrId`.
6. Mantener la misma lógica actual: si el QR ya está registrado, debe mostrar el perfil de la mascota; si está disponible, debe permitir registro.
7. Mantener el diseño visual actual del sitio, colores, tarjetas, espaciados, botones y estilo responsive.
8. Generar al final un archivo resumen llamado `IMPLEMENTACION_MEJORAS_PANEL_QR.md`.

---

## Contexto del estado actual

Ya existe un panel admin en una ruta similar a:

```txt
/admin/qr
```

El panel actualmente permite:

- Generar QR únicos.
- Mostrar QR seleccionado.
- Descargar PNG/SVG.
- Copiar URL.
- Ver inventario de QR.
- Ver estados como `available`, `registered`, `disabled`.
- Desactivar QR.

Problema actual:

Cuando hay muchos QR, por ejemplo 12, 24 o 25, se muestran todos en una sola lista y la pantalla se ve larga/desordenada.

También falta:

- Botón para eliminar QR.
- Confirmación antes de eliminar.
- Eliminación real en Supabase.
- Mejor organización del inventario.
- Cambio del flujo público para que un QR disponible muestre primero el inicio y luego permita ir a registro.

---

# Parte 1: Mejorar inventario del panel admin QR

## Requisito principal

En el panel `/admin/qr`, el inventario de QR debe mostrarse ordenado y limitado.

Cuando haya más de 5 o 7 QR, no deben aparecer todos extendidos en una sola lista larga.

Implementar una de estas opciones, eligiendo la más limpia para el proyecto actual:

### Opción recomendada: paginación

Mostrar máximo entre **6 y 8 QR por página**.

Debe haber controles:

```txt
Anterior | Página 1 de N | Siguiente
```

También puede haber botones:

```txt
1 2 3 4 ...
```

Si solo hay una página, no mostrar controles innecesarios.

### Comportamiento esperado

- Si hay 5 QR o menos: mostrar todo normal.
- Si hay más de 6 o 8 QR: dividir por páginas.
- El panel debe seguir mostrando total de QR.
- El panel debe seguir mostrando estado de cada QR.
- El panel debe conservar los botones existentes: Ver QR, Copiar URL, Activar/Desactivar.
- Agregar botón Eliminar.

---

## Diseño esperado

Mantener el diseño actual del sitio:

- Tarjetas blancas/claras.
- Bordes redondeados.
- Estilo limpio.
- Botones con borde/color coherente con la marca.
- Badges de estado como los actuales:
  - Disponible
  - Registrado
  - Desactivado

No cambiar la paleta visual general.

No crear un diseño completamente diferente.

---

## Mejoras visuales sugeridas

Si el inventario se encuentra en una tabla, mejorarla así:

- Mantener columnas:
  - QR ID
  - Estado
  - Creado
  - Registrado
  - Acciones
- Agregar columna o acción de eliminar.
- En pantallas pequeñas, permitir scroll horizontal o usar tarjetas compactas.
- Evitar que los botones queden amontonados.

Ejemplo de acciones por QR:

```txt
Ver QR | Copiar URL | Activar/Desactivar | Eliminar
```

---

# Parte 2: Botón eliminar QR

## Requisito principal

Agregar botón **Eliminar** en cada QR del inventario.

El botón debe:

1. Pedir confirmación antes de eliminar.
2. Eliminar el QR de la tabla `qr_codes` en Supabase.
3. Actualizar la lista en pantalla sin recargar toda la app.
4. Mostrar mensaje de éxito o error.

---

## Reglas importantes para eliminar

Antes de eliminar, validar el estado del QR.

### Si el QR está `available` o `disabled`

Se puede eliminar normalmente.

### Si el QR está `registered`

No eliminar directamente sin protección.

Implementar una de estas dos opciones:

#### Opción recomendada

No permitir eliminar QR registrados desde el botón normal.

Mostrar mensaje:

```txt
Este QR ya tiene una mascota registrada. Para eliminarlo primero debes desvincular o eliminar el registro de la mascota.
```

#### Opción alternativa, solo si el proyecto ya lo soporta bien

Permitir eliminación en cascada únicamente si existe una acción explícita y confirmación fuerte.

No usar esta opción a menos que el código ya tenga manejo seguro para mascotas vinculadas.

---

## Confirmación antes de eliminar

Usar una confirmación sencilla si no hay modal existente:

```js
window.confirm('¿Seguro que quieres eliminar este QR? Esta acción no se puede deshacer.')
```

Si el proyecto ya tiene modal/alert personalizado, usar el estilo existente.

---

## Funciones sugeridas para `qrService.js`

Agregar o adaptar funciones:

```js
export async function deleteQrCode(qrId) {
  // validar/ejecutar delete en Supabase
}
```

Ejemplo lógico:

```js
const { error } = await supabase
  .from('qr_codes')
  .delete()
  .eq('qr_id', qrId)
```

Manejar errores y retornarlos de manera clara.

---

## Seguridad y Supabase

Revisar las políticas RLS de Supabase.

Para eliminar QR desde el panel admin, la operación `delete` debe estar permitida solo para admin.

Si actualmente se está usando `VITE_ADMIN_QR_PIN` como protección temporal del panel, dejar comentarios claros indicando que:

- Es una protección simple de frontend.
- Para producción debe reforzarse con Supabase Auth y políticas RLS.

No exponer service role key en frontend.

Nunca usar claves secretas de Supabase en código cliente.

---

# Parte 3: Activar / desactivar QR

## Requisito

Asegurarse de que el panel tenga acciones para:

- Desactivar QR disponible.
- Activar QR desactivado.
- No permitir activar/desactivar de forma peligrosa un QR registrado sin lógica clara.

Comportamiento esperado:

```txt
available → botón: Desactivar

disabled → botón: Activar

registered → puede mostrar Desactivar si ya existe esa lógica, pero no debe romper el perfil público sin aviso.
```

Si se permite desactivar un QR registrado, la ruta pública `/qr/:qrId` debe mostrar pantalla de QR desactivado y no mostrar datos.

---

# Parte 4: Cambiar flujo público QR disponible

## Estado actual esperado

Cuando se escanea un QR disponible, probablemente la ruta:

```txt
/qr/:qrId
```

muestra directamente el formulario de registro.

## Nuevo comportamiento requerido

Cuando se escanee un QR disponible, primero debe mostrar una página de inicio/presentación, no directamente el formulario.

La persona debe ver una pantalla amigable de bienvenida/inicio y luego poder presionar un botón tipo:

```txt
Registrar mascota
```

Al presionar ese botón, debe ir al formulario de registro asociado a ese mismo `qrId`.

---

## Flujo público deseado

```txt
Persona escanea QR
↓
Abre /qr/COLLAR-XXXX
↓
El sistema busca el qrId
↓
Si no existe:
  muestra QR inválido
↓
Si está disabled:
  muestra QR desactivado
↓
Si está registered:
  muestra perfil público de la mascota
↓
Si está available:
  muestra página de inicio/bienvenida para ese QR
↓
Usuario toca “Registrar mascota”
↓
Abre formulario de registro vinculado a ese mismo qrId
↓
Usuario registra mascota
↓
Sistema guarda mascota con qr_id
↓
QR queda registered
↓
A partir de ese momento /qr/COLLAR-XXXX muestra perfil público
```

---

## Implementación sugerida

Hay varias formas válidas. Elegir la más limpia según el código actual.

### Opción A recomendada: nueva ruta de registro QR

Crear una ruta nueva:

```txt
/qr/:qrId/registro
```

Entonces:

- `/qr/:qrId` resuelve el estado.
- Si está `available`, muestra una pantalla de bienvenida/inicio.
- El botón “Registrar mascota” navega a `/qr/:qrId/registro`.
- `/qr/:qrId/registro` valida de nuevo que el QR exista y esté disponible.
- Si está disponible, muestra `PetForm` con `qrId`.
- Si ya se registró, redirige o muestra el perfil.
- Si no existe o está desactivado, muestra error.

### Opción B: usar query param

```txt
/qr/:qrId?step=register
```

No usar esta opción si la opción A queda más clara.

---

## Página de inicio/bienvenida para QR disponible

Crear o reutilizar un componente/página con el mismo estilo del sitio.

Sugerencia de archivo:

```txt
src/pages/QRWelcome.jsx
```

Contenido sugerido:

```txt
MascotaSegura ID
Este collar aún no tiene una mascota registrada.
Registra la información de tu mascota para que pueda ser identificada si se pierde.

[Registrar mascota]
```

Debe incluir:

- Mensaje claro.
- Botón “Registrar mascota”.
- Tal vez beneficios breves del sistema.
- Diseño coherente con Home actual.
- No mostrar el formulario todavía.

---

## Importante sobre la lógica

No perder el `qrId`.

El `qrId` debe pasar desde:

```txt
/qr/:qrId
```

hacia:

```txt
/qr/:qrId/registro
```

Y luego hacia `PetForm`.

El formulario debe guardar la mascota con ese mismo `qrId`.

---

# Parte 5: Mantener compatibilidad

No romper rutas existentes:

```txt
/
/registro
/mascota/:id
/qr/:qrId
/admin/qr
```

Agregar si hace falta:

```txt
/qr/:qrId/registro
```

El registro normal `/registro` debe seguir funcionando como antes.

La ruta `/mascota/:id` debe seguir mostrando perfiles existentes.

La ruta `/qr/:qrId` debe ser la nueva ruta inteligente pública.

---

# Parte 6: Variables de entorno

En la captura aparece aviso similar a:

```txt
VITE_ADMIN_QR_PIN no está configurado. Este panel quedó abierto para entorno local.
```

Esto significa que la variable falta en el entorno actual.

## Qué hacer

Revisar dónde se usa `VITE_ADMIN_QR_PIN`.

Debe estar configurada en:

### Local

Archivo `.env.local`:

```env
VITE_ADMIN_QR_PIN=un-pin-seguro
```

Ejemplo:

```env
VITE_ADMIN_QR_PIN=849275
```

No subir `.env.local` al repositorio.

### Vercel

También configurar la misma variable en Vercel:

```txt
Project Settings → Environment Variables
```

Agregar:

```txt
VITE_ADMIN_QR_PIN
```

con el valor correspondiente.

Después de agregarla en Vercel, hacer redeploy.

### Supabase

Esta variable `VITE_ADMIN_QR_PIN` no se configura en Supabase.

Supabase es para base de datos, auth, storage y políticas.

Vercel es donde se configuran las variables que usa la app frontend en producción.

## Importante

`VITE_ADMIN_QR_PIN` es una protección temporal/simple de frontend.

Para producción real, recomendar Supabase Auth + RLS para proteger:

- crear QR
- listar QR
- activar QR
- desactivar QR
- eliminar QR

No implementar service role key en frontend.

---

# Parte 7: Archivos que probablemente se deben modificar

Revisar y modificar según exista en el proyecto:

```txt
src/pages/AdminQRGenerator.jsx
src/pages/QRResolver.jsx
src/components/PetForm.jsx
src/services/qrService.js
src/services/petService.js
src/App.jsx
```

Crear si hace falta:

```txt
src/pages/QRWelcome.jsx
src/pages/QRRegister.jsx
src/components/Pagination.jsx
```

No crear componentes innecesarios si se puede resolver limpio dentro de los existentes.

---

# Parte 8: Supabase / SQL

Si la tabla `qr_codes` ya existe, no duplicarla.

Si falta política para eliminar, agregar SQL sugerido en el resumen, pero no asumir que se puede aplicar sin revisar el estado actual.

Si se necesita una migración nueva, crear archivo tipo:

```txt
supabase/migrations/20260506_qr_admin_delete_policy.sql
```

O similar, respetando estructura existente.

## Reglas sobre eliminar

Si hay FK desde `mascotas.qr_id` hacia `qr_codes.qr_id`, eliminar QR registrado puede fallar por constraint.

Eso está bien.

El sistema debe capturar ese error y mostrar mensaje amigable.

No forzar `cascade delete` sin confirmación fuerte y sin pedirlo expresamente.

---

# Parte 9: Pruebas obligatorias

Después de implementar, probar:

## Panel admin

1. Crear un QR nuevo.
2. Ver que aparece en el inventario.
3. Crear más de 8 QR.
4. Confirmar que aparece paginación.
5. Cambiar de página.
6. Copiar URL.
7. Ver QR seleccionado.
8. Descargar PNG/SVG si ya existía esa función.
9. Desactivar QR.
10. Activar QR desactivado.
11. Eliminar QR disponible.
12. Confirmar que desaparece de Supabase y del inventario.
13. Intentar eliminar QR registrado y validar que no se elimina sin control.

## Flujo público

1. Abrir `/qr/{qrIdDisponible}`.
2. Confirmar que muestra inicio/bienvenida, no formulario directo.
3. Tocar “Registrar mascota”.
4. Confirmar que abre `/qr/{qrIdDisponible}/registro`.
5. Registrar mascota.
6. Confirmar que el QR queda `registered`.
7. Abrir otra vez `/qr/{qrId}`.
8. Confirmar que muestra perfil público.
9. Abrir `/qr/{qrIdInexistente}`.
10. Confirmar pantalla QR inválido.
11. Abrir `/qr/{qrIdDesactivado}`.
12. Confirmar pantalla QR desactivado.

## Build

Ejecutar:

```bash
npm run build
```

Corregir cualquier error de build.

---

# Parte 10: Qué NO hacer

No hacer lo siguiente:

- No romper `/registro`.
- No romper `/mascota/:id`.
- No eliminar el diseño actual.
- No cambiar toda la arquitectura sin necesidad.
- No exponer claves secretas de Supabase en frontend.
- No usar service role key en Vite/React.
- No eliminar QR registrados automáticamente sin protección.
- No crear IDs predecibles tipo `1`, `2`, `3`.
- No quitar compatibilidad con Vercel SPA rewrite.
- No dejar la lista admin mostrando 25 QR seguidos sin paginación.
- No mandar directamente al formulario desde `/qr/:qrId` cuando esté disponible; primero debe mostrar bienvenida/inicio.

---

# Parte 11: Resultado final requerido

Al terminar, generar un archivo en la raíz llamado:

```txt
IMPLEMENTACION_MEJORAS_PANEL_QR.md
```

Ese archivo debe incluir:

1. Resumen de cambios realizados.
2. Archivos creados.
3. Archivos modificados.
4. Cómo quedó el flujo público QR.
5. Cómo quedó el panel admin.
6. Cómo funciona la paginación.
7. Cómo funciona eliminar QR.
8. Qué variables configurar en `.env.local`.
9. Qué variables configurar en Vercel.
10. Si hay SQL nuevo, incluirlo completo.
11. Si hay políticas RLS nuevas o recomendadas, incluirlas.
12. Resultado de `npm run build`.
13. Pasos para probar en local.
14. Pasos para desplegar en Vercel.
15. Riesgos o pendientes importantes.

---

# Prompt interno para ejecutar

Codex debe leer este archivo completo y aplicar los cambios necesarios en el proyecto.

También debe revisar el archivo previo si existe:

```txt
AUDITORIA_PROYECTO_QR_SUPABASE.md
IMPLEMENTACION_QR_UNICO.md
```

Usarlos como contexto, pero este archivo tiene prioridad para las mejoras nuevas.


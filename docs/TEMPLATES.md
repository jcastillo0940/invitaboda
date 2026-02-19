# 📐 Guía para Desarrollar Templates de Invitación

## Índice
1. [¿Cómo funciona el sistema?](#cómo-funciona)
2. [Estructura de archivos](#estructura)
3. [Props disponibles](#props)
4. [Crear un nuevo template](#crear-template)
5. [Registrar el template en el panel Admin](#registrar)
6. [Convenciones y buenas prácticas](#convenciones)
7. [Template de referencia](#referencia)

---

## ¿Cómo funciona el sistema? {#cómo-funciona}

El sistema de templates funciona con **carga dinámica por slug**:

```
Admin crea diseño con nombre "Elegancia Atemporal"
    → slug generado: "elegancia-atemporal"
    → el sistema busca: resources/js/Templates/elegancia-atemporal.jsx
    → si no existe: renderiza TemplateFallback
```

El componente `TemplateLoader` en `resources/js/Components/TemplateLoader.jsx`
usa `lazy()` + `Suspense` de React para cargar el template correcto sin aumentar
el bundle principal.

---

## Estructura de archivos {#estructura}

```
resources/js/
├── Templates/                   ← 📂 AQUÍ van tus templates
│   ├── clasico.jsx              ← Template de referencia incluido
│   ├── elegancia-atemporal.jsx  ← Ejemplo de template personalizado
│   └── rustico-bohemio.jsx      ← Otro template…
│
└── Components/
    ├── TemplateLoader.jsx       ← Cargador dinámico (no editar)
    └── TemplateFallback.jsx     ← Fallback si el slug no existe
```

---

## Props disponibles {#props}

Tu componente recibirá estas props automáticamente:

```jsx
export default function MiTemplate({ data, event, guestGroup }) { ... }
```

### `data` — Datos del diseño (JSON guardado en la BD)
| Campo              | Tipo     | Descripción                            |
|--------------------|----------|----------------------------------------|
| `primaryNames`     | string   | Ej: `"Jose y María"`                  |
| `date`             | string   | ISO date string                        |
| `location`         | string   | Lugar de la ceremonia                  |
| `reception`        | string   | Lugar de la recepción (opcional)       |
| `mainColor`        | string   | Color principal en hex, ej `#C5A059`  |
| `secondaryColor`   | string   | Color secundario en hex                |
| `rsvpOptions`      | object   | `{ askMenu, askDrinks, menuOptions }` |
| *(campos custom)*  | any      | Cualquier dato extra del editor        |

### `event` — Datos del evento (desde la BD)
| Campo        | Tipo     | Descripción                      |
|--------------|----------|----------------------------------|
| `id`         | number   | ID del evento                    |
| `name`       | string   | Nombre original                  |
| `slug`       | string   | Slug de la URL pública            |
| `date`       | string   | Fecha en ISO                     |
| `is_premium` | boolean  | Si el evento es premium          |
| `design`     | object   | El diseño asignado y su config   |

### `guestGroup` — Grupo de invitados (puede ser `null`)
| Campo          | Tipo          | Descripción                          |
|----------------|---------------|--------------------------------------|
| `id`           | number        | ID del grupo                         |
| `group_name`   | string        | Nombre del grupo / familia           |
| `total_passes` | number        | Cantidad de pases                    |
| `members`      | Member[]      | Array de invitados individuales      |
| `status`       | string        | `pending`, `confirmed`, `declined`   |

**Member:**
```ts
{ id, name, is_attending, menu_choice, drink_choice, allergies }
```

---

## Crear un nuevo template {#crear-template}

### Paso 1 — Crear el archivo

```bash
# El nombre del archivo DEBE coincidir exactamente con el slug del diseño
touch resources/js/Templates/tu-nombre-de-diseño.jsx
```

### Paso 2 — Estructura mínima del componente

```jsx
// resources/js/Templates/tu-nombre-de-diseño.jsx
import { motion } from 'framer-motion';

export default function TuNombreDeDiseno({ data, event, guestGroup }) {
    // 1. Extrae los datos con fallbacks seguros
    const names    = data?.primaryNames  || event?.name || 'La Boda';
    const location = data?.location      || 'Por confirmar';
    const gold     = data?.mainColor     || '#C5A059';

    const date = event?.date
        ? new Date(event.date).toLocaleDateString('es-ES', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })
        : '';

    return (
        <div className="min-h-screen font-serif">
            {/* Tu diseño completo aquí */}
            <h1 className="text-5xl italic">{names}</h1>
            <p>{date}</p>
            <p>{location}</p>

            {/* Sección de invitados (solo si viene guestGroup) */}
            {guestGroup && (
                <div>
                    <h2>Para: {guestGroup.group_name}</h2>
                    {guestGroup.members.map(m => (
                        <p key={m.id}>{m.name}</p>
                    ))}
                </div>
            )}
        </div>
    );
}
```

### Paso 3 — Build

```bash
npm run build
# o durante desarrollo:
npm run dev
```

---

## Registrar el template en el panel Admin {#registrar}

1. Ve a **Admin → Diseños → Nuevo Diseño**
2. En el campo **"Nombre del Diseño"**, escribe exactamente el nombre que corresponde al slug de tu archivo:
   - Archivo: `elegancia-atemporal.jsx` → Nombre: `Elegancia Atemporal`
3. Sube el thumbnail de vista previa
4. Activa el toggle **"Activo"**
5. Guarda — el sistema generará el slug automáticamente

---

## Convenciones y buenas prácticas {#convenciones}

### ✅ Hacer
- Usar `data?.campo || fallback` siempre (los datos pueden estar vacíos)
- Respetar `guestGroup` puede ser `null` — envuelve esas secciones con `{guestGroup && ...}`
- Usar `framer-motion` para animaciones (ya está instalado)
- El template controla **todo** el visual: colores, tipografía, secciones
- Usar CSS variables para los colores: `style={{ color: gold }}`
- Mantener un footer mínimo con la marca "Invitaboda"

### ❌ No hacer
- No importar datos directamente por HTTP en el template (ya vienen via props)
- No usar `useState` para el RSVP — eso lo maneja `Invitation.jsx`
- No agregar la lógica del formulario RSVP al template (ya existe en la página padre)
- No usar librerías con CDN externo (todo debe estar en el bundle)

### 📐 Estructura recomendada de secciones
```
1. HERO        — Nombres de los novios, fecha, lugar
2. HISTORIA    — (Opcional) Su historia de amor
3. DETALLES    — Ceremonia y recepción (dirección, hora)
4. INVITADOS   — Sección personalizada por guestGroup
5. ITINERARIO  — (Opcional) Orden del día
6. CONFIRMACIÓN — Texto invitando a confirmar asistencia
7. FOOTER      — Cierre elegante + marca
```

---

## Template de referencia {#referencia}

Puedes ver el template `clasico.jsx` como implementación completa de referencia:

```
resources/js/Templates/clasico.jsx
```

Este template incluye:
- Hero con nombres, fecha y ubicación
- Sección de detalles de ceremonia/recepción
- Sección dinámica de invitados (aparece solo si hay `guestGroup`)
- Footer de marca
- Animaciones con framer-motion
- Colores configurables desde `data.mainColor` / `data.secondaryColor`

---

## Conectar el template con el editor visual (futuro)

El campo `data` proviene de `event_designs.design_data` (JSON).
Cuando el editor visual esté implementado, el usuario podrá modificar
campos como `primaryNames`, `location`, `mainColor`, etc. desde la interfaz,
y el template simplemente los refleja a través de sus props.

Para campos personalizados de tu template, documéntalos arriba del componente:

```jsx
/**
 * TEMPLATE: mi-template
 * Campos custom requeridos en design_data:
 *   - heroImage: URL de imagen de fondo
 *   - musicUrl:  URL de canción de fondo
 */
```

---

*Documentación generada por Invitaboda · v1.0*

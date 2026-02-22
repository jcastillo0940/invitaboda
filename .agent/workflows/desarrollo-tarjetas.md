# Instructivo para Desarrollar Nuevas Tarjetas (Templates)

Este documento detalla el proceso para crear y registrar nuevas plantillas de invitación en el sistema Invitaboda.

## 1. Creación del Componente de Plantilla

Las plantillas se encuentran en `resources/js/Templates/`. Cada plantilla es un componente de React que recibe tres props principales:

- `data`: Objeto `design_data` que contiene la configuración personalizada del usuario (colores, textos, imágenes, clima, etc.).
- `event`: Objeto con los datos básicos del evento (nombre, fecha, slug).
- `guestGroup`: (Opcional) Datos del grupo de invitados si se accede mediante un link personalizado.

### Estructura base sugerida:

```jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Weather from '@/Components/Wedding/Weather';

export default function MiNuevaPlantilla({ data, event, guestGroup }) {
    // 1. Normalización de datos (Fallbacks)
    const d = data || {};
    const mainColor = d.mainColor || '#C5A059';
    const date = event?.date || d.date;

    return (
        <div className="min-h-screen bg-white" style={{ '--primary': mainColor }}>
            {/* Secciones: Hero, Cuenta Regresiva, Historia, Clima, etc. */}
            <section>
                <h1>{d.primaryNames || event.name}</h1>
                <Weather config={d.weather} eventDate={date} />
            </section>
        </div>
    );
}
```

## 2. Registro en el TemplateLoader

Para que el sistema reconozca la nueva plantilla, debe registrarse en `resources/js/Components/TemplateLoader.jsx`.

1. Importa la nueva plantilla usando `lazy`:
   ```javascript
   const TemplateNueva = lazy(() => import('../Templates/mi-nueva-plantilla.jsx'));
   ```
2. Agrégala al mapa `TEMPLATE_MAP` usando un slug único:
   ```javascript
   const TEMPLATE_MAP = {
       // ... anteriores
       'mi-nueva-plantilla': TemplateNueva,
   };
   ```

## 3. Alta en la Base de Datos

Para que la plantilla aparezca en el **Editor de Eventos**, debe existir un registro en la tabla `designs`. Puedes hacerlo mediante un Seeder (`database/seeders/DesignSeeder.php`) o directamente en la DB:

```sql
INSERT INTO designs (name, slug, thumbnail, is_active, is_premium, created_at, updated_at)
VALUES ('Nombre Elegante', 'mi-nueva-plantilla', '/assets/thumbnails/mi-template.jpg', 1, 0, NOW(), NOW());
```

*El `slug` debe coincidir exactamente con el valor usado en el `TEMPLATE_MAP`.*

## 4. Mejores Prácticas y Componentes Estándar

- **Clima**: Utiliza siempre el componente `<Weather config={data.weather} eventDate={date} />`.
- **Animaciones**: Usa `framer-motion` para mantener la consistencia visual y "premium".
- **Responsive**: Asegúrate de que todas las secciones se vean correctamente en dispositivos móviles (iPhone SE como referencia mínima).
- **Fallbacks**: Siempre define valores por defecto para los campos de `data` para evitar errores si el usuario no ha completado la configuración.
- **Performance**: Usa `lazy` loading para los componentes pesados y optimiza el tamaño de las imágenes.

## 5. Pruebas

1. Abre el Editor de un evento.
2. Selecciona la nueva plantilla en la pestaña "Plantilla".
3. Verifica que todos los datos (nombres, fechas, clima, galería) se visualicen correctamente en la previsualización y en la vista pública.

# Mi Día

App personal para el día a día: **tareas por días**, **cumpleaños**, **eventos** y **listas** sin fecha, conectada con **Google Calendar** en las dos direcciones.

Es una web que se instala en el móvil como una app (PWA): sin tiendas, sin servidores y gratis con GitHub Pages.

## Qué hay en este repositorio

```
index.html               ← la app completa
manifest.webmanifest     ← nombre, icono y colores al instalarla
sw.js                    ← hace que abra al instante y funcione sin conexión
icon-*.png               ← iconos para el móvil
Code.gs                  ← el "puente" con Google Calendar (se pega en script.google.com)
GUIA.md                  ← cómo instalar el puente (unos 10 min)
referencias-diseno/      ← capturas que inspiraron el diseño (no hace falta subirlas)
```

**App publicada:** https://fau25.github.io/organizador/
**Repositorio:** https://github.com/Fau25/organizador

## 1. Subirlo a GitHub

1. En **github.com** pulsa **New repository**, ponle de nombre `organizador` y créalo como **Public**.
   > GitHub Pages gratis necesita que el repositorio sea público. Tus datos **no** se suben: se guardan solo en tu móvil y en tu Google Calendar.
2. En el repositorio recién creado pulsa **uploading an existing file**.
3. Arrastra **todo el contenido** de esta carpeta (todo menos la carpeta `referencias-diseno`) y pulsa **Commit changes**.

## 2. Publicarlo con GitHub Pages

1. En el repositorio ve a **Settings → Pages**.
2. En **Source** elige **Deploy from a branch**, rama **main**, carpeta **/ (root)** y pulsa **Save**.
3. Espera 1-2 minutos. La app estará en:
   `https://fau25.github.io/organizador/`

## 3. Instalarla en el móvil

- **iPhone (Safari):** abre la dirección, pulsa **Compartir → Añadir a pantalla de inicio**.
- **Android (Chrome):** abre la dirección, menú **⋮ → Instalar aplicación** (o "Añadir a pantalla de inicio").

La primera vez te pedirá tu nombre. Tu foto se pone tocando el círculo del saludo.

## 4. Conectar Google Calendar (opcional)

Sigue [`GUIA.md`](GUIA.md) y pega la URL y la clave del script en **Ajustes** (el botón de la esquina del panel blanco).

Sin conectarlo, la app funciona igual y, al guardar un cumpleaños o evento, abre Google Calendar con los datos ya rellenos para que confirmes.

## Actualizar la app más adelante

1. Sube el `index.html` nuevo al repositorio (sustituyendo el anterior).
2. Abre `sw.js` y sube el número de `VERSION` (ahora va por `mi-dia-v55`: la siguiente sería `mi-dia-v56`).
3. En el móvil, cierra la app del todo y vuelve a abrirla (a veces hace falta dos veces).

Tus tareas y datos **no se pierden** al actualizar.

## Dónde se guardan tus datos

- Tareas y listas: solo en el navegador del móvil.
- Cumpleaños y eventos: en el móvil y, si conectas el script, también en tu Google Calendar.

> ⚠️ Si borras los datos de Safari/Chrome o desinstalas la app, se pierden las tareas y listas. Los cumpleaños y eventos se recuperan de Google al volver a conectar.

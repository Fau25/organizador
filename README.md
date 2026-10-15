# Mi Día

App personal para el día a día: **tareas por días**, **cumpleaños**, **eventos** y **listas** sin fecha, conectada con **Google Calendar** en las dos direcciones.

Es una web que se instala en el móvil como una app (PWA): sin tiendas, sin servidores y gratis con GitHub Pages.

## Qué hay en este repositorio

```
mi-dia/
├── index.html               ← la app completa
├── manifest.webmanifest     ← nombre, icono y colores al instalarla
├── sw.js                    ← hace que abra al instante y funcione sin conexión
├── icons/                   ← iconos para el móvil
└── google-apps-script/
    ├── Code.gs              ← el "puente" con Google Calendar
    └── GUIA.md              ← cómo instalarlo (unos 10 min)
```

## 1. Subirlo a GitHub

1. En **github.com** pulsa **New repository**, ponle de nombre `mi-dia` y créalo como **Public**.
   > GitHub Pages gratis necesita que el repositorio sea público. Tus datos **no** se suben: se guardan solo en tu móvil y en tu Google Calendar.
2. En el repositorio recién creado pulsa **uploading an existing file**.
3. Arrastra **todo el contenido** de esta carpeta (los archivos y las carpetas `icons` y `google-apps-script`) y pulsa **Commit changes**.

## 2. Publicarlo con GitHub Pages

1. En el repositorio ve a **Settings → Pages**.
2. En **Source** elige **Deploy from a branch**, rama **main**, carpeta **/ (root)** y pulsa **Save**.
3. Espera 1-2 minutos. La app estará en:
   `https://TU-USUARIO.github.io/mi-dia/`

## 3. Instalarla en el móvil

- **iPhone (Safari):** abre la dirección, pulsa **Compartir → Añadir a pantalla de inicio**.
- **Android (Chrome):** abre la dirección, menú **⋮ → Instalar aplicación** (o "Añadir a pantalla de inicio").

La primera vez te pedirá tu nombre. Tu foto se pone tocando el círculo del saludo.

## 4. Conectar Google Calendar (opcional)

Sigue [`google-apps-script/GUIA.md`](google-apps-script/GUIA.md) y pega la URL y la clave del script en **Ajustes** (el botón de la esquina del panel blanco).

Sin conectarlo, la app funciona igual y, al guardar un cumpleaños o evento, abre Google Calendar con los datos ya rellenos para que confirmes.

## Actualizar la app más adelante

1. Sube el `index.html` nuevo al repositorio (sustituyendo el anterior).
2. Abre `sw.js` y cambia `mi-dia-v1` por `mi-dia-v2` (y así sucesivamente).
3. En el móvil, cierra la app del todo y vuelve a abrirla (a veces hace falta dos veces).

Tus tareas y datos **no se pierden** al actualizar.

## Dónde se guardan tus datos

- Tareas y listas: solo en el navegador del móvil.
- Cumpleaños y eventos: en el móvil y, si conectas el script, también en tu Google Calendar.

> ⚠️ Si borras los datos de Safari/Chrome o desinstalas la app, se pierden las tareas y listas. Los cumpleaños y eventos se recuperan de Google al volver a conectar.

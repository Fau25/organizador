# Conectar "Mi Día" con Google Calendar

Son unos 10 minutos y solo se hace una vez. Al terminar, la app:

- **guarda sola** en Google Calendar los cumpleaños y eventos que crees en ella,
- **trae** los cumpleaños y eventos que añadas directamente en Google Calendar,
- **borra** en Google lo que borres desde la app (te pregunta antes).

---

## 1. Crear el script

1. Entra en **https://script.google.com** con tu cuenta de Google y pulsa **Nuevo proyecto**.
2. Arriba a la izquierda, cambia el nombre "Proyecto sin título" por **Mi Día**.
3. Borra todo lo que hay en `Código.gs` y pega el contenido completo de **`Code.gs`**.
4. En la parte de arriba del código, en `CONFIG`, cambia la clave:
   ```js
   SECRET: 'CAMBIA-ESTA-CLAVE-por-algo-largo-y-raro',
   ```
   Pon algo largo e inventado, por ejemplo `tortuga-azul-7391-montaña`. Apúntala, porque la necesitarás en la app.
5. Pulsa el icono del disquete (**Guardar**).

## 2. Dar permisos y probar

1. En el desplegable de funciones (junto a "Depurar"), elige **`probar`** y pulsa **Ejecutar**.
2. Google te pedirá permisos: **Revisar permisos**, elige tu cuenta y luego **Configuración avanzada**, **Ir a Mi Día (no seguro)** y **Permitir**.
   > Sale el aviso de "no seguro" porque el script lo has creado tú y Google no lo ha verificado. Es normal: solo tú lo usas.
3. Abajo, en el **Registro de ejecución**, verás los cumpleaños y eventos que ha encontrado. Así compruebas que lee bien tu calendario.

## 3. Publicarlo como aplicación web

1. Arriba a la derecha, ve a **Implementar** y luego **Nueva implementación**.
2. En el engranaje de "Seleccionar tipo", elige **Aplicación web**.
3. Rellénalo así:
   - **Ejecutar como:** Yo (tu correo)
   - **Quién tiene acceso:** Cualquier usuario
   > No es peligroso: sin tu clave secreta, el script no devuelve nada.
4. Pulsa **Implementar** y copia la **URL de la aplicación web**. Termina en `/exec`.

## 4. Conectar la app

1. Abre la app, toca el **engranaje** (Ajustes) y pega la **URL** y la **clave secreta**.
2. Pulsa **Guardar y probar**. Si aparece "¡Conectado con Google!", ya está.

En la portada verás arriba a la derecha un puntito verde con la hora de la última sincronización.

---

## Cómo reconoce los cumpleaños

El script busca cumpleaños en tres sitios a la vez:

| Dónde | Qué hace falta |
|---|---|
| Calendario **"Cumpleaños"** | Todo lo que haya en un calendario con ese nombre. Si no existe, se crea solo la primera vez que añadas un cumple desde la app. |
| **Contactos de Google** | Los contactos que tengan fecha de cumpleaños. Para borrarlos, hay que hacerlo desde Contactos. |
| Tu calendario principal | Eventos cuyo título empiece por "Cumpleaños de…", "Cumple de…" o que lleven 🎂. |

Los cumpleaños que crees desde la app se guardan como evento anual en el calendario "Cumpleaños", con el año de nacimiento en la descripción. Así la app puede mostrar la edad.

Los **eventos** que trae son los de tu calendario principal y los de **Deporte**, de los próximos **120 días**. Se cambia en `EXTRA_EVENT_CALENDARS` y `EVENT_DAYS`.

La **zona horaria** es la de tu calendario principal (la tuya es la de Canarias). Si quieres forzar otra, ponla en `TZ`, por ejemplo `'Europe/Madrid'`.

## Cuándo se sincroniza

- Al abrir la app y al volver a ella si han pasado más de 60 segundos.
- Al pulsar **Sincronizar** en Ajustes.
- Si creas algo sin conexión, se marca como *pendiente* y se sube en la siguiente sincronización.

## Si cambias el código del script

Ve a **Implementar**, luego **Gestionar implementaciones**, pulsa el lápiz, elige **Versión: Nueva versión** e **Implementar**. Así la URL sigue siendo la misma y no tienes que tocar la app.

## Problemas típicos

- **"Clave incorrecta":** la clave de la app no coincide exactamente con la de `SECRET`.
- **"No conecta":** revisa que la URL termine en `/exec` (no en `/dev`) y que el acceso esté en "Cualquier usuario".
- **No salen los cumpleaños de Contactos:** en Google Calendar (web), activa el calendario "Cumpleaños" de la lista "Otros calendarios".

## Tareas y listas en varios dispositivos (iPhone, iPad…)

El script también guarda tus **tareas y listas** en su propio almacén de Google, así que todos los dispositivos donde pongas la misma URL y clave en **Ajustes** ven lo mismo. Se sincroniza al abrir la app, al volver a ella y cada vez que cambias algo. Si dos dispositivos cambian cosas a la vez, se mezclan sin perder nada.

**Para actualizar el script sin cambiar la URL:** pega el código nuevo, guarda y ve a **Implementar → Gestionar implementaciones → ✏️ (editar) → Versión: Nueva versión → Implementar**.

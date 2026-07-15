---
name: decisiones-fase1-ui
description: Decisiones de producto del cableado UI de la Fase 1 (login/admin, sugerencia de conjunto, tasa, persistencia)
metadata:
  type: project
---

Decisiones tomadas por el cliente durante la fase de cablear el dominio a la UI (proyecto PATRONES ecommerce, Fase 1 demo estática):

- **Login + lado interno**: se hace el **admin COMPLETO** (todas las secciones de §16.5). Es auth demo/mock (sin backend en Fase 1). Deben existir **2 cuentas demo: 1 cliente y 1 admin**, con un **botón que autocompleta las credenciales** en los campos (para facilitar la revisión, sin escribir a mano). Es una épica en tandas.

- **Sugerencia de conjunto (§9.3)**: al elegir talla+color en el 1er ítem, el ítem sugerido debe **precargar talla y color idénticos, priorizando SIEMPRE talla sobre color**. Si el match exacto no existe, ofrecer la mejor coincidencia disponible **indicando dónde está la existencia** (para no perder la inclusión del set y guiar al usuario); si no hay nada, cae a **vender la prenda individual** como estaba pensado. Los sets pueden ser de colores intencionalmente distintos, pero el cliente pidió priorizar match idéntico con talla por encima de color.

- **Tasa dolarapi**: consumir la tasa real (BCV oficial vía dolarapi) en cada carga; **redondear a máx. 2 decimales** antes de usar/mostrar. **Sin persistencia que sobreviva al F5** para la tasa (fetch fresco por carga).

- **Fases**: los ajustes visuales finos + el plugin 21st.dev se dejan para el **final**, para revisar con la demo completa (pocas revisiones grandes en vez de muchas chicas).

**Por qué importa:** son decisiones del dueño del producto que no se derivan del código; guían las próximas tandas. Relacionado con [[como-trabaja-el-cliente]].

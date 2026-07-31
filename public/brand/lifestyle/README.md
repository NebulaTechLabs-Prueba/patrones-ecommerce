# Imágenes propias (estables) de PATRONES

Dejá aquí (o en `public/brand/`) las fotos definitivas para reemplazar las URLs
externas frágiles (gstatic/Instagram) que hoy pueblan la demo. Todo lo de `public/`
se sirve como estático: `public/brand/lifestyle/foo.jpg` → `/brand/lifestyle/foo.jpg`.

**Reglas de nombre:** sin espacios ni acentos, minúsculas, con guiones. JPG/WebP,
lado largo ≤ 1600px, < ~400 KB.

## Dónde va cada una (nombres sugeridos)
- Home hero (split 50/50):
  - `hero-1.jpg` — imagen izquierda  (hoy: /brand/patrones-morado-masculino.jpg)
  - `hero-2.jpg` — imagen derecha
- Carrusel "A todo color" (home): `carrusel-1.jpg` … `carrusel-10.jpg`
- Hero de Contacto: `contacto.jpg`  (hoy: /brand/patrones-dudas.jpg)
- Hero por marca (opcional): `marca-<slug>.jpg` (ej. `marca-figs.jpg`)

Cuando subas los archivos, avisame y los cableo en el seed (o cargalos desde
Admin → Portada / Contenido / Marcas, que ya aceptan subir imagen o pegar URL).

> Nota: `public/brand/DATA.xlsx` NO debe subirse aquí (tiene precios de costo y se
> serviría público). Está en `.gitignore`.

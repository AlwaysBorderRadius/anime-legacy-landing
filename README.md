# Anime Legacy Landing Page

Landing page para la comunidad de Discord **Anime Legacy**.

## Stack

- HTML5 semántico
- Tailwind CSS (CDN)
- JavaScript vanilla
- Cloudflare Pages (hosting)

## Desarrollo local

Simplemente abre `index.html` en tu navegador o usa un servidor local:

```bash
npx serve .
```

## Deploy

El deploy se realiza automáticamente en Cloudflare Pages al hacer push a `main`.

## Estructura

```
/
├── index.html          # Página principal
├── css/
│   └── custom.css      # Estilos personalizados y animaciones
├── js/
│   └── main.js         # Interactividad (scroll, menú mobile)
├── img/
│   ├── logo.png        # Logo del servidor
│   ├── og-image.png    # Imagen para previews (1200x630px)
│   ├── screenshot1.png # Screenshot del servidor
│   ├── screenshot2.png
│   └── screenshot3.png
├── favicon.ico         # Favicon
├── robots.txt          # Robots
└── sitemap.xml         # Sitemap
```

## Imágenes necesarias

Reemplaza los placeholders en la carpeta `img/` con:

- `logo.png` - Logo de Anime Legacy (recomendado: 256x256px)
- `og-image.png` - Imagen para Open Graph (1200x630px)
- `screenshot1.png`, `screenshot2.png`, `screenshot3.png` - Screenshots del servidor
- `favicon.ico` - Favicon del sitio

# JamaMarket - E-commerce Platform

## Descripción del Proyecto
JamaMarket es una sólida plataforma de comercio electrónico moderna, altamente performante y multiidioma. Diseñada meticulosamente para vender productos (alimentos, repostería temática para mascotas y accesorios) y exhibir servicios. Cuenta con una vista pública orientada a conversiones rápidas, confort visual mediante un sistema de temas Dual (Light / Comfort Mode), y un sólido panel de administración para la gestión integral de inventario, usuarios y banners destacados.

## Tecnologías y Stack
- **Framework Core**: Next.js 15 (App Router, Server Actions, SSR/SSG nativo)
- **Frontend**: React 19, TypeScript
- **Estilos y Componentes**: Tailwind CSS, Shadcn UI, Framer Motion (para micro-interacciones de UX)
- **Base de Datos**: MongoDB vía Mongoose ORM
- **Autenticación y Seguridad**: Auth.js / NextAuth.js (Credenciales Email y Password, encriptación segura)
- **Almacenamiento Multimedia**: Cloudinary API (soporte para múltiples imágenes y videos por producto)
- **Internacionalización (i18n)**: Sistema robusto con soporte y traducciones inmediatas (state y routing) para **Español (es)**, **Inglés (en)** y **Portugués (pt)** en todo el portal, mails y panel de administrador.
- **Protección Antispam**: Google reCAPTCHA v3
- **Proveedores de Correo**: Maileroo
- **Pago (Lista para integración)**: MercadoPago (Tokens y API Key)

---

## Funcionalidades Principales

### 🛒 Experiencia del Cliente (Storefront)
- **Catálogo Dinámico e Inteligente**: Filtros por categoría, búsqueda reactiva, etiquetas de estado, diseño 100% responsivo "Mobile-First".
- **Ficha de Producto Premium**: Galería de medios navegable, vista de componentes dinámicos (selector de cantidad con +/-), y administración inteligente de **variantes de producto** (cambios de atributo con su respectivo precio y stock independiente).
- **Carrito de Compras Persistente**: Carrito accesible globalmente con notificaciones, autocompletado y cálculo preciso para subtotal.
- **Sección de Servicios Dinámica**: Ocultamiento automático del apartado "Servicios" ante ausencia de datos en el sistema para mantener un formato limpio.
- **Multilenguaje y Preferencias de UI**: Traducción instantánea con detección y modo noche atenuado (Comfort Mode) diseñado no solo para el reposo ocular sino para elegancia.
- **Formulario de Contacto y Footer**: Redes sociales internacionalizadas, contacto blindado contra bots, links útiles.

### ⚙️ Experiencia del Administrador (Backoffice)
- **Gestión Avanzada de Productos**: Operaciones CRUD enteras. Subida de medios con Drag & Drop o sistema click, asignación de portadas, soporte para variantes o items simples de precio único, categorización manual y opciones de destacado (Featured).
- **Organización de Campañas (Slides/Hero)**: Control total sobre el banner deslizante de promociones de la página principal (títulos, links dinámicos transaccionales, estado visual y visibilidad).
- **Auditoría y Gestión de Usuarios**: Visualizador y editor de usuarios registrados, capacidad para nombrar a otros administradores y verificar direcciones de envíos con tabla desplegable (Tooltips localizados).
- **Escalabilidad Visual**: Formato uniforme para toda el back-end, manteniendo controles nativos y consistencia (Selectores incrementales, labels de advertencia, confirmaciones manuales de "ELIMINAR").

---

## Instalación y Configuración del Repositorio

A continuación, los pasos para ejecutar la instalación inicial en un entorno local (Localhost):

### 1. Clonar del Entorno
`bash
git clone <URL_DEL_REPOSITORIO>
cd JamaMarket
`

### 2. Instalar el Gestor de Dependencias
Asegúrese de contar con Node.js (preferentemente versión LTS, > 18.x) y ejecutar:
`bash
npm install
`
o
`bash
yarn install
`

### 3. Variables de Entorno (`.env.local`)
El proyecto funciona bajo una capa de configuración segura mediante variables de entorno obligatorias necesarias para bases de datos, contraseñas, nubes y APIs. Copie el template y complete los valores:

`bash
cp .env.example .env.local
`

*Estructura principal e indispensable:*
- **Base de Datos**: `MONGODB_URI` (El URI del clúster Mongo asumiendo uso de MongoDB Sandbox o Atlas) y `MONGODB_DB` (Nombre).
- **Autenticación (NextAuth)**: `AUTH_SECRET` (Cifrado de sesiones cruzadas. Puedes generarlo fácilmente ejecutando `npx auth secret` o `openssl rand -base64 32` en tu terminal) y `NEXTAUTH_URL`.
- **Cloudinary**: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_API_KEY`, y `CLOUDINARY_SECRET`.
- **Seguridad y Capcha**: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` y `RECAPTCHA_SECRET_KEY`.
- **Emails y Correo**: Claves provistas por `Maileroo`.
- **Otras referencias**: Variables de pago (MercadoPago) y de perfiles de marcas están comentadas en el example.

### 4. Lanzamiento de Servidor
Una vez conectada la BD y validados los `API keys`, inicie TypeScript en modo dev:
`bash
npm run dev
`
El frontend y backend integral estará funcionando de forma transparente por defecto en: `http://localhost:3000` (o `http://localhost:3000` dependiendo la plataforma).

---

## Estructura y Mejores Prácticas Adoptadas
- **SOLID y DRY**: Componentes reusables altamente abstraídos y escalables, lógica separada del componente visual.
- **Server Side Rendering (SSR) y CSR**: Mezcla y maximización al usar `page.tsx` con llamadas puras y componentes con delegación `"use client"` para evitar sobrecarga del servidor en clientes (menús interactivos, carritos).
- **Internacionalización Constante**: Regla arquitectónica sin *hardcoding*. Cada nueva pieza textual integra su llave en `src/lib/translations.ts` propiciando escalado sin fricción a 4° o 5° idioma.
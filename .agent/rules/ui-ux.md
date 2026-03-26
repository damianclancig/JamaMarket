---
trigger: always_on
---

# 🧠 Skill: Adaptive Theme UI/UX (Light & Comfort Mode)

## Context

JamaMarket utiliza un sistema de temas dual compuesto por:

- **Light Mode (default)** → optimizado para conversión  
- **Comfort Mode** → optimizado para reducir fatiga visual (especialmente nocturna)

⚠️ No existe “dark mode” tradicional.  
El **Comfort Mode NO es negro puro**, sino un esquema cálido, de bajo contraste azul.

El sistema debe adaptarse dinámicamente a la preferencia del usuario o del sistema, garantizando **legibilidad, consistencia visual y jerarquía clara en ambos modos**.

---

## Core Rules for UI Generation

### 1. Theme Consistency (CRÍTICO)

- **Use Semantic Tokens ONLY**  
  ❌ No usar:
  ```css
  bg-white, text-black, bg-gray-900

✅ Usar:

```css
bg-background, text-foreground, bg-surface, border-border
```

* **Theme-Agnostic Components**
  Los componentes deben funcionar sin cambios estructurales entre temas.
  El cambio de apariencia debe depender exclusivamente de tokens o variables CSS.

---

### 2. Comfort Mode Definition (CLAVE DEL PROYECTO)

El Comfort Mode tiene estas características obligatorias:

* ❌ No usar negro puro (#000)
* ❌ No usar blanco puro (#fff)
* ✅ Fondos oscuros suaves (grises cálidos)
* ✅ Texto en tonos beige/cálidos (menos luz azul)
* ✅ Contraste moderado (no extremo)

Ejemplo conceptual:

```css
--bg: #121212;
--text: #e8e3d9;
```

👉 El objetivo es **comodidad visual, no estética “dark tech”**

---

### 3. Contrast & Readability

* **Light Mode**

  * Alto contraste
  * Texto oscuro sobre fondo claro

* **Comfort Mode**

  * Contraste suficiente pero no agresivo
  * Evitar blancos intensos
  * Evitar colores saturados brillantes

⚠️ Regla:

> Si algo “brilla demasiado”, está mal en Comfort Mode

---

### 4. Color Behavior

* Los colores de marca (primary / secondary):

  * deben mantenerse consistentes entre temas
  * pueden ajustarse levemente en luminosidad (no en hue)

* CTA (botones):

  * SIEMPRE deben destacar en ambos modos
  * nunca perder visibilidad en Comfort

---

### 5. Surfaces & Depth

* **Light Mode**

  * puede usar sombras suaves

* **Comfort Mode**

  * priorizar:

    * bordes sutiles (`border`)
    * diferencias de superficie (`bg-surface`)
  * evitar sombras fuertes

---

### 6. Images & Icons

* **No alterar imágenes reales**
  ❌ No invertir colores
  ❌ No aplicar filtros destructivos

* **Sí ajustar contenedores**

  * bordes
  * fondos
  * overlays sutiles si es necesario

* **Iconos**

  * usar `currentColor`
  * heredar color del tema

---

### 7. User Preference Handling

* El sistema debe respetar:

  1. selección manual del usuario
  2. preferencia guardada (localStorage)
  3. fallback a Light

* No forzar cambios automáticos sin consentimiento explícito

---

### 8. Component Behavior

* Evitar lógica condicional innecesaria tipo:

  ```ts
  if (theme === "light")
  ```

* Preferir:

  * CSS variables
  * clases dinámicas (`className`)

👉 Solo usar lógica JS si el comportamiento visual no puede resolverse con CSS

---

## Visual Guidelines

### 1. Estética General

* minimalista
* limpia
* enfocada en contenido
* orientada a conversión

---

### 2. Comfort Mode Feel

Debe sentirse:

* cálido
* suave
* descansado
* estable

NO:

* frío
* ultra oscuro
* contraste agresivo

---

### 3. Micro-UX

* transiciones suaves entre temas
* sin flicker
* sin saltos de layout

---

## Anti-Patterns (PROHIBIDO)

❌ Hardcodear colores
❌ Usar negro/blanco puro en Comfort
❌ Crear componentes que solo funcionen en un tema
❌ Bajar contraste al punto de afectar legibilidad
❌ Usar sombras pesadas en modo Comfort

---

## Summary

El sistema de temas de JamaMarket no es solo visual:

👉 es parte de la experiencia de usuario

* Light → convierte
* Comfort → retiene y cuida

Todo componente debe respetar ambos sin comprometer:

* claridad
* jerarquía
* usabilidad

```

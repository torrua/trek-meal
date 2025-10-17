# Typography System

## Overview
This project uses a unified typography system with consistent font family, weights, and sizes across all components.

## Font Family
All text uses the same system font stack for optimal performance and native appearance:

```css
system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
'Helvetica Neue', sans-serif
```

**Benefits:**
- ✅ No external font downloads (faster page load)
- ✅ Native OS appearance
- ✅ Excellent cross-platform support
- ✅ Consistent rendering

## Font Weights

The system uses only **3 font weights** for consistency:

| Weight | Value | Usage |
|--------|-------|-------|
| **Regular** | 400 | Body text, paragraphs, default text |
| **Medium** | 500 | Labels, buttons, h3, h4, emphasis |
| **Semibold** | 600 | h1, h2, strong text, important headings |

## Typography Hierarchy

### Headings
- **h1**: 24px (text-2xl), weight 600, tight leading
- **h2**: 20px (text-xl), weight 600, tight leading  
- **h3**: 18px (text-lg), weight 500, tight leading
- **h4**: 16px (text-base), weight 500, snug leading

### Body Text
- **Default**: 15px, weight 400, relaxed leading (1.5)
- **Labels**: weight 500
- **Buttons**: weight 500
- **Strong/Bold**: weight 600

## Implementation

All typography is defined in `src/index.css` in the `@layer base` section:

```css
body {
  font-family: system-ui, -apple-system, ...;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
}

h1 { font-weight: 600; }
h2 { font-weight: 600; }
h3 { font-weight: 500; }
label { font-weight: 500; }
button { font-weight: 500; }
strong, b { font-weight: 600; }
```

## Guidelines

### ✅ DO:
- Use semantic HTML elements (h1, h2, h3, p, label, etc.)
- Let CSS handle font weights automatically
- Use Tailwind size utilities (text-sm, text-base, text-lg)
- Rely on the unified system for consistency

### ❌ DON'T:
- Add custom `font-family` declarations
- Use `font-bold` (700) or `font-light` (300) classes
- Override font weights unless absolutely necessary
- Import external fonts

## Tailwind Classes

When you need to override defaults, use these classes sparingly:

- **Sizes**: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`
- **Weights**: Avoid using `font-*` classes; rely on semantic HTML
- **Colors**: Use theme colors (`text-foreground`, `text-muted-foreground`, etc.)

## Migration Notes

All font-related properties have been:
1. ✅ Removed from `tailwind.config.js` (custom font families and sizes)
2. ✅ Centralized in `src/index.css` 
3. ✅ Applied consistently across all components
4. ✅ Tested and verified in production build

## Maintenance

To modify the typography system:
1. Edit `src/index.css` in the `@layer base` section
2. Test across all pages and components
3. Run `npm run build` to verify no errors
4. Update this documentation

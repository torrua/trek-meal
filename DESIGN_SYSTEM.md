# Trek Meal - Notion-Style Design System

## 🎨 Design Philosophy

**Modern • Minimalistic • Fresh • Informative**

This design system creates a clean, Notion-inspired interface that prioritizes:
- **Clarity**: Information is easy to scan and understand
- **Consistency**: Predictable patterns across all components
- **Breathing room**: Generous spacing for visual comfort
- **Subtle depth**: Soft shadows and borders for hierarchy
- **Smooth interactions**: Polished micro-animations

---

## 📐 Current State Analysis

### ✅ Strengths
- Clean typography system with system fonts
- Good component structure (EntityCard, Modal, Button)
- Responsive layout with sidebar
- Dark mode support
- Consistent icon usage (Lucide)

### 🔧 Areas for Improvement
1. **Spacing**: Inconsistent padding/margins (mix of p-3, p-4, p-6)
2. **Colors**: Need more semantic color tokens
3. **Shadows**: Too subtle, need more depth variation
4. **Borders**: Inconsistent border styles and colors
5. **Hover states**: Need more polish and consistency
6. **Empty states**: Could be more engaging
7. **Cards**: Need better visual hierarchy
8. **Forms**: Input styles need refinement

---

## 🎨 Design Tokens

### Spacing Scale (Notion-inspired)
```
xs:  4px   - Tight spacing within components
sm:  8px   - Small gaps between related items
md:  16px  - Default spacing between sections
lg:  24px  - Large gaps between major sections
xl:  32px  - Extra large spacing for page sections
2xl: 48px  - Maximum spacing for page layouts
```

### Border Radius
```
sm:  6px   - Small elements (badges, tags)
md:  8px   - Default (buttons, inputs, small cards)
lg:  12px  - Large cards and containers
xl:  16px  - Modals and major containers
2xl: 20px  - Hero sections
```

### Shadows (Notion-style)
```
xs:  0 1px 2px rgba(0,0,0,0.04)           - Subtle lift
sm:  0 2px 4px rgba(0,0,0,0.06)           - Cards at rest
md:  0 4px 12px rgba(0,0,0,0.08)          - Hover states
lg:  0 8px 24px rgba(0,0,0,0.12)          - Modals, dropdowns
xl:  0 16px 48px rgba(0,0,0,0.16)         - Major overlays
```

### Colors (Semantic)

#### Light Mode
```css
--background: #ffffff
--foreground: #37352f
--muted: #f7f6f3
--muted-foreground: #9b9a97
--border: rgba(55, 53, 47, 0.09)
--card: #ffffff
--card-hover: #fafaf9

--primary: #2383e2
--primary-hover: #1a6ec7
--success: #0f7b6c
--warning: #f59e0b
--danger: #ef4444
--info: #3b82f6
```

#### Dark Mode
```css
--background: #191919
--foreground: #ffffff
--muted: #2a2a2a
--muted-foreground: #9b9a97
--border: rgba(255, 255, 255, 0.08)
--card: #1f1f1f
--card-hover: #252525
```

---

## 🧩 Component Patterns

### Card Hierarchy
1. **Resting State**: Subtle border, minimal shadow
2. **Hover State**: Slight lift, increased shadow, border color change
3. **Active/Selected**: Accent border, tinted background
4. **Focus**: Ring outline for accessibility

### Interactive Elements
- **Transition duration**: 150-200ms for most interactions
- **Easing**: ease-out for natural feel
- **Hover lift**: 1-2px translateY
- **Active press**: scale(0.98) for tactile feedback

### Typography Hierarchy
```
Page Title:    text-2xl (24px) • weight-600 • mb-6
Section Title: text-xl (20px)  • weight-600 • mb-4
Card Title:    text-base (16px) • weight-500 • mb-2
Body Text:     text-sm (14px)  • weight-400
Small Text:    text-xs (12px)  • weight-400
Labels:        text-xs (12px)  • weight-500 • uppercase • tracking-wide
```

---

## 📋 Implementation Checklist

### Phase 1: Foundation
- [ ] Update CSS variables with refined color tokens
- [ ] Standardize spacing scale across components
- [ ] Refine shadow system
- [ ] Update border radius values

### Phase 2: Components
- [ ] EntityCard: Better shadows, hover states, spacing
- [ ] Button: Refined variants, better active states
- [ ] Modal: Improved backdrop, animations
- [ ] Sidebar: Better active states, spacing
- [ ] Forms: Consistent input styles

### Phase 3: Polish
- [ ] Smooth transitions on all interactive elements
- [ ] Empty states with illustrations
- [ ] Loading states
- [ ] Micro-interactions (button press, card select)
- [ ] Responsive refinements

### Phase 4: Details
- [ ] Icon consistency
- [ ] Color contrast validation
- [ ] Accessibility improvements
- [ ] Dark mode refinements

---

## 🎯 Key Improvements to Implement

### 1. Card Components
**Current**: Basic border, minimal shadow
**Target**: Notion-style with subtle depth, smooth hover

### 2. Spacing
**Current**: Inconsistent (p-3, p-4, p-6 mixed)
**Target**: Consistent scale (p-4 for cards, p-6 for containers)

### 3. Shadows
**Current**: Very subtle
**Target**: More pronounced depth hierarchy

### 4. Colors
**Current**: Basic semantic colors
**Target**: Richer palette with hover states

### 5. Typography
**Current**: Good foundation
**Target**: More refined hierarchy with better spacing

---

## 📱 Responsive Breakpoints
```
sm:  640px  - Mobile landscape
md:  768px  - Tablet
lg:  1024px - Desktop
xl:  1280px - Large desktop
2xl: 1536px - Extra large
```

---

## ♿ Accessibility
- Minimum contrast ratio: 4.5:1 for text
- Focus indicators on all interactive elements
- Keyboard navigation support
- ARIA labels where needed
- Reduced motion support

---

## 🚀 Next Steps
1. Implement refined design tokens in index.css
2. Update EntityCard component
3. Refine Button variants
4. Enhance Modal component
5. Polish Sidebar navigation
6. Update all page layouts for consistency

---
trigger: always_on
---

# UI Design System - Компактное руководство для AI

## 🎨 Цвета

### Базовые

```css
--foreground: #37352f /* основной текст */ --muted-foreground: #9b9a97 /* второстепенный */
  --border: #e9e9e7 /* границы */ --card-hover: #fafaf9 /* hover фон */;
```

### Семантические

```css
--primary: #2383e2 /* синий - действия */ --danger: #eb5757 /* красный - удаление */
  --success: #0f7b6c /* зеленый */ --warning: #f59e0b /* желтый */;
```

### Типы контента

- **Blue** (`text-blue-500/600`) - продукты
- **Orange** (`text-orange-500/600`) - блюда

### КБЖУ (всегда одинаковые)

- Калории: `text-orange-600` (Flame)
- Белки: `text-blue-600` (Beef)
- Жиры: `text-yellow-600` (Droplet)
- Углеводы: `text-green-600` (Wheat)
- Вес: `text-muted-foreground` (Weight)

---

## 📝 Типографика

### Font

```css
font-family:
  'Inter',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  sans-serif;
```

### Размеры

```tsx
text-lg font-semibold    // H2 заголовки секций
text-sm font-semibold    // H3 заголовки карточек
font-medium              // H4 подзаголовки
text-sm text-foreground  // основной текст
text-xs text-muted-foreground // второстепенный
```

### Weights

- `font-medium` (500) - обычный акцент
- `font-semibold` (600) - сильный акцент, заголовки
- **НЕ используй** `font-bold` (700)

---

## 🔘 Кнопки

### Размеры

```tsx
size = 'default'; // h-9 px-4 (36px)
size = 'sm'; // h-8 px-3 (32px)
size = 'lg'; // h-11 px-6 (44px)
size = 'icon'; // h-9 w-9 (квадрат)
size = 'icon-sm'; // h-8 w-8 (квадрат)
```

### Варианты

```tsx
variant = 'primary'; // bg-primary, shadow-sm
variant = 'danger'; // bg-danger, shadow-sm
variant = 'secondary'; // bg-muted, border
variant = 'ghost'; // transparent, border-transparent
variant = 'outline'; // border, bg-card
```

### Custom actions

```tsx
// Редактирование (синяя)
className = '!border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/15 text-blue-600';

// Удаление (красная)
className = '!border-danger/20 bg-danger/10 hover:bg-danger/15 text-danger';
```

---

## 🎯 Иконки

### Размеры по контексту

```tsx
w-4 h-4      // 16px - основные (кнопки, карточки)
w-3.5 h-3.5  // 14px - метаданные, КБЖУ
w-3 h-3      // 12px - dropdown, мелкие элементы
w-5 h-5      // 20px - chevron в секциях
w-12 h-12    // 48px - empty states
```

### Критично

```tsx
// ВСЕГДА добавляй flex-shrink-0
<Icon className="w-4 h-4 text-primary flex-shrink-0" />
```

---

## 📐 Spacing

### Gap (между элементами)

```tsx
gap - 1; // 4px  - очень плотно (КБЖУ)
gap - 2; // 8px  - стандарт (иконка + текст)
gap - 3; // 12px - просторно
```

### Padding

```tsx
p-4      // 16px - карточки
p-6      // 24px - секции
px-3 py-2.5 // inputs, list items
```

### Vertical spacing

```tsx
space - y - 1; // 4px  - ингредиенты
space - y - 3; // 12px - элементы в группе
space - y - 6; // 24px - секции на странице
```

### Border Radius

```tsx
rounded - xl; // 12px - карточки, секции
rounded - lg; // 8px  - кнопки, inputs
rounded - md; // 6px  - мелкие элементы
```

---

## 🎨 Эффекты

### Тени

```tsx
shadow - sm; // hover для карточек
shadow - md; // hover для кнопок
shadow - lg; // dropdown
```

### Transitions

```tsx
transition-all duration-200  // стандарт для всех
transition-colors            // только цвет
```

### Gradients (для секций)

```tsx
// Основная информация
from-blue-500/5 via-purple-500/5 to-pink-500/5

// Состав/композиция
from-orange-500/5 via-yellow-500/5 to-green-500/5
```

### Hover

```tsx
// Карточка
hover:bg-card-hover hover:border-border-hover hover:shadow-sm

// Кнопка primary
hover:bg-primary-hover hover:shadow-md hover:-translate-y-0.5

// Кнопка ghost
hover:bg-muted/60 hover:border-border
```

---

## 📦 Типичные паттерны

### Header секции

```tsx
<div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b">
  <div className="flex items-center gap-3">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <h2 className="text-lg font-semibold">Заголовок</h2>
  </div>
</div>
```

### Иконка + текст

```tsx
<div className="flex items-center gap-2">
  <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
  <span className="text-sm font-medium">Текст</span>
</div>
```

### Карточка (EntityCard)

```tsx
<div
  className="
  rounded-xl border border-border p-4
  bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5
  transition-all duration-200
  hover:bg-card-hover hover:shadow-sm
"
>
  {/* Header: Icon + Title + Menu */}
  {/* Description (optional) */}
  {/* Footer: Details/Nutrition */}
</div>
```

### КБЖУ блок

```tsx
<div className="flex items-center gap-2 text-xs">
  <div className="flex items-center gap-1">
    <Flame className="w-3 h-3 text-orange-500 flex-shrink-0" />
    <span className="font-semibold text-orange-600/90">{calories}</span>
  </div>
  {/* Белки, Жиры, Углеводы аналогично */}
</div>
```

---

## ✅ Checklist

Перед коммитом проверь:

- [ ] Все иконки имеют `flex-shrink-0`
- [ ] Текст с `truncate` имеет `min-w-0` на родителе
- [ ] Transitions указаны явно (`duration-200`)
- [ ] Карточки: `rounded-xl`, градиент, `hover:shadow-sm`
- [ ] Кнопки: явный `size` и `variant`
- [ ] КБЖУ: правильные цвета (orange/blue/yellow/green)
- [ ] Gap кратен 4px (`gap-1/2/3/4`)
- [ ] Font weights: только `medium` или `semibold`

---

## ⚠️ НЕ делай

❌ `font-bold` (700) - не используется
❌ `text-base` для обычного текста - только `text-sm/xs`
❌ Произвольные цвета (`text-gray-500`) - только семантические
❌ `rounded` без размера - всегда `rounded-xl/lg/md`
❌ Произвольный spacing (`gap-5`) - только 1/1.5/2/3/4/6
❌ Забыть `min-w-0` для flex с `truncate`
❌ Transitions во время drag (`isDragging ? 'none' : transition`)
❌ `z-index` больше 50

---

## 📱 Adaptive

```tsx
hidden sm:flex      // показать на desktop
sm:hidden           // показать на mobile
flex-col sm:flex-row // вертикально → горизонтально
gap-2 sm:gap-4      // увеличить gap на desktop
```

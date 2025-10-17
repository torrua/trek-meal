# Исправление высоты элементов форм

## 🔴 Проблема

Элементы формы имели **разную высоту**:
- `Input` - 40px (h-10)
- `DropdownSelect` - ~48px (py-3 создавал больше высоты)
- `ThemedSelect` (react-select) - ~38px (по умолчанию)

Это создавало **визуальную несогласованность** в формах.

---

## ✅ Решение

### **1. DropdownSelect** (`src/ui/DropdownSelect.tsx`)

**Изменения:**
```tsx
// БЫЛО
'flex items-center justify-between w-full px-4 py-3'
'notion-shadow-sm hover:notion-shadow'
'bg-card border notion-border-subtle'

// СТАЛО
'flex items-center justify-between w-full h-10 px-4 py-2'
'bg-background border-border hover:border-border-hover'
```

**Результат:**
- ✅ Высота теперь `h-10` (40px) - как у Input
- ✅ Padding `py-2` вместо `py-3`
- ✅ Убрали лишние тени
- ✅ Унифицированные цвета границ

---

### **2. Иконка в DropdownSelect**

**Изменения:**
```tsx
// БЫЛО - иконка в контейнере
<div className="w-6 h-6 rounded-md bg-muted/50 border">
  <Icon className="w-3.5 h-3.5" />
</div>

// СТАЛО - простая иконка как в Input
<Icon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
```

**Результат:**
- ✅ Иконка теперь такого же размера как в Input (w-4 h-4)
- ✅ Убрали лишний контейнер
- ✅ Упрощенный дизайн

---

### **3. ThemedSelect** (`src/hooks/useThemeAwareSelectStyles.ts`)

**Изменения:**
```tsx
control: (base) => ({
  ...base,
  minHeight: '40px',      // Добавлено
  height: '40px',         // Добавлено
  borderRadius: '0.5rem', // Добавлено (8px как у Input)
  // ...
}),
valueContainer: (base) => ({
  ...base,
  padding: '0 16px',      // Как у Input (px-4)
  height: '40px',         // Фиксированная высота
}),
input: (base) => ({
  ...base,
  margin: '0',            // Убрали margin
  padding: '0',           // Убрали padding
}),
```

**Результат:**
- ✅ React-select теперь 40px высотой
- ✅ Правильный padding (16px = px-4)
- ✅ Скругление углов как у Input (0.5rem = 8px)

---

### **4. Меню DropdownSelect**

**Изменения:**
```tsx
// БЫЛО
'border notion-border-subtle'

// СТАЛО
'border border-border'
```

**Результат:**
- ✅ Консистентные границы

---

## 📊 До и После

### **До**
```
Input:          ████████████ (40px, h-10)
DropdownSelect: ██████████████ (~48px, py-3)
ThemedSelect:   ███████████ (~38px, default)
```

### **После**
```
Input:          ████████████ (40px, h-10)
DropdownSelect: ████████████ (40px, h-10)
ThemedSelect:   ████████████ (40px, fixed)
```

---

## 🎯 Унифицированные параметры

Все элементы форм теперь имеют:

| Параметр | Значение |
|----------|----------|
| Высота | `40px` (`h-10`) |
| Padding X | `16px` (`px-4`) |
| Padding Y | `8px` (`py-2`) |
| Border Radius | `8px` (`rounded-lg`) |
| Border Color | `border-border` |
| Hover Border | `border-border-hover` |
| Focus Border | `border-primary/60` |
| Background | `bg-background` |
| Focus Background | `bg-card` |

---

## 📁 Измененные файлы

1. ✅ `src/ui/DropdownSelect.tsx`
   - Высота h-10
   - Упрощенная иконка
   - Унифицированные границы

2. ✅ `src/hooks/useThemeAwareSelectStyles.ts`
   - Фиксированная высота 40px
   - Правильный padding
   - Скругление углов

---

## ✨ Результат

Теперь **все элементы форм имеют одинаковую высоту** и выглядят согласованно:
- Input
- Textarea (по высоте отличается, но стиль границ тот же)
- DropdownSelect
- ThemedSelect (react-select)

**Визуальная консистентность достигнута!** ✅

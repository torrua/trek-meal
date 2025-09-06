# One-Line List Item Standards

## Overview

This document establishes unified standards for one-line list item components that are separate from EntityCard usage, following the Unified UI Component Design, Interaction, and Layout Standards.

## Component Usage Guidelines

### EntityCard

- **Purpose**: Main object lists on the left sidebar
- **Usage**: Primary navigation lists (TripsPage, ParticipantsPage, etc.)
- **Features**: Selection states, main context menus, card-style layout
- **Reserved for**: Main object navigation and selection

### ListItem Components

- **Purpose**: One-line views in detail sections and sub-lists
- **Usage**: Detail views, accordion content, related item lists
- **Features**: Compact layout, hover context menus, status indicators
- **Replaces**: CompactCard when one-line style with context actions is needed
- **Layout**: Two-section structure with justify-between for visual balance

## Current ListItem Components

### 1. TripListItem

- **File**: `src/components/participants/TripListItem.tsx`
- **Usage**: Trip items in participant detail sections
- **Layout**: `Status • Title • Place _______ Date • Participants • Equipment + context menu`
- **Left Section**: Status icon (priority) • Title • Place (conditional)
- **Right Section**: Date (conditional) • Participants • Equipment + context menu
- **Actions**: View, Remove
- **Icon Priority**: Status before difficulty (difficulty icon hidden)
- **Spacing**: gap-x-1.5 for compact bullet points, gap-4 before context menu

### 2. ParticipantListItem

- **File**: `src/components/trips/ParticipantListItem.tsx`
- **Usage**: Participant items in trip detail sections
- **Layout**: Two-section structure with `justify-between`
- **Left Section**: Experience icon • Name • Age (core identity)
- **Right Section**: Trips count • Equipment count + context menu
- **Actions**: View, Remove
- **Spacing**: gap-x-1.5 for compact bullet points, gap-4 before context menu
- **Experience**: Colored icon in left section only, no duplication

### 3. TripListItemForMain

- **File**: `src/components/trips/TripListItemForMain.tsx`
- **Usage**: Trip items in main lists (alternative to EntityCard)
- **Layout**: `Difficulty • Trip Name • Place _______ Status • Date • Participants + context menu`
- **Actions**: Select, Edit, Clone, Export, Delete
- **Features**: Selection states with ring highlight
- **Icon Priority**: Difficulty shown in main lists (different from detail views)

### 4. ProductListItem

- **File**: `src/components/products/ProductListItem.tsx`
- **Usage**: Product items in category detail sections (one-line view)
- **Layout**: `Package • Product Name _______ Calories • Nutrition + context menu`
- **Left Section**: Package icon • Product Name
- **Right Section**: Calories (Flame) • Combined nutrition (Dna) + context menu
- **Actions**: View, Edit, Delete
- **Border**: Category-based coloring
- **Features**: Compact combined nutrition display for one-line view

### 5. PortionListItem

- **File**: `src/components/products/PortionListItem.tsx`
- **Usage**: Portion items in product detail sections
- **Layout**: `Package • Portion Name _______ Weight + context menu`
- **Left Section**: Package icon • Portion Name
- **Right Section**: Weight with Scale icon + context menu
- **Actions**: Edit, Delete
- **Border**: Neutral gray coloring
- **Features**: Weight display with scale icon

### 6. DishProductListItem (Detail Pattern)

- **File**: `src/components/dishes/DishDetail.tsx` (inline implementation)
- **Usage**: Product composition items in dish detail view with enhanced nutrition context
- **Layout**: `Package • Product Name _______ Weight + context menu`
- **Left Section**: Package icon • Product Name
- **Right Section**: Weight with Scale icon + context menu
- **Actions**: Open Product (navigates to /products), Edit Portion, Delete Product (conditional)
- **Border**: Category-based coloring from product's category
- **Features**:
  - Category-based left border coloring
  - Context menu with functional Open Product navigation and Edit Portion actions
  - Conditional delete button (only when dish has >1 product)
  - Nutritional summary moved to detail block header alongside dish name and total weight
  - Enhanced hover states for delete actions (red backgrounds)
  - Semantic nutrition icons (Flame, Zap, Droplet, Wheat) with compact w-3 h-3 sizing

## Standard Design Patterns

### Mandatory Layout Structure

```jsx
<div className="flex items-center justify-between">
  {/* Left section: Primary info (icon • title • status) */}
  <div className="flex items-center gap-x-1.5 text-sm min-w-0">
    <PrimaryIcon className="w-4 h-4" />
    <span className="text-gray-400 dark:text-gray-500 text-xs select-none">•</span>
    <Title className="font-semibold text-gray-900 dark:text-white truncate" />
    {conditionalInfo && (
      <>
        <span className="text-gray-400 dark:text-gray-500 text-xs select-none">•</span>
        <ConditionalInfo />
      </>
    )}
  </div>

  {/* Right section: Data metrics + context menu */}
  <div className="flex items-center gap-4">
    <div className="flex items-center gap-x-1.5 text-sm">
      <DataMetrics />
    </div>
    <ContextMenu className="opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
</div>
```

### Unified Styling Standards

- **Container**: `group relative bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-l-4 px-3 py-2`
- **Hover**: `hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600`
- **Icons**: Mandatory `w-4 h-4` sizing for all icons
- **Spacing**: `gap-x-1.5` for compact bullet points, `gap-4` before context menu
- **Bullets**: `text-gray-400 dark:text-gray-500 text-xs select-none` with conditional rendering
- **Text**: `font-semibold text-gray-900 dark:text-white truncate` for titles

### Status Border Colors (Mandatory)

```typescript
// Status-based border color (overrides all other border logic)
const statusBorderColor =
  effectiveStatus === 'planning'
    ? '#f97316' // orange-600 (matches text-orange-600)
    : effectiveStatus === 'active'
      ? '#9333ea' // purple-600 (matches text-purple-600)
      : '#4b5563'; // gray-600 (matches text-gray-600)
```

### Status Icon Colors (Must Match Border)

```typescript
// Status indicators with distinct color families
const statusIconColor =
  effectiveStatus === 'planning'
    ? 'text-orange-600 dark:text-orange-400'
    : effectiveStatus === 'active'
      ? 'text-purple-600 dark:text-purple-400'
      : 'text-gray-600 dark:text-gray-400';
```

### Context Menu Standards

- **Container**: `opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1`
- **Compact Buttons**: `p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors`
- **Delete Actions**: `hover:bg-red-100 dark:hover:bg-red-900/50` with `text-red-600 dark:text-red-400`
- **Icons**: Mandatory `w-4 h-4 text-gray-600 dark:text-gray-300`
- **Separation**: `gap-4` spacing before context menu for clear visual separation

## Mandatory Implementation Rules

### Icon Sizing and Consistency

- **ALL icons** must use `w-4 h-4` classes without exception
- **Status icons** must appear before difficulty icons in detail views
- **Experience icons** appear only in headers, never duplicated in detail lines
- **Difficulty icons** are hidden in TripListItem but shown in TripListItemForMain

### Visual Hierarchy Priority

1. **Status** (dynamic state) - highest priority
2. **Title/Name** (identity) - primary content
3. **Place/Age** (context) - secondary content
4. **Metrics** (counts/dates) - quantitative data
5. **Actions** (context menu) - interaction layer

### Color Consistency Rules

- **Border colors** must exactly match status icon colors using hex values
- **Experience colors**: `text-green-500` for beginner, `text-yellow-500` for experienced, `text-red-500` for professional
- **Status colors**: Use distinct families to avoid selection state conflicts
- **Both icon and text** must use same color class for consistency

### Layout Requirements

- **Two-section structure** with `justify-between` is mandatory
- **Left section**: Primary content (icon • name • status)
- **Right section**: Data metrics + context menu
- **Conditional rendering** for bullet points to prevent empty spacing
- **Fixed spacing** (`gap-2`) regardless of content value (0 vs positive numbers)

### Migration Strategy

### ✅ Phase 1: ALL Components Completed and Compliant

- **TripListItem**: ✅ Status-priority layout with hidden difficulty, `w-4 h-4` icons, experience-based borders
- **ParticipantListItem**: ✅ Experience in header only, `w-4 h-4` icons, experience-based borders
- **TripListItemForMain**: ✅ Main list alternative with selection states, `w-4 h-4` icons, status-based borders
- **ProductListItem**: ✅ NEW - Created following unified standards, `w-4 h-4` icons, category-based borders
- **PortionListItem**: ✅ NEW - Created for product portion management, `w-4 h-4` icons, neutral borders

### ✅ Phase 2: CompactCard Migration Complete

- **CategoryDetail**: ✅ Now uses ProductListItem instead of CompactCard
- **CompactCard**: Deprecated for ListItem usage, kept only for legacy non-ListItem cases
- **All components**: Follow two-section layout with `justify-between`

### ✅ Phase 3: Full Standards Compliance Achieved

- ✅ All list items follow mandatory two-section layout
- ✅ All icons consistently sized at `w-4 h-4`
- ✅ All components use proper color scheme compliance
- ✅ All context menus have `gap-4` spacing
- ✅ All borders match their primary indicator colors
- ✅ All bullet points use conditional rendering

## 🎯 IMPLEMENTATION STATUS: **COMPLETE**

**All ListItem components now fully comply with Unified UI Component Design, Interaction, and Layout Standards.**

## Component Selection Matrix

| Use Case                   | Component                     | Layout              | Features              |
| -------------------------- | ----------------------------- | ------------------- | --------------------- |
| **Main sidebar lists**     | EntityCard                    | Card-style          | Selection, main menus |
| **Detail sub-lists**       | {Entity}ListItem              | One-line, compact   | Context actions       |
| **Main list alternatives** | {Entity}ListItemForMain       | One-line, enhanced  | Selection + context   |
| **Legacy products**        | CompactCard → ProductListItem | Migrate to standard | Follow unified rules  |

### EntityCard vs ListItem Display Patterns

- **EntityCard (ProductsPage)**: Separates nutrition into individual detail items (Calories • Proteins • Fats • Carbs)
- **ProductListItem (CategoryDetail)**: Combines nutrition for compact one-line display (Calories • Combined BJU)
- **Reasoning**: EntityCard has more vertical space for detailed breakdown; ListItem optimizes for horizontal space

### Naming Convention

- `{Entity}ListItem`: Detail view sub-lists (TripListItem, ParticipantListItem)
- `{Entity}ListItemForMain`: Main list alternatives (TripListItemForMain)
- Migration: CompactCard → ProductListItem

## Quality Assurance Checklist

### Before Implementation:

- [ ] Two-section layout with `justify-between`
- [ ] All icons sized `w-4 h-4`
- [ ] Status-based border coloring
- [ ] Proper visual hierarchy (status → title → context)
- [ ] Context menu with `gap-4` separation
- [ ] Conditional bullet rendering
- [ ] Color consistency (icon + text matching)

### After Implementation:

- [ ] No selection state conflicts
- [ ] Uniform height across similar components
- [ ] Proper hover states and transitions
- [ ] Accessibility labels and tooltips
- [ ] Responsive truncation behavior

This ensures complete compliance with Unified UI Component Design, Interaction, and Layout Standards across all list item implementations.

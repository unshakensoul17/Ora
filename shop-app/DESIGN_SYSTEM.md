# Fashcycle Shop App - Design System Documentation

## Overview
Modern, premium, minimal design with **green as the primary brand color**. The design emphasizes clarity, hierarchy, and usability while maintaining a sophisticated dark aesthetic.

---

## 🎨 Design Tokens

### Color Palette

#### Background
```typescript
background: '#0B0F0D'  // Main app background - Very dark green-tinted black
card: '#101814'        // Card surfaces - Slightly lighter dark green
border: '#1F2A23'      // Borders and dividers - Subtle green tint
```

#### Brand Green (Primary)
```typescript
primary: '#1DB954'         // Spotify-inspired vibrant green - Primary actions
primaryDark: '#0F2A1D'     // Dark green for backgrounds
primaryGlow: 'rgba(29, 185, 84, 0.15)'  // Subtle glow effect
```

#### Text Hierarchy
```typescript
textPrimary: '#FFFFFF'     // Main headings and important text
textSecondary: '#9CA3AF'   // Body text and labels
textTertiary: '#6B7280'    // De-emphasized text
```

#### Accent Colors
```typescript
success: '#10B981'   // Success states (green)
warning: '#F59E0B'   // Warnings
error: '#EF4444'      // Errors
```

---

### Typography

```typescript
heading: {
  fontSize: 20,
  fontWeight: '600'
}

kpiNumber: {
  fontSize: 30,
  fontWeight: '700'
}

kpiLabel: {
  fontSize: 13,
  fontWeight: '500'
}

bodySmall: {
  fontSize: 12,
  fontWeight: '400'
}

button: {
  fontSize: 14,
  fontWeight: '600'
}
```

---

### Spacing Scale

```typescript
xs: 4px    // Tight spacing
sm: 8px    // Small gaps
md: 12px   // Medium gaps  
lg: 16px   // Standard padding
xl: 20px   // Large padding
xxl: 24px  // Extra large gaps
```

---

## 📱 UI Components

### 1. Primary Action (Scan QR)
**Design:** Large, prominent card with green border and subtle glow

**Characteristics:**
- 2px green border (#1DB954)
- Green glow overlay (rgba(29, 185, 84, 0.15))
- 48x48 green icon background
- Green text and arrow
- Full-width, stands out from other actions

**Purpose:** Most important action - scanning QR codes for pickup/return

---

### 2. Secondary Actions
**Design:** Neutral cards with subtle borders

**Characteristics:**
- Dark card background (#101814)
- Subtle border (#1F2A23)
- Gray icons and text
- Side-by-side layout
- Equal width distribution

**Purpose:** Supporting actions like "Add Item" and "View Holds"

---

### 3. KPI Cards
**Design:** Uniform dark cards with ONE green highlight

**Characteristics:**
- All cards: Dark background (#101814) with subtle border
- Active Holds ONLY: Green border + dark green background for emphasis
- 30px bold numbers
- 13px labels in gray
- 2-column grid layout

**Key Change:** Removed multi-colored backgrounds - now all neutral except Active Holds

---

### 4. Monthly Stats Card
**Design:** Clean card showing walk-in metrics

**Characteristics:**
- Large 48px number
- Section divider line
- Green accent for revenue amount
- Breathing room with proper padding

---

### 5. Revenue Card
**Design:** Side-by-side comparison with divider

**Characteristics:**
- Current month in green (#1DB954)
- Last month in gray for comparison
- Vertical divider between columns
- Clean, scannable layout

---

## 🎯 Bottom Navigation

### Design Philosophy
- **Elevated center button** for Scanner (primary action)
- Green accent for active state
- Clean, minimal styling

### Specifications

**Tab Bar:**
- Background: #0B0F0D
- Border: #1F2A23 (1px top)
- Height: 70px
- Active color: #1DB954 (green)
- Inactive color: #6B7280 (gray)

**Scanner Button (Center):**
- Size: 56x56 circle
- Margin top: -20px (elevated)
- Background when active: #1DB954
- Background when inactive: #0F2A1D
- Border: 3px #0B0F0D (creates separation)
- Icon: White when active, green when inactive

---

## 📐 Layout Sections

### Header
- Greeting: 14px gray text
- Shop name: 24px white, semibold
- 24px bottom margin

### Primary Action
- Full-width card
- 16px padding
- 16px bottom margin
- Green highlight (border + glow)

### Secondary Actions
- 2-column layout
- 12px gap between
- 24px bottom margin

### KPI Section  
- Section title: 20px white
- 2x2 grid
- 12px gaps
- Only "Active Holds" gets green treatment

### Cards
- 16-20px padding
- 16px border radius
- 1px border
- Proper spacing between sections

---

## ✨ Key Design Principles

1. **Green is special** - Only used for primary actions and key metrics
2. **Consistent neutrality** - All backgrounds dark, minimal color variation
3. **Clear hierarchy** - Typography and spacing create natural flow
4. **Breathing room** - Generous padding and spacing
5. **Accessibility** - High contrast, readable sizes
6. **Premium feel** - Refined, not cluttered

---

## 🚀 Implementation Notes

- All colors defined as constants at top of file
- Typography tokens ensure consistency
- Spacing scale prevents arbitrary values
- Reusable patterns across components
- Easy to maintain and extend

---

## 📊 Before vs After

### Before Issues:
❌ Multi-colored KPI cards (purple, brown, blue backgrounds)  
❌ Gold/yellow color competing with green brand
❌ Scanner not emphasized as primary action
❌ Inconsistent spacing and typography
❌ Bottom nav too short, no elevated primary button

### After Improvements:
✅ Single neutral card background throughout  
✅ Green only for primary/important elements  
✅ Scan QR prominently highlighted  
✅ Consistent spacing (12-16-20-24px scale)  
✅ Elevated green scanner button in nav  
✅ Clean, premium, minimal aesthetic  

---

## 💎 Result

A **modern, premium dashboard** that:
- Puts green brand front-and-center
- Emphasizes the most important action (Scan QR)
- Maintains clean, minimal aesthetic
- Provides excellent readability and hierarchy
- Looks professional and polished

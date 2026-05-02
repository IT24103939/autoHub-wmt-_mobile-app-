# Using JPG Images Instead of Emojis - Setup Guide

## Step 1: Add JPG Files to Icons Folder

Place your JPG image files in: `d:\wmt\src\assets\icons\`

**Example files to add:**
```
car.jpg              - For vehicle/garage representation
star.jpg             - For ratings/reviews
money.jpg            - For pricing/payments
wrench.jpg           - For maintenance/repair services
check.jpg            - For completed/verified status
clock.jpg            - For appointments/time
```

## Step 2: Register Your Images

Edit `src/constants/imageAssets.ts` and add your new JPG files:

```typescript
export const imageAssets = {
  // ... existing icons ...
  
  // Add your new JPGs
  car: require('../assets/icons/car.jpg'),
  star: require('../assets/icons/star.jpg'),
  money: require('../assets/icons/money.jpg'),
  wrench: require('../assets/icons/wrench.jpg'),
  check: require('../assets/icons/check.jpg'),
  clock: require('../assets/icons/clock.jpg'),
};
```

## Step 3: Use in Your Components

### Simple Icon Usage
```typescript
import { Icon } from '../components/common/Icon';

export function MyComponent() {
  return (
    <View>
      <Icon name="car" size={32} />
      <Icon name="star" size={24} tintColor="#FF6B00" />
      <Icon name="money" size={28} />
    </View>
  );
}
```

### Icon with Label Usage
```typescript
import { IconLabel } from '../components/common/Icon';

export function RatingDisplay() {
  return (
    <IconLabel 
      iconName="star" 
      label="4.5 Stars" 
      iconSize={24}
    />
  );
}
```

### Replace Existing Emojis
**Before:**
```typescript
<Text>🚗 {garage.name}</Text>
<Text>⭐ {rating}</Text>
<Text>💰 {price}</Text>
```

**After:**
```typescript
<Icon name="car" size={20} />
<Text>{garage.name}</Text>

<Icon name="star" size={20} />
<Text>{rating}</Text>

<Icon name="money" size={20} />
<Text>{price}</Text>
```

## Step 4: Apply to Your Screens

### Admin Dashboard
Replace emoji indicators with images:
```typescript
// Dashboard status indicators
<Icon name="check" size={24} tintColor="#10B981" />
<Icon name="clock" size={24} tintColor="#3B82F6" />
```

### Garage Screen
```typescript
// Garage listing
<Icon name="workshop" size={40} />
<Icon name="star" size={20} />
<Text>{garage.rating}</Text>
```

### Spare Parts Screen
```typescript
// Product display
<Icon name="wrench" size={32} />
<Text>{sparePart.name}</Text>
<Icon name="money" size={20} />
<Text>{sparePart.price}</Text>
```

### Appointments Screen
```typescript
// Appointment time display
<Icon name="clock" size={24} />
<Text>{appointmentTime}</Text>
```

## Benefits of Using JPG Images Instead of Emojis

✅ **Consistent Styling** - Full control over appearance across platforms
✅ **Brand Consistency** - Use custom-designed icons matching your brand
✅ **Better Performance** - Images can be optimized
✅ **Accessibility** - Better alt-text support than unicode emojis
✅ **Professional Look** - More polished than emoji characters

## Tips

- Use **PNG** for icons that need transparency (like the Icon component with tintColor)
- Use **JPG** for photos/images with complex colors
- Set appropriate `size` prop based on context (smaller for inline, larger for emphasis)
- Use `tintColor` to dynamically color icons from the same source

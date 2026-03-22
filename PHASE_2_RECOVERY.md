# Phase 2 Recovery Status

## What Exists ✅

### Screens
1. **`app/dog/add.tsx`** - Complete add/edit dog form screen
2. **`app/dog/[id].tsx`** - Complete dog detail screen
3. **`app/(tabs)/index.tsx`** - Home screen (walk feed with nearby dogs)
4. **`app/(tabs)/profile.tsx`** - Profile screen with "My Dogs" section

### Base Components
- `components/avatar.tsx` ✅
- `components/button.tsx` ✅
- `components/card.tsx` ✅
- `components/empty-state.tsx` ✅
- `components/input.tsx` ✅
- `components/loading.tsx` ✅

## What's Missing ❌

### Hooks
1. **`hooks/use-dog.ts`** - Fetch single dog + owner data
2. **`hooks/use-dog-mutations.ts`** - Add/update/delete dog operations
3. **`hooks/use-nearby-dogs.ts`** - Fetch nearby dogs for walk feed
4. **`hooks/use-my-dogs.ts`** - Fetch current user's dogs

### Components
1. **`components/dog-card.tsx`** - Dog list card component
2. **`components/photo-picker.tsx`** - Image picker for dog photos
3. **`components/location-picker.tsx`** - Location picker component

### Lib Utilities
1. **`lib/location.ts`** - GPS utilities (getCurrentLocation, calculateDistance)
2. **`lib/storage.ts`** - Supabase Storage upload helpers

### Types
1. **`types/database.ts`** - TypeScript types (DogStatus, DogSize, Dog, Profile, etc.)

## Recovery Plan

I will now recreate all missing files based on:
1. The implementation from our previous conversation
2. The SPEC.md requirements
3. The usage patterns in the existing screens

## Files to Create (in order)

1. `types/database.ts` - Type definitions first
2. `lib/location.ts` - Location utilities
3. `lib/storage.ts` - Storage utilities
4. `hooks/use-dog.ts` - Single dog hook
5. `hooks/use-nearby-dogs.ts` - Nearby dogs hook
6. `hooks/use-my-dogs.ts` - My dogs hook
7. `hooks/use-dog-mutations.ts` - Dog CRUD operations
8. `components/dog-card.tsx` - Dog card component
9. `components/photo-picker.tsx` - Photo picker component
10. `components/location-picker.tsx` - Location picker component

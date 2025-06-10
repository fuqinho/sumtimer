# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Initial setup
cp .env .env.local  # Then fill in Firebase config
npm install

# Development server
npm run dev                     # Local development (port 5173)
npm run dev:emulator           # With Firebase emulator

# Chrome extension development
cd chrome_extension
npm install
npm run build
# Load unpacked extension from chrome_extension/dist/
```

### Testing
```bash
# Unit tests
npm run test:unit              # Run unit tests with Vitest

# E2E tests
npm run test:e2e:dev:emulator  # Open Cypress UI with emulator
npm run build:emulator         # Build for emulator testing
npm run test:e2e:emulator      # Run all E2E tests

# Run specific test file
npm run test:unit src/composables/__tests__/util.test.ts
```

### Build & Deploy
```bash
npm run lint         # ESLint with auto-fix
npm run type-check   # TypeScript type checking
npm run build        # Production build
npm run deploy       # Deploy to Firebase
```

## Architecture Overview

### Core Stack
- **Vue 3** with Composition API (`<script setup>`)
- **Pinia** for state management (reactive stores)
- **Quasar** UI framework
- **Firebase** (Firestore, Auth, Hosting, Functions)
- **TypeScript** throughout

### Data Flow Pattern
```
Firebase ↔ Pinia Stores → Vue Components
             ↓
        Cache Store (optimization)
```

### Store Architecture
The app uses a hierarchical store system where `auth-store` is the foundation:

1. **auth-store**: Manages Firebase Auth state and user session
2. **user-store**: User preferences (locale, theme)
3. **cache-store**: Denormalized data cache for performance
4. **category-store**: Category CRUD with ordering
5. **activity-store**: Activity CRUD linked to categories
6. **record-store**: Time tracking records with complex time frames
7. **ongoing-store**: Active timer state with pause/resume

### Key Patterns

#### Firebase Integration
- Real-time listeners with automatic cleanup on auth changes
- Batch writes for atomic multi-document updates
- Cache collection for optimized reads
- Emulator support via `VITE_USE_EMULATOR` env var

#### Store Updates
When modifying data, always:
1. Use batch operations for multi-document changes
2. Update the cache store when records change
3. Let Firestore listeners handle UI updates (don't manually sync)

Example pattern:
```typescript
const batch = writeBatch(getFirestore());
// Main document updates
batch.set/update/delete(...)
// Cache updates
batch.update(cacheRef, { activities: updatedActivities });
await batch.commit();
```

#### Component Structure
- Pages compose features, connect to stores
- Components are mostly presentational
- Business logic lives in stores
- Composables for reusable utilities

### Testing Approach
- **Unit tests**: Composables and utilities
- **E2E tests**: Full user flows with Firebase emulator
- Tests use pre-seeded emulator data in `cypress/firebase/data/`

### Development Notes

#### Environment Setup
- Copy `.env` to `.env.local` and fill Firebase config
- `EXTENSION_ID` is for Chrome extension integration
- Use emulator for local development to avoid production data

#### Chrome Extension
Companion extension in `chrome_extension/` for easier time tracking:
- Build with `npm run build` in extension directory
- Load unpacked in Chrome
- Add extension ID to `.env.local`

#### Firebase Schema
```
/users/{uid}          # User preferences
/categories/{id}      # Categories with weekly goals
/activities/{id}      # Activities linked to categories
/records/{id}         # Time tracking records
/ongoings/{uid}       # Current timing session (one per user)  
/cache/{uid}          # Denormalized performance cache
/configs/server       # Server configuration
```

#### Time Tracking Logic
- Records support pause/resume via `subs` array
- Ongoing records auto-finish after 30min pause
- Wake Lock API prevents screen sleep during timing
- All times stored as Firestore Timestamps

#### Routing
- `/` - Dashboard with weekly view
- `/activities` - Activity management
- `/activities/c/:cid` - Category filtered view
- `/activities/a/:aid/records` - Activity records
- `/history` - Historical records
- `/reports` - Monthly reports
- `/settings` - User preferences
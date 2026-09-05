# Bataa mobile

The active mobile entrypoint is Expo Router (`app/`) using Expo SDK 57,
React Native 0.86, React 19, and TypeScript. The home screen is responsive to
the device viewport and runs on iOS, Android, and React Native Web.

```bash
npm install
npm run start
```

Use `npm run ios`, `npm run android`, or `npm run web` for a platform-specific
launch. `npm run typecheck` and `npx expo-doctor` are the preflight checks.

The illustration assets are inline SVG components so they stay crisp at every
pixel density and do not require a third-party asset API at runtime.

# Sumtimer (sumtimer-web)

A timer app to record daily activities.

## How to build and run

### Create a Firebase project.

1. Go to [Firebase console](https://console.firebase.google.com/).
2. (ToBeWritten...)

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
cp .env .env.local
# Edit .env.local to fill Firebase configuration here.
# EXTENSION_ID can be left empty.
npm install
npm run dev
```

### Lint the files

```bash
npm run lint
```

### Build the app for production

```bash
npm run build
```

### Deploy the app for production

```bash
npm run deploy
```

### Test the app (unit tests)

```bash
npm run test:unit
```

### Test the app (e2e tests with Firebase emulator)

```bash
npm run test:e2e:dev:emulator # Open the UI to run tests separately.
```

```bash
npm run build:emulator
npm run test:e2e:emulator # Run all tests on the built app.
```

### Build companion Chrome extension

```bash
cd chrome_extension
npm install
npm run build
```

### Install companion Chrome excension (in dev mode)

1. Open chrome://extensions/ in Chrome.
2. Turn Developer mode ON.
3. Click "Load unpacked" and select "./dist" directory.
4. Check loaded extention's ID and fill "EXTENSION_ID" in .env.local.
5. Reload the app.

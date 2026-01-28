# Phase 2 - Final Checklist Before Building APK

## ✅ Completed

### Code Quality
- [x] TypeScript: 0 errors
- [x] ESLint: 0 errors (32 warnings only)
- [x] Unit tests: Passing
- [x] Supertest: Fixed and working

### GitHub Actions Updated
- [x] Asset caching added
- [x] Prebuild step made explicit
- [x] Asset verification added
- [x] Timeout management improved
- [x] Parallel job execution
- [x] Pre-build verification job added
- [x] Clear status notifications

### Architecture Complete
- [x] Backend: All 14 API endpoints
- [x] Frontend: All 6 screens
- [x] Native bridge: QEMU/VM integration
- [x] WebSocket: Real-time logs
- [x] WASM: Sandbox execution
- [x] Build config: EAS + GitHub Actions

### Documentation
- [x] PHASE2_GUIDE.md - Updated with asset requirements
- [x] PHASE2_TESTING_REPORT.md - Detailed integration test
- [x] INTEGRATION_TEST_GUIDE.md - Pre-flight checklist
- [x] GITHUB_ACTIONS_UPDATE.md - Workflow improvements

---

## 🔴 CRITICAL: MUST DO BEFORE BUILD

### 1. Download Assets (~400MB, 10-15 minutes)
```bash
npm run prebuild
```

This creates:
- `/assets/kernel/` - Linux 6.6.10
- `/assets/busybox/` - v1.36.1 utilities
- `/assets/alpine/` - v3.18 rootfs
- `/assets/busybox-wasm/` - WASM sandbox

### 2. Verify Assets Exist
```bash
ls -la /workspaces/Mix-OS/assets/
# Should show: images/, kernel/, busybox/, alpine/, busybox-wasm/
```

### 3. Verify Workflow Updated
Check `.github/workflows/build.yml`:
```bash
grep -c "npm run prebuild" .github/workflows/build.yml
# Should output: 1 (appears once in workflow)
```

---

## 📋 Pre-Build Verification Steps

Run these in order BEFORE attempting APK build:

### Step 1: Type Checking
```bash
npm run check:types
# Expected: ✅ No output (clean compilation)
```

### Step 2: Linting
```bash
npm run lint
# Expected: ✅ 0 errors (32 warnings ok)
```

### Step 3: Unit Tests
```bash
npm run test
# Expected: ✅ All tests pass
```

### Step 4: Download Assets
```bash
npm run prebuild
# Expected: ✅ Creates assets/ directories
```

### Step 5: Verify Assets
```bash
du -sh /workspaces/Mix-OS/assets/*
# Expected: kernel ~200MB, busybox ~50MB, alpine ~150MB
```

### Step 6: Backend Test (Optional)
```bash
npm run server:dev &
sleep 3
curl http://localhost:5000/api/environments
# Expected: [] (empty array)
kill %1
```

---

## 🚀 Build Commands

### For Development/Testing (Preview Build)
```bash
eas build --platform android --profile preview --non-interactive
```

### For Production Release
```bash
eas build --platform android --profile production --non-interactive
```

### With Progress Monitoring
```bash
eas build --platform android --profile preview
# (interactive, shows real-time progress)
```

---

## 📱 After Build Completes

### 1. Download APK
Visit: https://expo.dev/builds
- Find your build
- Download APK

### 2. Install on Device
```bash
adb install app.apk
```

### 3. Test on Device
- Launch app
- Create VM environment
- Download components
- Start code-server
- Test terminal

### 4. Monitor Logs
```bash
adb logcat | grep "Mix-OS\|code-server"
```

---

## ⚙️ GitHub Actions Workflow

### What It Does (Automatically on Push)

1. **Verify Step** (Parallel with others)
   - TypeScript compilation check
   - Code formatting check
   - Prebuild script verification
   - Asset directory readiness

2. **Test Job** (Parallel)
   - Unit tests
   - Type checking
   - Linting
   - Coverage upload

3. **Build Job** (Main)
   - Download assets (`npm run prebuild`)
   - Verify assets
   - Run all checks again
   - Build with EAS
   - Upload artifacts

### Triggers

- **main branch**: Production build (app-bundle for Play Store)
- **develop branch**: Preview build (APK)
- **Pull requests**: Verification + tests only (no build)
- **workflow_dispatch**: Manual trigger

---

## 🔧 Troubleshooting

### "prebuild.js not found"
```bash
# Check script exists
ls -la scripts/prebuild.js
# Should exist and be executable
```

### "Assets directory is empty"
```bash
# Run prebuild manually
npm run prebuild
# Check if downloads completed
du -sh downloads/
du -sh assets/
```

### "EAS build timeout"
- Workflow timeout: 60 minutes per build
- Check network status
- Verify EXPO_TOKEN secret is set

### "Assets too large (GitHub Actions storage)"
- Assets are cached (not uploaded)
- Cache size: ~500MB
- Retained for 7 days

---

## 📊 Build Profiles (eas.json)

```yaml
build:
  preview:
    android:
      buildType: apk          # Creates .apk file
      resourceClass: large    # 4GB RAM

  production:
    android:
      buildType: app-bundle   # Creates .aab for Play Store
      resourceClass: large    # 4GB RAM
```

---

## ✅ Final Checklist

Before running `eas build`:

- [ ] `npm run prebuild` completed successfully
- [ ] All assets exist in `/assets/`
- [ ] `npm run check:types` passes (0 errors)
- [ ] `npm run lint` passes (0 errors)
- [ ] `npm run test` passes (or skips with no-tests flag)
- [ ] GitHub Actions workflow updated
- [ ] EXPO_TOKEN secret is set in GitHub
- [ ] Node.js 18+ installed locally
- [ ] eas-cli installed (`npm install -g eas-cli`)
- [ ] Logged in to Expo (`eas login`)

---

## 🎯 Success Indicators

After workflow runs:
- ✅ build-apk job completes successfully
- ✅ test job completes successfully
- ✅ verify-build job completes successfully
- ✅ Artifacts uploaded (APK/AAB files)
- ✅ Build available on Expo dashboard

---

## 🚀 You're Ready!

Once you:
1. Run `npm run prebuild`
2. Verify assets exist
3. Push changes to GitHub

The automated workflow will:
- ✅ Download assets (cached after first time)
- ✅ Run all checks
- ✅ Build APK automatically
- ✅ Upload for download

Then you can test on Android device! 📱

---

**Status**: Phase 2 complete. Ready for APK build and deployment! 🎉

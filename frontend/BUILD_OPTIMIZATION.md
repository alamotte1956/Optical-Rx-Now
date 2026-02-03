# EAS Build Size Optimization

## Changes Made

### 1. `.easignore` File
Added `.easignore` to exclude unnecessary files from EAS builds, including:
- node_modules (dependencies are installed on EAS servers)
- Development and IDE files
- Test files and documentation
- Build artifacts and logs

### 2. EAS Configuration
Updated `eas.json` with:
- Build caching enabled for faster builds
- Release configuration for iOS production builds
- APK build type for Android to reduce size

### 3. Package Dependencies
Moved `@expo/ngrok` to devDependencies as it's only needed during local development.

## Expected Results
- Reduced upload size to EAS servers
- Faster build times due to caching
- Builds staying well under the 2 GB limit

## Additional Optimization Tips

### Image Optimization
If you add images in the future:
- Use WebP format for better compression
- Optimize PNGs with tools like `pngquant`
- Keep splash screens under 2MB
- Use appropriate resolutions (don't over-size)

### Dependency Management
- Regularly audit dependencies with `npx expo-doctor`
- Remove unused packages
- Consider lighter alternatives for heavy libraries

### Build Analysis
Monitor build sizes with:
```bash
eas build --platform android --profile production --clear-cache
```

## Troubleshooting
If builds still exceed 2 GB:
1. Check for large files accidentally committed to git
2. Review and remove unused assets
3. Consider code splitting for large features
4. Use dynamic imports for heavy dependencies

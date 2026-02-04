# Troubleshooting Guide for Optical Rx Now

## Android Keystore Generation Error

If you encounter issues with Android keystore generation while building your app, follow the steps below to resolve it:

1. **Run EAS Build Interactively**: 
   Execute the following command in your terminal to start the interactive build process:
   
   ```bash
   eas build --platform android
   ```

2. **Allow Expo to Manage Credentials Automatically**: 
   When prompted, choose the option to let Expo manage your credentials automatically. This approach minimizes errors in credential generation and management.
   
By allowing Expo to handle this process, you can avoid common pitfalls such as mismatched keystore files or other credential-related issues.

If you still face challenges after following these steps, check the official [Expo documentation](https://docs.expo.dev/build-intro/) for additional troubleshooting tips.
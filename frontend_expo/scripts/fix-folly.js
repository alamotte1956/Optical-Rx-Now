const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Fix Folly coroutine issue for iOS builds
const podfilePath = path.join(__dirname, '..', 'ios', 'Podfile');

if (fs.existsSync(podfilePath)) {
  let podfileContent = fs.readFileSync(podfilePath, 'utf8');
  
  const follyFix = `
  # Fix Folly coroutine issue
  post_install do |installer|
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_CFG_NO_COROUTINES=1'
      end
    end
  end
`;

  if (!podfileContent.includes('FOLLY_CFG_NO_COROUTINES')) {
    console.log('Adding Folly coroutine fix to Podfile...');
    podfileContent += follyFix;
    fs.writeFileSync(podfilePath, podfileContent);
    console.log('Folly fix applied successfully!');
  } else {
    console.log('Folly fix already present in Podfile.');
  }
} else {
  console.log('Podfile not found - will be created during prebuild.');
}

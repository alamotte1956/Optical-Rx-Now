const { withPodfile } = require('@expo/config-plugins');

const withFollyFix = (config) => {
  return withPodfile(config, async (config) => {
    const podfileContents = config.modResults.contents;
    
    // Check if fix already exists
    if (podfileContents.includes('FOLLY_CFG_NO_COROUTINES')) {
      return config;
    }
    
    // Find the post_install hook and add the Folly fix
    const postInstallRegex = /post_install do \|installer\|/;
    
    if (postInstallRegex.test(podfileContents)) {
      // Add to existing post_install
      config.modResults.contents = podfileContents.replace(
        postInstallRegex,
        `post_install do |installer|
    # Fix Folly coroutine issue
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_CFG_NO_COROUTINES=1'
      end
    end`
      );
    } else {
      // Add new post_install at the end
      config.modResults.contents += `
post_install do |installer|
  # Fix Folly coroutine issue
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_CFG_NO_COROUTINES=1'
    end
  end
end
`;
    }
    
    return config;
  });
};

module.exports = withFollyFix;

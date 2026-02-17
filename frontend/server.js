const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const buildPath = path.join(__dirname, 'build');

// Serve static files from the Expo web build
app.use(express.static(buildPath));

// Serve _expo static files
app.use('/_expo', express.static(path.join(buildPath, '_expo')));

// Serve assets
app.use('/assets', express.static(path.join(buildPath, 'assets')));

// Handle specific routes
const routes = [
  '/', '/index', '/welcome', '/age-verify', '/shop', '/admin',
  '/add-rx', '/add-member', '/rx-detail', '/family', 
  '/find-optometrists', '/notification-settings',
  '/(tabs)', '/(tabs)/family'
];

routes.forEach(route => {
  const cleanRoute = route === '/' ? '/index' : route;
  const htmlFile = cleanRoute.replace(/^\/(tabs)/, '(tabs)') + '.html';
  const filePath = path.join(buildPath, htmlFile);
  
  app.get(route, (req, res) => {
    if (route === '/') {
      res.sendFile(path.join(buildPath, 'index.html'));
    } else if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.sendFile(path.join(buildPath, 'index.html'));
    }
  });
});

// Catch-all: serve index.html for client-side routing
app.use((req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Optical Rx Now web preview running on port ${PORT}`);
});

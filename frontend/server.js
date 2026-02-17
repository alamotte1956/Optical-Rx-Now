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

// Handle specific routes (without parentheses)
const routes = [
  { path: '/', file: 'index.html' },
  { path: '/index', file: 'index.html' },
  { path: '/welcome', file: 'welcome.html' },
  { path: '/age-verify', file: 'age-verify.html' },
  { path: '/shop', file: 'shop.html' },
  { path: '/admin', file: 'admin.html' },
  { path: '/add-rx', file: 'add-rx.html' },
  { path: '/add-member', file: 'add-member.html' },
  { path: '/rx-detail', file: 'rx-detail.html' },
  { path: '/family', file: 'family.html' },
  { path: '/find-optometrists', file: 'find-optometrists.html' },
  { path: '/notification-settings', file: 'notification-settings.html' },
  { path: '/tabs', file: '(tabs)/index.html' },
  { path: '/tabs/family', file: '(tabs)/family.html' },
];

routes.forEach(route => {
  const filePath = path.join(buildPath, route.file);
  
  app.get(route.path, (req, res) => {
    if (fs.existsSync(filePath)) {
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

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the Expo web build
app.use(express.static(path.join(__dirname, 'build')));

// Handle all routes by serving the appropriate HTML file or index.html
app.get('*', (req, res) => {
  const requestPath = req.path;
  
  // Try to serve the exact HTML file
  const htmlFile = path.join(__dirname, 'build', requestPath.endsWith('.html') ? requestPath : `${requestPath}.html`);
  
  res.sendFile(htmlFile, (err) => {
    if (err) {
      // Fallback to index.html for client-side routing
      res.sendFile(path.join(__dirname, 'build', 'index.html'));
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Optical Rx Now web preview running on port ${PORT}`);
});

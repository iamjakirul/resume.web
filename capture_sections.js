const { execSync } = require('child_process');

// Set max-height on hero in css so test is crisp
const sections = [
  { name: 'hero', y: 0 },
  { name: 'about', y: 750 },
  { name: 'projects', y: 1650 },
  { name: 'experience', y: 3100 },
  { name: 'skills', y: 4050 },
  { name: 'contact', y: 4900 }
];

// Launch headless chrome with remote debugging

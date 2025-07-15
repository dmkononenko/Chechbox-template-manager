// Simple script to create icon files for the Chrome extension
// Run this with Node.js: node create_icons.js

const fs = require('fs');
const { createCanvas } = require('canvas');

// Function to draw a checkbox icon
function drawCheckboxIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#4285f4'; // Google blue
  ctx.fillRect(0, 0, size, size);
  
  // Border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1, size / 16);
  ctx.strokeRect(size * 0.2, size * 0.2, size * 0.6, size * 0.6);
  
  // Checkmark
  ctx.beginPath();
  ctx.moveTo(size * 0.3, size * 0.5);
  ctx.lineTo(size * 0.45, size * 0.65);
  ctx.lineTo(size * 0.7, size * 0.35);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1, size / 12);
  ctx.stroke();
  
  return canvas.toBuffer();
}

// Create and save the icons
try {
  fs.writeFileSync('icon16.png', drawCheckboxIcon(16));
  console.log('Created icon16.png');
  
  fs.writeFileSync('icon48.png', drawCheckboxIcon(48));
  console.log('Created icon48.png');
  
  fs.writeFileSync('icon128.png', drawCheckboxIcon(128));
  console.log('Created icon128.png');
  
  console.log('All icons created successfully!');
} catch (error) {
  console.error('Error creating icons:', error);
}
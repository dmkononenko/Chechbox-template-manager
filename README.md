# Checkbox Template Manager

A Chrome extension that allows you to create and apply templates for checkbox configurations on web pages.

## Features

- Create templates by saving the current state of all checkboxes on a page
- Apply saved templates with a single click
- Access and apply templates directly from the context menu (right-click)
- Manage (view, apply, delete) your saved templates
- Works with both standard HTML checkboxes and iCheck-enhanced checkboxes

## Installation

1. Clone or download this repository
2. Add icon files to the `images` directory:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" by toggling the switch in the top right corner
5. Click "Load unpacked" and select the directory containing this extension
6. The extension should now be installed and visible in your Chrome toolbar

## Usage

1. Navigate to a page with checkboxes (like the provided "О!Деньги.html" example)
2. Click the extension icon in the Chrome toolbar to open the popup
3. Set the checkboxes on the page to your desired configuration
4. Enter a name for your template and click "Save Current State"
5. To apply a saved template, you can:
   - Select it from the dropdown and click "Apply Template", or
   - Click the "Apply" button next to the template name in the list, or
   - Right-click anywhere on the page and select "Checkbox Template Manager" > [Template Name]
6. To delete a template, select it from the dropdown and click "Delete Template"

## Testing with the Example Page

This extension was designed to work with the provided "О!Деньги.html" example page:

1. Open the "О!Деньги.html" file in Chrome
2. Use the extension to create templates for different checkbox configurations
3. Apply the templates to quickly switch between different configurations

## How It Works

The extension detects both standard HTML checkboxes and iCheck-enhanced checkboxes on the page. It creates unique identifiers for each checkbox based on its attributes and position in the DOM, allowing it to reliably match checkboxes when applying templates.

Templates are saved to the browser's local storage (chrome.storage.local), which provides more storage space than sync storage and works even when offline. The extension includes comprehensive error handling and logging to help diagnose any issues that might occur.

## Troubleshooting

### Templates Not Saving

If you encounter issues with templates not being saved, the following fixes have been implemented:

1. **Storage Type**: The extension now uses local storage (chrome.storage.local) instead of sync storage (chrome.storage.sync), which provides more storage space and works offline.
2. **Error Handling**: Comprehensive error handling has been added to all storage operations to catch and report any issues.
3. **Console Logging**: Detailed logging has been added to help diagnose problems. Open the browser's developer console to view these logs.

If you still experience issues:
- Make sure you're entering a name for your template before saving
- Check the browser's developer console for error messages
- Try reloading the page before creating a template
- Ensure you have sufficient storage space in your browser

## Customization

You can customize the extension by modifying the following files:

- `manifest.json`: Extension configuration
- `popup.html` and `styles.css`: UI appearance
- `popup.js`: Popup functionality
- `content.js`: Checkbox detection and manipulation
- `background.js`: Context menu and background functionality

## License

This project is open source and available for any use.

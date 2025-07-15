# Icon Files - URGENT FIX NEEDED

The extension is currently failing to load with the error:
"Could not load icon 'images/icon48.png' specified in 'icons'."

To fix this issue, you need to add the following icon files to this directory:

1. icon16.png (16x16 pixels)
2. icon48.png (48x48 pixels)
3. icon128.png (128x128 pixels)

## Quick Solutions:

### Option 1: Create icons using the HTML generator
1. Open the included `generate_icons.html` file in a web browser
2. Right-click on each canvas and select "Save Image As..."
3. Save each image with the correct name (icon16.png, icon48.png, icon128.png) in this directory

### Option 2: Download ready-made icons
You can download simple checkbox icons from icon websites such as:
- https://www.flaticon.com/free-icons/checkbox
- https://icon-icons.com/search/checkbox
- https://www.iconfinder.com/search?q=checkbox

### Option 3: Create your own icons
If you prefer to create your own icons, make sure they are:
- In PNG format
- Exactly 16x16, 48x48, and 128x128 pixels in size
- Named exactly as specified above

After adding the icon files, the extension should load correctly.
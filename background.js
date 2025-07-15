// Background script for Checkbox Template Manager

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Create parent menu item
  chrome.contextMenus.create({
    id: 'checkbox-template-manager',
    title: 'Checkbox Template Manager',
    contexts: ['page']
  });

  // Load templates and create submenu items
  loadTemplatesIntoContextMenu();
});

// Refresh context menu when storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.checkboxTemplates) {
    // Templates have changed, refresh the context menu
    loadTemplatesIntoContextMenu();
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId.startsWith('template-')) {
    const templateName = info.menuItemId.replace('template-', '');
    applyTemplate(templateName, tab.id);
  }
});

/**
 * Load templates from storage and create context menu items
 */
function loadTemplatesIntoContextMenu() {
  // First, remove all existing template menu items
  chrome.contextMenus.removeAll(() => {
    // Create parent menu item
    chrome.contextMenus.create({
      id: 'checkbox-template-manager',
      title: 'Checkbox Template Manager',
      contexts: ['page']
    });

    // Get templates from storage
    chrome.storage.local.get('checkboxTemplates', (data) => {
      const templates = data.checkboxTemplates || {};
      
      // If no templates, add a message
      if (Object.keys(templates).length === 0) {
        chrome.contextMenus.create({
          id: 'no-templates',
          parentId: 'checkbox-template-manager',
          title: 'No templates saved yet',
          enabled: false,
          contexts: ['page']
        });
        return;
      }
      
      // Add menu items for each template
      for (const [name, template] of Object.entries(templates)) {
        chrome.contextMenus.create({
          id: `template-${name}`,
          parentId: 'checkbox-template-manager',
          title: name,
          contexts: ['page']
        });
      }
    });
  });
}

/**
 * Apply a template to the active tab
 * @param {string} templateName - The name of the template to apply
 * @param {number} tabId - The ID of the tab to apply the template to
 */
function applyTemplate(templateName, tabId) {
  // Get the template from storage
  chrome.storage.local.get('checkboxTemplates', (data) => {
    const templates = data.checkboxTemplates || {};
    
    if (!templates[templateName]) {
      console.error(`Template "${templateName}" not found`);
      return;
    }
    
    // Send the template to the content script
    chrome.tabs.sendMessage(tabId, {
      action: 'applyCheckboxState',
      checkboxState: templates[templateName]
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error applying template:', chrome.runtime.lastError.message);
        return;
      }
      
      if (!response) {
        console.error('No response from content script');
        return;
      }
      
      if (response.success) {
        console.log(`Template "${templateName}" applied successfully`);
      } else {
        console.error('Error applying template');
      }
    });
  });
}
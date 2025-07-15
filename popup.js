// Popup script for Checkbox Template Manager

document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const templateNameInput = document.getElementById('templateName');
  const saveTemplateButton = document.getElementById('saveTemplate');
  const templateList = document.getElementById('templateList');
  const templateSelect = document.getElementById('templateSelect');
  const applyTemplateButton = document.getElementById('applyTemplate');
  const deleteTemplateButton = document.getElementById('deleteTemplate');
  const statusElement = document.getElementById('status');

  // Load saved templates when popup opens
  loadTemplates();

  // Event listeners
  saveTemplateButton.addEventListener('click', saveTemplate);
  applyTemplateButton.addEventListener('click', applyTemplate);
  deleteTemplateButton.addEventListener('click', deleteTemplate);

  // Function to load and display saved templates
  function loadTemplates() {
    console.log('Loading templates...');

    chrome.storage.local.get('checkboxTemplates', function(data) {
      if (chrome.runtime.lastError) {
        const errorMsg = chrome.runtime.lastError.message;
        showStatus('Error loading templates: ' + errorMsg, 'error');
        console.error('Error loading templates:', errorMsg);
        return;
      }

      const templates = data.checkboxTemplates || {};
      console.log('Loaded templates:', templates);

      // Clear existing templates
      templateList.innerHTML = '';
      templateSelect.innerHTML = '<option value="">Select a template</option>';

      // Check if there are any templates
      if (Object.keys(templates).length === 0) {
        console.log('No templates found');
        templateList.innerHTML = '<div class="empty-message">No templates saved yet</div>';
        return;
      }

      console.log('Found ' + Object.keys(templates).length + ' templates');

      // Add templates to the list and dropdown
      for (const [name, template] of Object.entries(templates)) {
        console.log('Adding template to UI:', name);

        // Add to template list
        const templateItem = document.createElement('div');
        templateItem.className = 'template-item';
        templateItem.innerHTML = `
          <span class="template-name">${name}</span>
          <button class="apply-button" data-name="${name}">Apply</button>
        `;
        templateList.appendChild(templateItem);

        // Add event listener to the apply button
        templateItem.querySelector('.apply-button').addEventListener('click', function() {
          applySpecificTemplate(name);
        });

        // Add to dropdown
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        templateSelect.appendChild(option);
      }

      console.log('Templates loaded and displayed');
    });
  }

  // Function to save current checkbox state as a template
  function saveTemplate() {
    const name = templateNameInput.value.trim();

    if (!name) {
      showStatus('Please enter a template name', 'error');
      return;
    }

    console.log('Saving template with name:', name);

    // Get current tab to communicate with content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (!tabs || tabs.length === 0) {
        showStatus('Error: No active tab found', 'error');
        console.error('No active tab found');
        return;
      }

      console.log('Sending message to content script in tab:', tabs[0].id);

      chrome.tabs.sendMessage(tabs[0].id, {action: 'getCheckboxState'}, function(response) {
        if (chrome.runtime.lastError) {
          const errorMsg = chrome.runtime.lastError.message;
          showStatus('Error: ' + errorMsg, 'error');
          console.error('Runtime error:', errorMsg);
          return;
        }

        if (!response) {
          showStatus('Error: No response from content script', 'error');
          console.error('No response from content script');
          return;
        }

        if (!response.checkboxState) {
          showStatus('Error: No checkbox state in response', 'error');
          console.error('No checkbox state in response:', response);
          return;
        }

        console.log('Received checkbox state:', response.checkboxState);

        // Save the template
        chrome.storage.local.get('checkboxTemplates', function(data) {
          if (chrome.runtime.lastError) {
            const errorMsg = chrome.runtime.lastError.message;
            showStatus('Error getting templates: ' + errorMsg, 'error');
            console.error('Error getting templates:', errorMsg);
            return;
          }

          const templates = data.checkboxTemplates || {};
          console.log('Current templates:', templates);

          templates[name] = response.checkboxState;

          console.log('Saving updated templates:', templates);

          chrome.storage.local.set({checkboxTemplates: templates}, function() {
            if (chrome.runtime.lastError) {
              const errorMsg = chrome.runtime.lastError.message;
              showStatus('Error saving template: ' + errorMsg, 'error');
              console.error('Error saving template:', errorMsg);
              return;
            }

            console.log('Template saved successfully');
            showStatus(`Template "${name}" saved successfully`, 'success');
            templateNameInput.value = '';
            loadTemplates();
          });
        });
      });
    });
  }

  // Function to apply selected template
  function applyTemplate() {
    const name = templateSelect.value;

    if (!name) {
      showStatus('Please select a template', 'error');
      return;
    }

    applySpecificTemplate(name);
  }

  // Function to apply a specific template by name
  function applySpecificTemplate(name) {
    console.log('Applying template:', name);

    chrome.storage.local.get('checkboxTemplates', function(data) {
      if (chrome.runtime.lastError) {
        const errorMsg = chrome.runtime.lastError.message;
        showStatus('Error loading template: ' + errorMsg, 'error');
        console.error('Error loading template:', errorMsg);
        return;
      }

      const templates = data.checkboxTemplates || {};
      console.log('Loaded templates:', templates);

      if (!templates[name]) {
        showStatus(`Template "${name}" not found`, 'error');
        console.error(`Template "${name}" not found`);
        return;
      }

      console.log('Found template:', name, templates[name]);

      // Send the template to content script to apply
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs || tabs.length === 0) {
          showStatus('Error: No active tab found', 'error');
          console.error('No active tab found');
          return;
        }

        console.log('Sending template to content script in tab:', tabs[0].id);

        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'applyCheckboxState',
          checkboxState: templates[name]
        }, function(response) {
          if (chrome.runtime.lastError) {
            const errorMsg = chrome.runtime.lastError.message;
            showStatus('Error: ' + errorMsg, 'error');
            console.error('Runtime error:', errorMsg);
            return;
          }

          if (!response) {
            showStatus('Error: No response from content script', 'error');
            console.error('No response from content script');
            return;
          }

          if (response.success) {
            console.log('Template applied successfully');
            showStatus(`Template "${name}" applied successfully`, 'success');
          } else {
            showStatus('Error applying template', 'error');
            console.error('Error applying template:', response);
          }
        });
      });
    });
  }

  // Function to delete selected template
  function deleteTemplate() {
    const name = templateSelect.value;

    if (!name) {
      showStatus('Please select a template to delete', 'error');
      console.log('No template selected for deletion');
      return;
    }

    console.log('Deleting template:', name);

    chrome.storage.local.get('checkboxTemplates', function(data) {
      if (chrome.runtime.lastError) {
        const errorMsg = chrome.runtime.lastError.message;
        showStatus('Error loading templates: ' + errorMsg, 'error');
        console.error('Error loading templates:', errorMsg);
        return;
      }

      const templates = data.checkboxTemplates || {};
      console.log('Loaded templates:', templates);

      if (!templates[name]) {
        showStatus(`Template "${name}" not found`, 'error');
        console.error(`Template "${name}" not found`);
        return;
      }

      console.log('Found template to delete:', name);

      // Delete the template
      delete templates[name];

      console.log('Updated templates after deletion:', templates);

      chrome.storage.local.set({checkboxTemplates: templates}, function() {
        if (chrome.runtime.lastError) {
          const errorMsg = chrome.runtime.lastError.message;
          showStatus('Error deleting template: ' + errorMsg, 'error');
          console.error('Error deleting template:', errorMsg);
          return;
        }

        console.log('Template deleted successfully');
        showStatus(`Template "${name}" deleted successfully`, 'success');
        loadTemplates();
      });
    });
  }

  // Function to show status messages
  function showStatus(message, type) {
    statusElement.textContent = message;
    statusElement.className = 'status ' + type;

    // Clear status after 3 seconds
    setTimeout(function() {
      statusElement.textContent = '';
      statusElement.className = 'status';
    }, 3000);
  }
});

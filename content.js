// Content script for Checkbox Template Manager

// Polyfill for CSS.escape if not available
if (!window.CSS || !window.CSS.escape) {
  window.CSS = window.CSS || {};
  window.CSS.escape = function(value) {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'")
      .replace(/\//g, '\\/')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/[\b]/g, '\\b')
      .replace(/\f/g, '\\f')
      .replace(/\t/g, '\\t')
      .replace(/\v/g, '\\v')
      .replace(/[\0-\x1F\x7F-\x9F]/g, c => '\\' + c.charCodeAt(0).toString(16) + ' ');
  };
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getCheckboxState') {
    const checkboxState = getCheckboxState();
    console.log('Sending checkbox state to popup:', checkboxState);
    sendResponse({ checkboxState: checkboxState });
  } else if (request.action === 'applyCheckboxState') {
    const success = applyCheckboxState(request.checkboxState);
    sendResponse({ success: success });
  }
  return true; // Keep the message channel open for async responses
});

/**
 * Get the current state of all checkboxes on the page
 * @returns {Object} Object with checkbox identifiers as keys and their checked state as values
 */
function getCheckboxState() {
  const checkboxState = {};

  // Get all standard checkboxes
  const standardCheckboxes = document.querySelectorAll('input[type="checkbox"]:not(.iCheck-helper)');
  standardCheckboxes.forEach((checkbox, index) => {
    // Create a unique identifier for each checkbox
    const id = createCheckboxIdentifier(checkbox);
    checkboxState[id] = checkbox.checked;
  });

  // Get all iCheck checkboxes
  const iCheckContainers = document.querySelectorAll('.icheckbox_square-green');
  iCheckContainers.forEach((container, index) => {
    const checkbox = container.querySelector('input[type="checkbox"]');
    if (checkbox) {
      const id = createCheckboxIdentifier(checkbox);
      // For iCheck, we determine the state by the container's class
      checkboxState[id] = container.classList.contains('checked');
    }
  });

  return checkboxState;
}

/**
 * Apply a saved checkbox state to the page
 * @param {Object} checkboxState Object with checkbox identifiers as keys and their checked state as values
 * @returns {boolean} Success status
 */
function applyCheckboxState(checkboxState) {
  if (!checkboxState) return false;

  try {
    // Apply to standard checkboxes
    const standardCheckboxes = document.querySelectorAll('input[type="checkbox"]:not(.iCheck-helper)');
    standardCheckboxes.forEach((checkbox) => {
      const id = createCheckboxIdentifier(checkbox);
      if (id in checkboxState) {
        checkbox.checked = checkboxState[id];

        // Trigger change event to update any dependent UI
        const event = new Event('change', { bubbles: true });
        checkbox.dispatchEvent(event);
      }
    });

    // Apply to iCheck checkboxes
    const iCheckContainers = document.querySelectorAll('.icheckbox_square-green');
    iCheckContainers.forEach((container) => {
      const checkbox = container.querySelector('input[type="checkbox"]');
      if (checkbox) {
        const id = createCheckboxIdentifier(checkbox);
        if (id in checkboxState) {
          const isChecked = checkboxState[id];

          // Update the iCheck state
          if (isChecked && !container.classList.contains('checked')) {
            // Need to check it
            container.classList.add('checked');
            checkbox.checked = true;
          } else if (!isChecked && container.classList.contains('checked')) {
            // Need to uncheck it
            container.classList.remove('checked');
            checkbox.checked = false;
          }

          // Trigger change event to update any dependent UI
          const event = new Event('change', { bubbles: true });
          checkbox.dispatchEvent(event);

          // Try to use iCheck if available in the page context
          try {
            // Execute in the page context to access the page's jQuery and iCheck
            const script = document.createElement('script');
            script.textContent = `
              (function() {
                try {
                  // Try to find the checkbox directly
                  let checkbox = document.querySelector('${getElementSelector(checkbox)}');

                  // If we can't find it directly, try to find its container
                  if (!checkbox) {
                    const container = document.querySelector('${getElementSelector(container)}');
                    if (container) {
                      checkbox = container.querySelector('input[type="checkbox"]');
                    }
                  }

                  if (checkbox && window.jQuery && jQuery.fn.iCheck) {
                    // Make sure we're using the jQuery object from the page context
                    jQuery(checkbox).iCheck('${isChecked ? 'check' : 'uncheck'}');
                    console.log('Applied iCheck state using page jQuery');
                    return true;
                  } else if (checkbox) {
                    // If jQuery or iCheck is not available, try to update the checkbox directly
                    checkbox.checked = ${isChecked};
                    // Trigger a change event
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log('Applied checkbox state directly');
                    return true;
                  }
                  console.log('Could not find checkbox or jQuery/iCheck not available');
                  return false;
                } catch (e) {
                  console.error('Error in injected script:', e);
                  return false;
                }
              })();
            `;
            document.head.appendChild(script);
            document.head.removeChild(script);

            // Also try the direct approach as a fallback
            if (typeof $ !== 'undefined' && $.fn.iCheck) {
              $(checkbox).iCheck(isChecked ? 'check' : 'uncheck');
            } else {
              // Fallback for when jQuery/iCheck isn't available - simulate a click
              if (isChecked !== checkbox.checked) {
                const clickEvent = new MouseEvent('click', {
                  bubbles: true,
                  cancelable: true,
                  view: window
                });
                container.dispatchEvent(clickEvent);
              }
            }
          } catch (e) {
            console.error('Error applying iCheck state:', e);
            // Fallback to simulating a click
            if (isChecked !== checkbox.checked) {
              const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
              });
              container.dispatchEvent(clickEvent);
            }
          }
        }
      }
    });

    return true;
  } catch (error) {
    console.error('Error applying checkbox state:', error);
    return false;
  }
}

/**
 * Create a unique identifier for a checkbox based on its attributes and position
 * @param {HTMLElement} checkbox The checkbox element
 * @returns {string} A unique identifier for the checkbox
 */
function createCheckboxIdentifier(checkbox) {
  // Use various attributes to create a unique identifier
  const name = checkbox.name || '';
  const id = checkbox.id || '';
  const value = checkbox.value || '';
  const classes = checkbox.className || '';

  // Get the path to the element for additional uniqueness
  const path = getElementPath(checkbox);

  return `${name}|${id}|${value}|${classes}|${path}`;
}

/**
 * Get the DOM path of an element
 * @param {HTMLElement} element The element to get the path for
 * @returns {string} A string representing the element's path in the DOM
 */
function getElementPath(element) {
  const path = [];
  let currentElement = element;

  while (currentElement && currentElement.nodeType === Node.ELEMENT_NODE) {
    let selector = currentElement.nodeName.toLowerCase();

    if (currentElement.id) {
      selector += `#${currentElement.id}`;
    } else {
      // Get the position among siblings of the same type
      let sibling = currentElement;
      let siblingIndex = 1;

      while (sibling = sibling.previousElementSibling) {
        if (sibling.nodeName === currentElement.nodeName) {
          siblingIndex++;
        }
      }

      selector += `:nth-of-type(${siblingIndex})`;
    }

    path.unshift(selector);
    currentElement = currentElement.parentNode;
  }

  return path.join(' > ');
}

/**
 * Generate a CSS selector for an element
 * @param {HTMLElement} element The element to generate a selector for
 * @returns {string} A CSS selector that can be used to find the element
 */
function getElementSelector(element) {
  // Try to use ID if available
  if (element.id) {
    return `#${CSS.escape(element.id)}`;
  }

  // Try to use a combination of attributes
  const name = element.getAttribute('name');
  const className = element.className;

  if (name) {
    return `input[name="${CSS.escape(name)}"]`;
  }

  // Fallback to using the full path
  return getElementPath(element);
}

// Initialize when the page is fully loaded
window.addEventListener('load', function() {
  console.log('Checkbox Template Manager initialized');
});

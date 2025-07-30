// Configuration
const CONFIG = {
  storageKey: 'quarto-proof-states',
  expandedClass: 'expanded',
  userToggledClass: 'user-toggled',
  proofSelector: '.proof'
};

// Utility functions
function loadStates() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.storageKey) || '{}');
  } catch (e) {
    console.warn('Could not load proof states:', e);
    return {};
  }
}

function saveStates(states) {
  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(states));
  } catch (e) {
    console.warn('Could not save proof states:', e);
  }
}

function initializeProofs() {
  const states = loadStates();
  const proofs = document.querySelectorAll(CONFIG.proofSelector);
  
  proofs.forEach(proof => {
    // Proofs should have a data-key attribute
    // Otherwise, eg- remarks/solutions, we use the id itself
    const id = proof.dataset.key || proof.id;
    
    // Restore state without animation
    if (id && states[id] !== undefined) {
      proof.classList.toggle(CONFIG.expandedClass, states[id]);
    }
    
    // Add click handler
    proof.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      proof.classList.add(CONFIG.userToggledClass);
      const isExpanded = proof.classList.toggle(CONFIG.expandedClass);
      if(id) {
        states[id] = isExpanded;
        saveStates(states);
      }
    });
    
    // Keyboard support
    proof.setAttribute('tabindex', '0');
    proof.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        proof.click();
      }
    });
  });
  
  // Remove loading class to show proofs
  document.documentElement.classList.remove(CONFIG.loadingClass);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProofs);
} else {
  initializeProofs();
}

const CONFIG = {
  storageKey: 'quarto-proof-states',
  expandedClass: 'expanded',
  proofSelector: '.proof'
};

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
    const header = proof.querySelector('p:first-child');
    if (!header) return;

    // Restore state without animation
    if (id && states[id] !== undefined) {
      proof.classList.toggle(CONFIG.expandedClass, states[id]);
    }

    function toggle() {
      const isExpanded = proof.classList.toggle(CONFIG.expandedClass);
      if (id) {
        states[id] = isExpanded;
        saveStates(states);
      }
    }

    // Attach click only to the header, not the whole proof body
    header.addEventListener('click', function(e) {
      e.stopPropagation();
      toggle();
    });

    // Keyboard support
    header.setAttribute('tabindex', '0');
    header.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProofs);
} else {
  initializeProofs();
}

(() => {
  const storageKey = `quarto-proof-states:${window.location.pathname}`;

  function loadStates() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed) ||
          Object.values(parsed).some(value => typeof value !== 'boolean')) {
        return Object.create(null);
      }
      return Object.assign(Object.create(null), parsed);
    } catch (error) {
      console.warn('Could not load proof states:', error);
      return Object.create(null);
    }
  }

  function saveStates(states) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(states));
    } catch (error) {
      console.warn('Could not save proof states:', error);
    }
  }

  function initializeProofs() {
    const states = loadStates();
    let nextBodyId = 0;

    document.querySelectorAll('.proof:not(.remark)').forEach(proof => {
      if (proof.classList.contains('thms-initialized')) return;
      const header = proof.firstElementChild;
      if (!header || header.tagName !== 'P') return;

      const key = proof.dataset.key || proof.id;
      const body = document.createElement('div');
      body.className = 'thms-proof-body';
      do {
        body.id = `thms-proof-body-${++nextBodyId}`;
      } while (document.getElementById(body.id));

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'thms-proof-toggle';
      button.setAttribute('aria-controls', body.id);
      const indicator = document.createElement('span');
      indicator.className = 'thms-proof-indicator';
      indicator.setAttribute('aria-hidden', 'true');
      indicator.textContent = '▶';
      button.append(indicator);

      function setExpanded(expanded) {
        proof.classList.toggle('expanded', expanded);
        button.setAttribute('aria-expanded', String(expanded));
        body.hidden = !expanded;
      }

      // Native buttons supply Enter/Space activation and keyboard focus.
      button.addEventListener('click', () => {
        const expanded = !proof.classList.contains('expanded');
        setExpanded(expanded);
        if (key) {
          states[key] = expanded;
          saveStates(states);
        }
      });

      // Preserve the rendered title, math, and body nodes. Content stays visible
      // until the control is attached and ready to use.
      while (header.firstChild) button.append(header.firstChild);
      header.append(button);
      while (header.nextSibling) body.append(header.nextSibling);
      proof.append(body);
      proof.classList.add('thms-initialized');
      setExpanded(key && typeof states[key] === 'boolean'
        ? states[key]
        : proof.classList.contains('expanded'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProofs, { once: true });
  } else {
    initializeProofs();
  }
})();

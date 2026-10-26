(() => {
  const proofSelector = '.proof:not(.remark)';
  const pagePath = window.location.pathname;
  let nextId = 0;

  function uniqueId(prefix) {
    let id;
    do { id = `thms-${prefix}-${++nextId}`; } while (document.getElementById(id));
    return id;
  }

  function storageKey(key) {
    return `quarto-proof-state:${JSON.stringify([pagePath, key])}`;
  }

  function loadState(key) {
    if (!key) return undefined;
    try {
      const saved = localStorage.getItem(storageKey(key));
      return saved === 'true' ? true : saved === 'false' ? false : undefined;
    } catch (error) {
      console.warn('[thms] Could not load proof state:', error);
    }
    return undefined;
  }

  function saveState(key, expanded) {
    if (!key) return;
    try {
      localStorage.setItem(storageKey(key), String(expanded));
    } catch (error) {
      console.warn('[thms] Could not save proof state:', error);
    }
  }

  function describe(proof, index) {
    return proof.dataset.key || proof.id || `proof ${index + 1}`;
  }

  function normalizeProof(proof, index) {
    const paragraph = proof.firstElementChild;
    const titles = paragraph?.querySelectorAll(':scope > .proof-title');
    const title = titles?.[0];
    // Validate before moving anything. A foreign .proof div or changed Quarto
    // markup stays readable instead of turning arbitrary body text into a label.
    const preceding = [];
    if (title) {
      for (let node = paragraph.firstChild; node && node !== title; node = node.nextSibling) {
        preceding.push(node);
      }
    }
    if (paragraph?.tagName !== 'P' || titles?.length !== 1 ||
        !title.textContent.trim() || preceding.some(node =>
          node.nodeType !== Node.TEXT_NODE || node.textContent.trim())) {
      console.warn(`[thms] Skipping ${describe(proof, index)}: expected a leading .proof-title in the first paragraph.`);
      return null;
    }

    const header = document.createElement('div');
    header.className = 'thms-proof-header';
    const body = document.createElement('div');
    body.className = 'thms-proof-body';
    body.id = uniqueId('body');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thms-proof-toggle';
    button.setAttribute('aria-controls', body.id);
    const indicator = document.createElement('span');
    indicator.className = 'thms-proof-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    indicator.textContent = '▶';
    button.append(indicator);
    header.append(button);

    // Attach visible containers first, then move existing nodes without cloning.
    // A title link stays beside the button, and the first body paragraph keeps
    // its content, attributes, anchors, and any handlers installed by Quarto.
    proof.insertBefore(header, paragraph);
    proof.insertBefore(body, paragraph);
    header.append(title);
    if (!title.id) title.id = uniqueId('title');
    button.setAttribute('aria-labelledby', title.id);

    // Quarto puts the environment label in a leading <em>. Move only that
    // label into the toggle; the optional parenthesized title stays outside.
    const label = title.firstChild;
    if (label?.nodeType === Node.ELEMENT_NODE && label.tagName === 'EM' &&
        label.children.length === 0) {
      const accessibleTitle = title.textContent.trim();
      const toggleLabel = document.createElement('span');
      toggleLabel.className = 'thms-proof-label';
      toggleLabel.append(label);
      // Keep a bare label's final period beside it, without a flex gap.
      if (title.childNodes.length === 1 && title.firstChild.nodeType === Node.TEXT_NODE &&
          /^\.\s*$/.test(title.textContent)) {
        toggleLabel.append(title.firstChild);
      }
      button.append(toggleLabel);
      button.removeAttribute('aria-labelledby');
      button.setAttribute('aria-label', accessibleTitle);
    }
    while (body.nextSibling) body.append(body.nextSibling);
    if (!paragraph.hasAttributes() && [...paragraph.childNodes].every(node =>
      node.nodeType === Node.TEXT_NODE && !node.textContent.trim())) {
      paragraph.remove();
    }
    return { button, body };
  }

  function initializeProofs() {
    if (document.documentElement.hasAttribute('data-thms-ready')) return;
    document.documentElement.setAttribute('data-thms-ready', '');
    const proofs = [...document.querySelectorAll(proofSelector)];
    const counts = new Map();
    for (const proof of proofs) {
      const key = proof.dataset.key || proof.id;
      if (key) counts.set(key, (counts.get(key) || 0) + 1);
    }
    for (const [key, count] of counts) {
      if (count > 1) console.warn(`[thms] Duplicate proof key "${key}": persistence disabled for all ${count} occurrences.`);
    }

    const controllers = new Map();
    proofs.forEach((proof, index) => {
      try {
        const normalized = normalizeProof(proof, index);
        if (!normalized) return;
        const { button, body } = normalized;
        const candidate = proof.dataset.key || proof.id;
        const key = counts.get(candidate) === 1 ? candidate : undefined;
        const setExpanded = expanded => {
          proof.classList.toggle('expanded', expanded);
          button.setAttribute('aria-expanded', String(expanded));
          body.hidden = !expanded;
        };
        button.addEventListener('click', () => {
          const expanded = body.hidden;
          setExpanded(expanded);
          saveState(key, expanded);
        });
        const saved = loadState(key);
        setExpanded(saved ?? proof.classList.contains('expanded'));
        proof.classList.add('thms-initialized');
        controllers.set(proof, setExpanded);
      } catch (error) {
        // Unexpected errors are reported, and content remains available.
        proof.querySelectorAll('.thms-proof-body').forEach(body => { body.hidden = false; });
        console.warn(`[thms] Could not enhance ${describe(proof, index)}:`, error);
      }
    });

    function revealFragment(hash = window.location.hash) {
      if (!hash || hash === '#') return;
      let id;
      try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      if (!target) return;
      let proof = target.closest(proofSelector);
      while (proof) {
        controllers.get(proof)?.(true);
        proof = proof.parentElement?.closest(proofSelector);
      }
      // Fragment navigation is a temporary reveal, not a saved preference.
      requestAnimationFrame(() => target.scrollIntoView());
    }
    revealFragment();
    window.addEventListener('hashchange', () => revealFragment());
    document.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
          event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!anchor || anchor.hasAttribute('download') ||
          (anchor.target && anchor.target !== '_self')) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin === location.origin && url.pathname === location.pathname &&
          url.search === location.search && url.hash === location.hash) {
        // Clicking the current fragment does not emit hashchange.
        revealFragment(url.hash);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProofs, { once: true });
  } else {
    initializeProofs();
  }
})();

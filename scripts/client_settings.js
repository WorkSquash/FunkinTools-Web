// —— Sidebar toggle ——
const sidebar = document.getElementById('sidebar');
const hamburger = document.getElementById('hamburger');
hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

// —— Tools accordion ——
const toolsBtn = document.getElementById('toolsBtn');
const toolsMenu = document.getElementById('toolsMenu');
toolsBtn.addEventListener('click', e => {
  e.stopPropagation();
  const accordionItem = toolsBtn.closest('.accordion');
  const isOpen = accordionItem.classList.toggle('open');
  if (isOpen) {
    document.addEventListener('click', closeToolsOnClickOutside, { once: true });
  }
});

function closeToolsOnClickOutside() {
  const accordionItem = toolsBtn.closest('.accordion');
  accordionItem.classList.remove('open');
}

// —— Settings panel toggle & auto-close ——
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');

settingsBtn.addEventListener('click', e => {
  e.stopPropagation();
  const isOpen = settingsPanel.classList.toggle('open');

  if (isOpen) {
    // Get button position & dimensions
    const rect = settingsBtn.getBoundingClientRect();
    const panelWidth = settingsPanel.offsetWidth;
    const panelHeight = settingsPanel.offsetHeight;

    // Scroll positions
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    // Calculate ideal top & left
    let top = rect.bottom + scrollTop;
    let left = rect.left + scrollLeft;

    // Adjust if panel would overflow bottom
    if (top + panelHeight > window.innerHeight + scrollTop) {
      top = rect.top + scrollTop - panelHeight;
    }

    // Adjust if panel would overflow right
    if (left + panelWidth > window.innerWidth + scrollLeft) {
      left = window.innerWidth + scrollLeft - panelWidth - 10; // 10px padding
    }

    // Prevent overflow left
    if (left < 10) {
      left = 10;
    }

    settingsPanel.style.top = `${top}px`;
    settingsPanel.style.left = `${left}px`;
    settingsPanel.style.display = 'block';

    document.addEventListener('click', closeSettingsOnClickOutside, { once: true });
  } else {
    settingsPanel.style.display = 'none';
  }
});

function closeSettingsOnClickOutside() {
  settingsPanel.classList.remove('open');
  settingsPanel.style.display = 'none';
}

// Prevent clicks inside panel from closing it
settingsPanel.addEventListener('click', e => e.stopPropagation());

// —— Theme & font persistence ——
const themeSelect = document.getElementById('themeSelect');
const fontSelect = document.getElementById('fontSelect');
const root = document.documentElement;

function applyTheme(theme) {
  if (theme === 'auto') {
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    darkMode ? root.setAttribute('data-theme', 'dark') : root.removeAttribute('data-theme');
  } else if (theme === 'light') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

// auto-reapply when OS theme changes
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', () => {
    if (themeSelect.value === 'auto') applyTheme('auto');
  });

// on load: restore settings
window.addEventListener('DOMContentLoaded', () => {
  const savedT = localStorage.getItem('pd-theme') || 'auto';
  themeSelect.value = savedT;
  applyTheme(savedT);

  const savedF = localStorage.getItem('pd-font') ||
    getComputedStyle(root).getPropertyValue('--font-family').trim();
  fontSelect.value = savedF;
  root.style.setProperty('--font-family', savedF);
});

// persist on change
themeSelect.addEventListener('change', e => {
  const t = e.target.value;
  applyTheme(t);
  t === 'auto' ? localStorage.removeItem('pd-theme') : localStorage.setItem('pd-theme', t);
});

fontSelect.addEventListener('change', e => {
  const f = e.target.value;
  root.style.setProperty('--font-family', f);
  localStorage.setItem('pd-font', f);
});

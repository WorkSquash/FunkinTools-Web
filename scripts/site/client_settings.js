// —— Sidebar toggle ——
const sidebar = document.getElementById('sidebar');
const hamburger = document.getElementById('hamburger');
hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  const expanded = !sidebar.classList.contains('collapsed');
  hamburger.setAttribute('aria-expanded', expanded);
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
const settingsBtn   = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');

settingsBtn.addEventListener('click', e => {
  e.stopPropagation();
  const isOpening = !settingsPanel.classList.contains('open');

  if (isOpening) {
    // 1) show invisibly off-screen so we can measure it
    settingsPanel.style.visibility = 'hidden';
    settingsPanel.style.display    = 'block';

    const rect   = settingsBtn.getBoundingClientRect();
    const panelW = settingsPanel.offsetWidth;
    const panelH = settingsPanel.offsetHeight;

    // 2) hide again until we're ready
    settingsPanel.style.display    = 'none';
    settingsPanel.style.visibility = '';

    // 3) desired position in **document** coords
    const scrollTop  = window.pageYOffset;
    const scrollLeft = window.pageXOffset;
    let top  = rect.bottom + scrollTop;
    let left = rect.left   + scrollLeft;

    // 4) viewport dims (no scroll)
    const vpW = document.documentElement.clientWidth;
    const vpH = document.documentElement.clientHeight;

    // 5) clamp within [0, vp - panel]
    //    NOTE: left/ top are DOC coords, so we re-add scroll after clamping
    const minLeft  = 0;
    const maxLeft  = vpW - panelW;
    const minTop   = 0;
    const maxTop   = vpH - panelH;

    // clamp **relative** to viewport, then convert back
    const relX = Math.min(Math.max(rect.left,  minLeft),  maxLeft);
    const relY = Math.min(Math.max(rect.bottom, minTop),   maxTop);

    left = relX + scrollLeft;
    top  = relY + scrollTop;

    // 6) position, show & animate
    settingsPanel.style.top     = `${top}px`;
    settingsPanel.style.left    = `${left}px`;
    settingsPanel.style.display = 'block';
    settingsPanel.getBoundingClientRect(); // force reflow
    settingsPanel.classList.add('open');

    // auto-close on outside click
    document.addEventListener('click', closeSettingsOnClickOutside, { once: true });
  } else {
    // slide-out
    settingsPanel.classList.remove('open');
    settingsPanel.addEventListener('transitionend', function handler() {
      settingsPanel.style.display = 'none';
      settingsPanel.removeEventListener('transitionend', handler);
    });
  }
});

function closeSettingsOnClickOutside() {
  if (!settingsPanel.classList.contains('open')) return;
  settingsPanel.classList.remove('open');
  settingsPanel.addEventListener('transitionend', function handler() {
    settingsPanel.style.display = 'none';
    settingsPanel.removeEventListener('transitionend', handler);
  });
}

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

  /*const savedF = localStorage.getItem('pd-font') ||
    getComputedStyle(root).getPropertyValue('--font-family').trim();
  fontSelect.value = savedF;
  root.style.setProperty('--font-family', savedF);*/
});

// persist on change
themeSelect.addEventListener('change', e => {
  const t = e.target.value;
  applyTheme(t);
  t === 'auto' ? localStorage.removeItem('pd-theme') : localStorage.setItem('pd-theme', t);
});

/*
fontSelect.addEventListener('change', e => {
  const f = e.target.value;
  root.style.setProperty('--font-family', f);
  localStorage.setItem('pd-font', f);
});
*/

// —— Footer ——
let lastScrollY = window.scrollY;
const footer = document.querySelector('.site-footer');

window.addEventListener('scroll', () => {
  if (window.scrollY > lastScrollY) {
    footer.classList.add('hide'); // scrolling down - hide
  } else {
    footer.classList.remove('hide'); // scrolling up - show
  }
  lastScrollY = window.scrollY;
});

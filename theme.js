// Theme management module with support for:
// - Light/Dark mode toggling
// - Custom color themes
// - Font size adjustments
// - Accessibility toggles (high contrast, dyslexia-friendly font)
// - Persistence via localStorage
// - Dynamic CSS variable manipulation

const defaultTheme = {
  mode: 'light',        // 'light' or 'dark'
  primaryColor: '#27ae60',
  secondaryColor: '#2ecc71',
  fontSize: '16px',
  highContrast: false,
  dyslexiaFont: false
};

function applyTheme(theme) {
  const root = document.documentElement;

  // Mode (backgrounds, text colors)
  root.style.setProperty('--background-color', theme.mode === 'dark' ? '#222' : '#fff');
  root.style.setProperty('--text-color', theme.mode === 'dark' ? '#ddd' : '#333');

  // Primary/secondary colors
  root.style.setProperty('--primary-color', theme.primaryColor);
  root.style.setProperty('--secondary-color', theme.secondaryColor);

  // Font size
  root.style.setProperty('--font-size', theme.fontSize);

  // Accessibility
  if (theme.highContrast) {
    root.style.setProperty('--background-color', '#000');
    root.style.setProperty('--text-color', '#fff');
  }
  if (theme.dyslexiaFont) {
    root.style.setProperty('--font-family', '"OpenDyslexic", Arial, sans-serif');
  } else {
    root.style.setProperty('--font-family', 'Arial, sans-serif');
  }
}

// Save theme to localStorage
function saveTheme(theme) {
  localStorage.setItem('gymTheme', JSON.stringify(theme));
}

// Load theme from localStorage or default
function loadTheme() {
  const saved = localStorage.getItem('gymTheme');
  if (saved) {
    return JSON.parse(saved);
  }
  return defaultTheme;
}

// Toggle light/dark mode
export function toggleMode() {
  let theme = loadTheme();
  theme.mode = (theme.mode === 'light') ? 'dark' : 'light';
  applyTheme(theme);
  saveTheme(theme);
}

// Set custom colors
export function setColors(primaryColor, secondaryColor) {
  let theme = loadTheme();
  theme.primaryColor = primaryColor;
  theme.secondaryColor = secondaryColor;
  applyTheme(theme);
  saveTheme(theme);
}

// Adjust font size
export function setFontSize(sizePx) {
  let theme = loadTheme();
  theme.fontSize = sizePx;
  applyTheme(theme);
  saveTheme(theme);
}

// Toggle high contrast mode
export function toggleHighContrast() {
  let theme = loadTheme();
  theme.highContrast = !theme.highContrast;
  applyTheme(theme);
  saveTheme(theme);
}

// Toggle dyslexia-friendly font
export function toggleDyslexiaFont() {
  let theme = loadTheme();
  theme.dyslexiaFont = !theme.dyslexiaFont;
  applyTheme(theme);
  saveTheme(theme);
}

// Initialize theme on page load
export function initTheme() {
  const theme = loadTheme();
  applyTheme(theme);
}

// Usage example: call initTheme in your main JS entry point
// and offer UI controls to call the toggle/set functions


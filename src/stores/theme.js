import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  // Available themes
  const themes = [
    { id: 'light', name: '简约白', icon: '☀️' },
    { id: 'dark', name: '深邃黑', icon: '🌙' },
    { id: 'warm', name: '暖色调', icon: '🌤️' },
    { id: 'monokai', name: 'Monokai', icon: '🎨' }
  ];

  // Current theme
  const currentTheme = ref(localStorage.getItem('theme') || 'light');

  // Set theme
  function setTheme(themeId) {
    currentTheme.value = themeId;
    localStorage.setItem('theme', themeId);
    applyTheme(themeId);
  }

  // Apply theme to document
  function applyTheme(themeId) {
    const root = document.documentElement;
    root.setAttribute('data-theme', themeId);
  }

  // Initialize theme on load
  function initTheme() {
    applyTheme(currentTheme.value);
  }

  return {
    themes,
    currentTheme,
    setTheme,
    initTheme
  };
});

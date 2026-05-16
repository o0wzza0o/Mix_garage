const KEY = 'mg-theme';

export function initTheme() {
  const saved = localStorage.getItem(KEY);
  const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = saved ? saved === 'dark' : sysDark;
  document.documentElement.classList.toggle('dark', dark);
}

export function toggleTheme() {
  const dark = !document.documentElement.classList.contains('dark');
  document.documentElement.classList.toggle('dark', dark);
  localStorage.setItem(KEY, dark ? 'dark' : 'light');
}

export function isDark() {
  return document.documentElement.classList.contains('dark');
}

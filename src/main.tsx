
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Apply the stored theme immediately before rendering
const theme = localStorage.getItem("theme") || 
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
if (theme === "dark") {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

createRoot(document.getElementById("root")!).render(<App />);

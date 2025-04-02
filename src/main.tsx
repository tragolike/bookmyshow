
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add console error handler for debugging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Mount app with error boundary
try {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Root element not found");
  }
  
  createRoot(root).render(<App />);
  console.log("App successfully mounted");
} catch (error) {
  console.error("Failed to mount app:", error);
}

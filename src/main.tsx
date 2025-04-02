
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add console error handler for debugging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  console.error('Error message:', event.message);
  console.error('Error source:', event.filename, 'line:', event.lineno, 'column:', event.colno);
  
  // Report the error to the UI for better debugging
  const errorElement = document.createElement('div');
  errorElement.style.position = 'fixed';
  errorElement.style.top = '0';
  errorElement.style.left = '0';
  errorElement.style.width = '100%';
  errorElement.style.padding = '10px';
  errorElement.style.backgroundColor = 'rgba(255,0,0,0.8)';
  errorElement.style.color = 'white';
  errorElement.style.zIndex = '9999';
  errorElement.innerText = `Error: ${event.message} (${event.filename})`;
  document.body.appendChild(errorElement);
});

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  if (event.reason && event.reason.stack) {
    console.error('Rejection stack:', event.reason.stack);
  }
});

// Log additional debugging information on page load
console.info('App initializing...');
console.info('Environment:', import.meta.env.MODE);
console.info('Browser:', navigator.userAgent);
console.info('Base URL:', window.location.origin);
console.info('Supabase URL:', import.meta.env.VITE_SUPABASE_URL || 'Using fallback URL');

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
  // Display a fallback UI when the app fails to mount
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: sans-serif;">
        <h2>Sorry, something went wrong</h2>
        <p>The application couldn't be loaded. Please try refreshing the page.</p>
        <p>If the issue persists, please check your browser console for errors.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;
  }
}

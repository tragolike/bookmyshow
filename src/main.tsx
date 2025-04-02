
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add console error handler for debugging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  console.error('Error message:', event.message);
  console.error('Error source:', event.filename, 'line:', event.lineno, 'column:', event.colno);
});

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  if (event.reason && event.reason.stack) {
    console.error('Rejection stack:', event.reason.stack);
  }
});

// Add special handler for Supabase authentication issues
window.addEventListener('supabaseAuthError', (event: any) => {
  console.error('Supabase Auth Error:', event.detail);
});

// Log additional debugging information on page load
console.info('App initializing...');
console.info('Environment:', import.meta.env.MODE);
console.info('Browser:', navigator.userAgent);
console.info('Base URL:', window.location.origin);

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
        <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;
  }
}

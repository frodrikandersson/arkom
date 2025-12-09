export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  stackProjectId: import.meta.env.VITE_STACK_PROJECT_ID,
  stackPublishableKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY,
};
// Suppress ResizeObserver loop error
// This error is benign and occurs when ResizeObserver can't deliver all notifications
// It's common in React applications and doesn't affect functionality

const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('ResizeObserver loop completed with undelivered notifications')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

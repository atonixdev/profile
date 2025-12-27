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

// Also suppress the dev overlay/runtime error event for this benign ResizeObserver issue
// (otherwise Create React App may show a full-screen red error overlay).
window.addEventListener(
  'error',
  (event) => {
    const message = event?.message || '';
    if (
      typeof message === 'string' &&
      (message.includes('ResizeObserver loop limit exceeded') ||
        message.includes('ResizeObserver loop completed with undelivered notifications'))
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
    return undefined;
  },
  true
);

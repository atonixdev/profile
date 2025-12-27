import React from 'react';

const isChunkLoadError = (error) => {
  const message = String(error?.message || '');
  return message.includes('ChunkLoadError') || message.includes('Loading chunk') || message.includes('Loading CSS chunk');
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this._reloadedForChunkError = false;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    try {
      // eslint-disable-next-line no-console
      console.error('App crashed:', error, errorInfo);

      // A very common "blank page after deploy" cause is a stale cached index.html
      // trying to load a now-missing hashed chunk.
      if (!this._reloadedForChunkError && isChunkLoadError(error)) {
        this._reloadedForChunkError = true;
        const url = new URL(window.location.href);
        url.searchParams.set('reload', String(Date.now()));
        window.location.replace(url.toString());
      }
    } catch (_) {
      // ignore
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const message = String(this.state.error?.message || 'Unknown error');

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 720, width: '100%', border: '1px solid #eee', borderRadius: 12, padding: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>App error</h1>
          <p style={{ margin: 0, color: '#444' }}>The page crashed while loading.</p>
          <div style={{ marginTop: 12, padding: 12, background: '#fafafa', borderRadius: 8, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {message}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', background: '#fff', fontWeight: 700 }}
            >
              Reload
            </button>
            <a
              href="/"
              style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', background: '#fff', fontWeight: 700, textDecoration: 'none', color: 'inherit' }}
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;

/**
 * InterviewRoom — Architecture §2.5 Layer 4 Interview Engine
 *
 * Tabs:
 *   Video   — WebRTC peer-to-peer video/audio with signaling via WebSocket
 *   Chat    — Real-time text chat over the same WebSocket connection
 *   Code    — Monaco Editor coding test with language selector + run output
 *   Docs    — Application document viewer/downloader
 *
 * Route: /application-console/interviews/:interviewId/room
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ApplicationConsoleLayout from '../../components/Layout/ApplicationConsoleLayout';

const ACCENT = '#1F4788';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

const WS_BASE =
  process.env.NODE_ENV === 'production'
    ? `wss://${window.location.host}/ws/employment/interview`
    : `ws://localhost:8000/ws/employment/interview`;

// ─────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────

function useInterview(interviewId) {
  const [interview, setInterview] = useState(null);
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!interviewId) return;
    Promise.all([
      fetch(`/api/employment/interviews/${interviewId}/`, { credentials: 'include' }).then(r => r.json()),
    ])
      .then(([iv]) => {
        setInterview(iv);
        if (iv.application) {
          fetch(`/api/employment/applications/${iv.application}/`, { credentials: 'include' })
            .then(r => r.json())
            .then(app => {
              setApplication(app);
              setDocuments(app.documents || []);
            });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [interviewId]);

  return { interview, application, documents, loading };
}

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────

function PresenceBar({ participants }) {
  return (
    <div style={{ background: '#0a1628', borderBottom: '1px solid #1e3a5f', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        In room
      </span>
      {participants.map((p, i) => (
        <span key={i} style={{
          background: ACCENT,
          color: '#fff',
          borderRadius: 12,
          padding: '2px 8px',
          fontSize: 12,
          fontWeight: 600,
        }}>{p}</span>
      ))}
      {participants.length === 0 && (
        <span style={{ color: '#475569', fontSize: 12 }}>Waiting for participants…</span>
      )}
    </div>
  );
}

function VideoTab({ wsRef, interviewId }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);  // §3.11 screen share

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [connected, setConnected] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);
  const [isSharing, setIsSharing] = useState(false);  // §3.11

  const sendSignal = useCallback((type, payload) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...payload }));
    }
  }, [wsRef]);

  // Handle incoming WebRTC signalling from WebSocket
  useEffect(() => {
    const handler = async (evt) => {
      let msg;
      try { msg = JSON.parse(evt.data); } catch { return; }

      if (!pcRef.current) return;
      const pc = pcRef.current;

      if (msg.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(msg));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal('answer', { sdp: answer.sdp });
      } else if (msg.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(msg));
      } else if (msg.type === 'ice_candidate' && msg.candidate) {
        try { await pc.addIceCandidate(new RTCIceCandidate(msg.candidate)); } catch {}
      }
    };
    if (wsRef.current) {
      wsRef.current.addEventListener('message', handler);
      return () => wsRef.current?.removeEventListener('message', handler);
    }
  }, [wsRef, sendSignal]);

  const startCall = async () => {
    setJoining(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;

      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) sendSignal('ice_candidate', { candidate: candidate.toJSON() });
      };

      pc.ontrack = (evt) => {
        if (remoteVideoRef.current && evt.streams[0]) {
          remoteVideoRef.current.srcObject = evt.streams[0];
          setConnected(true);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal('offer', { sdp: offer.sdp });
    } catch (err) {
      setError(`Camera/mic access denied: ${err.message}`);
    } finally {
      setJoining(false);
    }
  };

  const endCall = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setConnected(false);
  };

  const toggleCamera = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => {
      t.enabled = !t.enabled;
    });
    setCameraOn(p => !p);
  };

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => {
      t.enabled = !t.enabled;
    });
    setMicOn(p => !p);
  };

  // §3.11 — Screen sharing
  const shareScreen = async () => {
    setError(null);
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = screenStream;

      // Show the screen in the local video element
      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;

      // Replace the outgoing video track in the peer connection
      if (pcRef.current) {
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = pcRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) await sender.replaceTrack(videoTrack);
      }

      setIsSharing(true);

      // Auto-stop when the user clicks the browser "Stop sharing" button
      screenStream.getVideoTracks()[0].onended = stopSharing;
    } catch (err) {
      if (err.name !== 'NotAllowedError') {
        setError(`Screen share failed: ${err.message}`);
      }
    }
  };

  const stopSharing = async () => {
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;
    setIsSharing(false);

    if (localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    // Restore the camera track in the peer connection
    if (pcRef.current && localStreamRef.current) {
      const cameraTrack = localStreamRef.current.getVideoTracks()[0];
      const sender = pcRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
      if (sender && cameraTrack) await sender.replaceTrack(cameraTrack);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#060e1a' }}>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 8, padding: 16 }}>
        {/* Local video */}
        <div style={{ position: 'relative', background: '#0a1628', borderRadius: 8, overflow: 'hidden', minHeight: 240 }}>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <span style={{ position: 'absolute', bottom: 8, left: 12, color: '#94a3b8', fontSize: 12, background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: 4 }}>
            You
          </span>
        </div>
        {/* Remote video */}
        <div style={{ position: 'relative', background: '#0a1628', borderRadius: 8, overflow: 'hidden', minHeight: 240 }}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {!connected && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 14 }}>
              Waiting for other participant…
            </div>
          )}
          <span style={{ position: 'absolute', bottom: 8, left: 12, color: '#94a3b8', fontSize: 12, background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: 4 }}>
            Participant
          </span>
        </div>
      </div>

      {error && <div style={{ color: '#f87171', fontSize: 13, padding: '4px 20px' }}>{error}</div>}

      {/* Controls */}
      <div style={{ padding: '12px 20px', display: 'flex', gap: 12, borderTop: '1px solid #1e3a5f', background: '#0a1628', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={toggleMic} style={ctrlBtn(micOn ? '#1e3a5f' : '#7f1d1d')}>
          {micOn ? '🎙 Mic On' : '🔇 Mic Off'}
        </button>
        <button onClick={toggleCamera} style={ctrlBtn(cameraOn ? '#1e3a5f' : '#7f1d1d')}>
          {cameraOn ? '📹 Cam On' : '🚫 Cam Off'}
        </button>
        {/* §3.11 — Screen share toggle */}
        {connected && (
          isSharing
            ? <button onClick={stopSharing} style={ctrlBtn('#7c3f00')}>🖥 Stop Sharing</button>
            : <button onClick={shareScreen} style={ctrlBtn('#1e3a0f')}>📺 Share Screen</button>
        )}
        {!connected ? (
          <button onClick={startCall} disabled={joining} style={ctrlBtn(ACCENT, true)}>
            {joining ? 'Connecting…' : '📞 Start Call'}
          </button>
        ) : (
          <button onClick={endCall} style={ctrlBtn('#7f1d1d', true)}>
            📵 End Call
          </button>
        )}
      </div>
    </div>
  );
}

function ChatTab({ wsRef }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    const handler = (evt) => {
      let msg;
      try { msg = JSON.parse(evt.data); } catch { return; }
      if (msg.type === 'chat_message') {
        setMessages(prev => [...prev, { sender: msg.sender, text: msg.text, ts: msg.timestamp }]);
      }
    };
    if (wsRef.current) {
      wsRef.current.addEventListener('message', handler);
      return () => wsRef.current?.removeEventListener('message', handler);
    }
  }, [wsRef]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'chat', text: text.trim() }));
    setText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#060e1a' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', marginTop: 40 }}>
            Chat will appear here once participants join.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ color: '#93c5fd', fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{m.sender}</span>
            <div style={{ background: '#112240', color: '#e2e8f0', padding: '8px 12px', borderRadius: '0 10px 10px 10px', maxWidth: '75%', fontSize: 14 }}>
              {m.text}
            </div>
            <span style={{ color: '#475569', fontSize: 10, marginTop: 2 }}>
              {m.ts ? new Date(m.ts).toLocaleTimeString() : ''}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: '10px 16px', borderTop: '1px solid #1e3a5f', display: 'flex', gap: 8, background: '#0a1628' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Type a message…"
          style={{ flex: 1, background: '#112240', border: '1px solid #1e3a5f', borderRadius: 6, padding: '8px 12px', color: '#e2e8f0', fontSize: 14, outline: 'none' }}
        />
        <button onClick={send} style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}>
          Send
        </button>
      </div>
    </div>
  );
}

const CODE_LANGUAGES = [
  { label: 'Python', value: 'python', hello: 'print("Hello, World!")' },
  { label: 'JavaScript', value: 'javascript', hello: 'console.log("Hello, World!");' },
  { label: 'TypeScript', value: 'typescript', hello: 'console.log("Hello, World!");' },
  { label: 'Go', value: 'go', hello: 'package main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello, World!")\n}' },
  { label: 'Java', value: 'java', hello: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}' },
  { label: 'C++', value: 'cpp', hello: '#include<iostream>\nusing namespace std;\nint main(){\n  cout<<"Hello, World!";\n  return 0;\n}' },
  { label: 'Rust', value: 'rust', hello: 'fn main() {\n    println!("Hello, World!");\n}' },
  { label: 'SQL', value: 'sql', hello: 'SELECT * FROM candidates WHERE status = \'shortlisted\';' },
];

function CodingTestTab({ wsRef }) {
  const [lang, setLang] = useState('python');
  const [code, setCode] = useState('# Write your solution here\n');
  const [output, setOutput] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handler = (evt) => {
      let msg;
      try { msg = JSON.parse(evt.data); } catch { return; }
      if (msg.type === 'code_update') {
        // Remote participant updated code
        setCode(msg.code);
        setLang(msg.language || lang);
        setSyncing(true);
        setTimeout(() => setSyncing(false), 500);
      } else if (msg.type === 'code_result') {
        setOutput(msg.output || '');
      }
    };
    if (wsRef.current) {
      wsRef.current.addEventListener('message', handler);
      return () => wsRef.current?.removeEventListener('message', handler);
    }
  }, [wsRef, lang]);

  const syncCode = useCallback((value) => {
    setCode(value);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'code_sync', code: value, language: lang }));
    }
  }, [wsRef, lang]);

  const changeLang = (newLang) => {
    const def = CODE_LANGUAGES.find(l => l.value === newLang);
    setLang(newLang);
    const newCode = def?.hello || '// Start coding…';
    setCode(newCode);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'code_sync', code: newCode, language: newLang }));
    }
  };

  const runCode = () => {
    // Signal server to "run" (server can delegate, or display a note)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'code_run', code, language: lang }));
    }
    setOutput('⏳ Running…');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#060e1a' }}>
      {/* Toolbar */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #1e3a5f', background: '#0a1628', display: 'flex', alignItems: 'center', gap: 10 }}>
        <select
          value={lang}
          onChange={e => changeLang(e.target.value)}
          style={{ background: '#112240', border: '1px solid #1e3a5f', color: '#e2e8f0', borderRadius: 5, padding: '4px 8px', fontSize: 13 }}
        >
          {CODE_LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        {syncing && <span style={{ color: '#fbbf24', fontSize: 11 }}>Syncing…</span>}
        <div style={{ flex: 1 }} />
        <button onClick={runCode} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 5, padding: '5px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          ▶ Run
        </button>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Editor
          height="100%"
          language={lang}
          value={code}
          onChange={syncCode}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            renderWhitespace: 'selection',
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>

      {/* Output panel */}
      {output && (
        <div style={{ borderTop: '1px solid #1e3a5f', background: '#060e1a', padding: '8px 14px', maxHeight: 140, overflowY: 'auto' }}>
          <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Output</div>
          <pre style={{ color: '#e2e8f0', fontSize: 13, margin: 0, whiteSpace: 'pre-wrap' }}>{output}</pre>
        </div>
      )}
    </div>
  );
}

function DocumentsTab({ documents, applicantName }) {
  if (!documents || documents.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', fontSize: 14 }}>
        No documents attached to this application.
      </div>
    );
  }

  const iconFor = (docType) => {
    const icons = { cv: '📄', portfolio: '🖼', cover: '✉️', certificate: '🏅', other: '📎' };
    return icons[docType] || '📎';
  };

  return (
    <div style={{ padding: 20, background: '#060e1a', height: '100%', overflowY: 'auto' }}>
      <h3 style={{ color: '#93c5fd', marginBottom: 16, fontWeight: 700, fontSize: 15 }}>
        Documents — {applicantName}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {documents.map((doc) => (
          <div key={doc.id} style={{
            background: '#0a1628',
            border: '1px solid #1e3a5f',
            borderRadius: 8,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <span style={{ fontSize: 22 }}>{iconFor(doc.doc_type)}</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 14 }}>{doc.original_name}</div>
              <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                {doc.doc_type?.replace('_', ' ').toUpperCase()} &nbsp;•&nbsp;
                {doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : ''}
              </div>
            </div>
            <a
              href={doc.file}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: ACCENT, color: '#fff', borderRadius: 6, padding: '6px 14px', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
            >
              Open
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────

export default function InterviewRoom() {
  const { interviewId } = useParams();
  const { interview, application, documents, loading } = useInterview(interviewId);

  const wsRef = useRef(null);
  const [wsStatus, setWsStatus] = useState('disconnected'); // connecting | open | closed | error
  const [participants, setParticipants] = useState([]);
  const [activeTab, setActiveTab] = useState('video');

  // WebSocket lifecycle
  useEffect(() => {
    if (!interviewId) return;

    const ws = new WebSocket(`${WS_BASE}/${interviewId}/`);
    wsRef.current = ws;
    setWsStatus('connecting');

    ws.onopen = () => setWsStatus('open');
    ws.onclose = (e) => {
      setWsStatus(e.code === 4001 ? 'auth_error' : 'closed');
    };
    ws.onerror = () => setWsStatus('error');

    ws.onmessage = (evt) => {
      let msg;
      try { msg = JSON.parse(evt.data); } catch { return; }
      if (msg.type === 'presence') {
        setParticipants(msg.participants || []);
      }
    };

    return () => {
      ws.close();
    };
  }, [interviewId]);

  if (loading) {
    return (
      <ApplicationConsoleLayout>
        <div style={{ color: '#94a3b8', padding: 40, fontSize: 14 }}>Loading interview room…</div>
      </ApplicationConsoleLayout>
    );
  }

  if (!interview) {
    return (
      <ApplicationConsoleLayout>
        <div style={{ color: '#f87171', padding: 40 }}>Interview not found.</div>
      </ApplicationConsoleLayout>
    );
  }

  const statusDot = {
    connecting: '#fbbf24',
    open: '#34d399',
    closed: '#94a3b8',
    error: '#f87171',
    auth_error: '#f87171',
  }[wsStatus] || '#94a3b8';

  const tabs = [
    { id: 'video', label: '📹 Video' },
    { id: 'chat', label: '💬 Chat' },
    { id: 'code', label: '⌨️ Code Test' },
    { id: 'docs', label: '📁 Documents' },
  ];

  return (
    <ApplicationConsoleLayout>
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', background: '#060e1a' }}>

        {/* Header */}
        <div style={{ padding: '10px 20px', borderBottom: '1px solid #1e3a5f', background: '#0a1628', display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/application-console/interviews" style={{ color: '#64748b', textDecoration: 'none', fontSize: 20 }}>←</Link>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 15 }}>
              Round {interview.round} — {interview.get_format_display || interview.format?.replace('_', ' ')} Interview
            </div>
            {application && (
              <div style={{ color: '#64748b', fontSize: 12 }}>
                {application.first_name} {application.last_name} &nbsp;•&nbsp; {application.job_title || ''}
              </div>
            )}
          </div>

          {/* WS status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusDot }} />
            <span style={{ color: '#64748b', fontSize: 11 }}>{wsStatus === 'open' ? 'Live' : wsStatus}</span>
          </div>
        </div>

        {/* Presence bar */}
        <PresenceBar participants={participants} />

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1e3a5f', background: '#0a1628' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? `2px solid ${ACCENT}` : '2px solid transparent',
                color: activeTab === tab.id ? '#e2e8f0' : '#64748b',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 600 : 400,
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}

          {wsStatus === 'auth_error' && (
            <div style={{ marginLeft: 'auto', color: '#f87171', fontSize: 12, padding: '0 16px', display: 'flex', alignItems: 'center' }}>
              ⚠ Authentication failed — please log in
            </div>
          )}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {activeTab === 'video' && <VideoTab wsRef={wsRef} interviewId={interviewId} />}
          {activeTab === 'chat' && <ChatTab wsRef={wsRef} />}
          {activeTab === 'code' && <CodingTestTab wsRef={wsRef} />}
          {activeTab === 'docs' && (
            <DocumentsTab
              documents={documents}
              applicantName={application ? `${application.first_name} ${application.last_name}` : ''}
            />
          )}
        </div>
      </div>
    </ApplicationConsoleLayout>
  );
}

// ─────────────────────────────────────────────────────────────────
// Style helpers
// ─────────────────────────────────────────────────────────────────

function ctrlBtn(bg, primary = false) {
  return {
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: primary ? '8px 20px' : '7px 14px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  };
}

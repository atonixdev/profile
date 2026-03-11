import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// GS-WSF — Dashboard Overview
const STATS = [
  { label: 'Projects',      value: '0', sub: 'No active projects'      },
  { label: 'Pipelines',     value: '0', sub: 'No active pipelines'     },
  { label: 'Environments',  value: '0', sub: 'No environments'         },
  { label: 'Deployments',   value: '0', sub: 'No deployments'          },
];

const QUICK_ACTIONS = [
  { label: 'Create Project',     to: '/dashboard/projects',     desc: 'Start a new project and connect your repository.' },
  { label: 'Configure Pipeline', to: '/dashboard/pipelines',    desc: 'Set up a CI/CD pipeline for automated builds.' },
  { label: 'Add Environment',    to: '/dashboard/environments', desc: 'Create a deployment environment with variables.' },
  { label: 'View Registry',      to: '/dashboard/registries',   desc: 'Manage and push container images.' },
];

const Overview = () => {
  const { user } = useAuth();
  const name = user?.user?.first_name || user?.username || 'Developer';

  return (
    <div>

      {/* Page title */}
      <div style={{ marginBottom: 36 }}>
        <div
          style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#A81D37',
            fontFamily: 'var(--font-mono)', marginBottom: 8,
          }}
        >
          Developer Console
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 8, lineHeight: 1.2 }}>
          Welcome, {name}
        </h1>
        <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7 }}>
          Manage your projects, pipelines, environments, and deployments from a single control plane.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          border: '1px solid #E5E7EB', borderRight: 'none', borderBottom: 'none',
          marginBottom: 36,
        }}
      >
        {STATS.map((s) => (
          <div
            key={s.label}
            style={{
              background: '#FFFFFF',
              padding: '24px 20px',
              borderRight: '1px solid #E5E7EB',
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <div
              style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: '#4B5563',
                fontFamily: 'var(--font-mono)', marginBottom: 8,
              }}
            >
              {s.label}
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#111827', lineHeight: 1, marginBottom: 6 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: '#4B5563' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 36 }}>
        <div
          style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#1F2937',
            fontFamily: 'var(--font-mono)', marginBottom: 16,
          }}
        >
          Quick Actions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 12 }}>
          {QUICK_ACTIONS.map((q) => (
            <Link
              key={q.label}
              to={q.to}
              style={{
                display: 'block', padding: '20px 24px',
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderLeft: '3px solid transparent',
                textDecoration: 'none',
                transition: 'border-left-color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderLeftColor = '#A81D37'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderLeftColor = 'transparent'; }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{q.label}</div>
              <div style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.6 }}>{q.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div
          style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#1F2937',
            fontFamily: 'var(--font-mono)', marginBottom: 16,
          }}
        >
          Recent Activity
        </div>
        <div
          style={{
            background: '#FFFFFF', border: '1px solid #E5E7EB',
            padding: '48px 24px', textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 14, color: '#4B5563', marginBottom: 16 }}>
            No recent activity. Create your first project to get started.
          </p>
          <Link
            to="/dashboard/projects"
            style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '10px 24px', background: '#A81D37', color: '#FFFFFF',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', textDecoration: 'none',
            }}
          >
            Create Project
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Overview;

import React from 'react';
import { Link } from 'react-router-dom';

const services = [
  {
    icon: '◈',
    title: 'Private Cloud Infrastructure',
    body: 'Design and deploy enterprise-grade private cloud platforms using OpenStack, Proxmox, or Nutanix. We deliver on-premises cloud economics with full data sovereignty — no third-party hyperscaler dependencies.',
    points: ['OpenStack all-in-one & HA cluster builds', 'Proxmox VE cluster & Ceph storage', 'Compute, networking & storage service design', 'Tenant isolation & quota management'],
  },
  {
    icon: '⬡',
    title: 'Kubernetes Platform Engineering',
    body: 'Build production-ready Kubernetes platforms with operator-managed workloads, multi-tenancy controls, and GitOps-driven configuration management. We design the platform once so every team deploys with confidence.',
    points: ['RKE2 / k3s / kubeadm cluster bootstrapping', 'Istio service mesh & traffic management', 'OPA / Kyverno policy enforcement', 'Cluster API & fleet management'],
  },
  {
    icon: '▣',
    title: 'Hybrid & Multi-Cloud Architecture',
    body: 'Architect workload placement strategies that balance sovereignty, latency, and cost across on-premises infrastructure and public cloud regions. We design the connectivity, identity federation, and network topology to make hybrid cloud deterministic.',
    points: ['AWS / Azure / GCP hybrid connectivity', 'SD-WAN & private peering design', 'Identity federation across boundaries', 'Cost modelling & workload placement'],
  },
  {
    icon: '◉',
    title: 'Cloud Migration',
    body: 'Structured migration programmes using the AWS CAF / TOGAF frameworks — from discovery and application portfolio assessment through phased migration waves and decommissioning runway. We eliminate lift-and-shift risk through systematic planning.',
    points: ['7-R migration strategy classification', 'Application dependency mapping', 'Wave planning & cutover execution', 'Post-migration optimisation & rightsizing'],
  },
  {
    icon: '◐',
    title: 'Infrastructure as Code',
    body: 'Replace undocumented, snowflake infrastructure with fully declarative, version-controlled IaC. We standardise on Terraform and Ansible to produce repeatable, auditable environments from development through production.',
    points: ['Terraform module library & workspace management', 'Ansible playbook standardisation', 'Atlantis / Terraform Cloud automation', 'Policy-as-code with Sentinel or OPA'],
  },
  {
    icon: '◑',
    title: 'Storage, Backup & DR',
    body: 'Design resilient storage topologies and tested disaster recovery runbooks. We define RTO/RPO targets with your business stakeholders, then engineer the backup cadence, replication strategy, and failover automation to meet them.',
    points: ['Ceph distributed storage design', 'Velero Kubernetes backup & restore', 'Active-passive & active-active DR', 'DR fire drill automation & reporting'],
  },
];

const platforms = [
  { name: 'OpenStack', category: 'Private Cloud' },
  { name: 'Proxmox VE', category: 'Private Cloud' },
  { name: 'Nutanix AHV', category: 'Private Cloud' },
  { name: 'Kubernetes', category: 'Container Platform' },
  { name: 'RKE2', category: 'Container Platform' },
  { name: 'k3s', category: 'Container Platform' },
  { name: 'Istio', category: 'Service Mesh' },
  { name: 'Cilium', category: 'Networking' },
  { name: 'Calico', category: 'Networking' },
  { name: 'Terraform', category: 'IaC' },
  { name: 'Ansible', category: 'Config Mgmt' },
  { name: 'Pulumi', category: 'IaC' },
  { name: 'ArgoCD', category: 'GitOps' },
  { name: 'Flux', category: 'GitOps' },
  { name: 'Vault', category: 'Secrets' },
  { name: 'Ceph', category: 'Storage' },
  { name: 'MinIO', category: 'Object Storage' },
  { name: 'Longhorn', category: 'Storage' },
  { name: 'AWS', category: 'Public Cloud' },
  { name: 'Azure', category: 'Public Cloud' },
  { name: 'GCP', category: 'Public Cloud' },
  { name: 'Prometheus', category: 'Observability' },
];

const CloudEngineering = () => (
  <div style={{ background: '#FFFFFF' }}>

    {/* ── Services ── */}
    <section className="gsw-section" style={{ background: '#FFFFFF' }}>
      <div className="gsw-container">
        <div className="gsw-section-header">
          <span className="gsw-eyebrow">Services</span>
          <h2 className="gsw-section-title">Cloud engineering services</h2>
          <p style={{ fontSize: 16, color: '#4B5563', maxWidth: 520, lineHeight: 1.75 }}>Six practice areas spanning private cloud, containerisation, hybrid connectivity, migration, infrastructure code, and storage — everything needed to own your infrastructure stack.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB' }}>
          {services.map((svc, i) => (
            <div key={i} style={{ background: '#FFFFFF', padding: '32px 36px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px 56px', alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: 22, color: '#A81D37', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>{svc.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 10 }}>{svc.title}</h3>
                <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.8 }}>{svc.body}</p>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {svc.points.map((pt) => (
                  <li key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#1F2937', lineHeight: 1.7, paddingBottom: 8 }}>
                    <span style={{ color: '#A81D37', fontWeight: 900, flexShrink: 0, marginTop: 2 }}>—</span>{pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>

    <hr className="gsw-divider" />

    {/* ── Technology ── */}
    <section className="gsw-section" style={{ background: '#F8F9FA' }}>
      <div className="gsw-container">
        <div className="gsw-section-header">
          <span className="gsw-eyebrow">Technology</span>
          <h2 className="gsw-section-title">Platform & tooling ecosystem</h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {platforms.map((p) => (
            <div key={p.name} style={{ padding: '8px 14px', background: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', fontFamily: 'var(--font-mono)' }}>{p.name}</span>
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4B5563' }}>{p.category}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    <hr className="gsw-divider" />

    {/* ── Why private cloud ── */}
    <section className="gsw-section" style={{ background: '#FFFFFF' }}>
      <div className="gsw-container">
        <div className="gsw-section-header">
          <span className="gsw-eyebrow">Philosophy</span>
          <h2 className="gsw-section-title">Why infrastructure sovereignty matters</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px 56px' }}>
          {[
            { heading: 'Data sovereignty', body: 'Government and regulated workloads require on-premises or national data residency. Private cloud delivers hyperscaler features without ceding control to foreign jurisdictions.' },
            { heading: 'Predictable economics', body: 'Public cloud egress fees, reserved instance complexity, and unpredictable burst costs are eliminated with on-premises CapEx that you control and forecast accurately.' },
            { heading: 'Reduced attack surface', body: 'Air-gapped or strictly controlled private cloud environments eliminate shared responsibility model ambiguities and reduce the blast radius of supply-chain incidents.' },
            { heading: 'Performance determinism', body: 'Noisy-neighbour effects, shared physical resources, and variable network latency are engineering problems on public cloud. Private infrastructure gives you deterministic performance guarantees.' },
          ].map((item) => (
            <div key={item.heading}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 10 }}>{item.heading}</h3>
              <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.8, margin: 0 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="gsw-section-sm" style={{ background: '#A81D37' }}>
      <div className="gsw-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px 48px' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 10 }}>Ready to take control of your infrastructure?</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.7 }}>We'll assess your current estate and produce a cloud architecture roadmap tailored to your workloads, compliance requirements, and budget.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 28px', background: '#A81D37', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>Get in Touch</Link>
          <Link to="/devops-security" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 28px', border: '1px solid rgba(255,255,255,0.4)', color: '#FFFFFF', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>DevOps & Security →</Link>
        </div>
      </div>
    </section>

  </div>
);

export default CloudEngineering;

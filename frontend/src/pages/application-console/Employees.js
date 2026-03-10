import React, { useState, useEffect } from 'react';

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/employment/employees/')
      .then(r => r.json())
      .then(data => {
        setEmployees(Array.isArray(data) ? data : data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statusColor = (status) => {
    const colors = {
      'active': '#D1FAE5',
      'probation': '#FEF3C7',
      'on_leave': '#DBEAFE',
      'suspended': '#FEE2E2',
    };
    return colors[status] || '#E8EEF4';
  };

  return (
    <div>
      <h1>Employee Directory</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 8,
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Employee ID</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Name</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Department</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Role</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: 32, textAlign: 'center', color: '#999' }}>
                    No employees yet
                  </td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <td style={{ padding: 16, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600 }}>
                      {emp.employee_id}
                    </td>
                    <td style={{ padding: 16 }}>{emp.full_name}</td>
                    <td style={{ padding: 16 }}>{emp.department}</td>
                    <td style={{ padding: 16 }}>{emp.role}</td>
                    <td style={{ padding: 16 }}>
                      <span style={{
                        padding: '4px 12px',
                        background: statusColor(emp.status),
                        color: '#1F4788',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                      }}>
                        {emp.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

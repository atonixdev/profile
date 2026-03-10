import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Support has been moved to its own dedicated console at /support-console
export default function SupportAdmin() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/support-console', { replace: true }); }, [navigate]);
  return null;
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApi } from '../components/hooks/use-api';
import { Button } from '../components/ui/Button';
import { setAuth } from '../service/Auth';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [namaLengkap, setNama] = useState('');
  const { api, execute, loading, error } = useApi();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await execute(() => api.call('register', { email, password, namaLengkap, role: 'VIEWER' }));
      if (res && res.user && res._e) {
        setAuth(res.user.email, res._e);
        navigate('/dashboard');
      } else {
        alert(res?.message || 'Registration failed');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Register to PBF Manage</h2>
        {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              className="w-full border px-3 py-2 rounded-md"
              value={namaLengkap}
              onChange={e => setNama(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full border px-3 py-2 rounded-md"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full border px-3 py-2 rounded-md"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
            Register
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
}

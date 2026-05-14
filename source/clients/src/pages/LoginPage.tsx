import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApi } from '../components/hooks/use-api';
import { Button } from '../components/ui/Button';
import { setAuth } from '../service/Auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { api, execute, loading, error } = useApi();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await execute(() => api.call('login', { email, password }));
      if (res && res.user && res._e) {
        setAuth(res.user.email, res._e);
        navigate('/dashboard');
      } else {
        alert(res?.message || 'Login failed');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login to PBF Manage</h2>
        {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
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
            Login
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register here</Link>
        </div>
      </div>
    </div>
  );
}


// components/LoginPage.tsx
import React, { useState } from 'react';

interface LoginPageProps {
  onLoginAttempt: (role: 'admin' | 'staff', credential: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginAttempt }) => {
  const [loginType, setLoginType] = useState<'admin' | 'staff'>('staff');
  const [credential, setCredential] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Use a timeout to simulate network latency for better UX
    setTimeout(() => {
      try {
        onLoginAttempt(loginType, credential);
      } catch (e: any) {
        setError(e.message || 'Login failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="flex bg-gray-100 rounded-full p-1 mb-6">
          <button onClick={() => { setLoginType('admin'); setCredential(''); setError(''); }} className={`flex-1 py-2 font-semibold text-sm rounded-full transition-all ${loginType === 'admin' ? 'bg-white text-primary shadow' : 'text-text-light'}`}>Admin Login</button>
          <button onClick={() => { setLoginType('staff'); setCredential(''); setError(''); }} className={`flex-1 py-2 font-semibold text-sm rounded-full transition-all ${loginType === 'staff' ? 'bg-white text-primary shadow' : 'text-text-light'}`}>Store Login</button>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          {loginType === 'admin' ? (
            <div>
              <h2 className="text-xl font-bold text-center text-text-dark">Admin Access</h2>
              <input type="password" placeholder="Password" value={credential} onChange={(e) => setCredential(e.target.value)} className="mt-2 w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition text-text-dark" required />
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-center text-text-dark">Store Access</h2>
               <p className="text-center text-xs text-text-light mt-1">(Hint: try code ABCDE)</p>
              <input type="text" placeholder="Access Code" value={credential} onChange={(e) => setCredential(e.target.value)} className="mt-2 w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition text-text-dark" required />
            </div>
          )}
          {error && <p className="text-error text-sm text-center">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-wait">
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

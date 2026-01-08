
import React, { useState } from 'react';
import { PASSWORDS } from '../constants';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (PASSWORDS.includes(password)) {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2c1810] p-4 bg-opacity-95" 
         style={{ backgroundImage: 'url(https://picsum.photos/1920/1080?coffee)', backgroundBlendMode: 'overlay', backgroundSize: 'cover' }}>
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#6f4e37] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 004.254 5.426M13.308 19.583a9.983 9.983 0 01-5.181 3.428M19.083 13.308a9.983 9.983 0 01-3.428 5.181M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">كوفي كورنر</h1>
          <p className="text-gray-300">نظام الكاشير الذكي</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${error ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6f4e37] transition-all`}
              placeholder="••••••••"
            />
            {error && <p className="text-red-400 text-xs mt-2 text-center">كلمة المرور غير صحيحة</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-[#6f4e37] hover:bg-[#5d402d] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg transform active:scale-95"
          >
            دخول النظام
          </button>
        </form>
      </div>
    </div>
  );
};

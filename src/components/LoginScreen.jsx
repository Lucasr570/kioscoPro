import React, { useState } from 'react';
import { Lock, User, ShieldCheck } from 'lucide-react';

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === '1234') {
      setError('');
      onLogin();
    } else {
      setError('Credenciales incorrectas. Intente nuevamente.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-3xl shadow-xl shadow-emerald-200 mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">KioscoPro</h1>
          <p className="text-slate-400 font-medium mt-2">Sistema de Gestión de Ventas e Inventario</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
          {/* Subtle gradient background */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-emerald-300"></div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Usuario</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                  <User size={20} />
                </div>
                <input
                  id="username"
                  type="text"
                  placeholder="admin"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-700"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2 animate-bounce">
                <ShieldCheck size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg tracking-widest uppercase hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-200 transition-all active:scale-[0.98]"
            >
              ACCEDER AL PANEL
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-slate-300 text-xs font-bold tracking-widest uppercase">
          Versión Profesional 2.0.1
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;

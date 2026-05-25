import React, { useState } from 'react';
import { Lock, User, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import apiClient from '../api/client';

const LoginScreen = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const response = await apiClient.post('/token/', {
        username: username,
        password: password
      });
      
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      onLogin();
    } catch (err) {
      if (err.response && (err.response.status === 400 || err.response.status === 401)) {
        setError('Credenciales incorrectas. Verifique usuario y contraseña.');
      } else {
        setError('Error al conectar con el servidor. Intente nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      await apiClient.post('/register/', {
        username: username,
        password: password,
        email: email
      });
      
      setSuccess('Usuario creado exitosamente. Ahora puedes iniciar sesión.');
      setIsRegistering(false);
      // Opcional: limpiar contraseña para forzar que la escriban de nuevo
      setPassword('');
    } catch (err) {
      if (err.response && err.response.data) {
        // Mostrar el primer mensaje de error que envíe la API
        const firstError = Object.values(err.response.data)[0];
        setError(Array.isArray(firstError) ? firstError[0] : 'Error al registrar usuario.');
      } else {
        setError('Error al conectar con el servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="inline-flex items-center justify-center gap-3 text-4xl font-black text-slate-800 tracking-tight">
            <span>KioscoPro</span>         
            {/* Metemos tu caja de icono aquí adentro para que se ubique a la derecha */}
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-200 transform rotate-3 hover:rotate-0 transition-transform duration-500 select-none">
              <ShieldCheck size={24} className="text-white" />
            </div>
          </h1>
          
          <p className="text-slate-400 font-medium mt-2">Sistema de Gestión de Ventas e Inventario</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
          {/* Subtle gradient background */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-emerald-300"></div>
          
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
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
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {isRegistering && (
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email (Opcional)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-700"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2 animate-bounce">
                <ShieldCheck size={18} className="shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                <ShieldCheck size={18} className="shrink-0" />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl font-black text-lg tracking-widest uppercase transition-all active:scale-[0.98] ${
                isLoading 
                  ? "bg-slate-400 text-slate-100 cursor-not-allowed" 
                  : "bg-slate-900 text-white hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-200"
              }`}
            >
              {isLoading ? 'PROCESANDO...' : (isRegistering ? 'CREAR CUENTA' : 'ACCEDER AL PANEL')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setSuccess('');
              }}
              className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors"
            >
              {isRegistering 
                ? "¿Ya tienes una cuenta? Iniciar Sesión" 
                : "¿No tienes cuenta? Regístrate y crea tu kiosco"}
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-300 text-xs font-bold tracking-widest uppercase">
          Versión Profesional 2.0.1
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;

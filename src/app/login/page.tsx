'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Credenciais inválidas.');
      } else {
        // Redirect according to role
        if (data.user.role === 'ADMIN') {
          router.push('/dashboard/admin');
        } else if (data.user.role === 'PROFESSIONAL') {
          router.push('/dashboard/pro');
        } else {
          router.push('/dashboard/client');
        }
        router.refresh();
      }
    } catch (err) {
      setErrorMsg('Erro de conexão ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Demo shortcut credentials
  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#D9AD45]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 z-10">
        <Logo variant="full" size="lg" className="justify-center" />
        <h2 className="text-2xl font-black tracking-tight text-white mt-4">
          Iniciar Sessão
        </h2>
        <p className="text-xs text-zinc-400">
          Aceda ao seu painel de cliente, profissional ou administração
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-[#141414] py-8 px-6 shadow-2xl rounded-2xl border border-[#262626] sm:px-10 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-950/70 border border-red-800 rounded-xl flex items-center gap-2 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Endereço de E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="utilizador@exemplo.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D9AD45]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Palavra-passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D9AD45]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gold-gradient-bg text-[#0A0A0A] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#D9AD45]/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'A Entrar...' : 'Entrar na Plataforma'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* DEMO SHORTCUT BUTTONS */}
          <div className="pt-4 border-t border-[#222]">
            <span className="block text-[11px] font-semibold text-[#D9AD45] mb-2 uppercase text-center">
              Acesso Rápido de Demonstração
            </span>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => fillDemo('admin@crocodilovigilante.co.mz', 'Admin123!')}
                className="p-2 rounded-lg bg-[#202020] hover:bg-[#282828] text-red-300 border border-red-900/40 text-center font-bold"
              >
                ADMIN
              </button>
              <button
                type="button"
                onClick={() => fillDemo('carlos.tembe@gmail.com', 'Password123!')}
                className="p-2 rounded-lg bg-[#202020] hover:bg-[#282828] text-zinc-200 border border-zinc-700 text-center font-bold"
              >
                CLIENTE
              </button>
              <button
                type="button"
                onClick={() => fillDemo('armando.sitoe@crocodilovigilante.co.mz', 'Password123!')}
                className="p-2 rounded-lg bg-[#202020] hover:bg-[#282828] text-[#F2CC70] border border-[#D9AD45]/40 text-center font-bold"
              >
                PROFISSIONAL
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-zinc-400 pt-2">
            Ainda não tem conta?{' '}
            <Link href="/register" className="text-[#F2CC70] font-semibold hover:underline">
              Registe-se gratuitamente
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

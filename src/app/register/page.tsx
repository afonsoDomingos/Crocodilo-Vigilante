'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import {
  User,
  Shield,
  Building,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'pro' ? 'PROFESSIONAL' : 'CLIENT';

  const [role, setRole] = useState<'CLIENT' | 'PROFESSIONAL'>(initialRole);
  const [clientType, setClientType] = useState<'INDIVIDUAL' | 'COMPANY'>('INDIVIDUAL');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+258 ');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('Maputo');
  const [companyName, setCompanyName] = useState('');
  const [nuit, setNuit] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [unarmedAccepted, setUnarmedAccepted] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('As palavras-passe não coincidem.');
      return;
    }

    if (!termsAccepted) {
      setErrorMsg('Deve aceitar os Termos de Utilização e Política de Privacidade.');
      return;
    }

    if (role === 'PROFESSIONAL' && !unarmedAccepted) {
      setErrorMsg(
        'Deve concordar expressamente que atuará exclusivamente como profissional de segurança desarmada.'
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role,
          clientType,
          companyName: clientType === 'COMPANY' ? companyName : undefined,
          nuit: clientType === 'COMPANY' ? nuit : undefined,
          city,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Erro ao criar conta.');
      } else {
        if (role === 'PROFESSIONAL') {
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

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#D9AD45]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center space-y-3 z-10">
        <Logo variant="full" size="lg" className="justify-center" />
        <h2 className="text-2xl font-black tracking-tight text-white mt-4">
          Criar Nova Conta
        </h2>
        <p className="text-xs text-zinc-400">
          Junte-se à maior rede de segurança privada desarmada em Moçambique
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4">
        <div className="bg-[#141414] py-8 px-6 shadow-2xl rounded-2xl border border-[#262626] sm:px-10 space-y-6">
          {/* Role selector tab */}
          <div className="grid grid-cols-2 gap-2 bg-[#1A1A1A] p-1 rounded-xl border border-[#2A2A2A]">
            <button
              type="button"
              onClick={() => setRole('CLIENT')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                role === 'CLIENT'
                  ? 'gold-gradient-bg text-[#0A0A0A] shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Contratar (Cliente)</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('PROFESSIONAL')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                role === 'PROFESSIONAL'
                  ? 'gold-gradient-bg text-[#0A0A0A] shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Trabalhar (Vigilante)</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/70 border border-red-800 rounded-xl flex items-center gap-2 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {role === 'CLIENT' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-zinc-300">
                <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                  clientType === 'INDIVIDUAL'
                    ? 'bg-[#1C1C1C] border-[#D9AD45]/50 text-white'
                    : 'bg-[#161616] border-[#262626] text-zinc-400'
                }`}>
                  <input
                    type="radio"
                    name="clientType"
                    checked={clientType === 'INDIVIDUAL'}
                    onChange={() => setClientType('INDIVIDUAL')}
                    className="accent-[#D9AD45] w-4 h-4"
                  />
                  <span>Pessoa Singular / Família</span>
                </label>
                <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                  clientType === 'COMPANY'
                    ? 'bg-[#1C1C1C] border-[#D9AD45]/50 text-white'
                    : 'bg-[#161616] border-[#262626] text-zinc-400'
                }`}>
                  <input
                    type="radio"
                    name="clientType"
                    checked={clientType === 'COMPANY'}
                    onChange={() => setClientType('COMPANY')}
                    className="accent-[#D9AD45] w-4 h-4"
                  />
                  <span>Empresa / Instituição</span>
                </label>
              </div>
            )}

            {role === 'CLIENT' && clientType === 'COMPANY' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Valor Moçambique Lda"
                    className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white focus:outline-none focus:border-[#D9AD45]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    NUIT *
                  </label>
                  <input
                    type="text"
                    required
                    value={nuit}
                    onChange={(e) => setNuit(e.target.value)}
                    placeholder="Número de Identificação Tributária"
                    className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white focus:outline-none focus:border-[#D9AD45]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                {role === 'CLIENT' && clientType === 'COMPANY'
                  ? 'Representante Autorizado *'
                  : 'Nome Completo *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos Alberto Tembe"
                className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white focus:outline-none focus:border-[#D9AD45]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white focus:outline-none focus:border-[#D9AD45]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Telefone / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+258 84 000 0000"
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white focus:outline-none focus:border-[#D9AD45]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Cidade Principal (Moçambique) *
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white focus:outline-none focus:border-[#D9AD45]"
              >
                <option value="Maputo">Maputo Cidade</option>
                <option value="Matola">Matola</option>
                <option value="Beira">Beira</option>
                <option value="Nampula">Nampula</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Palavra-passe (mín. 6 caracteres) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white focus:outline-none focus:border-[#D9AD45]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Confirmar Palavra-passe *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white focus:outline-none focus:border-[#D9AD45]"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-2 text-xs">
              <label className="flex items-start gap-2 cursor-pointer text-zinc-300">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 accent-[#D9AD45]"
                />
                <span>
                  Aceito os Termos de Serviço e a Política de Privacidade do CROCODILO VIGILANTE.
                </span>
              </label>

              {role === 'PROFESSIONAL' && (
                <label className="flex items-start gap-2 cursor-pointer text-[#F2CC70] font-medium bg-[#1F1F1F] p-2.5 rounded-lg border border-[#D9AD45]/30">
                  <input
                    type="checkbox"
                    checked={unarmedAccepted}
                    onChange={(e) => setUnarmedAccepted(e.target.checked)}
                    className="mt-0.5 accent-[#D9AD45]"
                  />
                  <span>
                    Declaro estar ciente de que todos os serviços são <strong>estritamente desarmados</strong> e que deverei submeter BI e registo criminal na candidatura.
                  </span>
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gold-gradient-bg text-[#0A0A0A] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#D9AD45]/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              <span>{loading ? 'A Registar...' : 'Concluir Registo'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-zinc-400 pt-2">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-[#F2CC70] font-semibold hover:underline">
              Iniciar Sessão
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center text-xs">Carregando registo...</div>}>
      <RegisterContent />
    </Suspense>
  );
}

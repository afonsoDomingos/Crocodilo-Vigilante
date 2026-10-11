'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import {
  Shield,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Calendar,
  MapPin,
  Phone,
  Briefcase,
  Lock,
  ChevronRight,
  Info,
} from 'lucide-react';

function ProfessionalDashboardContent() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  // 5-Stage Application Editor State
  const [bio, setBio] = useState('');
  const [yearsExp, setYearsExp] = useState(0);
  const [skills, setSkills] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [city, setCity] = useState('Maputo');
  const [neighborhood, setNeighborhood] = useState('');
  const [hourlyRate, setHourlyRate] = useState(300);
  const [idDocNumber, setIdDocNumber] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // Document upload state
  const [docType, setDocType] = useState<'BI_DIRE' | 'CRIMINAL_RECORD' | 'SECURITY_CERTIFICATE'>('BI_DIRE');
  const [docFileName, setDocFileName] = useState('');
  const [docExpiresAt, setDocExpiresAt] = useState('');

  const [savingApp, setSavingApp] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchProData();
  }, []);

  const fetchProData = async () => {
    setLoading(true);
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      if (authData.authenticated) {
        setUser(authData.user);
      }

      // Fetch pro bookings
      const bkRes = await fetch('/api/bookings');
      const bkData = await bkRes.json();
      if (bkData.bookings) {
        setBookings(bkData.bookings);
      }

      // Fetch applications list to find this user's profile
      const appRes = await fetch('/api/applications');
      if (appRes.ok) {
        const appData = await appRes.json();
        // If admin endpoint or we can fetch current pro profile:
      }

      // Or fetch from public guard endpoint with user's profileId
      if (authData.user?.profileId) {
        const guardRes = await fetch(`/api/guards/${authData.user.profileId}`);
        const guardData = await guardRes.json();
        if (guardData.guard) {
          const g = guardData.guard;
          setProfile(g);
          setBio(g.bio || '');
          setYearsExp(g.yearsExperience || 0);
          setSkills(g.skills || []);
          setCategories(g.categories || []);
          setCity(g.city || 'Maputo');
          setNeighborhood(g.neighborhood || '');
          setHourlyRate(g.hourlyRate || 300);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingApp(true);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          yearsExperience: yearsExp,
          skills,
          categories,
          city,
          neighborhood,
          hourlyRate,
          idDocNumber,
          emergencyContactName,
          emergencyContactPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao submeter dados da candidatura.');
      } else {
        setSuccessMsg('Candidatura submetida para análise da administração!');
        fetchProData();
      }
    } catch (err) {
      alert('Erro de conexão ao servidor.');
    } finally {
      setSavingApp(false);
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFileName) return;

    try {
      const res = await fetch('/api/applications/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType,
          fileName: docFileName,
          fileSize: 1048576,
          expiresAt: docExpiresAt || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao anexar documento.');
      } else {
        alert('Documento seguro registado na sua candidatura!');
        setDocFileName('');
        fetchProData();
      }
    } catch (err) {
      alert('Erro de conexão.');
    }
  };

  const isApproved = profile?.isVerified && profile?.isActive;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#181818] via-[#141414] to-[#121212] p-6 sm:p-8 rounded-2xl border border-[#262626] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D9AD45]/15 border border-[#D9AD45]/40 text-[11px] font-bold text-[#F2CC70] mb-2">
              <Shield className="w-3.5 h-3.5 text-[#D9AD45]" />
              PAINEL DO PROFISSIONAL
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {user?.name || 'Profissional de Segurança'}
            </h1>
            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
              <span>Crachá: <strong className="text-[#D9AD45] font-mono">{profile?.badgeNumber || 'PENDING'}</strong></span>
              <span>•</span>
              <span>{city} (Moçambique)</span>
            </div>
          </div>

          <div>
            {isApproved ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                CANDIDATURA APROVADA & ATIVO
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-950/80 border border-amber-700 text-[#F2CC70] font-bold text-xs">
                <Clock className="w-4 h-4 text-[#D9AD45]" />
                CANDIDATURA EM ANÁLISE ADMINISTRATIVA
              </span>
            )}
          </div>
        </div>

        {/* 5-STAGE PROCESS TRACKER */}
        <div className="bg-[#141414] border border-[#222] p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
              Processo de Habilitação & Verificação (5 Etapas)
            </h2>
            <span className="text-xs text-zinc-500 font-mono">Conformidade Legal MZ</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 pt-2">
            {/* Step 1 */}
            <div className="p-3 rounded-xl bg-[#1C1C1C] border border-emerald-800/40 text-emerald-300">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span>Etapa 1</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-[11px] font-semibold text-white">Criação da Conta</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Autenticação validada</p>
            </div>

            {/* Step 2 */}
            <div className="p-3 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A]">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-[#D9AD45]">Etapa 2</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
              </div>
              <p className="text-[11px] font-semibold text-white">Dados Pessoais</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">BI e Contactos</p>
            </div>

            {/* Step 3 */}
            <div className="p-3 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A]">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-[#D9AD45]">Etapa 3</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
              </div>
              <p className="text-[11px] font-semibold text-white">Perfil Profissional</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Competências & Exp.</p>
            </div>

            {/* Step 4 */}
            <div className="p-3 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A]">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-[#D9AD45]">Etapa 4</span>
                <Lock className="w-3.5 h-3.5 text-zinc-500" />
              </div>
              <p className="text-[11px] font-semibold text-white">Documentos Legais</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Registo Criminal & BI</p>
            </div>

            {/* Step 5 */}
            <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A]">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-[#D9AD45]">Etapa 5</span>
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
              </div>
              <p className="text-[11px] font-semibold text-white">Análise da Equipa</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Decisão Administrativa</p>
            </div>
          </div>
        </div>

        {/* Strict Marketplace Lock Notice */}
        {!isApproved && (
          <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-200">
            <AlertTriangle className="w-5 h-5 text-[#D9AD45] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-white text-sm">Aviso de Conformidade:</strong>
              <span>
                Enquanto a sua candidatura não estiver no estado <strong>APROVADO</strong> pela administração, o seu perfil <strong>não aparecerá no marketplace público</strong> e não poderá receber novas contratações. Preencha os campos abaixo e anexe os documentos solicitados.
              </span>
            </div>
          </div>
        )}

        {/* SECTION: SERVIÇOS CONFIRMADOS / MISSÕES OPERACIONAIS */}
        <div className="bg-[#141414] border border-[#222] p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#202020]">
            <div>
              <h2 className="text-base font-bold text-white">Minhas Missões Operacionais</h2>
              <p className="text-xs text-zinc-400">Serviços atribuídos e confirmados para execução</p>
            </div>
            <span className="text-xs text-[#D9AD45] font-semibold">{bookings.length} serviços registados</span>
          </div>

          {bookings.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">Nenhum serviço agendado de momento.</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/80 text-[#F2CC70] border border-amber-800/40">
                      {item.categoryName || 'Segurança'}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">
                      {item.request?.title || 'Serviço Atribuído'}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span>Data: {item.request?.startDate}</span>
                      <span>•</span>
                      <span>Horário: {item.request?.startTime} às {item.request?.endTime}</span>
                      <span>•</span>
                      <span>Local: {item.request?.city} ({item.request?.neighborhood})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-xs text-zinc-400 block">Rendimento Estimado</span>
                      <span className="text-sm font-bold text-[#F2CC70]">
                        {item.booking?.totalAmount ? `${item.booking.totalAmount} MT` : 'Valor em contrato'}
                      </span>
                    </div>
                    <button
                      onClick={() => alert(`Check-in registado para a missão ${item.booking?.id || ''}!`)}
                      className="px-4 py-2 rounded-xl gold-gradient-bg text-[#0A0A0A] font-bold text-xs"
                    >
                      Registar Check-in
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION: FORMULÁRIO DE CANDIDATURA & ATUALIZAÇÃO DE PERFIL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Profile & Qualifications */}
          <div className="lg:col-span-8 bg-[#141414] border border-[#222] p-6 rounded-2xl space-y-5">
            <div className="pb-3 border-b border-[#202020]">
              <h2 className="text-base font-bold text-white">Perfil Profissional & Disponibilidade</h2>
              <p className="text-xs text-zinc-400">
                Preencha as suas informações com rigor. Todos os dados serão auditados pela equipa de segurança.
              </p>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateApplication} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Resumo da Experiência Profissional (Bio) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Descreva a sua postura, tipo de instalações já vigiadas e procedimentos preventivos..."
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-white focus:outline-none focus:border-[#D9AD45]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Anos de Experiência *</label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={yearsExp}
                    onChange={(e) => setYearsExp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Tarifa Horária Pretendida (MT) *</label>
                  <input
                    type="number"
                    min={150}
                    max={2000}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Cidade Principal *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-white"
                  >
                    <option value="Maputo">Maputo Cidade</option>
                    <option value="Matola">Matola</option>
                    <option value="Beira">Beira</option>
                    <option value="Nampula">Nampula</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Número do Documento (BI / DIRE) *</label>
                  <input
                    type="text"
                    value={idDocNumber}
                    onChange={(e) => setIdDocNumber(e.target.value)}
                    placeholder="Ex: 110293847581B"
                    className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Bairro Habitual de Atuação</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Ex: Polana Cimento / Central"
                    className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#1A1A1A] p-3 rounded-xl border border-[#262626]">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Nome do Contacto de Emergência</label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Ex: Esposa / Familiar Próximo"
                    className="w-full px-3 py-2 rounded-xl bg-[#222] border border-[#303030] text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Telefone de Emergência</label>
                  <input
                    type="text"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="+258 84 000 0000"
                    className="w-full px-3 py-2 rounded-xl bg-[#222] border border-[#303030] text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingApp}
                  className="px-6 py-2.5 rounded-xl gold-gradient-bg text-[#0A0A0A] font-bold text-xs hover:brightness-110"
                >
                  {savingApp ? 'A Gravar...' : 'Gravar Dados da Candidatura'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Form: Document Upload Vault */}
          <div className="lg:col-span-4 bg-[#141414] border border-[#222] p-6 rounded-2xl space-y-4">
            <div className="pb-3 border-b border-[#202020]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F2CC70]">
                <Lock className="w-4 h-4 text-[#D9AD45]" />
                <span>Cofre de Documentos Privados</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Os seus documentos não são expostos em links públicos. Apenas a administração tem acesso para auditoria.
              </p>
            </div>

            <form onSubmit={handleUploadDoc} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Tipo de Documento Legal *</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-white"
                >
                  <option value="BI_DIRE">Bilhete de Identidade (BI) ou DIRE</option>
                  <option value="CRIMINAL_RECORD">Registo Criminal Limpo</option>
                  <option value="SECURITY_CERTIFICATE">Certificado de Formação de Segurança</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Nome do Ficheiro Submetido *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: registo_criminal_2026.pdf"
                  value={docFileName}
                  onChange={(e) => setDocFileName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Data de Validade (se aplicável)</label>
                <input
                  type="date"
                  value={docExpiresAt}
                  onChange={(e) => setDocExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#222] hover:bg-[#2b2b2b] border border-[#333] text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-[#D9AD45]" />
                <span>Registar Documento para Análise</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ProfessionalDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center text-xs">Carregando painel do profissional...</div>}>
      <ProfessionalDashboardContent />
    </Suspense>
  );
}

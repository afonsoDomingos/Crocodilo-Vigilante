'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import {
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  FileCheck2,
  FileText,
  DollarSign,
  Activity,
  UserCheck,
  UserX,
  X,
  Eye,
} from 'lucide-react';

function AdminDashboardContent() {
  const [metrics, setMetrics] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [reviewModalApp, setReviewModalApp] = useState<any | null>(null);
  const [reviewStatus, setReviewStatus] = useState<
    'APPROVED' | 'REJECTED' | 'NEEDS_CORRECTION' | 'SUSPENDED'
  >('APPROVED');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [correctionDetails, setCorrectionDetails] = useState('');
  const [processingDecision, setProcessingDecision] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const metricsRes = await fetch('/api/admin/metrics');
      const metricsData = await metricsRes.json();
      if (metricsData.metrics) {
        setMetrics(metricsData.metrics);
        setAuditLogs(metricsData.recentAuditLogs || []);
      }

      const appsRes = await fetch('/api/applications');
      const appsData = await appsRes.json();
      if (appsData.applications) {
        setApplications(appsData.applications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalApp) return;

    setProcessingDecision(true);
    try {
      const res = await fetch(`/api/applications/${reviewModalApp.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reviewStatus,
          adminNotes,
          rejectionReason: reviewStatus === 'REJECTED' ? rejectionReason : undefined,
          correctionDetails: reviewStatus === 'NEEDS_CORRECTION' ? correctionDetails : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao submeter decisão administrativa.');
      } else {
        alert(`Decisão "${reviewStatus}" aplicada com sucesso e registada em auditoria!`);
        setReviewModalApp(null);
        fetchAdminData();
      }
    } catch (err) {
      alert('Erro de conexão ao servidor.');
    } finally {
      setProcessingDecision(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#181818] via-[#141414] to-[#121212] p-6 sm:p-8 rounded-2xl border border-red-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-[11px] font-bold text-red-300 mb-2">
              <Shield className="w-3.5 h-3.5 text-red-400" />
              PAINEL EXECUTIVO DE ADMINISTRAÇÃO & CONFORMIDADE
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Gestão Centralizada — Crocodilo Vigilante
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Mesa de análise de candidaturas de seguranças, controlo de permissões, finanças e auditoria contínua.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Ambiente de Produção:</span>
            <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
              OPERACIONAL
            </span>
          </div>
        </div>

        {/* METRICS DASHBOARD (REAL DB NUMBERS) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#141414] border border-[#222] p-5 rounded-2xl">
            <span className="text-xs text-zinc-400 block">Total de Clientes</span>
            <span className="text-2xl font-black text-white mt-1 block">
              {metrics?.totalClients ?? 0}
            </span>
            <span className="text-[10px] text-zinc-500 mt-1 block">Singulares e Empresas</span>
          </div>

          <div className="bg-[#141414] border border-[#222] p-5 rounded-2xl">
            <span className="text-xs text-zinc-400 block">Profissionais Aprovados</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {metrics?.approvedPros ?? 0}
            </span>
            <span className="text-[10px] text-emerald-600 mt-1 block">Visíveis no Marketplace</span>
          </div>

          <div className="bg-[#141414] border border-[#222] p-5 rounded-2xl">
            <span className="text-xs text-zinc-400 block">Candidaturas Pendentes</span>
            <span className="text-2xl font-black text-[#F2CC70] mt-1 block">
              {metrics?.pendingApps ?? 0}
            </span>
            <span className="text-[10px] text-amber-600 mt-1 block">Aguardam análise de BI/Registo</span>
          </div>

          <div className="bg-[#141414] border border-[#222] p-5 rounded-2xl">
            <span className="text-xs text-zinc-400 block">Comissões da Plataforma</span>
            <span className="text-2xl font-black text-[#D9AD45] mt-1 block">
              {metrics?.totalPlatformFeesMZN ?? 0} MT
            </span>
            <span className="text-[10px] text-zinc-500 mt-1 block">10% retido por contratação</span>
          </div>
        </div>

        {/* MESA DE ANÁLISE DE CANDIDATURAS (APPLICATION REVIEW DESK) */}
        <div className="bg-[#141414] border border-[#222] p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#202020]">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#D9AD45]" />
                Mesa de Aprovação de Candidaturas
              </h2>
              <p className="text-xs text-zinc-400">
                Apenas candidatos aprovados e verificados podem ser exibidos no marketplace público.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {applications.length} candidaturas no sistema
            </span>
          </div>

          <div className="divide-y divide-[#202020]">
            {applications.map((app) => (
              <div
                key={app.id}
                className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{app.user?.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        app.status === 'APPROVED'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          : app.status === 'UNDER_REVIEW' || app.status === 'PENDING'
                          ? 'bg-amber-950/80 text-[#F2CC70] border-amber-800'
                          : 'bg-red-950/80 text-red-300 border-red-800'
                      }`}
                    >
                      {app.status}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Crachá: {app.securityProfile?.badgeNumber}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Telefone: {app.user?.phone}</span>
                    <span>Cidade: {app.securityProfile?.city}</span>
                    <span>Experiência: {app.securityProfile?.yearsExperience} anos</span>
                    <span>Tarifa: {app.securityProfile?.hourlyRate} MT/h</span>
                  </div>

                  {app.adminNotes && (
                    <p className="text-xs text-zinc-500 italic mt-1">
                      Nota interna: &ldquo;{app.adminNotes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Review action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setReviewModalApp(app);
                      setReviewStatus(app.status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED');
                      setAdminNotes(app.adminNotes || '');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#222] hover:bg-[#2b2b2b] text-xs font-semibold text-[#F2CC70] border border-[#333] transition-colors"
                  >
                    Avaliar Candidatura
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AUDIT LOG TABLE */}
        <div className="bg-[#141414] border border-[#222] p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#202020]">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#D9AD45]" />
              Registo de Auditoria Operacional (Audit Trail)
            </h2>
            <span className="text-xs text-zinc-500">Ações críticas monitorizadas</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-400">
              <thead className="text-[11px] uppercase bg-[#181818] text-zinc-400 border-b border-[#222]">
                <tr>
                  <th className="py-2.5 px-3">Data & Hora</th>
                  <th className="py-2.5 px-3">Ação</th>
                  <th className="py-2.5 px-3">Entidade</th>
                  <th className="py-2.5 px-3">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202020]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#1a1a1a]">
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString('pt-MZ')}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#F2CC70]">{log.action}</td>
                    <td className="py-2.5 px-3">{log.entityType}</td>
                    <td className="py-2.5 px-3 text-zinc-300">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL: DECISÃO ADMINISTRATIVA */}
        {reviewModalApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl max-w-lg w-full p-6 space-y-5 relative">
              <button
                onClick={() => setReviewModalApp(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pb-3 border-b border-[#202020]">
                <span className="text-[10px] font-semibold text-red-400 uppercase">
                  Ação Administrativa Segura
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Decisão sobre {reviewModalApp.user?.name}
                </h3>
                <p className="text-xs text-zinc-400">
                  A sua decisão afeta a elegibilidade do profissional e a sua visibilidade no marketplace.
                </p>
              </div>

              <form onSubmit={handleDecisionSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Decisão *</label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-white font-bold"
                  >
                    <option value="APPROVED">APROVAR (Ativa Crachá e Exibe no Marketplace)</option>
                    <option value="NEEDS_CORRECTION">SOLICITAR CORREÇÃO DE DOCUMENTOS</option>
                    <option value="REJEITAR">REJEITAR CANDIDATURA</option>
                    <option value="SUSPENDED">SUSPENDER PROFISSIONAL (Bloqueia Contratações)</option>
                  </select>
                </div>

                {reviewStatus === 'REJECTED' && (
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Motivo da Rejeição *</label>
                    <input
                      type="text"
                      required
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Ex: Documento de registo criminal inválido ou com antecedentes"
                      className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-white"
                    />
                  </div>
                )}

                {reviewStatus === 'NEEDS_CORRECTION' && (
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Instruções para o Candidato *</label>
                    <input
                      type="text"
                      required
                      value={correctionDetails}
                      onChange={(e) => setCorrectionDetails(e.target.value)}
                      placeholder="Ex: Submeter cópia legível do Bilhete de Identidade"
                      className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Observações Internas (Auditoria)</label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Registo dos motivos da decisão para consulta por outros administradores..."
                    className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-white"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalApp(null)}
                    className="px-4 py-2 rounded-xl bg-[#202020] text-zinc-300 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={processingDecision}
                    className="px-6 py-2 rounded-xl gold-gradient-bg text-[#0A0A0A] font-bold"
                  >
                    {processingDecision ? 'A Gravar...' : 'Confirmar e Assinar Decisão'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center text-xs">Carregando painel de administração...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}

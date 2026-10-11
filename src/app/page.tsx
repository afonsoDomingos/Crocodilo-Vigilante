import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { CrocodiloIcon } from '@/components/ui/Logo';
import {
  Shield,
  ShieldCheck,
  Search,
  Users,
  Calendar,
  CheckCircle2,
  FileCheck2,
  Building2,
  Home,
  HardHat,
  Store,
  Clock,
  PartyPopper,
  Star,
  ArrowRight,
  MapPin,
  Lock,
} from 'lucide-react';
import { getApprovedGuards } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let verifiedGuards: Awaited<ReturnType<typeof getApprovedGuards>> = [];
  try {
    verifiedGuards = await getApprovedGuards();
  } catch (err) {
    console.error('Notice: Could not load guards dynamically on HomePage:', err);
  }

  const categories = [
    {
      id: 'cat_eventos',
      name: 'Segurança para Eventos',
      desc: 'Casamentos, festas privadas e eventos corporativos.',
      icon: PartyPopper,
      tag: 'Eventos & Gala',
    },
    {
      id: 'cat_empresarial',
      name: 'Segurança Empresarial',
      desc: 'Proteção para escritórios, sedes e empresas.',
      icon: Building2,
      tag: 'Corporativo',
    },
    {
      id: 'cat_residencial',
      name: 'Segurança Residencial',
      desc: 'Vigilância para residências e condomínios.',
      icon: Home,
      tag: 'Habitação',
    },
    {
      id: 'cat_obras',
      name: 'Segurança para Obras',
      desc: 'Fiscalização de estaleiros e maquinaria.',
      icon: HardHat,
      tag: 'Estaleiros',
    },
    {
      id: 'cat_comercial',
      name: 'Segurança Comercial',
      desc: 'Dissuasão preventiva para lojas e comércio.',
      icon: Store,
      tag: 'Retalho',
    },
    {
      id: 'cat_acesso',
      name: 'Controlo de Acesso',
      desc: 'Registo de entradas, viaturas e portarias.',
      icon: ShieldCheck,
      tag: 'Portarias',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 border-b border-[#202020]">
          {/* Subtle Golden Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-[#D9AD45]/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Value Proposition */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#D9AD45]/30 text-xs font-semibold text-[#F2CC70]">
                  <ShieldCheck className="w-4 h-4 text-[#D9AD45]" />
                  <span>Segurança Privada Desarmada Verificada • Moçambique</span>
                </div>

                {/* Slogan & Title */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                  A segurança certa, <br />
                  <span className="gold-gradient-text">à sua confiança.</span>
                </h1>

                {/* Description */}
                <p className="text-sm sm:text-base md:text-lg text-zinc-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Contrate seguranças particulares verificados para eventos, empresas e residências em Moçambique.
                </p>

                {/* Hero CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                  <Link
                    href="/marketplace"
                    className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-xl gold-gradient-bg text-[#0A0A0A] font-bold text-sm sm:text-base hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#D9AD45]/20 flex items-center justify-center gap-2"
                  >
                    <Search className="w-5 h-5 text-[#0A0A0A]" />
                    Encontrar um Segurança
                  </Link>

                  <Link
                    href="/register?role=pro"
                    className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] text-white border border-[#2F2F2F] hover:border-[#D9AD45]/50 font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2"
                  >
                    <Users className="w-5 h-5 text-[#F2CC70]" />
                    Trabalhar como Segurança
                  </Link>
                </div>

                {/* Key Bullet Highlights (Mobile Optimized) */}
                <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 border-t border-[#202020] text-center sm:text-left">
                  <div className="p-3 sm:p-0 rounded-xl bg-[#121212] sm:bg-transparent border border-[#222] sm:border-0">
                    <span className="block text-xl sm:text-2xl font-black text-white">100%</span>
                    <span className="text-xs text-zinc-400">Desarmados & Legais</span>
                  </div>
                  <div className="p-3 sm:p-0 rounded-xl bg-[#121212] sm:bg-transparent border border-[#222] sm:border-0">
                    <span className="block text-xl sm:text-2xl font-black text-[#F2CC70]">BI & Registo</span>
                    <span className="text-xs text-zinc-400">Verificação Rigorosa</span>
                  </div>
                  <div className="p-3 sm:p-0 rounded-xl bg-[#121212] sm:bg-transparent border border-[#222] sm:border-0">
                    <span className="block text-xl sm:text-2xl font-black text-white">M-Pesa / e-Mola</span>
                    <span className="text-xs text-zinc-400">Pagamentos Nacionais</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Shield Card Showcase */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md bg-gradient-to-b from-[#1E1E1E] to-[#121212] p-5 sm:p-8 rounded-2xl border border-[#D9AD45]/30 shadow-2xl gold-border-glow">
                  {/* Decorative badge header */}
                  <div className="flex items-center justify-between pb-5 border-b border-[#262626]">
                    <div className="flex items-center gap-3">
                      <CrocodiloIcon className="w-10 h-10" />
                      <div>
                        <div className="text-xs font-mono text-[#D9AD45]">SELO DE GARANTIA</div>
                        <div className="text-sm font-bold text-white">CROCODILO VIGILANTE</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-bold bg-[#D9AD45]/15 text-[#F2CC70] rounded-full border border-[#D9AD45]/40">
                      ATIVO
                    </span>
                  </div>

                  {/* Highlights list */}
                  <div className="py-5 space-y-3.5">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-[#252525] text-[#D9AD45]">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Profissionais Verificados</h4>
                        <p className="text-xs text-zinc-400">BI e registo criminal validados.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-[#252525] text-[#D9AD45]">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Sem Conflitos de Agenda</h4>
                        <p className="text-xs text-zinc-400">Disponibilidade em tempo real.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-[#252525] text-[#D9AD45]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">100% Desarmados</h4>
                        <p className="text-xs text-zinc-400">Segurança preventiva e pacífica.</p>
                      </div>
                    </div>
                  </div>

                  {/* Mini search trigger inside card */}
                  <Link
                    href="/marketplace"
                    className="w-full py-3 rounded-lg bg-[#252525] hover:bg-[#2e2e2e] border border-[#3a3a3a] text-center text-xs font-semibold text-[#F2CC70] flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Explorar Seguranças Aprovados</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>

            {/* WIDESCREEN HERO COVER BANNER (EQUIPE DE SEGURANÇA CROCODILO VIGILANTE) */}
            <div className="mt-10 sm:mt-14 relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#D9AD45]/40 shadow-2xl gold-border-glow group">
              <div className="relative w-full h-56 sm:h-80 md:h-[440px] lg:h-[500px]">
                <Image
                  src="/equipe-crocodilo.png"
                  alt="Equipe de Segurança Crocodilo Vigilante"
                  fill
                  className="object-cover object-center filter brightness-[0.96] group-hover:scale-[1.02] transition-transform duration-700"
                  priority
                />

                {/* Subtle gradient overlays for cinematic lighting and text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/50 via-transparent to-[#0A0A0A]/50 hidden sm:block" />

                {/* Bottom Card / Floating Banner Footer */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3">
                  <div className="bg-black/80 backdrop-blur-md p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-[#D9AD45]/30 max-w-xl">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#D9AD45] tracking-wider block">
                      Segurança Verificada
                    </span>
                    <h3 className="text-sm sm:text-lg font-black text-white mt-0.5">
                      Proteção Preventiva de Alto Padrão
                    </h3>
                    <p className="text-[11px] sm:text-xs text-zinc-300 mt-1">
                      Profissionais fardados e credenciados para a sua tranquilidade.
                    </p>
                  </div>

                  <Link
                    href="/marketplace"
                    className="px-5 py-3 rounded-xl gold-gradient-bg text-[#0A0A0A] font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 flex-shrink-0"
                  >
                    <span>Contratar Seguranças</span>
                    <ArrowRight className="w-4 h-4 text-[#0A0A0A]" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION: COMO FUNCIONA (3 PASSOS) */}
        <section id="como-funciona" className="py-16 bg-[#0E0E0E] border-b border-[#202020]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D9AD45]">Simples & Rápido</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Como Funciona</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1.5">
                Três passos para contratar segurança verificada.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Step 1 */}
              <div className="bg-[#141414] p-6 sm:p-7 rounded-2xl border border-[#222] relative group hover:border-[#D9AD45]/40 transition-all">
                <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center text-[#0A0A0A] font-black text-base mb-4">
                  01
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Escolha o Serviço</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Defina o tipo de evento, residência ou empresa e o local pretendido.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#141414] p-6 sm:p-7 rounded-2xl border border-[#222] relative group hover:border-[#D9AD45]/40 transition-all">
                <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center text-[#0A0A0A] font-black text-base mb-4">
                  02
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Veja os Profissionais</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Consulte perfis com crachá oficial, avaliações e tarifas por hora.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-[#141414] p-6 sm:p-7 rounded-2xl border border-[#222] relative group hover:border-[#D9AD45]/40 transition-all">
                <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center text-[#0A0A0A] font-black text-base mb-4">
                  03
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Contrate Online</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Confirme a reserva via M-Pesa ou e-Mola sem conflitos de horário.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: CATEGORIAS DE SERVIÇOS */}
        <section id="servicos" className="py-16 bg-[#0A0A0A] border-b border-[#202020]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#D9AD45]">Especialidades</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Categorias de Segurança</h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                  Serviços preventivos adaptados a cada necessidade.
                </p>
              </div>
              <Link
                href="/marketplace"
                className="mt-3 md:mt-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#F2CC70] hover:text-white"
              >
                <span>Ver todas as categorias</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    href={`/marketplace?categoryId=${cat.id}`}
                    className="p-6 rounded-2xl bg-[#141414] border border-[#202020] hover:border-[#D9AD45]/40 hover:-translate-y-1 transition-all group block"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-[#202020] text-[#D9AD45] group-hover:bg-[#D9AD45] group-hover:text-[#0A0A0A] transition-colors">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-[#1C1C1C] text-zinc-400 border border-[#2C2C2C]">
                        {cat.tag}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-[#F2CC70] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      {cat.desc}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION: PROFISSIONAIS VERIFICADOS EM DESTAQUE */}
        <section className="py-20 bg-[#0E0E0E] border-b border-[#202020]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D9AD45]">Marketplace Ativo</span>
              <h2 className="text-3xl font-black text-white mt-1">Profissionais Verificados</h2>
              <p className="text-sm text-zinc-400 mt-2">
                Apenas seguranças aprovados pela administração após conferência de registo criminal e documentos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {verifiedGuards.slice(0, 4).map((guard) => (
                <div
                  key={guard.id}
                  className="bg-[#141414] border border-[#222] rounded-2xl p-5 flex flex-col justify-between hover:border-[#D9AD45]/40 transition-all"
                >
                  <div>
                    {/* Header: Badge & Status */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#202020]">
                      <span className="text-[11px] font-mono text-[#D9AD45] font-semibold">
                        {guard.badgeNumber}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                        <CheckCircle2 className="w-3 h-3" />
                        Verificado
                      </span>
                    </div>

                    {/* Name & Location */}
                    <div className="mt-4">
                      <h4 className="text-base font-bold text-white">{guard.user.name}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#D9AD45]" />
                        <span>{guard.city} • {guard.neighborhood}</span>
                      </div>
                    </div>

                    {/* Bio snippet */}
                    <p className="text-xs text-zinc-400 mt-3 line-clamp-3 leading-relaxed">
                      {guard.bio}
                    </p>

                    {/* Skills tags */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {guard.skills.slice(0, 2).map((skill, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#1e1e1e] text-zinc-300 border border-[#2c2c2c]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rating & Rate CTA */}
                  <div className="pt-4 mt-4 border-t border-[#202020]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3.5 h-3.5 text-[#D9AD45] fill-[#D9AD45]" />
                        <span className="font-bold text-white">{guard.rating}</span>
                        <span className="text-zinc-500 text-[10px]">({guard.reviewCount})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-[#F2CC70]">{guard.hourlyRate} MT</span>
                        <span className="text-[10px] text-zinc-400">/hora</span>
                      </div>
                    </div>

                    <Link
                      href={`/marketplace?guardId=${guard.id}`}
                      className="w-full py-2 rounded-lg bg-[#222] hover:bg-[#D9AD45] hover:text-[#0A0A0A] text-xs font-semibold text-zinc-200 text-center block transition-colors"
                    >
                      Solicitar Contratação
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl gold-gradient-bg text-[#0A0A0A] font-bold text-sm hover:brightness-110 transition-all shadow-md"
              >
                <Search className="w-4 h-4 text-[#0A0A0A]" />
                Ver Todos os Seguranças Disponíveis
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION: CONFIANÇA & NORMAS LEGAIS */}
        <section id="confianca" className="py-16 bg-[#0A0A0A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#D9AD45]">Padrões e Integridade</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  Segurança com Total Confiança
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
                  Conectamos apenas profissionais com identidade confirmada e registo criminal verificado.
                </p>

                <div className="mt-6 space-y-3.5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#D9AD45] mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white">100% Desarmados</h4>
                      <p className="text-xs text-zinc-400">
                        Atuação estritamente preventiva, vigilância e dissuasão pacífica.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#D9AD45] mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Verificação de Documentos</h4>
                      <p className="text-xs text-zinc-400">
                        BI e registo criminal limpo validados pela equipa administrativa.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#D9AD45] mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Sem Conflitos de Horário</h4>
                      <p className="text-xs text-zinc-400">
                        Bloqueio automático de marcações sobrepostas para o mesmo segurança.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#D9AD45] mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Avaliações Verificadas</h4>
                      <p className="text-xs text-zinc-400">
                        Notas e comentários atribuídos apenas após serviços concluídos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Quote Banner */}
              <div className="bg-gradient-to-br from-[#181818] to-[#101010] p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#262626] relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 opacity-5 text-white">
                  <Shield className="w-64 h-64" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-[#D9AD45]/20 flex items-center justify-center text-[#D9AD45]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <blockquote className="text-base sm:text-lg font-medium text-zinc-200 italic leading-relaxed">
                    &ldquo;Proteger o que é seu com pontualidade, transparência e respeito escrupuloso pela legalidade.&rdquo;
                  </blockquote>
                  <div className="pt-3 border-t border-[#262626] flex items-center justify-between">
                    <div>
                      <span className="block text-xs sm:text-sm font-bold text-white">CROCODILO VIGILANTE</span>
                      <span className="text-[11px] text-zinc-400">Moçambique</span>
                    </div>
                    <span className="text-xs font-mono text-[#D9AD45]">M-PESA • E-MOLA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL BANNER */}
        <section className="py-14 bg-[#121212] border-t border-[#202020]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Pronto para Contratar com Tranquilidade?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto">
              Proteção profissional para eventos, condomínios e empresas em Moçambique.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/marketplace"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl gold-gradient-bg text-[#0A0A0A] font-bold text-sm hover:brightness-110 transition-all shadow-lg"
              >
                Pesquisar no Marketplace
              </Link>
              <Link
                href="/register?role=pro"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#202020] hover:bg-[#282828] text-white border border-[#303030] font-semibold text-sm transition-all"
              >
                Candidatar-se como Profissional
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

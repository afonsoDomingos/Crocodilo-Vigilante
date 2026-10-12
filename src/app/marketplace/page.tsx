'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import {
  Search,
  Filter,
  Star,
  MapPin,
  ShieldCheck,
  Clock,
  CheckCircle,
  X,
  AlertTriangle,
  Calendar,
  CreditCard,
  Phone,
  UserCheck,
  ChevronRight,
  Info,
} from 'lucide-react';

interface GuardItem {
  id: string;
  badgeNumber: string;
  bio: string;
  yearsExperience: number;
  skills: string[];
  categories: string[];
  city: string;
  neighborhood: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  isVerified: boolean;
  user: {
    name: string;
    avatarUrl?: string;
    phone: string;
  };
}

interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  iconName: string;
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('categoryId') || 'all';
  const initialGuardId = searchParams.get('guardId');

  const [guards, setGuards] = useState<GuardItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);

  // Modals state
  const [selectedGuardForProfile, setSelectedGuardForProfile] = useState<GuardItem | null>(null);
  const [selectedGuardForBooking, setSelectedGuardForBooking] = useState<GuardItem | null>(null);

  // Booking form state
  const [bookingTitle, setBookingTitle] = useState('');
  const [bookingCategory, setBookingCategory] = useState('');
  const [bookingCity, setBookingCity] = useState('Maputo');
  const [bookingNeighborhood, setBookingNeighborhood] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [bookingHours, setBookingHours] = useState(8);
  const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'EMOLA' | 'BANK_TRANSFER' | 'MANUAL'>('MPESA');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [bookingDescription, setBookingDescription] = useState('');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchGuards();
  }, [selectedCategory, selectedCity, searchQuery, minRating, maxPrice]);

  useEffect(() => {
    if (initialGuardId && guards.length > 0) {
      const found = guards.find((g) => g.id === initialGuardId);
      if (found) {
        setSelectedGuardForBooking(found);
      }
    }
  }, [initialGuardId, guards]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGuards = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') params.append('categoryId', selectedCategory);
      if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
      if (searchQuery) params.append('search', searchQuery);
      if (minRating > 0) params.append('minRating', minRating.toString());
      if (maxPrice < 1000) params.append('maxHourlyRate', maxPrice.toString());

      const res = await fetch(`/api/guards?${params.toString()}`);
      const data = await res.json();
      if (data.guards) {
        setGuards(data.guards);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Check schedule conflict dynamically
  const verifyConflict = async () => {
    if (!selectedGuardForBooking) return;
    try {
      const res = await fetch(
        `/api/bookings/check-conflict?securityProfileId=${selectedGuardForBooking.id}&startDate=${startDate}&endDate=${endDate}&startTime=${startTime}&endTime=${endTime}`
      );
      const data = await res.json();
      if (data.hasConflict) {
        setConflictWarning(data.reason || 'Conflito detectado no horário do profissional.');
      } else {
        setConflictWarning(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedGuardForBooking) {
      verifyConflict();
    }
  }, [startDate, endDate, startTime, endTime, selectedGuardForBooking]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuardForBooking) return;

    setBookingSubmitting(true);
    setBookingSuccessMsg(null);

    try {
      const payload = {
        securityProfileId: selectedGuardForBooking.id,
        categoryId: bookingCategory || selectedGuardForBooking.categories[0] || 'cat_eventos',
        title: bookingTitle || `Serviço de Segurança com ${selectedGuardForBooking.user.name}`,
        description: bookingDescription || 'Vigilância física preventiva desarmada.',
        city: bookingCity,
        neighborhood: bookingNeighborhood || 'Centro',
        startDate,
        endDate,
        startTime,
        endTime,
        hours: Number(bookingHours) || 8,
        paymentMethod,
        paymentReference: paymentPhone ? `${paymentMethod}-${paymentPhone}` : undefined,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Falha ao submeter contratação. Se não estiver autenticado como cliente, faça login.');
      } else {
        setBookingSuccessMsg(
          'Contratação confirmada com sucesso! O profissional foi notificado e o serviço já consta no seu painel de cliente.'
        );
        setTimeout(() => {
          setSelectedGuardForBooking(null);
          setBookingSuccessMsg(null);
        }, 3000);
      }
    } catch (err: any) {
      alert('Erro de conexão ao processar reserva.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Marketplace Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D9AD45] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Marketplace de Segurança Desarmada</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            Pesquisar e Contratar Seguranças
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-xl">
            Profissionais certificados com registo criminal e identidade validados.
          </p>
        </div>

        {/* Official Packages Summary Banner */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#181818] via-[#16140e] to-[#181818] border border-[#D9AD45]/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gold-gradient-bg flex items-center justify-center text-[#0A0A0A] font-bold flex-shrink-0 text-xs">
              MT
            </div>
            <div>
              <span className="font-bold text-white block">
                Tarifário Oficial: <span className="text-[#F2CC70]">400 MT / hora</span> • <span className="text-emerald-400">Pacote Mensal 15.000 MT</span> (Contrato Aberto)
              </span>
              <span className="text-[11px] text-zinc-400">
                1 seg: 400 MT/h • 2 seg: 800 MT/h • 3 seg: 1.200 MT/h • 4 seg: 1.400 MT/h (Valores negociáveis)
              </span>
            </div>
          </div>
          <a
            href="https://wa.me/258866979225?text=Ol%C3%A1%2C%20gostaria%20de%20negociar%20um%20pacote%20de%20seguran%C3%A7a."
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-[#252525] hover:bg-[#D9AD45] hover:text-[#0A0A0A] text-zinc-200 text-xs font-semibold border border-[#3a3a3a] transition-all text-center flex-shrink-0"
          >
            Negociar Pacote
          </a>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#141414] border border-[#222] p-5 rounded-2xl mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Pesquisar por nome ou competência..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D9AD45]"
              />
            </div>

            {/* Category Select */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] text-xs text-white focus:outline-none focus:border-[#D9AD45]"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City Select (Mozambique) */}
            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] text-xs text-white focus:outline-none focus:border-[#D9AD45]"
              >
                <option value="all">Todas as Cidades (Moçambique)</option>
                <option value="Maputo">Maputo Cidade</option>
                <option value="Matola">Matola</option>
                <option value="Beira">Beira</option>
                <option value="Nampula">Nampula</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] text-xs text-white focus:outline-none focus:border-[#D9AD45]"
              >
                <option value={0}>Qualquer Avaliação</option>
                <option value={4.5}>4.5 estrelas ou mais</option>
                <option value={4.8}>4.8 estrelas ou mais</option>
              </select>
            </div>
          </div>

          {/* Quick Active Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1F1F1F] text-xs text-zinc-400">
            <span className="text-[11px] font-semibold text-zinc-500">Filtros rápidos:</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#D9AD45] text-[#0A0A0A] font-bold'
                  : 'bg-[#1C1C1C] text-zinc-300 hover:bg-[#252525]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedCategory('cat_eventos')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === 'cat_eventos'
                  ? 'bg-[#D9AD45] text-[#0A0A0A] font-bold'
                  : 'bg-[#1C1C1C] text-zinc-300 hover:bg-[#252525]'
              }`}
            >
              Eventos
            </button>
            <button
              onClick={() => setSelectedCategory('cat_residencial')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === 'cat_residencial'
                  ? 'bg-[#D9AD45] text-[#0A0A0A] font-bold'
                  : 'bg-[#1C1C1C] text-zinc-300 hover:bg-[#252525]'
              }`}
            >
              Residencial & Condomínios
            </button>
            <button
              onClick={() => setSelectedCategory('cat_obras')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === 'cat_obras'
                  ? 'bg-[#D9AD45] text-[#0A0A0A] font-bold'
                  : 'bg-[#1C1C1C] text-zinc-300 hover:bg-[#252525]'
              }`}
            >
              Obras & Estaleiros
            </button>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 text-xs text-zinc-400">
          <div>
            Apresentando <strong className="text-white">{guards.length}</strong> profissionais aprovados e disponíveis
          </div>
          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" /> Apenas perfis certificados e desarmados
          </span>
        </div>

        {/* Guards Grid */}
        {loading ? (
          <div className="text-center py-20 text-zinc-500 text-sm">
            A carregar profissionais verificados...
          </div>
        ) : guards.length === 0 ? (
          <div className="text-center py-20 bg-[#121212] rounded-2xl border border-[#222] p-8 space-y-3">
            <Info className="w-10 h-10 text-[#D9AD45] mx-auto opacity-70" />
            <h3 className="text-lg font-bold text-white">Nenhum profissional encontrado</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Nenhum profissional aprovado corresponde aos critérios selecionados. Tente alargar a cidade ou a categoria da pesquisa.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedCity('all');
                setSearchQuery('');
                setMinRating(0);
              }}
              className="mt-2 px-4 py-2 rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-xs font-semibold text-[#F2CC70]"
            >
              Limpar todos os filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guards.map((guard) => (
              <div
                key={guard.id}
                className="bg-[#141414] border border-[#222] rounded-2xl p-6 flex flex-col justify-between hover:border-[#D9AD45]/50 transition-all shadow-lg hover:shadow-[#D9AD45]/5 group"
              >
                <div>
                  {/* Card Top: Crachá & Status */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#202020]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#D9AD45]">
                        {guard.badgeNumber}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {guard.yearsExperience} anos exp.
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                      <ShieldCheck className="w-3 h-3" />
                      Aprovado
                    </span>
                  </div>

                  {/* Pro Name & City */}
                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#F2CC70] transition-colors">
                      {guard.user.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D9AD45]" />
                      <span>{guard.city} • {guard.neighborhood}</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-zinc-400 mt-3 line-clamp-3 leading-relaxed">
                    {guard.bio}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {guard.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#1C1C1C] text-zinc-300 border border-[#282828]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Rating, Rate & Action Buttons */}
                <div className="pt-5 mt-5 border-t border-[#202020]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-[#D9AD45] fill-[#D9AD45]" />
                      <span className="text-sm font-bold text-white">{guard.rating}</span>
                      <span className="text-xs text-zinc-500">({guard.reviewCount} avaliações)</span>
                    </div>
                    <div>
                      <span className="text-base font-black text-[#F2CC70]">{guard.hourlyRate} MT</span>
                      <span className="text-[10px] text-zinc-400">/hora</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedGuardForProfile(guard)}
                      className="py-2.5 px-3 rounded-xl bg-[#202020] hover:bg-[#282828] text-xs font-semibold text-zinc-300 transition-colors text-center"
                    >
                      Ver Perfil
                    </button>
                    <button
                      onClick={() => {
                        setSelectedGuardForBooking(guard);
                        setBookingTitle(`Segurança com ${guard.user.name}`);
                        setBookingCity(guard.city);
                        setBookingNeighborhood(guard.neighborhood);
                      }}
                      className="py-2.5 px-3 rounded-xl gold-gradient-bg text-[#0A0A0A] font-bold text-xs hover:brightness-110 active:scale-95 transition-all text-center shadow-md shadow-[#D9AD45]/15"
                    >
                      Solicitar Serviço
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL: VER PERFIL COMPLETO */}
        {selectedGuardForProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl max-w-lg w-full p-6 space-y-5 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedGuardForProfile(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 pb-4 border-b border-[#202020]">
                <div className="w-12 h-12 rounded-full bg-[#202020] border border-[#D9AD45]/40 flex items-center justify-center font-bold text-lg text-[#F2CC70]">
                  {selectedGuardForProfile.user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedGuardForProfile.user.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="font-mono text-[#D9AD45]">{selectedGuardForProfile.badgeNumber}</span>
                    <span>•</span>
                    <span>{selectedGuardForProfile.city}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Sobre o Profissional</h4>
                <p className="text-xs text-zinc-300 leading-relaxed bg-[#1a1a1a] p-3 rounded-xl border border-[#262626]">
                  {selectedGuardForProfile.bio}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Competências Verificadas</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedGuardForProfile.skills.map((s, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded bg-[#202020] text-zinc-200 border border-[#2E2E2E]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#202020] flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400 block">Tarifa de Referência</span>
                  <span className="text-lg font-black text-[#F2CC70]">{selectedGuardForProfile.hourlyRate} MT/h</span>
                </div>
                <button
                  onClick={() => {
                    const guard = selectedGuardForProfile;
                    setSelectedGuardForProfile(null);
                    setSelectedGuardForBooking(guard);
                    setBookingTitle(`Segurança com ${guard.user.name}`);
                    setBookingCity(guard.city);
                    setBookingNeighborhood(guard.neighborhood);
                  }}
                  className="px-6 py-2.5 rounded-xl gold-gradient-bg text-[#0A0A0A] font-bold text-xs hover:brightness-110"
                >
                  Contratar Agora
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: SOLICITAÇÃO E CONTRATAÇÃO */}
        {selectedGuardForBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl max-w-xl w-full p-6 space-y-5 relative max-h-[92vh] overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedGuardForBooking(null);
                  setBookingSuccessMsg(null);
                }}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="pb-4 border-b border-[#202020]">
                <span className="text-[11px] font-semibold text-[#D9AD45] uppercase tracking-wider">
                  Formulário Oficial de Contratação
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Solicitar {selectedGuardForBooking.user.name} ({selectedGuardForBooking.badgeNumber})
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Tarifa: {selectedGuardForBooking.hourlyRate} MT/hora • Serviço estritamente desarmado
                </p>
              </div>

              {bookingSuccessMsg ? (
                <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-200 p-4 rounded-xl text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-semibold">{bookingSuccessMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  {/* Conflict alert */}
                  {conflictWarning && (
                    <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl flex items-start gap-2.5 text-red-200 text-xs">
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Conflito de Agenda!</strong>
                        <span>{conflictWarning}</span>
                      </div>
                    </div>
                  )}

                  {/* Title & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        Título ou Finalidade do Serviço *
                      </label>
                      <input
                        type="text"
                        required
                        value={bookingTitle}
                        onChange={(e) => setBookingTitle(e.target.value)}
                        placeholder="Ex: Segurança para Casamento Familiar"
                        className="w-full px-3 py-2 rounded-lg bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white focus:outline-none focus:border-[#D9AD45]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        Categoria de Serviço *
                      </label>
                      <select
                        value={bookingCategory}
                        onChange={(e) => setBookingCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white focus:outline-none focus:border-[#D9AD45]"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location in Mozambique */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        Cidade (Moçambique) *
                      </label>
                      <select
                        value={bookingCity}
                        onChange={(e) => setBookingCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white focus:outline-none focus:border-[#D9AD45]"
                      >
                        <option value="Maputo">Maputo Cidade</option>
                        <option value="Matola">Matola</option>
                        <option value="Beira">Beira</option>
                        <option value="Nampula">Nampula</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        Bairro / Local do Serviço *
                      </label>
                      <input
                        type="text"
                        required
                        value={bookingNeighborhood}
                        onChange={(e) => setBookingNeighborhood(e.target.value)}
                        placeholder="Ex: Bairro da Polana / Salão de Eventos"
                        className="w-full px-3 py-2 rounded-lg bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white focus:outline-none focus:border-[#D9AD45]"
                      />
                    </div>
                  </div>

                  {/* Dates & Times */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Data Início *</label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          if (e.target.value > endDate) setEndDate(e.target.value);
                        }}
                        className="w-full px-2 py-1.5 rounded-lg bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Data Fim *</label>
                      <input
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Hora Início *</label>
                      <input
                        type="time"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Hora Fim *</label>
                      <input
                        type="time"
                        required
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Total hours */}
                  <div className="grid grid-cols-2 gap-3 items-center bg-[#1C1C1C] p-3 rounded-xl border border-[#262626]">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-300">Total de Horas Previstas</label>
                      <input
                        type="number"
                        min={1}
                        max={72}
                        value={bookingHours}
                        onChange={(e) => setBookingHours(Number(e.target.value))}
                        className="w-24 mt-1 px-3 py-1.5 rounded-lg bg-[#252525] border border-[#353535] text-xs text-white font-bold"
                      />
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-zinc-400 block">Valor Total Estimado</span>
                      <span className="text-xl font-black text-[#F2CC70]">
                        {selectedGuardForBooking.hourlyRate * bookingHours} MT
                      </span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Método de Pagamento em Moçambique *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('MPESA')}
                        className={`py-2.5 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                          paymentMethod === 'MPESA'
                            ? 'bg-red-950/80 border-red-600 text-red-200 shadow-sm'
                            : 'bg-[#1C1C1C] border-[#2C2C2C] text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span>M-Pesa (Vodacom)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('EMOLA')}
                        className={`py-2.5 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                          paymentMethod === 'EMOLA'
                            ? 'bg-amber-950/80 border-amber-600 text-amber-200 shadow-sm'
                            : 'bg-[#1C1C1C] border-[#2C2C2C] text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span>e-Mola (Movitel)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('MANUAL')}
                        className={`py-2.5 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                          paymentMethod === 'MANUAL'
                            ? 'bg-zinc-800 border-zinc-500 text-white shadow-sm'
                            : 'bg-[#1C1C1C] border-[#2C2C2C] text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span>Manual / Depósito</span>
                      </button>
                    </div>

                    {(paymentMethod === 'MPESA' || paymentMethod === 'EMOLA') && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Número de Telefone (ex: 841234567)"
                          value={paymentPhone}
                          onChange={(e) => setPaymentPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white focus:outline-none focus:border-[#D9AD45]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Specific notes */}
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Observações e Instruções Operacionais
                    </label>
                    <textarea
                      rows={2}
                      value={bookingDescription}
                      onChange={(e) => setBookingDescription(e.target.value)}
                      placeholder="Indique orientações especiais para o profissional..."
                      className="w-full px-3 py-2 rounded-lg bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white focus:outline-none focus:border-[#D9AD45]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#202020]">
                    <button
                      type="button"
                      onClick={() => setSelectedGuardForBooking(null)}
                      className="px-4 py-2 rounded-lg bg-[#202020] hover:bg-[#282828] text-xs font-semibold text-zinc-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={bookingSubmitting || Boolean(conflictWarning)}
                      className="px-6 py-2.5 rounded-xl gold-gradient-bg text-[#0A0A0A] font-bold text-xs hover:brightness-110 disabled:opacity-50"
                    >
                      {bookingSubmitting ? 'A Processar...' : 'Confirmar Contratação'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">Carregando marketplace...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}

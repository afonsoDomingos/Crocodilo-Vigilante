'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import {
  Shield,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  Star,
  MapPin,
  Phone,
  FileText,
  AlertCircle,
  X,
  CreditCard,
} from 'lucide-react';

interface BookingItem {
  id: string;
  status: string;
  totalAmount: number;
  platformFee: number;
  categoryName?: string;
  guard?: {
    id: string;
    name: string;
    badgeNumber: string;
    phone: string;
    rating: number;
  };
  request?: {
    title: string;
    description: string;
    city: string;
    neighborhood: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  };
  payment?: {
    method: string;
    status: string;
    reference: string;
  };
}

function ClientDashboardContent() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Review modal state
  const [reviewModalBooking, setReviewModalBooking] = useState<BookingItem | null>(null);
  const [ratingPunctuality, setRatingPunctuality] = useState(5);
  const [ratingProfessionalism, setRatingProfessionalism] = useState(5);
  const [ratingGeneral, setRatingGeneral] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      if (authData.authenticated) {
        setUser(authData.user);
      }

      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalBooking || !reviewModalBooking.guard) return;

    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: reviewModalBooking.id,
          securityProfileId: reviewModalBooking.guard.id,
          ratingPunctuality,
          ratingProfessionalism,
          ratingGeneral,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao submeter avaliação.');
      } else {
        setReviewSuccess(true);
        setTimeout(() => {
          setReviewModalBooking(null);
          setReviewSuccess(false);
          setReviewComment('');
        }, 2000);
      }
    } catch (err) {
      alert('Falha de conexão.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const inProgressCount = bookings.filter((b) => b.status === 'IN_PROGRESS').length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#181818] via-[#141414] to-[#121212] p-6 sm:p-8 rounded-2xl border border-[#262626] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D9AD45]/15 border border-[#D9AD45]/40 text-[11px] font-bold text-[#F2CC70] mb-2">
              <Shield className="w-3.5 h-3.5 text-[#D9AD45]" />
              ÁREA DO CLIENTE
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Olá, {user?.name || 'Cliente'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Acompanhe as suas contratações ativas, consulte detalhes operacionais e avalie profissionais.
            </p>
          </div>

          <Link
            href="/marketplace"
            className="px-6 py-3 rounded-xl gold-gradient-bg text-[#0A0A0A] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#D9AD45]/20 flex items-center gap-2 flex-shrink-0"
          >
            <Search className="w-4 h-4 text-[#0A0A0A]" />
            Encontrar um Segurança
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#141414] p-5 rounded-2xl border border-[#222]">
            <span className="text-xs text-zinc-400 block">Total de Contratações</span>
            <span className="text-2xl font-black text-white mt-1 block">{bookings.length}</span>
          </div>

          <div className="bg-[#141414] p-5 rounded-2xl border border-[#222]">
            <span className="text-xs text-zinc-400 block">Confirmadas</span>
            <span className="text-2xl font-black text-[#F2CC70] mt-1 block">{confirmedCount}</span>
          </div>

          <div className="bg-[#141414] p-5 rounded-2xl border border-[#222]">
            <span className="text-xs text-zinc-400 block">Em Andamento</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">{inProgressCount}</span>
          </div>

          <div className="bg-[#141414] p-5 rounded-2xl border border-[#222]">
            <span className="text-xs text-zinc-400 block">Concluídas</span>
            <span className="text-2xl font-black text-zinc-300 mt-1 block">{completedCount}</span>
          </div>
        </div>

        {/* Bookings List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#202020]">
            <h2 className="text-lg font-bold text-white">Minhas Contratações</h2>
            <span className="text-xs text-zinc-500">{bookings.length} registos encontrados</span>
          </div>

          {loading ? (
            <div className="text-center py-16 text-zinc-500 text-xs">
              A carregar as suas contratações...
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 bg-[#121212] rounded-2xl border border-[#222] p-8 space-y-3">
              <Shield className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Nenhuma contratação efetuada</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Explore os nossos profissionais de segurança privada verificados e envie a sua primeira solicitação.
              </p>
              <Link
                href="/marketplace"
                className="inline-block mt-2 px-5 py-2.5 rounded-xl gold-gradient-bg text-[#0A0A0A] font-bold text-xs"
              >
                Explorar Marketplace
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-[#141414] border border-[#222] rounded-2xl p-6 hover:border-[#D9AD45]/40 transition-all space-y-4"
                >
                  {/* Card Header: Service info & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#202020]">
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-[#D9AD45] font-bold">
                        {booking.categoryName || 'Segurança Preventiva'}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">
                        {booking.request?.title || 'Serviço de Segurança'}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-amber-950/60 text-[#F2CC70] border-amber-800/50'
                            : booking.status === 'COMPLETED'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        {booking.status === 'CONFIRMED'
                          ? 'CONFIRMADO'
                          : booking.status === 'COMPLETED'
                          ? 'CONCLUÍDO'
                          : booking.status}
                      </span>
                    </div>
                  </div>

                  {/* Body: Location, Schedule & Guard details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    {/* Location & Date */}
                    <div className="space-y-1.5">
                      <span className="text-zinc-500 font-semibold uppercase text-[10px] block">
                        Data & Localização
                      </span>
                      <div className="flex items-center gap-1.5 text-zinc-200">
                        <Calendar className="w-3.5 h-3.5 text-[#D9AD45]" />
                        <span>{booking.request?.startDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-200">
                        <Clock className="w-3.5 h-3.5 text-[#D9AD45]" />
                        <span>
                          {booking.request?.startTime} às {booking.request?.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <MapPin className="w-3.5 h-3.5 text-[#D9AD45]" />
                        <span>
                          {booking.request?.city} • {booking.request?.neighborhood}
                        </span>
                      </div>
                    </div>

                    {/* Assigned Guard */}
                    <div className="space-y-1.5">
                      <span className="text-zinc-500 font-semibold uppercase text-[10px] block">
                        Profissional Atribuído
                      </span>
                      {booking.guard ? (
                        <>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{booking.guard.name}</span>
                          </div>
                          <div className="text-[11px] font-mono text-[#D9AD45]">
                            Crachá: {booking.guard.badgeNumber}
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-400">
                            <Phone className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{booking.guard.phone}</span>
                          </div>
                        </>
                      ) : (
                        <span className="text-zinc-500">A alocar profissional...</span>
                      )}
                    </div>

                    {/* Payment info */}
                    <div className="space-y-1.5 sm:text-right">
                      <span className="text-zinc-500 font-semibold uppercase text-[10px] block">
                        Financeiro & Faturação
                      </span>
                      <div className="text-lg font-black text-[#F2CC70]">
                        {booking.totalAmount} MT
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Método: {booking.payment?.method || 'M-PESA'}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        Ref: {booking.payment?.reference || 'CONFIRMADO'}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-3 border-t border-[#202020] flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500">
                      ID de Registo: <span className="font-mono text-zinc-400">{booking.id}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      {booking.guard && (
                        <button
                          onClick={() => setReviewModalBooking(booking)}
                          className="px-3 py-1.5 rounded-lg bg-[#222] hover:bg-[#2b2b2b] text-xs font-semibold text-[#F2CC70] flex items-center gap-1.5 transition-colors border border-[#333]"
                        >
                          <Star className="w-3.5 h-3.5 fill-[#D9AD45] text-[#D9AD45]" />
                          <span>Avaliar Serviço</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* REVIEW MODAL */}
        {reviewModalBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl max-w-md w-full p-6 space-y-5 relative">
              <button
                onClick={() => setReviewModalBooking(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pb-3 border-b border-[#202020]">
                <span className="text-[10px] font-semibold text-[#D9AD45] uppercase">
                  Avaliação de Desempenho
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Avaliar {reviewModalBooking.guard?.name}
                </h3>
                <p className="text-xs text-zinc-400">
                  A sua avaliação constrói a reputação pública e confiável deste profissional.
                </p>
              </div>

              {reviewSuccess ? (
                <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-200 p-4 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-semibold">Avaliação submetida e auditada com sucesso!</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Rating Punctuality */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Pontualidade (1 a 5 estrelas)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingPunctuality(star)}
                          className="p-1"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= ratingPunctuality
                                ? 'text-[#D9AD45] fill-[#D9AD45]'
                                : 'text-zinc-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating Professionalism */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Profissionalismo & Postura (1 a 5 estrelas)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingProfessionalism(star)}
                          className="p-1"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= ratingProfessionalism
                                ? 'text-[#D9AD45] fill-[#D9AD45]'
                                : 'text-zinc-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Overall */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Avaliação Geral
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingGeneral(star)}
                          className="p-1"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= ratingGeneral
                                ? 'text-[#D9AD45] fill-[#D9AD45]'
                                : 'text-zinc-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Comentário Legítimo
                    </label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Descreva a pontualidade, disciplina e cumprimento dos procedimentos..."
                      className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] text-xs text-white focus:outline-none focus:border-[#D9AD45]"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewModalBooking(null)}
                      className="px-4 py-2 rounded-xl bg-[#202020] text-xs text-zinc-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="px-6 py-2 rounded-xl gold-gradient-bg text-[#0A0A0A] font-bold text-xs"
                    >
                      {reviewSubmitting ? 'A Gravar...' : 'Enviar Avaliação'}
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

export default function ClientDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center text-xs">Carregando painel do cliente...</div>}>
      <ClientDashboardContent />
    </Suspense>
  );
}

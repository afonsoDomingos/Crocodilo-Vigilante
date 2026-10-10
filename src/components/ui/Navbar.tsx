'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from './Logo';
import {
  Shield,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  Search,
  CheckCircle,
  Menu,
  X,
} from 'lucide-react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN';
  status: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function Navbar() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchAuthUser();
  }, []);

  const fetchAuthUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setCurrentUser(data.user);
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'ADMIN') return '/dashboard/admin';
    if (currentUser.role === 'PROFESSIONAL') return '/dashboard/pro';
    return '/dashboard/client';
  };

  const getRoleBadge = () => {
    if (!currentUser) return null;
    if (currentUser.role === 'ADMIN') {
      return (
        <span className="px-2 py-0.5 text-[11px] font-semibold bg-red-950/80 text-red-300 border border-red-800 rounded">
          ADMIN
        </span>
      );
    }
    if (currentUser.role === 'PROFESSIONAL') {
      return (
        <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-950/80 text-[#F2CC70] border border-[#D9AD45]/40 rounded">
          PROFISSIONAL
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 rounded">
        CLIENTE
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#202020]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Logo variant="full" size="md" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-300 hover:text-[#F2CC70] transition-colors"
          >
            Início
          </Link>
          <Link
            href="/#como-funciona"
            className="text-sm font-medium text-zinc-300 hover:text-[#F2CC70] transition-colors"
          >
            Como Funciona
          </Link>
          <Link
            href="/#servicos"
            className="text-sm font-medium text-zinc-300 hover:text-[#F2CC70] transition-colors"
          >
            Serviços
          </Link>
          <Link
            href="/marketplace"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#F2CC70] hover:text-[#FFF] transition-colors"
          >
            <Search className="w-4 h-4 text-[#D9AD45]" />
            Marketplace
          </Link>
          <Link
            href="/#confianca"
            className="text-sm font-medium text-zinc-300 hover:text-[#F2CC70] transition-colors"
          >
            Confiança & Normas
          </Link>
        </nav>

        {/* Right CTA / User controls */}
        <div className="hidden md:flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Notifications Toggle */}
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2.5 rounded-lg bg-[#141414] border border-[#262626] text-zinc-300 hover:text-[#F2CC70] hover:border-[#D9AD45]/40 transition-all relative"
                  aria-label="Notificações"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#D9AD45] text-[#0A0A0A] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-[#141414] border border-[#2A2A2A] rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between pb-3 border-b border-[#202020]">
                      <span className="font-semibold text-sm text-white">Notificações</span>
                      <span className="text-xs text-zinc-400">{notifications.length} registos</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-[#202020] mt-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-zinc-500 py-4 text-center">Sem novas notificações</p>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div key={n.id} className="py-2.5 px-1 hover:bg-[#1a1a1a] rounded">
                            <p className="text-xs font-semibold text-[#F2CC70]">{n.title}</p>
                            <p className="text-xs text-zinc-300 mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Account Button */}
              <Link
                href={getDashboardLink()}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] hover:border-[#D9AD45]/50 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-[#202020] flex items-center justify-center border border-[#D9AD45]/30">
                  <User className="w-3.5 h-3.5 text-[#F2CC70]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-white leading-tight">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <div className="mt-0.5">{getRoleBadge()}</div>
                </div>
                <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400 ml-1" />
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2.5 text-zinc-400 hover:text-red-400 transition-colors"
                title="Terminar Sessão"
                aria-label="Terminar Sessão"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-zinc-200 hover:text-white transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-semibold rounded-lg gold-gradient-bg text-[#0A0A0A] hover:brightness-110 transition-all shadow-md shadow-[#D9AD45]/15"
              >
                Registar
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-zinc-300 hover:text-white"
            aria-label="Abrir menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#101010] border-b border-[#202020] px-4 py-4 space-y-3">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-medium text-zinc-300 hover:text-[#F2CC70]"
          >
            Início
          </Link>
          <Link
            href="/marketplace"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-semibold text-[#F2CC70]"
          >
            Marketplace de Seguranças
          </Link>
          <Link
            href="/#como-funciona"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-medium text-zinc-300 hover:text-[#F2CC70]"
          >
            Como Funciona
          </Link>
          <Link
            href="/#servicos"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-medium text-zinc-300 hover:text-[#F2CC70]"
          >
            Categorias de Segurança
          </Link>

          <div className="pt-3 border-t border-[#202020] flex flex-col gap-2">
            {currentUser ? (
              <>
                <Link
                  href={getDashboardLink()}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-[#202020] text-sm font-semibold text-[#F2CC70]"
                >
                  Ir para Painel ({currentUser.role})
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 rounded-lg text-sm text-red-400"
                >
                  Terminar Sessão
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2 bg-[#181818] border border-[#282828] text-sm font-semibold text-zinc-200 rounded-lg"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2 gold-gradient-bg text-sm font-bold text-[#0A0A0A] rounded-lg"
                >
                  Registar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from './Logo';
import { Shield, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#202020] text-zinc-400">
      {/* Regra de Ouro Banner */}
      <div className="bg-[#141414] border-b border-[#202020]/80 py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#F2CC70]">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#D9AD45]" />
            <span className="font-semibold text-white">Segurança 100% Desarmada:</span>
            <span className="text-zinc-300">
              Profissionais verificados exclusivamente para proteção preventiva.
            </span>
          </div>
          <span className="text-zinc-500 font-mono text-[11px]">Moçambique</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <Logo variant="full" size="md" />
            <p className="text-xs text-zinc-400 font-medium">
              A segurança certa, à sua confiança.
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Ligamos clientes a profissionais de segurança privada desarmada certificados em Moçambique.
            </p>
          </div>

          {/* Categorias */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3 border-b border-[#202020] pb-2">
              Serviços
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/marketplace?categoryId=cat_eventos" className="hover:text-[#F2CC70] transition-colors">
                  Eventos & Festas
                </Link>
              </li>
              <li>
                <Link href="/marketplace?categoryId=cat_empresarial" className="hover:text-[#F2CC70] transition-colors">
                  Empresarial & Sedes
                </Link>
              </li>
              <li>
                <Link href="/marketplace?categoryId=cat_residencial" className="hover:text-[#F2CC70] transition-colors">
                  Residencial & Condomínios
                </Link>
              </li>
              <li>
                <Link href="/marketplace?categoryId=cat_obras" className="hover:text-[#F2CC70] transition-colors">
                  Obras & Estaleiros
                </Link>
              </li>
              <li>
                <Link href="/marketplace?categoryId=cat_comercial" className="hover:text-[#F2CC70] transition-colors">
                  Lojas & Comércio
                </Link>
              </li>
              <li>
                <Link href="/marketplace?categoryId=cat_acesso" className="hover:text-[#F2CC70] transition-colors">
                  Portarias & Acessos
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Institucionais */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3 border-b border-[#202020] pb-2">
              Plataforma
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/marketplace" className="hover:text-[#F2CC70] transition-colors">
                  Encontrar Seguranças
                </Link>
              </li>
              <li>
                <Link href="/register?role=pro" className="hover:text-[#F2CC70] transition-colors">
                  Trabalhar como Segurança
                </Link>
              </li>
              <li>
                <Link href="/#como-funciona" className="hover:text-[#F2CC70] transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="/#confianca" className="hover:text-[#F2CC70] transition-colors">
                  Processo de Verificação
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto & Cobertura */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3 border-b border-[#202020] pb-2">
              Contactos
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D9AD45] flex-shrink-0" />
                <span>Maputo, Matola, Beira e Nampula</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D9AD45] flex-shrink-0" />
                <a href="tel:+258866979225" className="text-zinc-300 hover:text-[#F2CC70] transition-colors font-medium">
                  +258 86 697 9225
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D9AD45] flex-shrink-0" />
                <span>contacto@crocodilovigilante.co.mz</span>
              </div>
              <div className="pt-1 text-[11px] text-zinc-500">
                Pagamentos via <strong className="text-zinc-300">M-Pesa</strong> & <strong className="text-zinc-300">e-Mola</strong>.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Powered by WeHosThere */}
        <div className="mt-10 pt-6 border-t border-[#202020] flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© 2026 CROCODILO VIGILANTE. Todos os direitos reservados.</p>

          {/* Powered by WeHosThere */}
          <a
            href="https://www.wehosthere.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] hover:border-[#0099FF]/40 text-zinc-400 hover:text-white transition-all group"
            title="Alojado e impulsionado por WeHosThere"
          >
            <span className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200">
              Powered by
            </span>
            <div className="flex items-center gap-1.5">
              <Image
                src="/wehosthere.png"
                alt="WeHosThere"
                width={26}
                height={26}
                className="w-5 h-5 object-contain"
              />
              <span className="font-bold text-white text-xs tracking-tight group-hover:text-[#38BDF8] transition-colors">
                WeHosThere
              </span>
            </div>
          </a>
        </div>
      </div>
    </footer>
  );
}

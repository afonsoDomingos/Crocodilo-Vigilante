import React from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { Shield, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#202020] text-zinc-400">
      {/* Legal & Policy Banner */}
      <div className="bg-[#141414] border-b border-[#202020]/80 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#F2CC70]">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#D9AD45]" />
            <span className="font-semibold text-white">Regra Fundamental da Plataforma:</span>
            <span className="text-zinc-300">
              Todos os profissionais cadastrados prestam exclusivamente serviços de segurança preventiva desarmada.
            </span>
          </div>
          <span className="text-zinc-500 font-mono text-[11px]">República de Moçambique</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Logo variant="full" size="md" />
            <p className="text-sm text-zinc-400 italic">
              &ldquo;A segurança certa, à sua confiança.&rdquo;
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Primeira plataforma dedicada à ligação de particulares, empresas e organizadores a profissionais de segurança privada desarmada verificados em Moçambique.
            </p>
          </div>

          {/* Categorias */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4 border-b border-[#202020] pb-2">
              Categorias de Serviços
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/marketplace?categoryId=cat_eventos" className="hover:text-[#F2CC70] transition-colors">
                  Segurança para Eventos
                </Link>
              </li>
              <li>
                <Link href="/marketplace?categoryId=cat_empresarial" className="hover:text-[#F2CC70] transition-colors">
                  Segurança Empresarial
                </Link>
              </li>
              <li>
                <Link href="/marketplace?categoryId=cat_residencial" className="hover:text-[#F2CC70] transition-colors">
                  Segurança Residencial & Condomínios
                </Link>
              </li>
              <li>
                <Link href="/marketplace?categoryId=cat_obras" className="hover:text-[#F2CC70] transition-colors">
                  Segurança para Obras & Estaleiros
                </Link>
              </li>
              <li>
                <Link href="/marketplace?categoryId=cat_comercial" className="hover:text-[#F2CC70] transition-colors">
                  Segurança Comercial & Retalho
                </Link>
              </li>
              <li>
                <Link href="/marketplace?categoryId=cat_acesso" className="hover:text-[#F2CC70] transition-colors">
                  Controlo de Acesso & Recepção
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Institucionais */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4 border-b border-[#202020] pb-2">
              Institucional & Suporte
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#como-funciona" className="hover:text-[#F2CC70] transition-colors">
                  Como Funciona o Marketplace
                </Link>
              </li>
              <li>
                <Link href="/register?role=pro" className="hover:text-[#F2CC70] transition-colors">
                  Candidatar-se como Profissional
                </Link>
              </li>
              <li>
                <Link href="/#confianca" className="hover:text-[#F2CC70] transition-colors">
                  Processo de Verificação e Auditoria
                </Link>
              </li>
              <li>
                <span className="text-zinc-500">Termos de Utilização & Política de Privacidade</span>
              </li>
              <li>
                <span className="text-zinc-500">Política de Cancelamento & Reembolsos</span>
              </li>
              <li>
                <span className="text-zinc-500">Linha de Apoio e Resolução de Disputas</span>
              </li>
            </ul>
          </div>

          {/* Contacto & Cobertura */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4 border-b border-[#202020] pb-2">
              Cobertura & Contactos
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D9AD45] mt-0.5 flex-shrink-0" />
                <span>Maputo Cidade, Matola, Beira e Nampula</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D9AD45] flex-shrink-0" />
                <span>+258 84 000 9999 / +258 82 000 8888</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D9AD45] flex-shrink-0" />
                <span>contacto@crocodilovigilante.co.mz</span>
              </div>
              <div className="pt-2 text-[11px] text-zinc-500">
                Pagamentos suportados via <strong className="text-zinc-300">M-Pesa</strong>, <strong className="text-zinc-300">e-Mola</strong> e Transferência Bancária local.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#202020] flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-4">
          <p>© 2026 CROCODILO VIGILANTE. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#D9AD45]" />
            A segurança certa, à sua confiança. Moçambique.
          </p>
        </div>
      </div>
    </footer>
  );
}

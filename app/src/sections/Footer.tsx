import { 
  Trophy, 
  Instagram, 
  Twitter, 
  Facebook, 
  Youtube,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const footerLinks = {
  produto: [
    { label: 'Bolões', onClick: () => scrollToSection('featured-pools') },
    { label: 'Ranking', onClick: () => scrollToSection('top-ranking') },
    { label: 'Como Funciona', onClick: () => scrollToSection('how-it-works') },
    { label: 'Próximos Jogos', onClick: () => scrollToSection('next-matches') },
    { label: 'Números', onClick: () => scrollToSection('statistics') },
  ],
  empresa: [
    { label: 'Sobre Nós', onClick: () => toast.info('Em breve!') },
    { label: 'Blog', onClick: () => toast.info('Em breve!') },
    { label: 'Carreiras', onClick: () => toast.info('Em breve!') },
    { label: 'Contato', onClick: () => toast.info('Em breve!') },
  ],
  legal: [
    { label: 'Termos de Uso', onClick: () => toast.info('Em breve!') },
    { label: 'Privacidade', onClick: () => toast.info('Em breve!') },
    { label: 'Cookies', onClick: () => toast.info('Em breve!') },
  ],
};

const socialLinks = [
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
];

export const Footer = () => {
  return (
    <footer className="bg-[#0D0F12] text-white pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-black text-2xl" style={{ fontFamily: 'Exo, sans-serif' }}>
                  Bolão
                </h3>
                <p className="text-sm text-gray-400">Brasileirão 2026</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              A melhor plataforma de bolões do Brasil. Crie, participe e dispute com seus amigos pelo Campeonato Brasileiro.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5" />
                <span>contato@bolaobrasileirao.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5" />
                <span>(11) 99999-9999</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5" />
                <span>São Paulo, SP - Brasil</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-lg mb-6">Produto</h4>
            <ul className="space-y-3">
              {footerLinks.produto.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.onClick}
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.onClick}
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.onClick}
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <p className="text-gray-500 text-sm">
              © 2026 Bolão Brasileirão. Todos os direitos reservados.
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 hover:scale-110 active:scale-95 rounded-full flex items-center justify-center transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

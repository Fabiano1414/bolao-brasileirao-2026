import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

interface CTAProps {
  onCreatePool: () => void;
}

export const CTA = ({ onCreatePool }: CTAProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-green-500" />
      <div className="absolute inset-0 bg-black/20" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10 text-center">
        <div
          className={`transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-semibold mb-8">
            <Sparkles className="w-5 h-5" />
            <span>Comece Agora - É Grátis!</span>
          </div>

          <h2
            className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6"
            style={{ fontFamily: 'Exo, sans-serif' }}
          >
            Pronto para o
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
              Grande Jogo?
            </span>
          </h2>

          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Não perca mais tempo. Crie seu bolão agora e comece a disputar com seus amigos pelo Brasileirão 2026!
          </p>

          <Button
            onClick={onCreatePool}
            className="bg-white text-gray-900 hover:bg-gray-100 font-bold py-6 px-12 rounded-2xl text-xl shadow-2xl hover:shadow-white/25 transition-all hover:scale-105"
          >
            <Trophy className="w-6 h-6 mr-3" />
            Criar Meu Bolão
          </Button>

          <div className="flex flex-wrap justify-center gap-6 mt-12 text-white/60 text-sm">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              Cadastro em 30 segundos
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              100% Gratuito
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              Cancele quando quiser
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

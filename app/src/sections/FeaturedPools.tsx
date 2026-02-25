import { useRef } from 'react';
import { PoolCard } from '@/components/ui/custom/PoolCard';
import type { Pool } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowRight, Flame, Link2 } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

interface FeaturedPoolsProps {
  pools: Pool[];
  onPoolClick: (poolId: string) => void;
  onViewAll: () => void;
  onEnterWithInvite?: () => void;
}

export const FeaturedPools = ({ pools, onPoolClick, onViewAll, onEnterWithInvite }: FeaturedPoolsProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 bg-[#F5F7FA] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        <div
          className={`flex flex-col md:flex-row md:items-end md:justify-between mb-12 transition-all duration-500 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Flame className="w-4 h-4" />
              <span>Em Alta</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900" style={{ fontFamily: 'Exo, sans-serif' }}>
              Bolões em{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
                Destaque
              </span>
            </h2>
            <p className="text-gray-500 text-lg mt-3 max-w-xl">
              Os maiores prêmios e as melhores odds estão aqui. Escolha seu bolão e comece a jogar!
            </p>
          </div>
          <Button
            onClick={onViewAll}
            variant="outline"
            className="mt-6 md:mt-0 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold rounded-xl"
          >
            Ver Todos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div
          className={`transition-all duration-700 ${
            isInView ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {pools.length === 0 ? (
            <div className="py-16 px-8 bg-white/60 rounded-2xl border-2 border-dashed border-gray-200 text-center">
              <p className="text-gray-500 text-lg">
                Ainda não há bolões públicos. Crie o primeiro e compartilhe com seus amigos!
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Bolões públicos aparecerão aqui quando forem criados.
              </p>
              {onEnterWithInvite && (
                <Button
                  onClick={onEnterWithInvite}
                  variant="outline"
                  className="mt-6 border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Recebeu um convite? Entre com o link
                </Button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pools.map((pool) => (
                <PoolCard key={pool.id} pool={pool} onClick={() => onPoolClick(pool.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

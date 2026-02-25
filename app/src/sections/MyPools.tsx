import { useRef } from 'react';
import { PoolCard } from '@/components/ui/custom/PoolCard';
import { useAuth } from '@/hooks/useAuth';
import { usePoolsContext } from '@/context/PoolsContext';
import { useInView } from '@/hooks/useInView';
import { Trophy, LogIn, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MyPoolsProps {
  onPoolClick: (poolId: string) => void;
  onCreatePool: () => void;
  onEnterWithInvite?: () => void;
}

export const MyPools = ({ onPoolClick, onCreatePool, onEnterWithInvite }: MyPoolsProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { user } = useAuth();
  const { getUserPoolsList } = usePoolsContext();

  const myPools = user ? getUserPoolsList(user.id) : [];

  return (
    <section
      ref={ref}
      id="my-pools"
      className="py-24 bg-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        <div
          className={`mb-12 transition-all duration-500 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            <span>Área do Usuário</span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-black text-gray-900"
            style={{ fontFamily: 'Exo, sans-serif' }}
          >
            Meus{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
              Bolões
            </span>
          </h2>
          <p className="text-gray-500 text-lg mt-3 max-w-xl">
            {user
              ? 'Bolões em que você participa. Clique para ver detalhes, fazer palpites e acompanhar o ranking.'
              : 'Faça login para ver os bolões em que você participa e acompanhar seus palpites.'}
          </p>
        </div>

        {!user ? (
          <div
            className={`py-16 px-8 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border-2 border-dashed border-blue-200 text-center transition-all duration-500 ${
              isInView ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <LogIn className="w-16 h-16 mx-auto text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Faça login para ver seus bolões
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Entre ou crie uma conta para participar de bolões, fazer palpites e
              acompanhar o ranking.
            </p>
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-xl"
            >
              Entrar na conta
            </Button>
          </div>
        ) : myPools.length === 0 ? (
          <div
            className={`py-16 px-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-dashed border-amber-200 text-center transition-all duration-500 ${
              isInView ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Trophy className="w-16 h-16 mx-auto text-amber-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Você ainda não está em nenhum bolão
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Crie seu primeiro bolão ou entre em um bolão público para começar a
              jogar!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={onCreatePool}
                className="bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-xl"
              >
                Criar Bolão
              </Button>
              {onEnterWithInvite && (
                <Button
                  onClick={onEnterWithInvite}
                  variant="outline"
                  className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold rounded-xl"
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Entrar com convite
                </Button>
              )}
              <Button
                onClick={() =>
                  document.getElementById('featured-pools')?.scrollIntoView({ behavior: 'smooth' })
                }
                variant="outline"
                className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold rounded-xl"
              >
                Ver bolões públicos
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-700 ${
              isInView ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {myPools.map((pool) => (
              <PoolCard
                key={pool.id}
                pool={pool}
                onClick={() => onPoolClick(pool.id)}
                isOwner={user.id === pool.ownerId}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

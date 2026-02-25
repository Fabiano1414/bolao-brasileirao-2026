import { useRef, useMemo } from 'react';
import { AnimatedCounter } from '@/components/ui/custom/AnimatedCounter';
import { Users, Trophy, Target, Gift } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { usePoolsContext } from '@/context/PoolsContext';

export const Statistics = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { pools } = usePoolsContext();

  const stats = useMemo(() => {
    const uniqueUsers = new Set<string>();
    let poolsWithPrize = 0;
    pools.forEach(pool => {
      pool.members.forEach(m => uniqueUsers.add(m.userId));
      if (pool.prize && pool.prize.trim()) poolsWithPrize++;
    });

    return [
      {
        icon: Users,
        value: uniqueUsers.size,
        prefix: undefined as string | undefined,
        suffix: '',
        label: uniqueUsers.size === 1 ? 'Usuário Ativo' : 'Usuários Ativos',
        color: 'from-blue-500 to-blue-600'
      },
      {
        icon: Trophy,
        value: pools.length,
        prefix: undefined as string | undefined,
        suffix: '',
        label: pools.length === 1 ? 'Bolão Criado' : 'Bolões Criados',
        color: 'from-green-500 to-green-600',
        glow: true
      },
      {
        icon: Target,
        value: pools.reduce((acc, p) => acc + p.members.length, 0),
        prefix: undefined as string | undefined,
        suffix: '',
        label: 'Participações',
        color: 'from-orange-500 to-orange-600'
      },
      {
        icon: Gift,
        value: poolsWithPrize,
        prefix: undefined as string | undefined,
        suffix: '',
        label: poolsWithPrize === 1 ? 'Bolão com Prêmio' : 'Bolões com Prêmio',
        color: 'from-purple-500 to-purple-600'
      }
    ];
  }, [pools]);

  return (
    <section ref={ref} className="py-24 bg-[#0D0F12] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-500/10 via-transparent to-transparent rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        <div
          className={`text-center mb-16 transition-all duration-500 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'Exo, sans-serif' }}>
            Nossos{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
              Números
            </span>
          </h2>
          <p className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto">
            A maior comunidade de bolões do Brasil está aqui. Junte-se a milhares de apaixonados por futebol!
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`relative transition-all duration-500 ${
                isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              } ${index === 1 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className={`h-full bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all group ${index === 1 ? 'flex flex-col justify-center' : ''}`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>

                <div className={`font-black text-white mb-2 ${index === 1 ? 'text-6xl md:text-7xl' : 'text-4xl md:text-5xl'}`} style={{ fontFamily: 'Teko, sans-serif' }}>
                  <AnimatedCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    duration={2.5}
                  />
                </div>

                <div className="text-gray-400 text-lg">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

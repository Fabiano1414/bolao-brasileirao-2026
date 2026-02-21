import { useRef } from 'react';
import { UserPlus, Users, Target, Share2 } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

const steps = [
  {
    icon: UserPlus,
    title: 'Cadastre-se',
    description: 'Crie sua conta em segundos e comece a jogar gratuitamente.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Users,
    title: 'Crie ou Entre',
    description: 'Inicie seu próprio bolão ou participe de um existente com um código.',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: Target,
    title: 'Faça seu Palpite',
    description: 'Escolha seus resultados para cada rodada do Brasileirão.',
    color: 'from-orange-500 to-orange-600'
  },
  {
    icon: Share2,
    title: 'Compartilhe',
    description: 'Convide amigos e dispute juntos para ver quem é o melhor!',
    color: 'from-purple-500 to-purple-600'
  }
];

export const HowItWorks = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div
          className={`text-center mb-20 transition-all duration-500 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900" style={{ fontFamily: 'Exo, sans-serif' }}>
            Como{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
              Funciona
            </span>
          </h2>
          <p className="text-gray-500 text-lg mt-4 max-w-2xl mx-auto">
            Em apenas 4 passos simples, você já pode começar a se divertir e competir com seus amigos.
          </p>
        </div>

        <div className="relative">
          <svg
            className="absolute top-1/2 left-0 w-full h-4 -translate-y-1/2 hidden lg:block"
            viewBox="0 0 1200 20"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M 0 10 Q 150 10, 200 10 T 400 10 T 600 10 T 800 10 T 1000 10 T 1200 10"
              stroke="url(#gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              className={isInView ? 'opacity-100' : 'opacity-0'}
              style={{ transition: 'opacity 0.5s' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2962FF" />
                <stop offset="50%" stopColor="#00C853" />
                <stop offset="100%" stopColor="#FF6D00" />
              </linearGradient>
            </defs>
          </svg>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`relative transition-all duration-500 ${
                  isInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
                } ${index % 2 === 1 ? 'lg:mt-16' : ''}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg z-20">
                  {index + 1}
                </div>

                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg hover:scale-105 hover:rotate-2 transition-transform`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

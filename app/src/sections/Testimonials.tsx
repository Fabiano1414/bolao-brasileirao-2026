import { useRef, useState } from 'react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInView } from '@/hooks/useInView';

const testimonials = [
  {
    id: 1,
    name: 'João Silva',
    avatar: undefined,
    role: 'Apaixonado por Futebol',
    content: 'Melhor app de bolão que já usei! A interface é incrível e fazer os palpites é muito intuitivo. Já estou no topo do ranking do meu bolão!',
    rating: 5
  },
  {
    id: 2,
    name: 'Maria Santos',
    avatar: undefined,
    role: 'Campeã 2024',
    content: 'Ganhei meu primeiro prêmio no ano passado! R$ 500 no bolão da família. Agora todo mundo me pede dicas de palpites!',
    rating: 5
  },
  {
    id: 3,
    name: 'Pedro Costa',
    avatar: undefined,
    role: 'Jogador Frequente',
    content: 'Muito fácil de usar. Criei um bolão com meus amigos do trabalho e agora disputamos toda semana. Recomendo demais!',
    rating: 5
  },
  {
    id: 4,
    name: 'Ana Paula',
    avatar: undefined,
    role: 'Nova Usuária',
    content: 'Adorei a experiência! Mesmo não entendendo muito de futebol, o app me ajuda a acompanhar os jogos e me divertir.',
    rating: 5
  }
];

export const Testimonials = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section ref={ref} className="py-24 bg-[#F5F7FA] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div
          className={`text-center mb-16 transition-all duration-500 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900" style={{ fontFamily: 'Exo, sans-serif' }}>
            O que Nossos{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
              Usuários
            </span>{' '}
            Dizem
          </h2>
          <p className="text-gray-500 text-lg mt-4 max-w-2xl mx-auto">
            Milhares de pessoas já estão se divertindo com nosso app. Veja o que elas têm a dizer!
          </p>
        </div>

        <div
          className={`relative max-w-4xl mx-auto transition-opacity duration-500 ${
            isInView ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-16 z-20 rounded-full bg-white shadow-lg hover:scale-110 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-16 z-20 rounded-full bg-white shadow-lg hover:scale-110 transition-transform"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          <div className="relative h-[400px] overflow-hidden">
            <div
              key={currentIndex}
              className="absolute inset-0 flex items-center justify-center animate-fade-in-up"
            >
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-2xl mx-auto text-center relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <Quote className="w-6 h-6 text-white" />
                </div>

                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
                  "{testimonials[currentIndex].content}"
                </p>

                <div className="flex items-center justify-center gap-4">
                  <UserAvatar
                    name={testimonials[currentIndex].name}
                    avatar={testimonials[currentIndex].avatar}
                    className="w-16 h-16 border-4 border-white shadow-lg"
                    fallbackClassName="text-xl"
                  />
                  <div className="text-left">
                    <div className="font-bold text-lg text-gray-900">
                      {testimonials[currentIndex].name}
                    </div>
                    <div className="text-gray-500">
                      {testimonials[currentIndex].role}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-gradient-to-r from-blue-500 to-green-500 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

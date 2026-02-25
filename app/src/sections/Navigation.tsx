import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Menu, X, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface NavigationProps {
  onCreatePool: () => void;
  onViewPools: () => void;
  onViewMatches: () => void;
  onViewProfile: () => void;
  onViewMyPools: () => void;
  onViewAdmin?: () => void;
}

export const Navigation = ({
  onCreatePool,
  onViewPools,
  onViewMatches,
  onViewProfile,
  onViewMyPools,
  onViewAdmin,
}: NavigationProps) => {
  const { user, logout, isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const navLinks: { label: string; onClick: () => void }[] = [
    { label: 'Bolões', onClick: onViewPools },
    { label: 'Ranking', onClick: () => document.getElementById('top-ranking')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Jogos', onClick: onViewMatches },
    { label: 'Como Funciona', onClick: () => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }) },
  ];
  if (user) {
    navLinks.splice(1, 0, { label: 'Meus Bolões', onClick: onViewMyPools });
  }
  if (isAdmin && onViewAdmin) {
    navLinks.push({ label: 'Admin', onClick: onViewAdmin });
  }

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 transition-transform duration-300"
        style={{ transform: isScrolled || isMobile ? 'translateY(0)' : 'translateY(-100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl" style={{ fontFamily: 'Exo, sans-serif' }}>
                Bolão
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  {isAdmin && onViewAdmin && (
                    <Button
                      variant="outline"
                      onClick={onViewAdmin}
                      className="border-violet-500 text-violet-600 hover:bg-violet-50"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  )}
                  <Button
                    onClick={onCreatePool}
                    className="bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-xl"
                  >
                    Criar Bolão
                  </Button>
                  <button onClick={onViewProfile} className="flex items-center gap-2">
                    <UserAvatar name={user.name} avatar={user.avatar} className="w-9 h-9" />
                  </button>
                </>
              ) : (
                <Button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  variant="outline"
                  className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold rounded-xl"
                >
                  Entrar
                </Button>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-4 md:hidden animate-slide-in">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  link.onClick();
                  setIsMobileMenuOpen(false);
                }}
                className="text-left text-lg font-medium py-3 border-b border-gray-100"
              >
                {link.label}
              </button>
            ))}

            {user ? (
              <>
                {isAdmin && onViewAdmin && (
                  <button
                    onClick={() => {
                      onViewAdmin();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 py-3 text-violet-600 font-medium"
                  >
                    <Shield className="w-5 h-5" />
                    Admin
                  </button>
                )}
                <Button
                  onClick={() => {
                    onCreatePool();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold py-4 rounded-xl mt-4"
                >
                  Criar Bolão
                </Button>
                <button
                  onClick={() => {
                    onViewProfile();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 py-3"
                >
                  <UserAvatar name={user.name} avatar={user.avatar} className="w-10 h-10" />
                  <span className="font-medium">{user.name}</span>
                </button>
                <button
                  onClick={logout}
                  className="text-red-500 font-medium py-3"
                >
                  Sair
                </button>
              </>
            ) : (
                <Button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-gray-900 text-white font-semibold py-4 rounded-xl mt-4"
                >
                  Entrar
                </Button>
              )}
          </div>
        </div>
      )}
    </>
  );
};

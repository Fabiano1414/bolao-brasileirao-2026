import { useState, useEffect } from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import { MatchesProvider } from '@/context/MatchesContext';
import { PoolsProvider, usePoolsContext } from '@/context/PoolsContext';
import { Navigation } from '@/sections/Navigation';
import { Hero } from '@/sections/Hero';
import { MyPools } from '@/sections/MyPools';
import { FeaturedPools } from '@/sections/FeaturedPools';
import { HowItWorks } from '@/sections/HowItWorks';
import { NextMatches } from '@/sections/NextMatches';
import { Statistics } from '@/sections/Statistics';
import { TopRanking } from '@/sections/TopRanking';
import { Testimonials } from '@/sections/Testimonials';
import { CTA } from '@/sections/CTA';
import { Footer } from '@/sections/Footer';
import { CreatePoolModal } from '@/components/modals/CreatePoolModal';
import { PoolDetailsModal } from '@/components/modals/PoolDetailsModal';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { AllMatchesModal } from '@/components/modals/AllMatchesModal';
import type { Pool } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

function AppContent() {
  const { pools, getPool } = usePoolsContext();
  const [createPoolOpen, setCreatePoolOpen] = useState(false);
  const [poolDetailsOpen, setPoolDetailsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [allMatchesOpen, setAllMatchesOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [inviteCode, setInviteCode] = useState<string | undefined>(undefined);

  /** Abre o modal do bolão ao chegar com link de convite (?pool=ID&code=XXX) */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const poolId = params.get('pool');
    const code = params.get('code') ?? undefined;
    if (poolId) {
      const pool = getPool(poolId);
      if (pool) {
        setSelectedPool(pool);
        setInviteCode(code);
        setPoolDetailsOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreatePool = () => {
    setCreatePoolOpen(true);
  };

  const handlePoolSuccess = (pool: Pool) => {
    setSelectedPool(pool);
    setPoolDetailsOpen(true);
    toast.success('Bolão criado com sucesso!', {
      description: `O bolão "${pool.name}" foi criado.`,
    });
  };

  const handlePoolClick = (poolId: string) => {
    const pool = getPool(poolId);
    if (pool) {
      setSelectedPool(pool);
      setPoolDetailsOpen(true);
    }
  };

  const handleViewPools = () => {
    document.getElementById('featured-pools')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewMatches = () => {
    setAllMatchesOpen(true);
  };

  const handleViewProfile = () => {
    setProfileOpen(true);
  };

  const handleViewMyPools = () => {
    document.getElementById('my-pools')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation
        onCreatePool={handleCreatePool}
        onViewPools={handleViewPools}
        onViewMatches={handleViewMatches}
        onViewProfile={handleViewProfile}
        onViewMyPools={handleViewMyPools}
      />

      <main>
        <Hero onCreatePool={handleCreatePool} onViewPools={handleViewPools} />
        
        <MyPools
          onPoolClick={handlePoolClick}
          onCreatePool={handleCreatePool}
        />

        <div id="featured-pools">
          <FeaturedPools 
            pools={pools}
            onPoolClick={handlePoolClick}
            onViewAll={handleViewPools}
          />
        </div>
        
        <div id="top-ranking">
          <TopRanking />
        </div>

        <div id="how-it-works">
          <HowItWorks />
        </div>
        
        <div id="next-matches">
          <NextMatches onViewAll={handleViewMatches} />
        </div>
        
        <div id="statistics">
          <Statistics />
        </div>
        <Testimonials />
        <CTA onCreatePool={handleCreatePool} />
      </main>

      <Footer />

      {/* Modals */}
      <CreatePoolModal
        isOpen={createPoolOpen}
        onClose={() => setCreatePoolOpen(false)}
        onSuccess={handlePoolSuccess}
      />

      <PoolDetailsModal
        pool={selectedPool}
        isOpen={poolDetailsOpen}
        onClose={() => {
          setPoolDetailsOpen(false);
          setInviteCode(undefined);
        }}
        initialJoinCode={inviteCode}
      />

      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />

      <AllMatchesModal
        isOpen={allMatchesOpen}
        onClose={() => setAllMatchesOpen(false)}
      />

      <Toaster position="top-center" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MatchesProvider>
        <PoolsProvider>
          <AppContent />
        </PoolsProvider>
      </MatchesProvider>
    </AuthProvider>
  );
}

export default App;

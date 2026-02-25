import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
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
import { CTA } from '@/sections/CTA';
import { Footer } from '@/sections/Footer';
import { CreatePoolModal } from '@/components/modals/CreatePoolModal';
import { PoolDetailsModal } from '@/components/modals/PoolDetailsModal';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { AllMatchesModal } from '@/components/modals/AllMatchesModal';
import { AdminModal } from '@/components/modals/AdminModal';
import type { Pool } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

function AppContent() {
  const { isAdmin } = useAuth();
  const { getPool, getPublicPoolsList } = usePoolsContext();
  const [createPoolOpen, setCreatePoolOpen] = useState(false);
  const [poolDetailsOpen, setPoolDetailsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [allMatchesOpen, setAllMatchesOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
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

  /** Acesso admin via URL: ?admin=1 — faça login e acesse /?admin=1 */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === '1') {
      sessionStorage.setItem('admin_requested', '1');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
  useEffect(() => {
    if (sessionStorage.getItem('admin_requested') === '1' && isAdmin) {
      sessionStorage.removeItem('admin_requested');
      setAdminOpen(true);
    }
  }, [isAdmin]);

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

  const handleViewAdmin = () => {
    setAdminOpen(true);
  };

  return (
    <div className="min-h-screen bg-white" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
      <Navigation
        onCreatePool={handleCreatePool}
        onViewPools={handleViewPools}
        onViewMatches={handleViewMatches}
        onViewProfile={handleViewProfile}
        onViewMyPools={handleViewMyPools}
        onViewAdmin={handleViewAdmin}
      />

      <main>
        <Hero onCreatePool={handleCreatePool} onViewPools={handleViewPools} onViewAdmin={handleViewAdmin} />
        
        <MyPools
          onPoolClick={handlePoolClick}
          onCreatePool={handleCreatePool}
        />

        <div id="featured-pools">
          <FeaturedPools 
            pools={getPublicPoolsList()}
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
        pool={selectedPool ? getPool(selectedPool.id) ?? selectedPool : null}
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
        onOpenAdmin={handleViewAdmin}
      />

      <AllMatchesModal
        isOpen={allMatchesOpen}
        onClose={() => setAllMatchesOpen(false)}
      />

      {isAdmin && (
        <AdminModal
          isOpen={adminOpen}
          onClose={() => setAdminOpen(false)}
        />
      )}

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

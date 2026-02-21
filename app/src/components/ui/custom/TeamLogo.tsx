import { useState } from 'react';
import { teams } from '@/data/teams';
import { getTeamLogoUrl } from '@/data/teamLogos';

interface TeamLogoProps {
  teamName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { container: 'w-8 h-8', px: 64 },
  md: { container: 'w-12 h-12', px: 96 },
  lg: { container: 'w-16 h-16', px: 128 },
};

export const TeamLogo = ({ teamName, size = 'md', className = '' }: TeamLogoProps) => {
  const [imgError, setImgError] = useState(false);
  const team = teams.find(t =>
    t.name.toLowerCase().includes(teamName.toLowerCase()) ||
    t.shortName.toLowerCase() === teamName.toLowerCase()
  );

  const logoUrl = getTeamLogoUrl(teamName, sizeMap[size].px);

  const Fallback = () => (
    <div
      className={`${sizeMap[size].container} rounded-full flex items-center justify-center font-bold text-white shadow-lg ${className}`}
      style={{ backgroundColor: team?.colors.primary ?? '#6b7280' }}
    >
      <span style={{ color: team?.colors.secondary ?? '#fff' }}>
        {(team?.shortName ?? teamName).substring(0, 2).toUpperCase()}
      </span>
    </div>
  );

  if (!team) {
    return (
      <div className={`${sizeMap[size].container} rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 ${className}`}>
        {teamName.substring(0, 2).toUpperCase()}
      </div>
    );
  }

  if (!logoUrl || imgError) {
    return <Fallback />;
  }

  return (
    <img
      src={logoUrl}
      alt={`Escudo ${team.name}`}
      className={`${sizeMap[size].container} rounded-full object-contain aspect-square bg-white p-0.5 shadow-lg ${className}`}
      onError={() => setImgError(true)}
    />
  );
};

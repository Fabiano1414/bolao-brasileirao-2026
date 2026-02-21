import type { Team } from '@/types';

// 20 times da Série A do Brasileirão 2026 (dados reais)
export const teams: Team[] = [
  { id: '1', name: 'Flamengo', shortName: 'FLA', colors: { primary: '#C5261B', secondary: '#000000' } },
  { id: '2', name: 'Palmeiras', shortName: 'PAL', colors: { primary: '#006437', secondary: '#FFFFFF' } },
  { id: '3', name: 'Botafogo', shortName: 'BOT', colors: { primary: '#000000', secondary: '#FFFFFF' } },
  { id: '4', name: 'Atlético-MG', shortName: 'CAM', colors: { primary: '#000000', secondary: '#FFFFFF' } },
  { id: '5', name: 'Corinthians', shortName: 'COR', colors: { primary: '#000000', secondary: '#FFFFFF' } },
  { id: '6', name: 'São Paulo', shortName: 'SAO', colors: { primary: '#C5261B', secondary: '#000000' } },
  { id: '7', name: 'Fluminense', shortName: 'FLU', colors: { primary: '#870E1C', secondary: '#006437' } },
  { id: '8', name: 'Grêmio', shortName: 'GRE', colors: { primary: '#0D6EFD', secondary: '#000000' } },
  { id: '9', name: 'Internacional', shortName: 'INT', colors: { primary: '#C5261B', secondary: '#FFFFFF' } },
  { id: '10', name: 'Vasco da Gama', shortName: 'VAS', colors: { primary: '#000000', secondary: '#FFFFFF' } },
  { id: '11', name: 'Santos', shortName: 'SAN', colors: { primary: '#FFFFFF', secondary: '#000000' } },
  { id: '12', name: 'Cruzeiro', shortName: 'CRU', colors: { primary: '#0D6EFD', secondary: '#FFFFFF' } },
  { id: '13', name: 'Red Bull Bragantino', shortName: 'RBB', displayName: 'RB Bragantino', colors: { primary: '#C5261B', secondary: '#FFFFFF' } },
  { id: '14', name: 'Bahia', shortName: 'BAH', colors: { primary: '#0D6EFD', secondary: '#C5261B' } },
  { id: '15', name: 'Vitória', shortName: 'VIT', colors: { primary: '#C5261B', secondary: '#000000' } },
  { id: '16', name: 'Mirassol', shortName: 'MIR', colors: { primary: '#FFD700', secondary: '#006437' } },
  { id: '17', name: 'Athletico-PR', shortName: 'CAP', colors: { primary: '#C5261B', secondary: '#000000' } },
  { id: '18', name: 'Chapecoense', shortName: 'CHA', colors: { primary: '#006437', secondary: '#FFFFFF' } },
  { id: '19', name: 'Coritiba', shortName: 'CFC', colors: { primary: '#006437', secondary: '#FFFFFF' } },
  { id: '20', name: 'Clube do Remo', shortName: 'REM', colors: { primary: '#006437', secondary: '#FFFFFF' } }
];

export const getTeamById = (id: string): Team | undefined => {
  return teams.find(team => team.id === id);
};

export const getTeamByName = (name: string): Team | undefined => {
  return teams.find(team =>
    team.name.toLowerCase().includes(name.toLowerCase()) ||
    team.shortName.toLowerCase() === name.toLowerCase() ||
    team.name.toLowerCase().replace(/-/g, ' ') === name.toLowerCase().replace(/-/g, ' ')
  );
};

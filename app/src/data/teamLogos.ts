/** URLs diretas dos escudos - Wikimedia Commons (thumb 128px) */
const LOGO_URLS: Record<string, string> = {
  'Flamengo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Clube_de_Regatas_do_Flamengo_logo.svg/128px-Clube_de_Regatas_do_Flamengo_logo.svg.png',
  'Palmeiras': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Palmeiras_logo.svg/128px-Palmeiras_logo.svg.png',
  'Botafogo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Botafogo_de_Futebol_e_Regatas_logo.svg/128px-Botafogo_de_Futebol_e_Regatas_logo.svg.png',
  'Atlético-MG': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Clube_Atl%C3%A9tico_Mineiro_logo.svg/128px-Clube_Atl%C3%A9tico_Mineiro_logo.svg.png',
  'Corinthians': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Corinthians_S%C3%ADmbolo.svg/128px-Corinthians_S%C3%ADmbolo.svg.png',
  'São Paulo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/S%C3%A3o_Paulo_Futebol_Clube_%28logo%29.svg/128px-S%C3%A3o_Paulo_Futebol_Clube_%28logo%29.svg.png',
  'Fluminense': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Fluminense_FC_logo.svg/128px-Fluminense_FC_logo.svg.png',
  'Grêmio': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Gr%C3%AAmio_logo.svg/128px-Gr%C3%AAmio_logo.svg.png',
  'Internacional': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Sport_Club_Internacional_logo.svg/128px-Sport_Club_Internacional_logo.svg.png',
  'Vasco da Gama': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/CR_Vasco_da_Gama_logo.svg/128px-CR_Vasco_da_Gama_logo.svg.png',
  'Santos': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Santos_Logo.svg/128px-Santos_Logo.svg.png',
  'Cruzeiro': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Cruzeiro_Esporte_Clube_%28logo%29.svg/128px-Cruzeiro_Esporte_Clube_%28logo%29.svg.png',
  // Red Bull Bragantino: sem logo no Commons - fallback para iniciais RBB
  'Red Bull Bragantino': '',
  'Bahia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Esporte_Clube_Bahia_logo.svg/128px-Esporte_Clube_Bahia_logo.svg.png',
  'Vitória': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Esporte_Clube_Vit%C3%B3ria_logo.svg/128px-Esporte_Clube_Vit%C3%B3ria_logo.svg.png',
  'Mirassol': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Mirassol_FC_logo.png/128px-Mirassol_FC_logo.png',
  'Athletico-PR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Club_Athletico_Paranaense_logo.svg/128px-Club_Athletico_Paranaense_logo.svg.png',
  'Chapecoense': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Associa%C3%A7%C3%A3o_Chapecoense_de_Futebol_logo.svg/128px-Associa%C3%A7%C3%A3o_Chapecoense_de_Futebol_logo.svg.png',
  'Coritiba': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Coritiba_FC.svg/128px-Coritiba_FC.svg.png',
  'Remo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Clube_do_Remo.svg/128px-Clube_do_Remo.svg.png',
  'Clube do Remo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Clube_do_Remo.svg/128px-Clube_do_Remo.svg.png',
};

export function getTeamLogoUrl(teamName: string, _width = 128): string {
  const key = Object.keys(LOGO_URLS).find(k =>
    teamName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(teamName.toLowerCase())
  );
  return key ? LOGO_URLS[key] : '';
}

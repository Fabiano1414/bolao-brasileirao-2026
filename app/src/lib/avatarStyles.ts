/** Gradientes estilo Instagram para avatar sem foto */
const GRADIENTS = [
  'from-rose-400 to-orange-400',
  'from-violet-500 to-fuchsia-500',
  'from-cyan-400 to-blue-500',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-pink-400 to-rose-500',
  'from-indigo-400 to-purple-500',
  'from-sky-400 to-indigo-500',
] as const;

/** Retorna gradiente consistente baseado no nome - estilo Instagram */
export function getAvatarGradient(name: string): string {
  if (!name?.trim()) return GRADIENTS[0];
  const index = name.charCodeAt(0) % GRADIENTS.length;
  return GRADIENTS[Math.abs(index)];
}

/** Iniciais para exibir no avatar (máx 2 letras) */
export function getInitials(name: string): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

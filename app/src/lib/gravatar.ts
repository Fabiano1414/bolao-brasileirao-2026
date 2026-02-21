import { md5 } from 'js-md5';

/**
 * Gera URL do avatar Gravatar baseado no email.
 * Se o usuário tem conta no Gravatar com esse email, mostra a foto real.
 * Caso contrário, usa identicon (padrão geométrico).
 */
export function getGravatarUrl(email: string, size = 150): string {
  if (!email?.trim()) return '';
  const hash = md5(email.toLowerCase().trim());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}

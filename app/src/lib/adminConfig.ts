/**
 * Configuração de administradores do app.
 * Adicione o email da sua conta para ter acesso ao painel admin.
 */

export const ADMIN_EMAILS: string[] = [
  'fabiano13neves@gmail.com',
  'fabianogomes52@gmail.com',
];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.some(
    (e) => e.toLowerCase().trim() === email.toLowerCase().trim()
  );
}

/**
 * Utilitário para hash de senhas com PBKDF2 (Web Crypto API).
 * Usado no registro, login e recuperação de senha.
 */

const ITERATIONS = 100000;
const SALT_LENGTH = 16;

function randomSalt(): string {
  const arr = new Uint8Array(SALT_LENGTH);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashWithSalt(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return Array.from(new Uint8Array(derived))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Gera salt aleatório e retorna hash + salt para armazenamento */
export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = randomSalt();
  const hash = await hashWithSalt(password, salt);
  return { hash, salt };
}

/** Verifica se a senha corresponde ao hash armazenado */
export async function verifyPassword(
  password: string,
  storedHash: string,
  salt: string
): Promise<boolean> {
  const hash = await hashWithSalt(password, salt);
  return hash === storedHash;
}

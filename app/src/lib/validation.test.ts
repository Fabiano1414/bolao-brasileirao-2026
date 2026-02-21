import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from './validation';

describe('validation', () => {
  describe('loginSchema', () => {
    it('aceita email e senha válidos', () => {
      const result = loginSchema.safeParse({ email: 'teste@email.com', password: '123456' });
      expect(result.success).toBe(true);
    });

    it('rejeita email vazio', () => {
      const result = loginSchema.safeParse({ email: '', password: '123456' });
      expect(result.success).toBe(false);
    });

    it('rejeita email inválido', () => {
      const result = loginSchema.safeParse({ email: 'invalido', password: '123456' });
      expect(result.success).toBe(false);
    });

    it('rejeita texto com gmail sem formato de email', () => {
      expect(loginSchema.safeParse({ email: 'gmail', password: '123456' }).success).toBe(false);
      expect(loginSchema.safeParse({ email: 'testegmail', password: '123456' }).success).toBe(false);
      expect(loginSchema.safeParse({ email: 'teste@gmail', password: '123456' }).success).toBe(false);
    });

    it('rejeita senha vazia', () => {
      const result = loginSchema.safeParse({ email: 'teste@email.com', password: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('aceita dados válidos', () => {
      const result = registerSchema.safeParse({
        name: 'João Silva',
        email: 'joao@email.com',
        password: 'senha123',
      });
      expect(result.success).toBe(true);
    });

    it('rejeita nome com menos de 3 caracteres', () => {
      const result = registerSchema.safeParse({
        name: 'Ab',
        email: 'teste@email.com',
        password: 'senha123',
      });
      expect(result.success).toBe(false);
    });

    it('rejeita senha com menos de 6 caracteres', () => {
      const result = registerSchema.safeParse({
        name: 'João Silva',
        email: 'joao@email.com',
        password: '12345',
      });
      expect(result.success).toBe(false);
    });
  });
});

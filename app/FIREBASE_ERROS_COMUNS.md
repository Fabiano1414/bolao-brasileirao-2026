# Erros comuns do Firebase e como resolver

## 1. ID do projeto errado (a causa mais frequente)

**Problema:** O `.env` tem `bolaobrasileirao2026`, mas o projeto no Firebase Console é `bolaobrasileiroo2026` (grafia diferente).

**Sintomas:** Login, cadastro e recuperação de senha falham mesmo com credenciais corretas.

**Solução:** Copie o `firebaseConfig` do **projeto correto** no Firebase Console (Configurações do projeto → Seus apps → Web) e atualize o `.env` com o `projectId`, `authDomain`, etc. exatamente como aparecem.

---

## 2. Domínio não autorizado

**Problema:** O domínio de teste (ex: `localhost`, `127.0.0.1` ou o domínio de deploy) não está em "Authorized domains".

**Sintomas:** Requisições falham silenciosamente ou com erro de CORS.

**Solução:** Firebase Console → Authentication → Settings → Authorized domains → Adicione `localhost` e o domínio onde o app roda.

---

## 3. Email/Senha desativado

**Problema:** O provedor "E-mail/senha" não foi habilitado.

**Solução:** Firebase Console → Authentication → Sign-in method → Ative "E-mail/senha".

---

## 4. Regras do Firestore

**Problema:** Regras bloqueiam leitura/escrita.

**Solução:** Publique as regras de `firestore.rules` no Firebase Console. Para a coleção `users`, usuários autenticados podem ler e escrever apenas o próprio documento.

---

## 5. Variáveis de ambiente não carregadas

**Problema:** O Vite não carrega o `.env` se o servidor não for reiniciado após alterações.

**Solução:** Pare o servidor (`Ctrl+C`) e rode `npm run dev` de novo após editar o `.env`.

---

## 6. Email de recuperação não chega

**Problema:** Clica em "Esqueci minha senha", aparece sucesso, mas o email nunca chega.

**O que conferir:**
1. **Pasta de spam/lixo** – O email do Firebase pode ir parar lá.
2. **Template no Firebase** – Console → Authentication → Templates → "Redefinir senha". Verifique se o template está ativo e se o remetente está correto.
3. **Domínio autorizado** – O link do email redireciona; o domínio precisa estar em Authorized domains.
4. **Limite de envios** – Muitas tentativas podem causar bloqueio temporário (auth/too-many-requests).

**Alternativa:** Use o Admin → Usuários → "Redefinir senha" para enviar o link manualmente.

---

## Como verificar o projeto conectado

Com o app rodando, abra o Console (F12) e procure:

```
[Firebase] Projeto: bolaobrasileirao2026
```

Esse ID deve ser exatamente o mesmo do projeto no Firebase Console.

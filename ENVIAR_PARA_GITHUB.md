# Enviar projeto para o GitHub

O repositório remoto: **https://github.com/Fabiano1414/bolao-brasileirao-2025**

---

## No terminal (PowerShell ou CMD)

1. **Entre na pasta do projeto:**
   ```powershell
   cd C:\Users\fabia\bolao-brasileirao-2025
   ```

2. **Confira o remote atual (se já existir):**
   ```powershell
   git remote -v
   ```
   Se aparecer outro `origin`, remova: `git remote remove origin`

3. **Adicione o GitHub como remoto:**
   ```powershell
   git remote add origin https://github.com/Fabiano1414/bolao-brasileirao-2025.git
   ```

4. **Faça commit das alterações (se houver):**
   ```powershell
   git add .
   git commit -m "Atualizações do projeto"
   ```

5. **Renomeie a branch para main (se precisar):**
   ```powershell
   git branch -M main
   ```

6. **Envie para o GitHub:**
   ```powershell
   git push -u origin main
   ```

---

**Observação:** Se o repositório no GitHub já tiver conteúdo (ex.: README criado pela interface), pode ser necessário usar `git pull origin main --rebase` antes do push, ou `git push -u origin main --force` (cuidado: sobrescreve o que está no GitHub).

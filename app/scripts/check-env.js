#!/usr/bin/env node
/**
 * Verifica se as variáveis do Firebase estão definidas no build.
 * Aparece nos logs da Vercel ao fazer deploy.
 */
const vars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];
const results = vars.map((name) => {
  const val = process.env[name];
  const ok = val && val !== 'undefined';
  return { name, ok };
});
const allOk = results.every((r) => r.ok);
console.log('\n[Firebase env]');
results.forEach(({ name, ok }) => console.log(`  ${name}: ${ok ? '✓' : '✗ MISSING'}`));
console.log(`  → Firebase ${allOk ? 'ativado' : 'DESATIVADO (modo local)'}\n`);
if (!allOk) {
  console.log('  Para ativar: Vercel → Settings → Environment Variables');
  console.log('  Marque Production E Preview. Depois: Redeploy.\n');
}

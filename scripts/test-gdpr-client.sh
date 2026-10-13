#!/bin/bash
# Prueba del GDPR del cliente: export real desde Turso + borrado real.
set -e
set -a; source .env.local >/dev/null 2>&1; set +a
B=http://localhost:3000
S=$(date +%s)
E="gdpr$S@test.com"

echo "== 1. Cliente se registra"
curl -s -X POST $B/api/auth -H "Content-Type: application/json" \
  -d "{\"mode\":\"register\",\"email\":\"$E\",\"password\":\"Prueba12345\",\"firstName\":\"Rosa\",\"lastName\":\"Delgado\",\"phone\":\"+52 55 9876 5432\"}" \
  -o /dev/null -w "   %{http_code}\n"
T=$(curl -s -X POST $B/api/auth -H "Content-Type: application/json" \
  -d "{\"mode\":\"login\",\"email\":\"$E\",\"password\":\"Prueba12345\"}" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")

echo "== 2. Sin sesion: 401"
curl -s -o /dev/null -w "   export=%{http_code} (espera 401)\n" $B/api/gdpr/export

echo "== 3. Export con sesion"
curl -s $B/api/gdpr/export -H "Authorization: Bearer $T" -o /tmp/gdpr.json -w "   %{http_code}\n"
node -pe "
const j=require('/tmp/gdpr.json');
'   nombre: '+j.account.firstName+' '+j.account.lastName+
'   tel: '+j.account.phone+
'   descifrados: '+JSON.stringify(j.account.decryptedFields)+
'   reservas: '+j.counts.bookings+' | sesiones: '+j.counts.sessions+' | vistas: '+j.counts.pageViews+
'   base legal: '+j.legalBasis"

echo "== 4. El PII NO viaja cifrado (es suyo, va en claro)"
node -pe "const j=require('/tmp/gdpr.json'); j.account.firstName==='Rosa'?'   SI: nombre legible':'   NO'"

echo "== 5. La exportacion queda auditada"
node -e "
import('@libsql/client').then(async ({createClient})=>{const c=createClient({url:process.env.TURSO_URL,authToken:process.env.TURSO_API_KEY});
const r=await c.execute({sql:'SELECT action FROM access_audit_logs WHERE action=? AND target_email=? ORDER BY created_at DESC LIMIT 1',args:['gdpr_export','$E']});
console.log('   '+(r.rows[0]?('registrada: '+r.rows[0].action):'NO registrada'));});"

echo "== 6. Borrado: sin confirmacion explicita"
curl -s -X DELETE $B/api/gdpr/account -H "Content-Type: application/json" -H "Authorization: Bearer $T" \
  -d '{"password":"Prueba12345"}' -o /dev/null -w "   %{http_code} (espera 400)\n"

echo "== 7. Borrado: password incorrecta"
curl -s -X DELETE $B/api/gdpr/account -H "Content-Type: application/json" -H "Authorization: Bearer $T" \
  -d '{"password":"malo","confirm":"ELIMINAR"}' -o /dev/null -w "   %{http_code} (espera 401)\n"

echo "== 8. Borrado real"
curl -s -X DELETE $B/api/gdpr/account -H "Content-Type: application/json" -H "Authorization: Bearer $T" \
  -d '{"password":"Prueba12345","confirm":"ELIMINAR"}' -o /tmp/del.json -w "   %{http_code}\n"
node -pe "const j=require('/tmp/del.json');'   '+(j.success?'eliminado':'fallo: '+j.error)"

echo "== 9. Verificacion en BD: la cuenta ya no existe"
node -e "
import('@libsql/client').then(async ({createClient})=>{const c=createClient({url:process.env.TURSO_URL,authToken:process.env.TURSO_API_KEY});
const u=(await c.execute({sql:'SELECT COUNT(*) n FROM users WHERE email=?',args:['$E']})).rows[0].n;
const s=(await c.execute({sql:'SELECT COUNT(*) n FROM sessions WHERE token IN (SELECT token FROM sessions)'} )).rows[0].n;
const r=(await c.execute({sql:'SELECT COUNT(*) n FROM user_roles WHERE email=?',args:['$E']})).rows[0].n;
console.log('   users con ese email: '+u+' (0 esperado) | roles huerfanos: '+r+' (0 esperado)');});"

echo "== 10. El token ya no sirve"
curl -s $B/api/auth/me -H "Authorization: Bearer $T" -o /dev/null -w "   %{http_code} (espera 401)\n"

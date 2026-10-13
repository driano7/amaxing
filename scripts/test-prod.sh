#!/bin/bash
# Prueba de humo contra PRODUCCIÓN: conexión Turso desde Vercel y alojamiento
# de datos en las tablas correctas. Uso: BASE_URL=https://... bash scripts/test-prod.sh
set +e
set -a; source .env.local >/dev/null 2>&1; set +a
B=${BASE_URL:-https://donovan-amx.vercel.app}
S=$(date +%s)
P=0; F=0
ok()   { P=$((P+1)); printf "  \033[32mok\033[0m    %-46s %s\n" "$1" "$2"; }
fail() { F=$((F+1)); printf "  \033[31mFALLA\033[0m  %-46s %s\n" "$1" "$2"; }
chk()  { [ "$2" = "$3" ] && ok "$1" "$2" || fail "$1" "esperado $3, hubo $2"; }
code() { curl -s -o /dev/null -w '%{http_code}' --max-time 25 "$@"; }
json() { node -pe "try{const j=JSON.parse(require('fs').readFileSync(0,'utf8'));$1}catch(e){'ERR'}"; }
tok()  { curl -s --max-time 25 -X POST $B/api/auth -H "Content-Type: application/json" \
           -d "{\"mode\":\"login\",\"email\":\"$1\",\"password\":\"Prueba12345\"}" \
         | json "j.token||''"; }

echo ""
echo "════════ 1. CONEXIÓN TURSO DESDE VERCEL ════════"
R=$(curl -s --max-time 25 "$B/api/tours/reviews?experienceId=__smoke__")
if echo "$R" | grep -q '"reviews"'; then ok "Turso responde desde Vercel" "SELECT ok"
else fail "Turso responde desde Vercel" "$R"; fi

chk "GET /api/auth/me sin sesion" "$(code $B/api/auth/me)" "401"
chk "GET /api/gdpr/export sin sesion" "$(code $B/api/gdpr/export)" "401"
chk "POST /api/analytics/track" "$(code -X POST $B/api/analytics/track -H 'Content-Type: application/json' -d '{"pagePath":"/smoke","timeOnPage":1,"sessionId":"smoke_'$S'","eventType":"page_view"}')" "200"

echo ""
echo "════════ 2. ALTA CON DEMOGRAFÍA ════════"
E="smoke$S@t.com"
chk "POST /api/auth register" "$(code -X POST $B/api/auth -H 'Content-Type: application/json' -d '{"mode":"register","email":"'$E'","password":"Prueba12345","firstName":"Smoke","lastName":"Test","country":"MX","gender":"femenino"}')" "201"
T=$(tok "$E")
[ -n "$T" ] && ok "login devuelve token" "${T:0:14}..." || fail "login devuelve token" "vacio"
chk "GET /api/auth/me con token" "$(code $B/api/auth/me -H "Authorization: Bearer $T")" "200"

UID_=$(curl -s --max-time 25 $B/api/auth/me -H "Authorization: Bearer $T" | json "j.user.id")

echo ""
echo "════════ 3. ALOJAMIENTO EN LAS TABLAS ════════"
node -e "
import('@libsql/client').then(async ({createClient})=>{
const c=createClient({url:process.env.TURSO_URL,authToken:process.env.TURSO_API_KEY});
const q=async(s,a=[])=>(await c.execute({sql:s,args:a})).rows;
const id='$UID_';
const u=(await q('SELECT country, gender, first_nameEncrypted, pii_encrypted_at FROM users WHERE id=?',[id]))[0];
console.log('  '+(u?'\033[32mok\033[0m':'\033[31mFALLA\033[0m')+'    users: country+gender+PII cifrada        '+(u?\`\${u.country}/\${u.gender} cifrado:\${u.pii_encrypted_at?'si':'NO'}\`:'no existe'));
const r=(await q('SELECT role FROM user_roles WHERE \"userId\"=?',[id]))[0];
console.log('  '+(r?'\033[32mok\033[0m':'\033[31mFALLA\033[0m')+'    user_roles: rol asignado al alta        '+(r?r.role:'NO'));
const a=(await q('SELECT COUNT(*) n FROM access_audit_logs WHERE target_email=?',[process.argv[1]]))[0].n;
console.log('  '+((a>0)?'\033[32mok\033[0m':'\033[31mFALLA\033[0m')+'    access_audit_logs: escritura registrada  '+a+' entradas');
const an=(await q('SELECT COUNT(*) n FROM page_analytics WHERE \"pagePath\"=?',['/smoke']))[0].n;
console.log('  '+((an>0)?'\033[32mok\033[0m':'\033[31mFALLA\033[0m')+'    page_analytics: evento recibido        '+an+' fila(s)');
const rp=(await q('PRAGMA foreign_key_check'))[0];
console.log('  '+((!rp)?'\033[32mok\033[0m':'\033[31mFALLA\033[0m')+'    integridad FK en toda la base          '+(rp?'VIOLACION':'sin violaciones'));
global.__id=id;
});" "$E"

echo ""
echo "════════ 4. FLUJOS CON ROLES ════════"
node -e "import('@libsql/client').then(async ({createClient})=>{const c=createClient({url:process.env.TURSO_URL,authToken:process.env.TURSO_API_KEY});await c.execute({sql:'UPDATE user_roles SET role=? WHERE email=?',args:['employee','$E']});});"
chk "employee /admin/analytics" "$(code $B/api/admin/analytics -H "Authorization: Bearer $T")" "200"
chk "employee /admin/dashboard" "$(code $B/api/admin/dashboard -H "Authorization: Bearer $T")" "200"
chk "employee /admin/users (ve enmascarado)" "$(code $B/api/admin/users -H "Authorization: Bearer $T")" "200"
R=$(curl -s --max-time 25 $B/api/admin/users -H "Authorization: Bearer $T")
echo "$R" | grep -q '"firstName"' && fail "employee no ve PII en claro" "FUGA" || ok "employee no ve PII en claro" "correcto"
chk "employee /admin/decrypt (403)" "$(code -X POST $B/api/admin/decrypt -H 'Content-Type: application/json' -H "Authorization: Bearer $T" -d '{"userId":"x","reason":"prueba de humo"}')" "403"
R=$(curl -s --max-time 25 $B/api/admin/analytics -H "Authorization: Bearer $T")
echo "$R" | grep -q '"advanced"' && fail "employee no ve advanced" "FUGA" || ok "employee no ve bloque advanced" "correcto"

node -e "import('@libsql/client').then(async ({createClient})=>{const c=createClient({url:process.env.TURSO_URL,authToken:process.env.TURSO_API_KEY});await c.execute({sql:'UPDATE user_roles SET role=? WHERE email=?',args:['admin','$E']});});"
T=$(tok "$E")
chk "admin /admin/users" "$(code $B/api/admin/users -H "Authorization: Bearer $T")" "200"
R=$(curl -s --max-time 25 $B/api/admin/analytics -H "Authorization: Bearer $T")
echo "$R" | grep -q '"advanced"' && ok "admin ve bloque advanced" "correcto" || fail "admin ve bloque advanced" "falta"

echo ""
echo "════════ 5. GDPR Y REFERRALS ════════"
R=$(curl -s --max-time 25 $B/api/gdpr/export -H "Authorization: Bearer $T")
echo "$R" | grep -q '"legalBasis"' && ok "GDPR export responde" "$(echo "$R" | json "j.account.firstName+' '+j.account.lastName")" || fail "GDPR export" "$R"
chk "PATCH demographics valido" "$(code -X PATCH $B/api/profile/demographics -H 'Content-Type: application/json' -H "Authorization: Bearer $T" -d '{"gender":"masculino"}')" "200"
chk "PATCH demographics invalido (400)" "$(code -X PATCH $B/api/profile/demographics -H 'Content-Type: application/json' -H "Authorization: Bearer $T" -d '{"gender":"inventado"}')" "400"
RC=$(curl -s --max-time 25 $B/api/referrals/me -H "Authorization: Bearer $T" | json "j.referralCode||''")
[ -n "$RC" ] && ok "referido de admin creado" "$RC" || fail "referido de admin" "vacio"

echo ""
echo "════════ 6. MCP / OAUTH ════════"
for u in "/.well-known/oauth-authorization-server" "/.well-known/oauth-protected-resource" "/.well-known/oauth-protected-resource/mcp" "/.well-known/oauth-protected-resource/api/mcp/stream"; do
  chk "GET $u" "$(code $B$u)" "200"
done
RV=$(curl -s --max-time 25 $B/.well-known/oauth-protected-resource | json "j.resource")
AU=$(curl -s --max-time 25 $B/.well-known/oauth-authorization-server | json "j.issuer")
[ -n "$RV" ] && [ -n "$AU" ] && ok "metadata MCP coherente" "resource=$RV" || fail "metadata MCP" "vacia"
chk "MCP tools/list sin token (401)" "$(code -X POST $B/api/mcp/stream -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}')" "401"

echo ""
echo "════════ 7. LIMPIEZA ════════"
node -e "import('@libsql/client').then(async ({createClient})=>{const c=createClient({url:process.env.TURSO_URL,authToken:process.env.TURSO_API_KEY});
for(const s of ['DELETE FROM page_analytics WHERE \"pagePath\"=?','DELETE FROM sessions WHERE token LIKE ?','DELETE FROM referral_codes WHERE email=?','DELETE FROM referral_visits WHERE referral_code IN (SELECT referral_code FROM referral_codes WHERE email=?)','DELETE FROM user_roles WHERE email=?','DELETE FROM users WHERE email=?'])
  await c.execute({sql:s,args:['/smoke'].includes(s)?['/smoke']:['smoke_%'].includes(s)?['smoke_%']:['$E']});
const r=await c.execute({sql:'SELECT (SELECT COUNT(*) FROM users WHERE email=?) n',args:['$E']});
console.log('  '+(r.rows[0].n===0?'\033[32mok\033[0m':'\033[31mFALLA\033[0m')+'    datos de prueba eliminados          '+r.rows[0].n+' restantes');});"

echo ""
echo "═══════════════════════════════════════════"
printf "  %d pasaron, %d fallaron\n\n" "$P" "$F"
[ "$F" -eq 0 ]

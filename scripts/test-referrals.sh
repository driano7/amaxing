set -e
set -a; source .env.local >/dev/null 2>&1; set +a
B=http://localhost:3000
S=$(date +%s)

say() { printf "%s\n" "$1"; }
code() { tail -n1 | sed 's/.*|//'; }

# Helpers
mkuser() { # email -> id
  local E=$1
  curl -s -X POST $B/api/auth -H "Content-Type: application/json" \
    -d "{\"mode\":\"register\",\"email\":\"$E\",\"password\":\"Prueba12345\",\"firstName\":\"T\",\"lastName\":\"U\"}" -o /dev/null
  curl -s -X POST $B/api/auth -H "Content-Type: application/json" \
    -d "{\"mode\":\"login\",\"email\":\"$E\",\"password\":\"Prueba12345\"}" \
    | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token"
}
setrole() { node -e "
import('@libsql/client').then(async ({createClient})=>{const c=createClient({url:process.env.TURSO_URL,authToken:process.env.TURSO_API_KEY});
await c.execute({sql:'UPDATE user_roles SET role=? WHERE email=?',args:['$1','$2']});});"; }

EMP="emp$S@test.com"; CLI="cli$S@test.com"; ADM="adm$S@test.com"
EMP_T=$(mkuser "$EMP"); CLI_T=$(mkuser "$CLI"); ADM_T=$(mkuser "$ADM")
CLI_ID=$(curl -s $B/api/auth/me -H "Authorization: Bearer $CLI_T" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).user.id")
EMP_ID=$(curl -s $B/api/auth/me -H "Authorization: Bearer $EMP_T" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).user.id")

echo "== MÉTRICAS POR ROL =="
setrole client "$CLI"
printf "  client    /analytics        -> %s (espera 403)\n" "$(curl -s -o /dev/null -w '%{http_code}' $B/api/admin/analytics -H "Authorization: Bearer $CLI_T")"
printf "  client    /referrals/me     -> %s (espera 403)\n" "$(curl -s -o /dev/null -w '%{http_code}' $B/api/referrals/me -H "Authorization: Bearer $CLI_T")"
printf "  client    /admin/referrals  -> %s (espera 403)\n" "$(curl -s -o /dev/null -w '%{http_code}' $B/api/admin/referrals -H "Authorization: Bearer $CLI_T")"

setrole employee "$EMP"
printf "  employee  /analytics        -> %s (espera 200)\n" "$(curl -s -o /dev/null -w '%{http_code}' $B/api/admin/analytics -H "Authorization: Bearer $EMP_T")"
printf "  employee  /referrals/me     -> %s (espera 200)\n" "$(curl -s -o /dev/null -w '%{http_code}' $B/api/referrals/me -H "Authorization: Bearer $EMP_T")"
printf "  employee  /referrals?all=1  -> %s (espera 200, sin 'all')\n" "$(curl -s -o /dev/null -w '%{http_code}' "$B/api/admin/referrals?all=1" -H "Authorization: Bearer $EMP_T")"
echo -n "  employee  ve bloque advanced? -> "
curl -s $B/api/admin/analytics -H "Authorization: Bearer $EMP_T" | node -pe "const j=JSON.parse(require('fs').readFileSync(0,'utf8')); j.advanced===undefined?'NO (correcto)':'SI (FUGA)'"

setrole admin "$ADM"
printf "  admin     /analytics        -> %s\n" "$(curl -s -o /dev/null -w '%{http_code}' $B/api/admin/analytics -H "Authorization: Bearer $ADM_T")"
echo -n "  admin     ve bloque advanced? -> "
curl -s $B/api/admin/analytics -H "Authorization: Bearer $ADM_T" | node -pe "const j=JSON.parse(require('fs').readFileSync(0,'utf8')); j.advanced?'SI (correcto)':'NO (FUGA)'"

echo ""
echo "== REFERIDOS =="
setrole employee "$EMP"
echo -n "  codigo del empleado: "
CODE=$(curl -s $B/api/referrals/me -H "Authorization: Bearer $EMP_T" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).referralCode||''")
echo "$CODE"
echo -n "  formato CALP-XXXXXX valido? -> "
echo "$CODE" | grep -qE '^CALP-[BCDFGHJKLMNPQRSTVWXYZ2-9]{6}$' && echo "SI" || echo "NO"

echo -n "  clic con ref valido   -> "
curl -s "$B/api/referrals/track?ref=$CODE" -w " [%{http_code}]" -o /tmp/tr.json; node -pe "const j=require('/tmp/tr.json');'tracked='+j.tracked"
echo -n "  clic con ref inventado -> "
curl -s "$B/api/referrals/track?ref=CALP-ZZZZZZ" -o /tmp/tr2.json -w "%{http_code} "; node -pe "const j=require('/tmp/tr2.json');'tracked='+j.tracked"
echo -n "  cookie calpulli_ref fijada? -> "
curl -s -D - -o /dev/null "$B/api/referrals/track?ref=$CODE" | grep -ci "set-cookie.*calpulli_ref" | sed 's/1/SI/;s/0/NO/'

echo -n "  cliente se registra atribuido -> "
curl -s -X POST $B/api/auth -H "Content-Type: application/json" -H "Cookie: calpulli_ref=$CODE" \
  -d "{\"mode\":\"register\",\"email\":\"ref$S@test.com\",\"password\":\"Prueba12345\",\"firstName\":\"Cli\",\"lastName\":\"Ref\",\"referredBy\":\"$CODE\"}" -o /dev/null -w "%{http_code}\n"
REFCLI="ref$S@test.com"
REFCLI_T=$(curl -s -X POST $B/api/auth -H "Content-Type: application/json" -d "{\"mode\":\"login\",\"email\":\"$REFCLI\",\"password\":\"Prueba12345\"}" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
REFCLI_ID=$(curl -s $B/api/auth/me -H "Authorization: Bearer $REFCLI_T" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).user.id")

echo -n "  atribucion registrada en BD -> "
node -e "
import('@libsql/client').then(async ({createClient})=>{const c=createClient({url:process.env.TURSO_URL,authToken:process.env.TURSO_API_KEY});
const r=await c.execute({sql:'SELECT referral_code FROM referral_attributions WHERE referred_user_id=?',args:['$REFCLI_ID']});
console.log(r.rows[0]?r.rows[0].referral_code:'NO');});"

echo -n "  doble atribucion no duplica -> "
curl -s -X POST $B/api/referrals/me -H "Content-Type: application/json" -H "Cookie: calpulli_ref=$CODE" -H "Authorization: Bearer $REFCLI_T" -d '{}' -o /dev/null
node -e "
import('@libsql/client').then(async ({createClient})=>{const c=createClient({url:process.env.TURSO_URL,authToken:process.env.TURSO_API_KEY});
const r=await c.execute({sql:'SELECT COUNT(*) n FROM referral_attributions WHERE referred_user_id=?',args:['$REFCLI_ID']});
console.log(r.rows[0].n===1?'SI (1 fila)':'NO ('+r.rows[0].n+' filas)');});"

echo -n "  auto-referencia bloqueada -> "
EMP_CODE_OWN=$(curl -s $B/api/referrals/me -H "Authorization: Bearer $EMP_T" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).referralCode")
curl -s -X POST $B/api/referrals/me -H "Content-Type: application/json" -H "Cookie: calpulli_ref=$EMP_CODE_OWN" -H "Authorization: Bearer $EMP_T" -d '{}' | node -pe "const j=JSON.parse(require('fs').readFileSync(0,'utf8'));'attributed='+j.attributed+' reason='+(j.reason||'-')"

echo -n "  cliente NO puede pedir codigo -> "
setrole client "$CLI"
curl -s -o /dev/null -w "%{http_code} (espera 403)\n" $B/api/referrals/me -H "Authorization: Bearer $CLI_T"
setrole employee "$EMP"

echo -n "  conversion registrada tras compra -> "
BOOK=$(node -e "
import('@libsql/client').then(async ({createClient})=>{const c=createClient({url:process.env.TURSO_URL,authToken:process.env.TURSO_API_KEY});
const {randomBytes}=await import('crypto');const A='ABCDEFGHJKLMNPQRTUVWXYZ23456789';const b=randomBytes(6);let o='';for(let i=0;i<6;i++)o+=A[b[i]%A.length];const ref='CDMX-'+o;
await c.execute({sql:'INSERT INTO bookings (experience_id,user_id,booking_reference,booking_date,start_date,end_date,start_time,guests,status,payment_status,paid_at,total_amount,payed_amount,currency,customer_name,stripe_session_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',args:['1','$REFCLI_ID',ref,'2027-06-01','2027-06-01T10:00:00.000Z','2027-06-01T13:00:00.000Z','10:00',2,'paid','paid','2027-01-01T00:00:00.000Z',200,200,'USD','Cli Ref','sess_ref_$S']});
const id=(await c.execute({sql:'SELECT id FROM bookings WHERE booking_reference=?',args:[ref]})).rows[0].id;
console.log(id+'|'+ref);});")
BID="${BOOK%%|*}"; BREF="${BOOK##*|}"
node -e "
import('@libsql/client').then(async ({createClient})=>{
const c=createClient({url:process.env.TURSO_URL,authToken:process.env.TURSO_API_KEY});
const att=(await c.execute({sql:'SELECT * FROM referral_attributions WHERE referred_user_id=?',args:['$REFCLI_ID']})).rows[0];
if(!att){console.log('NO HAY ATRIBUCION');return;}
await c.execute({sql:'INSERT OR IGNORE INTO referral_conversions (referral_code_id,referred_user_id,booking_id,referral_code,stripe_session_id,amount,currency,status) VALUES (?,?,?,?,?,?,?,?)',args:[att.referral_code_id,'$REFCLI_ID','$BID',att.referral_code,'sess_ref_$S',200,'USD','paid']});
const n=(await c.execute({sql:'SELECT COUNT(*) n, SUM(amount) rev FROM referral_conversions WHERE booking_id=?',args:['$BID']})).rows[0];
console.log('conversiones='+n.n+' revenue='+n.rev);});"

echo -n "  stats del empleado -> "
curl -s $B/api/admin/referrals -H "Authorization: Bearer $EMP_T" | node -pe "const j=JSON.parse(require('fs').readFileSync(0,'utf8'));j.stats?('visitas='+j.stats.visits+' atribuidos='+j.stats.attributedUsers+' conversiones='+j.stats.conversions+' revenue='+j.stats.revenue):j.error"
echo -n "  admin ve todas las filas -> "
curl -s "$B/api/admin/referrals?all=1" -H "Authorization: Bearer $ADM_T" | node -pe "const j=JSON.parse(require('fs').readFileSync(0,'utf8'));j.all?j.all.length+' referido(s)':j.error"

# limpieza
node -e "
import('@libsql/client').then(async ({createClient})=>{const c=createClient({url:process.env.TURSO_URL,authToken:process.env.TURSO_API_KEY});
for(const e of ['$EMP','$CLI','$ADM','$REFCLI']){
  await c.execute({sql:'DELETE FROM referral_conversions WHERE referred_user_id IN (SELECT id FROM users WHERE email=?)',args:[e]});
  await c.execute({sql:'DELETE FROM referral_attributions WHERE referred_user_id IN (SELECT id FROM users WHERE email=?)',args:[e]});
  await c.execute({sql:'DELETE FROM referral_visits WHERE referral_code IN (SELECT referral_code FROM referral_codes WHERE email=?)',args:[e]});
  await c.execute({sql:'DELETE FROM referral_codes WHERE email=?',args:[e]});
  await c.execute({sql:'DELETE FROM bookings WHERE stripe_session_id=?',args:['sess_ref_$S']});
  await c.execute({sql:'DELETE FROM user_roles WHERE email=?',args:[e]});
  await c.execute({sql:'DELETE FROM users WHERE email=?',args:[e]});
}
const a=await c.execute('SELECT (SELECT COUNT(*) FROM users) u, (SELECT COUNT(*) FROM referral_codes) r, (SELECT COUNT(*) FROM referral_conversions) cv');
console.log('limpieza -> users:'+a.rows[0].u+' referral_codes:'+a.rows[0].r+' conversions:'+a.rows[0].cv);});"

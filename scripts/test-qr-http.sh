#!/bin/bash
# Prueba HTTP del flujo QR contra el servidor local.
set -e
set -a; source .env.local >/dev/null 2>&1; set +a
B=http://localhost:3000
Q="node -e let s=require('fs').readFileSync(0,'utf8');try{console.log(eval('('+s+')'))}catch(e){console.log('')}"

EMAIL="qr$(date +%s)@test.com"
echo "== 1. Registro del cliente"
curl -s -X POST $B/api/auth -H "Content-Type: application/json" \
  -d "{\"mode\":\"register\",\"email\":\"$EMAIL\",\"password\":\"Prueba12345\",\"firstName\":\"Ana\",\"lastName\":\"Torres\"}" -o /dev/null -w "   %{http_code}\n"

TOKEN=$(curl -s -X POST $B/api/auth -H "Content-Type: application/json" \
  -d "{\"mode\":\"login\",\"email\":\"$EMAIL\",\"password\":\"Prueba12345\"}" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")
USER_ID=$(curl -s $B/api/auth/me -H "Authorization: Bearer $TOKEN" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).user.id")
echo "   usuario: $USER_ID"

echo "== 2. Reserva pagada (como lo haria el checkout tras Stripe)"
BOOKING=$(node -e "
import('@libsql/client').then(async ({createClient})=>{
const c=createClient({url:process.env.TURSO_URL,authToken:process.env.TURSO_API_KEY});
const {createBookingInTurso}=await import('./.next/server/pages/api/stripe/confirm.js').catch(()=>({}));
});" 2>/dev/null || true)

REF=$(node -e "
import('@libsql/client').then(async ({createClient})=>{
const c=createClient({url:process.env.TURSO_URL,authToken:process.env.TURSO_API_KEY});
const {randomBytes}=await import('crypto');
const A='ABCDEFGHJKLMNPQRTUVWXYZ23456789';const b=randomBytes(6);let o='';for(let i=0;i<6;i++)o+=A[b[i]%A.length];
const ref='CDMX-'+o;
await c.execute({sql:'INSERT INTO bookings (experience_id,user_id,booking_reference,booking_date,start_date,end_date,start_time,guests,status,payment_status,paid_at,total_amount,payed_amount,currency,customer_name,stripe_session_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',args:['1','$USER_ID',ref,'2027-05-10','2027-05-10T10:30:00.000Z','2027-05-10T13:30:00.000Z','10:30',2,'paid','paid','2027-01-01T00:00:00.000Z',130,130,'USD','Ana Torres','sess_http_test']});
console.log(ref);
});")
CODE="AMX-T-$REF"
echo "   referencia: $REF  -> QR: $CODE"

echo "== 3. Cliente intenta escanear (debe 403)"
curl -s -o /dev/null -w "   %{http_code}\n" -X POST $B/api/admin/qr -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "{\"code\":\"$CODE\"}"

echo "== 4. Se promueve a employee"
node -e "
import('@libsql/client').then(async ({createClient})=>{const c=createClient({url:process.env.TURSO_URL,authToken:process.env.TURSO_API_KEY});
await c.execute({sql:'UPDATE user_roles SET role=? WHERE email=?',args:['employee','$EMAIL']});});"

echo "== 5. Employee escanea el QR"
SCAN=$(curl -s -X POST $B/api/admin/qr -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "{\"code\":\"$CODE\"}")
echo "$SCAN" | node -pe "const j=JSON.parse(require('fs').readFileSync(0,'utf8'));j.error?('   ERROR: '+j.error):('   '+j.resolved.experienceTitle+' | '+j.resolved.date+' '+j.resolved.time+' | '+j.resolved.peopleCount+' personas | \$'+j.resolved.totalPrice+' '+j.resolved.currency+' | estado: '+j.resolved.status+' | checkin: '+j.checkedIn)"

echo "== 6. Employee hace check-in"
CI=$(curl -s -X POST $B/api/admin/qr -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "{\"code\":\"$CODE\",\"checkIn\":true}")
echo "$CI" | node -pe "const j=JSON.parse(require('fs').readFileSync(0,'utf8'));'   estado: '+j.resolved.status+' | checkedInAt: '+j.resolved.checkedInAt"

echo "== 7. QR falso"
curl -s -o /dev/null -w "   %{http_code}\n" -X POST $B/api/admin/qr -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"code":"AMX-T-CDMX-ZZZZZZ"}'

echo "== 8. Auditoria"
node -e "
import('@libsql/client').then(async ({createClient})=>{const c=createClient({url:process.env.TURSO_URL,authToken:process.env.TURSO_API_KEY});
const r=await c.execute({sql:'SELECT action, actor_role, details FROM access_audit_logs ORDER BY created_at DESC LIMIT 3'});
r.rows.forEach(x=>console.log('   '+x.actor_role+' | '+x.action+' | '+x.details));
await c.execute({sql:'DELETE FROM bookings WHERE stripe_session_id=?',args:['sess_http_test']});
await c.execute({sql:'DELETE FROM user_roles WHERE email=?',args:['$EMAIL']});
await c.execute({sql:'DELETE FROM users WHERE email=?',args:['$EMAIL']});});"

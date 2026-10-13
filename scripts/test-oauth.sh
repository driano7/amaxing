set +e
set -a; source .env.local >/dev/null 2>&1; set +a
B=${BASE_URL:-http://localhost:3000}
ORIGIN=$(echo $B | sed 's#localhost#donovan-amx.vercel.app#')
S=$(date +%s)

say() { printf "%-52s %s\n" "$1" "$2"; }
jq_() { node -pe "try{const j=JSON.parse(require('fs').readFileSync(0,'utf8'));$1}catch(e){'PARSE_ERR'}"; }

echo ""
echo "── 1. METADATA (lo primero que hace el cliente MCP) ──"
M=$(curl -s --max-time 20 $B/.well-known/oauth-authorization-server)
say "issuer" "$(echo "$M" | jq_ "j.issuer")"
say "token_endpoint" "$(echo "$M" | jq_ "j.token_endpoint")"
say "registration_endpoint" "$(echo "$M" | jq_ "j.registration_endpoint")"
say "code_challenge_methods_supported" "$(echo "$M" | jq_ "JSON.stringify(j.code_challenge_methods_supported)")"
say "token_endpoint_auth_methods" "$(echo "$M" | jq_ "JSON.stringify(j.token_endpoint_auth_methods_supported)")"
P=$(curl -s --max-time 20 $B/.well-known/oauth-protected-resource)
say "resource" "$(echo "$P" | jq_ "j.resource")"
say "authorization_servers" "$(echo "$P" | jq_ "JSON.stringify(j.authorization_servers)")"

echo ""
echo "── 2. REGISTRO DINÁMICO (RFC 7591) ──"
REG=$(curl -s --max-time 20 -X POST $B/api/mcp/oauth/register -H "Content-Type: application/json" -d '{
  "redirect_uris":["https://claude.ai/api/mcp/auth_callback"],
  "client_name":"Claude Desktop",
  "grant_types":["authorization_code","refresh_token"],
  "response_types":["code"],
  "token_endpoint_auth_method":"none",
  "scope":"mcp:read"}')
CID=$(echo "$REG" | jq_ "j.client_id||''")
say "client_id asignado" "${CID:0:24}..."
say "client_secret (debe ser null: es público)" "$(echo "$REG" | jq_ "String(j.client_secret)")"

echo ""
echo "── 3. RECHAZO de redirect_uris inseguros ──"
BAD=$(curl -s --max-time 20 -X POST $B/api/mcp/oauth/register -H "Content-Type: application/json" \
  -d '{"redirect_uris":["http://evil.com/callback"],"client_name":"evil"}')
say "http:// externo" "$(echo "$BAD" | jq_ "j.error||'ACEPTADO (FUGA)'")"
OK=$(curl -s --max-time 20 -X POST $B/api/mcp/oauth/register -H "Content-Type: application/json" \
  -d '{"redirect_uris":["http://localhost:1234/cb"],"client_name":"local"}')
say "http://localhost (loopback)" "$(echo "$OK" | jq_ "j.client_id?'SI (correcto)':'RECHAZADO'")"

echo ""
echo "── 4. AUTHORIZE sin sesión (debe pedir login) ──"
VERIFIER=$(node -pe "require('crypto').randomBytes(48).toString('base64url')")
CHALLENGE=$(node -pe "require('crypto').createHash('sha256').update(process.argv[1]).digest('base64url')" "$VERIFIER")
AUTHQ="response_type=code&client_id=$CID&redirect_uri=https%3A%2F%2Fclaude.ai%2Fapi%2Fmcp%2Fauth_callback&scope=mcp%3Aread&state=st123&code_challenge=$CHALLENGE&code_challenge_method=S256&resource=$ORIGIN/api/mcp/stream"
CODEPAGE=$(curl -s --max-time 20 "$B/api/mcp/oauth/authorize?$AUTHQ")
say "sin sesión" "$(echo "$CODEPAGE" | grep -o 'Necesitas iniciar sesión' | head -1 || true)"

echo ""
echo "── 5. Sesión real + consentimiento ──"
EM="mcp$S@t.com"
curl -s --max-time 20 -X POST $B/api/auth -H "Content-Type: application/json" \
  -d "{\"mode\":\"register\",\"email\":\"$EM\",\"password\":\"Prueba12345\",\"firstName\":\"Ana\",\"lastName\":\"Ruiz\"}" -o /dev/null
MT=$(curl -s --max-time 20 -X POST $B/api/auth -H "Content-Type: application/json" \
  -d "{\"mode\":\"login\",\"email\":\"$EM\",\"password\":\"Prueba12345\"}" | jq_ "j.token||''")
say "sesión creada" "${MT:0:16}..."
CONSENT=$(curl -s --max-time 20 -H "Cookie: authToken=$MT" "$B/api/mcp/oauth/authorize?$AUTHQ")
say "página de consentimiento" "$(echo "$CONSENT" | grep -oE 'solicita acceso a tu cuenta' | head -1 || true)"
REDIRECT=$(curl -s --max-time 20 -o /dev/null -D - -H "Cookie: authToken=$MT" \
  "$B/api/mcp/oauth/authorize?$AUTHQ&consent=approve" | grep -i "^location:" | tr -d '\r')
CODE=$(echo "$REDIRECT" | sed -n 's/.*[?&]code=\([^&]*\).*/\1/p')
say "code emitido" "${CODE:0:20}..."

echo ""
echo "── 6. TOKEN con PKCE ──"
TOK=$(curl -s --max-time 20 -X POST $B/api/mcp/oauth/token -H "Content-Type: application/json" -d "{
  \"grant_type\":\"authorization_code\",
  \"code\":\"$CODE\",
  \"redirect_uri\":\"https://claude.ai/api/mcp/auth_callback\",
  \"client_id\":\"$CID\",
  \"code_verifier\":\"$VERIFIER\",
  \"resource\":\"$ORIGIN/api/mcp/stream\"}")
ACCESS=$(echo "$TOK" | jq_ "j.access_token||''")
REFRESH=$(echo "$TOK" | jq_ "j.refresh_token||''")
say "access_token" "${ACCESS:0:16}..."
say "refresh_token" "${REFRESH:0:16}..."
say "expires_in" "$(echo "$TOK" | jq_ "j.expires_in")"

echo ""
echo "── 7. TOKEN con PKCE incorrecto (debe fallar) ──"
BADTOK=$(curl -s --max-time 20 -X POST $B/api/mcp/oauth/token -H "Content-Type: application/json" -d "{
  \"grant_type\":\"authorization_code\",
  \"code\":\"$CODE\",
  \"redirect_uri\":\"https://claude.ai/api/mcp/auth_callback\",
  \"client_id\":\"$CID\",
  \"code_verifier\":\"verificador-falso-que-no-corresponde\"}")
say "code reutilizado con verifier falso" "$(echo "$BADTOK" | jq_ "j.error||'ACEPTADO (FUGA)'")"

echo ""
echo "── 8. El token SÍ abre el MCP ──"
TOOLS=$(curl -s --max-time 20 -X POST $B/api/mcp/stream -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}')
say "tools/list" "$(echo "$TOOLS" | grep -o 'search_tours' | head -1 || true)"

echo ""
echo "── 9. Token inválido (401) ──"
say "Bearer basura" "$(curl -s --max-time 20 -o /dev/null -w '%{http_code}' -X POST $B/api/mcp/stream -H 'Content-Type: application/json' -H 'Authorization: Bearer basura' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}')"

echo ""
echo "── 10. Refresh (rotación) ──"
RT=$(curl -s --max-time 20 -X POST $B/api/mcp/oauth/token -H "Content-Type: application/json" \
  -d "{\"grant_type\":\"refresh_token\",\"refresh_token\":\"$REFRESH\",\"client_id\":\"$CID\"}")
say "nuevo access_token" "$(echo "$RT" | jq_ "(j.access_token||'').slice(0,16)+'...'")"
say "refresh viejo sigue vivo?" "$(curl -s --max-time 20 -X POST $B/api/mcp/oauth/token -H 'Content-Type: application/json' -d "{\"grant_type\":\"refresh_token\",\"refresh_token\":\"$REFRESH\",\"client_id\":\"$CID\"}" | jq_ "j.error||'SI (FUGA)'")"

echo ""
echo "── 11. Revocación ──"
NEWREFRESH=$(echo "$RT" | jq_ "j.refresh_token||''")
say "revoke" "$(curl -s --max-time 20 -o /dev/null -w '%{http_code}' -X POST $B/api/mcp/oauth/revoke -H 'Content-Type: application/json' -d "{\"token\":\"$NEWREFRESH\",\"client_id\":\"$CID\"}")"

echo ""
echo "── 12. Introspección ──"
say "token activo antes de revocar" "$(curl -s --max-time 20 -X POST $B/api/mcp/oauth/introspect -H 'Content-Type: application/json' -d "{\"token\":\"$ACCESS\",\"client_id\":\"$CID\"}" | jq_ "j.active")"

# limpieza
node -e "
import('@libsql/client').then(async ({createClient})=>{const c=createClient({url:process.env.TURSO_URL,authToken:process.env.TURSO_API_KEY});
for(const id of ['$CID']){ await c.execute({sql:'DELETE FROM oauth_tokens WHERE client_id=?',args:[id]}); await c.execute({sql:'DELETE FROM oauth_authorization_codes WHERE client_id=?',args:[id]}); await c.execute({sql:'DELETE FROM oauth_client_metadata WHERE client_id=?',args:[id]}); await c.execute({sql:'DELETE FROM oauth_clients WHERE client_id=?',args:[id]}); }
await c.execute({sql:'DELETE FROM user_roles WHERE email=?',args:['$EM']});await c.execute({sql:'DELETE FROM users WHERE email=?',args:['$EM']});
console.log('limpieza ok');});" >/dev/null
echo ""

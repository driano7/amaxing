-- MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX
-- Cifrado GDPR en reposo: columnas cifradas por campo sensible.
-- Patrón de 4 columnas (Encrypted/Iv/Tag/Salt) igual que XocoCafé.
-- La llave se deriva con PBKDF2(email + GDPR_PEPPER); sin el pepper no se descifra.

ALTER TABLE users ADD COLUMN first_nameEncrypted TEXT;
ALTER TABLE users ADD COLUMN first_nameIv TEXT;
ALTER TABLE users ADD COLUMN first_nameTag TEXT;
ALTER TABLE users ADD COLUMN first_nameSalt TEXT;

ALTER TABLE users ADD COLUMN last_nameEncrypted TEXT;
ALTER TABLE users ADD COLUMN last_nameIv TEXT;
ALTER TABLE users ADD COLUMN last_nameTag TEXT;
ALTER TABLE users ADD COLUMN last_nameSalt TEXT;

ALTER TABLE users ADD COLUMN phoneEncrypted TEXT;
ALTER TABLE users ADD COLUMN phoneIv TEXT;
ALTER TABLE users ADD COLUMN phoneTag TEXT;
ALTER TABLE users ADD COLUMN phoneSalt TEXT;

-- Marca de cifrado para saber si la fila está protegida y desde cuándo.
ALTER TABLE users ADD COLUMN pii_encrypted_at TEXT;

CREATE INDEX IF NOT EXISTS idx_users_pii_encrypted ON users(pii_encrypted_at);

-- passport_number y date_of_birth también son datos sensibles (documento / fecha de nac).
ALTER TABLE users ADD COLUMN passport_numberEncrypted TEXT;
ALTER TABLE users ADD COLUMN passport_numberIv TEXT;
ALTER TABLE users ADD COLUMN passport_numberTag TEXT;
ALTER TABLE users ADD COLUMN passport_numberSalt TEXT;

ALTER TABLE users ADD COLUMN date_of_birthEncrypted TEXT;
ALTER TABLE users ADD COLUMN date_of_birthIv TEXT;
ALTER TABLE users ADD COLUMN date_of_birthTag TEXT;
ALTER TABLE users ADD COLUMN date_of_birthSalt TEXT;

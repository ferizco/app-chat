BEGIN;

-- 1) Buat sequence untuk angka user (aman jika sudah ada)
CREATE SEQUENCE IF NOT EXISTS user_id_seq;

-- 2) Inisialisasi sequence dari data eksisting:
--    Ambil angka terbesar dari ID yang formatnya 'u123', lalu set jadi current value.
SELECT setval(
  'user_id_seq',
  COALESCE(
    (
      SELECT MAX(NULLIF(regexp_replace(id, '[^0-9]', '', 'g'), '')::bigint)
      FROM users
    ),
    0
  )
);

-- 3) Set DEFAULT pada kolom id -> 'u' || nextval(user_id_seq)
ALTER TABLE users
  ALTER COLUMN id SET DEFAULT 'u' || nextval('user_id_seq');

-- 4) Trigger guard:
--    Jika ada INSERT lama yang mengirim id = NULL / '' maka DB tetap mengisi otomatis.
CREATE OR REPLACE FUNCTION trg_users_set_id()
RETURNS trigger AS $$
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    NEW.id := 'u' || nextval('user_id_seq')::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_insert_users_set_id ON users;
CREATE TRIGGER before_insert_users_set_id
BEFORE INSERT ON users
FOR EACH ROW EXECUTE FUNCTION trg_users_set_id();

-- 5) Pastikan format id valid: 'u' diikuti angka
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_id_format_chk,
  ADD CONSTRAINT users_id_format_chk CHECK (id ~ '^u[0-9]+$');

-- 6) (Opsional tapi disarankan) unikkan email jika belum unik
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email ON users (email);

COMMIT;

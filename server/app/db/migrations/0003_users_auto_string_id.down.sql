BEGIN;

-- Kembalikan kolom id ke tanpa DEFAULT (app bisa isi sendiri lagi, bila perlu)
ALTER TABLE users
  ALTER COLUMN id DROP DEFAULT;

-- Hapus constraint format (kembali longgar seperti semula)
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_id_format_chk;

-- Hapus trigger & fungsi guard
DROP TRIGGER IF EXISTS before_insert_users_set_id ON users;
DROP FUNCTION IF EXISTS trg_users_set_id();

-- (Opsional) Jika DIINGINKAN menghapus unique index email yang dibuat di UP:
--  PERINGATAN: Jika index ini sudah ada sebelum migration ini, menghapusnya bisa
--  mengubah perilaku sistem Anda. Aktifkan baris di bawah hanya jika yakin.
-- DROP INDEX IF EXISTS ux_users_email;

-- (Opsional) Jangan drop sequence agar aman (bisa dipakai lagi di masa depan).
-- Jika benar-benar ingin bersih total, baru drop:
-- DROP SEQUENCE IF EXISTS user_id_seq;

COMMIT;

-- isi tabel alias
INSERT INTO alias (id_alias, alias_name) VALUES
('a1','tukang sapu'),
('a2','kuli tinta'),
('a3','nelayan kota'),
('a4','dukun ayam'),
('a5','bidan desa'),
('a6','juragan kopi'),
('a7','petani garam'),
('a8','sopir truk'),
('a9','tukang cukur'),
('a10','montir jalan'),
('a11','bos kayu'),
('a12','guru ngaji'),
('a13','juru masak'),
('a14','jagal sapi'),
('a15','kuli bangun'),
('a16','dokter gigi'),
('a17','penjaga toko'),
('a18','satpam sekolah'),
('a19','penjahit kain'),
('a20','tukang kayu')
ON CONFLICT (id_alias) DO NOTHING;

-- isi tabel users
INSERT INTO users (id, username, created_at, pass_hash, name, email, id_alias) VALUES
('u1','alice','2025-08-10 07:54:29',
 '$2a$12$fReQsFrVRth4rxCDtzn8MO.er00DYXn6b8GovOuddGhkp/OvwJqaK',
 'alice','alice@gmail.com','a1'),
('u2','bob','2025-08-10 07:54:29',
 '$2a$12$fReQsFrVRth4rxCDtzn8MO.er00DYXn6b8GovOuddGhkp/OvwJqaK',
 'bob','bob@gmail.com','a2'),
('u3','charlie','2025-08-10 07:54:29',
 '$2a$12$fReQsFrVRth4rxCDtzn8MO.er00DYXn6b8GovOuddGhkp/OvwJqaK',
 'charlie','charlie@gmail.com','a3'),
('u4','marlo','2025-08-18 00:11:47.2115188+07:00',
 '$2a$12$TokGP.kz9Tv4tBPC.46vjemkhfnE1lemiyvNrZ7xQJY6h2Uos3TL2',
 'marlo','marlo@gmail.com','a20')
ON CONFLICT (id) DO NOTHING;

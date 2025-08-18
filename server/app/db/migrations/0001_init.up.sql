-- db/migrations/0001_init.up.sql
CREATE TABLE alias (
    id_alias VARCHAR(20) PRIMARY KEY,
    alias_name TEXT NOT NULL
);

CREATE TABLE users (
    id VARCHAR(20) PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ,
    pass_hash TEXT,
    name TEXT,
    email TEXT,
    id_alias VARCHAR(20) REFERENCES alias(id_alias)
);

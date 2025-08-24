CREATE TABLE timeline_posts (
  id             BIGSERIAL PRIMARY KEY,
  author_id      VARCHAR(20) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body           TEXT        NOT NULL,
  parent_post_id BIGINT, -- disiapkan utk Phase 2 (reply), belum dipakai di Phase 1
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at     TIMESTAMPTZ
);

-- index untuk feed/profile
CREATE INDEX idx_posts_created_at        ON timeline_posts (created_at DESC, id DESC);
CREATE INDEX idx_posts_author_created_at ON timeline_posts (author_id, created_at DESC, id DESC);

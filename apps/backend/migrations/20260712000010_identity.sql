-- =============================================================================
-- 20260712000010_identity.sql
-- PanchangPal — Identity & Profile (TBL_APP_USER, TBL_USER_PROFILE)
-- Source: TDD Part 2 §3.1–3.2, §4.
-- Idempotent version for replay-safe deployments.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TBL_APP_USER
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS app_user (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_anonymous  boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app_user ENABLE ROW LEVEL SECURITY;

-- Trigger: updated_at
DROP TRIGGER IF EXISTS trg_app_user_updated_at ON app_user;

CREATE TRIGGER trg_app_user_updated_at
BEFORE UPDATE ON app_user
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Trigger: create app_user after auth signup
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;

CREATE TRIGGER trg_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- Policies
DROP POLICY IF EXISTS app_user_sel_self ON app_user;
CREATE POLICY app_user_sel_self
ON app_user
FOR SELECT
USING (id = auth.uid());

DROP POLICY IF EXISTS app_user_upd_self ON app_user;
CREATE POLICY app_user_upd_self
ON app_user
FOR UPDATE
USING (id = auth.uid());



-- -----------------------------------------------------------------------------
-- TBL_USER_PROFILE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_profile (
  user_id        uuid PRIMARY KEY REFERENCES app_user(id) ON DELETE CASCADE,

  tradition_code tradition_code NOT NULL DEFAULT 'generic',
  ritual_time    time,

  content_depth  content_depth NOT NULL DEFAULT 'quick',

  city           text,
  lat            double precision,
  lng            double precision,

  timezone       text,

  appearance     appearance_mode NOT NULL DEFAULT 'system',

  locale         text NOT NULL DEFAULT 'en-US',

  notif_prefs    jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profile_user
ON user_profile(user_id);

ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_user_profile_updated_at ON user_profile;

CREATE TRIGGER trg_user_profile_updated_at
BEFORE UPDATE ON user_profile
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP POLICY IF EXISTS user_profile_sel_own ON user_profile;
CREATE POLICY user_profile_sel_own
ON user_profile
FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_profile_ins_own ON user_profile;
CREATE POLICY user_profile_ins_own
ON user_profile
FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS user_profile_upd_own ON user_profile;
CREATE POLICY user_profile_upd_own
ON user_profile
FOR UPDATE
USING (user_id = auth.uid());

-- =============================================================================
-- End
-- =============================================================================
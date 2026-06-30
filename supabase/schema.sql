-- ============================================================
-- Calendario de Gestión CCB — Schema Supabase
-- Ejecutar completo en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. Tabla profiles (vinculada a auth.users) ──────────────
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  department      VARCHAR(100)  NOT NULL,
  department_name VARCHAR(255)  NOT NULL,
  email           VARCHAR(255)  NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Cada usuario solo puede leer su propio perfil
CREATE POLICY "profiles_read_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- ── 2. Tabla tasks ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          BIGSERIAL    PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  department  VARCHAR(100) NOT NULL,
  responsible VARCHAR(255) NOT NULL,
  start_date  DATE,
  due_date    DATE         NOT NULL,
  progress    INTEGER      NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status      VARCHAR(50)  NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden leer todas las tareas
CREATE POLICY "tasks_read_all"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

-- Solo pueden insertar tareas de su propio departamento
CREATE POLICY "tasks_insert_own"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    department = (SELECT department FROM profiles WHERE id = auth.uid())
  );

-- Solo pueden actualizar tareas de su propio departamento
CREATE POLICY "tasks_update_own"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    department = (SELECT department FROM profiles WHERE id = auth.uid())
  );

-- Solo pueden eliminar tareas de su propio departamento
CREATE POLICY "tasks_delete_own"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    department = (SELECT department FROM profiles WHERE id = auth.uid())
  );

-- ── 3. Trigger: updated_at automático ───────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 4. Índices de rendimiento ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tasks_department  ON tasks (department);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date    ON tasks (due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status      ON tasks (status);

-- ============================================================
-- DESPUÉS DE EJECUTAR ESTE SQL:
--
-- El login usa selector de departamento + contraseña (sin email visible).
-- Internamente cada usuario tiene el email: slug@ccb.internal
--
-- Para crear los 8 usuarios:
-- 1. Authentication → Users → Add user → "Create new user"
-- 2. Email:    secretaria@ccb.internal   (según la tabla de abajo)
-- 3. Password: la que decidas para ese departamento
-- 4. DESHABILITA "Send email confirmation" (toggle off)
-- 5. Copia el UUID del usuario creado
-- 6. Descomenta e inserta el perfil correspondiente abajo
-- ============================================================

-- Tabla de emails por departamento (para crear usuarios en Auth):
--
--   Departamento        Email Auth                  Slug
--   ─────────────────── ─────────────────────────── ─────────────────
--   Secretaría General  secretaria@ccb.internal     secretaria
--   Conexiones          conexiones@ccb.internal     conexiones
--   Control Interno     control_interno@ccb.internal control_interno
--   Comunicaciones      comunicaciones@ccb.internal comunicaciones
--   Financiera          financiera@ccb.internal     financiera
--   Administrativa      administrativa@ccb.internal administrativa
--   Compras             compras@ccb.internal        compras
--   VP Registro y TD    vp_registro_td@ccb.internal vp_registro_td

-- ── 5. INSERT de perfiles — ejecutar uno por usuario ────────
-- Reemplaza <UUID> con el UUID del usuario creado en Auth

-- INSERT INTO profiles (id, department, department_name, email) VALUES
--   ('<UUID>', 'secretaria',      'Secretaría General', 'secretaria@ccb.internal'),
--   ('<UUID>', 'conexiones',      'Conexiones',         'conexiones@ccb.internal'),
--   ('<UUID>', 'control_interno', 'Control Interno',    'control_interno@ccb.internal'),
--   ('<UUID>', 'comunicaciones',  'Comunicaciones',     'comunicaciones@ccb.internal'),
--   ('<UUID>', 'financiera',      'Financiera',         'financiera@ccb.internal'),
--   ('<UUID>', 'administrativa',  'Administrativa',     'administrativa@ccb.internal'),
--   ('<UUID>', 'compras',         'Compras',            'compras@ccb.internal'),
--   ('<UUID>', 'vp_registro_td',  'VP Registro y TD',   'vp_registro_td@ccb.internal');

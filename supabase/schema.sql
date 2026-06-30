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
-- 1. Ve a Authentication → Users → Add user (para cada departamento)
-- 2. Copia el UUID del usuario creado
-- 3. Inserta su perfil con el INSERT de abajo (uno por departamento)
-- ============================================================

-- ── 5. INSERT de perfiles — ejecutar uno por usuario ────────
-- Reemplaza <UUID> con el UUID del usuario creado en Auth

-- INSERT INTO profiles (id, department, department_name, email) VALUES
--   ('<UUID>', 'secretaria',     'Secretaría General', 'secretaria@tudominio.com'),
--   ('<UUID>', 'conexiones',     'Conexiones',         'conexiones@tudominio.com'),
--   ('<UUID>', 'control_interno','Control Interno',    'control.interno@tudominio.com'),
--   ('<UUID>', 'comunicaciones', 'Comunicaciones',     'comunicaciones@tudominio.com'),
--   ('<UUID>', 'financiera',     'Financiera',         'financiera@tudominio.com'),
--   ('<UUID>', 'administrativa', 'Administrativa',     'administrativa@tudominio.com'),
--   ('<UUID>', 'compras',        'Compras',            'compras@tudominio.com'),
--   ('<UUID>', 'vp_registro_td', 'VP Registro y TD',   'vp.registro@tudominio.com');

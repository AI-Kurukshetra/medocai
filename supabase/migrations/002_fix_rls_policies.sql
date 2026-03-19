-- Fix recursive RLS policies by using a SECURITY DEFINER function
-- that bypasses RLS when looking up the current user's org_id

CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM user_profiles WHERE id = auth.uid()
$$;

-- ==========================================
-- FIX user_profiles: drop the recursive policy
-- ==========================================
DROP POLICY IF EXISTS "org_members_view_profiles" ON user_profiles;
-- Keep "users_own_profile" (FOR ALL USING id = auth.uid()) — it works fine

-- ==========================================
-- FIX organizations: was missing a policy (deny-all by default)
-- ==========================================
DROP POLICY IF EXISTS "org_members_view_org" ON organizations;
CREATE POLICY "org_members_view_org" ON organizations
  FOR SELECT USING (id = public.get_my_org_id());

-- ==========================================
-- FIX encounters: replace subquery with function
-- ==========================================
DROP POLICY IF EXISTS "org_isolation_encounters" ON encounters;
CREATE POLICY "org_isolation_encounters" ON encounters
  FOR ALL USING (organization_id = public.get_my_org_id());

-- ==========================================
-- FIX patients: replace subquery with function
-- ==========================================
DROP POLICY IF EXISTS "org_isolation_patients" ON patients;
CREATE POLICY "org_isolation_patients" ON patients
  FOR ALL USING (organization_id = public.get_my_org_id());

-- ==========================================
-- FIX queries: simplify nested subquery
-- ==========================================
DROP POLICY IF EXISTS "org_isolation_queries" ON queries;
CREATE POLICY "org_isolation_queries" ON queries
  FOR ALL USING (
    encounter_id IN (
      SELECT id FROM encounters WHERE organization_id = public.get_my_org_id()
    )
  );

-- ==========================================
-- FIX clinical_documents
-- ==========================================
DROP POLICY IF EXISTS "org_isolation_clinical_docs" ON clinical_documents;
CREATE POLICY "org_isolation_clinical_docs" ON clinical_documents
  FOR ALL USING (
    encounter_id IN (
      SELECT id FROM encounters WHERE organization_id = public.get_my_org_id()
    )
  );

-- ==========================================
-- FIX encounter_diagnoses
-- ==========================================
DROP POLICY IF EXISTS "org_isolation_diagnoses" ON encounter_diagnoses;
CREATE POLICY "org_isolation_diagnoses" ON encounter_diagnoses
  FOR ALL USING (
    encounter_id IN (
      SELECT id FROM encounters WHERE organization_id = public.get_my_org_id()
    )
  );

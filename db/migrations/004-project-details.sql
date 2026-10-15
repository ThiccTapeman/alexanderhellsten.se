ALTER TABLE projects ADD COLUMN independent boolean NOT NULL DEFAULT false;
ALTER TABLE projects ADD COLUMN "showInProjects" boolean NOT NULL DEFAULT true;
ALTER TABLE projects ADD COLUMN sections jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN "independentDetails" jsonb DEFAULT NULL;

-- Keep nonprofit as a read-only historical archive; all active editing and reads
-- now use projects. Match URLs before names (including the old Veil/Vail typo).
DO $$
DECLARE
  entry record;
  project_id integer;
BEGIN
  FOR entry IN SELECT * FROM nonprofit ORDER BY position, id LOOP
    project_id := NULL;
    SELECT id INTO project_id FROM projects
      WHERE "independentDetails" IS NULL AND (
        (entry."projectLink" <> '' AND "projectHomepage" = entry."projectLink")
        OR lower("projectName") = lower(entry.title)
      )
      ORDER BY CASE WHEN entry."projectLink" <> '' AND "projectHomepage" = entry."projectLink" THEN 0 ELSE 1 END, id
      LIMIT 1;
    IF project_id IS NULL THEN
      -- Preserve résumé-only entries without changing the existing project list.
      INSERT INTO projects ("projectName", "projectDescription", "projectDate", "projectType", "projectHomepage", "showInProjects", position)
        VALUES (entry.title, entry.description, entry.date, entry.company, entry."projectLink", false, entry.position)
        RETURNING id INTO project_id;
    END IF;
    UPDATE projects SET independent = true, "independentDetails" = jsonb_build_object(
      'title', entry.title, 'organization', entry.company, 'date', entry.date,
      'description', entry.description, 'current', entry.current, 'url', entry."projectLink", 'position', entry.position
    ), version = version + 1 WHERE id = project_id;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION get_activities_with_revisions(input_project_id UUID, input_date date, input_probability float)
RETURNS TABLE(
    id UUID,
    project_id UUID,
    name TEXT,
    description TEXT,
    duration FLOAT,
    start date,
    "end" date,
    cost FLOAT,
    status TEXT,
    created_by UUID,
    dependencies UUID[],
    resources UUID[],
    owner UUID[],
    creation_time timestamptz,
    progress smallint,
    history jsonb,
    critical_path boolean,
    revision jsonb
) LANGUAGE plpgsql AS $$
#variable_conflict use_column
BEGIN
    RETURN QUERY
      SELECT a.id,
            a.project_id,
            a.name,
            a.description,
            a.duration,
            a.start,
            a."end",
            a.cost,
            a.status,
            a.created_by,
            a.dependencies,
            a.resources,
            a.owner,
            a.creation_time,
            a.progress,
            ah.history AS history,
            ac.critical_path as critical_path,
            ar.revision as revision
      FROM activity a
      LEFT JOIN activity_critical ac ON ac.activity_id = a.id
      LEFT JOIN activity_history ah ON LOWER(REGEXP_REPLACE(a.name, '[^a-zA-Z0-9]', '', 'g')) = LOWER(REGEXP_REPLACE(ah.history->>'name', '[^a-zA-Z0-9]', '', 'g'))  AND input_project_id = ah.project_id
      LEFT JOIN (
        SELECT ar1.activity_id, ar1.revision
        FROM activity_revision ar1
        WHERE ar1.created_at = (
            SELECT MAX(ar2.created_at)
            FROM activity_revision ar2
            WHERE ar2.activity_id = ar1.activity_id
            AND ar2.created_at <= input_date 
        )
    ) ar ON ar.activity_id = a.id
      WHERE a.project_id = input_project_id;
      END;
$$;
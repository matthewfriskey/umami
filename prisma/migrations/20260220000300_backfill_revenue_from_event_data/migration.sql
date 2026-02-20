WITH revenue_events AS (
  SELECT
    ed."website_id",
    ed."website_event_id" AS "event_id",
    COALESCE(ed."created_at", we."created_at") AS "created_at",
    CASE
      WHEN ed."number_value" IS NOT NULL THEN ed."number_value"::numeric(19, 4)
      WHEN trim(COALESCE(ed."string_value", '')) ~ '^[0-9]+(\.[0-9]+)?$'
        THEN trim(ed."string_value")::numeric(19, 4)
      ELSE NULL
    END AS "revenue_value"
  FROM "event_data" ed
  JOIN "website_event" we
    ON we."event_id" = ed."website_event_id"
    AND we."website_id" = ed."website_id"
  WHERE lower(ed."data_key") = 'revenue'
),
currency_events AS (
  SELECT
    ed."website_id",
    ed."website_event_id" AS "event_id",
    upper(NULLIF(trim(ed."string_value"), '')) AS "currency"
  FROM "event_data" ed
  WHERE lower(ed."data_key") = 'currency'
)
INSERT INTO "revenue" (
  "revenue_id",
  "website_id",
  "session_id",
  "event_id",
  "event_name",
  "currency",
  "revenue",
  "created_at"
)
SELECT
  re."event_id" AS "revenue_id",
  we."website_id",
  we."session_id",
  we."event_id",
  COALESCE(NULLIF(we."event_name", ''), 'revenue') AS "event_name",
  COALESCE(ce."currency", 'USD') AS "currency",
  re."revenue_value" AS "revenue",
  re."created_at"
FROM revenue_events re
JOIN "website_event" we
  ON we."event_id" = re."event_id"
  AND we."website_id" = re."website_id"
LEFT JOIN currency_events ce
  ON ce."event_id" = re."event_id"
  AND ce."website_id" = re."website_id"
WHERE re."revenue_value" > 0
ON CONFLICT ("revenue_id") DO NOTHING;

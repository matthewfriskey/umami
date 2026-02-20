ALTER TABLE "session"
ADD COLUMN "is_ignored" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "session_website_id_is_ignored_idx"
ON "session"("website_id", "is_ignored");

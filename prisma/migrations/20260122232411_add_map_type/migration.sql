-- AlterTable
ALTER TABLE "link" ADD COLUMN     "map_type" VARCHAR(16) NOT NULL DEFAULT 'world';

-- AlterTable
ALTER TABLE "pixel" ADD COLUMN     "map_type" VARCHAR(16) NOT NULL DEFAULT 'world';

-- AlterTable
ALTER TABLE "website" ADD COLUMN     "map_type" VARCHAR(16) NOT NULL DEFAULT 'world';

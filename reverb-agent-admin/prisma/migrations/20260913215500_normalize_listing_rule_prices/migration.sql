-- Listing rules were previously written directly from the dollar-value form.
-- Convert those legacy values to the integer-cent representation used by the
-- deterministic offer engine. Seed/demo values already used large cent values.
UPDATE "ListingRule"
SET "floorPrice" = "floorPrice" * 100,
    "targetPrice" = "targetPrice" * 100
WHERE "floorPrice" < 10000
  AND "targetPrice" < 10000;

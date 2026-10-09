-- =========================================================
-- PETMARKET SAFE INITIAL MIGRATION
-- Existing users table is NOT modified.
-- =========================================================


-- =========================================================
-- ENUMS
-- =========================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'listing_status'
    ) THEN
        CREATE TYPE "listing_status" AS ENUM (
            'PENDING_REVIEW',
            'ACTIVE',
            'REJECTED',
            'SOLD',
            'ARCHIVED'
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'seller_verification_status'
    ) THEN
        CREATE TYPE "seller_verification_status" AS ENUM (
            'PENDING',
            'APPROVED',
            'REJECTED'
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'transaction_status'
    ) THEN
        CREATE TYPE "transaction_status" AS ENUM (
            'PENDING',
            'PAID',
            'FAILED',
            'REFUNDED'
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'report_status'
    ) THEN
        CREATE TYPE "report_status" AS ENUM (
            'OPEN',
            'RESOLVED',
            'DISMISSED'
        );
    END IF;
END
$$;


-- =========================================================
-- SELLER PROFILES
-- =========================================================

CREATE TABLE IF NOT EXISTS "seller_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" INTEGER NOT NULL,
    "display_name" VARCHAR(150),
    "bio" TEXT,
    "city" VARCHAR(100),
    "district" VARCHAR(100),
    "verification_status" "seller_verification_status"
        NOT NULL DEFAULT 'PENDING',
    "approved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seller_profiles_pkey"
        PRIMARY KEY ("id"),

    CONSTRAINT "seller_profiles_user_id_key"
        UNIQUE ("user_id")
);


-- =========================================================
-- ANIMAL CATEGORIES
-- =========================================================

CREATE TABLE IF NOT EXISTS "animal_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "animal_categories_pkey"
        PRIMARY KEY ("id"),

    CONSTRAINT "animal_categories_name_key"
        UNIQUE ("name"),

    CONSTRAINT "animal_categories_slug_key"
        UNIQUE ("slug")
);

CREATE INDEX IF NOT EXISTS
"animal_categories_is_active_idx"
ON "animal_categories" ("is_active");


-- =========================================================
-- ANIMAL BREEDS
-- =========================================================

CREATE TABLE IF NOT EXISTS "animal_breeds" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "animal_breeds_pkey"
        PRIMARY KEY ("id"),

    CONSTRAINT "animal_breeds_category_id_name_key"
        UNIQUE ("category_id", "name"),

    CONSTRAINT "animal_breeds_category_id_slug_key"
        UNIQUE ("category_id", "slug")
);

CREATE INDEX IF NOT EXISTS
"animal_breeds_category_id_idx"
ON "animal_breeds" ("category_id");

CREATE INDEX IF NOT EXISTS
"animal_breeds_is_active_idx"
ON "animal_breeds" ("is_active");


-- =========================================================
-- LISTINGS
-- =========================================================

CREATE TABLE IF NOT EXISTS "listings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "seller_id" INTEGER NOT NULL,
    "category_id" UUID,
    "breed_id" UUID,

    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,

    "price" DECIMAL(12,2),
    "negotiable" BOOLEAN NOT NULL DEFAULT true,

    "gender" VARCHAR(20),
    "age" VARCHAR(50),
    "weight" DECIMAL(8,2),
    "colour" VARCHAR(50),

    "city" VARCHAR(100),
    "area" VARCHAR(150),
    "district" VARCHAR(100),
    "state" VARCHAR(100),

    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),

    "status" "listing_status"
        NOT NULL DEFAULT 'PENDING_REVIEW',

    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listings_pkey"
        PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS
"listings_seller_id_idx"
ON "listings" ("seller_id");

CREATE INDEX IF NOT EXISTS
"listings_category_id_idx"
ON "listings" ("category_id");

CREATE INDEX IF NOT EXISTS
"listings_breed_id_idx"
ON "listings" ("breed_id");

CREATE INDEX IF NOT EXISTS
"listings_status_idx"
ON "listings" ("status");

CREATE INDEX IF NOT EXISTS
"listings_city_idx"
ON "listings" ("city");


-- =========================================================
-- LISTING IMAGES / CLOUDINARY
-- =========================================================

CREATE TABLE IF NOT EXISTS "listing_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,

    "media_url" TEXT NOT NULL,
    "cloudinary_public_id" TEXT,
    "type" VARCHAR(20) NOT NULL DEFAULT 'image',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_images_pkey"
        PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS
"listing_images_listing_id_idx"
ON "listing_images" ("listing_id");


-- =========================================================
-- FAVORITES
-- =========================================================

CREATE TABLE IF NOT EXISTS "favorites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" INTEGER NOT NULL,
    "listing_id" UUID NOT NULL,

    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey"
        PRIMARY KEY ("id"),

    CONSTRAINT "favorites_user_id_listing_id_key"
        UNIQUE ("user_id", "listing_id")
);

CREATE INDEX IF NOT EXISTS
"favorites_user_id_idx"
ON "favorites" ("user_id");

CREATE INDEX IF NOT EXISTS
"favorites_listing_id_idx"
ON "favorites" ("listing_id");


-- =========================================================
-- CONVERSATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS "conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),

    "buyer_id" INTEGER NOT NULL,
    "seller_id" INTEGER NOT NULL,
    "listing_id" UUID,

    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey"
        PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS
"conversations_buyer_id_idx"
ON "conversations" ("buyer_id");

CREATE INDEX IF NOT EXISTS
"conversations_seller_id_idx"
ON "conversations" ("seller_id");

CREATE INDEX IF NOT EXISTS
"conversations_listing_id_idx"
ON "conversations" ("listing_id");


-- =========================================================
-- MESSAGES
-- =========================================================

CREATE TABLE IF NOT EXISTS "messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),

    "conversation_id" UUID NOT NULL,
    "sender_id" INTEGER NOT NULL,

    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,

    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey"
        PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS
"messages_conversation_id_idx"
ON "messages" ("conversation_id");

CREATE INDEX IF NOT EXISTS
"messages_sender_id_idx"
ON "messages" ("sender_id");


-- =========================================================
-- TRANSACTIONS / RAZORPAY
-- =========================================================

CREATE TABLE IF NOT EXISTS "transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),

    "listing_id" UUID NOT NULL,
    "buyer_id" INTEGER NOT NULL,
    "seller_id" INTEGER NOT NULL,

    "animal_price" DECIMAL(12,2) NOT NULL,
    "platform_fee" DECIMAL(12,2),
    "total_amount" DECIMAL(12,2),

    "status" "transaction_status"
        NOT NULL DEFAULT 'PENDING',

    "payment_id" VARCHAR(150),

    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey"
        PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS
"transactions_buyer_id_idx"
ON "transactions" ("buyer_id");

CREATE INDEX IF NOT EXISTS
"transactions_seller_id_idx"
ON "transactions" ("seller_id");

CREATE INDEX IF NOT EXISTS
"transactions_listing_id_idx"
ON "transactions" ("listing_id");

CREATE INDEX IF NOT EXISTS
"transactions_status_idx"
ON "transactions" ("status");


-- =========================================================
-- REVIEWS
-- =========================================================

CREATE TABLE IF NOT EXISTS "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),

    "transaction_id" UUID NOT NULL,
    "reviewer_id" INTEGER NOT NULL,
    "reviewee_id" INTEGER NOT NULL,

    "rating" INTEGER NOT NULL,
    "comment" TEXT,

    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey"
        PRIMARY KEY ("id"),

    CONSTRAINT "reviews_transaction_id_reviewer_id_key"
        UNIQUE ("transaction_id", "reviewer_id")
);

CREATE INDEX IF NOT EXISTS
"reviews_transaction_id_idx"
ON "reviews" ("transaction_id");

CREATE INDEX IF NOT EXISTS
"reviews_reviewer_id_idx"
ON "reviews" ("reviewer_id");

CREATE INDEX IF NOT EXISTS
"reviews_reviewee_id_idx"
ON "reviews" ("reviewee_id");


-- =========================================================
-- REPORTS
-- =========================================================

CREATE TABLE IF NOT EXISTS "reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),

    "reporter_id" INTEGER NOT NULL,
    "reported_user_id" INTEGER,
    "listing_id" UUID,

    "reason" TEXT,

    "status" "report_status"
        NOT NULL DEFAULT 'OPEN',

    "resolved_by" INTEGER,
    "resolved_at" TIMESTAMPTZ(6),

    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey"
        PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS
"reports_reporter_id_idx"
ON "reports" ("reporter_id");

CREATE INDEX IF NOT EXISTS
"reports_reported_user_id_idx"
ON "reports" ("reported_user_id");

CREATE INDEX IF NOT EXISTS
"reports_listing_id_idx"
ON "reports" ("listing_id");

CREATE INDEX IF NOT EXISTS
"reports_status_idx"
ON "reports" ("status");


-- =========================================================
-- NOTIFICATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),

    "user_id" INTEGER NOT NULL,

    "title" VARCHAR(200),
    "message" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,

    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey"
        PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS
"notifications_user_id_idx"
ON "notifications" ("user_id");

CREATE INDEX IF NOT EXISTS
"notifications_is_read_idx"
ON "notifications" ("is_read");


-- =========================================================
-- AUDIT LOGS
-- =========================================================

CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),

    "user_id" INTEGER,

    "action" VARCHAR(100),
    "details" TEXT,

    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey"
        PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS
"audit_logs_user_id_idx"
ON "audit_logs" ("user_id");


-- =========================================================
-- FOREIGN KEYS
-- =========================================================

DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'seller_profiles_user_id_fkey'
    ) THEN
        ALTER TABLE "seller_profiles"
        ADD CONSTRAINT "seller_profiles_user_id_fkey"
        FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'animal_breeds_category_id_fkey'
    ) THEN
        ALTER TABLE "animal_breeds"
        ADD CONSTRAINT "animal_breeds_category_id_fkey"
        FOREIGN KEY ("category_id")
        REFERENCES "animal_categories"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'listings_seller_id_fkey'
    ) THEN
        ALTER TABLE "listings"
        ADD CONSTRAINT "listings_seller_id_fkey"
        FOREIGN KEY ("seller_id")
        REFERENCES "users"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'listings_category_id_fkey'
    ) THEN
        ALTER TABLE "listings"
        ADD CONSTRAINT "listings_category_id_fkey"
        FOREIGN KEY ("category_id")
        REFERENCES "animal_categories"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'listings_breed_id_fkey'
    ) THEN
        ALTER TABLE "listings"
        ADD CONSTRAINT "listings_breed_id_fkey"
        FOREIGN KEY ("breed_id")
        REFERENCES "animal_breeds"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'listing_images_listing_id_fkey'
    ) THEN
        ALTER TABLE "listing_images"
        ADD CONSTRAINT "listing_images_listing_id_fkey"
        FOREIGN KEY ("listing_id")
        REFERENCES "listings"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'favorites_user_id_fkey'
    ) THEN
        ALTER TABLE "favorites"
        ADD CONSTRAINT "favorites_user_id_fkey"
        FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'favorites_listing_id_fkey'
    ) THEN
        ALTER TABLE "favorites"
        ADD CONSTRAINT "favorites_listing_id_fkey"
        FOREIGN KEY ("listing_id")
        REFERENCES "listings"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'conversations_buyer_id_fkey'
    ) THEN
        ALTER TABLE "conversations"
        ADD CONSTRAINT "conversations_buyer_id_fkey"
        FOREIGN KEY ("buyer_id")
        REFERENCES "users"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'conversations_seller_id_fkey'
    ) THEN
        ALTER TABLE "conversations"
        ADD CONSTRAINT "conversations_seller_id_fkey"
        FOREIGN KEY ("seller_id")
        REFERENCES "users"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'conversations_listing_id_fkey'
    ) THEN
        ALTER TABLE "conversations"
        ADD CONSTRAINT "conversations_listing_id_fkey"
        FOREIGN KEY ("listing_id")
        REFERENCES "listings"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'messages_conversation_id_fkey'
    ) THEN
        ALTER TABLE "messages"
        ADD CONSTRAINT "messages_conversation_id_fkey"
        FOREIGN KEY ("conversation_id")
        REFERENCES "conversations"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'messages_sender_id_fkey'
    ) THEN
        ALTER TABLE "messages"
        ADD CONSTRAINT "messages_sender_id_fkey"
        FOREIGN KEY ("sender_id")
        REFERENCES "users"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'transactions_listing_id_fkey'
    ) THEN
        ALTER TABLE "transactions"
        ADD CONSTRAINT "transactions_listing_id_fkey"
        FOREIGN KEY ("listing_id")
        REFERENCES "listings"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'transactions_buyer_id_fkey'
    ) THEN
        ALTER TABLE "transactions"
        ADD CONSTRAINT "transactions_buyer_id_fkey"
        FOREIGN KEY ("buyer_id")
        REFERENCES "users"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'transactions_seller_id_fkey'
    ) THEN
        ALTER TABLE "transactions"
        ADD CONSTRAINT "transactions_seller_id_fkey"
        FOREIGN KEY ("seller_id")
        REFERENCES "users"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'reviews_transaction_id_fkey'
    ) THEN
        ALTER TABLE "reviews"
        ADD CONSTRAINT "reviews_transaction_id_fkey"
        FOREIGN KEY ("transaction_id")
        REFERENCES "transactions"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'reviews_reviewer_id_fkey'
    ) THEN
        ALTER TABLE "reviews"
        ADD CONSTRAINT "reviews_reviewer_id_fkey"
        FOREIGN KEY ("reviewer_id")
        REFERENCES "users"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'reviews_reviewee_id_fkey'
    ) THEN
        ALTER TABLE "reviews"
        ADD CONSTRAINT "reviews_reviewee_id_fkey"
        FOREIGN KEY ("reviewee_id")
        REFERENCES "users"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'reports_reporter_id_fkey'
    ) THEN
        ALTER TABLE "reports"
        ADD CONSTRAINT "reports_reporter_id_fkey"
        FOREIGN KEY ("reporter_id")
        REFERENCES "users"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'reports_reported_user_id_fkey'
    ) THEN
        ALTER TABLE "reports"
        ADD CONSTRAINT "reports_reported_user_id_fkey"
        FOREIGN KEY ("reported_user_id")
        REFERENCES "users"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'reports_resolved_by_fkey'
    ) THEN
        ALTER TABLE "reports"
        ADD CONSTRAINT "reports_resolved_by_fkey"
        FOREIGN KEY ("resolved_by")
        REFERENCES "users"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'reports_listing_id_fkey'
    ) THEN
        ALTER TABLE "reports"
        ADD CONSTRAINT "reports_listing_id_fkey"
        FOREIGN KEY ("listing_id")
        REFERENCES "listings"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'notifications_user_id_fkey'
    ) THEN
        ALTER TABLE "notifications"
        ADD CONSTRAINT "notifications_user_id_fkey"
        FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'audit_logs_user_id_fkey'
    ) THEN
        ALTER TABLE "audit_logs"
        ADD CONSTRAINT "audit_logs_user_id_fkey"
        FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    END IF;

END
$$;
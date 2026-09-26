-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "admin_activity_log" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" VARCHAR(100) NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "session_token" VARCHAR(255) NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "is_valid" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_earnings" (
    "id" INTEGER NOT NULL,
    "driver_id" INTEGER,
    "order_id" INTEGER,
    "amount" DECIMAL(10,2) NOT NULL,
    "commission" DECIMAL(10,2),
    "status" VARCHAR(50) DEFAULT 'pending',
    "paid_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "driver_location_history" (
    "id" INTEGER NOT NULL,
    "driver_id" INTEGER,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "address" TEXT,
    "street" VARCHAR(255),
    "city" VARCHAR(100),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "driver_notifications" (
    "id" SERIAL NOT NULL,
    "driver_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT,
    "type" VARCHAR(50) DEFAULT 'general',
    "is_read" BOOLEAN DEFAULT false,
    "data" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100),
    "phone" VARCHAR(15) NOT NULL,
    "password" VARCHAR(255),
    "vehicle_number" VARCHAR(50),
    "vehicle_type" VARCHAR(50),
    "is_available" BOOLEAN DEFAULT true,
    "current_latitude" DECIMAL(10,8),
    "current_longitude" DECIMAL(11,8),
    "last_location_update" TIMESTAMP(6),
    "fcm_token" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN DEFAULT true,
    "total_deliveries" INTEGER DEFAULT 0,
    "rating" DECIMAL(2,1) DEFAULT 5.0,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "current_address" TEXT,
    "current_city" VARCHAR(100),
    "current_street" VARCHAR(255),
    "push_token" VARCHAR(255),
    "is_on_break" BOOLEAN DEFAULT false,
    "break_started_at" TIMESTAMP(6),
    "total_rating" DECIMAL DEFAULT 5.0,
    "total_ratings_count" INTEGER DEFAULT 0,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "order_number" VARCHAR(50) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "status" VARCHAR(20) DEFAULT 'pending',
    "payment_status" VARCHAR(20) DEFAULT 'pending',
    "payment_id" VARCHAR(100),
    "razorpay_order_id" VARCHAR(100),
    "shipping_address" TEXT,
    "products" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "delivery_latitude" DECIMAL(10,8),
    "delivery_longitude" DECIMAL(11,8),
    "driver_id" INTEGER,
    "estimated_delivery" TIMESTAMP(6),
    "payment_method" VARCHAR(50) DEFAULT 'cod',
    "driver_name" VARCHAR(100),
    "customer_name" VARCHAR(255),
    "customer_email" VARCHAR(255),
    "customer_phone" VARCHAR(20),
    "delivery_fee" DECIMAL(10,2) DEFAULT 0,
    "shipping_full_name" VARCHAR(100),
    "shipping_mobile" VARCHAR(15),
    "shipping_address_line1" TEXT,
    "shipping_address_line2" TEXT,
    "shipping_landmark" VARCHAR(100),
    "shipping_city" VARCHAR(50),
    "shipping_state" VARCHAR(50),
    "shipping_country" VARCHAR(50),
    "shipping_pincode" VARCHAR(10),
    "proof_photo_url" TEXT,
    "delivery_notes" TEXT,
    "reject_reason" TEXT,
    "rejected_at" TIMESTAMP(6),
    "cod_amount" DECIMAL DEFAULT 0,
    "cod_collected" BOOLEAN DEFAULT false,
    "customer_rating" INTEGER,
    "customer_rating_comment" TEXT,
    "rated_at" TIMESTAMP(6),
    "delivery_otp" TEXT
);

-- CreateTable
CREATE TABLE "otps" (
    "id" SERIAL NOT NULL,
    "contact" VARCHAR(255) NOT NULL,
    "type" VARCHAR(20) DEFAULT 'email',
    "otp" VARCHAR(6) NOT NULL,
    "purpose" VARCHAR(20) DEFAULT 'login',
    "is_admin" BOOLEAN DEFAULT false,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "compare_at_price" DECIMAL(10,2),
    "category" VARCHAR(100),
    "sub_category" VARCHAR(100),
    "brand" VARCHAR(100),
    "stock" INTEGER DEFAULT 0,
    "sku" VARCHAR(50),
    "image_url" TEXT,
    "images" TEXT[],
    "rating" DECIMAL(3,2) DEFAULT 0,
    "num_reviews" INTEGER DEFAULT 0,
    "is_featured" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),
    "image_url_2" TEXT,
    "image_url_3" TEXT,
    "compare_price" DECIMAL(10,2),
    "model" VARCHAR(100),
    "warranty" VARCHAR(100),
    "weight" VARCHAR(50),
    "dimensions" VARCHAR(100),
    "material" VARCHAR(100),
    "features" TEXT,
    "review_count" INTEGER DEFAULT 0,
    "tags" TEXT,
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "seo_keywords" TEXT,
    "image_url_4" TEXT,
    "image_url_5" TEXT,
    "has_colors" BOOLEAN DEFAULT false,
    "colors" JSONB DEFAULT '[]',
    "has_sizes" BOOLEAN DEFAULT false,
    "sizes" JSONB DEFAULT '[]',
    "name_ta" TEXT,
    "description_ta" TEXT,
    "name_hi" TEXT,
    "description_hi" TEXT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "two_factor_codes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "code" VARCHAR(6) NOT NULL,
    "purpose" VARCHAR(20) DEFAULT 'admin_login',
    "expires_at" TIMESTAMP(6) NOT NULL,
    "used" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "two_factor_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255),
    "role" VARCHAR(20) DEFAULT 'user',
    "is_active" BOOLEAN DEFAULT true,
    "last_login" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "phone" VARCHAR(20),
    "preferred_language" VARCHAR(10) DEFAULT 'en',
    "full_name" VARCHAR(100),
    "mobile" VARCHAR(15),
    "alternate_mobile" VARCHAR(15),
    "address_line1" TEXT,
    "address_line2" TEXT,
    "landmark" VARCHAR(100),
    "city" VARCHAR(50),
    "district" VARCHAR(50),
    "state" VARCHAR(50),
    "country" VARCHAR(50) DEFAULT 'India',
    "pincode" VARCHAR(10),
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "address_type" VARCHAR(20) DEFAULT 'Home',
    "address_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "is_admin" BOOLEAN DEFAULT false,
    "login_attempts" INTEGER DEFAULT 0,
    "locked_until" TIMESTAMP(6),
    "two_factor_enabled" BOOLEAN DEFAULT false,
    "two_factor_secret" VARCHAR(255),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlists" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "product_id" INTEGER NOT NULL,
    "product_name" VARCHAR(255),
    "product_price" DECIMAL(10,2),
    "product_image" TEXT,
    "added_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_admin_activity_log_user_id" ON "admin_activity_log"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_session_token_key" ON "admin_sessions"("session_token");

-- CreateIndex
CREATE INDEX "idx_admin_sessions_token" ON "admin_sessions"("session_token");

-- CreateIndex
CREATE INDEX "idx_admin_sessions_user_id" ON "admin_sessions"("user_id");

-- CreateIndex
CREATE INDEX "idx_driver_notifications_created_at" ON "driver_notifications"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_driver_notifications_driver_id" ON "driver_notifications"("driver_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "idx_two_factor_codes_user_id" ON "two_factor_codes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_city" ON "users"("city");

-- CreateIndex
CREATE INDEX "idx_users_pincode" ON "users"("pincode");

-- CreateIndex
CREATE INDEX "idx_users_state" ON "users"("state");

-- CreateIndex
CREATE INDEX "idx_wishlists_product_id" ON "wishlists"("product_id");

-- CreateIndex
CREATE INDEX "idx_wishlists_user_id" ON "wishlists"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_user_id_product_id_key" ON "wishlists"("user_id", "product_id");

-- AddForeignKey
ALTER TABLE "admin_activity_log" ADD CONSTRAINT "admin_activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "two_factor_codes" ADD CONSTRAINT "two_factor_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;


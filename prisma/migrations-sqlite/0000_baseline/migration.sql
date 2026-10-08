-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "target_id" TEXT,
    "details" TEXT NOT NULL DEFAULT '{}',
    "created_at" TEXT NOT NULL,
    CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "booking_blackouts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "start_at" TEXT NOT NULL,
    "end_at" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "booking_configuration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "min_notice_hours" INTEGER NOT NULL DEFAULT 24,
    "window_days" INTEGER NOT NULL DEFAULT 90,
    "cancellation_notice_hours" INTEGER NOT NULL DEFAULT 0,
    "cancellation_policy" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "booking_hours" (
    "weekday" INTEGER NOT NULL,
    "start" TEXT NOT NULL,
    "end" TEXT NOT NULL,

    PRIMARY KEY ("weekday", "start")
);

-- CreateTable
CREATE TABLE "booking_outbox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_key" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TEXT NOT NULL,
    "claimed_at" TEXT,
    "sent_at" TEXT,
    "event_type" TEXT NOT NULL DEFAULT '',
    "start_at" TEXT,
    CONSTRAINT "booking_outbox_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "booking_payment_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "booking_services" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "duration_minutes" INTEGER NOT NULL,
    "buffer_minutes" INTEGER NOT NULL,
    "price_ngn" INTEGER,
    "deposit_ngn" INTEGER,
    "active" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "service_id" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "timezone" TEXT NOT NULL,
    "start_at" TEXT NOT NULL,
    "end_at" TEXT NOT NULL,
    "occupied_until" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL,
    "price_ngn" INTEGER NOT NULL,
    "due_ngn" INTEGER NOT NULL,
    "paid_ngn" INTEGER NOT NULL DEFAULT 0,
    "token_hash" TEXT NOT NULL,
    "hold_expires_at" TEXT,
    "payment_reference" TEXT,
    "payment_url" TEXT,
    "payment_init_started_at" TEXT,
    "payment_transaction_id" TEXT,
    "refund_id" TEXT,
    "idempotency_key" TEXT,
    "request_hash" TEXT,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,
    CONSTRAINT "bookings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "booking_services" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "cms_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "slug" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft' CHECK ("status" IN ('draft', 'published')),
    "data" TEXT NOT NULL CHECK (json_valid("data")),
    "published_data" TEXT CHECK ("published_data" IS NULL OR json_valid("published_data")),
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,
    "published_at" TEXT,
    "created_by" TEXT,
    "updated_by" TEXT,
    CONSTRAINT "cms_documents_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "cms_documents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "cms_revisions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "document_id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TEXT NOT NULL,
    CONSTRAINT "cms_revisions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "cms_revisions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "cms_documents" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "inquiries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "organization_name" TEXT NOT NULL DEFAULT '',
    "subject" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL,
    "interest" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'new',
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "storage_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "uploaded_by" TEXT,
    "created_at" TEXT NOT NULL,
    CONSTRAINT "media_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "rate_limits" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "hits" INTEGER NOT NULL,
    "reset_at" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "sessions" (
    "token_hash" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "expires_at" TEXT NOT NULL,
    CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "subscribers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'subscribed',
    "consented_at" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "unsubscribed_at" TEXT,
    "updated_at" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL CHECK ("role" IN ('admin', 'editor')),
    "active" INTEGER NOT NULL DEFAULT 1,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "booking_outbox_event_key_key" ON "booking_outbox"("event_key");

-- CreateIndex
CREATE INDEX "bookings_period" ON "bookings"("start_at", "occupied_until", "status");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_token_hash_key" ON "bookings"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_payment_reference_key" ON "bookings"("payment_reference");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_idempotency_key_key" ON "bookings"("idempotency_key");

-- CreateIndex
CREATE INDEX "cms_public" ON "cms_documents"("type", "status", "published_at");

-- CreateIndex
CREATE UNIQUE INDEX "cms_slug" ON "cms_documents"("type", "slug") WHERE slug IS NOT NULL AND slug != '';

-- CreateIndex
CREATE INDEX "cms_revision_document" ON "cms_revisions"("document_id", "created_at");

-- CreateIndex
CREATE INDEX "inquiries_status" ON "inquiries"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "media_storage_name_key" ON "media"("storage_name");

-- CreateIndex
CREATE INDEX "session_expiry" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "subscribers_status" ON "subscribers"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_email_key" ON "subscribers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

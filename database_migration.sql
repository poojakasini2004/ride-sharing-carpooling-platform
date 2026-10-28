-- =====================================================
-- Database Migration Script
-- Features: Ride Reminders Fix + Review System
-- Date: January 2025
-- =====================================================

-- =====================================================
-- 1. UPDATE BOOKINGS TABLE
-- Add reminder tracking fields and review status fields
-- =====================================================

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS reminder_12h_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS reminder_6h_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS reminder_3h_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS reminder_2h_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS passenger_reviewed BOOLEAN DEFAULT FALSE;

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS driver_reviewed BOOLEAN DEFAULT FALSE;

-- =====================================================
-- 2. UPDATE USERS TABLE
-- Add rating fields for comprehensive rating system
-- =====================================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS total_reviews BIGINT DEFAULT 0;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS driver_rating DOUBLE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS passenger_rating DOUBLE;

-- Note: 'rating' column should already exist for overall rating
-- If not, uncomment the following line:
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS rating DOUBLE DEFAULT 0.0;

-- =====================================================
-- 3. CREATE REVIEWS TABLE
-- Store all reviews from passengers and drivers
-- =====================================================

CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    reviewee_id BIGINT NOT NULL,
    reviewer_type VARCHAR(50) NOT NULL,
    review_type VARCHAR(50) NOT NULL,
    rating INT NOT NULL,
    comment VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_review_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_reviewee FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Check constraints
    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT chk_reviewer_type CHECK (reviewer_type IN ('PASSENGER', 'DRIVER')),
    CONSTRAINT chk_review_type CHECK (review_type IN ('PASSENGER_TO_DRIVER', 'DRIVER_TO_PASSENGER')),
    
    -- Unique constraint to prevent duplicate reviews
    CONSTRAINT uk_booking_reviewer_type UNIQUE (booking_id, reviewer_type)
);

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for finding reviews by reviewee (user being reviewed)
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);

-- Index for finding reviews by reviewer (user giving review)
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);

-- Index for finding reviews by booking
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);

-- Index for finding reviews by type
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_type ON reviews(reviewer_type);

-- Index for booking status queries (for reminders)
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Composite index for reminder queries
CREATE INDEX IF NOT EXISTS idx_bookings_status_reminders ON bookings(status, reminder_24h_sent, reminder_12h_sent, reminder_6h_sent, reminder_3h_sent, reminder_2h_sent);

-- =====================================================
-- 5. DATA VERIFICATION QUERIES
-- Run these to verify migration success
-- =====================================================

-- Check bookings table structure
-- SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'bookings' 
-- AND COLUMN_NAME LIKE '%reminder%' OR COLUMN_NAME LIKE '%reviewed%';

-- Check users table structure
-- SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'users' 
-- AND COLUMN_NAME LIKE '%rating%' OR COLUMN_NAME = 'total_reviews';

-- Check reviews table exists
-- SELECT COUNT(*) as reviews_table_exists 
-- FROM INFORMATION_SCHEMA.TABLES 
-- WHERE TABLE_NAME = 'reviews';

-- =====================================================
-- 6. SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Uncomment to insert sample reviews for testing
/*
-- Assuming you have existing bookings with IDs 1, 2, 3
-- And users with IDs 1 (passenger), 2 (driver)

INSERT INTO reviews (booking_id, reviewer_id, reviewee_id, reviewer_type, rating, comment)
VALUES 
(1, 1, 2, 'PASSENGER', 5, 'Excellent driver! Very professional and safe.'),
(1, 2, 1, 'DRIVER', 4, 'Good passenger, on time and respectful.'),
(2, 1, 2, 'PASSENGER', 4, 'Good ride, minor delay but overall good experience.'),
(3, 3, 2, 'PASSENGER', 5, 'Amazing driver! Highly recommend.');

-- Update user ratings based on sample reviews
UPDATE users SET 
    rating = 4.67,
    total_reviews = 3,
    driver_rating = 4.67
WHERE id = 2;

UPDATE users SET 
    rating = 4.0,
    total_reviews = 1,
    passenger_rating = 4.0
WHERE id = 1;
*/

-- =====================================================
-- 7. ROLLBACK SCRIPT (USE WITH CAUTION)
-- =====================================================

-- Uncomment to rollback changes (WARNING: This will delete data!)
/*
-- Drop reviews table
DROP TABLE IF EXISTS reviews;

-- Remove columns from bookings
ALTER TABLE bookings DROP COLUMN IF EXISTS reminder_24h_sent;
ALTER TABLE bookings DROP COLUMN IF EXISTS reminder_12h_sent;
ALTER TABLE bookings DROP COLUMN IF EXISTS reminder_6h_sent;
ALTER TABLE bookings DROP COLUMN IF EXISTS reminder_3h_sent;
ALTER TABLE bookings DROP COLUMN IF EXISTS reminder_2h_sent;
ALTER TABLE bookings DROP COLUMN IF EXISTS passenger_reviewed;
ALTER TABLE bookings DROP COLUMN IF EXISTS driver_reviewed;

-- Remove columns from users
ALTER TABLE users DROP COLUMN IF EXISTS total_reviews;
ALTER TABLE users DROP COLUMN IF EXISTS driver_rating;
ALTER TABLE users DROP COLUMN IF EXISTS passenger_rating;
*/

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

SELECT 'Database migration completed successfully!' as status;

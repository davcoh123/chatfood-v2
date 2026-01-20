-- Allow public review submissions
-- This policy allows anyone to INSERT reviews (for public review forms)
-- But they still cannot SELECT, UPDATE, or DELETE reviews

-- Drop the overly restrictive policy that blocks all anonymous access
DROP POLICY IF EXISTS "Block anonymous access to order reviews" ON public.order_reviews;

-- Allow anyone to insert reviews (for public review forms on /r/[slug] pages)
CREATE POLICY "Allow public review submissions"
ON public.order_reviews
FOR INSERT
WITH CHECK (true);

-- Note: The existing "Users can view their own reviews" and "Admins can view all reviews"
-- policies already handle SELECT access for authenticated users

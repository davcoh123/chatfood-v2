-- Add first_name and last_name columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Add constraints for reasonable length limits
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_first_name_length CHECK (length(first_name) <= 50),
ADD CONSTRAINT profiles_last_name_length CHECK (length(last_name) <= 50),
ADD CONSTRAINT profiles_email_length CHECK (length(email) <= 255);

-- Update the handle_new_user function to include first_name and last_name from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
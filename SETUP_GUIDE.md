# Setup Guide for Custom Chatbots App

Follow these steps carefully to get your app running.

## Step 1: Sign Up for Services

1. **Supabase** - https://supabase.com
   - Create a new project
   - Copy the URL and anon key

2. **xAI (Grok)** - https://x.ai
   - Sign up and get your API key

3. **Stripe** - https://stripe.com
   - Create account (use test mode)
   - Get your secret key and publishable key

4. **Vercel** - https://vercel.com (for deployment)

## Step 2: Configure Supabase

### A. Enable Email Authentication
1. Go to Authentication → Providers
2. Enable Email provider
3. Disable email confirmation (for testing) or configure SMTP

### B. Create Database Tables
1. Go to SQL Editor
2. Click "New Query"
3. Paste and run this SQL:

\`\`\`sql
-- Bots table
CREATE TABLE bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_pic_url TEXT,
  training_data JSONB DEFAULT '[]'::jsonb,
  price_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  stripe_sub_id TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for bots table
CREATE POLICY "Users can view all bots"
  ON bots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own bots"
  ON bots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own bots"
  ON bots FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own bots"
  ON bots FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Policies for subscriptions table
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
\`\`\`

### C. Create Storage Buckets
1. Go to Storage
2. Create new bucket: `bot-pics`
   - Make it **public**
3. Create new bucket: `bot-data`
   - Keep it **private**

### D. Set Storage Policies
For `bot-pics` bucket:
\`\`\`sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'bot-pics');

-- Allow public reads
CREATE POLICY "Allow public reads"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'bot-pics');
\`\`\`

For `bot-data` bucket:
\`\`\`sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'bot-data');

-- Allow users to read their own files
CREATE POLICY "Allow authenticated reads"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'bot-data');
\`\`\`

## Step 3: Set Up Environment Variables

1. Copy the `.env.local` file in your project
2. Fill in the values:

\`\`\`env
# Supabase (from your Supabase project settings)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Grok API (from xAI)
NEXT_PUBLIC_GROK_API_KEY=your_grok_key_here

# Stripe (from Stripe dashboard)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx (get this in step 4)
\`\`\`

## Step 4: Configure Stripe Webhooks

### For Local Development:
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks:
   \`\`\`bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   \`\`\`
4. Copy the webhook secret and add to `.env.local`

### For Production:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the signing secret to your Vercel environment variables

## Step 5: Run the App

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit http://localhost:3000

## Step 6: Test the App

1. **Sign Up**: Create a test account
2. **Create Bot**:
   - Upload a sample image
   - Upload a text file with some content
3. **View Bot**: Go to "My Bots"
4. **Test Chat**: Click on your bot and start chatting
5. **Test Subscription** (optional):
   - Create another account
   - Try to subscribe to the first account's bot
   - Use Stripe test card: 4242 4242 4242 4242

## Step 7: Deploy to Vercel

1. Push your code to GitHub
2. Go to Vercel → Import Project
3. Select your repository
4. Add all environment variables from `.env.local`
5. Deploy!

## Troubleshooting

### Bot creation fails
- Check Supabase storage buckets are created
- Verify storage policies are set

### Chat doesn't work
- Verify Grok API key is correct
- Check browser console for errors
- Ensure you have access (creator or subscribed)

### Stripe checkout fails
- Make sure webhook is running
- Check Stripe test mode is enabled
- Verify all Stripe keys are correct

### Authentication issues
- Check Supabase URL and keys
- Enable email auth in Supabase
- Verify RLS policies are created

## Need Help?

Check the logs:
- Browser console (F12)
- Supabase logs (Database → Logs)
- Stripe logs (Dashboard → Logs)
- Vercel logs (Deployment → Logs)

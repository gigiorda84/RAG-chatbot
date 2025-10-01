# Custom Chatbots App

A full-stack application for creating and subscribing to custom AI chatbots powered by Grok API.

## Features

- 🔐 **User Authentication** - Secure signup/login with Supabase
- 🤖 **Bot Creation** - Create custom chatbots with training data
- 💬 **AI Chat** - Chat with bots using Grok API
- 💳 **Subscriptions** - Monetize bots with Stripe subscriptions
- 📁 **File Storage** - Upload bot pictures and training data
- 🎨 **Modern UI** - Built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: Grok API (xAI)
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **Hosting**: Vercel

## Setup Instructions

### 1. Prerequisites

- Node.js 20+
- Git
- Accounts: Supabase, xAI, Stripe, Vercel

### 2. Supabase Setup

Run this SQL in your Supabase SQL Editor:

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

-- Enable RLS
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for bots
CREATE POLICY "Users can view all bots" ON bots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create their own bots" ON bots FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update their own bots" ON bots FOR UPDATE TO authenticated USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete their own bots" ON bots FOR DELETE TO authenticated USING (auth.uid() = creator_id);

-- Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create subscriptions" ON subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
\`\`\`

Create storage buckets:
- `bot-pics` (public)
- `bot-data` (private)

### 3. Environment Variables

Copy `.env.local` and fill in your credentials:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GROK_API_KEY=your_grok_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
\`\`\`

### 4. Install and Run

\`\`\`bash
npm install
npm run dev
\`\`\`

Open http://localhost:3000

### 5. Stripe Webhook Setup

For local testing:
\`\`\`bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
\`\`\`

For production, add webhook endpoint in Stripe Dashboard:
- URL: `https://your-domain.vercel.app/api/stripe-webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### 6. Deploy to Vercel

\`\`\`bash
vercel
\`\`\`

Add all environment variables in Vercel dashboard.

## Usage

1. **Sign Up**: Create an account
2. **Create Bot**: Upload a profile picture and training data files
3. **Browse Bots**: View all available bots
4. **Subscribe**: Pay $5/month to chat with any bot
5. **Chat**: Have conversations with your subscribed bots

## Project Structure

\`\`\`
src/
├── app/
│   ├── api/          # API routes (Stripe)
│   ├── bot/[id]/     # Bot chat page
│   ├── create-bot/   # Bot creation
│   ├── login/        # Login page
│   ├── signup/       # Signup page
│   ├── my-bots/      # User's bots
│   ├── profile/      # User profile
│   └── subscribe/    # Browse bots
├── components/       # React components
├── lib/             # Utilities (Supabase, database)
└── utils/           # Helper functions (upload)
\`\`\`

## Contributing

Pull requests are welcome!

## License

MIT

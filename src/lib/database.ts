import { supabase } from "./supabase";

export type Bot = {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  profile_pic_url: string;
  training_data: string[];
  price_id?: string;
  created_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  bot_id: string;
  stripe_sub_id?: string;
  active: boolean;
  created_at: string;
};

// Bot operations
export async function createBot(bot: {
  name: string;
  description: string;
  creator_id: string;
  profile_pic_url: string;
  training_data: string[];
  price_id?: string;
}) {
  const { data, error } = await supabase
    .from("bots")
    .insert([bot])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserBots(userId: string) {
  const { data, error } = await supabase
    .from("bots")
    .select("*")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Bot[];
}

export async function getAllBots() {
  const { data, error } = await supabase
    .from("bots")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Bot[];
}

export async function getBotById(botId: string) {
  const { data, error } = await supabase
    .from("bots")
    .select("*")
    .eq("id", botId)
    .single();

  if (error) throw error;
  return data as Bot;
}

export async function deleteBot(botId: string) {
  const { error } = await supabase.from("bots").delete().eq("id", botId);

  if (error) throw error;
}

// Subscription operations
export async function createSubscription(subscription: {
  user_id: string;
  bot_id: string;
  stripe_sub_id?: string;
  active: boolean;
}) {
  const { data, error } = await supabase
    .from("subscriptions")
    .insert([subscription])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserSubscriptions(userId: string) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, bots(*)")
    .eq("user_id", userId)
    .eq("active", true);

  if (error) throw error;
  return data;
}

export async function checkSubscription(userId: string, botId: string) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("bot_id", botId)
    .eq("active", true)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned
  return data as Subscription | null;
}

export async function updateSubscription(
  subscriptionId: string,
  updates: Partial<Subscription>
) {
  const { data, error } = await supabase
    .from("subscriptions")
    .update(updates)
    .eq("id", subscriptionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

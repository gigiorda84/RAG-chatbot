import { supabase } from "@/lib/supabase";

export async function uploadBotPicture(file: File, botId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${botId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("bot-pics")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage.from("bot-pics").getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading picture:", error);
    return null;
  }
}

export async function uploadBotData(file: File, botId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${botId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("bot-data")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    return filePath;
  } catch (error) {
    console.error("Error uploading data file:", error);
    return null;
  }
}

export async function getBotDataContent(filePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from("bot-data")
      .download(filePath);

    if (error) throw error;

    const text = await data.text();
    return text;
  } catch (error) {
    console.error("Error downloading data file:", error);
    return null;
  }
}

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

// Server-only — uses the service role key, never expose this client-side.
function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not configured — set them in .env"
    );
  }
  return createClient(url, key);
}

const BUCKET = "product-images";

export async function uploadProductImage(file: File, vendorId: string): Promise<string> {
  const supabase = getSupabase();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${vendorId}/${randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

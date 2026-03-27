import { createClient } from "@supabase/supabase-js";

export const PRODUCT_IMAGE_BUCKET = "product-images";

export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function ensureProductBucket() {
  const supabase = createSupabaseServerClient();

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    throw new Error(`Cannot list buckets: ${listError.message}`);
  }

  const exists = buckets?.some((bucket) => bucket.name === PRODUCT_IMAGE_BUCKET);
  if (exists) {
    return supabase;
  }

  const { error: createError } = await supabase.storage.createBucket(PRODUCT_IMAGE_BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
  });

  if (createError && !/already exists/i.test(createError.message)) {
    throw new Error(`Cannot create bucket: ${createError.message}`);
  }

  return supabase;
}

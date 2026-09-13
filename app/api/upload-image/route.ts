import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return Response.json(
      {
        message:
          "Image uploads are not configured. Add SUPABASE_SERVICE_ROLE_KEY from Supabase Project Settings > API to the server environment, then restart the app.",
      },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const workspaceId = String(formData.get("workspaceId") || "new");

  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return Response.json({ message: "Please upload an image file." }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ message: "Images must be smaller than 10 MB." }, { status: 413 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${userId}/${workspaceId}/${crypto.randomUUID()}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("workspace-images")
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (uploadError) {
    return Response.json({ message: uploadError.message }, { status: 502 });
  }

  const { data, error: signedUrlError } = await supabase.storage
    .from("workspace-images")
    .createSignedUrl(path, 24 * 60 * 60);

  if (signedUrlError || !data?.signedUrl) {
    return Response.json(
      { message: signedUrlError?.message ?? "Could not create image URL." },
      { status: 502 }
    );
  }

  return Response.json({ url: data.signedUrl });
}

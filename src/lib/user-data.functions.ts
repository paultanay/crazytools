import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listFavorites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("favorites")
      .select("tool_slug, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const toggleFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z.object({ toolSlug: z.string().min(1).max(64) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("favorites")
      .select("id")
      .eq("tool_slug", data.toolSlug)
      .maybeSingle();

    if (existing) {
      const { error } = await context.supabase
        .from("favorites")
        .delete()
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { favorited: false };
    }
    const { error } = await context.supabase
      .from("favorites")
      .insert({ tool_slug: data.toolSlug, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { favorited: true };
  });

export const recordToolRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        toolSlug: z.string().min(1).max(64),
        meta: z.record(z.string(), z.unknown()).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("tool_history").insert({
      tool_slug: data.toolSlug,
      user_id: context.userId,
      meta: (data.meta ?? {}) as never,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("tool_history")
      .select("id, tool_slug, ran_at, meta")
      .order("ran_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

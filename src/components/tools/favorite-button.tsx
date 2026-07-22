import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listFavorites, toggleFavorite } from "@/lib/user-data.functions";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

interface Props {
  toolSlug: string;
}

export function FavoriteButton({ toolSlug }: Props) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [busy, setBusy] = useState(false);
  const list = useServerFn(listFavorites);
  const toggle = useServerFn(toggleFavorite);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(async ({ data }) => {
      if (cancelled) return;
      const user = data.user;
      setSignedIn(!!user);
      if (user) {
        try {
          const favs = await list();
          if (!cancelled) setFavorited(favs.some((f) => f.tool_slug === toolSlug));
        } catch {
          /* ignore */
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [toolSlug, list]);

  if (signedIn === false) {
    return (
      <Link
        to="/auth"
        className="mono inline-flex items-center gap-2 rounded-md border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
      >
        <Heart className="h-3 w-3" strokeWidth={1.5} />
        Sign in to save
      </Link>
    );
  }

  return (
    <button
      disabled={busy || signedIn === null}
      onClick={async () => {
        setBusy(true);
        try {
          const res = await toggle({ data: { toolSlug } });
          setFavorited(res.favorited);
          toast.success(res.favorited ? "Added to favorites" : "Removed from favorites");
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Action failed");
        } finally {
          setBusy(false);
        }
      }}
      className={`mono inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-[11px] uppercase tracking-widest transition-colors ${
        favorited
          ? "border-primary/50 bg-primary/10 text-primary"
          : "border-hairline text-muted-foreground hover:text-foreground"
      }`}
    >
      <Heart
        className="h-3 w-3"
        strokeWidth={1.5}
        fill={favorited ? "currentColor" : "none"}
      />
      {favorited ? "Saved" : "Save"}
    </button>
  );
}

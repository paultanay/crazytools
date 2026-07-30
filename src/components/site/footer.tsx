import { Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/tools/catalog";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-16 hairline-t">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Free browser-based tools. Nothing leaves your machine.
            </p>
          </div>
          <FooterColumn title="Categories">
            {CATEGORIES.slice(0, 5).map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {c.name}
              </Link>
            ))}
          </FooterColumn>
          <FooterColumn title="Product">
            <Link to="/tools" className="text-sm text-muted-foreground hover:text-foreground">
              All tools
            </Link>
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
          </FooterColumn>
          <FooterColumn title="Company">
            <span className="text-sm text-muted-foreground">Privacy</span>
            <span className="text-sm text-muted-foreground">Terms</span>
            <span className="text-sm text-muted-foreground">Contact</span>
          </FooterColumn>
        </div>
        <div className="hairline-t mt-10 flex flex-col items-start justify-between gap-2 pt-6 sm:flex-row sm:items-center">
          <p className="mono text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} Crazy Tools
          </p>
          <p className="mono text-[11px] text-muted-foreground">Runs locally · No sign-up</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mono mb-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {title}
      </p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

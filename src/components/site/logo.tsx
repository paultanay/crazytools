import { Link } from "@tanstack/react-router";
import { Wrench } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label="CrazyTools home"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
        <Wrench className="h-4 w-4" strokeWidth={2} />
      </span>
      <span className="text-[15px] font-semibold tracking-tight">Crazy Tools</span>
    </Link>
  );
}

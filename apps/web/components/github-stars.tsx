import Link from "next/link";
import { GitHubIcon, StarIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export function GitHubStars() {
  return (
    <Button asChild variant="secondary" size="sm" className="gap-2">
      <Link
        href="https://github.com/ameyalambat128/token-receipt"
        target="_blank"
        rel="noopener noreferrer"
      >
        <GitHubIcon size={18} />
        <StarIcon size={14} className="text-yellow-500" />
        <span>GitHub</span>
      </Link>
    </Button>
  );
}

import Link from "next/link";
import { GitHubIcon, StarIcon } from "@/components/icons";

export function GitHubStars() {
  return (
    <Link
      href="https://github.com/ameyalambat128/token-receipt"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center space-x-1.5 text-sm text-gray-400 transition-colors hover:text-white"
    >
      <GitHubIcon size={18} />
      <StarIcon size={14} className="text-yellow-500" />
      <span>GitHub</span>
    </Link>
  );
}

import Link from "next/link";
import { Download } from "lucide-react";
import { GitHubIcon, StarIcon } from "@/components/icons";
import { formatCompactCount, getGitHubMetrics } from "@/lib/github-metrics";

export async function GitHubMetricsStrip() {
  const { repoUrl, stars, downloads } = await getGitHubMetrics();

  if (typeof stars !== "number") {
    return (
      <Link
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open Token Receipt on GitHub"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-gray-400 transition-all duration-150 ease-out hover:-translate-y-px hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
      >
        <GitHubIcon size={18} />
      </Link>
    );
  }

  const metrics = [
    {
      label: "GitHub stars",
      icon: <StarIcon size={14} className="text-yellow-500" />,
      value: formatCompactCount(stars),
    },
    ...(typeof downloads === "number"
      ? [
          {
            label: "Runtime downloads",
            icon: (
              <Download
                size={14}
                strokeWidth={2.1}
                className="text-emerald-400"
              />
            ),
            value: formatCompactCount(downloads),
          },
        ]
      : []),
  ];

  const summary = metrics
    .map((metric) => `${metric.label}: ${metric.value}`)
    .join(", ");

  return (
    <Link
      href={repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open Token Receipt on GitHub. ${summary}`}
      className="group inline-flex shrink-0 items-center gap-3 text-[1.08rem] text-gray-400 transition-all duration-150 ease-out hover:-translate-y-px hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 sm:gap-3.5"
    >
      <span className="inline-flex h-10 items-center justify-center">
        <GitHubIcon size={18} />
      </span>

      {metrics.map((metric) => (
        <span
          key={metric.label}
          className="inline-flex h-10 items-center gap-1.5"
        >
          <span className="transition-transform duration-150 ease-out group-hover:scale-[1.06]">
            {metric.icon}
          </span>
          <span className="font-medium tabular-nums tracking-[0.01em] text-gray-200 transition-colors duration-150 ease-out group-hover:text-white">
            {metric.value}
          </span>
        </span>
      ))}
    </Link>
  );
}

"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

const proofCards = [
  {
    title: "Released",
    detail: "v0.1.0 live on GitHub Releases",
    accent: "bg-emerald-400",
  },
  {
    title: "Install path tested",
    detail: "npx skills add ameyalambat128/token-receipt --skill token-receipt",
    accent: "bg-sky-400",
  },
  {
    title: "Local smoke test passed",
    detail: "Installed skill generated receipt.png, x.txt, and linkedin.txt",
    accent: "bg-amber-300",
  },
];

const sampleLines = [
  "Context window emotional support",
  "MCP tool tourism",
  "Repeated shell confidence loops",
];

export function ProofStrip() {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.16 },
        },
      }
    : {
        hidden: { opacity: 0, y: 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.48,
            ease: [0.16, 1, 0.3, 1],
            staggerChildren: 0.09,
          },
        },
      };

  const cardVariants: Variants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.12 } },
      }
    : {
        hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
        },
      };

  const lineVariants: Variants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.08 } },
      }
    : {
        hidden: { opacity: 0, x: -12 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] },
        },
      };

  const shimmerTransition = prefersReducedMotion
    ? undefined
    : {
        duration: 2.8,
        ease: "linear" as const,
        repeat: Number.POSITIVE_INFINITY,
      };

  return (
    <motion.section
      className="mt-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      variants={containerVariants}
      aria-label="Release and test proof"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
          Shipped and tested
        </p>
        <div className="h-px flex-1 bg-neutral-800" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.95fr]">
        <div className="grid gap-3 sm:grid-cols-3">
          {proofCards.map((card) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : {
                      y: -4,
                      borderColor: "rgba(245, 245, 245, 0.18)",
                      boxShadow: "0 18px 40px rgba(0, 0, 0, 0.18)",
                    }
              }
              className="rounded-2xl border border-neutral-800 bg-neutral-950/75 p-4 ring-1 ring-neutral-900 transition-colors"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/90 px-2.5 py-1">
                <span className={`h-2 w-2 rounded-full ${card.accent}`} />
                <span className="text-[11px] uppercase tracking-[0.22em] text-neutral-400">
                  {card.title}
                </span>
              </div>
              <p className="font-mono text-[13px] leading-6 text-neutral-300">
                {card.detail}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={cardVariants}
          whileHover={
            prefersReducedMotion
              ? undefined
              : {
                  y: -5,
                  rotate: -0.2,
                  boxShadow: "0 22px 50px rgba(40, 28, 15, 0.22)",
                }
          }
          className="relative overflow-hidden rounded-[28px] border border-[#d5c8b3] bg-[#f3eadc] p-5 text-[#2a241d] shadow-[0_20px_50px_rgba(15,15,15,0.22)]"
        >
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={prefersReducedMotion ? undefined : { x: ["-10%", "180%"] }}
            transition={shimmerTransition}
          />

          <div className="relative z-10">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#7a6d5f]">
                  Sample receipt moment
                </p>
                <h3 className="mt-2 font-mono text-lg tracking-tight">
                  Your monthly AI bill
                </h3>
                <p className="font-mono text-xs text-[#7a6d5f]">
                  officially itemized
                </p>
              </div>
              <div className="rounded-full border border-[#d5c8b3] bg-[#efe3d2] px-3 py-1 font-mono text-[11px] text-[#7a6d5f]">
                fake but familiar
              </div>
            </div>

            <motion.div
              className="space-y-3 border-y border-dashed border-[#d5c8b3] py-4"
              variants={containerVariants}
            >
              {sampleLines.map((line, index) => (
                <motion.div
                  key={line}
                  variants={lineVariants}
                  transition={
                    prefersReducedMotion
                      ? undefined
                      : {
                          duration: 0.26,
                          delay: 0.18 + index * 0.09,
                          ease: [0.16, 1, 0.3, 1],
                        }
                  }
                  className="flex items-center justify-between gap-3 font-mono text-[13px]"
                >
                  <span>{line}</span>
                  <span className="text-[#8e453f]">
                    ${["2,488", "941", "422"][index]}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={lineVariants}
              transition={
                prefersReducedMotion
                  ? undefined
                  : {
                      duration: 0.3,
                      delay: 0.46,
                      ease: [0.16, 1, 0.3, 1],
                    }
              }
              className="mt-4 flex items-end justify-between gap-4"
            >
              <div>
                <p className="font-mono text-xs text-[#7a6d5f]">Total</p>
                <p className="font-mono text-3xl tracking-tight">$4,208.17</p>
              </div>
              <p className="max-w-[11rem] text-right font-mono text-[11px] leading-5 text-[#7a6d5f]">
                satirical estimate based on local agent logs
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

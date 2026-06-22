"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

const receiptRows = [
  { qty: "01", item: "Actual useful LLM work", amount: "$781" },
  { qty: "02", item: "Context window emotional support", amount: "$2,488" },
  { qty: "03", item: "MCP tool tourism", amount: "$0.94" },
  { qty: "++", item: "3 more low-signal habits skipped", amount: "" },
];

const statRows = [
  { label: "Sessions", value: "184" },
  { label: "Tool calls", value: "612" },
  { label: "Tokens burned", value: "1.92M" },
  { label: "Longest streak", value: "6 days" },
];

const detailRows = [
  { label: "Avoidable waste", value: "$3,427" },
  { label: "Useful work", value: "$781" },
];

export function ReceiptPreview() {
  const prefersReducedMotion = useReducedMotion();

  const sectionVariants: Variants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.16 } },
      }
    : {
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.52,
            ease: [0.16, 1, 0.3, 1],
            staggerChildren: 0.07,
          },
        },
      };

  const itemVariants: Variants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.12 } },
      }
    : {
        hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] },
        },
      };

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[32rem]"
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      aria-label="Example receipt"
    >
      <div className="pointer-events-none absolute inset-x-8 top-5 h-24 rounded-full bg-white/8 blur-3xl" />

      <div
        className="relative overflow-hidden"
        style={{
          maxHeight: "820px",
          maskImage: "linear-gradient(to bottom, black 88%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 88%, transparent 100%)",
        }}
      >
        <motion.div
          whileHover={prefersReducedMotion ? undefined : { y: -6 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[2rem] border border-stone-300/70 bg-[#f5f1e8] px-4 pb-8 pt-7 text-[#1f1b17] shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:px-6"
          style={{
            backgroundImage: [
              "linear-gradient(180deg, rgba(255,252,247,0.9), rgba(245,239,231,0.8))",
              "linear-gradient(180deg, rgba(255,255,255,0.18), transparent 18%, rgba(120,106,89,0.06) 84%, rgba(255,255,255,0.1))",
              "url('/wrinkled-receipt-paper.jpg')",
            ].join(", "),
            backgroundBlendMode: "screen, multiply, normal",
            backgroundPosition: "center, center, center",
            backgroundSize: "cover, cover, cover",
          }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-45 mix-blend-soft-light">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.42),transparent_32%,rgba(113,95,74,0.08)_66%,rgba(255,255,255,0.22))]" />
            <div className="absolute left-[12%] top-[18%] h-40 w-40 rounded-full bg-white/30 blur-3xl" />
            <div className="absolute right-[10%] top-[30%] h-44 w-44 rounded-full bg-stone-300/30 blur-3xl" />
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-[radial-gradient(circle_at_10px_0px,transparent_0_8px,#f5f1e8_8.5px)] bg-[length:22px_16px] bg-repeat-x opacity-80" />

          <div className="relative z-10 font-mono">
            <motion.div variants={itemVariants} className="text-center">
              <p className="text-[2.45rem] font-semibold uppercase tracking-[-0.06em] sm:text-[2.55rem]">
                Token Receipt
              </p>
              <p className="mt-2 text-[0.92rem] uppercase tracking-[0.24em] text-stone-600 sm:text-[0.95rem]">
                Officially Itemized
              </p>
              <p className="mt-3 text-[0.72rem] uppercase tracking-[0.18em] text-stone-500 sm:text-[0.78rem]">
                Codex + Claude Code + Cursor<sup>*</sup>
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-8 space-y-1 text-[0.88rem] leading-6 sm:text-[0.95rem]"
            >
              <p>ORDER #0001 FOR AMEYA</p>
              <p>184 SESSIONS FROM MAY 10 TO JUNE 8</p>
              <p>GENERATED MONDAY, JUNE 8, 2026</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-5 border-y border-dashed border-stone-500/70 py-2 text-[0.82rem] sm:text-[0.92rem]"
            >
              <div className="grid grid-cols-[2rem_minmax(0,1fr)_4.8rem] gap-3 sm:grid-cols-[2.6rem_minmax(0,1fr)_5.1rem]">
                <span>QTY</span>
                <span>ITEM</span>
                <span className="text-right">AMT</span>
              </div>
            </motion.div>

            <div className="mt-2 space-y-2.5 text-[0.82rem] leading-6 sm:text-[0.92rem]">
              {receiptRows.map((row) => (
                <motion.div
                  key={row.item}
                  variants={itemVariants}
                  className={`grid grid-cols-[2rem_minmax(0,1fr)_4.8rem] gap-3 sm:grid-cols-[2.6rem_minmax(0,1fr)_5.1rem] ${row.qty === "++" ? "text-stone-500" : ""}`}
                >
                  <span>{row.qty}</span>
                  <span className="pr-2">{row.item}</span>
                  <span className="text-right">{row.amount}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              variants={itemVariants}
              className="mt-5 border-y border-dashed border-stone-500/70 py-3 text-[0.82rem] leading-6 sm:text-[0.92rem]"
            >
              {statRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4"
                >
                  <span>{row.label}:</span>
                  <span>{row.value}</span>
                </div>
              ))}
              <div className="mt-3 flex items-center justify-between gap-4 border-t border-dashed border-stone-500/70 pt-3 text-[1.5rem] font-semibold tracking-[-0.04em] sm:text-[1.7rem]">
                <span>TOTAL:</span>
                <span>$4,208</span>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-4 space-y-1 text-[0.82rem] leading-6 sm:text-[0.92rem]"
            >
              {detailRows.map((row) => (
                <p
                  key={row.label}
                  className="flex items-center justify-between gap-4"
                >
                  <span>{row.label}:</span>
                  <span>{row.value}</span>
                </p>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8 text-center">
              <p className="text-[1rem] uppercase tracking-[0.06em]">
                THANK YOU FOR PROMPTING
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

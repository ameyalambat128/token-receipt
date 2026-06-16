"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

const receiptRows = [
  { qty: "01", item: "Context window emotional support", amount: "$2,488" },
  { qty: "02", item: "MCP tool tourism", amount: "$941" },
  { qty: "03", item: "Repeated shell confidence loops", amount: "$422" },
  { qty: "04", item: "Docs tab multiplication", amount: "$203" },
  { qty: "05", item: "One more quick refactor", amount: "$96" },
  { qty: "06", item: "Agent handoff drama", amount: "$58" },
];

const statRows = [
  { label: "Prompt count", value: "184" },
  { label: "Tool calls", value: "612" },
  { label: "Tokens burned", value: "1.92M" },
  { label: "Peak spiral", value: "2:14 AM" },
];

const activityGraph = [
  [0, 0, 0, 1, 0, 0, 0],
  [0, 1, 0, 2, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
  [0, 0, 2, 3, 1, 0, 0],
  [0, 1, 3, 2, 1, 0, 0],
  [0, 0, 0, 2, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 0],
  [0, 2, 3, 3, 2, 0, 0],
  [0, 1, 2, 4, 1, 0, 0],
  [0, 1, 3, 2, 2, 1, 0],
  [0, 0, 2, 2, 3, 1, 0],
  [1, 2, 2, 3, 2, 1, 0],
  [0, 1, 3, 2, 2, 0, 0],
  [0, 0, 2, 4, 2, 1, 0],
  [1, 2, 2, 3, 1, 1, 0],
  [0, 1, 3, 2, 1, 0, 0],
];

const activityCellOpacity = ["0.14", "0.34", "0.52", "0.74", "0.96"];

export function ProofStrip() {
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
            staggerChildren: 0.08,
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
    <motion.section
      className="mt-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={sectionVariants}
      aria-label="Example receipt"
    >
      <motion.div variants={itemVariants} className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
          Example output
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="relative mx-auto w-full max-w-[34rem] px-2 sm:px-0"
      >
        <div className="pointer-events-none absolute inset-x-8 top-5 h-24 rounded-full bg-white/8 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-10 -bottom-6 h-16 rounded-full bg-black/35 blur-2xl" />

        <motion.div
          whileHover={
            prefersReducedMotion
              ? undefined
              : {
                  y: -8,
                  rotate: -1.2,
                  transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
                }
          }
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
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 rotate-180 bg-[radial-gradient(circle_at_10px_0px,transparent_0_8px,#f5f1e8_8.5px)] bg-[length:22px_16px] bg-repeat-x opacity-80" />

          <div className="relative z-10 font-mono">
            <motion.div variants={itemVariants} className="text-center">
              <p className="text-[2.45rem] font-semibold uppercase tracking-[-0.06em] sm:text-[2.55rem]">
                TOKEN RECEIPT
              </p>
              <p className="mt-2 text-[0.92rem] uppercase tracking-[0.24em] text-stone-600 sm:text-[0.95rem]">
                Last 30 Days
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-8 space-y-1 text-[0.88rem] leading-6 sm:text-[0.95rem]"
            >
              <p>ORDER #0001 FOR AMEYA</p>
              <p>MONDAY, JUNE 8, 2026</p>
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
                  className="grid grid-cols-[2rem_minmax(0,1fr)_4.8rem] gap-3 sm:grid-cols-[2.6rem_minmax(0,1fr)_5.1rem]"
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
              <div className="mt-2 flex items-center justify-between gap-4 text-[0.98rem] sm:text-[1.05rem]">
                <span>TOTAL:</span>
                <span>$4,208</span>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-4 space-y-1 text-[0.82rem] leading-6 sm:text-[0.92rem]"
            >
              <p>CARD: **** **** **** 2026</p>
              <p>AUTH CODE: 612184</p>
              <p>CARDHOLDER: AMEYA</p>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8 text-center">
              <p className="text-[1rem] uppercase tracking-[0.06em]">
                THANK YOU FOR PROMPTING
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mx-auto mt-7 flex w-full max-w-[14.5rem] flex-col items-center px-1 sm:max-w-[16.5rem] sm:px-0"
            >
              <div className="mb-3 flex w-full items-center justify-between gap-3 text-[0.76rem] uppercase tracking-[0.2em] text-stone-700">
                <span>Got Helped</span>
                <span>Last 30d</span>
              </div>
              <div
                className="flex items-end gap-[3px] sm:gap-[4px]"
                aria-hidden="true"
              >
                {activityGraph.map((column, columnIndex) => (
                  <div
                    key={columnIndex}
                    className="grid gap-[3px] sm:gap-[4px]"
                  >
                    {column.map((value, rowIndex) => (
                      <span
                        key={`${columnIndex}-${rowIndex}`}
                        className="block h-[8px] w-[8px] rounded-[2px] bg-black sm:h-[10px] sm:w-[10px]"
                        style={{ opacity: activityCellOpacity[value] }}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex w-full items-center justify-between text-[0.72rem] uppercase tracking-[0.18em] text-stone-500">
                <span>May</span>
                <span>Jun</span>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-4 text-center text-[0.82rem] leading-5 text-stone-500"
            >
              <p className="uppercase tracking-[0.22em]">
                sample agentic usage stats
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

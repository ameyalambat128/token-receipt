#!/usr/bin/env bun

import { join } from "node:path";
import { writeFileSync, readFileSync } from "node:fs";
import {
  analyzeLogs,
  doctor,
  parseArgs,
  writeAnalysis,
  type Analysis,
} from "@token-receipt/core";
import { renderReceiptPng } from "@token-receipt/render";
import { runtimeVersion } from "./version.js";

const argv = process.argv.slice(2);

if (argv[0] === "version" || argv[0] === "--version" || argv[0] === "-v") {
  console.log(runtimeVersion);
  process.exit(0);
}

const { command, options } = parseArgs(argv);

try {
  if (command === "doctor") {
    console.log(JSON.stringify(doctor(options), null, 2));
    process.exit(0);
  }

  if (command === "analyze") {
    const analysis = analyzeLogs(options);
    writeAnalysis(analysis, options.outDir);
    console.log(
      JSON.stringify(
        { outDir: options.outDir, analysis: "analysis.json" },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  if (command === "render") {
    const analysis = JSON.parse(
      readFileSync(join(options.outDir, "analysis.json"), "utf8"),
    ) as Analysis;
    await writeOutputs(analysis, options.outDir);
    process.exit(0);
  }

  if (command === "generate") {
    const analysis = analyzeLogs(options);
    writeAnalysis(analysis, options.outDir);
    await writeOutputs(analysis, options.outDir);
    console.log(
      JSON.stringify(
        {
          outDir: options.outDir,
          receipt: join(options.outDir, "receipt.png"),
          x: join(options.outDir, "share", "x.txt"),
          linkedin: join(options.outDir, "share", "linkedin.txt"),
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  throw new Error(`Unknown command: ${command}`);
} catch (error) {
  console.error(
    JSON.stringify(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

async function writeOutputs(analysis: Analysis, outDir: string) {
  const png = await renderReceiptPng(analysis.receipt);
  writeFileSync(join(outDir, "receipt.png"), png);
}

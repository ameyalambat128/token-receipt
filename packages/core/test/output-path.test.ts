import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defaultOptions, parseArgs } from "../src/index";

const envKeys = [
  "HOME",
  "INIT_CWD",
  "PWD",
  "TOKEN_RECEIPT_APP_SUPPORT_DIR",
  "TOKEN_RECEIPT_RUN_ID",
] as const;

const savedEnv = Object.fromEntries(
  envKeys.map((key) => [key, process.env[key]]),
) as Record<(typeof envKeys)[number], string | undefined>;

afterEach(() => {
  envKeys.forEach((key) => restoreEnv(key, savedEnv[key]));
});

describe("output path defaults", () => {
  test("uses repo-local output inside a git worktree", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "token-receipt-out-repo-"));
    const workDir = join(tempRoot, "repo", "packages", "core");

    try {
      mkdirSync(join(tempRoot, "repo", ".git"), { recursive: true });
      mkdirSync(workDir, { recursive: true });

      process.env.HOME = tempRoot;
      process.env.INIT_CWD = workDir;
      process.env.PWD = workDir;

      expect(defaultOptions().outDir).toBe(
        join(workDir, "token-receipt-output"),
      );
      expect(parseArgs(["generate"]).options.outDir).toBe(
        join(workDir, "token-receipt-output"),
      );
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  test("uses app-managed run storage outside a git worktree", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "token-receipt-out-global-"));
    const workDir = join(tempRoot, "scratch");
    const appSupportDir = join(tempRoot, "app-support");

    try {
      mkdirSync(workDir, { recursive: true });

      process.env.HOME = tempRoot;
      process.env.INIT_CWD = workDir;
      process.env.PWD = workDir;
      process.env.TOKEN_RECEIPT_APP_SUPPORT_DIR = appSupportDir;
      process.env.TOKEN_RECEIPT_RUN_ID = "2026-06-21T14-32-10Z";

      expect(defaultOptions().outDir).toBe(
        join(appSupportDir, "runs", "2026-06-21T14-32-10Z"),
      );
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  test("treats agent skill directories as global output roots", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "token-receipt-out-skill-"));
    const skillDir = join(tempRoot, ".claude", "skills", "token-receipt");
    const appSupportDir = join(tempRoot, "app-support");

    try {
      mkdirSync(join(skillDir, ".git"), { recursive: true });

      process.env.HOME = tempRoot;
      process.env.INIT_CWD = skillDir;
      process.env.PWD = skillDir;
      process.env.TOKEN_RECEIPT_APP_SUPPORT_DIR = appSupportDir;
      process.env.TOKEN_RECEIPT_RUN_ID = "2026-06-21T14-32-10Z";

      expect(defaultOptions().outDir).toBe(
        join(appSupportDir, "runs", "2026-06-21T14-32-10Z"),
      );
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  test("keeps explicit out paths relative to the caller cwd", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "token-receipt-out-override-"));
    const workDir = join(tempRoot, "scratch");

    try {
      mkdirSync(workDir, { recursive: true });

      process.env.HOME = tempRoot;
      process.env.INIT_CWD = workDir;
      process.env.PWD = workDir;

      expect(
        parseArgs(["generate", "--out", "./exports/receipt"]).options.outDir,
      ).toBe(join(workDir, "./exports/receipt"));
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}

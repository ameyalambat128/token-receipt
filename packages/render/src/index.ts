import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  Browser,
  BrowserPlatform,
  BrowserTag,
  detectBrowserPlatform,
  install,
  resolveBuildId,
} from "@puppeteer/browsers";
import puppeteer from "puppeteer-core";
import type { Receipt, ReceiptLineItem } from "@token-receipt/core";
import { paperTextureDataUrl } from "./paper-texture.generated.js";

const activityCellOpacity = ["0.14", "0.34", "0.52", "0.74", "0.96"];

export function renderReceiptHtml(receipt: Receipt) {
  const rows = buildReceiptRows(receipt.lines);
  const stats = [
    ...receipt.display.stats,
    { label: "TOTAL", value: formatMoney(receipt.totalUsd) },
  ];
  const details = buildDetailRows(receipt);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        min-width: 760px;
        background: transparent;
        color: #1f1b17;
      }

      body {
        font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        -webkit-font-smoothing: antialiased;
        text-rendering: geometricPrecision;
      }

      .receipt-stage {
        position: relative;
        width: 760px;
        padding: 44px 104px 70px;
        background: transparent;
      }

      .receipt-glow {
        position: absolute;
        left: 140px;
        right: 140px;
        top: 64px;
        height: 96px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        filter: blur(48px);
        pointer-events: none;
      }

      .receipt-shadow {
        position: absolute;
        left: 132px;
        right: 132px;
        bottom: 42px;
        height: 64px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.35);
        filter: blur(32px);
        pointer-events: none;
      }

      .receipt-paper {
        position: relative;
        overflow: hidden;
        width: 552px;
        border: 1px solid rgba(214, 204, 188, 0.72);
        border-radius: 32px;
        padding: 28px 24px 32px;
        background-color: #f5f1e8;
        background-image:
          linear-gradient(180deg, rgba(255, 252, 247, 0.44), rgba(245, 239, 231, 0.2)),
          linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 18%, rgba(120, 106, 89, 0.1) 84%, rgba(255, 255, 255, 0.04)),
          url("${paperTextureDataUrl}");
        background-blend-mode: screen, multiply, normal;
        background-position: center, center, center;
        background-size: cover, cover, cover;
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.28);
      }

      .paper-light {
        position: absolute;
        inset: 0;
        opacity: 0.26;
        mix-blend-mode: soft-light;
        pointer-events: none;
      }

      .paper-light::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.24), transparent 32%, rgba(113, 95, 74, 0.12) 66%, rgba(255, 255, 255, 0.12));
      }

      .paper-light::after {
        content: "";
        position: absolute;
        right: 10%;
        top: 30%;
        width: 176px;
        height: 176px;
        border-radius: 999px;
        background: rgba(214, 211, 209, 0.16);
        filter: blur(48px);
      }

      .paper-highlight {
        position: absolute;
        left: 12%;
        top: 18%;
        width: 160px;
        height: 160px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.16);
        filter: blur(48px);
      }

      .receipt-content {
        position: relative;
        z-index: 1;
      }

      .heading {
        text-align: center;
      }

      .title {
        margin: 0;
        color: #1f1b17;
        font-size: 40px;
        font-weight: 600;
        letter-spacing: -0.06em;
        line-height: 1;
        text-transform: uppercase;
      }

      .subtitle {
        margin: 12px 0 0;
        color: #57534e;
        font-size: 15px;
        letter-spacing: 0.24em;
        line-height: 1.25;
        text-transform: uppercase;
      }

      .meta {
        margin-top: 32px;
        color: #1f1b17;
        font-size: 15px;
        line-height: 24px;
      }

      .divider-block {
        margin-top: 20px;
        border-bottom: 1px dashed rgba(120, 113, 108, 0.7);
        border-top: 1px dashed rgba(120, 113, 108, 0.7);
        padding: 8px 0;
        color: #292524;
        font-size: 14px;
        line-height: 22px;
      }

      .receipt-grid {
        display: grid;
        grid-template-columns: 42px minmax(0, 1fr) 82px;
        gap: 12px;
      }

      .amount {
        text-align: right;
      }

      .line-items {
        margin-top: 8px;
        color: #1f1b17;
        font-size: 15px;
        line-height: 24px;
      }

      .line-item {
        display: grid;
        grid-template-columns: 42px minmax(0, 1fr) 82px;
        gap: 12px;
        padding: 5px 0;
      }

      .line-label {
        padding-right: 8px;
      }

      .line-item.waste .amount {
        color: #7d433e;
      }

      .stats {
        margin-top: 20px;
        border-bottom: 1px dashed rgba(120, 113, 108, 0.7);
        border-top: 1px dashed rgba(120, 113, 108, 0.7);
        padding: 12px 0;
        color: #1f1b17;
        font-size: 15px;
        line-height: 24px;
      }

      .stat-row,
      .detail-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .stat-row.total {
        margin-top: 8px;
        font-size: 17px;
      }

      .details {
        margin-top: 16px;
        color: #1f1b17;
        font-size: 15px;
        line-height: 24px;
      }

      .thank-you {
        margin-top: 32px;
        color: #1f1b17;
        font-size: 16px;
        letter-spacing: 0.06em;
        line-height: 1.35;
        text-align: center;
        text-transform: uppercase;
      }

      .activity {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 264px;
        margin: 28px auto 0;
        padding: 0 4px;
      }

      .activity-heading,
      .activity-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        color: #44403c;
        font-size: 12px;
        letter-spacing: 0.2em;
        line-height: 1.25;
        text-transform: uppercase;
      }

      .activity-grid {
        display: flex;
        align-items: end;
        gap: 4px;
        margin-top: 12px;
      }

      .activity-column {
        display: grid;
        gap: 4px;
      }

      .activity-cell {
        display: block;
        width: 10px;
        height: 10px;
        border-radius: 2px;
        background: #000;
      }

      .activity-footer {
        margin-top: 12px;
        color: #78716c;
        font-size: 11px;
        letter-spacing: 0.18em;
      }

      .note {
        margin-top: 16px;
        color: #78716c;
        font-size: 13px;
        line-height: 20px;
        text-align: center;
      }

      .note p {
        margin: 0;
      }

      .note .loud {
        letter-spacing: 0.22em;
        text-transform: uppercase;
      }

      .note .disclaimer {
        margin-top: 4px;
      }
    </style>
  </head>
  <body>
    <main class="receipt-stage" aria-label="Token Receipt">
      <div class="receipt-glow"></div>
      <div class="receipt-shadow"></div>
      <article class="receipt-paper">
        <div class="paper-light"><div class="paper-highlight"></div></div>

        <div class="receipt-content">
          <header class="heading">
            <p class="title">TOKEN RECEIPT</p>
            <p class="subtitle">${escapeHtml(receipt.display.activity.periodLabel)}</p>
          </header>

          <section class="meta">
            <div>${escapeHtml(receipt.display.orderLabel)}</div>
            <div>${escapeHtml(receipt.display.generatedDate)}</div>
          </section>

          <section class="divider-block">
            <div class="receipt-grid">
              <span>QTY</span>
              <span>ITEM</span>
              <span class="amount">AMT</span>
            </div>
          </section>

          <section class="line-items">
            ${rows
              .map(
                (row) => `<div class="line-item ${row.kind}">
                  <span>${row.qty}</span>
                  <span class="line-label">${escapeHtml(row.label)}</span>
                  <span class="amount">${escapeHtml(row.amount)}</span>
                </div>`,
              )
              .join("")}
          </section>

          <section class="stats">
            ${stats
              .map(
                (
                  row,
                ) => `<div class="stat-row ${row.label === "TOTAL" ? "total" : ""}">
                  <span>${escapeHtml(row.label)}:</span>
                  <span>${escapeHtml(row.value)}</span>
                </div>`,
              )
              .join("")}
          </section>

          <section class="details">
            ${details
              .map(
                (row) => `<div class="detail-row">
                  <span>${escapeHtml(row.label)}:</span>
                  <span>${escapeHtml(row.value)}</span>
                </div>`,
              )
              .join("")}
          </section>

          <section class="thank-you">${escapeHtml(receipt.footer)}</section>

          <section class="activity" aria-label="${escapeHtml(receipt.display.activity.title)}">
            <div class="activity-heading">
              <span>${escapeHtml(receipt.display.activity.title)}</span>
              <span>${escapeHtml(receipt.display.activity.periodLabel)}</span>
            </div>
            <div class="activity-grid" aria-hidden="true">
              ${receipt.display.activity.columns
                .map(
                  (
                    column,
                    columnIndex,
                  ) => `<div class="activity-column" data-column="${columnIndex}">
                    ${column
                      .map(
                        (value, rowIndex) =>
                          `<span class="activity-cell" data-row="${rowIndex}" style="opacity: ${activityCellOpacity[value] ?? activityCellOpacity[0]}"></span>`,
                      )
                      .join("")}
                  </div>`,
                )
                .join("")}
            </div>
            <div class="activity-footer">
              <span>${escapeHtml(receipt.display.activity.startLabel)}</span>
              <span>${escapeHtml(receipt.display.activity.endLabel)}</span>
            </div>
          </section>

          <section class="note">
            <p class="loud">${escapeHtml(receipt.display.note)}</p>
            <p class="disclaimer">${escapeHtml(receipt.disclaimer)}</p>
          </section>
        </div>
      </article>
    </main>
  </body>
</html>`;
}

export async function renderReceiptPng(receipt: Receipt) {
  const browser = await puppeteer.launch({
    executablePath: await findChromiumExecutable(),
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 760,
      height: 1400,
      deviceScaleFactor: 2,
    });
    await page.setContent(renderReceiptHtml(receipt), {
      waitUntil: "load",
    });

    const stage = await page.$(".receipt-stage");

    if (!stage) {
      throw new Error("Receipt HTML did not render the screenshot target.");
    }

    const box = await stage.boundingBox();
    const height = Math.ceil(box?.height ?? 1400);
    await page.setViewport({
      width: 760,
      height,
      deviceScaleFactor: 2,
    });

    return await stage.screenshot({
      omitBackground: true,
      type: "png",
    });
  } finally {
    await browser.close();
  }
}

const buildReceiptRows = (lines: ReceiptLineItem[]) =>
  lines.map((line, index) => ({
    qty: String(index + 1).padStart(2, "0"),
    label: line.label,
    amount: formatMoney(line.amountUsd),
    kind: line.kind === "waste" ? "waste" : "summary",
  }));

const buildDetailRows = (receipt: Receipt) =>
  receipt.display.details.filter(
    (row) => row.label !== "AVOIDABLE WASTE" && row.label !== "USEFUL WORK",
  );

const findChromiumExecutable = async () => {
  const candidates = [
    process.env.TOKEN_RECEIPT_CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ...findPlaywrightChromiumExecutables(),
  ].filter((path): path is string => Boolean(path));

  const executable = candidates.find((path) => existsSync(path));

  if (!executable) {
    return await installChromiumExecutable();
  }

  return executable;
};

const installChromiumExecutable = async () => {
  const platform = detectBrowserPlatform();

  if (!platform || platform === BrowserPlatform.LINUX_ARM) {
    throw new Error(
      [
        "No supported Chrome Headless Shell download is available for this platform.",
        "Install Chrome or set TOKEN_RECEIPT_CHROME_PATH to a Chromium-compatible browser binary.",
      ].join(" "),
    );
  }

  const buildId = await resolveBuildId(
    Browser.CHROMEHEADLESSSHELL,
    platform,
    BrowserTag.STABLE,
  );
  const browser = await install({
    browser: Browser.CHROMEHEADLESSSHELL,
    buildId,
    cacheDir: join(homedir(), "Library", "Caches", "token-receipt", "chromium"),
    platform,
    unpack: true,
  });

  return browser.executablePath;
};

const findPlaywrightChromiumExecutables = () => {
  const cacheDir = join(homedir(), "Library", "Caches", "ms-playwright");

  if (!existsSync(cacheDir)) {
    return [];
  }

  return readdirSync(cacheDir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        entry.name.startsWith("chromium_headless_shell-"),
    )
    .map((entry) =>
      join(
        cacheDir,
        entry.name,
        "chrome-headless-shell-mac-arm64",
        "chrome-headless-shell",
      ),
    )
    .sort()
    .reverse();
};

const formatMoney = (value: number) =>
  `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

import { Resvg } from "@resvg/resvg-js";
import type { Receipt } from "@token-receipt/core";

export function renderReceiptSvg(receipt: Receipt) {
  const lineHeight = 54;
  const height = 320 + receipt.lines.length * lineHeight + 220;
  const lineItems = receipt.lines
    .map((line, index) => {
      const y = 180 + index * lineHeight;
      const amountColor = line.kind === "waste" ? "#8b3b43" : "#1f1f1f";
      return `
        <text x="64" y="${y}" font-size="28" fill="#1f1f1f">${escapeXml(line.label)}</text>
        <text x="836" y="${y}" font-size="28" fill="${amountColor}" text-anchor="end">$${escapeXml(line.amountUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</text>
      `;
    })
    .join("");

  return `
    <svg width="900" height="${height}" viewBox="0 0 900 ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="14" width="872" height="${height - 28}" rx="24" fill="#f4efe6" stroke="#d8d0c1" stroke-width="2"/>
      <text x="450" y="76" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="30" fill="#2a2a2a">${escapeXml(receipt.title)}</text>
      <text x="450" y="112" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="18" fill="#5d5d5d">${escapeXml(receipt.subtitle)}</text>
      <line x1="44" x2="856" y1="138" y2="138" stroke="#d8d0c1" stroke-width="1" stroke-dasharray="4 8"/>
      ${lineItems}
      <line x1="44" x2="856" y1="${170 + receipt.lines.length * lineHeight}" y2="${170 + receipt.lines.length * lineHeight}" stroke="#d8d0c1" stroke-width="1" stroke-dasharray="4 8"/>
      <text x="64" y="${220 + receipt.lines.length * lineHeight}" font-size="28" fill="#1f1f1f">Total</text>
      <text x="836" y="${220 + receipt.lines.length * lineHeight}" font-size="28" fill="#1f1f1f" text-anchor="end">$${escapeXml(receipt.totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</text>
      <text x="64" y="${268 + receipt.lines.length * lineHeight}" font-size="22" fill="#444">What you budgeted</text>
      <text x="836" y="${268 + receipt.lines.length * lineHeight}" font-size="22" fill="#444" text-anchor="end">$${escapeXml(receipt.budgetedUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</text>
      <line x1="44" x2="856" y1="${304 + receipt.lines.length * lineHeight}" y2="${304 + receipt.lines.length * lineHeight}" stroke="#d8d0c1" stroke-width="1" stroke-dasharray="4 8"/>
      <text x="64" y="${362 + receipt.lines.length * lineHeight}" font-size="26" fill="#8b3b43">* avoidable waste</text>
      <text x="836" y="${362 + receipt.lines.length * lineHeight}" font-size="40" fill="#8b3b43" text-anchor="end">$${escapeXml(receipt.avoidableUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</text>
      <text x="64" y="${404 + receipt.lines.length * lineHeight}" font-size="18" fill="#5d5d5d">${escapeXml(receipt.disclaimer)}</text>
      <line x1="44" x2="856" y1="${454 + receipt.lines.length * lineHeight}" y2="${454 + receipt.lines.length * lineHeight}" stroke="#d8d0c1" stroke-width="1" stroke-dasharray="4 8"/>
      <text x="450" y="${520 + receipt.lines.length * lineHeight}" text-anchor="middle" font-size="28" fill="#333">${escapeXml(receipt.footer)}</text>
      <text x="450" y="${558 + receipt.lines.length * lineHeight}" text-anchor="middle" font-size="18" fill="#5d5d5d">Generate yours: bun run skill:install</text>
    </svg>
  `.trim();
}

export function renderReceiptPng(receipt: Receipt) {
  const svg = renderReceiptSvg(receipt);
  const renderer = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: 1200,
    },
  });

  return renderer.render().asPng();
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

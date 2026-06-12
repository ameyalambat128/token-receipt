import { Resvg } from "@resvg/resvg-js";
import type { Receipt, ReceiptLineItem } from "@token-receipt/core";

const monoStack =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', monospace";

const activityCellOpacity = ["0.14", "0.34", "0.52", "0.74", "0.96"];

export function renderReceiptSvg(receipt: Receipt) {
  const paper = { x: 84, y: 42, width: 792, paddingX: 54, paddingY: 74 };
  const rows = buildReceiptRows(receipt.lines);
  const rowSectionHeight = rows.reduce((sum, row) => sum + row.height, 0);
  const statRows = receipt.display.stats;
  const detailRows = receipt.display.details;
  const activityGrid = receipt.display.activity.columns;
  const periodLabel = receipt.display.activity.periodLabel;
  const startMonth = receipt.display.activity.startLabel;
  const endMonth = receipt.display.activity.endLabel;
  const statsStartY = 384 + rowSectionHeight;
  const statsEndY = statsStartY + 166;
  const detailStartY = statsEndY + 46;
  const thankYouY = detailStartY + 166;
  const graphStartY = thankYouY + 112;
  const noteY = graphStartY + 210;
  const footerY = noteY + 66;
  const paperHeight = footerY + 92;
  const canvasHeight = paper.y + paperHeight + 58;
  const paperCenterX = paper.x + paper.width / 2;
  const paperCenterY = paper.y + paperHeight / 2;
  const qtyX = paper.x + paper.paddingX;
  const itemX = qtyX + 44;
  const amountX = paper.x + paper.width - paper.paddingX;
  const scallops = buildScallops(paper.x, paper.y, paper.width, paperHeight);
  const lineItems = renderLineItems(rows, itemX, amountX, 402);
  const statMarkup = statRows
    .map(
      (row, index) => `
        <text x="${qtyX}" y="${statsStartY + 36 + index * 28}" font-size="20" fill="#312a23">${escapeXml(row.label)}:</text>
        <text x="${amountX}" y="${statsStartY + 36 + index * 28}" font-size="20" fill="#181411" text-anchor="end">${escapeXml(row.value)}</text>
      `,
    )
    .join("");
  const detailMarkup = detailRows
    .map(
      (row, index) => `
        <text x="${qtyX}" y="${detailStartY + index * 28}" font-size="19" fill="#342d25">${escapeXml(row.label)}:</text>
        <text x="${amountX}" y="${detailStartY + index * 28}" font-size="19" fill="#181411" text-anchor="end">${escapeXml(row.value)}</text>
      `,
    )
    .join("");
  const graphMarkup = renderActivityGraph(
    activityGrid,
    paperCenterX,
    graphStartY,
  );

  return `
    <svg width="960" height="${canvasHeight}" viewBox="0 0 960 ${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="paperBase" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fffaf2"/>
          <stop offset="52%" stop-color="#f4efe6"/>
          <stop offset="100%" stop-color="#ede4d7"/>
        </linearGradient>
        <linearGradient id="paperSheen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.82"/>
          <stop offset="30%" stop-color="#ffffff" stop-opacity="0.06"/>
          <stop offset="72%" stop-color="#715f4a" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.2"/>
        </linearGradient>
        <linearGradient id="paperTint" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.16"/>
          <stop offset="18%" stop-color="#ffffff" stop-opacity="0"/>
          <stop offset="84%" stop-color="#786a59" stop-opacity="0.07"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.1"/>
        </linearGradient>
        <filter id="paperShadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="30" stdDeviation="28" flood-color="#000000" flood-opacity="0.28"/>
        </filter>
        <filter id="paperNoise" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise"/>
          <feColorMatrix
            in="noise"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 0.18 0"
          />
        </filter>
        <filter id="paperWrinkle" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.014 0.06" numOctaves="2" seed="11" result="warp"/>
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="8" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        <mask id="paperMask">
          <rect x="${paper.x}" y="${paper.y}" width="${paper.width}" height="${paperHeight}" rx="34" fill="white"/>
          ${scallops}
        </mask>
      </defs>

      <rect width="960" height="${canvasHeight}" fill="transparent"/>

      <g filter="url(#paperShadow)" transform="rotate(-1.2 ${paperCenterX} ${paperCenterY})">
        <g mask="url(#paperMask)">
          <rect x="${paper.x}" y="${paper.y}" width="${paper.width}" height="${paperHeight}" rx="34" fill="url(#paperBase)"/>
          <rect x="${paper.x}" y="${paper.y}" width="${paper.width}" height="${paperHeight}" rx="34" fill="url(#paperTint)"/>
          <rect x="${paper.x}" y="${paper.y}" width="${paper.width}" height="${paperHeight}" rx="34" fill="url(#paperSheen)" opacity="0.74"/>
          <rect x="${paper.x}" y="${paper.y}" width="${paper.width}" height="${paperHeight}" rx="34" filter="url(#paperNoise)" opacity="0.65"/>
          <g filter="url(#paperWrinkle)" opacity="0.42">
            <rect x="${paper.x}" y="${paper.y}" width="${paper.width}" height="${paperHeight}" rx="34" fill="transparent" stroke="#8b7257" stroke-opacity="0.12" stroke-width="2"/>
            <path d="M${paper.x + 46} ${paper.y + 96} C${paper.x + 182} ${paper.y + 72}, ${paper.x + 320} ${paper.y + 154}, ${paper.x + 472} ${paper.y + 124} S${paper.x + 738} ${paper.y + 86}, ${paper.x + 748} ${paper.y + 158}" stroke="#8c775e" stroke-opacity="0.13" stroke-width="3" fill="none"/>
            <path d="M${paper.x + 118} ${paper.y + 282} C${paper.x + 238} ${paper.y + 236}, ${paper.x + 396} ${paper.y + 334}, ${paper.x + 520} ${paper.y + 288} S${paper.x + 716} ${paper.y + 260}, ${paper.x + 728} ${paper.y + 320}" stroke="#9a8570" stroke-opacity="0.1" stroke-width="2.6" fill="none"/>
            <path d="M${paper.x + 164} ${paper.y + 604} C${paper.x + 266} ${paper.y + 554}, ${paper.x + 478} ${paper.y + 662}, ${paper.x + 654} ${paper.y + 606}" stroke="#7f6a54" stroke-opacity="0.1" stroke-width="2.4" fill="none"/>
          </g>
          <circle cx="${paper.x + 140}" cy="${paper.y + 138}" r="118" fill="#ffffff" fill-opacity="0.16"/>
          <circle cx="${paper.x + paper.width - 138}" cy="${paper.y + 244}" r="128" fill="#d9cdbd" fill-opacity="0.18"/>
        </g>

        <rect x="${paper.x}" y="${paper.y}" width="${paper.width}" height="${paperHeight}" rx="34" fill="none" stroke="#d0c2ad" stroke-width="1.4" stroke-opacity="0.85"/>

        <text x="${paperCenterX}" y="${paper.y + 110}" text-anchor="middle" font-family="${monoStack}" font-size="56" font-weight="600" letter-spacing="-3.2" fill="#1f1b17">TOKEN RECEIPT</text>
        <text x="${paperCenterX}" y="${paper.y + 144}" text-anchor="middle" font-family="${monoStack}" font-size="20" letter-spacing="4.6" fill="#7a6754">${escapeXml(periodLabel)}</text>

        <text x="${qtyX}" y="${paper.y + 204}" font-family="${monoStack}" font-size="20" fill="#2b241d">${escapeXml(receipt.display.orderLabel)}</text>
        <text x="${qtyX}" y="${paper.y + 234}" font-family="${monoStack}" font-size="20" fill="#2b241d">${escapeXml(receipt.display.generatedDate)}</text>
        <text x="${qtyX}" y="${paper.y + 264}" font-family="${monoStack}" font-size="20" fill="#7c6957">PROVIDERS: ${escapeXml(receipt.display.providerLabel)}</text>

        <line x1="${qtyX}" x2="${amountX}" y1="${paper.y + 296}" y2="${paper.y + 296}" stroke="#6d5d4e" stroke-opacity="0.72" stroke-width="1.4" stroke-dasharray="8 8"/>
        <text x="${qtyX}" y="${paper.y + 322}" font-family="${monoStack}" font-size="18" fill="#473c32">QTY</text>
        <text x="${itemX}" y="${paper.y + 322}" font-family="${monoStack}" font-size="18" fill="#473c32">ITEM</text>
        <text x="${amountX}" y="${paper.y + 322}" text-anchor="end" font-family="${monoStack}" font-size="18" fill="#473c32">AMT</text>
        ${lineItems}

        <line x1="${qtyX}" x2="${amountX}" y1="${statsStartY}" y2="${statsStartY}" stroke="#6d5d4e" stroke-opacity="0.72" stroke-width="1.4" stroke-dasharray="8 8"/>
        ${statMarkup}
        <text x="${qtyX}" y="${statsEndY - 24}" font-family="${monoStack}" font-size="22" fill="#251f19">TOTAL:</text>
        <text x="${amountX}" y="${statsEndY - 24}" text-anchor="end" font-family="${monoStack}" font-size="22" fill="#251f19">${escapeXml(formatMoney(receipt.totalUsd))}</text>
        <line x1="${qtyX}" x2="${amountX}" y1="${statsEndY}" y2="${statsEndY}" stroke="#6d5d4e" stroke-opacity="0.72" stroke-width="1.4" stroke-dasharray="8 8"/>

        ${detailMarkup}

        <text x="${paperCenterX}" y="${thankYouY}" text-anchor="middle" font-family="${monoStack}" font-size="24" letter-spacing="1.4" fill="#201914">${escapeXml(receipt.footer.toUpperCase())}</text>

        ${graphMarkup}
        <text x="${paperCenterX - 128}" y="${graphStartY + 18}" font-family="${monoStack}" font-size="13" letter-spacing="2.4" fill="#6e5d4d">${escapeXml(receipt.display.activity.title.toUpperCase())}</text>
        <text x="${paperCenterX + 128}" y="${graphStartY + 18}" text-anchor="end" font-family="${monoStack}" font-size="13" letter-spacing="2.4" fill="#6e5d4d">${escapeXml(periodLabel)}</text>
        <text x="${paperCenterX - 114}" y="${graphStartY + 146}" font-family="${monoStack}" font-size="14" letter-spacing="2.2" fill="#8a7866">${escapeXml(startMonth)}</text>
        <text x="${paperCenterX + 114}" y="${graphStartY + 146}" text-anchor="end" font-family="${monoStack}" font-size="14" letter-spacing="2.2" fill="#8a7866">${escapeXml(endMonth)}</text>

        <text x="${paperCenterX}" y="${noteY}" text-anchor="middle" font-family="${monoStack}" font-size="15" letter-spacing="3" fill="#7d6a58">${escapeXml(receipt.display.note.toUpperCase())}</text>
        <text x="${paperCenterX}" y="${noteY + 28}" text-anchor="middle" font-family="${monoStack}" font-size="15" fill="#85715f">${escapeXml(receipt.disclaimer)}</text>

        <line x1="${qtyX}" x2="${amountX}" y1="${footerY}" y2="${footerY}" stroke="#6d5d4e" stroke-opacity="0.72" stroke-width="1.4" stroke-dasharray="8 8"/>
        <text x="${paperCenterX}" y="${footerY + 38}" text-anchor="middle" font-family="${monoStack}" font-size="15" fill="#7b6755">${escapeXml(receipt.display.footerLink)}</text>
      </g>
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

const buildReceiptRows = (lines: ReceiptLineItem[]) =>
  lines.map((line, index) => {
    const labelLines = wrapText(line.label, 26, 2);
    const height = 28 + labelLines.length * 23;

    return {
      qty: String(index + 1).padStart(2, "0"),
      amount: formatMoney(line.amountUsd),
      amountColor: line.kind === "waste" ? "#7d433e" : "#181411",
      labelLines,
      height,
    };
  });

const renderLineItems = (
  rows: ReturnType<typeof buildReceiptRows>,
  itemX: number,
  amountX: number,
  startY: number,
) => {
  let cursorY = startY;

  return rows
    .map((row) => {
      const topY = cursorY;
      cursorY += row.height;

      return `
        <text x="${itemX - 44}" y="${topY}" font-family="${monoStack}" font-size="20" fill="#2d261f">${row.qty}</text>
        <text x="${itemX}" y="${topY}" font-family="${monoStack}" font-size="20" fill="#1d1814">
          ${row.labelLines
            .map(
              (label, index) =>
                `<tspan x="${itemX}" dy="${index === 0 ? 0 : 22}">${escapeXml(label)}</tspan>`,
            )
            .join("")}
        </text>
        <text x="${amountX}" y="${topY}" text-anchor="end" font-family="${monoStack}" font-size="20" fill="${row.amountColor}">${escapeXml(row.amount)}</text>
      `;
    })
    .join("");
};

const renderActivityGraph = (
  grid: number[][],
  centerX: number,
  startY: number,
) => {
  const cellSize = 11;
  const gap = 4;
  const gridWidth = grid.length * cellSize + (grid.length - 1) * gap;
  const baseX = centerX - gridWidth / 2;
  const baseY = startY + 36;

  return grid
    .map((column, columnIndex) =>
      column
        .map((value, rowIndex) => {
          const x = baseX + columnIndex * (cellSize + gap);
          const y = baseY + rowIndex * (cellSize + gap);

          return `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2.4" fill="#16110d" fill-opacity="${activityCellOpacity[value]}"/>`;
        })
        .join(""),
    )
    .join("");
};

const buildScallops = (x: number, y: number, width: number, height: number) => {
  const radius = 8;
  const step = 22;
  const count = Math.ceil(width / step) + 2;

  return Array.from({ length: count }, (_, index) => {
    const cx = x + 10 + index * step;

    return `
      <circle cx="${cx}" cy="${y}" r="${radius}" fill="black"/>
      <circle cx="${cx}" cy="${y + height}" r="${radius}" fill="black"/>
    `;
  }).join("");
};

const wrapText = (text: string, maxChars: number, maxLines: number) => {
  const words = text.split(/\s+/);
  const lines = words.reduce<string[]>(
    (acc, word) => {
      const currentLine = acc[acc.length - 1] ?? "";
      const nextLine = currentLine ? `${currentLine} ${word}` : word;

      if (!currentLine || nextLine.length <= maxChars) {
        return [...acc.slice(0, -1), nextLine];
      }

      return [...acc, word];
    },
    [""],
  );
  const trimmed = lines.filter(Boolean).slice(0, maxLines);

  if (lines.length > maxLines) {
    const last = trimmed[trimmed.length - 1] ?? "";
    trimmed[trimmed.length - 1] =
      last.length > maxChars - 1
        ? `${last.slice(0, maxChars - 1).trimEnd()}…`
        : `${last}…`;
  }

  return trimmed;
};

const formatMoney = (value: number) =>
  `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

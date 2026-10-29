// @ts-nocheck — copied from JD Analyser MVP; strict-null checks deferred to avoid risky refactors.
export interface RequirementChunk {
  title: string;
  content: string;
  numberOfPositions?: string;
}

function stripFooter(rawText: string): string {
  const regardsIdx = rawText.search(/\n\s*Regards,?\s*\n/i);
  if (regardsIdx >= 0) return rawText.slice(0, regardsIdx).trim();
  const disclaimerIdx = rawText.search(/\n\s*Disclaimer:/i);
  if (disclaimerIdx >= 0) return rawText.slice(0, disclaimerIdx).trim();
  return rawText.trim();
}

export function extractEmailHeaders(rawText: string): string {
  const lines: string[] = [];
  for (const pattern of [
    /^From:\s*.+$/im,
    /^Sent:\s*.+$/im,
    /^To:\s*.+$/im,
    /^Cc:\s*.+$/im,
    /^Subject:\s*.+$/im,
  ]) {
    const match = rawText.match(pattern);
    if (match) lines.push(match[0].trim());
  }
  return lines.join("\n");
}

function inferTitleFromFocus(num: string, focus: string, baseContent: string): string {
  const cleanedFocus = focus
    .replace(/^(?:on|in|around|with|for|focused\s+on)\s+/i, "")
    .replace(/[.;,]+$/, "")
    .trim();

  // 1. Try to find an explicit Job Title or Role in base content
  const titleMatch = baseContent.match(
    /(?:Job\s*Title|Role|Position|Requirement|Designation)\s*[:=-]\s*([^\r\n]+)/i
  );
  let baseTitle = titleMatch ? titleMatch[1].trim() : "";

  // 2. Try the Subject line
  if (!baseTitle) {
    const subject = baseContent.match(/Subject:\s*([^\r\n]+)/i)?.[1];
    if (subject) {
      baseTitle = subject.split(/[@|\-–]/)[0]?.trim() || "";
      baseTitle = baseTitle
        .replace(/^(?:re|fw|fwd|urgent\s*(?:demand|hiring)?|staffing\s*demand)\s*[:\-]\s*/i, "")
        .trim();
    }
  }

  // Combine base title with dynamic focus area
  if (baseTitle && cleanedFocus) {
    if (baseTitle.toLowerCase().includes(cleanedFocus.toLowerCase())) {
      return baseTitle;
    }
    return `${baseTitle} (${cleanedFocus})`;
  }

  if (cleanedFocus) {
    return cleanedFocus.length <= 45
      ? `${cleanedFocus} Specialist`
      : cleanedFocus.slice(0, 50).trim();
  }

  return baseTitle || `Position ${num}`;
}

/** Detect "Position 1 to be focused ... Position 2 to be focused ..." role variants */
export function detectPositionFocusVariants(
  rawText: string
): RequirementChunk[] | null {
  const text = stripFooter(rawText);
  const positionRegex =
    /Position\s+(\d+)\s+to be focused\s+([\s\S]+?)(?=\s*Position\s+\d+\s+to be focused|$)/gi;
  const matches = [...text.matchAll(positionRegex)];
  if (matches.length < 2) return null;

  const baseEnd = matches[0].index ?? text.length;
  const baseContent = text.slice(0, baseEnd).trim();
  const totalOpenings = baseContent.match(/\b(\d+)\s+Openings?\b/i)?.[1];

  return matches.map((m) => {
    const num = m[1];
    const focus = m[2].trim();
    return {
      title: inferTitleFromFocus(num, focus, baseContent),
      content: `${baseContent}\n\nPosition ${num} to be focused ${focus}`,
      numberOfPositions: totalOpenings,
    };
  });
}

function isTinyPositionChunk(chunk: RequirementChunk): boolean {
  return (
    /^Position\s+\d+/i.test(chunk.content.trim()) &&
    chunk.content.length < 500
  );
}

function ensureEmailContext(fullText: string, chunkContent: string): string {
  if (/From:\s*/i.test(chunkContent) && /Subject:\s*/i.test(chunkContent)) {
    return chunkContent;
  }
  const headers = extractEmailHeaders(fullText);
  if (!headers) return chunkContent;
  return `${headers}\n\n${chunkContent}`;
}

export function postProcessChunks(
  rawText: string,
  chunks: RequirementChunk[]
): RequirementChunk[] {
  const positionVariants = detectPositionFocusVariants(rawText);
  if (positionVariants) return positionVariants;

  const tinyPositionChunks = chunks.filter(isTinyPositionChunk);
  if (tinyPositionChunks.length >= 2) {
    const largeChunks = chunks.filter((c) => c.content.length >= 400);
    const baseContent =
      largeChunks[0]?.content ?? stripFooter(rawText);
    const openings =
      largeChunks[0]?.numberOfPositions ??
      rawText.match(/\b(\d+)\s+Openings?\b/i)?.[1];

    return tinyPositionChunks.map((tc) => ({
      title: tc.title,
      numberOfPositions: openings ?? tc.numberOfPositions,
      content: ensureEmailContext(
        rawText,
        `${baseContent}\n\n${tc.content.trim()}`
      ),
    }));
  }

  if (chunks.length === 1) {
    return [{ ...chunks[0], content: ensureEmailContext(rawText, chunks[0].content) }];
  }

  return chunks.map((c) => ({
    ...c,
    content: ensureEmailContext(rawText, c.content),
  }));
}

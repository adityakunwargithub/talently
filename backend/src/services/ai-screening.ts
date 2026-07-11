function extractKeywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9+.#]+/)
      .map((word) => word.replace(/^[.+#]+|[.+#]+$/g, ''))
      .filter((word) => word.length > 2),
  );
}

export interface ScoreResult {
  score: number;
  matchedKeywords: string[];
  requiredKeywords: string[];
}

/**
 * Naive keyword-overlap scorer used until a real AI provider is wired up.
 * Score is 0-100: percentage of job requirement keywords found in the resume text.
 */
export function scoreApplication(jobRequirements: string, resumeText: string): ScoreResult {
  const required = [...extractKeywords(jobRequirements)];
  if (required.length === 0) return { score: 0, matchedKeywords: [], requiredKeywords: [] };

  const resumeWords = extractKeywords(resumeText);
  const matchedKeywords = required.filter((word) => resumeWords.has(word));

  return {
    score: Math.round((matchedKeywords.length / required.length) * 100),
    matchedKeywords,
    requiredKeywords: required,
  };
}

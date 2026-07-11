export interface ResumeFields {
  name: string;
  email: string;
  phone: string;
  summary: string;
  skills: string;
  experience: string;
  education: string;
}

export const EMPTY_RESUME_FIELDS: ResumeFields = {
  name: '',
  email: '',
  phone: '',
  summary: '',
  skills: '',
  experience: '',
  education: '',
};

const SECTION_HEADERS: Record<'summary' | 'skills' | 'experience' | 'education', RegExp> = {
  summary: /^(summary|objective|profile)\s*:?$/i,
  skills: /^(skills|technical skills|core competencies)\s*:?$/i,
  experience: /^(experience|work experience|employment history|professional experience)\s*:?$/i,
  education: /^(education|academic background)\s*:?$/i,
};

/**
 * Heuristic resume field extraction — looks for an email/phone via regex, a
 * name via "first short line without @ or digits", and splits the remaining
 * text into sections by common header words. This is pattern-matching, not
 * real NLP/AI, so results should always be reviewable/editable by the user.
 */
export function extractResumeFields(text: string): ResumeFields {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const nonEmpty = lines.filter(Boolean);

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d{1,3}[\s.-]?)?\(?\d{3,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/);

  const name =
    nonEmpty.find(
      (line) =>
        line.length < 60 &&
        !/[@\d]/.test(line) &&
        /^[A-Za-z][A-Za-z.'-]*(\s+[A-Za-z][A-Za-z.'-]*){0,4}$/.test(line),
    ) ?? '';

  const sections: Partial<Record<keyof typeof SECTION_HEADERS, string[]>> = {};
  let current: keyof typeof SECTION_HEADERS | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const matchedSection = (Object.keys(SECTION_HEADERS) as (keyof typeof SECTION_HEADERS)[]).find((key) =>
      SECTION_HEADERS[key].test(line),
    );

    if (matchedSection) {
      current = matchedSection;
      sections[current] = sections[current] ?? [];
      continue;
    }
    if (current) {
      (sections[current] as string[]).push(rawLine);
    }
  }

  const skillsBlock = (sections.skills ?? []).join(' ');
  const skills = skillsBlock
    ? Array.from(new Set(skillsBlock.split(/[,•\n]/).map((s) => s.trim()).filter(Boolean))).join(', ')
    : '';

  return {
    name,
    email: emailMatch?.[0] ?? '',
    phone: phoneMatch?.[0] ?? '',
    summary: (sections.summary ?? []).join('\n').trim(),
    skills,
    experience: (sections.experience ?? []).join('\n').trim(),
    education: (sections.education ?? []).join('\n').trim(),
  };
}

/** Fills blank fields of `base` from `incoming` (e.g. merging a LinkedIn export into a CV parse). */
export function mergeResumeFields(base: ResumeFields, incoming: ResumeFields): ResumeFields {
  const merged = { ...base };
  (Object.keys(merged) as (keyof ResumeFields)[]).forEach((key) => {
    if (!merged[key] && incoming[key]) merged[key] = incoming[key];
  });
  return merged;
}

function normalizeText(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[•]/g, '•')
    .replace(/ /g, ' ');
}

function escapeHtml(value: string): string {
  const normalized = normalizeText(value);
  return normalized.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function composeResumeHtml(fields: ResumeFields): string {
  const contact = [fields.email, fields.phone].filter(Boolean).join(' &middot; ');
  const section = (title: string, body: string) =>
    body ? `<h2>${title}</h2><div class="block">${escapeHtml(body)}</div>` : '';

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body { font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #1A1A1E; }
    h1 { color: #132C57; margin-bottom: 4px; }
    .contact { color: #5B5F6B; margin-bottom: 16px; }
    h2 { color: #132C57; border-bottom: 1px solid #C9D8FB; padding-bottom: 4px; margin-top: 20px; }
    .block { white-space: pre-wrap; line-height: 1.5; }
  </style></head><body>
    <h1>${escapeHtml(fields.name || 'Your Name')}</h1>
    <div class="contact">${contact}</div>
    ${section('Summary', fields.summary)}
    ${section('Skills', fields.skills)}
    ${section('Experience', fields.experience)}
    ${section('Education', fields.education)}
  </body></html>`;
}

export function composeResumePlainText(fields: ResumeFields): string {
  const parts: string[] = [];
  if (fields.name) parts.push(fields.name);
  const contact = [fields.email, fields.phone].filter(Boolean).join(' | ');
  if (contact) parts.push(contact);
  if (fields.summary) parts.push('SUMMARY', fields.summary);
  if (fields.skills) parts.push('SKILLS', fields.skills);
  if (fields.experience) parts.push('EXPERIENCE', fields.experience);
  if (fields.education) parts.push('EDUCATION', fields.education);
  return parts.join('\n\n');
}

export interface KeywordMatch {
  keyword: string;
  matchType: 'exact' | 'related';
}

function stem(word: string): string {
  return word.toLowerCase().replace(/(ing|ment|tion|ies|ed|es|s)$/, '');
}

/**
 * Wraps occurrences of the job's required keywords (exact or stemmed/"related")
 * in <mark> tags for the embedded resume preview, and returns the match list
 * used for the fitment summary. Simple word-stem matching, not real NLP.
 */
export function highlightResumeHtml(resumeText: string, requiredKeywords: string[]): { html: string; matches: KeywordMatch[] } {
  const matches: KeywordMatch[] = [];
  const normalizedText = normalizeText(resumeText);
  // Trim leading/trailing punctuation (e.g. a sentence-ending period stuck to a word)
  // so "postgresql." doesn't fail to match the keyword "postgresql".
  const resumeWords = Array.from(
    new Set(
      (normalizedText.match(/[A-Za-z0-9+.#]+/g) ?? [])
        .map((word) => word.replace(/^[.+#]+|[.+#]+$/g, ''))
        .filter(Boolean),
    ),
  );

  const patterns: { pattern: string; key: string }[] = [];
  for (const keyword of requiredKeywords.filter(Boolean)) {
    const keywordLower = keyword.toLowerCase();
    const exactHit = resumeWords.some((word) => word.toLowerCase() === keywordLower);
    if (exactHit) {
      patterns.push({ pattern: keyword, key: keywordLower });
      matches.push({ keyword, matchType: 'exact' });
      continue;
    }
    if (keywordLower.length <= 2) continue;
    const keywordStem = stem(keywordLower);
    const relatedWord = resumeWords.find((word) => stem(word.toLowerCase()) === keywordStem);
    if (relatedWord) {
      patterns.push({ pattern: relatedWord, key: relatedWord.toLowerCase() });
      matches.push({ keyword, matchType: 'related' });
    }
  }

  patterns.sort((a, b) => b.pattern.length - a.pattern.length);

  let html = escapeHtml(normalizedText);
  const seen = new Set<string>();
  for (const { pattern, key } of patterns) {
    if (seen.has(key)) continue;
    seen.add(key);
    const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp(`\\b(${escapedPattern})\\b`, 'gi'), '<mark class="hl">$1</mark>');
  }
  html = html.replace(/\n/g, '<br/>');

  return {
    html: `<!doctype html><html><head><meta charset="utf-8"><style>
      body { font-family: Arial, Helvetica, sans-serif; padding: 16px; line-height: 1.6; color: #1A1A1E; }
      mark.hl { background: #FFF176; padding: 0 2px; border-radius: 2px; }
    </style></head><body>${html}</body></html>`,
    matches,
  };
}

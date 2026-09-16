const INVALID_FILENAME_CHARACTERS = /[\\/:*?"<>|]/gu;

export const createPromptFileName = (name) => {
  const safeName = String(name ?? '')
    .trim()
    .replace(INVALID_FILENAME_CHARACTERS, '_')
    .replace(/_+/gu, '_')
    .replace(/^_+|_+$/gu, '')
    .replace(/\s+/gu, ' ')
    .slice(0, 80);

  return `${safeName || 'character'}_prompt.txt`;
};

export const createPromptDownloadUrl = (prompt) => (
  `data:text/plain;charset=utf-8,${encodeURIComponent(`\uFEFF${String(prompt ?? '')}`)}`
);

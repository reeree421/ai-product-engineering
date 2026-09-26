export function stripDisclaimerPhrases(responseText) {
    const bannedPhrases = [
      /as an ai language model,?\s*/gi,
      /as a large language model,?\s*/gi,
    ];
    let cleaned = responseText;
    for (const pattern of bannedPhrases) {
      cleaned = cleaned.replace(pattern, '');
    }
    return cleaned.trim();
  }
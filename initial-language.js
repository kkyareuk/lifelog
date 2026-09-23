// Only used when there is no saved or recovered world. Migration keeps saved choices.
export function initialLanguage(device) {
  if (!device) return 'ko'; // Non-browser simulation has no device preference.
  const preferences = [...(device.languages || []), device.language];
  for (const preference of preferences) {
    const language = String(preference || '').toLowerCase().split(/[-_]/)[0];
    if (['ko', 'en', 'ja'].includes(language)) return language;
  }
  return 'en';
}

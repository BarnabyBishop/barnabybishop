export const escapeXml = (value: string) => value.replace(/[<>&"']/g, (character) =>
  ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]!);

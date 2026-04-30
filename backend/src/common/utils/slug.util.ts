export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
}

export function uniqueSlug(input: string): string {
  return `${slugify(input)}-${Date.now().toString(36)}`;
}

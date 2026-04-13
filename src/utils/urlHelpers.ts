export const parseHasOfferParam = (value: string | null): boolean | undefined => {
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return undefined;
};

export const parseCategoryIdsParam = (value: string | null): string[] => {
  if (!value) return [];

  return Array.from(
    new Set(
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
};

export const areSameStrings = (a: string[], b: string[]) =>
  a.length === b.length && a.every((item, i) => item === b[i]);
export const FAVORITES_STORAGE_KEY = "kyo-favorites";

export type FavoriteItem = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
};

function normalizeFavorites(rawValue: unknown): FavoriteItem[] {
  if (!Array.isArray(rawValue)) {
    return [];
  }

  return rawValue
    .map((item) => {
      const candidate = item as Partial<FavoriteItem>;

      if (!candidate || typeof candidate.slug !== "string" || typeof candidate.name !== "string") {
        return null;
      }

      return {
        id: typeof candidate.id === "string" ? candidate.id : candidate.slug,
        slug: candidate.slug,
        name: candidate.name,
        image: typeof candidate.image === "string" ? candidate.image : "",
        price: typeof candidate.price === "number" ? candidate.price : 0,
        oldPrice: typeof candidate.oldPrice === "number" ? candidate.oldPrice : undefined,
      };
    })
    .filter((item): item is FavoriteItem => item !== null);
}

export function readFavorites() {
  if (typeof window === "undefined") {
    return [] as FavoriteItem[];
  }

  try {
    const rawValue = window.localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (!rawValue) {
      return [] as FavoriteItem[];
    }

    return normalizeFavorites(JSON.parse(rawValue));
  } catch {
    return [] as FavoriteItem[];
  }
}

export function writeFavorites(items: FavoriteItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("favorites-updated"));
}

export function isFavorite(slug: string) {
  return readFavorites().some((item) => item.slug === slug);
}

export function toggleFavorite(item: FavoriteItem) {
  const currentItems = readFavorites();
  const exists = currentItems.some((favorite) => favorite.slug === item.slug);

  if (exists) {
    const nextItems = currentItems.filter((favorite) => favorite.slug !== item.slug);
    writeFavorites(nextItems);
    return false;
  }

  writeFavorites([item, ...currentItems]);
  return true;
}

export function removeFavorite(slug: string) {
  const nextItems = readFavorites().filter((item) => item.slug !== slug);
  writeFavorites(nextItems);
}

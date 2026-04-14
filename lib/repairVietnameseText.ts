const mojibakePattern =
  /(?:Ã.|Â.|Ä.|áº.|á».|Æ.|Ð.|ñ.|â|â|â|â|â|â)/;

export function repairVietnameseText(value: string) {
  if (!value || !mojibakePattern.test(value)) {
    return value;
  }

  try {
    const bytes = Uint8Array.from(
      Array.from(value).map((character) => character.charCodeAt(0) & 0xff),
    );

    const decoded = new TextDecoder("utf-8").decode(bytes).trim();

    return decoded || value;
  } catch {
    return value;
  }
}

export function repairObjectTextFields<T extends Record<string, unknown>>(value: T): T {
  const nextEntries = Object.entries(value).map(([key, fieldValue]) => {
    if (typeof fieldValue === "string") {
      return [key, repairVietnameseText(fieldValue)];
    }

    return [key, fieldValue];
  });

  return Object.fromEntries(nextEntries) as T;
}

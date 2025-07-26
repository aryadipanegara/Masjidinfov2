/**
 * Mengekstrak gambar dari HTML content
 */
export function extractImagesFromContent(content: string): Array<{
  url: string;
  altText?: string;
  caption?: string;
}> {
  if (!content) return [];

  const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/g;
  const images: Array<{ url: string; altText?: string; caption?: string }> = [];
  let match;
  let order = 0;

  while ((match = imgRegex.exec(content)) !== null) {
    const src = match[1];
    const altMatch = match[0].match(/alt=["']([^"']*)["']/);
    const titleMatch = match[0].match(/title=["']([^"']*)["']/);

    // Abaikan gambar placeholder atau icon kecil
    if (shouldIncludeImage(src)) {
      images.push({
        url: src,
        altText: altMatch ? altMatch[1] : undefined,
        caption: titleMatch ? titleMatch[1] : undefined,
      });
    }
  }

  return images;
}

/**
 * Filter gambar yang layak disimpan
 */
function shouldIncludeImage(src: string): boolean {
  // Abaikan gambar placeholder, icon kecil, dll
  const ignorePatterns = [
    "placeholder",
    "icon",
    "loading",
    "spinner",
    /\.(svg)$/i, // SVG biasanya tidak perlu disimpan sebagai Image model
  ];

  return !ignorePatterns.some((pattern) =>
    typeof pattern === "string" ? src.includes(pattern) : pattern.test(src)
  );
}

/**
 * Menghapus duplikat gambar
 */
export function removeDuplicateImages(
  images: Array<{ url: string }>
): Array<any> {
  const seen = new Set();
  return images.filter((img) => {
    if (seen.has(img.url)) {
      return false;
    }
    seen.add(img.url);
    return true;
  });
}

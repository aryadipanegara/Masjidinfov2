/**
 * Mengubah URL gambar lokal relatif dalam konten HTML menjadi URL absolut.
 * @param htmlContent - String HTML yang mungkin mengandung tag <img src="/images/..." />
 * @returns String HTML dengan src gambar yang sudah diperbaiki.
 */
export const fixImageUrlsInHtml = (
  htmlContent: string | null | undefined
): string => {
  if (!htmlContent) return htmlContent || "";

  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

  if (!backendBaseUrl) {
    console.warn(
      "NEXT_PUBLIC_BACKEND_BASE_URL is not defined. Image URLs might not load correctly."
    );
    return htmlContent;
  }

  // Gunakan DOMParser untuk memanipulasi HTML dengan aman
  if (typeof window !== "undefined" && window.DOMParser) {
    try {
      const parser = new DOMParser();
      // Wrap content to ensure valid HTML structure for parsing
      const doc = parser.parseFromString(
        `<div>${htmlContent}</div>`,
        "text/html"
      );
      const container = doc.querySelector("div"); // Get the wrapper div

      if (!container) {
        console.warn("Could not find container element in parsed HTML.");
        return htmlContent;
      }

      // Temukan semua tag <img>
      const imgElements = container.querySelectorAll("img");

      imgElements.forEach((img) => {
        const src = img.getAttribute("src");
        // Periksa apakah src adalah path relatif yang dimulai dengan /images/
        if (src && src.startsWith("/images/")) {
          try {
            // Buat URL absolut
            const absoluteUrl = new URL(src, backendBaseUrl).href;
            img.setAttribute("src", absoluteUrl);
          } catch (urlError) {
            console.error(
              `Failed to construct absolute URL for image src: ${src}`,
              urlError
            );
          }
        }
      });

      // Kembalikan HTML yang sudah dimodifikasi (ambil innerHTML dari wrapper)
      return container.innerHTML;
    } catch (parseError) {
      console.error(
        "Failed to parse HTML content to fix image URLs:",
        parseError
      );
      // Jika parsing gagal, kembalikan konten asli
      return htmlContent;
    }
  } else {
    // Fallback jika DOMParser tidak tersedia
    console.warn(
      "DOMParser is not available. Cannot reliably fix image URLs in HTML content."
    );
    return htmlContent;
  }
};

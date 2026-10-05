const normalizeHeading = (heading) => {
  if (typeof heading === "string") return { title: heading.trim(), body: "" };
  if (!heading || typeof heading !== "object") return null;

  return {
    title: String(heading.headings_title ?? heading.title ?? "").trim(),
    body: String(heading.headings_body ?? heading.body ?? "").trim(),
  };
};

export const parseFormHeadings = (value) => {
  if (!value) return [];

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    const headings = Array.isArray(parsed) ? parsed : [parsed];
    return headings.map(normalizeHeading).filter((heading) => heading?.title || heading?.body);
  } catch {
    const text = String(value).trim();
    return text ? [{ title: "", body: text }] : [];
  }
};

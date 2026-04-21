
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "https://doqai.onrender.com").replace(/\/$/, "");
export const CLASSIFY_EXTRACT_PATH = "/api/v1/upload/"; 

/**
 * Calls the document classification + extraction API.
 * Backend always returns { message, document_type, text }.
 * The frontend is responsible for showing only what the user asked for.
 */
export async function processDocument(file) {
  const form = new FormData();
  form.append("file", file);

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${CLASSIFY_EXTRACT_PATH}`, {
      method: "POST",
      body: form,
    });
  } catch (error) {
    throw new Error(
      `Network error reaching ${API_BASE_URL}. Check that the backend is running and that CORS allows your frontend origin.`
    );
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${txt || res.statusText}`);
  }
  return res.json();
}

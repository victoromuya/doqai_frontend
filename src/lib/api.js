
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export const CLASSIFY_EXTRACT_PATH = "/api/v1/upload/"; 
export const EXTRACT_ONLY_PATH = "/api/v1/upload/extract/";

/**
 * Calls the document classification + extraction API.
 * Backend always returns { message, document_type, text }.
 * The frontend is responsible for showing only what the user asked for.
 */
export async function processDocument(file, options = {}) {
  const form = new FormData();
  form.append("file", file);
  if (options.jobDescription) {
    form.append("job_description", options.jobDescription);
  }

  const res = await fetch(`${API_BASE_URL}${CLASSIFY_EXTRACT_PATH}`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    // Try to parse the JSON error, fallback to raw text if it fails
    let errorData;
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = await res.text();
    }
    
    // Throw an object instead of a string so the UI can pick out 'message'
    const error = new Error("API Request Failed");
    error.status = res.status;
    error.data = errorData;
    throw error;
  }
  return res.json();
}


export async function extractOnly(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE_URL}${EXTRACT_ONLY_PATH}`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = await res.text();
    }
    
    const error = new Error("API Request Failed");
    error.status = res.status;
    error.data = errorData;
    throw error;
  }
  return res.json();
}
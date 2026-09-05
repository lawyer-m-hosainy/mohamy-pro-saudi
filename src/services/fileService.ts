import { supabase } from "@/lib/supabase/client";
import { getCurrentTenantId } from "@/lib/tenant";
import { logEvent } from "@/observability/logger";
import { handleDatabaseError, OperationType } from "@/lib/error";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx", "txt"]);
const STORAGE_BUCKET = "documents";

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function validateUpload(file: File) {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }
  const ext = getFileExtension(file.name);
  if (!ALLOWED_MIME_TYPES.has(file.type) || !ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error("FILE_TYPE_NOT_ALLOWED");
  }
}

async function writeUploadAudit(caseId: string, path: string, file: File) {
  try {
    const tenantId = getCurrentTenantId();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || "unknown";

    await supabase.from("audit_logs").insert({
      tenant_id: tenantId,
      user_id: userId,
      action: "document_upload",
      module: "cases",
      details: `Uploaded ${sanitizeFileName(file.name)} (${file.size} bytes, ${file.type}) for case ${caseId} at ${path}`,
    });
  } catch (err) {
    // Non-blocking for UX; upload should not fail because audit write fails.
  }
}

/**
 * The "documents" bucket is private (legal documents are confidential) —
 * uploading returns the storage path, not a fetchable URL. Use
 * getDocumentSignedUrl() to generate a short-lived download link on demand.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  validateUpload(file);

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    logEvent("error", { event: "file_upload_failed", context: { path, error: error.message } });
    throw new Error(error.message);
  }

  logEvent("info", { event: "file_upload_success", context: { path } });
  return path;
}

export async function getDocumentSignedUrl(path: string, expiresInSeconds = 300): Promise<string> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function deleteStoredFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) throw new Error(error.message);
}

export function buildCaseUploadPath(caseId: string, fileName: string) {
  const tenantId = getCurrentTenantId();
  const safeName = sanitizeFileName(fileName);
  return `${tenantId}/cases/${caseId}/${Date.now()}_${safeName}`;
}

/** For documents not (yet) linked to a specific case — the Documents.tsx general library. */
export function buildDocumentUploadPath(fileName: string) {
  const tenantId = getCurrentTenantId();
  const safeName = sanitizeFileName(fileName);
  return `${tenantId}/documents/${Date.now()}_${safeName}`;
}

export async function uploadCaseDocument(file: File, caseId: string) {
  const path = buildCaseUploadPath(caseId, file.name);

  const UPLOAD_TIMEOUT_MS = 15_000;
  const uploadPromise = uploadFile(file, path);
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("UPLOAD_TIMEOUT")), UPLOAD_TIMEOUT_MS)
  );

  try {
    const url = await Promise.race([uploadPromise, timeoutPromise]);
    await writeUploadAudit(caseId, path, file);
    return { url, path };
  } catch (error) {
    if (error instanceof Error && error.message === "UPLOAD_TIMEOUT") {
      throw new Error("انتهت مهلة رفع الملف. يرجى التحقق من الاتصال.");
    }
    throw error;
  }
}

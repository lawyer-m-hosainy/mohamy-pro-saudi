export async function checkAppHealth() {
  const response = await fetch("/api/health", { method: "GET" });
  if (!response.ok) {
    throw new Error("HEALTHCHECK_FAILED");
  }
  return response.json();
}

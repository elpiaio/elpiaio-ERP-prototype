export async function fetchJson<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`fetch error ${res.status} ${res.statusText} - ${text}`);
  }
  return res.json() as Promise<T>;
}

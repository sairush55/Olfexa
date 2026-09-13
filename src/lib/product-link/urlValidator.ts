/**
 * OLFEXA — Safe URL Validation & SSRF Prevention
 * 
 * Validates user input before server-side fetching.
 * Rejects empty input, invalid protocols, and private/internal network addresses.
 */

export interface UrlValidationResult {
  isValid: boolean;
  sanitizedUrl?: string;
  errorMessage?: string;
  error?: string;
}

const DEFAULT_USER_ERROR = "Please enter a valid product page URL.";

function isPrivateOrLocalIp(hostname: string): boolean {
  const host = hostname.toLowerCase();

  // Localhost names
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".test") ||
    host.endsWith(".example") ||
    host.endsWith(".invalid")
  ) {
    return true;
  }

  // IPv6 loopback / local
  if (host === "::1" || host === "[::1]" || host.startsWith("fe80:") || host.startsWith("[fe80:")) {
    return true;
  }

  // IPv4 checks
  const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const octet1 = parseInt(ipv4Match[1], 10);
    const octet2 = parseInt(ipv4Match[2], 10);

    // 0.0.0.0/8
    if (octet1 === 0) return true;
    // 127.0.0.0/8 Loopback
    if (octet1 === 127) return true;
    // 10.0.0.0/8 Private network
    if (octet1 === 10) return true;
    // 172.16.0.0/12 Private network (172.16.0.0 – 172.31.255.255)
    if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return true;
    // 192.168.0.0/16 Private network
    if (octet1 === 192 && octet2 === 168) return true;
    // 169.254.0.0/16 Link-local / Cloud metadata (AWS/GCP/Azure)
    if (octet1 === 169 && octet2 === 254) return true;
  }

  return false;
}

export function validateProductUrl(input?: string | null): UrlValidationResult {
  if (!input || typeof input !== "string" || input.trim().length === 0) {
    return {
      isValid: false,
      errorMessage: DEFAULT_USER_ERROR,
      error: DEFAULT_USER_ERROR,
    };
  }

  const raw = input.trim();

  // Explicitly reject dangerous pseudoprotocols
  if (
    /^(javascript|file|data|vbscript|blob|ftp|ftps|gopher|mailto|tel|ws|wss):/i.test(raw)
  ) {
    return {
      isValid: false,
      errorMessage: DEFAULT_USER_ERROR,
      error: DEFAULT_USER_ERROR,
    };
  }

  // Add protocol if user typed example.com/product without protocol
  let urlString = raw;
  if (!/^https?:\/\//i.test(urlString)) {
    urlString = `https://${urlString}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    return {
      isValid: false,
      errorMessage: DEFAULT_USER_ERROR,
      error: DEFAULT_USER_ERROR,
    };
  }

  // Must be http or https
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      isValid: false,
      errorMessage: DEFAULT_USER_ERROR,
      error: DEFAULT_USER_ERROR,
    };
  }

  // Must have a valid hostname with at least one dot (e.g. brand.com, not bare hostnames)
  if (!parsed.hostname || !parsed.hostname.includes(".")) {
    return {
      isValid: false,
      errorMessage: DEFAULT_USER_ERROR,
      error: DEFAULT_USER_ERROR,
    };
  }

  // Check SSRF & private IP addresses
  if (isPrivateOrLocalIp(parsed.hostname)) {
    return {
      isValid: false,
      errorMessage: DEFAULT_USER_ERROR,
      error: DEFAULT_USER_ERROR,
    };
  }

  return {
    isValid: true,
    sanitizedUrl: parsed.href,
  };
}

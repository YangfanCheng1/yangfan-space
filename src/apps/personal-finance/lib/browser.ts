/** Small browser helpers. Kept out of components so they're easy to find and mock. */

/**
 * Can this page persist to localStorage? False in some private modes, with
 * site data blocked, or when the quota is full (spec §7: warn, keep working).
 */
export function canPersist(): boolean {
  try {
    const key = '__pf_probe__'
    window.localStorage.setItem(key, '1')
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

/** Offer `text` as a file download. */
export function downloadText(filename: string, text: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1_000)
}

/** Read a user-picked file as text. */
export function readFileText(file: File): Promise<string> {
  return file.text()
}

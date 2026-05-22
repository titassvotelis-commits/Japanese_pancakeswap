/** Phone / tablet browser (not desktop). */
export function isMobileBrowser(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }
  const ua = navigator.userAgent || ''
  return /android|iphone|ipad|ipod|mobile|webos|blackberry|iemobile|opera mini/i.test(ua)
}

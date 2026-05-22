export const NAV_LOGO_MK_OPEN_CLASS = 'nav-logo-mk-open'
export const NAV_LOGO_MK_DISMISSED_CLASS = 'nav-logo-mk-dismissed'

/** Collapse the header logo JNTo price dropdown (also blocks :hover reopen until mouse leaves). */
export function closeNavLogoMkDropdown(): void {
  document.querySelectorAll('.nav-logo-dropdown-anchor').forEach((el) => {
    el.classList.remove(NAV_LOGO_MK_OPEN_CLASS)
    el.classList.add(NAV_LOGO_MK_DISMISSED_CLASS)
  })
}

export function clearNavLogoMkDismissed(): void {
  document.querySelectorAll('.nav-logo-dropdown-anchor').forEach((el) => {
    el.classList.remove(NAV_LOGO_MK_DISMISSED_CLASS)
  })
}

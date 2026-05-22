/**
 * Keep header nav dropdowns open on hover (button + menu panel) with a short close delay.
 */
const fs = require('fs')
const path = require('path')

const distDir = path.join(__dirname, '..', 'node_modules', '@pancakeswap', 'uikit', 'dist')

const HOVER_EFFECT_RE =
  /useEffect\(function \(\) \{\s*var showDropdownMenu = function \(\) \{\s*setIsOpen\(true\);\s*\};\s*var hideDropdownMenu = function \(evt\) \{\s*var target = evt\.target;\s*return target && !\(tooltipRef === null \|\| tooltipRef === void 0 \? void 0 : tooltipRef\.contains\(target\)\) && setIsOpen\(false\);\s*\};\s*targetRef === null \|\| targetRef === void 0 \? void 0 : targetRef\.addEventListener\("mouseenter", showDropdownMenu\);\s*targetRef === null \|\| targetRef === void 0 \? void 0 : targetRef\.addEventListener\("mouseleave", hideDropdownMenu\);\s*return function \(\) \{\s*targetRef === null \|\| targetRef === void 0 \? void 0 : targetRef\.removeEventListener\("mouseenter", showDropdownMenu\);\s*targetRef === null \|\| targetRef === void 0 \? void 0 : targetRef\.removeEventListener\("mouseleave", hideDropdownMenu\);\s*\};\s*\}, \[targetRef, tooltipRef, setIsOpen, isBottomNav\]\);/

const NEW_HOVER_EFFECT = `useEffect(function () {
        var hideTimer;
        var showDropdownMenu = function () {
            if (hideTimer) {
                clearTimeout(hideTimer);
                hideTimer = null;
            }
            setIsOpen(true);
        };
        var hideDropdownMenu = function () {
            hideTimer = setTimeout(function () {
                setIsOpen(false);
            }, 150);
        };
        if (targetRef) {
            targetRef.addEventListener("mouseenter", showDropdownMenu);
            targetRef.addEventListener("mouseleave", hideDropdownMenu);
        }
        if (tooltipRef) {
            tooltipRef.addEventListener("mouseenter", showDropdownMenu);
            tooltipRef.addEventListener("mouseleave", hideDropdownMenu);
        }
        return function () {
            if (hideTimer) {
                clearTimeout(hideTimer);
            }
            if (targetRef) {
                targetRef.removeEventListener("mouseenter", showDropdownMenu);
                targetRef.removeEventListener("mouseleave", hideDropdownMenu);
            }
            if (tooltipRef) {
                tooltipRef.removeEventListener("mouseenter", showDropdownMenu);
                tooltipRef.removeEventListener("mouseleave", hideDropdownMenu);
            }
        };
    }, [targetRef, tooltipRef, setIsOpen, isBottomNav]);`

const MARKER = 'nav-hover-patch-v1'

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn('Skip missing', filePath)
    return false
  }
  let content = fs.readFileSync(filePath, 'utf8')
  if (content.includes(MARKER)) {
    console.log('Nav hover patch already applied in', path.basename(filePath))
    return false
  }
  if (!HOVER_EFFECT_RE.test(content)) {
    console.warn('Nav hover pattern not found in', path.basename(filePath), '- skip')
    return false
  }
  HOVER_EFFECT_RE.lastIndex = 0
  content = content.replace(HOVER_EFFECT_RE, `${NEW_HOVER_EFFECT}\n    /* ${MARKER} */`)
  fs.writeFileSync(filePath, content)
  console.log('Patched nav hover dropdown in', path.basename(filePath))
  return true
}

;['index.esm.js', 'index.cjs.js'].forEach((file) => {
  patchFile(path.join(distDir, file))
})

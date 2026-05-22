/**
 * Replace Optimus SVG logos in @pancakeswap/uikit with MetakeySwap image logos.
 */
const fs = require('fs')
const path = require('path')

const ICON_SRC = '/images/metakey-logo-icon.png'
const LOGO_SRC = '/images/metakey-logo-with-text.png'
const distDir = path.join(__dirname, '..', 'node_modules', '@pancakeswap', 'uikit', 'dist')

const innerLogoEsm = `var innerLogo = (React__default.createElement("img", { src: "${LOGO_SRC}", alt: "MetakeySwap", className: "desktop-icon metakey-logo" }));`

const innerLogoCjs = `var innerLogo = (React__default['default'].createElement("img", { src: "${LOGO_SRC}", alt: "MetakeySwap", className: "desktop-icon metakey-logo" }));`

const iconPatchEsm = `var Icon$_ = function (props) {
    return (React__default.createElement("img", __assign({ src: "${ICON_SRC}", alt: "MetakeySwap" }, props, { style: Object.assign({ height: props.height || props.width || "24px", width: props.width || "24px", objectFit: "contain" }, props.style) })));
};`

const iconPatchCjs = `var Icon$_ = function (props) {
    return (React__default['default'].createElement("img", __assign({ src: "${ICON_SRC}", alt: "MetakeySwap" }, props, { style: Object.assign({ height: props.height || props.width || "24px", width: props.width || "24px", objectFit: "contain" }, props.style) })));
};`

const logoFragmentRe =
  /var innerLogo = \(React__default(?:\['default'\])?\.createElement\(React__default(?:\['default'\])?\.Fragment, null,\s*React__default(?:\['default'\])?\.createElement\(LogoWithTextIcon, \{ className: "desktop-icon", isDark: isDark \}\)\)\);/g

const logoDualImgRe =
  /var innerLogo = \(React__default(?:\['default'\])?\.createElement\(React__default(?:\['default'\])?\.Fragment, null,[\s\S]*?className: "desktop-icon metakey-logo" \}\)\)\);/g

const MK_SWAP_URL =
  'https://metakeyswap.com/swap?outputCurrency=0xCDAf21b8d0f7c17010626c18C81663f6c38D724c'

const replacements = [
  { from: 'aria-label": "Optimus home page"', to: 'aria-label": "MetakeySwap home page"' },
  {
    from: 'React__default.createElement(Icon$_, { width: "24px", mr: "8px" })',
    to: 'React__default.createElement(Icon$_, { width: "28px", height: "28px", mr: "8px" })',
  },
  {
    from: "React__default['default'].createElement(Icon$_, { width: \"24px\", mr: \"8px\" })",
    to: "React__default['default'].createElement(Icon$_, { width: \"28px\", height: \"28px\", mr: \"8px\" })",
  },
  {
    from: 'href: "https://optimuswap.io/swap?outputCurrency=0xDFE29AFdF5A7D0bb92A01A56Adabfa87D652E0E7"',
    to: `href: "${MK_SWAP_URL}"`,
  },
]

;['index.cjs.js', 'index.esm.js'].forEach((file) => {
  const filePath = path.join(distDir, file)
  if (!fs.existsSync(filePath)) {
    console.warn('Skip missing', file)
    return
  }
  let content = fs.readFileSync(filePath, 'utf8')
  let changed = false
  const isCjs = file.includes("['default']")
  const innerLogo = isCjs ? innerLogoCjs : innerLogoEsm
  const iconPatch = isCjs ? iconPatchCjs : iconPatchEsm

  if (logoFragmentRe.test(content)) {
    logoFragmentRe.lastIndex = 0
    content = content.replace(logoFragmentRe, innerLogo)
    changed = true
  } else if (logoDualImgRe.test(content)) {
    logoDualImgRe.lastIndex = 0
    content = content.replace(logoDualImgRe, innerLogo)
    changed = true
  } else if (
    !content.includes('className: "desktop-icon metakey-logo"') ||
    content.includes('mobile-icon metakey-logo-icon')
  ) {
    const logoStart = content.indexOf('var innerLogo = (')
    const logoEnd = content.indexOf(';\n    return (React__default', logoStart)
    if (logoStart !== -1 && logoEnd !== -1 && content.slice(logoStart, logoEnd).includes('mobile-icon')) {
      content = content.slice(0, logoStart) + innerLogo + content.slice(logoEnd)
      changed = true
    }
  }

  const iconStart = content.indexOf('var Icon$_ = function')
  const iconEnd = content.indexOf('\nvar Icon$Z = function', iconStart)
  if (iconStart !== -1 && iconEnd !== -1) {
    const iconBlock = content.slice(iconStart, iconEnd)
    if (!iconBlock.includes('metakey-logo-icon.png') || iconBlock.includes('"28px"')) {
      content = content.slice(0, iconStart) + iconPatch + content.slice(iconEnd)
      changed = true
    }
  }

  replacements.forEach(({ from, to }) => {
    if (content.includes(from)) {
      content = content.replaceAll(from, to)
      changed = true
    }
  })

  if (changed) {
    fs.writeFileSync(filePath, content)
    console.log('Patched uikit logo in', file)
  } else if (
    content.includes('desktop-icon metakey-logo') &&
    !content.includes('mobile-icon metakey-logo-icon')
  ) {
    console.log('Already patched', file)
  } else {
    console.warn('No logo patch applied for', file)
  }
})

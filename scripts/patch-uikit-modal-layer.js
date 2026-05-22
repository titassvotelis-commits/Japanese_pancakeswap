/**
 * Render modals after app content (not underneath) and raise z-index above fixed nav (20).
 */
const fs = require('fs')
const path = require('path')

const distDir = path.join(__dirname, '..', 'node_modules', '@pancakeswap', 'uikit', 'dist')

const ZINDEX_OLD = 'return theme.zIndices.modal - 1;'
const ZINDEX_NEW = 'return 1100;'

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn('Skip missing', filePath)
    return false
  }
  let content = fs.readFileSync(filePath, 'utf8')
  const useCrLf = content.includes('\r\n')
  if (useCrLf) {
    content = content.replace(/\r\n/g, '\n')
  }
  let changed = false
  const isCjs = filePath.endsWith('.cjs.js')
  const react = isCjs ? "React__default['default']" : 'React__default'

  const portalFn = isCjs ? 'reactDom.createPortal' : 'createPortal'

  const MODAL_BLOCK = `isOpen && (${react}.createElement(ModalWrapper, null,
            ${react}.createElement(Overlay, { onClick: handleOverlayDismiss }),
            ${react}.isValidElement(modalNode) &&
                ${react}.cloneElement(modalNode, {
                    onDismiss: handleDismiss,
                }))),`

  const ORDER_OLD = `        } },
        ${MODAL_BLOCK}
        children));`

  const ORDER_NEW = `        } },
        children,
        isOpen && (portalRootModal ? ${portalFn}(${react}.createElement(ModalWrapper, null,
            ${react}.createElement(Overlay, { onClick: handleOverlayDismiss }),
            ${react}.isValidElement(modalNode) &&
                ${react}.cloneElement(modalNode, {
                    onDismiss: handleDismiss,
                })), portalRootModal) : ${react}.createElement(ModalWrapper, null,
            ${react}.createElement(Overlay, { onClick: handleOverlayDismiss }),
            ${react}.isValidElement(modalNode) &&
                ${react}.cloneElement(modalNode, {
                    onDismiss: handleDismiss,
                })))));`

  const portalDecl = 'var portalRootModal = document.getElementById("portal-root");'

  if (!content.includes('portalRootModal') && content.includes('var ModalProvider = function')) {
    content = content.replace('var ModalProvider = function', `${portalDecl}\nvar ModalProvider = function`)
    changed = true
    console.log('Added portalRootModal in', path.basename(filePath))
  }

  if (content.includes(ORDER_OLD)) {
    content = content.replace(ORDER_OLD, ORDER_NEW)
    changed = true
    console.log('Reordered ModalProvider layer in', path.basename(filePath))
  } else if (content.includes('children,\n        isOpen && (')) {
    const fixedClose = '\n                    onDismiss: handleDismiss,\n                }' + ')' + ')' + ')' + ')' + ')' + ');'
    if (content.includes('onDismiss: handleDismiss,\n                })));')) {
      content = content.replace(
        'onDismiss: handleDismiss,\n                })));',
        fixedClose.slice(1),
      )
      changed = true
      console.log('Fixed ModalProvider parens in', path.basename(filePath))
    } else {
      console.log('Modal layer order already patched in', path.basename(filePath))
    }
  }

  if (content.includes(ZINDEX_OLD)) {
    content = content.replace(new RegExp(ZINDEX_OLD.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), ZINDEX_NEW)
    changed = true
    console.log('Raised ModalWrapper z-index in', path.basename(filePath))
  }

  const WRAPPER_PAD_OLD =
    'justify-content: center;\n  align-items: center;\n  position: fixed;'
  const WRAPPER_PAD_NEW =
    'justify-content: center;\n  align-items: center;\n  padding: 16px;\n  box-sizing: border-box;\n  position: fixed;'

  if (content.includes(WRAPPER_PAD_OLD) && !content.includes('padding: 16px;\n  box-sizing: border-box;\n  position: fixed;')) {
    content = content.split(WRAPPER_PAD_OLD).join(WRAPPER_PAD_NEW)
    changed = true
    console.log('Added ModalWrapper padding in', path.basename(filePath))
  }

  const CONNECT_MODAL_OLD = `${react}.createElement(ModalContainer, { minWidth: "320px" }`
  const CONNECT_MODAL_NEW = `${react}.createElement(ModalContainer, { minWidth: "min(320px, calc(100vw - 32px))", width: "min(340px, calc(100vw - 32px))" }`

  if (content.includes(CONNECT_MODAL_OLD)) {
    content = content.replaceAll(CONNECT_MODAL_OLD, CONNECT_MODAL_NEW)
    changed = true
    console.log('Responsive ConnectModal width in', path.basename(filePath))
  }

  const WALLET_MODAL_OLD = `useModal(${react}.createElement(ConnectModal, { login: login, t: t }))[0]`
  const WALLET_MODAL_NEW = `useModal(${react}.createElement(ConnectModal, { login: login, t: t }), true, false, "nav-connect-modal")[0]`

  if (content.includes(WALLET_MODAL_OLD)) {
    content = content.replaceAll(WALLET_MODAL_OLD, WALLET_MODAL_NEW)
    changed = true
    console.log('Dedicated nav-connect-modal id in', path.basename(filePath))
  }

  if (changed) {
    if (useCrLf) {
      content = content.replace(/\n/g, '\r\n')
    }
    fs.writeFileSync(filePath, content)
  }
  return changed
}

;['index.esm.js', 'index.cjs.js'].forEach((file) => {
  patchFile(path.join(distDir, file))
})

export function initModals() {
  // Inicializar cierres estándar de modal si es necesario,
  // pero generalmente se manejan al abrir.
  
  // Botones de cierre para modal de confirmación
  const closeConfirm = document.getElementById('closeConfirmModal')
  const cancelConfirm = document.getElementById('confirmCancelBtn')
  
  if (closeConfirm) closeConfirm.addEventListener('click', hideConfirmModal)
  if (cancelConfirm) cancelConfirm.addEventListener('click', hideConfirmModal)
  
  // Botones de cierre para modal de información
  const closeInfo = document.getElementById('closeInfoModal')
  const okInfo = document.getElementById('infoOkBtn')
  
  if (closeInfo) closeInfo.addEventListener('click', hideInfoModal)
  if (okInfo) okInfo.addEventListener('click', hideInfoModal)
}

let onConfirmCallback = null
let onInfoCallback = null

// Lógica del Modal de Confirmación
export function showConfirmModal(title, message, callback) {
  const modal = document.getElementById('confirmModal')
  const titleEl = document.getElementById('confirmTitle')
  const msgEl = document.getElementById('confirmMessage')
  const okBtn = document.getElementById('confirmOkBtn')
  
  if (title) titleEl.textContent = title
  if (message) msgEl.textContent = message
  
  onConfirmCallback = callback
  
  // Remover listeners anteriores para evitar la pila
  const newOkBtn = okBtn.cloneNode(true)
  okBtn.parentNode.replaceChild(newOkBtn, okBtn)
  
  newOkBtn.addEventListener('click', () => {
    if (onConfirmCallback) onConfirmCallback()
    hideConfirmModal()
  })
  
  newOkBtn.focus()
  
  modal.style.display = 'flex'
}

export function hideConfirmModal() {
  const modal = document.getElementById('confirmModal')
  modal.style.display = 'none'
  onConfirmCallback = null
}

// Lógica del Modal de Información
export function showInfoModal(title, message, callback) {
  const modal = document.getElementById('infoModal')
  const titleEl = document.getElementById('infoTitle')
  const msgEl = document.getElementById('infoMessage')
  const okBtn = document.getElementById('infoOkBtn')
  
  if (title) titleEl.textContent = title
  if (message) msgEl.textContent = message
  
  onInfoCallback = callback
  
  // Manejar el clic de OK específicamente si se necesita un callback
  const newOkBtn = okBtn.cloneNode(true)
  okBtn.parentNode.replaceChild(newOkBtn, okBtn)
  
  newOkBtn.addEventListener('click', () => {
    if (onInfoCallback) onInfoCallback()
    hideInfoModal()
  })
  
  newOkBtn.focus()
  
  modal.style.display = 'flex'
}

export function hideInfoModal() {
  const modal = document.getElementById('infoModal')
  modal.style.display = 'none'
  onInfoCallback = null
}

const status = document.querySelector('.copy-hint');
let resetStatus;
async function copyContact(value) {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(value); return; } catch { /* Try the selection fallback. */ }
  }
  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.cssText = 'position:fixed;left:-9999px;top:0;font-size:16px';
  document.body.append(field);
  const previousFocus = document.activeElement;
  try {
    field.select();
    if (!document.execCommand('copy')) throw new Error('Copy unavailable');
  } finally {
    field.remove();
    previousFocus?.focus({ preventScroll: true });
  }
}
document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    clearTimeout(resetStatus);
    try {
      await copyContact(button.dataset.copy);
      status.textContent = 'Copied to clipboard';
    } catch {
      status.textContent = 'Press and hold the detail to select and copy';
    }
    resetStatus = setTimeout(() => { status.textContent = ''; }, 3000);
  });
});

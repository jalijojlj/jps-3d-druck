/**
 * Progressive enhancement & fallback utilities following modern web best practices:
 * 1. Light-dismiss fallback for <dialog closedby="any"> on browsers without closedBy (e.g. Safari)
 * 2. ARIA sync for :user-invalid form validation
 */

export function attachDialogLightDismissFallback(dialog: HTMLDialogElement | null): () => void {
  if (!dialog) return () => {};
  if ('closedBy' in HTMLDialogElement.prototype) return () => {};

  const isOutside = (e: PointerEvent) => {
    const r = dialog.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };

  let pressedOutside = false;
  const onPointerDown = (e: PointerEvent) => {
    pressedOutside = isOutside(e);
  };
  const onPointerUp = (e: PointerEvent) => {
    if (pressedOutside && isOutside(e)) {
      dialog.close();
    }
    pressedOutside = false;
  };

  dialog.addEventListener('pointerdown', onPointerDown);
  dialog.addEventListener('pointerup', onPointerUp);

  return () => {
    dialog.removeEventListener('pointerdown', onPointerDown);
    dialog.removeEventListener('pointerup', onPointerUp);
  };
}

let announcerEl: HTMLDivElement | null = null;
let announceTimer: number | undefined;

function getAnnouncer(): HTMLDivElement {
  if (!announcerEl) {
    announcerEl = document.createElement('div');
    announcerEl.setAttribute('aria-live', 'polite');
    announcerEl.className = 'visually-hidden';
    document.body.append(announcerEl);
  }
  return announcerEl;
}

export function attachFormValidationAria(form: HTMLFormElement | null): () => void {
  if (!form) return () => {};
  const flagged = new WeakSet<Element>();
  const announcer = getAnnouncer();

  const linkError = (el: HTMLElement, shown: boolean) => {
    const errorId = el.dataset.error;
    if (!errorId) return;
    const ids = (el.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter((id) => id && id !== errorId);
    if (shown) ids.push(errorId);
    if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
    else el.removeAttribute('aria-describedby');
  };

  const syncAria = (el: EventTarget | null, announce = false) => {
    if (!(el instanceof HTMLElement)) return;
    if (!el.matches('input, select, textarea')) return;

    let invalid = false;
    try {
      invalid = el.matches(':user-invalid');
    } catch {
      invalid = !(el as HTMLInputElement).validity.valid;
    }

    if (invalid) {
      el.setAttribute('aria-invalid', 'true');
      linkError(el, true);
      flagged.add(el);
      if (announce && el.dataset.error) {
        const errEl = document.getElementById(el.dataset.error);
        if (errEl) {
          window.clearTimeout(announceTimer);
          announcer.textContent = '';
          announceTimer = window.setTimeout(() => {
            announcer.textContent = errEl.textContent?.trim() || '';
          }, 400);
        }
      }
    } else if (flagged.has(el) || el.getAttribute('aria-invalid') !== 'true') {
      el.setAttribute('aria-invalid', 'false');
      linkError(el, false);
      flagged.delete(el);
    }
  };

  form.querySelectorAll('input, select, textarea').forEach((el) => {
    el.setAttribute('aria-invalid', 'false');
  });

  const onBlur = (e: Event) => syncAria(e.target, true);
  const onInput = (e: Event) => {
    if (e.target instanceof HTMLElement && e.target.hasAttribute('aria-invalid')) {
      syncAria(e.target, false);
    }
  };
  const onInvalid = (e: Event) => syncAria(e.target, false);

  form.addEventListener('blur', onBlur, true);
  form.addEventListener('input', onInput);
  form.addEventListener('invalid', onInvalid, true);

  return () => {
    form.removeEventListener('blur', onBlur, true);
    form.removeEventListener('input', onInput);
    form.removeEventListener('invalid', onInvalid, true);
  };
}

/**
 * inquiry_form.ts — Handles inquiry form validation and submission
 * via fetch to /api/contact.
 *
 * Validation: per-field error highlighting + inline error messages
 * matching the DS Input component error pattern (orange border, error span).
 */

function initInquiryForm(): void {
  const form = document.getElementById('inquiry-form') as HTMLFormElement | null;
  const status = document.getElementById('inquiry-status');

  if (!form || !status) return;

  /** Remove error state from a specific input by name. */
  function clearFieldError(name: string): void {
    const input = form!.querySelector(`[name="${name}"]`) as HTMLElement | null;
    if (!input) return;
    input.classList.remove('inquiry__input--error');
    const existing = input.parentElement?.querySelector('.inquiry__field-error');
    if (existing) existing.remove();
  }

  /** Add error state to a specific input by name. */
  function setFieldError(name: string, message: string): void {
    const input = form!.querySelector(`[name="${name}"]`) as HTMLElement | null;
    if (!input) return;
    input.classList.add('inquiry__input--error');
    const existing = input.parentElement?.querySelector('.inquiry__field-error');
    if (existing) existing.remove();
    const span = document.createElement('span');
    span.className = 'inquiry__field-error';
    span.textContent = message;
    input.parentElement?.appendChild(span);
  }

  /** Clear all field errors and the status message. */
  function clearAllErrors(): void {
    form!.querySelectorAll('.inquiry__input--error').forEach((el) => {
      el.classList.remove('inquiry__input--error');
    });
    form!.querySelectorAll('.inquiry__field-error').forEach((el) => {
      el.remove();
    });
    status!.textContent = '';
    status!.className = 'inquiry__status';
  }

  /** Clear individual field error on input. */
  form.addEventListener('input', (e: Event) => {
    const target = e.target as HTMLInputElement | null;
    if (target?.name) clearFieldError(target.name);
  });

  form.addEventListener('submit', async (e: SubmitEvent) => {
    e.preventDefault();
    clearAllErrors();

    const formData = Object.fromEntries(new FormData(form)) as Record<string, string>;
    let hasErrors = false;

    /* Required field checks */
    if (!formData.name?.trim()) {
      setFieldError('name', 'Name is required.');
      hasErrors = true;
    }
    if (!formData.email?.trim()) {
      setFieldError('email', 'Email is required.');
      hasErrors = true;
    }
    if (!formData.verify_email?.trim()) {
      setFieldError('verify_email', 'Please confirm your email.');
      hasErrors = true;
    }

    /* Match checks */
    if (formData.email && formData.verify_email && formData.email !== formData.verify_email) {
      setFieldError('verify_email', 'Email addresses do not match.');
      hasErrors = true;
    }
    if (formData.phone?.trim() && formData.verify_phone !== formData.phone) {
      setFieldError('verify_phone', 'Phone numbers do not match.');
      hasErrors = true;
    }

    if (hasErrors) {
      status.textContent = 'Please correct the errors above.';
      status.className = 'inquiry__status inquiry__status--error';
      return;
    }

    /* Honeypot check */
    if (formData.website?.trim()) {
      status.textContent = "Sent \u2014 we\u2019ll be in touch.";
      status.className = 'inquiry__status inquiry__status--success';
      form.reset();
      return;
    }

    /* Strip verify and honeypot fields before sending */
    const { verify_email: _ve, verify_phone: _vp, website: _hp, ...data } = formData;

    status.textContent = 'Sending\u2026';
    status.className = 'inquiry__status inquiry__status--sending';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        status.textContent = "Sent \u2014 we\u2019ll be in touch.";
        status.className = 'inquiry__status inquiry__status--success';
        form.reset();
      } else {
        const body = await res.json().catch(() => ({})) as Record<string, string>;
        status.textContent = body.error || 'Something went wrong. Please try again.';
        status.className = 'inquiry__status inquiry__status--error';
      }
    } catch {
      status.textContent = 'Network error. Please try again.';
      status.className = 'inquiry__status inquiry__status--error';
    }
  });
}

initInquiryForm();

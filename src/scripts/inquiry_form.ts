/**
 * inquiry_form.ts — Handles inquiry form submission via fetch to /api/contact.
 * Imported by Inquiry.astro as a client-side script.
 */

function initInquiryForm(): void {
  const form = document.getElementById('inquiry-form') as HTMLFormElement | null;
  const status = document.getElementById('inquiry-status');

  if (!form || !status) return;

  form.addEventListener('submit', async (e: SubmitEvent) => {
    e.preventDefault();
    status.textContent = 'Sending\u2026';
    status.className = 'inquiry__status';

    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        status.textContent = "Sent \u2014 we'll be in touch.";
        status.classList.add('inquiry__status--success');
        form.reset();
      } else {
        const body = await res.json().catch(() => ({})) as Record<string, string>;
        status.textContent = body.error || 'Something went wrong. Please try again.';
        status.classList.add('inquiry__status--error');
      }
    } catch {
      status.textContent = 'Network error. Please try again.';
      status.classList.add('inquiry__status--error');
    }
  });
}

initInquiryForm();

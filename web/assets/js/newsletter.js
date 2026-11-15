document.addEventListener("DOMContentLoaded", function () {
  const newsletter = document.getElementById("newsletter-form");
  if (newsletter) {
    newsletter.addEventListener("submit", async function (event) {
      event.preventDefault();
      const button = newsletter.querySelector('button[type="submit"]');
      if (button.disabled) return;
      const status = document.getElementById("newsletter-status");
      button.disabled = true;
      status.textContent = "Submitting…";
      try {
        await fetch(newsletter.action, {
          method: "POST",
          body: new FormData(newsletter),
          mode: "no-cors",
        });
        newsletter.hidden = true;
        status.textContent = "Check your inbox for the confirmation email.";
      } catch {
        status.textContent = "Couldn’t submit the form. Please try again.";
      } finally {
        button.disabled = false;
      }
    });
  }

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const button = contactForm.querySelector('button[type="submit"]');
      if (button.disabled) return;
      const status = document.getElementById("contact-status");
      button.disabled = true;
      status.textContent = "Sending your message…";
      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Submission failed");
        contactForm.hidden = true;
        status.textContent = "Message sent. Thanks for reaching out!";
      } catch {
        status.textContent = "Your message could not be sent. Please try again or message me on LinkedIn.";
      } finally {
        button.disabled = false;
      }
    });
  }
});

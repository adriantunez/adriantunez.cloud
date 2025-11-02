// Newsletter form functionality
document.addEventListener("DOMContentLoaded", function () {
  const newsletterForm = document.getElementById("newsletter-form");
  if (!newsletterForm) return;

  // Form submission handler
  newsletterForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const button = e.target.querySelector('button[type="submit"]');

    if (!name || !email || !email.includes("@") || !email.includes(".")) return;

    button.textContent = "Subscribing...";
    button.disabled = true;

    fetch(e.target.action, {
      method: "POST",
      body: new FormData(e.target),
      mode: "no-cors",
    })
      .then(() => {
        e.target.style.display = "none";
        document.getElementById("newsletter-description").style.display =
          "none";
        document.getElementById("newsletter-privacy").style.display = "none";
        document.getElementById("success-message").classList.remove("hidden");
      })
      .catch(() => {
        button.textContent = "Try Again";
        button.disabled = false;
        alert("Something went wrong. Please try again.");
      });
  });

  // Email placeholder handler
  const emailInput = document.getElementById("email");
  if (emailInput) {
    emailInput.addEventListener("input", function (e) {
      e.target.placeholder = e.target.value.length > 0 ? "" : "your@email.com";
    });
  }

  // Name placeholder handler
  const nameInput = document.getElementById("name");
  if (nameInput) {
    nameInput.addEventListener("input", function (e) {
      e.target.placeholder = e.target.value.length > 0 ? "" : "Your name";
    });
  }
});

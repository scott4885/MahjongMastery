// Hamburger menu toggle
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    hamburger.classList.toggle("active");
    hamburger.setAttribute("aria-expanded", isOpen);
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      hamburger.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });
}

const leadForm = document.getElementById("leadForm");
const toast = document.getElementById("toast");

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
};

const focusLeadForm = (message) => {
  if (!leadForm) return;
  leadForm.scrollIntoView({ behavior: "smooth", block: "center" });
  const emailInput = leadForm.querySelector('input[type="email"]');
  if (emailInput) {
    emailInput.focus();
    emailInput.select();
  }
  if (message) showToast(message);
};

if (leadForm) leadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = event.target.email.value;

  try {
    const response = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "lead_form" }),
    });

    if (!response.ok) {
      throw new Error("Subscribe failed");
    }

    // Track lead conversion in Facebook Pixel
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Lead');
    }

    window.location.href = "/courses/free-tile-guide.html";
    return;
  } catch (error) {
    console.error("Lead capture error:", error);
    showToast("Oops! Please try again in a moment.");
  }

  event.target.reset();
});

const buttons = document.querySelectorAll("button[data-product-id]");

buttons.forEach((button) => {
  button.addEventListener("click", async () => {
    const productId = button.dataset.productId;
    const courseName = button.dataset.courseName;

    if (productId === "price_free_tile_guide") {
      console.log("Free download requested:", courseName);
      focusLeadForm("Enter your email above to get the free guide!");
      return;
    }

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: productId }),
      });

      if (!response.ok) {
        throw new Error("Checkout session failed");
      }

      const data = await response.json();

      if (!data.url) {
        throw new Error("Missing checkout URL");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Stripe checkout error:", error);
      alert("Something went wrong. Please try again.");
    }
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".section, .hero, .trust-strip").forEach((section) => {
  section.classList.add("fade-in");
  observer.observe(section);
});

const floatingCta = document.querySelector('.floating-cta');
if (floatingCta) {
  const toggleFloating = () => {
    if (window.scrollY > 420) {
      floatingCta.classList.add('show');
    } else {
      floatingCta.classList.remove('show');
    }
  };

  window.addEventListener('scroll', toggleFloating);
  toggleFloating();
}

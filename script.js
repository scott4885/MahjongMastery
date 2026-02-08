const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;
const storedTheme = localStorage.getItem("theme");

if (storedTheme) {
  root.setAttribute("data-theme", storedTheme);
}

themeToggle.addEventListener("click", () => {
  const currentTheme = root.getAttribute("data-theme");
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", nextTheme);
  localStorage.setItem("theme", nextTheme);
});

const leadForm = document.getElementById("leadForm");
const toast = document.getElementById("toast");

leadForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = event.target.email.value;
  console.log("Lead capture:", email);
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
  event.target.reset();
});

const buttons = document.querySelectorAll("button[data-product-id]");
const publishableKey = window.STRIPE_PUBLISHABLE_KEY || "";
let stripe = null;

if (publishableKey && window.Stripe) {
  stripe = window.Stripe(publishableKey);
}

buttons.forEach((button) => {
  button.addEventListener("click", async () => {
    const productId = button.dataset.productId;
    const courseName = button.dataset.courseName;

    if (productId === "price_free_tile_guide") {
      console.log("Free download requested:", courseName);
      toast.textContent = "Check your inbox for the free guide!";
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 3500);
      return;
    }

    if (!stripe) {
      console.warn("Stripe publishable key missing or Stripe.js not loaded.");
      alert("Checkout is unavailable right now. Please try again later.");
      return;
    }

    try {
      await stripe.redirectToCheckout({
        lineItems: [{ price: productId, quantity: 1 }],
        mode: "payment",
        successUrl: `${window.location.origin}/success.html`,
        cancelUrl: window.location.href,
      });
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

const leadForm = document.getElementById("leadForm");
const toast = document.getElementById("toast");

leadForm.addEventListener("submit", async (event) => {
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

    window.location.href = "/courses/free-tile-guide.html";
    return;
  } catch (error) {
    console.error("Lead capture error:", error);
    toast.textContent = "Oops! Please try again in a moment.";
  }

  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
  event.target.reset();
});

const buttons = document.querySelectorAll("button[data-product-id]");

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

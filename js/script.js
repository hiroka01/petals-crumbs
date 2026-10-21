// Mobile navigation menu
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".navigation");

if (menuToggle && navigation) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.textContent = isOpen ? "✕" : "☰";
  });
}

// Automatically update the copyright year
const yearElement = document.getElementById("year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const heroShowcase = document.querySelector(".hero-showcase");

if (heroShowcase) {
  const slides = Array.from(heroShowcase.querySelectorAll(".hero-slide"));
  const indicators = Array.from(heroShowcase.querySelectorAll(".hero-slide-indicator"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeSlide = 0;
  let rotationTimer;

  const showSlide = (index) => {
    activeSlide = index;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeSlide;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.tabIndex = isActive ? 0 : -1;
      indicators[slideIndex].classList.toggle("is-active", isActive);
      indicators[slideIndex].setAttribute("aria-pressed", String(isActive));
    });
  };

  const stopRotation = () => window.clearInterval(rotationTimer);
  const startRotation = () => {
    stopRotation();
    if (!reducedMotion) {
      rotationTimer = window.setInterval(() => {
        showSlide((activeSlide + 1) % slides.length);
      }, 5000);
    }
  };

  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      showSlide(index);
      startRotation();
    });
  });

  heroShowcase.addEventListener("mouseenter", stopRotation);
  heroShowcase.addEventListener("mouseleave", startRotation);
  heroShowcase.addEventListener("focusin", stopRotation);
  heroShowcase.addEventListener("focusout", (event) => {
    if (!heroShowcase.contains(event.relatedTarget)) startRotation();
  });

  startRotation();
}

// Custom gift form confirmation
const giftForm = document.getElementById("giftForm");
const formMessage = document.getElementById("formMessage");

if (giftForm && formMessage) {
  giftForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!giftForm.checkValidity()) {
      giftForm.reportValidity();
      return;
    }

    const customerName = document.getElementById("customerName").value.trim();
    formMessage.textContent =
      `Thank you, ${customerName}! Your gift request has been received.`;
    giftForm.reset();
  });
}

const feedbackForm = document.getElementById("feedbackForm");
const feedbackFormMessage = document.getElementById("feedbackFormMessage");

if (feedbackForm && feedbackFormMessage) {
  feedbackForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!feedbackForm.reportValidity()) return;

    feedbackFormMessage.textContent =
      "Thank you for your feedback. This website only displays a confirmation; it does not send or store your message.";
    feedbackForm.reset();
  });
}

const accountStorageKey = "petalsCrumbsAccounts";
const activeAccountKey = "petalsCrumbsActiveAccount";

function getAccounts() {
  return JSON.parse(localStorage.getItem(accountStorageKey) || "{}");
}

function setFormMessage(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle("form-message-error", isError);
}

const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

if (registerForm && registerMessage) {
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!registerForm.reportValidity()) return;

    const formData = new FormData(registerForm);
    const email = formData.get("email").trim().toLowerCase();
    const accounts = getAccounts();

    if (accounts[email]) {
      setFormMessage(registerMessage, "An account with this email already exists. Please sign in.", true);
      return;
    }

    accounts[email] = {
      name: formData.get("name").trim(),
      phone: "",
      billing: { address: "", city: "", postcode: "", country: "" },
      payment: { name: "", lastFour: "" },
      delivery: { name: "", phone: "", address: "", city: "", postcode: "", country: "" },
      orderTracking: { orderId: "", carrier: "", trackingNumber: "", status: "", url: "" }
    };
    localStorage.setItem(accountStorageKey, JSON.stringify(accounts));
    sessionStorage.setItem(activeAccountKey, email);
    window.location.href = "settings.html";
  });
}

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

if (loginForm && loginMessage) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!loginForm.reportValidity()) return;

    const email = new FormData(loginForm).get("email").trim().toLowerCase();
    const accounts = getAccounts();

    if (!accounts[email]) {
      setFormMessage(loginMessage, "No account was found for this email. Please register first.", true);
      return;
    }

    sessionStorage.setItem(activeAccountKey, email);
    window.location.href = "settings.html";
  });
}

const settingsForm = document.getElementById("settingsForm");
const billingForm = document.getElementById("billingForm");
const paymentForm = document.getElementById("paymentForm");
const deliveryForm = document.getElementById("deliveryForm");
const trackingForm = document.getElementById("trackingForm");

if (settingsForm && billingForm && paymentForm && deliveryForm && trackingForm) {
  const email = sessionStorage.getItem(activeAccountKey);
  const settingsMessage = document.getElementById("settingsMessage");
  const billingMessage = document.getElementById("billingMessage");
  const paymentMessage = document.getElementById("paymentMessage");
  const deliveryMessage = document.getElementById("deliveryMessage");
  const trackingMessage = document.getElementById("trackingMessage");
  const trackingSummary = document.getElementById("trackingSummary");

  if (!email) {
    window.location.replace("login.html");
  } else {
    const accounts = getAccounts();
    const account = accounts[email];

    if (!account) {
      sessionStorage.removeItem(activeAccountKey);
      window.location.replace("login.html");
    } else {
      account.delivery = account.delivery || {
        name: "",
        phone: "",
        address: "",
        city: "",
        postcode: "",
        country: ""
      };
      account.orderTracking = account.orderTracking || {
        orderId: "",
        carrier: "",
        trackingNumber: "",
        status: "",
        url: ""
      };
      document.getElementById("settingsEmail").textContent = email;
      settingsForm.elements.namedItem("name").value = account.name || "";
      settingsForm.elements.namedItem("phone").value = account.phone || "";
      billingForm.elements.namedItem("address").value = account.billing.address || "";
      billingForm.elements.namedItem("city").value = account.billing.city || "";
      billingForm.elements.namedItem("postcode").value = account.billing.postcode || "";
      billingForm.elements.namedItem("country").value = account.billing.country || "";
      paymentForm.elements.namedItem("name").value = account.payment.name || "";
      paymentForm.elements.namedItem("lastFour").value = account.payment.lastFour || "";
      deliveryForm.elements.namedItem("name").value = account.delivery.name || "";
      deliveryForm.elements.namedItem("phone").value = account.delivery.phone || "";
      deliveryForm.elements.namedItem("address").value = account.delivery.address || "";
      deliveryForm.elements.namedItem("city").value = account.delivery.city || "";
      deliveryForm.elements.namedItem("postcode").value = account.delivery.postcode || "";
      deliveryForm.elements.namedItem("country").value = account.delivery.country || "";
      trackingForm.elements.namedItem("orderId").value = account.orderTracking.orderId || "";
      trackingForm.elements.namedItem("carrier").value = account.orderTracking.carrier || "";
      trackingForm.elements.namedItem("trackingNumber").value = account.orderTracking.trackingNumber || "";
      trackingForm.elements.namedItem("status").value = account.orderTracking.status || "";
      trackingForm.elements.namedItem("url").value = account.orderTracking.url || "";

      const renderTrackingSummary = () => {
        trackingSummary.replaceChildren();
        const tracking = account.orderTracking;
        if (!tracking.orderId && !tracking.carrier && !tracking.trackingNumber && !tracking.status && !tracking.url) {
          trackingSummary.textContent = "No tracking details saved yet.";
          return;
        }

        const summary = [
          tracking.orderId && `Order: ${tracking.orderId}`,
          tracking.carrier && `Courier: ${tracking.carrier}`,
          tracking.trackingNumber && `Tracking number: ${tracking.trackingNumber}`,
          tracking.status && `Status: ${tracking.status}`
        ].filter(Boolean).join(" · ");
        trackingSummary.append(document.createTextNode(summary || "Tracking information saved."));

        if (tracking.url) {
          const trackingLink = document.createElement("a");
          trackingLink.href = tracking.url;
          trackingLink.target = "_blank";
          trackingLink.rel = "noopener noreferrer";
          trackingLink.textContent = " Open courier tracking";
          trackingSummary.append(trackingLink);
        }
      };

      renderTrackingSummary();

      settingsForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!settingsForm.reportValidity()) return;
        account.name = settingsForm.elements.namedItem("name").value.trim();
        account.phone = settingsForm.elements.namedItem("phone").value.trim();
        accounts[email] = account;
        localStorage.setItem(accountStorageKey, JSON.stringify(accounts));
        setFormMessage(settingsMessage, "Your profile has been saved.");
      });

      billingForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!billingForm.reportValidity()) return;
        account.billing = {
          address: billingForm.elements.namedItem("address").value.trim(),
          city: billingForm.elements.namedItem("city").value.trim(),
          postcode: billingForm.elements.namedItem("postcode").value.trim(),
          country: billingForm.elements.namedItem("country").value.trim()
        };
        accounts[email] = account;
        localStorage.setItem(accountStorageKey, JSON.stringify(accounts));
        setFormMessage(billingMessage, "Your billing address has been saved.");
      });

      paymentForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!paymentForm.reportValidity()) return;
        account.payment = {
          name: paymentForm.elements.namedItem("name").value.trim(),
          lastFour: paymentForm.elements.namedItem("lastFour").value.trim()
        };
        accounts[email] = account;
        localStorage.setItem(accountStorageKey, JSON.stringify(accounts));
        setFormMessage(paymentMessage, "Your payment display details have been saved.");
      });

      deliveryForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!deliveryForm.reportValidity()) return;
        account.delivery = {
          name: deliveryForm.elements.namedItem("name").value.trim(),
          phone: deliveryForm.elements.namedItem("phone").value.trim(),
          address: deliveryForm.elements.namedItem("address").value.trim(),
          city: deliveryForm.elements.namedItem("city").value.trim(),
          postcode: deliveryForm.elements.namedItem("postcode").value.trim(),
          country: deliveryForm.elements.namedItem("country").value.trim()
        };
        accounts[email] = account;
        localStorage.setItem(accountStorageKey, JSON.stringify(accounts));
        setFormMessage(deliveryMessage, "Your delivery information has been saved.");
      });

      trackingForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!trackingForm.reportValidity()) return;

        const trackingUrl = trackingForm.elements.namedItem("url").value.trim();
        if (trackingUrl) {
          const parsedUrl = new URL(trackingUrl);
          if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            setFormMessage(trackingMessage, "Enter a courier tracking link that starts with http:// or https://.", true);
            return;
          }
        }

        account.orderTracking = {
          orderId: trackingForm.elements.namedItem("orderId").value.trim(),
          carrier: trackingForm.elements.namedItem("carrier").value.trim(),
          trackingNumber: trackingForm.elements.namedItem("trackingNumber").value.trim(),
          status: trackingForm.elements.namedItem("status").value,
          url: trackingUrl
        };
        accounts[email] = account;
        localStorage.setItem(accountStorageKey, JSON.stringify(accounts));
        setFormMessage(trackingMessage, "Your tracking details have been saved.");
        renderTrackingSummary();
      });

      document.getElementById("logoutButton").addEventListener("click", () => {
        sessionStorage.removeItem(activeAccountKey);
        window.location.href = "login.html";
      });
    }
  }
}

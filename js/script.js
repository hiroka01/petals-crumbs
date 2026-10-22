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
const inspirationImages = document.getElementById("inspirationImages");
const imagePreviews = document.getElementById("imagePreviews");

if (giftForm && formMessage) {
  const previewUrls = [];

  const clearImagePreviews = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.length = 0;
    imagePreviews.replaceChildren();
  };

  if (inspirationImages && imagePreviews) {
    inspirationImages.addEventListener("change", () => {
      clearImagePreviews();

      Array.from(inspirationImages.files)
        .filter((file) => file.type.startsWith("image/"))
        .forEach((file) => {
          const url = URL.createObjectURL(file);
          previewUrls.push(url);

          const preview = document.createElement("figure");
          preview.className = "image-preview";
          const image = document.createElement("img");
          image.src = url;
          image.alt = `Preview of ${file.name}`;
          const caption = document.createElement("figcaption");
          caption.textContent = file.name;
          preview.append(image, caption);
          imagePreviews.append(preview);
        });
    });

    giftForm.addEventListener("reset", clearImagePreviews);
  }

  giftForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!giftForm.checkValidity()) {
      giftForm.reportValidity();
      return;
    }

    const customerName = document.getElementById("customerName").value.trim();
    formMessage.textContent =
      `Thank you, ${customerName}! Your sample gift request has been received. Any selected images were only previewed and have not been uploaded or saved.`;
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
      orderTracking: { carrier: "", trackingNumber: "", status: "", url: "" }
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

if (settingsForm && billingForm && paymentForm && deliveryForm) {
  const email = sessionStorage.getItem(activeAccountKey);
  const settingsMessage = document.getElementById("settingsMessage");
  const billingMessage = document.getElementById("billingMessage");
  const paymentMessage = document.getElementById("paymentMessage");
  const deliveryMessage = document.getElementById("deliveryMessage");
  const trackingStatusDisplay = document.getElementById("trackingStatusDisplay");
  const trackingCarrierDisplay = document.getElementById("trackingCarrierDisplay");
  const trackingNumberDisplay = document.getElementById("trackingNumberDisplay");
  const trackingLinkDisplay = document.getElementById("trackingLinkDisplay");
  const trackingLinkEmpty = document.getElementById("trackingLinkEmpty");

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
      const renderTrackingDetails = () => {
        const tracking = account.orderTracking || {};
        trackingStatusDisplay.textContent = tracking.status || "No updates yet.";
        trackingCarrierDisplay.textContent = tracking.carrier || "Not provided";
        trackingNumberDisplay.textContent = tracking.trackingNumber || "Not provided";

        let trackingUrl = "";
        if (tracking.url) {
          try {
            const parsedUrl = new URL(tracking.url);
            if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
              trackingUrl = parsedUrl.href;
            }
          } catch (error) {
            trackingUrl = "";
          }
        }
        trackingLinkDisplay.hidden = !trackingUrl;
        trackingLinkEmpty.hidden = Boolean(trackingUrl);
        if (trackingUrl) {
          trackingLinkDisplay.href = trackingUrl;
          trackingLinkDisplay.textContent = "Track your delivery";
        } else {
          trackingLinkDisplay.removeAttribute("href");
          trackingLinkDisplay.textContent = "";
        }
      };

      renderTrackingDetails();

      window.addEventListener("storage", (event) => {
        if (event.key !== accountStorageKey) return;
        const latestAccounts = getAccounts();
        if (!latestAccounts[email]) return;
        account.orderTracking = latestAccounts[email].orderTracking || {};
        renderTrackingDetails();
      });

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

      document.getElementById("logoutButton").addEventListener("click", () => {
        sessionStorage.removeItem(activeAccountKey);
        window.location.href = "login.html";
      });
    }
  }
}

const adminTrackingForm = document.getElementById("adminTrackingForm");
if (adminTrackingForm) {
  const accountSelect = document.getElementById("trackingAccount");
  const accountHelp = document.getElementById("trackingAccountHelp");
  const adminTrackingMessage = document.getElementById("adminTrackingMessage");

  const populateAdminAccounts = () => {
    const accounts = getAccounts();
    const selectedEmail = accountSelect.value;
    accountSelect.replaceChildren(new Option("Select a customer account", ""));
    Object.entries(accounts).forEach(([email, account]) => {
      const option = new Option(`${account.name || "Customer"} — ${email}`, email);
      accountSelect.append(option);
    });
    if (accounts[selectedEmail]) accountSelect.value = selectedEmail;
    accountSelect.disabled = accountSelect.options.length === 1;
    accountHelp.textContent = accountSelect.disabled
      ? "No customer accounts yet. Register a customer account before adding tracking details."
      : "Choose the customer whose delivery details you want to update.";
    return accounts;
  };

  const loadAccountTracking = () => {
    const accounts = getAccounts();
    const account = accounts[accountSelect.value];
    const tracking = account && account.orderTracking ? account.orderTracking : {};
    adminTrackingForm.elements.namedItem("carrier").value = tracking.carrier || "";
    adminTrackingForm.elements.namedItem("trackingNumber").value = tracking.trackingNumber || "";
    adminTrackingForm.elements.namedItem("status").value = tracking.status || "";
    adminTrackingForm.elements.namedItem("url").value = tracking.url || "";
  };

  populateAdminAccounts();
  accountSelect.addEventListener("change", loadAccountTracking);
  adminTrackingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!adminTrackingForm.reportValidity()) return;

    const accounts = getAccounts();
    const email = accountSelect.value;
    if (!accounts[email]) {
      setFormMessage(adminTrackingMessage, "Select an existing customer account before saving tracking details.", true);
      populateAdminAccounts();
      return;
    }

    const trackingUrl = adminTrackingForm.elements.namedItem("url").value.trim();
    if (trackingUrl) {
      let parsedUrl;
      try {
        parsedUrl = new URL(trackingUrl);
      } catch (error) {
        setFormMessage(adminTrackingMessage, "Enter a valid courier tracking link that starts with http:// or https://.", true);
        return;
      }
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        setFormMessage(adminTrackingMessage, "Enter a courier tracking link that starts with http:// or https://.", true);
        return;
      }
    }

    accounts[email].orderTracking = {
      carrier: adminTrackingForm.elements.namedItem("carrier").value.trim(),
      trackingNumber: adminTrackingForm.elements.namedItem("trackingNumber").value.trim(),
      status: adminTrackingForm.elements.namedItem("status").value,
      url: trackingUrl
    };
    localStorage.setItem(accountStorageKey, JSON.stringify(accounts));
    setFormMessage(adminTrackingMessage, `Tracking details updated for ${email}.`);
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== accountStorageKey) return;
    const selectedEmail = accountSelect.value;
    populateAdminAccounts();
    if (selectedEmail) {
      accountSelect.value = selectedEmail;
      loadAccountTracking();
    }
  });
}

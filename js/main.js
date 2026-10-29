// Set this to the path or URL of a real CV PDF when one is available.
const cvUrl = "";

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");
const header = document.querySelector(".site-header");
const progressBar = document.querySelector("#scroll-progress-bar");
const toast = document.querySelector(".toast");
let toastTimeout;

function closeMenu() {
  if (!menuToggle || !primaryNav) return;
  menuToggle.setAttribute("aria-expanded", "false");
  primaryNav.classList.remove("open");
  document.body.classList.remove("menu-open");
}

if (menuToggle && primaryNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    primaryNav.classList.toggle("open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  primaryNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

function updateScrollUI() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${progress}%`;
  header.classList.toggle("scrolled", window.scrollY > 24);
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
window.addEventListener("resize", updateScrollUI);
updateScrollUI();

const backToTopButton = document.querySelector(".floating-back-top");
backToTopButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll('.primary-nav a[href^="#"]');
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${entry.target.id}`;
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
        link.classList.toggle("active", active);
      });
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  sections.forEach((section) => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll("[data-reveal]").forEach((element) => element.classList.add("is-visible"));
}

const hoverEnabled = window.matchMedia("(hover: hover) and (pointer: fine)");
document.querySelectorAll(".about-accordion").forEach((accordion) => {
  const summary = accordion.querySelector("summary");
  let openedByHover = false;

  accordion.addEventListener("pointerenter", (event) => {
    if (!hoverEnabled.matches || event.pointerType === "touch" || accordion.open) return;
    accordion.open = true;
    openedByHover = true;
  });

  accordion.addEventListener("pointerleave", () => {
    if (!openedByHover) return;
    accordion.open = false;
    openedByHover = false;
  });

  summary.addEventListener("click", (event) => {
    event.preventDefault();
    if (openedByHover && accordion.open) {
      openedByHover = false;
      return;
    }
    accordion.open = !accordion.open;
    openedByHover = false;
  });
});

document.querySelectorAll("[data-cv-download]").forEach((button) => {
  if (!cvUrl) {
    const wrapper = button.closest(".nav-cv-wrap");
    wrapper.classList.add("has-message");
    button.addEventListener("click", () => {
      const isOpen = wrapper.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
    document.addEventListener("click", (event) => {
      if (wrapper.contains(event.target)) return;
      wrapper.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    });
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      wrapper.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      button.blur();
    });
    return;
  }
  button.removeAttribute("aria-describedby");
  button.addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = cvUrl;
    link.download = "";
    link.rel = "noopener";
    link.click();
  });
});

function announce(message, target) {
  if (target) target.textContent = message;
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => {
    toast.classList.remove("visible");
    if (target) target.textContent = "";
  }, 2400);
}

const copyButton = document.querySelector("[data-copy-email]");
if (copyButton) {
  copyButton.addEventListener("click", async () => {
    const email = "abdulrehmanmujahid1100@gmail.com";
    const feedback = document.querySelector(".copy-feedback");
    try {
      await navigator.clipboard.writeText(email);
      announce("Email copied to clipboard.", feedback);
    } catch (error) {
      console.error("Could not copy the contact email.", error);
      announce("Copy failed. Select the email address to copy it.", feedback);
    }
  });
}

document.querySelector("#current-year").textContent = new Date().getFullYear();

const appointmentForm = document.querySelector("#appointment-form");
const appointmentFeedback = document.querySelector("#appointment-feedback");
const savedRequests = document.querySelector("#saved-requests");
const appointmentDate = document.querySelector("#appointment-date");
const appointmentStorageKey = "abdulRehmanAppointmentRequests";

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readAppointmentRequests() {
  try {
    const stored = localStorage.getItem(appointmentStorageKey);
    if (stored === null) return [];
    const requests = JSON.parse(stored);
    if (!Array.isArray(requests)) {
      throw new Error("Saved appointment requests are not in the expected format.");
    }
    return requests;
  } catch (error) {
    console.error("Could not read saved appointment requests.", error);
    throw error;
  }
}

function createEmailDraftLink(request) {
  const subject = `Appointment request from ${request.name}`;
  const body = [
    "Hello Abdul-Rehman,",
    "",
    "I would like to arrange a conversation.",
    `Name: ${request.name}`,
    `Email: ${request.email}`,
    `Preferred date: ${request.date}`,
    `Preferred time: ${request.time}`,
    `Details: ${request.message || "Not provided"}`,
  ].join("\n");
  const link = document.createElement("a");
  link.className = "email-request-link";
  link.href = `mailto:abdulrehmanmujahid1100@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  link.textContent = "Email request";
  link.setAttribute("aria-label", `Email appointment request for ${request.date} at ${request.time}`);
  return link;
}

function renderAppointmentRequests() {
  const requests = readAppointmentRequests();
  savedRequests.replaceChildren();

  requests.forEach((request) => {
    const row = document.createElement("div");
    row.className = "saved-request";
    const summary = document.createElement("p");
    summary.textContent = `Saved request: ${request.date} at ${request.time} · ${request.name}`;
    const actions = document.createElement("div");
    actions.className = "saved-request-actions";
    actions.append(createEmailDraftLink(request));

    const removeButton = document.createElement("button");
    removeButton.className = "remove-request";
    removeButton.type = "button";
    removeButton.dataset.removeRequest = request.id;
    removeButton.textContent = "Remove";
    actions.append(removeButton);
    row.append(summary, actions);
    savedRequests.append(row);
  });
}

if (appointmentForm && appointmentFeedback && savedRequests && appointmentDate) {
  appointmentDate.min = localDateString(new Date());
  try {
    renderAppointmentRequests();
  } catch (error) {
    appointmentFeedback.classList.add("error");
    appointmentFeedback.textContent = "Could not load appointment requests saved in this browser.";
  }

  appointmentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    appointmentFeedback.classList.remove("error");
    const formData = new FormData(appointmentForm);
    const request = {
      id: crypto.randomUUID(),
      name: formData.get("name").trim(),
      email: formData.get("email").trim(),
      date: formData.get("date"),
      time: formData.get("time"),
      message: formData.get("message").trim(),
    };

    try {
      const requests = readAppointmentRequests();
      requests.push(request);
      localStorage.setItem(appointmentStorageKey, JSON.stringify(requests));
      renderAppointmentRequests();
      appointmentForm.reset();
      appointmentDate.min = localDateString(new Date());
      appointmentFeedback.textContent = "Saved in this browser. Select “Email request” below to send it to Abdul-Rehman.";
    } catch (error) {
      console.error("Could not save the appointment request.", error);
      appointmentFeedback.classList.add("error");
      appointmentFeedback.textContent = "Could not save this request in browser storage. Check your browser settings and try again.";
    }
  });

  savedRequests.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-request]");
    if (!button) return;
    appointmentFeedback.classList.remove("error");
    try {
      const requests = readAppointmentRequests();
      const remaining = requests.filter((request) => request.id !== button.dataset.removeRequest);
      localStorage.setItem(appointmentStorageKey, JSON.stringify(remaining));
      renderAppointmentRequests();
      appointmentFeedback.textContent = "Saved request removed from this browser.";
    } catch (error) {
      console.error("Could not remove the saved appointment request.", error);
      appointmentFeedback.classList.add("error");
      appointmentFeedback.textContent = "Could not remove this request from browser storage. Please try again.";
    }
  });
}

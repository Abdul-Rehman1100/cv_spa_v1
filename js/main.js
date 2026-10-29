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

document.querySelectorAll("[data-cv-download]").forEach((button) => {
  if (!cvUrl) {
    button.disabled = true;
    button.title = "Add a real CV PDF URL in js/main.js to enable this action.";
    return;
  }
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

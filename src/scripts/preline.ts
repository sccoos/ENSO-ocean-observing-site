import { HSStaticMethods } from "preline/non-auto";

HSStaticMethods.autoInit(["accordion", "collapse", "tabs"]);

const mobileNavbar = window.matchMedia("(max-width: 1279px)");

document.addEventListener("click", (event) => {
  if (!mobileNavbar.matches || !(event.target instanceof Element)) return;

  const tab = event.target.closest("#observing-topic-navbar [role='tab']");
  if (!tab) return;

  document.getElementById("observing-topic-navbar-toggle")?.click();
});

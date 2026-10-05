import { HSStaticMethods, HSTabs } from "preline/non-auto";

HSStaticMethods.autoInit(["accordion", "collapse", "tabs"]);

const mobileNavbar = window.matchMedia("(max-width: 767px)");

function updateCurrentPage(route: string) {
  const topLevelRoute = route.split("/").filter(Boolean)[0];
  if (!topLevelRoute) return;

  const tab = document.querySelector<HTMLElement>(`[data-tab-route="${topLevelRoute}"]`);
  const label = tab?.textContent?.trim();
  if (!label) return;

  document.querySelectorAll<HTMLElement>("[data-current-page]").forEach((currentPage) => {
    currentPage.textContent = label;
  });
}

function openTabRoute(route: string) {
  const segments = route.split("/").filter(Boolean);
  let currentRoute = "";

  for (const segment of segments) {
    currentRoute = currentRoute ? `${currentRoute}/${segment}` : segment;
    const tab = document.querySelector<HTMLElement>(`[data-tab-route="${currentRoute}"]`);

    if (!tab || tab.matches(":disabled")) return;
    HSTabs.open(tab);
  }

  updateCurrentPage(route);
}

function syncTabRouteFromHash() {
  const route = window.location.hash.slice(1);
  if (route) openTabRoute(route);
}

document.addEventListener("click", (event) => {
  if (!mobileNavbar.matches || !(event.target instanceof Element)) return;

  const tab = event.target.closest("#observing-topic-navbar [role='tab']");
  if (!tab) return;

  document.getElementById("observing-topic-navbar-toggle")?.click();
});

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;

  const tab = event.target.closest<HTMLElement>("[data-tab-route]");
  const route = tab?.dataset.tabRoute;

  if (route && window.location.hash !== `#${route}`) {
    window.history.pushState(null, "", `#${route}`);
  }

  if (route) updateCurrentPage(route);
});

window.addEventListener("hashchange", syncTabRouteFromHash);
window.addEventListener("popstate", syncTabRouteFromHash);
syncTabRouteFromHash();

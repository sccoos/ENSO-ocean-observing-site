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

function resolveDefaultRoute(route: string) {
  const tab = document.querySelector<HTMLElement>(`[data-tab-route="${route}"]`);
  return tab?.dataset.defaultTabRoute || route;
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
  window.dispatchEvent(new CustomEvent("tabroutechange", { detail: { route } }));
}

function syncTabRouteFromHash() {
  const route = window.location.hash.slice(1);
  if (!route) return;

  const resolvedRoute = resolveDefaultRoute(route);
  if (resolvedRoute !== route) window.history.replaceState(null, "", `#${resolvedRoute}`);
  openTabRoute(resolvedRoute);
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
  const resolvedRoute = route && resolveDefaultRoute(route);

  if (resolvedRoute && window.location.hash !== `#${resolvedRoute}`) {
    window.history.pushState(null, "", `#${resolvedRoute}`);
  }

  if (resolvedRoute) openTabRoute(resolvedRoute);
});

window.addEventListener("hashchange", syncTabRouteFromHash);
window.addEventListener("popstate", syncTabRouteFromHash);
syncTabRouteFromHash();

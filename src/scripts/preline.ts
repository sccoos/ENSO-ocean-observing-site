import { HSStaticMethods, HSTabs } from "preline/non-auto";

HSStaticMethods.autoInit(["accordion", "collapse", "tabs"]);

const mobileNavbar = window.matchMedia("(max-width: 1279px)");

function openTabRoute(route: string) {
  const segments = route.split("/").filter(Boolean);
  let currentRoute = "";

  for (const segment of segments) {
    currentRoute = currentRoute ? `${currentRoute}/${segment}` : segment;
    const tab = document.querySelector<HTMLElement>(`[data-tab-route="${currentRoute}"]`);

    if (!tab || tab.matches(":disabled")) return;
    HSTabs.open(tab);
  }
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
});

window.addEventListener("hashchange", syncTabRouteFromHash);
window.addEventListener("popstate", syncTabRouteFromHash);
syncTabRouteFromHash();

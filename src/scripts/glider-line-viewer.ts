const FRAME_DELAY_MS = 250;
const FRAME_TIMEOUT_MS = 20_000;
const PREFETCH_COUNT = 3;
const MAX_CACHED_FRAMES = 16;
const PLAY_ICON = '<svg class="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m8 5 11 7-11 7V5Z" /></svg>';
const PAUSE_ICON = '<svg class="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z" /></svg>';

function getAvailableDates() {
  const dates: string[] = [];
  const firstDate = new Date(Date.UTC(2025, 0, 1));
  const resetDate = new Date(Date.UTC(2026, 0, 1));
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 14);
  endDate.setUTCHours(0, 0, 0, 0);

  for (let date = new Date(firstDate); date < resetDate; date.setUTCDate(date.getUTCDate() + 10)) {
    dates.push(date.toISOString().slice(0, 10));
  }
  for (let date = new Date(resetDate); date <= endDate; date.setUTCDate(date.getUTCDate() + 10)) {
    dates.push(date.toISOString().slice(0, 10));
  }
  return dates;
}

interface Frame {
  owner: HTMLElement;
  index: number;
  image: HTMLImageElement;
  ready: boolean;
  promise: Promise<HTMLImageElement>;
  cancel: () => void;
}

const dates = getAvailableDates();

document.querySelectorAll<HTMLElement>("[data-glider-line-viewer]").forEach((viewer) => {
  const imageBaseUrl = viewer.dataset.imageBaseUrl;
  if (!imageBaseUrl) return;

  // Shared across lines. Map insertion order tracks least-recently-used frames.
  const frames = new Map<string, Frame>();
  const displayedImages = new Set<HTMLImageElement>();

  function trimCache() {
    for (const [key, frame] of frames) {
      if (frames.size <= MAX_CACHED_FRAMES) break;
      // Include each line's displayed image and active requests in the budget.
      if (displayedImages.has(frame.image) || !frame.ready) continue;
      frames.delete(key);
    }
  }

  viewer.querySelectorAll<HTMLElement>("[data-glider-line-panel]").forEach((panel) => {
    const { lineToken, lineLabel } = panel.dataset;
    const slider = panel.querySelector<HTMLInputElement>("[data-glider-date-slider]");
    const label = panel.querySelector<HTMLOutputElement>("[data-glider-date-label]");
    let image = panel.querySelector<HTMLImageElement>("[data-glider-line-image]");
    const imageContainer = panel.querySelector<HTMLElement>("[data-glider-image-container]");
    const playButton = panel.querySelector<HTMLButtonElement>("[data-glider-play]");
    const status = panel.querySelector<HTMLElement>("[data-glider-status]");
    const retryButton = panel.querySelector<HTMLButtonElement>("[data-glider-retry]");
    if (!lineToken || !lineLabel || !slider || !label || !image || !imageContainer || !playButton || !status || !retryButton) return;

    const imageClass = image.className;
    let displayedIndex: number | null = null;
    let targetIndex = dates.length - 1;
    let failedIndex: number | null = null;
    let resumeOnRetry = false;
    let playing = false;
    let version = 0;
    let timer: number | undefined;
    let wasVisible = false;

    slider.max = String(dates.length - 1);
    slider.value = String(targetIndex);

    const isVisible = () => !document.hidden && !panel.closest(".hidden, [hidden]");

    function loadFrame(index: number): Frame {
      const key = `${imageBaseUrl}/${lineToken}/anommap/xz/t/${lineToken}_anommap_xz_t_${dates[index]}.png`;
      const cached = frames.get(key);
      if (cached) {
        frames.delete(key);
        frames.set(key, cached);
        return cached;
      }

      const candidate = new Image();
      candidate.className = imageClass;
      candidate.alt = `${lineLabel} temperature anomaly section for ${dates[index]}`;
      candidate.setAttribute("data-glider-line-image", "");
      const frame: Frame = { owner: panel, index, image: candidate, ready: false, promise: null!, cancel: () => {} };
      frame.promise = new Promise<HTMLImageElement>((resolve, reject) => {
        let settled = false;
        const finish = (error?: Error) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeout);
          if (error) {
            // Delete only this request; a replacement may already exist after a scrub.
            if (frames.get(key) === frame) frames.delete(key);
            candidate.removeAttribute("src");
            reject(error);
          } else {
            frame.ready = true;
            resolve(candidate);
            trimCache();
          }
        };
        const timeout = window.setTimeout(() => finish(new Error("Image request timed out")), FRAME_TIMEOUT_MS);
        frame.cancel = () => finish(new DOMException("Frame request cancelled", "AbortError"));
        candidate.src = key;
        candidate.decode().then(() => finish(), () => finish(new Error("Image unavailable")));
      });
      // Prefetched failures are handled when that date is requested for display.
      void frame.promise.catch(() => {});
      frames.set(key, frame);
      trimCache();
      return frame;
    }

    function pruneFrames(index: number) {
      const keep = new Set([index, displayedIndex]);
      if (playing) {
        for (let ahead = 1; ahead <= PREFETCH_COUNT; ahead++) keep.add(index + ahead);
      }
      // Cancel obsolete downloads but retain decoded frames for revisiting.
      for (const [key, frame] of frames) {
        if (frame.owner !== panel || frame.ready || keep.has(frame.index)) continue;
        frame.cancel();
        frames.delete(key);
      }
      trimCache();
    }

    function setPlaying(value: boolean) {
      playing = value;
      playButton!.setAttribute("aria-pressed", String(value));
      playButton!.setAttribute("aria-label", `${value ? "Pause" : "Play"} ${lineLabel} animation`);
      playButton!.innerHTML = value ? PAUSE_ICON : PLAY_ICON;
    }

    function stopPlayback() {
      version++;
      window.clearTimeout(timer);
      timer = undefined;
      setPlaying(false);
      for (const [key, frame] of frames) {
        if (frame.owner !== panel || frame.ready) continue;
        frame.cancel();
        frames.delete(key);
      }
      status!.textContent = "";
      retryButton!.hidden = true;
      failedIndex = null;
      imageContainer!.setAttribute("aria-busy", "false");
      if (displayedIndex !== null) {
        targetIndex = displayedIndex;
        slider!.value = String(displayedIndex);
      }
      pruneFrames(targetIndex);
    }

    async function showFrame(index: number, requestVersion = version) {
      targetIndex = index;
      pruneFrames(index);
      const frame = loadFrame(index);
      status!.textContent = frame.ready ? "" : `${playing ? "Buffering" : "Loading"} ${dates[index]}…`;
      imageContainer!.setAttribute("aria-busy", String(!frame.ready));
      retryButton!.hidden = true;

      if (playing) {
        for (let ahead = 1; ahead <= PREFETCH_COUNT && index + ahead < dates.length; ahead++) {
          loadFrame(index + ahead);
        }
      }

      try {
        const nextImage = await frame.promise;
        if (requestVersion !== version || !isVisible()) return;

        // Swap the decoded element itself; never replace a visible image with an unloaded URL.
        displayedImages.delete(image!);
        if (image !== nextImage) image!.replaceWith(nextImage);
        image = nextImage;
        displayedImages.add(nextImage);
        displayedIndex = index;
        failedIndex = null;
        slider!.value = String(index);
        slider!.setAttribute("aria-valuetext", dates[index]);
        label!.value = dates[index];
        status!.textContent = "";
        imageContainer!.setAttribute("aria-busy", "false");
        pruneFrames(index);

        if (!playing) return;
        if (index === dates.length - 1) {
          stopPlayback();
          return;
        }
        // Each displayed frame gets its full dwell time, even after buffering.
        timer = window.setTimeout(() => {
          timer = undefined;
          void showFrame(index + 1, requestVersion);
        }, FRAME_DELAY_MS);
      } catch {
        if (requestVersion !== version || !isVisible()) return;
        resumeOnRetry = playing;
        stopPlayback();
        failedIndex = index;
        status!.textContent = `Could not load ${dates[index]}.${displayedIndex !== null ? " Keeping the previous image." : ""} Retry to continue.`;
        retryButton!.hidden = false;
      }
    }

    function startPlayback() {
      const nextIndex = failedIndex ?? (displayedIndex === dates.length - 1 ? 0 : displayedIndex ?? targetIndex);
      stopPlayback();
      setPlaying(true);
      void showFrame(nextIndex);
    }

    slider.addEventListener("input", () => {
      const index = Number(slider.value);
      stopPlayback();
      // Until this date is decoded, keep the thumb and label on the visible frame.
      if (displayedIndex === null) slider.value = "0";
      void showFrame(index);
    });

    playButton.addEventListener("click", () => {
      if (playing) stopPlayback();
      else startPlayback();
    });

    retryButton.addEventListener("click", () => {
      if (failedIndex === null) return;
      const index = failedIndex;
      const resume = resumeOnRetry;
      stopPlayback();
      setPlaying(resume);
      void showFrame(index);
    });

    function syncVisibility() {
      const visible = isVisible();
      if (visible === wasVisible) return;
      wasVisible = visible;
      if (visible) {
        void showFrame(displayedIndex ?? targetIndex);
      } else {
        stopPlayback();
      }
    }

    document.addEventListener("change.hs.tab", syncVisibility);
    document.addEventListener("visibilitychange", syncVisibility);
    window.addEventListener("tabroutechange", syncVisibility);
    syncVisibility();
  });
});

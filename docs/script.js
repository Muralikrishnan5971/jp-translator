"use strict";
const $ = (id) => document.getElementById(id);
const state = { chapters: [], index: 0 };
const scrollArea = $("readingScroll");
const storedTheme = localStorage.getItem("reader-theme");
if (
  storedTheme === "dark" ||
  (!storedTheme && matchMedia("(prefers-color-scheme: dark)").matches)
)
  document.body.classList.add("dark");
let fontSize = Math.min(
  24,
  Math.max(14, Number(localStorage.getItem("reader-font-size")) || 17),
);
document.documentElement.style.setProperty(
  "--reader-font-size",
  fontSize + "px",
);
$("themeButton").textContent = document.body.classList.contains("dark")
  ? "☀"
  : "☾";
function notify(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("visible");
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => el.classList.remove("visible"), 2400);
}
function closeMenu() {
  $("sidebar").classList.remove("open");
  $("mobileOverlay").hidden = true;
  $("menuButton").setAttribute("aria-expanded", "false");
}
$("menuButton").addEventListener("click", () => {
  const open = $("sidebar").classList.toggle("open");
  $("mobileOverlay").hidden = !open;
  $("menuButton").setAttribute("aria-expanded", String(open));
});
$("mobileOverlay").addEventListener("click", closeMenu);
$("themeButton").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  localStorage.setItem("reader-theme", dark ? "dark" : "light");
  $("themeButton").textContent = dark ? "☀" : "☾";
});
function adjustFont(delta) {
  fontSize = Math.min(24, Math.max(14, fontSize + delta));
  document.documentElement.style.setProperty(
    "--reader-font-size",
    fontSize + "px",
  );
  localStorage.setItem("reader-font-size", fontSize);
}
$("fontDown").addEventListener("click", () => adjustFont(-1));
$("fontUp").addEventListener("click", () => adjustFont(1));
$("shareButton").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    notify("Chapter link copied!");
  } catch {
    notify("Copy the URL from your browser address bar.");
  }
});
function paragraphize(text) {
  const fragment = document.createDocumentFragment();
  const normalized = text.replace(/\r\n?/g, "\n").trim();
  for (const paragraph of normalized.split(/\n\s*\n/)) {
    if (!paragraph.trim()) continue;
    const p = document.createElement("p");
    p.textContent = paragraph.trim();
    fragment.append(p);
  }
  return fragment;
}
function updateProgress() {
  const max = scrollArea.scrollHeight - scrollArea.clientHeight;
  const percent =
    max <= 0 ? 100 : Math.round((scrollArea.scrollTop / max) * 100);
  $("progressBar").style.width = percent + "%";
  $("progressLabel").textContent = percent + "% read";
}
scrollArea.addEventListener("scroll", updateProgress, { passive: true });
function updateNav() {
  document.querySelectorAll(".chapter-link").forEach((a, i) => {
    a.classList.toggle("active", i === state.index);
    if (i === state.index) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}
async function showChapter(index, { updateHash = true } = {}) {
  if (index < 0 || index >= state.chapters.length) return;
  state.index = index;
  const chapter = state.chapters[index];
  if (updateHash)
    history.pushState(null, "", "#" + encodeURIComponent(chapter.id));
  localStorage.setItem("reader-last-chapter", chapter.id);
  $("chapterNumber").textContent =
    `CHAPTER ${String(index + 1).padStart(2, "0")} OF ${state.chapters.length}`;
  $("chapterTitle").textContent = chapter.title;
  document.title = chapter.title + " — The Reading Room";
  $("chapterContent").replaceChildren();
  const loading = document.createElement("p");
  loading.textContent = "Opening chapter…";
  $("chapterContent").append(loading);
  $("readingStatus").textContent =
    `Chapter ${index + 1} of ${state.chapters.length}`;
  const prev = state.chapters[index - 1],
    next = state.chapters[index + 1];
  $("prevButton").disabled = !prev;
  $("nextButton").disabled = !next;
  $("prevLabel").textContent = prev?.title || "Beginning of book";
  $("nextLabel").textContent = next?.title || "End of book";
  scrollArea.scrollTop = 0;
  updateNav();
  closeMenu();
  updateProgress();
  const currentId = chapter.id;
  const results = await Promise.all(
    chapter.files.map(async (file) => {
      try {
        const response = await fetch("./" + file);
        if (!response.ok) throw Error(`HTTP ${response.status}`);
        return { text: await response.text() };
      } catch (error) {
        return {
          error: `Could not load ${file} (${error.message}). Check the filename and capitalization.`,
        };
      }
    }),
  );
  if (state.chapters[state.index].id !== currentId) return;
  const fragment = document.createDocumentFragment();
  results.forEach((result, i) => {
    if (i) {
      const hr = document.createElement("hr");
      hr.className = "page-separator";
      fragment.append(hr);
    }
    if (result.error) {
      const p = document.createElement("p");
      p.className = "error";
      p.textContent = result.error;
      fragment.append(p);
    } else fragment.append(paragraphize(result.text));
  });
  $("chapterContent").replaceChildren(fragment);
  updateProgress();
}
$("prevButton").addEventListener("click", () => showChapter(state.index - 1));
$("nextButton").addEventListener("click", () => showChapter(state.index + 1));
window.addEventListener("popstate", () => {
  const id = decodeURIComponent(location.hash.slice(1));
  const index = state.chapters.findIndex((c) => c.id === id);
  if (index >= 0) showChapter(index, { updateHash: false });
});
async function init() {
  try {
    const response = await fetch("./chapters.json");
    if (!response.ok) throw Error("chapters.json not found");
    const chapters = await response.json();
    if (
      !Array.isArray(chapters) ||
      !chapters.length ||
      chapters.some((c) => !c.id || !c.title || !Array.isArray(c.files))
    )
      throw Error("Invalid chapter list");
    state.chapters = chapters;
    $("chapterCount").textContent = chapters.length + " CHAPTERS";
    const nav = $("chapterNav");
    chapters.forEach((chapter, i) => {
      const link = document.createElement("a");
      link.href = "#" + encodeURIComponent(chapter.id);
      link.className = "chapter-link";
      const number = document.createElement("span");
      number.className = "chapter-index";
      number.textContent = String(i + 1).padStart(2, "0");
      const title = document.createElement("span");
      title.textContent = chapter.title;
      link.append(number, title);
      link.addEventListener("click", (event) => {
        event.preventDefault();
        showChapter(i);
      });
      nav.append(link);
    });
    const hashId = decodeURIComponent(location.hash.slice(1));
    const savedId = localStorage.getItem("reader-last-chapter");
    const hashIndex = chapters.findIndex((c) => c.id === hashId);
    const savedIndex = chapters.findIndex((c) => c.id === savedId);
    showChapter(hashIndex >= 0 ? hashIndex : savedIndex >= 0 ? savedIndex : 0, {
      updateHash: hashIndex < 0,
    });
  } catch (error) {
    $("chapterContent").textContent =
      `Unable to open book: ${error.message}. Serve this site through GitHub Pages or a local HTTP server (not file://).`;
    $("chapterTitle").textContent = "Book unavailable";
  }
}
init();

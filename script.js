// AfterHours starter interactions.
// This version stores your display name, avatar, and small progress locally
// in this browser. It does not create online accounts yet.

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const STORAGE_KEYS = {
  name: "afterhours_name",
  avatar: "afterhours_avatar",
  visited: "afterhours_visited",
  searched: "afterhours_searched",
  playlist: "afterhours_playlist",
  theme: "afterhours_theme"
};

let activeFilter = "all";
let toastTimer;

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function getSaved(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function setSaved(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    showToast("Your browser could not save this setting.");
  }
}

function updateProfile() {
  const name = getSaved(STORAGE_KEYS.name, "Player");
  const avatar = getSaved(STORAGE_KEYS.avatar, name.charAt(0).toUpperCase() || "P");
  $("#welcomeName").textContent = name;
  $("#sidebarName").textContent = name;
  $("#topName").textContent = name;
  $("#sidebarAvatar").textContent = avatar;
  $("#topAvatar").textContent = avatar;
  $("#nameInput").value = name === "Player" ? "" : name;
  $("#avatarInput").value = avatar;
}

function openProfile() {
  updateProfile();
  $("#profileMessage").textContent = "";
  $("#modalBackdrop").classList.remove("hidden");
  $("#nameInput").focus();
}

function closeProfile() {
  $("#modalBackdrop").classList.add("hidden");
}

function saveProfile() {
  const name = $("#nameInput").value.trim().slice(0, 18) || "Player";
  const avatar = $("#avatarInput").value.trim().slice(0, 2).toUpperCase() || name.charAt(0).toUpperCase();
  setSaved(STORAGE_KEYS.name, name);
  setSaved(STORAGE_KEYS.avatar, avatar);
  updateProfile();
  $("#profileMessage").textContent = "Profile saved on this device!";
  showToast("Your player profile has been updated.");
  setTimeout(closeProfile, 650);
}

function updateAchievements() {
  const unlocked = [
    ["visitBadge", getSaved(STORAGE_KEYS.visited, "") === "yes"],
    ["searchBadge", getSaved(STORAGE_KEYS.searched, "") === "yes"],
    ["musicBadge", getSaved(STORAGE_KEYS.playlist, "") === "yes"]
  ];
  let count = 0;
  unlocked.forEach(([id, isUnlocked]) => {
    const badge = $("#" + id);
    if (isUnlocked) {
      badge.textContent = "UNLOCKED";
      badge.classList.add("unlocked");
      count++;
    } else {
      badge.textContent = "LOCKED";
      badge.classList.remove("unlocked");
    }
  });
  $("#achievementCount").textContent = count;
}

function filterGames() {
  const query = $("#gameSearch").value.trim().toLowerCase();
  let visible = 0;
  $$(".game-card").forEach(card => {
    const matchesText = card.dataset.name.toLowerCase().includes(query);
    const matchesFilter = activeFilter === "all" || card.dataset.category === activeFilter;
    const show = matchesText && matchesFilter;
    card.classList.toggle("hidden", !show);
    if (show) visible++;
  });
  $("#noGames").classList.toggle("hidden", visible !== 0);
  if (query.length > 0) {
    setSaved(STORAGE_KEYS.searched, "yes");
    updateAchievements();
  }
}

function handleGameClick(gameName) {
  const messages = {
    "BitLife": "BitLife is listed in your library. We'll connect a legitimate playable version or official game page next.",
    "Bacon May Die": "Bacon May Die is in your library. We'll add a playable game source next.",
    "Crossy Road": "Crossy Road is in your library. We'll connect a playable version next.",
    "Minecraft": "Minecraft has official versions and browser-based alternatives. We'll add a legitimate option next.",
    "GTA-style games": "We'll add browser-playable open-world and driving alternatives here.",
    "Neon Runner": "Neon Runner is planned for a future AfterHours update.",
    "2048": "2048 is planned for a future AfterHours update."
  };
  showToast(messages[gameName] || "More details coming soon.");
}

function addPlaylist() {
  const current = getSaved(STORAGE_KEYS.playlist, "");
  if (current === "yes") {
    showToast("Your Late Night Loop playlist is ready for music links.");
    return;
  }
  setSaved(STORAGE_KEYS.playlist, "yes");
  $("#playlistCount").textContent = "2";
  updateAchievements();
  showToast("Playlist space added! Music playback can be connected later.");
}

function setupNavigation() {
  $$(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      $$(".nav-link").forEach(item => item.classList.remove("active"));
      link.classList.add("active");
      $("#sidebar").classList.remove("open");
    });
  });
}

function init() {
  $("#year").textContent = new Date().getFullYear();
  updateProfile();
  setSaved(STORAGE_KEYS.visited, "yes");
  updateAchievements();
  $("#playlistCount").textContent = getSaved(STORAGE_KEYS.playlist, "") === "yes" ? "2" : "1";

  $("#profileOpen").addEventListener("click", openProfile);
  $("#profileOpenTop").addEventListener("click", openProfile);
  $("#modalClose").addEventListener("click", closeProfile);
  $("#modalBackdrop").addEventListener("click", event => {
    if (event.target === $("#modalBackdrop")) closeProfile();
  });
  $("#saveProfile").addEventListener("click", saveProfile);
  $("#gameSearch").addEventListener("input", filterGames);
  $("#gameFilters").addEventListener("click", event => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    activeFilter = button.dataset.filter;
    $$(".filter-pill").forEach(item => item.classList.toggle("selected", item === button));
    filterGames();
  });
  $("#gamesGrid").addEventListener("click", event => {
    const button = event.target.closest("[data-game]");
    if (button) handleGameClick(button.dataset.game);
  });
  $("#playlistButton").addEventListener("click", addPlaylist);
  $("#themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("alt-accent");
    setSaved(STORAGE_KEYS.theme, document.body.classList.contains("alt-accent") ? "alternate" : "blue");
    showToast("Accent color switched.");
  });
  if (getSaved(STORAGE_KEYS.theme, "blue") === "alternate") {
    document.body.classList.add("alt-accent");
  }
  $("#menuToggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeProfile();
  });
  setupNavigation();
}

document.addEventListener("DOMContentLoaded", init);

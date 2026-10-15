const $ = selector => document.querySelector(selector);
let novels = [];

const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

function render() {
  const query = ($("#searchInput")?.value || "").trim().toLowerCase();
  const genre = $("#genreFilter")?.value || "";
  const status = $("#statusFilter")?.value || "";
  const sort = $("#sortFilter")?.value || "default";

  let list = novels.filter(novel =>
    [novel.title, novel.author, novel.description, ...(novel.genres || [])]
      .join(" ").toLowerCase().includes(query) &&
    (!genre || (novel.genres || []).includes(genre)) &&
    (!status || novel.status === status)
  );

  if (sort === "title") {
    list.sort((a, b) => a.title.localeCompare(b.title, "id"));
  } else if (sort === "chapters") {
    list.sort((a, b) => (b.chapterCount || 0) - (a.chapterCount || 0));
  } else if (sort === "ongoing") {
    list.sort((a, b) => (a.status === "Ongoing" ? 0 : 1) - (b.status === "Ongoing" ? 0 : 1));
  }

  $("#resultCount").textContent = list.length + (list.length === 1 ? " judul" : " judul");
  $("#novelGrid").innerHTML = list.map(novel => `
    <article class="card">
      <a href="reader.html?novel=${encodeURIComponent(novel.id)}" aria-label="Baca ${esc(novel.title)}">
        <div class="cover ${esc(novel.tone || "")}" data-mark="${esc(novel.mark || "山")}">
          <span class="cover-kicker">YUNXI · NOVEL TERJEMAHAN</span>
          <h3>${esc(novel.coverTitle || novel.title)}</h3>
          <span class="cover-rule"></span>
        </div>
      </a>
      <div class="info">
        <div class="meta">
          <span>${esc((novel.genres || []).slice(0, 2).join(" · "))}</span>
          <span class="tag">${esc(novel.status === "Ongoing" ? "Berjalan" : novel.status === "Tamat" ? "Tamat" : novel.status || "Berjalan")}</span>
        </div>
        <h3>${esc(novel.title)}</h3>
        <div class="author">${novel.author ? "Karya " + esc(novel.author) : "Terjemahan bahasa Indonesia"}</div>
        <p>${esc(novel.description)}</p>
        <div class="card-bottom">
          <span>${novel.chapterCount || 0} bab tersedia</span>
          <a class="read-link" href="reader.html?novel=${encodeURIComponent(novel.id)}">Mulai membaca ↗</a>
        </div>
      </div>
    </article>
  `).join("") || '<p class="muted empty-state">Belum ada judul yang cocok. Coba ubah kata kunci atau filter pilihanmu.</p>';
}

document.addEventListener("DOMContentLoaded", async () => {
  const savedTheme = localStorage.getItem("yunxi-theme") || localStorage.getItem("lingxi-theme");
  if (savedTheme === "dark") document.body.classList.add("dark");

  const themeToggle = $("#themeToggle");
  const syncThemeButton = () => {
    const dark = document.body.classList.contains("dark");
    themeToggle.textContent = dark ? "☀" : "☾";
    themeToggle.setAttribute("aria-label", dark ? "Gunakan tema terang" : "Gunakan tema gelap");
    themeToggle.setAttribute("title", dark ? "Gunakan tema terang" : "Gunakan tema gelap");
  };
  syncThemeButton();

  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("yunxi-theme", document.body.classList.contains("dark") ? "dark" : "light");
    syncThemeButton();
  });

  ["searchInput", "genreFilter", "statusFilter", "sortFilter"].forEach(id => {
    $("#" + id)?.addEventListener(id === "searchInput" ? "input" : "change", render);
  });

  $("#resetFilters")?.addEventListener("click", () => {
    $("#searchInput").value = "";
    $("#genreFilter").value = "";
    $("#statusFilter").value = "";
    $("#sortFilter").value = "default";
    render();
    $("#searchInput").focus();
  });

  try {
    const response = await fetch("data/novels.json");
    if (!response.ok) throw new Error("Koleksi tidak tersedia");
    novels = await response.json();
    render();
  } catch (error) {
    $("#resultCount").textContent = "";
    $("#novelGrid").innerHTML = '<p class="muted empty-state">Koleksi belum dapat dimuat. Silakan coba lagi nanti.</p>';
  }
});

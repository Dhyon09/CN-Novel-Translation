const $ = selector => document.querySelector(selector);
let novels = [];
let currentPage = 1;
const PAGE_SIZE = 12;

const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

function novelDate(novel) {
  return novel.addedAt || novel.publishedAt || novel.updatedAt || "";
}

function sortedNewest(list) {
  return [...list].sort((a, b) => {
    const dateA = novelDate(a);
    const dateB = novelDate(b);
    if (dateA && dateB) return dateB.localeCompare(dateA);
    if (dateA) return -1;
    if (dateB) return 1;
    return novels.indexOf(a) - novels.indexOf(b);
  });
}

function cardMarkup(novel) {
  return `
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
  `;
}

function renderPagination(totalPages) {
  const pagination = $("#pagination");
  if (!pagination) return;
  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }
  pagination.innerHTML = `
    <button type="button" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>← Sebelumnya</button>
    <span>Halaman ${currentPage} dari ${totalPages}</span>
    <button type="button" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>Berikutnya →</button>
  `;
  pagination.querySelectorAll("button[data-page]").forEach(button => {
    button.addEventListener("click", () => {
      currentPage = Number(button.dataset.page);
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function render() {
  const grid = $("#novelGrid");
  if (!grid) return;

  const isCollection = document.body.dataset.page === "collection";
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
  } else if (!isCollection) {
    list = sortedNewest(list);
  }

  if ($("#resultCount")) {
    $("#resultCount").textContent = list.length + (list.length === 1 ? " judul" : " judul");
  }

  if (isCollection) {
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    list = list.slice(start, start + PAGE_SIZE);
    renderPagination(totalPages);
  } else {
    list = list.slice(0, 6);
  }

  grid.innerHTML = list.map(cardMarkup).join("") ||
    '<p class="muted empty-state">Belum ada judul yang cocok. Coba ubah kata kunci atau filter pilihanmu.</p>';
}

document.addEventListener("DOMContentLoaded", async () => {
  const savedTheme = localStorage.getItem("yunxi-theme") || localStorage.getItem("lingxi-theme");
  if (savedTheme === "dark") document.body.classList.add("dark");

  const themeToggle = $("#themeToggle");
  const syncThemeButton = () => {
    if (!themeToggle) return;
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
    $("#" + id)?.addEventListener(id === "searchInput" ? "input" : "change", () => {
      currentPage = 1;
      render();
    });
  });

  $("#resetFilters")?.addEventListener("click", () => {
    $("#searchInput").value = "";
    $("#genreFilter").value = "";
    $("#statusFilter").value = "";
    $("#sortFilter").value = "default";
    currentPage = 1;
    render();
    $("#searchInput").focus();
  });

  try {
    const response = await fetch("data/novels.json");
    if (!response.ok) throw new Error("Koleksi tidak tersedia");
    novels = await response.json();
    render();
  } catch (error) {
    if ($("#resultCount")) $("#resultCount").textContent = "";
    $("#novelGrid").innerHTML = '<p class="muted empty-state">Koleksi belum dapat dimuat. Silakan coba lagi nanti.</p>';
  }
});

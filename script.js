function getPageId() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get("pageid")) || 1;
}

async function loadPages() {
  const response = await fetch("pages.json");
  return await response.json();
}

function generateTOC(headings) {
  const tocList = document.getElementById("toc-list");
  tocList.innerHTML = "";
  headings.forEach((heading, index) => {
    const id = `section-${index}`;
    heading.id = id;

    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${id}`;
    a.textContent = heading.textContent;
    li.appendChild(a);
    tocList.appendChild(li);
  });
}

function displayCurrentDate() {
  const now = new Date();
  document.getElementById("current-date").textContent = now.toLocaleDateString("ru-RU", {
    year: "numeric"
  });
}

function setupSearch(pages) {
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    searchResults.innerHTML = "";
    searchResults.style.display = 'none';

    if (query.length === 0) return;

    const results = pages.filter(p => p.title.toLowerCase().includes(query));
    results.forEach(page => {
      const link = document.createElement("a");
      link.href = `?pageid=${page.id}`;
      link.textContent = page.title;
      searchResults.appendChild(link);
      searchResults.appendChild(document.createElement("br"));
      searchResults.style.display = 'block';
    });
  });
}

function warnExternalLinks(container) {
  container.querySelectorAll("a[href^='http']").forEach(link => {
    link.target = "_blank";
    link.addEventListener("click", e => {
      const confirmed = confirm("Вы покидаете сайт. Открыть внешнюю ссылку?");
      if (!confirmed) e.preventDefault();
    });
  });
}

async function loadPage() {
  try {
    const pages = await loadPages();
    const pageId = getPageId();
    const page = pages.find(p => p.id === pageId);
    const searchResults = document.getElementById("search-results");
    
    searchResults.style.display = 'none';
    displayCurrentDate();

    const contentDiv = document.getElementById("content");

    if (page) {
      document.title = `${page.title} - Энциклопедия Flux Engine для разработчиков`;
      
      contentDiv.innerHTML = `<h1>${page.title}</h1><p style="font-style: italic; font-size: 8"></p><splitter></splitter>` + page.content;

      const headings = contentDiv.querySelectorAll("h2, h3");
      generateTOC(Array.from(headings));

      warnExternalLinks(contentDiv);
    } else {
      document.title = `Ой! Что-то пошло не так.`;
      contentDiv.innerHTML = "<h2>Страница не найдена</h2><p>Страница, которую вы ищете, не существует, либо была удалена";
    }

    setupSearch(pages);
  } catch (error) {
    const link = document.querySelector('link[rel="icon"]');
    if (link) {
      link.setAttribute("href", "/error_favicon.png?v=" + Date.now());
    }
    document.title = `Ой! Что-то пошло не так.`;
    document.getElementById("content").innerHTML = `<h2>Ошибка загрузки данных</h2><p>(${error})</p>`;
  }
}

window.addEventListener("DOMContentLoaded", loadPage);

document.addEventListener("scroll", () => {
  const btn = document.getElementById("scroll-top");
  if (window.scrollY > 300) {
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
});

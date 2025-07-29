const searchInput = document.getElementById('search-input');
const snippetList = document.getElementById('snippet-list');

let snippets = [
  { title: 'Room Entity', description: 'Basic Room entity example', keyword: 'room' },
  { title: 'JWT Secret Gen', description: 'Generate secure jwt secret', keyword: 'jwt' },
  { title: 'KSP Setup', description: 'Kotlin Symbol Processing setup', keyword: 'ksp' },
  // bu yerdan keyin istagancha snippet qo‘shsa bo‘ladi
];

let selectedIndex = -1;

// 🔎 Realtime filter
searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.toLowerCase();
  const filtered = snippets.filter(snippet =>
    snippet.title.toLowerCase().includes(searchTerm) ||
    snippet.keyword.toLowerCase().includes(searchTerm)
  );

  renderList(filtered);
  selectedIndex = -1;
});

// 🔽🔼 va ⏎ Enter navigatsiyasi
document.addEventListener('keydown', (event) => {
  const items = document.querySelectorAll('#snippet-list li');

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    selectedIndex = (selectedIndex + 1) % items.length;
    updateSelection(items);
  }

  else if (event.key === 'ArrowUp') {
    event.preventDefault();
    selectedIndex = (selectedIndex - 1 + items.length) % items.length;
    updateSelection(items);
  }

  else if (event.key === 'Enter') {
    if (selectedIndex !== -1) {
      const keyword = items[selectedIndex].dataset.keyword;
      window.location.href = `snippet/?snippet=${keyword}`;
    }
  }

  else if (event.key === 'Escape') {
    searchInput.value = '';
    snippetList.innerHTML = '';
    selectedIndex = -1;
  }

  else {
    searchInput.focus();
  }
});

// 🧠 Listni render qilish
function renderList(snippetsToRender) {
  if (snippetsToRender.length === 0) {
    snippetList.innerHTML = '<p id="no-results">No results found</p>';
    return;
  }

  snippetList.innerHTML = snippetsToRender.map(snippet =>
    `<li data-keyword="${snippet.keyword}">
      <h2>${snippet.title}</h2>
      <p>${snippet.description}</p>
    </li>`
  ).join('');

  // Click bilan kirish (fallback)
  document.querySelectorAll('#snippet-list li').forEach(li => {
    li.addEventListener('click', () => {
      const keyword = li.dataset.keyword;
      window.location.href = `snippet/?snippet=${keyword}`;
    });
  });
}

// 🔄 Tanlangan elementni yangilash
function updateSelection(items) {
  items.forEach((item, index) => {
    if (index === selectedIndex) {
      item.classList.add('selected');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('selected');
    }
  });
}

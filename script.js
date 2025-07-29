const searchInput = document.getElementById('search-input');
const snippetList = document.getElementById('snippet-list');

searchInput.addEventListener('input', handleSearch);

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const snippets = getSnippets();

    const filteredSnippets = snippets.filter(snippet => {
        return snippet.title.toLowerCase().includes(searchTerm) || snippet.description.toLowerCase().includes(searchTerm);
    });

    renderSnippets(filteredSnippets);
}

function getSnippets() {
    // TO DO: implement fetching snippets from /snippets/ directory
    return [];
}

function renderSnippets(snippets) {
    snippetList.innerHTML = '';

    snippets.forEach(snippet => {
        const li = document.createElement('li');
        li.innerHTML = `
            <h2>${snippet.title}</h2>
            <p>${snippet.description}</p>
            <pre><code>${snippet.code}</code></pre>
        `;
        snippetList.appendChild(li);
    });
}
// Snippet data management
class SnippetManager {
    constructor() {
        this.defaultSnippets = [
            { 
                id: 'room', 
                title: 'Room Database Setup', 
                description: 'Complete Android Room database configuration with Entity, DAO, and Database classes', 
                keywords: ['room', 'android', 'database', 'dao', 'entity', 'kotlin'],
                category: 'Android',
                popular: true,
                isCustom: false
            },
            { 
                id: 'jwt', 
                title: 'JWT Secret Generator', 
                description: 'Generate secure JWT secrets using Node.js with crypto module', 
                keywords: ['jwt', 'node', 'auth', 'token', 'security', 'crypto'],
                category: 'Security',
                popular: true,
                isCustom: false
            },
            { 
                id: 'ksp', 
                title: 'Kotlin Symbol Processing', 
                description: 'KSP setup and configuration for Kotlin annotation processing', 
                keywords: ['ksp', 'kotlin', 'annotation', 'processing', 'compiler'],
                category: 'Kotlin',
                popular: false,
                isCustom: false
            }
        ];
        this.customSnippets = this.loadCustomSnippets();
    }

    getAllSnippets() {
        return [...this.defaultSnippets, ...this.customSnippets];
    }

    loadCustomSnippets() {
        try {
            const stored = localStorage.getItem('devsnippets_custom');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading custom snippets:', error);
            return [];
        }
    }

    saveCustomSnippets() {
        try {
            localStorage.setItem('devsnippets_custom', JSON.stringify(this.customSnippets));
            this.updateStorageInfo();
        } catch (error) {
            console.error('Error saving custom snippets:', error);
            alert('Error saving snippet. Storage might be full.');
        }
    }

    addCustomSnippet(snippet) {
        const customSnippet = {
            ...snippet,
            id: this.generateId(),
            isCustom: true,
            popular: true,
            createdAt: Date.now()
        };
        this.customSnippets.push(customSnippet);
        this.saveCustomSnippets();
        return customSnippet;
    }

    updateCustomSnippet(id, updates) {
        const index = this.customSnippets.findIndex(s => s.id === id);
        if (index !== -1) {
            this.customSnippets[index] = { ...this.customSnippets[index], ...updates };
            this.saveCustomSnippets();
            return this.customSnippets[index];
        }
        return null;
    }

    deleteCustomSnippet(id) {
        this.customSnippets = this.customSnippets.filter(s => s.id !== id);
        this.saveCustomSnippets();
        localStorage.removeItem(`devsnippets_content_${id}`);
    }

    clearAllCustomSnippets() {
        this.customSnippets.forEach(snippet => {
            localStorage.removeItem(`devsnippets_content_${snippet.id}`);
        });
        this.customSnippets = [];
        localStorage.removeItem('devsnippets_custom');
        this.updateStorageInfo();
    }

    generateId() {
        return 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    exportData() {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            snippets: this.customSnippets.map(snippet => ({
                ...snippet,
                content: localStorage.getItem(`devsnippets_content_${snippet.id}`) || ''
            }))
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `devsnippets_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (!data.snippets || !Array.isArray(data.snippets)) {
                throw new Error('Invalid file format');
            }

            let imported = 0;
            data.snippets.forEach(snippet => {
                const { content, ...snippetMeta } = snippet;
                const newSnippet = this.addCustomSnippet({
                    title: snippetMeta.title,
                    description: snippetMeta.description,
                    keywords: snippetMeta.keywords || [],
                    category: snippetMeta.category || 'Custom'
                });
                
                if (content) {
                    localStorage.setItem(`devsnippets_content_${newSnippet.id}`, content);
                }
                imported++;
            });

            return imported;
        } catch (error) {
            console.error('Import error:', error);
            throw new Error('Failed to import snippets. Please check the file format.');
        }
    }

    updateStorageInfo() {
        const storageInfo = document.getElementById('storage-info');
        if (storageInfo) {
            const used = this.getStorageSize();
            storageInfo.textContent = `${used} used`;
        }
    }

    getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (key.startsWith('devsnippets_')) {
                total += localStorage[key].length;
            }
        }
        
        if (total < 1024) return `${total} B`;
        if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`;
        return `${(total / (1024 * 1024)).toFixed(1)} MB`;
    }
}

// Initialize snippet manager
const snippetManager = new SnippetManager();

// DOM elements
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const snippetList = document.getElementById('snippet-list');
const snippetCount = document.getElementById('snippet-count');
const snippetGrid = document.getElementById('snippet-grid');
const addSnippetBtn = document.getElementById('add-snippet-btn');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const clearCustomBtn = document.getElementById('clear-custom-btn');
const addSnippetModal = document.getElementById('add-snippet-modal');
const snippetForm = document.getElementById('snippet-form');
const cancelBtn = document.getElementById('cancel-btn');

let selectedIndex = -1;
let currentResults = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    updateSnippetCount();
    renderPopularSnippets();
    snippetManager.updateStorageInfo();
    searchInput.focus();
});

// Update snippet count
function updateSnippetCount() {
    const allSnippets = snippetManager.getAllSnippets();
    const customCount = snippetManager.customSnippets.length;
    snippetCount.textContent = `${allSnippets.length} (${customCount} custom)`;
}

// Render popular snippets
function renderPopularSnippets() {
    const allSnippets = snippetManager.getAllSnippets();
    const popularSnippets = allSnippets.filter(s => s.popular || s.isCustom).slice(0, 6);
    
    snippetGrid.innerHTML = popularSnippets.map(snippet => `
        <div class="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-200 cursor-pointer group relative" 
             onclick="openSnippet('${snippet.id}')">
            ${snippet.isCustom ? `
                <div class="absolute top-2 right-2 flex space-x-1">
                    <button onclick="event.stopPropagation(); editSnippet('${snippet.id}')" 
                            class="opacity-0 group-hover:opacity-100 p-1 bg-slate-700 hover:bg-slate-600 rounded text-xs transition-all"
                            title="Edit snippet">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="event.stopPropagation(); deleteSnippet('${snippet.id}')" 
                            class="opacity-0 group-hover:opacity-100 p-1 bg-red-700 hover:bg-red-600 rounded text-xs transition-all"
                            title="Delete snippet">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            ` : ''}
            <div class="flex items-start justify-between mb-2 ${snippet.isCustom ? 'pr-16' : ''}">
                <h4 class="font-semibold text-white group-hover:text-blue-400 transition-colors">${snippet.title}</h4>
                <span class="text-xs px-2 py-1 ${snippet.isCustom ? 'bg-purple-700' : 'bg-slate-700'} rounded-full text-slate-300 flex-shrink-0">
                    ${snippet.isCustom ? 'Custom' : snippet.category}
                </span>
            </div>
            <p class="text-sm text-slate-400 mb-3">${snippet.description}</p>
            <div class="flex flex-wrap gap-1">
                ${snippet.keywords.slice(0, 3).map(keyword => 
                    `<span class="text-xs px-2 py-1 bg-slate-700/50 rounded text-slate-300">${keyword}</span>`
                ).join('')}
            </div>
        </div>
    `).join('');
}

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        hideSearchResults();
        return;
    }

    const allSnippets = snippetManager.getAllSnippets();
    currentResults = allSnippets.filter(snippet =>
        snippet.title.toLowerCase().includes(searchTerm) ||
        snippet.description.toLowerCase().includes(searchTerm) ||
        snippet.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    );

    renderSearchResults(currentResults);
    selectedIndex = -1;
});

// Render search results
function renderSearchResults(results) {
    if (results.length === 0) {
        snippetList.innerHTML = `
            <li class="px-4 py-8 text-center text-slate-400">
                <svg class="w-12 h-12 mx-auto mb-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29.82-5.877 2.172M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.875a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z"></path>
                </svg>
                <p class="font-medium">No snippets found</p>
                <p class="text-sm">Try different keywords or check spelling</p>
            </li>
        `;
    } else {
        snippetList.innerHTML = results.map((snippet, index) => `
            <li class="snippet-item px-4 py-3 hover:bg-slate-700/50 cursor-pointer border-b border-slate-700/30 last:border-b-0 transition-all duration-150" 
                data-index="${index}" data-id="${snippet.id}" onclick="openSnippet('${snippet.id}')">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h4 class="font-semibold text-white mb-1 flex items-center">
                            ${snippet.title}
                            ${snippet.isCustom ? '<span class="ml-2 text-xs px-2 py-0.5 bg-purple-700 rounded-full">Custom</span>' : ''}
                        </h4>
                        <p class="text-sm text-slate-400 mb-2">${snippet.description}</p>
                        <div class="flex flex-wrap gap-1">
                            ${snippet.keywords.slice(0, 4).map(keyword => 
                                `<span class="text-xs px-2 py-1 bg-slate-700/50 rounded text-slate-300">${keyword}</span>`
                            ).join('')}
                        </div>
                    </div>
                    <span class="text-xs px-2 py-1 ${snippet.isCustom ? 'bg-purple-700' : 'bg-slate-700'} rounded-full text-slate-300 ml-3">
                        ${snippet.isCustom ? 'Custom' : snippet.category}
                    </span>
                </div>
            </li>
        `).join('');
    }
    
    showSearchResults();
}

// Show/hide search results
function showSearchResults() {
    searchResults.classList.remove('hidden');
}

function hideSearchResults() {
    searchResults.classList.add('hidden');
}

// Update selection for keyboard navigation
function updateSelection(items) {
    items.forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('bg-slate-700/70', 'ring-2', 'ring-blue-500/50');
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            item.classList.remove('bg-slate-700/70', 'ring-2', 'ring-blue-500/50');
        }
    });
}

// Open snippet (will redirect to snippet viewer or editor)
function openSnippet(snippetId) {
    window.location.href = `snippet/?snippet=${snippetId}`;
}

// Edit snippet (will redirect to editor page)
function editSnippet(snippetId) {
    window.location.href = `editor/?snippet=${snippetId}`;
}

// Delete snippet
function deleteSnippet(snippetId) {
    const snippet = snippetManager.customSnippets.find(s => s.id === snippetId);
    if (snippet && confirm(`Are you sure you want to delete "${snippet.title}"?`)) {
        snippetManager.deleteCustomSnippet(snippetId);
        updateSnippetCount();
        renderPopularSnippets();
        alert('Snippet deleted successfully!');
    }
}

// Modal functions
function showModal() {
    addSnippetModal.classList.remove('hidden');
    document.getElementById('snippet-title').focus();
}

function hideModal() {
    addSnippetModal.classList.add('hidden');
    snippetForm.reset();
    document.getElementById('snippet-category').value = 'Custom';
}

// Event listeners
addSnippetBtn.addEventListener('click', showModal);
cancelBtn.addEventListener('click', hideModal);

// Close modal on backdrop click
addSnippetModal.addEventListener('click', (e) => {
    if (e.target === addSnippetModal) {
        hideModal();
    }
});

// Handle form submission
snippetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('snippet-title').value.trim();
    const description = document.getElementById('snippet-description').value.trim();
    const category = document.getElementById('snippet-category').value.trim() || 'Custom';
    const keywords = document.getElementById('snippet-keywords').value
        .split(',')
        .map(k => k.trim())
        .filter(k => k);
    const content = document.getElementById('snippet-content').value.trim();
    
    if (!title || !description || !content) {
        alert('Please fill in all required fields.');
        return;
    }
    
    try {
        const newSnippet = snippetManager.addCustomSnippet({
            title, description, category, keywords
        });
        
        localStorage.setItem(`devsnippets_content_${newSnippet.id}`, content);
        
        updateSnippetCount();
        renderPopularSnippets();
        hideModal();
        
        // Ask user if they want to edit the snippet in the editor
        if (confirm('Snippet added successfully! Would you like to open it in the editor to refine it?')) {
            window.location.href = `editor/?snippet=${newSnippet.id}`;
        }
    } catch (error) {
        alert('Error saving snippet: ' + error.message);
    }
});

// Export functionality
exportBtn.addEventListener('click', () => {
    if (snippetManager.customSnippets.length === 0) {
        alert('No custom snippets to export.');
        return;
    }
    snippetManager.exportData();
    alert('Snippets exported successfully!');
});

// Import functionality
importBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const imported = await snippetManager.importData(file);
                alert(`Successfully imported ${imported} snippets!`);
                updateSnippetCount();
                renderPopularSnippets();
                snippetManager.updateStorageInfo();
            } catch (error) {
                alert(error.message);
            }
        }
    };
    input.click();
});

// Clear custom snippets
clearCustomBtn.addEventListener('click', () => {
    if (snippetManager.customSnippets.length === 0) {
        alert('No custom snippets to clear.');
        return;
    }
    
    if (confirm(`Are you sure you want to delete all ${snippetManager.customSnippets.length} custom snippets? This cannot be undone.`)) {
        snippetManager.clearAllCustomSnippets();
        updateSnippetCount();
        renderPopularSnippets();
        alert('All custom snippets have been deleted.');
    }
});

// Keyboard navigation
document.addEventListener('keydown', (event) => {
    if (searchResults.classList.contains('hidden')) return;

    const items = document.querySelectorAll('.snippet-item');

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        selectedIndex = (selectedIndex + 1) % items.length;
        updateSelection(items);
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        updateSelection(items);
    } else if (event.key === 'Enter') {
        event.preventDefault();
        if (selectedIndex !== -1 && items[selectedIndex]) {
            const snippetId = items[selectedIndex].dataset.id;
            openSnippet(snippetId);
        }
    } else if (event.key === 'Escape') {
        searchInput.value = '';
        hideSearchResults();
        selectedIndex = -1;
    }
});

// Click outside to close search results
document.addEventListener('click', (event) => {
    if (!searchResults.contains(event.target) && !searchInput.contains(event.target)) {
        hideSearchResults();
    }
});

// Focus search input when typing
document.addEventListener('keydown', (event) => {
    if (event.target === searchInput) return;
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        searchInput.focus();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !addSnippetModal.classList.contains('hidden')) {
        hideModal();
    }
});
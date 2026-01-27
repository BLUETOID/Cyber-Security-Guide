/**
 * Cyber Security Study Guide - Interactive Features
 * Includes: Dark Mode, Bookmarks, Highlights, Back to Top, Loading
 */

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initBackToTop();
    initBookmarkSystem();
    initHighlightSystem();
    initSmoothScroll();
});

// ========================================
// SVG ICONS
// ========================================
const ICONS = {
    moon: '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
    sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
    arrowUp: '<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>',
    bookmark: '<svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>',
    bookmarkFilled: '<svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" fill="currentColor"></path></svg>',
    bookmarks: '<svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>',
    x: '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>'
};

// ========================================
// DARK MODE
// ========================================
function initDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        body.classList.add('dark-mode');
        if (darkModeToggle) {
            darkModeToggle.innerHTML = ICONS.sun;
            darkModeToggle.setAttribute('aria-label', 'Switch to light mode');
        }
    } else {
        if (darkModeToggle) {
            darkModeToggle.innerHTML = ICONS.moon;
        }
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            this.innerHTML = isDark ? ICONS.sun : ICONS.moon;
            this.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
            
            // Add transition class for smooth change
            body.classList.add('theme-transitioning');
            setTimeout(() => body.classList.remove('theme-transitioning'), 300);
        });
    }
}

// ========================================
// BACK TO TOP BUTTON
// ========================================
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (!backToTopBtn) return;
    
    // Set SVG icon
    backToTopBtn.innerHTML = ICONS.arrowUp;
    
    // Show/hide based on scroll position
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    // Scroll to top on click
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========================================
// BOOKMARK SYSTEM
// ========================================
function initBookmarkSystem() {
    loadBookmarks();
    createBookmarkPanel();
    
    // Add bookmark buttons to sections
    document.querySelectorAll('.content-section h2, .content-section h3').forEach((heading, index) => {
        const headingId = heading.id || `section-${index}`;
        heading.id = headingId;
        
        const bookmarkBtn = document.createElement('button');
        bookmarkBtn.className = 'bookmark-btn';
        bookmarkBtn.innerHTML = ICONS.bookmark;
        bookmarkBtn.title = 'Bookmark this section';
        bookmarkBtn.setAttribute('aria-label', 'Bookmark this section');
        bookmarkBtn.dataset.sectionId = headingId;
        bookmarkBtn.dataset.sectionTitle = heading.textContent;
        bookmarkBtn.dataset.page = window.location.pathname.split('/').pop();
        
        // Check if already bookmarked
        const bookmarks = getBookmarks();
        if (bookmarks.some(b => b.id === headingId && b.page === bookmarkBtn.dataset.page)) {
            bookmarkBtn.classList.add('bookmarked');
            bookmarkBtn.innerHTML = ICONS.bookmarkFilled;
        }
        
        bookmarkBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleBookmark(this);
        });
        
        heading.style.position = 'relative';
        heading.appendChild(bookmarkBtn);
    });
}

function getBookmarks() {
    return JSON.parse(localStorage.getItem('cyberSecBookmarks') || '[]');
}

function saveBookmarks(bookmarks) {
    localStorage.setItem('cyberSecBookmarks', JSON.stringify(bookmarks));
}

function toggleBookmark(btn) {
    const bookmarks = getBookmarks();
    const sectionId = btn.dataset.sectionId;
    const page = btn.dataset.page;
    const title = btn.dataset.sectionTitle;
    
    const existingIndex = bookmarks.findIndex(b => b.id === sectionId && b.page === page);
    
    if (existingIndex > -1) {
        bookmarks.splice(existingIndex, 1);
        btn.classList.remove('bookmarked');
        btn.innerHTML = ICONS.bookmark;
        showToast('Bookmark removed');
    } else {
        bookmarks.push({
            id: sectionId,
            page: page,
            title: title,
            timestamp: Date.now()
        });
        btn.classList.add('bookmarked');
        btn.innerHTML = ICONS.bookmarkFilled;
        showToast('Bookmark added');
    }
    
    saveBookmarks(bookmarks);
    updateBookmarkPanel();
}

function loadBookmarks() {
    // Scroll to bookmark if hash present
    if (window.location.hash) {
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }
}

function createBookmarkPanel() {
    const panel = document.createElement('div');
    panel.id = 'bookmark-panel';
    panel.className = 'bookmark-panel';
    panel.innerHTML = `
        <button class="bookmark-panel-toggle" id="bookmark-panel-toggle" aria-label="Toggle bookmarks">
            ${ICONS.bookmarks}
        </button>
        <div class="bookmark-panel-content">
            <h4>Your Bookmarks</h4>
            <div id="bookmark-list"></div>
            <button class="clear-bookmarks-btn" id="clear-bookmarks">Clear All</button>
        </div>
    `;
    document.body.appendChild(panel);
    
    document.getElementById('bookmark-panel-toggle').addEventListener('click', function() {
        panel.classList.toggle('open');
    });
    
    document.getElementById('clear-bookmarks').addEventListener('click', function() {
        if (confirm('Clear all bookmarks?')) {
            localStorage.removeItem('cyberSecBookmarks');
            updateBookmarkPanel();
            document.querySelectorAll('.bookmark-btn.bookmarked').forEach(btn => {
                btn.classList.remove('bookmarked');
                btn.innerHTML = ICONS.bookmark;
            });
            showToast('All bookmarks cleared');
        }
    });
    
    updateBookmarkPanel();
}

function updateBookmarkPanel() {
    const list = document.getElementById('bookmark-list');
    const bookmarks = getBookmarks();
    
    if (bookmarks.length === 0) {
        list.innerHTML = '<p class="no-bookmarks">No bookmarks yet. Click the bookmark icon on any heading to save it.</p>';
        return;
    }
    
    list.innerHTML = bookmarks.map(b => `
        <a href="${b.page}#${b.id}" class="bookmark-item">
            <span class="bookmark-title">${b.title}</span>
            <span class="bookmark-page">${b.page.replace('.html', '')}</span>
        </a>
    `).join('');
}

// ========================================
// HIGHLIGHT SYSTEM
// ========================================
function initHighlightSystem() {
    loadHighlights();
    
    // Create highlight toolbar
    const toolbar = document.createElement('div');
    toolbar.id = 'highlight-toolbar';
    toolbar.className = 'highlight-toolbar';
    toolbar.innerHTML = `
        <button class="highlight-btn yellow" data-color="yellow" title="Yellow highlight" style="background:#fef08a;"></button>
        <button class="highlight-btn green" data-color="green" title="Green highlight" style="background:#bbf7d0;"></button>
        <button class="highlight-btn blue" data-color="blue" title="Blue highlight" style="background:#bfdbfe;"></button>
        <button class="highlight-btn remove" data-color="remove" title="Remove highlight">${ICONS.x}</button>
        <button class="highlight-btn note" data-action="note" title="Add note">${ICONS.edit}</button>
    `;
    document.body.appendChild(toolbar);
    
    // Show toolbar on text selection
    document.addEventListener('mouseup', function(e) {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        if (selectedText.length > 0 && !e.target.closest('.highlight-toolbar')) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            toolbar.style.top = `${rect.top + window.scrollY - 50}px`;
            toolbar.style.left = `${rect.left + window.scrollX + (rect.width / 2) - 75}px`;
            toolbar.classList.add('visible');
        } else if (!e.target.closest('.highlight-toolbar')) {
            toolbar.classList.remove('visible');
        }
    });
    
    // Highlight button clicks
    toolbar.addEventListener('click', function(e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        
        const color = btn.dataset.color;
        const action = btn.dataset.action;
        
        if (action === 'note') {
            addNoteToSelection();
        } else if (color === 'remove') {
            removeHighlight();
        } else if (color) {
            applyHighlight(color);
        }
        
        toolbar.classList.remove('visible');
    });
}

function applyHighlight(color) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    
    if (!selectedText) return;
    
    const span = document.createElement('span');
    span.className = `user-highlight highlight-${color}`;
    span.dataset.highlightId = Date.now();
    
    try {
        range.surroundContents(span);
        saveHighlight({
            id: span.dataset.highlightId,
            text: selectedText,
            color: color,
            page: window.location.pathname.split('/').pop()
        });
        showToast('Text highlighted');
    } catch (e) {
        showToast('Cannot highlight across elements');
    }
    
    selection.removeAllRanges();
}

function removeHighlight() {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const highlightSpan = container.nodeType === 3 ? 
        container.parentElement.closest('.user-highlight') : 
        container.closest('.user-highlight');
    
    if (highlightSpan) {
        const parent = highlightSpan.parentNode;
        while (highlightSpan.firstChild) {
            parent.insertBefore(highlightSpan.firstChild, highlightSpan);
        }
        parent.removeChild(highlightSpan);
        
        // Remove from storage
        const highlights = getHighlights();
        const filtered = highlights.filter(h => h.id !== highlightSpan.dataset.highlightId);
        localStorage.setItem('cyberSecHighlights', JSON.stringify(filtered));
        
        showToast('Highlight removed');
    }
    
    selection.removeAllRanges();
}

function addNoteToSelection() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (!selectedText) return;
    
    const note = prompt('Add a note for this text:');
    if (note) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.className = 'user-highlight highlight-note';
        span.dataset.note = note;
        span.dataset.highlightId = Date.now();
        span.title = note;
        
        try {
            range.surroundContents(span);
            saveHighlight({
                id: span.dataset.highlightId,
                text: selectedText,
                note: note,
                color: 'note',
                page: window.location.pathname.split('/').pop()
            });
            showToast('Note added');
        } catch (e) {
            showToast('Cannot add note across elements');
        }
    }
    
    selection.removeAllRanges();
}

function getHighlights() {
    return JSON.parse(localStorage.getItem('cyberSecHighlights') || '[]');
}

function saveHighlight(highlight) {
    const highlights = getHighlights();
    highlights.push(highlight);
    localStorage.setItem('cyberSecHighlights', JSON.stringify(highlights));
}

function loadHighlights() {
    // Note: Full restoration would require more complex DOM mapping
    // This is a simplified version
}

// ========================================
// LOADING ANIMATION
// ========================================
function initLoadingAnimation() {
    // Add loaded class after page loads
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        
        // Animate elements on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.content-section, .question-item, .unit-overview, .nav-card').forEach(el => {
            el.classList.add('animate-ready');
            observer.observe(el);
        });
    });
}

// ========================================
// SMOOTH SCROLL
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================
function showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

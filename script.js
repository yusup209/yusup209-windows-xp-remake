// Windows XP JavaScript Interactions

// Constants
const DOUBLE_CLICK_DELAY = 300; // milliseconds

// Window Management
class WindowManager {
    constructor() {
        this.windows = [];
        this.nextZIndex = 1000;
        this.nextWindowId = 1;
        this.container = document.getElementById('windowsContainer');
        this.taskButtons = document.getElementById('taskButtons');
    }

    createWindow(config) {
        const windowId = `window-${this.nextWindowId++}`;
        const window = {
            id: windowId,
            title: config.title,
            icon: config.icon,
            content: config.content,
            width: config.width || 600,
            height: config.height || 400,
            x: config.x || 100 + (this.windows.length * 30),
            y: config.y || 100 + (this.windows.length * 30),
            zIndex: this.nextZIndex++,
            maximized: false,
            minimized: false,
            element: null,
            taskbarButton: null
        };

        this.windows.push(window);
        this.renderWindow(window);
        this.createTaskbarButton(window);
        this.focusWindow(window);

        return window;
    }

    renderWindow(window) {
        const windowEl = document.createElement('div');
        windowEl.className = 'window';
        windowEl.id = window.id;
        windowEl.style.width = `${window.width}px`;
        windowEl.style.height = `${window.height}px`;
        windowEl.style.left = `${window.x}px`;
        windowEl.style.top = `${window.y}px`;
        windowEl.style.zIndex = window.zIndex;

        windowEl.innerHTML = `
            <div class="window-titlebar">
                ${window.icon ? `<div class="window-icon">${window.icon}</div>` : ''}
                <div class="window-title">${window.title}</div>
                <div class="window-controls">
                    <button class="window-control-btn minimize" title="Minimize">_</button>
                    <button class="window-control-btn maximize" title="Maximize">□</button>
                    <button class="window-control-btn close" title="Close">✕</button>
                </div>
            </div>
            <div class="window-content">
                ${window.content}
            </div>
        `;

        this.container.appendChild(windowEl);
        window.element = windowEl;

        // Add event listeners
        this.setupWindowEvents(window);
    }

    setupWindowEvents(window) {
        const windowEl = window.element;
        const titlebar = windowEl.querySelector('.window-titlebar');
        const minimizeBtn = windowEl.querySelector('.minimize');
        const maximizeBtn = windowEl.querySelector('.maximize');
        const closeBtn = windowEl.querySelector('.close');

        // Focus on click
        windowEl.addEventListener('mousedown', () => {
            this.focusWindow(window);
        });

        // Dragging
        let isDragging = false;
        let dragStartX, dragStartY, windowStartX, windowStartY;

        titlebar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            if (window.maximized) return;

            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            windowStartX = window.x;
            windowStartY = window.y;

            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;

            window.x = windowStartX + dx;
            window.y = windowStartY + dy;

            // Keep window within bounds
            window.x = Math.max(0, Math.min(window.x, window.innerWidth - 100));
            window.y = Math.max(0, Math.min(window.y, window.innerHeight - 100));

            windowEl.style.left = `${window.x}px`;
            windowEl.style.top = `${window.y}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Window controls
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.minimizeWindow(window);
        });

        maximizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMaximize(window);
        });

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeWindow(window);
        });

        // Double-click titlebar to maximize
        titlebar.addEventListener('dblclick', () => {
            this.toggleMaximize(window);
        });
    }

    focusWindow(window) {
        // Update z-indices
        this.windows.forEach(w => {
            if (w.element) {
                w.element.classList.remove('active');
                w.element.classList.add('inactive');
            }
            if (w.taskbarButton) {
                w.taskbarButton.classList.remove('active');
            }
        });

        window.zIndex = this.nextZIndex++;
        if (window.element) {
            window.element.style.zIndex = window.zIndex;
            window.element.classList.add('active');
            window.element.classList.remove('inactive');
        }

        if (window.taskbarButton) {
            window.taskbarButton.classList.add('active');
        }
    }

    minimizeWindow(window) {
        window.minimized = true;
        if (window.element) {
            window.element.classList.add('minimized');
        }
        if (window.taskbarButton) {
            window.taskbarButton.classList.remove('active');
        }
    }

    restoreWindow(window) {
        window.minimized = false;
        if (window.element) {
            window.element.classList.remove('minimized');
        }
        this.focusWindow(window);
    }

    toggleMaximize(window) {
        window.maximized = !window.maximized;
        
        if (window.maximized) {
            // Store original dimensions
            window.originalX = window.x;
            window.originalY = window.y;
            window.originalWidth = window.width;
            window.originalHeight = window.height;
            
            window.element.classList.add('maximized');
        } else {
            // Restore original dimensions
            window.x = window.originalX;
            window.y = window.originalY;
            window.width = window.originalWidth;
            window.height = window.originalHeight;
            
            window.element.classList.remove('maximized');
            window.element.style.width = `${window.width}px`;
            window.element.style.height = `${window.height}px`;
            window.element.style.left = `${window.x}px`;
            window.element.style.top = `${window.y}px`;
        }
    }

    closeWindow(window) {
        const index = this.windows.indexOf(window);
        if (index > -1) {
            this.windows.splice(index, 1);
        }

        if (window.element) {
            window.element.remove();
        }

        if (window.taskbarButton) {
            window.taskbarButton.remove();
        }
    }

    createTaskbarButton(window) {
        const button = document.createElement('button');
        button.className = 'taskbar-button';
        button.innerHTML = `
            ${window.icon ? `<div class="taskbar-button-icon">${window.icon}</div>` : ''}
            <div class="taskbar-button-text">${window.title}</div>
        `;

        button.addEventListener('click', () => {
            if (window.minimized) {
                this.restoreWindow(window);
            } else if (window.element.classList.contains('active')) {
                this.minimizeWindow(window);
            } else {
                this.focusWindow(window);
            }
        });

        this.taskButtons.appendChild(button);
        window.taskbarButton = button;
    }

    getWindowByTitle(title) {
        return this.windows.find(w => w.title === title);
    }
}

// Application Content Templates
const AppContent = {
    myComputer: () => `
        <div class="window-toolbar">
            <button class="toolbar-menu">File</button>
            <button class="toolbar-menu">Edit</button>
            <button class="toolbar-menu">View</button>
            <button class="toolbar-menu">Favorites</button>
            <button class="toolbar-menu">Tools</button>
            <button class="toolbar-menu">Help</button>
        </div>
        <div class="content-grid">
            <div class="content-item">
                <div class="content-item-icon">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="8" width="20" height="16" rx="1" fill="#7D7D7D" stroke="#000" stroke-width="1"/>
                        <rect x="7" y="9" width="18" height="12" fill="#000"/>
                        <rect x="11" y="24" width="10" height="2" fill="#5A5A5A"/>
                        <circle cx="16" cy="26" r="1.5" fill="#3A3A3A"/>
                    </svg>
                </div>
                <div class="content-item-label">Local Disk (C:)</div>
            </div>
            <div class="content-item">
                <div class="content-item-icon">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="8" width="20" height="16" rx="1" fill="#7D7D7D" stroke="#000" stroke-width="1"/>
                        <rect x="7" y="9" width="18" height="12" fill="#000"/>
                        <rect x="11" y="24" width="10" height="2" fill="#5A5A5A"/>
                        <circle cx="16" cy="26" r="1.5" fill="#3A3A3A"/>
                    </svg>
                </div>
                <div class="content-item-label">Local Disk (D:)</div>
            </div>
            <div class="content-item">
                <div class="content-item-icon">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="12" width="16" height="12" fill="#E0E0E0" stroke="#000" stroke-width="1"/>
                        <rect x="8" y="12" width="16" height="2" fill="#C0C0C0"/>
                        <circle cx="23" cy="18" r="1.5" fill="#666"/>
                    </svg>
                </div>
                <div class="content-item-label">CD Drive (E:)</div>
            </div>
            <div class="content-item">
                <div class="content-item-icon">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 8 L16 8 L22 14 L22 24 L10 24 Z" fill="#FFC107" stroke="#000" stroke-width="1"/>
                        <path d="M16 8 L16 14 L22 14" fill="#FFD54F"/>
                    </svg>
                </div>
                <div class="content-item-label">Shared Documents</div>
            </div>
        </div>
        <div class="window-statusbar">
            My Computer
        </div>
    `,

    myDocuments: () => `
        <div class="window-toolbar">
            <button class="toolbar-menu">File</button>
            <button class="toolbar-menu">Edit</button>
            <button class="toolbar-menu">View</button>
            <button class="toolbar-menu">Favorites</button>
            <button class="toolbar-menu">Tools</button>
            <button class="toolbar-menu">Help</button>
        </div>
        <div class="content-grid">
            <div class="content-item">
                <div class="content-item-icon">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 6 L16 6 L20 10 L20 26 L8 26 Z" fill="#FFC107" stroke="#000" stroke-width="1"/>
                        <path d="M16 6 L16 10 L20 10" fill="#FFD54F"/>
                    </svg>
                </div>
                <div class="content-item-label">My Pictures</div>
            </div>
            <div class="content-item">
                <div class="content-item-icon">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 6 L16 6 L20 10 L20 26 L8 26 Z" fill="#FFC107" stroke="#000" stroke-width="1"/>
                        <path d="M16 6 L16 10 L20 10" fill="#FFD54F"/>
                    </svg>
                </div>
                <div class="content-item-label">My Music</div>
            </div>
            <div class="content-item">
                <div class="content-item-icon">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 6 L18 6 L22 10 L22 26 L10 26 Z" fill="#FFFFFF" stroke="#000" stroke-width="1"/>
                        <path d="M18 6 L18 10 L22 10" fill="#E0E0E0"/>
                        <rect x="13" y="12" width="6" height="1" fill="#0066CC"/>
                        <rect x="13" y="15" width="6" height="1" fill="#0066CC"/>
                        <rect x="13" y="18" width="4" height="1" fill="#0066CC"/>
                    </svg>
                </div>
                <div class="content-item-label">Document.doc</div>
            </div>
            <div class="content-item">
                <div class="content-item-icon">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 6 L18 6 L22 10 L22 26 L10 26 Z" fill="#FFFFFF" stroke="#000" stroke-width="1"/>
                        <path d="M18 6 L18 10 L22 10" fill="#E0E0E0"/>
                        <rect x="13" y="12" width="6" height="1" fill="#000"/>
                        <rect x="13" y="15" width="6" height="1" fill="#000"/>
                        <rect x="13" y="18" width="4" height="1" fill="#000"/>
                    </svg>
                </div>
                <div class="content-item-label">Notes.txt</div>
            </div>
        </div>
        <div class="window-statusbar">
            4 objects
        </div>
    `,

    recycleBin: () => `
        <div class="window-toolbar">
            <button class="toolbar-menu">File</button>
            <button class="toolbar-menu">Edit</button>
            <button class="toolbar-menu">View</button>
            <button class="toolbar-menu">Tools</button>
            <button class="toolbar-menu">Help</button>
        </div>
        <div class="empty-state">
            <div class="empty-state-icon">
                <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 20 L20 56 L44 56 L44 20 Z" fill="#B8B8B8" stroke="#000" stroke-width="2"/>
                    <rect x="16" y="16" width="32" height="4" fill="#7D7D7D" stroke="#000" stroke-width="2"/>
                    <rect x="24" y="10" width="16" height="6" fill="#5A5A5A" stroke="#000" stroke-width="1"/>
                    <rect x="24" y="26" width="4" height="20" fill="#6B6B6B"/>
                    <rect x="36" y="26" width="4" height="20" fill="#6B6B6B"/>
                </svg>
            </div>
            <div class="empty-state-text">
                <strong>Recycle Bin is empty</strong><br>
                Deleted files will appear here before being permanently removed.
            </div>
            <button class="empty-state-action">Empty Recycle Bin</button>
        </div>
        <div class="window-statusbar">
            Recycle Bin is empty
        </div>
    `,

    internetExplorer: () => `
        <div class="browser-toolbar">
            <button class="browser-nav-btn" title="Back">◄</button>
            <button class="browser-nav-btn" title="Forward">►</button>
            <button class="browser-nav-btn" title="Stop">✕</button>
            <button class="browser-nav-btn" title="Refresh">↻</button>
            <input type="text" class="browser-address-bar" value="about:blank" readonly>
            <button class="browser-nav-btn" title="Go">→</button>
        </div>
        <div class="browser-content">
            <h1>Internet Explorer</h1>
            <p>Welcome to Internet Explorer!</p>
            <p>This is a nostalgic recreation of the classic Windows XP web browser.</p>
            <p>In the original Windows XP, you could browse the web from here.</p>
        </div>
        <div class="window-statusbar">
            Done
        </div>
    `,

    controlPanel: () => `
        <div class="window-toolbar">
            <button class="toolbar-menu">File</button>
            <button class="toolbar-menu">View</button>
            <button class="toolbar-menu">Favorites</button>
            <button class="toolbar-menu">Tools</button>
            <button class="toolbar-menu">Help</button>
        </div>
        <div class="content-grid">
            <div class="content-item">
                <div class="content-item-icon">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="8" width="16" height="16" fill="#607D8B" stroke="#000" stroke-width="1"/>
                        <circle cx="16" cy="16" r="6" fill="#90A4AE" stroke="#000" stroke-width="1"/>
                        <circle cx="16" cy="16" r="3" fill="#455A64"/>
                    </svg>
                </div>
                <div class="content-item-label">Display</div>
            </div>
            <div class="content-item">
                <div class="content-item-icon">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="10" width="16" height="12" fill="#FFF" stroke="#000" stroke-width="1"/>
                        <path d="M10 14 L14 18 L22 10" stroke="#4CAF50" stroke-width="2" fill="none"/>
                    </svg>
                </div>
                <div class="content-item-label">System</div>
            </div>
            <div class="content-item">
                <div class="content-item-icon">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="8" width="16" height="16" fill="#2196F3" stroke="#000" stroke-width="1"/>
                        <path d="M12 16 L16 12 L20 16 L16 20 Z" fill="#FFF"/>
                    </svg>
                </div>
                <div class="content-item-label">Network</div>
            </div>
            <div class="content-item">
                <div class="content-item-icon">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="10" fill="#FF9800" stroke="#000" stroke-width="1"/>
                        <path d="M13 12 L19 16 L13 20 Z" fill="#FFF"/>
                    </svg>
                </div>
                <div class="content-item-label">Sounds and Audio</div>
            </div>
        </div>
        <div class="window-statusbar">
            Control Panel
        </div>
    `
};

// Icon SVGs
const Icons = {
    myComputer: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="12" height="9" fill="#7D7D7D" stroke="#000" stroke-width="0.5"/>
        <rect x="3" y="4" width="10" height="7" fill="#008080"/>
        <rect x="5" y="12" width="6" height="1.5" fill="#7D7D7D"/>
    </svg>`,
    
    myDocuments: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 2 L10 2 L12 4 L12 14 L4 14 Z" fill="#FFC107" stroke="#000" stroke-width="0.5"/>
        <path d="M10 2 L10 4 L12 4" fill="#FFD54F"/>
    </svg>`,
    
    recycleBin: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 5 L5 14 L11 14 L11 5 Z" fill="#B8B8B8" stroke="#000" stroke-width="0.5"/>
        <rect x="4" y="4" width="8" height="1" fill="#7D7D7D"/>
        <rect x="6" y="2" width="4" height="2" fill="#5A5A5A"/>
    </svg>`,
    
    internetExplorer: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="6.5" fill="#1E90FF" stroke="#000" stroke-width="0.5"/>
        <path d="M4 8 Q8 4 12 8" fill="none" stroke="#FFD700" stroke-width="1"/>
        <path d="M4 8 Q8 12 12 8" fill="none" stroke="#FFD700" stroke-width="1"/>
    </svg>`,
    
    controlPanel: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="12" height="12" fill="#607D8B"/>
    </svg>`
};

// Initialize
let windowManager;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize window manager
    windowManager = new WindowManager();
    
    // Initialize clock
    updateClock();
    setInterval(updateClock, 1000);

    // Start Menu functionality
    const startButton = document.getElementById('startButton');
    const startMenu = document.getElementById('startMenu');
    const desktop = document.getElementById('desktop');

    // Toggle Start Menu
    startButton.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleStartMenu();
    });

    // Close Start Menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
            closeStartMenu();
        }
    });

    // Desktop icon interactions
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    let lastClickTime = 0;
    let lastClickedIcon = null;

    desktopIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Remove selection from all icons
            desktopIcons.forEach(i => i.classList.remove('selected'));
            
            // Add selection to clicked icon
            this.classList.add('selected');
            
            // Handle double-click
            const currentTime = new Date().getTime();
            const timeDiff = currentTime - lastClickTime;
            
            if (timeDiff < DOUBLE_CLICK_DELAY && lastClickedIcon === this) {
                handleDoubleClick(this);
            }
            
            lastClickTime = currentTime;
            lastClickedIcon = this;
        });
    });

    // Deselect icons when clicking on desktop
    desktop.addEventListener('click', function(e) {
        if (e.target === desktop) {
            desktopIcons.forEach(icon => icon.classList.remove('selected'));
        }
    });

    // Start Menu item interactions
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const text = this.textContent.trim();
            
            // Handle specific menu items
            if (text === 'Turn Off Computer') {
                showTurnOffDialog();
            } else if (text === 'Log Off') {
                showLogOffDialog();
            } else if (text === 'My Documents') {
                openApplication('My Documents');
                closeStartMenu();
            } else if (text === 'My Computer') {
                openApplication('My Computer');
                closeStartMenu();
            } else if (text === 'Control Panel') {
                openApplication('Control Panel');
                closeStartMenu();
            } else if (text === 'Internet' || text === 'Internet Explorer') {
                openApplication('Internet Explorer');
                closeStartMenu();
            } else if (text !== 'All Programs' && text !== 'My Recent Documents' && 
                       text !== 'My Pictures' && text !== 'My Music' && 
                       text !== 'Help and Support' && text !== 'Search' && text !== 'Run...' &&
                       text !== 'Windows Media Player' && text !== 'Windows Messenger' && text !== 'E-mail') {
                alert(`Opening: ${text}`);
            }
        });
    });

    // Footer buttons
    const footerButtons = document.querySelectorAll('.footer-button');
    footerButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const text = this.textContent.trim();
            
            if (text === 'Turn Off Computer') {
                showTurnOffDialog();
            } else if (text === 'Log Off') {
                showLogOffDialog();
            }
            
            closeStartMenu();
        });
    });
});

// Update clock
function updateClock() {
    const clockElement = document.getElementById('clock');
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    clockElement.textContent = `${hours}:${minutesStr} ${ampm}`;
}

// Toggle Start Menu
function toggleStartMenu() {
    const startMenu = document.getElementById('startMenu');
    startMenu.classList.toggle('open');
}

// Close Start Menu
function closeStartMenu() {
    const startMenu = document.getElementById('startMenu');
    startMenu.classList.remove('open');
}

// Handle double-click on desktop icons
function handleDoubleClick(icon) {
    const iconName = icon.getAttribute('data-name');
    openApplication(iconName);
}

// Open application window
function openApplication(appName) {
    // Check if window is already open
    const existingWindow = windowManager.getWindowByTitle(appName);
    if (existingWindow) {
        if (existingWindow.minimized) {
            windowManager.restoreWindow(existingWindow);
        } else {
            windowManager.focusWindow(existingWindow);
        }
        return;
    }

    // Create new window based on app name
    let config = {
        title: appName,
        icon: null,
        content: '',
        width: 600,
        height: 400
    };

    switch(appName) {
        case 'My Computer':
            config.icon = Icons.myComputer;
            config.content = AppContent.myComputer();
            config.width = 650;
            config.height = 450;
            break;
        case 'My Documents':
            config.icon = Icons.myDocuments;
            config.content = AppContent.myDocuments();
            config.width = 650;
            config.height = 450;
            break;
        case 'Recycle Bin':
            config.icon = Icons.recycleBin;
            config.content = AppContent.recycleBin();
            config.width = 550;
            config.height = 400;
            break;
        case 'Internet Explorer':
        case 'Internet':
            config.title = 'Internet Explorer';
            config.icon = Icons.internetExplorer;
            config.content = AppContent.internetExplorer();
            config.width = 700;
            config.height = 500;
            break;
        case 'Control Panel':
            config.icon = Icons.controlPanel;
            config.content = AppContent.controlPanel();
            config.width = 600;
            config.height = 450;
            break;
        default:
            // For other apps, show a simple window
            config.content = `
                <div class="window-toolbar">
                    <button class="toolbar-menu">File</button>
                    <button class="toolbar-menu">Edit</button>
                    <button class="toolbar-menu">View</button>
                    <button class="toolbar-menu">Help</button>
                </div>
                <div style="padding: 20px; text-align: center;">
                    <h2 style="color: #0054E3; margin-bottom: 15px;">${appName}</h2>
                    <p>This application is not yet implemented.</p>
                </div>
                <div class="window-statusbar">
                    ${appName}
                </div>
            `;
    }

    windowManager.createWindow(config);
}

// Show Turn Off Computer dialog
function showTurnOffDialog() {
    const choice = confirm('Turn off computer?\n\nChoose OK to shut down or Cancel to stay on.');
    if (choice) {
        alert('Windows is shutting down...');
        // In a real implementation, this would show the shutdown screen
    }
}

// Show Log Off dialog
function showLogOffDialog() {
    const choice = confirm('Log Off Windows?\n\nChoose OK to log off or Cancel to continue working.');
    if (choice) {
        alert('Logging off...');
        // In a real implementation, this would return to the login screen
    }
}

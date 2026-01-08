// Windows XP JavaScript Interactions

// Constants
const DOUBLE_CLICK_DELAY = 300; // milliseconds

document.addEventListener('DOMContentLoaded', function() {
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
            } else if (text !== 'All Programs') {
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
    
    switch(iconName) {
        case 'My Computer':
            alert('Opening My Computer...\n\nThis would open a window showing your computer\'s drives and devices.');
            break;
        case 'My Documents':
            alert('Opening My Documents...\n\nThis would open your personal documents folder.');
            break;
        case 'Recycle Bin':
            alert('Opening Recycle Bin...\n\nThis would show deleted files that can be restored.');
            break;
        case 'Internet Explorer':
            alert('Opening Internet Explorer...\n\nThis would launch the web browser.');
            break;
        default:
            alert(`Opening: ${iconName}`);
    }
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

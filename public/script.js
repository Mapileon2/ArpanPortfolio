// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    // Mark the about section as static (do not update from Firebase)
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        aboutSection.setAttribute('data-static', 'true');
        aboutSection.setAttribute('data-no-edit', 'true');
    }
    
    // AGGRESSIVE EDIT REMOVAL - runs immediately and constantly
    function removeAllEditElements() {
        // Remove any content editable attributes and editing features
        document.querySelectorAll('[contenteditable="true"]').forEach(element => {
            element.removeAttribute('contenteditable');
            element.setAttribute('contenteditable', 'false');
        });
        
        // Hide any edit buttons that might exist
        document.querySelectorAll('[class*="edit"], [id*="edit"], .edit-inline-btn, .edit-section-btn, button[data-section]').forEach(btn => {
            btn.style.display = 'none';
            try { btn.remove(); } catch(e) { /* ignore */ }
        });
        
        // Find elements with "Saving..." text and remove them
        document.querySelectorAll('button, [class*="btn"]').forEach(el => {
            if (el && el.innerText && 
               (el.innerText.includes('Saving') || 
                el.innerText.includes('Edit') || 
                el.innerText.includes('Save'))) {
                el.style.display = 'none';
                try { el.remove(); } catch(e) { /* ignore */ }
            }
        });
        
        // Override prototype functions that could be used for editing
        try {
            // Override HTMLElement.prototype methods related to contentEditable if not already done
            if (!window._editingDisabled) {
                const originalSetter = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'contentEditable').set;
                Object.defineProperty(HTMLElement.prototype, 'contentEditable', {
                    set: function(val) {
                        // Always set to false or inherit
                        originalSetter.call(this, 'false');
                    },
                    get: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'contentEditable').get
                });
                window._editingDisabled = true;
            }
        } catch(e) { /* ignore */ }
    }
    
    // Run immediately
    removeAllEditElements();
    
    // Then run every 200ms to catch any dynamic elements
    setInterval(removeAllEditElements, 200);

    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            const menu = document.getElementById('mobileMenu');
            menu.classList.toggle('hidden');
        });
    }

    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const icon = this.querySelector('i');
            if (document.body.classList.contains('dark-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobileMenu');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });

    // Easter egg - click on soot sprites
    document.querySelectorAll('.soot-sprite').forEach(sprite => {
        sprite.addEventListener('click', function() {
            const colors = ['#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33A8'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            this.style.backgroundColor = randomColor;
            
            // Create a temporary message
            const message = document.createElement('div');
            message.textContent = 'Hi there!';
            message.style.position = 'absolute';
            message.style.backgroundColor = 'white';
            message.style.padding = '2px 6px';
            message.style.borderRadius = '4px';
            message.style.fontSize = '10px';
            message.style.top = '-25px';
            message.style.left = '0';
            this.appendChild(message);
            
            // Remove after 2 seconds
            setTimeout(() => {
                message.remove();
            }, 2000);
        });
    });

    // Initialize magical scenery Swiper
    if (typeof Swiper !== 'undefined') {
        // Try to use enhanced Swiper initialization if available
        if (typeof window.initializeSwiperCarousels === 'function') {
            // Will initialize all Swiper instances including our magical one
            window.initializeSwiperCarousels();
        } else {
            // Fall back to original Swiper initialization
            try {
                const swiperMagical = new Swiper('.swiper-magical', {
                    // Optional parameters
                    loop: true,
                    effect: 'fade',
                    fadeEffect: {
                        crossFade: true
                    },
                    autoplay: {
                        delay: 5000,
                        disableOnInteraction: false,
                    },
                    
                    // If we need pagination
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true,
                    },
                    
                    // Navigation arrows
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                });
            } catch (e) {
                console.log('Swiper initialization error:', e);
            }
        }
    }

    // ==================== FIREBASE FUNCTIONALITY ============= //
    // Check if Firebase is loaded
    if (typeof firebase !== 'undefined') {
        const loading = document.getElementById('projectsLoading');
        const grid = document.getElementById('projectsGrid');
        const errorDiv = document.getElementById('projectsError');
        
        if (loading && grid && errorDiv) {
            loading.classList.remove('hidden');
            grid.classList.add('hidden');
            errorDiv.classList.add('hidden');
            
            const db = firebase.database();

            // Setup real-time listener for case studies
            db.ref('caseStudies').on('value', snapshot => {
                loading.classList.add('hidden');
                if (!snapshot.exists()) {
                    errorDiv.querySelector('p').textContent = 'No magical projects available yet.';
                    errorDiv.classList.remove('hidden');
                    grid.classList.add('hidden');
                    return;
                }
                
                grid.innerHTML = '';
                snapshot.forEach(child => {
                    const cs = child.val();
                    const id = child.key;
                    const card = document.createElement('div');
                    card.className = 'project-book';
                    card.innerHTML = `
                    <div class="relative h-full">
                        <div class="book-inner bg-white rounded-xl shadow-xl overflow-hidden h-full dark:bg-gray-800">
                        <img src="${cs.projectImageUrl}" alt="${cs.projectTitle}" class="w-full h-48 object-cover">
                        <div class="p-6">
                            <h3 class="ghibli-font text-2xl dark:text-gray-200 mb-2">${cs.projectTitle}</h3>
                            <p class="text-gray-600 dark:text-gray-400 mb-4">${cs.projectDescription || ''}</p>
                            <div class="flex items-center mb-4">
                            <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">${cs.projectCategory || ''}</span>
                            </div>
                            <div class="flex justify-between items-center">
                            <div>
                                <span class="text-yellow-500">${'★'.repeat(cs.projectRating||0)}${'☆'.repeat(5 - (cs.projectRating||0))}</span>
                                <p class="text-sm text-gray-600 dark:text-gray-400">${cs.projectAchievement || ''}</p>
                            </div>
                            <a href="case_study.html?caseId=${id}" class="text-blue-600 dark:text-blue-400 hover:underline">Read Story</a>
                            </div>
                        </div>
                        </div>
                    </div>`;
                    grid.appendChild(card);
                });
                grid.classList.remove('hidden');
            }, error => {
                console.error('Error loading magical projects:', error);
                loading.classList.add('hidden');
                errorDiv.classList.remove('hidden');
            });

            // Load saved section HTML with real-time listener
            db.ref('sections').on('value', snap => {
                const sections = snap.val() || {};
                Object.keys(sections).forEach(secId => {
                    // Skip updating 'projects', 'contact', 'timeline', and 'about' sections
                    if (['projects', 'contact', 'timeline', 'about'].includes(secId)) return;
                    
                    const html = sections[secId].html;
                    const secEl = document.getElementById(secId);
                    if (secEl && html) {
                        // Apply HTML but then remove any edit or contenteditable elements
                        secEl.innerHTML = html;
                        secEl.querySelectorAll('[contenteditable="true"]').forEach(el => {
                            el.removeAttribute('contenteditable');
                        });
                        secEl.querySelectorAll('.edit-inline-btn, .edit-section-btn').forEach(btn => {
                            btn.style.display = 'none';
                            btn.remove();
                        });
                    }
                });
            }, error => {
                console.error('Error loading sections:', error);
            });
        }
    }
}); 
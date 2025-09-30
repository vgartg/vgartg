let currentLanguage = 'ru';
let translations = {};

async function loadTranslations(lang) {
    try {
        const response = await fetch(`locales/${lang}.json`);
        translations[lang] = await response.json();
        return translations[lang];
    } catch (error) {
        console.error(`Error loading ${lang} translations:`, error);
        return {};
    }
}

function updateContent(lang) {
    document.documentElement.lang = lang;
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(translations[lang], key);
        
        if (translation) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else if (element.hasAttribute('data-i18n-html')) {
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
    
    localStorage.setItem('preferred-language', lang);
    currentLanguage = lang;
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function getTranslation(obj, key) {
    return key.split('.').reduce((o, k) => o && o[k], obj);
}

function initLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const newLang = btn.getAttribute('data-lang');
            if (newLang !== currentLanguage) {
                if (!translations[newLang]) {
                    await loadTranslations(newLang);
                }
                updateContent(newLang);
            }
        });
    });
}

function loadComponents() {
    fetch('components/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header').innerHTML = data;
            initNavigation();
            initLanguageSwitcher();
        })
        .catch(error => {
            console.error('Error loading header:', error);
        });

    fetch('components/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer').innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading footer:', error);
        });
}

function initNavigation() {
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuBtn.classList.toggle('active');
            
            const icon = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                if (window.innerWidth <= 768 && navLinks) {
                    navLinks.classList.remove('active');
                    menuBtn.classList.remove('active');
                    const icon = menuBtn.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && navLinks && menuBtn) {
            if (!navLinks.contains(e.target) && !menuBtn.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuBtn.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });
}

function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const appearOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px"
    };
    
    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('appear');
                appearOnScroll.unobserve(entry.target);
            }
        });
    }, appearOptions);
    
    fadeElements.forEach(element => {
        appearOnScroll.observe(element);
    });
}

function initTypingAnimation() {
    const techStack = ['Ruby-on-Rails', 'JavaScript', 'TypeScript', 'React', 'PostgreSQL', 'Redis', 'TailwindCSS'];
    let currentTechIndex = 0;
    const typingElement = document.querySelector('.changing-tech');
    
    if (typingElement) {
        function typeTech() {
            const currentTech = techStack[currentTechIndex];
            typingElement.textContent = currentTech;
            currentTechIndex = (currentTechIndex + 1) % techStack.length;
        }
        
        typeTech();
        setInterval(typeTech, 2000);
    }
}

function initNavbarScroll() {
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.style.padding = '1rem 5%';
                navbar.style.backgroundColor = 'rgba(13, 13, 20, 0.95)';
            } else {
                navbar.style.padding = '1.5rem 5%';
                navbar.style.backgroundColor = 'rgba(13, 13, 20, 0.9)';
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    const savedLanguage = localStorage.getItem('preferred-language') || 'ru';
    
    await loadTranslations(savedLanguage);
    
    loadComponents();
    initScrollAnimations();
    initTypingAnimation();
    initNavbarScroll();
    
    updateContent(savedLanguage);
});

window.addEventListener('error', function(e) {
    console.error('Error loading resource:', e);
});

function reinitAnimations() {
    initScrollAnimations();
    initTypingAnimation();
}
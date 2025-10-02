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
    
    updateExperienceDurations();
    updateDateRanges();
    
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

function calculateMonthDifference(startDate, endDate = new Date()) {
    const start = new Date(startDate);
    const end = endDate === 'present' ? new Date() : new Date(endDate);
    
    const yearsDifference = end.getFullYear() - start.getFullYear();
    const monthsDifference = end.getMonth() - start.getMonth();
    
    return yearsDifference * 12 + monthsDifference;
}

function formatDurationRu(months) {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
        return `${months} ${getRussianMonths(months)}`;
    } else if (remainingMonths === 0) {
        return `${years} ${getRussianYears(years)}`;
    } else {
        return `${years} ${getRussianYears(years)} ${remainingMonths} ${getRussianMonths(remainingMonths)}`;
    }
}

function formatDurationEn(months) {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
        return `${months} ${months === 1 ? 'month' : 'months'}`;
    } else if (remainingMonths === 0) {
        return `${years} ${years === 1 ? 'year' : 'years'}`;
    } else {
        return `${years} ${years === 1 ? 'year' : 'years'} ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
    }
}

function getRussianYears(years) {
    if (years === 1) return 'год';
    if (years >= 2 && years <= 4) return 'года';
    return 'лет';
}

function getRussianMonths(months) {
    if (months === 1) return 'месяц';
    if (months >= 2 && months <= 4) return 'месяца';
    return 'месяцев';
}

function updateExperienceDurations() {
    const experienceData = [
        {
            key: 'trucker',
            startDate: '2024-12-01',
            endDate: 'present'
        },
        {
            key: 'jammer',
            startDate: '2024-07-01',
            endDate: 'present'
        },
        {
            key: 'elina',
            startDate: '2025-08-01',
            endDate: 'present'
        },
        {
            key: 'purmarili',
            startDate: '2024-05-01',
            endDate: '2024-09-01'
        },
        {
            key: 'viomitra',
            startDate: '2023-07-01',
            endDate: '2024-12-01'
        }
    ];

    experienceData.forEach(exp => {
        const months = calculateMonthDifference(exp.startDate, exp.endDate);
        const duration = currentLanguage === 'ru' ? formatDurationRu(months) : formatDurationEn(months);
        
        const durationElement = document.querySelector(`[data-i18n="experience.durations.${exp.key}"]`);
        if (durationElement) {
            durationElement.textContent = duration;
        }
        
        if (translations.ru && translations.ru.experience && translations.ru.experience.durations) {
            translations.ru.experience.durations[exp.key] = formatDurationRu(months);
        }
        if (translations.en && translations.en.experience && translations.en.experience.durations) {
            translations.en.experience.durations[exp.key] = formatDurationEn(months);
        }
    });
}

function updateDateRanges() {
    const dateRanges = {
        'trucker': { start: 'Декабрь 2024', end: 'настоящее время' },
        'jammer': { start: 'Июль 2024', end: 'настоящее время' },
        'elina': { start: 'Август 2025', end: 'настоящее время' },
        'purmarili': { start: 'Май 2024', end: 'Сентябрь 2024' },
        'viomitra': { start: 'Июль 2023', end: 'Декабрь 2024' }
    };

    Object.keys(dateRanges).forEach(key => {
        const range = dateRanges[key];
        const rangeText = currentLanguage === 'ru' 
            ? `${range.start} — ${range.end}`
            : `${range.start} — ${range.end === 'настоящее время' ? 'Present' : range.end}`;
        
        const rangeElement = document.querySelector(`[data-i18n="experience.dateRanges.${key}"]`);
        if (rangeElement) {
            rangeElement.textContent = rangeText;
        }
        
        if (translations.ru && translations.ru.experience && translations.ru.experience.dateRanges) {
            translations.ru.experience.dateRanges[key] = `${range.start} — ${range.end}`;
        }
        if (translations.en && translations.en.experience && translations.en.experience.dateRanges) {
            translations.en.experience.dateRanges[key] = `${range.start} — ${range.end === 'настоящее время' ? 'Present' : range.end}`;
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
    const techStack = ['Ruby', 'Ruby-on-Rails', 'JavaScript', 'TypeScript', 'React', 'ASP.NET'];
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

function initGSAPScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo('.hero .fade-in', 
        {
            y: 50,
            opacity: 0
        },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.2,
            delay: 0.3
        }
    );

    gsap.fromTo('.about-content', 
        {
            y: 80,
            opacity: 0
        },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
                trigger: '.about',
                start: 'top 80%',
                end: 'bottom 40%',
                toggleActions: 'play none none reverse'
            }
        }
    );

    gsap.fromTo('.skill-tag', 
        {
            x: -50,
            opacity: 0
        },
        {
            x: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.08,
            scrollTrigger: {
                trigger: '.skills',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        }
    );

    gsap.fromTo('.project-card', 
        {
            y: 80,
            opacity: 0,
            scale: 0.9
        },
        {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            scrollTrigger: {
                trigger: '.projects-grid',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        }
    );

    gsap.fromTo('.experience-item', 
        {
            x: -60,
            opacity: 0
        },
        {
            x: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.1,
            scrollTrigger: {
                trigger: '.experience-timeline',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        }
    );

    gsap.fromTo('.contact-content', 
        {
            y: 60,
            opacity: 0
        },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
                trigger: '.contact',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        }
    );
}

document.addEventListener('DOMContentLoaded', async function() {
    const savedLanguage = localStorage.getItem('preferred-language') || 'ru';
    
    await loadTranslations(savedLanguage);
    
    loadComponents();
    initGSAPScrollAnimations();
    initScrollAnimations();
    initTypingAnimation();
    initNavbarScroll();
    
    updateContent(savedLanguage);

    updateExperienceDurations();
    updateDateRanges();
});

window.addEventListener('error', function(e) {
    console.error('Error loading resource:', e);
});

function reinitAnimations() {
    initScrollAnimations();
    initTypingAnimation();
}
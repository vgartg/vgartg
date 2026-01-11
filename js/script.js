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
            createFallbackNavigation();
        });

    fetch('components/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer').innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading footer:', error);
            createFallbackFooter();
        });
}

function createFallbackNavigation() {
    const header = document.getElementById('header');
    header.innerHTML = `
        <nav class="navbar">
            <a href="#home" class="logo">vgartg</a>
            <div class="nav-links">
                <a href="#home">Главная</a>
                <a href="#about">Обо мне</a>
                <a href="#projects">Проекты</a>
                <a href="#experience">Опыт</a>
                <a href="#contact">Контакты</a>
            </div>
            <button class="menu-btn">
                <i class="fas fa-bars"></i>
            </button>
        </nav>
    `;
    initNavigation();
}

function createFallbackFooter() {
    const footer = document.getElementById('footer');
    footer.innerHTML = `
        <footer>
            <div class="footer-content">
                <div class="footer-logo">vgartg</div>
                <div class="footer-links">
                    <a href="#home">Главная</a>
                    <a href="#about">Обо мне</a>
                    <a href="#projects">Проекты</a>
                    <a href="#experience">Опыт</a>
                    <a href="#contact">Контакты</a>
                </div>
                <div class="copyright">© 2024 vgartg. Все права защищены.</div>
            </div>
        </footer>
    `;
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
                document.body.style.overflow = 'hidden';
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = '';
            }
        });
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768 && navLinks && menuBtn) {
                navLinks.classList.remove('active');
                menuBtn.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = '';
            }
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                if (window.innerWidth <= 768 && navLinks) {
                    navLinks.classList.remove('active');
                    menuBtn.classList.remove('active');
                    const icon = menuBtn.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                    document.body.style.overflow = '';
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
                document.body.style.overflow = '';
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
            key: 'prostor',
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
        'trucker': { start: 'Декабрь 2024', end: 'настоящее время', en_start: 'December 2024', en_end: 'Present' },
        'jammer': { start: 'Июль 2024', end: 'настоящее время', en_start: 'July 2024', en_end: 'Present' },
        'elina': { start: 'Август 2025', end: 'настоящее время', en_start: 'August 2025', en_end: 'Present' },
        'prostor': { start: 'Август 2025', end: 'настоящее время', en_start: 'August 2025', en_end: 'Present' },
        'purmarili': { start: 'Май 2024', end: 'Сентябрь 2024', en_start: 'May 2024', en_end: 'September 2024' },
        'viomitra': { start: 'Июль 2023', end: 'Декабрь 2024', en_start: 'July 2023', en_end: 'December 2024' }
    };

    Object.keys(dateRanges).forEach(key => {
        const range = dateRanges[key];
        const rangeText = currentLanguage === 'ru' 
            ? `${range.start} — ${range.end}`
            : `${range.en_start} — ${range.en_end}`;
        
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

function initMobileAnimations() {
    if (window.innerWidth <= 768) {        
        const mobileAnimateElements = (elements, delay = 0) => {
            elements.forEach((element, index) => {
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, delay + (index * 100));
            });
        };

        const heroElements = document.querySelectorAll('.hero .fade-in');
        setTimeout(() => {
            mobileAnimateElements(heroElements, 300);
        }, 500);

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        entry.target.style.transition = 'all 0.6s ease';
                    }, 200);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const animateOnScroll = document.querySelectorAll('.about-content, .project-card, .experience-item, .contact-content, .skills');
        animateOnScroll.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease 0.2s';
            observer.observe(el);
        });

        const skillTags = document.querySelectorAll('.skill-tag');
        skillTags.forEach((tag, index) => {
            tag.style.opacity = '0';
            tag.style.transform = 'translateX(-20px)';
            tag.style.transition = `all 0.4s ease ${index * 0.05}s`;
        });

        const skillsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    skillTags.forEach(tag => {
                        tag.style.opacity = '1';
                        tag.style.transform = 'translateX(0)';
                    });
                    skillsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        const skillsSection = document.querySelector('.skills');
        if (skillsSection) {
            skillsObserver.observe(skillsSection);
        }
    }
}

function initScrollAnimations() {
    if (window.innerWidth <= 768) {
        initMobileAnimations();
        return;
    }

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
    const techStack = ['Ruby', 'JavaScript', 'TypeScript', 'React', 'Ruby-on-Rails', 'ASP.NET'];
    let currentTechIndex = 0;
    const typingElement = document.querySelector('.changing-tech');
    
    if (typingElement) {
        function typeTech() {
            const currentTech = techStack[currentTechIndex];
            typingElement.textContent = currentTech;
            currentTechIndex = (currentTechIndex + 1) % techStack.length;
        }
        
        if (window.innerWidth > 768 || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            typeTech();
            setInterval(typeTech, 2000);
        } else {
            typingElement.textContent = 'современных технологий';
        }
    }
}

function initNavbarScroll() {
    let lastScrollY = window.scrollY;
    const navbar = document.querySelector('.navbar');
    
    if (!navbar) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.padding = '1rem 5%';
            navbar.style.backgroundColor = 'rgba(13, 13, 20, 0.95)';
            
            if (window.innerWidth <= 768) {
                if (window.scrollY > lastScrollY && window.scrollY > 200) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
            }
        } else {
            navbar.style.padding = '1.5rem 5%';
            navbar.style.backgroundColor = 'rgba(13, 13, 20, 0.9)';
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollY = window.scrollY;
    });
}

function initGSAPScrollAnimations() {
    if (window.innerWidth <= 768) {
        return;
    }

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not available, using fallback animations');
        initMobileAnimations();
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    try {
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
    } catch (error) {
        console.error('GSAP animation error:', error);
        initMobileAnimations();
    }
}

function supportsIntersectionObserver() {
    return 'IntersectionObserver' in window &&
           'IntersectionObserverEntry' in window &&
           'intersectionRatio' in window.IntersectionObserverEntry.prototype;
}

function supportsGSAP() {
    return typeof gsap !== 'undefined';
}

document.addEventListener('DOMContentLoaded', async function() {    
    if (!supportsIntersectionObserver()) {
        console.warn('Intersection Observer not supported, using fallback animations');
        document.querySelectorAll('.fade-in').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }

    const savedLanguage = localStorage.getItem('preferred-language') || 'ru';
    
    try {
        await loadTranslations(savedLanguage);
    } catch (error) {
        console.error('Failed to load translations:', error);
    }
    
    loadComponents();
    
    setTimeout(() => {
        if (supportsGSAP() && window.innerWidth > 768) {
            initGSAPScrollAnimations();
        } else {
            initMobileAnimations();
        }
        
        initScrollAnimations();
        initTypingAnimation();
        initNavbarScroll();
    }, 100);
    
    updateContent(savedLanguage);
    updateExperienceDurations();
    updateDateRanges();
    initRequisitesToggle();
    initCopyToClipboard();
});

let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (window.innerWidth <= 768) {
            initMobileAnimations();
        } else {
            initGSAPScrollAnimations();
        }
    }, 250);
});

document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        setTimeout(() => {
            if (window.innerWidth <= 768) {
                initMobileAnimations();
            }
        }, 100);
    }
});

window.addEventListener('error', function(e) {
    console.error('Error loading resource:', e);
});

window.reinitAnimations = function() {
    if (window.innerWidth <= 768) {
        initMobileAnimations();
    } else {
        initGSAPScrollAnimations();
    }
    initScrollAnimations();
};

function initUiverseAnimations() {    
    if (window.innerWidth > 768) {
        const scrollSections = document.querySelectorAll('section');
        
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        scrollSections.forEach(section => {
            section.classList.add('section-scroll');
            sectionObserver.observe(section);
        });
    }

    function animateSkills() {
        const skills = document.querySelectorAll('.skill-tag');
        skills.forEach((skill, index) => {
            skill.style.animationDelay = `${index * 0.05}s`;
        });
    }

    function initProjectCardAnimations() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                if (window.innerWidth > 768) {
                    this.style.transform = 'translateY(-15px) scale(1.02)';
                }
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    function initContactAnimations() {
        const contactLinks = document.querySelectorAll('.contact-link');
        
        contactLinks.forEach(link => {
            link.addEventListener('mouseenter', function() {
                const icon = this.querySelector('i');
                if (icon && window.innerWidth > 768) {
                    icon.style.transform = 'scale(1.3) rotate(10deg)';
                }
            });
            
            link.addEventListener('mouseleave', function() {
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });
    }

    animateSkills();
    initProjectCardAnimations();
    initContactAnimations();

    setTimeout(() => {
        document.body.classList.add('loading-animate');
    }, 100);
}

function animateExperienceCards() {
    const experienceCards = document.querySelectorAll('.experience-card');
    
    experienceCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

function initEnhancedAnimations() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initUiverseAnimations, 500);
        });
    } else {
        setTimeout(initUiverseAnimations, 500);
    }
}

function enhanceLanguageSwitch() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(btn => {
        const originalClick = btn.onclick;
        btn.onclick = function(e) {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            if (originalClick) originalClick.call(this, e);
        };
    });
}

function initSmoothScrollAnimations() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#home') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offsetTop = targetElement.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

const originalInitLanguageSwitcher = initLanguageSwitcher;
window.initLanguageSwitcher = function() {
    originalInitLanguageSwitcher();
    enhanceLanguageSwitch();
};

const originalUpdateContent = updateContent;
window.updateContent = function(lang) {
    originalUpdateContent(lang);
    setTimeout(() => {
        animateExperienceCards();
    }, 300);
};

function initAfterComponents() {
    setTimeout(() => {
        initEnhancedAnimations();
        initSmoothScrollAnimations();
        enhanceLanguageSwitch();
    }, 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAfterComponents);
} else {
    initAfterComponents();
}

let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768) {
            initUiverseAnimations();
        }
    }, 250);
});

const circle = document.getElementById('cursor-circle');

let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let circleX = cursorX;
let circleY = cursorY;

const speed = 0.12;

function animateCursor() {
    circleX += (cursorX - circleX) * speed;
    circleY += (cursorY - circleY) * speed;
    circle.style.transform = `translate(${circleX}px, ${circleY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
}
animateCursor();

window.addEventListener("mousemove", (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    document.body.classList.add("mouse-move");
});

document.querySelectorAll("a, button").forEach(el => {
    el.addEventListener("mouseenter", () => {
        circle.style.width = "14px";
        circle.style.height = "14px";
    });
    el.addEventListener("mouseleave", () => {
        circle.style.width = "26px";
        circle.style.height = "26px";
    });
});

const dot = document.getElementById('cursor-dot');

let dotX = window.innerWidth / 2;
let dotY = window.innerHeight / 2;

function animateDot() {
    dotX += (cursorX - dotX) * 0.25;
    dotY += (cursorY - dotY) * 0.25;
    dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateDot);
}
animateDot();

window.addEventListener("mousemove", (e) => {
    dot.style.opacity = 1;
});

document.querySelectorAll("a, button").forEach(el => {
    el.addEventListener("mouseenter", () => {
        dot.style.transform += " scale(1.8)";
        circle.style.transform += " scale(0.7)";
    });
    el.addEventListener("mouseleave", () => {
        dot.style.transform = dot.style.transform.replace(/scale\(.*?\)/, "");
        circle.style.transform = circle.style.transform.replace(/scale\(.*?\)/, "");
    });
});

function initRequisitesToggle() {
    const requisitesToggles = document.querySelectorAll('.requisites-toggle');
    
    requisitesToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const container = this.closest('.requisites-container');
            const content = container.querySelector('.requisites-content');
            
            document.querySelectorAll('.requisites-container.active').forEach(activeContainer => {
                if (activeContainer !== container) {
                    activeContainer.classList.remove('active');
                    activeContainer.querySelector('.requisites-content').style.maxHeight = '0';
                }
            });
            
            container.classList.toggle('active');
            
            if (container.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = '0';
            }
        });
        
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.requisites-container')) {
                document.querySelectorAll('.requisites-container.active').forEach(container => {
                    container.classList.remove('active');
                    container.querySelector('.requisites-content').style.maxHeight = '0';
                });
            }
        });
    });
    
    if (window.innerWidth > 768) {
        requisitesToggles.forEach(toggle => {
            const container = toggle.closest('.requisites-container');
            
            container.addEventListener('mouseenter', function() {
                if (!this.classList.contains('active')) {
                    const content = this.querySelector('.requisites-content');
                    this.classList.add('active');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
            
            container.addEventListener('mouseleave', function() {
                if (this.classList.contains('active')) {
                    const content = this.querySelector('.requisites-content');
                    this.classList.remove('active');
                    content.style.maxHeight = '0';
                }
            });
        });
    }
}


function initCopyToClipboard() {
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    document.body.appendChild(notification);

    let currentCopiedButton = null;
    let resetTimer = null;

    function resetButtonState(button) {
        if (button) {
            button.classList.remove('copied');
            const originalText = button.getAttribute('data-value');
            button.innerHTML = `${originalText} <i class="fas fa-copy copy-icon"></i>`;
        }
    }

    function showCopyNotification(text) {
        notification.textContent = text;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 500);
    }

    async function copyToClipboard(text, button, successText) {
        if (currentCopiedButton && currentCopiedButton !== button) {
            resetButtonState(currentCopiedButton);
        }
        
        if (resetTimer) {
            clearTimeout(resetTimer);
        }
        
        currentCopiedButton = button;
        
        try {
            await navigator.clipboard.writeText(text);
            
            button.classList.add('copied');
            button.innerHTML = `<i class="fas fa-check"></i> ${text}`;
            
            showCopyNotification(successText);
            
            resetTimer = setTimeout(() => {
                resetButtonState(button);
                currentCopiedButton = null;
                resetTimer = null;
            }, 1500);
            
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    button.classList.add('copied');
                    button.innerHTML = `<i class="fas fa-check"></i> ${text}`;
                    showCopyNotification(successText);
                    
                    resetTimer = setTimeout(() => {
                        resetButtonState(button);
                        currentCopiedButton = null;
                        resetTimer = null;
                    }, 1500);
                }
            } catch (fallbackErr) {
                console.error('Fallback copy failed:', fallbackErr);
                showCopyNotification('Ошибка копирования');
                currentCopiedButton = null;
            }
            
            document.body.removeChild(textArea);
        }
    }

    document.querySelectorAll('.copy-btn').forEach(button => {
        const originalText = button.getAttribute('data-value');
        button.setAttribute('data-original-text', originalText);
        
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const value = this.getAttribute('data-value');
            const successText = this.getAttribute('data-copy-text') || 'Скопировано!';
            
            copyToClipboard(value, this, successText);
        });
        
        button.addEventListener('mouseenter', function() {
            if (!this.classList.contains('copied')) {
                this.style.transform = 'translateY(-2px)';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            if (!this.classList.contains('copied')) {
                this.style.transform = 'translateY(0)';
            }
        });
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.copy-btn') && currentCopiedButton) {
            resetButtonState(currentCopiedButton);
            currentCopiedButton = null;
            if (resetTimer) {
                clearTimeout(resetTimer);
                resetTimer = null;
            }
        }
    });
}
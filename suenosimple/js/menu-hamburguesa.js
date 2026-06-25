const toggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('nav ul');

toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    navMenu.classList.toggle('open');
});

navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        toggle.classList.remove('open');
        navMenu.classList.remove('open');
    });
});
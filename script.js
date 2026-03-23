// Init AOS
AOS.init({ once: true, offset: 50, duration: 800 });

// Custom Cursor Logic
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursor-follower');
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    setTimeout(() => {
        cursorFollower.style.left = e.clientX + 'px';
        cursorFollower.style.top = e.clientY + 'px';
    }, 80);
});

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    document.getElementById('current-year-footer').textContent = new Date().getFullYear();

    // Mobile Menu
    const menuBtn = document.getElementById('mobile-menu-button');
    const closeMenu = document.getElementById('close-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => mobileMenu.classList.remove('translate-x-full'));
        closeMenu.addEventListener('click', () => mobileMenu.classList.add('translate-x-full'));
        mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => mobileMenu.classList.add('translate-x-full')));
    }

    // Hero Carousel
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-item');
    if (slides.length > 0) {
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }

    // Notifications Logic
    const updTrigger = document.getElementById('upd-trigger-btn');
    const updOverlay = document.getElementById('upd-overlay-container');
    const updClose = document.getElementById('upd-close-btn');
    const updBg = document.getElementById('upd-overlay-bg');
    const updList = document.getElementById('upd-list-insertion-point');

    if (updTrigger) {
        const closeUpd = () => updOverlay.classList.add('translate-x-full');
        updTrigger.onclick = () => {
            updList.innerHTML = '<div class="text-center py-10 text-slate-400"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><br>Fetching updates...</div>';
            updOverlay.classList.remove('translate-x-full');
            if (typeof google !== 'undefined' && google.script && google.script.run) {
                google.script.run.withSuccessHandler(renderNotifications).getNotifications();
            } else {
                renderNotifications([{ date: "Demo", title: "Offline Mode", description: "Running on local environment.", linkUrl: "#", buttonText: "Ok", color: "#666" }]);
            }
        };
        updClose.onclick = closeUpd;
        updBg.onclick = closeUpd;
    }

    function renderNotifications(data) {
        if (!data || data.length === 0) {
            updList.innerHTML = '<div class="text-center py-10 text-slate-400">No new notifications.</div>';
            return;
        }
        updList.innerHTML = data.reverse().map(item => `
            <div class="bg-slate-50 p-4 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-shadow" style="border-color: ${item.color}">
                <div class="text-[10px] font-black uppercase text-slate-400">${item.date}</div>
                <h3 class="font-bold text-slate-800 text-sm mt-1">${item.title}</h3>
                <p class="text-xs text-slate-500 my-2">${item.description}</p>
                <a href="${item.linkUrl}" target="_blank" class="inline-block text-xs font-bold bg-white border px-3 py-1 rounded hover:bg-slate-100 transition-colors">${item.buttonText}</a>
            </div>
        `).join('');
    }

    // Secure Tracker Modal Logic
    const modal = document.getElementById('appModal');
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const iframe = document.getElementById('appIframe');
    const loading = document.getElementById('loading');
    const appUrl = "https://senternettechnologies.github.io/track/";

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            iframe.src = appUrl;
            loading.classList.remove('hidden');
            iframe.classList.add('hidden');
            iframe.onload = () => { loading.classList.add('hidden'); iframe.classList.remove('hidden'); };
        });
        closeBtn.addEventListener('click', () => { modal.style.display = 'none'; iframe.src = ''; });
    }

    const isGoogleEnv = typeof google !== 'undefined' && google.script && google.script.run;

    if (isGoogleEnv) {
        google.script.run.withSuccessHandler(v => document.getElementById('views-counter').textContent = (v === "Error" ? "N/A" : v.toLocaleString())).getAndIncrementViews();
    }

    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = document.getElementById('submitButton');
            const msg = document.getElementById('statusMessage');
            btn.disabled = true;
            btn.querySelector('span').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

            const data = { name: reviewForm.elements['reviewerName'].value, rating: reviewForm.elements['rating'].value, reviewText: reviewForm.elements['reviewText'].value };

            if (isGoogleEnv) {
                google.script.run
                    .withSuccessHandler((res) => {
                        btn.disabled = false; btn.querySelector('span').textContent = 'Publish Review';
                        msg.textContent = res.success ? "Review Verified & Published!" : res.message;
                        msg.className = res.success ? "text-center mt-4 text-sm font-bold text-green-600" : "text-center mt-4 text-sm font-bold text-red-600";
                        if (res.success) { reviewForm.reset(); loadReviews(); }
                    }).recordReview(data);
            } else {
                setTimeout(() => { alert("Review submitted (Demo Mode)"); btn.disabled = false; btn.querySelector('span').textContent = 'Publish Review'; }, 1000);
            }
        });
    }

    function loadReviews() {
        if (isGoogleEnv) google.script.run.withSuccessHandler(renderReviews).getTestimonials();
        else renderReviews([{ name: "Demo Client", rating: 5, reviewText: "This website design is absolutely stunning!" }]);
    }

    function renderReviews(reviews) {
        const container = document.getElementById('reviewsContainer');
        if (!reviews || reviews.length === 0) { container.innerHTML = '<div class="text-center py-10">No reviews yet.</div>'; return; }
        container.innerHTML = reviews.reverse().map(r => `
            <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 break-inside-avoid mb-6 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-r from-brand-500 to-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-inner">${r.name.charAt(0)}</div>
                    <div><h4 class="font-bold text-slate-900 leading-tight">${r.name}</h4><div class="text-yellow-400 text-xs tracking-widest">${'★'.repeat(r.rating)}</div></div>
                </div>
                <p class="text-slate-600 text-sm leading-relaxed">"${r.reviewText}"</p>
                <div class="mt-4 pt-3 border-t border-slate-50 flex items-center gap-2">
                    <i class="fas fa-check-circle text-green-500 text-xs"></i> <span class="text-[10px] font-bold text-slate-400 uppercase">Verified Client</span>
                </div>
            </div>
        `).join('');
    }
    loadReviews();

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = document.getElementById('contact-submit-btn');
            const msg = document.getElementById('contact-message');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            const fd = new FormData(contactForm);
            const data = Object.fromEntries(fd.entries());

            if (isGoogleEnv) {
                google.script.run
                    .withSuccessHandler(res => {
                        btn.textContent = "Send Message";
                        msg.textContent = res.success ? res.message : "Error sending.";
                        msg.className = res.success ? "text-center text-sm font-bold mt-2 text-green-400" : "text-center text-sm font-bold mt-2 text-red-400";
                        if (res.success) contactForm.reset();
                    }).recordContact(data);
            } else { setTimeout(() => { btn.textContent = "Send Message"; alert("Message Sent (Demo)"); }, 1000); }
        });
    }

    const newsForm = document.getElementById('newsletter-form');
    if (newsForm) {
        newsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = document.getElementById('newsletter-submit-btn');
            const msg = document.getElementById('newsletter-message');
            btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
            const email = document.getElementById('newsletter-email').value;

            if (isGoogleEnv) {
                google.script.run
                    .withSuccessHandler(res => {
                        btn.textContent = "Subscribe";
                        msg.textContent = res.message;
                        msg.className = res.success ? "mt-2 text-sm text-green-400" : "mt-2 text-sm text-red-400";
                        if (res.success) newsForm.reset();
                    }).recordNewsletter({ email: email });
            } else { setTimeout(() => { btn.textContent = "Subscribe"; alert("Subscribed (Demo)"); }, 1000); }
        });
    }

    let myId = localStorage.getItem('webapp_user_id');
    if (!myId) { myId = 'User_' + Math.random().toString(36).substr(2, 9); localStorage.setItem('webapp_user_id', myId); }

    function syncOnlineStatus() {
        if (isGoogleEnv) {
            google.script.run.withSuccessHandler(data => {
                if (data.error) return;
                const ucount = document.getElementById('user-count-mobile');
                if (ucount) ucount.textContent = data.count;
                const list = document.getElementById('user-list-mobile');
                if (list) {
                    list.innerHTML = "";
                    data.users.slice(0, 5).forEach(u => {
                        const li = document.createElement('li');
                        li.innerHTML = (u === myId ? `<span class="text-green-400">●</span> You` : `<span class="text-slate-500">●</span> User`);
                        list.appendChild(li);
                    });
                }
            }).updateAndGetOnlineData(myId);
        }
    }
    setInterval(syncOnlineStatus, 4000);
    syncOnlineStatus();

    refreshSupportersList();

    function loadProjects() {
        if (isGoogleEnv) google.script.run.withSuccessHandler(renderProjects).getProjects();
        else renderProjects([{ title: "Premium E-Commerce", category: "Web Development", image: "https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=800", link: "#" }]);
    }

    function renderProjects(projects) {
        const container = document.getElementById('projects-container');
        if (!projects || projects.length === 0) { container.innerHTML = '<div class="col-span-full text-center py-10 text-slate-400">Portfolio coming soon...</div>'; return; }
        container.innerHTML = projects.map(p => `
            <div class="group relative rounded-3xl overflow-hidden bg-slate-800 aspect-video shadow-2xl">
                <img src="${p.image}" class="w-full h-full object-cover group-hover:scale-110 group-hover:opacity-40 transition-all duration-700">
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div class="absolute bottom-0 left-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span class="text-brand-400 text-xs font-bold uppercase tracking-widest mb-2 block">${p.category}</span>
                    <h3 class="text-2xl font-bold text-white mb-2">${p.title}</h3>
                    <a href="${p.link}" target="_blank" class="inline-flex items-center text-sm font-bold text-white hover:text-brand-400 transition-colors">View Case Study <i class="fas fa-arrow-right ml-2"></i></a>
                </div>
            </div>
        `).join('');
    }
    loadProjects();

    function loadFAQs() {
        if (isGoogleEnv) google.script.run.withSuccessHandler(renderFAQs).getFAQs();
        else renderFAQs([{ question: "How long does it take?", answer: "About 1-2 weeks." }]);
    }

    function renderFAQs(faqs) {
        const container = document.getElementById('faq-container');
        if (!faqs || faqs.length === 0) { container.innerHTML = ''; return; }
        container.innerHTML = faqs.map((f, i) => `
            <div class="border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden transition-all hover:border-brand-300 shadow-sm">
                <button class="faq-btn w-full text-left p-6 flex justify-between items-center font-bold text-slate-800 text-lg focus:outline-none" onclick="toggleFAQ(${i})">
                    ${f.question} <i id="faq-icon-${i}" class="fas fa-chevron-down text-brand-500 transition-transform"></i>
                </button>
                <div id="faq-ans-${i}" class="faq-answer px-6 pb-6 text-slate-600 leading-relaxed text-sm bg-white border-t border-slate-100 hidden">
                    <div class="pt-4">${f.answer}</div>
                </div>
            </div>
        `).join('');
    }
    loadFAQs();
});

window.toggleFAQ = function (index) {
    const ans = document.getElementById(`faq-ans-${index}`);
    const icon = document.getElementById(`faq-icon-${index}`);
    if (ans.classList.contains('hidden')) {
        ans.classList.remove('hidden');
        ans.style.maxHeight = ans.scrollHeight + "px";
        icon.style.transform = "rotate(180deg)";
    } else {
        ans.style.maxHeight = "0";
        setTimeout(() => ans.classList.add('hidden'), 300);
        icon.style.transform = "rotate(0deg)";
    }
};

function openSupModal() { document.getElementById('supModal').style.display = 'flex'; }
function closeSupModal() { document.getElementById('supModal').style.display = 'none'; }

function processSupport() {
    const name = document.getElementById('nameInp').value;
    const amount = document.getElementById('amtInp').value;
    const btn = document.getElementById('saveSupBtn');
    if (!name || !amount) return alert("Please fill details");
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run.withSuccessHandler(newData => {
            renderSupporters(newData); closeSupModal(); btn.textContent = "Submit Contribution";
            document.getElementById('nameInp').value = ''; document.getElementById('amtInp').value = '';
            alert("Thank you for your support!");
        }).addSupportData(name, amount);
    } else {
        setTimeout(() => { alert("Demo Support Added"); closeSupModal(); btn.textContent = "Submit Contribution"; }, 1000);
    }
}

function refreshSupportersList() {
    if (typeof google !== 'undefined' && google.script && google.script.run) google.script.run.withSuccessHandler(renderSupporters).getSupportData();
    else renderSupporters([{ name: "Senthilkumar (CEO)", amount: "500" }]);
}

function renderSupporters(data) {
    const container = document.getElementById('supportMarquee');
    if (!data || data.length === 0) { container.innerHTML = '<span class="px-4">Be the first supporter!</span>'; return; }
    const listHtml = data.map(item => `<div class="inline-flex items-center px-6"><span class="text-xl mr-2">💎</span><span class="font-bold text-brand-400">${item.name}</span><span class="ml-2 text-slate-400">₹${item.amount}</span></div>`).join('');
    container.innerHTML = listHtml + listHtml;
}

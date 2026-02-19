/* ============================================================
   kutty-extras.js  — KuttyTeachers Shared Logic
   Handles:
     1. Loading screen hide
     2. Hamburger / mobile nav toggle
     3. Shared footer injection (logo + social media + copyright)
     4. Active nav link highlight (auto-detects current page)
   ============================================================
   Author : KuttyTeachers (kuttyteachers.in)
   Place  : Palakkad, Kerala 🌿
   © 2026 KuttyTeachers — All Rights Reserved
   ============================================================ */

(function () {

    /* ─────────────────────────────────────────────────────────
       SITE CONFIG — update these when you have real links
    ───────────────────────────────────────────────────────── */
    var SITE = {
        name       : 'KuttyTeachers',
        nameMl     : 'കട്ടിടീച്ചേഴ്സ്',
        tagline    : 'പാലക്കാട്ടിൽ നിന്ന്, ഹൃദയത്തിൽ നിന്ന്',
        email      : 'contact@kuttyteachers.in',
        location   : 'പാലക്കാട്, കേരളം',
        logo       : 'assets/logo/logo.png',          // update when you have logo
        year       : '2026',
        social     : {
            facebook  : '#',   // paste your URL here later
            instagram : '#',
            youtube   : '#',
            whatsapp  : '#'
        }
    };

    /* ─────────────────────────────────────────────────────────
       1. LOADER — hide after 2 s
    ───────────────────────────────────────────────────────── */
    window.addEventListener('load', function () {
        setTimeout(function () {
            var loader = document.getElementById('kt-loader');
            if (loader) loader.classList.add('kt-hidden');
        }, 2000);
    });

    /* ─────────────────────────────────────────────────────────
       2. HAMBURGER / MOBILE NAV
    ───────────────────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function () {

        var hamburger = document.getElementById('kt-hamburger');
        var mobileNav = document.getElementById('kt-mobile-nav');
        var overlay   = document.getElementById('kt-overlay');

        if (hamburger && mobileNav && overlay) {
            function openMenu() {
                hamburger.classList.add('kt-open');
                mobileNav.classList.add('kt-open');
                overlay.classList.add('kt-open');
                document.body.style.overflow = 'hidden';
            }
            function closeMenu() {
                hamburger.classList.remove('kt-open');
                mobileNav.classList.remove('kt-open');
                overlay.classList.remove('kt-open');
                document.body.style.overflow = '';
            }

            hamburger.addEventListener('click', function () {
                mobileNav.classList.contains('kt-open') ? closeMenu() : openMenu();
            });
            overlay.addEventListener('click', closeMenu);
            mobileNav.querySelectorAll('a').forEach(function (link) {
                link.addEventListener('click', closeMenu);
            });
        }

        /* ── AUTO HIGHLIGHT active nav link ── */
        var currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-item, #kt-mobile-nav a').forEach(function (link) {
            var href = link.getAttribute('href');
            if (href && href === currentPage) {
                link.classList.add('active');
            }
        });

        /* ── INJECT SHARED FOOTER ── */
        injectFooter();

    });

    /* ─────────────────────────────────────────────────────────
       3. SHARED FOOTER INJECTOR
       Add  <div id="kt-footer"></div>  anywhere in your HTML
       and this function will fill it automatically.
    ───────────────────────────────────────────────────────── */
    function injectFooter() {
        var target = document.getElementById('kt-footer');
        if (!target) return;

        /* Social media icon SVGs (inline — no CDN dependency) */
        var icons = {
            facebook : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
            instagram: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
            youtube  : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>',
            whatsapp : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>'
        };

        /* Logo: show image if file exists, fallback to text */
        var logoHTML = '<div class="kt-footer-logo-text">'
            + '<span class="kt-footer-logo-en">' + SITE.name + '</span>'
            + '<span class="kt-footer-logo-ml">' + SITE.nameMl + '</span>'
            + '</div>';

        var footerHTML = '<footer class="kt-shared-footer">'
            + '<div class="kt-footer-inner">'

            /* Col 1 — Brand */
            + '<div class="kt-footer-col kt-footer-brand">'
            + logoHTML
            + '<p class="kt-footer-tagline">' + SITE.tagline + '</p>'
            + '<div class="kt-social-links">'
            + '<a href="' + SITE.social.facebook  + '" target="_blank" rel="noopener" aria-label="Facebook"  class="kt-social-icon">' + icons.facebook  + '</a>'
            + '<a href="' + SITE.social.instagram + '" target="_blank" rel="noopener" aria-label="Instagram" class="kt-social-icon">' + icons.instagram + '</a>'
            + '<a href="' + SITE.social.youtube   + '" target="_blank" rel="noopener" aria-label="YouTube"   class="kt-social-icon">' + icons.youtube   + '</a>'
            + '<a href="' + SITE.social.whatsapp  + '" target="_blank" rel="noopener" aria-label="WhatsApp"  class="kt-social-icon">' + icons.whatsapp  + '</a>'
            + '</div>'
            + '</div>'

            /* Col 2 — Pages */
            + '<div class="kt-footer-col">'
            + '<h4 class="kt-footer-heading">പേജുകൾ</h4>'
            + '<ul class="kt-footer-links">'
            + '<li><a href="index.html">🏠 വീട്</a></li>'
            + '<li><a href="photography.html">📸 ഫോട്ടോഗ്രാഫി</a></li>'
            + '<li><a href="tutoring.html">📚 പഠനം</a></li>'
            + '<li><a href="piano.html">🎹 സംഗീതം</a></li>'
            + '<li><a href="gardening.html">🌿 തോട്ടം</a></li>'
            + '<li><a href="about.html">ℹ️ ഞങ്ങളെക്കുറിച്ച്</a></li>'
            + '</ul>'
            + '</div>'

            /* Col 3 — Classes */
            + '<div class="kt-footer-col">'
            + '<h4 class="kt-footer-heading">ക്ലാസുകൾ</h4>'
            + '<ul class="kt-footer-links">'
            + '<li><a href="class-1.html">ഒന്നാം ക്ലാസ്</a></li>'
            + '<li><a href="class-2.html">രണ്ടാം ക്ലാസ്</a></li>'
            + '<li><a href="class-3.html">മൂന്നാം ക്ലാസ്</a></li>'
            + '<li><a href="class-4.html">നാലാം ക്ലാസ്</a></li>'
            + '<li><a href="class-5.html">അഞ്ചാം ക്ലാസ്</a></li>'
            + '</ul>'
            + '</div>'

            /* Col 4 — Contact */
            + '<div class="kt-footer-col">'
            + '<h4 class="kt-footer-heading">സമ്പർക്കം</h4>'
            + '<ul class="kt-footer-links kt-footer-contact">'
            + '<li>📧 <a href="mailto:' + SITE.email + '">' + SITE.email + '</a></li>'
            + '<li>📍 ' + SITE.location + '</li>'
            + '</ul>'
            + '</div>'

            + '</div>' /* end kt-footer-inner */

            /* Bottom bar */
            + '<div class="kt-footer-bottom">'
            + '<p>© ' + SITE.year + ' KuttyTeachers.in — പാലക്കാട്ടിൽ 🌱 നിർമ്മിതം</p>'
            + '<p class="kt-footer-attribution">ഈ ഉള്ളടക്കം <strong>KuttyTeachers</strong> സൃഷ്ടിച്ചതാണ്. '
            + 'AI സഹായത്തോടെ. യഥാർത്ഥ ആശയങ്ങളും ക്യൂറേഷനും ലേഖകന്റേതാണ്.</p>'
            + '</div>'

            + '</footer>';

        target.innerHTML = footerHTML;
    }

})();

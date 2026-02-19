/* ============================================================
   photography.js — KuttyTeachers Photography Page Logic
   Reads photos.json → builds albums + photo cards → lightbox
   No libraries needed. Vanilla JS only.
   ============================================================
   Author : KuttyTeachers (kuttyteachers.in)
   © 2026 KuttyTeachers — All Rights Reserved
   ============================================================ */

(function () {
    'use strict';

    /* ── STATE ─────────────────────────────────────────────── */
    let allAlbums  = [];   // full data from JSON
    let flatPhotos = [];   // flat list for lightbox prev/next
    let currentIdx = 0;    // current photo index in flatPhotos

    /* ── BOOT ──────────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function () {
        loadPhotos();
    });

    /* ── LOAD JSON ─────────────────────────────────────────── */
    function loadPhotos() {
        fetch('photos.json')
            .then(function (res) {
                if (!res.ok) throw new Error('Could not load photos.json');
                return res.json();
            })
            .then(function (data) {
                allAlbums  = data.albums || [];
                flatPhotos = buildFlatList(allAlbums);
                render();
            })
            .catch(function (err) {
                console.error('photography.js:', err);
                showError();
            });
    }

    /* ── BUILD FLAT PHOTO LIST (for lightbox prev/next) ────── */
    function buildFlatList(albums) {
        var list = [];
        albums.forEach(function (album) {
            (album.photos || []).forEach(function (photo) {
                list.push({ photo: photo, album: album });
            });
        });
        return list;
    }

    /* ── RENDER ALL ALBUMS ─────────────────────────────────── */
    function render() {
        var container = document.getElementById('albums-container');
        if (!container) return;

        if (allAlbums.length === 0) {
            container.innerHTML = emptyStateHTML();
            return;
        }

        var html = '';
        allAlbums.forEach(function (album, albumIdx) {
            html += buildAlbumHTML(album, albumIdx);
        });
        container.innerHTML = html;

        // Attach album collapse toggle listeners
        container.querySelectorAll('.album-header').forEach(function (header) {
            header.addEventListener('click', function () {
                var album = header.closest('.album');
                album.classList.toggle('collapsed');
            });
        });

        // Attach photo card click listeners (open lightbox)
        container.querySelectorAll('.photo-card').forEach(function (card) {
            card.addEventListener('click', function () {
                var idx = parseInt(card.dataset.flatIdx, 10);
                openLightbox(idx);
            });
        });

        // Inject lightbox into DOM
        document.body.insertAdjacentHTML('beforeend', buildLightboxHTML());
        attachLightboxListeners();
    }

    /* ── BUILD SINGLE ALBUM HTML ───────────────────────────── */
    function buildAlbumHTML(album, albumIdx) {
        var photoCount = (album.photos || []).length;
        var isFirst    = albumIdx === 0;   // first album open by default
        var flatOffset = getFlatOffset(albumIdx);

        var cardsHTML = '';
        (album.photos || []).forEach(function (photo, photoIdx) {
            var flatIdx = flatOffset + photoIdx;
            cardsHTML += buildCardHTML(photo, album, flatIdx);
        });

        return [
            '<div class="album', isFirst ? '' : ' collapsed', '" id="album-', album.id, '">',

              '<div class="album-header" role="button" tabindex="0" ',
                   'aria-expanded="', isFirst ? 'true' : 'false', '">',

                '<div class="album-header-left">',
                  '<img class="album-cover-thumb" src="', escHtml(album.cover), '" alt="" loading="lazy">',
                  '<div class="album-meta">',
                    '<div class="album-date">', escHtml(album.month), ' ', escHtml(album.year), ' &nbsp;·&nbsp; ', escHtml(album.location), '</div>',
                    '<div class="album-title">', escHtml(album.theme), '</div>',
                    '<div class="album-title-en">', escHtml(album.theme_en), '</div>',
                  '</div>',
                '</div>',

                '<div class="album-header-right">',
                  '<span class="album-count">', photoCount, ' ', photoCount === 1 ? 'photo' : 'photos', '</span>',
                  '<div class="album-chevron">', svgChevron(), '</div>',
                '</div>',

              '</div>',   /* .album-header */

              '<div class="album-body">', cardsHTML, '</div>',

            '</div>'      /* .album */
        ].join('');
    }

    /* ── BUILD SINGLE PHOTO CARD HTML ──────────────────────── */
    function buildCardHTML(photo, album, flatIdx) {
        var chips = '';
        if (photo.settings) {
            var s = photo.settings;
            if (s.iso)          chips += '<span class="setting-chip">' + escHtml(s.iso) + '</span>';
            if (s.aperture)     chips += '<span class="setting-chip">' + escHtml(s.aperture) + '</span>';
            if (s.shutter)      chips += '<span class="setting-chip">' + escHtml(s.shutter) + '</span>';
            if (s.focal_length) chips += '<span class="setting-chip">' + escHtml(s.focal_length) + '</span>';
        }

        // Video badge — visible on card if photo has a video
        var videoBadge = (photo.video && photo.video.trim())
            ? '<div class="photo-video-badge">▶ വീഡിയോ</div>'
            : '';

        return [
            '<div class="photo-card" data-flat-idx="', flatIdx, '" role="button" tabindex="0" ',
                 'aria-label="', escHtml(photo.title), ' — click to view">',

              '<div class="photo-card-img-wrap">',
                '<img src="', escHtml(photo.thumb || photo.src), '" ',
                     'alt="', escHtml(photo.title), '" loading="lazy">',
                videoBadge,
                '<div class="photo-card-overlay">',
                  '<div class="photo-card-overlay-hint">',
                    svgExpand(),
                    ' കാണാൻ ക്ലിക്ക് ചെയ്യുക',
                  '</div>',
                '</div>',
              '</div>',

              '<div class="photo-card-body">',
                '<div class="photo-card-location">📍 ', escHtml(album.location), ' · ', escHtml(album.month), ' ', escHtml(album.year), '</div>',
                '<div class="photo-card-title">', escHtml(photo.title), '</div>',
                chips ? '<div class="photo-card-settings">' + chips + '</div>' : '',
              '</div>',

            '</div>'
        ].join('');
    }

    /* ── LIGHTBOX HTML SHELL ───────────────────────────────── */
    function buildLightboxHTML() {
        return [
            '<div class="lightbox" id="kt-lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer">',
              '<div class="lightbox-backdrop" id="lb-backdrop"></div>',
              '<div class="lightbox-panel">',

                /* Left: image */
                '<div class="lightbox-img-wrap">',
                  '<img id="lb-img" src="" alt="">',
                  '<button class="lb-arrow lb-arrow-prev" id="lb-prev" aria-label="Previous photo">', svgArrowLeft(),  '</button>',
                  '<button class="lb-arrow lb-arrow-next" id="lb-next" aria-label="Next photo">',     svgArrowRight(), '</button>',
                '</div>',

                /* Right: info panel */
                '<div class="lightbox-info" id="lb-info"></div>',

                /* Close button */
                '<button class="lb-close" id="lb-close" aria-label="Close">', svgClose(), '</button>',

              '</div>',
            '</div>'
        ].join('');
    }

    /* ── POPULATE LIGHTBOX WITH PHOTO DATA ─────────────────── */
    function populateLightbox(idx) {
        var entry  = flatPhotos[idx];
        var photo  = entry.photo;
        var album  = entry.album;
        var s      = photo.settings || {};
        var comp   = photo.composition || [];

        /* update main image */
        var img = document.getElementById('lb-img');
        img.src = photo.src;
        img.alt = photo.title;

        /* camera settings chips */
        var settingsHTML = '';
        var settingPairs = [
            { key: 'ISO',      val: s.iso },
            { key: 'Aperture', val: s.aperture },
            { key: 'Shutter',  val: s.shutter },
            { key: 'Focal',    val: s.focal_length }
        ];
        settingPairs.forEach(function (pair) {
            if (pair.val) {
                settingsHTML += [
                    '<div class="lb-setting-item">',
                      '<div class="lb-setting-key">', escHtml(pair.key), '</div>',
                      '<div class="lb-setting-val">', escHtml(pair.val), '</div>',
                    '</div>'
                ].join('');
            }
        });

        /* composition tags */
        var compHTML = '';
        comp.forEach(function (tag) {
            compHTML += '<span class="lb-comp-tag">' + escHtml(tag) + '</span>';
        });

        var counterText = (idx + 1) + ' / ' + flatPhotos.length;

        /* ── VIDEO BLOCK ─────────────────────────────────────
           Add a YouTube URL or local mp4 path to the "video"
           field in photos.json and it will appear here.
           Leave "video": "" or omit to show the placeholder.
        ─────────────────────────────────────────────────────── */
        var videoHTML = '';
        if (photo.video && photo.video.trim() !== '') {
            var isYouTube = photo.video.indexOf('youtube.com') !== -1 || photo.video.indexOf('youtu.be') !== -1;
            if (isYouTube) {
                var embedUrl = photo.video
                    .replace('watch?v=', 'embed/')
                    .replace('youtu.be/', 'www.youtube.com/embed/');
                videoHTML = [
                    '<div class="lb-divider"></div>',
                    '<div>',
                      '<div class="lb-section-label">🎬 വീഡിയോ</div>',
                      '<div class="lb-video-wrap">',
                        '<iframe src="', escHtml(embedUrl), '" ',
                          'title="', escHtml(photo.title), ' video" ',
                          'frameborder="0" ',
                          'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ',
                          'allowfullscreen loading="lazy">',
                        '</iframe>',
                      '</div>',
                    '</div>'
                ].join('');
            } else {
                // Direct video file
                videoHTML = [
                    '<div class="lb-divider"></div>',
                    '<div>',
                      '<div class="lb-section-label">🎬 വീഡിയോ</div>',
                      '<div class="lb-video-wrap">',
                        '<video controls preload="none" style="width:100%;border-radius:6px;">',
                          '<source src="', escHtml(photo.video), '" type="video/mp4">',
                          'നിങ്ങളുടെ ബ്രൗസർ വീഡിയോ പിന്തുണയ്ക്കുന്നില്ല.',
                        '</video>',
                      '</div>',
                    '</div>'
                ].join('');
            }
        } else {
            // Placeholder — until you add a real video URL
            videoHTML = [
                '<div class="lb-divider"></div>',
                '<div>',
                  '<div class="lb-section-label">🎬 വീഡിയോ</div>',
                  '<div class="lb-video-placeholder">',
                    '<span class="lb-video-placeholder-icon">▶</span>',
                    '<p>വീഡിയോ ഉടൻ വരും</p>',
                    '<small>photos.json ൽ "video" ഫീൽഡ് ചേർക്കുക</small>',
                  '</div>',
                '</div>'
            ].join('');
        }
        /* ─────────────────────────────────────────────────── */

        var infoHTML = [
            /* Location + title */
            '<div>',
              '<div class="lb-section-label">📍 ', escHtml(album.location), ' &nbsp;·&nbsp; ', escHtml(album.month), ' ', escHtml(album.year), ' &nbsp;·&nbsp; ', counterText, '</div>',
              '<div class="lb-title">', escHtml(photo.title), '</div>',
              photo.title_en ? '<div class="lb-title-en">' + escHtml(photo.title_en) + '</div>' : '',
            '</div>',

            '<div class="lb-divider"></div>',

            /* Description */
            '<div>',
              '<div class="lb-section-label">വിവരണം</div>',
              '<div class="lb-description">', escHtml(photo.description), '</div>',
            '</div>',

            '<div class="lb-divider"></div>',

            /* Camera */
            '<div>',
              '<div class="lb-section-label">📷 Camera</div>',
              '<div class="lb-camera-name">', escHtml(photo.camera || '—'), '</div>',
              photo.lens ? '<div class="lb-lens-name">' + escHtml(photo.lens) + '</div>' : '',
            '</div>',

            /* Settings */
            settingsHTML ? [
                '<div>',
                  '<div class="lb-section-label">⚙️ Settings</div>',
                  '<div class="lb-settings-grid">', settingsHTML, '</div>',
                '</div>'
            ].join('') : '',

            /* Composition */
            compHTML ? [
                '<div class="lb-divider"></div>',
                '<div>',
                  '<div class="lb-section-label">🎨 Composition</div>',
                  '<div class="lb-composition-tags">', compHTML, '</div>',
                '</div>'
            ].join('') : '',

            /* Video — always shown (real embed or placeholder) */
            videoHTML

        ].join('');

        document.getElementById('lb-info').innerHTML = infoHTML;
    }

    /* ── OPEN / CLOSE LIGHTBOX ─────────────────────────────── */
    function openLightbox(idx) {
        currentIdx = clamp(idx, 0, flatPhotos.length - 1);
        populateLightbox(currentIdx);
        document.getElementById('kt-lightbox').classList.add('open');
        document.body.style.overflow = 'hidden';
        updateArrows();
    }

    function closeLightbox() {
        document.getElementById('kt-lightbox').classList.remove('open');
        document.body.style.overflow = '';
    }

    function showPrev() {
        if (currentIdx > 0) {
            currentIdx--;
            populateLightbox(currentIdx);
            updateArrows();
        }
    }

    function showNext() {
        if (currentIdx < flatPhotos.length - 1) {
            currentIdx++;
            populateLightbox(currentIdx);
            updateArrows();
        }
    }

    function updateArrows() {
        var prev = document.getElementById('lb-prev');
        var next = document.getElementById('lb-next');
        if (prev) prev.style.opacity = currentIdx === 0 ? '0.3' : '1';
        if (next) next.style.opacity = currentIdx === flatPhotos.length - 1 ? '0.3' : '1';
    }

    /* ── LIGHTBOX EVENT LISTENERS ──────────────────────────── */
    function attachLightboxListeners() {
        document.getElementById('lb-close').addEventListener('click', closeLightbox);
        document.getElementById('lb-backdrop').addEventListener('click', closeLightbox);

        document.getElementById('lb-prev').addEventListener('click', function (e) {
            e.stopPropagation();
            showPrev();
        });
        document.getElementById('lb-next').addEventListener('click', function (e) {
            e.stopPropagation();
            showNext();
        });

        /* keyboard navigation */
        document.addEventListener('keydown', function (e) {
            var lb = document.getElementById('kt-lightbox');
            if (!lb || !lb.classList.contains('open')) return;
            if (e.key === 'Escape')     closeLightbox();
            if (e.key === 'ArrowLeft')  showPrev();
            if (e.key === 'ArrowRight') showNext();
        });

        /* keyboard: open photo card on Enter/Space */
        document.querySelectorAll('.photo-card').forEach(function (card) {
            card.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(parseInt(card.dataset.flatIdx, 10));
                }
            });
        });

        /* keyboard: open/close album on Enter/Space */
        document.querySelectorAll('.album-header').forEach(function (header) {
            header.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    header.closest('.album').classList.toggle('collapsed');
                }
            });
        });

        /* Touch swipe support */
        var touchStartX = 0;
        var lbPanel = document.querySelector('.lightbox-panel');
        if (lbPanel) {
            lbPanel.addEventListener('touchstart', function (e) {
                touchStartX = e.touches[0].clientX;
            }, { passive: true });

            lbPanel.addEventListener('touchend', function (e) {
                var diff = touchStartX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) {
                    diff > 0 ? showNext() : showPrev();
                }
            }, { passive: true });
        }
    }

    /* ── HELPERS ───────────────────────────────────────────── */
    function getFlatOffset(albumIdx) {
        var offset = 0;
        for (var i = 0; i < albumIdx; i++) {
            offset += (allAlbums[i].photos || []).length;
        }
        return offset;
    }

    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    function escHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g,  '&amp;')
            .replace(/</g,  '&lt;')
            .replace(/>/g,  '&gt;')
            .replace(/"/g,  '&quot;')
            .replace(/'/g,  '&#39;');
    }

    function emptyStateHTML() {
        return '<div class="empty-state"><div class="empty-state-icon">📷</div><p>ഫോട്ടോകൾ ഉടൻ വരും...</p></div>';
    }

    function showError() {
        var c = document.getElementById('albums-container');
        if (c) c.innerHTML = [
            '<div class="empty-state">',
              '<div class="empty-state-icon">⚠️</div>',
              '<p>photos.json ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.</p>',
              '<p style="font-size:0.85rem;margin-top:8px;opacity:0.7;">Make sure photos.json is in the same folder.</p>',
            '</div>'
        ].join('');
    }

    /* ── INLINE SVG ICONS ──────────────────────────────────── */
    function svgChevron() {
        return '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
    }
    function svgArrowLeft() {
        return '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
    }
    function svgArrowRight() {
        return '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
    }
    function svgClose() {
        return '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    }
    function svgExpand() {
        return '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';
    }

})();

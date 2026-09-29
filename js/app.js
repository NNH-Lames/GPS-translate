mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            sequence: { mirrorActors: false, messageMargin: 40, actorFontWeight: 'bold' }
        });

        // === Diagram Button Injection ===
        var DATA = window.DIAGRAM_DATA;
        if (DATA) {
            Object.keys(DATA.sections).forEach(function (sectionId) {
                var section = document.getElementById(sectionId);
                if (!section) return;
                var header = section.querySelector('.section-header');
                if (!header) return;
                var container = document.createElement('div');
                container.className = 'diagram-btns';
                DATA.sections[sectionId].forEach(function (d) {
                    var btn = document.createElement('button');
                    btn.className = 'diagram-btn';
                    btn.setAttribute('data-diagram', d.key);
                    btn.innerHTML = '📊 ' + d.label;
                    container.appendChild(btn);
                });
                header.after(container);
            });
        }

        // === Zoom/Pan State ===
        var scale = 1, tx = 0, ty = 0, renderN = 0;
        var dragging = false, lastX = 0, lastY = 0;
        var overlay = document.getElementById('dgOverlay');
        var titleEl = document.getElementById('dgTitle');
        var vp = document.getElementById('dgVp');
        var dgBody = document.getElementById('dgBody');
        var zpctEl = document.getElementById('zpct');

        function applyTransform() {
            vp.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
            zpctEl.textContent = Math.round(scale * 100) + '%';
        }

        function doZoom(delta, cx, cy) {
            var oldScale = scale;
            scale = Math.max(0.1, Math.min(5, scale + delta));
            var ratio = scale / oldScale;
            tx = cx - ratio * (cx - tx);
            ty = cy - ratio * (cy - ty);
            applyTransform();
        }

        function fitToView() {
            var svgEl = vp.querySelector('svg');
            if (!svgEl) { scale = 1; tx = 0; ty = 0; applyTransform(); return; }
            var bw = dgBody.clientWidth - 40;
            var bh = dgBody.clientHeight - 40;
            var vb = svgEl.viewBox && svgEl.viewBox.baseVal;
            var sw = (vb && vb.width) || svgEl.getBoundingClientRect().width || bw;
            var sh = (vb && vb.height) || svgEl.getBoundingClientRect().height || bh;
            scale = Math.min(bw / sw, bh / sh, 2);
            tx = Math.max(0, (bw - sw * scale) / 2) + 20;
            ty = Math.max(0, (bh - sh * scale) / 2) + 20;
            applyTransform();
        }

        // === Open Diagram ===
        async function openDiagram(key) {
            if (!DATA) return;
            var d = DATA.diagrams[key];
            if (!d) return;
            titleEl.textContent = d.title;
            scale = 1; tx = 0; ty = 0;
            vp.innerHTML = '<p class="loading-msg">Đang render sơ đồ...</p>';
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            try {
                renderN++;
                var result = await mermaid.render('dgr' + renderN, d.mermaid);
                vp.innerHTML = result.svg;
                // Small delay so SVG is laid out before fitting
                requestAnimationFrame(function () { fitToView(); });
            } catch (err) {
                vp.innerHTML = '<p style="color:#c62828;padding:2rem">Render error: ' + err.message + '</p>';
            }
        }

        function closeDiagram() {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        // === Event Delegation ===
        document.addEventListener('click', function (e) {
            var dgBtn = e.target.closest('[data-diagram]');
            if (dgBtn) { openDiagram(dgBtn.getAttribute('data-diagram')); return; }
            if (e.target.closest('#zoomIn')) { doZoom(0.2, dgBody.clientWidth / 2, dgBody.clientHeight / 2); return; }
            if (e.target.closest('#zoomOut')) { doZoom(-0.2, dgBody.clientWidth / 2, dgBody.clientHeight / 2); return; }
            if (e.target.closest('#zoomReset')) { fitToView(); return; }
            if (e.target.closest('#dgClose') || e.target === overlay) { closeDiagram(); return; }
        });

        // === Mouse Wheel Zoom ===
        dgBody.addEventListener('wheel', function (e) {
            e.preventDefault();
            var rect = dgBody.getBoundingClientRect();
            doZoom(e.deltaY > 0 ? -0.12 : 0.12, e.clientX - rect.left, e.clientY - rect.top);
        }, { passive: false });

        // === Mouse Drag Pan ===
        dgBody.addEventListener('mousedown', function (e) {
            dragging = true; lastX = e.clientX; lastY = e.clientY;
            e.preventDefault();
        });
        window.addEventListener('mousemove', function (e) {
            if (!dragging) return;
            tx += e.clientX - lastX;
            ty += e.clientY - lastY;
            lastX = e.clientX;
            lastY = e.clientY;
            applyTransform();
        });
        window.addEventListener('mouseup', function () { dragging = false; });

        // === Touch Support (Pan + Pinch Zoom) ===
        var lastTouchDist = 0;
        dgBody.addEventListener('touchstart', function (e) {
            if (e.touches.length === 1) {
                dragging = true;
                lastX = e.touches[0].clientX;
                lastY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                lastTouchDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
            }
        }, { passive: true });
        dgBody.addEventListener('touchmove', function (e) {
            if (e.touches.length === 1 && dragging) {
                tx += e.touches[0].clientX - lastX;
                ty += e.touches[0].clientY - lastY;
                lastX = e.touches[0].clientX;
                lastY = e.touches[0].clientY;
                applyTransform();
            } else if (e.touches.length === 2) {
                var dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                var rect = dgBody.getBoundingClientRect();
                var cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
                var cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
                doZoom((dist - lastTouchDist) * 0.005, cx, cy);
                lastTouchDist = dist;
            }
        }, { passive: true });
        dgBody.addEventListener('touchend', function () { dragging = false; });

        // === ESC Key ===
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && overlay.classList.contains('active')) closeDiagram();
        });

        // === Smooth scroll for nav ===
        document.querySelectorAll('nav a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                var target = document.querySelector(this.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        // === Active nav highlight ===
        var navSections = document.querySelectorAll('section[id]');
        window.addEventListener('scroll', function () {
            var scrollY = window.pageYOffset;
            navSections.forEach(function (section) {
                var top = section.offsetTop - 80;
                var height = section.offsetHeight;
                var id = section.getAttribute('id');
                var link = document.querySelector('nav a[href="#' + id + '"]');
                if (link) {
                    if (scrollY >= top && scrollY < top + height) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                }
            });
        });

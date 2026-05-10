/* ============================================================
   THEME MANAGER  (Dark / Light Mode)
   Directly writes CSS custom properties so there are NO
   CSS specificity or cascade conflicts.
============================================================ */

const ThemeManager = (() => {
    const KEY = 'lfid-theme';

    const THEMES = {
        dark: {
            '--bg-color': '#0b0e14',
            '--surface-color': 'rgba(22, 27, 34, 0.8)',
            '--surface-border': 'rgba(255, 255, 255, 0.1)',
            '--text-primary': '#f8fafc',
            '--text-secondary': '#94a3b8',
            '--surface': '#1e293b',
            '--border': 'rgba(255, 255, 255, 0.12)',
            '--input-bg': 'rgba(255, 255, 255, 0.05)',
            '--glass-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        },
        light: {
            '--bg-color': '#f0f4f8',
            '--surface-color': 'rgba(255, 255, 255, 0.92)',
            '--surface-border': 'rgba(0, 0, 0, 0.08)',
            '--text-primary': '#0f172a',
            '--text-secondary': '#475569',
            '--surface': '#ffffff',
            '--border': 'rgba(0, 0, 0, 0.1)',
            '--input-bg': 'rgba(15, 23, 42, 0.04)',
            '--glass-shadow': '0 20px 40px -10px rgba(15, 23, 42, 0.15)'
        }
    };

    const BG_IMAGES = {
        dark: 'radial-gradient(at 0% 0%, hsla(217,100%,10%,1) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(217,100%,15%,1) 0, transparent 50%)',
        light: 'radial-gradient(at 0% 0%, hsla(217,80%,85%,0.6) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(217,80%,90%,0.6) 0, transparent 50%)'
    };

    function apply(theme) {
        const vars = THEMES[theme] || THEMES.dark;
        const root = document.documentElement;
        Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
        document.body.style.backgroundImage = BG_IMAGES[theme];
        syncButtons(theme);
    }

    function syncButtons(theme) {
        const isLight = (theme === 'light');
        const icon = isLight ? 'moon' : 'sun';
        const tipText = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
        ['theme-toggle', 'student-theme-toggle'].forEach(id => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.title = tipText;
            btn.innerHTML = `<i data-lucide="${icon}"></i>`;
        });
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function toggle() {
        const current = localStorage.getItem(KEY) || 'dark';
        const next = (current === 'dark') ? 'light' : 'dark';
        localStorage.setItem(KEY, next);
        apply(next);
    }

    function init() {
        const saved = localStorage.getItem(KEY) || 'dark';
        apply(saved);
        document.addEventListener('click', e => {
            if (e.target.closest('#theme-toggle, #student-theme-toggle')) toggle();
        });
    }

    return { init, toggle };
})();

ThemeManager.init();


/* ============================================================
   SHARED UTILITIES
============================================================ */

function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast-show'));
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

function openModal(title, bodyHTML) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    document.getElementById('modal-overlay').classList.remove('hidden');
    lucide.createIcons();
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-body').innerHTML = '';
}

function statusClass(s) {
    if (s === 'LOST') return 'status-lost';
    if (s === 'FOUND') return 'status-found';
    if (s === 'CLAIMED') return 'status-claimed';
    return 'status-unknown';
}

document.getElementById('close-modal').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
});

async function loadStudentNotifications() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    if (!user.id) return;

    try {
        const resp = await fetch(`/api/notifications/user/${user.id}`);
        const notifications = await resp.json();
        const badge = document.getElementById('notif-badge');
        if (badge) {
            if (notifications.length > 0) {
                badge.textContent = notifications.length;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
        return notifications;
    } catch (err) {
        console.error('Failed to load notifications', err);
        return [];
    }
}

async function openStudentNotificationsModal() {
    const notifications = await loadStudentNotifications();
    let html = '';
    if (notifications.length === 0) {
        html = '<p style="text-align:center;color:var(--text-secondary);padding:1rem;">No notifications yet.</p>';
    } else {
        html = `
            <div style="max-height: 300px; overflow-y: auto;">
                ${notifications.map(n => `
                    <div style="padding: 1rem; border-bottom: 1px solid var(--surface-border); font-size: 0.9rem;">
                        <p>${n.message}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
    openModal('🔔 Notifications', html);
}

document.getElementById('student-notifications-btn')?.addEventListener('click', openStudentNotificationsModal);

/* ============================================================
   STUDENT PORTAL
============================================================ */

/* ---- STUDENT REPORT MODALS ---- */
function openReportModal(type) {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    let prefillCard = '';

    // Attempt to pre-fill card number if student has one
    if (user && user.idCard && user.idCard.cardNumber) {
        prefillCard = user.idCard.cardNumber;
    }

    if (type === 'LOST') {
        openModal('🔴 Report Lost ID Card', `
            <p style="color:var(--text-secondary);margin-bottom:1.2rem;">
                Fill in your card details below. The admin will be notified to look for it.
            </p>
            <form id="report-lost-form">
                <div class="form-group">
                    <label>Your Card Number <span style="color:var(--error)">*</span></label>
                    <input type="text" id="lost-card-number" placeholder="e.g. CARD-2024-001" value="${prefillCard}" required>
                </div>
                <div class="form-group">
                    <label>Last Seen Location <span style="color:var(--error)">*</span></label>
                    <input type="text" id="lost-location" placeholder="e.g. Science Library, Block B" required>
                </div>
                <div class="form-group">
                    <label>Additional Notes (optional)</label>
                    <input type="text" id="lost-notes" placeholder="Any extra details…">
                </div>
                <button type="submit" class="btn btn-primary" style="margin-top:0.5rem;">
                    <i data-lucide="flag"></i> Submit Lost Report
                </button>
            </form>
        `);

        document.getElementById('report-lost-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const cardNumber = document.getElementById('lost-card-number').value.trim();

            try {
                const search = await fetch(`/api/idcards/search?cardNumber=${encodeURIComponent(cardNumber)}`);
                let cardId;

                if (!search.ok) {
                    // Card not found, let's create it as LOST
                    const createResp = await fetch('/api/idcards', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            cardNumber: cardNumber,
                            status: 'LOST',
                            owner: user ? { id: user.id } : null
                        })
                    });
                    if (!createResp.ok) throw new Error('Could not create card record.');
                    const newCard = await createResp.json();
                    cardId = newCard.idCardId;
                } else {
                    const card = await search.json();
                    cardId = card.idCardId;
                    const update = await fetch(`/api/idcards/${cardId}/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'LOST' })
                    });
                    if (!update.ok) throw new Error('Could not update card status.');
                }

                showToast('Your lost report has been submitted. Status updated to LOST.');
                closeModal();
                loadStudentNotifications();
            } catch (err) {
                showToast('Submission failed: ' + err.message, 'error');
            }
        });

    } else {
        // FOUND — Finder Entry
        openModal('🟢 Report Found ID Card — Finder Entry', `
            <p style="color:var(--text-secondary);margin-bottom:1.2rem;">
                Found someone's ID? Fill in your details below. The card owner will be notified automatically.
            </p>
            <form id="report-found-form">
                <div class="form-group">
                    <label>Your Full Name <span style="color:var(--error)">*</span></label>
                    <input type="text" id="finder-name" placeholder="e.g. Jane Doe" required>
                </div>
                <div class="form-group">
                    <label>Your Phone Number <span style="color:var(--error)">*</span></label>
                    <input type="tel" id="finder-phone" placeholder="e.g. +27 81 234 5678" required>
                </div>
                <div class="form-group">
                    <label>Card Number Found <span style="color:var(--error)">*</span></label>
                    <input type="text" id="finder-card-number" placeholder="e.g. CARD-2024-001" required>
                </div>
                <div class="form-group">
                    <label>Location Where Found <span style="color:var(--error)">*</span></label>
                    <input type="text" id="finder-location" placeholder="e.g. Cafeteria entrance" required>
                </div>
                <button type="submit" class="btn btn-success" style="margin-top:0.5rem;">
                    <i data-lucide="hand-helping"></i> Submit — I Found It
                </button>
            </form>
        `);

        document.getElementById('report-found-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const finderName = document.getElementById('finder-name').value.trim();
            const finderPhone = document.getElementById('finder-phone').value.trim();
            const cardNumber = document.getElementById('finder-card-number').value.trim();
            const foundLocation = document.getElementById('finder-location').value.trim();

            try {
                const resp = await fetch('/api/finders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullName: finderName,
                        phoneNumber: finderPhone,
                        cardNumber: cardNumber,
                        foundLocation: foundLocation
                    })
                });
                if (!resp.ok) {
                    const err = await resp.text();
                    throw new Error(err);
                }
                showToast('Thank you! The card is logged as FOUND and the owner has been notified.');
                closeModal();
            } catch (err) {
                showToast('Submission failed: ' + err.message, 'error');
            }
        });
    }
}

/* ============================================================
   ADMIN PORTAL
============================================================ */

let adminCurrentPage = 'dashboard';

function loadAdminPage(pageId) {
    adminCurrentPage = pageId;
    const content = document.getElementById('admin-page-content');
    const title = document.getElementById('admin-page-title');

    document.querySelectorAll('#admin-container .nav-links li').forEach(li => {
        li.classList.toggle('active', li.getAttribute('data-page') === pageId);
    });

    const labels = { dashboard: 'Dashboard', 'id-cards': 'ID Cards', claims: 'Claims', finders: 'Finders', users: 'Users' };
    title.textContent = labels[pageId] || pageId;

    const html = {
        dashboard: renderAdminDashboardHTML,
        'id-cards': renderIDCardsPageHTML,
        claims: renderClaimsPageHTML,
        finders: renderFindersPageHTML,
        users: renderUsersPageHTML
    }[pageId];

    if (html) content.innerHTML = html();
    lucide.createIcons();

    const loaders = {
        dashboard: onAdminDashboardLoad,
        'id-cards': fetchIDCards,
        claims: fetchClaims,
        finders: fetchFinders,
        users: fetchUsers
    };
    if (loaders[pageId]) loaders[pageId]();
}

/* Admin nav listeners */
document.querySelectorAll('#admin-container .nav-links li').forEach(li => {
    li.addEventListener('click', () => {
        const pageId = li.getAttribute('data-page');
        if (pageId) loadAdminPage(pageId);
    });
});

/* ---- ADMIN DASHBOARD ---- */
function renderAdminDashboardHTML() {
    return `
        <div class="stats-grid animate-in">
            <div class="stat-card">
                <div class="stat-icon blue"><i data-lucide="credit-card"></i></div>
                <div class="stat-info"><h3>Total ID Cards</h3><p id="total-cards">--</p></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green"><i data-lucide="users"></i></div>
                <div class="stat-info"><h3>Total Users</h3><p id="total-users">--</p></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange"><i data-lucide="file-check"></i></div>
                <div class="stat-info"><h3>Total Claims</h3><p id="total-claims">--</p></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon purple"><i data-lucide="search-check"></i></div>
                <div class="stat-info"><h3>Total Finders</h3><p id="total-finders">--</p></div>
            </div>
        </div>
        <div class="table-container animate-in" style="margin-top:2rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
                <h2>Recent ID Cards</h2>
                <button class="btn btn-primary" style="width:auto;padding:0.5rem 1.2rem;" onclick="loadAdminPage('claims')">
                    <i data-lucide="file-check" style="width:16px;height:16px;"></i> View All Claims
                </button>
            </div>
            <table>
                <thead><tr><th>Card Number</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody id="admin-recent-cards"><tr><td colspan="3" style="text-align:center;">Loading…</td></tr></tbody>
            </table>
        </div>
    `;
}

async function onAdminDashboardLoad() {
    try {
        const [cardsR, usersR, claimsR, findersR] = await Promise.all([
            fetch('/api/idcards'),
            fetch('/api/users'),
            fetch('/api/claims/all'),
            fetch('/api/finders')
        ]);
        const [cards, users, claims, finders] = await Promise.all([
            cardsR.json(), usersR.json(), claimsR.json(), findersR.json()
        ]);

        const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        set('total-cards', cards.length);
        set('total-users', users.length);
        set('total-claims', claims.length);
        set('total-finders', finders.length);

        const tbody = document.getElementById('admin-recent-cards');
        if (!tbody) return;
        if (!cards.length) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No cards yet — <a href="#" onclick="loadAdminPage('id-cards');return false;">Add one</a></td></tr>`;
            return;
        }
        tbody.innerHTML = cards.slice(0, 6).map(c => `
            <tr>
                <td>${c.cardNumber || 'N/A'}</td>
                <td><span class="badge-status ${statusClass(c.status)}">${c.status || '—'}</span></td>
                <td>
                    <button class="icon-btn" title="Edit" onclick="openEditCardModal(${c.idCardId},'${c.cardNumber}','${c.status}')"><i data-lucide="edit-2"></i></button>
                    <button class="icon-btn btn-danger-icon" title="Delete" onclick="deleteCard(${c.idCardId})" style="margin-left:4px;"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `).join('');
        lucide.createIcons();
    } catch (err) {
        console.error('Admin dashboard load error', err);
    }
}

/* ---- ID CARDS ---- */
function renderIDCardsPageHTML() {
    return `
        <div class="table-container animate-in">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
                <h2>Manage ID Cards</h2>
                <button class="btn btn-primary" style="width:auto;padding:0.5rem 1.2rem;" onclick="openAddCardModal()">
                    <i data-lucide="plus" style="width:16px;height:16px;"></i> Add New Card
                </button>
            </div>
            <div style="display:flex;gap:0.75rem;margin-bottom:1rem;">
                <input type="text" id="card-search-input" placeholder="Search by card number…" style="flex:1;padding:0.55rem 1rem;border-radius:8px;border:1px solid var(--surface-border);background:rgba(255,255,255,0.05);color:white;">
                <button class="btn btn-primary" style="width:auto;padding:0.55rem 1.2rem;" onclick="searchCard()">Search</button>
            </div>
            <table>
                <thead><tr><th>Card Number</th><th>Owner</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody id="id-cards-list"><tr><td colspan="4" style="text-align:center;">Loading…</td></tr></tbody>
            </table>
        </div>
    `;
}

async function fetchIDCards() {
    const resp = await fetch('/api/idcards');
    const cards = await resp.json();
    renderIDCards(cards);
}

function renderIDCards(cards) {
    const tbody = document.getElementById('id-cards-list');
    if (!tbody) return;
    if (!cards || !cards.length) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No ID cards found.</td></tr>`;
        return;
    }
    tbody.innerHTML = cards.map(c => `
        <tr>
            <td>${c.cardNumber || 'N/A'}</td>
            <td>${c.owner ? c.owner.fullName : '—'}</td>
            <td><span class="badge-status ${statusClass(c.status)}">${c.status || '—'}</span></td>
            <td>
                <button class="icon-btn" title="Edit" onclick="openEditCardModal(${c.idCardId},'${c.cardNumber}','${c.status}')"><i data-lucide="edit-2"></i></button>
                <button class="icon-btn btn-danger-icon" title="Delete" onclick="deleteCard(${c.idCardId})" style="margin-left:4px;"><i data-lucide="trash-2"></i></button>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

async function searchCard() {
    const q = document.getElementById('card-search-input')?.value.trim();
    if (!q) return fetchIDCards();
    const resp = await fetch(`/api/idcards/search?cardNumber=${encodeURIComponent(q)}`);
    if (resp.status === 404) {
        document.getElementById('id-cards-list').innerHTML =
            `<tr><td colspan="4" style="text-align:center;">No card found with number "<strong>${q}</strong>".</td></tr>`;
        return;
    }
    const card = await resp.json();
    renderIDCards([card]);
}

function openAddCardModal() {
    openModal('Add New ID Card', `
        <form id="add-card-form">
            <div class="form-group">
                <label>Card Number <span style="color:var(--error)">*</span></label>
                <input type="text" id="new-card-number" placeholder="e.g. CARD-2024-001" required>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="new-card-status">
                    <option value="FOUND">FOUND</option>
                    <option value="LOST">LOST</option>
                    <option value="CLAIMED">CLAIMED</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary" style="margin-top:0.5rem;">Save Card</button>
        </form>
    `);
    document.getElementById('add-card-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const cardNumber = document.getElementById('new-card-number').value.trim();
        const status = document.getElementById('new-card-status').value;
        if (!cardNumber) { showToast('Card number is required.', 'error'); return; }
        try {
            const resp = await fetch('/api/idcards', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardNumber, status })
            });
            if (!resp.ok) throw new Error(await resp.text());
            showToast('ID Card added!');
            closeModal();
            fetchIDCards();
        } catch (err) { showToast('Error: ' + err.message, 'error'); }
    });
}

function openEditCardModal(id, cardNumber, status) {
    openModal('Edit ID Card', `
        <form id="edit-card-form">
            <div class="form-group">
                <label>Card Number</label>
                <input type="text" id="edit-card-number" value="${cardNumber}" required>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="edit-card-status">
                    <option value="FOUND"   ${status === 'FOUND' ? 'selected' : ''}>FOUND</option>
                    <option value="LOST"    ${status === 'LOST' ? 'selected' : ''}>LOST</option>
                    <option value="CLAIMED" ${status === 'CLAIMED' ? 'selected' : ''}>CLAIMED</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary" style="margin-top:0.5rem;">Update Card</button>
        </form>
    `);
    document.getElementById('edit-card-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const resp = await fetch(`/api/idcards/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cardNumber: document.getElementById('edit-card-number').value.trim(),
                    status: document.getElementById('edit-card-status').value
                })
            });
            if (!resp.ok) throw new Error();
            showToast('Card updated!');
            closeModal();
            if (adminCurrentPage === 'id-cards') fetchIDCards();
            else onAdminDashboardLoad();
        } catch { showToast('Update failed.', 'error'); }
    });
}

async function deleteCard(id) {
    openModal('Confirm Delete', `
        <p style="margin-bottom:1.5rem;">Delete this ID card? This cannot be undone.</p>
        <div style="display:flex;gap:1rem;">
            <button class="btn btn-danger" id="confirm-del">Yes, Delete</button>
            <button class="btn" id="cancel-del" style="background:var(--surface);color:var(--text-primary);border:1px solid var(--border);">Cancel</button>
        </div>
    `);
    document.getElementById('confirm-del').onclick = async () => {
        await fetch(`/api/idcards/${id}`, { method: 'DELETE' });
        showToast('Card deleted.');
        closeModal();
        if (adminCurrentPage === 'id-cards') fetchIDCards();
        else onAdminDashboardLoad();
    };
    document.getElementById('cancel-del').onclick = closeModal;
}

/* ---- CLAIMS ---- */
function renderClaimsPageHTML() {
    return `
        <div class="table-container animate-in">
            <h2 style="margin-bottom:1.5rem;">Claims Management</h2>
            <table>
                <thead><tr><th>Claim #</th><th>Card Number</th><th>Found Location</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody id="claims-list"><tr><td colspan="5" style="text-align:center;">Loading…</td></tr></tbody>
            </table>
        </div>
    `;
}

async function fetchClaims() {
    const resp = await fetch('/api/claims/all');
    const claims = await resp.json();
    const tbody = document.getElementById('claims-list');
    if (!tbody) return;
    if (!claims.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No claims yet.</td></tr>`;
        return;
    }
    tbody.innerHTML = claims.map(c => `
        <tr>
            <td>#${c.claimId}</td>
            <td>${c.idCard ? c.idCard.cardNumber : '—'}</td>
            <td>${c.foundLocation || '—'}</td>
            <td><span class="badge-status ${c.claimType === 'CLAIMED' ? 'status-claimed' : c.claimType === 'FOUND' ? 'status-found' : 'status-lost'}">${c.claimType || 'PENDING'}</span></td>
            <td>
                <button class="btn" style="width:auto;padding:0.3rem 0.75rem;background:var(--success);font-size:0.8rem;margin-right:4px;" onclick="updateClaimStatus(${c.claimId},'CLAIMED')">Approve</button>
                <button class="btn btn-danger" style="width:auto;padding:0.3rem 0.75rem;font-size:0.8rem;" onclick="updateClaimStatus(${c.claimId},'REJECTED')">Reject</button>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

async function updateClaimStatus(id, status) {
    await fetch(`/api/claims/${id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    showToast(`Claim ${status === 'CLAIMED' ? 'approved' : 'rejected'}.`);
    fetchClaims();
}

/* ---- FINDERS ---- */
function renderFindersPageHTML() {
    return `
        <div class="table-container animate-in">
            <h2 style="margin-bottom:1.5rem;">Finder Records</h2>
            <table>
                <thead><tr><th>ID</th><th>Full Name</th><th>Phone</th><th>Actions</th></tr></thead>
                <tbody id="finders-list"><tr><td colspan="4" style="text-align:center;">Loading…</td></tr></tbody>
            </table>
        </div>
    `;
}

async function fetchFinders() {
    const resp = await fetch('/api/finders');
    const finders = await resp.json();
    const tbody = document.getElementById('finders-list');
    if (!tbody) return;
    if (!finders.length) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No finder records yet.</td></tr>`;
        return;
    }
    tbody.innerHTML = finders.map(f => `
        <tr>
            <td>${f.id}</td>
            <td>${f.fullName || '—'}</td>
            <td>${f.phoneNumber || '—'}</td>
            <td>
                <button class="icon-btn btn-danger-icon" title="Delete" onclick="deleteFinder(${f.id})"><i data-lucide="trash-2"></i></button>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

async function deleteFinder(id) {
    openModal('Confirm Delete Finder', `
        <p style="margin-bottom:1.5rem;">Remove this finder record?</p>
        <div style="display:flex;gap:1rem;">
            <button class="btn btn-danger" id="confirm-finder-del">Yes, Delete</button>
            <button class="btn" id="cancel-finder-del" style="background:var(--surface);color:var(--text-primary);border:1px solid var(--border);">Cancel</button>
        </div>
    `);
    document.getElementById('confirm-finder-del').onclick = async () => {
        await fetch(`/api/finders/${id}`, { method: 'DELETE' });
        showToast('Finder deleted.');
        closeModal();
        fetchFinders();
    };
    document.getElementById('cancel-finder-del').onclick = closeModal;
}

/* ---- USERS ---- */
function renderUsersPageHTML() {
    return `
        <div class="table-container animate-in">
            <h2 style="margin-bottom:1.5rem;">User Management</h2>
            <table>
                <thead><tr><th>ID</th><th>Full Name</th><th>Reg Number</th><th>ID Card</th><th>Actions</th></tr></thead>
                <tbody id="users-list"><tr><td colspan="5" style="text-align:center;">Loading…</td></tr></tbody>
            </table>
        </div>
    `;
}

async function fetchUsers() {
    const resp = await fetch('/api/users');
    const users = await resp.json();
    const tbody = document.getElementById('users-list');
    if (!tbody) return;
    if (!users.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No users registered yet.</td></tr>`;
        return;
    }
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.id}</td>
            <td>${u.fullName || '—'}</td>
            <td>${u.registrationNumber || '—'}</td>
            <td>${u.idCard ? `<span class="badge-status ${statusClass(u.idCard.status)}">${u.idCard.cardNumber}</span>` : '—'}</td>
            <td>
                <button class="icon-btn btn-danger-icon" title="Delete" onclick="deleteUser(${u.id})"><i data-lucide="trash-2"></i></button>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

async function deleteUser(id) {
    openModal('Confirm Delete User', `
        <p style="margin-bottom:1.5rem;">Remove this user? This cannot be undone.</p>
        <div style="display:flex;gap:1rem;">
            <button class="btn btn-danger" id="confirm-user-del">Yes, Delete</button>
            <button class="btn" id="cancel-user-del" style="background:var(--surface);color:var(--text-primary);border:1px solid var(--border);">Cancel</button>
        </div>
    `);
    document.getElementById('confirm-user-del').onclick = async () => {
        await fetch(`/api/users/${id}`, { method: 'DELETE' });
        showToast('User deleted.');
        closeModal();
        fetchUsers();
    };
    document.getElementById('cancel-user-del').onclick = closeModal;
}

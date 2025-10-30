/* public/assets/js/app.js
   Client logic for auth, protected routes, tickets CRUD, toasts and inline validation.
   Uses localStorage keys:
     - ticketapp_session
     - ticketapp_tickets
*/

// IIFE to scope
(function () {
  const SESSION_KEY = 'ticketapp_session';
  const TICKETS_KEY = 'ticketapp_tickets';
  const ALLOWED_STATUSES = ['open', 'in_progress', 'closed'];

  // --- Session helpers ---
  function setSession(obj) { localStorage.setItem(SESSION_KEY, JSON.stringify(obj)); }
  function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch(e) { return null; } }
  function clearSession() { localStorage.removeItem(SESSION_KEY); }

  // --- Tickets helpers ---
  function readTickets() { try { return JSON.parse(localStorage.getItem(TICKETS_KEY)) || []; } catch(e) { return []; } }
  function saveTickets(arr) { localStorage.setItem(TICKETS_KEY, JSON.stringify(arr)); }
  function createTicket(payload) {
    const ticket = { id: 't_' + Date.now(), ...payload, createdAt: Date.now() };
    const t = [ticket, ...readTickets()];
    saveTickets(t);
    return ticket;
  }
  function updateTicket(id, updates) {
    const items = readTickets().map(t => t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t);
    saveTickets(items);
    return items;
  }
  function deleteTicket(id) {
    const items = readTickets().filter(t => t.id !== id);
    saveTickets(items);
    return items;
  }

  // --- Simple toast/snackbar ---
  function showToast(message, type='info', ms=3500) {
    const el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.textContent = message;
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
    // show
    requestAnimationFrame(()=> el.classList.add('visible'));
    setTimeout(()=> {
      el.classList.remove('visible');
      setTimeout(()=> el.remove(), 220);
    }, ms);
  }

  // --- Helpers for escaping -->
  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (m) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]; });
  }

  // --- Protected route guard ---
  function guardProtectedPages() {
    // pages that require session should include data-protected="true" on the page root (we add that in templates)
    const protectedNode = document.querySelector('[data-protected="true"]');
    if (!protectedNode) return;
    const session = getSession();
    const now = Date.now();
    if (!session || !session.token || (session.expires && now > session.expires)) {
      clearSession();
      showToast('Your session has expired — please log in again.', 'error', 4000);
      // redirect to login after slight delay so toast can be read
      setTimeout(()=> window.location.href = '/auth/login', 900);
    }
  }

  // --- Inline field error helpers ---
  function showFieldError(field, msg) {
    clearFieldError(field);
    const err = document.createElement('div');
    err.className = 'field-error';
    err.style.color = '#dc2626';
    err.style.fontSize = '0.9rem';
    err.textContent = msg;
    field.parentNode.appendChild(err);
    field.focus();
  }
  function clearFieldError(field) {
    const existing = field.parentNode.querySelector('.field-error');
    if (existing) existing.remove();
  }

  // --- Render tickets list into container #ticketsContainer ---
  function renderTicketsList() {
    const container = document.querySelector('#ticketsContainer');
    if (!container) return;
    const tickets = readTickets();
    container.innerHTML = '';
    if (!tickets.length) {
      const empty = document.createElement('div');
      empty.className = 'card';
      empty.textContent = 'No tickets yet — create one using the form above.';
      container.appendChild(empty);
      return;
    }

    tickets.forEach(t => {
      const el = document.createElement('div');
      el.className = 'card';
      const badgeClass = `status-${t.status}`;
      el.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
          <div style="flex:1;">
            <h3 style="margin:0 0 6px 0;">${escapeHtml(t.title)}</h3>
            <p style="margin:0 0 8px 0;color:#6b7280;">${escapeHtml(t.description || '')}</p>
            <small style="color:#9ca3af;">Created: ${new Date(t.createdAt).toLocaleString()}</small>
          </div>
          <div style="text-align:right;">
            <div class="${badgeClass}">${escapeHtml(t.status.replace('_',' '))}</div>
            <div style="margin-top:8px;display:flex;flex-direction:column;gap:6px;">
              <button data-action="edit" data-id="${t.id}" class="btn-outline">Edit</button>
              <button data-action="delete" data-id="${t.id}" class="btn">Delete</button>
            </div>
          </div>
        </div>
      `;
      container.appendChild(el);
    });

    // attach event handlers
    container.querySelectorAll('button[data-action]').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const id = btn.getAttribute('data-id');
        const act = btn.getAttribute('data-action');
        if (act === 'edit') populateEditForm(id);
        if (act === 'delete') {
          if (!confirm('Delete this ticket? This action cannot be undone.')) return;
          deleteTicket(id);
          showToast('Ticket deleted', 'success');
          renderTicketsList();
        }
      });
    });
  }

  function populateEditForm(id) {
    const tickets = readTickets();
    const t = tickets.find(x => x.id === id);
    if (!t) { showToast('Ticket not found', 'error'); return; }
    const form = document.querySelector('#ticketForm');
    if (!form) return;
    form.ticketId.value = t.id;
    form.title.value = t.title;
    form.status.value = t.status;
    form.description.value = t.description || '';
    window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 20, behavior:'smooth' });
  }

  // --- Form handlers (login/signup/ticket) ---
  document.addEventListener('DOMContentLoaded', function () {
    guardProtectedPages();

    // Header logout button (if present)
    const logoutBtn = document.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        clearSession();
        showToast('Logged out', 'info');
        setTimeout(()=> location.href = '/', 600);
      });
    }

    // Login form
    const loginForm = document.querySelector('#loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = loginForm.email.value.trim();
        const password = loginForm.password.value;
        // basic validation
        if (!email || !password) { showFieldError(loginForm.email, 'Please provide email and password'); return; }
        if (password.length < 4) { showFieldError(loginForm.password, 'Password too short'); return; }
        // simulate success
        const session = { email, token: Math.random().toString(36).slice(2), expires: Date.now() + (1000 * 60 * 60) };
        setSession(session);
        showToast('Login successful', 'success');
        setTimeout(()=> location.href = '/dashboard', 600);
      });
    }

    // Signup form
    const signupForm = document.querySelector('#signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = signupForm.email.value.trim();
        const password = signupForm.password.value;
        if (!email || !password) { showFieldError(signupForm.email, 'Complete the fields'); return; }
        if (password.length < 4) { showFieldError(signupForm.password, 'Password too short'); return; }
        const session = { email, token: Math.random().toString(36).slice(2), expires: Date.now() + (1000 * 60 * 60) };
        setSession(session);
        showToast('Account created', 'success');
        setTimeout(()=> location.href = '/dashboard', 700);
      });
    }

    // Ticket form
    const ticketForm = document.querySelector('#ticketForm');
    if (ticketForm) {
      ticketForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const id = ticketForm.ticketId.value || null;
        const title = ticketForm.title.value.trim();
        const status = ticketForm.status.value;
        const description = ticketForm.description.value.trim();

        if (!title) { showFieldError(ticketForm.title, 'Title is required'); return; }
        if (!ALLOWED_STATUSES.includes(status)) { showFieldError(ticketForm.status, 'Invalid status'); return; }
        if (description.length > 2000) { showFieldError(ticketForm.description, 'Description too long'); return; }

        try {
          if (id) {
            updateTicket(id, { title, status, description });
            showToast('Ticket updated', 'success');
          } else {
            createTicket({ title, status, description });
            showToast('Ticket created', 'success');
            ticketForm.reset();
          }
          // refresh list if present
          renderTicketsList();
        } catch (err) {
          console.error(err);
          showToast('Failed to save ticket. Please retry.', 'error');
        }
      });
    }

    // If on tickets page, render list
    if (document.querySelector('#ticketsContainer')) {
      renderTicketsList();
    }

    // On dashboard page, update stats
    if (document.querySelector('#dashboardStats')) {
      renderDashboardStats();
    }

  }); // DOMContentLoaded

  // --- Dashboard stats renderer ---
  function renderDashboardStats() {
    const node = document.querySelector('#dashboardStats');
    if (!node) return;
    const tickets = readTickets();
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const resolved = tickets.filter(t => t.status === 'closed').length;
    node.innerHTML = `
      <div class="card" style="display:inline-block;margin-right:12px;">
        <div style="color:#6b7280;">Total tickets</div>
        <div style="font-size:1.6rem;font-weight:700;">${total}</div>
      </div>
      <div class="card" style="display:inline-block;margin-right:12px;">
        <div style="color:#6b7280;">Open tickets</div>
        <div style="font-size:1.6rem;font-weight:700;color:var(--color-open);">${open}</div>
      </div>
      <div class="card" style="display:inline-block;">
        <div style="color:#6b7280;">Resolved tickets</div>
        <div style="font-size:1.6rem;font-weight:700;color:#9ca3af;">${resolved}</div>
      </div>
    `;
  }

  // Expose small debug API (optional)
  window.ticketapp = {
    getSession, setSession, clearSession,
    readTickets, saveTickets, createTicket, updateTicket, deleteTicket,
    showToast
  };

})();

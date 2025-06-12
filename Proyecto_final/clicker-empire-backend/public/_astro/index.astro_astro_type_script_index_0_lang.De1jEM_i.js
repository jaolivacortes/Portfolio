const k = new URLSearchParams(window.location.search);
let n = Number(k.get("page")) || 1, m = 1, u = [];

async function l(e = 1) {
    try {
        const o = await fetch(`${config.apiUrl}/api/forum/comments?category_id=2&page=${e}`, {
            credentials: "include",
            headers: {Accept: "application/json"}
        });
        if (!o.ok) throw new Error("Error al cargar los comentarios");
        const t = await o.json();
        u = t.data.data || [], m = t.data.last_page || 1, n = t.data.current_page || 1;
        const s = document.getElementById("commentsList");
        s && (s.innerHTML = u.length === 0 ? "<p>No hay comentarios en esta página</p>" : u.map(c => `
                <div class="forum-section__comment">
                  <div class="forum-section__comment-header">
                    <span class="forum-section__username">${c.user_name}</span>
                    <div class="forum-section__comment-meta">
                      <span class="forum-section__delete-btn-container"></span>
                      <span class="forum-section__date">${new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p class="forum-section__content">${c.content}</p>
                </div>
              `).join(""));
        const i = document.querySelector(".forum-section__current-page");
        i && (i.textContent = e.toString()), window.history.pushState({}, "", `/forum/seccion2?page=${e}`), L();
        const r = document.querySelector(".forum-section__page-link.prev"),
            a = document.querySelector(".forum-section__page-link.next");
        r && (r.style.opacity = n > 1 ? "1" : "0.5", r.style.pointerEvents = n > 1 ? "auto" : "none"), a && (a.style.opacity = n < m ? "1" : "0.5", a.style.pointerEvents = n < m ? "auto" : "none")
    } catch (o) {
        console.error("Error:", o);
        const t = document.getElementById("commentsList");
        t && (t.innerHTML = "<p>Error al cargar los comentarios</p>")
    }
}

function w() {
    n > 1 && (n--, l(n))
}

function b() {
    n < m && (n++, l(n))
}

const g = document.querySelector(".forum-section__page-link.prev"),
    y = document.querySelector(".forum-section__page-link.next");
g && g.addEventListener("click", e => {
    e.preventDefault(), w()
});
y && y.addEventListener("click", e => {
    e.preventDefault(), b()
});
l(n);
const _ = document.getElementById("commentForm"), h = document.querySelector('textarea[name="commentContent"]'),
    E = document.querySelector(".forum-section__char-count");
h && E && h.addEventListener("input", e => {
    const t = e.target.value.length;
    E.textContent = `${t}/500 caracteres`
});
_ && _.addEventListener("submit", async e => {
    if (e.preventDefault(), !localStorage.getItem("user_session")) {
        alert("Debes iniciar sesión para publicar un comentario");
        return
    }
    const t = await S();
    if (!t) {
        alert("Error al obtener el token de seguridad. Por favor, recarga la página.");
        return
    }
    const s = e.target, i = s.elements.namedItem("commentContent");
    try {
        if (!(await fetch(`${config.apiUrl}/api/forum/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-CSRF-TOKEN": t,
                "X-Requested-With": "XMLHttpRequest"
            },
            credentials: "include",
            body: JSON.stringify({content: i.value, category_id: 2})
        })).ok) throw new Error("Error al publicar el comentario");
        s.reset(), l(1)
    } catch (r) {
        console.error("Error:", r), alert("Error al publicar el comentario")
    }
});

async function S() {
    try {
        const e = await fetch(`${config.apiUrl}/api/csrf-token`, {
            method: "GET",
            credentials: "include",
            headers: {Accept: "application/json", "Content-Type": "application/json"}
        });
        if (!e.ok) throw new Error("Error al obtener el token CSRF");
        return (await e.json()).csrf_token
    } catch (e) {
        return console.error("Error al obtener el token CSRF:", e), null
    }
}

function L() {
    const e = localStorage.getItem("user_session");
    let o = !1;
    if (e) try {
        const t = JSON.parse(e);
        o = t.user && t.user.role === "admin"
    } catch (t) {
        console.error("Error parsing user session:", t)
    }
    o && document.querySelectorAll(".forum-section__comment").forEach((t, s) => {
        const i = u[s];
        if (!i) return;
        const r = t.querySelector(".forum-section__delete-btn-container");
        if (!r) return;
        r.innerHTML = "";
        const a = document.createElement("button");
        a.innerHTML = '<span class="forum-section__delete-btn-text">Eliminar comentario</span>🗑️', a.className = "forum-section__delete-btn", a.onclick = () => {
            const c = document.getElementById("deleteModal"), d = document.getElementById("closeDeleteModal"),
                p = document.getElementById("cancelDelete"), f = document.getElementById("confirmDelete");
            c && d && p && f && (c.style.display = "flex", f.onclick = async () => {
                const v = await S();
                (await fetch(`${config.apiUrl}/api/admin/forum/comments/${i.id}`, {
                    method: "DELETE",
                    headers: {"X-CSRF-TOKEN": v, Accept: "application/json", "X-Requested-With": "XMLHttpRequest"},
                    credentials: "include"
                })).ok ? (c.style.display = "none", l(n)) : alert("Error al borrar el comentario")
            }, d.onclick = () => {
                c.style.display = "none"
            }, p.onclick = () => {
                c.style.display = "none"
            })
        }, r.appendChild(a)
    })
}

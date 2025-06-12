const I = document.getElementById("resetButton");
if (I) {
    const e = document.getElementById("confirmationModal"), o = document.getElementById("closeModal"),
        n = document.getElementById("cancelModal"), t = document.getElementById("confirmReset");
    I.addEventListener("click", () => {
        e && (e.style.display = "flex")
    }), o && o.addEventListener("click", () => {
        e && (e.style.display = "none")
    }), n && n.addEventListener("click", () => {
        e && (e.style.display = "none")
    }), t && t.addEventListener("click", async () => {
        try {
            const r = await B();
            if (!r) {
                alert("Error al obtener el token de seguridad. Por favor, recarga la página.");
                return
            }
            const l = await fetch(`${config.apiUrl}/api/profile/reset-progress`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": r,
                    "X-Requested-With": "XMLHttpRequest"
                },
                body: JSON.stringify({
                    olives_count: 0,
                    olives_count_total: 0,
                    olives_count_clicked: 0,
                    products_owned: {},
                    upgrades_owned: {},
                    achievements_count: 0,
                    achievements_obtained: {}
                }),
                credentials: "include"
            });
            if (!l.ok) {
                const s = (await l.json()).message || "Error al reiniciar el progreso";
                alert(s);
                return
            }
            if ((await l.json()).success) {
                alert("Progreso reiniciado correctamente");
                const c = localStorage.getItem("user_session");
                if (c) {
                    const s = JSON.parse(c);
                    s.user.player = {
                        ...s.user.player,
                        olives_count: 0,
                        olives_count_total: 0,
                        olives_count_clicked: 0,
                        products_owned: "{}",
                        upgrades_owned: "{}",
                        achievements_count: 0,
                        achievements_obtained: "{}"
                    }, localStorage.setItem("user_session", JSON.stringify(s))
                }
                v()
            }
            e && (e.style.display = "none")
        } catch (r) {
            console.error("Error:", r), alert("Error al conectar con el servidor")
        }
    })
}

async function B() {
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

function v() {
    const e = localStorage.getItem("user_session");
    if (!e) {
        window.location.href = "/auth/login";
        return
    }
    const o = JSON.parse(e), n = o.user, t = o.user.player, r = document.getElementById("userName"),
        d = document.getElementById("userEmail"), l = document.getElementById("userUsername"),
        a = document.getElementById("storeNameInput"), c = document.getElementById("editName"),
        s = document.getElementById("editEmail");
    document.getElementById("oliveCount");
    const m = document.getElementById("oliveCountTotal"), u = document.getElementById("oliveCountClicked"),
        i = document.getElementById("productCount"), p = document.getElementById("upgradeCount"),
        E = document.getElementById("achievementCount");
    if (r && d && l && a && c && s) {
        if (r.textContent = n.name || "-", d.textContent = n.email || "-", l.textContent = t?.user_name || "-", u.textContent = C(t?.olives_count_clicked) || "0", m.textContent = C(t?.olives_count_total) || "0", t?.products_owned) try {
            const w = JSON.parse(t.products_owned),
                S = Object.values(w).reduce((_, y) => y && typeof y == "object" && "count" in y ? _ + y.count : _, 0);
            i.textContent = S.toString()
        } catch (w) {
            console.error("Error al parsear los productos: ", w), i.textContent = "0"
        } else i.textContent = "0";
        let f = t?.upgrades_owned ? JSON.parse(t.upgrades_owned) : {};
        p.textContent = Object.values(f).length.toString(), E.textContent = t?.achievements_count || "0";
        let g = t?.store_name || "";
        g.startsWith("La finca de ") && (g = g.substring(12)), a.value = g, a.placeholder = g || "Nombre de la finca", c.value = n.name || "", s.value = n.email || ""
    }
}

async function h(e) {
    const n = new TextEncoder().encode(e), t = await crypto.subtle.digest("SHA-256", n),
        d = Array.from(new Uint8Array(t)).map(a => a.toString(16).padStart(2, "0")).join("");
    return btoa(d)
}

document.getElementById("editProfileForm")?.addEventListener("submit", async e => {
    e.preventDefault();
    const o = document.getElementById("editName").value, n = document.getElementById("editEmail").value,
        t = document.getElementById("currentPassword").value, r = document.getElementById("newPassword").value,
        d = document.getElementById("confirmPassword").value, l = document.getElementById("storeNameInput").value;
    if (o.length > 20) {
        alert("El nombre no puede tener más de 20 caracteres");
        return
    }
    if (r && r !== d) {
        alert("Las nuevas contraseñas no coinciden");
        return
    }
    try {
        const a = await B();
        if (!a) {
            alert("Error al obtener el token de seguridad. Por favor, recarga la página.");
            return
        }
        const c = {name: o, email: n, store_name: l};
        t && (c.current_password = await h(t)), r && (c.new_password = await h(r), c.new_password_confirmation = await h(d));
        const s = await fetch(`${config.apiUrl}/api/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-CSRF-TOKEN": a,
                "X-Requested-With": "XMLHttpRequest"
            },
            body: JSON.stringify(c),
            credentials: "include"
        });
        if (!s.ok) {
            const u = await s.json(), i = u.message || "Error al actualizar el perfil";
            if (u.errors) {
                const p = Object.values(u.errors).flat().join(`
`);
                alert(`${i}
${p}`)
            } else alert(i);
            return
        }
        const m = await s.json();
        if (m.success) {
            alert("Perfil actualizado correctamente");
            const u = localStorage.getItem("user_session");
            if (u) {
                const f = JSON.parse(u);
                f.user = {
                    ...f.user,
                    name: m.user.name,
                    email: m.user.email,
                    player: m.user.player
                }, localStorage.setItem("user_session", JSON.stringify(f))
            }
            v();
            const i = document.getElementById("currentPassword"), p = document.getElementById("newPassword"),
                E = document.getElementById("confirmPassword");
            i && p && E && (i.value = "", p.value = "", E.value = "")
        }
    } catch (a) {
        console.error("Error:", a), alert("Error al conectar con el servidor")
    }
});
typeof window < "u" && v();

function C(e) {
    if (e < 1e6) return e.toLocaleString("en");
    const o = ["", "million", "billion", "trillion", "quadrillion", "quintillion", "sextillion", "septillion", "octillion", "nonillion", "decillion"];
    let n = -1;
    for (; e >= 1e3;) if (e /= 1e3, n++, n >= o.length) return "∞";
    return `${parseFloat(e.toFixed(3)).toString()} ${o[n]}`
}

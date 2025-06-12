// Olives
let olives = JSON.parse(localStorage.getItem('user_session')).user.player.olives_count;
let olives_total = JSON.parse(localStorage.getItem('user_session')).user.player.olives_count_total;
let olives_clicked = JSON.parse(localStorage.getItem('user_session')).user.player.olives_count_clicked;

// Guardar cantidad de productos
let productions = []

class Click {
    #click = 1
    #bonusPercent = 0

    get click() {
        return this.#click
    }
    set click(value) {
        this.#click = value
    }

    get bonusPercent() {
        return this.#bonusPercent
    }
    set bonusPercent(value) {
        this.#bonusPercent = value
    }

    increaseClick(multiplier) {
        // Método para aumentar clics de forma temporal mediante multiplicador
        this.#click *= multiplier
    }
}

class Production {
    #olivesPerSecondBase = 0
    #bonusPercent = 0

    get olivesPerSecondBase() {
        return this.#olivesPerSecondBase
    }
    set olivesPerSecondBase(value) {
        this.#olivesPerSecondBase = value
    }

    get olivesPerSecond() {
        return this.#olivesPerSecondBase * (1 + this.#bonusPercent / 100)
    }

    get bonusPercent() {
        return this.#bonusPercent
    }
    set bonusPercent(value) {
        this.#bonusPercent = value
    }

    increaseOlivesPerSecond(multiplier) {
        // Método para aumentar olivesPerSecond de forma temporal mediante multiplicador
        this.#olivesPerSecondBase *= multiplier
    }
}

const click = new Click()
const production = new Production()

const oils = JSON.parse(localStorage.getItem("game")).oils;
const quotes = JSON.parse(localStorage.getItem("game")).quotes;
const achievements = JSON.parse(localStorage.getItem("game")).achievements;
const products = JSON.parse(localStorage.getItem("game")).products;
const upgrades = JSON.parse(localStorage.getItem("game")).upgrades;

const store_name = JSON.parse(localStorage.getItem("user_session")).user.player.store_name;

// Listeners click
const bigOlive = document.getElementById("bigOlive");

bigOlive.addEventListener("mousedown", () => {
  bigOlive.classList.add("held");
});

bigOlive.addEventListener("mouseup", () => {
  bigOlive.classList.remove("held");
});

bigOlive.addEventListener("mouseleave", () => {
  bigOlive.classList.remove("held");
});

const clickDownSound = new Audio("/audio/click-down.mp3");
clickDownSound.volume = 0.05;
const clickUpSound = new Audio("/audio/click-up.mp3");
clickUpSound.volume = 0.05;

let clickTimeout, lastClickTime = 0, isHeld = false;

const buyProductSound = new Audio("/audio/buy-product.mp3");
buyProductSound.volume = 0.05;
const buyUpgradeSound = new Audio("/audio/buy-upgrade.mp3");
buyUpgradeSound.volume = 0.05;

const clickSaveSound = new Audio("/audio/click-save.mp3");
clickSaveSound.volume = 0.05;
////////////////////////////////////////////////////////////////////////////////////////////////////////

$(function () {
    // Cargar nombre store
    $('#empireName').text(store_name)
    oilsControl()

    // Cargar mejoras
    upgrades.sort((a, b) => a.price - b.price)
    upgrades.forEach(upgrade => {
        addUpgrade(upgrade.id, upgrade.name, upgrade.image, upgrade.price, upgrade.description, upgrade.idForProduct)
    })

    // Cargar productos
    products.forEach(product => {
        addProduct(product.id, product.name, product.image, product.price, product.description, product.bonus)
    })

    // Cargar datos guardados
    loadSavedGameData();

    // Olivas por segundo
    startCountOlives()
    updateOlives()
    updateOlivesPerSecond()

    // Manejador para el botón de guardado manual
    $('#manualSaveBtn').on('click', async function() {
        // Deshabilitar el botón para evitar más clicks
        $(this).prop('disabled', true)

        // Esperar a que termine saveGameData asincrono
        await saveGameData()

        // Habilitar el botón otra vez
        $(this).prop('disabled', false)
    })

    // Controlar sonido click guardado
    $('#manualSaveBtn').on('mousedown', function() {
        clickSaveSound.pause();
        clickSaveSound.currentTime = 0;
        clickSaveSound.play();
    });

    // Funcionamiento mejoras
    $(document).on('click', ".upgrade", function () {
        let idUpgrade = $(this).attr("id")
        let upgrade = upgrades.find(u => u.id == idUpgrade)
        let product = products.find(p => p.id == upgrade.idForProduct)

        if (olives >= upgrade.price) {
            olives -= upgrade.price
            // Sonido al comprar mejora
            buyUpgradeSound.pause()
            buyUpgradeSound.currentTime = 0
            buyUpgradeSound.play()

            // Lógica según el tipo de mejora
            switch (upgrade.type) {
                case 'clickDuplicate':
                    // Aumentar los clics al doble
                    click.click *= upgrade.bonus
                    break
                case 'clickPercent':
                    // Aumentar los clics al porcentaje de olivas por segundo
                    click.bonusPercent += upgrade.bonus
                    break
                case 'production':
                    // Aumenta la producción al doble
                    let ownedCount = parseInt($(`#productOwned${product.id}`).text())
                    let previousBonus = product.bonus

                    // Aplicar bonus
                    product.bonus *= upgrade.bonus

                    // Sumar la diferencia al total de olivesPerSecond
                    let difference = ownedCount * (product.bonus - previousBonus)
                    production.olivesPerSecondBase += difference

                    let bonusTotal = ownedCount * product.bonus
                    $(`#liOne${product.id}`).html(`cada ${product.name.toLowerCase()} produce <b>${formatNumber(product.bonus)} olivas</b> por segundo`)
                    $(`#liTwo${product.id}`).html(`${ownedCount} produciendo <b>${formatNumber(bonusTotal)} olivas</b> por segundo`)
                    break
                case 'opsPercent':
                    // Aumentar las olivas por segundo al procentaje indicado
                    production.bonusPercent += upgrade.bonus
                    break
            }
            updateOlivesPerSecond()
            $(this).addClass("hidden")

            // Guardar después de comprar una mejora
            // saveGameData();
            achievementsControl()
        }
    })

    // Funcionamiento producto
    $(document).on('click', ".product", function () {
        let idProduct = $(this).attr("id")
        let product = products.find(p => p.id == idProduct)

        if (olives >= product.price) {
            olives -= product.price
            // Sonido al comprar producto
            buyProductSound.pause()
            buyProductSound.currentTime = 0
            buyProductSound.play()

            // Aumentar contador de productos
            let productOwned = $(`#productOwned${idProduct}`)
            let productOwnedCard = $(`#productOwnedCard${idProduct}`)
            let ownedCount = parseInt(productOwned.text()) + 1
            productOwned.text(ownedCount)
            productOwnedCard.text(ownedCount)

            // Aumentar coste del producto
            let productPrice = $(`#productPrice${idProduct}`)
            let productPriceCard = $(`#productPriceCard${idProduct}`)
            product.price = product.price * 1.15
            let productPriceUp = parseInt(product.price)
            productPrice.text(formatNumber(productPriceUp))
            productPriceCard.text(formatNumber(productPriceUp))

            // Aplicar bonus
            production.olivesPerSecondBase += product.bonus

            // Tarjetas hover
            $(`#liOne${idProduct}`).html(`cada ${product.name.toLowerCase()} produce <b>${formatNumber(product.bonus)} olivas</b> por segundo`)
            let bonusTotal = ownedCount * product.bonus
            $(`#liTwo${idProduct}`).html(`${ownedCount} produciendo <b>${formatNumber(bonusTotal)} olivas</b> por segundo`)

            // Inicializar o actualizar producciones
            if (!productions[idProduct]) {
                const userSession = JSON.parse(localStorage.getItem('user_session'));
                const productsOwned = userSession?.user?.player?.products_owned ? JSON.parse(userSession.user.player.products_owned) : {};
                const savedData = productsOwned[idProduct] || { total: 0 };

                productions[idProduct] = {
                    total: savedData.total,  // Total producido (inicialmente 0)
                    ownedCount: ownedCount,  // Número de unidades de este producto
                    interval: setInterval(function () {
                        // Actualizar la producción cada segundo
                        productions[idProduct].total += productions[idProduct].ownedCount * product.bonus
                        $(`#liThree${idProduct}`).html(`producción hasta ahora: <b>${formatNumber(productions[idProduct].total)} olivas</b>`)
                    }, 1000)
                }
            } else {
                // Si ya existe, actualizar el número de productos comprados
                productions[idProduct].ownedCount = ownedCount}
            // Guardar después de comprar un producto
            // saveGameData();
            achievementsControl()
        }
        updateOlivesPerSecond()
        updatePriceColors()
    })

    // Click para sumar manualmente
    $(document).on('click', "#bigOlive", function (e) {
        let singleClick = (click.click) + (production.olivesPerSecond * (click.bonusPercent / 100))
        olives += singleClick
        olives_total += singleClick
        olives_clicked += singleClick

        updateOlives()
        animateClickBonus(singleClick, e.pageX, e.pageY);
        achievementsControl()
    })

    // Controlar sonido click
    const bigOlive = document.getElementById("bigOlive")

    bigOlive.addEventListener("mousedown", () => {
    const now = Date.now()
    if (now - lastClickTime > 100) {
        clickDownSound.currentTime = 0
        clickDownSound.play()
    }
    lastClickTime = now

    isHeld = true
    bigOlive.classList.add("held")

    if (clickTimeout) clearTimeout(clickTimeout);
    })

    bigOlive.addEventListener("mouseup", () => {
    isHeld = false

    clearTimeout(clickTimeout)
    clickTimeout = setTimeout(() => {
        if (!isHeld) {
        bigOlive.classList.remove("held")
        clickUpSound.currentTime = 0
        clickUpSound.play()
        }
        clickTimeout = null
    }, 50)
    })

    // Funcionamiento tarjetas hover de mejoras
    $("#upgrades").on("mouseenter", ".upgrade", function () {
        let card = $(this).next(".card")

        if (card.length) {
            // Posición relativa a la ventana (viewport)
            let rect = this.getBoundingClientRect()

            card.css({
                display: "block",
                position: "fixed", // Se mantiene en viewport
                top: rect.top + "px", // Ya es relativo al viewport
                left: rect.left - card.outerWidth() - 10 + "px",
                zIndex: 999
            })
        }
        $(this).on("mouseleave", function () {
            $(document).off("mousemove")
            card.css({
                display: "none"
            })
        })
    })

    // Funcionamiento tarjetas hover de producto
    $("#products").on("mouseenter", ".product", function () {
        let card = $(this).next(".card")
        let productPos = $(this).offset()
        card.css({
            top: productPos.top + "px",
            left: productPos.left - card.outerWidth() - 10 + "px"
        })
        $(document).on("mousemove", function (e) {
            card.css({
                top: e.pageY + "px",
                left: productPos.left - card.outerWidth() - 10 + "px"
            })
        })
        $(this).on("mouseleave", function () {
            $(document).off("mousemove")
            card.css({
                display: "none"
            })
        })
        card.css({
            display: "block",
            position: "absolute"
        })
    })
    updatePriceColors();
})

////////////////////////////////////////////////////////////////////////////////////////////////////////

// FUNCIONES //
// Renderizar mejoras al cargar la página
function addUpgrade(id, name, image, price, description) {
    let div =
        `<div class="upgrade" id="${id}">
            <img src="/img/${image}" alt="${name}" class="icon" id="upgradeIcon${id}"/>
        </div>

        <div class="card hidden">
            <div class="cardBloq">
                <div class="cardProp">
                    <img src="/img/${image}" alt="${name}" class="icon" id="upgradeIconCard${id}"/>
                    <div class="info">
                        <div class="title upgradeName" id="upgradeNameCard${id}">${name}</div>
                        <div class="upgradeIcon">Mejora</div>
                    </div>
                </div>
                <div class="price" id="upgradePriceCard${id}">${formatNumber(price)}</div>
            </div>
            <div class="title upgradeDescription" id="upgradeDescriptionCard${id}">${description}</div>
        </div>`


    $("#upgrades").append(div)
}

// Renderizar productos al cargar la página
function addProduct(id, name, image, price, description, bonus) {
    let div =
        `<div class="product" id="${id}">
            <img src="/img/${image}" alt="${name}" class="icon" id="productIcon${id}"/>
            <div class="content">
                <div class="title productName" id="productName${id}">${name}</div>
                <div class="priceInfo">
                    <span class="priceImage" id="productImagePrice${id}"></span>
                    <span class="price" id="productPrice${id}">${formatNumber(price)}</span>
                </div>
            </div>
            <div class="title owned" id="productOwned${id}">0</div>
        </div>

        <div class="card hidden">
        <div class="cardBloq">
            <div class="cardProp">
                <img src="/img/${image}" alt="${name}" class="icon" id="productIconCard${id}"/>
                <div class="info">
                    <div class="title productName" id="productNameCard${id}">${name}</div>
                    <div class="title owned" id="productOwnedCard${id}">0</div>
                </div>
            </div>
            <span class="price" id="productPriceCard${id}">${formatNumber(price)}</span>
        </div>
        <div class="descripcion" id="productDescriptionCard${id}">${description}</div>
        <div class="infos">
            <ul class="coste__ul">
                <li id="liOne${id}">cada ${name.toLowerCase()} produce <b>${formatNumber(bonus)} olivas</b> por segundo</li>
                <li id="liTwo${id}">0 produciendo <b>0 olivas</b> por segundo</li>
                <li id="liThree${id}">producción hasta ahora: <b>0 olivas</b></li>
            </ul>
        </div>`


    $("#products").append(div)
}

// Formatear olivas
function formatNumber(olives) {
    if (olives < 1_000_000) {
        return olives.toLocaleString("en") // Formato con separador de miles
    }

    const units = ["", "million", "billion", "trillion", "quadrillion", "quintillion",
        "sextillion", "septillion", "octillion", "nonillion", "decillion"]
    let index = -1

    while (olives >= 1_000) {
        olives /= 1_000
        index++

        if (index >= units.length) {
            return "∞"
        }
    }

    // Eliminar ceros innecesarios pero mantener hasta 3 decimales útiles
    const formatted = parseFloat(olives.toFixed(3)).toString()

    return `${formatted} ${units[index]}`
}


// Función para actualizar el color del precio según las olivas disponibles
function updatePriceColors() {
    products.forEach(product => {
        const priceElement = $(`#productPrice${product.id}`)
        const priceElementCard = $(`#productPriceCard${product.id}`)
        if (olives >= product.price) {
            priceElement.css('color', '#27ae60') // Verde
            priceElementCard.css('color', '#27ae60')
        } else {
            priceElement.css('color', '#e74c3c') // Rojo
            priceElementCard.css('color', '#e74c3c')
        }
    })
    upgrades.forEach(upgrade => {
        const priceElement = $(`#upgradePrice${upgrade.id}`)
        const priceElementCard = $(`#upgradePriceCard${upgrade.id}`)
        const upgradeDiv = $(`#${upgrade.id}`) // div upgrade con id igual a upgrade.id

        if (olives >= upgrade.price) {
            priceElement.css('color', '#27ae60') // Verde
            priceElementCard.css('color', '#27ae60')
            upgradeDiv.css({
                'opacity': '1',
                'box-shadow': 'none',
            })
        } else {
            priceElement.css('color', '#e74c3c') // Rojo
            priceElementCard.css('color', '#e74c3c')
            upgradeDiv.css({
                'opacity': '0.6',
                'box-shadow': 'inset 0 0 15px 5px rgba(0,0,0,0.4)',
            })
        }
    })
}

// Funcion para actualizar olivas
function updateOlives() {
    $("#sectionLeftInfo #olives").text(formatNumber(Math.floor(olives)) + " olivas")
    updatePriceColors()
    quotesControl()
}

// Función para obtener el token CSRF
async function getCsrfToken() {
    try {
        const response = await fetch(`${config.apiUrl}/api/csrf-token`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener el token CSRF');
        }

        const data = await response.json();
        return data.csrf_token;
    } catch (error) {
        console.error('Error al obtener el token CSRF:', error);
        return null;
    }
}

// Función para mostrar mensaje de guardado
function showSaveMessage(message) {
    // Crear el elemento del mensaje con clases de Bootstrap
    const messageElement = $('<div class="alert alert-success" style="position: absolute; z-index: 9999; background-color: rgba(25, 135, 84, 0.9); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 24px; padding: 0 1.5rem; box-shadow: 0 2px 5px rgba(0,0,0,0.2); top: 0; left: 50%; transform: translateX(-50%);" role="alert">' + message + '</div>');

    // Añadir el mensaje al contenedor específico
    $('#saveMessageContainer').append(messageElement);

    // Mostrar el mensaje
    messageElement.fadeIn(200);

    // Ocultar y eliminar el mensaje después de 1 segundo
    setTimeout(() => {
        messageElement.fadeOut(200, function() {
            $(this).remove();
        });
    }, 1000);
}

// Función para guardar datos del juego
async function saveGameData(isAutoSave = false) {
    try {
        // Obtener el token CSRF
        const csrfToken = await getCsrfToken();

        if (!csrfToken) {
            console.error('Error al obtener el token de seguridad');
            showSaveMessage('Error al guardar');
            return;
        }

        // Preparar arrays de productos y mejoras compradas
        const productsOwned = {};
        const upgradesOwned = {};

        // Recopilar datos de productos comprados
        products.forEach(product => {
            const ownedCount = parseInt($(`#productOwned${product.id}`).text());
            if (ownedCount > 0) {
                productsOwned[product.id] = {
                    count: ownedCount,
                    price: parseInt(product.price),
                    total: productions[product.id] ? productions[product.id].total : 0
                };
            }
        });

        // Recopilar datos de mejoras compradas
        upgrades.forEach(upgrade => {
            const upgradeElement = $(`#${upgrade.id}`);
            if (upgradeElement.hasClass('hidden')) {
                upgradesOwned[upgrade.id] = true;
            }
        });

        const userSession = JSON.parse(localStorage.getItem('user_session'));
        if (!userSession) {
            console.error('No user session found');
            return;
        }

        const achievements_count = userSession.user.player.achievements_count || 0;
        const achievements_obtained = userSession.user.player.achievements_obtained || "{}";

        const response = await fetch(`${config.apiUrl}/api/game/olives`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                olives_count: Math.floor(olives),
                olives_count_total: Math.floor(olives_total),
                olives_count_clicked: Math.floor(olives_clicked),
                products_owned: JSON.stringify(productsOwned),
                upgrades_owned: JSON.stringify(upgradesOwned),
                achievements_count: Math.floor(achievements_count),
                achievements_obtained: achievements_obtained
            }),
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error saving game data:', data.message || 'Unknown error');
            showSaveMessage('Error al guardar');
            return;
        }

        if (data.success) {
            console.log('Game data saved successfully');
            // Update localStorage with new data
            const userSession = localStorage.getItem('user_session');
            if (userSession) {
                const session = JSON.parse(userSession);
                session.user.player.olives_count = data.olives_count;
                session.user.player.olives_count_total = data.olives_count_total;
                session.user.player.olives_count_clicked = data.olives_count_clicked;
                session.user.player.products_owned = data.products_owned;
                session.user.player.upgrades_owned = data.upgrades_owned;
                session.user.player.achievements_obtained = data.achievements_obtained;
                session.user.player.achievements_count = data.achievements_count;
                localStorage.setItem('user_session', JSON.stringify(session));
            }
            showSaveMessage('Guardado correctamente');
        } else {
            console.error('Failed to save game data:', data.message);
            showSaveMessage('Error al guardar');
        }
    } catch (error) {
        console.error('Error saving game data:', error);
        showSaveMessage('Error al guardar');
    }
}

// Funcion para mostrar olivas por segundo de forma fluida
function startCountOlives() {
    let lastUpdate = Date.now() // Guarda el momento de la última actualización
    let lastSave = Date.now() // Guarda el momento del último guardado
    let lastAchievementCheck = Date.now(); // Guarda el momento desde la última comprobación de logros

    // Funcion de actualización continua
    function updateOlivesInTime() {
        let now = Date.now() // Obtiene el momento actual
        let deltaTime = (now - lastUpdate) / 1000 // Tiempo transcurrido en segundos
        lastUpdate = now // Actualiza el tiempo de referencia

        // Sumar olivas según el tiempo transcurrido y la tasa de producción
        olives += production.olivesPerSecond * deltaTime
        olives_total += production.olivesPerSecond * deltaTime

        // Actualizar la interfaz con la cantidad de olivas
        updateOlives()
        updatePriceColors()

        // Verificar logros cada 30 segundos
        if (now - lastAchievementCheck >= 30000) {
            achievementsControl();
            lastAchievementCheck = now;
        }

        // Guardar en el servidor cada 60 segundos
        if (now - lastSave >= 60000) { // 60000 ms = 60 segundos
            saveGameData(true); // Llamar a saveGameData con isAutoSave = true
            lastSave = now;
        }

        // Llamar a la función en el próximo frame
        requestAnimationFrame(updateOlivesInTime)
    }
    // Iniciar el contador
    requestAnimationFrame(updateOlivesInTime)
}

// Funcion para actualizar olivas por segundo
function updateOlivesPerSecond() {
    $("#sectionLeftInfo #olivesPerSecond").text("por segundo: " + formatNumber(parseFloat(production.olivesPerSecond.toFixed(1))))
}

// Funcion para evaluar logros
function achievementsControl() {
    const userSession = JSON.parse(localStorage.getItem('user_session'));
    if (!userSession) {
        console.log('No user session found');
        return;
    }

    // Inicializar achievements_obtained si no existe
    if (!userSession.user.player.achievements_obtained) {
        userSession.user.player.achievements_obtained = "{}";
        userSession.user.player.achievements_count = 0;
        localStorage.setItem('user_session', JSON.stringify(userSession));
    }

    let achievements_obtained = JSON.parse(userSession.user.player.achievements_obtained);
    let achievements_count = userSession.user.player.achievements_count || 0;
    let hasNewAchievement = false;


    achievements.forEach(achievement => {
        // Solo procesar logros que no se hayan obtenido antes
        if (!achievements_obtained[achievement.id]) {
            let shouldAward = false;

            switch (achievement.type) {
                case 'harvest':
                    shouldAward = olives_total >= achievement.value;
                    break;
                case 'harvestPerSecond':
                    shouldAward = production.olivesPerSecond >= achievement.value;
                    break;
                case 'harvestClick':
                    shouldAward = olives_clicked >= achievement.value;
                    break;
                case 'productionAmount':
                    if (achievement.idForProduct) {
                        const ownedCount = parseInt($(`#productOwned${achievement.idForProduct}`).text()) || 0;
                        shouldAward = ownedCount >= achievement.value;
                    }
                    break;
                case 'unique':
                    const otherAchievements = achievements.filter(a => a.id !== achievement.id);
                    shouldAward = otherAchievements.every(a => achievements_obtained[a.id]);
                    break;
            }

            if (shouldAward) {
                achievements_obtained[achievement.id] = true;
                achievements_count++;
                hasNewAchievement = true;
                showAchievementNotification(achievement);
            }
        }
    });

    if (hasNewAchievement) {
        // Actualizar el localStorage
        userSession.user.player.achievements_obtained = JSON.stringify(achievements_obtained);
        userSession.user.player.achievements_count = achievements_count;
        localStorage.setItem('user_session', JSON.stringify(userSession));
        oilsControl()

        // Guardar en el servidor
        saveGameData();
    }
}

function showAchievementNotification(achievement) {
    const container = document.getElementById('achievementContainer');
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon">🏆</div>
        <div class="achievement-content">
            <h3>${achievement.name}</h3>
            <p>${achievement.description}</p>
        </div>
        <button class="achievement-close">&times;</button>
    `;


    // Añadir la notificación al contenedor
    container.appendChild(notification);


    // Mostrar la notificación con animación
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });


    // Configurar el botón de cierre
    const closeButton = notification.querySelector('.achievement-close');
    closeButton.addEventListener('click', () => {
        notification.classList.add('hide');
        setTimeout(() => {
            if (container.contains(notification)) {
                container.removeChild(notification);
            }
        }, 300);
    });


    // Cerrar automáticamente después de 30 segundos
    setTimeout(() => {
        if (container.contains(notification)) {
            notification.classList.add('hide');
            setTimeout(() => {
                if (container.contains(notification)) {
                    container.removeChild(notification);
                }
            }, 300);
        }
    }, 10000);
}

// Funcion para poner oils
function oilsControl() {
    const userSession = JSON.parse(localStorage.getItem('user_session'));
    const count = userSession?.user?.player?.achievements_count || 0;

    const match = [...oils]
        .filter(o => o.achievements_required <= count)
        .sort((a, b) => b.achievements_required - a.achievements_required)[0];

    if (match) {
        const img = document.getElementById('oilContainer');
        const newSrc = `/img/${match.image}`;

        // Solo cambiar si es diferente para evitar parpadeo
        if (!img.src.endsWith(newSrc)) {
            img.src = newSrc;
        }
    }
}

// Funcion para poner quotes
function quotesControl() {
    quotes.forEach(q => {
        if (q.olives_count <= olives_total) {
            $('#quotesContainer').html(q.quote)
        }
    })
}

// Animación clicar
function animateClickBonus(amount, x, y) {
    // Crear un nuevo elemento para mostrar el número de olivas ganadas
    let bonusElement = $('<div class="click-bonus-anim">+' + formatNumber(amount.toFixed(2)) + ' Olivas</div>')

    // Añadir el elemento a la pantalla (al contenedor)
    $('#clickBonusDisplayContainer').append(bonusElement)

    // Establecer la posición inicial del número en el lugar del clic
    bonusElement.css({
        'position': 'absolute',
        'left': x,
        'top': y,
        'font-size': '16px',
        'color': 'gold',
        'z-index': '9999',
        'opacity': 1,
        'transform': 'translate(-50%, -50%)'  // Para centrar el texto respecto al clic
    })

    // Animación: mover el número hacia arriba y desvanecerse
    bonusElement.animate({
        top: y - 50,  // Moverse hacia arriba
        opacity: 0
    }, 1000, function () {
        // Eliminar el número después de que termine la animación
        $(this).remove()
    })
}


// Función para cargar datos guardados
function loadSavedGameData() {
    const userSession = localStorage.getItem('user_session');
    if (!userSession) return;

    const session = JSON.parse(userSession);
    const player = session.user.player;

    // Resetear la producción base antes de cargar
    production.olivesPerSecondBase = 0;

    // Primero cargar los upgrades para que los bonos estén correctamente aplicados
    if (player.upgrades_owned) {
        const upgradesOwned = JSON.parse(player.upgrades_owned);
        Object.entries(upgradesOwned).forEach(([upgradeId, isOwned]) => {
            if (isOwned) {
                const upgrade = upgrades.find(u => u.id == upgradeId);
                if (upgrade) {
                    // Aplicar efectos de la mejora
                    switch (upgrade.type) {
                        case 'clickDuplicate':
                            click.click *= upgrade.bonus;
                            break;
                        case 'clickPercent':
                            click.bonusPercent += upgrade.bonus;
                            break;
                        case 'production':
                            const product = products.find(p => p.id == upgrade.idForProduct);
                            if (product) {
                                product.bonus *= upgrade.bonus;
                            }
                            break;
                        case 'opsPercent':
                            production.bonusPercent += upgrade.bonus;
                            break;
                    }
                    // Ocultar la mejora
                    $(`#${upgradeId}`).addClass('hidden');
                }
            }
        });
    }

    // Después cargar los productos con los bonos ya aplicados
    if (player.products_owned) {
        const productsOwned = JSON.parse(player.products_owned);
        Object.entries(productsOwned).forEach(([productId, data]) => {
            const product = products.find(p => p.id == productId);
            if (product) {
                // Actualizar precio del producto
                product.price = data.price;

                // Actualizar contador de productos
                const productOwned = $(`#productOwned${productId}`);
                const productOwnedCard = $(`#productOwnedCard${productId}`);
                productOwned.text(data.count);
                productOwnedCard.text(data.count);

                // Actualizar precio mostrado
                const productPrice = $(`#productPrice${productId}`);
                const productPriceCard = $(`#productPriceCard${productId}`);
                productPrice.text(formatNumber(data.price));
                productPriceCard.text(formatNumber(data.price));

                // Actualizar producción con el bonus ya aplicado
                production.olivesPerSecondBase += product.bonus * data.count;

                // Actualizar tarjetas hover
                $(`#liOne${productId}`).html(`cada ${product.name.toLowerCase()} produce <b>${formatNumber(product.bonus)} olivas</b> por segundo`);
                const bonusTotal = data.count * product.bonus;
                $(`#liTwo${productId}`).html(`${data.count} produciendo <b>${formatNumber(bonusTotal)} olivas</b> por segundo`);

                // Inicializar producciones
                if (!productions[productId]) {
                    const savedData = JSON.parse(player.products_owned)[productId]

                    productions[productId] = {
                        total: savedData ? savedData.total : 0,
                        ownedCount: data.count,
                        interval: setInterval(function () {
                            productions[productId].total += productions[productId].ownedCount * product.bonus;
                            $(`#liThree${productId}`).html(`producción hasta ahora: <b>${formatNumber(productions[productId].total)} olivas</b>`);
                        }, 1000)
                    };
                }
            }
        });
    }

    // Actualizar la interfaz
    updateOlivesPerSecond();

    // Verificar logros después de cargar los datos
    achievementsControl();
}

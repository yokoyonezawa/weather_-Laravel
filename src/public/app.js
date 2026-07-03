const API_BASE = "http://localhost/api";

// トークン管理
function getToken() {
    return localStorage.getItem("token");
}
function setToken(token) {
    localStorage.setItem("token", token);
}
function removeToken() {
    localStorage.removeItem("token");
}
function isLoggedIn() {
    return !!getToken();
}

// 認証ヘッダー
function authHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    };
}

// ===== 認証 =====

async function register(name, email, password) {
    const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (data.token) {
        setToken(data.token);
        updateAuthUI();
        showFavorites();
    }
    return data;
}

async function login(email, password) {
    const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
        setToken(data.token);
        updateAuthUI();
        showFavorites();
    }
    return data;
}

async function logout() {
    await fetch(`${API_BASE}/logout`, {
        method: "POST",
        headers: authHeaders(),
    });
    removeToken();
    updateAuthUI();
    showFavorites();
}

// ===== お気に入り（DB連携） =====

async function getFavorites() {
    if (!isLoggedIn()) {
        return JSON.parse(localStorage.getItem("favorites")) || [];
    }
    const res = await fetch(`${API_BASE}/favorites`, {
        headers: authHeaders(),
    });
    const data = await res.json();
    return data.map((f) => f.city);
}

async function addFavorite(city) {
    if (!isLoggedIn()) {
        const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        if (favorites.includes(city))
            return { message: "すでに追加されています" };
        if (favorites.length >= 5)
            return { message: "お気に入りは5件までです" };
        favorites.push(city);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        return { success: true };
    }
    const res = await fetch(`${API_BASE}/favorites`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ city }),
    });
    return res.json();
}

async function removeFavorite(city) {
    if (!isLoggedIn()) {
        const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        localStorage.setItem(
            "favorites",
            JSON.stringify(favorites.filter((f) => f !== city)),
        );
        return;
    }
    await fetch(`${API_BASE}/favorites/${encodeURIComponent(city)}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
}

// ===== UI =====

function updateAuthUI() {
    const authArea = document.getElementById("authArea");
    if (isLoggedIn()) {
        authArea.innerHTML = `<button id="logoutBtn">ログアウト</button>`;
        document.getElementById("logoutBtn").addEventListener("click", logout);
    } else {
        authArea.innerHTML = `
            <button id="showLoginBtn">ログイン</button>
            <button id="showRegisterBtn">新規登録</button>
        `;
        document
            .getElementById("showLoginBtn")
            .addEventListener("click", () => showAuthModal("login"));
        document
            .getElementById("showRegisterBtn")
            .addEventListener("click", () => showAuthModal("register"));
    }
}

function showAuthModal(mode) {
    const modal = document.getElementById("authModal");
    const title = document.getElementById("authModalTitle");
    const nameField = document.getElementById("authNameField");

    if (mode === "login") {
        title.textContent = "ログイン";
        nameField.style.display = "none";
    } else {
        title.textContent = "新規登録";
        nameField.style.display = "block";
    }
    modal.dataset.mode = mode;
    modal.style.display = "block";
}

async function showFavorites() {
    const favorites = await getFavorites();
    const tabList = document.getElementById("tabList");
    tabList.innerHTML = "";

    const locationTab = document.createElement("div");
    locationTab.className = "tab-item";
    locationTab.textContent = "📍 現在地";
    locationTab.onclick = function () {
        setActiveTab(locationTab);
        getLocationWeather();
    };
    tabList.appendChild(locationTab);

    favorites.forEach(function (city) {
        const tab = document.createElement("div");
        tab.className = "tab-item";
        tab.innerHTML = `${city} <span class="remove-btn">×</span>`;

        tab.onclick = function (e) {
            if (e.target.classList.contains("remove-btn")) return;
            setActiveTab(tab);
            searchCity(city);
        };

        tab.querySelector(".remove-btn").onclick = async function (e) {
            e.stopPropagation();
            await removeFavorite(city);
            showFavorites();
        };

        tabList.appendChild(tab);
    });
}

function setActiveTab(activeTab) {
    document
        .querySelectorAll(".tab-item")
        .forEach((tab) => tab.classList.remove("active"));
    activeTab.classList.add("active");
}

function displayWeather(data, cityName) {
    if (data.cod !== "200") {
        document.getElementById("errorMessage").textContent =
            "都市が見つかりませんでした！";
        return;
    }
    document.getElementById("errorMessage").textContent = "";
    const current = data.list[0];
    document.getElementById("cityName").textContent =
        cityName || data.city.name;
    document.getElementById("temperature").textContent =
        `気温：${current.main.temp.toFixed(1)}℃`;
    document.getElementById("description").textContent =
        `天気：${current.weather[0].description}`;
    document.getElementById("weatherIcon").style.display = "block";
    document.getElementById("weatherIcon").src =
        `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;

    const forecasts = [
        data.list[0],
        data.list[8],
        data.list[16],
        data.list[24],
        data.list[32],
    ];
    const forecastList = document.getElementById("forecastList");
    forecastList.innerHTML = "";
    forecasts.forEach(function (item) {
        const date = new Date(item.dt * 1000);
        forecastList.innerHTML += `
            <div>
                <p>${date.getMonth() + 1}/${date.getDate()}</p>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png">
                <p>${item.main.temp.toFixed(1)}℃</p>
                <p>${item.weather[0].description}</p>
            </div>
        `;
    });
}

async function searchCity(city) {
    const response = await fetch(
        `${API_BASE}/weather?city=${encodeURIComponent(city)}`,
    );
    const data = await response.json();
    displayWeather(data, city);
    const history = JSON.parse(localStorage.getItem("history")) || [];
    history.unshift(city);
    if (history.length > 5) history.pop();
    localStorage.setItem("history", JSON.stringify(history));
    showHistory();
}

function getLocationWeather() {
    navigator.geolocation.getCurrentPosition(
        async function (position) {
            const { latitude: lat, longitude: lon } = position.coords;
            const response = await fetch(
                `${API_BASE}/weather?lat=${lat}&lon=${lon}`,
            );
            const data = await response.json();
            displayWeather(data, data.city.name);
        },
        function () {
            document.getElementById("errorMessage").textContent =
                "現在地を取得できませんでした！";
        },
    );
}

function showHistory() {
    const history = JSON.parse(localStorage.getItem("history")) || [];
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "";
    history.forEach(function (city) {
        historyList.innerHTML += `<li onclick="searchCity('${city}')">${city}</li>`;
    });
}

// ===== イベント =====

document
    .getElementById("searchBtn")
    .addEventListener("click", async function () {
        const city = document.getElementById("city").value;
        if (!city) {
            document.getElementById("errorMessage").textContent =
                "都市名を入力してください！";
            return;
        }
        document.getElementById("searchModal").style.display = "none";
        await searchCity(city);
    });

document.getElementById("city").addEventListener("keydown", function (e) {
    if (e.key === "Enter") document.getElementById("searchBtn").click();
});

document.getElementById("searchNavBtn").addEventListener("click", function () {
    const modal = document.getElementById("searchModal");
    modal.style.display = modal.style.display === "block" ? "none" : "block";
});

document.getElementById("closeModal").addEventListener("click", function () {
    document.getElementById("searchModal").style.display = "none";
});

document.getElementById("locationBtn").addEventListener("click", function () {
    setActiveTab(document.querySelectorAll(".tab-item")[0]);
    getLocationWeather();
});

document
    .getElementById("addFavoriteBtn")
    .addEventListener("click", async function () {
        const cityName = document.getElementById("cityName").textContent;
        if (!cityName) {
            document.getElementById("errorMessage").textContent =
                "先に都市を検索してください！";
            return;
        }
        const result = await addFavorite(cityName);
        if (result.message) {
            document.getElementById("errorMessage").textContent =
                result.message;
        } else {
            await showFavorites();
            document.getElementById("errorMessage").textContent =
                "お気に入りに追加しました！";
        }
    });

// 認証モーダルの送信
document
    .getElementById("authSubmitBtn")
    .addEventListener("click", async function () {
        const mode = document.getElementById("authModal").dataset.mode;
        const email = document.getElementById("authEmail").value;
        const password = document.getElementById("authPassword").value;

        if (mode === "login") {
            const result = await login(email, password);
            if (result.message) {
                document.getElementById("authError").textContent =
                    result.message;
                return;
            }
        } else {
            const name = document.getElementById("authName").value;
            const result = await register(name, email, password);
            if (result.message) {
                document.getElementById("authError").textContent =
                    result.message;
                return;
            }
        }
        document.getElementById("authModal").style.display = "none";
    });

document
    .getElementById("closeAuthModal")
    .addEventListener("click", function () {
        document.getElementById("authModal").style.display = "none";
    });

// ===== 初期化 =====
updateAuthUI();
showFavorites();
showHistory();

const firstTab = document.querySelector(".tab-item");
if (firstTab) {
    setActiveTab(firstTab);
    getLocationWeather();
}

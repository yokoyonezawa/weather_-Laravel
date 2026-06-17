// お気に入りを表示する関数
function showFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const tabList = document.getElementById("tabList");
    tabList.innerHTML = "";

    // 現在地タブ
    const locationTab = document.createElement("div");
    locationTab.className = "tab-item";
    locationTab.textContent = "📍 現在地";
    locationTab.onclick = function () {
        setActiveTab(locationTab);
        getLocationWeather();
    };
    tabList.appendChild(locationTab);

    // お気に入りタブ
    favorites.forEach(function (city) {
        const tab = document.createElement("div");
        tab.className = "tab-item";
        tab.innerHTML = `${city} <span class="remove-btn">×</span>`;

        // タブをクリックしたら天気を表示
        tab.onclick = function (e) {
            if (e.target.classList.contains("remove-btn")) return;
            setActiveTab(tab);
            searchCity(city);
        };

        // ×ボタンをクリックしたら削除
        tab.querySelector(".remove-btn").onclick = function (e) {
            e.stopPropagation();
            const favorites =
                JSON.parse(localStorage.getItem("favorites")) || [];
            const newFavorites = favorites.filter((f) => f !== city);
            localStorage.setItem("favorites", JSON.stringify(newFavorites));
            showFavorites();
        };

        tabList.appendChild(tab);
    });
}

// アクティブタブを設定
function setActiveTab(activeTab) {
    document.querySelectorAll(".tab-item").forEach(function (tab) {
        tab.classList.remove("active");
    });
    activeTab.classList.add("active");
}

// 天気を表示する関数
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
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const temp = item.main.temp.toFixed(1);
        const desc = item.weather[0].description;
        const icon = item.weather[0].icon;

        forecastList.innerHTML += `
            <div>
                <p>${month}/${day}</p>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png">
                <p>${temp}℃</p>
                <p>${desc}</p>
            </div>
        `;
    });
}

// 都市名で検索
async function searchCity(city) {
    const response = await fetch(
        `http://localhost/api/weather?city=${encodeURIComponent(city)}`,
    );
    const data = await response.json();
    displayWeather(data, city);

    // 検索履歴に保存
    const history = JSON.parse(localStorage.getItem("history")) || [];
    history.unshift(city);
    if (history.length > 5) history.pop();
    localStorage.setItem("history", JSON.stringify(history));
    showHistory();
}

// 現在地で検索
function getLocationWeather() {
    navigator.geolocation.getCurrentPosition(
        async function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const response = await fetch(
                `http://localhost/api/weather?lat=${lat}&lon=${lon}`,
            );
            const data = await response.json();
            displayWeather(data, data.city.name);
        },
        function (error) {
            document.getElementById("errorMessage").textContent =
                "現在地を取得できませんでした！";
        },
    );
}

// 履歴を表示する関数
function showHistory() {
    const history = JSON.parse(localStorage.getItem("history")) || [];
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "";

    history.forEach(function (city) {
        historyList.innerHTML += `<li onclick="searchCity('${city}')">${city}</li>`;
    });
}

// 検索ボタン
document
    .getElementById("searchBtn")
    .addEventListener("click", async function () {
        const city = document.getElementById("city").value;
        if (city === "") {
            document.getElementById("errorMessage").textContent =
                "都市名を入力してください！";
            return;
        }
        document.getElementById("searchModal").style.display = "none";
        await searchCity(city);
    });

// Enterキーで検索
document.getElementById("city").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        document.getElementById("searchBtn").click();
    }
});

// 検索モーダルを開く
document.getElementById("searchNavBtn").addEventListener("click", function () {
    const modal = document.getElementById("searchModal");
    modal.style.display = modal.style.display === "block" ? "none" : "block";
});

// モーダルを閉じる
document.getElementById("closeModal").addEventListener("click", function () {
    document.getElementById("searchModal").style.display = "none";
});

// 現在地ボタン
document.getElementById("locationBtn").addEventListener("click", function () {
    const tabs = document.querySelectorAll(".tab-item");
    setActiveTab(tabs[0]);
    getLocationWeather();
});

// お気に入りに追加
document
    .getElementById("addFavoriteBtn")
    .addEventListener("click", function () {
        const cityName = document.getElementById("cityName").textContent;
        if (!cityName) {
            document.getElementById("errorMessage").textContent =
                "先に都市を検索してください！";
            return;
        }

        const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

        if (favorites.includes(cityName)) {
            document.getElementById("errorMessage").textContent =
                "すでにお気に入りに追加されています！";
            return;
        }

        if (favorites.length >= 5) {
            document.getElementById("errorMessage").textContent =
                "お気に入りは5件までです！";
            return;
        }

        favorites.push(cityName);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        showFavorites();
        document.getElementById("errorMessage").textContent =
            "お気に入りに追加しました！";
    });

// 初期化
showFavorites();
showHistory();

// ページ読み込み時に現在地の天気を取得
const firstTab = document.querySelector(".tab-item");
if (firstTab) {
    setActiveTab(firstTab);
    getLocationWeather();
}

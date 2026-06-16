document
    .getElementById("searchBtn")
    .addEventListener("click", async function () {
        const city = document.getElementById("city").value;

        if (city === "") {
            document.getElementById("errorMessage").textContent =
                "都市名を入力してください！";
            return;
        }

        const response = await fetch(
            `http://localhost/api/weather?city=${city}`,
        );
        const data = await response.json();

        if (data.cod !== "200") {
            document.getElementById("errorMessage").textContent =
                "都市が見つかりませんでした！";
            return;
        }
        const history = JSON.parse(localStorage.getItem("history")) || [];
        history.unshift(city);
        if (history.length > 5) {
            history.pop();
        }
        localStorage.setItem("history", JSON.stringify(history));
        showHistory();
        console.log(history);

        document.getElementById("errorMessage").textContent = "";

        // 現在の天気（list[0]が一番近い時間）
        const current = data.list[0];
        document.getElementById("cityName").textContent = data.city.name;
        document.getElementById("temperature").textContent =
            `気温：${current.main.temp.toFixed(1)}℃`;
        document.getElementById("description").textContent =
            `天気：${current.weather[0].description}`;
        document.getElementById("weatherIcon").style.display = "block";
        document.getElementById("weatherIcon").src =
            `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;

        // 5日間予報（8件ごと＝24時間ごと）
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
    });

// Enterキーでも検索できるようにする
document.getElementById("city").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        document.getElementById("searchBtn").click();
    }
});

// 履歴を表示する関数
function showHistory() {
    const history = JSON.parse(localStorage.getItem("history")) || [];
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "";

    history.forEach(function (city) {
        historyList.innerHTML += `<li onclick="searchCity('${city}')">${city}</li>`;
    });
}

function searchCity(cityName) {
    document.getElementById("city").value = cityName;
    document.getElementById("searchBtn").click();
}

showHistory();

document.getElementById("locationBtn").addEventListener("click", function () {
    console.log("現在地ボタンが押された！");
    navigator.geolocation.getCurrentPosition(
        function (position) {
            console.log("位置情報取得成功！");
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByCoords(lat, lon);
        },
        function (error) {
            console.log("位置情報取得失敗！");
            console.log(error.code);
            console.log(error.message);
            document.getElementById("errorMessage").textContent =
                "現在地を取得できませんでした！";
        },
    );
});

async function fetchWeatherByCoords(lat, lon) {
    console.log("緯度：" + lat);
    console.log("経度：" + lon);
    const response = await fetch(
        `http://localhost/api/weather?lat=${lat}&lon=${lon}`,
    );

    const data = await response.json();

    if (data.cod !== "200") {
        document.getElementById("errorMessage").textContent =
            "天気を取得できませんでした！";
        return;
    }

    document.getElementById("errorMessage").textContent = "";

    const current = data.list[0];
    document.getElementById("cityName").textContent = data.city.name;
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

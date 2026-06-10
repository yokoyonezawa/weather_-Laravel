document
    .getElementById("searchBtn")
    .addEventListener("click", async function () {
        const city = document.getElementById("city").value;

        if (city === "") {
            document.getElementById("errorMessage").textContent =
                "都市名を入力してください！";
            return;
        }

    const apiKey = "d161916aa7cd3f711f1f87fe386fe865";

    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&lang=ja&units=metric`,
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
    const history = JSON.parse(localStorage.getItem('history')) || [];
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    history.forEach(function(city) {
        historyList.innerHTML += `<li>${city}</li>`;
    });
}

showHistory();
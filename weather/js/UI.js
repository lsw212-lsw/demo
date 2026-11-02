// UI.js
export class UI {
    constructor() {
        // 获取 DOM 元素
        this.cityName = document.getElementById('city-name');
        this.currentDate = document.getElementById('current-date');
        this.temperature = document.getElementById('temperature');
        this.weatherDesc = document.getElementById('weather-desc');
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('wind-speed');
    }

    // 渲染数据 (利用解构赋值)
    render(data) {
        const { name, main, weather, wind } = data;
        const weatherDetail = weather[0];

        // 更新文字内容
        this.cityName.textContent = name;
        this.temperature.textContent = `${Math.round(main.temp)}°C`;
        this.weatherDesc.textContent = weatherDetail.description;
        this.humidity.textContent = `${main.humidity}%`;
        this.windSpeed.textContent = `${wind.speed} m/s`;

        // 更新日期
        const now = new Date();
        this.currentDate.textContent = now.toLocaleDateString('zh-CN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        // 调用 Picsum API 更换背景图片
        this.updateBackground(name);
    }

    // 更新背景 (对应截图 7)
    updateBackground(cityName) {
        // 使用城市名作为 seed 种子，保证每次搜同一个城市背景图是一致的，但每个城市不同
        const imageUrl = `https://picsum.photos/1600/900/?${cityName}`;
        document.body.style.backgroundImage = `url('${imageUrl}')`;
    }

    // 显示错误信息
    showError(message) {
        alert(message);
    }
}
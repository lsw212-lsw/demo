// Weather.js
export class Weather {
    // 构造函数：填入你的专属 API Key
    constructor(apiKey = "13e786b2255800d48474a6fdbcd071dc") {
        this.apiKey = apiKey;
        this.baseUrl = "https://api.openweathermap.org/data/2.5/weather";
    }

    // 使用 async/await 异步获取天气数据
    async getWeather(city) {
        try {
            // 使用模板字符串拼接 URL
            const url = `${this.baseUrl}?q=${city}&appid=${this.apiKey}&units=metric&lang=zh_cn`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error("城市未找到，请检查输入");
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    }
}
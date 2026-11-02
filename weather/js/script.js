// script.js
import { Weather } from './Weather.js';
import { UI } from './UI.js';

// 初始化实例
const weatherApp = new Weather();
const ui = new UI();

// 搜索天气的核心函数
const searchWeather = async (city) => {
    if (!city) return;
    
    try {
        const data = await weatherApp.getWeather(city);
        ui.render(data);
    } catch (error) {
        ui.showError(error.message);
    }
};

// 统一管理事件监听
document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');

    // 点击按钮搜索
    searchBtn.addEventListener('click', () => {
        searchWeather(cityInput.value.trim());
    });

    // 按回车键搜索
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchWeather(cityInput.value.trim());
        }
    });

    // 初始化加载默认城市（北京）
    searchWeather('Beijing');
});
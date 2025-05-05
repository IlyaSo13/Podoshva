<template>
    <footer class="bg-white text-gray-800 py-8">
      <div class="container mx-auto px-4">
        <!-- Верхняя часть: название, навигация, соцсети -->
        <div class="flex flex-col md:flex-row justify-between items-center">
          <!-- Логотип и описание -->
          <div class="mb-4 md:mb-0 text-center md:text-left">
            <h2 class="text-2xl font-bold">Подошва</h2>
            <p class="text-gray-600">Лучший магазин Кроссовок</p>
          </div>
          <!-- Навигационные ссылки через router-link -->
          <nav class="flex gap-4 mb-4 md:mb-0">
            <router-link to="/" class="hover:text-gray-600 transition">
              Главная
            </router-link>
            <router-link to="/about" class="hover:text-gray-600 transition">
              О нас
            </router-link>
            <router-link to="/contact" class="hover:text-gray-600 transition">
              Контакты
            </router-link>
            <router-link to="/privacy" class="hover:text-gray-600 transition">
              Политика конфиденциальности
            </router-link>
          </nav>
          <!-- Ссылки на соцсети -->
          <div class="flex gap-4">
            <a href="https://vk.com/soubezb" target="_blank" rel="noopener noreferrer">
              <img src="/vk.png" alt="VK" class="w-6 h-6" />
            </a>
            <a href="https://t.me/IlyaSo13_official" target="_blank" rel="noopener noreferrer">
              <img src="/telegram.png" alt="Telegram" class="w-6 h-6" />
            </a>
          </div>
        </div>
        <!-- Нижняя часть: копирайт -->
        <div class="mt-8 border-t border-gray-300 pt-4 text-center text-sm text-gray-600">
          © 2025 Podoshva. Все права защищены.
        </div>
      </div>
    </footer>
  </template>
  
  <style scoped>
  footer {
    background-color: #ffffff;
    color: #333333;
    padding: 2rem 0;
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  </style>
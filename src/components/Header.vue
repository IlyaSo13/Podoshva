<script setup>
defineProps({
  totalPrice: Number
})
const emit = defineEmits(['openDrawer'])
</script>

<template>
  <header class="flex justify-between items-center border-b border-slate-200 px-10 py-8">
    <!-- Левая область: логотип -->
    <router-link to="/">
      <div class="flex items-center gap-4">
        <img src="/logo.png" alt="Logo" class="w-10" />
        <div>
          <h2 class="text-xl font-bold uppercase">подошва</h2>
          <p class="text-slate-400">Лучший магазин кроссовок</p>
        </div>
      </div>
    </router-link>

    <!-- Средняя область: ссылки на категории -->
    <nav class="flex gap-8">
      <router-link to="/MenSneakers">
        <span class="cursor-pointer text-gray-700 hover:text-black">Мужские</span>
      </router-link>
      <router-link to="/WomenSneakers">
        <span class="cursor-pointer text-gray-700 hover:text-black">Женские</span>
      </router-link>
      <router-link to="/NewSneakers">
        <span class="cursor-pointer text-gray-700 hover:text-black">Новинки</span>
      </router-link>
      <router-link to="/SportSneakers">
        <span class="cursor-pointer text-gray-700 hover:text-black">Спортивные</span>
      </router-link>
    </nav>

    <!-- Правая область: корзина, закладки, профиль -->
    <ul class="flex items-center gap-10">
      <li
        @click="() => emit('openDrawer')"
        class="flex items-center cursor-pointer gap-3 text-gray-500 hover:text-black"
      >
        <img src="/cart.svg" alt="Cart" />
        <b>{{ totalPrice }} руб.</b>
      </li>
      <router-link to="/favorites">
        <li class="flex items-center cursor-pointer gap-3 text-gray-500 hover:text-black">
          <img src="/heart.svg" alt="Favorites" />
          <span>Избранное</span>
        </li>
      </router-link>
      <router-link to="/Profiles">
        <li class="flex items-center cursor-pointer gap-3 text-gray-500 hover:text-black">
          <img src="/profile.svg" alt="Profile" />
        </li>
      </router-link>
    </ul>
  </header>
</template>

<style>
/* ПК-версия (стандартная) */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding: 16px 40px;
}

/* Медиа-запросы для мобильных устройств */
@media (max-width: 1260px) {
  header {
    flex-direction: column;
    padding: 12px 20px;
    text-align: center;
  }

  nav {
    display: none; /* Скрываем стандартную навигацию */
  }

  .menu-toggle {
    display: block; /* Показываем бургер-меню */
    cursor: pointer;
  }
  
  ul {
    gap: 20px;
  }
}

/* Для очень маленьких экранов (до 480px) */
@media (max-width: 480px) {
  header {
    padding: 8px 15px;
  }

  .logo img {
    width: 32px;
  }

  ul {
    gap: 15px;
  }
}
</style>


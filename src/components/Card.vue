<script setup>
import { computed } from 'vue'

// Функция для извлечения значения cookie по имени
function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

// Функция для декодирования JWT (при необходимости)
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error('Ошибка декодирования токена:', e)
    return null
  }
}

const props = defineProps({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  price: { type: Number, required: true },
  isFavorite: { type: Boolean, default: false },
  isAdded: { type: Boolean, default: false },
  onClickFavorite: { type: Function, default: null },
  onClickAdd: { type: Function, default: null },
  // Новый пропс – флаг авторизации пользователя.
  // Если не передан, будем вычислять его, проверяя наличие токена в cookie.
  isAuthorized: { type: Boolean, default: undefined }
})

// Если пропс isAuthorized не задан (undefined), вычисляем его по наличию токена в cookie.
const userAuthorized = computed(() => {
  if (props.isAuthorized !== undefined) return props.isAuthorized
  const token = getCookie('apiToken')
  return !!token
})

// Вычисляем свойство для отображения состояния "избранного" – если пользователь не авторизован,
// то пометка снимается (возвращается false), независимо от переданного свойства isFavorite.
const displayedFavorite = computed(() => {
  return userAuthorized.value ? props.isFavorite : false
})

// Обёртка для клика по сердечку, проверяющая авторизацию.
const handleFavoriteClick = () => {
  if (!userAuthorized.value) {
    alert('Пожалуйста, войдите в систему, чтобы добавить товар в избранное.')
    return
  }
  if (props.onClickFavorite) {
    props.onClickFavorite()
  }
}
</script>

<template>
  <div
    class="card relative bg-white border border-slate-100 rounded-3xl p-8 cursor-pointer transition hover:-translate-y-2 hover:shadow-xl"
  >
    <!-- Кнопка-сердечко с модификатором .stop, вызывающая handleFavoriteClick -->
    <button
      v-if="onClickFavorite"
      class="heart-button absolute top-8 left-8 z-9 bg-transparent border-0 cursor-pointer"
      @click.stop="handleFavoriteClick"
    >
      <!-- Используем displayedFavorite вместо props.isFavorite -->
      <img
        :src="displayedFavorite ? '/like-2.svg' : '/like-1.svg'"
        alt="Favorite Icon"
        class="heart-icon"
      />
    </button>

    <img :src="imageUrl" alt="Product Image" class="w-full object-cover rounded-md mb-2" />

    <p class="mt-2 text-lg font-semibold">{{ title }}</p>
    <p class="text-slate-400">Цена: {{ price }} руб.</p>

    <!-- Кнопка добавления в корзину -->
    <button
      v-if="onClickAdd"
      class="cart-button mt-4 inline-flex items-center bg-transparent border-0 cursor-pointer"
      @click.stop="onClickAdd"
    >
      <img :src="isAdded ? '/checked.svg' : '/plus.svg'" alt="Add to Cart Icon" class="cart-icon" />
    </button>
  </div>
</template>

<style scoped>
.heart-button,
.cart-button {
  pointer-events: auto;
}

/* Увеличиваем иконки до 32px и добавляем drop-shadow для лучшей видимости */
.heart-icon,
.cart-icon {
  width: 32px;
  height: 32px;
  cursor: pointer;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}
</style>

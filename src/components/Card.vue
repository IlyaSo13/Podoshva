<script setup>
import { computed, ref } from 'vue'

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
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error('Ошибка декодирования токена:', e)
    return null
  }
}

const props = defineProps({
  id: Number,
  title: String,
  imageUrl: String,
  price: Number,
  isFavorite: Boolean,
  isAdded: Boolean,
  onClickFavorite: Function,
  onClickAdd: Function,
  onUpdateQuantity: Function, // Обработчик для обновления количества (если нужен)
  isAuthorized: Boolean
})

// Локальное состояние для количества товара
const quantity = ref(1)

// Если пропс isAuthorized не передан, вычисляем его по наличию apiToken в cookie
const userAuthorized = computed(() => {
  if (props.isAuthorized !== undefined) return props.isAuthorized
  const token = getCookie('apiToken')
  return !!token
})

// Если пользователь не авторизован – сбрасываем отметку добавления
const displayedAdded = computed(() => {
  return userAuthorized.value ? props.isAdded : false
})

// Обработчик клика по кнопке добавления в корзину
const handleCartClick = () => {
  if (!userAuthorized.value) {
    alert('Пожалуйста, войдите в систему, чтобы добавить товар в корзину.')
    return
  }
  // Передаём актуальное количество из локального состояния
  if (props.onClickAdd) {
    props.onClickAdd({ id: props.id, quantity: quantity.value })
  }
}

// Обновляем количество при изменении введённого значения.
// Если задан обработчик onUpdateQuantity (когда товар уже добавлен), вызываем его.
const updateQuantity = () => {
  quantity.value = Math.max(1, quantity.value)
  if (props.isAdded && props.onUpdateQuantity) {
    props.onUpdateQuantity(props.id, quantity.value)
  }
}

// Обработчик клика по кнопке избранного
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
  <div class="card relative bg-white border border-slate-100 rounded-3xl p-8 cursor-pointer transition hover:-translate-y-2 hover:shadow-xl">
    <!-- Кнопка избранного -->
    <button
      v-if="onClickFavorite"
      class="heart-button absolute top-8 left-8 z-9 bg-transparent border-0 cursor-pointer"
      @click.stop="handleFavoriteClick"
    >
      <img :src="isFavorite ? '/like-2.svg' : '/like-1.svg'" alt="Favorite Icon" class="heart-icon" />
    </button>

    <img :src="imageUrl" alt="Product Image" class="w-full object-cover rounded-md mb-2" />

    <p class="mt-2 text-lg font-semibold">{{ title }}</p>
    <p class="text-slate-400">Цена: {{ price }} руб.</p>

    <!-- Инпут для изменения количества -->
    <div class="quantity-selector">
      <label>Количество:</label>
      <input
        type="number"
        v-model.number="quantity"
        min="1"
        class="quantity-input"
        @change="updateQuantity"
      />
    </div>

    <!-- Кнопка добавления в корзину -->
    <button
      v-if="onClickAdd"
      class="cart-button mt-4 inline-flex items-center bg-transparent border-0 cursor-pointer"
      @click.stop="handleCartClick"
    >
      <img :src="displayedAdded ? '/checked.svg' : '/plus.svg'" alt="Add to Cart Icon" class="cart-icon" />
    </button>
  </div>
</template>

<style scoped>
.heart-button,
.cart-button {
  pointer-events: auto;
}

.quantity-selector {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 5px;
}

.quantity-input {
  width: 50px;
  text-align: center;
}

/* Увеличиваем иконки до 32px и добавляем drop-shadow */
.heart-icon,
.cart-icon {
  width: 32px;
  height: 32px;
  cursor: pointer;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}
</style>

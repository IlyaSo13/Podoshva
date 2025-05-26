<script setup>
import { ref, onMounted, inject, watch } from 'vue'
import axios from 'axios'
import Card from '../components/Card.vue'
import Footer from '../components/Footer.vue'

// Функция для декодирования JWT (предполагается, что токен хранится в cookie)
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

// Функция для извлечения значения cookie по имени
function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

// Получаем токен из cookie и определяем текущего пользователя
const token = getCookie('apiToken')
const currentUser = token ? parseJwt(token) : null

// Получаем глобальные методы для работы с корзиной (через provide)
const { cart, addToCart, removeFromCart } = inject('cart')

// Массив избранных товаров (будет содержать только записи, привязанные к текущему пользователю)
const favorites = ref([])

// Переменные для работы с модальным окном выбора размера
const showModal = ref(false)
const selectedProduct = ref(null)
const selectedSize = ref('')

// При монтировании загружаем избранные товары, фильтруя по user_id текущего пользователя
onMounted(async () => {
  if (!currentUser || !currentUser.id) {
    console.warn('Пользователь не авторизован. Избранное не будет загружено.')
    return
  }
  try {
    const { data } = await axios.get(
      // Параметр user_id гарантирует, что получены только записи текущего пользователя
      `https://fc92f27366340adc.mokky.dev/favorites?user_id=${currentUser.id}&_relations=items`
    )
    /*
      Ожидается, что сервер возвращает массив объектов вида:
      {
          id: <favorite_record_id>,
          item: { id, title, imageUrl, price, sizes, ... }
      }
    */
    favorites.value = data.map((obj) => ({
      ...obj.item,
      favoriteId: obj.id, // сохраняем id записи избранного
      sizes: obj.item.sizes || ['38', '39', '40', '41', '42'],
      isFavorite: true,
      isAdded: cart.value.some((cartItem) => cartItem.id === obj.item.id)
    }))
  } catch (err) {
    console.error('Ошибка загрузки избранного:', err)
  }
})

// Следим за изменениями в корзине и обновляем флаг isAdded для каждого избранного товара
watch(cart, (newCart) => {
  favorites.value = favorites.value.map((favItem) => ({
    ...favItem,
    isAdded: newCart.some((cartItem) => cartItem.id === favItem.id)
  }))
})

// Функция переключения избранного: на странице "Избранное" это удаление записи
const toggleFavorite = async (item) => {
  console.log('toggleFavorite вызвана для:', item)
  favorites.value = favorites.value.filter((fav) => fav.id !== item.id)
  try {
    await axios.delete(`https://fc92f27366340adc.mokky.dev/favorites/${item.favoriteId}`)
    console.log(`Товар с favoriteId=${item.favoriteId} удалён на сервере`)
  } catch (err) {
    console.error('Ошибка удаления из избранного:', err)
  }
}

// Обработчик добавления в корзину: если товар уже добавлен – удаляем, иначе – открываем модальное окно для выбора размера
const handleAddToCart = (item) => {
  if (item.isAdded) {
    removeFromCart(item)
    item.isAdded = false
  } else {
    selectedProduct.value = item
    selectedSize.value = ''
    showModal.value = true
  }
}

const confirmAddToCart = () => {
  if (selectedProduct.value && selectedSize.value) {
    const productWithSize = {
      ...selectedProduct.value,
      selectedSize: selectedSize.value
    }
    addToCart(productWithSize)
    selectedProduct.value.isAdded = true
    closeModal()
  } else {
    alert('Пожалуйста, выберите размер!')
  }
}

const closeModal = () => {
  showModal.value = false
  selectedProduct.value = null
  selectedSize.value = ''
}
</script>

<template>
  <div class="favorites-page container mx-auto p-4">
    <h2 class="text-3xl font-bold mb-8">Мои избранные товары</h2>
    <!-- Если массив favorites пуст -->
    <div v-if="!favorites.length" class="text-center text-lg text-slate-500">
      В избранном нет товаров.
    </div>
    <!-- Если есть товары – выводим карточки -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="item in favorites"
        :key="item.id"
        :id="item.id"
        :title="item.title"
        :imageUrl="item.imageUrl"
        :price="item.price"
        :isFavorite="item.isFavorite"
        :isAdded="item.isAdded"
        :isAuthorized="true"
        v-bind="item"
        :onClickFavorite="toggleFavorite"
        :onClickAdd="handleAddToCart"
      />
    </div>
    <Footer class="mt-10" />

    <!-- Модальное окно для выбора размера -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3 class="text-xl mb-4">
          Выберите размер {{ selectedProduct ? selectedProduct.title : '' }}
        </h3>
        <select v-model="selectedSize" class="py-2 px-3 border rounded-md outline-none">
          <option disabled value="">Выберите размер</option>
          <option
            v-for="size in selectedProduct && selectedProduct.sizes
              ? selectedProduct.sizes
              : ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']"
            :key="size"
            :value="size"
          >
            {{ size }}
          </option>
        </select>
        <div class="modal-actions mt-4 flex gap-4 justify-center">
          <button
            @click="confirmAddToCart"
            :disabled="!selectedSize"
            class="py-2 px-4 bg-green-500 text-white rounded"
          >
            Добавить
          </button>
          <button @click="closeModal" class="py-2 px-4 bg-gray-300 text-black rounded">
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  padding: 20px 30px;
  border-radius: 8px;
  text-align: center;
  max-width: 500px;
  width: 90%;
}
</style>

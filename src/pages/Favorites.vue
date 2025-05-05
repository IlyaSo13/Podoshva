<script setup>
import { ref, onMounted, inject, watch } from 'vue'
import axios from 'axios'
import Card from '../components/Card.vue'
import Footer from '../components/Footer.vue'

// Получаем глобальные методы для корзины (через provide)
const { cart, addToCart, removeFromCart } = inject('cart')

// Массив избранных товаров
const favorites = ref([])

// Переменные для работы с модальным окном выбора размера
const showModal = ref(false)
const selectedProduct = ref(null)
const selectedSize = ref('')

// При монтировании загружаем избранные товары
onMounted(async () => {
  try {
    const { data } = await axios.get(
      'https://fc92f27366340adc.mokky.dev/favorites?_relations=items'
    )
    /*
      Предполагается, что ответ API возвращает массив объектов вида:
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

// Следим за изменениями в корзине и обновляем флаг isAdded
watch(cart, (newCart) => {
  favorites.value = favorites.value.map((favItem) => ({
    ...favItem,
    isAdded: newCart.some((cartItem) => cartItem.id === favItem.id)
  }))
})

// Функция переключения избранного (удаление товара из избранного)
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

// Обработчик добавления в корзину: если товар уже добавлен – удаляем, иначе – открываем модальное окно
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
    <div v-if="!favorites.length" class="text-center text-lg text-slate-500">
      В избранном нет товаров.
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="item in favorites"
        :key="item.id"
        :id="item.id"
        :title="item.title"
        :imageUrl="item.imageUrl"
        :price="item.price"
        :isFavorite="item.isFavorite"
        :isAdded="item.isAdded"
        :onClickFavorite="() => toggleFavorite(item)"
        :onClickAdd="() => handleAddToCart(item)"
      />
    </div>
    <Footer class="mt-10" />

    <!-- Модальное окно для выбора размера -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3 class="text-xl mb-4">
          Выберите размер для {{ selectedProduct ? selectedProduct.title : '' }}
        </h3>
        <select v-model="selectedSize" class="py-2 px-3 border rounded-md outline-none">
          <option disabled value="">Выберите размер</option>
          <option
            v-for="size in selectedProduct && selectedProduct.sizes ? selectedProduct.sizes : ['38', '39', '40', '41', '42']"
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

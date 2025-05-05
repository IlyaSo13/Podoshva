<script setup>
import { ref, onMounted, inject, watch } from 'vue'
import axios from 'axios'
import CardList from '../components/CardList.vue'
import Footer from '../components/Footer.vue'

// Массив избранных товаров
const favorites = ref([])

// Получаем глобальные методы для работы с корзиной и саму корзину
const { cart, addToCart, removeFromCart } = inject('cart')

// Переменные для работы модального окна выбора размера
const showModal = ref(false)
const selectedProduct = ref(null)
const selectedSize = ref('')

// Получаем избранные товары при монтировании страницы
onMounted(async () => {
  try {
    const { data } = await axios.get(
      'https://fc92f27366340adc.mokky.dev/favorites?_relations=items'
    )
    favorites.value = data.map((obj) => ({
      ...obj.item,
      sizes: obj.item.sizes || ['38', '39', '40', '41', '42'],
      isAdded: false
    }))
  } catch (err) {
    console.log(err)
  }
})

// Следим за изменениями в корзине и обновляем флажок isAdded у товаров из избранного
watch(cart, (newCart) => {
  favorites.value = favorites.value.map((favItem) => ({
    ...favItem,
    isAdded: newCart.some((cartItem) => cartItem.id === favItem.id)
  }))
})

// Обработчик нажатия на кнопку добавления в корзину на карточке товара
const handleAddToCart = (item) => {
  if (item.isAdded) {
    // Если товар уже добавлен – удаляем его из корзины и сбрасываем флаг
    removeFromCart(item)
    item.isAdded = false
  } else {
    // Если товара нет в корзине – открываем модальное окно для выбора размера
    selectedProduct.value = item
    selectedSize.value = '' // сбрасываем предыдущее значение, если было
    showModal.value = true
  }
}

// Функция подтверждения добавления товара с выбранным размером
const confirmAddToCart = () => {
  if (selectedProduct.value && selectedSize.value) {
    const productWithSize = {
      ...selectedProduct.value,
      selectedSize: selectedSize.value
    }
    addToCart(productWithSize)
    // Обновляем флаг товара, что он добавлен
    selectedProduct.value.isAdded = true
    closeModal()
  } else {
    alert('Пожалуйста, выберите размер!')
  }
}

// Функция для закрытия модального окна
const closeModal = () => {
  showModal.value = false
  selectedProduct.value = null
  selectedSize.value = ''
}
</script>

<template>
  <h2 class="text-3xl font-bold mb-8">Мои закладки</h2>
  <!-- Передаём список избранных товаров и навешиваем обработчик события добавления в корзину -->
  <CardList :items="favorites" @add-to-cart="handleAddToCart" />

  <div class="mt-10">
      <Footer />
    </div>

  <!-- Модальное окно для выбора размера товара -->
  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <h3 class="text-xl mb-4">
        Выберите размер для {{ selectedProduct ? selectedProduct.title : '' }}
      </h3>
      <select v-model="selectedSize" class="py-2 px-3 border rounded-md outline-none">
        <option disabled value="">Выберите размер</option>
        <option
          v-for="size in selectedProduct && selectedProduct.sizes
            ? selectedProduct.sizes
            : ['38', '39', '40', '41', '42']"
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
        <button @click="closeModal" class="py-2 px-4 bg-gray-300 text-black rounded">Отмена</button>
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

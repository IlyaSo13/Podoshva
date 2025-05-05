<script setup>
import { reactive, watch, ref, onMounted } from 'vue'
import axios from 'axios'
import debounce from 'lodash.debounce'
import { inject } from 'vue'
import CardList from '../components/CardList.vue'
import CarouselBanner from '../components/CarouselBanner.vue'
import Footer from '../components/Footer.vue'

const { cart, addToCart, removeFromCart } = inject('cart')

// Список товаров
const items = ref([])

// Фильтры для сортировки и поиска
const filters = reactive({
  sortBy: 'title',
  searchQuery: ''
})

// Новые реактивные переменные для работы с модальным окном
const showModal = ref(false)
const selectedProduct = ref(null)
const selectedSize = ref('')

// Функция открытия модального окна для выбора размера
const openModalForProduct = (product) => {
  selectedProduct.value = product
  showModal.value = true
}

// Обновляем функцию для добавления в корзину: если товар ещё не добавлен, открываем модальное окно, иначе удаляем
const onClickAddPlus = (item) => {
  if (!item.isAdded) {
    openModalForProduct(item)
  } else {
    removeFromCart(item)
  }
}

const onChangeSelect = (event) => {
  filters.sortBy = event.target.value
}

const onChangeSearchInput = debounce((event) => {
  filters.searchQuery = event.target.value
}, 300)

const addToFavorite = async (item) => {
  try {
    if (!item.isFavorite) {
      const obj = {
        item_id: item.id
      }

      item.isFavorite = true

      const { data } = await axios.post(`https://fc92f27366340adc.mokky.dev/favorites`, obj)

      item.favoriteId = data.id
    } else {
      item.isFavorite = false
      await axios.delete(`https://fc92f27366340adc.mokky.dev/favorites/${item.favoriteId}`)
      item.favoriteId = null
    }
  } catch (err) {
    console.log(err)
  }
}

const fetchFavorites = async () => {
  try {
    const { data: favorites } = await axios.get(`https://fc92f27366340adc.mokky.dev/favorites`)

    items.value = items.value.map((item) => {
      const favorite = favorites.find((favorite) => favorite.item_id === item.id)
      if (!favorite) {
        return item
      }
      return {
        ...item,
        isFavorite: true,
        favoriteId: favorite.id
      }
    })
  } catch (err) {
    console.log(err)
  }
}

const fetchItems = async () => {
  try {
    const params = {
      sortBy: filters.sortBy
    }

    if (filters.searchQuery) {
      params.title = `*${filters.searchQuery}*`
    }

    const { data } = await axios.get(`https://fc92f27366340adc.mokky.dev/items`, {
      params
    })

    // Если у товара не задан список размеров, используем дефолтный массив
    items.value = data.map((obj) => ({
      ...obj,
      isFavorite: false,
      favoriteId: null,
      isAdded: false,
      sizes: obj.sizes || ['38', '39', '40', '41', '42']
    }))
  } catch (err) {
    console.log(err)
  }
}

// Функция подтверждения добавления товара с выбранным размером
const confirmAddToCart = () => {
  if (selectedProduct.value && selectedSize.value) {
    // Добавляем выбранный размер в объект товара
    const productWithSize = { ...selectedProduct.value, selectedSize: selectedSize.value }
    addToCart(productWithSize)

    // При желании обновляем состояние товаров (чтобы пометить добавленный товар)
    items.value = items.value.map((item) => {
      if (item.id === productWithSize.id) {
        return { ...item, isAdded: true }
      }
      return item
    })

    // Сбрасываем и закрываем модальное окно
    selectedProduct.value = null
    selectedSize.value = ''
    showModal.value = false
  } else {
    alert('Пожалуйста, выберите размер!')
  }
}

// Функция отмены/закрытия модального окна
const cancelModal = () => {
  showModal.value = false
  selectedProduct.value = null
  selectedSize.value = ''
}

onMounted(async () => {
  const localCart = localStorage.getItem('cart')
  cart.value = localCart ? JSON.parse(localCart) : []

  await fetchItems()
  await fetchFavorites()

  items.value = items.value.map((item) => ({
    ...item,
    isAdded: cart.value.some((cartItem) => cartItem.id === item.id)
  }))
})

watch(cart, () => {
  items.value = items.value.map((item) => ({
    ...item,
    isAdded: cart.value.some((cartItem) => cartItem.id === item.id)
  }))
})

watch(filters, fetchItems)
</script>

<template>
  <div>
    <CarouselBanner />
    <!-- Шапка страницы -->
    <div class="flex justify-between items-center">
      <h2 class="text-3xl font-bold mt-6">Все кроссовки</h2>
      <div class="flex gap-4">
        <select @change="onChangeSelect" class="py-2 px-3 border rounded-md outline-none">
          <option value="name">По названию</option>
          <option value="price">Сначала дешевые</option>
          <option value="-price">Сначала дорогие</option>
        </select>
        <div class="relative">
          <img class="absolute left-4 top-3" src="/search.svg" alt="Поиск" />
          <input
            @input="onChangeSearchInput"
            class="border rounded-md py-2 pl-11 pr-4 outline-none focus:border-gray-400"
            type="text"
            placeholder="Поиск..."
          />
        </div>
      </div>
    </div>

    <!-- Список товаров -->
    <div class="mt-10">
      <CardList :items="items" @add-to-favorite="addToFavorite" @add-to-cart="onClickAddPlus" />
    </div>
    <div class="mt-10">
      <Footer />
    </div>
    <!-- Модальное окно для выбора размера -->
    <div v-if="showModal" class="modal-overlay" @click.self="cancelModal">
      <div class="modal">
        <h3 class="text-xl mb-4">
          Выберите размер для {{ selectedProduct ? selectedProduct.title : '' }}
        </h3>
        <select v-model="selectedSize" class="py-2 px-3 border rounded-md outline-none">
          <option disabled value="">Выберите размер</option>
          <!-- Если у товара нет своих размеров, используются дефолтные -->
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
          <button @click="cancelModal" class="py-2 px-4 bg-gray-300 text-black rounded">
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

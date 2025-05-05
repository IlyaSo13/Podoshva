<script setup>
import { reactive, watch, ref, onMounted, computed } from 'vue'
import axios from 'axios'
import debounce from 'lodash.debounce'
import { inject } from 'vue'
import CardList from '../components/CardList.vue'
import CarouselBanner from '../components/CarouselBanner.vue'
import Footer from '../components/Footer.vue'

// Получаем глобальные методы для корзины
const { cart, addToCart, removeFromCart } = inject('cart')

// Список товаров, полученных с сервера
const items = ref([])

// Результат сортировки и поиска – фильтры
const filters = reactive({
  sortBy: 'title',
  searchQuery: ''
})

// Результаты запроса избранного: здесь храним оригинальные данные (например, id записи и item_id)
const rawFavorites = ref([])

// Модальное окно для выбора размера при добавлении в корзину
const showModal = ref(false)
const selectedProduct = ref(null)
const selectedSize = ref('')

// Функция открытия модального окна для выбора размера
const openModalForProduct = (product) => {
  selectedProduct.value = product
  showModal.value = true
}

// Если товар не добавлен в корзину – открываем модальное окно, иначе – удаляем его из корзины
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

// Функция для добавления/удаления в избранное, привязанная к отдельной кнопке
const addToFavorite = async (item) => {
  try {
    if (!item.isFavorite) {
      const obj = { item_id: item.id }
      item.isFavorite = true
      const { data } = await axios.post(`https://fc92f27366340adc.mokky.dev/favorites`, obj)
      // Сохраняем favoriteId как id записи избранного
      item.favoriteId = data.id
      rawFavorites.value.push({ item_id: item.id, id: data.id })
    } else {
      item.isFavorite = false
      await axios.delete(`https://fc92f27366340adc.mokky.dev/favorites/${item.favoriteId}`)
      rawFavorites.value = rawFavorites.value.filter((fav) => fav.item_id !== item.id)
      item.favoriteId = null
    }
  } catch (err) {
    console.log(err)
  }
}

const fetchFavorites = async () => {
  try {
    const { data: favoritesData } = await axios.get(`https://fc92f27366340adc.mokky.dev/favorites`)
    rawFavorites.value = favoritesData
  } catch (err) {
    console.log(err)
  }
}

const fetchItems = async () => {
  try {
    const params = { sortBy: filters.sortBy }
    if (filters.searchQuery) {
      params.title = `*${filters.searchQuery}*`
    }
    const { data } = await axios.get(`https://fc92f27366340adc.mokky.dev/items`, { params })
    // Инициализируем данные товара: флаги избранного и добавления в корзину будут подставлены позже через computed
    items.value = data.map((obj) => ({
      ...obj,
      isFavorite: false,
      favoriteId: null,
      isAdded: false,
      sizes: obj.sizes || ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
    }))
  } catch (err) {
    console.log(err)
  }
}

// Вычисляемое свойство, которое возвращает итоговый список товаров с актуальными состояниями:
// - Для isFavorite и favoriteId – проверяем в rawFavorites
// - Для isAdded – сравниваем с данными из корзины (cart)
const displayedItems = computed(() => {
  return items.value.map((item) => {
    const fav = rawFavorites.value.find((fav) => fav.item_id === item.id)
    return {
      ...item,
      isFavorite: !!fav,
      favoriteId: fav ? fav.id : null,
      isAdded: cart.value.some((cartItem) => cartItem.id === item.id)
    }
  })
})

// Функция подтверждения добавления товара в корзину с выбранным размером
const confirmAddToCart = () => {
  if (selectedProduct.value && selectedSize.value) {
    const productWithSize = {
      ...selectedProduct.value,
      selectedSize: selectedSize.value
    }
    addToCart(productWithSize)
    // Обновляем локальное состояние товара
    items.value = items.value.map((item) =>
      item.id === productWithSize.id ? { ...item, isAdded: true } : item
    )
    selectedProduct.value = null
    selectedSize.value = ''
    showModal.value = false
  } else {
    alert('Пожалуйста, выберите размер!')
  }
}

// Функция закрытия модального окна
const cancelModal = () => {
  showModal.value = false
  selectedProduct.value = null
  selectedSize.value = ''
}

onMounted(async () => {
  // Загрузка корзины из localStorage
  const localCart = localStorage.getItem('cart')
  cart.value = localCart ? JSON.parse(localCart) : []
  await fetchItems()
  await fetchFavorites()
})

watch(cart, () => {
  // Обновляем флаг isAdded у товаров при изменении корзины
  items.value = items.value.map((item) => ({
    ...item,
    isAdded: cart.value.some((cartItem) => cartItem.id === item.id)
  }))
})

// При изменении фильтров (например, сортировки или поиска) заново загружаем товары
watch(filters, fetchItems)
</script>

<template>
  <div>
    <CarouselBanner />
    <!-- Шапка страницы: сортировка и поиск -->
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
    <!-- Передаем карточкам вычисляемый массив displayedItems, благодаря которому состояние избранного корректно отображается -->
    <div class="mt-10">
      <CardList
        :items="displayedItems"
        @add-to-favorite="addToFavorite"
        @add-to-cart="onClickAddPlus"
      />
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

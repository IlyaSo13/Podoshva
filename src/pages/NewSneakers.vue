<script setup>
import { reactive, watch, ref, onMounted, computed } from 'vue'
import axios from 'axios'
import debounce from 'lodash.debounce'
import { inject } from 'vue'
import CardList from '../components/CardList.vue'
import Footer from '../components/Footer.vue'

// Получаем глобальные методы для работы с корзиной
const { cart, addToCart, removeFromCart } = inject('cart')

// Функция для извлечения cookie по имени
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Функция для декодирования JWT
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Ошибка декодирования токена:', e);
    return null;
  }
}

// Вместо получения токена из localStorage теперь получаем его из куки
const token = getCookie('apiToken')
// currentUser хранится в реактивной переменной.
const currentUser = ref(token ? parseJwt(token) : null);

// Вычисляемое свойство для проверки авторизации
const isUserAuthorized = computed(() => !!(currentUser.value && currentUser.value.id));

// Список товаров
const items = ref([]);

// Фильтры для сортировки и поиска
const filters = reactive({
  sortBy: 'title',
  searchQuery: ''
});

// Модальные переменные для выбора размера при добавлении в корзину
const showModal = ref(false)
const selectedProduct = ref(null)
const selectedSize = ref('')

// Функция открытия модального окна для выбора размера
const openModalForProduct = (product) => {
  selectedProduct.value = product
  showModal.value = true
}

// Обработчик добавления в корзину: если товар ещё не добавлен – открываем модальное окно, иначе – удаляем
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

// Функция добавления/удаления товара в избранное с привязкой к текущему пользователю
const addToFavorite = async (item) => {
  // Если пользователь не авторизован – выводим сообщение и выходим
  if (!currentUser.value || !currentUser.value.id) {
    alert('Пожалуйста, войдите в систему, чтобы добавить товар в избранное.')
    return
  }
  try {
    if (!item.isFavorite) {
      const obj = {
        item_id: item.id,
        user_id: currentUser.value.id
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

// Функция загрузки избранного (с фильтром по текущему пользователю)
const fetchFavorites = async () => {
  try {
    let url = `https://fc92f27366340adc.mokky.dev/favorites`
    if (currentUser.value && currentUser.value.id) {
      url += `?user_id=${currentUser.value.id}`
    }
    const { data: favoritesData } = await axios.get(url)
    // Обновляем флаг isFavorite в товарах на основе полученных записей избранного
    items.value = items.value.map((item) => {
      const favorite = favoritesData.find((favorite) => favorite.item_id === item.id)
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
    const params = { sortBy: filters.sortBy }
    if (filters.searchQuery) {
      params.title = `*${filters.searchQuery}*`
    }
    const { data } = await axios.get(`https://fc92f27366340adc.mokky.dev/items?categories=new`, { params })
    
    // Инициализируем товары с дефолтными значениями для избранного и корзины
    items.value = data.map((obj) => ({
      ...obj,
      isFavorite: false,
      favoriteId: null,
      isAdded: false,
      sizes: obj.sizes || ['36','37','38', '39', '40', '41', '42', '43', '44', '45']
    }))
  } catch (err) {
    console.log(err)
  }
}

// Функция подтверждения добавления товара с выбранным размером в корзину
const confirmAddToCart = () => {
  if (selectedProduct.value && selectedSize.value) {
    const productWithSize = { ...selectedProduct.value, selectedSize: selectedSize.value }
    addToCart(productWithSize)
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

const closeModal = () => {
  showModal.value = false
  selectedProduct.value = null
  selectedSize.value = ''
}

// При монтировании загружаем корзину, товары и избранное
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

// Если корзина меняется, обновляем флаг isAdded у товаров
watch(cart, () => {
  items.value = items.value.map((item) => ({
    ...item,
    isAdded: cart.value.some((cartItem) => cartItem.id === item.id)
  }))
})

// При изменении фильтров загружаем товары (fetchItems)
watch(filters, fetchItems)

// Важный момент: при выходе из аккаунта (currentUser становится null),
// снимаем локальные пометки о том, что товар избран (isFavorite)
// Но при этом записи на сервере остаются, их можно увидеть в списке аккаунта.
watch(isUserAuthorized, (newVal) => {
  if (!newVal) {
    // Если пользователь не авторизован, обновляем все товары,
    // снимая пометки избранного.
    items.value = items.value.map(item => ({
      ...item,
      isFavorite: false,
      favoriteId: null
    }))
  }
})
</script>

<template>
  <div>
    <!-- Шапка страницы -->
    <div class="flex justify-between items-center">
      <h2 class="text-3xl font-bold mt-4">Новые поступления</h2>
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

    <!-- Список товаров; передаем в CardList флаг isAuthorized -->
    <div class="mt-10">
      <CardList 
        :items="items" 
        :isAuthorized="isUserAuthorized"
        @add-to-favorite="addToFavorite" 
        @add-to-cart="onClickAddPlus" 
      />
    </div>
    <div class="mt-10">
      <Footer />
    </div>

    <!-- Модальное окно выбора размера -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3 class="text-xl mb-4">
          Выберите размер для {{ selectedProduct ? selectedProduct.title : '' }}
        </h3>
        <select v-model="selectedSize" class="py-2 px-3 border rounded-md outline-none">
          <option disabled value="">Выберите размер</option>
          <option
            v-for="size in selectedProduct && selectedProduct.sizes ? selectedProduct.sizes : ['38','39','40','41','42']"
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
          <button 
            @click="closeModal" 
            class="py-2 px-4 bg-gray-300 text-black rounded"
          >
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

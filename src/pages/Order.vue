<template>
  <div class="order-page">
    <!-- Шапка страницы -->
    <header class="py-6">
      <h1 class="text-3xl font-bold text-center">Оформление заказа</h1>
    </header>

    <!-- Основной контент -->
    <main class="container mx-auto px-4 py-8">
      <!-- Если заказ успешно оформлен, показываем подтверждение -->
      <div v-if="orderMessage" class="order-confirmation text-center">
        <img src="/order-success-icon.png" alt="Заказ оформлен" class="mx-auto mb-4 w-32" />
        <p class="mb-4 text-lg font-semibold">{{ orderMessage }}</p>
        <button @click="goToHome" class="py-2 px-4 rounded bg-green-500 text-white">
          На главную
        </button>
      </div>

      <!-- Иначе отображаем обычный контент заказа -->
      <div v-else>
        <!-- Секция с товарами заказа -->
        <section class="order-items mb-8">
          <h2 class="text-2xl font-semibold mb-4">Ваши товары</h2>
          <div v-if="orderItems.length > 0" class="space-y-4">
            <div
              v-for="item in orderItems"
              :key="item.id"
              class="order-item border-b py-2 flex items-center"
            >
              <!-- Отображаем изображение товара -->
              <img
                :src="item.imageUrl"
                alt="Изображение товара"
                class="w-27 h-20 object-cover mr-3 border rounded"
              />
              <div>
                <p class="font-bold">{{ item.title }}</p>
                <p>Размер: {{ item.size }}, Количество: {{ item.quantity }}</p>
              </div>
              <div class="ml-auto font-bold">
                <p>{{ item.price }} ₽</p>
              </div>
            </div>
          </div>
          <div v-else>
            <p>Нет товаров для оформления заказа</p>
          </div>
        </section>

        <!-- Секция итоговой суммы заказа -->
        <section class="order-summary mb-8">
          <h2 class="text-2xl font-semibold mb-4">Сумма заказа</h2>
          <p>Стоимость товаров: {{ totalPrice }} ₽</p>
          <p>Доставка: {{ shippingCost }} ₽</p>
          <p class="font-bold text-lg">Итого: {{ grandTotal }} ₽</p>
        </section>

        <!-- Форма с деталями заказа -->
        <section class="order-form mb-8">
          <h2 class="text-2xl font-semibold mb-4">Детали заказа</h2>
          <form @submit.prevent="submitOrder" class="space-y-4">
            <div>
              <label for="address" class="block mb-1">Адрес доставки</label>
              <input
                v-model="orderData.address"
                type="text"
                id="address"
                placeholder="Введите адрес"
                required
                class="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label for="shipping" class="block mb-1">Способ доставки</label>
              <select
                v-model="orderData.shippingMethod"
                id="shipping"
                required
                class="w-full p-2 border rounded"
              >
                <option disabled value="">Выберите способ доставки</option>
                <option value="standard">Стандартная (0 ₽)</option>
                <option value="express">Экспресс (600 ₽)</option>
              </select>
            </div>

            <div>
              <label for="paymentMethod" class="block mb-1">Способ оплаты</label>
              <select
                v-model="orderData.paymentMethod"
                id="paymentMethod"
                required
                class="w-full p-2 border rounded"
              >
                <option disabled value="">Выберите способ оплаты</option>
                <option value="cash">При получении</option>
                <option value="online">Онлайн-оплата</option>
              </select>
            </div>

            <!-- Платёжные данные -->
            <div v-if="orderData.paymentMethod === 'online'" class="space-y-4">
              <div>
                <label for="cardNumber" class="block mb-1">Номер карты</label>
                <input
                  v-model="orderData.cardNumber"
                  type="text"
                  id="cardNumber"
                  placeholder="Введите номер карты"
                  maxlength="16"
                  required
                  inputmode="numeric"
                  pattern="\d*"
                  @input="orderData.cardNumber = orderData.cardNumber.replace(/\D/g, '')"
                  class="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label for="cardExpiry" class="block mb-1">Срок действия</label>
                <input
                  v-model="orderData.cardExpiry"
                  type="text"
                  id="cardExpiry"
                  placeholder="MM/YY"
                  maxlength="4"
                  required
                  inputmode="numeric"
                  pattern="\d*"
                  @input="orderData.cardExpiry = orderData.cardExpiry.replace(/\D/g, '')"
                  class="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label for="cardCVV" class="block mb-1">CVV</label>
                <input
                  v-model="orderData.cardCVV"
                  type="password"
                  id="cardCVV"
                  placeholder="Введите CVV"
                  maxlength="3"
                  required
                  inputmode="numeric"
                  pattern="\d*"
                  @input="orderData.cardCVV = orderData.cardCVV.replace(/\D/g, '')"
                  class="w-full p-2 border rounded"
                />
              </div>
            </div>

            <button
              type="submit"
              class="w-full py-3 rounded bg-green-500 text-white transition"
              :disabled="isSubmitting"
            >
              Подтвердить заказ
            </button>
          </form>
        </section>

        <!-- Вывод ошибок -->
        <div v-if="errorMessage" class="p-4 bg-red-100 text-red-800 rounded mb-4">
          {{ errorMessage }}
        </div>
      </div>
    </main>

    <!-- Подвал -->
    <footer class="mt-8">
      <Footer />
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Footer from '../components/Footer.vue'
import Cookies from 'js-cookie'

// Функция для декодирования JWT без сторонних библиотек
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

// Получаем токен из cookies (ключ "accessToken")
const token = Cookies.get('apiToken')

// Декодируем токен вручную – если структура вашего токена отличается, при необходимости измените логику
let account = { id: 'guest', name: 'Гость', email: 'guest@example.com' }
if (token) {
  const decoded = parseJwt(token)
  if (decoded) {
    account = {
      id: decoded.id || (decoded.user && decoded.user.id) || 'guest',
      name: decoded.name || (decoded.user && decoded.user.name) || 'Гость',
      email: decoded.email || (decoded.user && decoded.user.email) || 'guest@example.com'
    }
  }
}
console.log('Account data из токена:', account)

// Извлекаем данные заказа из query-параметров
const route = useRoute()
let parsedItems = []
if (route.query.orderItems) {
  try {
    parsedItems = JSON.parse(route.query.orderItems)
  } catch (e) {
    console.error('Ошибка парсинга orderItems', e)
    parsedItems = []
  }
}
const orderItems = ref(parsedItems)

// Если totalPrice переданы через query, используем их; иначе задаём 0
const queryTotalPrice = Number(route.query.totalPrice) || 0
const totalPrice = ref(queryTotalPrice)

// Форма с деталями заказа
const orderData = ref({
  address: '',
  shippingMethod: '',
  paymentMethod: '',
  cardNumber: '',
  cardExpiry: '',
  cardCVV: ''
})

// Вычисляем стоимость доставки
const shippingCost = computed(() => {
  if (orderData.value.shippingMethod === 'standard') return 0
  if (orderData.value.shippingMethod === 'express') return 600
  return 0
})

// Итоговая сумма заказа
const grandTotal = computed(() => totalPrice.value + shippingCost.value)

// Флаги для состояния отправки и сообщений
const orderMessage = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const router = useRouter()

// Функция для перехода на главную страницу
const goToHome = () => {
  router.push('/')
}

// Функция отправки заказа на сервер MOKKY
const submitOrder = async () => {
  if (orderItems.value.length === 0) {
    errorMessage.value = 'Нет товаров для оформления заказа.'
    return
  }
  if (
    !orderData.value.address ||
    !orderData.value.shippingMethod ||
    !orderData.value.paymentMethod
  ) {
    errorMessage.value = 'Пожалуйста, заполните все обязательные поля.'
    return
  }
  if (
    orderData.value.paymentMethod === 'online' &&
    (!orderData.value.cardNumber || !orderData.value.cardExpiry || !orderData.value.cardCVV)
  ) {
    errorMessage.value = 'Пожалуйста, заполните платежные данные.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  orderMessage.value = ''

  const orderDate = new Date().toISOString()

  // Формируем payload заказа, добавляя название и изображение каждого товара
  const payload = {
    items: orderItems.value.map((item) => ({
      id: item.id,
      title: item.title, // Название товара
      image: item.image, // Ссылка на изображение товара
      quantity: item.quantity,
      size: item.size,
      price: item.price
    })),
    totalPrice: totalPrice.value,
    shippingCost: shippingCost.value,
    grandTotal: grandTotal.value,
    date: orderDate,
    orderDetails: {
      address: orderData.value.address,
      shippingMethod: orderData.value.shippingMethod,
      paymentMethod: orderData.value.paymentMethod,
      cardNumber: orderData.value.paymentMethod === 'online' ? orderData.value.cardNumber : null,
      cardExpiry: orderData.value.paymentMethod === 'online' ? orderData.value.cardExpiry : null,
      cardCVV: orderData.value.paymentMethod === 'online' ? orderData.value.cardCVV : null
    },
    account: {
      id: account.id,
      name: account.name,
      email: account.email
    },
    status: 'pending'
  }

  try {
    const response = await axios.post('https://fc92f27366340adc.mokky.dev/orders', payload)
    orderMessage.value = `Заказ успешно оформлен! Индивидуальный номер заказа: ${response.data.id}`
    localStorage.removeItem('cart')
  } catch (err) {
    console.error('Ошибка отправки заказа:', err)
    errorMessage.value = 'Произошла ошибка при оформлении заказа. Попробуйте ещё раз.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.order-page {
  font-family: Arial, sans-serif;
  color: #333;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
.order-item {
  /* настройте стили по необходимости */
}

/* Изменение цвета всех кнопок на странице на #84cc16 */
.order-page button {
  background-color: #84cc16 !important;
}
.order-page button:hover {
  background-color: #84cc16 !important;
}
</style>

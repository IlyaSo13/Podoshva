<template>
  <div class="page-container">
    <div class="profile">
      <h2 class="text-2xl font-bold mb-4">Информация о пользователе</h2>

      <!-- Форма входа -->
      <form v-if="!user" @submit.prevent="handleLogin">
        <div>
          <label for="email">Email: </label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <div>
          <label for="password">Пароль: </label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <button type="submit">Войти</button>
        <router-link to="/registration">
          <li class="flex items-center cursor-pointer gap-3 text-gray-500 hover:text-black">
            <span>Регистрация</span>
          </li>
        </router-link>
      </form>

      <!-- Ошибка авторизации -->
      <p v-if="error" class="error">{{ error }}</p>

      <!-- Информация о пользователе -->
      <div v-if="user" class="user-info mt-6 p-4 border rounded-lg bg-gray-100">
        <h3 class="text-xl font-semibold">Ваш профиль</h3>
        <p><strong>Имя:</strong> {{ user.name }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <button @click="handleLogout" class="mt-4 px-4 py-2 bg-red-500 text-white rounded">
          Выйти
        </button>
      </div>

      <!-- Список заказов -->
      <div v-if="userOrders.length > 0" class="orders mt-6">
        <h3 class="text-xl font-semibold">Мои заказы</h3>
        <div v-for="order in userOrders" :key="order.id" class="order-card">
          <h4 class="text-lg font-bold">Заказ #{{ order.id }}</h4>
          <p class="text-gray-600">
            Дата:
            {{
              new Date(order.date).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })
            }}
          </p>
          <ul>
            <li v-for="item in order.items" :key="item.id" class="order-item">
              {{ item.title }}, {{ item.size }} размер - {{ item.quantity }} шт.
            </li>
          </ul>
          <p class="text-green-600 font-semibold">Сумма: {{ order.totalPrice }} ₽</p>
        </div>
      </div>

      <!-- Сообщение о пустом списке заказов -->
      <div v-else-if="user && userOrders.length === 0">
        <p class="text-gray-500 mt-4">У вас пока нет заказов.</p>
      </div>

      <!-- Загрузка данных -->
      <div v-else-if="loading">Загрузка данных пользователя...</div>
    </div>

    <Footer />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import Footer from '../components/Footer.vue'

export default {
  name: 'Profile',
  components: { Footer },
  setup() {
    const email = ref('')
    const password = ref('')
    const error = ref('')
    const router = useRouter()

    const user = ref(null)
    const loading = ref(false)
    const userOrders = ref([])

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}.${month}.${year}`
    }

    // Функция авторизации
    const handleLogin = async () => {
      error.value = ''
      try {
        const response = await axios.post(
          'https://fc92f27366340adc.mokky.dev/auth',
          { email: email.value, password: password.value },
          { withCredentials: true }
        )
        const token = response.data.token
        Cookies.set('apiToken', token, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
        await fetchUserData()
        await fetchUserOrders()
      } catch (err) {
        console.error(err)
        error.value = 'Ошибка авторизации. Проверьте введенные данные.'
      }
    }

    // Функция загрузки данных пользователя
    const fetchUserData = async () => {
      loading.value = true
      try {
        const token = Cookies.get('apiToken')
        if (!token) return

        const response = await fetch('https://fc92f27366340adc.mokky.dev/auth_me', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        })

        const json = await response.json()
        if (!response.ok) throw new Error(json.message || 'Ошибка загрузки пользователя')

        user.value = json
      } catch (err) {
        console.error(err)
        error.value = 'Не удалось загрузить данные пользователя. Попробуйте снова.'
      } finally {
        loading.value = false
      }
    }

    // Функция загрузки заказов пользователя
    const fetchUserOrders = async () => {
      try {
        const token = Cookies.get('apiToken')
        if (!token) return

        const { data: orders } = await axios.get('https://fc92f27366340adc.mokky.dev/orders', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const userData = await axios.get('https://fc92f27366340adc.mokky.dev/auth_me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const userId = userData.data.id
        console.log(orders)

        userOrders.value = orders.filter((order) => order.account.id === userId)
      } catch (err) {
        console.error('Ошибка загрузки заказов:', err)
      }
    }

    // Функция выхода
    const handleLogout = () => {
      Cookies.remove('apiToken')
      user.value = null
      userOrders.value = []
      router.push({ name: 'Login' })
    }

    // При монтировании загружаем данные пользователя и его заказы
    onMounted(() => {
      const token = Cookies.get('apiToken')
      if (token) {
        fetchUserData()
        fetchUserOrders()
      }
    })

    return {
      email,
      password,
      handleLogin,
      handleLogout,
      error,
      user,
      loading,
      userOrders
    }
  }
}
</script>

<style scoped>
.orders {
  margin-top: 20px;
}

.order-card {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 15px;
}

.order-item {
  margin-left: 15px;
}
</style>

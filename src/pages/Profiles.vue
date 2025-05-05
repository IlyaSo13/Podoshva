<template>
  <div class="page-container">
    <div class="profile">
      <h2 class="text-2xl font-bold mb-4">Информация о пользователе</h2>

      <!-- Если пользователь НЕ авторизован, показываем форму входа -->
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

      <!-- Сообщение об ошибке показывается только когда оно заполнено -->
      <p v-if="error" class="error">{{ error }}</p>

      <!-- Блок информации о пользователе -->
      <div v-if="user" class="user-info mt-6 p-4 border rounded-lg bg-gray-100">
        <h3 class="text-xl font-semibold">Ваш профиль</h3>
        <p><strong>Имя:</strong> {{ user.name }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <button @click="handleLogout" class="mt-4 px-4 py-2 bg-red-500 text-white rounded">
          Выйти
        </button>
      </div>

      <!-- Индикатор загрузки, если данные ещё грузятся -->
      <div v-else-if="loading">Загрузка данных пользователя...</div>
    </div>

    <!-- Подвал вынесен за пределы блока profile -->
    <Footer />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import Footer from '../components/Footer.vue' // Подключаем подвал

export default {
  name: 'Profile',
  components: { Footer }, // Регистрируем компонент подвала
  setup() {
    const email = ref('')
    const password = ref('')
    const error = ref('')
    const router = useRouter()

    const user = ref(null)
    const loading = ref(false)

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
        await fetchUserData() // Загружаем пользователя сразу после входа
      } catch (err) {
        console.error(err)
        error.value = 'Ошибка авторизации. Проверьте введенные данные.'
      }
    }

    // Функция загрузки данных пользователя
    const fetchUserData = async () => {
      loading.value = true
      try {
        const token = Cookies.get('apiToken') // Получаем токен из куки
        if (!token) {
          // Если токена нет, просто завершаем функцию без ошибки
          return
        }

        const response = await fetch('https://fc92f27366340adc.mokky.dev/auth_me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const json = await response.json()

        if (!response.ok) {
          throw new Error(json.message || 'Ошибка загрузки пользователя')
        }

        user.value = json // Сохраняем данные пользователя
      } catch (err) {
        console.error(err)
        error.value = 'Не удалось загрузить данные пользователя. Попробуйте снова.'
      } finally {
        loading.value = false
      }
    }

    // Функция выхода
    const handleLogout = () => {
      Cookies.remove('apiToken')
      user.value = null
      router.push({ name: 'Login' })
    }

    // При монтировании вызываем загрузку ПО ТОЛЬКО если есть токен
    onMounted(() => {
      const token = Cookies.get('apiToken')
      if (token) {
        fetchUserData()
      }
    })

    return {
      email,
      password,
      handleLogin,
      handleLogout,
      error,
      user,
      loading
    }
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: auto; /* Вместо фиксированной высоты */
}

.profile {
  flex-grow: 1; /* Убираем фиксированную высоту и позволяем контенту расширяться */
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.error {
  color: red;
  margin-top: 10px;
}

.user-info {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 4px;
  background: #f8f8f8;
}

button {
  cursor: pointer;
}
</style>
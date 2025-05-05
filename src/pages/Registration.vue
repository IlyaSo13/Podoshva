<template>
  <div class="page-container">
    <div class="login">
      <form @submit.prevent="handleLogin">
        <div>
          <label for="name">Имя: </label>
          <input type="text" id="name" v-model="name" required />
        </div>
        <div>
          <label for="email">Email: </label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <div>
          <label for="password">Пароль: </label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <button type="submit">Зарегистрироваться</button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
      
      <!-- Кнопка (ссылка) для перехода на страницу профиля (входа) -->
      <router-link to="/Profiles" class="already-registered">
        Я уже зарегистрирован!
      </router-link>
    </div>

    <!-- Подвал вынесен за пределы блока регистрации -->
    <Footer />
  </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import Cookies from "js-cookie";
import Footer from "../components/Footer.vue"; // Убедитесь, что путь корректный

export default {
  name: "Registration",
  components: { Footer },
  setup() {
    const name = ref("");
    const email = ref("");
    const password = ref("");
    const error = ref("");
    const router = useRouter();

    const handleLogin = async () => {
      error.value = "";
      try {
        const response = await axios.post(
          "https://fc92f27366340adc.mokky.dev/register",
          {
            name: name.value,
            email: email.value,
            password: password.value,
          },
          { withCredentials: true }
        );
        const token = response.data.token;
        // Сохраняем токен в куки на 7 дней
        Cookies.set("apiToken", token, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
        router.push({ name: "Home" });
      } catch (err) {
        console.error(err);
        error.value = "Ошибка регистрации. Проверьте введённые данные.";
      }
    };

    return {
      name,
      email,
      password,
      handleLogin,
      error,
    };
  },
};
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
}

.login {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.error {
  color: red;
  margin-top: 10px;
}

/* Стили для кнопки "Я уже зарегистрирован!" */
.already-registered {
  display: inline-block;
  cursor: pointer;
}

</style>
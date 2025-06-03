<template>
  <div class="page-container">
<div class="register-form">
  <form @submit.prevent="handleLogin">
    <div class="input-group">
      <label for="name">Имя</label>
      <input type="text" id="name" v-model="name" required class="auth-input" />
    </div>
    <div class="input-group">
      <label for="email">Email</label>
      <input type="email" id="email" v-model="email" required class="auth-input" />
    </div>
    <div class="input-group">
      <label for="password">Пароль</label>
      <input type="password" id="password" v-model="password" required class="auth-input" />
    </div>
    <button type="submit" class="auth-button">Зарегистрироваться</button>
  </form>

  <p v-if="error" class="error">{{ error }}</p>

  <!-- Ссылка для входа -->
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
import Footer from "../components/Footer.vue"; 

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
    
        router.push({ name: "Profiles" });
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

/* Стили для кнопки "Я уже зарегистрирован!" */
.already-registered {
  display: inline-block;
  cursor: pointer;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%; 
  max-width: 400px;
  margin: auto;
  padding: 24px;
  border-radius: 12px;
  background: #f9f9f9;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.auth-input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
  font-size: 16px;
  transition: border 0.3s;
}

.auth-input:focus {
  border: 1px solid #84cc16;
}

.auth-button {
  background-color: #84cc16;
  color: white;
  font-size: 16px;
  margin-top: 30px;
  margin-left: 90px;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.auth-button:hover {
  background-color: #5fa30b;
}

.error {
  color: red;
  font-size: 14px;
  text-align: center;
}

.already-registered {
  text-align: center;
  color: #555;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.3s;
}

.already-registered:hover {
  color: black;
}


</style>
<template>
  <div class="contact-page page-container">
    <h1 class="text-3xl font-bold text-center mb-6">Контакты компании</h1>
    <p class="text-center mb-8">
      Мы всегда рады общению с вами! Свяжитесь с нами любым удобным способом.
    </p>
    <div class="contact-details max-w-3xl mx-auto px-4">
      <ul class="space-y-4 text-lg">
        <li>
          <strong>Адрес:</strong> г. Москва, Нижний Сусальный переулок, д.5, к.18, эт.4, пом.1,
          ком.5
        </li>
        <li><strong>Телефон:</strong> +7 (909) 272-58-89</li>
        <li>
          <strong>Email:</strong>
          <a> ilya.sou@yandex.ru </a>
        </li>
        <li><strong>Часы работы:</strong> Понедельник – Пятница: 9:00 — 20:00</li>
        <li>
          <strong>Telegram:</strong>
          <a href="https://t.me/IlyaSo13_official" class="text-blue-600 hover:underline">
            https://t.me/IlyaSo13_official
          </a>
        </li>
      </ul>
    </div>
    <div class="map mt-8 max-w-3xl mx-auto px-4">
      <!-- Пример встроенной карты; замените src на актуальный для вашей компании или удалите этот блок -->
      <iframe
        class="w-full h-64 rounded-lg border-0"
        src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d561.2441848236774!2d37.66469229974581!3d55.7589062753513!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sfr!4v1746450914132!5m2!1sen!2sfr"
        allowfullscreen
        loading="lazy"
      ></iframe>
    </div>

    <!-- Подвал страницы, ведущий к разделам сайта через router -->
    <Footer />
  </div>
</template>

<script setup>
import Footer from '../components/Footer.vue'
</script>

<style scoped>
.page-container {
  padding: 2rem;
  /* Можно задать max-width, margin, фон и прочее для общего контейнера */
}
</style>

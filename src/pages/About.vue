<template>
  <div class="about-page page-container">
    <h1 class="text-3xl font-bold text-center mb-6">О нас</h1>
    <div class="content max-w-3xl mx-auto px-4">
      <section class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">Наша История</h2>
        <p class="mb-4">
          Добро пожаловать в магазин «Подошва»! Наша компания зародилась с мечты создать идеальное
          место, где каждый сможет подобрать качественные и стильные кроссовки. Мы молодая команда
          готовая которая знает что нужно современному покупателю и с каждым днём мы становимся
          лучше. Мы предлагаем клиентам лучшие модели обуви от ведущих брендов.
        </p>
        <p>
          Мы гордимся тем, как много усилий вкладываем в создание уютной, безопасной и
          профессиональной атмосферы для наших клиентов.
        </p>
      </section>

      <section class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">Наша Миссия</h2>
        <p>
          Наша миссия – привнести комфорт и стиль в жизнь каждого человека через качественную обувь.
          Мы стремимся предлагать только лучшее, заботясь о том, чтобы каждый клиент чувствовал
          уверенность и удовольствие от покупок.
        </p>
      </section>

      <section class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">Наша Команда</h2>
        <p>
          За каждым успехом нашей компании стоит профессиональная команда экспертов которые
          ежедневно работают для того, чтобы вы получали высокий уровень сервиса.
        </p>
      </section>

      <section class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">Наши Ценности</h2>
        <ul class="list-disc list-inside">
          <li>Качество и инновации</li>
          <li>Открытость и честность</li>
          <li>Клиентоориентированность</li>
          <li>Постоянное развитие</li>
        </ul>
      </section>
    </div>

    <!-- Подвал страницы, ведущий к разделам сайта через маршруты -->
    <Footer />
  </div>
</template>

<script setup>
import Footer from '../components/Footer.vue'
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

.content h2 {
  color: #444;
}
</style>

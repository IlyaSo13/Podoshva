<template>
    <div class="carousel-container relative overflow-hidden">
      <transition name="fade" mode="out-in">
        <div :key="slides[activeIndex].id" class="slide relative h-full">
          <img
            :src="slides[activeIndex].image"
            alt="Banner Image"
            class="w-full h-full object-cover"
          />
          <div
            class="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40"
          >
            <h1 class="text-white text-4xl font-bold mb-2">
              {{ slides[activeIndex].title }}
            </h1>
            <p class="text-white text-lg">
              {{ slides[activeIndex].subtitle }}
            </p>
          </div>
        </div>
      </transition>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from "vue";
  
  // Список слайдов для баннера. В примере первый слайд использует загруженное изображение.
  // Замените пути к изображениям на актуальные для вашего проекта.
  const slides = ref([
    {
      id: 1,
      image: "/trand2025-1920x780x.jpg",
      title: "Добро пожаловать в наш магазин кроссовок!",
      subtitle: "Здесь вы найдете последние тренды 2025 года.",
    },
    {
      id: 2,
      image: "/9.jpg",
      title: "Эксклюзивные модели",
      subtitle: "Лучшие предложения этой недели.",
    },
    {
      id: 3,
      image: "/7.jpg",
      title: "Новинки сезона",
      subtitle: "Будь в тренде с самыми свежими поступлениями.",
    },
  ]);
  
  // Индекс текущего слайда
  const activeIndex = ref(0);
  
  let intervalId = null;
  
  onMounted(() => {
    // Автоматическая смена слайда каждые 5 секунд (5000 мс)
    intervalId = setInterval(() => {
      activeIndex.value = (activeIndex.value + 1) % slides.value.length;
    }, 5000);
  });
  
  onUnmounted(() => {
    clearInterval(intervalId);
  });
  </script>
  
  <style scoped>
  .carousel-container {
    /* Высоту баннера можно регулировать, здесь задано 300px */
    height: 525px;
    border-radius: 8px;
    top: -15px;
  }
  
  /* Эффект плавного появления/исчезновения слайда */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 1s;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>
  
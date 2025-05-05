<script setup>
const props = defineProps({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  price: { type: Number, required: true },
  isFavorite: { type: Boolean, default: false },
  isAdded: { type: Boolean, default: false },
  onClickFavorite: { type: Function, default: null },
  onClickAdd: { type: Function, default: null }
});
</script>

<template>
  <div
    class="card relative bg-white border border-slate-100 rounded-3xl p-8 cursor-pointer transition hover:-translate-y-2 hover:shadow-xl"
  >
    <!-- Кнопка-сердечко (нажатие не всплывает) -->
    <button
      v-if="onClickFavorite"
      class="heart-button absolute top-8 left-8 z-9 bg-transparent border-0 cursor-pointer"
      @click.stop="onClickFavorite"
    >
      <img
        :src="isFavorite ? '/like-2.svg' : '/like-1.svg'"
        alt="Favorite Icon"
        class="heart-icon"
      />
    </button>

    <img :src="imageUrl" alt="Product Image" class="w-full object-cover rounded-md mb-2" />

    <p class="mt-2 text-lg font-semibold">{{ title }}</p>
    <p class="text-slate-400">Цена: {{ price }} руб.</p>

    <!-- Кнопка добавления в корзину (нажатие не всплывает) -->
    <button
      v-if="onClickAdd"
      class="cart-button mt-4 inline-flex items-center bg-transparent border-0 cursor-pointer"
      @click.stop="onClickAdd"
    >
      <img
        :src="isAdded ? '/checked.svg' : '/plus.svg'"
        alt="Add to Cart Icon"
        class="cart-icon"
      />
    </button>
  </div>
</template>

<style scoped>
.heart-button,
.cart-button {
  pointer-events: auto;
}

/* Увеличиваем иконки до 32px и добавляем drop-shadow для лучшей видимости */
.heart-icon,
.cart-icon {
  width: 32px;
  height: 32px;
  cursor: pointer;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}
</style>

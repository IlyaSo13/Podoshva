<script setup>
import Card from './Card.vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  isFavorites: {
    type: Boolean,
    default: false
  },
  // Новый пропс для авторизации пользователя
  isAuthorized: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['addToFavorite', 'addToCart'])
</script>

<template>
  <div class="grid grid-cols-4 gap-5" v-auto-animate>
    <Card
      v-for="item in items"
      :key="item.id"
      :id="item.id"
      :title="item.title"
      :imageUrl="item.imageUrl"
      :price="item.price"
      :onClickFavorite="isFavorites ? null : () => emit('addToFavorite', item)"
      :onClickAdd="isFavorites ? null : () => emit('addToCart', item)"
      :isFavorite="item.isFavorite"
      :isAdded="item.isAdded"
      :isAuthorized="isAuthorized"
    />
  </div>
</template>

<script setup>
import { inject } from 'vue'
import CartItem from './CartItem.vue'

const { cart, removeFromCart } = inject('cart')
</script>

<template>
  
  <div class="cart-wrapper flex flex-col h-full">
    <!-- Обёртка для списка товаров с прокруткой при переполнении -->
    <div class="cart-items flex-1 overflow-y-auto gap-4" v-auto-animate>
      <CartItem
        v-for="item in cart"
        :key="item.id"
        :title="item.title"
        :price="item.price"
        :image-url="item.imageUrl"
        :size="item.selectedSize"
        @on-click-remove="() => removeFromCart(item)"
      />
    </div>
  </div>
</template>

<style scoped>

.cart-items {
  max-height: 60vh; /* Можно настроить в зависимости от макета */
  overflow-y: auto;
}

</style>
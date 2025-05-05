<script setup>
import { computed, inject, ref } from 'vue'
import { useRouter } from 'vue-router'

import DrawerHead from './DrawerHead.vue'
import CartItemList from './CartItemList.vue'
import InfoBlock from './InfoBlock.vue'

const props = defineProps({
  totalPrice: Number,
  vatPrice: Number
})

const { cart, closeDrawer } = inject('cart')
const router = useRouter()

const isCreating = ref(false)

// Функция создания заказа: собираем orderItems из корзины и передаём их на страницу Order через query-параметры
const createOrder = () => {
  if (cart.value.length === 0) return

  isCreating.value = true

  // Формируем массив товаров с выбранными размерами
  const orderItems = cart.value.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity || 1,
    size: item.selectedSize // передаём выбранный размер
  }))

  // Закрываем корзину
  closeDrawer()

  // Перенаправляем пользователя на страницу Order, передавая данные заказа через query-параметры
  router.push({
    name: 'Order',
    query: {
      orderItems: JSON.stringify(orderItems),
      totalPrice: props.totalPrice,
      vatPrice: props.vatPrice
    }
  })

  isCreating.value = false
}

const cartIsEmpty = computed(() => cart.value.length === 0)
const buttonDisabled = computed(() => isCreating.value || cartIsEmpty.value)
</script>

<template>
  <!-- Затемнение заднего фона -->
  <div class="fixed top-0 left-0 h-full w-full bg-black z-10 opacity-70"></div>
  
  <!-- Корзина (drawer) -->
  <div class="bg-white w-96 h-full fixed right-0 top-0 z-20 p-8">
    <DrawerHead />

    <!-- Если корзина пуста, отображается InfoBlock -->
    <div v-if="cartIsEmpty" class="flex h-full items-center">
      <InfoBlock
        title="Корзина пустая"
        description="Добавьте хотя бы одну пару кроссовок, чтобы сделать заказ."
        image-url="/package-icon.png"
      />
    </div>

    <!-- Если в корзине имеются товары -->
    <div v-else>
      <CartItemList />

      <div class="flex flex-col gap-4 mt-7">
        <div class="flex gap-2">
          <span>Итого:</span>
          <div class="flex-1 border-b border-dashed"></div>
          <b>{{ totalPrice }} ₽</b>
        </div>

        <div class="flex gap-2">
          <span>Налог 5%:</span>
          <div class="flex-1 border-b border-dashed"></div>
          <b>{{ vatPrice }} ₽</b>
        </div>

        <button
          :disabled="buttonDisabled"
          @click="createOrder"
          class="mt-4 transition bg-lime-500 w-full rounded-xl py-3 text-white disabled:bg-slate-300 hover:bg-lime-600 active:bg-lime-700 cursor-pointer"
        >
          Оформить заказ
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-items {
  max-height: 60vh; /* Можно настроить максимальную высоту списка товаров */
  overflow-y: auto;
}
</style>
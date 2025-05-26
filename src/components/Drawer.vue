<script setup>
import { computed, inject, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import DrawerHead from './DrawerHead.vue'
import CartItemList from './CartItemList.vue'
import InfoBlock from './InfoBlock.vue'

const props = defineProps({
  // Поле totalPrice будет вычисляться локально, поэтому его можно не использовать
  vatPrice: Number
})

const { cart, closeDrawer } = inject('cart')
const router = useRouter()

const isCreating = ref(false)

// Функция для извлечения cookie по имени (если понадобится для авторизации)
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Определяем, авторизован ли пользователь (на основе наличия токена)
const isUserAuthorized = computed(() => {
  return !!getCookie('apiToken')
})

// Если пользователь выходит (токен исчезает), очищаем корзину
watch(isUserAuthorized, (newVal) => {
  if (!newVal) {
    cart.value = []  // Очищаем корзину на уровне отображения
  }
})

// Вычисляем итоговую сумму, перемножая цену на количество каждого товара
const computedTotalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
})

// Функция создания заказа. Здесь мы берём товары из корзины, включая актуальное количество.
const createOrder = () => {
  if (cart.value.length === 0) return;

  isCreating.value = true;

  // Формируем массив товаров с исправленной передачей названия и цены
  const orderItems = cart.value.map(item => ({
    id: item.id,
    title: item.title || item.name,  // Исправлено: теперь название точно передаётся
    price: item.price,               // Исправлено: передаётся цена товара
    quantity: item.quantity || 1,     // Количество
    size: item.selectedSize,          // Размер (если есть)
    imageUrl: item.imageUrl           // Изображение товара
  }));

  // Закрываем корзину (drawer), если функция существует
  if (typeof closeDrawer === 'function') closeDrawer();

  // Удаляем данные корзины из localStorage

  // Перенаправляем пользователя на страницу заказа, передавая корректные данные
  router.push({
    name: 'Order',
    query: {
      orderItems: JSON.stringify(orderItems),
      totalPrice: computedTotalPrice.value // Исправлено: цена передаётся правильно
    }
  });
};


const cartIsEmpty = computed(() => cart.value.length === 0)
const buttonDisabled = computed(() => isCreating.value || cartIsEmpty.value)
</script>

<template>
  <!-- Затемнение заднего фона -->
  <div class="fixed top-0 left-0 h-full w-full bg-black z-10 opacity-70"></div>
  
  <!-- Корзина (drawer) -->
  <div class="bg-white w-96 h-full fixed right-0 top-0 z-20 p-8">
    <DrawerHead />

    <!-- Если корзина пуста – выводим InfoBlock -->
    <div v-if="cartIsEmpty" class="flex h-full items-center">
      <InfoBlock
        title="Корзина пустая"
        description="Добавьте хотя бы одну пару кроссовок, чтобы сделать заказ."
        image-url="/package-icon.png"
      />
    </div>

    <!-- Если в корзине имеются товары, показываем список и итоговую сумму -->
    <div v-else>
      <CartItemList />

      <div class="flex flex-col gap-4 mt-7">
        <div class="flex gap-2">
          <span>Итого:</span>
          <div class="flex-1 border-b border-dashed"></div>
          <b>{{ computedTotalPrice }} ₽</b>
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
  max-height: 60vh; /* можно настроить, если это требуется */
  overflow-y: auto;
}
</style>

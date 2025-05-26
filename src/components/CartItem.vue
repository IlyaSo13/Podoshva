<script setup>
import { computed } from 'vue';

const props = defineProps({
  id: Number,
  title: String,
  imageUrl: String,
  price: Number,
  size: String,
  quantity: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits(['onClickRemove', 'onQuantityChange']);

// Организуем двунаправленный computed:
// Геттер возвращает текущее количество; сеттер эмитирует новое значение.
const currentQuantity = computed({
  get() {
    return props.quantity;
  },
  set(newQuantity) {
    if (newQuantity >= 1) {
      emit('onQuantityChange', newQuantity);
    }
  }
});

const decrement = () => {
  if (currentQuantity.value > 1) {
    currentQuantity.value = currentQuantity.value - 1;
  }
};

const increment = () => {
  currentQuantity.value = currentQuantity.value + 1;
};
</script>

<template>
  <div class="flex items-center border border-slate-200 p-4 rounded-xl gap-4">
    <img class="w-16 h-16" :src="imageUrl" :alt="title" />
    <div class="flex flex-col flex-1">
      <p>{{ title }}</p>
      <div class="flex justify-between mt-2 items-center">
        <div>
          <b>{{ price * currentQuantity }} руб.</b>
          <span v-if="size" class="ml-2 text-sm text-gray-500">Размер: {{ size }}</span>
        </div>
        <img
          @click="emit('onClickRemove')"
          class="opacity-40 hover:opacity-100 cursor-pointer transition"
          src="/close.svg"
          alt="Удалить"
        />
      </div>
      <!-- <div class="mt-2 flex flex-col">
        <span class="text-gray-500 mb-1">Количество: {{ currentQuantity }}</span>
        <div class="quantity-controls flex items-center gap-2">
          <button @click="decrement" :disabled="currentQuantity <= 1">−</button>
          <span class="px-2">{{ currentQuantity }}</span>
          <button @click="increment">+</button>
        </div>
      </div> -->
    </div>
  </div>
</template>

<style scoped>
.quantity-controls button {
  background-color: #f3f4f6;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}
.quantity-controls button:hover {
  background-color: #e5e7eb;
}
</style>

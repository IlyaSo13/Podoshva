<script setup>
const emit = defineEmits(['onClickRemove'])

defineProps({
  id: Number,
  title: String,
  imageUrl: String,
  price: Number,
  size: String  // Новое свойство для хранения выбранного размера
})
</script>

<template>
  <div class="flex items-center border border-slate-200 p-4 rounded-xl gap-4">
    <img class="w-16 h-16" :src="imageUrl" :alt="title" />

    <div class="flex flex-col flex-1">
      <p>{{ title }}</p>
      <div class="flex justify-between mt-2 items-center">
        <div>
          <b>{{ price }} руб.</b>
          <!-- Отображаем размер, если он передан -->
          <span v-if="size" class="ml-2 text-sm text-gray-500">Размер: {{ size }}</span>
        </div>
        <img
          @click="emit('onClickRemove')"
          class="opacity-40 hover:opacity-100 cursor-pointer transition"
          src="/close.svg"
          alt="Удалить"
        />
      </div>
    </div>
  </div>
</template>

// cartStore.js
import { ref } from 'vue';

const cart = ref([]);

/**
 * Восстанавливает содержимое корзины из localStorage (если оно есть)
 */
function loadCart() {
  const data = localStorage.getItem("cart");
  if (data) {
    try {
      cart.value = JSON.parse(data);
      console.log("Корзина подгружена из localStorage:", cart.value);
    } catch (err) {
      console.error("Ошибка парсинга корзины:", err);
      cart.value = [];
    }
  }
}

/**
 * Сохраняет текущее состояние корзины в localStorage
 */
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart.value));
}

/**
 * Добавляет товар в корзину.
 * Если товар с таким же id (и, при необходимости, параметрами вроде размера) уже есть,
 * увеличивает его количество; иначе добавляет новый объект.
 *
 * Параметр item должен содержать хотя бы id, title, price, imageUrl.
 * Если поле quantity отсутствует, устанавливается 1.
 */
function addToCart(item) {
  // Если требуется, можно учитывать не только id, но и доп. параметры (например, selectedSize)
  const existingItem = cart.value.find(i => i.id === item.id && i.selectedSize === item.selectedSize);
  
  if (existingItem) {
    // Обновляем количество, если товар уже есть
    existingItem.quantity += item.quantity || 1;
    console.log(`Увеличено количество для товара id=${item.id}: ${existingItem.quantity}`);
  } else {
    // Добавляем новый товар, гарантируя, что у него есть поле quantity
    cart.value.push({ ...item, quantity: item.quantity || 1 });
    console.log(`Добавлен новый товар в корзину:`, item);
  }
  saveCart();
}

/**
 * Обновляет количество товара по его id.
 * Если товар найден, устанавливает его новое количество (минимум 1).
 */
function updateCartQuantity(id, newQuantity) {
  const item = cart.value.find(i => i.id === id);
  if (item) {
    item.quantity = newQuantity < 1 ? 1 : newQuantity;
    console.log(`Обновлено количество для товара id=${id}: ${item.quantity}`);
    saveCart();
  } else {
    console.warn(`updateCartQuantity: Товар с id=${id} не найден`);
  }
}

/**
 * Удаляет товар из корзины по id.
 */
function removeFromCart(id) {
  cart.value = cart.value.filter(i => i.id !== id);
  console.log(`Товар с id=${id} удалён из корзины`);
  saveCart();
}

/**
 * Очищает корзину.
 */
function clearCart() {
  cart.value = [];
  console.log("Корзина очищена");
  localStorage.removeItem("cart");
}

/**
 * Инициализация: пытаемся подгрузить корзину из localStorage.
 */
loadCart(); 

export function useCart() {
  return {
    cart,
    loadCart,
    saveCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
  };
}

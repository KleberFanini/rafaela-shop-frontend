import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Product, ProductVariant } from '../../shared/models/ecommerce.models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly storageKey = 'rg_cart_items';

  // Estado reativo com Signal
  private itemsSignal = signal<CartItem[]>(this.loadFromStorage());

  // Signals computados para resumo de valores
  readonly items = this.itemsSignal.asReadonly();

  readonly totalItemsCount = computed(() =>
    this.itemsSignal().reduce((acc, item) => acc + item.quantity, 0)
  );

  readonly subtotal = computed(() =>
    this.itemsSignal().reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  );

  addItem(product: Product, variant?: ProductVariant, quantity: number = 1): void {
    const currentItems = [...this.itemsSignal()];

    // Procura se o produto com a mesma variação já está no carrinho
    const existingIndex = currentItems.findIndex(item =>
      item.product.id === product.id &&
      ((!item.selectedVariant && !variant) || (item.selectedVariant?.id === variant?.id))
    );

    if (existingIndex > -1) {
      currentItems[existingIndex].quantity += quantity;
    } else {
      currentItems.push({ product, selectedVariant: variant, quantity });
    }

    this.updateState(currentItems);
  }

  updateQuantity(index: number, newQuantity: number): void {
    const currentItems = [...this.itemsSignal()];
    if (newQuantity <= 0) {
      this.removeItem(index);
      return;
    }
    if (currentItems[index]) {
      currentItems[index].quantity = newQuantity;
      this.updateState(currentItems);
    }
  }

  removeItem(index: number): void {
    const currentItems = this.itemsSignal().filter((_, i) => i !== index);
    this.updateState(currentItems);
  }

  clearCart(): void {
    this.updateState([]);
  }

  private updateState(items: CartItem[]): void {
    this.itemsSignal.set(items);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  private loadFromStorage(): CartItem[] {
    const saved = localStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved) : [];
  }
}
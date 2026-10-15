import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideMinus,
  LucidePlus,
  LucideTrash2,
  LucideTruck,
  LucideMapPin,
  LucideSparkles,
  LucideAlertTriangle
} from '@lucide/angular';
import { CartService } from '../../core/services/cart';
import { ShippingService } from '../../core/services/shipping';
import { getColorStyle } from '../../shared/utils/color.utils';
import { environment } from '../../../environments/environment';
import { ShippingOption } from '../../shared/models/ecommerce.models';

@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideMinus,
    LucidePlus,
    LucideTrash2,
    LucideTruck,
    LucideMapPin,
    LucideSparkles,
    LucideAlertTriangle
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  getColorStyle = getColorStyle;

  public cartService = inject(CartService);
  public shippingService = inject(ShippingService);

  cepInput = signal(this.shippingService.cep() || '');

  // Total com frete incluso
  totalWithShipping = computed(() => {
    return this.cartService.subtotal() + this.shippingService.shippingCost();
  });

  // Métricas de Frete Grátis
  hasFreeShipping = computed(() => {
    return this.cartService.subtotal() >= this.shippingService.FREE_SHIPPING_THRESHOLD;
  });

  amountNeededForFreeShipping = computed(() => {
    const diff = this.shippingService.FREE_SHIPPING_THRESHOLD - this.cartService.subtotal();
    return diff > 0 ? diff : 0;
  });

  freeShippingProgress = computed(() => {
    const ratio = (this.cartService.subtotal() / this.shippingService.FREE_SHIPPING_THRESHOLD) * 100;
    return Math.min(100, Math.max(0, Math.round(ratio)));
  });

  constructor() {
    // Se o subtotal mudar e já houver um CEP calculado, revalida as opções de frete (para ativar frete grátis se atingir R$ 299)
    effect(() => {
      const subtotal = this.cartService.subtotal();
      const currentCep = this.shippingService.cep();
      if (currentCep && currentCep.length === 8 && subtotal > 0) {
        this.shippingService.calculateShipping(currentCep, subtotal).subscribe({
          error: () => {}
        });
      }
    });
  }

  increment(index: number, currentQty: number): void {
    this.cartService.updateQuantity(index, currentQty + 1);
  }

  decrement(index: number, currentQty: number): void {
    this.cartService.updateQuantity(index, currentQty - 1);
  }

  remove(index: number): void {
    this.cartService.removeItem(index);
  }

  onCepInput(value: string): void {
    const clean = value.replace(/\D/g, '').slice(0, 8);
    if (clean.length > 5) {
      this.cepInput.set(`${clean.slice(0, 5)}-${clean.slice(5)}`);
    } else {
      this.cepInput.set(clean);
    }
  }

  calculateShipping(): void {
    const clean = this.cepInput().replace(/\D/g, '');
    if (clean.length !== 8) {
      this.shippingService.errorMessage.set('Digite um CEP válido com 8 números.');
      return;
    }
    this.shippingService.calculateShipping(clean, this.cartService.subtotal()).subscribe({
      error: () => {}
    });
  }

  selectShippingOption(option: ShippingOption): void {
    this.shippingService.selectOption(option);
  }

  getImageUrl(imageUrl?: string | null, categoryName?: string): string {
    if (!imageUrl || imageUrl.trim() === '') {
      return categoryName === 'SEMIJOIAS' ? '/elegance-collection.jpg' : '/performance-collection.jpg';
    }
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    const backendHost = environment.apiUrl.replace(/\/api\/?$/, '');
    if (imageUrl.startsWith('/api/uploads/')) {
      return `${backendHost}${imageUrl}`;
    }
    if (imageUrl.startsWith('uploads/')) {
      return `${backendHost}/api/${imageUrl}`;
    }
    if (!imageUrl.includes('/')) {
      return `${backendHost}/api/uploads/${imageUrl}`;
    }
    return imageUrl;
  }

  onImageError(event: Event, categoryName?: string): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = categoryName === 'SEMIJOIAS' ? '/elegance-collection.jpg' : '/performance-collection.jpg';
    }
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideMinus, LucidePlus, LucideTrash2 } from '@lucide/angular';
import { CartService } from '../../core/services/cart';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule, LucideMinus, LucidePlus, LucideTrash2],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  constructor(public cartService: CartService) { }

  increment(index: number, currentQty: number): void {
    this.cartService.updateQuantity(index, currentQty + 1);
  }

  decrement(index: number, currentQty: number): void {
    this.cartService.updateQuantity(index, currentQty - 1);
  }

  remove(index: number): void {
    this.cartService.removeItem(index);
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

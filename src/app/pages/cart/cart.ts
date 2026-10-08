import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart';
import { CartItem } from '../../shared/models/ecommerce.models';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule],
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
}

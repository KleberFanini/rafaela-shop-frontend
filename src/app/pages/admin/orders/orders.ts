import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
import { OrderService } from '../../../core/services/order';
import { AuthService } from '../../../core/services/auth';
import { Order } from '../../../shared/models/ecommerce.models';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterModule, LucideArrowLeft],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);

  orders = signal<Order[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (!user || user.role !== 'ADMIN') {
      this.router.navigate(['/login']);
      return;
    }

    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.orderService.getOrders().subscribe({
      next: (list) => {
        this.orders.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  updateStatus(orderId: number, status: string): void {
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: (updatedOrder) => {
        this.orders.update(list => list.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      }
    });
  }
}

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideArrowLeft,
  LucideSearch,
  LucideTruck,
  LucideClock,
  LucideCircleCheck,
  LucideCircleX,
  LucidePackage,
  LucideCopy,
  LucideExternalLink,
  LucideCheck,
  LucideX,
  LucideRefreshCw,
} from '@lucide/angular';
import { OrderService } from '../../../core/services/order';
import { AuthService } from '../../../core/services/auth';
import { Order } from '../../../shared/models/ecommerce.models';

export type OrderFilterStatus = 'ALL' | 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';

@Component({
  selector: 'app-orders',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideArrowLeft,
    LucideSearch,
    LucideTruck,
    LucideClock,
    LucideCircleCheck,
    LucideCircleX,
    LucidePackage,
    LucideCopy,
    LucideExternalLink,
    LucideCheck,
    LucideX,
    LucideRefreshCw,
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);

  orders = signal<Order[]>([]);
  loading = signal(true);
  updatingOrderId = signal<number | null>(null);
  savingTrackingId = signal<number | null>(null);
  copiedOrderId = signal<number | null>(null);
  editingTrackingId = signal<number | null>(null);
  trackingInputs = signal<Record<number, string>>({});

  selectedStatus = signal<OrderFilterStatus>('ALL');
  searchQuery = signal<string>('');

  readonly statusTabs = [
    { key: 'ALL' as OrderFilterStatus, label: 'Todos' },
    { key: 'PENDING' as OrderFilterStatus, label: 'Aguardando Pagamento' },
    { key: 'PAID' as OrderFilterStatus, label: 'Pago / Em Separação' },
    { key: 'SHIPPED' as OrderFilterStatus, label: 'Enviado' },
    { key: 'DELIVERED' as OrderFilterStatus, label: 'Entregue' },
    { key: 'CANCELED' as OrderFilterStatus, label: 'Cancelado' },
  ];

  readonly statusOptions = [
    { value: 'PENDING', label: 'Aguardando Pagamento' },
    { value: 'PAID', label: 'Pago / Em Separação' },
    { value: 'SHIPPED', label: 'Enviado' },
    { value: 'DELIVERED', label: 'Entregue' },
    { value: 'CANCELED', label: 'Cancelado' },
  ];

  statusCounts = computed(() => {
    const list = this.orders();
    return {
      ALL: list.length,
      PENDING: list.filter((o) => o.status === 'PENDING').length,
      PAID: list.filter((o) => o.status === 'PAID').length,
      SHIPPED: list.filter((o) => o.status === 'SHIPPED').length,
      DELIVERED: list.filter((o) => o.status === 'DELIVERED').length,
      CANCELED: list.filter((o) => o.status === 'CANCELED').length,
    };
  });

  filteredOrders = computed(() => {
    let list = this.orders();
    const status = this.selectedStatus();
    if (status !== 'ALL') {
      list = list.filter((o) => o.status === status);
    }

    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      const cleanId = query.startsWith('#') ? query.slice(1) : query;
      list = list.filter(
        (o) =>
          o.id?.toString().includes(cleanId) ||
          o.customerName?.toLowerCase().includes(query) ||
          o.customerEmail?.toLowerCase().includes(query) ||
          o.customerPhone?.toLowerCase().includes(query) ||
          o.trackingCode?.toLowerCase().includes(query)
      );
    }

    return list;
  });

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
      error: () => this.loading.set(false),
    });
  }

  selectStatus(status: OrderFilterStatus): void {
    this.selectedStatus.set(status);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  updateStatus(orderId: number, status: string): void {
    this.updatingOrderId.set(orderId);
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: (updatedOrder) => {
        this.orders.update((list) =>
          list.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o))
        );
        this.updatingOrderId.set(null);
      },
      error: (err) => {
        console.error('Erro ao atualizar status do pedido:', err);
        this.updatingOrderId.set(null);
      },
    });
  }

  getNextStatus(currentStatus: string): { status: string; label: string } | null {
    switch (currentStatus) {
      case 'PENDING':
        return { status: 'PAID', label: 'Marcar como Pago' };
      case 'PAID':
        return { status: 'SHIPPED', label: 'Marcar como Enviado' };
      case 'SHIPPED':
        return { status: 'DELIVERED', label: 'Marcar como Entregue' };
      default:
        return null;
    }
  }

  getCorreiosUrl(trackingCode?: string): string {
    if (!trackingCode) return '';
    return `https://rastreamento.correios.com.br/app/index.php?codigo=${encodeURIComponent(
      trackingCode.trim().toUpperCase()
    )}`;
  }

  copyTrackingCode(orderId: number, code: string): void {
    if (!code) return;
    navigator.clipboard.writeText(code.trim().toUpperCase()).then(() => {
      this.copiedOrderId.set(orderId);
      setTimeout(() => {
        if (this.copiedOrderId() === orderId) {
          this.copiedOrderId.set(null);
        }
      }, 2000);
    });
  }

  startEditingTracking(orderId: number, currentCode?: string): void {
    this.editingTrackingId.set(orderId);
    this.trackingInputs.update((map) => ({ ...map, [orderId]: currentCode || '' }));
  }

  cancelEditingTracking(orderId: number): void {
    if (this.editingTrackingId() === orderId) {
      this.editingTrackingId.set(null);
    }
  }

  onTrackingInputChange(orderId: number, val: string): void {
    this.trackingInputs.update((map) => ({ ...map, [orderId]: val }));
  }

  getTrackingInputValue(orderId: number, currentCode?: string): string {
    const map = this.trackingInputs();
    if (orderId in map) {
      return map[orderId];
    }
    return currentCode || '';
  }

  saveTrackingCode(orderId: number, code: string): void {
    const cleanCode = (code || '').trim().toUpperCase();
    this.savingTrackingId.set(orderId);
    this.orderService.updateTrackingCode(orderId, cleanCode).subscribe({
      next: (updatedOrder) => {
        this.orders.update((list) =>
          list.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o))
        );
        this.savingTrackingId.set(null);
        this.editingTrackingId.set(null);
      },
      error: (err) => {
        console.error('Erro ao salvar código de rastreio:', err);
        this.savingTrackingId.set(null);
      },
    });
  }
}

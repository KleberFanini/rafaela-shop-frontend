import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucidePlus,
  LucideClipboardList,
  LucideDollarSign,
  LucidePackage,
  LucideAlertTriangle,
  LucideEye,
  LucideTrendingUp,
  LucideTrendingDown,
  LucideBoxes,
  LucidePencil,
  LucideTrash2,
  LucidePower,
  LucideRotateCcw,
  LucideSearch,
  LucideX
} from '@lucide/angular';
import { ProductService } from '../../../core/services/product';
import { AuthService } from '../../../core/services/auth';
import { OrderService } from '../../../core/services/order';
import { Product } from '../../../shared/models/ecommerce.models';

export type ProductFilterType = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'LOW';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucidePlus,
    LucideClipboardList,
    LucideDollarSign,
    LucidePackage,
    LucideAlertTriangle,
    LucideEye,
    LucideTrendingUp,
    LucideTrendingDown,
    LucideBoxes,
    LucidePencil,
    LucideTrash2,
    LucidePower,
    LucideRotateCcw,
    LucideSearch,
    LucideX
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private productService = inject(ProductService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);

  products = signal<Product[]>([]);
  loading = signal(true);
  actionLoadingId = signal<number | null>(null);

  // Modal de confirmação de exclusão lógica
  productToDelete = signal<Product | null>(null);
  deleting = signal(false);

  // Métricas do painel reais vindas do banco de dados
  totalRevenue = signal(0);
  revenueGrowthPercentage = signal(0);
  totalOrders = signal(0);
  pendingOrders = signal(0);

  // Filtro da Tabela: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'LOW'
  statusFilter = signal<ProductFilterType>('ALL');
  searchQuery = signal<string>('');

  // Contadores dinâmicos
  productCounts = computed(() => {
    const all = this.products();
    return {
      ALL: all.length,
      ACTIVE: all.filter(p => p.active !== false).length,
      INACTIVE: all.filter(p => p.active === false).length,
      LOW: all.filter(p => p.variants && p.variants.some(v => v.stock != null && v.stock <= 3)).length
    };
  });

  activeProductsCount = computed(() => {
    return this.products().filter(p => p.active !== false).length;
  });

  lowStockItems = computed(() => {
    return this.products().filter(p => p.variants && p.variants.some(v => v.stock != null && v.stock <= 3));
  });

  // Produtos filtrados de acordo com a seleção e busca
  displayedProducts = computed(() => {
    let list = this.products();
    const filter = this.statusFilter();

    if (filter === 'ACTIVE') {
      list = list.filter(p => p.active !== false);
    } else if (filter === 'INACTIVE') {
      list = list.filter(p => p.active === false);
    } else if (filter === 'LOW') {
      list = list.filter(p => p.variants && p.variants.some(v => v.stock != null && v.stock <= 3));
    }

    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.id?.toString().includes(query) ||
        p.category?.name.toLowerCase().includes(query)
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

    this.loadStats();
    this.loadProducts();
  }

  loadStats(): void {
    this.orderService.getDashboardStats().subscribe({
      next: (stats) => {
        if (stats) {
          this.totalRevenue.set(stats.totalRevenue ?? 0);
          this.revenueGrowthPercentage.set(stats.revenueGrowthPercentage ?? 0);
          this.totalOrders.set(stats.totalOrders ?? 0);
          this.pendingOrders.set(stats.pendingOrders ?? 0);
        }
      },
      error: (err) => {
        console.error('Erro ao obter estatísticas reais do backend:', err);
      }
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    // includeInactive = true para trazer todos os produtos ao painel admin
    this.productService.getProducts(undefined, true).subscribe({
      next: (prods) => {
        this.products.set(prods);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setStatusFilter(filter: ProductFilterType): void {
    this.statusFilter.set(filter);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  toggleActive(product: Product): void {
    if (!product.id) return;
    this.actionLoadingId.set(product.id);

    this.productService.toggleProductActive(product.id).subscribe({
      next: (updated) => {
        this.products.update(list =>
          list.map(p => p.id === updated.id ? { ...p, active: updated.active } : p)
        );
        this.actionLoadingId.set(null);
        this.loadStats();
      },
      error: (err) => {
        console.error('Erro ao alternar status do produto:', err);
        this.actionLoadingId.set(null);
      }
    });
  }

  confirmDelete(product: Product): void {
    this.productToDelete.set(product);
  }

  cancelDelete(): void {
    this.productToDelete.set(null);
  }

  executeDelete(): void {
    const prod = this.productToDelete();
    if (!prod || !prod.id) return;

    this.deleting.set(true);
    this.productService.deleteProduct(prod.id).subscribe({
      next: () => {
        // Exclusão lógica: atualiza o status para desativado localmente
        this.products.update(list =>
          list.map(p => p.id === prod.id ? { ...p, active: false } : p)
        );
        this.deleting.set(false);
        this.productToDelete.set(null);
        this.loadStats();
      },
      error: (err) => {
        console.error('Erro ao desativar logicamente o produto:', err);
        this.deleting.set(false);
      }
    });
  }

  getTotalStock(product: Product): number {
    if (!product.variants || product.variants.length === 0) return 0;
    return product.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
  }
}

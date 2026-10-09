import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
  LucidePencil
} from '@lucide/angular';
import { ProductService } from '../../../core/services/product';
import { AuthService } from '../../../core/services/auth';
import { OrderService } from '../../../core/services/order';
import { Product } from '../../../shared/models/ecommerce.models';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    LucidePlus,
    LucideClipboardList,
    LucideDollarSign,
    LucidePackage,
    LucideAlertTriangle,
    LucideEye,
    LucideTrendingUp,
    LucideTrendingDown,
    LucideBoxes,
    LucidePencil
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

  // Métricas do painel reais vindas do banco de dados
  totalRevenue = signal(0);
  revenueGrowthPercentage = signal(0);
  totalOrders = signal(0);
  pendingOrders = signal(0);

  // Filtro da Tabela de Estoque: 'ALL' (Todos os Produtos) ou 'LOW' (Estoque Baixo)
  stockFilter = signal<'ALL' | 'LOW'>('ALL');

  // Produtos filtrados de acordo com a seleção
  displayedProducts = computed(() => {
    const all = this.products();
    if (this.stockFilter() === 'LOW') {
      return all.filter(p => p.variants && p.variants.some(v => v.stock <= 3));
    }
    return all;
  });

  lowStockItems = computed(() => {
    return this.products().filter(p => p.variants && p.variants.some(v => v.stock <= 3));
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
    this.productService.getProducts().subscribe({
      next: (prods) => {
        this.products.set(prods);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setStockFilter(filter: 'ALL' | 'LOW'): void {
    this.stockFilter.set(filter);
  }

  getTotalStock(product: Product): number {
    if (!product.variants || product.variants.length === 0) return 0;
    return product.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
  }
}

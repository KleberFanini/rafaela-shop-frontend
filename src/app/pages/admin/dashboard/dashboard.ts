import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { AuthService } from '../../../core/services/auth';
import { Product } from '../../../shared/models/ecommerce.models';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private router = inject(Router);

  products = signal<Product[]>([]);
  loading = signal(true);

  // Métricas do painel
  totalRevenue = signal(4280.50);
  totalOrders = signal(18);
  lowStockItems = signal<Product[]>([]);

  ngOnInit(): void {
    // Validação simples: se não for admin, redireciona para login
    const user = this.authService.currentUser();
    if (!user || user.role !== 'ADMIN') {
      this.router.navigate(['/login']);
      return;
    }

    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (prods) => {
        this.products.set(prods);

        // Filtra itens com variações que tenham estoque <= 3
        const lowStock = prods.filter(p =>
          p.variants && p.variants.some(v => v.stock <= 3)
        );
        this.lowStockItems.set(lowStock);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}

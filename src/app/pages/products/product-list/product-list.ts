import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product, Category } from '../../../shared/models/ecommerce.models';
import { ProductService } from '../../../core/services/product';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  selectedCategoryName = signal<string>('TODOS');
  selectedSort = signal<string>('relevance');
  loading = signal<boolean>(true);

  // Lista filtrada e ordenada em tempo real via Signal computado
  filteredProducts = computed(() => {
    let list = [...this.products()];
    const category = this.selectedCategoryName();

    if (category !== 'TODOS') {
      list = list.filter(p => p.category?.name.toUpperCase() === category.toUpperCase());
    }

    if (this.selectedSort() === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (this.selectedSort() === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  });

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadData();

    // Lê parâmetros da URL (ex: /produtos?category=FITNESS)
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategoryName.set(params['category'].toUpperCase());
      }
    });
  }

  loadData(): void {
    this.loading.set(true);
    this.productService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: (err) => console.error('Erro ao carregar categorias', err)
    });

    this.productService.getProducts().subscribe({
      next: (prods) => {
        this.products.set(prods);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar produtos', err);
        this.loading.set(false);
      }
    });
  }

  setCategory(categoryName: string): void {
    this.selectedCategoryName.set(categoryName);
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedSort.set(value);
  }
}

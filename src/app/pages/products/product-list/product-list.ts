import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideShoppingBag,
  LucideEye,
  LucideCheck,
  LucideSparkles,
  LucideSearch
} from '@lucide/angular';
import { Product, Category, ProductVariant } from '../../../shared/models/ecommerce.models';
import { ProductService } from '../../../core/services/product';
import { CartService } from '../../../core/services/cart';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideShoppingBag,
    LucideEye,
    LucideCheck,
    LucideSparkles,
    LucideSearch
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  selectedCategoryName = signal<string>('TODOS');
  selectedGender = signal<string>('TODOS');
  searchQuery = signal<string>('');
  selectedSort = signal<string>('relevance');
  loading = signal<boolean>(true);

  // Feedback temporário de produto adicionado
  addedProductId = signal<number | null>(null);

  // Subcategorias rápidas para as pílulas de navegação
  readonly quickDepartmentPills = [
    { label: 'Todas as Peças', value: 'TODOS' },
    { label: 'Moda Fitness', value: 'FITNESS' },
    { label: 'Semijoias de Luxo', value: 'SEMIJOIAS' },
    { label: 'Leggings & Shorts', value: 'LEGGING' },
    { label: 'Tops & Croppeds', value: 'TOP' },
    { label: 'Conjuntos', value: 'CONJUNTO' },
    { label: 'Colares', value: 'COLAR' },
    { label: 'Brincos', value: 'BRINCO' },
    { label: 'Anéis', value: 'ANEL' },
  ];

  // Lista filtrada e ordenada em tempo real via Signal computado
  filteredProducts = computed(() => {
    let list = [...this.products()];
    const cat = this.selectedCategoryName().toUpperCase();
    const gender = this.selectedGender().toUpperCase();
    const query = this.searchQuery().trim().toLowerCase();

    // Filtro por Categoria / Subdepartamento
    if (cat !== 'TODOS') {
      if (cat === 'FITNESS' || cat === 'SEMIJOIAS') {
        list = list.filter(p => p.category?.name.toUpperCase() === cat);
      } else {
        // Busca flexível no nome ou descrição
        list = list.filter(p =>
          p.name.toUpperCase().includes(cat) ||
          p.description?.toUpperCase().includes(cat) ||
          p.category?.name.toUpperCase().includes(cat)
        );
      }
    }

    // Filtro por Gênero
    if (gender !== 'TODOS') {
      list = list.filter(p => (p.gender || 'FEMININO').toUpperCase() === gender);
    }

    // Filtro por Busca de Texto
    if (query) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.name.toLowerCase().includes(query)
      );
    }

    // Ordenação
    if (this.selectedSort() === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (this.selectedSort() === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  });

  ngOnInit(): void {
    this.loadData();

    // Lê parâmetros da URL (ex: /produtos?category=FITNESS)
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategoryName.set(params['category'].toUpperCase());
      }
      if (params['gender']) {
        this.selectedGender.set(params['gender'].toUpperCase());
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

  setGender(gender: string): void {
    this.selectedGender.set(gender);
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedSort.set(value);
  }

  // Extrai lista única de tamanhos disponíveis no produto
  getAvailableSizes(product: Product): string[] {
    if (!product.variants || product.variants.length === 0) return [];
    const sizes = product.variants
      .map(v => v.size?.trim())
      .filter((s): s is string => Boolean(s && s.length > 0));
    return Array.from(new Set(sizes));
  }

  // Extrai lista única de cores disponíveis no produto
  getAvailableColors(product: Product): string[] {
    if (!product.variants || product.variants.length === 0) return [];
    const colors = product.variants
      .map(v => v.color?.trim())
      .filter((c): c is string => Boolean(c && c.length > 0));
    return Array.from(new Set(colors));
  }

  // Adição direta do produto à sacola
  quickAddToCart(product: Product, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    const availableVariant = product.variants?.find(v => v.stock > 0) || product.variants?.[0];
    this.cartService.addItem(product, availableVariant, 1);

    this.addedProductId.set(product.id || null);
    setTimeout(() => {
      this.addedProductId.set(null);
    }, 1800);
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

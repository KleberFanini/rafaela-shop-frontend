import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { Product, ProductVariant } from '../../../shared/models/ecommerce.models';
import { CartService } from '../../../core/services/cart';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  product = signal<Product | null>(null);
  selectedVariant = signal<ProductVariant | null>(null);
  quantity = signal<number>(1);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(Number(id));
    } else {
      this.error.set('Produto não encontrado.');
      this.loading.set(false);
    }
  }

  loadProduct(id: number): void {
    this.loading.set(true);
    this.productService.getProductById(id).subscribe({
      next: (prod) => {
        this.product.set(prod);
        if (prod.variants && prod.variants.length > 0) {
          this.selectedVariant.set(prod.variants[0]);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes do produto:', err);
        this.error.set('Não foi possível carregar as informações do produto.');
        this.loading.set(false);
      }
    });
  }

  selectVariant(variant: ProductVariant): void {
    this.selectedVariant.set(variant);
    this.quantity.set(1);
  }

  increaseQuantity(): void {
    const currentVariant = this.selectedVariant();
    const maxStock = currentVariant ? currentVariant.stock : 99;
    if (this.quantity() < maxStock) {
      this.quantity.update((q) => q + 1);
    }
  }

  decreaseQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    }
  }

  addToCart(): void {
    const prod = this.product();
    const variant = this.selectedVariant();

    if (!prod) return;

    if (prod.variants && prod.variants.length > 0 && !variant) {
      alert('Por favor, selecione uma variação antes de continuar.');
      return;
    }

    if (variant && variant.stock <= 0) {
      alert('Esta opção encontra-se sem estoque.');
      return;
    }

    this.cartService.addItem(prod, variant || undefined, this.quantity());

    this.router.navigate(['/carrinho']);
  }

  getImageUrl(imageUrl?: string | null): string {
    if (!imageUrl) {
      return 'performance-collection.jpg';
    }
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    if (imageUrl.startsWith('/api/uploads/')) {
      return `http://localhost:8080${imageUrl}`;
    }
    if (imageUrl.startsWith('uploads/')) {
      return `http://localhost:8080/api/${imageUrl}`;
    }
    if (!imageUrl.includes('/')) {
      return `http://localhost:8080/api/uploads/${imageUrl}`;
    }
    return imageUrl;
  }

  onImageError(event: Event, categoryName?: string): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = categoryName === 'SEMIJOIAS' ? 'elegance-collection.jpg' : 'performance-collection.jpg';
    }
  }
}

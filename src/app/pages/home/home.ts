import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideArrowRight,
  LucideFlame,
  LucideShirt,
  LucideLayers,
  LucideGem,
  LucideCircleDot,
  LucideCircle
} from '@lucide/angular';
import { ProductService } from '../../core/services/product';
import { Product } from '../../shared/models/ecommerce.models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterModule,
    LucideChevronLeft,
    LucideChevronRight,
    LucideArrowRight,
    LucideFlame,
    LucideShirt,
    LucideLayers,
    LucideGem,
    LucideCircleDot,
    LucideCircle
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private title = inject(Title);
  private meta = inject(Meta);

  heroTexture = 'rg-hero-texture.jpg';
  logoAsset = 'rafaela-gamero-logo.png';
  performanceImage = 'performance-collection.jpg';
  eleganceImage = 'elegance-collection.jpg';

  loading = signal<boolean>(true);
  featuredProducts = signal<Product[]>([]);
  currentSlide = signal<number>(0);

  private autoPlayTimer: any = null;

  // Máximo de páginas do carrossel exibindo de 3 em 3
  maxSlide = computed(() => Math.max(0, Math.ceil(this.featuredProducts().length / 3) - 1));

  // Retorna os índices das páginas para exibição dos pontos indicadores
  slidePages = computed(() => {
    const total = Math.ceil(this.featuredProducts().length / 3);
    return Array.from({ length: total }, (_, i) => i);
  });

  // Categorias de Acesso Rápido
  quickCategories = [
    { label: 'Leggings & Shorts', filter: 'leggings' },
    { label: 'Tops & Croppeds', filter: 'tops' },
    { label: 'Conjuntos', filter: 'conjuntos' },
    { label: 'Colares & Gargantilhas', filter: 'colares' },
    { label: 'Brincos & Argolas', filter: 'brincos' },
    { label: 'Pulseiras & Anéis', filter: 'aneis' }
  ];

  ngOnInit(): void {
    this.title.setTitle('Rafaela Gamero | Moda Fitness & Semijoias de Luxo');
    this.meta.addTags([
      { name: 'description', content: 'Moda fitness de alta performance e semijoias exclusivas. Elegância e força para treinar e brilhar.' },
      { property: 'og:title', content: 'Rafaela Gamero | Moda Fitness & Semijoias' },
      { property: 'og:description', content: 'Peças fitness modeladoras e semijoias refinadas em um único lugar.' }
    ]);

    this.loadFeaturedProducts();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  loadFeaturedProducts(): void {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (prods) => {
        // Limita a até 12 produtos no carrossel da Home
        this.featuredProducts.set(prods.slice(0, 12));
        this.loading.set(false);

        if (prods.length > 3) {
          this.startAutoPlay();
        }
      },
      error: (err) => {
        console.error('Erro ao carregar destaques da Home:', err);
        this.loading.set(false);
      }
    });
  }

  startAutoPlay(): void {
    this.stopAutoPlay();
    this.autoPlayTimer = setInterval(() => {
      this.nextSlide();
    }, 4000); // Avança a cada 4 segundos
  }

  stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  nextSlide(): void {
    if (this.currentSlide() < this.maxSlide()) {
      this.currentSlide.update(s => s + 1);
    } else {
      this.currentSlide.set(0);
    }
  }

  prevSlide(): void {
    if (this.currentSlide() > 0) {
      this.currentSlide.update(s => s - 1);
    } else {
      this.currentSlide.set(this.maxSlide());
    }
  }

  goToSlide(index: number): void {
    this.currentSlide.set(index);
    this.startAutoPlay();
  }

  manualNext(): void {
    this.nextSlide();
    this.startAutoPlay();
  }

  manualPrev(): void {
    this.prevSlide();
    this.startAutoPlay();
  }

  getInstallments(price: number): string {
    const installmentValue = (price / 3).toFixed(2);
    return `3x de R$ ${installmentValue} sem juros`;
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

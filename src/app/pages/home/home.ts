import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

interface FeaturedProduct {
  id: number;
  name: string;
  category: 'FITNESS' | 'SEMIJOIAS';
  tag: string;
  price: number;
  installments: string;
  image: string;
}

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  heroTexture = 'rg-hero-texture.jpg';
  logoAsset = 'rafaela-gamero-logo.png';
  performanceImage = 'performance-collection.jpg';
  eleganceImage = 'elegance-collection.jpg';

  // Categorias de Acesso Rápido
  quickCategories = [
    { label: 'Leggings & Shorts', filter: 'leggings', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { label: 'Tops & Croppeds', filter: 'tops', icon: 'M4 6h16M4 12h16m-7 6h7' },
    { label: 'Conjuntos', filter: 'conjuntos', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
    { label: 'Colares & Gargantilhas', filter: 'colares', icon: 'M12 21a9 9 0 100-18 9 9 0 000 18z' },
    { label: 'Brincos & Argolas', filter: 'brincos', icon: 'M12 8v4l3 3' },
    { label: 'Pulseiras & Anéis', filter: 'aneis', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20z' }
  ];

  // Vitrine Inicial de Produtos em Destaque
  featuredProducts = signal<FeaturedProduct[]>([
    {
      id: 1,
      name: 'Legging Glow Alta Compressão',
      category: 'FITNESS',
      tag: 'Mais Vendida',
      price: 189.90,
      installments: '3x de R$ 63,30 sem juros',
      image: 'performance-collection.jpg'
    },
    {
      id: 2,
      name: 'Top Esculpido Rose Gold',
      category: 'FITNESS',
      tag: 'Zero Transparência',
      price: 129.90,
      installments: '2x de R$ 64,95 sem juros',
      image: 'performance-collection.jpg'
    },
    {
      id: 3,
      name: 'Colar Elo Dourado Banhado a Ouro 18k',
      category: 'SEMIJOIAS',
      tag: 'Hipoalergênico',
      price: 159.90,
      installments: '3x de R$ 53,30 sem juros',
      image: 'elegance-collection.jpg'
    },
    {
      id: 4,
      name: 'Brinco Argola Fita Banhada a Prata 925',
      category: 'SEMIJOIAS',
      tag: 'Exclusivo',
      price: 89.90,
      installments: '2x de R$ 44,95 sem juros',
      image: 'elegance-collection.jpg'
    }
  ]);

  constructor(private title: Title, private meta: Meta) {
    this.title.setTitle('Rafaela Gamero | Moda Fitness & Semijoias de Luxo');
    this.meta.addTags([
      { name: 'description', content: 'Moda fitness de alta performance e semijoias exclusivas. Elegância e força para treinar e brilhar.' },
      { property: 'og:title', content: 'Rafaela Gamero | Moda Fitness & Semijoias' },
      { property: 'og:description', content: 'Peças fitness modeladoras e semijoias refinadas em um único lugar.' }
    ]);
  }
}

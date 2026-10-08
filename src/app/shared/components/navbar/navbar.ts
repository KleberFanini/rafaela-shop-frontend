import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private router = inject(Router);
  private cartService = inject(CartService);

  menuOpen = signal(false);
  searchOpen = signal(false);
  searchQuery = signal('');

  // Agora this.cartService já existe no momento da atribuição
  cartCount = this.cartService.totalItemsCount;

  navLinks = [
    { label: 'NOVIDADES', route: '/produtos', queryParams: { sort: 'latest' } },
    { label: 'MODA FITNESS', route: '/produtos', queryParams: { category: 'FITNESS' } },
    { label: 'SEMIJOIAS', route: '/produtos', queryParams: { category: 'SEMIJOIAS' } },
    { label: 'DESTAQUES', route: '/', fragment: 'destaques' }
  ];

  quickSearches = ['Legging Glow', 'Top Esculpido', 'Colar 18k', 'Brinco Argola'];

  toggleMenu() {
    this.menuOpen.update((v) => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  toggleSearch() {
    this.searchOpen.update((v) => !v);
    if (!this.searchOpen()) {
      this.searchQuery.set('');
    }
  }

  performSearch() {
    const query = this.searchQuery().trim();
    if (query) {
      this.searchOpen.set(false);
      this.router.navigate(['/produtos'], { queryParams: { q: query } });
      this.searchQuery.set('');
    }
  }

  searchKeyword(keyword: string) {
    this.searchOpen.set(false);
    this.router.navigate(['/produtos'], { queryParams: { q: keyword } });
  }
}
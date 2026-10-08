import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  menuOpen = signal(false);
  searchOpen = signal(false);
  searchQuery = signal('');

  // Quantidade de itens no carrinho para exibir na badge
  cartCount = signal(0);

  navLinks = [
    { label: 'NOVIDADES', route: '/produtos', queryParams: { sort: 'latest' } },
    { label: 'MODA FITNESS', route: '/produtos', queryParams: { category: 'FITNESS' } },
    { label: 'SEMIJOIAS', route: '/produtos', queryParams: { category: 'SEMIJOIAS' } },
    { label: 'DESTAQUES', route: '/', fragment: 'destaques' }
  ];

  quickSearches = ['Legging Glow', 'Top Esculpido', 'Colar 18k', 'Brinco Argola'];

  constructor(private router: Router) { }

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

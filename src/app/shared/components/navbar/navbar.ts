import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  LucideUser,
  LucideChevronDown,
  LucideShoppingBag,
  LucideHandbag,
  LucideMenu,
  LucideX,
  LucideLayoutDashboard,
  LucideLogOut,
  LucideArrowRight
} from '@lucide/angular';
import { CartService } from '../../../core/services/cart';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideUser,
    LucideChevronDown,
    LucideShoppingBag,
    LucideHandbag,
    LucideMenu,
    LucideX,
    LucideLayoutDashboard,
    LucideLogOut,
    LucideArrowRight
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private router = inject(Router);
  private cartService = inject(CartService);
  public authService = inject(AuthService);

  menuOpen = signal(false);

  cartCount = this.cartService.totalItemsCount;
  cartSubtotal = this.cartService.subtotal;

  readonly whatsappUrl = 'https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostaria%20de%20um%20atendimento%20VIP%20na%20Rafaela%20Gamero.';

  navLinks: { label: string; route: string; queryParams?: Record<string, string> }[] = [
    { label: 'INÍCIO', route: '/' },
    { label: 'VITRINE', route: '/produtos' },
    { label: 'MODA FITNESS', route: '/produtos', queryParams: { category: 'FITNESS' } },
    { label: 'SEMIJOIAS', route: '/produtos', queryParams: { category: 'SEMIJOIAS' } }
  ];

  toggleMenu() {
    this.menuOpen.update((v) => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideCheck, LucideSparkles } from '@lucide/angular';
import { CartService } from '../../core/services/cart';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, RouterModule, LucideCheck, LucideSparkles],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  public cartService = inject(CartService);
  public authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  loading = signal(false);
  orderPlaced = signal(false);
  paymentMethod = signal<'PIX' | 'CREDIT_CARD'>('PIX');

  // Controle de edição do endereço
  isEditingAddress = signal(false);
  hasSavedAddress = signal(false);

  customerData = {
    name: '',
    email: '',
    phone: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  };

  ngOnInit(): void {
    if (this.cartService.items().length === 0 && !this.orderPlaced()) {
      this.router.navigate(['/carrinho']);
      return;
    }

    this.loadUserData();
  }

  loadUserData(): void {
    const user = this.authService.currentUser();

    if (user) {
      this.customerData.name = user.name || '';
      this.customerData.email = user.email || '';
      this.customerData.phone = user.phone || '';

      if (user.address && user.address.street) {
        this.customerData.zipCode = user.address.zipCode || '';
        this.customerData.street = user.address.street || '';
        this.customerData.number = user.address.number || '';
        this.customerData.complement = user.address.complement || '';
        this.customerData.neighborhood = user.address.neighborhood || '';
        this.customerData.city = user.address.city || '';
        this.customerData.state = user.address.state || '';

        this.hasSavedAddress.set(true);
        this.isEditingAddress.set(false);
      } else {
        this.hasSavedAddress.set(false);
        this.isEditingAddress.set(true);
      }
    } else {
      this.hasSavedAddress.set(false);
      this.isEditingAddress.set(true);
    }
  }

  toggleEditAddress(): void {
    this.isEditingAddress.update((v) => !v);
  }

  saveAddress(): void {
    if (this.customerData.street && this.customerData.zipCode && this.customerData.number) {
      this.hasSavedAddress.set(true);
      this.isEditingAddress.set(false);
    }
  }

  onZipCodeChange(): void {
    const rawCep = this.customerData.zipCode.replace(/\D/g, '');
    if (rawCep.length === 8) {
      this.http.get<any>(`https://viacep.com.br/ws/${rawCep}/json/`).subscribe({
        next: (data) => {
          if (!data.erro) {
            this.customerData.street = data.logradouro || '';
            this.customerData.neighborhood = data.bairro || '';
            this.customerData.city = data.localidade || '';
            this.customerData.state = data.uf || '';
          }
        },
        error: () => { }
      });
    }
  }

  setPaymentMethod(method: 'PIX' | 'CREDIT_CARD'): void {
    this.paymentMethod.set(method);
  }

  calculateTotal(): number {
    const subtotal = this.cartService.subtotal();
    return this.paymentMethod() === 'PIX' ? subtotal * 0.95 : subtotal;
  }

  isFormValid(): boolean {
    const hasPerson = this.customerData.name && this.customerData.email;
    const hasAddress = this.customerData.street && this.customerData.zipCode && this.customerData.number;
    return Boolean(hasPerson && hasAddress && !this.loading());
  }

  placeOrder(): void {
    if (!this.isFormValid()) {
      alert('Por favor, certifique-se de que os dados de entrega estão completos.');
      return;
    }

    this.loading.set(true);

    setTimeout(() => {
      this.loading.set(false);
      this.orderPlaced.set(true);
      this.cartService.clearCart();
    }, 1200);
  }
}

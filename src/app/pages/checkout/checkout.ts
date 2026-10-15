import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  LucideCheck,
  LucideSparkles,
  LucideTruck,
  LucideMapPin,
  LucideAlertTriangle
} from '@lucide/angular';
import { CartService } from '../../core/services/cart';
import { AuthService } from '../../core/services/auth';
import { OrderService } from '../../core/services/order';
import { ShippingService } from '../../core/services/shipping';
import { getColorStyle } from '../../shared/utils/color.utils';
import { ShippingOption } from '../../shared/models/ecommerce.models';

@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideCheck,
    LucideSparkles,
    LucideTruck,
    LucideMapPin,
    LucideAlertTriangle
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  getColorStyle = getColorStyle;
  public cartService = inject(CartService);
  public authService = inject(AuthService);
  public shippingService = inject(ShippingService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private http = inject(HttpClient);

  loading = signal(false);
  loadingAddress = signal(false);
  cepErrorMessage = signal<string | null>(null);
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

    // Se houver CEP salvo da sessão do carrinho ou do endereço do usuário
    const savedCep = this.shippingService.cep() || this.customerData.zipCode;
    if (savedCep) {
      const clean = savedCep.replace(/\D/g, '');
      if (clean.length === 8) {
        this.customerData.zipCode = `${clean.slice(0, 5)}-${clean.slice(5)}`;
        this.fetchAddressAndShipping(clean);
      }
    }
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

  onZipCodeInput(value: string): void {
    const rawCep = (value || '').replace(/\D/g, '').slice(0, 8);
    this.cepErrorMessage.set(null);

    if (rawCep.length > 5) {
      this.customerData.zipCode = `${rawCep.slice(0, 5)}-${rawCep.slice(5)}`;
    } else {
      this.customerData.zipCode = rawCep;
    }

    if (rawCep.length === 8) {
      this.fetchAddressAndShipping(rawCep);
    }
  }

  fetchAddressAndShipping(cleanCep: string): void {
    if (cleanCep.length !== 8) return;

    this.loadingAddress.set(true);
    this.cepErrorMessage.set(null);

    // 1. Busca direta no ViaCEP para validação e preenchimento de endereço
    this.http.get<any>(`https://viacep.com.br/ws/${cleanCep}/json/`).subscribe({
      next: (data) => {
        this.loadingAddress.set(false);

        // Caso o CEP não exista na base de dados dos Correios
        if (data && (data.erro === true || data.erro === 'true')) {
          this.cepErrorMessage.set('Este CEP não é válido ou não foi encontrado na base de dados dos Correios.');
          this.shippingService.clear();
          return;
        }

        if (data && !data.erro) {
          this.cepErrorMessage.set(null);
          this.customerData.street = data.logradouro || '';
          this.customerData.neighborhood = data.bairro || '';
          this.customerData.city = data.localidade || '';
          this.customerData.state = data.uf || '';

          // 2. Dispara a cotação de opções de frete (PAC / SEDEX)
          this.shippingService.calculateShipping(cleanCep, this.cartService.subtotal()).subscribe({
            error: () => {}
          });
        }
      },
      error: () => {
        this.loadingAddress.set(false);
        this.cepErrorMessage.set('Não foi possível validar o CEP na base dos Correios. Verifique o número digitado.');
      }
    });
  }

  selectShippingOption(option: ShippingOption): void {
    this.shippingService.selectOption(option);
  }

  setPaymentMethod(method: 'PIX' | 'CREDIT_CARD'): void {
    this.paymentMethod.set(method);
  }

  calculateTotal(): number {
    const subtotal = this.cartService.subtotal();
    const shipping = this.shippingService.shippingCost();
    if (this.paymentMethod() === 'PIX') {
      return (subtotal * 0.95) + shipping;
    }
    return subtotal + shipping;
  }

  isFormValid(): boolean {
    const hasPerson = this.customerData.name && this.customerData.email;
    const hasAddress = this.customerData.street && this.customerData.zipCode && this.customerData.number;
    return Boolean(hasPerson && hasAddress && !this.loading() && !this.cepErrorMessage());
  }

  placeOrder(): void {
    if (!this.isFormValid()) {
      alert('Por favor, certifique-se de que os dados de entrega estão completos e válidos.');
      return;
    }

    this.loading.set(true);

    const addressFull = `${this.customerData.street}, ${this.customerData.number} ${this.customerData.complement ? '- ' + this.customerData.complement : ''}, ${this.customerData.neighborhood}, ${this.customerData.city} - ${this.customerData.state} (${this.customerData.zipCode})`;

    const selectedOpt = this.shippingService.selectedOption();
    const shippingMethodLabel = selectedOpt
      ? `${selectedOpt.name} (${selectedOpt.deliveryRange})`
      : 'PAC - Correios Econômico';

    const orderPayload = {
      customerName: this.customerData.name,
      customerEmail: this.customerData.email,
      customerPhone: this.customerData.phone,
      shippingAddress: addressFull,
      shippingCost: this.shippingService.shippingCost(),
      shippingMethod: shippingMethodLabel,
      totalAmount: this.calculateTotal(),
      paymentMethod: this.paymentMethod(),
      items: this.cartService.items().map(item => ({
        productId: item.product.id,
        variantId: item.selectedVariant?.id,
        variantSize: item.selectedVariant?.size,
        variantColor: item.selectedVariant?.color,
        quantity: item.quantity,
        price: item.product.price
      }))
    };

    this.orderService.createOrder(orderPayload).subscribe({
      next: () => {
        this.loading.set(false);
        this.orderPlaced.set(true);
        this.cartService.clearCart();
        this.shippingService.clear();
      },
      error: () => {
        this.loading.set(false);
        this.orderPlaced.set(true);
        this.cartService.clearCart();
        this.shippingService.clear();
      }
    });
  }
}

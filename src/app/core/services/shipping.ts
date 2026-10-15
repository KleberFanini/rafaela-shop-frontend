import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ShippingOption, ShippingResponse } from '../../shared/models/ecommerce.models';

@Injectable({
  providedIn: 'root'
})
export class ShippingService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/shipping`;
  private readonly storageKey = 'rg_shipping_data';

  readonly FREE_SHIPPING_THRESHOLD = 299.00;

  // Signals reativos
  shippingResponse = signal<ShippingResponse | null>(null);
  selectedOption = signal<ShippingOption | null>(null);
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  cep = signal<string>('');

  // Valor atual do frete selecionado
  shippingCost = computed(() => this.selectedOption()?.price ?? 0);

  constructor() {
    this.loadFromStorage();
  }

  calculateShipping(rawCep: string, subtotal: number): Observable<ShippingResponse> {
    const cleanCep = rawCep.replace(/\D/g, '');
    this.errorMessage.set(null);

    if (cleanCep.length !== 8) {
      this.errorMessage.set('Informe um CEP válido com 8 dígitos.');
      return throwError(() => new Error('CEP inválido'));
    }

    this.loading.set(true);
    this.cep.set(cleanCep);

    return this.http.post<ShippingResponse>(`${this.apiUrl}/calculate`, {
      postalCode: cleanCep,
      subtotal
    }).pipe(
      tap((res) => {
        this.loading.set(false);
        this.shippingResponse.set(res);

        // Se já existia uma opção selecionada, tenta mantê-la (ex: PAC continua PAC com novo valor/grátis)
        const currentSelected = this.selectedOption();
        if (currentSelected && res.options) {
          const match = res.options.find(o => o.id === currentSelected.id);
          if (match) {
            this.selectedOption.set(match);
          } else if (res.options.length > 0) {
            this.selectedOption.set(res.options[0]);
          }
        } else if (res.options && res.options.length > 0) {
          // Seleciona por padrão a primeira opção (mais econômica / grátis)
          this.selectedOption.set(res.options[0]);
        }

        this.saveToStorage();
      }),
      catchError((err) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Não foi possível calcular o frete para este CEP. Verifique o número digitado.';
        this.errorMessage.set(msg);
        return throwError(() => err);
      })
    );
  }

  selectOption(option: ShippingOption): void {
    this.selectedOption.set(option);
    this.saveToStorage();
  }

  clear(): void {
    this.shippingResponse.set(null);
    this.selectedOption.set(null);
    this.errorMessage.set(null);
    this.cep.set('');
    try {
      sessionStorage.removeItem(this.storageKey);
    } catch (_) {}
  }

  private saveToStorage(): void {
    try {
      const data = {
        cep: this.cep(),
        response: this.shippingResponse(),
        selectedOption: this.selectedOption()
      };
      sessionStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (_) {}
  }

  private loadFromStorage(): void {
    try {
      const saved = sessionStorage.getItem(this.storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.cep) this.cep.set(data.cep);
        if (data.response) this.shippingResponse.set(data.response);
        if (data.selectedOption) this.selectedOption.set(data.selectedOption);
      }
    } catch (_) {}
  }
}

import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  private router = inject(Router);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Alterna entre a visualização de Login e de Cadastro
  isLoginMode = signal(true);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  // Dados do formulário de Login
  loginData = {
    email: '',
    password: ''
  };

  // Dados do formulário de Cadastro completo com endereço
  registerData = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  };

  toggleMode(): void {
    this.isLoginMode.update(mode => !mode);
    this.errorMessage.set(null);
  }

  // Preenchimento automático de endereço usando a API ViaCEP
  onZipCodeChange(): void {
    const rawCep = this.registerData.zipCode.replace(/\D/g, '');
    if (rawCep.length === 8) {
      this.http.get<any>(`https://viacep.com.br/ws/${rawCep}/json/`).subscribe({
        next: (data) => {
          if (!data.erro) {
            this.registerData.street = data.logradouro || '';
            this.registerData.neighborhood = data.bairro || '';
            this.registerData.city = data.localidade || '';
            this.registerData.state = data.uf || '';
          }
        },
        error: () => { }
      });
    }
  }

  onLogin(): void {
    this.errorMessage.set(null);
    this.loading.set(true);

    setTimeout(() => {
      this.loading.set(false);
      const isAdmin = this.loginData.email.toLowerCase().includes('admin');

      // Inclui o endereço para não ficar vazio no login
      this.authService.login({
        name: isAdmin ? 'Administrador' : 'Cliente Rafaela',
        email: this.loginData.email,
        phone: '(81) 99876-5432',
        role: isAdmin ? 'ADMIN' : 'CUSTOMER',
        address: {
          zipCode: '50000-000',
          street: 'Avenida Boa Viagem',
          number: '1500',
          complement: 'Apt 402',
          neighborhood: 'Boa Viagem',
          city: 'Recife',
          state: 'PE'
        }
      });

      if (isAdmin) {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/checkout']);
      }
    }, 600);
  }

  onRegister(): void {
    this.errorMessage.set(null);

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage.set('As senhas digitadas não coincidem.');
      return;
    }

    if (this.registerData.password.length < 6) {
      this.errorMessage.set('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    this.loading.set(true);

    setTimeout(() => {
      this.loading.set(false);

      this.authService.login({
        name: this.registerData.name,
        email: this.registerData.email,
        phone: this.registerData.phone,
        role: 'CUSTOMER',
        address: {
          zipCode: this.registerData.zipCode,
          street: this.registerData.street,
          number: this.registerData.number,
          complement: this.registerData.complement,
          neighborhood: this.registerData.neighborhood,
          city: this.registerData.city,
          state: this.registerData.state
        }
      });

      this.router.navigate(['/checkout']);
    }, 600);
  }
}

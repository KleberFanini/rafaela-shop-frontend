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

      // Registra a sessão no AuthService
      this.authService.login({
        name: isAdmin ? 'Administrador' : 'Cliente Rafaela',
        email: this.loginData.email,
        role: isAdmin ? 'ADMIN' : 'CUSTOMER'
      });

      // Redireciona de acordo com o papel do usuário
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

      // Registra a sessão com o nome e e-mail informados no cadastro
      this.authService.login({
        name: this.registerData.name,
        email: this.registerData.email,
        role: 'CUSTOMER'
      });

      // Redireciona para o checkout após criar a conta
      this.router.navigate(['/checkout']);
    }, 600);
  }
}

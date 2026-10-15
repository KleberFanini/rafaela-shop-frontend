import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideShieldCheck,
  LucideTruck,
  LucideRefreshCw,
  LucideSparkles,
  LucideCreditCard,
  LucideX,
  LucideHeartHandshake
} from '@lucide/angular';

@Component({
  selector: 'app-footer',
  imports: [
    CommonModule,
    RouterModule,
    LucideShieldCheck,
    LucideTruck,
    LucideRefreshCw,
    LucideSparkles,
    LucideCreditCard,
    LucideX,
    LucideHeartHandshake
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  activePolicy = signal<'envios' | 'trocas' | 'cuidados' | 'pagamentos' | null>(null);

  openPolicy(policy: 'envios' | 'trocas' | 'cuidados' | 'pagamentos'): void {
    this.activePolicy.set(policy);
  }

  closePolicy(): void {
    this.activePolicy.set(null);
  }
}

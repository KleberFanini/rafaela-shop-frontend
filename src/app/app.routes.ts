import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { ProductList } from './pages/products/product-list/product-list';
import { ProductDetail } from './pages/products/product-detail/product-detail';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';
import { Dashboard } from './pages/admin/dashboard/dashboard';
import { ProductForm } from './pages/admin/product-form/product-form';
import { Orders } from './pages/admin/orders/orders';

export const routes: Routes = [
    // Loja pública[cite: 1, 2]
    { path: '', component: Home },
    { path: 'produtos', component: ProductList },
    { path: 'produtos/:id', component: ProductDetail },
    { path: 'carrinho', component: Cart },
    { path: 'checkout', component: Checkout },

    // Área Administrativa[cite: 2]
    { path: 'admin', redirectTo: 'admin/dashboard', pathMatch: 'full' },
    { path: 'admin/dashboard', component: Dashboard },
    { path: 'admin/produtos/novo', component: ProductForm },
    { path: 'admin/pedidos', component: Orders },

    // Redirecionamento padrão
    { path: '**', redirectTo: '' }
];
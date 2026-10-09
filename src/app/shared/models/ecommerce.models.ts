export interface EcommerceModels { }

export interface Category {
    id?: number;
    name: string;
}

export interface ProductVariant {
    id?: number;
    size?: string;
    color?: string;
    stock: number;
}

export interface Product {
    id?: number;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    category: Category;
    variants: ProductVariant[];
    createdAt?: string;
}

export interface CartItem {
    product: Product;
    selectedVariant?: ProductVariant;
    quantity: number;
}

export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    activeCatalogCount: number;
    lowStockCount: number;
}

export interface OrderItem {
    id?: number;
    productId: number;
    productName: string;
    productImage?: string;
    variantSize?: string;
    variantColor?: string;
    quantity: number;
    price: number;
}

export interface Order {
    id?: number;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    shippingAddress: string;
    totalAmount: number;
    paymentMethod: string;
    status: string;
    createdAt?: string;
    items: OrderItem[];
}
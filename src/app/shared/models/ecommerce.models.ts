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
    gender?: 'FEMININO' | 'MASCULINO' | 'UNISSEX' | string;
    category: Category;
    variants: ProductVariant[];
    active?: boolean;
    createdAt?: string;
}

export interface CartItem {
    product: Product;
    selectedVariant?: ProductVariant;
    quantity: number;
}

export interface DashboardStats {
    totalRevenue: number;
    revenueGrowthPercentage?: number;
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
    shippingCost?: number;
    shippingMethod?: string;
    trackingCode?: string;
    createdAt?: string;
    items: OrderItem[];
}

export interface ShippingOption {
    id: string;
    name: string;
    carrier: string;
    price: number;
    originalPrice: number;
    deliveryDays: number;
    deliveryRange: string;
    free: boolean;
    description: string;
}

export interface ShippingResponse {
    postalCode: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    options: ShippingOption[];
}
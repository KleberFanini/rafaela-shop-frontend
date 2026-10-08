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
    category: Category;
    variants: ProductVariant[];
    createdAt?: string;
}

export interface CartItem {
    product: Product;
    selectedVariant?: ProductVariant;
    quantity: number;
}
export interface User {
    _id: string;
    username: string;
    email: string;
    role: 'user' | 'admin';
    createdAt: string;
}

export interface Product {
    _id: string;
    title: string;
    sellingPrice: number;
    discountedPrice: number;
    description: string;
    composition: string;
    prodapp: string;
    category: string;
    categoryLabel: string;
    imageUrl: string;
    inStock: boolean;
}

export interface CartItem {
    _id: string;
    productId: Product;
    quantity: number;
}

export interface CartData {
    items: CartItem[];
    subtotal: number;
    delivery: number;
    total: number;
}

export interface Address {
    _id: string;
    name: string;
    locality: string;
    city: string;
    state: string;
    zipcode: string;
    mobile: string;
}

export interface OrderItem {
    productSnapshot: {
        productId: string;
        title: string;
        imageUrl: string;
        discountedPrice: number;
        category: string;
    };
    quantity: number;
}

export interface Order {
    _id: string;
    items: OrderItem[];
    addressSnapshot: Address;
    status: string;
    totalAmount: number;
    createdAt: string;
    paymentId: {
        razorpayPaymentId: string;
        paid: boolean;
        amount: number;
    };
}

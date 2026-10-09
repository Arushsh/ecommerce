import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const CATEGORIES = [
    { code: 'CR', label: 'Curd' },
    { code: 'ML', label: 'Milk' },
    { code: 'LS', label: 'Lassi' },
    { code: 'MS', label: 'Milkshake' },
    { code: 'PN', label: 'Paneer' },
    { code: 'GH', label: 'Ghee' },
    { code: 'CZ', label: 'Cheese' },
    { code: 'IC', label: 'Ice Cream' },
    { code: 'OT', label: 'Other' },
];

export const CATEGORY_MAP: Record<string, string> = Object.fromEntries(
    CATEGORIES.map((c) => [c.code, c.label])
);

export const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

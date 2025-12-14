import React, { useState, useMemo } from "react";

interface CartItem {
    product: any;
    quantity: number;
}

interface CheckoutPageProps {
    cartItems: CartItem[];
    onBack: () => void;
    onComplete: () => void;
}

type CheckoutStep = 'information' | 'shipping' | 'payment' | 'confirmation';

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ cartItems, onBack, onComplete }) => {
    const [currentStep, setCurrentStep] = useState<CheckoutStep>('information');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderNumber] = useState(() => Math.random().toString(36).substring(2, 10).toUpperCase());
    
    // Form State
    const [formData, setFormData] = useState({
        // Contact
        email: '',
        phone: '',
        // Shipping Address
        firstName: '',
        lastName: '',
        company: '',
        address: '',
        apartment: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        // Shipping Method
        shippingMethod: 'standard',
        // Payment
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvv: '',
        sameAsBilling: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Calculations
    const subtotal = useMemo(() => {
        return cartItems.reduce((acc, item) => {
            let price = 0;
            if (typeof item.product.price === 'number') {
                price = item.product.price;
            } else if (typeof item.product.price === 'string') {
                price = parseFloat(item.product.price.replace('$', ''));
            }
            return acc + (price * item.quantity);
        }, 0);
    }, [cartItems]);

    const shippingCost = useMemo(() => {
        if (subtotal >= 200) return 0; // Free shipping over $200
        if (formData.shippingMethod === 'express') return 24.99;
        if (formData.shippingMethod === 'priority') return 14.99;
        return 9.99; // Standard
    }, [subtotal, formData.shippingMethod]);

    const tax = subtotal * 0.0875; // 8.75% tax
    const total = subtotal + shippingCost + tax;

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    // Form Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateStep = (step: CheckoutStep): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 'information') {
            if (!formData.email) newErrors.email = 'Email is required';
            else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
            if (!formData.firstName) newErrors.firstName = 'First name is required';
            if (!formData.lastName) newErrors.lastName = 'Last name is required';
            if (!formData.address) newErrors.address = 'Address is required';
            if (!formData.city) newErrors.city = 'City is required';
            if (!formData.state) newErrors.state = 'State is required';
            if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
        }

        if (step === 'payment') {
            if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
            else if (formData.cardNumber.replace(/\s/g, '').length < 16) newErrors.cardNumber = 'Invalid card number';
            if (!formData.cardName) newErrors.cardName = 'Name on card is required';
            if (!formData.expiry) newErrors.expiry = 'Expiry date is required';
            if (!formData.cvv) newErrors.cvv = 'CVV is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleContinue = () => {
        if (currentStep === 'information' && validateStep('information')) {
            setCurrentStep('shipping');
        } else if (currentStep === 'shipping') {
            setCurrentStep('payment');
        } else if (currentStep === 'payment' && validateStep('payment')) {
            handlePlaceOrder();
        }
    };

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProcessing(false);
        setCurrentStep('confirmation');
    };

    const steps = [
        { id: 'information', label: 'Information', icon: 'ph-user' },
        { id: 'shipping', label: 'Shipping', icon: 'ph-truck' },
        { id: 'payment', label: 'Payment', icon: 'ph-credit-card' },
    ];

    const stepIndex = steps.findIndex(s => s.id === currentStep);

    // Confirmation Screen
    if (currentStep === 'confirmation') {
        return (
            <div className="min-h-screen bg-[#F9F8F6] dark:bg-background-dark flex items-center justify-center p-4">
                <div className="max-w-lg w-full bg-white dark:bg-[#1D1D1F] rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <i className="ph-thin ph-check-circle text-5xl text-green-500" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-serif text-[#1D1D1F] dark:text-white mb-2">
                        Order Confirmed!
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Thank you for your order. We&apos;ve sent a confirmation email to {formData.email}
                    </p>
                    
                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-6 text-left">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Order Number</span>
                            <span className="text-sm font-bold text-[#1D1D1F] dark:text-white">
                                #BB-{orderNumber}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Total</span>
                            <span className="text-sm font-bold text-[#1D1D1F] dark:text-white">${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Estimated Delivery</span>
                            <span className="text-sm font-bold text-[#1D1D1F] dark:text-white">
                                {formData.shippingMethod === 'express' ? '2-3 business days' : 
                                 formData.shippingMethod === 'priority' ? '3-5 business days' : '5-7 business days'}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onComplete}
                            className="w-full py-4 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-full text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-all"
                        >
                            Continue Shopping
                        </button>
                        <button className="text-sm text-gray-500 hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
                            View Order Details
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F8F6] dark:bg-background-dark">
            {/* Header */}
            <header className="bg-white dark:bg-[#1D1D1F] border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button 
                        onClick={onBack}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                    >
                        <i className="ph-thin ph-arrow-left text-lg" />
                        <span className="hidden sm:inline">Back to Cart</span>
                    </button>
                    
                    <h1 className="text-lg md:text-xl font-serif font-bold text-[#1D1D1F] dark:text-white">
                        Best Bottles
                    </h1>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <i className="ph-thin ph-lock-simple text-lg text-green-500" />
                        <span className="hidden sm:inline">Secure Checkout</span>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="max-w-3xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {steps.map((step, idx) => (
                            <React.Fragment key={step.id}>
                                <button
                                    onClick={() => idx < stepIndex && setCurrentStep(step.id as CheckoutStep)}
                                    disabled={idx > stepIndex}
                                    className={`flex items-center gap-2 ${
                                        idx <= stepIndex 
                                            ? 'text-[#1D1D1F] dark:text-white' 
                                            : 'text-gray-300 dark:text-gray-600'
                                    } ${idx < stepIndex ? 'cursor-pointer hover:text-gold' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                        idx < stepIndex 
                                            ? 'bg-green-500 text-white' 
                                            : idx === stepIndex 
                                                ? 'bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F]' 
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                    }`}>
                                        {idx < stepIndex ? (
                                            <i className="ph-thin ph-check" />
                                        ) : (
                                            idx + 1
                                        )}
                                    </div>
                                    <span className="hidden md:inline text-sm font-medium">{step.label}</span>
                                </button>
                                
                                {idx < steps.length - 1 && (
                                    <div className={`flex-1 h-[2px] mx-2 md:mx-4 ${
                                        idx < stepIndex ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                                    }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Left: Form */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-[#1D1D1F] rounded-2xl shadow-sm p-6 md:p-8">
                            
                            {/* Step 1: Information */}
                            {currentStep === 'information' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-serif font-bold text-[#1D1D1F] dark:text-white mb-4">
                                            Contact Information
                                        </h2>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-white/5 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent`}
                                                    placeholder="you@email.com"
                                                />
                                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                                    Phone (for delivery updates)
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                                    placeholder="(555) 123-4567"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                                        <h2 className="text-lg font-serif font-bold text-[#1D1D1F] dark:text-white mb-4">
                                            Shipping Address
                                        </h2>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                                    First Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 rounded-xl border ${errors.firstName ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-white/5 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent`}
                                                />
                                                {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                                    Last Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 rounded-xl border ${errors.lastName ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-white/5 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent`}
                                                />
                                                {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                                    Company (optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    name="company"
                                                    value={formData.company}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                                    Address *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 rounded-xl border ${errors.address ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-white/5 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent`}
                                                    placeholder="Street address"
                                                />
                                                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                                    Apartment, suite, etc. (optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    name="apartment"
                                                    value={formData.apartment}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                                    City *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 rounded-xl border ${errors.city ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-white/5 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent`}
                                                />
                                                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                                        State *
                                                    </label>
                                                    <select
                                                        name="state"
                                                        value={formData.state}
                                                        onChange={handleInputChange}
                                                        className={`w-full px-4 py-3 rounded-xl border ${errors.state ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-white/5 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent`}
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="CA">California</option>
                                                        <option value="NY">New York</option>
                                                        <option value="TX">Texas</option>
                                                        <option value="FL">Florida</option>
                                                        {/* Add more states */}
                                                    </select>
                                                    {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                                        ZIP *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="zipCode"
                                                        value={formData.zipCode}
                                                        onChange={handleInputChange}
                                                        className={`w-full px-4 py-3 rounded-xl border ${errors.zipCode ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-white/5 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent`}
                                                    />
                                                    {errors.zipCode && <p className="mt-1 text-xs text-red-500">{errors.zipCode}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Shipping */}
                            {currentStep === 'shipping' && (
                                <div className="space-y-6">
                                    <h2 className="text-lg font-serif font-bold text-[#1D1D1F] dark:text-white mb-4">
                                        Shipping Method
                                    </h2>
                                    
                                    <div className="space-y-3">
                                        {[
                                            { id: 'standard', label: 'Standard Shipping', time: '5-7 business days', price: subtotal >= 200 ? 'FREE' : '$9.99' },
                                            { id: 'priority', label: 'Priority Shipping', time: '3-5 business days', price: '$14.99' },
                                            { id: 'express', label: 'Express Shipping', time: '2-3 business days', price: '$24.99' },
                                        ].map((method) => (
                                            <label
                                                key={method.id}
                                                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                                                    formData.shippingMethod === method.id
                                                        ? 'border-gold ring-2 ring-gold bg-gold/5'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="radio"
                                                        name="shippingMethod"
                                                        value={method.id}
                                                        checked={formData.shippingMethod === method.id}
                                                        onChange={handleInputChange}
                                                        className="w-5 h-5 text-gold focus:ring-gold"
                                                    />
                                                    <div>
                                                        <span className="block text-sm font-bold text-[#1D1D1F] dark:text-white">
                                                            {method.label}
                                                        </span>
                                                        <span className="block text-xs text-gray-500">{method.time}</span>
                                                    </div>
                                                </div>
                                                <span className={`text-sm font-bold ${method.price === 'FREE' ? 'text-green-500' : 'text-[#1D1D1F] dark:text-white'}`}>
                                                    {method.price}
                                                </span>
                                            </label>
                                        ))}
                                    </div>

                                    {subtotal < 200 && (
                                        <p className="text-sm text-gray-500 flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-lg p-3">
                                            <i className="ph-thin ph-info" />
                                            Add ${(200 - subtotal).toFixed(2)} more for free standard shipping
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Payment */}
                            {currentStep === 'payment' && (
                                <div className="space-y-6">
                                    <h2 className="text-lg font-serif font-bold text-[#1D1D1F] dark:text-white mb-4">
                                        Payment Details
                                    </h2>

                                    {/* Payment Methods */}
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <i className="ph-thin ph-credit-card text-xl text-gray-400" />
                                            <span className="text-xs text-gray-500">Visa</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <i className="ph-thin ph-credit-card text-xl text-gray-400" />
                                            <span className="text-xs text-gray-500">Mastercard</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <i className="ph-thin ph-credit-card text-xl text-gray-400" />
                                            <span className="text-xs text-gray-500">Amex</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                                Card Number *
                                            </label>
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                value={formData.cardNumber}
                                                onChange={(e) => {
                                                    // Format card number with spaces
                                                    const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                                                    setFormData(prev => ({ ...prev, cardNumber: value.slice(0, 19) }));
                                                }}
                                                className={`w-full px-4 py-3 rounded-xl border ${errors.cardNumber ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-white/5 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent`}
                                                placeholder="1234 5678 9012 3456"
                                            />
                                            {errors.cardNumber && <p className="mt-1 text-xs text-red-500">{errors.cardNumber}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                                Name on Card *
                                            </label>
                                            <input
                                                type="text"
                                                name="cardName"
                                                value={formData.cardName}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 rounded-xl border ${errors.cardName ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-white/5 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent`}
                                            />
                                            {errors.cardName && <p className="mt-1 text-xs text-red-500">{errors.cardName}</p>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                                    Expiry Date *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="expiry"
                                                    value={formData.expiry}
                                                    onChange={(e) => {
                                                        let value = e.target.value.replace(/\D/g, '');
                                                        if (value.length >= 2) {
                                                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                                        }
                                                        setFormData(prev => ({ ...prev, expiry: value }));
                                                    }}
                                                    className={`w-full px-4 py-3 rounded-xl border ${errors.expiry ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-white/5 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent`}
                                                    placeholder="MM/YY"
                                                    maxLength={5}
                                                />
                                                {errors.expiry && <p className="mt-1 text-xs text-red-500">{errors.expiry}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                                    CVV *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cvv"
                                                    value={formData.cvv}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                        setFormData(prev => ({ ...prev, cvv: value }));
                                                    }}
                                                    className={`w-full px-4 py-3 rounded-xl border ${errors.cvv ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-white/5 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent`}
                                                    placeholder="123"
                                                    maxLength={4}
                                                />
                                                {errors.cvv && <p className="mt-1 text-xs text-red-500">{errors.cvv}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security Badge */}
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                                        <i className="ph-thin ph-shield-check text-2xl text-green-500" />
                                        <div>
                                            <span className="block text-sm font-medium text-[#1D1D1F] dark:text-white">
                                                Your payment is secure
                                            </span>
                                            <span className="block text-xs text-gray-500">
                                                256-bit SSL encryption protects your data
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Continue Button */}
                            <div className="mt-8 flex items-center justify-between">
                                {currentStep !== 'information' && (
                                    <button
                                        onClick={() => setCurrentStep(currentStep === 'payment' ? 'shipping' : 'information')}
                                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                                    >
                                        <i className="ph-thin ph-arrow-left" />
                                        Back
                                    </button>
                                )}
                                <button
                                    onClick={handleContinue}
                                    disabled={isProcessing}
                                    className={`${currentStep === 'information' ? 'w-full' : 'ml-auto'} py-4 px-8 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-full text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white dark:border-[#1D1D1F] border-t-transparent rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : currentStep === 'payment' ? (
                                        <>
                                            <i className="ph-thin ph-lock-simple" />
                                            Place Order - ${total.toFixed(2)}
                                        </>
                                    ) : (
                                        <>
                                            Continue
                                            <i className="ph-thin ph-arrow-right" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-[#1D1D1F] rounded-2xl shadow-sm p-6 sticky top-32">
                            <h2 className="text-lg font-serif font-bold text-[#1D1D1F] dark:text-white mb-4 flex items-center justify-between">
                                Order Summary
                                <span className="text-sm font-normal text-gray-500">({totalItems} items)</span>
                            </h2>

                            {/* Cart Items */}
                            <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
                                {cartItems.map((item, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-white/10 rounded-lg overflow-hidden flex-shrink-0 relative">
                                            <img
                                                src={item.product.imageUrl}
                                                alt={item.product.name}
                                                className="w-full h-full object-contain"
                                            />
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-[#1D1D1F] dark:text-white truncate">
                                                {item.product.name}
                                            </h4>
                                            {item.product.variant && (
                                                <p className="text-xs text-gray-500 truncate">{item.product.variant}</p>
                                            )}
                                            <p className="text-sm font-bold text-[#1D1D1F] dark:text-white mt-1">
                                                ${(typeof item.product.price === 'number' 
                                                    ? item.product.price * item.quantity 
                                                    : parseFloat(item.product.price.replace('$', '')) * item.quantity
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Promo Code */}
                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mb-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Promo code"
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 text-sm text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-gold"
                                    />
                                    <button className="px-4 py-2 bg-gray-100 dark:bg-white/10 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                                        Apply
                                    </button>
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="text-[#1D1D1F] dark:text-white">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Shipping</span>
                                    <span className={shippingCost === 0 ? 'text-green-500' : 'text-[#1D1D1F] dark:text-white'}>
                                        {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Estimated Tax</span>
                                    <span className="text-[#1D1D1F] dark:text-white">${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-[#1D1D1F] dark:text-white">Total</span>
                                    <span className="text-[#1D1D1F] dark:text-white">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-center gap-4 text-gray-400">
                                    <i className="ph-thin ph-lock-simple text-xl" />
                                    <i className="ph-thin ph-shield-check text-xl" />
                                    <i className="ph-thin ph-credit-card text-xl" />
                                </div>
                                <p className="text-center text-xs text-gray-400 mt-2">
                                    Secure checkout powered by Stripe
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

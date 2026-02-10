import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Star, Check } from 'lucide-react';
import '../styles/ProductPage.css';

const CrystalClarityPage = () => {
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isLiked, setIsLiked] = useState(false);

    const product = {
        id: 3,
        name: 'Crystal Clarity',
        tagline: 'Pure Transparency',
        price: 159.99,
        rating: 4.8,
        reviews: 189,
        description: 'Experience the beauty of pure transparency with Crystal Clarity. This ultra-clear glass bottle showcases your premium contents with unmatched brilliance, featuring precision-cut facets that create stunning light reflections.',
        images: [
            '/images/crystal-clarity-1.jpg',
            '/images/crystal-clarity-2.jpg',
            '/images/crystal-clarity-3.jpg',
            '/images/crystal-clarity-4.jpg'
        ],
        features: [
            'Ultra-clear crystal glass',
            'Precision-cut facets',
            'Diamond-inspired design',
            'Lead-free composition',
            'Handcrafted quality',
            'Luxury presentation box'
        ],
        specs: {
            capacity: '750ml',
            material: 'Crystal Glass',
            height: '30cm',
            diameter: '8.5cm',
            weight: '900g',
            finish: 'Ultra-Clear'
        }
    };

    const handleAddToCart = () => {
        console.log(`Added ${quantity} Crystal Clarity to cart`);
        // Add to cart logic here
    };

    return (
        <div className="product-page">
            {/* Hero Section */}
            <div className="product-hero">
                <button className="back-button" onClick={() => navigate('/')}>
                    <ArrowLeft size={20} />
                    <span>Back to Collection</span>
                </button>

                <div className="product-hero-content">
                    {/* Image Gallery */}
                    <div className="product-gallery">
                        <div className="main-image">
                            <img src={product.images[selectedImage]} alt={product.name} />
                            <button
                                className={`like-button ${isLiked ? 'liked' : ''}`}
                                onClick={() => setIsLiked(!isLiked)}
                            >
                                <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
                            </button>
                        </div>
                        <div className="thumbnail-gallery">
                            {product.images.map((image, index) => (
                                <button
                                    key={index}
                                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <img src={image} alt={`${product.name} view ${index + 1}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="product-info">
                        <div className="product-header">
                            <div>
                                <h1 className="product-title">{product.name}</h1>
                                <p className="product-tagline">{product.tagline}</p>
                            </div>
                            <div className="product-rating">
                                <Star size={20} fill="currentColor" />
                                <span className="rating-value">{product.rating}</span>
                                <span className="rating-count">({product.reviews} reviews)</span>
                            </div>
                        </div>

                        <div className="product-price">
                            <span className="price-value">${product.price}</span>
                            <span className="price-label">per bottle</span>
                        </div>

                        <p className="product-description">{product.description}</p>

                        {/* Features */}
                        <div className="product-features">
                            <h3>Key Features</h3>
                            <ul className="features-list">
                                {product.features.map((feature, index) => (
                                    <li key={index}>
                                        <Check size={18} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Quantity Selector */}
                        <div className="quantity-selector">
                            <label>Quantity</label>
                            <div className="quantity-controls">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <span className="quantity-value">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="product-actions">
                            <button className="add-to-cart-button" onClick={handleAddToCart}>
                                <ShoppingCart size={20} />
                                <span>Add to Cart</span>
                            </button>
                            <button className="buy-now-button">
                                Buy Now
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="trust-badges">
                            <div className="badge">
                                <span className="badge-icon">🚚</span>
                                <span className="badge-text">Free Shipping</span>
                            </div>
                            <div className="badge">
                                <span className="badge-icon">↩️</span>
                                <span className="badge-text">30-Day Returns</span>
                            </div>
                            <div className="badge">
                                <span className="badge-icon">✓</span>
                                <span className="badge-text">Authenticity Guaranteed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Specifications Section */}
            <section className="product-specs-section">
                <div className="container">
                    <h2 className="section-title">Technical Specifications</h2>
                    <div className="specs-grid">
                        {Object.entries(product.specs).map(([key, value]) => (
                            <div key={key} className="spec-item">
                                <span className="spec-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                <span className="spec-value">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Related Products */}
            <section className="related-products-section">
                <div className="container">
                    <h2 className="section-title">You May Also Like</h2>
                    <div className="related-products-grid">
                        <div className="related-product-card" onClick={() => navigate('/products/amber-essence')}>
                            <img src="/images/amber-essence-1.jpg" alt="Amber Essence" />
                            <h3>Amber Essence</h3>
                            <p className="related-price">$129.99</p>
                        </div>
                        <div className="related-product-card" onClick={() => navigate('/products/midnight-noir')}>
                            <img src="/images/midnight-noir-1.jpg" alt="Midnight Noir" />
                            <h3>Midnight Noir</h3>
                            <p className="related-price">$149.99</p>
                        </div>
                        <div className="related-product-card" onClick={() => navigate('/products/emerald-luxe')}>
                            <img src="/images/emerald-luxe-1.jpg" alt="Emerald Luxe" />
                            <h3>Emerald Luxe</h3>
                            <p className="related-price">$169.99</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CrystalClarityPage;

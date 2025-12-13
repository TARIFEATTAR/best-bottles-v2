import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { ModernHome } from "./components/ModernHome";
import { ProductDetail } from "./components/ProductDetail";
import { ConsultationPage } from "./components/ConsultationPage";
import { CollectionsPage } from "./components/CollectionsPage";
import { CollectionDetailPage } from "./components/CollectionDetailPage";
import { CustomPage } from "./components/CustomPage";
import { JournalPage } from "./components/JournalPage";
import { PackagingIdeasPage } from "./components/PackagingIdeasPage";
import { HelpCenterPage } from "./components/HelpCenterPage";
import { ContactPage } from "./components/ContactPage";
import { ContractPackagingPage } from "./components/ContractPackagingPage";
import { Footer } from "./components/Footer";
import { ChatBot } from "./components/ChatBot";
import { AuthModal } from "./components/AuthModal";
import { SignUpPage } from "./components/SignUpPage";
import { CartDrawer } from "./components/CartDrawer";

// Simple Fade Transition Wrapper
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        // Trigger fade in on mount
        const timer = setTimeout(() => setOpacity(1), 50);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div 
            style={{ 
                opacity, 
                transition: "opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
                width: '100%'
            }}
        >
            {children}
        </div>
    );
};

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'detail' | 'consultation' | 'collections' | 'collection-detail' | 'custom' | 'journal' | 'packaging-ideas' | 'help-center' | 'contact' | 'signup' | 'contract-packaging'>('home');
  const [cartItems, setCartItems] = useState<{product: any, quantity: number}[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Scroll to top on view change
  useEffect(() => {
      window.scrollTo(0, 0);
  }, [view]);

  // Listen for custom navigation events from BentoGrid and other components
  useEffect(() => {
    const handleContractNav = () => setView('contract-packaging');
    window.addEventListener('navigate-to-contract', handleContractNav);
    return () => window.removeEventListener('navigate-to-contract', handleContractNav);
  }, []);

  const addToCart = (product: any, quantity: number) => {
    console.log("Adding to cart:", product, "Quantity:", quantity);
    setCartItems(prev => {
        // Normalize checking for duplicates
        const existingIndex = prev.findIndex(item => {
             // Check standard SKU
             if (item.product.sku && product.sku && item.product.sku === product.sku) return true;
             // Check name + variant (for custom objects from ProductDetail)
             if (item.product.name === product.name && item.product.variant === product.variant) return true;
             return false;
        });

        if (existingIndex > -1) {
            const newCart = [...prev];
            newCart[existingIndex].quantity += quantity;
            return newCart;
        }
        return [...prev, { product, quantity }];
    });
    // Auto open cart on add
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
      setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateCartQuantity = (index: number, newQty: number) => {
      if (newQty === 0) {
          removeFromCart(index);
      } else {
          setCartItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: newQty } : item));
      }
  };

  const navigateToHome = () => setView('home');
  const navigateToDetail = () => setView('detail');
  const navigateToConsultation = () => setView('consultation');
  const navigateToCollections = () => setView('collections');
  const navigateToCollectionDetail = () => setView('collection-detail');
  const navigateToCustom = () => setView('custom');
  const navigateToJournal = () => setView('journal');
  const navigateToPackagingIdeas = () => setView('packaging-ideas');
  const navigateToHelpCenter = () => setView('help-center');
  const navigateToContact = () => setView('contact');
  const navigateToSignUp = () => setView('signup');
  const navigateToContractPackaging = () => setView('contract-packaging');

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const renderView = () => {
      switch(view) {
          case 'home': return <ModernHome 
            onProductClick={navigateToDetail} 
            onConsultationClick={navigateToConsultation}
            onCollectionClick={navigateToCollectionDetail}
            onPackagingIdeasClick={navigateToPackagingIdeas}
            onAddToCart={addToCart}
          />;
          case 'detail': return <ProductDetail onBack={navigateToHome} onAddToCart={addToCart} />;
          case 'consultation': return <ConsultationPage onBack={navigateToHome} />;
          case 'collections': return <CollectionsPage onCollectionClick={navigateToCollectionDetail} />;
          case 'collection-detail': return <CollectionDetailPage onBack={navigateToCollections} onProductClick={navigateToDetail} onAddToCart={addToCart} />;
          case 'custom': return <CustomPage />;
          case 'journal': return <JournalPage />;
          case 'packaging-ideas': return <PackagingIdeasPage onBack={navigateToHome} onStartProject={navigateToCustom} />;
          case 'help-center': return <HelpCenterPage onBack={navigateToHome} onContactClick={navigateToContact} />;
          case 'contact': return <ContactPage onBack={navigateToHome} />;
          case 'signup': return <SignUpPage onBack={navigateToHome} onLoginClick={() => { setView('home'); setIsAuthModalOpen(true); }} />;
          case 'contract-packaging': return <ContractPackagingPage onBack={navigateToHome} onContactClick={navigateToContact} />;
          default: return <ModernHome />;
      }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col font-sans bg-background-light dark:bg-background-dark">
      <Header 
        onHomeClick={navigateToHome} 
        onConsultationClick={navigateToConsultation}
        onCollectionsClick={navigateToCollections}
        onCustomClick={navigateToCustom}
        onJournalClick={navigateToJournal}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onSignUpClick={navigateToSignUp}
        onCartClick={() => setIsCartOpen(true)}
        cartCount={totalCartCount}
      />
      <main className="flex-grow w-full flex flex-col">
        {/* Wrap active view in transition container */}
        <PageTransition key={view}>
            {renderView()}
        </PageTransition>
      </main>
      {view !== 'collection-detail' && view !== 'signup' && <Footer onHelpCenterClick={navigateToHelpCenter} onContactClick={navigateToContact} />}
      <ChatBot />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSignUpClick={() => { setIsAuthModalOpen(false); navigateToSignUp(); }}
      />
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateCartQuantity}
        onAddToCart={addToCart}
      />
    </div>
  );
};

export default App;
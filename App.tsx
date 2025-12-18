
import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { ModernHome } from "./components/ModernHome";
import { ProductDetail } from "./components/ProductDetail";
import { ProductDetailConfigurable } from "./components/ProductDetailConfigurable";
import { ConsultationPage } from "./components/ConsultationPage";
import { CollectionsPage } from "./components/CollectionsPage";
import { CollectionDetailPage } from "./components/CollectionDetailPage";
import { CustomPage } from "./components/CustomPage";
import { JournalPage } from "./components/JournalPage";
import { PackagingIdeasPage } from "./components/PackagingIdeasPage";
import { HelpCenterPage } from "./components/HelpCenterPage";
import { ContactPage } from "./components/ContactPage";
import { ContractPackagingPage } from "./components/ContractPackagingPage";
import { CheckoutPage } from "./components/CheckoutPage";
import { Footer } from "./components/Footer";
import { ChatBot } from "./components/ChatBot";
import { AuthModal } from "./components/AuthModal";
import { SignUpPage } from "./components/SignUpPage";
import { CartDrawer } from "./components/CartDrawer";
import LabelGenerator from "./components/LabelGenerator";
import { FeaturesPage } from "./components/FeaturesPage";

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

export interface ProjectDraft {
  category?: string;
  capacity?: string;
  quantity?: number;
  color?: string;
}

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'detail' | 'roll-on-detail' | 'consultation' | 'collections' | 'collection-detail' | 'custom' | 'journal' | 'packaging-ideas' | 'help-center' | 'contact' | 'signup' | 'contract-packaging' | 'checkout' | 'label-generator' | 'features'>('home');
  const [cartItems, setCartItems] = useState<{ product: any, quantity: number }[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'fr'>('en');

  // Use "9ml-cylinder-roll-on" as default
  const [selectedProductId, setSelectedProductId] = useState<string>("9ml-cylinder-roll-on");

  // State for passing data to builder from voice chat
  const [projectDraft, setProjectDraft] = useState<ProjectDraft | null>(null);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // Listen for custom navigation events
  useEffect(() => {
    // Contract Packaging
    const handleContractNav = () => setView('contract-packaging');

    // Project Builder (from Voice/Search)
    const handleBuilderNav = (e: Event) => {
      const customEvent = e as CustomEvent;
      const details = customEvent.detail;

      console.log("Navigating to builder with details:", details);

      // Update persistent draft state
      setProjectDraft({
        category: details.category,
        capacity: details.capacity,
        quantity: details.quantity ? Number(details.quantity) : undefined,
        color: details.color
      });

      setView('consultation');
    };

    window.addEventListener('navigate-to-contract', handleContractNav);
    window.addEventListener('navigate-to-builder', handleBuilderNav);

    // Label Generator navigation - can trigger with: window.dispatchEvent(new Event('navigate-to-label'))
    const handleLabelNav = () => setView('label-generator');
    window.addEventListener('navigate-to-label', handleLabelNav);

    console.log("🎨 To open Label Generator, run: window.dispatchEvent(new Event('navigate-to-label'))");

    return () => {
      window.removeEventListener('navigate-to-contract', handleContractNav);
      window.removeEventListener('navigate-to-builder', handleBuilderNav);
      window.removeEventListener('navigate-to-label', handleLabelNav);
    };
  }, []);

  const addToCart = (product: any, quantity: number) => {
    console.log("Adding to cart:", product, "Quantity:", quantity);
    setCartItems(prev => {
      // Normalize checking for duplicates
      const existingIndex = prev.findIndex(item => {
        // Check standard SKU
        if (item.product.sku && product.sku && item.product.sku === product.sku) return true;
        // Check name + variant (for custom objects from ProductDetail/Consultation)
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

  // Update to accept productId
  const navigateToRollOnDetail = (productId?: string) => {
    if (productId) setSelectedProductId(productId);
    setView('roll-on-detail');
  };

  const navigateToConsultation = () => { setView('consultation'); };
  const navigateToCollections = () => setView('collections');
  const navigateToCollectionDetail = () => setView('collection-detail');
  const navigateToCustom = () => setView('custom');
  const navigateToJournal = () => setView('journal');
  const navigateToPackagingIdeas = () => setView('packaging-ideas');
  const navigateToHelpCenter = () => setView('help-center');
  const navigateToContact = () => setView('contact');
  const navigateToSignUp = () => setView('signup');
  const navigateToContractPackaging = () => setView('contract-packaging');
  const navigateToCheckout = () => { setIsCartOpen(false); setView('checkout'); };
  const navigateToLabelGenerator = () => setView('label-generator');

  const navigateToFeatures = () => setView('features');

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const renderView = () => {
    switch (view) {
      case 'home': return <ModernHome
        onProductClick={() => navigateToRollOnDetail("9ml-cylinder-roll-on")}
        onConsultationClick={navigateToConsultation}
        onCollectionClick={navigateToCollectionDetail}
        onPackagingIdeasClick={navigateToPackagingIdeas}
        onAddToCart={addToCart}
        language={language}
      />;
      case 'detail': return <ProductDetail onBack={navigateToHome} onAddToCart={addToCart} />;
      // Added key={selectedProductId} to ensure component remounts when ID changes, fixing state sync issues and eliminating the need for useEffect setStates
      case 'roll-on-detail': return <ProductDetailConfigurable key={selectedProductId} productId={selectedProductId} onBack={navigateToHome} onAddToCart={addToCart} />;
      case 'consultation': return <ConsultationPage onBack={navigateToHome} projectDraft={projectDraft} onAddToCart={addToCart} />;
      case 'collections': return <CollectionsPage onCollectionClick={navigateToCollectionDetail} />;
      case 'collection-detail': return <CollectionDetailPage onBack={navigateToCollections} onProductClick={navigateToRollOnDetail} onAddToCart={addToCart} />;
      case 'custom': return <CustomPage />;
      case 'journal': return <JournalPage />;
      case 'packaging-ideas': return <PackagingIdeasPage onBack={navigateToHome} onStartProject={navigateToCustom} />;
      case 'help-center': return <HelpCenterPage onBack={navigateToHome} onContactClick={navigateToContact} />;
      case 'contact': return <ContactPage onBack={navigateToHome} />;
      case 'signup': return <SignUpPage onBack={navigateToHome} onLoginClick={() => { setView('home'); setIsAuthModalOpen(true); }} />;
      case 'contract-packaging': return <ContractPackagingPage onBack={navigateToHome} onContactClick={navigateToContact} />;
      case 'checkout': return <CheckoutPage cartItems={cartItems} onBack={() => { setView('home'); setIsCartOpen(true); }} onComplete={() => { setCartItems([]); setView('home'); }} />;
      case 'label-generator': return <LabelGenerator />;
      case 'features': return <FeaturesPage onBack={navigateToHome} />;
      default: return <ModernHome />;
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col font-sans bg-background-light dark:bg-background-dark">
      {view !== 'consultation' && view !== 'checkout' && (
        <Header
          onHomeClick={navigateToHome}
          onConsultationClick={navigateToConsultation}
          onCollectionsClick={navigateToCollections}
          onCustomClick={navigateToCustom}
          onJournalClick={navigateToJournal}
          onLoginClick={() => setIsAuthModalOpen(true)}
          onSignUpClick={navigateToSignUp}
          onCartClick={() => setIsCartOpen(true)}
          onContactClick={navigateToContact}
          onHelpCenterClick={navigateToHelpCenter}
          onFeaturesClick={navigateToFeatures}
          cartCount={totalCartCount}
          language={language}
          onLanguageChange={setLanguage}
        />
      )}
      <main className="flex-grow w-full flex flex-col">
        {/* Wrap active view in transition container */}
        <PageTransition key={view}>
          {renderView()}
        </PageTransition>
      </main>
      {view !== 'collection-detail' && view !== 'signup' && view !== 'consultation' && view !== 'features' && <Footer onHelpCenterClick={navigateToHelpCenter} onContactClick={navigateToContact} />}
      {view !== 'consultation' && <ChatBot />}
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
        onCheckout={navigateToCheckout}
      />
    </div>
  );
};

export default App;

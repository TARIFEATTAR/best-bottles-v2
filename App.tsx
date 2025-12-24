
import React, { useState, useEffect, Suspense, lazy } from "react";
import { Header } from "./components/Header";
import { ModernHome } from "./components/ModernHome";
import { Footer } from "./components/Footer";
import { ChatBot } from "./components/ChatBot";
import { AuthModal } from "./components/AuthModal";
import { CartDrawer } from "./components/CartDrawer";
import { PageLoader } from "./components/PageLoader";

// ============================================
// LAZY LOADED COMPONENTS
// These are code-split into separate chunks and
// loaded on demand when the user navigates to them.
// ============================================

// Heavy pages (sorted by size)
const ConsultationPage = lazy(() => import("./components/ConsultationPage").then(m => ({ default: m.ConsultationPage })));
const CheckoutPage = lazy(() => import("./components/CheckoutPage").then(m => ({ default: m.CheckoutPage })));
const ProductDetailConfigurable = lazy(() => import("./components/ProductDetailConfigurable").then(m => ({ default: m.ProductDetailConfigurable })));
const CollectionDetailPage = lazy(() => import("./components/CollectionDetailPage").then(m => ({ default: m.CollectionDetailPage })));
const ConciergePage = lazy(() => import("./components/ConciergePage").then(m => ({ default: m.ConciergePage })));
const FeaturesPage = lazy(() => import("./components/FeaturesPage").then(m => ({ default: m.FeaturesPage })));
const LabelGenerator = lazy(() => import("./components/LabelGenerator"));
const ContactPage = lazy(() => import("./components/ContactPage").then(m => ({ default: m.ContactPage })));
const JournalPage = lazy(() => import("./components/JournalPage").then(m => ({ default: m.JournalPage })));
const CustomPage = lazy(() => import("./components/CustomPage").then(m => ({ default: m.CustomPage })));
const SignUpPage = lazy(() => import("./components/SignUpPage").then(m => ({ default: m.SignUpPage })));
const ContractPackagingPage = lazy(() => import("./components/ContractPackagingPage").then(m => ({ default: m.ContractPackagingPage })));
const CollectionsPage = lazy(() => import("./components/CollectionsPage").then(m => ({ default: m.CollectionsPage })));
const ProductDetail = lazy(() => import("./components/ProductDetail").then(m => ({ default: m.ProductDetail })));
const PackagingIdeasPage = lazy(() => import("./components/PackagingIdeasPage").then(m => ({ default: m.PackagingIdeasPage })));
const BottleBlueprintDemo = lazy(() => import("./src/demos/bottleBlueprint/BottleBlueprintDemo"));
const BlueprintBuilderV2 = lazy(() => import("./src/demos/blueprintBuilderV2"));
const ShopifyDebugger = lazy(() => import("./src/components/ShopifyDebugger").then(m => ({ default: m.ShopifyDebugger })));



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
  const [view, setView] = useState<'home' | 'detail' | 'roll-on-detail' | 'consultation' | 'collections' | 'collection-detail' | 'custom' | 'journal' | 'packaging-ideas' | 'concierge' | 'contact' | 'signup' | 'contract-packaging' | 'checkout' | 'label-generator' | 'features' | 'bottle-blueprint' | 'blueprint-builder-v2' | 'test-shopify'>('home');

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

  // Listen for custom navigation events and URL checks
  useEffect(() => {
    // 1. URL Check for Sandbox Demos
    const path = window.location.pathname;
    if (path.includes('/demo/bottle-blueprint')) {
      setView('bottle-blueprint');
    }
    if (path.includes('/demo/blueprint-builder-v2') || path.includes('/demo/blueprint-v2')) {
      setView('blueprint-builder-v2');
    }
    if (path.includes('/test-shopify')) {
      setView('test-shopify');
    }


    // 2. Custom Events
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
    console.log("🧪 To open Bottle Blueprint, visit: /demo/bottle-blueprint or run: window.history.pushState({}, '', '/demo/bottle-blueprint'); window.dispatchEvent(new Event('popstate'));");

    return () => {
      window.removeEventListener('navigate-to-contract', handleContractNav);
      window.removeEventListener('navigate-to-builder', handleBuilderNav);
      window.removeEventListener('navigate-to-label', handleLabelNav);
    };
  }, []);

  const addToCart = (product: any, quantity: number) => {
    if (!product) return;
    console.log("Adding to cart:", product, "Quantity:", quantity);

    setCartItems(prev => {
      // Normalize checking for duplicates
      const existingIndex = prev.findIndex(item => {
        if (!item?.product) return false;

        // 1. Check standard SKU (best for inventory items)
        if (item.product.sku && product.sku && item.product.sku === product.sku) return true;

        // 2. Check name + variant (for custom/configurable objects)
        const itemVariant = item.product.variant || "";
        const prodVariant = product.variant || "";
        if (item.product.name === product.name && itemVariant === prodVariant) return true;

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

  const navigateToHome = () => {
    window.history.pushState({}, '', '/'); // Reset URL when going home from a demo
    setView('home');
  };
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
  const navigateToConcierge = () => setView('concierge');
  const navigateToContact = () => setView('contact');
  const navigateToSignUp = () => setView('signup');
  const navigateToContractPackaging = () => setView('contract-packaging');
  const navigateToCheckout = () => { setIsCartOpen(false); setView('checkout'); };
  const navigateToLabelGenerator = () => setView('label-generator');

  const navigateToFeatures = () => setView('features');
  const navigateToBlueprint = () => setView('blueprint-builder-v2');

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const renderView = () => {
    switch (view) {
      case 'home': return <ModernHome
        onProductClick={() => navigateToRollOnDetail("9ml-cylinder-roll-on")}
        onConsultationClick={navigateToConsultation}
        onCollectionClick={navigateToCollectionDetail}
        onPackagingIdeasClick={navigateToPackagingIdeas}
        onAddToCart={addToCart}
        onBlueprintClick={navigateToBlueprint}
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
      case 'concierge': return <ConciergePage onBack={navigateToHome} onContactClick={navigateToContact} />;
      case 'contact': return <ContactPage onBack={navigateToHome} />;
      case 'signup': return <SignUpPage onBack={navigateToHome} onLoginClick={() => { setView('home'); setIsAuthModalOpen(true); }} />;
      case 'contract-packaging': return <ContractPackagingPage onBack={navigateToHome} onContactClick={navigateToContact} />;
      case 'checkout': return <CheckoutPage cartItems={cartItems} onBack={() => { setView('home'); setIsCartOpen(true); }} onComplete={() => { setCartItems([]); setView('home'); }} />;
      case 'label-generator': return <LabelGenerator />;
      case 'features': return <FeaturesPage onBack={navigateToHome} />;
      case 'bottle-blueprint': return <BottleBlueprintDemo />;
      case 'blueprint-builder-v2': return <BlueprintBuilderV2 onAddToCart={addToCart} />;
      case 'test-shopify': return <ShopifyDebugger />;

      default: return <ModernHome />;
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col font-sans bg-background-light dark:bg-background-dark">
      {view !== 'consultation' && view !== 'checkout' && view !== 'blueprint-builder-v2' && (
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
          onHelpCenterClick={navigateToConcierge}
          onFeaturesClick={navigateToFeatures}
          cartCount={totalCartCount}
          language={language}
          onLanguageChange={setLanguage}
        />
      )}
      <main className="flex-grow w-full flex flex-col">
        {/* Wrap active view in Suspense for lazy-loaded components */}
        <Suspense fallback={<PageLoader message="Loading page..." />}>
          <PageTransition key={view}>
            {renderView()}
          </PageTransition>
        </Suspense>
      </main>
      {view !== 'collection-detail' && view !== 'signup' && view !== 'consultation' && view !== 'features' && view !== 'blueprint-builder-v2' && <Footer onHelpCenterClick={navigateToConcierge} onContactClick={navigateToContact} />}
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

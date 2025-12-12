import React, { useState } from "react";
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
import { Footer } from "./components/Footer";
import { ChatBot } from "./components/ChatBot";

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'detail' | 'consultation' | 'collections' | 'collection-detail' | 'custom' | 'journal' | 'packaging-ideas' | 'help-center' | 'contact'>('home');
  const [cartItems, setCartItems] = useState<{product: any, quantity: number}[]>([]);

  const addToCart = (product: any, quantity: number) => {
    console.log("Adding to cart:", product, "Quantity:", quantity);
    setCartItems(prev => {
        const existing = prev.find(item => item.product.sku === product.sku || item.product.name === product.name);
        if (existing) {
            return prev.map(item => 
                (item.product.sku === product.sku || item.product.name === product.name) 
                ? { ...item, quantity: item.quantity + quantity } 
                : item
            );
        }
        return [...prev, { product, quantity }];
    });
  };

  const navigateToHome = () => {
    setView('home');
    window.scrollTo(0, 0);
  };

  const navigateToDetail = () => {
    setView('detail');
    window.scrollTo(0, 0);
  };

  const navigateToConsultation = () => {
    setView('consultation');
    window.scrollTo(0, 0);
  };

  const navigateToCollections = () => {
    setView('collections');
    window.scrollTo(0, 0);
  };

  const navigateToCollectionDetail = () => {
    setView('collection-detail');
    window.scrollTo(0, 0);
  };

  const navigateToCustom = () => {
    setView('custom');
    window.scrollTo(0, 0);
  };

  const navigateToJournal = () => {
    setView('journal');
    window.scrollTo(0, 0);
  };

  const navigateToPackagingIdeas = () => {
    setView('packaging-ideas');
    window.scrollTo(0, 0);
  };

  const navigateToHelpCenter = () => {
    setView('help-center');
    window.scrollTo(0, 0);
  };
  
  const navigateToContact = () => {
    setView('contact');
    window.scrollTo(0, 0);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="relative flex min-h-screen w-full flex-col font-sans bg-background-light dark:bg-background-dark">
      <Header 
        onHomeClick={navigateToHome} 
        onConsultationClick={navigateToConsultation}
        onCollectionsClick={navigateToCollections}
        onCustomClick={navigateToCustom}
        onJournalClick={navigateToJournal}
        cartCount={totalCartCount}
      />
      <main className="flex-grow w-full flex flex-col">
        {view === 'home' && (
          <ModernHome 
            onProductClick={navigateToDetail} 
            onConsultationClick={navigateToConsultation}
            onCollectionClick={navigateToCollectionDetail}
            onPackagingIdeasClick={navigateToPackagingIdeas}
            onAddToCart={addToCart}
          />
        )}
        {view === 'detail' && (
          <ProductDetail 
            onBack={navigateToHome} 
            onAddToCart={addToCart}
          />
        )}
        {view === 'consultation' && (
          <ConsultationPage onBack={navigateToHome} />
        )}
        {view === 'collections' && (
          <CollectionsPage onCollectionClick={navigateToCollectionDetail} />
        )}
        {view === 'collection-detail' && (
          <CollectionDetailPage 
            onBack={navigateToCollections} 
            onProductClick={navigateToDetail}
          />
        )}
        {view === 'custom' && (
          <CustomPage />
        )}
        {view === 'journal' && (
          <JournalPage />
        )}
        {view === 'packaging-ideas' && (
          <PackagingIdeasPage 
            onBack={navigateToHome}
            onStartProject={navigateToCustom}
          />
        )}
        {view === 'help-center' && (
          <HelpCenterPage 
            onBack={navigateToHome}
            onContactClick={navigateToContact}
          />
        )}
        {view === 'contact' && (
          <ContactPage onBack={navigateToHome} />
        )}
      </main>
      {view !== 'collection-detail' && <Footer onHelpCenterClick={navigateToHelpCenter} onContactClick={navigateToContact} />}
      <ChatBot />
    </div>
  );
};

export default App;
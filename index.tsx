import React from 'react';
import ReactDOM from 'react-dom/client';
import { ShopifyProvider } from '@shopify/hydrogen-react';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const rawDomain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || 'mock.shop';
const cleanDomain = rawDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');

const shopifyConfig = {
  storeDomain: cleanDomain,
  storefrontToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_API_TOKEN || 'public',
  storefrontApiVersion: '2024-01',
  countryIsoCode: 'US' as const,
  languageIsoCode: 'EN' as const,
};


const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ShopifyProvider {...shopifyConfig}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ShopifyProvider>
  </React.StrictMode>
);
import React from 'react';
import { MVP_ProductBuilder } from '../demos/productBuilder/MVP_ProductBuilder';

export const PaperDollTest: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto py-8">
                <h1 className="text-2xl font-bold text-center mb-4">Paper Doll Alignment Test</h1>
                <p className="text-center text-gray-600 mb-8">Testing: Bell Vintage Design (Full Modular)</p>
                <MVP_ProductBuilder productSlug="gbbell10spryblksh" />
            </div>
        </div>
    );
};

export default PaperDollTest;

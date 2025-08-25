import React from 'react';

const TestDesign = () => {
    return (
        <div className="min-h-screen modern-hero">
            <div className="container mx-auto px-4 py-20">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-white mb-8 modern-gradient-text">
                        اختبار التصميم العصري
                    </h1>
                    
                    <div className="grid md:grid-cols-3 gap-8 mt-16">
                        <div className="modern-card p-8">
                            <h3 className="text-2xl font-bold mb-4 modern-gradient-text">بطاقة 1</h3>
                            <p className="text-gray-600">هذه بطاقة اختبار للتصميم العصري</p>
                        </div>
                        
                        <div className="modern-card p-8">
                            <h3 className="text-2xl font-bold mb-4 modern-gradient-text">بطاقة 2</h3>
                            <p className="text-gray-600">هذه بطاقة اختبار للتصميم العصري</p>
                        </div>
                        
                        <div className="modern-card p-8">
                            <h3 className="text-2xl font-bold mb-4 modern-gradient-text">بطاقة 3</h3>
                            <p className="text-gray-600">هذه بطاقة اختبار للتصميم العصري</p>
                        </div>
                    </div>
                    
                    <div className="mt-12">
                        <button className="modern-button">
                            زر عصري
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestDesign;

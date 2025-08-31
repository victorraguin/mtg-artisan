import React from 'react';

interface CheckoutSummaryProps {
  items: any[];
}

export function CheckoutSummary({ items }: CheckoutSummaryProps) {
  // Group items by shop
  const itemsByShop = items.reduce((acc, item) => {
    if (!acc[item.shop_id]) {
      acc[item.shop_id] = {
        shop_name: item.shop_name,
        items: []
      };
    }
    acc[item.shop_id].items.push(item);
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="bg-gray-800 rounded-lg md:rounded-xl border border-gray-700 p-4 md:p-6">
      <h3 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Order Summary</h3>
      
      <div className="space-y-4 md:space-y-6">
        {Object.entries(itemsByShop).map(([shopId, shop]: [string, any]) => (
          <div key={shopId} className="border-b border-gray-700 last:border-b-0 pb-4 md:pb-6 last:pb-0">
            <h4 className="text-base md:text-lg font-medium text-purple-400 mb-3">
              {shop.shop_name}
            </h4>
            
            <div className="space-y-3">
              {shop.items.map((item: any) => (
                <div key={item.id} className="flex items-center space-x-3 md:space-x-4">
                  <div className="w-12 md:w-16 h-12 md:h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs text-center">
                        No Image
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="text-white font-medium text-sm md:text-base truncate">{item.title}</h5>
                    <p className="text-gray-400 text-xs md:text-sm">Qty: {item.qty}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-semibold text-sm md:text-base">
                      ${(item.unit_price * item.qty).toFixed(2)}
                    </div>
                    <div className="text-gray-400 text-xs md:text-sm">
                      ${item.unit_price} each
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import React from 'react';
import { CreditCard } from 'lucide-react';

interface PayPalButtonsProps {
  amount: number;
  onSuccess: () => Promise<string>;
  disabled: boolean;
}

export function PayPalButtons({ amount, onSuccess, disabled }: PayPalButtonsProps) {
  const handlePayment = async () => {
    try {
      // In a real implementation, this would integrate with PayPal Smart Buttons
      // For now, we'll simulate the payment process
      const orderId = await onSuccess();
      console.log('Payment successful, order ID:', orderId);
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handlePayment}
        disabled={disabled}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
      >
        {disabled ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
        ) : (
          <CreditCard className="h-5 w-5 mr-2" />
        )}
        {disabled ? 'Processing...' : `Pay $${amount.toFixed(2)} with PayPal`}
      </button>
      
      <p className="text-xs text-gray-400 text-center">
        PayPal Smart Buttons integration - Demo mode
      </p>
    </div>
  );
}
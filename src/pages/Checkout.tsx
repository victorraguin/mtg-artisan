import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckoutSummary } from '../components/Checkout/CheckoutSummary';
import { PayPalButtons } from '../components/Checkout/PayPalButtons';
import { MapPin, User, Phone, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export function Checkout() {
  const { items, getTotal, clearCart } = useCart();
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: profile?.shipping_name || '',
    address: profile?.shipping_address || '',
    city: profile?.shipping_city || '',
    postal_code: profile?.shipping_postal_code || '',
    country: profile?.shipping_country || '',
    phone: profile?.phone || ''
  });

  const hasPhysicalItems = items.some(item => item.item_type === 'product');
  const isShippingComplete = hasPhysicalItems ? (
    shippingAddress.name && 
    shippingAddress.address && 
    shippingAddress.city && 
    shippingAddress.postal_code && 
    shippingAddress.country
  ) : true;

  const isAddressDifferentFromProfile = (
    shippingAddress.name !== (profile?.shipping_name || '') ||
    shippingAddress.address !== (profile?.shipping_address || '') ||
    shippingAddress.city !== (profile?.shipping_city || '') ||
    shippingAddress.postal_code !== (profile?.shipping_postal_code || '') ||
    shippingAddress.country !== (profile?.shipping_country || '') ||
    shippingAddress.phone !== (profile?.phone || '')
  );

  const saveAddressToProfile = async () => {
    setSavingAddress(true);
    try {
      const { error } = await updateProfile({
        shipping_name: shippingAddress.name,
        shipping_address: shippingAddress.address,
        shipping_city: shippingAddress.city,
        shipping_postal_code: shippingAddress.postal_code,
        shipping_country: shippingAddress.country,
        phone: shippingAddress.phone
      });

      if (error) throw error;
      toast.success('Address saved to profile!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };
  const createOrder = async () => {
    if (!isShippingComplete) {
      toast.error('Please complete your shipping address');
      return;
    }

    setProcessing(true);
    
    try {
      // Group items by shop for order breakdown
      const breakdown = items.reduce((acc, item) => {
        if (!acc[item.shop_id]) {
          acc[item.shop_id] = {
            shop_name: item.shop_name,
            items: [],
            subtotal: 0
          };
        }
        acc[item.shop_id].items.push({
          item_type: item.item_type,
          item_id: item.item_id,
          title: item.title,
          qty: item.qty,
          unit_price: item.unit_price,
          total: item.unit_price * item.qty
        });
        acc[item.shop_id].subtotal += item.unit_price * item.qty;
        return acc;
      }, {} as any);

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          total: getTotal() * 1.05, // Include platform fee
          currency: 'USD',
          status: 'payment_pending',
          breakdown_by_shop: breakdown,
          shipping_address: hasPhysicalItems ? shippingAddress : null
        })
        .select()
        .single();

      if (error) throw error;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        shop_id: item.shop_id,
        item_type: item.item_type,
        item_id: item.item_id,
        qty: item.qty,
        unit_price: item.unit_price,
        currency: item.currency,
        status: 'pending',
        delivery_due_at: item.item_type === 'service' ? 
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await clearCart();
      toast.success('Order created successfully!');
      navigate(`/dashboard/buyer?order=${order.id}`);
      
      return order.id;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">Checkout</h1>

      <div className="space-y-6 md:space-y-8">
        {/* Shipping Address (if physical items) */}
        {hasPhysicalItems && (
          <div className="bg-gray-800 rounded-lg md:rounded-xl border border-gray-700 p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-white flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Shipping Address
              </h3>
              {isShippingComplete && isAddressDifferentFromProfile && (
                <button
                  onClick={saveAddressToProfile}
                  disabled={savingAddress}
                  className="flex items-center text-purple-400 hover:text-purple-300 text-sm transition-colors disabled:opacity-50"
                >
                  {savingAddress ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400 mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {savingAddress ? 'Saving...' : 'Save to profile'}
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.name}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 md:py-3 text-white focus:border-purple-500 focus:outline-none text-sm md:text-base"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 md:py-3 text-white focus:border-purple-500 focus:outline-none text-sm md:text-base"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 md:py-3 text-white focus:border-purple-500 focus:outline-none text-sm md:text-base"
                  placeholder="123 Main Street, Apt 4B"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 md:py-3 text-white focus:border-purple-500 focus:outline-none text-sm md:text-base"
                  placeholder="New York"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Postal Code *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.postal_code}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 md:py-3 text-white focus:border-purple-500 focus:outline-none text-sm md:text-base"
                  placeholder="10001"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country *
                </label>
                <select
                  required
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 md:py-3 text-white focus:border-purple-500 focus:outline-none text-sm md:text-base"
                >
                  <option value="">Select Country</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Japan">Japan</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Order Summary */}
        <div>
          <CheckoutSummary items={items} />
        </div>

        {/* Payment */}
        <div className="bg-gray-800 rounded-lg md:rounded-xl border border-gray-700 p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Payment</h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-gray-300 text-sm md:text-base">
              <span>Subtotal</span>
              <span>${getTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-300 text-sm md:text-base">
              <span>Platform Fee (5%)</span>
              <span>${(getTotal() * 0.05).toFixed(2)}</span>
            </div>
            <hr className="border-gray-700" />
            <div className="flex justify-between text-lg md:text-xl font-bold text-white">
              <span>Total</span>
              <span>${(getTotal() * 1.05).toFixed(2)}</span>
            </div>
          </div>

          <PayPalButtons
            amount={getTotal() * 1.05}
            onSuccess={createOrder}
            disabled={processing || !isShippingComplete}
          />

          {!isShippingComplete && hasPhysicalItems && (
            <p className="text-yellow-400 text-sm mt-2">
              Please complete shipping address above
            </p>
          )}

          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            By completing your purchase, you agree to our terms of service and privacy policy.
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!stripe || !elements) {
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/download`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
      setLocation('/download');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          className="mt-2"
          required
        />
      </div>
      
      <div>
        <Label className="text-sm font-medium text-neutral-700">
          Payment Information
        </Label>
        <div className="mt-2 border border-neutral-300 rounded-lg p-3">
          <PaymentElement />
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || isLoading}
        className="w-full bg-primary hover:bg-secondary"
      >
        {isLoading ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Processing...
          </>
        ) : (
          <>
            <i className="fas fa-lock mr-2"></i>
            Pay $9.99
          </>
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    const optimizationData = sessionStorage.getItem('optimizationData');
    if (!optimizationData) {
      setLocation('/');
      return;
    }

    const data = JSON.parse(optimizationData);
    
    // Create PaymentIntent as soon as the page loads
    apiRequest("POST", "/api/create-payment-intent", { optimizationId: data.optimizationId })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error('Payment intent creation failed:', error);
        setLocation('/');
      });
  }, [setLocation]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-4">Complete Your Purchase</h1>
          <p className="text-lg text-neutral-600">Secure payment processing powered by Stripe</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Form */}
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-neutral-800 mb-6">Payment Details</h3>
              
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm />
              </Elements>
              
              <div className="mt-6 flex items-center justify-center space-x-4">
                <i className="fab fa-cc-visa text-2xl text-blue-600"></i>
                <i className="fab fa-cc-mastercard text-2xl text-red-600"></i>
                <i className="fab fa-cc-amex text-2xl text-blue-500"></i>
                <i className="fab fa-cc-discover text-2xl text-orange-600"></i>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-neutral-800 mb-6">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-700">Optimized Resume</span>
                  <span className="text-neutral-800">$4.99</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-700">Custom Cover Letter</span>
                  <span className="text-neutral-800">$4.99</span>
                </div>
                <div className="flex items-center justify-between text-sm text-neutral-600">
                  <span>Bundle Discount</span>
                  <span>-$0.00</span>
                </div>
                <hr className="border-neutral-200" />
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>$9.99</span>
                </div>
              </div>
              
              <div className="mt-6 bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <h4 className="font-medium text-neutral-800 mb-2">What's Included</h4>
                <ul className="text-sm text-neutral-600 space-y-1">
                  <li>• AI-optimized resume in PDF format</li>
                  <li>• Tailored cover letter in PDF format</li>
                  <li>• Editable Word document versions</li>
                  <li>• Instant download after payment</li>
                  <li>• Lifetime access to your documents</li>
                </ul>
              </div>
              
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center text-sm text-neutral-500">
                  <i className="fas fa-shield-alt mr-2"></i>
                  <span>Secure 256-bit SSL encryption</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WatermarkedPreview from "@/components/watermarked-preview";
import { useToast } from "@/hooks/use-toast";

export default function Preview() {
  const [, setLocation] = useLocation();
  const [optimizationData, setOptimizationData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedData = sessionStorage.getItem('optimizationData');
    if (storedData) {
      setOptimizationData(JSON.parse(storedData));
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  const handleProceedToPayment = () => {
    if (optimizationData) {
      setLocation('/checkout');
    }
  };

  if (!optimizationData) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-4">
            Preview Your Optimized Documents
          </h1>
          <p className="text-lg text-neutral-600">
            Review your enhanced resume and custom cover letter before downloading
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Optimized Resume Preview */}
          <WatermarkedPreview 
            title="Optimized Resume"
            content={optimizationData.optimizedResume}
            className="h-full"
          />

          {/* Cover Letter Preview */}
          <WatermarkedPreview 
            title="Custom Cover Letter"
            content={optimizationData.coverLetter}
            className="h-full"
          />
        </div>

        {/* Payment Section */}
        <Card className="mt-8 max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-neutral-800 mb-4">
                Download Your Optimized Documents
              </h3>
              <p className="text-lg text-neutral-600">
                Get your professionally optimized resume and cover letter
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-6 text-center mb-6">
              <div className="text-3xl font-bold text-neutral-800 mb-2">$9.99</div>
              <p className="text-sm text-neutral-600">One-time payment for both documents</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <i className="fas fa-check-circle text-accent mr-3"></i>
                <span className="text-sm text-neutral-700">Optimized Resume (PDF)</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check-circle text-accent mr-3"></i>
                <span className="text-sm text-neutral-700">Tailored Cover Letter (PDF)</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check-circle text-accent mr-3"></i>
                <span className="text-sm text-neutral-700">Editable Word Documents</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check-circle text-accent mr-3"></i>
                <span className="text-sm text-neutral-700">Lifetime Access</span>
              </div>
            </div>
            
            <Button 
              onClick={handleProceedToPayment}
              className="w-full bg-primary hover:bg-secondary"
            >
              <i className="fas fa-lock mr-2"></i>
              Secure Payment with Stripe
            </Button>
            
            <p className="text-xs text-neutral-500 text-center mt-4">
              <i className="fas fa-shield-alt mr-1"></i>
              Secured by Stripe. Your payment information is encrypted and safe.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

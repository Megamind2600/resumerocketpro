import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Download as DownloadIcon, FileText, RefreshCw } from "lucide-react";

export default function Download() {
  const [, setLocation] = useLocation();
  const [optimizationData, setOptimizationData] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'checking' | 'succeeded' | 'failed'>('checking');
  const { toast } = useToast();

  useEffect(() => {
    const storedData = sessionStorage.getItem('optimizationData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setOptimizationData(data);
      checkPaymentStatus(data.optimizationId);
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  const checkPaymentStatus = async (optimizationId: number) => {
    try {
      const response = await fetch(`/api/payment-status/${optimizationId}`);
      const data = await response.json();
      
      if (data.canDownload) {
        setPaymentStatus('succeeded');
      } else {
        setPaymentStatus('failed');
        toast({
          title: "Payment verification failed",
          description: "Please contact support if this is an error.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setPaymentStatus('failed');
      toast({
        title: "Error checking payment",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (type: 'resume' | 'cover-letter') => {
    if (!optimizationData) return;

    try {
      const response = await fetch(`/api/download/${optimizationData.optimizationId}/${type}`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'resume' ? 'optimized-resume.pdf' : 'cover-letter.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: `Your ${type === 'resume' ? 'resume' : 'cover letter'} is downloading.`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const startNewOptimization = () => {
    sessionStorage.clear();
    setLocation('/');
  };

  if (paymentStatus === 'checking') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-neutral-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">Payment Verification Failed</h2>
            <p className="text-neutral-600 mb-6">
              We couldn't verify your payment. Please contact support if you believe this is an error.
            </p>
            <Button onClick={startNewOptimization} className="w-full">
              Start Over
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-4">Payment Successful!</h1>
          <p className="text-lg text-neutral-600">Your optimized documents are ready for download</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-neutral-800 mb-6">Download Your Documents</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="text-red-500 text-xl mr-3" />
                    <div>
                      <h4 className="font-medium text-neutral-800">Optimized Resume</h4>
                      <p className="text-sm text-neutral-500">PDF Format • Ready to download</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleDownload('resume')}
                    className="bg-primary hover:bg-secondary"
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="text-red-500 text-xl mr-3" />
                    <div>
                      <h4 className="font-medium text-neutral-800">Custom Cover Letter</h4>
                      <p className="text-sm text-neutral-500">PDF Format • Ready to download</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleDownload('cover-letter')}
                    className="bg-primary hover:bg-secondary"
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">
                  <i className="fas fa-lightbulb mr-2"></i>
                  Pro Tips for Your Job Search
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Customize your resume for each job application</li>
                  <li>• Use the same keywords from job descriptions</li>
                  <li>• Keep your LinkedIn profile updated with the same information</li>
                  <li>• Follow up on applications after 1-2 weeks</li>
                </ul>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-neutral-500 mb-4">Need help with your job search?</p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" className="bg-accent text-white hover:bg-accent/90">
                    <i className="fas fa-envelope mr-2"></i>
                    Contact Support
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={startNewOptimization}
                    className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Optimize Another Resume
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

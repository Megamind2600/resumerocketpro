import { useState } from "react";
import { useLocation } from "wouter";
import FileUpload from "@/components/file-upload";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUploaded = (data: any) => {
    setIsLoading(false);
    // Store the data in sessionStorage for access across pages
    sessionStorage.setItem('resumeData', JSON.stringify(data));
    setLocation('/role-suggestions');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-800 mb-4">
            Transform Your Resume with AI
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Upload your resume and let our AI analyze it to suggest optimal job roles, 
            improve your content, and create tailored cover letters for your applications.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* File Upload Section */}
          <div className="flex justify-center">
            <FileUpload 
              onFileUploaded={handleFileUploaded}
              isLoading={isLoading}
            />
          </div>

          {/* How It Works */}
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-neutral-800 mb-6">How It Works</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium mr-4 mt-1">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-800 mb-1">Upload Resume</h4>
                    <p className="text-sm text-neutral-600">Upload your current resume in PDF or DOCX format</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium mr-4 mt-1">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-800 mb-1">Get Role Suggestions</h4>
                    <p className="text-sm text-neutral-600">AI analyzes your skills and suggests matching job roles</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium mr-4 mt-1">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-800 mb-1">Optimize Content</h4>
                    <p className="text-sm text-neutral-600">Compare against job descriptions and get improvement suggestions</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium mr-4 mt-1">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-800 mb-1">Download Results</h4>
                    <p className="text-sm text-neutral-600">Get your optimized resume and tailored cover letter</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

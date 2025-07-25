import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

export default function PromoPreview() {
  const [, setLocation] = useLocation();
  const [optimizationData, setOptimizationData] = useState<any>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('optimizationData');
    if (storedData) {
      setOptimizationData(JSON.parse(storedData));
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  if (!optimizationData) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // TXT export handler, preserves markdown markers in the txt file
  const handleDownloadTxt = () => {
    const resume = optimizationData.optimizedResume ?? "";
    const coverLetter = optimizationData.coverLetter ?? "";
    const text = [
      "--- Optimized Resume ---",
      "",
      resume,
      "",
      "--- Cover Letter ---",
      "",
      coverLetter
    ].join('\n');
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized-documents.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Print (to PDF) handler — triggers browser print dialog
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-4">
            🎉 Your Optimized Documents
          </h1>
          <p className="text-lg text-neutral-600">
            Enjoy your fully formatted, copy-friendly resume and cover letter.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-8 print:hidden">
          <Button onClick={handleDownloadTxt} className="bg-primary hover:bg-secondary">
            Download as TXT
          </Button>
          <Button onClick={handlePrint} className="bg-primary hover:bg-secondary">
            Print / Save as PDF
          </Button>
        </div>

        {/* Dual Document Preview */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Optimized Resume */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-primary">Optimized Resume</h2>
              <div className="prose max-w-none text-neutral-800 overflow-x-auto selectable-text">
                <ReactMarkdown>
                  {optimizationData.optimizedResume ?? "No resume data found."}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Cover Letter */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-primary">Custom Cover Letter</h2>
              <div className="prose max-w-none text-neutral-800 overflow-x-auto selectable-text">
                <ReactMarkdown>
                  {optimizationData.coverLetter ?? "No cover letter data found."}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 text-center text-neutral-500 print:hidden">
          <span className="text-md">
            <i className="fas fa-copy mr-2"></i>
            You can <b>copy, print, or download</b> your documents freely—no restrictions!
          </span>
        </div>

        {/* Optionally add @media print CSS to hide action bar etc. */}
        <style>
        {`
          @media print {
            .print\\:hidden { display: none !important; }
            body {
              background: white !important;
            }
            .bg-neutral-50 {
              background: white !important;
            }
            .prose {
              color: black !important;
            }
          }
          .selectable-text {
            user-select: text !important;
            -webkit-user-select: text !important;
          }
        `}
        </style>
      </div>
    </div>
  );
}

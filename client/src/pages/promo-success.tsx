import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

export default function PromoPreview() {
  const [, setLocation] = useLocation();
  const [optimizationData, setOptimizationData] = useState<any>(null);

  // State to control which section to print (none = full page)
  const [printSection, setPrintSection] = useState<"none" | "resume" | "coverLetter">("none");

  useEffect(() => {
    const storedData = sessionStorage.getItem('optimizationData');
    if (storedData) {
      setOptimizationData(JSON.parse(storedData));
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  // Clean up after printing to reset printSection
  useEffect(() => {
    function afterPrint() {
      setPrintSection("none");
    }
    window.addEventListener("afterprint", afterPrint);
    return () => {
      window.removeEventListener("afterprint", afterPrint);
    };
  }, []);

  // TXT export handler - unchanged, preserves markdown markers
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

  // Full page print - unchanged
  const handlePrintFullPage = () => {
    setPrintSection("none");
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Print resume only
  const handlePrintResume = () => {
    setPrintSection("resume");
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Print cover letter only
  const handlePrintCoverLetter = () => {
    setPrintSection("coverLetter");
    setTimeout(() => {
      window.print();
    }, 100);
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
            🎉 Your Optimized Documents
          </h1>
          <p className="text-lg text-neutral-600">
            Enjoy your fully formatted, copy-friendly resume and cover letter.
          </p>
        </div>

        {/* Action Bar with existing and new buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-8 print:hidden">
          <Button onClick={handleDownloadTxt} className="bg-primary hover:bg-secondary">
            Download as TXT
          </Button>
        </div>

        {/* Resume Section */}
        <div className={`print-section resume-section ${printSection === "resume" ? "print-visible" : (printSection === "none" ? "" : "print-hide")}`}>
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
        </div>

        {/* Cover Letter Section */}
        <div className={`print-section cover-letter-section mt-8 ${printSection === "coverLetter" ? "print-visible" : (printSection === "none" ? "" : "print-hide")}`}>
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

        <style>
          {`
            @media print {
              /* Hide all content by default */
              body * {
                visibility: hidden;
              }
              /* Show full page if printSection is none */
              .print-section, .print-section * {
                visibility: visible;
              }
              /* If we're printing only resume */
              body:not(.print-resume) .cover-letter-section,
              body:not(.print-resume) .print-section:not(.resume-section) {
                display: none !important;
              }
              /* If we're printing only cover letter */
              body:not(.print-coverLetter) .resume-section,
              body:not(.print-coverLetter) .print-section:not(.cover-letter-section) {
                display: none !important;
              }
              /* Position the visible section for print */
              .print-visible {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
              }
              /* Remove background color for print */
              body {
                background: white !important;
              }
              .bg-neutral-50 {
                background: white !important;
              }
              .prose {
                color: black !important;
              }
              /* Hide the action buttons on print */
              .print\\:hidden {
                display: none !important;
              }
            }

            /* Classes for handling hiding/showing sections */
            .print-hide {
              display: none !important;
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

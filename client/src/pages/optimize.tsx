import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface JobLink {
  platform: string;
  url: string;
}

export default function Optimize() {
  const [, setLocation] = useLocation();
  const [jobLinks, setJobLinks] = useState<JobLink[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Promo code state
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    const storedJobLinks = sessionStorage.getItem('jobLinks');
    if (storedJobLinks) {
      setJobLinks(JSON.parse(storedJobLinks));
    }
    
    const resumeData = sessionStorage.getItem('resumeData');
    if (!resumeData) {
      setLocation('/');
    }
  }, [setLocation]);

  const handleAnalyzeJobMatch = async () => {
    if (!companyName || !jobTitle || !jobDescription) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields before analyzing.",
        variant: "destructive",
      });
      return;
    }

    const resumeData = JSON.parse(sessionStorage.getItem('resumeData') || '{}');
    if (!resumeData.resumeId) {
      toast({
        title: "Resume not found",
        description: "Please start over and upload your resume.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/optimize-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: resumeData.resumeId,
          jobDescription,
          companyName,
          jobTitle,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to optimize resume');
      }

      const data = await response.json();
      setAnalysis(data);
      
      // Store optimization data for next page
      sessionStorage.setItem('optimizationData', JSON.stringify(data));
      
      toast({
        title: "Analysis complete",
        description: "Your resume has been optimized for this job.",
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToPreview = () => {
    if (analysis) {
      setLocation('/preview');
    }
  };

  // Promo code handler
  const handlePromoSubmit = () => {
    const validCode = "megamind2600"; // Your chosen code
    if (promoCode === validCode) {
      setLocation("/promo-success"); // Update if you want another route
    } else {
      toast({
        title: "Invalid Promo Code",
        description: "Please check the code and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-4">Optimize Your Resume</h1>
          <p className="text-lg text-neutral-600">
            Paste a job description below to get personalized resume optimization suggestions
          </p>
        </div>

        {/* Job Search Links */}
        {jobLinks.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-neutral-800 mb-4">Job Search Links</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {jobLinks.slice(0, 3).map((link, index) => (
                  <a 
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-4 border border-neutral-200 rounded-lg hover:border-primary transition-colors"
                  >
                    <i className={`${
                      link.platform === 'Google Jobs' ? 'fab fa-google text-blue-600' :
                      link.platform === 'LinkedIn' ? 'fab fa-linkedin text-blue-700' :
                      'fas fa-briefcase text-blue-800'
                    } text-2xl mr-3`}></i>
                    <span className="font-medium text-neutral-800">{link.platform}</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Job Description Input */}
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-neutral-800 mb-6">Job Description</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    placeholder="Enter company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    placeholder="Enter job title"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="jobDescription">Job Description</Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste the complete job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={12}
                    className="mt-2"
                  />
                </div>
                
                <div className="text-xs text-neutral-500 text-center mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <i className="fas fa-info-circle mr-1 text-blue-600"></i>
                  <span className="text-blue-700 font-medium">AI Processing:</span> This might take a few seconds for AI to work its magic.
                </div>

                <Button 
                  onClick={handleAnalyzeJobMatch}
                  disabled={!companyName || !jobTitle || !jobDescription || isLoading}
                  className="w-full bg-primary hover:bg-secondary"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Analyzing Match...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic mr-2"></i>
                      Analyze Match & Optimize
                    </>
                  )}
                </Button>

                {/* Promo Code Section (directly below main button) */}
                <div className="flex items-center space-x-3 mt-6">
                  <Input
                    id="promoCode"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handlePromoSubmit}
                    disabled={!promoCode || isLoading}
                    className="bg-primary hover:bg-secondary"
                  >
                    Apply Promo
                  </Button>
                </div>
                {/* End Promo Code Section */}

              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-neutral-800 mb-6">Analysis Results</h3>
              
              {!analysis ? (
                <div className="text-center py-12">
                  <i className="fas fa-chart-line text-4xl text-neutral-300 mb-4"></i>
                  <p className="text-neutral-500">Enter job details and click analyze to see results</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Match Score */}
                  <div className="bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-800">Overall Match Score</span>
                      <span className="text-2xl font-bold text-accent">{analysis.matchScore}%</span>
                    </div>
                    <Progress value={analysis.matchScore} className="h-2" />
                  </div>

                  {/* Skills Gap */}
                  <div>
                    <h4 className="font-medium text-neutral-800 mb-3">Skills Gap Analysis</h4>
                    <div className="space-y-2">
                      {analysis.missingSkills.map((skill: string, index: number) => (
                        <Badge key={index} variant="destructive" className="mr-2">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations Preview */}
                  <div>
                    <h4 className="font-medium text-neutral-800 mb-3">Optimization Preview</h4>
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                      {analysis.recommendations.map((rec: string, index: number) => (
                        <p key={index} className="text-sm text-neutral-600 mb-2">
                          • {rec}
                        </p>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={handleContinueToPreview}
                    className="w-full bg-primary hover:bg-secondary"
                  >
                    <i className="fas fa-eye mr-2"></i>
                    Preview Optimized Documents
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

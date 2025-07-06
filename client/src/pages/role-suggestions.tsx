import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Role {
  title: string;
  match: number;
  industry: string;
  salaryRange: string;
}

interface ResumeData {
  resumeId: number;
  analysis: {
    roles: Role[];
    skills: string[];
    experienceLevel: string;
    location: string;
    industries: string[];
  };
}

export default function RoleSuggestions() {
  const [, setLocation] = useLocation();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedData = sessionStorage.getItem('resumeData');
    if (storedData) {
      setResumeData(JSON.parse(storedData));
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  const handleRoleToggle = (roleTitle: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleTitle) 
        ? prev.filter(r => r !== roleTitle)
        : [...prev, roleTitle]
    );
  };

  const handleGenerateJobLinks = async () => {
    if (selectedRoles.length === 0) {
      toast({
        title: "No roles selected",
        description: "Please select at least one role to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-job-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: resumeData?.resumeId,
          selectedRoles,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate job links');
      }

      const data = await response.json();
      
      // Store selected roles and job links for next page
      sessionStorage.setItem('selectedRoles', JSON.stringify(selectedRoles));
      sessionStorage.setItem('jobLinks', JSON.stringify(data.jobLinks));
      
      setLocation('/optimize');
    } catch (error) {
      toast({
        title: "Error generating job links",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!resumeData) {
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
          <h1 className="text-3xl font-bold text-neutral-800 mb-4">AI-Suggested Job Roles</h1>
          <p className="text-lg text-neutral-600">
            Based on your resume analysis, here are the top job roles we recommend for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Role Suggestions */}
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-neutral-800 mb-6">Recommended Roles</h3>
              
              <div className="space-y-4">
                {resumeData.analysis.roles.map((role, index) => (
                  <div 
                    key={index}
                    className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                      selectedRoles.includes(role.title) 
                        ? 'border-primary bg-primary/5' 
                        : 'border-neutral-200 hover:border-primary'
                    }`}
                    onClick={() => handleRoleToggle(role.title)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedRoles.includes(role.title)}
                          onCheckedChange={() => handleRoleToggle(role.title)}
                        />
                        <div>
                          <h4 className="font-medium text-neutral-800">{role.title}</h4>
                          <p className="text-sm text-neutral-600">
                            {role.match}% match • {role.industry}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-accent">{role.salaryRange}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={handleGenerateJobLinks}
                disabled={selectedRoles.length === 0 || isLoading}
                className="w-full mt-6 bg-primary hover:bg-secondary"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Generating Job Links...
                  </>
                ) : (
                  <>
                    <i className="fas fa-search mr-2"></i>
                    Generate Job Search Links
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Profile Analysis */}
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-neutral-800 mb-6">Profile Analysis</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-neutral-800 mb-3">Key Skills Detected</h4>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.analysis.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-800 mb-3">Experience Level</h4>
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-600">Level</span>
                      <span className="text-sm font-medium text-neutral-800">
                        {resumeData.analysis.experienceLevel}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full" 
                        style={{
                          width: resumeData.analysis.experienceLevel === 'Senior' ? '85%' : 
                                resumeData.analysis.experienceLevel === 'Mid-level' ? '60%' : '35%'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-800 mb-3">Preferred Location</h4>
                  <div className="flex items-center">
                    <i className="fas fa-map-marker-alt text-neutral-400 mr-2"></i>
                    <span className="text-neutral-700">{resumeData.analysis.location}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-800 mb-3">Industry Focus</h4>
                  <div className="space-y-2">
                    {resumeData.analysis.industries.map((industry, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">{industry}</span>
                        <span className="text-sm font-medium text-neutral-800">
                          {90 - index * 15}%
                        </span>
                      </div>
                    ))}
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

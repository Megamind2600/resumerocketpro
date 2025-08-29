import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, File, Check, X } from "lucide-react";

interface FileUploadProps {
  onFileUploaded: (data: any) => void;
  isLoading: boolean;
}

export default function FileUpload({ onFileUploaded, isLoading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [localLoading, setLocalLoading] = useState(false); 


  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file.",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !email) {
      toast({
        title: "Missing information",
        description: "Please provide your email and select a file.",
        variant: "destructive",
      });
      return;
    }

    setLocalLoading(true);

    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('email', email);

    try {
      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onFileUploaded(data);
      
      toast({
        title: "Resume uploaded successfully",
        description: "Your resume has been analyzed by AI.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
    setLocalLoading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="p-8">
        <div className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-base font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2"
              required
            />
          </div>

          <div>
            <Label className="text-base font-medium mb-4 block">
              Upload Your Resume
            </Label>
            
            {!selectedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-neutral-300 hover:border-primary hover:bg-neutral-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                <p className="text-lg font-medium text-neutral-700 mb-2">
                  Drop your resume here or click to browse
                </p>
                <p className="text-sm text-neutral-500 mb-4">
                  Supports PDF and DOCX files up to 10MB
                </p>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary hover:bg-secondary"
                >
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <File className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium text-neutral-800">{selectedFile.name}</p>
                      <p className="text-sm text-neutral-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-neutral-500 text-center mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <i className="fas fa-info-circle mr-1 text-blue-600"></i>
            <span className="text-blue-700 font-medium">AI Processing:</span> This might take a few seconds for AI to work its magic.
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !email || isLoading}
            className="w-full bg-primary hover:bg-secondary"
          >
            {localLoading || isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Analyzing Resume with AI...
              </>
            ) : (
              <>
                <i className="fas fa-robot mr-2"></i>
                Analyze Resume with AI
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

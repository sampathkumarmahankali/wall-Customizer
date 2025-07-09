"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  Wand2, 
  ImageIcon,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface ToolsProps {
  selectedImage: any;
  onImageUpdate: (updatedImage: any) => void;
  images: any[];
}

export default function Tools({ 
  selectedImage, 
  onImageUpdate,
  images 
}: ToolsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingType, setProcessingType] = useState<string>("");
  const [aiStatus, setAiStatus] = useState<any>(null);

  React.useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/ai/status');
      const data = await response.json();
      setAiStatus(data.status);
    } catch (error) {
      // No debugging
    }
  };

  const handleBackgroundRemoval = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setIsProcessing(true);
    setProcessingType("background-removal");

    try {
      // Convert base64 to blob
      const response = await fetch(selectedImage.src);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');

      const aiResponse = await fetch('http://localhost:4000/api/ai/remove-background', {
        method: 'POST',
        body: formData
      });

      const result = await aiResponse.json();

      if (result.success) {
        const updatedImage = {
          ...selectedImage,
          src: result.image,
          originalSrc: result.image
        };
        onImageUpdate(updatedImage);
        toast.success("Background removed successfully!");
      } else {
        throw new Error(result.error || 'Failed to remove background');
      }
    } catch (error) {
      toast.error("Failed to remove background. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingType("");
    }
  };

  const isServiceAvailable = (service: string) => {
    return aiStatus && aiStatus[service];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Tools
        </CardTitle>
        <CardDescription>
          Enhance your images with smart features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="background" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="background" className="text-xs">
              <ImageIcon className="h-3 w-3 mr-1" />
              Background
            </TabsTrigger>
          </TabsList>

          <TabsContent value="background" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Background Removal</span>
                <Badge variant={isServiceAvailable('removeBg') ? "default" : "secondary"}>
                  {isServiceAvailable('removeBg') ? "Available" : "Unavailable"}
                </Badge>
              </div>
              
              <Button 
                onClick={handleBackgroundRemoval}
                disabled={!selectedImage || !isServiceAvailable('removeBg') || isProcessing}
                className="w-full"
              >
                {isProcessing && processingType === "background-removal" ? (
                  <>
                    <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                    Removing Background...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Remove Background
                  </>
                )}
              </Button>
              
              {!isServiceAvailable('removeBg') && (
                <p className="text-xs text-muted-foreground">
                  Remove.bg API key required for background removal
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {isProcessing && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Processing...
              </span>
            </div>
            <Progress value={33} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
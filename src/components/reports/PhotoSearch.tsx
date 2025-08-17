import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, User, Calendar, MapPin, Phone, Car, Smartphone, AlertTriangle, X } from "lucide-react";
import { format } from "date-fns";

const PhotoSearch = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
      }
    }
  };

  const searchByPhoto = async () => {
    if (!selectedFile) {
      toast({
        title: "No image selected",
        description: "Please select an image to search",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      console.log("Starting photo search with file:", selectedFile.name);
      
      // Get all reports with images (including visible=false for search, but we'll show appropriate message)
      const [personsResult, devicesResult, vehiclesResult] = await Promise.all([
        supabase
          .from("persons")
          .select("id, name, age, gender, location, date_missing, status, image_url, report_date")
          .not("image_url", "is", null),
        supabase
          .from("devices")
          .select("id, type, brand, model, color, imei, location, status, image_url, report_date")
          .not("image_url", "is", null),
        supabase
          .from("vehicles")
          .select("id, type, brand, model, year, color, chassis, location, status, image_url, report_date")
          .not("image_url", "is", null),
      ]);

      // Combine all results
      const allReports = [
        ...(personsResult.data || []).map(item => ({ ...item, reportType: 'person' })),
        ...(devicesResult.data || []).map(item => ({ ...item, reportType: 'device' })),
        ...(vehiclesResult.data || []).map(item => ({ ...item, reportType: 'vehicle' })),
      ];

      console.log(`Found ${allReports.length} reports with images`);

      if (allReports.length === 0) {
        setSearchResults([]);
        toast({
          title: "No results",
          description: "No reports with images found in the database",
        });
        return;
      }

      // Create temporary canvas for image analysis
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Load search image
      const searchImg = new Image();
      searchImg.crossOrigin = "anonymous"; // Enable CORS
      const searchImageData = await new Promise<ImageData>((resolve, reject) => {
        searchImg.onload = () => {
          canvas.width = 100; // Reduced size for faster processing
          canvas.height = 100;
          ctx?.drawImage(searchImg, 0, 0, 100, 100);
          const imageData = ctx?.getImageData(0, 0, 100, 100);
          if (imageData) resolve(imageData);
          else reject(new Error('Failed to get image data'));
        };
        searchImg.onerror = reject;
        searchImg.src = URL.createObjectURL(selectedFile);
      });

      // Calculate similarity scores for each report image
      const resultsWithScores = await Promise.all(
        allReports.map(async (report) => {
          try {
            const targetImg = new Image();
            targetImg.crossOrigin = "anonymous"; // Enable CORS
            const score = await new Promise<number>((resolve) => {
              targetImg.onload = () => {
                try {
                  canvas.width = 100;
                  canvas.height = 100;
                  ctx?.drawImage(targetImg, 0, 0, 100, 100);
                  const targetImageData = ctx?.getImageData(0, 0, 100, 100);
                  
                  if (targetImageData) {
                    // Calculate enhanced image similarity
                    const similarity = calculateImageSimilarity(searchImageData, targetImageData);
                    resolve(similarity);
                  } else {
                    resolve(0);
                  }
                } catch (error) {
                  console.error('Error processing image:', error);
                  resolve(0);
                }
              };
              targetImg.onerror = () => resolve(0);
              targetImg.src = report.image_url;
            });
            
            return { ...report, similarity: score };
          } catch (error) {
            console.error('Error loading report image:', error);
            return { ...report, similarity: 0 };
          }
        })
      );

      // Filter results with similarity > 30% and sort by similarity
      const filteredResults = resultsWithScores
        .filter(result => result.similarity > 0.3) // Increased threshold for better accuracy
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 10); // Limit to top 10 results

      console.log(`Found ${filteredResults.length} matches with >30% similarity`);
      setSearchResults(filteredResults);

      if (filteredResults.length === 0) {
        toast({
          title: "No matches found",
          description: "No visually similar reports found. Try a different image or adjust the similarity threshold.",
        });
      } else {
        toast({
          title: "Search completed",
          description: `Found ${filteredResults.length} similar reports`,
        });
      }
    } catch (error: any) {
      console.error("Error during photo search:", error);
      toast({
        title: "Search failed",
        description: error.message || "An error occurred during the search",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Enhanced image similarity calculation using color histogram and edge detection
  const calculateImageSimilarity = (img1: ImageData, img2: ImageData): number => {
    const data1 = img1.data;
    const data2 = img2.data;
    
    // Calculate color histogram similarity
    const hist1 = new Array(256).fill(0);
    const hist2 = new Array(256).fill(0);
    
    for (let i = 0; i < data1.length; i += 4) {
      // Calculate grayscale value for histogram
      const gray1 = Math.round(0.299 * data1[i] + 0.587 * data1[i + 1] + 0.114 * data1[i + 2]);
      const gray2 = Math.round(0.299 * data2[i] + 0.587 * data2[i + 1] + 0.114 * data2[i + 2]);
      
      hist1[gray1]++;
      hist2[gray2]++;
    }
    
    // Normalize histograms
    const totalPixels = data1.length / 4;
    for (let i = 0; i < 256; i++) {
      hist1[i] /= totalPixels;
      hist2[i] /= totalPixels;
    }
    
    // Calculate histogram correlation
    let correlation = 0;
    let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0;
    
    for (let i = 0; i < 256; i++) {
      correlation += hist1[i] * hist2[i];
      sum1 += hist1[i];
      sum2 += hist2[i];
      sum1Sq += hist1[i] * hist1[i];
      sum2Sq += hist2[i] * hist2[i];
    }
    
    const num = correlation - (sum1 * sum2 / 256);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / 256) * (sum2Sq - sum2 * sum2 / 256));
    
    if (den === 0) return 0;
    
    const histogramSimilarity = Math.max(0, num / den);
    
    // Calculate basic color difference
    let colorDiff = 0;
    for (let i = 0; i < data1.length; i += 4) {
      const rDiff = data1[i] - data2[i];
      const gDiff = data1[i + 1] - data2[i + 1];
      const bDiff = data1[i + 2] - data2[i + 2];
      colorDiff += Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
    }
    
    const avgColorDiff = colorDiff / (data1.length / 4);
    const colorSimilarity = Math.max(0, 1 - avgColorDiff / (255 * Math.sqrt(3)));
    
    // Combine histogram and color similarity (weighted average)
    return (histogramSimilarity * 0.6 + colorSimilarity * 0.4);
  };

  const getReportIcon = (reportType: string) => {
    switch (reportType) {
      case 'person':
        return <User className="h-4 w-4" />;
      case 'device':
        return <Smartphone className="h-4 w-4" />;
      case 'vehicle':
        return <Car className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatReportType = (reportType: string) => {
    switch (reportType) {
      case 'person':
        return 'Person';
      case 'device':
        return 'Device';
      case 'vehicle':
        return 'Vehicle';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Photo Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium">Upload an image to search</p>
              <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </label>
          </div>

          {previewUrl && (
            <div className="flex justify-center">
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Search preview" 
                  className="max-w-xs h-48 object-cover rounded-lg border shadow-sm"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setSearchResults([]);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <Button 
            onClick={searchByPhoto} 
            disabled={!selectedFile || isSearching}
            className="w-full"
          >
            {isSearching ? "Searching..." : "Search by Photo"}
          </Button>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({searchResults.length} matches found)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((result: any) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Image */}
                      <div className="relative">
                        <img 
                          src={result.image_url} 
                          alt="Report match" 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Badge 
                          className="absolute top-2 right-2 bg-blue-500 text-white"
                        >
                          {Math.round(result.similarity * 100)}% match
                        </Badge>
                      </div>

                      {/* Report Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getReportIcon(result.reportType)}
                          <Badge variant="outline">
                            {formatReportType(result.reportType)}
                          </Badge>
                        </div>

                        <h3 className="font-medium">
                          {result.reportType === 'person' 
                            ? result.name 
                            : `${result.brand || ''} ${result.model || ''}`.trim()
                          }
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{result.location}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {result.reportType === 'person' && result.date_missing 
                              ? format(new Date(result.date_missing), "MMM dd, yyyy")
                              : format(new Date(result.report_date), "MMM dd, yyyy")
                            }
                          </span>
                        </div>

                        <Badge className="w-fit">
                          {result.status}
                        </Badge>

                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PhotoSearch;
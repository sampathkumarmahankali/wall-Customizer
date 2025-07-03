"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Settings, Plus, ImageIcon, Trash2, Download, Edit, Palette } from "lucide-react";
import Wall from "@/components/wall";
import ImageBlock from "@/components/image-block";
import WallSettings from "@/components/wall-settings";
import ExportDialog from "@/components/export-dialog";
import ImageEditor from "@/components/image-editor";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

// Sample images filenames (from public/samples)
const sampleImages = [
  "/samples/diya.png",
  "/samples/garland-removebg-preview.png",
  "/samples/garland2-removebg-preview.png",
  "/samples/garland3-removebg-preview.png",
  "/samples/table7-removebg-preview.png",
  "/samples/fruits_basket-removebg-preview.png",
  "/samples/candle-6262984_1280-removebg-preview.png",
];

interface WallEditorProps {
  initialSettings?: any;
}

export default function WallEditor({ initialSettings }: WallEditorProps) {
  // --- State Variables ---
  const [images, setImages] = useState([]);
  const [wallSize, setWallSize] = useState({ width: 600, height: 400 });
  const [wallBackground, setWallBackground] = useState({ name: "Blank White Wall", value: "#ffffff", backgroundSize: "auto" });
  const [wallColor, setWallColor] = useState("#ffffff");
  const [customBackgrounds, setCustomBackgrounds] = useState([]);
  const [wallBorder, setWallBorder] = useState({ width: 0, color: "#000000", style: "solid", radius: 0 });
  const fileInputRef = useRef(null);
  const backgroundInputRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImageId, setEditingImageId] = useState(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const wallRef = useRef(null);
  const [showSampleDialog, setShowSampleDialog] = useState(false);

  // Load wall settings from localStorage or props on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const settings = localStorage.getItem("wallSettings");
      if (settings) {
        const { wallSize, wallColor, wallBackground, customBackgrounds } = JSON.parse(settings);
        setWallSize(wallSize);
        setWallColor(wallColor);
        setWallBackground(wallBackground);
        setCustomBackgrounds(customBackgrounds || []);
      }
    }
    if (initialSettings) {
      setWallSize(initialSettings.wallSize);
      setWallColor(initialSettings.wallColor);
      setWallBackground(initialSettings.wallBackground);
      setCustomBackgrounds(initialSettings.customBackgrounds || []);
    }
  }, [initialSettings]);

  // --- Handlers and Utility Functions ---

  // Handle image upload (add images to wall)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const imageObjs = files.map((file) => ({
      id: Date.now() + Math.random(),
      src: URL.createObjectURL(file),
      originalSrc: URL.createObjectURL(file),
      style: {
        width: 200,
        height: 200,
      },
      position: { x: 50, y: 50 },
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hue: 0,
        blur: 0,
      },
      shape: "rectangle",
      frame: {
        type: "none",
        width: 0,
        color: "#8B4513",
      },
      borderStyle: {
        width: 0,
        color: "#000000",
        style: "solid",
      },
    }));
    setImages((prev) => [...prev, ...imageObjs]);
  };

  // Update an image's properties by id
  const updateImage = (id, updates) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...updates, style: { ...img.style, ...updates.style } } : img))
    );
  };

  // Start editing an image
  const handleEditImage = (imageId) => {
    setEditingImageId(imageId);
  };

  // Complete image editing and update image
  const handleImageEditComplete = (editedImage) => {
    updateImage(editedImage.id, editedImage);
    setEditingImageId(null);
  };

  // Delete an image from the wall
  const deleteImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Create a collage from selected images
  const createCollage = (selectedImages) => {
    if (selectedImages.length < 2) return;

    const collageImage = {
      id: Date.now() + Math.random(),
      src: selectedImages[0], // Use first image as preview
      originalSrc: selectedImages[0],
      style: {
        width: 300,
        height: 300,
      },
      position: { x: 100, y: 100 },
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hue: 0,
        blur: 0,
      },
      shape: "rectangle",
      frame: {
        type: "classic",
        width: 8,
        color: "#8B4513",
      },
      borderStyle: {
        width: 0,
        color: "#000000",
        style: "solid",
      },
      isCollage: true,
      collageImages: selectedImages,
    };

    setImages((prev) => [...prev, collageImage]);
  };

  // Get the image currently being edited
  const editingImage = editingImageId ? images.find((img) => img.id === editingImageId) : null;

  // Get current wall background value (use wall color if blank white wall is selected)
  const currentWallBackground = wallBackground.name === "Blank White Wall" ? wallColor : wallBackground.value;

  // Handler to add a sample image to the wall
  const handleAddSampleImage = (src) => {
    const newImg = {
      id: Date.now() + Math.random(),
      src,
      originalSrc: src,
      style: { width: 200, height: 200 },
      position: { x: 50, y: 50 },
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hue: 0,
        blur: 0,
      },
      shape: "rectangle",
      frame: {
        type: "none",
        width: 0,
        color: "#8B4513",
      },
      borderStyle: {
        width: 0,
        color: "#000000",
        style: "solid",
      },
    };
    setImages((prev) => [...prev, newImg]);
    setShowSampleDialog(false);
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Wallora
                </h2>
                <p className="text-sm text-gray-600">Wall Aura Editor</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Add Images
                </Button>
                <Button
                  onClick={() => setShowSampleDialog(true)}
                  variant="default"
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Decors
                </Button>
                <Button
                  onClick={() => setShowImageEditor(!showImageEditor)}
                  variant="default"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {showImageEditor ? "Hide" : "Edit"} Images
                </Button>
                <Button
                  onClick={() => setShowExportDialog(true)}
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Wall Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hidden file input for image uploads */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Wall Area */}
          <div className={`${showImageEditor ? "lg:col-span-3" : "lg:col-span-4"}`}>
            <Card>
              <CardContent className="p-0">
                <div
                  ref={wallRef}
                  style={{
                    width: wallSize.width,
                    height: wallSize.height,
                    margin: "0 auto",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <Wall
                    width={wallSize.width}
                    height={wallSize.height}
                    background={currentWallBackground}
                    backgroundSize={wallBackground.backgroundSize}
                    border={wallBorder}
                  >
                    {images.map((img) => (
                      <ImageBlock
                        key={img.id}
                        image={img}
                        onUpdate={updateImage}
                        onEdit={() => handleEditImage(img.id)}
                        onDelete={() => deleteImage(img.id)}
                      />
                    ))}
                  </Wall>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Image Editor Sidebar */}
          {showImageEditor && (
            <div className="lg:col-span-1">
              <ImageEditor
                images={images}
                editingImageId={editingImageId}
                onSelectImage={setEditingImageId}
                onUpdateImage={updateImage}
                onCreateCollage={createCollage}
                onDeleteImage={deleteImage}
              />
            </div>
          )}
        </div>

        {/* Wall settings dialog */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <WallSettings
              wallSize={wallSize}
              onWallSizeChange={setWallSize}
              wallBackground={wallBackground}
              wallColor={wallColor}
              onWallColorChange={setWallColor}
              onBackgroundChange={setWallBackground}
              customBackgrounds={customBackgrounds}
              onCustomBackgroundUpload={() => {}}
              onRemoveCustomBackground={() => {}}
              allBackgrounds={[wallBackground, ...customBackgrounds]}
              wallBorder={wallBorder}
              onWallBorderChange={setWallBorder}
              onClose={() => setShowSettings(false)}
            />
          </div>
        )}

        {/* Export dialog */}
        {showExportDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <ExportDialog
              wallRef={wallRef}
              wallSize={wallSize}
              wallBackground={{ ...wallBackground, value: currentWallBackground }}
              wallBorder={wallBorder}
              images={images}
              onClose={() => setShowExportDialog(false)}
            />
          </div>
        )}

        {/* Decors Dialog */}
        {showSampleDialog && (
          <Dialog open={showSampleDialog} onOpenChange={setShowSampleDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select a Decor</DialogTitle>
              </DialogHeader>
              <div className="max-h-80 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-2">
                  {sampleImages.map((src, idx) => (
                    <div
                      key={src}
                      className="cursor-pointer border-2 rounded-lg overflow-hidden hover:border-primary transition-all"
                      onClick={() => handleAddSampleImage(src)}
                      title="Add to wall"
                    >
                      <img src={src} alt={`Decor ${idx + 1}`} className="w-full h-32 object-contain bg-white" />
                    </div>
                  ))}
                </div>
              </div>
              <DialogClose asChild>
                <Button variant="outline" className="w-full mt-4">Close</Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
} 
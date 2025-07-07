"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Settings, Plus, ImageIcon, Trash2, Download, Edit, Palette, Save, Home, User } from "lucide-react";
import Wall from "@/components/wall";
import ImageBlock from "@/components/image-block";
import WallSettings from "@/components/wall-settings";
import ExportDialog from "@/components/export-dialog";
import ImageEditor from "@/components/image-editor";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useSearchParams, useRouter } from "next/navigation";

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

// Utility to convert File to base64 string
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function WallEditor({ initialSettings }: WallEditorProps) {
  // --- State Variables ---
  const [images, setImages] = useState<any[]>([]);
  const [wallSize, setWallSize] = useState({ width: 600, height: 400 });
  const [wallBackground, setWallBackground] = useState({ name: "Blank White Wall", value: "#ffffff", backgroundSize: "auto" });
  const [wallColor, setWallColor] = useState("#ffffff");
  const [customBackgrounds, setCustomBackgrounds] = useState([]);
  const [wallBorder, setWallBorder] = useState<{ width: number; color: string; style: 'solid' | 'dashed' | 'dotted' | 'double'; radius: number }>({ width: 0, color: "#000000", style: "solid", radius: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImageId, setEditingImageId] = useState<number | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const wallRef = useRef(null);
  const [showSampleDialog, setShowSampleDialog] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const userId = localStorage.getItem("userId");
  const router = useRouter();

  // Helper to get current timestamp
  const getTimestamp = () => new Date().toISOString();

  useEffect(() => {
    if (sessionId) {
      fetch(`http://localhost:4000/api/session/${sessionId}`)
        .then(res => res.json())
        .then(session => {
          if (session.data) {
            console.log("DEBUG: Restoring session data:", session.data);
            setWallSize(session.data.wallSize);
            setWallColor(session.data.wallColor);
            setWallBackground(session.data.background);
            setCustomBackgrounds(session.data.customBackgrounds || []);
            setWallBorder(session.data.wallBorder);
            // Restore session name
            if (session.name) {
              setSessionName(session.name);
            }
            // Restore images from blocks
            setImages(
              (session.data.blocks || []).map((block: any) => ({
                id: block.id,
                src: block.src,
                position: block.position,
                style: block.size ? { width: block.size.width, height: block.size.height } : undefined,
                borderStyle: block.border,
                background: block.background,
                zIndex: block.zIndex,
                shape: block.shape,
                frame: block.frame,
                filters: block.filters,
                transform: block.transform,
                // ...other properties as needed
              }))
            );
          }
        });
    } else {
      // Restore from localStorage or use defaults
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
    }
  }, [sessionId, initialSettings]);

  // --- Handlers and Utility Functions ---

  // Handle image upload (add images to wall)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Convert all files to base64
    const imageObjs = await Promise.all(
      files.map(async (file) => {
        const base64 = await fileToBase64(file);
        return {
          id: Date.now() + Math.random(),
          src: base64, // base64 string
          originalSrc: base64,
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
        };
      })
    );
    setImages((prev: any[]) => [...prev, ...imageObjs]);
  };

  // Update an image's properties by id
  const updateImage = (id: number, updates: any) => {
    setImages((prev: any[]) =>
      prev.map((img: any) => (img.id === id ? { ...img, ...updates, style: { ...img.style, ...updates.style } } : img))
    );
  };

  // Start editing an image
  const handleEditImage = (imageId: number) => {
    setEditingImageId(imageId);
  };

  // Complete image editing and update image
  const handleImageEditComplete = (editedImage: any) => {
    updateImage(editedImage.id, editedImage);
    setEditingImageId(null);
  };

  // Delete an image from the wall
  const deleteImage = (id: number) => {
    setImages((prev: any[]) => prev.filter((img: any) => img.id !== id));
  };

  // Create a collage from selected images
  const createCollage = (selectedImages: any[]) => {
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
    setImages((prev: any[]) => [...prev, collageImage]);
  };

  // Get the image currently being edited
  const editingImage = editingImageId ? images.find((img) => img.id === editingImageId) : null;

  // Get current wall background value (use wall color if blank white wall is selected)
  const currentWallBackground = wallBackground.name === "Blank White Wall" ? wallColor : wallBackground.value;

  // Handler to add a sample image to the wall
  const handleAddSampleImage = (src: string) => {
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
    setImages((prev: any[]) => [...prev, newImg]);
    setShowSampleDialog(false);
  };

  // Save session with robust wall layout structure
  const handleSaveSession = async () => {
    setSaveStatus("Saving...");
    const email = localStorage.getItem("userEmail");
    let name = sessionName.trim();
    
    // Compose blocks array from images
    const blocks = images.map(img => ({
      id: img.id,
      src: img.src, // should be a persistent URL or base64
      position: img.position,
      size: img.style ? { width: img.style.width, height: img.style.height } : undefined,
      border: img.borderStyle,
      background: img.background,
      zIndex: img.zIndex,
      shape: img.shape,
      frame: img.frame,
      filters: img.filters,
      transform: img.transform,
      timestamp: getTimestamp(),
      userId: userId ? parseInt(userId) : undefined,
    }));
    
    const payload = {
      email,
      name,
      sessionId: sessionId || undefined, // Include sessionId if editing existing session
      data: {
        wallSize,
        orientation: wallSize.width > wallSize.height ? "landscape" : "portrait",
        background: wallBackground,
        blocks,
        customBackgrounds,
        wallBorder,
        wallColor,
      },
    };
    
    try {
      const res = await fetch("http://localhost:4000/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        setSaveStatus(sessionId ? "Session updated!" : "Session saved!");
        // If this was a new session, update the URL with the new sessionId
        if (!sessionId && result.sessionId) {
          const newUrl = `${window.location.pathname}?sessionId=${result.sessionId}`;
          window.history.replaceState({}, '', newUrl);
        }
      } else {
        setSaveStatus(result.error || "Failed to save session.");
      }
    } catch (err) {
      setSaveStatus("Network error.");
    }
    setTimeout(() => setSaveStatus(""), 1500);
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/create')}>
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg group-hover:from-indigo-600 group-hover:to-purple-700 transition-all duration-200 shadow-lg group-hover:shadow-xl">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:to-purple-700 transition-all duration-200">
              Wallora
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
              onClick={() => router.push('/profile')}
            >
              <User className="h-5 w-5 text-indigo-600" />
              <span className="hidden sm:inline">Profile</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Card className="mb-6 shadow-xl bg-white/90 backdrop-blur rounded-2xl">
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
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-full shadow-md px-5"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Add Images
                </Button>
                <Button
                  onClick={() => setShowSampleDialog(true)}
                  variant="default"
                  className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 rounded-full shadow-md px-5"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Decors
                </Button>
                <Button
                  onClick={() => setShowImageEditor(!showImageEditor)}
                  variant="default"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-full shadow-md px-5"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {showImageEditor ? "Hide" : "Edit"} Images
                </Button>
                <Button
                  onClick={() => setShowExportDialog(true)}
                  variant="default"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-full shadow-md px-5"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full shadow px-5"
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
            <Card className="shadow-lg rounded-2xl bg-white/95">
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
                  className="rounded-xl border border-gray-200 bg-gray-50 shadow-inner"
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
              wallBackground={wallBackground}
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

        <div className="flex flex-col items-center mt-8">
          <Card className="w-full max-w-lg p-6 flex flex-col items-center shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="w-full mb-4 flex flex-col sm:flex-row items-center sm:items-end gap-4">
              <div className="flex-1 w-full">
                <label htmlFor="sessionName" className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <Save className="h-4 w-4 text-blue-500" />
                  Session Name
                </label>
                <input
                  id="sessionName"
                  type="text"
                  value={sessionName}
                  onChange={e => setSessionName(e.target.value)}
                  placeholder="Enter session name"
                  className="w-full px-4 py-2 border border-blue-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm h-12"
                />
              </div>
              <div className="hidden sm:block h-10 w-px bg-gray-200 mx-2" />
              <Button
                onClick={handleSaveSession}
                className="w-full sm:w-auto rounded-full px-6 h-12 font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md transition flex items-center justify-center"
                variant="default"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Session
              </Button>
            </div>
            {saveStatus && <div className="mt-2 text-green-600 text-sm font-medium">{saveStatus}</div>}
          </Card>
        </div>
      </div>
    </div>
  );
} 
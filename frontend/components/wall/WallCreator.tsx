"use client";
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, Palette, Plus, Trash2 } from "lucide-react";

// Preset wall backgrounds
const backgroundOptions = [
  { name: "Blank White Wall", value: "#ffffff", backgroundSize: "auto" },
  { name: "Modern Living Room", value: "/walls/modern-living-room.jpg", backgroundSize: "cover" },
  { name: "Scandinavian Interior", value: "/walls/scandinavian-interior.jpg", backgroundSize: "cover" },
  { name: "White Brick Wall", value: "/walls/white-brick-wall.jpg", backgroundSize: "cover" },
  { name: "Rustic Wood Planks", value: "/walls/rustic-wood-planks.jpg", backgroundSize: "cover" },
  { name: "Vintage Brick Wall", value: "/walls/vintage-brick-wall.jpg", backgroundSize: "cover" },
];

interface WallCreatorProps {
  onSubmit: (settings: any) => void;
}

export default function WallCreator({ onSubmit }: WallCreatorProps) {
  const [wallSize, setWallSize] = useState({ width: 600, height: 400 });
  const [wallColor, setWallColor] = useState("#ffffff");
  const [wallBackground, setWallBackground] = useState(backgroundOptions[0]);
  const [customBackgrounds, setCustomBackgrounds] = useState([]);
  const backgroundInputRef = useRef(null);

  const handleBackgroundUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const customBgs = files.map((file) => ({
      name: file.name.split(".")[0],
      value: URL.createObjectURL(file),
      isCustom: true,
      file: file,
      backgroundSize: "cover",
    }));
    setCustomBackgrounds((prev) => [...prev, ...customBgs]);
  };

  const removeCustomBackground = (bgToRemove) => {
    setCustomBackgrounds((prev) => prev.filter((bg) => bg.value !== bgToRemove.value));
    if (wallBackground.value === bgToRemove.value) {
      setWallBackground(backgroundOptions[0]);
    }
    URL.revokeObjectURL(bgToRemove.value);
  };

  const allBackgrounds = [...backgroundOptions, ...customBackgrounds];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      wallSize,
      wallColor,
      wallBackground,
      customBackgrounds,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="max-w-4xl mx-auto w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Wallora
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 font-medium">
              Wall Aura - Create your perfect image wall
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="width">Wall Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={wallSize.width}
                    onChange={(e) => setWallSize({ ...wallSize, width: Number.parseInt(e.target.value) })}
                    min="300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Wall Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={wallSize.height}
                    onChange={(e) => setWallSize({ ...wallSize, height: Number.parseInt(e.target.value) })}
                    min="300"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-medium">Wall Background</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => backgroundInputRef.current?.click()}
                    className="text-xs"
                  >
                    <ImageIcon className="mr-1 h-3 w-3" />
                    Upload Custom
                  </Button>
                </div>
                <input
                  type="file"
                  ref={backgroundInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleBackgroundUpload}
                  className="hidden"
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allBackgrounds.map((bg, index) => (
                    <div
                      key={`${bg.name}-${index}`}
                      className={`h-24 rounded-lg border-2 cursor-pointer transition-all relative overflow-hidden group ${
                        wallBackground.value === bg.value
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={{
                        background: bg.name === "Blank White Wall" ? wallColor : `url(${bg.value})`,
                        backgroundSize: bg.backgroundSize || "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                      title={bg.name}
                    >
                      <div className="absolute inset-0" onClick={() => setWallBackground(bg)} />
                      {bg.isCustom && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCustomBackground(bg);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 opacity-0 hover:opacity-100 transition-opacity">
                        {bg.name}
                        {bg.isCustom && " (Custom)"}
                      </div>
                    </div>
                  ))}
                </div>
                {wallBackground.name === "Blank White Wall" && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Wall Color
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="color"
                        value={wallColor}
                        onChange={(e) => setWallColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <span className="text-sm text-gray-600">Choose your wall color</span>
                    </div>
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Your Wall
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
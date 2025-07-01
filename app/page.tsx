"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Settings, Plus, ImageIcon, Trash2, Download, Edit, Palette } from "lucide-react"
import Wall from "@/components/wall"
import ImageBlock from "@/components/image-block"
import WallSettings from "@/components/wall-settings"
import ExportDialog from "@/components/export-dialog"
import ImageEditor from "@/components/image-editor"

interface BackgroundOption {
  name: string
  value: string
  backgroundSize?: string
  isCustom?: boolean
}

interface ImageFilters {
  brightness: number
  contrast: number
  saturation: number
  hue: number
  blur: number
}

interface ImageFrame {
  type: "none" | "classic" | "modern" | "vintage" | "ornate" | "rustic"
  width: number
  color: string
}

interface ImageData {
  id: number
  src: string
  originalSrc: string
  style: {
    width: number
    height: number
  }
  position: {
    x: number
    y: number
  }
  filters: ImageFilters
  shape: "rectangle" | "circle" | "oval" | "star" | "heart"
  frame: ImageFrame
  borderStyle: {
    width: number
    color: string
    style: "solid" | "dashed" | "dotted"
  }
  isCollage?: boolean
  collageImages?: string[]
}

interface CustomBackground extends BackgroundOption {
  isCustom: true
  file?: File
}

interface WallBorder {
  width: number
  color: string
  style: "solid" | "dashed" | "dotted" | "double"
  radius: number
}

const backgroundOptions: BackgroundOption[] = [
  {
    name: "Blank White Wall",
    value: "#ffffff",
    backgroundSize: "auto",
  },
  {
    name: "Modern Living Room",
    value: "/walls/modern-living-room.jpg",
    backgroundSize: "cover",
  },
  {
    name: "Scandinavian Interior",
    value: "/walls/scandinavian-interior.jpg",
    backgroundSize: "cover",
  },
  {
    name: "White Brick Wall",
    value: "/walls/white-brick-wall.jpg",
    backgroundSize: "cover",
  },
  {
    name: "Rustic Wood Planks",
    value: "/walls/rustic-wood-planks.jpg",
    backgroundSize: "cover",
  },
  {
    name: "Vintage Brick Wall",
    value: "/walls/vintage-brick-wall.jpg",
    backgroundSize: "cover",
  },
]

export default function WallEditor() {
  const [images, setImages] = useState<ImageData[]>([])
  const [wallSize, setWallSize] = useState({ width: 600, height: 400 }) // Changed default size
  const [showWall, setShowWall] = useState(false)
  const [wallBackground, setWallBackground] = useState<BackgroundOption>(backgroundOptions[0])
  const [wallColor, setWallColor] = useState("#ffffff")
  const [customBackgrounds, setCustomBackgrounds] = useState<CustomBackground[]>([])
  const [wallBorder, setWallBorder] = useState<WallBorder>({
    width: 0,
    color: "#000000",
    style: "solid",
    radius: 0,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showImageEditor, setShowImageEditor] = useState(false)
  const [editingImageId, setEditingImageId] = useState<number | null>(null)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const wallRef = useRef<HTMLDivElement>(null)

  const handleWallSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowWall(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageObjs: ImageData[] = files.map((file) => ({
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
    }))
    setImages((prev) => [...prev, ...imageObjs])
  }

  const updateImage = (id: number, updates: Partial<ImageData>) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...updates, style: { ...img.style, ...updates.style } } : img)),
    )
  }

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const customBgs: CustomBackground[] = files.map((file) => ({
      name: file.name.split(".")[0],
      value: URL.createObjectURL(file),
      isCustom: true,
      file: file,
      backgroundSize: "cover",
    }))
    setCustomBackgrounds((prev) => [...prev, ...customBgs])
  }

  const removeCustomBackground = (bgToRemove: CustomBackground) => {
    setCustomBackgrounds((prev) => prev.filter((bg) => bg.value !== bgToRemove.value))
    if (wallBackground.value === bgToRemove.value) {
      setWallBackground(backgroundOptions[0])
    }
    URL.revokeObjectURL(bgToRemove.value)
  }

  const handleEditImage = (imageId: number) => {
    setEditingImageId(imageId)
  }

  const handleImageEditComplete = (editedImage: ImageData) => {
    updateImage(editedImage.id, editedImage)
    setEditingImageId(null)
  }

  const deleteImage = (id: number) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const createCollage = (selectedImages: string[]) => {
    if (selectedImages.length < 2) return

    const collageImage: ImageData = {
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
    }

    setImages((prev) => [...prev, collageImage])
  }

  const allBackgrounds = [...backgroundOptions, ...customBackgrounds]
  const editingImage = editingImageId ? images.find((img) => img.id === editingImageId) : null

  // Get current wall background value (use wall color if blank white wall is selected)
  const currentWallBackground = wallBackground.name === "Blank White Wall" ? wallColor : wallBackground.value

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {!showWall ? (
        <div className="max-w-4xl mx-auto">
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
              <form onSubmit={handleWallSubmit} className="space-y-6">
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
                              e.stopPropagation()
                              removeCustomBackground(bg as CustomBackground)
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
      ) : (
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
                onCustomBackgroundUpload={handleBackgroundUpload}
                onRemoveCustomBackground={removeCustomBackground}
                allBackgrounds={allBackgrounds}
                wallBorder={wallBorder}
                onWallBorderChange={setWallBorder}
                onClose={() => setShowSettings(false)}
              />
            </div>
          )}

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
        </div>
      )}
    </div>
  )
}

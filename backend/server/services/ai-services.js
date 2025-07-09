const axios = require('axios');
const FormData = require('form-data');
const AI_CONFIG = require('../config/ai-services');

class AIServices {
  constructor() {
    this.config = AI_CONFIG;
  }

  // Background Removal using Remove.bg API
  async removeBackground(imageBuffer, filename) {
    if (!this.config.removeBg.enabled) {
      throw new Error('Remove.bg API not configured');
    }
    try {
      const formData = new FormData();
      formData.append('image_file', imageBuffer, {
        filename: filename,
        contentType: 'image/jpeg'
      });
      formData.append('size', 'auto');
      const response = await axios.post(
        `${this.config.removeBg.baseUrl}/removebg`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'X-Api-Key': this.config.removeBg.apiKey
          },
          responseType: 'arraybuffer'
        }
      );
      return Buffer.from(response.data);
    } catch (error) {
      throw new Error('Failed to remove background');
    }
  }

  // Style Transfer using Replicate API
  async applyStyleTransfer(imageBuffer, style = 'vintage') {
    if (!this.config.replicate.enabled) {
      throw new Error('Replicate API not configured');
    }
    try {
      const base64Image = imageBuffer.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64Image}`;
      const prediction = await axios.post(
        `${this.config.replicate.baseUrl}/predictions`,
        {
          version: "c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd18f149dd0d80f3342d6",
          input: {
            image: dataUrl,
            style: style
          }
        },
        {
          headers: {
            'Authorization': `Token ${this.config.replicate.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const result = await this.pollPrediction(prediction.data.id);
      return result;
    } catch (error) {
      throw new Error('Failed to apply style transfer');
    }
  }

  // Poll prediction results
  async pollPrediction(predictionId) {
    const maxAttempts = 30;
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(
          `${this.config.replicate.baseUrl}/predictions/${predictionId}`,
          {
            headers: {
              'Authorization': `Token ${this.config.replicate.apiToken}`
            }
          }
        );
        if (response.data.status === 'succeeded') {
          return response.data.output;
        } else if (response.data.status === 'failed') {
          throw new Error('Style transfer failed');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      } catch (error) {
        throw error;
      }
    }
    throw new Error('Style transfer timeout');
  }

  // Basic image analysis fallback
  basicImageAnalysis(imageBuffer) {
    const size = imageBuffer.length;
    const aspectRatio = this.estimateAspectRatio(imageBuffer);
    return {
      dominantColors: this.extractDominantColors(imageBuffer),
      brightness: this.analyzeBrightness(imageBuffer),
      contrast: this.analyzeContrast(imageBuffer),
      recommendedSize: this.calculateRecommendedSize(size, aspectRatio),
      placement: this.suggestPlacement(aspectRatio, size),
      confidence: 0.8,
      suggestions: [
        'Try using a contrasting background for better visibility.',
        'Consider resizing for optimal fit.'
      ]
    };
  }

  extractDominantColors(imageBuffer) {
    return ['#FF6B6B', '#4ECDC4', '#45B7D1'];
  }

  analyzeBrightness(imageBuffer) {
    return 'medium';
  }

  analyzeContrast(imageBuffer) {
    return 'normal';
  }

  calculateRecommendedSize(size, aspectRatio) {
    const baseSize = Math.sqrt(size / 1000) * 100;
    return {
      width: Math.round(baseSize * aspectRatio),
      height: Math.round(baseSize)
    };
  }

  suggestPlacement(aspectRatio, size) {
    if (aspectRatio > 1.5) {
      return 'horizontal';
    } else if (aspectRatio < 0.7) {
      return 'vertical';
    } else {
      return 'square';
    }
  }

  estimateAspectRatio(imageBuffer) {
    return 1.0;
  }

  processImageAnalysis(analysisData) {
    return {
      dominantColors: analysisData.colors || ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      brightness: analysisData.brightness || 'medium',
      contrast: analysisData.contrast || 'normal',
      recommendedSize: analysisData.size || { width: 200, height: 200 },
      placement: analysisData.placement || 'square',
      confidence: analysisData.confidence || 0.8,
      suggestions: analysisData.suggestions || [
        'Try using a contrasting background for better visibility.',
        'Consider resizing for optimal fit.'
      ]
    };
  }

  async generateLayoutSuggestions(images, wallSize) {
    const analyzedImages = await Promise.all(
      images.map(async (image) => {
        const analysis = await this.basicImageAnalysis(image.buffer);
        return {
          ...image,
          analysis
        };
      })
    );
    return this.createLayoutSuggestions(analyzedImages, wallSize);
  }

  createLayoutSuggestions(analyzedImages, wallSize) {
    const layouts = [];
    layouts.push({
      name: 'Grid Layout',
      type: 'grid',
      positions: this.calculateGridPositions(analyzedImages, wallSize),
      score: 0.8
    });
    layouts.push({
      name: 'Mosaic Layout',
      type: 'mosaic',
      positions: this.calculateMosaicPositions(analyzedImages, wallSize),
      score: 0.7
    });
    layouts.push({
      name: 'Flow Layout',
      type: 'flow',
      positions: this.calculateFlowPositions(analyzedImages, wallSize),
      score: 0.9
    });
    return layouts.sort((a, b) => b.score - a.score);
  }

  calculateGridPositions(images, wallSize) {
    const positions = [];
    const cols = Math.ceil(Math.sqrt(images.length));
    const rows = Math.ceil(images.length / cols);
    const cellWidth = wallSize.width / cols;
    const cellHeight = wallSize.height / rows;
    images.forEach((image, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      positions.push({
        id: image.id,
        x: col * cellWidth + (cellWidth - image.analysis.recommendedSize.width) / 2,
        y: row * cellHeight + (cellHeight - image.analysis.recommendedSize.height) / 2,
        width: image.analysis.recommendedSize.width,
        height: image.analysis.recommendedSize.height
      });
    });
    return positions;
  }

  calculateMosaicPositions(images, wallSize) {
    const positions = [];
    const centerX = wallSize.width / 2;
    const centerY = wallSize.height / 2;
    images.forEach((image, index) => {
      const angle = (index / images.length) * 2 * Math.PI;
      const radius = Math.min(wallSize.width, wallSize.height) * 0.3;
      positions.push({
        id: image.id,
        x: centerX + Math.cos(angle) * radius - image.analysis.recommendedSize.width / 2,
        y: centerY + Math.sin(angle) * radius - image.analysis.recommendedSize.height / 2,
        width: image.analysis.recommendedSize.width,
        height: image.analysis.recommendedSize.height
      });
    });
    return positions;
  }

  calculateFlowPositions(images, wallSize) {
    const positions = [];
    let currentX = 50;
    let currentY = 50;
    let maxHeightInRow = 0;
    images.forEach((image) => {
      const imageWidth = image.analysis.recommendedSize.width;
      const imageHeight = image.analysis.recommendedSize.height;
      if (currentX + imageWidth > wallSize.width - 50) {
        currentX = 50;
        currentY += maxHeightInRow + 20;
        maxHeightInRow = 0;
      }
      positions.push({
        id: image.id,
        x: currentX,
        y: currentY,
        width: imageWidth,
        height: imageHeight
      });
      currentX += imageWidth + 20;
      maxHeightInRow = Math.max(maxHeightInRow, imageHeight);
    });
    return positions;
  }
}

module.exports = new AIServices(); 
import React, { useState, useRef } from 'react'
import { Upload, X, Eye, Star, RotateCcw } from 'lucide-react'
import type { ProductImage } from '@/types'

interface ImageUploadProps {
  images: ProductImage[]
  onImagesChange: (images: ProductImage[]) => void
  onUpload?: (files: FileList) => Promise<string[]>
  maxImages?: number
  disabled?: boolean
}

export function ImageUpload({ 
  images, 
  onImagesChange, 
  onUpload, 
  maxImages = 10,
  disabled = false 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList) => {
    if (!files.length || disabled) return

    if (images.length + files.length > maxImages) {
      alert(`Chỉ có thể upload tối đa ${maxImages} ảnh`)
      return
    }

    setUploading(true)
    try {
      if (onUpload) {
        const urls = await onUpload(files)
        const newImages: ProductImage[] = urls.map((url, index) => ({
          imageId: Date.now() + index, // temporary ID
          productId: 0, // will be set by parent
          imageUrl: url,
          isPrimary: images.length === 0 && index === 0,
          displayOrder: images.length + index,
        }))
        onImagesChange([...images, ...newImages])
      } else {
        // Handle local preview
        const newImages: ProductImage[] = []
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const url = URL.createObjectURL(file)
          newImages.push({
            imageId: Date.now() + i,
            productId: 0,
            imageUrl: url,
            isPrimary: images.length === 0 && i === 0,
            displayOrder: images.length + i,
          })
        }
        onImagesChange([...images, ...newImages])
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Có lỗi xảy ra khi upload ảnh')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeImage = (imageId: number) => {
    const updatedImages = images.filter(img => img.imageId !== imageId)
    
    // If removed image was primary, make first image primary
    if (updatedImages.length > 0 && !updatedImages.some(img => img.isPrimary)) {
      updatedImages[0].isPrimary = true
    }
    
    onImagesChange(updatedImages)
  }

  const setPrimaryImage = (imageId: number) => {
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.imageId === imageId
    }))
    onImagesChange(updatedImages)
  }

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...images]
    const [movedImage] = updatedImages.splice(fromIndex, 1)
    updatedImages.splice(toIndex, 0, movedImage)
    
    // Update display order
    updatedImages.forEach((img, index) => {
      img.displayOrder = index
    })
    
    onImagesChange(updatedImages)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : disabled
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-gray-600">Đang upload...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className={`w-12 h-12 mb-4 ${disabled ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`text-lg font-medium mb-2 ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
              {disabled ? 'Upload bị vô hiệu hóa' : 'Kéo thả ảnh vào đây hoặc click để chọn'}
            </p>
            <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
              Hỗ trợ: JPG, PNG, GIF. Tối đa {maxImages} ảnh.
            </p>
          </div>
        )}
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.imageId}
              className="relative group border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', index.toString())
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
                reorderImages(fromIndex, index)
              }}
            >
              <img
                src={image.imageUrl}
                alt={`Product image ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              
              {/* Primary badge */}
              {image.isPrimary && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star size={12} />
                  Chính
                </div>
              )}
              
              {/* Order badge */}
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                #{index + 1}
              </div>

              {/* Actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(image.imageUrl, '_blank')}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                    title="Xem ảnh"
                  >
                    <Eye size={16} />
                  </button>
                  
                  {!image.isPrimary && (
                    <button
                      onClick={() => setPrimaryImage(image.imageId)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                      title="Đặt làm ảnh chính"
                    >
                      <Star size={16} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => removeImage(image.imageId)}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-red-100 transition-colors text-red-600"
                    title="Xóa ảnh"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      {images.length > 0 && (
        <div className="text-sm text-gray-500 space-y-1">
          <p>💡 <strong>Hướng dẫn:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Kéo thả để sắp xếp lại thứ tự ảnh</li>
            <li>Click vào biểu tượng ⭐ để đặt ảnh chính</li>
            <li>Ảnh chính sẽ hiển thị đầu tiên trong danh sách sản phẩm</li>
            <li>Click vào 👁️ để xem ảnh ở kích thước lớn</li>
          </ul>
        </div>
      )}
    </div>
  )
}
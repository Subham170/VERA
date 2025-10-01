"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, Pencil } from "lucide-react"

export default function EditProfilePage() {
  const [username, setUsername] = useState("JordanLeex")
  const [bio, setBio] = useState(
    "",
  )
  const [email, setEmail] = useState("jordanleex@gmail.com")
  const [profileImage, setProfileImage] = useState("/images/dp.jpg")
  const [bannerImage, setBannerImage] = useState("/images/banner.jpg")
  
  const profileImageRef = useRef<HTMLInputElement>(null)
  const bannerImageRef = useRef<HTMLInputElement>(null)

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setBannerImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white p-6">
      <div className="max-w-5xl mx-auto pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-white">Profile details</h1>
          <Button 
            asChild 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 bg-gray-700 hover:bg-gray-600"
            aria-label="Close and return to profile"
          >
            <Link href="/profile">
              <X className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form Fields */}
          <div className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-white">
                Username
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="bg-[#2D2D30] border-gray-600 text-white placeholder-gray-400 rounded-lg"
              />
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium text-white">
                Bio
              </label>
              <Textarea
                id="bio"
                rows={8}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the world your story."
                className="bg-[#2D2D30] border-gray-600 text-white placeholder-gray-400 rounded-lg resize-y h-32 min-h-32"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-white">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="bg-[#2D2D30] border-gray-600 text-white placeholder-gray-400 rounded-lg"
              />
            </div>

            {/* Save Button */}
            <Button className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium">
              Save
            </Button>
          </div>

          {/* Right Column - Profile Media */}
          <div className="space-y-6">
            {/* Profile Image */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Profile image</label>
              <div className="relative h-32 w-32 group">
                <div className="relative h-32 w-32 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-green-400">
                  {profileImage ? (
                    <Image 
                      src={profileImage} 
                      alt="Profile image preview" 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-green-400 flex items-center justify-center">
                      {/* <span className="text-white text-2xl font-bold"></span> */}
                    </div>
                  )}
                </div>
                
                {/* Pencil Icon Overlay */}
                <button
                  onClick={() => profileImageRef.current?.click()}
                  className=" cursor-pointer absolute -bottom-[-4px] -right-[-4px] h-8 w-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 group-hover:scale-110"
                >
                  <Pencil className="h-4 w-4 text-white" />
                </button>
                
                {/* Hidden File Input */}
                <input
                  ref={profileImageRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Profile Banner */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Profile Banner</label>
              <div className="relative h-24 w-full group">
                <div className="relative h-24 w-full overflow-hidden rounded-lg bg-[#2D2D30]">
                  {bannerImage ? (
                    <Image 
                      src={bannerImage} 
                      alt="Profile banner preview" 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#2D2D30] flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No banner selected</span>
                    </div>
                  )}
                </div>
                
                {/* Pencil Icon Overlay */}
                <button
                  onClick={() => bannerImageRef.current?.click()}
                  className=" cursor-pointer absolute bottom-2 right-2 h-8 w-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 group-hover:scale-110"
                >
                  <Pencil className="h-4 w-4 text-white" />
                </button>
                
                {/* Hidden File Input */}
                <input
                  ref={bannerImageRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerImageChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

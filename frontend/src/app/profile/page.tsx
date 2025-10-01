import { ProfileHeader } from "@/components/custom/profile/profile-header"
import { MediaGrid } from "@/components/custom/profile/media-grid"

// Mock data for profile - in a real app, this would come from an API or context
const mediaItems = [
  {
    id: "1",
    title: "BrandTripTalk.jpg",
    handle: "@JordanLeex",
    thumbnail: "/images/tag1.png",
  },
  {
    id: "2",
    title: "CubaTravelPodcast.mp3",
    handle: "@JordanLeex",
    thumbnail: "/audio-waveform-teal.jpg",
  },
  {
    id: "3",
    title: "Travelvlog.mp4",
    handle: "@JordanLeex",
    thumbnail: "/airport-window-sunset.jpg",
  },
  {
    id: "4",
    title: "TravelWithMeToTurkey.mp4",
    handle: "@JordanLeex",
    thumbnail: "/passport-luggage-flatlay.jpg",
  },
  {
    id: "5",
    title: "PortraitStudy.jpg",
    handle: "@JordanLeex",
    thumbnail: "/bw-portrait.png",
  },
  {
    id: "6",
    title: "CameraRigBTS.jpg",
    handle: "@JordanLeex",
    thumbnail: "/camera-rig-behind-the-scenes.jpg",
  },
]

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[#181A1D]">
      <ProfileHeader
        name="JordanLeex"
        handle="@JordanLeex"
        address="0xe7k2...f3b76"
        coverSrc="/images/banner.jpg"
        avatarSrc="/images/dp.jpg"
      />

       <section className="mx-auto w-full max-w-6xl px-4 pb-12">
         <div className="mb-6">
           <h2 className="text-lg text-white font-semibold tracking-tight mb-2">All media</h2>
           <div className="h-0.5 bg-gradient-to-r from-blue-500 to-teal-400 w-24"></div>
         </div>
         <MediaGrid items={mediaItems}/>
       </section>
    </main>
  )
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Music,
  Headphones,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Check,
  ArrowRight,
  Search,
  Link as LinkIcon,
  Lightbulb,
  Play,
  Pause,
  X,
  Zap,
  Sun,
  Briefcase,
  Gift,
  Heart,
} from "lucide-react";

// Types
type MusicOption = "browse" | "match" | "artlist";

interface MusicCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  trackCount: number;
}

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  mood: string;
  category: string;
}

// Demo data
const musicCategories: MusicCategory[] = [
  {
    id: "upbeat",
    name: "Upbeat",
    icon: <Zap className="w-4 h-4" />,
    description: "High energy, gets attention fast",
    trackCount: 45,
  },
  {
    id: "chill",
    name: "Chill",
    icon: <Sun className="w-4 h-4" />,
    description: "Relaxed, approachable vibes",
    trackCount: 38,
  },
  {
    id: "professional",
    name: "Professional",
    icon: <Briefcase className="w-4 h-4" />,
    description: "Clean, trustworthy feel",
    trackCount: 32,
  },
  {
    id: "holiday",
    name: "Holiday",
    icon: <Gift className="w-4 h-4" />,
    description: "Seasonal & festive tracks",
    trackCount: 24,
  },
  {
    id: "trending",
    name: "Trending",
    icon: <Heart className="w-4 h-4" />,
    description: "Popular sounds right now",
    trackCount: 18,
  },
];

const demoTracks: MusicTrack[] = [
  { id: "1", title: "Drive Time", artist: "Motion Studio", duration: "2:34", mood: "Upbeat", category: "upbeat" },
  { id: "2", title: "Open Road", artist: "Sonic Labs", duration: "2:48", mood: "Energetic", category: "upbeat" },
  { id: "3", title: "Easy Going", artist: "Chill Beats", duration: "3:12", mood: "Relaxed", category: "chill" },
  { id: "4", title: "Trust Builder", artist: "Pro Audio", duration: "2:22", mood: "Professional", category: "professional" },
  { id: "5", title: "Holiday Hustle", artist: "Festive Sounds", duration: "2:56", mood: "Festive", category: "holiday" },
];

// Music Option Card Component
function MusicOptionCard({
  selected,
  onClick,
  icon,
  title,
  description,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`border-2 rounded-xl transition-all ${
        selected
          ? "border-blue-500 bg-blue-50/50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <button
        onClick={onClick}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        {/* Radio circle */}
        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          selected ? "border-blue-500" : "border-gray-300"
        }`}>
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className={`${selected ? "text-blue-600" : "text-gray-500"}`}>
              {icon}
            </div>
            <h4 className="font-medium text-gray-900">{title}</h4>
          </div>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </button>

      {/* Expanded content */}
      {selected && children && (
        <div className="px-4 pb-4 pt-0">
          {children}
        </div>
      )}
    </div>
  );
}

// Browse Library Modal
function BrowseLibraryModal({
  onClose,
  onSelectTrack,
}: {
  onClose: () => void;
  onSelectTrack: (track: MusicTrack) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const filteredTracks = selectedCategory
    ? demoTracks.filter((t) => t.category === selectedCategory)
    : demoTracks;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Browse Music Library</h3>
            <p className="text-sm text-gray-500">Curated tracks for local business ads</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {musicCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Track List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredTracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all"
              >
                {/* Play button */}
                <button
                  onClick={() => setPlayingTrackId(playingTrackId === track.id ? null : track.id)}
                  className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors shrink-0"
                >
                  {playingTrackId === track.id ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>

                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{track.title}</h4>
                  <p className="text-sm text-gray-500 truncate">{track.artist}</p>
                </div>

                {/* Mood & Duration */}
                <div className="text-right shrink-0">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {track.mood}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{track.duration}</p>
                </div>

                {/* Select button */}
                <Button
                  size="sm"
                  onClick={() => onSelectTrack(track)}
                  className="shrink-0"
                >
                  Use This
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Song Match Results Modal
function SongMatchModal({
  sourceUrl,
  onClose,
  onSelectTrack,
}: {
  sourceUrl: string;
  onClose: () => void;
  onSelectTrack: (track: MusicTrack) => void;
}) {
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  // Mock similar tracks
  const similarTracks: MusicTrack[] = [
    { id: "s1", title: "Similar Vibe", artist: "Match Studio", duration: "2:38", mood: "Similar", category: "match" },
    { id: "s2", title: "Close Match", artist: "Vibe Labs", duration: "2:45", mood: "Similar", category: "match" },
    { id: "s3", title: "Perfect Fit", artist: "Sound Match", duration: "2:52", mood: "Similar", category: "match" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Similar Tracks Found!</h3>
            <p className="text-sm text-gray-500">Royalty-free alternatives matching your vibe</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source info */}
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Based on:</p>
          <p className="text-sm text-gray-700 truncate">{sourceUrl}</p>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {similarTracks.map((track, i) => (
              <div
                key={track.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  i === 0 ? "border-green-200 bg-green-50" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                {/* Best match badge */}
                {i === 0 && (
                  <span className="absolute -top-2 left-3 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                    Best Match
                  </span>
                )}

                {/* Play button */}
                <button
                  onClick={() => setPlayingTrackId(playingTrackId === track.id ? null : track.id)}
                  className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors shrink-0"
                >
                  {playingTrackId === track.id ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>

                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{track.title}</h4>
                  <p className="text-sm text-gray-500 truncate">{track.artist}</p>
                </div>

                {/* Duration */}
                <p className="text-xs text-gray-400 shrink-0">{track.duration}</p>

                {/* Select button */}
                <Button
                  size="sm"
                  onClick={() => onSelectTrack(track)}
                  className="shrink-0"
                >
                  Use This
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Confirmation Modal
function ConfirmationModal({
  track,
  onClose,
}: {
  track: MusicTrack;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Music Selected!</h3>
            <p className="text-sm text-gray-500">{track.title} by {track.artist}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700">
            This track will be used for your upcoming videos starting next week.
          </p>
        </div>

        <Button onClick={onClose} className="w-full">
          Got It
        </Button>
      </div>
    </div>
  );
}

// Main Widget
interface MusicWidgetProps {
  onMusicSelected?: (track: MusicTrack) => void;
}

export function MusicWidget({ onMusicSelected }: MusicWidgetProps) {
  const [selectedOption, setSelectedOption] = useState<MusicOption | null>(null);
  const [matchUrl, setMatchUrl] = useState("");
  const [artlistUrl, setArtlistUrl] = useState("");
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSelectTrack = (track: MusicTrack) => {
    setSelectedTrack(track);
    setShowBrowseModal(false);
    setShowMatchModal(false);
    onMusicSelected?.(track);
  };

  const handleFindSimilar = () => {
    if (!matchUrl) return;
    setIsSearching(true);
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
      setShowMatchModal(true);
    }, 1500);
  };

  const handleUseArtlistTrack = () => {
    if (!artlistUrl) return;
    // Extract track info from URL (mock)
    const mockTrack: MusicTrack = {
      id: "artlist-1",
      title: "Motion",
      artist: "Artlist Original",
      duration: "2:44",
      mood: "Energetic",
      category: "artlist",
    };
    setSelectedTrack(mockTrack);
    onMusicSelected?.(mockTrack);
  };

  const isValidSpotifyOrYouTube = (url: string) => {
    return url.includes("spotify.com") || url.includes("youtube.com") || url.includes("youtu.be");
  };

  const isValidArtlist = (url: string) => {
    return url.includes("artlist.io");
  };

  return (
    <>
      <Card className="w-full max-w-md border-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Music className="w-4 h-4 text-blue-500" />
            Pick Your Vibe
          </CardTitle>
          <p className="text-xs text-gray-500">
            Choose background music for your videos
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Option 1: Browse Library */}
          <MusicOptionCard
            selected={selectedOption === "browse"}
            onClick={() => setSelectedOption("browse")}
            icon={<Headphones className="w-4 h-4" />}
            title="Browse Our Library"
            description="Curated tracks that work great for local business ads"
          >
            <Button
              onClick={() => setShowBrowseModal(true)}
              className="w-full mt-2"
            >
              Browse Music
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </MusicOptionCard>

          {/* Option 2: Match a Song */}
          <MusicOptionCard
            selected={selectedOption === "match"}
            onClick={() => setSelectedOption("match")}
            icon={<Search className="w-4 h-4" />}
            title="Match a Song"
            description="Love a song's vibe? We'll find something similar that's royalty-free"
          >
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Paste a Spotify or YouTube link
                </label>
                <input
                  type="text"
                  value={matchUrl}
                  onChange={(e) => setMatchUrl(e.target.value)}
                  placeholder="https://open.spotify.com/track/..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button
                onClick={handleFindSimilar}
                disabled={!isValidSpotifyOrYouTube(matchUrl) || isSearching}
                className="w-full"
              >
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Finding Similar...
                  </>
                ) : (
                  <>
                    Find Similar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </MusicOptionCard>

          {/* Option 3: Artlist Link */}
          <MusicOptionCard
            selected={selectedOption === "artlist"}
            onClick={() => setSelectedOption("artlist")}
            icon={<LinkIcon className="w-4 h-4" />}
            title="I Found One on Artlist"
            description="Already browsing Artlist? Send us the link!"
          >
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Paste Artlist link
                </label>
                <input
                  type="text"
                  value={artlistUrl}
                  onChange={(e) => setArtlistUrl(e.target.value)}
                  placeholder="https://artlist.io/royalty-free-music/song/..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button
                onClick={handleUseArtlistTrack}
                disabled={!isValidArtlist(artlistUrl)}
                className="w-full"
              >
                Use This Track
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </MusicOptionCard>

          {/* Premium note */}
          <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg mt-4">
            <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
            <span>Higher tier plans include full access to our premium music library</span>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showBrowseModal && (
        <BrowseLibraryModal
          onClose={() => setShowBrowseModal(false)}
          onSelectTrack={handleSelectTrack}
        />
      )}
      {showMatchModal && (
        <SongMatchModal
          sourceUrl={matchUrl}
          onClose={() => setShowMatchModal(false)}
          onSelectTrack={handleSelectTrack}
        />
      )}
      {selectedTrack && (
        <ConfirmationModal
          track={selectedTrack}
          onClose={() => setSelectedTrack(null)}
        />
      )}
    </>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Check,
  Download,
  RefreshCw,
  X,
  Upload,
  Plus,
  Play,
  ChevronDown,
  Trash2,
  User,
  AlertTriangle,
  Info,
  Star,
  Loader2,
} from "lucide-react";
import {
  PoseLandmarker,
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

// Motion style options from HeyGen with descriptions
const MOTION_STYLES = [
  {
    id: "expert-presentation",
    name: "Expert Presentation",
    description: "Professional, confident delivery with minimal gestures",
    recommended: true,
    prompt: "Static camera, locked frame, steady shot, fixed composition, consistent position, even lighting, uniform setup, confident clear speaking, direct eye contact, professional presence, neutral yet approachable facial expression, precise controlled minimal hand gestures, emphasizes key points, hands free, stable natural posture, motionless delivery"
  },
  {
    id: "talking-naturally",
    name: "Talking Naturally",
    description: "Animated speaking with natural eye contact",
    prompt: "Subject talks animatedly while maintaining direct eye contact with the camera. Background elements subtly move to enhance realism. Camera remains absolutely static."
  },
  {
    id: "dynamic-announcement",
    name: "Dynamic Announcement",
    description: "Energetic and enthusiastic with expressive gestures",
    prompt: "Static camera, locked frame, steady shot, fixed composition, consistent position, even lighting, uniform setup, enthusiastic energetic speaking, strong engaging eye contact, sense of urgency and importance, animated facial expressions, smiles, raised eyebrows, expressive controlled hand gestures, speech-driven gestures, hands free, stable natural posture, dynamic yet anchored presence"
  },
  {
    id: "keynote-speaker",
    name: "Keynote Speaker",
    description: "Authoritative and charismatic with deliberate gestures",
    prompt: "Static camera, locked frame, steady shot, fixed composition, consistent position, even lighting, uniform setup, authoritative passionate speaking, steady engaging tone, intentional powerful eye contact toward camera, strong grounded presence, charismatic dynamic facial expressions, balance of seriousness and warmth, deliberate confident hand gestures, open-palm movements, gestures reinforce message, hands free, stable natural posture, focused delivery"
  },
  {
    id: "thoughtful-conversation",
    name: "Thoughtful Conversation",
    description: "Calm and reflective with gentle pauses",
    prompt: "Static camera, locked frame, steady shot, fixed composition, consistent position, soft even lighting, calm reflective engaging speaking, natural thoughtful pauses, gentle focused eye contact, conversational tone, warm understanding facial expressions, occasional nodding, subtle thoughtful hand gestures, gestures support message, hands free, stable natural posture, composed presence"
  },
  {
    id: "telling-funny-story",
    name: "Telling a Funny Story",
    description: "Playful and expressive with comedic timing",
    prompt: "Static camera, locked frame, steady shot, fixed composition, consistent position, even lighting, uniform setup, playful engaging speaking, natural vocal variations, witty smiling facial expression, slight eye contact shifts, expressive storytelling vibe, lively exaggerated expressions, comedic emphasis, animated contained hand gestures, storytelling gestures, hands free, stable natural posture, grounded delivery"
  },
  {
    id: "compelling-pitch",
    name: "Compelling Pitch",
    description: "Smooth and convincing with trust-building presence",
    prompt: "Static camera, locked frame, steady shot, fixed composition, consistent position, even lighting, uniform setup, smooth convincing speaking, confident rhythm, trust-building tone, strong engaging eye contact, credible presence, confident approachable enthusiastic facial expressions, purposeful persuasive hand gestures, selling point emphasis, hands free, stable natural posture, composed delivery"
  },
  {
    id: "encouraging-motivational",
    name: "Encouraging & Motivational",
    description: "Passionate and uplifting with open gestures",
    prompt: "Static camera, locked frame, steady shot, fixed composition, consistent position, even lighting, uniform setup, passionate energetic speaking, uplifting inspirational tone, intense warm eye contact, personal emotional connection, passionate expressive facial expressions, motivation-focused delivery, open expressive hand gestures, welcoming encouraging presence, hands free, stable natural posture, energized presence"
  },
  {
    id: "news-moderator",
    name: "News Channel Moderator",
    description: "Clear and authoritative with measured delivery",
    prompt: "Static camera, locked frame, steady shot, fixed composition, consistent position, even lighting, uniform setup, clear professional composed speaking, authoritative structured neutral tone, direct steady eye contact, credible delivery, measured serious facial expressions, slight expressive variation, subtle intentional hand gestures, hands free, upright stable posture, anchored performance"
  }
];

// Available people/groups
const AVAILABLE_PEOPLE = [
  { id: "585545c8034c4c43b3969797841efd6c", name: "Kelly" },
  { id: "4a71e4db7bbc479caab6f0c38ea6e9e0", name: "Shad" },
  { id: "7f8c9d0e1a2b3c4d5e6f7a8b9c0d1e2f", name: "Dad" }, // TODO: Get Dad's actual group_id from HeyGen
];

// MediaPipe landmark indices
const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
};

// Photo validation warning type
interface PhotoWarning {
  type: "head" | "hands" | "body" | "face" | "dimensions" | "pose";
  message: string;
  severity: "warning" | "error";
}

// Analyze pose for photo requirements
function analyzePose(poseLandmarks: any[], imageWidth: number, imageHeight: number): PhotoWarning[] {
  const warnings: PhotoWarning[] = [];

  if (!poseLandmarks || poseLandmarks.length === 0) {
    warnings.push({
      type: "body",
      message: "We couldn't detect your body. Please make sure your full body is visible.",
      severity: "warning"
    });
    return warnings;
  }

  const landmarks = poseLandmarks;
  const margin = 0.05; // 5% margin from edges

  // Helper to check if landmark is visible (confidence > 0.5)
  const isVisible = (idx: number) => landmarks[idx] && landmarks[idx].visibility > 0.5;

  // Helper to check if landmark is in frame
  const isInFrame = (idx: number) => {
    const lm = landmarks[idx];
    if (!lm) return false;
    return lm.x > margin && lm.x < (1 - margin) && lm.y > margin && lm.y < (1 - margin);
  };

  // Check head visibility and position
  const headLandmarks = [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.LEFT_EYE, POSE_LANDMARKS.RIGHT_EYE];
  const headCutOff = headLandmarks.some(idx => {
    const lm = landmarks[idx];
    return lm && lm.y < 0.03; // Very close to top edge
  });

  if (headCutOff) {
    warnings.push({
      type: "head",
      message: "Your head appears cut off at the top. Try moving back from the camera.",
      severity: "warning"
    });
  }

  // Check head tilt
  const leftEye = landmarks[POSE_LANDMARKS.LEFT_EYE];
  const rightEye = landmarks[POSE_LANDMARKS.RIGHT_EYE];
  if (leftEye && rightEye && isVisible(POSE_LANDMARKS.LEFT_EYE) && isVisible(POSE_LANDMARKS.RIGHT_EYE)) {
    const eyeDiff = Math.abs(leftEye.y - rightEye.y);
    const eyeDistance = Math.abs(leftEye.x - rightEye.x);
    const tiltRatio = eyeDiff / eyeDistance;

    if (tiltRatio > 0.15) { // Significant tilt
      warnings.push({
        type: "head",
        message: "Your head appears tilted. Try keeping it straight.",
        severity: "warning"
      });
    }
  }

  // Check shoulders visible
  if (!isVisible(POSE_LANDMARKS.LEFT_SHOULDER) || !isVisible(POSE_LANDMARKS.RIGHT_SHOULDER)) {
    warnings.push({
      type: "body",
      message: "We can't see both shoulders. Please make sure your upper body is fully visible.",
      severity: "warning"
    });
  }

  // Check arms/hands visible
  const leftHandVisible = isVisible(POSE_LANDMARKS.LEFT_WRIST) || isVisible(POSE_LANDMARKS.LEFT_INDEX);
  const rightHandVisible = isVisible(POSE_LANDMARKS.RIGHT_WRIST) || isVisible(POSE_LANDMARKS.RIGHT_INDEX);

  if (!leftHandVisible && !rightHandVisible) {
    warnings.push({
      type: "hands",
      message: "We can't detect your hands. Make sure they're visible and lightly clasped in front.",
      severity: "warning"
    });
  } else if (!leftHandVisible || !rightHandVisible) {
    warnings.push({
      type: "hands",
      message: "We can only see one hand. Please clasp both hands in front of you.",
      severity: "warning"
    });
  }

  // Check if hands are clasped (wrists close together and in center)
  if (leftHandVisible && rightHandVisible) {
    const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];

    if (leftWrist && rightWrist) {
      const wristDistance = Math.sqrt(
        Math.pow(leftWrist.x - rightWrist.x, 2) +
        Math.pow(leftWrist.y - rightWrist.y, 2)
      );

      // If wrists are far apart, hands probably aren't clasped
      if (wristDistance > 0.25) {
        warnings.push({
          type: "hands",
          message: "Your hands don't appear clasped together. Try lightly clasping them in front.",
          severity: "warning"
        });
      }
    }
  }

  // Check knees visible (for full body shot)
  const leftKneeVisible = isVisible(POSE_LANDMARKS.LEFT_KNEE);
  const rightKneeVisible = isVisible(POSE_LANDMARKS.RIGHT_KNEE);

  if (!leftKneeVisible && !rightKneeVisible) {
    // Check if hips are visible instead (waist-up is okay)
    const leftHipVisible = isVisible(POSE_LANDMARKS.LEFT_HIP);
    const rightHipVisible = isVisible(POSE_LANDMARKS.RIGHT_HIP);

    if (!leftHipVisible && !rightHipVisible) {
      warnings.push({
        type: "body",
        message: "We can't see enough of your body. Please show at least from knees up.",
        severity: "warning"
      });
    }
  }

  // Check if arms are cut off at edges
  const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
  const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];

  if (leftElbow && (leftElbow.x < margin || leftElbow.x > 1 - margin)) {
    warnings.push({
      type: "body",
      message: "Your left arm appears cut off. Try centering yourself in the frame.",
      severity: "warning"
    });
  }

  if (rightElbow && (rightElbow.x < margin || rightElbow.x > 1 - margin)) {
    warnings.push({
      type: "body",
      message: "Your right arm appears cut off. Try centering yourself in the frame.",
      severity: "warning"
    });
  }

  return warnings;
}

// Analyze face for looking at camera
function analyzeFace(faceLandmarks: any[]): PhotoWarning[] {
  const warnings: PhotoWarning[] = [];

  if (!faceLandmarks || faceLandmarks.length === 0) {
    warnings.push({
      type: "face",
      message: "We couldn't detect your face. Please face the camera directly.",
      severity: "warning"
    });
    return warnings;
  }

  // Face landmarks are detailed - check nose position relative to face edges
  // to determine if person is looking at camera
  const noseTip = faceLandmarks[1]; // Approximate nose tip
  const leftCheek = faceLandmarks[234]; // Left face edge
  const rightCheek = faceLandmarks[454]; // Right face edge

  if (noseTip && leftCheek && rightCheek) {
    const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
    const noseFromCenter = Math.abs(noseTip.x - (leftCheek.x + rightCheek.x) / 2);

    // If nose is significantly off-center, not looking at camera
    if (noseFromCenter / faceWidth > 0.15) {
      warnings.push({
        type: "face",
        message: "Please look directly at the camera, not to the side.",
        severity: "warning"
      });
    }
  }

  return warnings;
}

// Generated motion variant type
interface GeneratedMotion {
  id: string;
  motion_style: string;
  motion_style_id: string;
  preview_video_url: string;
  talking_photo_id: string;
  motion_avatar_id?: string;
  selected: boolean;
}

export interface AvatarStyle {
  id: string;
  name: string;
  preview_video_url?: string;
  thumbnail_url?: string;
  is_default?: boolean;
}

export interface AvatarCaptureResult {
  success: boolean;
  talking_photo_id?: string;
  motion_avatar_id?: string;
  group_id?: string;
  avatar_name?: string;
  motion_style?: string;
  preview_video_url?: string;
  bg_removed_url?: string;
  error?: string;
}

export interface AvatarCaptureProps {
  existingAvatars?: AvatarStyle[];
  avatarCredits?: number;
  creditsResetDays?: number;
  onCapture?: (imageData: string) => void;
  onAvatarCreated?: (result: AvatarCaptureResult) => void;
  onAvatarSaved?: (results: AvatarCaptureResult[]) => void;
  onAvatarsDeleted?: (motionIds: string[]) => void;
  onCancel?: () => void;
  onPurchaseCredits?: () => void;
  defaultAvatarName?: string;
}

// N8N workflow endpoint
const N8N_AVATAR_WEBHOOK = "https://ad-pilot-n8n-production.up.railway.app/webhook/process-avatar-photo";

// Config
const COUNTDOWN_SECONDS = 20;
const MIN_IMAGE_WIDTH = 500;
const MIN_IMAGE_HEIGHT = 700;

type CaptureState =
  | "hub"           // Screen 1: Avatar hub + instructions
  | "method"        // Screen 2: Capture method selection
  | "capturing"     // Screen 3a: Photo capture
  | "preview"       // Screen 4: Review photo
  | "naming"        // Screen 5: Name + Motion + Person
  | "processing"    // Screen 6: Loading state
  | "review";       // Screen 6: Review all generated motions

export function AvatarCapture({
  existingAvatars = [],
  avatarCredits = 10, // Default for demo
  creditsResetDays = 30,
  onCapture,
  onAvatarCreated,
  onAvatarSaved,
  onAvatarsDeleted,
  onCancel,
  onPurchaseCredits,
  defaultAvatarName = ""
}: AvatarCaptureProps) {
  const [state, setState] = useState<CaptureState>("hub");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageWarnings, setImageWarnings] = useState<PhotoWarning[]>([]);
  const [avatarName, setAvatarName] = useState(defaultAvatarName || (existingAvatars.length === 0 ? "Default" : ""));
  const [selectedPerson, setSelectedPerson] = useState(AVAILABLE_PEOPLE[0]);
  const [isPersonDropdownOpen, setIsPersonDropdownOpen] = useState(false);
  const [selectedMotion, setSelectedMotion] = useState(MOTION_STYLES[0]);
  const [isMotionDropdownOpen, setIsMotionDropdownOpen] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);

  // Track all generated motions for this session
  const [generatedMotions, setGeneratedMotions] = useState<GeneratedMotion[]>([]);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [bgRemovedUrl, setBgRemovedUrl] = useState<string | null>(null);

  // MediaPipe refs
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMotionDropdownOpen(false);
        setIsPersonDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const stopCapture = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Initialize MediaPipe models
  const initMediaPipe = useCallback(async () => {
    if (poseLandmarkerRef.current && faceLandmarkerRef.current) return;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      // Initialize Pose Landmarker
      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU"
        },
        runningMode: "IMAGE",
        numPoses: 1
      });

      // Initialize Face Landmarker
      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "IMAGE",
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false
      });

      console.log("MediaPipe models loaded successfully");
    } catch (error) {
      console.error("Failed to load MediaPipe models:", error);
    }
  }, []);

  // Analyze image with MediaPipe
  const analyzeImageWithMediaPipe = useCallback(async (img: HTMLImageElement): Promise<PhotoWarning[]> => {
    const warnings: PhotoWarning[] = [];

    // Check dimensions first (blocking error)
    if (img.width < MIN_IMAGE_WIDTH || img.height < MIN_IMAGE_HEIGHT) {
      warnings.push({
        type: "dimensions",
        message: `Image is too small (${img.width}x${img.height}). Minimum size is ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT} pixels.`,
        severity: "error"
      });
      return warnings;
    }

    // Initialize MediaPipe if not already done
    await initMediaPipe();

    // Analyze pose
    if (poseLandmarkerRef.current) {
      try {
        const poseResult = poseLandmarkerRef.current.detect(img);
        if (poseResult.landmarks && poseResult.landmarks.length > 0) {
          const poseWarnings = analyzePose(poseResult.landmarks[0], img.width, img.height);
          warnings.push(...poseWarnings);
        } else {
          warnings.push({
            type: "body",
            message: "We couldn't detect your body. Please make sure you're fully visible in the frame.",
            severity: "warning"
          });
        }
      } catch (error) {
        console.error("Pose detection error:", error);
      }
    }

    // Analyze face
    if (faceLandmarkerRef.current) {
      try {
        const faceResult = faceLandmarkerRef.current.detect(img);
        if (faceResult.faceLandmarks && faceResult.faceLandmarks.length > 0) {
          const faceWarnings = analyzeFace(faceResult.faceLandmarks[0]);
          warnings.push(...faceWarnings);
        } else {
          warnings.push({
            type: "face",
            message: "We couldn't detect your face. Please face the camera directly.",
            severity: "warning"
          });
        }
      } catch (error) {
        console.error("Face detection error:", error);
      }
    }

    return warnings;
  }, [initMediaPipe]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Mirror the image (front camera is mirrored)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    const imageData = canvas.toDataURL("image/jpeg", 0.95);
    setCapturedImage(imageData);
    stopCapture();
    setState("preview");
    setIsAnalyzingPhoto(true);

    // Run MediaPipe analysis on captured photo
    const img = new Image();
    img.onload = async () => {
      try {
        const warnings = await analyzeImageWithMediaPipe(img);
        setImageWarnings(warnings.filter(w => w.severity === "warning"));
      } catch (error) {
        console.error("Photo analysis failed:", error);
      } finally {
        setIsAnalyzingPhoto(false);
      }
    };
    img.src = imageData;
  }, [stopCapture, analyzeImageWithMediaPipe]);

  const startCountdown = useCallback(() => {
    let count = COUNTDOWN_SECONDS;
    setCountdown(count);

    countdownIntervalRef.current = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setCountdown(null);
        capturePhoto();
      }
    }, 1000);
  }, [capturePhoto]);

  const startCapture = useCallback(async () => {
    setState("capturing");

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1080 },
          height: { ideal: 1920 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play();
      }

      // Start countdown after camera is ready
      startCountdown();
    } catch (err) {
      console.error("Error starting capture:", err);
      alert("Camera access denied. Please allow camera access and try again.");
      setState("method");
    }
  }, [startCountdown]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;

      // Create image and validate
      const img = new Image();
      img.onload = async () => {
        // Quick dimension check first
        if (img.width < MIN_IMAGE_WIDTH || img.height < MIN_IMAGE_HEIGHT) {
          alert(`Image is too small (${img.width}x${img.height}). Minimum size is ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT} pixels.`);
          return;
        }

        // Show image and start analyzing
        setCapturedImage(imageData);
        setState("preview");
        setIsAnalyzingPhoto(true);

        // Run MediaPipe analysis
        try {
          const warnings = await analyzeImageWithMediaPipe(img);
          setImageWarnings(warnings.filter(w => w.severity === "warning"));
        } catch (error) {
          console.error("Photo analysis failed:", error);
        } finally {
          setIsAnalyzingPhoto(false);
        }
      };
      img.src = imageData;
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setImageWarnings([]);
    setState("method");
  }, []);

  const handleUsePhoto = useCallback(() => {
    if (capturedImage) {
      setState("naming");
      onCapture?.(capturedImage);
    }
  }, [capturedImage, onCapture]);

  const processAvatarThroughN8N = useCallback(async () => {
    if (!capturedImage) return;

    setState("processing");
    setProcessingStatus("Starting avatar processing...");

    try {
      const base64Data = capturedImage.split(",")[1];

      setProcessingStatus("Removing background...");

      const response = await fetch(N8N_AVATAR_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_base64: base64Data,
          group_id: selectedPerson.id,
          person_name: selectedPerson.name,
          style_name: avatarName || "Default",
          motion_prompt: selectedMotion.prompt,
          motion_style_name: selectedMotion.name,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      setProcessingStatus("Generating avatar with motion...");

      const result = await response.json();

      if (result.success) {
        // Store bg_removed_url for potential regenerations
        if (result.bg_removed_url) {
          setBgRemovedUrl(result.bg_removed_url);
        }

        // Add to generated motions list
        const newMotion: GeneratedMotion = {
          id: `motion-${Date.now()}`,
          motion_style: selectedMotion.name,
          motion_style_id: selectedMotion.id,
          preview_video_url: result.preview_video_url || "",
          talking_photo_id: result.talking_photo_id || "",
          motion_avatar_id: result.motion_avatar_id,
          selected: generatedMotions.length === 0, // Select first one by default
        };

        setGeneratedMotions(prev => [...prev, newMotion]);
        setActivePreviewId(newMotion.id);
        setState("review");

        const avatarData: AvatarCaptureResult = {
          success: true,
          talking_photo_id: result.talking_photo_id,
          motion_avatar_id: result.motion_avatar_id,
          group_id: selectedPerson.id,
          avatar_name: avatarName || "Default",
          motion_style: selectedMotion.name,
          preview_video_url: result.preview_video_url,
          bg_removed_url: result.bg_removed_url,
        };
        onAvatarCreated?.(avatarData);
      } else {
        throw new Error(result.error || "Avatar creation failed");
      }
    } catch (error) {
      console.error("Error processing avatar:", error);
      setProcessingStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }, [capturedImage, avatarName, selectedMotion, selectedPerson, generatedMotions.length, onAvatarCreated]);

  const handleGenerateAnotherMotion = useCallback(() => {
    // Go back to naming screen with photo preserved to pick a different motion
    setState("naming");
  }, []);

  const toggleMotionSelection = useCallback((motionId: string) => {
    setGeneratedMotions(prev => prev.map(m =>
      m.id === motionId ? { ...m, selected: !m.selected } : m
    ));
  }, []);

  const handleSaveSelected = useCallback(() => {
    const selectedMotions = generatedMotions.filter(m => m.selected);
    const unselectedMotions = generatedMotions.filter(m => !m.selected);

    if (selectedMotions.length === 0) {
      alert("Please select at least one motion to keep.");
      return;
    }

    // Convert selected motions to AvatarCaptureResult format
    const results: AvatarCaptureResult[] = selectedMotions.map(m => ({
      success: true,
      talking_photo_id: m.talking_photo_id,
      motion_avatar_id: m.motion_avatar_id,
      group_id: selectedPerson.id,
      avatar_name: avatarName || "Default",
      motion_style: m.motion_style,
      preview_video_url: m.preview_video_url,
      bg_removed_url: bgRemovedUrl || undefined,
    }));

    onAvatarSaved?.(results);

    // Report unselected motions for deletion
    if (unselectedMotions.length > 0 && onAvatarsDeleted) {
      const idsToDelete = unselectedMotions
        .map(m => m.motion_avatar_id)
        .filter((id): id is string => !!id);
      onAvatarsDeleted(idsToDelete);
    }

    // Reset for next avatar
    setState("hub");
    setCapturedImage(null);
    setAvatarName("");
    setGeneratedMotions([]);
    setActivePreviewId(null);
    setBgRemovedUrl(null);
  }, [generatedMotions, selectedPerson.id, avatarName, bgRemovedUrl, onAvatarSaved, onAvatarsDeleted]);

  const handleDiscardAll = useCallback(() => {
    const totalCredits = generatedMotions.length;
    const confirmed = window.confirm(
      `This will discard ${totalCredits} generated motion${totalCredits > 1 ? 's' : ''}. Each motion used 1 generation credit. Are you sure you want to discard all?`
    );
    if (confirmed) {
      // Report all motions for deletion
      if (onAvatarsDeleted) {
        const idsToDelete = generatedMotions
          .map(m => m.motion_avatar_id)
          .filter((id): id is string => !!id);
        onAvatarsDeleted(idsToDelete);
      }

      setState("hub");
      setCapturedImage(null);
      setAvatarName("");
      setGeneratedMotions([]);
      setActivePreviewId(null);
      setBgRemovedUrl(null);
    }
  }, [generatedMotions, onAvatarsDeleted]);

  const handleDownload = useCallback(() => {
    if (!capturedImage) return;
    const link = document.createElement("a");
    link.download = "avatar-photo.jpg";
    link.href = capturedImage;
    link.click();
  }, [capturedImage]);

  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, [stopCapture]);

  // Get motion styles that haven't been generated yet
  const availableMotionStyles = MOTION_STYLES.filter(
    style => !generatedMotions.some(m => m.motion_style_id === style.id)
  );

  const hasCredits = avatarCredits > 0;

  // Screen 1: Avatar Hub + Instructions
  if (state === "hub") {
    return (
      <Card className="w-full max-w-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6">
          <h2 className="text-xl font-semibold text-white mb-2">Your Avatar Styles</h2>
          <p className="text-slate-400 text-sm">
            Create different looks for your AI spokesperson
          </p>
        </div>

        <CardContent className="p-5 space-y-6">
          {/* Credit info */}
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">
                <strong>Avatar Credits:</strong> {avatarCredits} remaining
                {creditsResetDays > 0 && <span className="text-blue-500"> (resets in {creditsResetDays} days)</span>}
              </span>
            </div>
            {!hasCredits && onPurchaseCredits && (
              <Button size="sm" onClick={onPurchaseCredits} className="text-xs">
                Get More
              </Button>
            )}
          </div>

          {/* Existing avatars grid */}
          {existingAvatars.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {existingAvatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className="relative aspect-[9/16] rounded-lg overflow-hidden border-2 border-slate-200 hover:border-blue-400 transition-all cursor-pointer"
                  onMouseEnter={() => setHoveredAvatar(avatar.id)}
                  onMouseLeave={() => setHoveredAvatar(null)}
                >
                  {avatar.preview_video_url && hoveredAvatar === avatar.id ? (
                    <video
                      src={avatar.preview_video_url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      {avatar.thumbnail_url ? (
                        <img
                          src={avatar.thumbnail_url}
                          alt={avatar.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Play className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                    <p className="text-white text-xs font-medium truncate">{avatar.name}</p>
                    {avatar.is_default && (
                      <span className="text-green-400 text-[10px]">Default</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Add New Style button as a tile */}
              <button
                onClick={() => hasCredits && setState("method")}
                disabled={!hasCredits}
                className={`aspect-[9/16] rounded-lg border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${
                  hasCredits
                    ? "border-slate-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
                    : "border-slate-200 bg-slate-50 cursor-not-allowed opacity-50"
                }`}
              >
                <Plus className="w-8 h-8 text-slate-400" />
                <span className="text-sm text-slate-500">Add Style</span>
              </button>
            </div>
          )}

          {/* If no avatars, show big add button */}
          {existingAvatars.length === 0 && (
            <>
              <Button
                onClick={() => setState("method")}
                className="w-full h-14 text-base"
                disabled={!hasCredits}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Avatar
              </Button>
              {!hasCredits && (
                <p className="text-center text-sm text-red-600">
                  You're out of avatar credits.{" "}
                  {onPurchaseCredits && (
                    <button onClick={onPurchaseCredits} className="underline font-medium">
                      Purchase more
                    </button>
                  )}
                </p>
              )}
            </>
          )}

          {/* Each avatar uses 1 credit note */}
          <p className="text-xs text-slate-500 text-center">
            Each new avatar uses 1 credit
          </p>

          {/* Photo Requirements */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Photo Requirements
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Good example */}
              <div className="text-center">
                <div className="aspect-[3/4] bg-green-50 border-2 border-green-300 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                  <div className="text-green-600 text-4xl">✓</div>
                </div>
                <p className="text-xs text-green-700 font-medium">Good</p>
              </div>

              {/* Bad example */}
              <div className="text-center">
                <div className="aspect-[3/4] bg-red-50 border-2 border-red-300 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                  <div className="text-red-600 text-4xl">✗</div>
                </div>
                <p className="text-xs text-red-700 font-medium">Bad</p>
              </div>
            </div>

            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                Visible from at least knees up
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                No body parts cut off at edges (head, arms, hands must be fully visible)
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                Eyes looking directly at camera
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                Neutral expression, head straight (not tilted)
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                Camera at eye level (prevents looking up/down, avoids body distortion)
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                Face evenly lit, no harsh shadows
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                Hands lightly clasped in front
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                Avoid turtlenecks, scarves, or bulky jewelry (obscures neck detection)
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                Solid/simple background preferred
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                Uploaded photos must be at least 500x700 pixels
              </li>
            </ul>
          </div>

          {onCancel && (
            <Button variant="ghost" onClick={onCancel} className="w-full">
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Screen 2: Capture Method Selection
  if (state === "method") {
    return (
      <Card className="w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-center">
          <div className="text-5xl mb-3">📸</div>
          <h2 className="text-xl font-semibold text-white mb-2">Add New Avatar Style</h2>
          <p className="text-slate-400 text-sm">
            How would you like to provide your photo?
          </p>
        </div>

        <CardContent className="p-5 space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          <Button
            onClick={startCapture}
            variant="outline"
            className="w-full h-14 justify-start px-4"
          >
            <Camera className="w-5 h-5 mr-3 text-blue-600" />
            <div className="text-left">
              <p className="font-medium">Take Photo</p>
              <p className="text-xs text-slate-500">Use your camera with 20s countdown</p>
            </div>
          </Button>

          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full h-14 justify-start px-4"
          >
            <Upload className="w-5 h-5 mr-3 text-purple-600" />
            <div className="text-left">
              <p className="font-medium">Upload Photo</p>
              <p className="text-xs text-slate-500">Choose an existing photo (min 500x700px)</p>
            </div>
          </Button>

          <Button variant="ghost" onClick={() => setState("hub")} className="w-full">
            ← Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Screen 3a: Photo Capture (no overlay, just countdown)
  if (state === "capturing") {
    return (
      <Card className="w-full max-w-md overflow-hidden">
        <div className="relative aspect-[9/16] bg-black max-h-[500px] mx-auto">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Countdown overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[120px] font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                {countdown}
              </span>
              <p className="text-white text-lg font-medium mt-4 drop-shadow-lg">
                Get in position...
              </p>

              {/* Progress bar */}
              <div className="absolute bottom-20 left-4 right-4">
                <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <Button
            variant="outline"
            onClick={() => {
              stopCapture();
              setState("method");
            }}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Screen 4: Review Photo with validation warnings
  if (state === "preview" && capturedImage) {
    return (
      <Card className="w-full max-w-md overflow-hidden">
        <div className="bg-slate-800 p-4 text-center">
          <h2 className="text-lg font-semibold text-white">Review Your Photo</h2>
        </div>

        {/* Photo preview */}
        <div className="aspect-[9/16] max-h-[450px] mx-auto bg-slate-100">
          <img
            src={capturedImage}
            alt="Your photo"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Analyzing indicator */}
        {isAnalyzingPhoto && (
          <div className="px-4 py-3 bg-blue-50 border-t border-blue-200">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <p className="text-sm text-blue-700">Analyzing photo for potential issues...</p>
            </div>
          </div>
        )}

        {/* Validation warnings (advisory) */}
        {!isAnalyzingPhoto && imageWarnings.length > 0 && (
          <div className="px-4 py-3 bg-amber-50 border-t border-amber-200">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm font-medium text-amber-800">Heads up:</p>
            </div>
            <ul className="text-xs text-amber-700 space-y-1 ml-6">
              {imageWarnings.map((warning, i) => (
                <li key={i}>• {warning.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* All good indicator */}
        {!isAnalyzingPhoto && imageWarnings.length === 0 && (
          <div className="px-4 py-3 bg-green-50 border-t border-green-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-700">Photo looks good! No issues detected.</p>
            </div>
          </div>
        )}

        {/* Self-check questions */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-2">Quick Check:</p>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• Visible from knees up?</li>
            <li>• Head, arms, and hands fully visible (not cut off)?</li>
            <li>• Eyes looking directly at camera?</li>
            <li>• Neutral expression, head straight?</li>
            <li>• Face evenly lit (no harsh shadows)?</li>
            <li>• Hands lightly clasped in front?</li>
          </ul>
        </div>

        <CardContent className="p-4 space-y-3">
          <Button
            onClick={handleUsePhoto}
            className="w-full h-12 text-base bg-green-600 hover:bg-green-700"
          >
            <Check className="w-5 h-5 mr-2" />
            Looks Good - Use This Photo
          </Button>

          <Button variant="outline" onClick={handleRetake} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retake Photo
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Screen 5: Name + Motion Style + Person
  if (state === "naming" && capturedImage) {
    return (
      <Card className="w-full max-w-md overflow-visible">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-center rounded-t-lg">
          <div className="text-5xl mb-3">🎬</div>
          <h2 className="text-xl font-semibold text-white mb-2">Customize Your Avatar</h2>
          <p className="text-slate-400 text-sm">
            {generatedMotions.length > 0
              ? `You've generated ${generatedMotions.length} motion${generatedMotions.length > 1 ? 's' : ''}. Add another?`
              : "Name this style and choose how it moves"
            }
          </p>
        </div>

        <CardContent className="p-5 space-y-4" ref={dropdownRef}>
          {/* Preview thumbnail */}
          <div className="w-24 h-32 mx-auto rounded-lg overflow-hidden border-2 border-slate-200">
            <img
              src={capturedImage}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            {/* Person/Group Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Who is this?
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsPersonDropdownOpen(!isPersonDropdownOpen);
                    setIsMotionDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-left flex items-center justify-between bg-white hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    {selectedPerson.name}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isPersonDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isPersonDropdownOpen && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
                    {AVAILABLE_PEOPLE.map((person) => (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => {
                          setSelectedPerson(person);
                          setIsPersonDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg ${
                          selectedPerson.id === person.id ? 'bg-blue-50 text-blue-700' : ''
                        }`}
                      >
                        <User className="w-4 h-4" />
                        <span className="font-medium text-sm">{person.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Avatar Name - only show if first generation */}
            {generatedMotions.length === 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Avatar Style Name
                </label>
                <input
                  type="text"
                  value={avatarName}
                  onChange={(e) => setAvatarName(e.target.value)}
                  placeholder={existingAvatars.length === 0 ? "Default" : "e.g., Santa hat, Summer dress"}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Use a short description - Santa Hat, Summer Dress, Blue Polo
                </p>
              </div>
            )}

            {/* Motion Style Dropdown - fixed overflow */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Motion Style
                {generatedMotions.length > 0 && (
                  <span className="text-slate-400 font-normal"> ({availableMotionStyles.length} remaining)</span>
                )}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsMotionDropdownOpen(!isMotionDropdownOpen);
                    setIsPersonDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-left flex items-center justify-between bg-white hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate">{selectedMotion.name}</span>
                    {selectedMotion.recommended && (
                      <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded">
                        <Star className="w-2.5 h-2.5" />
                        Best
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isMotionDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMotionDropdownOpen && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {availableMotionStyles.map((motion, index) => (
                      <button
                        key={motion.id}
                        type="button"
                        onClick={() => {
                          setSelectedMotion(motion);
                          setIsMotionDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0 ${
                          index === 0 ? 'rounded-t-lg' : ''
                        } ${index === availableMotionStyles.length - 1 ? 'rounded-b-lg' : ''} ${
                          selectedMotion.id === motion.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <p className={`font-medium text-sm ${selectedMotion.id === motion.id ? 'text-blue-700' : ''}`}>
                            {motion.name}
                          </p>
                          {motion.recommended && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded">
                              <Star className="w-2.5 h-2.5" />
                              Best for dealerships
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{motion.description}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                How your avatar will move and gesture
              </p>
            </div>
          </div>

          {/* Credit warning */}
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-700">
              This will use <strong>1 avatar credit</strong>
            </p>
          </div>

          <Button
            onClick={processAvatarThroughN8N}
            className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
            disabled={generatedMotions.length === 0 && !avatarName.trim()}
          >
            {generatedMotions.length > 0 ? "Generate Another Motion" : "Create Avatar"}
          </Button>

          {generatedMotions.length > 0 ? (
            <Button variant="outline" onClick={() => setState("review")} className="w-full">
              ← Back to Review ({generatedMotions.length} generated)
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setState("preview")} className="w-full">
              ← Back to Preview
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Screen 6a: Processing/Loading state
  if (state === "processing") {
    return (
      <Card className="w-full max-w-md overflow-hidden">
        <div className="aspect-[9/16] max-h-[500px] mx-auto bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center">
          <div className="text-center px-10">
            {/* Jay working illustration placeholder */}
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>

            <h2 className="text-xl font-semibold text-white mb-2">
              {generatedMotions.length > 0 ? "Generating Motion..." : "Creating Your Avatar"}
            </h2>
            <p className="text-blue-200 text-sm mb-6">{processingStatus}</p>

            <div className="bg-white/20 rounded-lg p-4 text-left text-sm text-blue-100 space-y-2">
              <p className={processingStatus.includes("background") ? "text-white font-medium" : "opacity-60"}>
                ✓ Removing background...
              </p>
              <p className={processingStatus.includes("position") ? "text-white font-medium" : "opacity-60"}>
                ✓ Positioning avatar...
              </p>
              <p className={processingStatus.includes("motion") || processingStatus.includes("Generating") ? "text-white font-medium" : "opacity-60"}>
                ✓ Generating motion...
              </p>
              <p className="opacity-60">
                ✓ Creating preview video...
              </p>
            </div>

            <p className="text-blue-300 text-xs mt-6">This may take 60-90 seconds</p>
          </div>
        </div>
      </Card>
    );
  }

  // Screen 6b: Review all generated motions
  if (state === "review") {
    const selectedCount = generatedMotions.filter(m => m.selected).length;
    const activeMotion = generatedMotions.find(m => m.id === activePreviewId) || generatedMotions[0];

    return (
      <Card className="w-full max-w-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-green-700 to-emerald-800 p-6 text-center">
          <div className="text-5xl mb-3">✨</div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Review Your Motions
          </h2>
          <p className="text-green-200 text-sm">
            {avatarName} • {generatedMotions.length} motion{generatedMotions.length > 1 ? 's' : ''} generated
          </p>
        </div>

        <CardContent className="p-5 space-y-4">
          <div className="flex gap-4">
            {/* Main preview */}
            <div className="flex-1">
              {activeMotion?.preview_video_url ? (
                <div className="aspect-[9/16] max-h-[400px] rounded-lg overflow-hidden border-2 border-green-400">
                  <video
                    key={activeMotion.id}
                    src={activeMotion.preview_video_url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[9/16] max-h-[400px] rounded-lg overflow-hidden border-2 border-amber-300 bg-amber-50 flex flex-col items-center justify-center p-4">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                  <p className="text-amber-700 text-sm font-medium text-center">Preview not available</p>
                  <p className="text-amber-600 text-xs text-center mt-1">
                    Video may still be processing. Check back in a moment.
                  </p>
                </div>
              )}
              <p className="text-center text-sm font-medium text-slate-700 mt-2">
                {activeMotion?.motion_style}
              </p>
            </div>

            {/* Thumbnails for all generated motions */}
            {generatedMotions.length > 1 && (
              <div className="w-24 space-y-2 overflow-y-auto max-h-[450px]">
                {generatedMotions.map((motion) => (
                  <div
                    key={motion.id}
                    onClick={() => setActivePreviewId(motion.id)}
                    className={`relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      activePreviewId === motion.id
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {motion.preview_video_url ? (
                      <video
                        src={motion.preview_video_url}
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-amber-50 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      </div>
                    )}

                    {/* Selection checkbox overlay */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMotionSelection(motion.id);
                      }}
                      className={`absolute top-1 right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        motion.selected
                          ? 'bg-green-500 border-green-500'
                          : 'bg-white/80 border-slate-300'
                      }`}
                    >
                      {motion.selected && <Check className="w-3 h-3 text-white" />}
                    </button>

                    {/* Motion style name */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                      <p className="text-white text-[9px] font-medium truncate">
                        {motion.motion_style.split(' ')[0]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selection toggle for single motion */}
          {generatedMotions.length === 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => toggleMotionSelection(generatedMotions[0].id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  generatedMotions[0].selected
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-slate-300 bg-white text-slate-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  generatedMotions[0].selected
                    ? 'bg-green-500 border-green-500'
                    : 'bg-white border-slate-300'
                }`}>
                  {generatedMotions[0].selected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm font-medium">
                  {generatedMotions[0].selected ? 'Selected to keep' : 'Not selected'}
                </span>
              </button>
            </div>
          )}

          {/* Info about selection */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            <p>
              <strong>{selectedCount}</strong> motion{selectedCount !== 1 ? 's' : ''} selected to keep.
              {generatedMotions.length - selectedCount > 0 && (
                <> <strong>{generatedMotions.length - selectedCount}</strong> will be deleted from HeyGen.</>
              )}
            </p>
          </div>

          {/* Action buttons */}
          <Button
            onClick={handleSaveSelected}
            className="w-full h-12 text-base bg-green-600 hover:bg-green-700"
            disabled={selectedCount === 0}
          >
            <Check className="w-5 h-5 mr-2" />
            Save {selectedCount} Selected Motion{selectedCount !== 1 ? 's' : ''}
          </Button>

          {availableMotionStyles.length > 0 && (
            <Button
              variant="outline"
              onClick={handleGenerateAnotherMotion}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Another Motion ({availableMotionStyles.length} styles left)
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={handleDiscardAll}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Discard All ({generatedMotions.length} credit{generatedMotions.length > 1 ? 's' : ''} used)
          </Button>

          {capturedImage && (
            <Button variant="ghost" onClick={handleDownload} className="w-full text-slate-500">
              <Download className="w-4 h-4 mr-2" />
              Download Original Photo
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}

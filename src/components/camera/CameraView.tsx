import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { DetectionOverlay } from './DetectionOverlay';
import {
  Camera,
  CameraOff,
  SwitchCamera,
  Flashlight,
  CircleDot,
  HelpCircle,
  Upload,
  Focus,
} from 'lucide-react';
import { CameraState, FacingMode, Detection } from '@/types';

// Mock detections for demo
const mockDetections: Detection[] = [
  {
    id: 'det1',
    label: 'Amul Milk 500ml',
    confidence: 0.95,
    bbox: [120, 100, 200, 280],
    suggestedProductId: 'PRD001',
  },
];

export function CameraView() {
  const { state, dispatch, speak, announce } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  // Check for multiple cameras
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);
    });
  }, []);

  const startCamera = useCallback(async () => {
    setCameraState('initializing');
    announce('Initializing camera...');

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check torch capability
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
      setHasTorch(!!capabilities.torch);

      // Set streaming state first so video element renders
      setCameraState('streaming');
      dispatch({ type: 'SET_CAMERA_ACTIVE', payload: true });
      speak('Camera ready. Hold product inside frame.');
      
      // Simulate detection after a short delay
      setTimeout(() => {
        dispatch({ type: 'SET_DETECTIONS', payload: mockDetections });
        speak('Detected: Amul Milk 500ml. Press Enter to hear details.');
      }, 2000);
      
    } catch (error) {
      console.error('Camera error:', error);
      setCameraState('error');
      speak('Camera permission required. Please grant access to continue.');
    }
  }, [facingMode, dispatch, speak, announce]);

  // Attach stream to video element when it becomes available
  useEffect(() => {
    if (cameraState === 'streaming' && streamRef.current && videoRef.current) {
      const videoElement = videoRef.current;
      videoElement.srcObject = streamRef.current;
      videoElement.play().catch(console.error);
    }
  }, [cameraState]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState('idle');
    dispatch({ type: 'SET_CAMERA_ACTIVE', payload: false });
    dispatch({ type: 'SET_DETECTIONS', payload: [] });
    announce('Camera stopped.');
  }, [dispatch, announce]);

  const switchCamera = useCallback(() => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    if (cameraState === 'streaming') {
      stopCamera();
      setTimeout(() => startCamera(), 100);
    }
    announce(`Switched to ${newMode === 'environment' ? 'back' : 'front'} camera.`);
  }, [facingMode, cameraState, stopCamera, startCamera, announce]);

  const toggleTorch = useCallback(async () => {
    if (!streamRef.current || !hasTorch) return;
    
    const track = streamRef.current.getVideoTracks()[0];
    const newTorchState = !torchEnabled;
    
    try {
      await track.applyConstraints({
        advanced: [{ torch: newTorchState } as MediaTrackConstraintSet],
      });
      setTorchEnabled(newTorchState);
      announce(`Flash ${newTorchState ? 'on' : 'off'}.`);
    } catch (error) {
      console.error('Torch error:', error);
    }
  }, [hasTorch, torchEnabled, announce]);

  const captureFrame = useCallback(() => {
    announce('Capturing image for analysis...');
    speak('Analyzing product. Please wait.');
    // In production, this would send a frame to the detection API
  }, [announce, speak]);

  const toggleContinuousMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_CONTINUOUS_MODE' });
    const newState = !state.isContinuousMode;
    announce(`Continuous detection ${newState ? 'on' : 'off'}.`);
  }, [dispatch, state.isContinuousMode, announce]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        cameraState === 'streaming' ? stopCamera() : startCamera();
      } else if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        switchCamera();
      } else if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        toggleContinuousMode();
      } else if ((e.key === ' ' || e.key === 'Enter') && document.activeElement?.closest('.camera-container')) {
        e.preventDefault();
        captureFrame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cameraState, startCamera, stopCamera, switchCamera, toggleContinuousMode, captureFrame]);

  return (
    <div className="camera-container flex flex-col gap-4">
      {/* Camera Viewfinder */}
      <div className="camera-viewfinder relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-glass">
        {cameraState === 'streaming' ? (
          <>
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              autoPlay
              playsInline
              muted
              aria-hidden="true"
            />
            {/* Scanning line effect */}
            <div className="scan-line" aria-hidden="true" />
            {/* Detection overlay */}
            <DetectionOverlay detections={state.detections} />
            {/* Corner guides */}
            <div className="pointer-events-none absolute inset-8">
              <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-primary/60" />
              <div className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-primary/60" />
              <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-primary/60" />
              <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-primary/60" />
            </div>
          </>
        ) : cameraState === 'error' ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <CameraOff className="h-16 w-16 text-destructive" />
            <h3 className="text-xl font-semibold text-foreground">Camera Permission Required</h3>
            <p className="text-muted-foreground">
              Allow camera access to identify products.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="default" onClick={startCamera}>
                Grant Camera Access
              </Button>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
            <div className="relative">
              <Camera className="h-20 w-20 text-primary animate-float" />
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" aria-hidden="true" />
            </div>
            <div className="text-center">
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                Ready to Scan Products
              </h3>
              <p className="text-muted-foreground">
                Press the button below to start the camera
              </p>
            </div>
            <Button
              variant="hero"
              size="xl"
              onClick={startCamera}
              aria-label="Start camera"
              className="min-w-[200px]"
            >
              <Camera className="mr-2 h-5 w-5" />
              Start Camera
            </Button>
          </div>
        )}

        {/* Continuous mode indicator */}
        {state.isContinuousMode && cameraState === 'streaming' && (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-success/20 px-3 py-1.5 text-sm font-medium text-success">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Live Detection
          </div>
        )}
      </div>

      {/* Camera Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Start/Stop Camera */}
        <Button
          variant={cameraState === 'streaming' ? 'destructive' : 'default'}
          size="accessible"
          onClick={cameraState === 'streaming' ? stopCamera : startCamera}
          aria-label={cameraState === 'streaming' ? 'Stop camera' : 'Start camera'}
          title={cameraState === 'streaming' ? 'Stop camera (Ctrl+Shift+C)' : 'Start camera (Ctrl+Shift+C)'}
          disabled={cameraState === 'initializing'}
        >
          {cameraState === 'streaming' ? (
            <>
              <CameraOff className="mr-2 h-5 w-5" />
              Stop Camera
            </>
          ) : (
            <>
              <Camera className="mr-2 h-5 w-5" />
              Start Camera
            </>
          )}
        </Button>

        {/* Capture */}
        <Button
          variant="outline"
          size="accessible"
          onClick={captureFrame}
          disabled={cameraState !== 'streaming'}
          aria-label="Capture snapshot"
          title="Take a snapshot for better recognition (Space)"
        >
          <Focus className="mr-2 h-5 w-5" />
          Capture
        </Button>

        {/* Continuous Mode Toggle */}
        <Button
          variant={state.isContinuousMode ? 'secondary' : 'outline'}
          size="accessible"
          onClick={toggleContinuousMode}
          aria-pressed={state.isContinuousMode}
          aria-label={`Continuous detection ${state.isContinuousMode ? 'on' : 'off'}`}
          title="Stream frames continuously for instant recognition (Ctrl+M)"
          disabled={cameraState !== 'streaming'}
        >
          <CircleDot className="mr-2 h-5 w-5" />
          {state.isContinuousMode ? 'Live: ON' : 'Live: OFF'}
        </Button>

        {/* Switch Camera */}
        {hasMultipleCameras && (
          <Button
            variant="glass"
            size="icon-lg"
            onClick={switchCamera}
            disabled={cameraState !== 'streaming'}
            aria-label="Switch between front and back camera"
            title="Switch Camera (Ctrl+K)"
          >
            <SwitchCamera className="h-5 w-5" />
          </Button>
        )}

        {/* Torch/Flash */}
        {hasTorch && (
          <Button
            variant={torchEnabled ? 'secondary' : 'glass'}
            size="icon-lg"
            onClick={toggleTorch}
            disabled={cameraState !== 'streaming'}
            aria-pressed={torchEnabled}
            aria-label={`Flash ${torchEnabled ? 'on' : 'off'}`}
            title="Toggle flash"
          >
            <Flashlight className="h-5 w-5" />
          </Button>
        )}

        {/* Help */}
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Help and tutorial"
          title="Help (?)"
          asChild
        >
          <a href="/help">
            <HelpCircle className="h-5 w-5" />
          </a>
        </Button>
      </div>
    </div>
  );
}

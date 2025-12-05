import { CameraView } from '@/components/camera/CameraView';
import { ProductDetailsModal } from '@/components/product/ProductDetailsModal';
import { useApp } from '@/contexts/AppContext';
import { Mic, MicOff, Volume2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

const Scan = () => {
  const { speak, dispatch, state } = useApp();
  const navigate = useNavigate();
  const cameraViewRef = useRef<{ startCamera: () => void; stopCamera: () => void; captureFrame: () => void } | null>(null);

  const handleReadInstructions = () => {
    speak('Welcome to SmartShop. Point your camera at a product to identify it. Press Space to capture, or enable continuous detection for automatic scanning.');
  };

  // Voice command handlers
  const { isListening, isSupported, toggleListening } = useVoiceCommands({
    onCapture: () => {
      speak('Capturing image.');
      // Trigger capture via keyboard event simulation
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space' }));
    },
    onAdd: () => {
      if (state.currentProduct) {
        speak('Adding item to cart.');
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      } else {
        speak('No product selected. Please scan a product first.');
      }
    },
    onDetails: () => {
      if (state.detections.length > 0) {
        speak('Opening product details.');
        dispatch({ type: 'SET_CURRENT_PRODUCT', payload: {
          productId: state.detections[0].suggestedProductId || 'PRD001',
          name: state.detections[0].label,
          variants: [
            { variantId: 'V1', size: '500 ml', price: 45, unitPrice: 90, stock: 12 },
            { variantId: 'V2', size: '1 L', price: 80, unitPrice: 80, stock: 3 },
          ],
        }});
        dispatch({ type: 'TOGGLE_PRODUCT_MODAL', payload: true });
      } else {
        speak('No product detected. Please point camera at a product first.');
      }
    },
    onCart: () => {
      speak('Going to cart.');
      navigate('/cart');
    },
    onHelp: () => {
      speak('Opening help page.');
      navigate('/help');
    },
    onStart: () => {
      speak('Starting camera.');
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'C', ctrlKey: true, shiftKey: true }));
    },
    onStop: () => {
      speak('Stopping camera.');
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'C', ctrlKey: true, shiftKey: true }));
    },
    onUndo: () => {
      speak('Undoing last action.');
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'u' }));
    },
  });

  return (
    <main className="container mx-auto animate-fade-in px-4 py-6 md:py-8 min-h-[calc(100vh-4rem)]">
      {/* Page Header */}
      <div className="mb-6 text-center md:mb-8">
        <h1 className="font-display text-2xl font-bold tracking-wide text-foreground md:text-3xl">
          <span className="gradient-text">Product</span> Scanner
        </h1>
        <p className="mt-2 text-muted-foreground">
          Point your camera at products to identify and add them to cart
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Camera Section */}
        <section className="lg:col-span-8" aria-labelledby="camera-heading">
          <h2 id="camera-heading" className="sr-only">
            Camera and Detection
          </h2>
          <CameraView />
        </section>

        {/* Quick Actions Panel */}
        <aside className="lg:col-span-4" aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="sr-only">
            Quick Actions
          </h2>
          <div className="glass-panel h-full p-6">
            <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              {/* Voice Guide */}
              <Button
                variant="glass"
                className="w-full justify-start gap-3"
                onClick={handleReadInstructions}
                aria-label="Read instructions aloud"
              >
                <Volume2 className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <span className="block font-medium">Voice Guide</span>
                  <span className="text-xs text-muted-foreground">Listen to instructions</span>
                </div>
              </Button>

              {/* Voice Commands */}
              <Button
                variant={isListening ? 'default' : 'glass'}
                className={`w-full justify-start gap-3 ${isListening ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                onClick={toggleListening}
                aria-label={isListening ? 'Stop voice commands' : 'Start voice commands'}
                aria-pressed={isListening}
                disabled={!isSupported}
              >
                {isListening ? (
                  <MicOff className="h-5 w-5 text-destructive animate-pulse" />
                ) : (
                  <Mic className="h-5 w-5 text-secondary" />
                )}
                <div className="text-left">
                  <span className="block font-medium">
                    {isListening ? 'Listening...' : 'Voice Commands'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isSupported 
                      ? (isListening ? 'Say "capture", "add", or "cart"' : 'Say "capture" or "add"')
                      : 'Not supported in this browser'
                    }
                  </span>
                </div>
              </Button>

              {/* High Contrast */}
              <Button
                variant="glass"
                className="w-full justify-start gap-3"
                asChild
              >
                <a href="/settings">
                  <Eye className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <span className="block font-medium">Accessibility</span>
                    <span className="text-xs text-muted-foreground">Adjust display settings</span>
                  </div>
                </a>
              </Button>
            </div>

            {/* Voice Commands List */}
            {isListening && (
              <div className="mt-6 rounded-xl bg-primary/10 border border-primary/20 p-4 animate-fade-in">
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
                  Available Commands
                </h4>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>"<span className="text-foreground font-medium">Capture</span>" - Take a snapshot</li>
                  <li>"<span className="text-foreground font-medium">Add</span>" - Add to cart</li>
                  <li>"<span className="text-foreground font-medium">Details</span>" - View product info</li>
                  <li>"<span className="text-foreground font-medium">Cart</span>" - Go to cart</li>
                  <li>"<span className="text-foreground font-medium">Help</span>" - Open tutorial</li>
                </ul>
              </div>
            )}

            {/* Keyboard Shortcuts */}
            {!isListening && (
              <div className="mt-6 rounded-xl bg-muted/50 p-4">
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Keyboard Shortcuts
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Start/Stop Camera</span>
                    <kbd className="rounded bg-card px-2 py-0.5 font-mono text-xs text-primary">Ctrl+Shift+C</kbd>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Capture</span>
                    <kbd className="rounded bg-card px-2 py-0.5 font-mono text-xs text-primary">Space</kbd>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Add to Cart</span>
                    <kbd className="rounded bg-card px-2 py-0.5 font-mono text-xs text-primary">A</kbd>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Toggle Live</span>
                    <kbd className="rounded bg-card px-2 py-0.5 font-mono text-xs text-primary">Ctrl+M</kbd>
                  </li>
                </ul>
              </div>
            )}

            {/* Status indicators */}
            <div className="mt-6 flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-3">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isListening ? 'bg-primary' : 'bg-success'} animate-pulse`} />
                <span className="text-sm text-muted-foreground">
                  {isListening ? 'Voice Active' : 'System Ready'}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">v1.0.0</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Product Details Modal */}
      <ProductDetailsModal />
    </main>
  );
};

export default Scan;

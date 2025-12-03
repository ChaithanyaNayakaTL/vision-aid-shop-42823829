import { CameraView } from '@/components/camera/CameraView';
import { ProductDetailsModal } from '@/components/product/ProductDetailsModal';
import { useApp } from '@/contexts/AppContext';
import { Mic, Volume2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Scan = () => {
  const { speak } = useApp();

  const handleReadInstructions = () => {
    speak('Welcome to SmartShop. Point your camera at a product to identify it. Press Space to capture, or enable continuous detection for automatic scanning.');
  };

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
                variant="glass"
                className="w-full justify-start gap-3"
                aria-label="Activate voice commands"
              >
                <Mic className="h-5 w-5 text-secondary" />
                <div className="text-left">
                  <span className="block font-medium">Voice Commands</span>
                  <span className="text-xs text-muted-foreground">Say "capture" or "add"</span>
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

            {/* Keyboard Shortcuts */}
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

            {/* Status indicators */}
            <div className="mt-6 flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-muted-foreground">System Ready</span>
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

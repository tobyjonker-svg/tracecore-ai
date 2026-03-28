/**
 * Onboarding Tour Configuration
 * Defines tour steps for guided user walkthrough
 */

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

export const SUPPLIERS_TOUR_STEPS: TourStep[] = [
  {
    id: 'suppliers-intro',
    title: 'Welcome to Suppliers!',
    description: 'Suppliers are the companies or individuals that provide raw materials and ingredients for your products. Let\'s add your first supplier.',
    position: 'bottom',
  },
  {
    id: 'suppliers-add-button',
    title: 'Add Your First Supplier',
    description: 'Click the "Add Supplier" button to create a new supplier entry. You can add as many suppliers as you need.',
    target: '#add-supplier-btn',
    position: 'bottom',
  },
  {
    id: 'suppliers-form-name',
    title: 'Supplier Name',
    description: 'Enter your supplier\'s business name. This helps you identify them in your system.',
    target: '#supplier-name',
    position: 'right',
  },
  {
    id: 'suppliers-form-email',
    title: 'Contact Email',
    description: 'Add their email address so you can easily reach out for orders and inquiries.',
    target: '#supplier-email',
    position: 'right',
  },
  {
    id: 'suppliers-form-contact',
    title: 'Contact Details',
    description: 'Add phone numbers or other contact information for quick communication.',
    target: '#supplier-contact',
    position: 'right',
  },
  {
    id: 'suppliers-form-website',
    title: 'Website (Optional)',
    description: 'If your supplier has a website, add it here for reference.',
    target: '#supplier-website',
    position: 'right',
  },
  {
    id: 'suppliers-form-description',
    title: 'Description',
    description: 'Add notes about what they supply or any special terms. This helps you remember key details.',
    target: '#supplier-description',
    position: 'right',
  },
  {
    id: 'suppliers-form-submit',
    title: 'Save Your Supplier',
    description: 'Click "Add Supplier" to save this supplier to your system. You can add more suppliers anytime.',
    target: '#submit-supplier-btn',
    position: 'top',
  },
];

export const PRODUCTS_TOUR_STEPS: TourStep[] = [
  {
    id: 'products-intro',
    title: 'Welcome to Products!',
    description: 'Products are the finished goods you manufacture and sell. Let\'s add your first product to start tracking inventory.',
    position: 'bottom',
  },
  {
    id: 'products-add-button',
    title: 'Add Your First Product',
    description: 'Click the "Add Product" button to create a new product entry.',
    target: '#add-product-btn',
    position: 'bottom',
  },
  {
    id: 'products-form-name',
    title: 'Product Name',
    description: 'Enter the name of your product. Be specific so you can easily identify it in your inventory.',
    target: '#product-name',
    position: 'right',
  },
  {
    id: 'products-form-description',
    title: 'Product Description',
    description: 'Add details about what your product is, its benefits, or key features. This helps you remember important information.',
    target: '#product-description',
    position: 'right',
  },
  {
    id: 'products-form-initial-stock',
    title: 'Initial Stock',
    description: 'Enter how many units you currently have in stock. You can update this anytime.',
    target: '#initial-stock',
    position: 'right',
  },
  {
    id: 'products-form-low-stock-alert',
    title: 'Low Stock Alert',
    description: 'Set a threshold - we\'ll alert you when stock falls below this number so you can reorder in time.',
    target: '#low-stock-alert',
    position: 'right',
  },
  {
    id: 'products-form-submit',
    title: 'Save Your Product',
    description: 'Click "Add Product" to save this product. You can add more products and start tracking your inventory!',
    target: '#add-product-btn',
    position: 'top',
  },
];

export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard-intro',
    title: 'Welcome to Your Dashboard!',
    description: 'This is your command center. Here you can see all your key metrics at a glance.',
    position: 'bottom',
  },
  {
    id: 'dashboard-kpis',
    title: 'Key Performance Indicators',
    description: 'These cards show your most important metrics: total products, raw materials, pending orders, and more.',
    target: '.grid',
    position: 'bottom',
  },
  {
    id: 'dashboard-alerts',
    title: 'Important Alerts',
    description: 'Any critical issues (like low stock) appear here so you can take action immediately.',
    target: '.tc-card',
    position: 'bottom',
  },
  {
    id: 'dashboard-charts',
    title: 'Production Insights',
    description: 'Charts show your production volume and order trends over time. Use this to spot patterns and plan ahead.',
    target: 'canvas',
    position: 'top',
  },
  {
    id: 'dashboard-sidebar',
    title: 'Navigation Menu',
    description: 'Use the sidebar to navigate between Suppliers, Products, Orders, and other features.',
    target: 'aside',
    position: 'right',
  },
];

export const QUICK_START_TOUR_STEPS: TourStep[] = [
  {
    id: 'quickstart-welcome',
    title: 'Quick Start Guide',
    description: 'Welcome to TraceCore AI! Let\'s get you set up in just a few minutes. We\'ll show you the essentials.',
    position: 'bottom',
  },
  {
    id: 'quickstart-settings',
    title: 'Configure Your Business',
    description: 'First, let\'s make sure your business details are set up correctly. Click Settings to review your configuration.',
    target: 'a[href*="settings"]',
    position: 'bottom',
  },
  {
    id: 'quickstart-suppliers',
    title: 'Add Your Suppliers',
    description: 'Next, add the suppliers you work with. This helps you track where your materials come from.',
    target: 'a[href*="suppliers"]',
    position: 'bottom',
  },
  {
    id: 'quickstart-products',
    title: 'Add Your Products',
    description: 'Then add the products you manufacture. Start with your top sellers.',
    target: 'a[href*="products"]',
    position: 'bottom',
  },
  {
    id: 'quickstart-complete',
    title: 'You\'re All Set!',
    description: 'Great! You\'ve learned the basics. Explore the other features like Orders, Production Runs, and Reports whenever you\'re ready.',
    position: 'bottom',
  },
];

export interface OnboardingState {
  hasCompletedTour: boolean;
  completedSteps: string[];
  currentTour: 'suppliers' | 'products' | 'dashboard' | 'quickstart' | null;
}

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  hasCompletedTour: false,
  completedSteps: [],
  currentTour: null,
};

export function getOnboardingState(): OnboardingState {
  try {
    const stored = localStorage.getItem('onboarding-state');
    return stored ? JSON.parse(stored) : DEFAULT_ONBOARDING_STATE;
  } catch {
    return DEFAULT_ONBOARDING_STATE;
  }
}

export function saveOnboardingState(state: OnboardingState): void {
  localStorage.setItem('onboarding-state', JSON.stringify(state));
}

export function markTourComplete(tourName: string): void {
  const state = getOnboardingState();
  state.hasCompletedTour = true;
  state.completedSteps.push(tourName);
  saveOnboardingState(state);
}

// Example tests for Profile components
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import Profile from '../pages/Profile';
import ProfileHeader from '../components/profile/ProfileHeader';
import CheckInStepper from '../components/profile/CheckInStepper';
import CouponCard from '../components/profile/CouponCard';

// Mock data
const mockUser = {
  name: 'Test User',
  joinDate: 'Enero 2024',
};

const mockStats = {
  checkins: 5,
  points: 250,
  coupons: 2,
};

const mockCoupon = {
  id: 'COUPON_001',
  title: '20% de descuento',
  description: 'Descuento especial',
  discount: 20,
  discountType: 'percentage',
  agency: 'Test Agency',
  expiryDate: '2024-12-31',
  status: 'active',
  code: 'TEST20',
};

describe('ProfileHeader', () => {
  test('renders user information correctly', () => {
    render(<ProfileHeader user={mockUser} stats={mockStats} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Miembro desde Enero 2024')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('displays ocobo theme elements', () => {
    render(<ProfileHeader user={mockUser} stats={mockStats} />);
    
    // Check for ocobo flower icon
    expect(screen.getByText('🌸')).toBeInTheDocument();
    
    // Check for gradient background
    const header = screen.getByText('Test User').closest('div');
    expect(header).toHaveClass('bg-gradient-to-br');
  });
});

describe('CheckInStepper', () => {
  const mockSteps = [
    { id: 1, title: 'Elegir Lugar', subtitle: 'Selecciona dónde estás' },
    { id: 2, title: 'Validar', subtitle: 'Confirma ubicación' },
    { id: 3, title: 'Nota', subtitle: 'Agrega detalles' },
    { id: 4, title: 'Confirmar', subtitle: 'Finalizar check-in' },
  ];

  test('renders all steps correctly', () => {
    render(
      <CheckInStepper 
        currentStep={2} 
        steps={mockSteps} 
        onStepClick={vi.fn()} 
      />
    );
    
    expect(screen.getByText('Elegir Lugar')).toBeInTheDocument();
    expect(screen.getByText('Validar')).toBeInTheDocument();
    expect(screen.getByText('Nota')).toBeInTheDocument();
    expect(screen.getByText('Confirmar')).toBeInTheDocument();
  });

  test('highlights current step', () => {
    render(
      <CheckInStepper 
        currentStep={2} 
        steps={mockSteps} 
        onStepClick={vi.fn()} 
      />
    );
    
    const currentStepButton = screen.getByText('2').closest('button');
    expect(currentStepButton).toHaveClass('bg-gradient-to-r', 'from-ocobo', 'to-gold');
  });

  test('calls onStepClick when step is clicked', () => {
    const mockOnStepClick = vi.fn();
    render(
      <CheckInStepper 
        currentStep={2} 
        steps={mockSteps} 
        onStepClick={mockOnStepClick} 
      />
    );
    
    const stepButton = screen.getByText('1').closest('button');
    fireEvent.click(stepButton);
    
    expect(mockOnStepClick).toHaveBeenCalledWith(1);
  });
});

describe('CouponCard', () => {
  test('renders coupon information correctly', () => {
    render(
      <CouponCard 
        coupon={mockCoupon} 
        onRedeem={vi.fn()} 
        onAddToWallet={vi.fn()} 
      />
    );
    
    expect(screen.getByText('20% de descuento')).toBeInTheDocument();
    expect(screen.getByText('Test Agency')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('descuento')).toBeInTheDocument();
  });

  test('shows correct status for active coupon', () => {
    render(
      <CouponCard 
        coupon={mockCoupon} 
        onRedeem={vi.fn()} 
        onAddToWallet={vi.fn()} 
      />
    );
    
    expect(screen.getByText('Válido')).toBeInTheDocument();
    expect(screen.getByText('🎯 Redimir')).toBeInTheDocument();
  });

  test('shows correct status for used coupon', () => {
    const usedCoupon = { ...mockCoupon, status: 'used' };
    render(
      <CouponCard 
        coupon={usedCoupon} 
        onRedeem={vi.fn()} 
        onAddToWallet={vi.fn()} 
      />
    );
    
    expect(screen.getByText('Usado')).toBeInTheDocument();
    expect(screen.getByText('Cupón usado')).toBeInTheDocument();
  });

  test('calls onRedeem when redeem button is clicked', () => {
    const mockOnRedeem = vi.fn();
    render(
      <CouponCard 
        coupon={mockCoupon} 
        onRedeem={mockOnRedeem} 
        onAddToWallet={vi.fn()} 
      />
    );
    
    const redeemButton = screen.getByText('🎯 Redimir');
    fireEvent.click(redeemButton);
    
    expect(mockOnRedeem).toHaveBeenCalledWith(mockCoupon);
  });
});

describe('Profile Integration', () => {
  test('navigates between tabs correctly', () => {
    render(<Profile />);
    
    // Check initial tab
    expect(screen.getByText('Perfil')).toBeInTheDocument();
    
    // Click on Check-in tab
    fireEvent.click(screen.getByText('Check-in'));
    expect(screen.getByText('Proceso de Check-in')).toBeInTheDocument();
    
    // Click on Cupones tab
    fireEvent.click(screen.getByText('Cupones'));
    expect(screen.getByText('Crear Cupón')).toBeInTheDocument();
    
    // Click on Historial tab
    fireEvent.click(screen.getByText('Historial'));
    expect(screen.getByText('Historial de Actividad')).toBeInTheDocument();
  });

  test('completes check-in flow', async () => {
    render(<Profile />);
    
    // Navigate to check-in tab
    fireEvent.click(screen.getByText('Check-in'));
    
    // Select a place
    fireEvent.click(screen.getByText('Conservatorio del Tolima'));
    
    // Validate location
    fireEvent.click(screen.getByText('Confirmar ubicación'));
    
    // Add note
    const noteInput = screen.getByPlaceholderText('Comparte tu experiencia en este lugar...');
    fireEvent.change(noteInput, { target: { value: 'Great place!' } });
    
    // Finalize check-in
    fireEvent.click(screen.getByText('Finalizar Check-in'));
    fireEvent.click(screen.getByText('Aceptar y Continuar'));
    
    // Check for success toast
    await waitFor(() => {
      expect(screen.getByText('¡Check-in exitoso!')).toBeInTheDocument();
    });
  });

  test('creates coupon successfully', async () => {
    render(<Profile />);
    
    // Navigate to coupons tab
    fireEvent.click(screen.getByText('Cupones'));
    
    // Fill coupon form
    fireEvent.change(screen.getByPlaceholderText('Ej: 20% de descuento en restaurantes'), {
      target: { value: 'Test Coupon' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Describe los beneficios del cupón...'), {
      target: { value: 'Test description' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Ej: 20'), {
      target: { value: '20' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Nombre de tu agencia'), {
      target: { value: 'Test Agency' }
    });
    
    fireEvent.change(screen.getByDisplayValue(''), {
      target: { value: '2024-12-31' }
    });
    
    // Submit form
    fireEvent.click(screen.getByText('🎫 Crear Cupón'));
    
    // Check for success toast
    await waitFor(() => {
      expect(screen.getByText('Cupón creado')).toBeInTheDocument();
    });
  });
});

// Accessibility tests
describe('Accessibility', () => {
  test('ProfileHeader has proper ARIA labels', () => {
    render(<ProfileHeader user={mockUser} stats={mockStats} />);
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  test('CheckInStepper has proper button roles', () => {
    const mockSteps = [
      { id: 1, title: 'Elegir Lugar', subtitle: 'Selecciona dónde estás' },
    ];
    
    render(
      <CheckInStepper 
        currentStep={1} 
        steps={mockSteps} 
        onStepClick={vi.fn()} 
      />
    );
    
    const stepButton = screen.getByRole('button');
    expect(stepButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('CouponCard has proper focus management', () => {
    render(
      <CouponCard 
        coupon={mockCoupon} 
        onRedeem={vi.fn()} 
        onAddToWallet={vi.fn()} 
      />
    );
    
    const redeemButton = screen.getByText('🎯 Redimir');
    expect(redeemButton).toHaveClass('focus:outline-none', 'focus:ring-2');
  });
});

// Performance tests
describe('Performance', () => {
  test('Profile renders without performance issues', () => {
    const startTime = performance.now();
    render(<Profile />);
    const endTime = performance.now();
    
    // Should render in less than 100ms
    expect(endTime - startTime).toBeLessThan(100);
  });

  test('CouponCard renders efficiently with many coupons', () => {
    const manyCoupons = Array.from({ length: 100 }, (_, i) => ({
      ...mockCoupon,
      id: `COUPON_${i}`,
      title: `Coupon ${i}`,
    }));
    
    const startTime = performance.now();
    manyCoupons.forEach(coupon => {
      render(
        <CouponCard 
          coupon={coupon} 
          onRedeem={vi.fn()} 
          onAddToWallet={vi.fn()} 
        />
      );
    });
    const endTime = performance.now();
    
    // Should render 100 coupons in less than 500ms
    expect(endTime - startTime).toBeLessThan(500);
  });
});

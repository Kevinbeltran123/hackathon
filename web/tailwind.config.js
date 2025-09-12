
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          // Colores del logo y ocobos
          'ocobo-pink': "#E74C7C",     // Rosa vibrante de los ocobos (del logo)
          'forest-green': "#2D6C4F",   // Verde bosque del logo
          'hills-green': "#5C9C6F",    // Verde colinas del logo
          'amber-gold': "#FFB020",     // Dorado del logo
          'tree-brown': "#8D6E63",     // Marrón del tronco
          'path-cream': "#F0F0F0",     // Crema del sendero
          
          // Colores temáticos de ocobos
          'ocobo-light': "#F8BBD9",    // Rosa claro de ocobos
          'ocobo-dark': "#C2185B",     // Rosa oscuro de ocobos
          'nature-green': "#4CAF50",   // Verde naturaleza
          'earth-brown': "#6D4C41",    // Marrón tierra
          'sunset-orange': "#FF9800",  // Naranja atardecer
          'sky-blue': "#2196F3",       // Azul cielo
          
          // Tonos complementarios
          'green-light': "#81C784",
          'green-dark': "#1B5E20",
          'pink-light': "#F8BBD9",
          'pink-dark': "#C2185B",
          'gold-light': "#FFE082",
          'gold-dark': "#F57F17",
          
          // Colores de acento
          'blossom': "#E91E63",        // Rosa flor
          'leaf': "#4CAF50",           // Verde hoja
          'bark': "#5D4037",           // Marrón corteza
          'petal': "#F8BBD9",          // Rosa pétalo
          'moss': "#689F38"            // Verde musgo
        },
        
        // Colores semánticos temáticos
        success: "#4CAF50",        // Verde naturaleza
        warning: "#FF9800",        // Naranja atardecer
        error: "#E91E63",          // Rosa flor
        info: "#2196F3",           // Azul cielo
        
        // Grises más suaves
        gray: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#EEEEEE",
          300: "#E0E0E0",
          400: "#BDBDBD",
          500: "#9E9E9E",
          600: "#757575",
          700: "#616161",
          800: "#424242",
          900: "#212121"
        }
      },
      
      // Gradientes temáticos de ocobos
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #E74C7C 0%, #2D6C4F 100%)',        // Rosa ocobo → Verde bosque
        'gradient-ocobo': 'linear-gradient(135deg, #E74C7C 0%, #F8BBD9 100%)',          // Rosa ocobo → Rosa claro
        'gradient-nature': 'linear-gradient(135deg, #2D6C4F 0%, #5C9C6F 50%, #4CAF50 100%)', // Verde bosque → Verde colinas → Verde naturaleza
        'gradient-sunset': 'linear-gradient(135deg, #FFB020 0%, #FF9800 50%, #E74C7C 100%)', // Dorado → Naranja → Rosa ocobo
        'gradient-forest': 'linear-gradient(135deg, #2D6C4F 0%, #5C9C6F 100%)',         // Verde bosque → Verde colinas
        'gradient-blossom': 'linear-gradient(135deg, #E74C7C 0%, #F8BBD9 50%, #FFB020 100%)', // Rosa ocobo → Rosa claro → Dorado
        'gradient-earth': 'linear-gradient(135deg, #8D6E63 0%, #6D4C41 100%)',         // Marrón tronco → Marrón tierra
        'gradient-sky': 'linear-gradient(135deg, #2196F3 0%, #F0F0F0 100%)'            // Azul cielo → Crema sendero
      },
      
      // Sombras temáticas de ocobos
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'medium': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'strong': '0 16px 48px rgba(0, 0, 0, 0.16)',
        'glow-ocobo': '0 0 20px rgba(231, 76, 124, 0.3)',      // Rosa ocobo
        'glow-forest': '0 0 20px rgba(45, 108, 79, 0.3)',      // Verde bosque
        'glow-gold': '0 0 20px rgba(255, 176, 32, 0.3)',       // Dorado
        'glow-nature': '0 0 20px rgba(76, 175, 80, 0.3)',      // Verde naturaleza
        'glow-blossom': '0 0 20px rgba(248, 187, 217, 0.4)'    // Rosa pétalo
      }
    },
  },
  plugins: [],
}

import { useState, useEffect } from 'react';

interface UniversalProfileData {
  isConnected: boolean;
  address: string | null;
  name: string | null;
  avatar: string | null;
  isArchetypeHolder: boolean;
  archetypeCount: number;
}

export const useUniversalProfile = (): UniversalProfileData => {
  const [upData, setUpData] = useState<UniversalProfileData>({
    isConnected: false,
    address: null,
    name: null,
    avatar: null,
    isArchetypeHolder: false,
    archetypeCount: 0,
  });

  useEffect(() => {
    // Detectar si hay una wallet conectada
    const detectWallet = async () => {
      try {
        console.log('Starting Universal Profile detection...');
        
        // Verificar si hay la extensión específica de Universal Profiles
        if (typeof window !== 'undefined' && (window as any).lukso) {
          console.log('Universal Profile extension found');
          
          const lukso = (window as any).lukso;
          
          // Verificar si está conectado
          if (lukso.isConnected && lukso.isConnected()) {
            console.log('Universal Profile is connected');
            
            const accounts = await lukso.request({ method: 'eth_accounts' });
            console.log('UP accounts found:', accounts);
            
            if (accounts.length > 0) {
              const address = accounts[0];
              console.log('Primary UP address:', address);
              
              // Obtener datos básicos de la UP
              const upInfo = await getUniversalProfileInfo(address);
              
              setUpData({
                isConnected: true,
                address: address,
                name: upInfo.name,
                avatar: upInfo.avatar,
                isArchetypeHolder: upInfo.isArchetypeHolder,
                archetypeCount: upInfo.archetypeCount,
              });
              
              console.log('UP data set:', {
                isConnected: true,
                address: address,
                name: upInfo.name,
                isArchetypeHolder: upInfo.isArchetypeHolder,
                archetypeCount: upInfo.archetypeCount,
              });
            } else {
              console.log('No UP accounts connected');
            }
          } else {
            console.log('Universal Profile extension not connected');
          }
        } else {
          console.log('Universal Profile extension not found');
        }
      } catch (error) {
        console.log('Universal Profile detection error:', error);
        // Mantener estado por defecto (no conectado)
      }
    };

    detectWallet();

    // Escuchar cambios en la cuenta
    if (typeof window !== 'undefined' && (window as any).lukso) {
      const lukso = (window as any).lukso;
      
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('UP accounts changed:', accounts);
        if (accounts.length === 0) {
          setUpData({
            isConnected: false,
            address: null,
            name: null,
            avatar: null,
            isArchetypeHolder: false,
            archetypeCount: 0,
          });
        } else {
          detectWallet();
        }
      };

      lukso.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (lukso.removeListener) {
          lukso.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  return upData;
};


// Función para obtener información básica de la Universal Profile
const getUniversalProfileInfo = async (address: string) => {
  try {
    console.log('Getting UP info for address:', address);
    
    // Detectar si es una dirección de Universal Profile
    // Las UP tienen un formato específico y pueden tener metadata
    const isLikelyUP = address.length === 42 && address.startsWith('0x');
    
    if (isLikelyUP) {
      // Simular datos más realistas basados en la dirección
      const addressSuffix = address.slice(-4);
      const isArchetypeHolder = Math.random() > 0.5; // 50% chance de ser holder
      const archetypeCount = isArchetypeHolder ? Math.floor(Math.random() * 10) + 1 : 0;
      
      const upInfo = {
        name: `UP_${addressSuffix}`,
        avatar: null,
        isArchetypeHolder: isArchetypeHolder,
        archetypeCount: archetypeCount,
      };
      
      console.log('Generated UP info:', upInfo);
      return upInfo;
    }
    
    return {
      name: null,
      avatar: null,
      isArchetypeHolder: false,
      archetypeCount: 0,
    };
  } catch (error) {
    console.log('Error getting UP info:', error);
    return {
      name: null,
      avatar: null,
      isArchetypeHolder: false,
      archetypeCount: 0,
    };
  }
};

// Extender el tipo Window para incluir la extensión de Universal Profiles
declare global {
  interface Window {
    lukso?: {
      isConnected: () => boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

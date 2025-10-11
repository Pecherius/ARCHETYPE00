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
        // Verificar si hay window.ethereum (MetaMask, Universal Profiles, etc.)
        if (typeof window !== 'undefined' && window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          
          if (accounts.length > 0) {
            const address = accounts[0];
            
            // Detectar si es una Universal Profile (LUKSO)
            const isLUKSO = await detectLUKSONetwork();
            
            if (isLUKSO) {
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
            } else {
              // Wallet conectada pero no es LUKSO
              setUpData({
                isConnected: true,
                address: address,
                name: null,
                avatar: null,
                isArchetypeHolder: false,
                archetypeCount: 0,
              });
            }
          }
        }
      } catch (error) {
        console.log('No wallet detected or error:', error);
        // Mantener estado por defecto (no conectado)
      }
    };

    detectWallet();

    // Escuchar cambios en la cuenta
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
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

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  return upData;
};

// Función para detectar si estamos en la red LUKSO
const detectLUKSONetwork = async (): Promise<boolean> => {
  try {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      // LUKSO Testnet: 0x1a, LUKSO Mainnet: 0x2a
      return chainId === '0x1a' || chainId === '0x2a';
    }
    return false;
  } catch {
    return false;
  }
};

// Función para obtener información básica de la Universal Profile
const getUniversalProfileInfo = async (address: string) => {
  try {
    // Por ahora, simular datos básicos
    // En una implementación real, harías queries a la blockchain
    return {
      name: `UP_${address.slice(2, 8)}`, // Nombre simulado
      avatar: null,
      isArchetypeHolder: Math.random() > 0.7, // Simular si es holder (30% chance)
      archetypeCount: Math.floor(Math.random() * 5), // Simular cantidad (0-4)
    };
  } catch {
    return {
      name: null,
      avatar: null,
      isArchetypeHolder: false,
      archetypeCount: 0,
    };
  }
};

// Extender el tipo Window para incluir ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

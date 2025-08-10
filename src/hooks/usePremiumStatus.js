// Hook para verificar status premium do usuário
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfigFront';

export const usePremiumStatus = () => {
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [premiumFeatures, setPremiumFeatures] = useState({
    // Recursos premium disponíveis
    multipleCards: false,
    atmosphereEffects: false,
    advancedAI: false,
    soundEffects: false,
    ritualPreparation: false,
    unlimitedReadings: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userRef = doc(db, "usuarios", currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            
            // Verificar status premium através de diferentes campos
            const isUserPremium = Boolean(
              userData.isPremium || 
              userData.subscription?.active || 
              userData.plano === 'premium' ||
              userData.premium === true ||
              userData.tier === 'premium'
            );
            
            setIsPremium(isUserPremium);
            
            // Definir recursos premium baseado no status
            if (isUserPremium) {
              setPremiumFeatures({
                multipleCards: true,
                atmosphereEffects: true,
                advancedAI: true,
                soundEffects: true,
                ritualPreparation: true,
                unlimitedReadings: true
              });
            } else {
              // Usuário gratuito - recursos limitados
              setPremiumFeatures({
                multipleCards: false,
                atmosphereEffects: false,
                advancedAI: false,
                soundEffects: false,
                ritualPreparation: false,
                unlimitedReadings: false
              });
            }
            
            console.log('👑 Premium Status Check:', {
              uid: currentUser.uid,
              isPremium: isUserPremium,
              userData: userData
            });
            
          } else {
            // Usuário novo - não premium
            setIsPremium(false);
            setPremiumFeatures({
              multipleCards: false,
              atmosphereEffects: false,
              advancedAI: false,
              soundEffects: false,
              ritualPreparation: false,
              unlimitedReadings: false
            });
          }
        } catch (error) {
          console.error('Erro ao verificar status premium:', error);
          setIsPremium(false);
        }
      } else {
        // Usuário não logado
        setIsPremium(false);
        setPremiumFeatures({
          multipleCards: false,
          atmosphereEffects: false,
          advancedAI: false,
          soundEffects: false,
          ritualPreparation: false,
          unlimitedReadings: false
        });
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Funções utilitárias
  const upgradeToPremium = () => {
    // Implementar redirecionamento para página de upgrade
    console.log('🚀 Redirecionando para upgrade premium...');
    // Aqui você pode integrar com sua lógica de pagamento
    alert('Funcionalidade de upgrade será implementada');
  };

  const checkFeatureAccess = (featureName) => {
    return premiumFeatures[featureName] || false;
  };

  return {
    user,
    isPremium,
    loading,
    premiumFeatures,
    upgradeToPremium,
    checkFeatureAccess
  };
};
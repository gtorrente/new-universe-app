import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../firebaseConfigFront";
import { doc, getDoc } from "firebase/firestore";

export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          console.log("🔐 Admin: Verificando permissões para:", firebaseUser.email);
          
          // Verificar se usuário é admin no Firestore
          const userRef = doc(db, "usuarios", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const adminStatus = userData.isAdmin || false;
            
            console.log("👑 Admin: Status de admin:", adminStatus);
            setIsAdmin(adminStatus);
          } else {
            console.log("❌ Admin: Usuário não encontrado no Firestore");
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("❌ Admin: Erro ao verificar permissões:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-gray-600">Verificando permissões...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-lg p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-6">
            Você não tem permissões de administrador para acessar esta área.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return children;
} 
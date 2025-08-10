// Script para criar categorias de receitas no Firebase
require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, getDocs } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Categorias de receitas da Catia Fonseca
const categorias = [
  {
    id: "caldos-sopas",
    titulo: "Caldos e Sopas",
    emoji: "🍲",
    imagem: "https://images.unsplash.com/photo-1613844237701-8f3664fc2eff?w=600&h=400&fit=crop",
    descricao: "Receitas quentinhas para aquecer o coração",
    premium: false,
    ordem: 1
  },
  {
    id: "basico-cozinha",
    titulo: "Básico na Cozinha",
    emoji: "🍳",
    imagem: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&h=400&fit=crop",
    descricao: "O essencial para quem está começando",
    premium: false,
    ordem: 2
  },
  {
    id: "doces-sobremesas",
    titulo: "Doces & Sobremesas",
    emoji: "🧁",
    imagem: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=400&fit=crop",
    descricao: "Delícias para adoçar o seu dia",
    premium: false,
    ordem: 3
  },
  {
    id: "massas-italianas",
    titulo: "Massas Italianas",
    emoji: "🍝",
    imagem: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop",
    descricao: "Sabores da Itália na sua mesa",
    premium: true,
    ordem: 4
  },
  {
    id: "pratos-especiais",
    titulo: "Pratos Especiais",
    emoji: "🍽️",
    imagem: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop",
    descricao: "Para ocasiões importantes e jantares românticos",
    premium: true,
    ordem: 5
  },
  {
    id: "lanches-petiscos",
    titulo: "Lanches & Petiscos",
    emoji: "🥪",
    imagem: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop",
    descricao: "Opções práticas para qualquer hora",
    premium: false,
    ordem: 6
  },
  {
    id: "bebidas-sucos",
    titulo: "Bebidas & Sucos",
    emoji: "🥤",
    imagem: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&h=400&fit=crop",
    descricao: "Refrescantes e nutritivos",
    premium: false,
    ordem: 7
  },
  {
    id: "receitas-familia",
    titulo: "Receitas de Família",
    emoji: "👵",
    imagem: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop",
    descricao: "Segredos passados de geração em geração",
    premium: true,
    ordem: 8
  }
];

async function criarCategorias() {
  try {
    console.log('🍳 Criando categorias de receitas no Firebase...');
    
    // Verificar se já existem categorias
    const querySnapshot = await getDocs(collection(db, 'categorias'));
    console.log(`📊 Categorias existentes: ${querySnapshot.docs.length}`);
    
    if (querySnapshot.docs.length > 0) {
      console.log('⚠️ Já existem categorias. Deseja sobrescrever? (Ctrl+C para cancelar)');
      // Aguarda 3 segundos para o usuário cancelar se quiser
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    console.log('📝 Criando categorias...');
    
    for (const categoria of categorias) {
      console.log(`  - Criando: ${categoria.titulo}`);
      
      await setDoc(doc(db, 'categorias', categoria.id), {
        titulo: categoria.titulo,
        emoji: categoria.emoji,
        imagem: categoria.imagem,
        descricao: categoria.descricao,
        premium: categoria.premium,
        ordem: categoria.ordem,
        criado_em: new Date(),
        ativo: true
      });
    }
    
    console.log('');
    console.log('✅ Categorias criadas com sucesso!');
    console.log(`📊 Total: ${categorias.length} categorias`);
    console.log('');
    
    // Verificar criação
    const novoSnapshot = await getDocs(collection(db, 'categorias'));
    console.log(`🔍 Verificação: ${novoSnapshot.docs.length} categorias encontradas no Firebase`);
    
    console.log('');
    console.log('📋 Categorias criadas:');
    novoSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.titulo} (${data.premium ? 'Premium' : 'Gratuita'})`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar categorias:', error);
  }
}

criarCategorias();
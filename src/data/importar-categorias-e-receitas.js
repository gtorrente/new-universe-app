// importar-categorias-e-receitas.js
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import categorias from './categorias.json' assert { type: 'json' };
import receitas from './receitas.json' assert { type: 'json' };

// Caminho para o arquivo baixado
import serviceAccount from './credencial.json' assert { type: 'json' };

initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

async function importarCategorias() {
  for (const cat of categorias) {
    await db.collection('categorias').doc(cat.id).set({
      titulo: cat.titulo,
      emoji: cat.emoji,
      imagem: cat.imagem,
      descricao: cat.descricao,
    });
    console.log('Categoria importada:', cat.titulo);
  }
}

async function importarReceitas() {
  for (const rec of receitas) {
    await db.collection('receitas').doc(rec.id).set({
      nome: rec.nome,
      imagem: rec.imagem,
      tempo: rec.tempo,
      dificuldade: rec.dificuldade,
      ingredientes: rec.ingredientes,
      preparo: rec.preparo,
      dica: rec.dica,
      categoriaId: rec.categoriaId,
      premium: rec.premium,
    });
    console.log('Receita importada:', rec.nome);
  }
}

async function main() {
  await importarCategorias();
  await importarReceitas();
  console.log('Importação finalizada!');
}

main();
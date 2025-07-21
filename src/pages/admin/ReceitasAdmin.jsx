import { useState, useEffect } from 'react';
import { storage, db } from '../../firebaseConfigFront';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9]+/g, '-') // troca não letras/números por hífen
    .replace(/(^-|-$)+/g, ''); // remove hífens do início/fim
}

export default function ReceitasAdmin() {
  const [receitas, setReceitas] = useState([]);
  const [form, setForm] = useState({
    nome: '', imagem: '', tempo: '', dificuldade: '', categoria: '', ingredientes: [''], preparo: [''], dica: '', premium: false
  });
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const [editId, setEditId] = useState(null);
  const [editDocId, setEditDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState([]);

  // Carregar receitas do Firestore ao abrir
  useEffect(() => {
    async function fetchReceitas() {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'receitas'));
      const data = querySnapshot.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
      setReceitas(data);
      setLoading(false);
    }
    fetchReceitas();
  }, []);

  // Buscar categorias do Firestore
  useEffect(() => {
    async function fetchCategorias() {
      const querySnapshot = await getDocs(collection(db, 'categorias'));
      const data = querySnapshot.docs.map(doc => doc.id); // ou doc.data() se quiser mais info
      setCategorias(data);
    }
    fetchCategorias();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleIngredienteChange(idx, value) {
    const ingredientes = [...form.ingredientes];
    ingredientes[idx] = value;
    setForm({ ...form, ingredientes });
  }

  function handlePreparoChange(idx, value) {
    const preparo = [...form.preparo];
    preparo[idx] = value;
    setForm({ ...form, preparo });
  }

  function addIngrediente() {
    setForm({ ...form, ingredientes: [...form.ingredientes, ''] });
  }
  function addPreparo() {
    setForm({ ...form, preparo: [...form.preparo, ''] });
  }

  function removeIngrediente(idx) {
    const ingredientes = form.ingredientes.filter((_, i) => i !== idx);
    setForm({ ...form, ingredientes });
  }
  function removePreparo(idx) {
    const preparo = form.preparo.filter((_, i) => i !== idx);
    setForm({ ...form, preparo });
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setPreview(URL.createObjectURL(file));
    const id = slugify(form.nome || 'receita');
    const storageRef = ref(storage, `receitas/${id}-${Date.now()}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setForm(f => ({ ...f, imagem: url }));
    setUploading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome.trim()) {
      alert('Preencha o nome da receita!');
      return;
    }
    console.log('Nome da receita:', form.nome);
    let id = slugify(form.nome);
    if (!id) {
      id = `receita-${Date.now()}`;
      console.warn('Slug vazio, usando alternativo:', id);
    }
    console.log('Slug gerado:', id);
    const receitaData = { ...form, id, categoriaId: form.categoria, premium: !!form.premium };
    delete receitaData.categoria;
    if (editDocId) {
      // Editar receita existente
      const receitaRef = doc(db, 'receitas', editDocId);
      await updateDoc(receitaRef, receitaData);
      setReceitas(receitas.map(r => r._docId === editDocId ? { ...receitaData, _docId: editDocId } : r));
      setEditId(null);
      setEditDocId(null);
      setForm({ nome: '', imagem: '', tempo: '', dificuldade: '', categoria: '', ingredientes: [''], preparo: [''], dica: '', premium: false });
      setPreview('');
    } else {
      // Adicionar nova receita
      const docRef = await addDoc(collection(db, 'receitas'), receitaData);
      setReceitas([...receitas, { ...receitaData, _docId: docRef.id }]);
      setForm({ nome: '', imagem: '', tempo: '', dificuldade: '', categoria: '', ingredientes: [''], preparo: [''], dica: '', premium: false });
      setPreview('');
    }
  }

  function handleEdit(r) {
    setForm({
      nome: r.nome,
      imagem: r.imagem,
      tempo: r.tempo,
      dificuldade: r.dificuldade,
      categoria: r.categoriaId || r.categoria || '',
      ingredientes: [...r.ingredientes],
      preparo: [...r.preparo],
      dica: r.dica || '',
      premium: !!(r.premium)
    });
    setPreview(r.imagem);
    setEditId(r._docId);
    setEditDocId(r._docId);
  }

  async function handleDelete(id, docId) {
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      await deleteDoc(doc(db, 'receitas', docId));
      setReceitas(receitas.filter(r => r._docId !== docId));
      if (editId === id) {
        setEditId(null);
        setEditDocId(null);
        setForm({ nome: '', imagem: '', tempo: '', dificuldade: '', categoria: '', ingredientes: [''], preparo: [''], dica: '', premium: false });
        setPreview('');
      }
    }
  }

  // Filtrar receitas por nome e categoria
  const receitasFiltradas = receitas.filter(r => {
    const nomeMatch = r.nome ? r.nome.toLowerCase().includes(busca.toLowerCase()) : false;
    // Corrigir filtro: comparar categoriaFiltro com r.categoriaId (preferencialmente) ou r.categoria
    const categoriaMatch = categoriaFiltro ? (r.categoriaId === categoriaFiltro || r.categoria === categoriaFiltro) : true;
    return nomeMatch && categoriaMatch;
  });

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Painel Admin - Cadastro de Receitas</h1>
      <form onSubmit={handleSubmit} className={`space-y-4 bg-white rounded-xl shadow p-6 mb-8 ${editDocId ? 'border-2 border-yellow-400' : ''}`}>
        <div>
          <label className="block font-semibold mb-1">Nome da receita</label>
          <input name="nome" value={form.nome} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Imagem da receita</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-2" />
          {uploading && <span className="text-xs text-purple-600">Enviando imagem...</span>}
          {preview && <img src={preview} alt="Preview" className="w-full max-h-48 object-cover rounded-xl mt-2" />}
          {form.imagem && !preview && <img src={form.imagem} alt="Preview" className="w-full max-h-48 object-cover rounded-xl mt-2" />}
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-semibold mb-1">Tempo</label>
            <input name="tempo" value={form.tempo} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex-1">
            <label className="block font-semibold mb-1">Dificuldade</label>
            <input name="dificuldade" value={form.dificuldade} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1">Categoria</label>
          <select name="categoria" value={form.categoria} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="">Selecione uma categoria</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Ingredientes</label>
          {form.ingredientes.map((ing, idx) => (
            <div key={`ingrediente-${idx}`} className="flex gap-2 mb-1">
              <input value={ing} onChange={e => handleIngredienteChange(idx, e.target.value)} className="flex-1 border rounded px-3 py-2" required />
              {form.ingredientes.length > 1 && (
                <button type="button" onClick={() => removeIngrediente(idx)} className="text-red-500">Remover</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addIngrediente} className="text-purple-600 mt-1">+ Adicionar ingrediente</button>
        </div>
        <div>
          <label className="block font-semibold mb-1">Modo de Preparo</label>
          {form.preparo.map((step, idx) => (
            <div key={`preparo-${idx}`} className="flex gap-2 mb-1">
              <input value={step} onChange={e => handlePreparoChange(idx, e.target.value)} className="flex-1 border rounded px-3 py-2" required />
              {form.preparo.length > 1 && (
                <button type="button" onClick={() => removePreparo(idx)} className="text-red-500">Remover</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addPreparo} className="text-purple-600 mt-1">+ Adicionar passo</button>
        </div>
        <div>
          <label className="block font-semibold mb-1">Dica da Catia</label>
          <input name="dica" value={form.dica} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="flex items-center gap-2 font-semibold mb-1">
            <input
              type="checkbox"
              name="premium"
              checked={!!form.premium}
              onChange={e => setForm({ ...form, premium: e.target.checked })}
              className="form-checkbox h-5 w-5 text-purple-600"
            />
            Receita Premium
          </label>
        </div>
        <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded font-bold hover:bg-purple-700" disabled={loading}>
          {editDocId ? 'Salvar Alterações' : 'Cadastrar Receita'}
        </button>
        {editDocId && (
          <button type="button" className="ml-4 text-gray-500 underline" onClick={() => { setEditId(null); setEditDocId(null); setForm({ nome: '', imagem: '', tempo: '', dificuldade: '', categoria: '', ingredientes: [''], preparo: [''], dica: '', premium: false }); setPreview(''); }}>
            Cancelar edição
          </button>
        )}
      </form>
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <select
          value={categoriaFiltro}
          onChange={e => setCategoriaFiltro(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        >
          <option value="">Todas as categorias</option>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <h2 className="text-xl font-bold mb-2">Receitas cadastradas</h2>
      {loading ? <div className="text-center py-8 text-purple-600">Carregando receitas...</div> : (
      <ul className="space-y-4">
        {receitasFiltradas.map(r => (
          <li key={r.id} className="bg-gray-50 rounded-lg p-4 shadow flex flex-col gap-1">
            <span className="font-bold">{r.nome}</span>
            <span className="text-xs text-gray-500">Slug: {r.id}</span>
            <span className="text-xs text-gray-500">Categoria: {r.categoria || '-'}</span>
            <span className="text-xs text-gray-500">Tempo: {r.tempo} | Dificuldade: {r.dificuldade}</span>
            <span className="text-xs text-gray-500">Ingredientes: {Array.isArray(r.ingredientes) ? r.ingredientes.join(', ') : ''}</span>
            <span className="text-xs text-gray-500">Preparo: {Array.isArray(r.preparo) ? r.preparo.join(' | ') : ''}</span>
            <span className="text-xs text-gray-500">Dica: {r.dica}</span>
            {r.imagem && <img src={r.imagem} alt={r.nome} className="w-full max-h-32 object-cover rounded mt-2" />}
            <div className="flex gap-2 mt-2">
              <button className="text-blue-600 underline" onClick={() => handleEdit(r)}>Editar</button>
              <button className="text-red-600 underline" onClick={() => handleDelete(r.id, r._docId)}>Excluir</button>
            </div>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
} 
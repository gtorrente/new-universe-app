# 🔧 COMO DESATIVAR O MOCK DE HORÓSCOPO

## ⚠️ **MOCK TEMPORÁRIO ATIVO**
Atualmente o sistema está usando um mock temporário para horóscopo porque `api.torrente.com.br` está fora do ar.

## 🚀 **QUANDO A API VOLTAR A FUNCIONAR:**

### **1️⃣ Deletar arquivo do mock:**
```bash
rm src/services/horoscopoMock.js
```

### **2️⃣ Remover imports nas páginas:**

#### **Home.jsx (linha ~30):**
```javascript
// REMOVER esta linha:
import horoscopoMock from '../services/horoscopoMock';
```

#### **PrevisaoSemanal.jsx (linha ~6):**
```javascript
// REMOVER esta linha:
import horoscopoMock from "../services/horoscopoMock";
```

### **3️⃣ Remover código mock nos catch blocks:**

#### **Home.jsx (linhas ~170-185):**
```javascript
// REMOVER todo este bloco e deixar só:
} catch (err) {
  console.error("Erro ao buscar horóscopo diário:", err);
  setError("Não foi possível carregar o horóscopo hoje.");
  setHoroscopo("Horóscopo temporariamente indisponível.");
} finally {
  setLoading(false);
}
```

#### **PrevisaoSemanal.jsx (linhas ~255-275):**
```javascript
// REMOVER todo este bloco e deixar só:
} catch (err) {
  console.error("Erro ao buscar horóscopo semanal:", err);
  setError("Não foi possível carregar a previsão semanal. Tente novamente.");
} finally {
  setLoading(false);
}
```

### **4️⃣ Testar a API:**
```bash
curl -X POST https://api.torrente.com.br/horoscopo \
  -H "Content-Type: application/json" \
  -d '{"sign":"aries"}'
```

### **5️⃣ Recompilar:**
```bash
npm run build
```

## 🎯 **LOGS PARA IDENTIFICAR:**

### **Quando mock está ativo:**
```
🔄 API fora do ar - Usando horóscopo mock temporário
✅ Horóscopo mock carregado com sucesso (temporário)
⚠️ USANDO MOCK TEMPORÁRIO - API fora do ar
```

### **Quando API real funciona:**
```
🌐 Horóscopo: Usando API URL: https://api.torrente.com.br
🌐 Horóscopo carregado da API e salvo no cache
```

## 📋 **CHECKLIST DE REMOÇÃO:**
- [ ] Deletar `src/services/horoscopoMock.js`
- [ ] Remover import em `Home.jsx`
- [ ] Remover import em `PrevisaoSemanal.jsx`
- [ ] Limpar catch block em `Home.jsx`
- [ ] Limpar catch block em `PrevisaoSemanal.jsx`
- [ ] Testar API funcionando
- [ ] Recompilar projeto
- [ ] Verificar logs no console

**Depois da remoção, o sistema voltará a usar apenas a API real!** 🚀 
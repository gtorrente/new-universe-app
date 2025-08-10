# 🔄 COMO REVERTER O SISTEMA PREMIUM

## 📋 **QUANDO QUISER RESTAURAR O SISTEMA NORMAL:**

### **No arquivo `src/hooks/usePremiumStatus.js`, linha 35:**

```javascript
// ❌ REMOVER ESTA LINHA:
const isUserPremium = true; // ← TODOS USUÁRIOS SÃO PREMIUM AGORA

// ✅ DESCOMENTAR ESTAS LINHAS:
const isUserPremium = Boolean(
  userData.isPremium || 
  userData.subscription?.active || 
  userData.plano === 'premium' ||
  userData.premium === true ||
  userData.tier === 'premium'
);
```

## 🎯 **RESULTADO:**
- Voltará ao sistema freemium normal
- Usuários sem premium → Tarot básico
- Usuários com premium → Tarot completo
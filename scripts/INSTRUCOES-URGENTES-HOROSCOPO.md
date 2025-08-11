# 🚨 INSTRUÇÕES URGENTES - Horóscopo do Dia

## 🔍 Problema
O horóscopo do dia não está aparecendo porque:
- ✅ OpenAI está gerando os textos corretamente
- ❌ Firebase está bloqueando a gravação (PERMISSION_DENIED)

## 🛠️ SOLUÇÃO RÁPIDA (2 minutos)

### 1. Abrir Firebase Console
1. Acesse: https://console.firebase.google.com
2. Projeto: `tarot-universo-catia`
3. Clique em "Firestore Database"
4. Clique em "Rules"

### 2. Substituir as Regras
Substitua TODAS as regras existentes por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // TEMPORÁRIO: Permissões abertas para horóscopo
    match /horoscopo_diario/{document=**} {
      allow read, write: if true;
    }
    
    match /horoscopos_diarios/{document=**} {
      allow read, write: if true;
    }
    
    // Suas regras existentes (manter todas as outras)
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read, write: if isAdmin();
    }
    
    match /conversas_catia/{conversationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow read, write: if isAdmin();
    }
    
    match /chats/{conversationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow read, write: if isAdmin();
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null && request.auth.uid == get(/databases/$(database)/documents/chats/$(conversationId)).data.userId;
        allow read, write: if isAdmin();
      }
    }
    
    match /categorias/{document} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    match /notificacoes/{document} {
      allow read: if request.auth != null;
      allow update: if request.auth != null;
      allow write, create, delete: if isAdmin();
    }
    
    match /usuarios/{uid}/notificacoes_ocultas/{notificacaoId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    match /mapas_astrais/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read, write: if isAdmin();
    }
    
    match /horoscopos_semanais/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    function isAdmin() {
      return request.auth != null && 
             request.auth.uid != null &&
             get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

### 3. Publicar as Regras
1. Clique em "Publish"
2. Confirme

### 4. Gerar Horóscopo
```bash
cd scripts
node gerar-horoscopo-diario.js gerar --target=2025-08-10
```

## 🎯 Resultado Esperado
- ✅ Horóscopo será salvo no Firebase
- ✅ Aparecerá na página Home do app
- ✅ Todos os 12 signos terão horóscopo do dia

## ⚠️ Observação
As regras acima abrem temporariamente as permissões para horóscopo. Depois que funcionar, podemos refinar as permissões.

## 🔄 Se ainda não funcionar
Execute novamente:
```bash
node gerar-horoscopo-diario.js gerar --force --target=2025-08-10
```
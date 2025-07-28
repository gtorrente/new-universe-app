# 🔧 TROUBLESHOOTING: NODE-RED MERCADO PAGO

## 🚨 **PROBLEMA IDENTIFICADO**
O endpoint está retornando **504 Gateway Time-out**, indicando que o Node-RED não está processando as requisições corretamente.

## 🔍 **DIAGNÓSTICO PASSO A PASSO**

### **1️⃣ VERIFICAR SE O FLOW ESTÁ ATIVO**

1. **Acesse o Node-RED:** `http://api.torrente.com.br:1880`
2. **Verifique se os flows estão ativos** (botão "Deploy" pressionado)
3. **Procure por erros** nos logs do Node-RED

### **2️⃣ VERIFICAR CONFIGURAÇÃO DO NGINX**

O nginx precisa estar configurado para redirecionar `/api/mercado-pago/*` para o Node-RED.

**Verificar configuração atual:**
```bash
# SSH na AWS
ssh -i sua-chave.pem ubuntu@api.torrente.com.br

# Verificar configuração do nginx
sudo cat /etc/nginx/sites-available/default
```

**Configuração necessária no nginx:**
```nginx
server {
    listen 80;
    server_name api.torrente.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.torrente.com.br;
    
    # SSL config...
    
    # Redirecionar API para Node-RED
    location /api/mercado-pago/ {
        proxy_pass http://localhost:1880;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Outras rotas...
}
```

### **3️⃣ VERIFICAR SE O FLOW ESTÁ CORRETO**

**Estrutura necessária no Node-RED:**

```
HTTP IN → Function → HTTP RESPONSE
```

**HTTP IN node:**
- Method: `POST`
- URL: `/api/mercado-pago/create-preference`
- **IMPORTANTE:** Deve estar conectado a um Function node

**Function node:**
- Deve conter o código JavaScript fornecido
- **IMPORTANTE:** Deve retornar `msg`

**HTTP RESPONSE node:**
- Status Code: `200` (ou `msg.statusCode`)
- **IMPORTANTE:** Deve estar conectado ao Function node

### **4️⃣ TESTAR LOCALMENTE NO NODE-RED**

1. **Acesse:** `http://api.torrente.com.br:1880`
2. **Vá em:** Menu (☰) > Import
3. **Cole este JSON de teste:**
```json
[
    {
        "id": "test-flow",
        "type": "tab",
        "label": "Test Flow",
        "nodes": [
            {
                "id": "http-in",
                "type": "http in",
                "z": "test-flow",
                "name": "Test",
                "url": "/test",
                "method": "POST",
                "tls": "",
                "x": 120,
                "y": 100
            },
            {
                "id": "function",
                "type": "function",
                "z": "test-flow",
                "name": "Echo",
                "func": "msg.payload = { received: true, data: msg.payload };\nreturn msg;",
                "x": 300,
                "y": 100
            },
            {
                "id": "http-response",
                "type": "http response",
                "z": "test-flow",
                "name": "",
                "statusCode": "200",
                "x": 480,
                "y": 100
            }
        ]
    }
]
```

4. **Deploy o flow**
5. **Teste:** `curl -X POST http://api.torrente.com.br:1880/test -H "Content-Type: application/json" -d '{"test":"data"}'`

### **5️⃣ VERIFICAR LOGS DO NODE-RED**

1. **No Node-RED:** Menu (☰) > View > Debug
2. **Adicione debug nodes** nos flows
3. **Verifique logs do sistema:**
```bash
# SSH na AWS
sudo journalctl -u nodered -f
```

### **6️⃣ VERIFICAR DEPENDÊNCIAS**

```bash
# SSH na AWS
cd ~/.node-red
npm list mercadopago
```

Se não estiver instalado:
```bash
npm install mercadopago
sudo systemctl restart nodered
```

## 🎯 **SOLUÇÃO RÁPIDA**

### **OPÇÃO 1: VERIFICAR NGINX (MAIS PROVÁVEL)**
```bash
# SSH na AWS
sudo nano /etc/nginx/sites-available/default

# Adicionar location block para /api/mercado-pago/
location /api/mercado-pago/ {
    proxy_pass http://localhost:1880;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 300s;
}

# Testar configuração
sudo nginx -t

# Reiniciar nginx
sudo systemctl restart nginx
```

### **OPÇÃO 2: TESTAR DIRETO NO NODE-RED**
```bash
# Testar se Node-RED responde
curl -X POST http://localhost:1880/api/mercado-pago/create-preference \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

## 📞 **PRÓXIMOS PASSOS**

1. **Verifique se o flow está ativo** no Node-RED
2. **Confirme a configuração do nginx**
3. **Teste o flow de teste** fornecido
4. **Verifique os logs** do Node-RED

**Me informe o resultado de cada passo para continuarmos o diagnóstico!** 🔧 
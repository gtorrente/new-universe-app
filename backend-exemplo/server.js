// Servidor Backend de exemplo para Mercado Pago
// Execute com: node server.js
// Instale as dependências: npm install express cors mercadopago firebase-admin

const express = require('express');
const cors = require('cors');
const { DateTime } = require('luxon');
const swe = require('swisseph');
// Fallback rápido para ASC/casas usando astronomia simples
function deg2rad(d){return d*Math.PI/180}
function rad2deg(r){return r*180/Math.PI}
function normalize360(x){let v=x%360; if(v<0) v+=360; return v}
function computeAscEqualHouses(utc, latDeg, lonDeg){
  // LST (aprox) em graus
  const jd = swe.swe_julday(utc.year, utc.month, utc.day, utc.hour + utc.minute/60 + utc.second/3600, swe.SE_GREG_CAL);
  const stHours = swe.swe_sidtime(jd); // horas
  const lstDeg = normalize360(stHours*15 + lonDeg);
  const eps = deg2rad(23.4397);
  const phi = deg2rad(latDeg);
  const theta = deg2rad(lstDeg);
  const ascRad = Math.atan2(-Math.cos(theta), Math.sin(theta)*Math.cos(eps) + Math.tan(phi)*Math.sin(eps));
  const ascDeg = normalize360(rad2deg(ascRad));
  const cusps = Array.from({length:12}, (_,i)=> normalize360(ascDeg + i*30));
  return { ascDeg, cusps };
}

// Promisify helpers para API callback-based do swisseph
function sweHouses(jdut, lat, lon, hsys) {
  return new Promise((resolve, reject) => {
    try {
      swe.swe_houses(jdut, lat, lon, hsys, (res) => {
        if (!res || !res.cusps) return reject(new Error('swe_houses: retorno inválido'));
        resolve(res);
      });
    } catch (e) { reject(e); }
  });
}

function sweCalcUt(jdut, body, flags) {
  return new Promise((resolve, reject) => {
    try {
      swe.swe_calc_ut(jdut, body, flags, (res) => {
        if (!res || typeof res.longitude !== 'number') return reject(new Error('swe_calc_ut: retorno inválido'));
        resolve(res);
      });
    } catch (e) { reject(e); }
  });
}

function sweHousesEx2(armc, lat, eps, hsys) {
  return new Promise((resolve, reject) => {
    try {
      if (typeof swe.swe_houses_ex2 !== 'function') return reject(new Error('swe_houses_ex2 não disponível'));
      swe.swe_houses_ex2(armc, lat, eps, hsys, (res) => {
        if (!res || !res.cusps) return reject(new Error('swe_houses_ex2: retorno inválido'));
        resolve(res);
      });
    } catch (e) { reject(e); }
  });
}
const { MercadoPagoConfig, Payment, Preference } = require('mercadopago');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do Mercado Pago com suas credenciais REAIS
const client = new MercadoPagoConfig({
 // accessToken: 'APP_USR-5236189943574221-031723-12016251c249e02b0836c2c14a624eec-47637780',
  accessToken: 'TEST-6756611187520583-072523-4c3229768706ed16219da6958c53f4c4-47637780',
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

const payment = new Payment(client);
const preference = new Preference(client);

// Middleware
app.use(cors());
app.use(express.json());
// === ASTROLOGY ENDPOINT (Swiss Ephemeris via Flatlib) ===
// POST /api/astrology/natal
// { dateISO: '1992-09-28T21:10:00', timezone: 'America/Sao_Paulo', latitude: -23.5505, longitude: -46.6333, houseSystem: 'placidus' }
app.post('/api/astrology/natal', async (req, res) => {
  try {
    const { dateISO, timezone = 'UTC', latitude, longitude, houseSystem = 'placidus' } = req.body || {};
    if (!dateISO || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios: dateISO, latitude, longitude' });
    }

    // Converte hora local (IANA) para UTC com Luxon
    console.log('🛰️  [ASTRO] Payload recebido:', req.body);
    const local = DateTime.fromISO(dateISO, { zone: timezone });
    if (!local.isValid) {
      return res.status(400).json({ error: 'Data/hora inválidas' });
    }
    const utc = local.toUTC();
    console.log('🕒  [ASTRO] Local:', local.toISO());
    console.log('🕒  [ASTRO] UTC  :', utc.toISO());

    // Config Swisseph – usar moshier para não depender de arquivos .se1/.se2
    swe.swe_set_ephe_path('.');
    const FLG = swe.SEFLG_MOSEPH | swe.SEFLG_SPEED; // MOSEPH dispensa arquivos externos

    // Converte UTC para juliano (UT)
    const jdut = swe.swe_julday(utc.year, utc.month, utc.day, utc.hour + utc.minute / 60 + utc.second / 3600, swe.SE_GREG_CAL);
    // DeltaT melhora precisão de casas
    const deltat = swe.swe_deltat(jdut);

    // Casas Plácidus
    const hsys = (houseSystem && houseSystem[0])?.toUpperCase() || 'P';
    let housesRes;
    try {
      housesRes = await sweHouses(jdut, latitude, longitude, hsys);
    } catch (e) {
      // fallback: calcular ARMC e obliquidade e usar swe_houses_ex2
      try {
        const st = swe.swe_sidtime(jdut); // sideral time em horas
        const armc = (st * 15 + longitude + 360) % 360;
        const epsRes = swe.swe_calc_ut(jdut, swe.SE_ECL_NUT, 0);
        const eps = epsRes?.eps || 23.4397;
        console.log('🧭 [ASTRO] Fallback houses_ex2 armc=', armc.toFixed(4), 'eps=', eps);
        housesRes = await sweHousesEx2(armc, latitude, eps, hsys);
      } catch(err){
        console.log('🧭 [ASTRO] Fallback final: Equal Houses via LST');
        const eq = computeAscEqualHouses(utc, latitude, longitude);
        housesRes = { cusps: [null, ...eq.cusps], ascmc: [eq.ascDeg] };
      }
    }
    // Estrutura defensiva: algumas versões retornam 0-based, outras 1-based
    const cuspsRaw = housesRes?.cusps || housesRes?.cusp || housesRes?.houses || [];
    const ascmc = housesRes?.ascmc || [];
    const cuspIsOneBased = Number.isFinite(cuspsRaw[1]);
    const getCusp = (i) => cuspIsOneBased ? cuspsRaw[i] : cuspsRaw[i - 1];
    // Preferimos o ASC pelo ascmc[0] (mais confiável); se ausente, usamos cúspide 1
    const ascDeg = Number.isFinite(ascmc?.[0]) ? ascmc[0] : (Number.isFinite(getCusp(1)) ? getCusp(1) : 0);
    console.log('📈  [ASTRO] JD(UT):', jdut, 'ΔT:', swe.swe_deltat(jdut));
    console.log('🏠  [ASTRO] Cusps raw:', JSON.stringify(cuspsRaw));
    console.log('🏷️  [ASTRO] ascmc   :', JSON.stringify(ascmc));
    console.log('⬆️  [ASTRO] ASC deg :', ascDeg);

    // Helper: mapear grau -> signo
    const signNames = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
    const toSign = (deg) => signNames[Math.floor(((deg % 360)+360)%360 / 30)];

    const casas = Array.from({ length: 12 }, (_, i) => {
      const deg = getCusp(i + 1);
      const safeDeg = Number.isFinite(deg) ? deg : 0;
      return { numero: i + 1, signo: toSign(safeDeg), grau: Number((safeDeg % 30).toFixed(2)) };
    });

    // Planetas
    const BODY_CONSTS = [
      swe.SE_SUN,
      swe.SE_MOON,
      swe.SE_MERCURY,
      swe.SE_VENUS,
      swe.SE_MARS,
      swe.SE_JUPITER,
      swe.SE_SATURN,
      swe.SE_URANUS,
      swe.SE_NEPTUNE,
      swe.SE_PLUTO,
    ];
    const BODY_NAMES = ['Sol','Lua','Mercúrio','Vênus','Marte','Júpiter','Saturno','Urano','Netuno','Plutão'];

    // Obliquidade
    // Obliquidade aproximada (evita chamada complexa)
    const eps = 23.4397;

    // ARMC necessário para house_pos (pego do retorno ascmc; índice 2 costuma ser ARMC)
    const armc = ascmc?.[2] ?? ascmc?.[1] ?? ascmc?.[0] ?? 0;

    const planetas = await Promise.all(BODY_CONSTS.map(async (B, idx) => {
      const r = await sweCalcUt(jdut, B, FLG);
      const lon = r.longitude;
      const lat = r.latitude || 0;

      // Determina casa: tenta house_pos, senão intervalo entre cúspides (normalizado)
      let casa = 0;
      try {
        if (typeof swe.swe_house_pos === 'function') {
          const hp = swe.swe_house_pos(armc, latitude, eps, hsys, lon, lat);
          // swe_house_pos retorna valor real; arredonda para 1..12
          casa = Math.round(hp);
          console.log(`🪐 [ASTRO] ${BODY_NAMES[idx]} lon=${lon.toFixed(2)} hp=${hp.toFixed ? hp.toFixed(3) : hp} casa=${casa}`);
        }
      } catch (_) {}

      if (!casa || Number.isNaN(casa)) {
        const lonNorm = ((lon % 360) + 360) % 360;
        for (let i = 1; i <= 12; i++) {
          const a = getCusp(i);
          const bRaw = i === 12 ? getCusp(1) + 360 : getCusp(i + 1);
          const aN = ((a % 360) + 360) % 360;
          const bN = ((bRaw % 360) + 360) % 360;
          const inSeg = aN < bN ? (lonNorm >= aN && lonNorm < bN) : (lonNorm >= aN || lonNorm < bN);
        if (inSeg) { casa = i; break; }
        }
        if (!casa) casa = 1;
      console.log(`🪐 [ASTRO] ${BODY_NAMES[idx]} lon=${lon.toFixed(2)} casa(fallback)=${casa}`);
      }
      return {
        nome: BODY_NAMES[idx],
        signo: toSign(lon),
        grau: Number((lon % 30).toFixed(2)),
        casa: Number(casa),
      };
    }));

    const payload = {
      ascendente: { signo: toSign(ascDeg), grau: Number((ascDeg % 30).toFixed(2)) },
      casas,
      planetas,
    };
    console.log('✅  [ASTRO] ASC:', payload.ascendente, ' | Casas[1]:', payload.casas[0]);
    console.log('✅  [ASTRO] Planetas:', JSON.stringify(payload.planetas.map(p => ({ n: p.nome, s: p.signo, g: p.grau, c: p.casa }))))

    res.json(payload);
  } catch (err) {
    console.error('Erro no cálculo do mapa astral:', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});


// Rota para criar preference de pagamento
app.post('/api/mercado-pago/create-preference', async (req, res) => {
  try {
    console.log('📦 Recebendo dados:', req.body);
    const { items, payer, metadata, notification_url, back_urls } = req.body;

    // Validar back_urls (exigir HTTPS em produção; evitar localhost)
    const successUrl = back_urls?.success;
    const isHttps = typeof successUrl === 'string' && successUrl.startsWith('https://');
    const isLocalhost = typeof successUrl === 'string' && /localhost|127\.0\.0\.1/i.test(successUrl);
    const hasValidBackUrls = back_urls && typeof back_urls === 'object' && typeof successUrl === 'string' && successUrl.length > 0 && isHttps && !isLocalhost;

    const preferenceData = {
      items,
      payer,
      metadata,
      notification_url,
      statement_descriptor: 'UNIVERSO CATIA'
    };

    if (hasValidBackUrls) {
      preferenceData.back_urls = back_urls;
      preferenceData.auto_return = 'approved';
    } else {
      console.warn('⚠️ back_urls inválido/sem HTTPS ou ambiente local. Enviando preference SEM auto_return.', { back_urls });
    }

    console.log('🚀 Criando preference com dados:', preferenceData);
    const result = await preference.create({ body: preferenceData });
    console.log('✅ Preference criada com sucesso:', result.id);
    
    res.json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point
    });
  } catch (error) {
    console.error('❌ Erro ao criar preference:', error.message);
    console.error('🔍 Detalhes do erro:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// Rota para processar pagamento direto (Payment Brick)
app.post('/api/mercado-pago/process-payment', async (req, res) => {
  try {
    console.log('💳 Recebendo dados de pagamento:', req.body);
    const { selectedPaymentMethod, formData, userId, packageData } = req.body;

    // Validações básicas
    if (!formData || !packageData || !userId) {
      throw new Error('Dados obrigatórios não fornecidos');
    }

    // Extrair payment_method_id do formData se não estiver em selectedPaymentMethod
    const paymentMethodId = selectedPaymentMethod || formData.payment_method_id;
    
    if (!paymentMethodId) {
      throw new Error('Método de pagamento não identificado');
    }

    const paymentData = {
      transaction_amount: parseFloat(packageData.price),
      token: formData.token || undefined,
      description: `${packageData.name} - ${packageData.credits} créditos`,
      installments: parseInt(formData.installments) || 1,
      payment_method_id: paymentMethodId,
      issuer_id: formData.issuer_id || undefined,
      payer: {
        email: formData.payer?.email || formData.email,
        identification: formData.payer?.identification || formData.identification || undefined,
      },
      metadata: {
        user_id: userId,
        package_id: packageData.id,
        credits: packageData.credits
      }
    };

    console.log('🚀 Dados de pagamento preparados:', paymentData);

    // Processar pagamento PIX
    if (paymentMethodId === 'pix') {
      paymentData.payment_method_id = 'pix';
      delete paymentData.token;
      delete paymentData.installments;
      delete paymentData.issuer_id;
    }

    const result = await payment.create({ body: paymentData });

    res.json({
      status: result.status,
      status_detail: result.status_detail,
      id: result.id,
      point_of_interaction: result.point_of_interaction
    });

  } catch (error) {
    console.error('❌ Erro ao processar pagamento:', error.message);
    console.error('🔍 Detalhes completos do erro:', error);
    console.error('📦 Dados recebidos:', req.body);
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

// Webhook para receber notificações do Mercado Pago
app.post('/api/mercado-pago/webhook', async (req, res) => {
  try {
    const { data, type } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      
      // Buscar detalhes do pagamento
      const paymentInfo = await payment.get({ id: paymentId });
      
      if (paymentInfo.status === 'approved') {
        const { user_id, credits } = paymentInfo.metadata;
        
        // Aqui você adicionaria os créditos ao usuário no Firebase
        console.log(`✅ Pagamento aprovado! Adicionar ${credits} créditos ao usuário ${user_id}`);
        
        // Exemplo de como adicionar créditos no Firebase:
        /*
        const admin = require('firebase-admin');
        const userRef = admin.firestore().doc(`usuarios/${user_id}`);
        await userRef.update({
          creditos: admin.firestore.FieldValue.increment(credits)
        });
        */
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de status de pagamento
app.get('/api/mercado-pago/payment-status/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;
    const result = await payment.get({ id: paymentId });
    
    res.json({
      status: result.status,
      status_detail: result.status_detail,
      transaction_amount: result.transaction_amount
    });
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${PORT}/api/mercado-pago/webhook`);
});

module.exports = app; 
// TABLAS ACI 211.1 Y ACI 318

// Tabla 9-5: Aire (%)
const tablaAireACI = {
    atrapado: { 0.375: 3.0, 0.5: 2.5, 0.75: 2.0, 1: 1.5, 1.5: 1.0, 2: 0.5, 3: 0.3, 6: 0.2 },
    ligera:   { 0.375: 4.5, 0.5: 4.0, 0.75: 3.5, 1: 3.0, 1.5: 2.5, 2: 2.0, 3: 1.5, 6: 1.0 },
    moderada: { 0.375: 6.0, 0.5: 5.5, 0.75: 5.0, 1: 4.5, 1.5: 4.5, 2: 4.0, 3: 3.5, 6: 3.0 },
    severa:   { 0.375: 7.5, 0.5: 7.0, 0.75: 6.5, 1: 6.0, 1.5: 5.5, 2: 5.0, 3: 4.5, 6: 4.0 }
};

// Agua (kg/m³) Sin y Con Aire
const tablaAguaSinAire = {
    slump25_50:   { 0.375: 207, 0.5: 199, 0.75: 190, 1: 179, 1.5: 166, 2: 154, 3: 130, 6: 113 },
    slump75_100:  { 0.375: 228, 0.5: 216, 0.75: 205, 1: 193, 1.5: 181, 2: 169, 3: 145, 6: 124 },
    slump150_175: { 0.375: 243, 0.5: 228, 0.75: 216, 1: 202, 1.5: 190, 2: 178, 3: 160, 6: 140 }
};

const tablaAguaConAire = {
    slump25_50:   { 0.375: 181, 0.5: 175, 0.75: 168, 1: 160, 1.5: 150, 2: 142, 3: 122, 6: 107 },
    slump75_100:  { 0.375: 202, 0.5: 193, 0.75: 184, 1: 175, 1.5: 165, 2: 157, 3: 133, 6: 119 },
    slump150_175: { 0.375: 216, 0.5: 205, 0.75: 197, 1: 184, 1.5: 174, 2: 166, 3: 154, 6: 130 }
};

// TABLA 9-3 (Metric): Relación a/c vs Compressive Strength f'cr (28 días)
const tabla9_3_AC = [
    { fcr: 45, sinAire: 0.38, conAire: 0.30 },
    { fcr: 40, sinAire: 0.42, conAire: 0.34 },
    { fcr: 35, sinAire: 0.47, conAire: 0.39 },
    { fcr: 30, sinAire: 0.54, conAire: 0.45 },
    { fcr: 25, sinAire: 0.61, conAire: 0.52 },
    { fcr: 20, sinAire: 0.69, conAire: 0.60 },
    { fcr: 15, sinAire: 0.79, conAire: 0.70 }
];

// TABLA 9-1: Límites máximos por Durabilidad
const limitesDurabilidadAC = {
    "F0": 1.00,
    "P1": 0.50,
    "F1_F3": 0.45,
    "C2": 0.40
};

const nombresExposicion = {
    atrapado: "Sin aire incluido",
    ligera: "Exposición Ligera (Mild)",
    moderada: "Exposición Moderada (Moderate)",
    severa: "Exposición Severa (Severe)"
};
// TABLA 9-4: Volumen de Agregado Grueso por unidad de volumen de concreto (b/b0)
const tabla9_4_b_b0 = {
    0.375: { 2.40: 0.50, 2.60: 0.48, 2.80: 0.46, 3.00: 0.44 },
    0.5:   { 2.40: 0.59, 2.60: 0.57, 2.80: 0.55, 3.00: 0.53 },
    0.75:  { 2.40: 0.66, 2.60: 0.64, 2.80: 0.62, 3.00: 0.60 },
    1:     { 2.40: 0.71, 2.60: 0.69, 2.80: 0.67, 3.00: 0.65 },
    1.5:   { 2.40: 0.75, 2.60: 0.73, 2.80: 0.71, 3.00: 0.69 },
    2:     { 2.40: 0.78, 2.60: 0.76, 2.80: 0.74, 3.00: 0.72 },
    3:     { 2.40: 0.82, 2.60: 0.80, 2.80: 0.78, 3.00: 0.76 },
    6:     { 2.40: 0.87, 2.60: 0.85, 2.80: 0.83, 3.00: 0.81 }
};

// Función para interpolar b/b0 según el MF de la arena
function obtenerBb0(tmn, mf) {
    const filaTMN = tabla9_4_b_b0[tmn] || tabla9_4_b_b0[0.75];
    
    if (mf <= 2.40) return filaTMN[2.40];
    if (mf >= 3.00) return filaTMN[3.00];

    const mfs = [2.40, 2.60, 2.80, 3.00];
    for (let i = 0; i < mfs.length - 1; i++) {
        if (mf >= mfs[i] && mf <= mfs[i + 1]) {
            const x1 = mfs[i], x2 = mfs[i + 1];
            const y1 = filaTMN[x1], y2 = filaTMN[x2];
            return y1 + (mf - x1) * (y2 - y1) / (x2 - x1);
        }
    }
    return 0.62;
}
// FUNCIONES AUXILIARES
function alternarCampoS() {
    const tieneS = document.getElementById('tieneDesviacion') ? document.getElementById('tieneDesviacion').value : 'no';
    const contS = document.getElementById('contenedor-s');
    if (contS) contS.style.display = (tieneS === 'si') ? 'block' : 'none';
}

function calcularFcr(fc, tieneS, S) {
    let fcr = fc;
    if (tieneS === 'si' && !isNaN(S) && S > 0) {
        if (fc <= 35) {
            fcr = Math.max(fc + (1.34 * S), fc + (2.33 * S) - 3.5);
        } else {
            fcr = Math.max(fc + (1.34 * S), (0.90 * fc) + (2.33 * S));
        }
    } else {
        if (fc < 21) fcr = fc + 7.0;
        else if (fc <= 35) fcr = fc + 8.3;
        else fcr = (1.10 * fc) + 5.0;
    }
    return fcr;
}

// Interpolación lineal Tabla 9-3
function interpolarACResistencia(fcr, tieneAire) {
    const col = tieneAire ? 'conAire' : 'sinAire';

    if (fcr >= 45) return tabla9_3_AC[0][col];
    if (fcr <= 15) return tabla9_3_AC[tabla9_3_AC.length - 1][col];

    for (let i = 0; i < tabla9_3_AC.length - 1; i++) {
        const p1 = tabla9_3_AC[i];
        const p2 = tabla9_3_AC[i + 1];

        if (fcr <= p1.fcr && fcr >= p2.fcr) {
            const ac = p1[col] + (fcr - p1.fcr) * ((p2[col] - p1[col]) / (p2.fcr - p1.fcr));
            return parseFloat(ac.toFixed(3));
        }
    }
    return 0.50;
}

// FUNCIÓN PRINCIPAL
function procesarCalculos() {
    const fcVal = document.getElementById('fc').value;
    const slumpVal = document.getElementById('slump').value;
    const tmVal = document.getElementById('tm').value;
    const tmnVal = document.getElementById('tmn').value;
    const tipoExpVal = document.getElementById('tipoExposicion').value;
    const catDurabilidad = document.getElementById('categoriaDurabilidad') ? document.getElementById('categoriaDurabilidad').value : 'F0';

    const fc = parseFloat(fcVal);
    const slumpPulg = parseFloat(slumpVal);
    const tm = parseFloat(tmVal);
    const tmn = parseFloat(tmnVal);

    if (isNaN(fc) || isNaN(slumpPulg)) {
        alert("Por favor ingresa la resistencia f'c y el Slump para iniciar.");
        return;
    }

    // --- CÁLCULO F'CR ---
    const tieneS = document.getElementById('tieneDesviacion') ? document.getElementById('tieneDesviacion').value : 'no';
    const SVal = document.getElementById('desviacionS') ? parseFloat(document.getElementById('desviacionS').value) : 0;
    const fcr = calcularFcr(fc, tieneS, SVal);

    if (document.getElementById('out-fc-especificada')) document.getElementById('out-fc-especificada').innerText = `${fc}`;
    if (document.getElementById('out-fcr-calculado')) document.getElementById('out-fcr-calculado').innerText = `${fcr.toFixed(2)}`;

    const slumpMM = slumpPulg * 25.4;

    // --- PASO 1 Y 2 ---
    if (document.getElementById('out-slump')) document.getElementById('out-slump').innerText = `${slumpPulg}" (${slumpMM.toFixed(0)} mm)`;
    if (document.getElementById('out-tm')) document.getElementById('out-tm').innerText = `${tm}"`;
    if (document.getElementById('out-tmn')) document.getElementById('out-tmn').innerText = `${tmn}"`;

    // --- PASO 3: AIRE ---
    let porcentajeAire = 1.5;
    if (tablaAireACI[tipoExpVal] && tablaAireACI[tipoExpVal][tmn] !== undefined) {
        porcentajeAire = tablaAireACI[tipoExpVal][tmn];
    }
    if (document.getElementById('out-exposicion')) document.getElementById('out-exposicion').innerText = nombresExposicion[tipoExpVal];
    if (document.getElementById('out-tmn-paso3')) document.getElementById('out-tmn-paso3').innerText = `${tmn}"`;
    if (document.getElementById('out-aire')) document.getElementById('out-aire').innerText = `${porcentajeAire}%`;

    // --- PASO 4: AGUA ---
    let claveSlump = "slump75_100";
    if (slumpMM <= 60) claveSlump = "slump25_50";
    else if (slumpMM > 125) claveSlump = "slump150_175";

    let aguaKg = 181;
    const tieneAire = (tipoExpVal !== "atrapado");

    if (!tieneAire) {
        if (tablaAguaSinAire[claveSlump] && tablaAguaSinAire[claveSlump][tmn]) aguaKg = tablaAguaSinAire[claveSlump][tmn];
    } else {
        if (tablaAguaConAire[claveSlump] && tablaAguaConAire[claveSlump][tmn]) aguaKg = tablaAguaConAire[claveSlump][tmn];
    }

    if (document.getElementById('out-slump-paso4')) document.getElementById('out-slump-paso4').innerText = `${slumpPulg}" (${slumpMM.toFixed(0)} mm)`;
    if (document.getElementById('out-tmn-paso4')) document.getElementById('out-tmn-paso4').innerText = `${tmn}"`;
    if (document.getElementById('out-agua')) document.getElementById('out-agua').innerText = `${aguaKg} kg/m³ (${aguaKg} L/m³)`;

    // --- PASO 6: RELACIÓN A/C ---
    const acResistencia = interpolarACResistencia(fcr, tieneAire);
    const acDurabilidad = limitesDurabilidadAC[catDurabilidad] || 1.00;
    const acFinal = Math.min(acResistencia, acDurabilidad);

    if (document.getElementById('out-fcr-p6')) document.getElementById('out-fcr-p6').innerText = fcr.toFixed(2);
    if (document.getElementById('out-ac-resistencia')) document.getElementById('out-ac-resistencia').innerText = acResistencia.toFixed(3);
    if (document.getElementById('out-cat-durabilidad')) document.getElementById('out-cat-durabilidad').innerText = catDurabilidad;
    if (document.getElementById('out-ac-durabilidad')) document.getElementById('out-ac-durabilidad').innerText = (acDurabilidad < 1.0) ? acDurabilidad.toFixed(2) : "Sin restricción";
    if (document.getElementById('out-ac-final')) document.getElementById('out-ac-final').innerText = acFinal.toFixed(3);

    // MOSTRAR TARJETAS
    if (document.getElementById('seccion-resultados')) document.getElementById('seccion-resultados').style.display = 'block';
    if (document.getElementById('tarjeta-fcr')) document.getElementById('tarjeta-fcr').style.display = 'block';
    if (document.getElementById('tarjeta-paso2')) document.getElementById('tarjeta-paso2').style.display = 'block';
    if (document.getElementById('tarjeta-paso3')) document.getElementById('tarjeta-paso3').style.display = 'block';
    if (document.getElementById('tarjeta-paso4')) document.getElementById('tarjeta-paso4').style.display = 'block';
    if (document.getElementById('tarjeta-paso6')) document.getElementById('tarjeta-paso6').style.display = 'block';
   
    // --- PASO 7: CONTENIDO DE CEMENTO Y VOLUMEN ABSOLUTO ---
    const peCemento = document.getElementById('peCemento') ? parseFloat(document.getElementById('peCemento').value) : 3.15;
    
    // Masa de cemento (kg/m³)
    const cementoKg = aguaKg / acFinal;
    const sacosCemento = cementoKg / 50;
    
    // Volumen absoluto de cemento (m³)
    const cementoVolM3 = cementoKg / (peCemento * 1000);

    // Enviar resultados al HTML
    if (document.getElementById('out-cemento-kg')) document.getElementById('out-cemento-kg').innerText = cementoKg.toFixed(1);
    if (document.getElementById('out-sacos')) document.getElementById('out-sacos').innerText = sacosCemento.toFixed(1);
    if (document.getElementById('out-cemento-vol')) document.getElementById('out-cemento-vol').innerText = cementoVolM3.toFixed(4);

    // Mostrar tarjeta del Paso 7
    if (document.getElementById('tarjeta-paso7')) document.getElementById('tarjeta-paso7').style.display = 'block';

    // --- PASO 8: CONTENIDO DE AGREGADOS (GRAVA Y ARENA POR VOLUMEN ABSOLUTO) ---
    const muGravaVal = document.getElementById('muGrava') ? parseFloat(document.getElementById('muGrava').value) : 1600;
    const peGravaVal = document.getElementById('peGrava') ? parseFloat(document.getElementById('peGrava').value) : 2.65;
    const peArenaVal = document.getElementById('peArena') ? parseFloat(document.getElementById('peArena').value) : 2.60;
    const mfArenaVal = document.getElementById('mfArena') ? parseFloat(document.getElementById('mfArena').value) : 2.80;
    const peCementoVal = document.getElementById('peCemento') ? parseFloat(document.getElementById('peCemento').value) : 3.15;

    // 1. GRAVA: Wsg = (b/b0) * MUA  y  Vg = Wsg / (Gg * 1000)
    const b_b0 = obtenerBb0(tmn, mfArenaVal);
    const Wsg = b_b0 * muGravaVal;
    const V_grava = Wsg / (peGravaVal * 1000);

    // 2. VOLÚMENES ABSOLUTOS PREVIOS
    const V_agua = aguaKg / 1000;
    const V_cemento = cementoKg / (peCementoVal * 1000);
    const V_aire = porcentajeAire / 100;

    // 3. ARENA: Vf = 1 - Vagua - Vc - Va - Vg  y  Wf = Vf * Gf * 1000
    const V_arena = 1 - V_agua - V_cemento - V_aire - V_grava;
    const Wf = V_arena * (peArenaVal * 1000);

    // Mostrar en pantalla
    if (document.getElementById('out-vg-relativo')) document.getElementById('out-vg-relativo').innerText = b_b0.toFixed(2);
    if (document.getElementById('out-wsg-grava')) document.getElementById('out-wsg-grava').innerText = Wsg.toFixed(1);
    if (document.getElementById('out-vol-grava')) document.getElementById('out-vol-grava').innerText = V_grava.toFixed(4);

    if (document.getElementById('out-vol-arena')) document.getElementById('out-vol-arena').innerText = V_arena.toFixed(4);
    if (document.getElementById('out-wf-arena')) document.getElementById('out-wf-arena').innerText = Wf.toFixed(1);

    // Mostrar la tarjeta de resultados del Paso 8
    if (document.getElementById('tarjeta-paso8')) document.getElementById('tarjeta-paso8').style.display = 'block';

    // --- PASO 9: AJUSTE POR HUMEDAD Y CANTIDADES FINALES ---
    const humGravaVal = document.getElementById('humGrava') ? parseFloat(document.getElementById('humGrava').value) || 0 : 0;
    const absGravaVal = document.getElementById('absGrava') ? parseFloat(document.getElementById('absGrava').value) || 0 : 0;
    const humArenaVal = document.getElementById('humArena') ? parseFloat(document.getElementById('humArena').value) || 0 : 0;
    const absArenaVal = document.getElementById('absArena') ? parseFloat(document.getElementById('absArena').value) || 0 : 0;

    // 1. Corrección de agua exacta con tu fórmula:
    // Agua Corregida = Agua Inicial + Wsg*(CAg - CHg)/100 + Wsf*(CAf - CHf)/100
    const aporteAguaGrava = Wsg * ((absGravaVal - humGravaVal) / 100);
    const aporteAguaArena = Wf * ((absArenaVal - humArenaVal) / 100);
    const aguaCorregida = aguaKg + aporteAguaGrava + aporteAguaArena;

    // 2. Pesos Húmedos de Agregados
    const W_grava_humeda = Wsg * (1 + (humGravaVal / 100));
    const W_arena_humeda = Wf * (1 + (humArenaVal / 100));

    // 3. Densidades del Concreto (Seco vs Húmedo)
    const densidadSeca = Wsg + Wf + aguaKg + cementoKg;
    const densidadHumeda = W_grava_humeda + W_arena_humeda + aguaCorregida + cementoKg;

    // Mostrar datos en el HTML
    if (document.getElementById('out-agua-ini')) document.getElementById('out-agua-ini').innerText = aguaKg.toFixed(1);
    if (document.getElementById('out-aporte-grava')) document.getElementById('out-aporte-grava').innerText = aporteAguaGrava.toFixed(2);
    if (document.getElementById('out-aporte-arena')) document.getElementById('out-aporte-arena').innerText = aporteAguaArena.toFixed(2);
    if (document.getElementById('out-agua-corregida')) document.getElementById('out-agua-corregida').innerText = aguaCorregida.toFixed(1);

    if (document.getElementById('out-grava-humeda')) document.getElementById('out-grava-humeda').innerText = W_grava_humeda.toFixed(2);
    if (document.getElementById('out-arena-humeda')) document.getElementById('out-arena-humeda').innerText = W_arena_humeda.toFixed(2);

    if (document.getElementById('out-densidad-seca')) document.getElementById('out-densidad-seca').innerText = densidadSeca.toFixed(2);
    if (document.getElementById('out-densidad-humeda')) document.getElementById('out-densidad-humeda').innerText = densidadHumeda.toFixed(2);

    // Mostrar tarjeta del Paso 9
    if (document.getElementById('tarjeta-paso9')) document.getElementById('tarjeta-paso9').style.display = 'block';

    // --- Llenado de la Tabla 1: Materiales Secos ---
    if (document.getElementById('tbl-cemento-seco')) document.getElementById('tbl-cemento-seco').innerText = cementoKg.toFixed(1);
    if (document.getElementById('tbl-cemento-pe')) document.getElementById('tbl-cemento-pe').innerText = peCementoVal.toFixed(2);
    if (document.getElementById('tbl-cemento-vol')) document.getElementById('tbl-cemento-vol').innerText = (V_cemento * 1000).toFixed(1);

    if (document.getElementById('tbl-agua-seco')) document.getElementById('tbl-agua-seco').innerText = aguaKg.toFixed(1);
    if (document.getElementById('tbl-agua-vol')) document.getElementById('tbl-agua-vol').innerText = (V_agua * 1000).toFixed(1);

    if (document.getElementById('tbl-aire-vol')) document.getElementById('tbl-aire-vol').innerText = (V_aire * 1000).toFixed(1);

    if (document.getElementById('tbl-grava-seco')) document.getElementById('tbl-grava-seco').innerText = Wsg.toFixed(1);
    if (document.getElementById('tbl-grava-pe')) document.getElementById('tbl-grava-pe').innerText = peGravaVal.toFixed(2);
    if (document.getElementById('tbl-grava-vol')) document.getElementById('tbl-grava-vol').innerText = (V_grava * 1000).toFixed(1);

    if (document.getElementById('tbl-arena-seco')) document.getElementById('tbl-arena-seco').innerText = Wf.toFixed(1);
    if (document.getElementById('tbl-arena-pe')) document.getElementById('tbl-arena-pe').innerText = peArenaVal.toFixed(2);
    if (document.getElementById('tbl-arena-vol')) document.getElementById('tbl-arena-vol').innerText = (V_arena * 1000).toFixed(1);

    // Suma del Volumen Absoluto Total (L/m³)
    const volTotalLitros = (V_cemento + V_agua + V_aire + V_grava + V_arena) * 1000;
    if (document.getElementById('tbl-total-vol')) document.getElementById('tbl-total-vol').innerText = volTotalLitros.toFixed(1);

    // --- Llenado de la Tabla 2: Materiales Húmedos ---
    if (document.getElementById('tbl-cemento-seco2')) document.getElementById('tbl-cemento-seco2').innerText = cementoKg.toFixed(1);
    if (document.getElementById('tbl-cemento-hum')) document.getElementById('tbl-cemento-hum').innerText = cementoKg.toFixed(1);

    if (document.getElementById('tbl-agua-seco2')) document.getElementById('tbl-agua-seco2').innerText = aguaKg.toFixed(1);
    if (document.getElementById('tbl-agua-hum')) document.getElementById('tbl-agua-hum').innerText = aguaCorregida.toFixed(1);

    if (document.getElementById('tbl-grava-seco2')) document.getElementById('tbl-grava-seco2').innerText = Wsg.toFixed(1);
    if (document.getElementById('tbl-grava-hum')) document.getElementById('tbl-grava-hum').innerText = W_grava_humeda.toFixed(1);

    if (document.getElementById('tbl-arena-seco2')) document.getElementById('tbl-arena-seco2').innerText = Wf.toFixed(1);
    if (document.getElementById('tbl-arena-hum')) document.getElementById('tbl-arena-hum').innerText = W_arena_humeda.toFixed(1);

    if (document.getElementById('tbl-total-seco')) document.getElementById('tbl-total-seco').innerText = densidadSeca.toFixed(1);
    if (document.getElementById('tbl-total-hum')) document.getElementById('tbl-total-hum').innerText = densidadHumeda.toFixed(1);

    // Mostrar contenedor
    if (document.getElementById('tarjeta-resumen')) document.getElementById('tarjeta-resumen').style.display = 'block';
}

function evaluarSeparacionS() {
    const b = parseFloat(document.getElementById('anchoB').value);
    const h = parseFloat(document.getElementById('alturaH').value);
    const rec = parseFloat(document.getElementById('recubrimiento').value) || 0;
    const N = parseInt(document.getElementById('numVarillas').value);
    const numVarilla = parseFloat(document.getElementById('diamVarilla').value);
    const numEstribo = parseFloat(document.getElementById('diamEstribo').value) || 0;
    const tmnSeleccionadoPulg = parseFloat(document.getElementById('tmn').value);

    if (isNaN(b) || isNaN(N) || isNaN(numVarilla)) {
        alert("Por favor escribe los datos geométricos requeridos.");
        return;
    }

    const diamVarillaMM = numVarilla * 3.175;
    const diamEstriboMM = numEstribo * 3.175;

    let S = (N > 1) 
        ? (b - (2 * rec) - (2 * diamEstriboMM) - (N * diamVarillaMM)) / (N - 1)
        : b - (2 * rec) - (2 * diamEstriboMM) - diamVarillaMM;

    const limA = b / 5;
    const limB = h ? (h / 3) : 999;
    const limC = 0.75 * S;

    const tmnMaxMM = Math.min(limA, limB, limC);
    const tmnMaxPulg = tmnMaxMM / 25.4;
    const tmnSelMM = tmnSeleccionadoPulg * 25.4;
    const cumple = tmnSelMM <= tmnMaxMM;

    document.getElementById('out-s').innerText = S.toFixed(2);
    document.getElementById('out-lim-a').innerText = limA.toFixed(1);
    document.getElementById('out-lim-b').innerText = h ? limB.toFixed(1) : "N/A";
    document.getElementById('out-lim-c').innerText = limC.toFixed(1);
    document.getElementById('out-tmn-max').innerText = `${tmnMaxPulg.toFixed(2)}" (${tmnMaxMM.toFixed(1)} mm)`;

    const elemCumple = document.getElementById('out-tmn-cumple');
    if (elemCumple) {
        if (cumple) {
            elemCumple.innerText = `✅ El TMN de ${tmnSeleccionadoPulg}" es VÁLIDO para la geometría ingresada.`;
            elemCumple.style.color = "green";
            elemCumple.style.fontWeight = "bold";
        } else {
            elemCumple.innerText = `❌ El TMN de ${tmnSeleccionadoPulg}" SOBREPASAM el límite normativo de ${tmnMaxPulg.toFixed(2)}".`;
            elemCumple.style.color = "red";
            elemCumple.style.fontWeight = "bold";
        }
    }

    if (document.getElementById('res-paso2')) document.getElementById('res-paso2').style.display = 'block';
}
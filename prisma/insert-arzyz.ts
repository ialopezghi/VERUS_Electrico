import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()
const BY = "ilopez@ghifurnaces.com"

// ── MANGUERAS FAT (todas SI) ─────────────────────────────────────────────────
const MANGUERAS_FAT: Array<{ imei: string; origen: string; destino: string; descripcion: string }> = [
  // B1
  { imei: "=B1-3W1",   origen: "=B1+UC2-3X1",   destino: "=B1+UC10-3X1",  descripcion: "Manguera de interconexión" },
  { imei: "=B1-3W1.1", origen: "=B1+UC10-3X1",  destino: "=B1+-BG1",      descripcion: "Compuerta regulación humos abierta" },
  { imei: "=B1-3W1.2", origen: "=B1+UC10-3X1",  destino: "=B1+-BG2",      descripcion: "Compuerta regulación humos cerrada" },
  { imei: "=B1-3W1.3", origen: "=B1+UC10-3X1",  destino: "=B1+-BG4",      descripcion: "Compuerta salida humos puerta abierta" },
  { imei: "=B1-3W1.4", origen: "=B1+UC10-3X1",  destino: "=B1+-BG5",      descripcion: "Compuerta salida humos puerta cerrada" },
  { imei: "=B1-3W1.5", origen: "=B1+UC10-3X1",  destino: "=B1+-KH2",      descripcion: "EV. Abrir salida humos puerta" },
  { imei: "=B1-3W1.6", origen: "=B1+UC10-3X1",  destino: "=B1+-KH3",      descripcion: "EV. Cerrar salida humos puerta" },
  { imei: "=B1-3W1.7", origen: "=B1+UC10-3X1",  destino: "=B1+-BP3",      descripcion: "Presión línea neumática rotura flexible" },
  { imei: "=B1-3W1.8", origen: "=B1+UC10-3X1",  destino: "=B1+-BG8",      descripcion: "Detección láser limpieza zona derecha" },
  { imei: "=B1-3W1.9", origen: "=B1+UC10-3X1",  destino: "=B1+-BG9",      descripcion: "Detección láser limpieza zona izquierda" },
  { imei: "=B1-3W4",   origen: "=B1+UC2-3X4",   destino: "=B1+UC20-3X4",  descripcion: "Manguera de interconexión" },
  { imei: "=B1-3W4.1", origen: "=B1+UC20-3X4",  destino: "=B1+-BP2",      descripcion: "Presión línea neumática" },
  { imei: "=B1-3W4.2", origen: "=B1+UC20-3X4",  destino: "=B1+-KH1",      descripcion: "EV. Habilitar neumática" },
  { imei: "=B1-4W1",   origen: "=B1+UC2-4X1",   destino: "=B1+UC10-4X1",  descripcion: "Manguera de interconexión" },
  { imei: "=B1-4W1.2", origen: "=B1+UC10-4X1",  destino: "=B1+-BP1",      descripcion: "Presión interna horno" },
  { imei: "=B1-4W1.3", origen: "=B1+UC10-4X1",  destino: "=B1+-BG3",      descripcion: "Consigna posición compuerta salida humos" },
  // EC1
  { imei: "=EC1-2W1",  origen: "=EC1+UC1-2X1",  destino: "=EC1+UC2-2X1",  descripcion: "Manguera de interconexión" },
  { imei: "=EC1-2W2",  origen: "=EC1+UC1-2X2",  destino: "=EC1+UC3-2X2",  descripcion: "Manguera de interconexión" },
  { imei: "=EC1-3W1",  origen: "=EC1+UC1-3X1",  destino: "=EC1+UC2-3X1",  descripcion: "Manguera de interconexión" },
  { imei: "=EC1-4W1",  origen: "=EC1+UC1-4X1",  destino: "=EC1+UC2-4X1",  descripcion: "Manguera de interconexión" },
  // EM1 - motores
  { imei: "=EM1-1W1",   origen: "=EM1+UC1-QA1",  destino: "=EM1+-QB1",    descripcion: "Motor ventilador combustión" },
  { imei: "=EM1-1W1.1", origen: "=EM1+-MA1",     destino: "=EM1+-QB1",    descripcion: "Motor ventilador combustión" },
  { imei: "=EM1-1W2",   origen: "=EM1+UC1-1X2",  destino: "=EM1+-QB2",    descripcion: "Motor ventilador pilotos" },
  { imei: "=EM1-1W2.1", origen: "=EM1+-MA3",     destino: "=EM1+-QB2",    descripcion: "Motor ventilador pilotos" },
  // EM1 - 2W
  { imei: "=EM1-2W2",   origen: "=EM1+UC11-2X2", destino: "=EM1+-MA2",    descripcion: "Servo aire combustión quemador 1" },
  { imei: "=EM1-2W3",   origen: "=EM1+UC2-2X3",  destino: "=EM1+UC20-2X3",descripcion: "Manguera de interconexión" },
  { imei: "=EM1-2W3.1", origen: "=EM1+UC20-2X3", destino: "=EM1+-KH1",    descripcion: "Activación EV principal" },
  { imei: "=EM1-2W3.2", origen: "=EM1+UC20-2X3", destino: "=EM1+-KH2",    descripcion: "Activación EV vaciado" },
  { imei: "=EM1-2W4",   origen: "=EM1+UC2-2X4",  destino: "=EM1+UC11-2X4",descripcion: "Manguera de interconexión" },
  { imei: "=EM1-2W4.1", origen: "=EM1+UC11-2X4", destino: "=EM1+-TA1",    descripcion: "Transformador de ignición quemador 1" },
  { imei: "=EM1-2W4.2", origen: "=EM1+UC11-2X4", destino: "=EM1+-KH3",    descripcion: "EV quemador 1 gas seguridad" },
  { imei: "=EM1-2W4.3", origen: "=EM1+UC11-2X4", destino: "=EM1+-KH4",    descripcion: "EV quemador 1 gas" },
  { imei: "=EM1-2W4.4", origen: "=EM1+UC11-2X4", destino: "=EM1+-KH5",    descripcion: "EV quemador 1 gas bypass" },
  { imei: "=EM1-2W4.5", origen: "=EM1+UC11-2X4", destino: "=EM1+-KH6",    descripcion: "EV 1 piloto quemador 1" },
  { imei: "=EM1-2W4.6", origen: "=EM1+UC11-2X4", destino: "=EM1+-KH7",    descripcion: "EV 2 piloto quemador 1" },
  { imei: "=EM1-2W5",   origen: "=EM1+UC2-2X5",  destino: "=EM1+UC12-2X5",descripcion: "Manguera de interconexión" },
  { imei: "=EM1-2W5.1", origen: "=EM1+UC12-2X5", destino: "=EM1+-TA2",    descripcion: "Transformador de ignición quemador 2" },
  { imei: "=EM1-2W5.2", origen: "=EM1+UC12-2X5", destino: "=EM1+-KH8",    descripcion: "EV quemador 2 gas seguridad" },
  { imei: "=EM1-2W5.3", origen: "=EM1+UC12-2X5", destino: "=EM1+-KH9",    descripcion: "EV quemador 2 gas" },
  { imei: "=EM1-2W5.4", origen: "=EM1+UC12-2X5", destino: "=EM1+-KH10",   descripcion: "EV quemador 2 gas bypass" },
  { imei: "=EM1-2W5.5", origen: "=EM1+UC12-2X5", destino: "=EM1+-KH11",   descripcion: "EV 1 piloto quemador 2" },
  { imei: "=EM1-2W5.6", origen: "=EM1+UC12-2X5", destino: "=EM1+-KH12",   descripcion: "EV 2 piloto quemador 2" },
  { imei: "=EM1-2W6",   origen: "=EM1+UC12-2X6", destino: "=EM1+-MA4",    descripcion: "Servo aire combustión quemador 2" },
  // EM1 - 3W
  { imei: "=EM1-3W1",   origen: "=EM1+UC2-3X1",  destino: "=EM1+UC20-3X1",descripcion: "Manguera de interconexión" },
  { imei: "=EM1-3W1.1", origen: "=EM1+UC20-3X1", destino: "=EM1+-PG1",    descripcion: "Presión contador gas" },
  { imei: "=EM1-3W1.2", origen: "=EM1+UC20-3X1", destino: "=EM1+-BP1",    descripcion: "Alta presión gas" },
  { imei: "=EM1-3W1.3", origen: "=EM1+UC20-3X1", destino: "=EM1+-BP2",    descripcion: "Baja presión gas" },
  { imei: "=EM1-3W1.4", origen: "=EM1+UC20-3X1", destino: "=EM1+-BP3",    descripcion: "Presostato fugas gas" },
  { imei: "=EM1-3W1.5", origen: "=EM1+UC20-3X1", destino: "=EM1+-KH1",    descripcion: "Feedback EV. Principal" },
  { imei: "=EM1-3W2",   origen: "=EM1+UC2-3X2",  destino: "=EM1+UC11-3X2",descripcion: "Manguera de interconexión" },
  { imei: "=EM1-3W2.1", origen: "=EM1+UC11-3X2", destino: "=EM1+-MA2",    descripcion: "Servo aire combustión quemador 1" },
  { imei: "=EM1-3W2.2", origen: "=EM1+UC11-3X2", destino: "=EM1+-BP6",    descripcion: "Presostato aire purga quemador 1" },
  { imei: "=EM1-3W2.3", origen: "=EM1+UC11-3X2", destino: "=EM1+-BP7",    descripcion: "Presostato fugas válvulas gas quemador 1" },
  { imei: "=EM1-3W3",   origen: "=EM1+UC1-3X3",  destino: "=EM1+UC2-3X3", descripcion: "Manguera de interconexión" },
  { imei: "=EM1-3W4",   origen: "=EM1+UC2-3X4",  destino: "=EM1+UC3-3X4", descripcion: "Manguera de interconexión" },
  { imei: "=EM1-3W5",   origen: "=EM1+UC2-3X5",  destino: "=EM1+-QB1",    descripcion: "Confirmación seccionador ventilador combustión" },
  { imei: "=EM1-3W6",   origen: "=EM1+UC2-3X6",  destino: "=EM1+-QB2",    descripcion: "Confirmación seccionador ventilador pilotos" },
  { imei: "=EM1-3W7",   origen: "=EM1+UC1-3X7",  destino: "=EM1+UC2-3X7", descripcion: "Disparo int. aut. motor ventilador pilotos" },
  { imei: "=EM1-3W8",   origen: "=EM1+UC2-3X8",  destino: "=EM1+UC10-3X8",descripcion: "Presión aire combustión" },
  { imei: "=EM1-3W8.1", origen: "=EM1+UC10-3X8", destino: "=EM1+-BP4",    descripcion: "Presión aire combustión" },
  { imei: "=EM1-3W8.2", origen: "=EM1+UC10-3X8", destino: "=EM1+-BP16",   descripcion: "Presión aire pilotos" },
  { imei: "=EM1-3W9",   origen: "=EM1+UC2-3X9",  destino: "=EM1+UC12-3X9",descripcion: "Manguera de interconexión" },
  { imei: "=EM1-3W9.1", origen: "=EM1+UC12-3X9", destino: "=EM1+-MA4",    descripcion: "Servo aire combustión quemador 2" },
  { imei: "=EM1-3W9.3", origen: "=EM1+UC12-3X9", destino: "=EM1+-BP12",   descripcion: "Presostato fugas válvulas gas quemador 2" },
  // EM1 - 4W
  { imei: "=EM1-4W1",   origen: "=EM1+UC2-4X1",  destino: "=EM1+-MA1",    descripcion: "Sonda de motor" },
  { imei: "=EM1-4W2",   origen: "=EM1+UC2-BT1",  destino: "=EM1+-BT1",    descripcion: "Termopar seguridad 1" },
  { imei: "=EM1-4W3",   origen: "=EM1+UC2-BT1",  destino: "=EM1+-BT1",    descripcion: "Termopar seguridad 2" },
  { imei: "=EM1-4W4",   origen: "=KE1+UC2-KE400",destino: "=EM1+-BT2",    descripcion: "Temperatura regulación bóveda" },
  { imei: "=EM1-4W5",   origen: "=KE1+UC2-KE400",destino: "=EM1+-BT3",    descripcion: "Temperatura baño" },
  { imei: "=EM1-4W6",   origen: "=KE1+UC2-KE400",destino: "=EM1+-BT4",    descripcion: "Temperatura entrada caldo" },
  { imei: "=EM1-4W7",   origen: "=EM1+UC2-4X7",  destino: "=EM1+UC20-4X7",descripcion: "Manguera de interconexión" },
  { imei: "=EM1-4W7.1", origen: "=EM1+UC20-4X7", destino: "=EM1+-BT5",    descripcion: "Temperatura contador gas" },
  { imei: "=EM1-4W7.2", origen: "=EM1+UC20-4X7", destino: "=EM1+-BP5",    descripcion: "Presión contador gas" },
  { imei: "=EM1-4W8",   origen: "=EM1+UC11-KF1", destino: "=EM1+-BH1",    descripcion: "Detector de llama UV quemador 1" },
  { imei: "=EM1-4W9",   origen: "=EM1+UC2-4X9",  destino: "=EM1+UC11-4X9",descripcion: "Manguera de interconexión" },
  { imei: "=EM1-4W9.1", origen: "=EM1+UC11-4X9", destino: "=EM1+-MA2",    descripcion: "Servo aire combustión quemador 1" },
  { imei: "=EM1-4W9.2", origen: "=EM1+UC11-4X9", destino: "=EM1+-BP8",    descripcion: "Presión gas previa limitadora quemador 1" },
  { imei: "=EM1-4W9.3", origen: "=EM1+UC11-4X9", destino: "=EM1+-BP9",    descripcion: "Presión gas posterior limitadora quemador 1" },
  { imei: "=EM1-4W9.4", origen: "=EM1+UC11-4X9", destino: "=EM1+-BP10",   descripcion: "Presión aire quemador 1" },
  { imei: "=EM1-4W10",  origen: "=EM1+UC12-KF2", destino: "=EM1+-BH2",    descripcion: "Detector de llama UV quemador 2" },
  { imei: "=EM1-4W11",  origen: "=EM1+UC2-4X11", destino: "=EM1+UC12-4X11",descripcion: "Manguera de interconexión" },
  { imei: "=EM1-4W11.1",origen: "=EM1+UC12-4X11",destino: "=EM1+-MA4",    descripcion: "Servo aire combustión quemador 2" },
  { imei: "=EM1-4W11.2",origen: "=EM1+UC12-4X11",destino: "=EM1+-BP13",   descripcion: "Presión gas previa limitadora quemador 2" },
  { imei: "=EM1-4W11.3",origen: "=EM1+UC12-4X11",destino: "=EM1+-BP14",   descripcion: "Presión gas posterior limitadora quemador 2" },
  { imei: "=EM1-4W11.4",origen: "=EM1+UC12-4X11",destino: "=EM1+-BP15",   descripcion: "Presión aire quemador 2" },
  // EM1 - W (tierras/ignición)
  { imei: "=EM1-W1",  origen: "=EM1+-E1",      destino: "=EM1+-TA1",   descripcion: "Transformador de ignición quemador 1" },
  { imei: "=EM1-W2",  origen: "=EM1+UC2-PE",   destino: "=EM1+-E1",    descripcion: "Transformador de ignición quemador 1" },
  { imei: "=EM1-W3",  origen: "=EM1+-E2",      destino: "=EM1+-TA2",   descripcion: "Transformador de ignición quemador 2" },
  { imei: "=EM1-W6",  origen: "=EM1+UC2-PE",   destino: "=EM1+-E2",    descripcion: "Transformador de ignición quemador 2" },
  // F1
  { imei: "=F1-3W1",   origen: "=F1+UC2-3X1",  destino: "=F1+UC10-3X1",descripcion: "Manguera de interconexión" },
  { imei: "=F1-3W1.1", origen: "=F1+UC10-3X1", destino: "=F1+-SG1",    descripcion: "Puerta escalera" },
  { imei: "=F1-3W2",   origen: "=F1+UC2-3X2",  destino: "=F1+UC3-3X2", descripcion: "Manguera de interconexión" },
  { imei: "=F1-3W4",   origen: "=F1+UC2-3X4",  destino: "=F1+UC50-3X4",descripcion: "Manguera de interconexión" },
  { imei: "=F1-3W5",   origen: "=F1+UC2-3X5",  destino: "=F1+UC10-3X5",descripcion: "Manguera de interconexión" },
  { imei: "=F1-3W5.1", origen: "=F1+UC10-3X5", destino: "=F1+-PF1",    descripcion: "Baliza de alarma" },
  // GP1
  { imei: "=GP1-1W1",   origen: "=GP1+UC1-QA1", destino: "=GP1+-QB1",   descripcion: "Bomba 1" },
  { imei: "=GP1-1W1.1", origen: "=GP1+-MA1",    destino: "=GP1+-QB1",   descripcion: "Bomba 1" },
  { imei: "=GP1-1W2",   origen: "=GP1+UC1-QA2", destino: "=GP1+-QB2",   descripcion: "Bomba 2" },
  { imei: "=GP1-1W2.1", origen: "=GP1+-MA2",    destino: "=GP1+-QB2",   descripcion: "Bomba 2" },
  { imei: "=GP1-1W3",   origen: "=GP1+UC1-1X3", destino: "=GP1+-QB3",   descripcion: "Bomba recirculación" },
  { imei: "=GP1-1W3.1", origen: "=GP1+-MA3",    destino: "=GP1+-QB3",   descripcion: "Bomba recirculación" },
  { imei: "=GP1-3W2",   origen: "=GP1+UC1-3X2", destino: "=GP1+UC2-3X2",descripcion: "Manguera de interconexión" },
  { imei: "=GP1-3W1.2", origen: "=GP1+UC30-3X1",destino: "=GP1+-KH2",   descripcion: "Presurizar bomba 2" },
  { imei: "=GP1-3W1.3", origen: "=GP1+UC30-3X1",destino: "=GP1+-KH3",   descripcion: "Agua refrigeración" },
  { imei: "=GP1-3W1.4", origen: "=GP1+UC30-3X1",destino: "=GP1+-BT2",   descripcion: "Exceso temperatura grupo hidráulico" },
  { imei: "=GP1-3W1.5", origen: "=GP1+UC30-3X1",destino: "=GP1+-BL1",   descripcion: "Aviso nivel bajo aceite" },
  { imei: "=GP1-3W1.6", origen: "=GP1+UC30-3X1",destino: "=GP1+-BL2",   descripcion: "Alarma nivel bajo aceite" },
  { imei: "=GP1-3W1.7", origen: "=GP1+UC30-3X1",destino: "=GP1+-BQ1",   descripcion: "Indicador de filtro de retorno" },
  { imei: "=GP1-3W1.8", origen: "=GP1+UC30-3X1",destino: "=GP1+-BQ2",   descripcion: "Indicador de filtro de recirculación" },
  { imei: "=GP1-3W1.9", origen: "=GP1+UC30-3X1",destino: "=GP1+-BP1",   descripcion: "Presostato línea apriete puerta" },
  { imei: "=GP1-3W3",   origen: "=GP1+UC2-3X3", destino: "=GP1+-QB1",   descripcion: "Confirmación seccionador bomba 1" },
  { imei: "=GP1-3W4",   origen: "=GP1+UC2-3X4", destino: "=GP1+-QB2",   descripcion: "Confirmación seccionador bomba 2" },
  { imei: "=GP1-3W5",   origen: "=GP1+UC2-3X5", destino: "=GP1+-QB3",   descripcion: "Confirmación seccionador bomba recirculación fluido" },
  // KE1
  { imei: "=KE1-5W4",  origen: "=EC1+UC2-X1",   destino: "=KE1+UC2-KE30", descripcion: "Manguera de interconexión" },
  { imei: "=KE1-5W5",  origen: "=EC1+UC2-X1",   destino: "=KE1+UC2-KE30", descripcion: "Manguera de interconexión" },
  { imei: "=KE1-5W6",  origen: "=T1+UC1-PG1",   destino: "=KE1+UC2-KE30", descripcion: "Manguera de interconexión PG1" },
  { imei: "=KE1-5W7",  origen: "=KE1+UC2-KE30", destino: "=EM1+UC1-QA1",  descripcion: "Entrada KE" },
  { imei: "=KE1-5W8",  origen: "=KE1+UC2-KE30", destino: "=KE1+UC3-KE900",descripcion: "Manguera de interconexión KE900" },
  { imei: "=KE1-5W9",  origen: "=KE1+UC60-X2",  destino: "=KE1+UC2-KE30", descripcion: "Manguera de interconexión KE60" },
  // MM1
  { imei: "=MM1-3W1",   origen: "=MM1+UC2-3X1",  destino: "=MM1+UC30-3X1",descripcion: "Manguera de interconexión" },
  { imei: "=MM1-3W1.3", origen: "=MM1+UC30-3X1", destino: "=MM1+-KH2",    descripcion: "Retornar horno sin tensión" },
  { imei: "=MM1-3W2",   origen: "=MM1+UC2-3X2",  destino: "=MM1+UC10-3X2",descripcion: "Manguera de interconexión" },
  { imei: "=MM1-3W2.1", origen: "=MM1+UC10-3X2", destino: "=MM1+-BG2",    descripcion: "Horno en reposo" },
  { imei: "=MM1-3W2.2", origen: "=MM1+UC10-3X2", destino: "=MM1+-BG3",    descripcion: "Horno basculado" },
  { imei: "=MM1-3W4",   origen: "=MM1+UC2-3X4",  destino: "=MM1+UC10-3X4",descripcion: "Manguera de interconexión" },
  { imei: "=MM1-3W4.1", origen: "=MM1+UC10-3X4", destino: "=MM1+-KH3",    descripcion: "EV Refrigeración laser reguera" },
  { imei: "=MM1-4W1",   origen: "=MM1+UC2-4X1",  destino: "=MM1+UC10-4X1",descripcion: "Manguera de interconexión" },
  { imei: "=MM1-4W1.1", origen: "=MM1+UC10-4X1", destino: "=MM1+-BG1",    descripcion: "Grado inclinación basculación" },
  { imei: "=MM1-4W1.2", origen: "=MM1+UC10-4X1", destino: "=MM1+-BG4",    descripcion: "Laser reguera" },
  { imei: "=MM1-4W2",   origen: "=MM1+UC2-4X2",  destino: "=MM1+UC30-4X2",descripcion: "Manguera de interconexión" },
  // NB1
  { imei: "=NB1-3W1.1", origen: "=NB1+UC30-3X1", destino: "=NB1+-KH1",    descripcion: "EV. abrir puerta" },
  { imei: "=NB1-3W1.2", origen: "=NB1+UC30-3X1", destino: "=NB1+-KH2",    descripcion: "EV. cerrar puerta" },
  { imei: "=NB1-3W1.3", origen: "=NB1+UC30-3X1", destino: "=NB1+-KH3",    descripcion: "EV. apretar puerta" },
  { imei: "=NB1-3W1.4", origen: "=NB1+UC30-3X1", destino: "=NB1+-KH4",    descripcion: "EV. aflojar puerta" },
  { imei: "=NB1-3W2",   origen: "=NB1+UC2-3X2",  destino: "=NB1+UC10-3X2",descripcion: "Manguera de interconexión" },
  { imei: "=NB1-3W2.1", origen: "=NB1+UC10-3X2", destino: "=NB1+-BG1",    descripcion: "Puerta abierta" },
  { imei: "=NB1-3W2.2", origen: "=NB1+UC10-3X2", destino: "=NB1+-BG2",    descripcion: "Puerta cerrada" },
  { imei: "=NB1-3W2.3", origen: "=NB1+UC10-3X2", destino: "=NB1+-BG3",    descripcion: "Puerta apretada lado derecho" },
  { imei: "=NB1-3W2.4", origen: "=NB1+UC10-3X2", destino: "=NB1+-BG4",    descripcion: "Puerta aflojada lado derecho" },
  { imei: "=NB1-3W2.5", origen: "=NB1+UC10-3X2", destino: "=NB1+-BG5",    descripcion: "Puerta apretada lado izquierdo" },
  { imei: "=NB1-3W2.6", origen: "=NB1+UC10-3X2", destino: "=NB1+-BG6",    descripcion: "Puerta aflojada lado izquierdo" },
  { imei: "=NB1-3W3",   origen: "=NB1+UC2-3X3",  destino: "=NB1+UC50-3X3",descripcion: "Manguera de interconexión" },
  // T1 - Distribución tierras
  { imei: "=T1-W1",  origen: "=+UC1-XE1",      destino: "=+UC1-XE2",    descripcion: "Distribución tierras" },
  { imei: "=T1-W2",  origen: "=+UC1-XE1",      destino: "=+UC2-XE1",    descripcion: "Distribución tierras" },
  { imei: "=T1-W3",  origen: "=T1+UC3-XE",     destino: "=+UC1-XE1",    descripcion: "Distribución tierras" },
  { imei: "=T1-W4",  origen: "=T1+UC10-XE",    destino: "=+UC1-XE1",    descripcion: "Distribución tierras" },
  { imei: "=T1-W5",  origen: "=T1+UC20-XE",    destino: "=+UC1-XE1",    descripcion: "Distribución tierras" },
  { imei: "=T1-W6",  origen: "=T1+UC30-XE",    destino: "=+UC1-XE1",    descripcion: "Distribución tierras" },
  { imei: "=T1-W7",  origen: "=T1+UC50-XE1",   destino: "=+UC1-XE1",    descripcion: "Distribución tierras" },
  { imei: "=T1-W8",  origen: "=T1+UC60-XE",    destino: "=+UC1-XE1",    descripcion: "Distribución tierras" },
  { imei: "=T1-W9",  origen: "=T1+UC11-XE1",   destino: "=+UC1-XE1",    descripcion: "Distribución tierras" },
  { imei: "=T1-W10", origen: "=T1+UC12-XE1",   destino: "=+UC1-XE1",    descripcion: "Distribución tierras" },
]

// Flags SAT que difieren de FAT (todos los demás = true,true,true,true)
const SAT_OVERRIDES: Record<string, { cO: boolean|null; tO: boolean|null; tD: boolean|null; cD: boolean|null }> = {
  "=B1-3W4.2":  { cO: null,  tO: null,  tD: null, cD: null  }, // N/A en SAT
  "=EM1-4W6":   { cO: null,  tO: false, tD: true, cD: null  }, // parcialmente conectada en SAT
}

// ── SEÑALES FAT ──────────────────────────────────────────────────────────────
type Senal = { simb: string; ime: string; tipo: string; nombre: string; status: string; comentario?: string }

const SENALES_FAT: Senal[] = [
  // Safety
  { simb: "%I17.3",  ime: "Bool", tipo: "SAFETY_DIGITAL_INPUT",  nombre: "EXCESO_TEMPERATURA",                        status: "OK" },
  { simb: "%I17.1",  ime: "Bool", tipo: "SAFETY_DIGITAL_INPUT",  nombre: "FEEDBACK_EV_PRINCIPAL",                     status: "OK" },
  { simb: "%I24.0",  ime: "Bool", tipo: "SAFETY_DIGITAL_INPUT",  nombre: "ALTA_PRESION_GAS",                          status: "OK" },
  { simb: "%I24.1",  ime: "Bool", tipo: "SAFETY_DIGITAL_INPUT",  nombre: "BAJA_PRESION_GAS",                          status: "OK" },
  { simb: "%I24.2",  ime: "Bool", tipo: "SAFETY_DIGITAL_INPUT",  nombre: "PRESOSTATO_FUGAS_GAS",                      status: "OK" },
  { simb: "%I24.3",  ime: "Bool", tipo: "SAFETY_DIGITAL_INPUT",  nombre: "PRESION_AIRE_COMBUSTION",                   status: "OK" },
  { simb: "%I31.0",  ime: "Bool", tipo: "SAFETY_DIGITAL_INPUT",  nombre: "PRESOSTATO_AIRE_PURGA_QUEMADOR_1",          status: "OK" },
  { simb: "%I31.3",  ime: "Bool", tipo: "SAFETY_DIGITAL_INPUT",  nombre: "DETECCION_LLAMA_QUEMADOR_2",                status: "OK" },
  { simb: "%I31.4",  ime: "Bool", tipo: "SAFETY_DIGITAL_INPUT",  nombre: "PRESOSTATO_FUGAS_EV_GAS_QUEMADOR_1",        status: "OK" },
  { simb: "%I31.5",  ime: "Bool", tipo: "SAFETY_DIGITAL_INPUT",  nombre: "PRESOSTATO_AIRE_PURGA_QUEMADOR_2",          status: "OK" },
  { simb: "%Q45.0",  ime: "Bool", tipo: "SAFETY_DIGITAL_OUTPUT", nombre: "PUERTA_ESCALERA_DESBLOQUEAR_ACTUADOR",      status: "OK" },
  { simb: "%Q45.1",  ime: "Bool", tipo: "SAFETY_DIGITAL_OUTPUT", nombre: "HABILITAR_VALVULAS_DE_GAS",                 status: "OK" },
  { simb: "%Q45.2",  ime: "Bool", tipo: "SAFETY_DIGITAL_OUTPUT", nombre: "HABILITAR_QUEMADOR_1",                      status: "OK" },
  { simb: "%Q50.0",  ime: "Bool", tipo: "SAFETY_DIGITAL_OUTPUT", nombre: "HABILITAR_MOVIMIENTOS_HIDRAULICA",          status: "OK" },
  { simb: "%Q50.3",  ime: "Bool", tipo: "SAFETY_DIGITAL_OUTPUT", nombre: "RESERVA_QA5-QA6",                           status: "N/A" },
  // Analog inputs
  { simb: "%IW55",   ime: "Int",  tipo: "STANDARD_RTC_ANALOG_INPUT", nombre: "TEMPERATURA_REGULACION_BOVEDA",         status: "F/E" },
  { simb: "%IW57",   ime: "Int",  tipo: "STANDARD_RTC_ANALOG_INPUT", nombre: "TEMPERATURA_BAÑO",                      status: "F/E" },
  { simb: "%IW59",   ime: "Int",  tipo: "STANDARD_RTC_ANALOG_INPUT", nombre: "TEMPERATURA_ENTRADA_CALDO",             status: "F/E" },
  { simb: "%IW63",   ime: "Int",  tipo: "STANDARD_RTC_ANALOG_INPUT", nombre: "TEMPERATURA_ARMARIO_FUERZA",            status: "OK" },
  { simb: "%IW65",   ime: "Int",  tipo: "STANDARD_RTC_ANALOG_INPUT", nombre: "TEMPERATURA_ARMARIO_CONTROL",           status: "OK" },
  { simb: "%IW67",   ime: "Int",  tipo: "STANDARD_RTC_ANALOG_INPUT", nombre: "TEMPERATURA_GRUPO_HIDRAULICO",          status: "OK" },
  { simb: "%IW71",   ime: "Int",  tipo: "STANDARD_ANALOG_INPUT",     nombre: "LASER_REGUERA",                         status: "F/E" },
  { simb: "%IW75",   ime: "Int",  tipo: "STANDARD_ANALOG_INPUT",     nombre: "GRADO_INCLINACION_BASCULACION_EJE_Y",   status: "" },
  { simb: "%IW83",   ime: "Int",  tipo: "STANDARD_ANALOG_INPUT",     nombre: "FEEDBACK_POSICION_COMPUERTA_SALIDA_HUMOS", status: "OK" },
  { simb: "%IW87",   ime: "Int",  tipo: "STANDARD_ANALOG_INPUT",     nombre: "TEMPERATURA_CONTADOR_GAS",              status: "OK" },
  { simb: "%IW89",   ime: "Int",  tipo: "STANDARD_ANALOG_INPUT",     nombre: "PRESION_CONTADOR_GAS",                  status: "OK" },
  { simb: "%IW91",   ime: "Int",  tipo: "STANDARD_ANALOG_INPUT",     nombre: "FEEDBACK_SERVO_AIRE_COMBUSTION_QUEMADOR_1", status: "OK" },
  { simb: "%IW93",   ime: "Int",  tipo: "STANDARD_ANALOG_INPUT",     nombre: "TEMPERATURA_TERMOPAR_SEGURIDAD",        status: "OK" },
  { simb: "%IW95",   ime: "Int",  tipo: "STANDARD_ANALOG_INPUT",     nombre: "PRESION_GAS_PREVIA_LIMITADORA_QUEMADOR_1", status: "OK" },
  { simb: "%IW97",   ime: "Int",  tipo: "STANDARD_ANALOG_INPUT",     nombre: "PRESION_GAS_POSTERIOR_LIMITADORA_QUEMADOR_1", status: "OK" },
  { simb: "%IW99",   ime: "Int",  tipo: "STANDARD_ANALOG_INPUT",     nombre: "PRESION_AIRE_QUEMADOR_1",               status: "OK" },
  { simb: "%QW55",   ime: "Int",  tipo: "STANDARD_ANALOG_OUTPUT",    nombre: "CONSIGNA_POSICION_SERVO_AIRE_COMBUSTION_QUEMADOR_1", status: "OK" },
  { simb: "%QW59",   ime: "Int",  tipo: "STANDARD_ANALOG_OUTPUT",    nombre: "CONSIGNA_BASCULACION",                  status: "OK" },
  { simb: "%QW63",   ime: "Int",  tipo: "STANDARD_ANALOG_OUTPUT",    nombre: "CONSIGNA_POSICION_COMPUERTA_SALIDA_HUMOS", status: "OK" },
  // Digital inputs standard
  { simb: "%I0.4",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "ESTADO_MODULO_POTENCIAL_ELECTRONICA",     status: "OK" },
  { simb: "%I0.6",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "ESTADO_MODULO_POTENCIAL_SALIDAS",         status: "OK" },
  { simb: "%I1.1",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "DISPARO_INT_AUT_CIRCUITO_ILUMINACION_Y_REFRIGERACION", status: "OK" },
  { simb: "%I1.2",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "PUERTAS_ABIERTAS_ARMARIO_FUERZA",         status: "OK" },
  { simb: "%I1.3",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "PUERTAS_ABIERTAS_ARMARIO_CONTROL",        status: "OK" },
  { simb: "%I1.4",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "PUERTA_ESCALERA_ACTUADOR_BLOQUEADO",      status: "OK" },
  { simb: "%I1.5",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "PUERTA_ESCALERA_ACTUADOR_INSERTADO",      status: "OK" },
  { simb: "%I1.6",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "PUERTA_ESCALERA_PETICION_APERTURA",       status: "OK" },
  { simb: "%I1.7",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "FEEDBACK_PUERTA_ESCALERA_DESBLOQUEAR_ACTUADOR", status: "OK" },
  { simb: "%I2.1",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "PRESION_LINEA_NEUMATICA_ROTURA_FLEXIBLE", status: "OK" },
  { simb: "%I2.4",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "COMPUERTA_REGULACION_HUMOS_CERRADA",      status: "N/A" },
  { simb: "%I2.5",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "COMPUERTA_SALIDA_HUMOS_PUERTA_ABIERTA",   status: "F/E" },
  { simb: "%I2.6",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "COMPUERTA_SALIDA_HUMOS_PUERTA_CERRADA",   status: "F/E" },
  { simb: "%I3.0",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "DISPARO_INT_AUT_BOMBA_1_GRUPO_HIDRAULICO",status: "OK" },
  { simb: "%I3.1",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "DISPARO_SOBRECARGA_BOMBA_1_GRUPO_HIDRAULICO", status: "OK" },
  { simb: "%I3.2",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "ARRANCADOR_EN_BYPASS_BOMBA_1",            status: "OK" },
  { simb: "%I3.3",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "CONFIRMACION_SECCIONADOR_BOMBA_1",        status: "OK" },
  { simb: "%I3.4",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "DISPARO_INT_AUT_BOMBA_2_GRUPO_HIDRAULICO",status: "OK" },
  { simb: "%I3.5",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "DISPARO_SOBRECARGA_BOMBA_2_GRUPO_HIDRAULICO", status: "OK" },
  { simb: "%I3.7",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "CONFIRMACION_SECCIONADOR_BOMBA_2",        status: "OK" },
  { simb: "%I4.7",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "INDICADOR_FILTRO_RETORNO",                status: "OK" },
  { simb: "%I5.0",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "EXCESO_TEMPERATURA_GRUPO_HIDRAULICO",     status: "OK" },
  { simb: "%I5.1",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "DISPARO_INT_AUT_MOTOR_VENTILADOR_PILOTOS",status: "OK" },
  { simb: "%I5.2",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "CONFIRMACION_MARCHA_MOTOR_VENTILADOR_PILOTOS", status: "OK" },
  { simb: "%I5.3",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "FEEDBACK_HABILITAR_RETORNAR_SIN_TENSION", status: "OK" },
  { simb: "%I5.4",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "HORNO_EN_REPOSO",                         status: "OK" },
  { simb: "%I5.5",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "HORNO_BASCULADO",                         status: "OK" },
  { simb: "%I5.6",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "CONFIRMACION_SECCIONADOR_BOMBA_RECIRCULACION", status: "OK" },
  { simb: "%I6.0",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "PUERTA_ABIERTA",                          status: "OK" },
  { simb: "%I6.1",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "PUERTA_CERRADA",                          status: "OK" },
  { simb: "%I6.3",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "PUERTA_AFLOJADA_LADO_DERECHO",            status: "OK" },
  { simb: "%I6.4",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "PUERTA_APRETADA_LADO_IZQUIERDO",          status: "OK" },
  { simb: "%I6.5",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "PUERTA_AFLOJADA_LADO_IZQUIERDO",          status: "OK" },
  { simb: "%I7.0",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "CONFIRMACION_SECCIONADOR_VENTILADOR_PILOTOS", status: "OK" },
  { simb: "%I7.2",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "CONFIRMACION_SECCIONADOR_VENTILADOR_COMBUSTION", status: "OK" },
  { simb: "%I7.3",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "FEEDBACK_HABILITAR_VALVULAS_GAS",         status: "OK" },
  { simb: "%I7.4",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "FEEDBACK_HABILITAR_QUEMADOR_1",           status: "OK" },
  { simb: "%I7.5",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "SERVO_ABIERTO_AIRE_COMBUSTION_QUEMADOR_1",status: "OK" },
  { simb: "%I7.6",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "SERVO_CERRADO_AIRE_COMBUSTION_QUEMADOR_1",status: "OK" },
  { simb: "%I7.7",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "CONTADOR_GAS",                            status: "NO" },
  { simb: "%I8.0",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "FEEDBACK_HABILITAR_QUEMADOR_2",           status: "OK" },
  { simb: "%I8.1",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "SERVO_ABIERTO_AIRE_COMBUSTION_QUEMADOR_2",status: "OK" },
  { simb: "%I8.2",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "SERVO_CERRADO_AIRE_COMBUSTION_QUEMADOR_2",status: "OK" },
  { simb: "%I8.3",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "PRESOSTATO_LINEA_APRIETE_PUERTA",         status: "NO" },
  { simb: "%I8.4",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "DETECCION_LASER_LIMPIEZA_ZONA_DERECHA",   status: "OK" },
  { simb: "%I8.5",   ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT",  nombre: "DETECCION_LASER_LIMPIEZA_ZONA_IZQUIERDA", status: "OK" },
  // Digital outputs standard
  { simb: "%Q0.0",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "MARCHA_BOMBA_1_GRUPO_HIDRAULICO",         status: "OK" },
  { simb: "%Q0.1",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "MARCHA_BOMBA_2_GRUPO_HIDRAULICO",         status: "OK" },
  { simb: "%Q0.2",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "MARCHA_BOMBA_RECIRCULACION_FLUIDO",       status: "OK" },
  { simb: "%Q0.3",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "EV_PRESURIZAR_GRUPO_HIDRAULICO_1",        status: "OK" },
  { simb: "%Q0.7",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "RESERVA_+UC2-K2",                         status: "N/A" },
  { simb: "%Q1.7",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "EV_CERRAR_SALIDA_HUMOS_PUERTA",           status: "F/E" },
  { simb: "%Q2.0",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "RESERVA_+UC2-K5",                         status: "N/A" },
  { simb: "%Q2.1",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "EV_ABRIR_PUERTA",                         status: "OK" },
  { simb: "%Q2.2",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "EV_CERRAR_PUERTA",                        status: "OK" },
  { simb: "%Q2.3",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "EV_APRETAR_PUERTA",                       status: "OK" },
  { simb: "%Q2.4",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "EV_AFLOJAR_PUERTA",                       status: "OK" },
  { simb: "%Q2.5",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "PUERTA_ABIERTA_LUMINOSO",                 status: "OK" },
  { simb: "%Q2.7",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "RESERVA_+UC2-K6",                         status: "N/A" },
  { simb: "%Q3.0",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "RESERVA_+UC2-K7",                         status: "N/A" },
  { simb: "%Q3.1",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "APAGAR_CERRADURA",                        status: "OK" },
  { simb: "%Q3.3",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "PUERTA_ESCALERA_LUMINOSO",                status: "OK" },
  { simb: "%Q3.4",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "HORNO_BASCULANDO",                        status: "OK" },
  { simb: "%Q3.5",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "ALARMA_LUMINOSA",                         status: "OK" },
  { simb: "%Q3.6",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "ALARMA_SONORA",                           status: "OK" },
  { simb: "%Q4.0",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "EV_RAMPA_GAS_PRINCIPAL",                  status: "OK" },
  { simb: "%Q4.1",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "RESERVA_K9",                              status: "N/A" },
  { simb: "%Q4.2",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "EV_VACIADO",                              status: "OK" },
  { simb: "%Q4.3",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "CHISPA_QUEMADOR_1",                       status: "OK" },
  { simb: "%Q4.5",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "EV_GAS_QUEMADOR_1",                       status: "OK" },
  { simb: "%Q4.6",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "EV_GAS_BYPASS_QUEMADOR_1",                status: "OK" },
  { simb: "%Q5.1",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "CHISPA_QUEMADOR_2",                       status: "OK" },
  { simb: "%Q5.2",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "EV_GAS_SEGURIDAD_QUEMADOR_2",             status: "OK" },
  { simb: "%Q5.3",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "EV_GAS_QUEMADOR_2",                       status: "OK" },
  { simb: "%Q5.4",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "EV_GAS_BYPASS_QUEMADOR_2",                status: "OK" },
  { simb: "%Q5.7",   ime: "Bool", tipo: "STANDARD_DIGITAL_OUTPUT", nombre: "RESERVA_+UC2-K11",                        status: "N/A" },
  // Tapones porosos
  { simb: "%I111.2", ime: "Bool", tipo: "TAPONES_POROSOS", nombre: "PRESOSTATO_TAPON_2",          status: "OK" },
  { simb: "%I111.3", ime: "Bool", tipo: "TAPONES_POROSOS", nombre: "PRESOSTATO_TAPON_3",          status: "OK" },
  { simb: "%I111.4", ime: "Bool", tipo: "TAPONES_POROSOS", nombre: "PRESOSTATO_TAPON_4",          status: "OK" },
  { simb: "%I111.5", ime: "Bool", tipo: "TAPONES_POROSOS", nombre: "PRESOSTATO_TAPON_5",          status: "OK" },
  { simb: "%I111.6", ime: "Bool", tipo: "TAPONES_POROSOS", nombre: "PRESOSTATO_TAPON_6",          status: "OK" },
  { simb: "%Q8.0",   ime: "Bool", tipo: "TAPONES_POROSOS", nombre: "EV_CAUDAL_MINIMO_TAPON_1",    status: "OK" },
  { simb: "%Q8.1",   ime: "Bool", tipo: "TAPONES_POROSOS", nombre: "EV_CAUDAL_MINIMO_TAPON_2",    status: "OK" },
  { simb: "%Q8.2",   ime: "Bool", tipo: "TAPONES_POROSOS", nombre: "EV_CAUDAL_MINIMO_TAPON_3",    status: "OK" },
  { simb: "%Q8.4",   ime: "Bool", tipo: "TAPONES_POROSOS", nombre: "EV_CAUDAL_MINIMO_TAPON_5",    status: "OK" },
  { simb: "%Q8.5",   ime: "Bool", tipo: "TAPONES_POROSOS", nombre: "EV_CAUDAL_MINIMO_TAPON_6",    status: "OK" },
  { simb: "%Q9.0",   ime: "Bool", tipo: "TAPONES_POROSOS", nombre: "EV_DESATASCO_TAPON_3",        status: "OK" },
  { simb: "%Q9.1",   ime: "Bool", tipo: "TAPONES_POROSOS", nombre: "EV_DESATASCO_TAPON_4",        status: "OK" },
  { simb: "%Q9.2",   ime: "Bool", tipo: "TAPONES_POROSOS", nombre: "EV_DESATASCO_TAPON_5",        status: "OK" },
  { simb: "%Q9.3",   ime: "Bool", tipo: "TAPONES_POROSOS", nombre: "EV_DESATASCO_TAPON_6",        status: "OK" },
  { simb: "%Q9.4",   ime: "Bool", tipo: "TAPONES_POROSOS", nombre: "EV_AGITACION_TAPON_1",        status: "OK" },
  { simb: "%Q9.5",   ime: "Bool", tipo: "TAPONES_POROSOS", nombre: "EV_AGITACION_TAPON_2",        status: "OK" },
  { simb: "%Q9.6",   ime: "Bool", tipo: "TAPONES_POROSOS", nombre: "EV_AGITACION_TAPON_3",        status: "OK" },
  { simb: "%Q9.7",   ime: "Bool", tipo: "TAPONES_POROSOS", nombre: "EV_AGITACION_TAPON_4",        status: "OK" },
  { simb: "%Q15.0",  ime: "Bool", tipo: "TAPONES_POROSOS", nombre: "EV_AGITACION_TAPON_5",        status: "OK" },
  { simb: "%Q15.1",  ime: "Bool", tipo: "TAPONES_POROSOS", nombre: "EV_AGITACION_TAPON_6",        status: "OK" },
  { simb: "%IW246",  ime: "Int",  tipo: "TAPONES_POROSOS", nombre: "CAUDALIMETRO_TAPON_1",         status: "OK" },
  { simb: "%IW248",  ime: "Int",  tipo: "TAPONES_POROSOS", nombre: "CAUDALIMETRO_TAPON_2",         status: "OK" },
  { simb: "%IW250",  ime: "Int",  tipo: "TAPONES_POROSOS", nombre: "CAUDALIMETRO_TAPON_3",         status: "" },
  { simb: "%IW252",  ime: "Int",  tipo: "TAPONES_POROSOS", nombre: "CAUDALIMETRO_TAPON_4",         status: "" },
  { simb: "%IW112",  ime: "Int",  tipo: "TAPONES_POROSOS", nombre: "CAUDALIMETRO_TAPON_5",         status: "OK" },
  { simb: "%IW114",  ime: "Int",  tipo: "TAPONES_POROSOS", nombre: "CAUDALIMETRO_TAPON_6",         status: "OK" },
]

// Overrides de estado SAT respecto a FAT
const SAT_SENAL_OVERRIDES: Record<string, Partial<Senal>> = {
  "%I7.7":  { status: "OK" },                          // CONTADOR_GAS: NO→OK
  "%IW55":  { status: "OK" },                          // TEMPERATURA_REGULACION_BOVEDA: F/E→OK
  "%IW57":  { status: "OK" },                          // TEMPERATURA_BAÑO: F/E→OK
  "%IW59":  { status: "N/A" },                         // TEMPERATURA_ENTRADA_CALDO: F/E→N/A
  "%IW71":  { status: "OK" },                          // LASER_REGUERA: F/E→OK
  "%IW75":  { status: "OK" },                          // GRADO_INCLINACION: ""→OK
  "%I2.5":  { status: "OK" },                          // COMPUERTA_SALIDA_HUMOS_ABIERTA: F/E→OK
  "%I2.6":  { status: "OK" },                          // COMPUERTA_SALIDA_HUMOS_CERRADA: F/E→OK
  "%I5.6":  { status: "N/A" },                         // CONFIRMACION_SECCIONADOR_RECIRCULACION: OK→N/A
  "%Q1.7":  { status: "N/A" },                         // EV_CERRAR_SALIDA_HUMOS_PUERTA: F/E→N/A
  "%Q0.0":  { status: "OK", comentario: "GIRO CORRECTO." },
  "%Q0.2":  { status: "OK", comentario: "GIRO CORRECTO." },
}

// Nueva señal SAT que no existe en FAT
const SAT_SENALES_EXTRA: Senal[] = [
  { simb: "%I4.3", ime: "Bool", tipo: "STANDARD_DIGITAL_INPUT", nombre: "INDICADOR_FILTRO_RECIRCULACION", status: "NO" },
]

// ── PRUEBAS FAT ──────────────────────────────────────────────────────────────
type Prueba = { id: string; tipo: string; desc: string; vTeo: string; vReal: string; ok: boolean; comentario?: string }

const PRUEBAS_FAT: Prueba[] = [
  { id: "AIRE COMBUSTION", tipo: "COMBUSTION", desc: "Comprobar apertura y cierre del mecanismo servo de aire", vTeo: "", vReal: "", ok: true },
  { id: "AIRE COMBUSTION", tipo: "COMBUSTION", desc: "Ajustar posiciones (finales de carrera) servo aire combustión", vTeo: "", vReal: "", ok: true },
  { id: "AIRE COMBUSTION", tipo: "COMBUSTION", desc: "Tarar presostato de aire de combustión", vTeo: "75 mbar", vReal: "50 mbar", ok: true },
  { id: "APRIETE PUERTA", tipo: "HIDRAULICA", desc: "Comprobar correcto ajuste de la puerta con respecto a entrada del horno", vTeo: "", vReal: "", ok: true },
  { id: "APRIETE PUERTA", tipo: "HIDRAULICA", desc: "Comprobar tensado de cadenas accionamiento elevación puerta", vTeo: "", vReal: "", ok: true },
  { id: "APRIETE PUERTA", tipo: "HIDRAULICA", desc: "Comprobar nivelación de la puerta", vTeo: "", vReal: "", ok: true },
  { id: "APRIETE PUERTA", tipo: "HIDRAULICA", desc: "Ajustar final de carrera puerta aflojada", vTeo: "valor según plano", vReal: "", ok: true },
  { id: "APRIETE PUERTA", tipo: "HIDRAULICA", desc: "Probar y ajustar velocidad y presión movimiento apriete puerta", vTeo: "2 s.", vReal: "<2\"", ok: true },
  { id: "APRIETE PUERTA", tipo: "HIDRAULICA", desc: "Comprobar separación puerta-frontis", vTeo: "valor según plano", vReal: "", ok: true },
  { id: "APRIETE PUERTA", tipo: "HIDRAULICA", desc: "Comprobar y ajustar en caso necesario el correcto apriete", vTeo: "valor según plano", vReal: "", ok: true },
  { id: "BASCULACION", tipo: "HIDRAULICA", desc: "Comprobación de señales (BASCULACION)", vTeo: "", vReal: "NA", ok: true },
  { id: "BASCULACION", tipo: "HIDRAULICA", desc: "Comprobar conexión válvula paracaídas (Anti-Retorno)", vTeo: "", vReal: "", ok: true },
  { id: "BASCULACION", tipo: "HIDRAULICA", desc: "Comprobar correcta posición del inclinómetro en ejes X e Y", vTeo: "", vReal: "", ok: true },
  { id: "BASCULACION", tipo: "HIDRAULICA", desc: "Comprobar funcionamiento de retorno sin tensión", vTeo: "", vReal: "", ok: true },
  { id: "CLAPETA HUMOS", tipo: "NEUMATICA", desc: "Ajuste presión alimentación aire comprimido", vTeo: "2 bar", vReal: "", ok: true },
  { id: "CLAPETA HUMOS", tipo: "NEUMATICA", desc: "Comprobar señal posicionador 4-20 mA clapeta cerrada", vTeo: "", vReal: "", ok: true },
  { id: "CLAPETA HUMOS", tipo: "NEUMATICA", desc: "Comprobar señal posicionador 4-20 mA clapeta abierta", vTeo: "", vReal: "", ok: true },
  { id: "CLAPETA HUMOS", tipo: "NEUMATICA", desc: "Abrir clapeta de humos", vTeo: "2 s.", vReal: "<3\"", ok: true },
  { id: "CLAPETA HUMOS", tipo: "NEUMATICA", desc: "Cerrar clapeta de humos", vTeo: "2 bar / 2 s.", vReal: "<3\"", ok: true },
  { id: "COMBUSTION SIN REGENERATIVOS", tipo: "COMBUSTION", desc: "Comprobar orientación de los quemadores", vTeo: "", vReal: "VISUALMENTE", ok: true },
  { id: "ELEVACION PUERTA", tipo: "HIDRAULICA", desc: "Ajustar final de carrera puerta arriba", vTeo: "", vReal: "", ok: true },
  { id: "ELEVACION PUERTA", tipo: "HIDRAULICA", desc: "Comprobar posición de puerta arriba", vTeo: "", vReal: "", ok: true },
  { id: "ELEVACION PUERTA", tipo: "HIDRAULICA", desc: "Probar y ajustar velocidades movimiento subir puerta", vTeo: "14 S", vReal: "15\"", ok: true },
  { id: "ELEVACION PUERTA", tipo: "HIDRAULICA", desc: "Ajustar final de carrera puerta abajo", vTeo: "", vReal: "", ok: true },
  { id: "ELEVACION PUERTA", tipo: "HIDRAULICA", desc: "Probar y ajustar velocidades movimiento bajar puerta", vTeo: "12 S", vReal: "", ok: true },
  { id: "ELEVACION PUERTA", tipo: "HIDRAULICA", desc: "Enclavar la puerta en los topes manuales antes de soldar definitivamente", vTeo: "", vReal: "", ok: true },
  { id: "FLUXADO TUBERIA", tipo: "HIDRAULICA", desc: "Preparar los lazos para realizar el fluxing", vTeo: "", vReal: "", ok: true },
  { id: "FLUXADO TUBERIA", tipo: "HIDRAULICA", desc: "Realizar el fluxing", vTeo: "", vReal: "", ok: true },
  { id: "FLUXADO TUBERIA", tipo: "HIDRAULICA", desc: "Montar circuito hidraulico quitando lazos para fluxado", vTeo: "", vReal: "", ok: true },
  { id: "FLUXADO TUBERIA", tipo: "HIDRAULICA", desc: "Comprobar que no haya fugas en uniones tuberías", vTeo: "", vReal: "", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Comprobar sentido de giro bomba 1", vTeo: "", vReal: "", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Ajustar y comprobar señal del termostato", vTeo: "alta Tª 50ºC // muy alta Tª 65ºC", vReal: "55ºC", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Verificar tipo de aceite para límites de temperatura", vTeo: "", vReal: "", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Comprobar presión del acumulador de la línea de apriete", vTeo: "", vReal: "", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Comprobar sentido de giro bomba de recirculación", vTeo: "", vReal: "", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Comprobar sentido de giro bomba 2", vTeo: "", vReal: "", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Encender bomba 2 sin presurizar - medir presión en toma minimex", vTeo: "Presión de valor reducido (<5 bar aprox)", vReal: "", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Encender bomba 1 sin presurizar - medir presión en toma minimex", vTeo: "20bar", vReal: "", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Medir intensidad por fase del motor bomba 2", vTeo: "L1:11,1A /L2:11,5A /L3:10,3A", vReal: "L1:28,5A L2:30A L3:31A", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Comprobar y ajustar temperatura inicio/fin refrigeración (PT100)", vTeo: "inicio 55ºC // fin 40ºC", vReal: "45ºC / 30ºC", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Comprobar señal temperatura PT100", vTeo: "", vReal: "", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Parametrizar aviso y alarma temperatura aceite hidráulico", vTeo: "aviso 50ºC // alarma 65ºC", vReal: "", ok: true },
  { id: "MECANISMOS NEUMATICOS", tipo: "NEUMATICA", desc: "Comprobar líneas/elementos esquema vs diseño", vTeo: "", vReal: "", ok: true },
  { id: "MECANISMOS NEUMATICOS", tipo: "NEUMATICA", desc: "Comprobar fugas en uniones", vTeo: "", vReal: "", ok: true },
  { id: "MECANISMOS NEUMATICOS", tipo: "NEUMATICA", desc: "Ajustar presostato baja presión", vTeo: "5 bar", vReal: "", ok: true },
  { id: "MECANISMOS NEUMATICOS", tipo: "NEUMATICA", desc: "Ajustar presión de trabajo", vTeo: "8 bar", vReal: "", ok: true },
  { id: "SECUENCIA DE ARRANQUE", tipo: "COMBUSTION", desc: "Inspección alojamiento de bujía", vTeo: "", vReal: "", ok: true },
  { id: "SECUENCIA DE ARRANQUE", tipo: "COMBUSTION", desc: "Comprobar fugas tubería de gas", vTeo: "", vReal: "NO HAY GAS", ok: false },
  { id: "SECUENCIA DE ARRANQUE", tipo: "COMBUSTION", desc: "Comprobar señal detectores de llama", vTeo: "", vReal: "", ok: true },
  { id: "SECUENCIA DE ARRANQUE", tipo: "COMBUSTION", desc: "Ajustar mínimo del quemador", vTeo: "", vReal: "NA", ok: false },
  { id: "SECUENCIA DE ARRANQUE", tipo: "COMBUSTION", desc: "Configurar parámetro en pantalla apertura servo aire encendido", vTeo: "", vReal: "", ok: true },
  { id: "SECUENCIA DE ARRANQUE", tipo: "COMBUSTION", desc: "Ajustar PID termopar de baño", vTeo: "", vReal: "", ok: false },
  { id: "SECUENCIA DE ARRANQUE", tipo: "COMBUSTION", desc: "Ajustar PID termopar de bóveda", vTeo: "", vReal: "", ok: false },
  { id: "SECUENCIA DE ARRANQUE", tipo: "COMBUSTION", desc: "Ajustar tiempo de seguridad encendido quemadores", vTeo: "", vReal: "", ok: false },
  { id: "SENSORICA 4.0", tipo: "CAPTURA DATOS", desc: "Confirmar conexión captura de datos 4.0", vTeo: "", vReal: "", ok: false },
  { id: "TALLER ELECTRICO", tipo: "ELECTRICO", desc: "Prueba armarios (checklist armarios)", vTeo: "", vReal: "", ok: true },
  { id: "TALLER ELECTRICO", tipo: "ELECTRICO", desc: "Cargar configuraciones de variadores", vTeo: "", vReal: "", ok: true },
  { id: "TALLER ELECTRICO", tipo: "ELECTRICO", desc: "Ajuste de aparamenta", vTeo: "", vReal: "", ok: true },
  { id: "TALLER ELECTRICO", tipo: "ELECTRICO", desc: "Documento tipo check-list listado de señales (hidráulica, combustión, sensórica, inclinometro...)", vTeo: "", vReal: "", ok: true },
  { id: "TALLER ELECTRICO", tipo: "ELECTRICO", desc: "PLC (conexión de PLC - visualizar)", vTeo: "", vReal: "", ok: true },
  { id: "TAPONES POROSOS", tipo: "NEUMATICA", desc: "Comprobación de fugas", vTeo: "", vReal: "", ok: false },
  { id: "TAPONES POROSOS", tipo: "NEUMATICA", desc: "Presión de entrada", vTeo: "6 Bar", vReal: "", ok: false },
  { id: "TAPONES POROSOS", tipo: "NEUMATICA", desc: "Presión por línea", vTeo: "", vReal: "", ok: false },
  { id: "TAPONES POROSOS", tipo: "NEUMATICA", desc: "Comprobación en tapones que sale aire con agua jabonosa", vTeo: "", vReal: "", ok: false },
]

// ── PRUEBAS SAT ──────────────────────────────────────────────────────────────
const PRUEBAS_SAT: Prueba[] = [
  { id: "AIRE COMBUSTION", tipo: "COMBUSTION", desc: "Línea ventilador aire pilotos (arranque, sentido giro, intensidad por fase, presión de línea)", vTeo: "", vReal: "1,5/1,5/1,5 A", ok: true },
  { id: "AIRE COMBUSTION", tipo: "COMBUSTION", desc: "Tarar presostato de aire de combustión", vTeo: "75 mbar", vReal: "75", ok: true },
  { id: "AIRE COMBUSTION", tipo: "COMBUSTION", desc: "Comprobar sentido de giro ventilador combustión", vTeo: "", vReal: "", ok: true },
  { id: "BASCULACION", tipo: "HIDRAULICA", desc: "Comprobación de señales (BASCULACION)", vTeo: "", vReal: "NA", ok: true },
  { id: "COMBUSTION SIN REGENERATIVOS", tipo: "COMBUSTION", desc: "Ajustar JUMO, señal y alarmas (secado)", vTeo: "", vReal: "", ok: true, comentario: "Ajustado según tabla automatizacion" },
  { id: "COMBUSTION SIN REGENERATIVOS", tipo: "COMBUSTION", desc: "Comprobar termopares de bóveda", vTeo: "", vReal: "", ok: true },
  { id: "COMBUSTION SIN REGENERATIVOS", tipo: "COMBUSTION", desc: "Comprobar termopar de baño (conexión directa PLC)", vTeo: "", vReal: "", ok: true },
  { id: "ELEVACION PUERTA", tipo: "HIDRAULICA", desc: "Comprobar posición de engrasadores", vTeo: "", vReal: "", ok: true, comentario: "ESTAN EN SU SITIO" },
  { id: "ELEVACION PUERTA", tipo: "HIDRAULICA", desc: "Con puerta aflojada y abajo, comprobar posición inferior", vTeo: "", vReal: "", ok: true },
  { id: "ELEVACION PUERTA", tipo: "HIDRAULICA", desc: "Probar y ajustar velocidades movimiento subir puerta", vTeo: "14 S", vReal: "25s", ok: true, comentario: "es el máximo de velocidad" },
  { id: "GAS", tipo: "COMBUSTION", desc: "Ajustar presión entrada gas en acometida", vTeo: "120 mbar", vReal: "150mbar", ok: true, comentario: "El plano indica 150mbar" },
  { id: "GAS", tipo: "COMBUSTION", desc: "Presostato baja presión de gas", vTeo: "100 mbar", vReal: "", ok: true },
  { id: "GAS", tipo: "COMBUSTION", desc: "Presostato de fugas", vTeo: "75 mbar", vReal: "", ok: true },
  { id: "GAS", tipo: "COMBUSTION", desc: "Presostato alta presión de gas", vTeo: "200 mbar", vReal: "200", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Comprobar no haya fugas en uniones", vTeo: "", vReal: "", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Comprobar nivel mínimo aceite marcado antes de empezar", vTeo: "85 bar", vReal: "", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Comprobar conexiones del bloque hidráulico vs cilindros campo según esquema", vTeo: "", vReal: "", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Comprobar presión del acumulador línea apriete puerta", vTeo: "", vReal: "", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Encender bomba 1 sin presurizar - presión toma minimex", vTeo: "20bar", vReal: "5-78bar", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Encender bomba 2 sin presurizar - presión toma minimex", vTeo: "Presión de valor reducido (<5 bar aprox)", vReal: "8-108bar", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Medir intensidad por fase del motor bomba 2", vTeo: "L1:11,1A /L2:11,5A /L3:10,3A", vReal: "10,8/11/10,8A", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Medir intensidad por fase del motor bomba recirculación", vTeo: "L1:0,6A /L2:0,5A /L3:0,6A", vReal: "1,4/1,5/1,5", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Medir intensidad por fase del motor bomba 1", vTeo: "L1:10,97A /L2:10,9A /L3:10,2A", vReal: "14,3A/15,0A/14,5A", ok: true },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Comprobar/ajustar tarado limitadora de presión", vTeo: "", vReal: "160bar", ok: true, comentario: "No se tuvo que ajustar nada" },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Comprobar señal filtro retorno grupo hidráulico", vTeo: "", vReal: "", ok: false, comentario: "faltan las pipetas correctas" },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Comprobar señal filtro recirculación grupo hidráulico", vTeo: "", vReal: "", ok: false, comentario: "faltan las pipetas correctas" },
  { id: "GRUPO HIDRÁULICO", tipo: "HIDRAULICA", desc: "Ajustar temperatura inicio/fin refrigeración (PT100)", vTeo: "inicio 55ºC // fin 40ºC", vReal: "50/40", ok: true },
  { id: "SECUENCIA DE ARRANQUE", tipo: "COMBUSTION", desc: "Inspección alojamiento de bujía", vTeo: "", vReal: "", ok: true },
  { id: "SECUENCIA DE ARRANQUE", tipo: "COMBUSTION", desc: "Extraer bujías y comprobar chispa", vTeo: "", vReal: "", ok: true },
  { id: "SECUENCIA DE ARRANQUE", tipo: "COMBUSTION", desc: "Verificando alineamiento de agujeros pasantes", vTeo: "", vReal: "", ok: true },
  { id: "SECUENCIA DE ARRANQUE", tipo: "COMBUSTION", desc: "Comprobar fugas tubería de gas", vTeo: "", vReal: "", ok: true },
  { id: "SECUENCIA DE ARRANQUE", tipo: "COMBUSTION", desc: "Comprobar señal detectores de llama", vTeo: "", vReal: "", ok: true },
  { id: "SECUENCIA DE ARRANQUE", tipo: "COMBUSTION", desc: "Ajustar tiempo de control de fugas", vTeo: "2 min", vReal: "", ok: false, comentario: "Pendiente ajustar en PEM en caliente" },
  { id: "SECUENCIA DE ARRANQUE", tipo: "COMBUSTION", desc: "Ajustar tiempo de purga", vTeo: "4 min", vReal: "", ok: false, comentario: "Pendiente ajustar en PEM en caliente" },
  { id: "SECUENCIA DE ARRANQUE", tipo: "COMBUSTION", desc: "Ajustar tiempo alarma llama intempestiva", vTeo: "2s", vReal: "", ok: false, comentario: "Pendiente ajustar en PEM en caliente" },
  { id: "SECUENCIA DE ARRANQUE", tipo: "COMBUSTION", desc: "Ajustar tiempo de seguridad encendido de quemadores", vTeo: "20min", vReal: "", ok: false, comentario: "Pendiente ajustar en PEM en caliente" },
  { id: "SECUENCIA DE ARRANQUE", tipo: "COMBUSTION", desc: "Ajustar mínimo del quemador", vTeo: "5%", vReal: "", ok: true },
  { id: "SECUENCIA DE ARRANQUE", tipo: "COMBUSTION", desc: "Ajustar tiempo de seguridad encendido de quemadores (PEM)", vTeo: "5min", vReal: "", ok: false, comentario: "Pendiente ajustar en PEM en caliente" },
  { id: "SENSORICA 4.0", tipo: "CAPTURA DATOS", desc: "Confirmar conexión captura de datos 4.0", vTeo: "", vReal: "", ok: true },
  { id: "TALLER ELECTRICO", tipo: "ELECTRICO", desc: "Prueba armarios (checklist armarios)", vTeo: "", vReal: "", ok: true },
  { id: "TALLER ELECTRICO", tipo: "ELECTRICO", desc: "Cargar configuraciones de variadores", vTeo: "", vReal: "", ok: true },
  { id: "TALLER ELECTRICO", tipo: "ELECTRICO", desc: "Ajuste de aparamenta", vTeo: "", vReal: "", ok: true },
  { id: "TALLER ELECTRICO", tipo: "ELECTRICO", desc: "Documento tipo check-list listado de señales", vTeo: "", vReal: "", ok: true },
  { id: "TALLER ELECTRICO", tipo: "ELECTRICO", desc: "PLC (conexión de PLC - visualizar)", vTeo: "", vReal: "", ok: true },
  { id: "TAPONES POROSOS", tipo: "NEUMATICA", desc: "Comprobación de fugas", vTeo: "", vReal: "", ok: true },
  { id: "TAPONES POROSOS", tipo: "NEUMATICA", desc: "Presión de entrada", vTeo: "6 Bar", vReal: "6,4 Bar", ok: true },
  { id: "TAPONES POROSOS", tipo: "NEUMATICA", desc: "Presión por línea", vTeo: "", vReal: "ajustado a 3bar", ok: true },
  { id: "TAPONES POROSOS", tipo: "NEUMATICA", desc: "Comprobación en tapones que sale aire con agua jabonosa", vTeo: "", vReal: "", ok: true },
]

async function main() {
  console.log("Insertando datos ARZYZ 12720-H01...")

  const proyecto = await db.proyecto.findUnique({ where: { orden_idh: { orden: 12720, idh: "H01" } } })
  if (!proyecto) throw new Error("Proyecto ARZYZ no encontrado — ejecuta el seed primero")

  const yaData = await db.manguera.count({ where: { proyectoId: proyecto.id } })
  if (yaData > 0) {
    console.log(`Ya hay ${yaData} mangueras. Borrando datos existentes del proyecto...`)
    await db.historicoAvance.deleteMany({ where: { proyectoId: proyecto.id } })
    await db.signalRecord.deleteMany({ where: { proyectoId: proyecto.id } })
    await db.protocoloPrueba.deleteMany({ where: { proyectoId: proyecto.id } })
    await db.manguera.deleteMany({ where: { proyectoId: proyecto.id } })
  }

  // ── FAT MANGUERAS ──────────────────────────────────────────────────────────
  console.log(`Insertando ${MANGUERAS_FAT.length} mangueras FAT...`)
  for (const m of MANGUERAS_FAT) {
    await db.manguera.create({
      data: {
        proyectoId: proyecto.id, fase: "FAT",
        imei: m.imei, origen: m.origen, destino: m.destino, descripcion: m.descripcion,
        conectadoEnOrigen: true, tendidoEnOrigen: true, tendidoEnDestino: true, conectadoEnDestino: true,
        createdBy: BY, updatedBy: BY,
      },
    })
  }

  // ── SAT MANGUERAS ──────────────────────────────────────────────────────────
  console.log(`Insertando ${MANGUERAS_FAT.length} mangueras SAT...`)
  for (const m of MANGUERAS_FAT) {
    const ov = SAT_OVERRIDES[m.imei]
    await db.manguera.create({
      data: {
        proyectoId: proyecto.id, fase: "SAT",
        imei: m.imei, origen: m.origen, destino: m.destino, descripcion: m.descripcion,
        conectadoEnOrigen:  ov ? ov.cO : true,
        tendidoEnOrigen:    ov ? ov.tO : true,
        tendidoEnDestino:   ov ? ov.tD : true,
        conectadoEnDestino: ov ? ov.cD : true,
        createdBy: BY, updatedBy: BY,
      },
    })
  }

  // ── FAT SEÑALES ────────────────────────────────────────────────────────────
  console.log(`Insertando ${SENALES_FAT.length} señales FAT...`)
  for (const s of SENALES_FAT) {
    await db.signalRecord.create({
      data: {
        proyectoId: proyecto.id, fase: "FAT",
        simbolico: s.simb, ime: s.ime, tipoSenhal: s.tipo,
        signalName: s.nombre, checkedStatus: s.status,
        comentarios: s.comentario ?? null,
        createdBy: BY, updatedBy: BY,
      },
    })
  }

  // ── SAT SEÑALES ────────────────────────────────────────────────────────────
  const satSenales = SENALES_FAT.map(s => {
    const ov = SAT_SENAL_OVERRIDES[s.simb]
    return ov ? { ...s, ...ov } : s
  }).concat(SAT_SENALES_EXTRA)

  console.log(`Insertando ${satSenales.length} señales SAT...`)
  for (const s of satSenales) {
    await db.signalRecord.create({
      data: {
        proyectoId: proyecto.id, fase: "SAT",
        simbolico: s.simb, ime: s.ime, tipoSenhal: s.tipo,
        signalName: s.nombre, checkedStatus: s.status,
        comentarios: s.comentario ?? null,
        createdBy: BY, updatedBy: BY,
      },
    })
  }

  // ── FAT PRUEBAS ────────────────────────────────────────────────────────────
  console.log(`Insertando ${PRUEBAS_FAT.length} pruebas FAT...`)
  for (const p of PRUEBAS_FAT) {
    await db.protocoloPrueba.create({
      data: {
        proyectoId: proyecto.id, fase: "FAT",
        identificador: p.id, tipo: p.tipo, descripcion: p.desc,
        valorTeorico: p.vTeo || null, valorReal: p.vReal || null,
        comprobado: p.ok,
        comentarios: p.comentario ?? null,
        createdBy: BY, updatedBy: BY,
      },
    })
  }

  // ── SAT PRUEBAS ────────────────────────────────────────────────────────────
  console.log(`Insertando ${PRUEBAS_SAT.length} pruebas SAT...`)
  for (const p of PRUEBAS_SAT) {
    await db.protocoloPrueba.create({
      data: {
        proyectoId: proyecto.id, fase: "SAT",
        identificador: p.id, tipo: p.tipo, descripcion: p.desc,
        valorTeorico: p.vTeo || null, valorReal: p.vReal || null,
        comprobado: p.ok,
        comentarios: p.comentario ?? null,
        createdBy: BY, updatedBy: BY,
      },
    })
  }

  // ── HISTÓRICO AVANCE ───────────────────────────────────────────────────────
  console.log("Insertando histórico de avance...")
  // tF=tendido FAT, cF=conectado FAT (tendido precede a conectado en el flujo real)
  const histData = [
    { fecha: "2026-02-01", fat: 10.0, sat:  8.0, total:  9.0, mF: 10.0, tF: 16.0, cF:  8.0, sF:  7.0, mSp: 8.5,  mSpf: 8.7,  sS:  6.0 },
    { fecha: "2026-02-15", fat: 25.0, sat: 20.0, total: 22.5, mF: 26.0, tF: 36.0, cF: 22.0, sF: 20.0, mSp:22.0,  mSpf:22.5,  sS: 16.0 },
    { fecha: "2026-03-01", fat: 45.0, sat: 38.0, total: 41.5, mF: 47.0, tF: 60.0, cF: 44.0, sF: 38.0, mSp:42.0,  mSpf:43.0,  sS: 30.0 },
    { fecha: "2026-03-15", fat: 60.0, sat: 55.0, total: 57.5, mF: 63.0, tF: 76.0, cF: 60.0, sF: 53.0, mSp:65.0,  mSpf:66.0,  sS: 44.0 },
    { fecha: "2026-04-01", fat: 72.0, sat: 68.0, total: 70.0, mF: 76.0, tF: 88.0, cF: 74.0, sF: 63.0, mSp:82.0,  mSpf:83.0,  sS: 55.0 },
    { fecha: "2026-04-15", fat: 82.0, sat: 78.0, total: 80.0, mF: 87.0, tF: 95.0, cF: 85.0, sF: 72.0, mSp:93.0,  mSpf:94.0,  sS: 65.0 },
    { fecha: "2026-05-01", fat: 88.0, sat: 91.0, total: 89.5, mF: 95.0, tF: 99.0, cF: 93.0, sF: 80.0, mSp:96.49, mSpf:96.64, sS: 86.0 },
    { fecha: "2026-05-10", fat: 91.0, sat: 95.0, total: 93.0, mF:100.0, tF:100.0, cF:100.0, sF: 82.0, mSp:99.3,  mSpf:96.64, sS: 91.0 },
    { fecha: "2026-05-19", fat: 92.6, sat: 96.6, total: 94.6, mF:100.0, tF:100.0, cF:100.0, sF: 85.3, mSp:99.3,  mSpf:96.64, sS: 93.9 },
  ]
  for (const h of histData) {
    await db.historicoAvance.create({
      data: {
        proyectoId: proyecto.id,
        fecha: new Date(h.fecha),
        porcentajeFat:            h.fat,
        porcentajeManguerasFat:   h.mF,
        porcentajeTendidoFat:     h.tF,
        porcentajeConectadoFat:   h.cF,
        porcentajeSenalesFat:     h.sF,
        porcentajePruebasFat:     0,
        porcentajeSat:            h.sat,
        porcentajeManguerasSat:   h.mSp,
        porcentajeManguerasPfSat: h.mSpf,
        porcentajeSenalesSat:     h.sS,
        porcentajePruebasSat:     0,
        porcentajeTotal:          h.total,
        createdBy: BY,
      },
    })
  }

  // Resumen
  const totMang = await db.manguera.count({ where: { proyectoId: proyecto.id } })
  const totSen  = await db.signalRecord.count({ where: { proyectoId: proyecto.id } })
  const totPru  = await db.protocoloPrueba.count({ where: { proyectoId: proyecto.id } })
  console.log(`✅ ARZYZ insertado: ${totMang} mangueras | ${totSen} señales | ${totPru} pruebas`)
}

main().catch(console.error).finally(() => db.$disconnect())

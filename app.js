import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/vision_bundle.mjs";
const video = document.getElementById("webcam");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const statusTexto = document.getElementById("status");
const car = document.getElementById("carro");
const rodas = document.getElementsByClassName("roda");
const hitbox = document.getElementById("hitbox");
const pontuacao = document.getElementById("pontos");
const velocidade = document.getElementById("velocidade");
const taxaInclinacao = document.getElementById("inclinacao");

let w = false, s = false, a = false, d = false;
let pontos = 0;
let vel = 0.1;
let rotacao = 0;
// let inclinacaoVolante = 0;


let handLandmarker = null;
let maos = [];

const obstaculos = [
    document.getElementById("obs1"),
    document.getElementById("obs2"),
];

const coletaveis = [
    document.getElementById("obs3"),
    document.getElementById("obs4"),
];

async function carregarModelo() {
    try {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );

        handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 2
        });

        statusTexto.innerText = "Modelo Carregado! Pronto para detetar.";
        statusTexto.style.color = "green";

    } catch (erro) {
        statusTexto.innerText = "Erro ao carregar o modelo de IA.";
        statusTexto.style.color = "red";
        console.error(erro);
    }
}

function iniciarCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((erro) => {
            console.error("Erro ao tentar iniciar a câmera automaticamente:", erro);
            alert("Para o jogo funcionar, você precisa permitir o acesso à câmera.");
        });
}

video.addEventListener("loadeddata", () => {
    detectarMaos();
});


function detectarMaos(){
    if (!handLandmarker){
        requestAnimationFrame(detectarMaos);
        return;
    }

    let maosFechadas = false;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    

    const estadoAtual = performance.now();
    const resultado = handLandmarker.detectForVideo(video, estadoAtual);

    const maos = resultado.landmarks;
    const cores = ["red", "blue"];

    maos.forEach((mao, indice) => {
        for (const ponto of mao){
            const x = ponto.x * canvas.width;
            const y = ponto.y * canvas.height;

            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = cores[indice];
            ctx.fill();
        }
    });

    

    if (maos.length > 1) {        
        const mao1 = maos[0];
        const mao2 = maos[1];

        const maoFechada = verificarMaoFechada(mao1) && verificarMaoFechada(mao2);

        if (maoFechada){
            console.log("ativou");
            w = true;
            const maoDireita = mao1[4].x > mao2[4].x ? mao1 : mao2;
            const maoEsquerda = maoDireita === mao1 ? mao2 : mao1;

            const yDireita = maoDireita[4].y;
            const yEsquerda = maoEsquerda[4].y;
            
            if (Math.abs(yDireita - yEsquerda) > 0.05) {
                if (yDireita < yEsquerda) {
                    d = true;
                    a = false;
                    console.log("Mão Direita está mais ALTA que a Mão Esquerda");
                    console.log("Inclinação: " + (yDireita - yEsquerda).toFixed(2));
                } else {
                    a = true;
                    d = false;
                    console.log("Mão Esquerda está mais ALTA que a Mão Direita");
                    console.log("Inclinação: " + (yDireita - yEsquerda).toFixed(2));
                }   
            }
            else {
                console.log("Sem inclinação"); 
                a = false;
                d = false;
            }
        } else {
            w = false;
            console.log("desativou");

        }
    } 
    else {
        w = false;
        s = false;
        a = false;
        d = false;
    }

    requestAnimationFrame(detectarMaos);

}


function checarColisao() {
    const posicaoCarro = new THREE.Vector3();
    hitbox.object3D.getWorldPosition(posicaoCarro);

    for (const obstaculo of obstaculos) {
        const posicaoObstaculo = new THREE.Vector3();
        obstaculo.object3D.getWorldPosition(posicaoObstaculo);

        const distanciaX = Math.abs(posicaoCarro.x - posicaoObstaculo.x);
        const distanciaZ = Math.abs(posicaoCarro.z - posicaoObstaculo.z);

        if (distanciaX < 1 && distanciaZ < 1) return true;
    }
    return false;
}

function checarColetaveis() {
    const posicaoCarro = new THREE.Vector3();
    hitbox.object3D.getWorldPosition(posicaoCarro);

    for (const coletavel of coletaveis) {
        const posicaoColetavel = new THREE.Vector3();
        coletavel.object3D.getWorldPosition(posicaoColetavel);

        const distanciaX = Math.abs(posicaoCarro.x - posicaoColetavel.x);
        const distanciaZ = Math.abs(posicaoCarro.z - posicaoColetavel.z);

        if (distanciaX < 0.8 && distanciaZ < 0.8) {
            pontos++;
            coletavel.parentNode.removeChild(coletavel);
            coletaveis.splice(coletaveis.indexOf(coletavel), 1); 
        }
    }
}


function keyPressed(e) {
    if (e.key == 'w' || e.key == 'W') w = true;
    if (e.key == 's' || e.key == 'S') s = true;
    if (e.key == 'a' || e.key == 'A') a = true;
    if (e.key == 'd' || e.key == 'D') d = true;
}

function keyOut(e) {
    if (e.key == 'w' || e.key == 'W') w = false;
    if (e.key == 's' || e.key == 'S') s = false;
    if (e.key == 'a' || e.key == 'A') a = false;
    if (e.key == 'd' || e.key == 'D') d = false;
}

document.addEventListener('keydown', keyPressed);
document.addEventListener('keyup', keyOut);

function update() {
    const obj = car.object3D;

    if (vel > 0) vel -= 0.001;
    if (vel < 0) vel += 0.001;

    if (a == false && rotacao > 0) rotacao -= 0.001;
    if (d == false && rotacao < 0) rotacao += 0.001;
    
    if (a) { if (rotacao < 0.018) rotacao += 0.001;}
    if (d){ if (rotacao > -0.018) rotacao -= 0.001;}

    if (w){if (vel < 0.4) vel += 0.2;}
    if (s){if (vel > -0.4) vel -= 0.2;}
    
    if (!w && !s) {
        if (vel > 0.001) vel -= 0.0008;
        else if (vel < -0.001) vel += 0.0008;
        else vel = 0;
    }

    if (vel !== 0) {
        obj.translateX(vel);
        obj.rotateY(rotacao * (vel >= 0 ? 1 : -1));
        if (checarColisao()) {
            obj.translateX(-vel);
            vel = 0;
        } else {
            for (let i = 0; i < rodas.length; i++) rodas[i].object3D.rotateY( 0.25 * vel * 600 );
        }
    }
    
    // HUB
    pontuacao.innerText = `${pontos}`;
    velocidade.innerText = `${((vel / 0.4) * 100).toFixed(0)} km/h`;    
    taxaInclinacao.innerText = `${(rotacao * (180 / Math.PI)).toFixed(2)}°`;

    checarColetaveis();
    requestAnimationFrame(update);
}

function verificarMaoFechada(mao) {
    const yPolegar = mao[4].y;

    const acimaIndicador = yPolegar < mao[8].y;
    const acimaMedio     = yPolegar < mao[12].y;
    const acimaAnelar    = yPolegar < mao[16].y;
    const acimaMinimo    = yPolegar < mao[20].y;

    return acimaIndicador || acimaMedio || acimaAnelar || acimaMinimo;
}


iniciarCamera();
carregarModelo();
update();


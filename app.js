
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

const obstaculos = [
    document.getElementById("obs1"),
    document.getElementById("obs2"),
];

const coletaveis = [
    document.getElementById("obs3"),
    document.getElementById("obs4"),
];

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
    
    if (a) {
        if (rotacao < 0.018) rotacao += 0.001;
        // obj.rotateY(rotacao * (vel >= 0 ? 1 : -1));
    }
    
    if (d){
        if (rotacao > -0.018) rotacao -= 0.001;
        // obj.rotateY(rotacao * (vel >= 0 ? 1 : -1));
    }

    // if (d) obj.rotateY(-0.018 * (vel >= 0 ? 1 : -1));

    if (w){if (vel < 0.4) vel += 0.002;}
    if (s){if (vel > -0.4) vel -= 0.002;}
    
    if (!w && !s) {
        if (vel > 0.001) vel -= 0.002;
        else if (vel < -0.001) vel += 0.002;
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
    

    pontuacao.innerText = `${pontos}`;
    velocidade.innerText = `${Math.pow((vel * (100 / 4)), 2).toFixed(0)} NPx/m`;
    inclinacao.innerText = `${(rotacao * (180 / Math.PI)).toFixed(2)}°`;
    checarColetaveis();
    requestAnimationFrame(update);
}

update();


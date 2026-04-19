const car = document.getElementById("carro");
const rodas = document.getElementsByClassName("roda");

let w = false;
let s = false;
let a = false;
let d = false;

function keyPressed(entrada){
    //frente e trás
    if (entrada.key == 'w' || entrada.key == 'W'){
        w = true;
    }
    if (entrada.key == 's' || entrada.key == 'S'){
        s = true;
    }
    //esquerda e direita
    if (entrada.key == 'a' || entrada.key == 'A'){
        a = true;
    }
    if (entrada.key == 'd' || entrada.key == 'D'){
        d = true;
    }
}

function keyOut(entrada){
    //frente e trás
    if (entrada.key == 'w'){
        w = false;
    }
    if (entrada.key == 's'){
        s = false;
    }
    
    //esquerda e direita
    if (entrada.key == 'a'){
        a = false;
    }
    if (entrada.key == 'd'){
        d = false;
    }
}

document.addEventListener('keydown', keyPressed);
document.addEventListener('keyup', keyOut);

function update(){
    const obj = car.object3D;
    //mudar direção
    if (a) {
        obj.rotation.y += 0.01;
    }
    if (d){
        obj.rotation.y -= 0.01;
    }
    //andar 
    if(w){
        obj.translateX(0.25);
        for(var i = 0; i < rodas.length; i++){
            rodas[i].object3D.rotateY(-0.25);
        }
    }
    if(s){
        obj.translateX(-0.25);
        for(var i = 0; i < rodas.length; i++){
            rodas[i].object3D.rotateY(0.25);
        }
    }
    requestAnimationFrame(update);
    
}



update();
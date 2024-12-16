let fileInput = document.getElementById("fileInput");
const inputCanvas = document.getElementById("inputCanvas");
let cropper;


// Função para adicionar IMG para tratamento ou leitura
fileInput.addEventListener("change", (evento) => { 
    const file = evento.target.files[0];
    let inputCanvas = document.getElementById("inputCanvas");
    if (file) {
        inputCanvas.src = URL.createObjectURL(file); // exibe a imagem original na página

    }
}, false);

inputCanvas.onload = function (){
    // Inicializa o Cropper na imagem carregada
    if (cropper) {
        cropper.destroy(); // Remove instâncias antigas do Cropper, se existirem
    }
    cropper = new Cropper(inputCanvas, {
        aspectRatio: 0, // Proporção (altere conforme necessário)
        viewMode: 1,    // Modo de visualização
    });
}

document.getElementById("cropButton").addEventListener("click", () => {
    image_cropper();
    code_reader();
})

document.getElementById("reset").addEventListener("click", () => {
    reset();
})

// Função para deixar a imagem em preto e branco
function img_2_gray(){ 
    // Lê os componentes que vão servir para receber ou exibir as imagens
    let inputCanvas = document.getElementById("inputCanvas");
    let outputCanvas = document.getElementById("outputCanvas");

    let mat = new cv.imread(inputCanvas); // Variável para receber a imagem em uma matriz
    cv.cvtColor(mat, mat, cv.COLOR_RGB2GRAY); // Processa a imagem para tons de cinza
    cv.imshow(outputCanvas, mat); // Exibe a imagem na página
    mat.delete(); // Deleta para abrir espaço na memória
}

// Função para detectar formas geométricas
function detect_shapes(){
    // Lê os componentes que vão servir para receber ou exibir as imagens
    let inputCanvas = document.getElementById("inputCanvas");
    let outputCanvas = document.getElementById("outputCanvas");

    // Variáveis
    let src = cv.imread(outputCanvas); // método original:inputCanvas
    let gray = new cv.Mat();
    let binary = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    
    cv.cvtColor(src, gray, cv.COLOR_RGB2GRAY); // Processa a imagem para tons de cinza
    cv.threshold(gray, binary, 50, 255, cv.THRESH_BINARY); // Limiariza a imagem ( pega imagem cinza e converte em binário)
    cv.findContours(binary, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE); // Marca contornos na imagem binária
    
    for (let i = 0; i < contours.size(); i++){ // Desenha todos os contornos definidos
        let color = new cv.Scalar(255, 0, 0, 255);
        cv.drawContours(src, contours, i, color, 2, cv.LINE_8, hierarchy, 0);
    }

    cv.imshow(outputCanvas, src); // Exibe a imagem na página

    // Deleta para abrir espaço na memória
    src.delete();
    gray.delete();
    binary.delete();
    contours.delete();
    hierarchy.delete();
}

// Detecta uma região específica da imagem
function detect_region(){
    // Lê os componentes que vão servir para receber ou exibir as imagens
    let inputCanvas = document.getElementById("inputCanvas");
    let outputCanvas = document.getElementById("outputCanvas");

    let src = cv.imread(inputCanvas);

    // Define o ROI (Region of Interest)
    // (x, y, width, height)
    let roiRect = new cv.Rect(5, 5, 250, 250);
    let roi = src.roi(roiRect);

    let gray = new cv.Mat();
    cv.cvtColor(roi, gray, cv.COLOR_RGB2GRAY);

    cv.imshow(outputCanvas, roi);

    src.delete();
    roi.delete();
    gray.delete();
}

// Leitor de QR-Code
function code_reader(){
    // Lê os componentes que vão servir para receber ou exibir as imagens
    let inputCanvas = document.getElementById("inputCanvas");
    let outputCanvas = document.getElementById("outputCanvas");

    // // Define o tamanho do canvas para a imagem carregada
    // outputCanvas.width = inputCanvas.naturalWidth;
    // outputCanvas.height = inputCanvas.naturalHeight;

    // Desenha a imagem no canvas
    const ctx = outputCanvas.getContext("2d");
    ctx.drawImage(outputCanvas, 0, 0, outputCanvas.naturalWidth, outputCanvas.naturalHeight); // método original: 3 inputCanvas 

    // Extrai os dados da imagem do canvas
    const imageData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);

    // Usa jsQR para detectar e decodificar o QR Code
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
        console.log(`QR-Code Detectado.`);
        if(code.data.startsWith("http")){
            console.log(`Link: ${code.data}`);
            let content = document.getElementById("conteudo")
            content.textContent = `Link: ${code.data}`

        } else if( code.data.startsWith("{") && code.data.endsWith("}") ){
            // const jsonData = JSON.parse(code.data);
            console.log(`JSON: ${code.data}`);
            let content = document.getElementById("conteudo")
            content.textContent = `JSON: ${code.data}`
        }
        else{
            console.log(`Texto: ${code.data}`);
            let content = document.getElementById("conteudo")
            content.textContent = `Texto: ${code.data}`

        }
        drawBox(code.location, ctx); // Função teste para localizar na imagem qual é o QR-Code lido na imagem.
    } else {
        console.log("Nenhum QR-Code detectado.");
        let content = document.getElementById("conteudo")
        content.textContent = "Nenhum QR-Code detectado."
    }
}

// Função para desenhar em volta do QR-code localizado
function drawBox(location, ctx) {
    if (!location) return;

    ctx.beginPath();
    ctx.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
    ctx.lineTo(location.topRightCorner.x, location.topRightCorner.y);
    ctx.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
    ctx.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
    ctx.closePath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "red";
    ctx.stroke();
}

// Função para recorte de imagem
function image_cropper(){
    if (cropper) {
        const canvas = cropper.getCroppedCanvas(); // Obtém a área recortada
        const croppedCanvas = document.getElementById("outputCanvas");

        // Exibe a imagem recortada no canvas de saída
        const ctx = croppedCanvas.getContext("2d");
        croppedCanvas.width = canvas.width;
        croppedCanvas.height = canvas.height;
        ctx.drawImage(canvas, 0, 0);
    } else {
        console.error("Cropper não inicializado.");
    }
}

// Função para limpar a imagem da página
function reset(){
    let fileInput = document.getElementById("fileInput");
    let inputCanvas = document.getElementById("inputCanvas");
    let outputCanvas = document.getElementById("outputCanvas");
    let content = document.getElementById("conteudo");

    fileInput.value = null;
    inputCanvas.src = "";
    outputCanvas.src = "";
    content.textContent = "";
    
    if (typeof cropper !== 'undefined' && cropper) {
        cropper.destroy(); // Remove instâncias antigas do Cropper, se existirem
    }
}

// Função para ler gabarito
function template_reader() {

}
document.addEventListener("DOMContentLoaded", () => {
    // 5 niveles: cada uno con su imagen, música y tamaño de cuadrícula
    const levels = [
      { image: "img1.jpg", music: "music1.mp3", gridSize: 1 },
      { image: "img2.jpg", music: "music2.mp3", gridSize: 2 },
      { image: "img3.jpg", music: "music3.mp3", gridSize: 3 },
      { image: "img4.jpg", music: "music4.mp3", gridSize: 4 },
      { image: "img5.jpg", music: "music5.mp3", gridSize: 5 }
    ];
  
    let currentLevel = 0;
    const boardContainer = document.getElementById("board-container");
    const piecesContainer = document.getElementById("pieces-container");
    const checkButton = document.getElementById("check-button");
    const nextLevelButton = document.getElementById("next-level");
    const backgroundMusic = document.getElementById("background-music");
  
    // Tablero fijo: 300px en móviles, 400px en escritorio
    const boardDimension = window.innerWidth < 600 ? 300 : 400;
  
    // Para habilitar música en móviles
    document.addEventListener('touchstart', function initMusic() {
      backgroundMusic.play().catch(err => console.log("Autoplay bloqueado:", err));
      document.removeEventListener('touchstart', initMusic);
    });
  
    // Cargar un nivel
    function loadLevel() {
      const levelData = levels[currentLevel];
      const gridSize = levelData.gridSize;
      const pieceSize = boardDimension / gridSize; // Cada pieza se escala
  
      // Música del nivel
      backgroundMusic.src = "assets/music/" + levelData.music;
      backgroundMusic.play().catch(err => console.log("Error audio:", err));
  
      // Limpiar contenedores
      boardContainer.innerHTML = "";
      piecesContainer.innerHTML = "";
  
      // Configurar tablero con dimensiones fijas
      boardContainer.style.gridTemplateColumns = `repeat(${gridSize}, ${pieceSize}px)`;
      boardContainer.style.gridTemplateRows = `repeat(${gridSize}, ${pieceSize}px)`;
      boardContainer.style.width = boardDimension + "px";
      boardContainer.style.height = boardDimension + "px";
  
      // Crear celdas del tablero
      for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.style.width = pieceSize + "px";
        cell.style.height = pieceSize + "px";
        cell.dataset.correct = i;
        cell.addEventListener("dragover", dragOver);
        cell.addEventListener("drop", dropPiece);
        boardContainer.appendChild(cell);
      }
  
      // Crear las piezas del puzzle
      let pieces = [];
      for (let i = 0; i < gridSize * gridSize; i++) {
        const piece = document.createElement("div");
        piece.classList.add("puzzle-piece");
        piece.style.width = pieceSize + "px";
        piece.style.height = pieceSize + "px";
        piece.dataset.index = i;
        piece.draggable = true;
        piece.addEventListener("dragstart", dragStart);
        // Doble click en PC para devolver la pieza al contenedor
        piece.addEventListener("dblclick", () => piecesContainer.appendChild(piece));
  
        // Eventos touch (móvil)
        piece.addEventListener("touchstart", touchStart, { passive: false });
        piece.addEventListener("touchmove", touchMove, { passive: false });
        piece.addEventListener("touchend", touchEnd, { passive: false });
  
        // Asignar imagen y recorte
        piece.style.backgroundImage = `url(assets/images/${levelData.image})`;
        piece.style.backgroundSize = `${boardDimension}px ${boardDimension}px`;
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        piece.style.backgroundPosition = `-${col * pieceSize}px -${row * pieceSize}px`;
  
        pieces.push(piece);
      }
  
      // Mezclar y mostrar piezas
      pieces.sort(() => Math.random() - 0.5);
      pieces.forEach(piece => piecesContainer.appendChild(piece));
    }
  
    // Lógica drag & drop (mouse)
    let draggedPiece = null;
    function dragStart(e) {
      draggedPiece = e.target;
    }
    function dragOver(e) {
      e.preventDefault();
    }
    function dropPiece(e) {
      e.preventDefault();
      const cell = e.currentTarget;
      if (cell && cell.classList.contains("cell") && cell.children.length === 0) {
        cell.appendChild(draggedPiece);
        draggedPiece = null;
      }
    }
  
    // Lógica touch
    let touchOffsetX = 0, touchOffsetY = 0;
    function touchStart(e) {
      e.preventDefault();
      const touch = e.touches[0];
      draggedPiece = e.target;
      const rect = draggedPiece.getBoundingClientRect();
      touchOffsetX = touch.clientX - rect.left;
      touchOffsetY = touch.clientY - rect.top;
      draggedPiece.style.position = 'absolute';
      draggedPiece.style.zIndex = 1000;
    }
    function touchMove(e) {
      e.preventDefault();
      const touch = e.touches[0];
      draggedPiece.style.left = (touch.clientX - touchOffsetX) + 'px';
      draggedPiece.style.top = (touch.clientY - touchOffsetY) + 'px';
    }
    function touchEnd(e) {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const boardRect = boardContainer.getBoundingClientRect();
      const gridSize = levels[currentLevel].gridSize;
      const pieceSize = boardDimension / gridSize;
  
      // Verificar si se soltó dentro del tablero
      if (touch.clientX >= boardRect.left && touch.clientX <= boardRect.right &&
          touch.clientY >= boardRect.top && touch.clientY <= boardRect.bottom) {
        const relativeX = touch.clientX - boardRect.left;
        const relativeY = touch.clientY - boardRect.top;
        const col = Math.floor(relativeX / pieceSize);
        const row = Math.floor(relativeY / pieceSize);
        const cellIndex = row * gridSize + col;
        const cell = boardContainer.children[cellIndex];
        if (cell && cell.children.length === 0) {
          cell.appendChild(draggedPiece);
        } else {
          piecesContainer.appendChild(draggedPiece);
        }
      } else {
        piecesContainer.appendChild(draggedPiece);
      }
      // Restaurar estilos
      draggedPiece.style.position = '';
      draggedPiece.style.left = '';
      draggedPiece.style.top = '';
      draggedPiece = null;
    }
  
    // Verificar puzzle
    checkButton.addEventListener("click", () => {
      const cells = boardContainer.children;
      let correct = true;
      for (let cell of cells) {
        if (cell.children.length === 0) {
          correct = false;
          break;
        }
        const piece = cell.children[0];
        if (piece.dataset.index !== cell.dataset.correct) {
          correct = false;
          break;
        }
      }
      if (correct) {
        if (currentLevel === levels.length - 1) {
          // Último nivel: cambiar música a music6.mp3 y mostrar collage final
          backgroundMusic.src = "assets/music/music6.mp3";
          backgroundMusic.play().catch(err => console.log("Error music6:", err));
          showFinalMessage();
        } else {
          alert("¡Felicidades, completaste el rompecabezas!");
          nextLevelButton.style.display = "block";
        }
      } else {
        alert("Aún faltan piezas o algunas están mal ubicadas.");
      }
    });
  
    // Siguiente nivel
    nextLevelButton.addEventListener("click", () => {
      currentLevel++;
      if (currentLevel < levels.length) {
        nextLevelButton.style.display = "none";
        loadLevel();
      } else {
        alert("¡Has completado todos los niveles!");
      }
    });
  
    // Collage final estilo "4 esquinas + 1 en el centro" sin espacios.
    // El mensaje va debajo del collage, en un recuadro aparte.
    function showFinalMessage() {
      // 1) Limpiar el tablero y el contenedor de piezas.
      boardContainer.innerHTML = "";
      piecesContainer.innerHTML = "";
      checkButton.style.display = "none";
      nextLevelButton.style.display = "none";
  
      // 2) Mantener el tablero del mismo tamaño, sin overflow
      boardContainer.style.width = boardDimension + "px";
      boardContainer.style.height = boardDimension + "px";
      boardContainer.style.position = "relative";
      boardContainer.style.overflow = "hidden";
  
      // 3) Crear un contenedor que ocupe todo el tablero (position:relative).
      const collageContainer = document.createElement("div");
      collageContainer.style.position = "relative";
      collageContainer.style.width = "100%";
      collageContainer.style.height = "100%";
  
      // Función para crear imágenes
      function createCollageImg(src, styles={}) {
        const img = document.createElement("img");
        img.src = "assets/images/" + src;
        img.style.position = "absolute";
        img.style.objectFit = "cover";
        img.style.width = "50%";  // la mitad del contenedor
        img.style.height = "50%";
        // Aplicar estilos extra (posiciones, transform, zIndex)
        for (let key in styles) {
          img.style[key] = styles[key];
        }
        return img;
      }
  
      // 3.1) Cuatro esquinas (img1, img2, img3, img4)
      const img1 = createCollageImg(levels[0].image, { top: "0", left: "0" });
      const img2 = createCollageImg(levels[1].image, { top: "0", right: "0" });
      const img3 = createCollageImg(levels[2].image, { bottom: "0", left: "0" });
      const img4 = createCollageImg(levels[3].image, { bottom: "0", right: "0" });
      // 3.2) Imagen central superpuesta (img5)
      const img5 = createCollageImg(levels[4].image, {
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: "1"
      });
  
      collageContainer.appendChild(img1);
      collageContainer.appendChild(img2);
      collageContainer.appendChild(img3);
      collageContainer.appendChild(img4);
      collageContainer.appendChild(img5);
  
      // Insertar el collage en el tablero
      boardContainer.appendChild(collageContainer);
  
      // 4) Crear un contenedor para el mensaje debajo del tablero
      const finalMessageBox = document.createElement("div");
      finalMessageBox.style.marginTop = "15px";  // separación debajo del collage
      finalMessageBox.style.padding = "10px";
      finalMessageBox.style.border = "2px solid #d63384";
      finalMessageBox.style.borderRadius = "10px";
      finalMessageBox.style.width = boardDimension + "px"; // mismo ancho que el tablero
      finalMessageBox.style.margin = "15px auto";          // centrado
  
      // 4.1) Mensaje con fuente More Sugar
      const messageDiv = document.createElement("div");
      messageDiv.innerText = "INFOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO XDDDDDDDDD";
      messageDiv.style.fontFamily = "'More Sugar', cursive, sans-serif";
      messageDiv.style.fontSize = "20px";
      messageDiv.style.color = "#d63384";
      messageDiv.style.textAlign = "center";
  
      finalMessageBox.appendChild(messageDiv);
  
      // 5) Agregar el recuadro del mensaje debajo del tablero
      const gameContainer = document.getElementById("game-container");
      gameContainer.appendChild(finalMessageBox);
    }
  
    // Iniciar el primer nivel
    loadLevel();
  });
  
document.addEventListener("DOMContentLoaded", () => {
    // Niveles: cada objeto tiene imagen, música y gridSize (cantidad de filas/columnas).
    const levels = [
      { image: "img1.jpg", music: "music1.mp3", gridSize: 2 },
      { image: "img2.jpg", music: "music2.mp3", gridSize: 3 },
      { image: "img3.jpg", music: "music3.mp3", gridSize: 4 },
      { image: "img4.jpg", music: "music4.mp3", gridSize: 5 },
      { image: "img5.jpg", music: "music5.mp3", gridSize: 6 }
    ];
    
    let currentLevel = 0;
    const boardContainer = document.getElementById("board-container");
    const piecesContainer = document.getElementById("pieces-container");
    const checkButton = document.getElementById("check-button");
    const nextLevelButton = document.getElementById("next-level");
    const backgroundMusic = document.getElementById("background-music");
  
    // Para activar la música en móviles (evitar restricción de autoplay)
    document.addEventListener('touchstart', function initMusic() {
      backgroundMusic.play().catch(err => console.log("Error al reproducir música:", err));
      document.removeEventListener('touchstart', initMusic);
    });
    
    function loadLevel() {
      const levelData = levels[currentLevel];
      const gridSize = levelData.gridSize;
      const pieceSize = window.innerWidth < 600 ? 80 : 100;
      
      // Actualizar la música del nivel
      backgroundMusic.src = "assets/music/" + levelData.music;
      backgroundMusic.play().catch(err => console.log("Error al reproducir música:", err));
      
      // Limpiar contenedores
      boardContainer.innerHTML = "";
      piecesContainer.innerHTML = "";
      
      // Configurar tablero: columnas, filas y ancho exacto
      boardContainer.style.gridTemplateColumns = `repeat(${gridSize}, ${pieceSize}px)`;
      boardContainer.style.gridTemplateRows = `repeat(${gridSize}, ${pieceSize}px)`;
      boardContainer.style.width = `${gridSize * pieceSize}px`;
      
      // Crear celdas (drop zones)
      for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.style.width = pieceSize + "px";
        cell.style.height = pieceSize + "px";
        cell.dataset.correct = i; // Índice correcto
        cell.addEventListener("dragover", dragOver);
        cell.addEventListener("drop", dropPiece);
        boardContainer.appendChild(cell);
      }
      
      // Crear las piezas del rompecabezas
      let pieces = [];
      for (let i = 0; i < gridSize * gridSize; i++) {
        const piece = document.createElement("div");
        piece.classList.add("puzzle-piece");
        piece.style.width = pieceSize + "px";
        piece.style.height = pieceSize + "px";
        piece.dataset.index = i; // Posición correcta
        piece.draggable = true;
        piece.addEventListener("dragstart", dragStart);
        // Eventos touch para móviles
        piece.addEventListener("touchstart", touchStart, {passive: false});
        piece.addEventListener("touchmove", touchMove, {passive: false});
        piece.addEventListener("touchend", touchEnd, {passive: false});
        
        // Asignar la imagen y calcular la porción visible
        piece.style.backgroundImage = `url(assets/images/${levelData.image})`;
        const totalSize = gridSize * pieceSize;
        piece.style.backgroundSize = `${totalSize}px ${totalSize}px`;
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        piece.style.backgroundPosition = `-${col * pieceSize}px -${row * pieceSize}px`;
        
        pieces.push(piece);
      }
      
      // Mezclar las piezas aleatoriamente y agregarlas al contenedor
      pieces.sort(() => Math.random() - 0.5);
      pieces.forEach(piece => piecesContainer.appendChild(piece));
    }
    
    let draggedPiece = null;
    
    // Eventos para arrastrar con mouse (desktop)
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
    
    // Variables para touch
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
    
    // Nueva implementación para touchEnd: calcular la celda en base a la posición relativa al tablero
    function touchEnd(e) {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const boardRect = boardContainer.getBoundingClientRect();
      const pieceSize = window.innerWidth < 600 ? 80 : 100;
      // Verificar si se soltó dentro del tablero
      if (touch.clientX >= boardRect.left && touch.clientX <= boardRect.right &&
          touch.clientY >= boardRect.top && touch.clientY <= boardRect.bottom) {
        const relativeX = touch.clientX - boardRect.left;
        const relativeY = touch.clientY - boardRect.top;
        const col = Math.floor(relativeX / pieceSize);
        const row = Math.floor(relativeY / pieceSize);
        const gridSize = levels[currentLevel].gridSize;
        const cellIndex = row * gridSize + col;
        const cell = boardContainer.children[cellIndex];
        if (cell && cell.children.length === 0) {
          cell.appendChild(draggedPiece);
        } else {
          piecesContainer.appendChild(draggedPiece);
        }
      } else {
        // Si se suelta fuera del tablero, regresar la pieza al contenedor
        piecesContainer.appendChild(draggedPiece);
      }
      // Restaurar estilos de la pieza
      draggedPiece.style.position = '';
      draggedPiece.style.left = '';
      draggedPiece.style.top = '';
      draggedPiece = null;
    }
    
    // Verificar si el rompecabezas está armado correctamente
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
          alert("Eres la luz que ilumina mi camino, la inspiración que me impulsa a seguir adelante. Te amo con todo mi ser, mi pequeña. - ALizon");
        } else {
          alert("¡Felicidades, completaste el rompecabezas!");
          nextLevelButton.style.display = "block";
        }
      } else {
        alert("Aún faltan piezas o algunas están mal ubicadas.");
      }
    });
    
    nextLevelButton.addEventListener("click", () => {
      currentLevel++;
      if (currentLevel < levels.length) {
        nextLevelButton.style.display = "none";
        loadLevel();
      } else {
        alert("¡Has completado todos los niveles!");
      }
    });
    
    loadLevel();
  });
  
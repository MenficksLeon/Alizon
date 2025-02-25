document.addEventListener("DOMContentLoaded", () => {
    // Definición de niveles: cada objeto contiene la imagen, la música y el tamaño de la cuadrícula.
    const levels = [
      { image: "img1.png", music: "music1.mp3", gridSize: 2 },
      { image: "img2.png", music: "music2.mp3", gridSize: 3 },
      { image: "img3.png", music: "music3.mp3", gridSize: 4 },
      { image: "img4.png", music: "music4.mp3", gridSize: 5 },
      { image: "img5.png", music: "music5.mp3", gridSize: 6 }
    ];
    
    let currentLevel = 0;
    const boardContainer = document.getElementById("board-container");
    const piecesContainer = document.getElementById("pieces-container");
    const checkButton = document.getElementById("check-button");
    const nextLevelButton = document.getElementById("next-level");
    const backgroundMusic = document.getElementById("background-music");
  
    // Para activar la música en móviles (evita bloqueo de autoplay)
    document.addEventListener('touchstart', function initMusic() {
      backgroundMusic.play().catch(err => console.log("Error al reproducir música:", err));
      document.removeEventListener('touchstart', initMusic);
    });
    
    function loadLevel() {
      const levelData = levels[currentLevel];
      const gridSize = levelData.gridSize;
      // Tamaño de pieza: 80px en móviles, 100px en escritorio
      const pieceSize = window.innerWidth < 600 ? 80 : 100;
      
      // Actualizar la música del nivel
      backgroundMusic.src = "assets/music/" + levelData.music;
      backgroundMusic.play().catch(err => console.log("Error al reproducir música:", err));
      
      // Limpiar contenedores
      boardContainer.innerHTML = "";
      piecesContainer.innerHTML = "";
      
      // Configurar el tablero: definir columnas, filas y ancho exacto
      boardContainer.style.gridTemplateColumns = `repeat(${gridSize}, ${pieceSize}px)`;
      boardContainer.style.gridTemplateRows = `repeat(${gridSize}, ${pieceSize}px)`;
      boardContainer.style.width = `${gridSize * pieceSize}px`;
      
      // Crear las celdas (drop zones) en el tablero
      for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.style.width = pieceSize + "px";
        cell.style.height = pieceSize + "px";
        cell.dataset.correct = i; // Posición correcta para la pieza
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
        piece.dataset.index = i; // Índice correcto de la pieza
        piece.draggable = true;
        piece.addEventListener("dragstart", dragStart);
        // Eventos touch para dispositivos móviles
        piece.addEventListener("touchstart", touchStart, {passive: false});
        piece.addEventListener("touchmove", touchMove, {passive: false});
        piece.addEventListener("touchend", touchEnd, {passive: false});
        
        // Asignar la imagen del nivel actual y calcular la parte visible (background)
        piece.style.backgroundImage = `url(assets/images/${levelData.image})`;
        const totalSize = gridSize * pieceSize;
        piece.style.backgroundSize = `${totalSize}px ${totalSize}px`;
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        piece.style.backgroundPosition = `-${col * pieceSize}px -${row * pieceSize}px`;
        
        pieces.push(piece);
      }
      
      // Mezclar las piezas aleatoriamente y agregarlas al contenedor de piezas
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
    
    // Variables para manejo de touch
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
      let dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
      // Buscar hacia arriba en el DOM hasta encontrar una celda
      while (dropTarget && !dropTarget.classList.contains("cell")) {
        dropTarget = dropTarget.parentElement;
      }
      if (dropTarget && dropTarget.children.length === 0) {
        dropTarget.appendChild(draggedPiece);
      } else {
        // Si no se encontró una celda válida, regresar la pieza al contenedor de piezas
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
  
document.addEventListener("DOMContentLoaded", () => {
    // Definición de niveles: cada objeto contiene la imagen, música y el tamaño de la cuadrícula.
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
    
    function loadLevel() {
      // Obtener datos del nivel actual
      const levelData = levels[currentLevel];
      const gridSize = levelData.gridSize;
      
      // Determinar el tamaño de la pieza según el dispositivo (80px para móviles, 100px para escritorio)
      const pieceSize = window.innerWidth < 600 ? 80 : 100;
      
      // Actualizar música del nivel
      backgroundMusic.src = "assets/music/" + levelData.music;
      backgroundMusic.play();
      
      // Limpiar contenedores
      boardContainer.innerHTML = "";
      piecesContainer.innerHTML = "";
      
      // Configurar el tablero: establecer columnas, filas y ancho exacto para eliminar espacios laterales
      boardContainer.style.gridTemplateColumns = `repeat(${gridSize}, ${pieceSize}px)`;
      boardContainer.style.gridTemplateRows = `repeat(${gridSize}, ${pieceSize}px)`;
      boardContainer.style.width = `${gridSize * pieceSize}px`;
      
      // Crear las celdas del tablero
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
        
        // Asignar la imagen del nivel actual
        piece.style.backgroundImage = `url(assets/images/${levelData.image})`;
        // Ajustar el tamaño total de la imagen para que se divida en piezas iguales
        const totalSize = gridSize * pieceSize;
        piece.style.backgroundSize = `${totalSize}px ${totalSize}px`;
        
        // Calcular la posición de la pieza en la imagen
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
    function dragStart(e) {
      draggedPiece = e.target;
    }
    
    function dragOver(e) {
      e.preventDefault();
    }
    
    function dropPiece(e) {
      e.preventDefault();
      const cell = e.target;
      // Permitir soltar solo en celdas vacías
      if (cell.classList.contains("cell") && cell.children.length === 0) {
        cell.appendChild(draggedPiece);
        draggedPiece = null;
      }
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
          // Mensaje final mejorado
          alert("Eres la fuerza que ilumina mi camino, la inspiración que me impulsa a seguir adelante cada día. Te amo profundamente, mi pequeña. - ALizon");
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
  
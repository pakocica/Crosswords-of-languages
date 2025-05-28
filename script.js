document.addEventListener('DOMContentLoaded', () => {
    console.log('Spanish Crossword Game script loaded!');

    const vocabulary = {
        colors: [
            { word: "ROJO", clue: "Color of an apple (red)" },
            { word: "AZUL", clue: "Color of the sky (blue)" },
            { word: "VERDE", clue: "Color of grass (green)" },
            { word: "AMARILLO", clue: "Color of a banana (yellow)" },
            { word: "NARANJA", clue: "Color of an orange (orange)" }
        ],
        animals: [
            { word: "PERRO", clue: "Man's best friend (dog)" },
            { word: "GATO", clue: "A feline pet (cat)" },
            { word: "PAJARO", clue: "A flying animal (bird)" },
            { word: "CABALLO", clue: "An animal you can ride (horse)" },
            { word: "LEON", clue: "King of the jungle (lion)" }
        ],
        food: [
            { word: "PAN", clue: "Bread" },
            { word: "AGUA", clue: "Water" },
            { word: "MANZANA", clue: "Apple" },
            { word: "QUESO", clue: "Cheese" },
            { word: "ARROZ", clue: "Rice" }
        ]
    };

    const topicSelect = document.getElementById('topic-select');
    const topics = [
        { name: "Select a topic...", value: "" },
        { name: "Colors (Colores)", value: "colors" },
        { name: "Animals (Animales)", value: "animals" },
        { name: "Food (Comida)", value: "food" }
    ];

    topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic.value;
        option.textContent = topic.name;
        if (topic.value === "") {
            option.disabled = true;
            option.selected = true;
        }
        topicSelect.appendChild(option);
    });

    topicSelect.addEventListener('change', (event) => {
        const selectedTopicValue = event.target.value;
        if (selectedTopicValue) {
            console.log(`Topic selected: ${selectedTopicValue}`);
            loadVocabulary(selectedTopicValue);
        }
    });

    let currentPuzzle = null; 

    function loadVocabulary(topic) {
        const wordsForTopic = vocabulary[topic];
        if (wordsForTopic) {
            console.log(`Vocabulary for ${topic}:`, wordsForTopic);
            generateCrossword(wordsForTopic); 
        } else {
            console.error(`No vocabulary found for topic: ${topic}`);
            document.getElementById('grid-container').innerHTML = `<p>Could not load vocabulary for ${topic}.</p>`;
        }
        document.getElementById('across-clues').innerHTML = '';
        document.getElementById('down-clues').innerHTML = '';
    }

    function generateCrossword(words) {
        console.log("Attempting to generate crossword for:", words);
        if (!words || words.length === 0) {
            document.getElementById('grid-container').innerHTML = "<p>No words provided for crossword.</p>";
            return;
        }

        const gridSize = 15; 
        let grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
        let placedWords = [];

        words.sort((a, b) => b.word.length - a.word.length);

        const firstWord = words[0];
        const startRow = Math.floor(gridSize / 2);
        const startCol = Math.floor((gridSize - firstWord.word.length) / 2);

        if (startCol < 0) {
            console.error("First word is too long for the grid.");
            document.getElementById('grid-container').innerHTML = "<p>Error: Word too long for grid.</p>";
            return;
        }

        for (let i = 0; i < firstWord.word.length; i++) {
            grid[startRow][startCol + i] = firstWord.word[i];
        }
        const firstWordData = {
            word: firstWord.word,
            clue: firstWord.clue,
            row: startRow,
            col: startCol,
            direction: 'across',
            id: `word-${placedWords.length}`
        };
        placedWords.push(firstWordData);

        for (let i = 1; i < words.length; i++) {
            let currentWord = words[i];
            let placed = false;
            for (let j = 0; j < placedWords.length; j++) {
                let existingWord = placedWords[j];
                for (let k = 0; k < currentWord.word.length; k++) { 
                    let newWordChar = currentWord.word[k];
                    for (let l = 0; l < existingWord.word.length; l++) { 
                        let existingWordChar = existingWord.word[l];

                        if (newWordChar === existingWordChar) {
                            let tempRow, tempCol;
                            let canPlace = true;

                            if (existingWord.direction === 'across') {
                                tempRow = existingWord.row - k;
                                tempCol = existingWord.col + l;

                                for (let m = 0; m < currentWord.word.length; m++) {
                                    if (tempRow + m < 0 || tempRow + m >= gridSize ||
                                        (grid[tempRow + m][tempCol] !== '' && grid[tempRow + m][tempCol] !== currentWord.word[m]) ||
                                        (grid[tempRow + m][tempCol] === '' && (
                                            (tempCol > 0 && grid[tempRow + m][tempCol - 1] !== '') ||
                                            (tempCol < gridSize - 1 && grid[tempRow + m][tempCol + 1] !== '')
                                        )) && m !== k 
                                    ) {
                                        canPlace = false;
                                        break;
                                    }
                                }
                                if (canPlace) {
                                    for (let m = 0; m < currentWord.word.length; m++) {
                                        grid[tempRow + m][tempCol] = currentWord.word[m];
                                    }
                                    const newWordData = {
                                        word: currentWord.word,
                                        clue: currentWord.clue,
                                        row: tempRow,
                                        col: tempCol,
                                        direction: 'down',
                                        id: `word-${placedWords.length}`
                                    };
                                    placedWords.push(newWordData);
                                    placed = true;
                                    break;
                                }
                            } else { 
                                tempRow = existingWord.row + l;
                                tempCol = existingWord.col - k;

                                for (let m = 0; m < currentWord.word.length; m++) {
                                    if (tempCol + m < 0 || tempCol + m >= gridSize ||
                                        (grid[tempRow][tempCol + m] !== '' && grid[tempRow][tempCol + m] !== currentWord.word[m]) ||
                                        (grid[tempRow][tempCol + m] === '' && (
                                          (tempRow > 0 && grid[tempRow -1][tempCol + m] !== '') ||
                                          (tempRow < gridSize -1 && grid[tempRow + 1][tempCol + m] !== '')  
                                        )) && m !== k
                                    ) {
                                        canPlace = false;
                                        break;
                                    }
                                }
                                if (canPlace) {
                                    for (let m = 0; m < currentWord.word.length; m++) {
                                        grid[tempRow][tempCol + m] = currentWord.word[m];
                                    }
                                    const newWordData = {
                                        word: currentWord.word,
                                        clue: currentWord.clue,
                                        row: tempRow,
                                        col: tempCol,
                                        direction: 'across',
                                        id: `word-${placedWords.length}`
                                    };
                                    placedWords.push(newWordData);
                                    placed = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (placed) break;
                }
                if (placed) break;
            }
             if (!placed) {
                console.log(`Could not place word: ${currentWord.word}`);
            }
        }

        currentPuzzle = { grid, placedWords, gridSize };
        console.log("Generated puzzle:", currentPuzzle);
        displayGrid(currentPuzzle); 
    }

    function clearAllHighlights() {
        document.querySelectorAll('#crossword-grid .active-cell input').forEach(input => {
            input.parentElement.classList.remove('highlight-word-cell');
        });
        document.querySelectorAll('#across-clues li, #down-clues li').forEach(li => {
            li.classList.remove('highlight-clue');
        });
    }

    function highlightWordAndClue(event) {
        clearAllHighlights();
        const targetInput = event.target;

        if (targetInput.associatedWords && targetInput.associatedWords.length > 0) {
            targetInput.associatedWords.forEach(wordInfo => {
                // Highlight cells of this word
                for (let i = 0; i < wordInfo.word.length; i++) {
                    let r = wordInfo.row;
                    let c = wordInfo.col;
                    if (wordInfo.direction === 'across') {
                        c += i;
                    } else { // down
                        r += i;
                    }
                    const cell = document.getElementById('crossword-grid')?.rows[r]?.cells[c];
                    if (cell && cell.classList.contains('active-cell')) { // Check if it's an active cell, not empty
                        cell.classList.add('highlight-word-cell');
                    }
                }
                // Highlight clue
                const clueElement = document.querySelector(`li[data-word-id='${wordInfo.id}']`);
                if (clueElement) {
                    clueElement.classList.add('highlight-clue');
                }
            });
        }
    }

    function displayGrid(puzzle) {
        const gridContainer = document.getElementById('grid-container');
        gridContainer.innerHTML = ''; 

        if (!puzzle || !puzzle.grid) {
            gridContainer.innerHTML = '<p>Error: No puzzle to display.</p>';
            return;
        }

        const table = document.createElement('table');
        table.id = 'crossword-grid';

        puzzle.grid.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');
            row.forEach((cell, colIndex) => {
                const td = document.createElement('td');
                td.dataset.row = rowIndex;
                td.dataset.col = colIndex;
                if (cell) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.dataset.row = rowIndex;
                    input.dataset.col = colIndex;
                    input.associatedWords = []; // Initialize for storing word references
                    td.appendChild(input);
                    td.classList.add('active-cell');

                    input.addEventListener('input', (e) => {
                        e.target.value = e.target.value.toUpperCase();
                        if (e.target.style.backgroundColor === 'pink' || e.target.style.backgroundColor === 'lightgreen') {
                            e.target.style.backgroundColor = ''; 
                        }
                        console.log(`Input in cell [${e.target.dataset.row}, ${e.target.dataset.col}]: ${e.target.value}`);
                    });
                    input.addEventListener('focus', highlightWordAndClue);

                } else {
                    td.classList.add('empty-cell');
                }
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
        gridContainer.appendChild(table);

        const acrossCluesList = document.getElementById('across-clues');
        const downCluesList = document.getElementById('down-clues');
        acrossCluesList.innerHTML = '';
        downCluesList.innerHTML = '';

        let acrossNumber = 1;
        let downNumber = 1;
        const wordStarts = {}; 

        puzzle.placedWords.sort((a,b) => a.row - b.row || a.col - b.col).forEach(wordInfo => {
            let displayNumber;
            const startCellKey = `${wordInfo.row}-${wordInfo.col}`;

            if (wordStarts[startCellKey]) {
                displayNumber = wordStarts[startCellKey].number;
            } else {
                displayNumber = (wordInfo.direction === 'across') ? acrossNumber++ : downNumber++;
                
                const cellElement = table.rows[wordInfo.row].cells[wordInfo.col];
                const numberSpan = document.createElement('span');
                numberSpan.classList.add('clue-number');
                numberSpan.textContent = displayNumber;
                if (cellElement.firstChild && cellElement.firstChild.nodeName === 'INPUT') {
                     cellElement.insertBefore(numberSpan, cellElement.firstChild);
                } else {
                     cellElement.appendChild(numberSpan); 
                }
                wordStarts[startCellKey] = { number: displayNumber, across: false, down: false };
            }
            
            if (wordInfo.direction === 'across' && !wordStarts[startCellKey].across) {
                wordStarts[startCellKey].across = true;
            } else if (wordInfo.direction === 'down' && !wordStarts[startCellKey].down) {
                wordStarts[startCellKey].down = true;
            }

            const listItem = document.createElement('li');
            listItem.textContent = `${wordStarts[startCellKey].number}. ${wordInfo.clue}`; 
            listItem.dataset.wordId = wordInfo.id; // Link clue LI to word ID

            if (wordInfo.direction === 'across') {
                acrossCluesList.appendChild(listItem); // Directly append
            } else { 
                downCluesList.appendChild(listItem); // Directly append
            }
        });

        // Populate input.associatedWords and data attributes
        puzzle.placedWords.forEach(wordInfo => {
            for (let i = 0; i < wordInfo.word.length; i++) {
                let currentCellR = wordInfo.row;
                let currentCellC = wordInfo.col;
                if (wordInfo.direction === 'across') {
                    currentCellC += i;
                } else {
                    currentCellR += i;
                }
                const cellInput = table.rows[currentCellR]?.cells[currentCellC]?.querySelector('input');
                if (cellInput) {
                    cellInput.associatedWords.push(wordInfo);
                    if(wordInfo.direction === 'across') {
                        cellInput.dataset.acrossWord = wordInfo.word;
                    } else {
                        cellInput.dataset.downWord = wordInfo.word;
                    }
                }
            }
        });
         console.log("Grid display complete with clues and highlighting logic.");
    }

    const checkAnswersBtn = document.getElementById('check-answers-btn');
    if (checkAnswersBtn) {
        checkAnswersBtn.addEventListener('click', () => {
            if (!currentPuzzle || !currentPuzzle.placedWords) {
                alert("No puzzle loaded to check!");
                return;
            }
            clearAllHighlights(); // Clear highlights before checking

            let allCorrect = true;
            let feedback = "Answer Feedback:\n";

            currentPuzzle.placedWords.forEach(wordInfo => {
                let userAnswer = "";
                let correct = true;
                const tableGrid = document.getElementById('crossword-grid'); // Ensure we get the table

                for (let i = 0; i < wordInfo.word.length; i++) {
                    let row = wordInfo.row;
                    let col = wordInfo.col;

                    if (wordInfo.direction === 'across') {
                        col += i;
                    } else { // 'down'
                        row += i;
                    }
                    
                    const cellInput = tableGrid.rows[row]?.cells[col]?.querySelector('input');
                    if (cellInput) {
                        userAnswer += cellInput.value.toUpperCase();
                        if (cellInput.value.toUpperCase() !== wordInfo.word[i]) {
                            correct = false;
                            cellInput.style.backgroundColor = 'pink'; 
                        } else {
                            cellInput.style.backgroundColor = 'lightgreen';
                        }
                    } else {
                        userAnswer += " "; 
                        correct = false;
                    }
                }

                feedback += `Word: "${wordInfo.word}" (Clue: ${wordInfo.clue}) - Your answer: "${userAnswer}" - ${correct ? "Correct!" : "Incorrect."}\n`;
                if (!correct) {
                    allCorrect = false;
                }
            });

            alert(feedback);
            if (allCorrect) {
                alert("Congratulations! You solved the puzzle!");
            }
        });
    } else {
        console.error("Check Answers button not found!");
    }
});

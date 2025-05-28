console.log("tests.js loaded");

function runTests() {
    console.log("--- Running Unit Tests ---");
    let testsPassed = 0;
    let testsFailed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`%cPASS: ${message}`, "color: green;");
            testsPassed++;
        } else {
            console.error(`%cFAIL: ${message}`, "color: red;");
            testsFailed++;
        }
    }

    // --- Test vocabulary object and loadVocabulary (indirectly) ---
    console.log("\n--- Testing Vocabulary ---");
    assert(vocabulary && typeof vocabulary === 'object', "Vocabulary object exists");
    assert(vocabulary.colors && vocabulary.colors.length > 0, "Vocabulary has 'colors' topic with words");
    assert(vocabulary.animals && vocabulary.animals.length > 0, "Vocabulary has 'animals' topic with words");
    assert(vocabulary.food && vocabulary.food.length > 0, "Vocabulary has 'food' topic with words");

    // --- Test generateCrossword (basic functionality) ---
    // Need to mock or ensure `displayGrid` doesn't break things if currentPuzzle is manipulated directly
    // For now, `generateCrossword` sets `currentPuzzle` globally.
    console.log("\n--- Testing Crossword Generation (Basic) ---");
    const testWords = [{ word: "TEST", clue: "A test word" }, { word: "SET", clue: "To place something" }];
    generateCrossword(testWords); // This will modify `currentPuzzle`

    assert(currentPuzzle !== null, "currentPuzzle is populated after generateCrossword");
    assert(currentPuzzle.grid && currentPuzzle.grid.length === 15, "Grid has been created with correct size"); // Assuming gridSize 15
    assert(currentPuzzle.placedWords && currentPuzzle.placedWords.length > 0, "At least one word was placed");

    if (currentPuzzle && currentPuzzle.placedWords && currentPuzzle.placedWords.length > 0) {
        const firstPlacedWord = currentPuzzle.placedWords[0];
        assert(firstPlacedWord.word === "TEST", "First word placed is 'TEST'");
        assert(firstPlacedWord.direction === 'across', "First word is placed 'across'");
        // Check if it's roughly in the middle
        const expectedRow = Math.floor(15 / 2);
        assert(firstPlacedWord.row === expectedRow, `First word placed in expected row ${expectedRow}`);
    }

    // Test with a word that is too long (should not throw error, but maybe console.error and no grid)
    // This relies on current implementation detail of console.error and grid-container message
    // generateCrossword([{ word: "VERYLONGWORDTHATISTOOLONG", clue: "Too long" }]);
    // TODO: How to assert DOM changes or console errors effectively in this simple runner?

    // --- Test Answer Checking Logic (Simulated) ---
    console.log("\n--- Testing Answer Checking (Simulated) ---");
    // Mock a simple puzzle and grid inputs for checkAnswersBtn functionality
    const mockPuzzleForCheck = {
        gridSize: 5,
        placedWords: [
            { word: "HI", clue: "A greeting", row: 0, col: 0, direction: 'across' },
            { word: "IT", clue: "Information Technology", row: 0, col: 1, direction: 'down' }
        ],
        // grid: // Not strictly needed if we mock inputs directly
    };

    // Temporarily set currentPuzzle for the test
    let originalCurrentPuzzle = currentPuzzle; // Save original
    currentPuzzle = mockPuzzleForCheck;

    // Mock the HTML grid with inputs
    const mockGridContainer = document.createElement('div'); // Temporary container for the mock table
    const mockTable = document.createElement('table');
    mockTable.id = 'crossword-grid'; // Expected by the check function
    for(let r=0; r<mockPuzzleForCheck.gridSize; r++) {
        const tr = document.createElement('tr');
        for(let c=0; c<mockPuzzleForCheck.gridSize; c++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.dataset.row = r;
            input.dataset.col = c;
            // Pre-fill answers for testing
            if (r === 0 && c === 0) input.value = 'H'; // HI
            if (r === 0 && c === 1) input.value = 'I'; // HI and IT
            if (r === 1 && c === 1) input.value = 'T'; // IT
            td.appendChild(input);
            tr.appendChild(td);
        }
        mockTable.appendChild(tr);
    }
    
    const actualGridContainer = document.getElementById('grid-container');
    const actualGridTable = actualGridContainer.querySelector('#crossword-grid');
    if(actualGridTable) actualGridTable.style.display = 'none'; // Hide actual table
    actualGridContainer.appendChild(mockTable); // Add mock table to the DOM


    // Simulate button click (need to make `checkAnswersBtn` logic callable or refactor)
    // For now, let's adapt the core logic of the check for testability
    
    let correctCount = 0;
    let incorrectCount = 0;
    currentPuzzle.placedWords.forEach(wordInfo => {
        let userAnswer = "";
        let isCorrect = true;
        for (let i = 0; i < wordInfo.word.length; i++) {
            let r = wordInfo.row;
            let c = wordInfo.col;
            if (wordInfo.direction === 'across') c += i;
            else r += i;
            
            const cellInput = mockTable.rows[r]?.cells[c]?.querySelector('input');
            if (cellInput && cellInput.value.toUpperCase() === wordInfo.word[i]) {
                userAnswer += cellInput.value.toUpperCase();
            } else {
                isCorrect = false;
                userAnswer += cellInput ? cellInput.value.toUpperCase() : " ";
            }
        }
        if(isCorrect) correctCount++; else incorrectCount++;
    });

    assert(correctCount === 2 && incorrectCount === 0, "Answer checking logic identifies all correct mock answers");
    
    // Test with one wrong answer
    mockTable.rows[1].cells[1].querySelector('input').value = 'X'; // Change 'T' to 'X' for "IT"
    correctCount = 0;
    incorrectCount = 0;
    currentPuzzle.placedWords.forEach(wordInfo => {
        let userAnswer = "";
        let isCorrect = true;
        for (let i = 0; i < wordInfo.word.length; i++) {
            let r = wordInfo.row;
            let c = wordInfo.col;
            if (wordInfo.direction === 'across') c += i;
            else r += i;
            const cellInput = mockTable.rows[r]?.cells[c]?.querySelector('input');
            if (cellInput && cellInput.value.toUpperCase() === wordInfo.word[i]) {
                userAnswer += cellInput.value.toUpperCase();
            } else {
                isCorrect = false;
                userAnswer += cellInput ? cellInput.value.toUpperCase() : " ";
            }
        }
        if(isCorrect) correctCount++; else incorrectCount++;
    });
    assert(correctCount === 1 && incorrectCount === 1, "Answer checking logic identifies one incorrect mock answer");


    // --- Cleanup ---
    currentPuzzle = originalCurrentPuzzle; // Restore
    if(actualGridTable) actualGridTable.style.display = ''; // Show actual table again
    mockTable.remove(); // Clean up mock table


    console.log("\n--- Test Summary ---");
    console.log(`${testsPassed} tests passed.`);
    if (testsFailed > 0) {
        console.error(`${testsFailed} tests failed.`);
    } else {
        console.log("All tests passed!");
    }
    console.log("----------------------");
}

// Run tests when the script is loaded and DOM is ready
// Ensure script.js has run and initialized everything it needs to.
if (document.readyState === "complete" || document.readyState === "interactive") {
    // Timeout to ensure script.js has fully initialized, especially event listeners
    setTimeout(runTests, 0); 
} else {
    document.addEventListener("DOMContentLoaded", runTests);
}

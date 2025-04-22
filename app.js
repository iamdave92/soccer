// Player data storage with hardcoded players
let players = JSON.parse(localStorage.getItem('soccerPlayers'));

// Game state
let gameState = {
    inProgress: false,
    currentQuarter: 0,
    isHalfQuarter: false,
    lineups: [],
    activeLineup: [],
    selectedGoalie: null
};

// Soccer positions
const positions = ['Goalkeeper', 'Left Defender', 'Right Defender', 'Left Midfielder', 'Center Midfielder', 'Right Midfielder', 'Forward'];

// Initialize with hardcoded players if none exist
if (!players || players.length === 0) {
    players = [
        { id: '1', name: 'Alaina', isAvailable: true },
        { id: '2', name: 'Austin', isAvailable: true },
        { id: '3', name: 'Everly', isAvailable: true },
        { id: '4', name: 'Henrik', isAvailable: true },
        { id: '5', name: 'Koby', isAvailable: true },
        { id: '6', name: 'Kyler', isAvailable: true },
        { id: '7', name: 'Libby', isAvailable: true },
        { id: '8', name: 'Logan', isAvailable: true },
        { id: '9', name: 'Maya', isAvailable: true },
        { id: '10', name: 'Oakli', isAvailable: true },
        { id: '11', name: 'Theo', isAvailable: true },
        { id: '12', name: 'Tristan', isAvailable: true }
    ];
    savePlayersToLocalStorage();
}

// DOM Elements
const playersList = document.getElementById('players');
const availablePlayersList = document.getElementById('available-players');
const generateRosterBtn = document.getElementById('generate-roster');
const generatedRosterDiv = document.getElementById('generated-roster');
const rosterList = document.getElementById('roster-list');
const gameControlsDiv = document.getElementById('game-controls');
const startGameBtn = document.getElementById('start-game');
const substituteBtn = document.getElementById('substitute-players');
const nextQuarterBtn = document.getElementById('next-quarter');
const gameStatusDiv = document.getElementById('game-status');
const gameHistoryDiv = document.getElementById('game-history');
const goalieSelectionDiv = document.getElementById('goalie-selection');
const refreshLineupBtn = document.getElementById('refresh-lineup');

// Initialize the app
function init() {
    renderPlayersList();
    renderAvailablePlayersList();
    
    // Event listeners
    generateRosterBtn.addEventListener('click', generateRoster);
    startGameBtn.addEventListener('click', startGame);
    substituteBtn.addEventListener('click', substitutePlayers);
    nextQuarterBtn.addEventListener('click', nextQuarter);
    refreshLineupBtn.addEventListener('click', refreshCurrentLineup);
    
    // Initial game controls state
    updateGameControls();
}

// Toggle player availability
function toggleAvailability(playerId) {
    players = players.map(player => {
        if (player.id === playerId) {
            return { ...player, isAvailable: !player.isAvailable };
        }
        return player;
    });
    
    savePlayersToLocalStorage();
    renderAvailablePlayersList();
}

// Render players list
function renderPlayersList() {
    playersList.innerHTML = '';
    
    players.forEach(player => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${player.name}</span>`;
        playersList.appendChild(li);
    });
}

// Render available players list with checkboxes
function renderAvailablePlayersList() {
    availablePlayersList.innerHTML = '';
    
    players.forEach(player => {
        const div = document.createElement('div');
        div.className = 'player-checkbox';
        div.innerHTML = `
            <input 
                type="checkbox" 
                id="player-${player.id}" 
                ${player.isAvailable ? 'checked' : ''}
                ${gameState.inProgress ? 'disabled' : ''}
            >
            <label for="player-${player.id}">${player.name}</label>
        `;
        
        const checkbox = div.querySelector('input');
        checkbox.addEventListener('change', () => toggleAvailability(player.id));
        
        availablePlayersList.appendChild(div);
    });
}

// Render goalie selection radio buttons
function renderGoalieSelection() {
    goalieSelectionDiv.innerHTML = '<h3>Select Goalie for this Quarter</h3>';
    
    const availablePlayers = players.filter(player => player.isAvailable);
    
    availablePlayers.forEach(player => {
        const div = document.createElement('div');
        div.className = 'goalie-radio';
        div.innerHTML = `
            <input 
                type="radio" 
                name="goalie" 
                id="goalie-${player.id}" 
                value="${player.id}"
                ${gameState.selectedGoalie && gameState.selectedGoalie.id === player.id ? 'checked' : ''}
            >
            <label for="goalie-${player.id}">${player.name}</label>
        `;
        
        goalieSelectionDiv.appendChild(div);
    });
    
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Confirm Goalie';
    confirmBtn.className = 'confirm-goalie';
    confirmBtn.addEventListener('click', confirmGoalieSelection);
    
    goalieSelectionDiv.appendChild(confirmBtn);
    goalieSelectionDiv.classList.remove('hidden');
}

// Generate a 7-player roster from available players
function generateRoster() {
    const availablePlayers = players.filter(player => player.isAvailable);
    
    if (availablePlayers.length < 7) {
        alert(`You need at least 7 available players. Currently you have ${availablePlayers.length}.`);
        return;
    }
    
    // Show goalie selection
    renderGoalieSelection();
    
    // Disable generate button until goalie is confirmed
    generateRosterBtn.classList.add('hidden');
}

// Try to start a new quarter after goalie selection
function tryStartNewQuarter() {
    // Only proceed if we're in a game
    if (!gameState.inProgress) return;
    
    // Create new lineup for this quarter
    const newLineup = [...gameState.activeLineup];
    
    // Update game state with the new lineup
    gameState.lineups.push({
        quarter: gameState.currentQuarter,
        half: 'first',
        players: newLineup
    });
    
    // Update UI
    displayRoster(newLineup, true);
    updateGameStatus();
    updateGameControls();
    updateGameHistory();
}

// Confirm selected goalie and proceed
function confirmGoalieSelection() {
    const selectedRadio = document.querySelector('input[name="goalie"]:checked');
    
    if (!selectedRadio) {
        alert('Please select a goalie before proceeding.');
        return;
    }
    
    const goalieId = selectedRadio.value;
    gameState.selectedGoalie = players.find(player => player.id === goalieId);
    
    // Generate the rest of the lineup
    generateLineupWithGoalie();
    
    // Hide goalie selection
    goalieSelectionDiv.classList.add('hidden');
    
    // If we're in a game, start the new quarter
    if (gameState.inProgress) {
        tryStartNewQuarter();
    } else {
        // Just enable start button for initial lineup
        startGameBtn.disabled = false;
        gameControlsDiv.classList.remove('hidden');
    }
}

// Substitute players mid-quarter
function substitutePlayers() {
    if (!gameState.inProgress) return;
    
    // Can only substitute at mid-quarter
    if (gameState.isHalfQuarter) {
        alert('You\'ve already substituted players this quarter.');
        return;
    }
    
    // Get all available players who aren't currently playing (bench players)
    const benchPlayers = players.filter(player => 
        player.isAvailable && 
        !gameState.activeLineup.some(activePlayer => activePlayer.id === player.id)
    );
    
    if (benchPlayers.length === 0) {
        alert('No bench players available for substitution.');
        return;
    }
    
    // Keep the goalie (always at position 0)
    const goalie = gameState.activeLineup[0];
    
    // Field players (excluding goalie)
    const fieldPlayers = gameState.activeLineup.slice(1);
    
    // Number of field players to substitute (min 1, max depends on bench size)
    const maxFieldPlayersToSub = Math.min(fieldPlayers.length, benchPlayers.length);
    
    if (maxFieldPlayersToSub < 1) {
        alert('Not enough bench players for substitution.');
        return;
    }
    
    // Randomly select which field players to remove
    const playersToRemove = shuffleArray([...fieldPlayers]).slice(0, maxFieldPlayersToSub);
    
    // Randomly select bench players to add
    const playersToAdd = shuffleArray(benchPlayers).slice(0, maxFieldPlayersToSub);
    
    // Keep track of which field positions to replace
    const positionsToReplace = [];
    const remainingFieldPlayers = [];
    
    // Identify which positions need replacement and which players stay
    fieldPlayers.forEach((player, index) => {
        if (playersToRemove.some(p => p.id === player.id)) {
            // This player is being substituted - remember position (add 1 because goalie is at 0)
            positionsToReplace.push(index + 1);
        } else {
            // This player stays with position info
            remainingFieldPlayers.push({
                player: player,
                position: index + 1 // Position index (add 1 because goalie is at 0)
            });
        }
    });
    
    // Create the new lineup
    const newLineup = new Array(7); // 7 player slots
    
    // Place goalie at position 0
    newLineup[0] = goalie;
    
    // Place remaining field players in their same positions
    remainingFieldPlayers.forEach(item => {
        newLineup[item.position] = item.player;
    });
    
    // Place new players in the open positions
    let benchIndex = 0;
    positionsToReplace.forEach(position => {
        if (benchIndex < playersToAdd.length) {
            newLineup[position] = playersToAdd[benchIndex++];
        }
    });
    
    // Filter out any undefined positions (shouldn't happen but just in case)
    const finalLineup = newLineup.filter(player => player !== undefined);
    
    // If we don't have 7 players, pad with extra bench players
    while (finalLineup.length < 7 && benchIndex < playersToAdd.length) {
        finalLineup.push(playersToAdd[benchIndex++]);
    }
    
    // Update game state
    gameState.isHalfQuarter = true;
    gameState.activeLineup = finalLineup;
    gameState.lineups.push({
        quarter: gameState.currentQuarter,
        half: 'second',
        players: [...finalLineup]
    });
    
    // Update UI
    displayRoster(finalLineup, true);
    updateGameStatus();
    updateGameControls();
    updateGameHistory();
}

// Generate a lineup with the selected goalie
function generateLineupWithGoalie() {
    // Get all available players excluding the goalie
    const availableFieldPlayers = players.filter(player => 
        player.isAvailable && player.id !== gameState.selectedGoalie.id
    );
    
    if (availableFieldPlayers.length < 6) {
        alert(`You need at least 6 field players plus a goalie. Currently you have ${availableFieldPlayers.length} field players.`);
        return;
    }
    
    // If we're in a game and have existing lineup, try to maintain field positions
    if (gameState.inProgress && gameState.activeLineup.length > 0) {
        const newLineup = generateQuarterLineup(availableFieldPlayers);
        gameState.activeLineup = newLineup;
        displayRoster(newLineup);
    } else {
        // For initial lineup, just select 6 random field players
        const selectedFieldPlayers = shuffleArray(availableFieldPlayers).slice(0, 6);
        const fullLineup = [gameState.selectedGoalie, ...selectedFieldPlayers];
        gameState.activeLineup = fullLineup;
        displayRoster(fullLineup);
    }
}

// Generate a lineup for a new quarter
function generateQuarterLineup(availableFieldPlayers) {
    // Create a new lineup array
    const newLineup = new Array(7);
    
    // Place the selected goalie at position 0
    newLineup[0] = gameState.selectedGoalie;
    
    // Get the last lineup (if any)
    const lastLineup = gameState.lineups.length > 0 ? 
        gameState.lineups[gameState.lineups.length - 1].players : [];
    
    // Check if we have a previous quarter goalie that's not the current goalie
    const previousGoalie = lastLineup.length > 0 ? lastLineup[0] : null;
    
    // Identify players who were NOT in the last lineup (prioritize these players)
    // First, collect all player IDs from the last lineup
    const lastLineupIds = lastLineup.map(player => player.id);
    
    // Filter available field players to prioritize those who weren't in the last lineup
    const priorityPlayers = availableFieldPlayers.filter(
        player => !lastLineupIds.includes(player.id) && player.id !== gameState.selectedGoalie.id
    );
    
    // Any remaining players (who were in the last lineup)
    const remainingPlayers = availableFieldPlayers.filter(
        player => lastLineupIds.includes(player.id) && player.id !== gameState.selectedGoalie.id
    );
    
    // Add the previous goalie handling
    let usePreviousGoalie = false;
    if (previousGoalie && 
        previousGoalie.id !== gameState.selectedGoalie.id && 
        availableFieldPlayers.some(p => p.id === previousGoalie.id)) {
        
        usePreviousGoalie = true;
        
        // Remove previous goalie from either priority or remaining lists
        const removeFromList = (list) => list.filter(p => p.id !== previousGoalie.id);
        if (priorityPlayers.some(p => p.id === previousGoalie.id)) {
            priorityPlayers.splice(priorityPlayers.findIndex(p => p.id === previousGoalie.id), 1);
        } else {
            remainingPlayers.splice(remainingPlayers.findIndex(p => p.id === previousGoalie.id), 1);
        }
    }
    
    // Combine and shuffle players, prioritizing those who weren't in the last lineup
    let allFieldPlayers = [...shuffleArray(priorityPlayers), ...shuffleArray(remainingPlayers)];
    
    // At most we need 6 field players (or 5 if we're using the previous goalie)
    const maxNeeded = usePreviousGoalie ? 5 : 6;
    allFieldPlayers = allFieldPlayers.slice(0, maxNeeded);
    
    // Now fill the field positions
    if (usePreviousGoalie) {
        // Choose a random field position (1-6) for the previous goalie
        const randomPosition = Math.floor(Math.random() * 6) + 1;
        
        // Place the previous goalie in the random position
        newLineup[randomPosition] = previousGoalie;
        
        // Fill the remaining positions with other players
        let fieldIndex = 0;
        for (let i = 1; i < 7; i++) {
            if (i !== randomPosition && fieldIndex < allFieldPlayers.length) {
                newLineup[i] = allFieldPlayers[fieldIndex++];
            }
        }
    } else {
        // Just fill all field positions with the available players
        for (let i = 1; i < 7 && i - 1 < allFieldPlayers.length; i++) {
            newLineup[i] = allFieldPlayers[i - 1];
        }
    }
    
    // Make sure we have 7 players total (should always be the case, but safety check)
    const validLineup = newLineup.filter(player => player !== undefined);
    
    // Return the new lineup
    return validLineup;
}

// Display roster with positions
function displayRoster(selectedPlayers, isLineup = false) {
    rosterList.innerHTML = '';
    
    selectedPlayers.forEach((player, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="position">${positions[index]}:</span>
            <span class="player-name">${player.name}</span>
        `;
        rosterList.appendChild(li);
    });
    
    generatedRosterDiv.classList.remove('hidden');
    
    if (!isLineup) {
        gameState.activeLineup = selectedPlayers;
    }
}

// Start a new game
function startGame() {
    if (!gameState.activeLineup || gameState.activeLineup.length !== 7) {
        alert('Please generate a roster first!');
        return;
    }
    
    // Reset game state
    gameState = {
        inProgress: true,
        currentQuarter: 1,
        isHalfQuarter: false,
        lineups: [{
            quarter: 1,
            half: 'first',
            players: [...gameState.activeLineup]
        }],
        activeLineup: [...gameState.activeLineup],
        selectedGoalie: gameState.selectedGoalie
    };
    
    // Disable availability toggles during game
    renderAvailablePlayersList();
    
    // Update UI
    updateGameStatus();
    updateGameControls();
    updateGameHistory();
    
    // Hide roster generator button and show game controls/status
    generateRosterBtn.classList.add('hidden');
    gameControlsDiv.classList.remove('hidden');
    gameStatusDiv.classList.remove('hidden');
    gameHistoryDiv.classList.remove('hidden');
}

// Move to next quarter
function nextQuarter() {
    if (!gameState.inProgress) return;
    
    // Can only move to next quarter after substitutions
    if (!gameState.isHalfQuarter) {
        alert('You need to substitute players before moving to the next quarter.');
        return;
    }
    
    // If we're at quarter 4, end the game
    if (gameState.currentQuarter >= 4) {
        endGame();
        return;
    }
    
    // Advance to next quarter
    gameState.currentQuarter++;
    gameState.isHalfQuarter = false;
    
    // Let user select a new goalie for this quarter
    goalieSelectionDiv.classList.remove('hidden');
    renderGoalieSelection();
    
    // Disable game controls until goalie is selected
    nextQuarterBtn.disabled = true;
    substituteBtn.disabled = true;
}

// End the game
function endGame() {
    // Reset game status
    gameState.inProgress = false;
    
    // Update UI
    alert('Game over! Check the game history for all lineups.');
    updateGameControls();
    
    // Show roster generator button again
    generateRosterBtn.classList.remove('hidden');
    goalieSelectionDiv.classList.add('hidden');
    
    // Re-enable the initial roster generation process
    generateRosterBtn.disabled = false;
}

// Update game status display
function updateGameStatus() {
    if (!gameState.inProgress) {
        gameStatusDiv.innerHTML = '<h3>Game not in progress</h3>';
        return;
    }
    
    const quarterText = `Quarter ${gameState.currentQuarter}`;
    const halfText = gameState.isHalfQuarter ? 'Second Half' : 'First Half';
    const goalieText = gameState.selectedGoalie ? 
        `<p class="goalie-info">Goalie: <strong>${gameState.selectedGoalie.name}</strong></p>` : '';
    
    gameStatusDiv.innerHTML = `
        <h3>Game in Progress</h3>
        <p class="game-status-text">${quarterText} - ${halfText}</p>
        ${goalieText}
    `;
}

// Update game controls based on state
function updateGameControls() {
    if (!gameState.inProgress) {
        startGameBtn.disabled = false;
        substituteBtn.disabled = true;
        nextQuarterBtn.disabled = true;
        return;
    }
    
    // Game is in progress
    startGameBtn.disabled = true;
    
    // If goalie selection is active, disable all game controls
    if (!goalieSelectionDiv.classList.contains('hidden')) {
        substituteBtn.disabled = true;
        nextQuarterBtn.disabled = true;
        return;
    }
    
    // Normal game flow
    if (gameState.isHalfQuarter) {
        substituteBtn.disabled = true;
        nextQuarterBtn.disabled = false;
    } else {
        substituteBtn.disabled = false;
        nextQuarterBtn.disabled = true;
    }
    
    // If we're at quarter 4 and after substitutions, change next quarter button text
    if (gameState.currentQuarter >= 4 && gameState.isHalfQuarter) {
        nextQuarterBtn.textContent = 'End Game';
    } else {
        nextQuarterBtn.textContent = 'Next Quarter';
    }
}

// Update game history display
function updateGameHistory() {
    if (gameState.lineups.length === 0) {
        gameHistoryDiv.innerHTML = '<h3>Game History</h3><p>No history yet</p>';
        return;
    }
    
    let historyHTML = '<h3>Game History</h3>';
    
    gameState.lineups.forEach(lineup => {
        historyHTML += `
            <div class="history-item">
                <h4>Quarter ${lineup.quarter} - ${lineup.half === 'first' ? 'First Half' : 'Second Half'}</h4>
                <ul class="history-players">
        `;
        
        lineup.players.forEach((player, index) => {
            const isGoalie = index === 0;
            historyHTML += `
                <li class="${isGoalie ? 'goalie-position' : ''}">
                    <span class="position">${positions[index]}:</span> 
                    <span class="player-name">${player.name}</span>
                </li>
            `;
        });
        
        historyHTML += `</ul></div>`;
    });
    
    gameHistoryDiv.innerHTML = historyHTML;
}

// Helper function to shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Save players data to localStorage
function savePlayersToLocalStorage() {
    localStorage.setItem('soccerPlayers', JSON.stringify(players));
}

// Refresh current lineup
function refreshCurrentLineup() {
    // If we're not in a game or we're at the start of a quarter, refresh normally
    if (!gameState.inProgress) {
        // If we have a goalie selected, refresh the initial lineup
        if (gameState.selectedGoalie) {
            generateLineupWithGoalie();
        } else {
            // No goalie selected yet, can't refresh
            alert('Please select a goalie first.');
        }
        return;
    }
    
    // We're in a game
    if (!gameState.isHalfQuarter) {
        // At the start of a quarter - re-do the lineup but keep the same goalie
        const availableFieldPlayers = players.filter(player => 
            player.isAvailable && player.id !== gameState.selectedGoalie.id
        );
        
        const newLineup = generateQuarterLineup(availableFieldPlayers);
        
        // Update the game state and UI
        gameState.activeLineup = newLineup;
        
        // Update the current lineup in the game history
        if (gameState.lineups.length > 0) {
            // Find and update the current quarter's first half lineup
            const currentLineupIndex = gameState.lineups.findIndex(
                lineup => lineup.quarter === gameState.currentQuarter && lineup.half === 'first'
            );
            
            if (currentLineupIndex !== -1) {
                gameState.lineups[currentLineupIndex].players = [...newLineup];
            }
        }
        
        // Update display
        displayRoster(newLineup, true);
        updateGameHistory();
    } else {
        // After substitutions - randomize who stays on the field and what positions they take
        // (while keeping the goalie in place)
        refreshSubstitutionLineup();
    }
}

// Refresh the lineup after substitutions have been made
function refreshSubstitutionLineup() {
    // We need to carefully maintain the game state regarding which players have been substituted

    // 1. Find the current lineup (second half of the current quarter)
    const currentLineupInfo = gameState.lineups.find(
        lineup => lineup.quarter === gameState.currentQuarter && lineup.half === 'second'
    );

    // If we can't find the current lineup, something's wrong
    if (!currentLineupInfo) {
        console.error("Error: Cannot find current lineup in game history");
        alert("Cannot refresh lineup. Game state is invalid.");
        return;
    }

    // 2. Find the previous lineup (first half of the current quarter)
    const previousLineupInfo = gameState.lineups.find(
        lineup => lineup.quarter === gameState.currentQuarter && lineup.half === 'first'
    );

    // If we can't find the previous lineup, something's wrong
    if (!previousLineupInfo) {
        console.error("Error: Cannot find previous lineup in game history");
        alert("Cannot refresh lineup. Game state is invalid.");
        return;
    }

    // 3. Get the players from each lineup with their positions
    const previousPlayers = previousLineupInfo.players;
    const currentPlayers = currentLineupInfo.players;
    
    // 4. Create a map of players to their positions from the first half
    const firstHalfPlayerPositions = {};
    previousPlayers.forEach((player, index) => {
        firstHalfPlayerPositions[player.id] = index;
    });
    
    // 5. Identify which players from the first half are still in the current lineup
    const stillActivePlayers = currentPlayers.filter(player => 
        firstHalfPlayerPositions.hasOwnProperty(player.id)
    );
    
    // 6. Identify players who were substituted in
    const substitutedPlayers = currentPlayers.filter(player => 
        !firstHalfPlayerPositions.hasOwnProperty(player.id)
    );
    
    // 7. Identify players from first half who were substituted out
    const firstHalfPlayerIds = previousPlayers.map(player => player.id);
    const removedPlayers = previousPlayers.filter(player => 
        !currentPlayers.some(currentPlayer => currentPlayer.id === player.id)
    );
    
    // 8. Keep the goalie in place
    const goalie = currentPlayers[0]; // Always at position 0
    
    // 9. Create a new lineup
    const newLineup = new Array(7);
    
    // 10. Put the goalie in position 0
    newLineup[0] = goalie;
    
    // 11. Put players who are still active back in their original positions
    stillActivePlayers.forEach(player => {
        const originalPosition = firstHalfPlayerPositions[player.id];
        // Only place them if they're not the goalie (position 0)
        // and we haven't already placed someone in that position
        if (originalPosition > 0 && !newLineup[originalPosition]) {
            newLineup[originalPosition] = player;
        }
    });
    
    // 12. Identify which positions need to be filled
    const openPositions = [];
    for (let i = 1; i < 7; i++) {
        if (!newLineup[i]) {
            openPositions.push(i);
        }
    }
    
    // 13. Randomize which substituted players go into which open positions
    const shuffledSubstitutes = shuffleArray([...substitutedPlayers]);
    
    // 14. Place substituted players into open positions
    for (let i = 0; i < openPositions.length && i < shuffledSubstitutes.length; i++) {
        newLineup[openPositions[i]] = shuffledSubstitutes[i];
    }
    
    // 15. If there are still open positions (unlikely), fill them with removed players
    if (openPositions.length > shuffledSubstitutes.length) {
        const remainingOpenPositions = openPositions.slice(shuffledSubstitutes.length);
        const shuffledRemovedPlayers = shuffleArray([...removedPlayers]);
        
        for (let i = 0; i < remainingOpenPositions.length && i < shuffledRemovedPlayers.length; i++) {
            newLineup[remainingOpenPositions[i]] = shuffledRemovedPlayers[i];
        }
    }
    
    // 16. Remove any undefined positions (shouldn't happen, but just in case)
    const finalLineup = newLineup.filter(player => player !== undefined);
    
    // 17. Verify we have exactly 7 players
    if (finalLineup.length !== 7) {
        console.error(`Error: Invalid lineup size (${finalLineup.length} players)`);
        alert("Failed to create a valid lineup. Please try again.");
        return;
    }
    
    // 18. Update game state
    gameState.activeLineup = finalLineup;
    
    // 19. Update the current lineup in the game history
    const currentLineupIndex = gameState.lineups.findIndex(
        lineup => lineup.quarter === gameState.currentQuarter && lineup.half === 'second'
    );
    
    if (currentLineupIndex !== -1) {
        gameState.lineups[currentLineupIndex].players = [...finalLineup];
    }
    
    // 20. Update display
    displayRoster(finalLineup, true);
    updateGameHistory();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 
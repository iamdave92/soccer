# Soccer Roster Generator

A web application to manage your soccer team and automatically generate 7-player rosters for your games, with full game tracking including quarters and substitutions.

## Features

- View a list of 12 pre-loaded team players
- Mark players as available/unavailable for games
- Select a dedicated goalie for each quarter
- Automatically generate a 7-player roster from available players
- Re-randomize lineups with a single click at any point
- Track full games with 4 quarters and mid-quarter substitutions
- Ensure goalies are not substituted during quarters
- Previous quarter's goalie always plays as a field player in the next quarter
- Full bench rotation - all bench players are used in substitutions
- Prioritize players who were on the bench in the previous quarter
- Maintain player positions for those staying on the field
- View position assignments for each player
- Review complete game history with all lineups
- Availability settings persist between sessions using browser's localStorage

## How to Use

1. **Manage Available Players**:
   - Check or uncheck players to indicate who is available for the game
   - Players who are checked are considered available
   - You need at least 7 available players for basic play, more for substitutions

2. **Generate Initial Roster**:
   - Click the "Generate 7-Player Roster" button to start the process
   - First, select a goalie from your available players
   - The system will then automatically fill the remaining 6 field positions
   - Use the refresh button (↻) to re-randomize the field positions if desired

3. **Start a Game**:
   - After confirming your goalie and generating a roster, click "Start Game"
   - The initial roster becomes your first quarter, first half lineup

4. **Game Flow**:
   - Each quarter has two halves (first half and second half)
   - Mid-quarter: Use "Substitute Players" to swap out field players
   - All available bench players are rotated in during substitutions
   - End of quarter: Use "Next Quarter" to advance and select a new goalie
   - A completely new field lineup is generated at the start of each quarter, prioritizing bench players
   - Use the refresh button to re-randomize the lineup at any point during the game
   - The game consists of 4 quarters with 8 total lineups (2 per quarter)

5. **Goalie Rotation**:
   - At the start of each quarter, you select a goalie
   - The previous quarter's goalie automatically becomes a field player in the next quarter
   - This ensures goalies get a rest but still remain in the game
   - The previous goalie is assigned to a random field position

6. **Substitution System**:
   - Mid-quarter: All players on the bench are substituted in
   - Players who remain on the field keep their same positions
   - The number of substitutions depends on bench size
   - The goalie is never substituted during a quarter
   - Between quarters: Players who were on the bench get priority to play in the next quarter
   - Each quarter starts with players who didn't play in the previous quarter when possible

7. **Game History**:
   - All lineups are recorded in the Game History section
   - Review which players played in which positions throughout the game
   - Goalies are highlighted in the history view

8. **Lineup Refreshing**:
   - Use the refresh button (↻) next to "Generated Roster" to re-randomize the current lineup
   - Available before starting a game to try different field player combinations
   - Available at the start of each quarter to randomize field players
   - Available after substitutions to randomize both which players stay on the field and what positions they take
   - Only the goalie position remains fixed during refreshes

## Game Rules

- Each game has 4 quarters
- A goalie must be selected at the start of each quarter
- The previous quarter's goalie becomes a field player in the next quarter
- Goalies cannot be substituted during a quarter
- Field player substitutions happen halfway through each quarter
- All available bench players are used in each substitution
- Players who sat out the previous quarter are prioritized for the next quarter
- A complete game will use 8 different lineups
- You must substitute before moving to the next quarter
- The game ends after the 4th quarter and its substitutions
- At any point, you can re-randomize the current lineup (except for the goalie)

## How to Run

Simply open the `index.html` file in any modern web browser. No additional installation or setup is required.

## Technical Details

- Built with vanilla JavaScript, HTML, and CSS
- Uses browser's localStorage for data persistence
- No external libraries or dependencies
- Responsive design works on both desktop and mobile

## Development

To modify or extend this application:

1. Edit the player list in `app.js` if you want to change the team members
2. Edit the HTML structure in `index.html`
3. Modify the styles in `styles.css`
4. Change the functionality by editing `app.js` 
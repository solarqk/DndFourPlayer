# D&D 4 Player Turn Based Simulator

Lightweight 4 player turn based simulator built with React + T, each person selects an option at the beginning of the the game that will have unique dialogue corresponding at the end. The narration card at the top tells the story and provides relevant information.

### Gameplay Features
* 4 player turn-based combat
* Nat 20 critical hits
* Round-based attack refresh
* Victory and defeat states

### Game Phases
Intro --> Combat --> Outro --> Done

### Combat Loop
Player 1 --> Player 2 --> Player 3 --> Player 4 --> Enemy Attack --> Reset Round --> Repeat


## Instructions
 * Each player selects an intro actions in their respective cards, reflected by the Current choices in the narration card at the top. Once everyone selects an options, select "Advance to combat".
 * Player 1 starts first by selecting Attack (d20). A dice is rolled and if the number exceeds the enemy's armor class, shown in the enemy card in the top right, a hit is landed. The player will then hit "End turn" to start the next player.
   * Note: if a player reaches 0 HP, then they won't be able to attack anymore, but they will still need to select "End turn"
 * Cycle through each players turn until either the characters defeat the enemy, or the enemy defeats the party. Then select "Advance to wrap-up"
   * Note: this can take a few rounds depending on the RNG of the rolls. In testing, I typically see completion rates in 2-5 total turns
 * After the combat phase is over, the narration card at the top will reflect choices made in the intro and wrap up the encounter. Then select "End scenario" to end the game.
   

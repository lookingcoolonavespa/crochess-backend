# crochess-backend

### tech stack
- express 
- typescript
- mongoose
- socketio

## Game Seeks ##

**Create a game seek**
```
axios.put(
  https://crochess-backend.herokuapp.com/gameSeeks,
  {
      time: the time alotted for each player,
      increment: the time (in seconds) each player gains per move they make,
      color: the color the challenger will play as
      seeker: the socket id of the user creating the seek,
      gameType: the type of game based on the time control selected ie. 'bullet', 'blitz', 'rapid' , etc
   }
)
```

**Get all game seeks**
```
axios.get(https://crochess-backend.herokuapp.com/gameSeeks)
```

**Delete a game seek**
```
axios.delete(https://crochess-backend.herokuapp.com/gameSeeks/:id)
```

## Games

**Create a game**
```
axios.put(
  https://crochess-backend.herokuapp.com/games,
  {
      white: the socket id of the white player,
      black: the socket id of the black player,
      time: the time alotted for each player,
      increment: increment: the time (in seconds) each player gains per move they make,
      seeker: the id of the user who created the seek,
      challenger: the id of the user who accepted the seek
  }
)
  ```
  
  **Get game**
  ```
  axios.get(https://crochess-backend.herokuapp.com/games)
  ```
  
  **Make Move**
  ```
  axios.patch(
    https://crochess-backend.herokuapp.com/games,
    {
      playerId: id of player making move,
      from: square of the piece to move,
      to: square to move to,
      promote: the piece type to promote to, leave empty if no promotion is happening'
    }
  )
  ```
  Validates the move and makes the necessary changes to the board. Adjusts time, history, and game state as well. 
  
  **Update game state**
  
  for claiming draw, resign actions
  ```
  axios.patch(
    https://crochess-backend.herokuapp.com/games/status,
    {
      winner: the winner if there is one, if game is a draw set this to null,
      causeOfDeath: the reason the game is over
    }
  )
  ```
  
  **Update draw status**
  
  for updating draw availability
  ```
  axios.patch(
    https://crochess-backend.herokuapp.com/games/status,
    {
      claimDraw: {
                    white: boolean,
                    black: boolean
                  }
    }
  )
  ```
  
    

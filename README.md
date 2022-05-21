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
      color: the color the seeker wishes to play as
      seeker: the socket id of the user creating the seek,
      gameType: the type of game based on the time control selected ie. 'bullet', 'blitz', 'rapid' , etc
   })
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
  ```
  
  **

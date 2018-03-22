
let gameOption = 1

let levelMap = []
let mapgrid = []
let i, j


let playerProperties = {properties: {name: 'player',
                                    //collect: false,
                                    squash: false,
                                    solidToRedFrog: false,
                                    triggerButton: true},
                                    empty: false,
                                    state: {startleFrog: true}}

let playerX = 1
let playerY = 1
let playerStartX = 1
let playerStartY = 1
let playerMoveDir = null
let playerMoveCount = 0
let playerMoving = null // to track when animation should play

let gameScore = 0
let playerLives = 3

let contents = null
let temp = null

// let NORTH = [0, -1], SOUTH = [0,1], WEST = [-1,0], EAST = [1,0]
// let NW = [-1, -1], NE = [1,-1], SW = [-1,1], SE = [1,1]
// let HERE = [0, 0]

//let daveImg
let daveSprites
let gamesprites
let targetSprite
let daveAnim
let daveAnimCount = 0
let daveFrame = 0
let daveWait = 10

let editItem = 1
let spacePressed = false
let escapePressed = false
let shiftPressed = false
let controlPressed = false
let backPressed = false
//let enterPressed = false
let mPressed = false
let upPressed = false
let downPressed = false
let leftPressed = false
let rightPressed = false

let selectTarget = false
let savedX = null, savedY = null
let hitItem = null

let gameMessage = 'whoops!'
let resetLevel = false

function preload() {
  //daveImg = loadImage('images/dave2.png')

  loadGameSprites()

  daveSprites = [loadImage("Images/dave2.png"),
                loadImage("Images/dave_run1.png"),
                loadImage("Images/dave_run2.png"),
                loadImage("Images/dave_run3.png"),
                loadImage("Images/dave_run4.png"),
                loadImage("Images/dave_run5.png"),
                loadImage("Images/dave_run6.png"),
                loadImage("Images/dave_run_v1.png"),
                loadImage("Images/dave_run_v2.png"),
                loadImage("Images/dave_run_v3.png"),
                loadImage("Images/dave_run_v4.png")]

  // [key] makes it so you can call the object with a variable for the key
  daveAnim = {[NORTH]: [9,10,9,10],
              [SOUTH]: [7,8,7,8],
              [EAST]: [1,2,3,2],
              [WEST]: [4,5,6,5]}

  targetSprite = loadImage('images/target.png')

  levelMap = loadJSON('level.json')

  //console.log(levelMap)
}

function setup() {
  createCanvas(640, 480)
  background(0)
  noStroke()
  frameRate(30)


}

function resetFlags(rx, ry){
  mapgrid[rx][ry].properties = itemProperties[mapgrid[rx][ry].item] // set references to itemProperties
  mapgrid[rx][ry].anim_timer = 0
  mapgrid[rx][ry].anim_frame = 0
  mapgrid[rx][ry].animation = mapgrid[rx][ry].properties.animation
  mapgrid[rx][ry].sprite = getProperty(mapgrid[rx][ry], 'sprite')
  mapgrid[rx][ry].moveCounter = 0
  mapgrid[rx][ry].moveDir = null
  mapgrid[rx][ry].moved = null
  mapgrid[rx][ry].beingMovedInto = null
  mapgrid[rx][ry].solid = mapgrid[rx][ry].properties.solid
  mapgrid[rx][ry].squash = mapgrid[rx][ry].properties.squash
  mapgrid[rx][ry].forward = mapgrid[rx][ry].properties.forward
  mapgrid[rx][ry].right = mapgrid[rx][ry].properties.right
  mapgrid[rx][ry].backward = mapgrid[rx][ry].properties.backward
  mapgrid[rx][ry].left = mapgrid[rx][ry].properties.left
  mapgrid[rx][ry].cloned = false
  mapgrid[rx][ry].state = Object.assign({}, mapgrid[rx][ry].properties.state)
  if (mapgrid[rx][ry].item == 0){
    mapgrid[rx][ry].empty = true
  } else {
    mapgrid[rx][ry].empty = false
  }
}

function setupGame(){
  playerStartX = levelMap.playerX
  playerStartY = levelMap.playerY
  console.log(playerStartX, playerStartY)
  playerX = playerStartX
  playerY = playerStartY
  playerMoveDir = null
  playerMoveCount = 0

  gameScore = 0

  contents = null
  temp = null

  //Create mapgrid from levelMap
  for(i=0; i<16; i++){
    mapgrid[i] = []
    for(j=0; j<12; j++){
      mapgrid[i][j] = new Object()
      // shallow copy the object, so mapgrid is not just a reference to levelMap
      mapgrid[i][j] = Object.assign({}, levelMap[i][j])
      resetFlags(i,j)

    }
  }
}

function draw() {
  if (gameOption == 0){ // Editor
    //titleScreen()
    editor()
    mPressed = false // Placed here so mouse button isn't permanently pressed
    if (escapePressed == true){
       gameOption = 1
       escapePressed = false
    }
    if (backPressed){
       saveJSON(levelMap, 'level.json')
       console.log('Saving!')
       backPressed = false
    }
  }

  if (gameOption == 1){ // Game set up
    setupGame()
    gameOption = 2
  }

  if (gameOption == 2){ // Play the game
    playGame()
    spacePressed = false // Placed here so action button isn't permanently pressed
    mPressed = false
    if (escapePressed == true) {
      gameOption = 0
      escapePressed = false
    }
  }

  if (gameOption == 3){ // Wait for keypress, used for message boxes
    fill(0)
    rectMode(CENTER)
    rect(320, 240, 300, 100)
    textSize(32)
    fill(255)
    textAlign(CENTER)
    text(gameMessage, 320, 240)
    if(spacePressed){
      if(resetLevel){
        gameOption = 1
        resetLevel = false
      } else {
        gameOption = 2
      }
    }
  }

}

function playGame(){

  getKeyPress()
  movePlayer()
  //console.log(playerMoving, playerMoveDir)

  if (spacePressed){
    console.log ('action!')
  }

  // Hit items under character
  contents = mapgrid[playerX][playerY]
  if (!contents.solid){ // So Dave can push the chopper around without accidently ending the level
    ///let tempX = playerX, tempY = playerY // in case player is moved by hit function
    hitItem = Object.assign({}, mapgrid[playerX][playerY])
    itemProperties[mapgrid[playerX][playerY].item].hit(playerX, playerY, playerProperties.properties)
    //createItem(tempX, tempY, 0, false)
  }

  // Scan grid for things to do
  for(i=0; i<16; i++){
    for(j=0; j<12; j++){

      // Activate item actions!
      //if(mapgrid[i][j].beingMovedInto == null){
      if(mapgrid[i][j].cloned == false){ // ignore items that just clones for movement purposes
        itemProperties[mapgrid[i][j].item].action()
        if (mapgrid[i][j].moved != null){
          mapgrid[i][j].moved = null
          //console.log('stopped!')
        }
      }

      // Animate map sprites
      if (mapgrid[i][j].animation != null && mapgrid[i][j].beingMovedInto == null){

          if (mapgrid[i][j].anim_timer < mapgrid[i][j].animation[mapgrid[i][j].anim_frame][1] - 1){
              mapgrid[i][j].anim_timer ++
          } else {
              mapgrid[i][j].anim_timer = 0
              mapgrid[i][j].anim_frame ++
              if (mapgrid[i][j].anim_frame == mapgrid[i][j].animation.length){
                mapgrid[i][j].anim_frame = 0
              }
          }

          mapgrid[i][j].sprite = mapgrid[i][j].animation[mapgrid[i][j].anim_frame][0]

          //console.log(mapgrid[i][j].anim_timer, mapgrid[i][j].anim_frame, mapgrid[i][j].sprite)
      }


    }
  }
  for(i=0; i<16; i++){
    for(j=0; j<12; j++){
      if (mapgrid[i][j].moveDir != null){
        moveItems()
      }
    }
  }

  if(gameOption != 2) return // Don't draw if player killed, etc

  //Draw objects on screen

  background(150, 150, 255)

  for(i=0; i<16; i++){
    for(j=0; j<12; j++){
      if (mapgrid[i][j].sprite != 0){
        //image(gameSprites[getProperty(mapgrid[i][j].item, 'sprite')], i*40, j*40)
        //console.log(mapgrid[i][j])
        let offsetX = 0, offsetY = 0
        if (mapgrid[i][j].moveDir != null){
          offsetX = mapgrid[i][j].moveDir[0] * mapgrid[i][j].moveCounter * 10
          offsetY = mapgrid[i][j].moveDir[1] * mapgrid[i][j].moveCounter * 10
        }
        image(gameSprites[mapgrid[i][j].sprite], i*40 + offsetX, j*40 + offsetY)  // use for animation, broken atm
      }
    }
  }

  let xOffset = 0, yOffset = 0

  if (playerMoveDir != null){
    xOffset = playerMoveDir[0] * playerMoveCount * 10
    yOffset = playerMoveDir[1] * playerMoveCount * 10
  }

  // Animate player


  if (playerMoveDir != null){
    playerMoving = playerMoveDir
  }
  //console.log(playerMoving)

  if (playerMoving != null){
    daveAnimCount ++
    if (daveAnimCount > 3) {
      daveAnimCount = 0
      daveFrame ++
    }
    if (daveFrame > 3) daveFrame = 0
    //console.log(daveFrame)
  }
  //console.log(playerMoveDir)

  //console.log(playerMoving)
  let animFrame
  if (playerMoving == null){
    animFrame = 0
  } else {
    animFrame = daveAnim[playerMoving][daveFrame]
  }


  if (daveWait > 0){
    daveWait --
  } else if (daveWait == 0){
    animFrame = 0
    //console.log('here')
  }


  image(daveSprites[animFrame], playerX*40 + xOffset, playerY*40 + yOffset)

  //console.log(frameRate())
}

// used during gameplay
function getKeyPress() {
  if (playerMoveDir == null){
    if (keyIsDown(UP_ARROW)) {
      contents = look(NORTH, playerX, playerY)
      if(contents.solid == false) {
        playerMoveDir = NORTH
        daveWait = 5
      } else if (getProperty(contents, 'vpush') && contents.moveDir == null && contents.beingMovedInto == null){
        //console.log(getProperty(contents, 'hpush'),contents.moveDir,contents.beingMovedInto)
        temp = look(NORTH, playerX, playerY - 1)
        //if (getProperty(temp, 'squash')){
        if (temp.properties.checkSquash(playerX, playerY - 2, contents)){

          move(NORTH, playerX, playerY - 1)
          playerMoveDir = NORTH
          daveWait = 5
        }
      }
      //playerMoving = NORTH
      //console.log("up")
    } else if (keyIsDown(DOWN_ARROW)) {
      contents = look(SOUTH, playerX, playerY)
      if(contents.solid == false) {
        playerMoveDir = SOUTH
        daveWait = 5
      } else if (getProperty(contents, 'vpush') && contents.moveDir == null && contents.beingMovedInto == null){
        //console.log(getProperty(contents, 'hpush'),contents.moveDir,contents.beingMovedInto)
        temp = look(SOUTH, playerX, playerY + 1)
        //if (getProperty(temp, 'squash')){
        if (temp.properties.checkSquash(playerX, playerY + 2, contents)){

          move(SOUTH, playerX, playerY + 1)
          playerMoveDir = SOUTH
          daveWait = 5
          //playerMoving = EAST
        }
      }
      //playerMoving = SOUTH
      //console.log("down")
    } else if (keyIsDown(RIGHT_ARROW)) {
      contents = look(EAST, playerX, playerY)

      if(contents.solid == false){
        playerMoveDir = EAST
        daveWait = 5
        //playerMoving = EAST

      } else if (getProperty(contents, 'hpush') && contents.moveDir == null && contents.beingMovedInto == null){
        //console.log(getProperty(contents, 'hpush'),contents.moveDir,contents.beingMovedInto)
        temp = look(EAST, playerX + 1, playerY)
        //if (getProperty(temp, 'squash')){
        if (temp.properties.checkSquash(playerX + 2, playerY, contents)){

          move(EAST, playerX + 1, playerY)
          playerMoveDir = EAST
          daveWait = 5
          //playerMoving = EAST
        }
      }

      //console.log("right")
    } else if (keyIsDown(LEFT_ARROW)) {
      contents = look(WEST, playerX, playerY)

      if(contents.solid == false) {
        playerMoveDir = WEST
        daveWait = 5
        //playerMoving = WEST
      } else if (getProperty(contents, 'hpush') && contents.moveDir == null && contents.beingMovedInto == null){
        temp = look(WEST, playerX - 1, playerY)
        //if (getProperty(temp, 'squash')){
        if (temp.properties.checkSquash(playerX - 2, playerY, contents)){

          move(WEST, playerX - 1, playerY)
          playerMoveDir = WEST
          daveWait = 5
          //playerMoving = WEST
        }
      }

      //console.log("left")
    }
    // else {
    //   playerMoving = null
    // }
  }
}

function keyPressed(){
  if (key == ' '){
    spacePressed = true
  }
  if (keyCode == SHIFT){
    shiftPressed = true
  }
  if (keyCode == ESCAPE){
    escapePressed = true
  }
  if (keyCode == ENTER){
    enterPressed = true
  }
  if (keyCode == CONTROL){
    controlPressed = true
  }
  if (keyCode == BACKSPACE){
    backPressed = true
  }
}

function mousePressed(){
  mPressed = true
}

function look(direction, inputX, inputY){
  let tempX = inputX + direction[0], tempY = inputY + direction[1]
  //console.log(tempX, tempY)

  let playerInDirection = false
  if(tempX == playerX && tempY == playerY) playerInDirection = true
  else if(playerMoveCount > 0){
    if (tempX == playerX + playerMoveDir[0] && tempY == playerY + playerMoveDir[1]){
      playerInDirection = true
    }
  }

  if (tempX > -1 && tempX < 16 && tempY > -1 && tempY < 12){

    let tempReturn = mapgrid[tempX][tempY]

    if(playerInDirection) {
      //return playerProperties
      tempReturn.isDave = true
    } else {
      tempReturn.isDave = false
    }

    return tempReturn

    // if (itemProperties[mapgrid[tempX][tempY]][property]){
    //   if (!playerInDirection)
    //   return true
    // }
  } else {
    let tempReturn = itemProperties[1]
    tempReturn.properties = itemProperties[1]
    tempReturn.item = 1
    tempReturn.squash = false
    return tempReturn
  }
}

function getProperty (item, property){
  if (item.properties.name != 'player'){
    //console.log(item)
    let tempItem = item.item
    return itemProperties[tempItem][property]

  } else {
    return playerProperties[property]
  }
}

function movePlayer(){
  if (playerMoveDir !=null){
    playerMoveCount++
    //console.log(playerMoveDir)
    if (playerMoveCount > 3) {
      playerMoveCount = 0
      playerX = playerX + playerMoveDir[0]
      playerY = playerY + playerMoveDir[1]
      playerMoveDir = null
    }
  }
}

function killPlayer(){

  playerMoveCount = 0
  playerX = playerStartX
  playerY = playerStartY
  playerMoveDir = null
  playerLives--

  if (playerLives < 0){
    //gameOption = 1
    setMessage('Poor Dave!')
    resetLevel = true
    playerLives = 3
  } else {
    setMessage('Watch out Dave!')
    console.log('Lives: ' + playerLives)
  }
}

function levelFinished(){
  setMessage('Level Finished!')
  resetLevel = true
}

function setMessage(message){
  console.log(message)
  gameMessage = message
  gameOption = 3
}

function move(direction, mx, my){
  //console.log(mx, my)
  if (mapgrid[mx][my].properties.moveSpeed == 0) {
    console.log('No move speed for ' + mapgrid[mx][my].properties.name)
  }
  if (mapgrid[mx][my].moveDir == null){
    mapgrid[mx][my].moveDir = direction

    // Calculate relative directions
    if (direction == NORTH){
      mapgrid[mx][my].forward = NORTH
      mapgrid[mx][my].right = EAST
      mapgrid[mx][my].backward = SOUTH
      mapgrid[mx][my].left = WEST
      //console.log('up')
    } else if (direction == EAST){
      mapgrid[mx][my].forward = EAST
      mapgrid[mx][my].right = SOUTH
      mapgrid[mx][my].backward = WEST
      mapgrid[mx][my].left = NORTH
      //console.log('right')
    } else if (direction == SOUTH){
      mapgrid[mx][my].forward = SOUTH
      mapgrid[mx][my].right = WEST
      mapgrid[mx][my].backward = NORTH
      mapgrid[mx][my].left = EAST
      //console.log('down')
    } else if (direction == WEST){
      mapgrid[mx][my].forward = WEST
      mapgrid[mx][my].right = NORTH
      mapgrid[mx][my].backward = EAST
      mapgrid[mx][my].left = SOUTH
      //console.log('left')
    }

    // Calculate the opposite of 'direction' for .beingMovedInto
    // let oppX = 0 - direction[0]
    // let oppY = 0 - direction[1]

    // create new object but set it so it can't be seen (sprite = 0) and
    // it doesn't activate actions (beingMovedInto = true)
    if(mapgrid[mx + direction[0]][my + direction[1]].item == 0){
      createItem(mx + direction[0], my + direction[1], mapgrid[mx][my].item, false)
      mapgrid[mx + direction[0]][my + direction[1]].cloned = true
      mapgrid[mx + direction[0]][my + direction[1]].sprite = 0
    }
    mapgrid[mx + direction[0]][my + direction[1]].empty = false
    if(mapgrid[mx + direction[0]][my + direction[1]].beingMovedInto == null){
      mapgrid[mx + direction[0]][my + direction[1]].beingMovedInto = mapgrid[mx][my].backward
    }
    mapgrid[mx + direction[0]][my + direction[1]].squash = mapgrid[mx][my].squash

  }
}

function moveItems(){
  //console.log(itemProperties[itemNumber].moveSpeed)
  mapgrid[i][j].moveCounter += itemProperties[mapgrid[i][j].item].moveSpeed
  if(mapgrid[i][j].moveCounter > 3){
    let xdiff = i + mapgrid[i][j].moveDir[0]
    let ydiff = j + mapgrid[i][j].moveDir[1]
    let tempDir = mapgrid[i][j].moveDir
    let tempState = Object.assign({}, mapgrid[i][j].state)
    let tempf = mapgrid[i][j].forward, tempr = mapgrid[i][j].right
    let tempb = mapgrid[i][j].backward, templ = mapgrid[i][j].left
    let tempSolid = mapgrid[i][j].solid

    // if moving onto another moving item, clear that other item
    let bmi = mapgrid[xdiff][ydiff].beingMovedInto
    if(bmi != mapgrid[i][j].backward && bmi != null){
      //console.log(xdiff, ydiff)
      mapgrid[xdiff + bmi[0]][ydiff + bmi[1]].item = 0
      resetFlags(xdiff + bmi[0], ydiff + bmi[1])
    }

    //createItem(xdiff, ydiff, mapgrid[i][j].item, false)
    hitItem = Object.assign({}, mapgrid[xdiff][ydiff])
    hitItem.state = Object.assign({}, mapgrid[xdiff][ydiff].state)
    mapgrid[xdiff][ydiff].item = mapgrid[i][j].item
    resetFlags(xdiff, ydiff)

    mapgrid[xdiff][ydiff].anim_timer = mapgrid[i][j].anim_timer
    mapgrid[xdiff][ydiff].anim_frame = mapgrid[i][j].anim_frame
    mapgrid[xdiff][ydiff].sprite = mapgrid[i][j].sprite
    mapgrid[xdiff][ydiff].animation = mapgrid[i][j].animation

    mapgrid[xdiff][ydiff].moved = tempDir
    mapgrid[xdiff][ydiff].state = tempState
    mapgrid[xdiff][ydiff].forward = tempf
    mapgrid[xdiff][ydiff].right = tempr
    mapgrid[xdiff][ydiff].backward = tempb
    mapgrid[xdiff][ydiff].left = templ
    mapgrid[xdiff][ydiff].solid = tempSolid

    // This is here instead of in createItem so that sprites are copied correctly
    itemProperties[hitItem.item].hit(xdiff, ydiff, itemProperties[mapgrid[i][j].item])

    //createItem(i, j, 0, false)
    mapgrid[i][j].item = 0
    resetFlags(i, j)

    mapgrid[i][j].moveCounter = 0
    mapgrid[i][j].moveDir = null
  }
}

function changeItem(a,b){

  for(let ii=0; ii<16; ii++){
    for(let jj=0; jj<12; jj++){
      if(mapgrid[ii][jj].item == a) {
        createItem(ii, jj, b, true)
        //console.log("changed!")
      }
    }
  }
}

function createItem(cX, cY, cItem, triggerHit){

  hitItem = Object.assign({}, mapgrid[cX][cY])
  hitItem.state = Object.assign({}, mapgrid[cX][cY].state)

  // if object this is being created on is moving, remove clone
  // TODO: if not clone, make sure flags are set correctly?

  let direction = mapgrid[cX][cY].moveDir
  if(direction!= null && mapgrid[cX + direction[0]][cY + direction[1]].cloned){
    //mapgrid[cX][cY].moveDir = null
    createItem(cX + direction[0], cY + direction[1], 0, false)
  }

  // bmi = mapgrid[cX][cY].beingMovedInto
  // if(bmi != null){
  //   //mapgrid[cX][cY].beingMovedInto = null
  //   console.log(mapgrid[cX + bmi[0]][cY + bmi[1]].properties.name)
  //   //createItem(cX + bmi[0], cY + bmi[1], 0, false)
  //   // mapgrid[cX + bmi[0]][cY + bmi[1]].item = 0
  //   // resetFlags(cX + bmi[0],cY + bmi[1])
  // }


  //mapgrid[cX][cY] = {} // Create new object so no stray properties
  mapgrid[cX][cY].item = cItem
  resetFlags(cX, cY)

  if (triggerHit){

    itemProperties[hitItem.item].hit(cX, cY, itemProperties[cItem])
  }

}

function daveIsTo(direction, x, y){
  if (direction == NORTH && y > playerY) return true
  if (direction == SOUTH && y < playerY) return true
  if (direction == EAST && x < playerX) return true
  if (direction == WEST && x > playerX) return true

  return false
}

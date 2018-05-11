function editor(){

  background(0, 255, 255)

  let cursorX = floor(mouseX/40)
  let cursorY = floor(mouseY/40)
  if (cursorX < 0) cursorX = 0
  if (cursorY < 0) cursorY = 0
  if (cursorX > 15) cursorX = 15
  if (cursorY > 11) cursorY = 11

  if (mPressed){
    if(selectTarget != true){
      levelMap[cursorX + editMapOffsetX][cursorY + editMapOffsetY].item = editItem
      delete levelMap[cursorX + editMapOffsetX][cursorY + editMapOffsetY].target
      //console.log(levelMap[cursorX + editMapOffsetX][cursorY + editMapOffsetY].item)
      if(getPropertyEdit(levelMap[cursorX + editMapOffsetX][cursorY + editMapOffsetY].item, 'needsTarget')){
        selectTarget = true
        endSelect = false
        savedX = cursorX + editMapOffsetX
        savedY = cursorY + editMapOffsetY
        console.log('needsTarget')
      }
    } else {
      levelMap[savedX][savedY].target = [cursorX + editMapOffsetX,cursorY + editMapOffsetY]
      //console.log(levelMap[savedX][savedY].target)
      selectTarget = false
    }
  } else if (mouseIsPressed){

    if (!selectTarget && endSelect){

        levelMap[cursorX + editMapOffsetX][cursorY + editMapOffsetY].item = editItem
        //console.log('PRESSED')

    }
  } else if(!endSelect && !selectTarget){
    //console.log('or else')
    endSelect = true
  }

  if (spacePressed == true){
    editItem++
    //console.log(itemsLength)
    if (editItem > itemsLength){
      editItem = 0
    }
    spacePressed = false
  }
  if (shiftPressed == true){
    editItem--
    //console.log(itemsLength)
    if (editItem < 0){
      editItem = itemsLength
    }
    shiftPressed = false
  }

  if (controlPressed == true){
    playerStartX = cursorX + editMapOffsetX
    playerStartY = cursorY + editMapOffsetY
    levelMap.playerX = playerStartX
    levelMap.playerY = playerStartY

    controlPressed = false
  }

  // Save map
  if (keysPressed['='] == true){
    levelMap.levelHeight = LEVELHEIGHT
    levelMap.levelWidth = LEVELWIDTH
    levelMap.minScore = minScore
    saveJSON(levelMap, 'level.json')
    console.log('Saving!')
    keysPressed['='] = false
  }

  if (keysPressed['N'] == true){
    gameOption = 'newmap'
    keysPressed['N'] = false
  }

  if (keysPressed['M'] == true){
    gameOption = 'minscore'
    keysPressed['M'] = false
  }

  if(keysPressed['W'] == true){
    editMapOffsetY--
    if(editMapOffsetY < 0){
      editMapOffsetY = 0
    }
    keysPressed['W'] = false
  }

  if(keysPressed['S'] == true){
    editMapOffsetY++
    if(editMapOffsetY > LEVELHEIGHT - 12){
      editMapOffsetY = LEVELHEIGHT - 12
    }
    keysPressed['S'] = false
  }

  if(keysPressed['A'] == true){
    editMapOffsetX--
    if(editMapOffsetX < 0){
      editMapOffsetX = 0
    }
    keysPressed['A'] = false
  }

  if(keysPressed['D'] == true){
    editMapOffsetX++
    if(editMapOffsetX > LEVELWIDTH - 16){
      editMapOffsetX = LEVELWIDTH - 16
    }
    keysPressed['D'] = false
  }

  // Show map
  for(let i=0; i<16; i++){
    for(let j=0; j<12; j++){
      if (levelMap[i + editMapOffsetX][j + editMapOffsetY].item != 0){
        //console.log(getProperty(levelMap[i][j].item, 'sprite'))
        image(gameSprites[getPropertyEdit(levelMap[i + editMapOffsetX][j + editMapOffsetY].item, 'sprite')], i*40, j*40)
        let tempTarget = levelMap[i + editMapOffsetX][j + editMapOffsetY].target

        // Show all targets for onscreen items
        // if (tempTarget != undefined){
        //   image(targetSprite, (tempTarget[0] - editMapOffsetX) * 40, (tempTarget[1] - editMapOffsetY) * 40)
        // }
      }
    }
  }

  // Show cursor
  fill(255, 255, 255)
  rectMode(CORNER)
  rect(cursorX * 40, cursorY * 40, 40, 40)
  if(editItem > 0 && selectTarget != true){
    image(gameSprites[getPropertyEdit(editItem, 'sprite')], cursorX * 40, cursorY * 40)
  } else if (selectTarget == true){
    image(targetSprite, cursorX * 40, cursorY * 40)
  }

  // Show Dave
  image(daveSprites[0], (playerStartX - editMapOffsetX) * 40, (playerStartY - editMapOffsetY) * 40)

  // Show targets when hovering over a tile which has a target
  if(levelMap[cursorX + editMapOffsetX][cursorY + editMapOffsetY].target != undefined){
    let tempTarget = levelMap[cursorX + editMapOffsetX][cursorY + editMapOffsetY].target
    let tempX = tempTarget[0] - editMapOffsetX
    let tempY = tempTarget[1] - editMapOffsetY

    // If target is offscreen, put it halfway on screen
    if (tempX < 0) tempX = -0.5
    if (tempX > 15) tempX = 15.5
    if (tempY < 0) tempY = -0.5
    if (tempY > 11) tempY = 11.5

    image(targetSprite, tempX * 40, tempY * 40)
    //console.log('dlkfjslfjdsl')
  }

}

function getPropertyEdit (item, property){
  if (item.name != 'player'){
    //console.log(item)
    //let tempItem = item.item
    return itemProperties[item][property]

  } else {
    return playerProperties[property]
  }
}

function createNewMap (){
  //console.log('new map')

  fill(0)
  rectMode(CENTER)
  rect(320, 240, 300, 160)
  textSize(32)
  fill(255)
  textAlign(CENTER)
  text('New Level', 320, 220)
  text('Width: ' + tempWidth, 320, 260)
  text('Height: ' + tempHeight, 320, 300)

  if(keysPressed['W'] == true){
    tempHeight--
    if (tempHeight < 12) tempHeight = 12

    keysPressed['W'] = false
  }

  if(keysPressed['S'] == true){
    tempHeight++

    keysPressed['S'] = false
  }

  if(keysPressed['A'] == true){
    tempWidth--
    if (tempWidth < 16) tempWidth = 16

    keysPressed['A'] = false
  }

  if(keysPressed['D'] == true){
    tempWidth++

    keysPressed['D'] = false
  }

  if(enterPressed){
    LEVELWIDTH = tempWidth
    LEVELHEIGHT = tempHeight
    tempHeight = 16 // set the temp variables up for next time
    tempWidth = 12

    // New blank map
    levelMap = {}
    for (let nX = 0; nX < LEVELWIDTH; nX++){
      levelMap[nX] = []
      for (let nY = 0; nY < LEVELHEIGHT; nY++){
        levelMap[nX][nY] = {item: 0}
      }
    }
    levelMap.playerX = 0
    levelMap.playerY = 0
    levelMap.levelHeight = LEVELHEIGHT
    levelMap.levelWidth = LEVELWIDTH
    //levelMap.minScore = 5

    playerStartX = 0
    playerStartY = 0

    editMapOffsetX = 0
    editMapOffsetY = 0

    minScore = 10
    tempScore = minScore
    levelMap.minScore = minScore

    gameOption = 'editor'
    enterPressed = false
  }

  if (escapePressed){
    gameOption = 'editor'
    escapePressed = false
    tempHeight = 16 // set the temp variables up for next time
    tempWidth = 12
  }
}

function setMinScore (){
  //console.log('new map')

  fill(0)
  rectMode(CENTER)
  rect(320, 240, 300, 160)
  textSize(32)
  fill(255)
  textAlign(CENTER)
  text('Minimum Score:', 320, 220)
  text(tempScore, 320, 260)

  if(keysPressed['W'] == true){
    tempScore--
    if (tempScore < 1) tempScore = 1

    keysPressed['W'] = false
  }

  if(keysPressed['S'] == true){
    tempScore++

    keysPressed['S'] = false
  }


  if(enterPressed){
    minScore = tempScore
    console.log(minScore)
    //tempScore = 5 // set the temp variable up for next time

    levelMap.minScore = minScore

    gameOption = 'editor'
    enterPressed = false
  }
}

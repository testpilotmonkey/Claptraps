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
      levelMap[cursorX][cursorY].item = editItem
      console.log(levelMap[cursorX][cursorY].item)
      if(getPropertyEdit(levelMap[cursorX][cursorY].item, 'needsTarget')){
        selectTarget = true
        savedX = cursorX
        savedY = cursorY
        console.log('needsTarget')
      }
    } else {
      levelMap[savedX][savedY].target = [cursorX,cursorY]
      console.log(levelMap[savedX][savedY].target)
      selectTarget = false
    }
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
    playerStartX = cursorX
    playerStartY = cursorY
    levelMap.playerX = playerStartX
    levelMap.playerY = playerStartY

    controlPressed = false
  }



  for(i=0; i<16; i++){
    for(j=0; j<12; j++){
      if (levelMap[i][j].item != 0){
        //console.log(getProperty(levelMap[i][j].item, 'sprite'))
        image(gameSprites[getPropertyEdit(levelMap[i][j].item, 'sprite')], i*40, j*40)
      }
    }
  }

  fill(255, 255, 255)
  rectMode(CORNER)
  rect(cursorX * 40, cursorY * 40, 40, 40)
  if(editItem > 0 && selectTarget != true){
    image(gameSprites[getPropertyEdit(editItem, 'sprite')], cursorX * 40, cursorY * 40)
  } else if (selectTarget == true){
    image(targetSprite, cursorX * 40, cursorY * 40)
  }

  image(daveSprites[0], playerStartX * 40, playerStartY * 40)

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

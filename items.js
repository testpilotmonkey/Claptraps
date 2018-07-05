// These are defined here so that constructors can use them, otherwise we have to
// use JSON.stringify everywhere
let NORTH = [0, -1], SOUTH = [0,1], WEST = [-1,0], EAST = [1,0]
let NW = [-1, -1], NE = [1,-1], SW = [-1,1], SE = [1,1]
let HERE = [0, 0]
let scanX = 'left'
let scanY = 'down'

class Thing {
  constructor() {
    this.name = 'thing'
    this.sprite = 1
    this.animation = null
    this.solid = false
    //this.collect = true
    this.squash = true
    this.hpush = false
    this.vpush = false
    this.curveR = false
    this.curveL = false
    this.forward = WEST
    this.right = NORTH
    this.backward = EAST
    this.left = SOUTH
    this.needsTarget = false
    this.target = [0,0]
    this.moveSpeed = 0
    this.breakBox = false
    this.solidToRedFrog = true
    this.triggerButton = false
    this.state = {startleFrog: false} // State object that gets copied when item on map moves. eg life of apple goes here
    this.actor = false
  }

  hit(hitX, hitY, hitby){
    return
  }

  action(i, j){
    return
  }

  checkSquash(sX, sY, squasher){
    // 'look' is here just in case coordinates are off the map
    return look(HERE, sX, sY).squash
  }
}

class Space extends Thing{
  constructor() {
    super()
    this.name = 'space'
    this.sprite = 0
    this.animation = null
    //this.collect = true
    this.squash = true
    this.hpush = false
    this.solidToRedFrog = false
  }
}

class Wall extends Thing{
  constructor() {
    super()
    //this.item = 1
    this.name = 'wall'
    this.sprite = 1
    this.solid = true
    this.animation = null
    //this.collect = false
    this.squash = false
    this.hpush = false
    this.breakBox = true
  }
}

class Smiley extends Thing {
  constructor() {
    super()
    this.name = 'smiley'
    this.sprite = 2
    this.animation = null
    this.squash = false
    this.solid = true
    this.hpush = true
    this.vpush = true
    this.curveR = true
    this.curveL = true
    this.moveSpeed = 2
    this.breakBox = true
    this.triggerButton = true
  }

  action(i, j){

    if(mapgrid[i][j].moveDir != null || mapgrid[i][j].moved != null){
      mapgrid[i][j].state.startleFrog = true
    } else {
      mapgrid[i][j].state.startleFrog = false
    }

    if(mapgrid[i][j].moved != null){
      contents = look(mapgrid[i][j].moved, i, j)
      if(contents.empty
        || ['calmfrog', 'startledfrog', 'redfrog','angryredfrog','transporter','laser'].includes(contents.properties.name)){
        if (!contents.isDave){
          move(mapgrid[i][j].moved, i, j)
        }
      }
      //console.log(look(mapgrid[i][j].moved, i, j).properties.name)
      if(look(mapgrid[i][j].moved, i, j).properties.name == 'box'){
        createItem(i + mapgrid[i][j].moved[0], j + mapgrid[i][j].moved[1], 8, false)
      }
    }
  }

}

class Apple extends Thing {
  constructor() {
    super()
    this.name = 'apple'
    this.sprite = 3
    this.solid = true
    this.animation = null
    //this.collect = false
    this.squash = false
    this.hpush = true
    this.curveR = true
    this.curveL = true
    this.moveSpeed = 4
    this.state = {life: 60, startleFrog: false}
  }

  action(i, j){

    if(mapgrid[i][j].moveDir != null || mapgrid[i][j].moved != null){
      mapgrid[i][j].state.startleFrog = true
    } else {
      mapgrid[i][j].state.startleFrog = false
    }

   //if (mapgrid[i][j].moved != true) { // Don't need .moved anymore as item actions and movement happen in separate loops
   contents = look(SOUTH, i, j)
   //console.log(contents)
   if(contents.squash
      &&['space', 'calmfrog', 'startledfrog', 'redfrog','angryredfrog','laser'].includes(contents.properties.name)
      && !contents.isDave) {
//   if(contents.squash == true && !contents.isDave) {
     move(SOUTH, i, j)
     mapgrid[i][j+1].moving = true // set moving so can hit player
     //mapgrid[i][j+1].moved = true //set it to moved so it isn't going to trigger when we scan again on the next line
     return
   }

   if(getProperty(contents, 'curveL')) {
     //console.log("curveL")
     temp = look(WEST, i, j)
     //if(temp.squash == true && !temp.isDave){
     if(temp.squash
        &&['space', 'calmfrog', 'startledfrog', 'redfrog','angryredfrog','laser'].includes(temp.properties.name)
        && !temp.isDave) {
       temp = look(SW, i, j)
       //if(temp.squash == true && !temp.isDave){
       if(temp.squash
          &&['space', 'calmfrog', 'startledfrog', 'redfrog','angryredfrog','laser'].includes(temp.properties.name)
          && !temp.isDave) {
         //console.log("moveL")
         // createItem(i, j, 0, true)
         // createItem(i-1, j, 3, true)
         move(WEST, i, j)
         mapgrid[i-1][j].moving = true
         return
       }
     }
   }

   if(getProperty(contents, 'curveR')) {
     temp = look(EAST, i, j)
     //if(temp.squash == true && !temp.isDave){
     if(temp.squash
        &&['space', 'calmfrog', 'startledfrog', 'redfrog','angryredfrog','laser'].includes(temp.properties.name)
        && !temp.isDave) {
       temp = look(SE, i, j)
       //if(temp.squash == true && !temp.isDave){
       if(temp.squash
          &&['space', 'calmfrog', 'startledfrog', 'redfrog','angryredfrog','laser'].includes(temp.properties.name)
          && !temp.isDave) {
         //console.log("moveR")
         // createItem(i, j, 0, true)
         // createItem(i+1, j, 3, true)
         move(EAST, i, j)
         mapgrid[i+1][j].moving = true
         //mapgrid[i+1][j].moved = true
         return // Technically not needed, but better safe than sorry
       }
     }
   }
   //}

   if (mapgrid[i][j].moving == true) {
     contents = look(SOUTH, i, j)
     if(contents.isDave){
       killPlayer()
     }
     // If this is an apple which has moved, set its movement to false, so it doesn't keep killing you
     mapgrid[i][j].moving = false

   }
 }

  eat(x, y){
    mapgrid[x][y].state.life--
    if(mapgrid[x][y].state.life < 0){
      createItem(x, y, 0, false)
    }
  }

}

class Key extends Thing {
  constructor() {
    super()
    this.name = 'key'
    this.sprite = 4
    this.animation = null
    //this.collect = false
    this.solid = true
    this.squash = false
    this.hpush = true
    this.vpush = true
    this.moveSpeed = 1
  }
}

class Box extends Thing {
  constructor() {
    super()
    this.name = 'box'
    this.sprite = 5
    this.solid = true
    this.animation = null
    //this.collect = false
    this.squash = false
    this.hpush = true
    this.vpush = true
    this.moveSpeed = 1
  }

  action(i, j){

    if(mapgrid[i][j].moveDir != null || mapgrid[i][j].moved != null){
      mapgrid[i][j].state.startleFrog = true
    } else {
      mapgrid[i][j].state.startleFrog = false
    }

    if(mapgrid[i][j].moved == SOUTH && look(SOUTH, i, j).properties.breakBox){
      createItem(i, j, 8, false)
    }

    if(look(SOUTH, i, j).empty && !look(SOUTH, i, j).isDave){
      move(SOUTH, i, j)
    }
  }
}

class Bush extends Thing {
  constructor() {
    super()
    this.name = 'bush'
    this.sprite = 6
    this.solid = true
    this.animation = null
    //this.collect = false
    this.squash = false
    this.hpush = false
  }

  action(i, j){
    if (spacePressed == true){
      contents = look(NORTH, i, j)
      //console.log(contents)
      if(contents.isDave){
        //mapgrid[i][j].item = 0
        createItem(i, j, 0, false)
      }
      contents = look(SOUTH, i, j)
      if(contents.isDave){
        //mapgrid[i][j].item = 0
        createItem(i, j, 0, false)
      }
      contents = look(WEST, i, j)
      if(contents.isDave){
        //mapgrid[i][j].item = 0
        createItem(i, j, 0, false)
      }
      contents = look(EAST, i, j)
      if(contents.isDave){
        //mapgrid[i][j].item = 0
        createItem(i, j, 0, false)
      }
    }
  }
}

class Transporter extends Thing {
  constructor() {
    super()
    this.name = 'transporter'
    this.sprite = 7
    this.animation = [[7,3],[8,3],[9,3]]
    //this.collect = true
    this.squash = true
    this.hpush = false
    this.needsTarget = true
    this.target = [0,0] // Dummy target which should be overwritten
    this.regenerate = true
  }


  hit(hitX, hitY, hitby){
    //console.log(hitItem)
    let tempTarget = hitItem.target
    //console.log(hitby)
    if(hitby.name == 'player'){
      console.log("transporting!")
      //let dest = getProperty(contents, 'target')

      //console.log(tempTarget)
      playerX = tempTarget[0]
      playerY = tempTarget[1]
      playerMoveDir = null
      playerMoveCount = 0

      transportX = hitX - mapOffsetX
      transportY = hitY - mapOffsetY

      resetScreen()
      gameOption = 'transporting'


    } else{
      // creates a new item at the transport location, not a copy of the same item
      createItem(tempTarget[0], tempTarget[1], mapgrid[hitX][hitY].item, true)

      mapgrid[tempTarget[0]][tempTarget[1]].state = Object.assign({}, mapgrid[hitX][hitY].state)
      mapgrid[tempTarget[0]][tempTarget[1]].moveDir = mapgrid[hitX][hitY].moveDir
      mapgrid[tempTarget[0]][tempTarget[1]].moved = mapgrid[hitX][hitY].moved
      mapgrid[tempTarget[0]][tempTarget[1]].forward = mapgrid[hitX][hitY].forward
      mapgrid[tempTarget[0]][tempTarget[1]].right = mapgrid[hitX][hitY].right
      mapgrid[tempTarget[0]][tempTarget[1]].backward = mapgrid[hitX][hitY].backward
      mapgrid[tempTarget[0]][tempTarget[1]].left = mapgrid[hitX][hitY].left
      mapgrid[tempTarget[0]][tempTarget[1]].solid = mapgrid[hitX][hitY].solid
    }


    if(this.regenerate == true){
      createItem(hitX, hitY, 7, false)  // Regenerating transporters
      mapgrid[hitX][hitY].target = tempTarget
    } else {
      createItem(hitX, hitY, 0, false)
    }

  }

}

class CalmFrog extends Thing {
  constructor() {
    super()
    this.name = 'calmfrog'
    this.sprite = 10
    //this.collect = true
    this.squash = true
    this.hpush = false
    this.moveSpeed = 1
  }

  hit(hitX, hitY, hitby){
    if(hitby.name == 'player'){
      createItem(hitX, hitY, 0, false)
      gameScore++
      //console.log(gameScore)

    }
  }

  action(i, j){
    if(look(NORTH, i, j).state.startleFrog || look(EAST, i, j).state.startleFrog
    || look(SOUTH, i, j).state.startleFrog || look(WEST, i, j).state.startleFrog
    || look(NORTH, i, j).isDave || look(EAST, i, j).isDave
    || look(SOUTH, i, j).isDave || look(WEST, i, j).isDave){
      createItem(i, j, 9, false)
    }
  }

  checkSquash(sX, sY, squasher){
    if(['box', 'chopper', 'key'].includes(squasher.properties.name)){
      return false
    }
    return true
  }

}

class StartledFrog extends Thing {
  constructor() {
    super()
    this.name = 'startledfrog'
    this.sprite = 11
    this.animation = [[10,4],[11,4]]
    //this.collect = true
    this.squash = true
    this.hpush = false
    this.moveSpeed = 1
    this.triggerButton = true
    this.state = {startleFrog: true}
  }

  hit(hitX, hitY, hitby){
    if(hitby.name == 'player'){
      createItem(hitX, hitY, 0, false)
      gameScore++
      //console.log(gameScore)

      // gameOption = 4
      // gameMessage = 'Test'
    }
  }

  action(i, j){

    //console.log(mapgrid[i][j].forward)
    if (look(mapgrid[i][j].left, i, j).empty == true && !look(mapgrid[i][j].left, i, j).isDave){
      move(mapgrid[i][j].left, i, j)
    } else if (look(mapgrid[i][j].forward, i, j).empty == true && !look(mapgrid[i][j].forward, i, j).isDave){
      move(mapgrid[i][j].forward, i, j)
    } else if (look(mapgrid[i][j].right, i, j).empty == true && !look(mapgrid[i][j].right, i, j).isDave){
      move(mapgrid[i][j].right, i, j)
    } else if (look(mapgrid[i][j].backward, i, j).empty == true && !look(mapgrid[i][j].backward, i, j).isDave){
      move(mapgrid[i][j].backward, i, j)
    }

    //console.log(mapgrid[i][j].forward)
    if(mapgrid[i][j].forward == NORTH){
      mapgrid[i][j].animation = [[12,4],[13,4]]
    } else if(mapgrid[i][j].forward == SOUTH){
      mapgrid[i][j].animation = [[10,4],[11,4]]
    } else if(mapgrid[i][j].forward == WEST){
      mapgrid[i][j].animation = [[14,4],[15,4]]
    } else if(mapgrid[i][j].forward == EAST){
      mapgrid[i][j].animation = [[16,4],[17,4]]
    }

  }

  checkSquash(sX, sY, squasher){
    if(['box', 'chopper', 'key'].includes(squasher.properties.name)){
      return false
    }
    return true
  }
}

class Lock extends Thing{
  constructor() {
    super()
    //this.item = 1
    this.name = 'lock'
    this.sprite = 18
    this.solid = true
    //this.collect = false
    this.squash = false
  }

  hit(hitX, hitY, hitby){
    createItem(hitX, hitY, 0, false)
  }

  checkSquash(sX, sY, squasher){
    // should check if .squash has been changed for objects moving into the same space
    if(squasher.properties.name == "key"){
      return true
    } else {
      return false
    }
  }
}

class Chopper extends Thing {
  constructor() {
    super()
    this.name = 'chopper'
    this.sprite = 19
    this.solid = true
    this.animation = null
    //this.collect = false
    this.squash = false
    this.hpush = true
    this.vpush = true
    this.moveSpeed = 1
  }

  hit(hitX, hitY, hitby){
    if(hitby.name == 'player'){
      levelFinished()
    }
  }

  action(i, j){
    if(gameScore >= minScore){
      mapgrid[i][j].solid = false
    }
  }
}

class Grass extends Thing {
  constructor() {
    super()
    this.name = 'grass'
    this.sprite = 20
    this.solid = false
    this.animation = null
    //this.collect = true
    this.squash = false
  }

  hit(hitX, hitY, hitby){
    if(hitby.name == 'player'){
      createItem(hitX, hitY, 0, false)
    }
  }
}

class RedFrog extends Thing {
  constructor() {
    super()
    this.name = 'redfrog'
    this.sprite = 21
    this.solid = false
    this.animation = null
    this.squash = true
  }

  action(i, j){
    if(look(NORTH, i, j).state.startleFrog || look(EAST, i, j).state.startleFrog
    || look(SOUTH, i, j).state.startleFrog || look(WEST, i, j).state.startleFrog
    || look(NORTH, i, j).isDave || look(EAST, i, j).isDave
    || look(SOUTH, i, j).isDave || look(WEST, i, j).isDave){
      createItem(i, j, 14, false)
    }
  }

  checkSquash(sX, sY, squasher){
    if(['box', 'chopper', 'key'].includes(squasher.properties.name)){
      return false
    }
    return true
  }

}

class AngryRedFrog extends Thing {
  constructor() {
    super()
    this.name = 'angryredfrog'
    this.sprite = 22
    this.solid = false
    this.animation = [[21,4],[22,4]]
    this.squash = true
    this.triggerButton = true
    this.moveSpeed = 1
    this.state = {startleFrog: false}

  }

  hit(hitX, hitY, hitby){
    if(hitby.name == 'player'){
      //createItem(hitX, hitY, 0, false)
      killPlayer()
    }
  }

  action(i, j){
    // Eat apples
    let direction = mapgrid[i][j].forward
    contents = look(direction, i, j)
    if(contents.properties.name == 'apple' && contents.beingMovedInto == null && contents.moveDir == null){
      contents.properties.eat(i + direction[0], j + direction[1])
      return
    }
    direction = mapgrid[i][j].left
    contents = look(direction, i, j)
    if(contents.properties.name == 'apple' && contents.beingMovedInto == null && contents.moveDir == null){
      contents.properties.eat(i + direction[0], j + direction[1])
      return
    }
    direction = mapgrid[i][j].backward
    contents = look(direction, i, j)
    if(contents.properties.name == 'apple' && contents.beingMovedInto == null && contents.moveDir == null){
      contents.properties.eat(i + direction[0], j + direction[1])
      return
    }
    direction = mapgrid[i][j].right
    contents = look(direction, i, j)
    if(contents.properties.name == 'apple' && contents.beingMovedInto == null && contents.moveDir == null){
      contents.properties.eat(i + direction[0], j + direction[1])
      return
    }

    if(daveIsTo(NORTH, i, j) && look(NORTH, i, j).properties.solidToRedFrog == false){
      move(NORTH, i, j)
    }
    if(daveIsTo(SOUTH, i, j) && look(SOUTH, i, j).properties.solidToRedFrog == false){
      move(SOUTH, i, j)
    }
    if(daveIsTo(EAST, i, j) && look(EAST, i, j).properties.solidToRedFrog == false){
      move(EAST, i, j)
    }
    if(daveIsTo(WEST, i, j) && look(WEST, i, j).properties.solidToRedFrog == false){
      move(WEST, i, j)
    }

    if(mapgrid[i][j].forward == NORTH){
      mapgrid[i][j].animation = [[23,4],[24,4]]
    } else if(mapgrid[i][j].forward == SOUTH){
      mapgrid[i][j].animation = [[21,4],[22,4]]
    } else if(mapgrid[i][j].forward == WEST){
      mapgrid[i][j].animation = [[25,4],[26,4]]
    } else if(mapgrid[i][j].forward == EAST){
      mapgrid[i][j].animation = [[27,4],[28,4]]
    }
  }

  checkSquash(sX, sY, squasher){
    if(['box', 'chopper', 'key'].includes(squasher.properties.name)){
      return false
    }
    return true
  }

}

class ButtonOn extends Thing {
  constructor() {
    super()
    this.name = 'buttonon'
    this.sprite = 29
    this.solid = true
    this.animation = null
    //this.collect = false
    this.squash = false
    this.needsTarget = true
    this.breakBox = true
    this.state = {startleFrog: false, initialise: true}
  }

  action(i, j){

    if(mapgrid[i][j].state.initialise){
      if(look(HERE, mapgrid[i][j].target[0], mapgrid[i][j].target[1]).properties.name == 'gate'){
        mapgrid[i][j].sprite = 29
      } else {
        mapgrid[i][j].sprite = 30
      }
      mapgrid[i][j].state.initialise = false
    }

    if (look(NORTH, i, j).properties.triggerButton || look(EAST, i, j).properties.triggerButton
    || look(SOUTH, i, j).properties.triggerButton || look(WEST, i, j).properties.triggerButton
    || look(NORTH, i, j).isDave || look(EAST, i, j).isDave
    || look(SOUTH, i, j).isDave || look(WEST, i, j).isDave){
      if ((look(HERE, mapgrid[i][j].target[0], mapgrid[i][j].target[1]).empty
          && !look(HERE, mapgrid[i][j].target[0], mapgrid[i][j].target[1]).isDave)
          || look(HERE, mapgrid[i][j].target[0], mapgrid[i][j].target[1]).properties.name == 'laser'){
        createItem(mapgrid[i][j].target[0], mapgrid[i][j].target[1], 17, false)
        mapgrid[i][j].sprite = 29
      }
    } else {
      if (look(HERE, mapgrid[i][j].target[0], mapgrid[i][j].target[1]).properties.name == 'gate'){
        createItem(mapgrid[i][j].target[0], mapgrid[i][j].target[1], 0, false)
        mapgrid[i][j].sprite = 30
      }
    }
  }
}

class ButtonOff extends Thing {
  constructor() {
    super()
    this.name = 'buttonoff'
    this.sprite = 30
    this.solid = true
    this.animation = null
    //this.collect = false
    this.squash = false
    this.needsTarget = true
    this.breakBox = true
  }

  action(i, j){

    if (look(NORTH, i, j).properties.triggerButton || look(EAST, i, j).properties.triggerButton
    || look(SOUTH, i, j).properties.triggerButton || look(WEST, i, j).properties.triggerButton
    || look(NORTH, i, j).isDave || look(EAST, i, j).isDave
    || look(SOUTH, i, j).isDave || look(WEST, i, j).isDave){
      if (look(HERE, mapgrid[i][j].target[0], mapgrid[i][j].target[1]).properties.name == 'gate'){
        createItem(mapgrid[i][j].target[0], mapgrid[i][j].target[1], 0, false)
        mapgrid[i][j].sprite = 29
      }
    } else {
      if ((look(HERE, mapgrid[i][j].target[0], mapgrid[i][j].target[1]).empty
          && !look(HERE, mapgrid[i][j].target[0], mapgrid[i][j].target[1]).isDave)
          || look(HERE, mapgrid[i][j].target[0], mapgrid[i][j].target[1]).properties.name == 'laser'){
        createItem(mapgrid[i][j].target[0], mapgrid[i][j].target[1], 17, false)
        mapgrid[i][j].sprite = 30
      }
    }
  }
}

class Gate extends Thing {
  constructor() {
    super()
    this.name = 'gate'
    this.sprite = 31
    this.solid = true
    this.animation = null
    //this.collect = false
    this.squash = false
    this.breakBox = true
  }
}

class TurretN extends Thing {
  constructor() {
    super()
    this.name = 'turretn'
    this.sprite = 32
    this.solid = true
    this.animation = null
    //this.collect = false
    this.squash = false
    this.forward = NORTH
  }

  action(i, j){
    if(!['wall', 'smiley', 'gate', 'laser', 'lock', 'turretn', 'turrets', 'turrete', 'turretw']
    .includes(look(NORTH, i, j).properties.name)){
      createItem(i, j - 1, 22, true)
      mapgrid[i][j - 1].forward = NORTH
      mapgrid[i][j - 1].backward = SOUTH
      // look(NORTH, i, j).forward = NORTH
      // look(NORTH, i, j).backward = SOUTH
    }
  }

}

class TurretE extends Thing {
  constructor() {
    super()
    this.name = 'turrete'
    this.sprite = 33
    this.solid = true
    this.animation = null
    //this.collect = false
    this.squash = false
    this.forward = EAST
  }

action(i, j){
  if(!['wall', 'smiley', 'gate', 'laser', 'lock', 'turretn', 'turrets', 'turrete', 'turretw']
  .includes(look(EAST, i, j).properties.name)){
    createItem(i + 1, j, 22, true)
    mapgrid[i + 1][j].forward = EAST
    mapgrid[i + 1][j].backward = WEST
    // look(EAST, i, j).forward = EAST
    // look(EAST, i, j).backward = WEST
  }
}

}

class TurretS extends Thing {
  constructor() {
    super()
    this.name = 'turrets'
    this.sprite = 34
    this.solid = true
    this.animation = null
    //this.collect = false
    this.squash = false
    this.forward = SOUTH
  }

  action(i, j){
    if(!['wall', 'smiley', 'gate', 'laser', 'lock', 'turretn', 'turrets', 'turrete', 'turretw']
    .includes(look(SOUTH, i, j).properties.name)){
      createItem(i, j + 1, 22, true)
      mapgrid[i][j + 1].forward = SOUTH
      mapgrid[i][j + 1].backward = NORTH
      // look(SOUTH, i, j).forward = SOUTH
      // look(SOUTH, i, j).backward = NORTH
    }
  }

}

class TurretW extends Thing {
  constructor() {
    super()
    this.name = 'turretw'
    this.sprite = 35
    this.solid = true
    this.animation = null
    //this.collect = false
    this.squash = false
    this.forward = WEST
  }

  action(i, j){
    if(!['wall', 'smiley', 'gate', 'laser', 'lock', 'turretn', 'turrets', 'turrete', 'turretw']
    .includes(look(WEST, i, j).properties.name)){
      createItem(i - 1, j, 22, true)
      mapgrid[i - 1][j].forward = WEST
      mapgrid[i - 1][j].backward = EAST
      mapgrid[i - 1][j].sprite = 37  // if this is not here the wrong sprite appears on the first laser
      // look(WEST, i, j).forward = WEST
      // look(WEST, i, j).backward = EAST
    }
  }

}

class Laser extends Thing {
  constructor() {
    super()
    this.name = 'laser'
    this.sprite = 36
    this.solid = false
    this.animation = null
    //this.collect = false
    this.squash = true
    this.state = {startleFrog: false, newLaser: true}
  }

  hit(hitX, hitY, hitby){
    if(hitby.name == 'player'){
      //createItem(hitX, hitY, 0, false)
      killPlayer()
    }
  }


  action(i, j){
    let direction = mapgrid[i][j].forward
    let back = mapgrid[i][j].backward
    let backItem = look(back, i, j)

// This code makes sure lasers pointing south and east don't go to the end of the screen all at once
    if(mapgrid[i][j].state.newLaser){
      if(mapgrid[i][j].forward == NORTH || mapgrid[i][j].forward == WEST){
        mapgrid[i][j].state.newLaser = false
      }
    }

    //if(mapgrid[i][j].item > 0){
    if(direction == WEST || direction == EAST){
      mapgrid[i][j].sprite = 37
    } else {
      mapgrid[i][j].sprite = 36
    }
    //}

    if(!mapgrid[i][j].state.newLaser){
      if (['laser', 'turretn', 'turrets', 'turrete', 'turretw'].includes(backItem.properties.name)
         && backItem.forward == direction){
        if(!['wall', 'smiley', 'gate', 'laser', 'lock', 'turretn', 'turrets', 'turrete', 'turretw']
        .includes(look(direction, i, j).properties.name)){

          createItem(i + direction[0], j + direction[1], 22, true)
          //debugger
          mapgrid[i + direction[0]][j + direction[1]].forward = direction
          mapgrid[i + direction[0]][j + direction[1]].backward = back
          mapgrid[i + direction[0]][j + direction[1]].sprite = mapgrid[i][j].sprite
          // look(direction, i, j).forward = direction
          // look(direction, i, j).backward = back
        }
      } else {
        createItem(i, j, 0, true)
      }
    } else {
      mapgrid[i][j].state.newLaser = false
    }



  }

}

class Wall2 extends Thing{
  constructor() {
    super()
    //this.item = 1
    this.name = 'wall'
    this.sprite = 38
    this.solid = true
    this.animation = null
    //this.collect = false
    this.squash = false
    this.hpush = false
    this.breakBox = true
  }
}

class Wall3 extends Thing{
  constructor() {
    super()
    //this.item = 1
    this.name = 'wall'
    this.sprite = 39
    this.solid = true
    this.animation = null
    //this.collect = false
    this.squash = false
    this.hpush = false
    this.breakBox = true
  }
}

class Rock extends Thing{
  constructor() {
    super()
    //this.item = 1
    this.name = 'wall'
    this.sprite = 40
    this.solid = true
    this.animation = null
    //this.collect = false
    this.squash = false
    this.hpush = false
    this.breakBox = true
  }
}

let itemProperties = [
  new Space(), // 0
  new Wall(),
  new Smiley(),
  new Apple(),
  new Key(),
  new Box(),  // 5
  new Bush(),
  new Transporter(),
  new CalmFrog(),
  new StartledFrog(),
  new Lock(),  // 10
  new Chopper(),
  new Grass(),
  new RedFrog(),
  new AngryRedFrog(),
  new ButtonOn(), // 15
  new ButtonOff(),
  new Gate(),
  new TurretN(),
  new TurretE(),
  new TurretS(), //20
  new TurretW(),
  new Laser(),
  new Wall2(),
  new Wall3(),
  new Rock()] //25

let itemsLength = itemProperties.length -1

function loadGameSprites(){
  gameSprites = [loadImage('images/dave_run1.png'), // dave here for debugging purposes
                loadImage('images/wall2.png'),
                loadImage('images/smiley.png'),
                loadImage('images/apple.png'),
                loadImage('images/key.png'),
                loadImage('images/box.png'), // 5
                loadImage('images/bush.png'),
                loadImage('images/transporter.png'),
                loadImage('images/transporter2.png'),
                loadImage('images/transporter3.png'),
                loadImage('images/frog.png'), // 10
                loadImage('images/frog_down.png'),
                loadImage('images/frog_back1.png'),
                loadImage('images/frog_back2.png'),
                loadImage('images/frog_side1.png'),
                loadImage('images/frog_side2.png'), // 15
                loadImage('images/frog_side3.png'),
                loadImage('images/frog_side4.png'),
                loadImage('images/lock.png'),
                loadImage('images/chopper.png'),
                loadImage('images/grass.png'), // 20
                loadImage('images/red_frog.png'),
                loadImage('images/red_frog_down.png'),
                loadImage('images/red_frog_back1.png'),
                loadImage('images/red_frog_back2.png'),
                loadImage('images/red_frog_side1.png'), // 25
                loadImage('images/red_frog_side2.png'),
                loadImage('images/red_frog_side3.png'),
                loadImage('images/red_frog_side4.png'),
                loadImage('images/button_on.png'),
                loadImage('images/button_off.png'), // 30
                loadImage("images/gate.png"),
                loadImage("images/turret_n.png"),
                loadImage("images/turret_e.png"),
                loadImage("images/turret_s.png"),
                loadImage("images/turret_w.png"), // 35
                loadImage("images/laser_vert.png"),
                loadImage("images/laser_horiz.png"),
                loadImage("images/wall3.png"),
                loadImage("images/wall4.png"),
                loadImage("images/rock.png")] // 40
}

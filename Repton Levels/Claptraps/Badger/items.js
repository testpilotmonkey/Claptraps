// These are defined here so that constructors can use them, otherwise we have to
// use JSON.stringify everywhere
let NORTH = [0, -1], SOUTH = [0,1], WEST = [-1,0], EAST = [1,0]
let NW = [-1, -1], NE = [1,-1], SW = [-1,1], SE = [1,1]
let HERE = [0, 0]
let scanX = 'right'
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
    this.state = {} // State object that gets copied when item on map moves. eg life of apple goes here
    this.actor = false
    this.solidToSpirit = true
    this.solidToRedFrog = true
    this.solidToFungus = true
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
    this.solidToSpirit = false
    this.solidToFungus = false
    this.state = {fungusCount: 100} // to stop fungus spreading immediately
  }

  action(i, j){
    if (mapgrid[i][j].state.fungusCount > 0) mapgrid[i][j].state.fungusCount--
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
  }
}

class Rock extends Thing {
  constructor() {
    super()
    this.name = 'rock'
    this.sprite = 2
    this.solid = true
    this.animation = null
    //this.collect = false
    this.squash = false
    this.hpush = true
    this.curveR = true
    this.curveL = true
    this.moveSpeed = 4
  }

  action(i, j){


   //if (mapgrid[i][j].moved != true) { // Don't need .moved anymore as item actions and movement happen in separate loops
   contents = look(SOUTH, i, j)
   //console.log(contents)
   if(contents.squash
      &&['space'].includes(contents.properties.name)
      && !contents.isDave) {
//   if(contents.squash == true && !contents.isDave) {
     move(SOUTH, i, j)
     mapgrid[i][j+1].moving = true // set moving so can hit player
     //mapgrid[i][j+1].moved = true //set it to moved so it isn't going to trigger when we scan again on the next line
     return
   }

   if(contents.curveL) {
     //console.log("curveL")
     temp = look(WEST, i, j)
     //if(temp.squash == true && !temp.isDave){
     if(temp.squash
        &&['space'].includes(temp.properties.name)
        && !temp.isDave) {
       temp = look(SW, i, j)
       //if(temp.squash == true && !temp.isDave){
       if(temp.squash
          &&['space'].includes(temp.properties.name)
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

   if(contents.curveR) {
     temp = look(EAST, i, j)
     //if(temp.squash == true && !temp.isDave){
     if(temp.squash
        &&['space'].includes(temp.properties.name)
        && !temp.isDave) {
       temp = look(SE, i, j)
       //if(temp.squash == true && !temp.isDave){
       if(temp.squash
          &&['space'].includes(temp.properties.name)
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
     // 'contents.state.fungusCount < 99' to stop Repton shuffles killing, but you can run
     // into falling streams of boulders
     if(contents.isDave && contents.state.fungusCount < 99){
       killPlayer()
     }
     // If this is an apple which has moved, set its movement to false, so it doesn't keep killing you
     mapgrid[i][j].moving = false

   }
 }

}

class Diamond extends Thing {
  constructor() {
    super()
    this.name = 'diamond'
    this.sprite = 3
    this.solid = false
    this.animation = null
    this.curveL = true
    this.curveR = true
    //this.collect = true
    this.squash = false
  }

  hit(hitX, hitY, hitby){
    if(hitby.name == 'player'){
      createItem(hitX, hitY, 0, false)
      mapgrid[hitX][hitY].state.fungusCount = 100
      gameScore++
    }
  }
}

class Dirt1 extends Thing {
  constructor() {
    super()
    this.name = 'dirt1'
    this.sprite = 4
    this.solid = false
    this.animation = null
    //this.collect = true
    this.squash = false
    this.solidToSpirit = false
    this.solidToRedFrog = false
    this.solidToFungus = false
    this.state = {fungusCount: 100} // to stop fungus spreading immediately
  }

  action(i, j){
    if (mapgrid[i][j].state.fungusCount > 0) mapgrid[i][j].state.fungusCount--
  }

  hit(hitX, hitY, hitby){
    if(hitby.name == 'player'){
      createItem(hitX, hitY, 0, false)
    }
  }
}

class Dirt2 extends Thing {
  constructor() {
    super()
    this.name = 'dirt2'
    this.sprite = 5
    this.solid = false
    this.animation = null
    //this.collect = true
    this.squash = false
    this.solidToSpirit = false
    this.solidToRedFrog = false
    this.solidToFungus = false
    this.state = {fungusCount: 100} // to stop fungus spreading immediately
  }

  action(i, j){
    if (mapgrid[i][j].state.fungusCount > 0) mapgrid[i][j].state.fungusCount--
  }

  hit(hitX, hitY, hitby){
    if(hitby.name == 'player'){
      createItem(hitX, hitY, 0, false)
    }
  }
}

class Capsule extends Thing {
  constructor() {
    super()
    this.name = 'capsule'
    this.sprite = 6
    this.solid = false
    this.animation = null
    //this.collect = true
    this.squash = false
    this.curveL = true
    this.curveR = true
  }

  hit(hitX, hitY, hitby){
    if(hitby.name == 'player'){
      createItem(hitX, hitY, 0, false)
    }
  }
}

class Skull extends Thing{
  constructor() {
    super()
    //this.item = 1
    this.name = 'skull'
    this.sprite = 7
    this.solid = false
    this.animation = null
    //this.collect = false
    this.squash = false
    this.hpush = false
    this.curveL = true
    this.curveR = true
  }

  hit(hitX, hitY, hitby){
    if(hitby.name == 'player'){
      killPlayer()
    }
  }

  action(i,j){
    if (invincible){
      mapgrid[i][j].solid = true
    } else {
      mapgrid[i][j].solid = false
    }
  }
}

class LeftWall extends Thing{
  constructor() {
    super()
    //this.item = 1
    this.name = 'leftwall'
    this.sprite = 14
    this.solid = true
    this.animation = null
    //this.collect = false
    this.squash = false
    this.hpush = false
    this.curveL = true
    this.curveR = false
  }
}

class RightWall extends Thing{
  constructor() {
    super()
    //this.item = 1
    this.name = 'rightwall'
    this.sprite = 15
    this.solid = true
    this.animation = null
    //this.collect = false
    this.squash = false
    this.hpush = false
    this.curveL = false
    this.curveR = true
  }
}

class Safe extends Thing{
  constructor() {
    super()
    //this.item = 1
    this.name = 'safe'
    this.sprite = 24
    this.solid = true
    this.animation = null
    //this.collect = false
    this.squash = false
    this.hpush = false
  }
}

class Cage extends Thing{
  constructor() {
    super()
    //this.item = 1
    this.name = 'cage'
    this.sprite = 25
    this.solid = true
    this.animation = null
    //this.collect = false
    this.squash = false
    this.hpush = false
    this.solidToSpirit = false
  }
}

class Egg extends Thing {
  constructor() {
    super()
    this.name = 'egg'
    this.sprite = 26
    this.solid = true
    this.animation = null
    this.hpush = true
    //this.collect = true
    this.squash = false
    this.curveL = true
    this.curveR = true
    this.moveSpeed = 4
    this.state = {moving: false, cracked: false, counter: 80}
  }

  action(i, j){


    if (mapgrid[i][j].state.moving == false) {
     //if (mapgrid[i][j].moved != true) { // Don't need .moved anymore as item actions and movement happen in separate loops
     contents = look(SOUTH, i, j)
     //console.log(contents)
     if(contents.squash
        &&['space'].includes(contents.properties.name)
        && !contents.isDave) {
  //   if(contents.squash == true && !contents.isDave) {
       mapgrid[i][j].state.moving = true
       move(SOUTH, i, j)
       //mapgrid[i][j+1].moving = true // set moving so can hit player
       //mapgrid[i][j+1].moved = true //set it to moved so it isn't going to trigger when we scan again on the next line
       return
     }

     if(contents.curveL) {
       //console.log("curveL")
       temp = look(WEST, i, j)
       //if(temp.squash == true && !temp.isDave){
       if(temp.squash
          &&['space'].includes(temp.properties.name)
          && !temp.isDave) {
         temp = look(SW, i, j)
         //if(temp.squash == true && !temp.isDave){
         if(temp.squash
            &&['space'].includes(temp.properties.name)
            && !temp.isDave) {
           //console.log("moveL")
           // createItem(i, j, 0, true)
           // createItem(i-1, j, 3, true)
           mapgrid[i][j].state.moving = true
           move(WEST, i, j)
           //mapgrid[i-1][j].moving = true
           return
         }
       }
     }

     if(contents.curveR) {
       temp = look(EAST, i, j)
       //if(temp.squash == true && !temp.isDave){
       if(temp.squash
          &&['space'].includes(temp.properties.name)
          && !temp.isDave) {
         temp = look(SE, i, j)
         //if(temp.squash == true && !temp.isDave){
         if(temp.squash
            &&['space'].includes(temp.properties.name)
            && !temp.isDave) {
           //console.log("moveR")
           // createItem(i, j, 0, true)
           // createItem(i+1, j, 3, true)
           mapgrid[i][j].state.moving = true
           move(EAST, i, j)
           //mapgrid[i+1][j].moving = true
           //mapgrid[i+1][j].moved = true
           return // Technically not needed, but better safe than sorry
         }
       }
     }
     //}

   // FIX: this doesn't work if the egg hits something to roll off
   } else {
     if (mapgrid[i][j].state.cracked == false){
       contents = look(SOUTH, i, j)
       if(contents.squash
            &&['space'].includes(contents.properties.name)
            && !contents.isDave) {
          //mapgrid[i][j].state.moving = true
          move(SOUTH, i, j)
          return
       }
       if(contents.isDave){
         killPlayer()
       }
       if(!contents.empty && contents.name !='egg'){
         console.log('SMASH!')
         mapgrid[i][j].state.cracked = true
         mapgrid[i][j].curveL = false
         mapgrid[i][j].curveR = false
         mapgrid[i][j].sprite = 35

       }
       // If this is an apple which has moved, set its movement to false, so it doesn't keep killing you
       //mapgrid[i][j].moving = false
     } else {
       mapgrid[i][j].state.counter--
       if (mapgrid[i][j].state.counter < 0){
         createActor(i, j, 34)
         createItem(i, j, 0, false)
       }
     }

   }

 }

}

class Key extends Thing {
  constructor() {
    super()
    this.name = 'key'
    this.sprite = 27
    this.solid = false
    this.animation = null
    //this.collect = true
    this.squash = false
    this.curveL = true
    this.curveR = true
  }

  hit(hitX, hitY, hitby){
    if(hitby.name == 'player'){
      createItem(hitX, hitY, 0, false)
      changeItem(24, 3)
    }
  }
}

class Fungus extends Thing{
  constructor() {
    super()
    //this.item = 1
    this.name = 'fungus'
    this.sprite = 28
    this.solid = false
    this.animation = null
    //this.collect = false
    this.squash = false
    this.hpush = false
  }

  hit(hitX, hitY, hitby){
    if(hitby.name == 'player'){
      killPlayer()
    }
  }

  action(i, j){


    let direction = random([NORTH, EAST, SOUTH, WEST])
    contents = look(direction, i, j)

    let chance = random()
    if (contents.properties.solidToFungus == false && contents.state.fungusCount == 0 && chance < 0.004){
      createItem(i + direction[0], j + direction[1], 28, false)
    }
  }

}

class Bomb extends Thing {
  constructor() {
    super()
    this.name = 'bomb'
    this.sprite = 29
    this.solid = true
    this.animation = null
    //this.collect = true
    this.squash = false
    this.curveL = true
    this.curveR = true
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

class Transporter extends Thing {
  constructor() {
    super()
    this.name = 'transporter'
    this.sprite = 30
    //this.collect = true
    this.squash = true
    this.hpush = false
    this.needsTarget = true
    this.target = [0,0] // Dummy target which should be overwritten
    this.regenerate = false
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
      // Change playerStartX & Y on transport
      playerStartX = playerX
      playerStartY = playerY

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

class Crown extends Thing {
  constructor() {
    super()
    this.name = 'crown'
    this.sprite = 31
    this.solid = false
    this.animation = null
    //this.collect = true
    this.squash = false
    this.curveL = true
    this.curveR = true
  }

  hit(hitX, hitY, hitby){
    if(hitby.name == 'player'){
      createItem(hitX, hitY, 0, false)
      gameScore++
    }
  }
}

class Spirit extends Thing {
  constructor() {
    super()
    this.name = 'spirit'
    this.sprite = 33
    this.solid = false
    this.animation = null
    //this.collect = true
    this.squash = false
    this.actor = true
    this.state = {initialise: true}
  }

  hit(hitX, hitY, hitby){
    if(hitby.name == 'player'){
      createItem(hitX, hitY, 0, false)
    }
  }

  action(actor){
    // tbc
    // actor.test = actor.x

    if (actor.state.initialise == true){
      //console.log('initialise')
      if (look(WEST, actor.x, actor.y).properties.solidToSpirit){
        this.setForward(NORTH, actor)

      } else if (look(NORTH, actor.x, actor.y).properties.solidToSpirit){
        this.setForward(EAST, actor)
      } else if (look(EAST, actor.x, actor.y).properties.solidToSpirit){
        this.setForward(SOUTH, actor)
      } else {
        this.setForward(WEST, actor)
      }
      actor.test = actor.forward
      actor.state.initialise = false
      //return
    }

    // These are here because I copied the code from somewhere else :)
    let i = actor.x
    let j = actor.y

    if (actor.moveDir == null){
      if (look(actor.left, i, j).properties.solidToSpirit == false){
        // actor.x += actor.left[0]
        // actor.y += actor.left[1]
        actor.moveDir = actor.left
        this.setForward(actor.left, actor)
      } else if (look(actor.forward, i, j).properties.solidToSpirit == false){
        // actor.x += actor.forward[0]
        // actor.y += actor.forward[1]
        actor.moveDir = actor.forward
        this.setForward(actor.forward, actor)
      } else if (look(actor.right, i, j).properties.solidToSpirit == false){
        // actor.x += actor.right[0]
        // actor.y += actor.right[1]
        actor.moveDir = actor.right
        this.setForward(actor.right, actor)
      } else if (look(actor.backward, i, j).properties.solidToSpirit == false){
        // actor.x += actor.backward[0]
        // actor.y += actor.backward[1]
        actor.moveDir = actor.backward
        this.setForward(actor.backward, actor)
      }
    }

    actor.moveCounter++
    if (actor.moveDir != null && actor.moveCounter > 3){
      actor.x += actor.moveDir[0]
      actor.y += actor.moveDir[1]
      actor.moveDir = null
      actor.moveCounter = 0
    }


    if(mapgrid[actor.x][actor.y].properties.name == 'cage'){
      createItem(actor.x, actor.y, 3, false)
      // Delete actor
      actor.skip = true
    }

    if(look(HERE, actor.x, actor.y).isDave){
      killPlayer()
    }

  }

  setForward(direction, actor){
    if (direction == NORTH){
      actor.forward = NORTH
      actor.right = EAST
      actor.backward = SOUTH
      actor.left = WEST
      //console.log('up')
    } else if (direction == EAST){
      actor.forward = EAST
      actor.right = SOUTH
      actor.backward = WEST
      actor.left = NORTH
      //console.log('right')
    } else if (direction == SOUTH){
      actor.forward = SOUTH
      actor.right = WEST
      actor.backward = NORTH
      actor.left = EAST
      //console.log('down')
    } else if (direction == WEST){
      actor.forward = WEST
      actor.right = NORTH
      actor.backward = EAST
      actor.left = SOUTH
      //console.log('left')
    }
  }
}

class AngryRedFrog extends Thing {
  constructor() {
    super()
    this.name = 'angryredfrog'
    this.sprite = 34
    this.solid = false
    this.animation = null
    //this.collect = true
    this.squash = false
    this.actor = true
    this.state = {dazed: 40}
  }

  action(actor){
    // tbc
    if(look(HERE, actor.x, actor.y).isDave){
      killPlayer()
    }



    // If there's a rock or egg on the frog's space, delete the frog
    let contents = look(HERE, actor.x, actor.y)
    if(['rock', 'egg', 'fungus'].includes(contents.properties.name)){
      actor.skip = true
      console.log('frog squashed')
      gameScore++
      return
    }

    // Frog is dazed a bit when they break out of egg
    if (actor.state.dazed > 0){
      actor.state.dazed --
      return
    }

    if (actor.moveDir != null){
      let contents = look(HERE, actor.x + actor.moveDir[0], actor.y + actor.moveDir[1])
      if(['rock', 'egg', 'fungus'].includes(contents.properties.name)){
        actor.skip = true
        console.log('frog squashed!')
        gameScore++
        return
      }
    }

    let i = actor.x
    let j = actor.y

    if (actor.moveDir == null){
      if(daveIsTo(NORTH, i, j) && look(NORTH, i, j).properties.solidToRedFrog == false){
        actor.moveDir = NORTH
      } else if(daveIsTo(SOUTH, i, j) && look(SOUTH, i, j).properties.solidToRedFrog == false){
        actor.moveDir = SOUTH
      } else if(daveIsTo(EAST, i, j) && look(EAST, i, j).properties.solidToRedFrog == false){
        actor.moveDir = EAST
      } else if(daveIsTo(WEST, i, j) && look(WEST, i, j).properties.solidToRedFrog == false){
        actor.moveDir = WEST
      }
    }

      if (actor.moveDir != null) {
        actor.moveCounter++

        if (actor.moveCounter > 3){
          actor.x += actor.moveDir[0]
          actor.y += actor.moveDir[1]
          actor.moveDir = null
          actor.moveCounter = 0
        }
      }



  }
}

let itemProperties = [
  new Space(), // 0
  new Wall(),
  new Rock(),
  new Diamond(),
  new Dirt1(),
  new Dirt2(), // 5
  new Capsule(),
  new Skull(),
  new Space(),
  new Wall(),
  new Wall(), // 10
  new Wall(),
  new Wall(),
  new Wall(),
  new LeftWall(),
  new RightWall(), // 15
  new Wall(),
  new Wall(),
  new Wall(),
  new LeftWall(),
  new RightWall(), // 20
  new Wall(),
  new Wall(),
  new Wall(),
  new Safe(),
  new Cage(), // 25
  new Egg(),
  new Key(),
  new Fungus(),
  new Bomb(),
  new Transporter(), // 30
  new Crown(),
  new Space(),
  new Spirit(),
  new AngryRedFrog()]

let itemsLength = itemProperties.length -1

function loadGameSprites(){
  gameSprites = [loadImage('images/dave_run1.png'), // dave here for debugging purposes
                loadImage('images/wall2.png'),
                loadImage('images/rock40.png'),
                loadImage('images/diamond40.png'),
                loadImage('images/dirt140.png'),
                loadImage('images/dirt240.png'),
                loadImage('images/capsule40.png'),
                loadImage('images/skull40.png'),
                loadImage('images/blank.png'),
                loadImage('images/wall40.png'),
                loadImage('images/wall40.png'),
                loadImage('images/wall40.png'),
                loadImage('images/wall40.png'),
                loadImage('images/wall40.png'),
                loadImage('images/lwall40.png'),
                loadImage('images/rwall40.png'),
                loadImage('images/wall40.png'),
                loadImage('images/wall40.png'),
                loadImage('images/wall40.png'),
                loadImage('images/lwall40.png'),
                loadImage('images/rwall40.png'),
                loadImage('images/wall40.png'),
                loadImage('images/wall40.png'),
                loadImage('images/wall40.png'),
                loadImage('images/safe40.png'),
                loadImage('images/cage40.png'),
                loadImage('images/egg40.png'),
                loadImage('images/key40.png'),
                loadImage('images/fungus40.png'),
                loadImage('images/bomb40.png'),
                loadImage('images/transporter40.png'),
                loadImage('images/crown40.png'),
                loadImage('images/player.png'),
                loadImage('images/spirit40.png'),
                loadImage('images/red_frog.png'),
                loadImage('images/broken_egg40.png')]
}

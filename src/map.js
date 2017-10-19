import Enemy from "./actors/enemy.js"; //TODO: Start stubbing this out

//CURRENT OVERHAUL GOING ON:
//Change from massive [Map Keys][Explored][FreeCells] map format to
//Way better object based format (properties are then actually accessibly in a sane matter)


const MP_Max_Size = 1440;

export default class Map{
    constructor(gameRef){
        this.maps = [];
        this.currMap = [];
        this.monstersAlive = [];
        this.corpses = [];
        this.floor = 0;
        this.clogHeight = 6;
        this.genMap = [];

        //local to currMap values
        this.explored = false;
        this.stairsUp = null;
        this.stairsDown = null;
        this.allCells = []; //local copy of freeCells, so that it can be reapplied to Maps[]

        //refs to other objects
        this.Game = gameRef;

    }



    //====MAP GENERATION====
    //These methods deal with the generation of the map


    //Generate Map
    //Call this map once per dungeon, if the dungeon does not have any data associated with it
    //This method generates an array of maps up to "depth", which are then used for the playing space.
    _generateMap(depth){

        for(var i=0; i<depth; i++){
            //needs a reference to display
            	var digger = new ROT.Map.Digger(this.Game.display._options.width, this.Game.display._options.height - this.clogHeight);
	            var freeCells = [];
                this.genMap = [];
            var digCallback = function(x, y, value){
                var key = x+ "," + y;
                if(value) {
                    this.genMap[key] = "#";
                }
                else
                {
                    this.genMap[key] = ".";
                    freeCells.push(key);
                }
            }
            digger.create(digCallback.bind(this));
            this._generateObstructions(freeCells);
            //generates map and bakes in obstructions

            console.log("genMap");
            console.log(this.genMap);

            //create a small value for whether or not the map was explored.
            var explored = false;

            //add this to the Map object's Maps array, to be accessed later.
            this.maps.push(new MapFloor(this.genMap, freeCells, explored)); 
        }

        //set current floor to one, then load the floor
        this.floor = 1;



    }

    //Generate Obstructions
    //This method is used within Generate Map to generate features within a dungeon
    //These features are stairs, fountains, monuments, chests, etc.
    _generateObstructions(freeCells){
        //TODO: Extend functionality to generate additional useful keys
        //TODO: Extend functionality to prevent keys from generating next to each other

        //stairs down
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        this.genMap[key] = "V"; //"⚞";

        //stairs up
        index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        this.genMap[key] = "^";//"⚟";

    }


    //====MAP USAGE====
    //These methods are used to deal with general usage of maps: ascending, descending, loading, etc.

    _loadMap(floor){
        console.log("loading map...");
        console.log("map floor" + floor);
        this.currMap = this.maps[floor].playField;
        this.explored = this.maps[floor].explored;
        var freeCells = this.maps[floor].freeCells;
        console.log(this.currMap);

        // this.currMap = this.maps[floor].splice(0,MP_Max_Size);  //the size of the map is 1440, because 18*80 map dimensions
        // //load explored boolean to determine monster generation
        // this.explored = this.maps[floor].splice(0,1)[0];
        // //load the coordinates for the ascending set of stairs
        // this.stairsUp = this.maps[floor].splice(0,1)[0];
        // //load the coodrinates for the descending set of stairs
        // this.stairsDown = this.maps[floor].splice(0,1)[0];
        // //get free cells for generating actors
        // var freeCells = this.maps[floor];  //since the other values have been spliced out of the array, the remaining array will be freeCells
        // this.allCells = freeCells.splice(); //deep copy the freeCells array so that it can be concat'd back into the map for that floor.

        //place the player in the first free location
        //fix this to put it somewhere else that isn't just 
        this._placePlayer(freeCells);

        if(!this.explored){
            //generate monsters normally
            this._generateRandomMonsters(Enemy, freeCells, this.Game.player);
        }
        else{
            //do some lesser monster generation - these are stragglers
            //OR, do an ambush, depending on aggressiveness?
        }

        //TODO: need call to Game object, such that it can schedule monsters/player

        //the map should be finished loading, draw the whole map to finish up.
        this._drawWholeMap();
    }

    //Save Map
    //this is called when a player leaves the current map and enters the next one
    _saveMap(){
        //make a shallow copy of the current map
        var map = this.maps[this.floor];

        //add the explored variable
        map.explored = true;

        //add the ascending stairs coordinate
        //need a stairs up coordinate

        //add the descending stairs coordinate
        //need a stairs down coordinate

        //add the original free cells
        map.freeCells = this.maps[this.floor].freeCells;

        //TODO: need to call Game object, such that it can unschedule all monsters,players.

        //purge actors from map
        this.monstersAlive = [];
        this.corpses = [];
        console.log(this.maps[this.floor]);
    }

    _changeFloor(direction){
        //TODO: Check to see if floor is 1, then do an exit of the map to town, or menu or something
        //TODO: Update clog with message about going up or down

        if(direction === "Down"){
            //save the map first
            this._saveMap();
            this.floor++; //increment floor
            console.log(this);
            this._loadMap(this.floor);
        }
        else{
            //save the map first
            this._saveMap();
            this.floor--; //decrement floor
            this._loadMap(this.floor);
        }
    }

    //====ACTOR USAGE====
    //Methods for generating or placing actors in the map

    //Place Player
    //places the player in the first available free spot that can be found
    _placePlayer(freeCells){
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index,1)[0];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        //DEBUG: manually bang player properties
        this.Game.player._x = x;
        this.Game.player._y = y;
        this.Game.player._draw();
    }

    //Generate Monsters

    _generateRandomMonsters(actr, freeCells, playerRef){
        //TODO: Update to work with a Monster Definitions list
        var num = Math.floor(ROT.RNG.getUniform() * 10);
        for(var i=0; i<num; i++){
            var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
            var key = freeCells.splice(index,1)[0];
            var parts = key.split(",");
            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);
            var types = {
                "goblinoid": 5,
                "rat swarm": 3,
                "orc": 2,
                "rainbowliz":1
            }
            var name = ROT.RNG.getWeightedValue(types);
            console.log(this.Game);
            var monster = new actr(name, x, y, null, playerRef, this.Game);
            this.monstersAlive.push(monster);
            this.Game.scheduler.add(monster, true);
        }
    }

    //====MAP RENDERING====
    //These methods are for rendering the map/actors to the display
    _drawWholeMap(){
        for (var key in this.currMap) {
            var parts = key.split(",");
            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);
            if(this.currMap[key] === "#"){
                var c = 0;
                //TODO: Maybe make this better?
                for(var i=-1;i<2;i++){
                    for(var j=-1;j<2;j++){
                        if(this.currMap[(x+i)+","+(y+j)]==="."){
                            c++;
                        }
                    }
                }
                if(c < 1){
                    this.Game.display.draw(x,y," ");
                    continue;
                }
            }
            if(this.currMap[key] === "#"){
                this.Game.display.draw(x, y, this.currMap[key], "#bbb");
            }
            else if(this.currMap[key] === "V"){// "⚞"){
                this.Game.display.draw(x,y,this.currMap[key], "#f84");
            }
            else if(this.currMap[key] === "^"){// "⚟"){
                this.Game.display.draw(x,y,this.currMap[key], "#f84");
            }
            else
            {
                this.Game.display.draw(x, y, this.currMap[key], "#fff");
            }

        }
    }

    //this function redraws all the current active entities on the map
    //this includes the Player, all Enemies, and all Corpses
    //in the future, it will extend to NPCs, Monuments, and other map objects
    _drawAllEntities(){


        //intended use is for after closing of any menuing system
        this.Game.player._draw();

        this.monstersAlive.forEach(function(value){
            value._draw();
        });

        this.corpses.forEach(function(value){
            value._drawCorpse();
        });
    }
}

class MapFloor{
    constructor(playField, freeCells, explored, ){
        this.playField = playField;
        this.freeCells = freeCells;
        this.explored = explored;
    }
}


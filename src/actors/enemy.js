import Actor from "./actor.js";
import Corpse from "./containers/corpse.js";
import Inventory from "./containers/inventory.js";
import Equipment from "./containers/equipment.js";
import Weapon from "../items/weapon.js";
import Consumable from "../items/consumable.js";

//Enemy actor - contains methods for attacking/seeking players, dispensing loot, etc
export default class Enemy extends Actor{
	constructor(name,x,y,fileLoc, playerRef, gameRef){
		super(name,x,y);
		
		this.target = playerRef;  //set reference to player
		//loadStatsFromFileLoc(fileLoc);

		this.Game = gameRef;

		//generate loot

		this.isDead = false;
		this.onFloor = this.Game.map.floor;
		//DEBUG GEN STATS
		if(this.name === "orc"){
			this.STR = 5 + Math.floor(ROT.RNG.getUniform()*2);
			this.DEX = 2 + Math.floor(ROT.RNG.getUniform()*3);
			this.CON = 3 + Math.floor(ROT.RNG.getUniform()*2);
			this.INT = 1;
			this.WIS = 1;

			this.HP = 5 + Math.floor(this.CON / 2);
			this.XP = 5;
		}
		else if(this.name === "goblinoid"){
			this.STR = 2 + Math.floor(ROT.RNG.getUniform()*2);
			this.DEX = 5 + Math.floor(ROT.RNG.getUniform()*2);
			this.CON = 1;
			this.INT  = 1;
			this.WIS = 3 + Math.floor(ROT.RNG.getUniform()*3);

			this.HP = 2 + this.CON;
			this.XP = 3;
		}
		else if(this.name === "rat swarm"){
			this.STR = 4 + Math.floor(ROT.RNG.getUniform()*2);
			this.DEX = 3 + Math.floor(ROT.RNG.getUniform()*2);
			this.CON = 5 + Math.floor(ROT.RNG.getUniform()*3);
			this.INT = 1;
			this.WIS = 1;

			this.HP = 7 + Math.floor(this.CON / 2);
			this.XP = 7;
		}
		else{
			this.STR = 6;
			this.DEX = 5 + Math.floor(ROT.RNG.getUniform()*2);
			this.CON = 10;
			this.INT = 1;
			this.WIS = 3;

			this.HP = 20;
			this.XP = 15;
		}


		this.BAL = 1;
		this.HIT = Math.floor(this.DEX / 2);
		this.EVA = Math.floor(this.DEX / 2);
		this.ATK = Math.floor(this.STR / 2);
		this.MTK = Math.floor(this.INT / 2);
		this.DEF = Math.floor(this.CON / 10);
		this.MDEF = Math.floor(this.WIS/10);
		
		//this.HP = Math.floor(5 + this.CON / (1.2));
		this.MP = Math.floor(this.INT * this.WIS * 4);
		this.HEAL = Math.floor(this.WIS/2);

		this.scaleEnemy(this.Game.map.floor);
		this.generateLoot();
		//console.log(this);
		this._draw();
	}

	scaleEnemy(floor){

		if(floor > 1){
			for(var i=0; i<floor; i++){
				this.STR += Math.floor(ROT.RNG.getUniform() * 5);
				this.DEX += Math.floor(ROT.RNG.getUniform() * 5);
				this.CON += Math.floor(ROT.RNG.getUniform() * 5);
				this.INT += Math.floor(ROT.RNG.getUniform() * 5);
				this.WIS += Math.floor(ROT.RNG.getUniform() * 5);

				this.HP += Math.floor(this.CON / 2);
				this.XP += Math.floor(ROT.RNG.getUniform()*6);
			}
		}
		this.BAL = 1;
		this.HIT = Math.floor(this.DEX / 2);
		this.EVA = Math.floor(this.DEX / 2);
		this.ATK = Math.floor(this.STR / 2);
		this.MTK = Math.floor(this.INT / 2);
		this.DEF = Math.floor(this.CON / 10);
		this.MDEF = Math.floor(this.WIS/10);

		if(floor < 6){
			this.lootTable = 1;
		}
		else if(floor < 11){
			this.lootTable = 2
		}
		else if(floor < 16){
			this.lootTable = 3;
		}
		else if(floor < 25){
			this.lootTable = 4;
		}
		else{
			this.lootTable = 5;
		}


	}

	generateLoot(){
		this.inventory = new Inventory(this.STR, this);
		this.numItems = Math.floor(ROT.RNG.getUniform() * 2);
		this.genWeapon = false;

		if(ROT.RNG.getUniform()  > 0.80){
			this.genWeapon = true;
		}
		var rItems ={};
		if(this.genWeapon === true){

			if(this.lootTable === 1){
				rItems = {
					"club": 1
				}
			}
			else if(this.lootTable === 2){
				rItems = {
					"club": 1,
					"shillelagh":1
				}
			}
			else if(this.lootTable === 3){
				rItems = {
					"club": 1,
					"shillelagh":3,
					"short sword":6,
					"long sword":2
				}
			}
			else if(this.lootTable === 4){
				rItems = {
					"shillelagh":1,
					"short sword":3,
					"long sword":6,
					"flail":2
				}
			}
			else{
				rItems = {
					"flail":1,
					"bastard sword":1
				}
			}

			//console.log(rItems);
			var rand = ROT.RNG.getWeightedValue(rItems);
			//console.log(rand);
			var strng = this.Game.itemDefs.weapons[rand];
			var spla = strng.split("/");
			var statsa = spla[5].split(",");
			var item = new Weapon(spla[0],spla[2],spla[3],statsa[0],statsa[1]);
			this.inventory.addItem(item);
		}



		if(this.lootTable === 1){
			rItems = {
				"inferior potion":3,
				"lesser potion":1
			}
		}
		else if(this.lootTable === 2){
			rItems = {
				"inferior potion":1,
				"lesser potion":3,
				"potion":1
			}
		}
		else if(this.lootTable === 3){
			rItems = {
				"lesser potion": 1,
				"potion":4
			}
		}
		else if(this.lootTable === 4){
			rItems = {
				"potion": 4,
				"superior potion":1
			}
		}
		else{
			rItems = {
				"superior potion":1
			}
		}



		for(var i=0; i < this.numItems; i++){
			//DEBUG, roll a random item
			var rand = ROT.RNG.getWeightedValue(rItems);
			strng = this.Game.itemDefs.potions[rand];
			var spla = strng.split("/");
			var item = new Consumable(spla[0],spla[2],spla[3],{"HP": spla[5]});
			this.inventory.addItem(item);
		}
	}

	_draw(){
		this.Game.display.draw(this._x, this._y, "M", "red");
	}

	_drawCorpse(){
		this.Game.display.draw(this._x, this._y, "X", "#8f0");
	}

	act(){
		//TODO: add pathfinding, AI, etc.
		//console.log("inside of enemy act");
		this.Game.engine.lock();
		var x = this.target.getX();
		var y = this.target.getY();

		var passableCallback = function(x,y){
			// this.x = x; //some garbage work around stuff
			// this.y = y; 
			// if(!(Game.monstersAlive.every(function(value){
			// 	if(this.x === value._x && this.y === value._y){
			// 		return false;
			// 	}
			// 	else{
			// 		return true;
			// 	}
			// }.bind(this)))){
			// 	return false;
			// }
			return(this.Game.map.currMap[x+","+y] !== "#" && this.Game.map.currMap[x+","+y] !== " ");
		}

		var astar = new ROT.Path.AStar(x, y, passableCallback.bind(this), {topology: 4});
		var path = [];
		var pathCallback = function(x,y){
			path.push([x,y]);
		}
		astar.compute(this._x, this._y, pathCallback);

		path.shift(); //removes enemy's current position
		//console.log("path length: " + path.length);
		//var d = dist(this._x,this._y,x,y);
		if(path.length <= 1){
			this.fight();
		}
		else if(path.length < 7){ //this value needs tweaked
			//console.log("path: " + path);
			x = path[0][0];
			y = path[0][1];
			//this.Game.display.draw(this._x, this._y, this.Game.map[this._x+","+this._y]);
			this._x  = x;
			this._y = y;
			//this._draw();
		}
		// this.Game.map._drawWholeMap();
		// this.Game.map._drawAllEntities();

		//else, just stall
		this.Game.engine.unlock();
	}

	//ACTIONS
	fight(){
		//general fighting action
		var dmgOutput = parseInt(this.ATK + 3); // FOR LATER: this.equipment.weapon.ATK;
		//console.log("enemy fighting");
		//console.log(this);
		this.target.takeDamage(dmgOutput,"PHYS",this.name);
	}

	takeDamage(dmginput,type){
		//console.log("enemy take damage");
		var dmgtaken = 0;
		var msg = "";
		if(type === "PHYS"){
			dmgtaken = Math.floor(dmginput - (dmginput * (this.DEF/100)));
			if(dmgtaken < 1){
				dmgtaken = 1;
			}
			msg = this.name +  " takes " + dmgtaken + " damage from "  + this.target.name;
		}
		else{
			dmgtaken =Math.floor(dmginput - (dmginput * (this.MDEF/100)));
			if(dmgtaken < 1){
				dmgtaken = 1;
			}
			msg = this.name +  " takes " + dmgtaken + " magic damage from "  + this.target.name;
		}
		//TODO:
		this.HP -= dmgtaken;
		this.Game.ui.updateClog(msg,"white");
		if(this.HP < 1){
			this.doDeath();
		}
	}

	//TODO: Differentiation on death messages
	//1. Message for monsters dropping loot
	//2. Message for monsters not dropping loot
	doDeath(){
		this.Game.scheduler.remove(this);
		var ind = this.Game.map.monstersAlive.indexOf(this);
		this.awardXP(this.XP);
		//console.log(this.target);
		if(ind > -1){
			this.Game.map.monstersAlive.splice(ind,1); //toss the enemy out of the monstersAlive array.
			console.log(this.inventory);
			//if the inventory is null (no loot), then don't create a corpse
			if(this.inventory != null && this.inventory.contents.length > 0){
				this.Game.map.corpses.push(new Corpse(this._name, this._x, this._y, this.inventory, this.Game));
				this._drawCorpse();
				var msg = this.name + " collapes into a pile of loot!";
				this.Game.ui.updateClog(msg, "white");
			}
			else{
				var msg = this.name + " turns into dust!";
				this.Game.ui.updateClog(msg, "white");
			}
		}
		else{
			//console.log("error checking inded!")
		}
		console.log(this);
		
	}

	//This function calls a player public function to add XP
	//that function checks current XP at level and does level up
	awardXP(xp){
		this.target.gainXP(xp);
	}


	//This checks monster's current location to see if it can drop a box
	//that contains the monster's generated loot
	//if that doesn't work, it searches for the nearest square to drop it.
	dropLoot(){
		//if(checkMapSquare()) is clear
		//	generateTreasureContainer(this._x,this._y,this.monsterLoot[])
		//else
		//	key = findNearestSquare(this._x, this._y);
		//	coords = key.split(',');
		//	nx = coords[0];
		//	ny = coords[1];
		//	generateTreasureContainer(nx, ny, this.monsterLoot[]);
		
	}
}
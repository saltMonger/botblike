import ROT from './rot.js';
import Map from "./map.js";
import Inventory from "./actors/containers/inventory.js";
import Equipment from "./actors/containers/equipment.js";
import Actor from "./actors/actor.js";

import Weapon from "./items/weapon.js";
import Consumable from "./items/consumable.js";


//INIT GAME VAR
var Game = {
	display: null,
	engine: null,
	clogHeight: 6,

	init: function() {
		//init engine
		this.display = new ROT.Display();
		console.log(this.display._options.height);
		//console.log(this.display);
		this.map = new Map(this);
		this.ui = new UI(0,this.display._options.height - this.clogHeight, this.display._options.width, this.clogHeight);
		//this.ui.clog(0,this.display._options.height - this.clogHeight, this.display._options.width,this.clogHeight);
		this.ui.updateClog("Welcome to botblike! You're the yellow @, arrow keys to move.", "yellow");
	
		document.body.appendChild(this.display.getContainer());

		this._setItemDefinitions();


		//sound init
		this.sounds = {
			"music1": "MSC1",
			"music2": "MSC2"
		}

		//bad practice, whatever
		 createjs.Sound.registerSound("music/MootBooxle_RogueLoop_A.ogg",this.sounds.music1);
		 createjs.Sound.registerSound("music/MootBooxle_RogueLoop_B.ogg",this.sounds.music2);

		//generate map and place players
		var nKey = ["0,0"];
		this._createPlayer(nKey);

		this.scheduler = new ROT.Scheduler.Simple();

		this.map._generateMap(30);
		//do the generate here, should be good.

		this.scheduler.add(this.player, true);
	
		this.engine = new ROT.Engine(this.scheduler);
		this.engine.start();

		//load the map for the first time
        this.map._loadMap(this.map.floor);
		
		this.ui.repaintClog();
	}
}

//DECLARE ENGINE VARS ETC.
Game.player = null;
Game.enemies = [];
Game.monster = null;
Game.itemDefs = null;



//GAME FUNCTIONS
Game._setItemDefinitions = function(){
	this.itemDefs = new ItemDefinitions("r");
}

Game._restartGame = function(){
	for(var i=0; i<this.map.monstersAlive.length; i++){
		this.scheduler.remove(this.map.monstersAlive[i]);
	}
	this.scheduler.remove(this.player);
	this.player = null;
	this.floor = 1;
	Game._generateMap();

}

Game._createPlayer = function(freeCells) {
	var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
	var key = freeCells.splice(index, 1)[0];
	var parts = key.split(",");
	var x = parseInt(parts[0]);
	var y = parseInt(parts[1]);
	this.player = new Player("save",x,y,false);
}

class Player extends Actor{
	constructor(name,x,y,fromSave){
		super(name,x,y);
		if(fromSave){
			//get_player_save
		}
		else{
			//generate stat block

			//generate starting equipment

			//generate all skills
			this.generateStatBlockFirstTime();
		}
		this.inventory = new Inventory(this.STR, this);
		this.equipment = new Equipment(this);
		
		//DEBUG DEBUG DEBUG
		var strng = Game.itemDefs.weapons["stick"];
		var spl = strng.split("/");
		var stats = spl[5].split(",");
		var weap = new Weapon(spl[0],spl[2],spl[3],stats[0],stats[1]);
		
		for(var i=0; i<2; i++){
			var rItems = {
				"inferior potion": 4,
				"lesser potion": 3,
				"potion": 2,
				"superior potion": 1
			}
			strng = Game.itemDefs.potions["inferior potion"];
			var spla = strng.split("/");
			var item = new Consumable(spla[0],spla[2],spla[3],{"HP": spla[5]});
			this.inventory.addItem(item);
		}


		this.equipment.debugEquip("weap", weap);
		//handlers for menus
		this.inInventoryMenu = false;
		this.inInspectMenu = false;
		this.inLootMenu = false;


		this.inLootMenu = false;
		this.inLootInspect = false;
		this.inspectItem = 0;
		this.corpseInspect = -1;
		//handlers for menus

		this._draw();
	}

	getX(){
		return this._x;
	}

	getY(){
		return this._y;
	}



	//Initializations
	generateStatBlockFirstTime(){
		this.level = 1;


		//TODO: this is current PoC/Example code
		this.STR = Math.abs(Math.floor(ROT.RNG.getNormal(0,1)*10)); //get a normal distribution
		this.DEX = Math.abs(Math.floor(ROT.RNG.getNormal(0,1)*10));
		this.CON = Math.abs(Math.floor(ROT.RNG.getNormal(0,1)*10));
		this.INT = Math.abs(Math.floor(ROT.RNG.getNormal(0,1)*10));
		this.WIS = Math.abs(Math.floor(ROT.RNG.getNormal(0,1)*10));

		//DEBUG
		this.BAL = 1;
		//DEBUG

		this.HIT = Math.floor(this.DEX / 2);
		this.EVA = Math.floor(this.DEX / 2);
		this.ATK = Math.floor(this.STR / 2);
		this.MTK = Math.floor(this.INT / 2);
		this.DEF = Math.floor(this.CON / 10);
		this.MDEF = Math.floor(this.WIS/10);
		//REAL		
		//this.HP = Math.floor(5 + this.CON / (1.2));
		//DEBUG:
		this.MAXHP = 10 + Math.floor(this.CON / 2);
		this.HP = this.MAXHP;
		this.MP = Math.floor(this.INT * this.WIS * 4);
		this.HEAL = Math.floor(this.WIS/2);
		
		this.isDead = false;

		//do for all stats

		//XP
		this.XP = 0;
		this.nextLevel = 50;
		//maybe pickout the highest stat and assign a class archetype name?
		//STR -> fighter
		//DEX -> thief
		//CON -> knight
		//INT -> wizard
		//WIS -> sage
	}

	//REQUIRED
	_draw(){
		Game.display.draw(this._x, this._y, "@", "#ff0");
	}

	modifyStats(effects){
		for(var property in effects){
			if(property === "HP"){
				this.HP += parseInt(effects[property]);
				var hpHealed = parseInt(effects[property]);
				if(this.HP > this.MAXHP){
					this.HP = this.MAXHP;
				}
				//numerical error here: FIX THIS TODO FIX
				var msg = this.name + " healed " + parseInt(effects[property]) + " health";
				Game.ui.updateClog(msg,"SpringGreen");
			}
		}
	}

	gainXP(xp){
		this.XP += xp;
		var msg = this.name + " has gained " + xp + " experience!";
		Game.ui.updateClog(msg, "SpringGreen");
		if(this.XP >= this.nextLevel){
			this.doLevelUp();
		}

	}

	doLevelUp(){
		this.level += 1;
		this.STR = Math.floor(ROT.RNG.getUniform() * 5) + parseInt(this.STR);
		this.DEX = Math.floor(ROT.RNG.getUniform() * 5) + parseInt(this.DEX);
		this.CON = Math.floor(ROT.RNG.getUniform() * 5) + parseInt(this.CON);
		this.INT = Math.floor(ROT.RNG.getUniform() * 5) + parseInt(this.INT);
		this.WIS = Math.floor(ROT.RNG.getUniform() * 5) + parseInt(this.WIS);

		this.HIT = Math.floor(this.DEX / 2);
		this.EVA = Math.floor(this.DEX / 2)
		this.ATK = Math.floor(this.STR / 2);
		this.MTK = Math.floor(this.INT / 2);
		this.DEF = Math.floor(this.CON / 10);
		this.MDEF = Math.floor(this.WIS/10);

		this.MAXHP = Math.floor(this.CON / 2) + parseInt(this.STR);
		this.HP = this.MAXHP;

		this.nextLevel = parseInt(this.nextLevel) * 2; //just double the required level
		this.XP = 0;  //reset XP to zero

		var msg = this.name + " has leveled up!";
		Game.ui.updateClog(msg, "SpringGreen");
	}


	act(){
			Game.map._drawWholeMap();
			Game.map._drawAllEntities();
		Game.engine.lock();
		window.addEventListener("keydown", this);
	}

	handleEvent(e){
		var keyMap = {};
		keyMap[38] = 0;
		keyMap[33] = 1;
		keyMap[39] = 2;
		keyMap[34] = 3;
		keyMap[40] = 4;
		keyMap[35] = 5;
		keyMap[37] = 6;
		keyMap[36] = 7;
 
		var code = e.keyCode;
		if(this.isDead){
			var text = ["THOU HATH DIED", "THY CORPSE LIE", "COLD...", "REFRESH BROWSER,", "PLEBIAN SOUL"];
			Game.ui.pmenu((Game.display._options.width / 2)-10, 6, 20, 12, "The end!", text);
			if(code === 13 || code === 32){
				Game._restartGame();
				Game.engine.unlock();

			}
			return;
		}

		if(this.inCharMenu === true){
			Game.map._drawWholeMap();
			Game.ui.redrawCharMenu((Game.display._options.width / 2) - 20, 4,20,20,this.name,0);
			//need to wait for input?
			return;
		}

		//consider switching to some custom keybind scheme
		//move to key handler section
		if(code === 67){
			Game.ui.charMenu((Game.display._options.width / 2) - 20, 4,20,20,this.name,new displayStats(this.STR, this.DEX, this.CON,
																this.INT, this.WIS, this.BAL, this.HIT, this.EVA,
															this.ATK, this.MTK, this.DEF, this.MDEF).Stats);
			Game.ui.redrawCharMenu((Game.display._options.width / 2) - 20, 4, 20,20,this.name,0);
			this.inCharMenu = true; //set CharMenuFlag
			return;
		}

		if(this.inLootInspect === true){
			var ret = Game.ui.handleInspectMenu(this, code, true);
			if(ret === 1){
				//end inLootInspect
				this.inLootInspect = false;
				this.inspectItem = null;
				Game.ui.imenu((Game.display._options.width / 2) - 20, 4, 40, 12, "Loot", this.corpseInspect.loot.contents, true);
				return;
			}
			else{
				return;
			}
		}

		if(this.inInspectMenu === true){
			var ret = Game.ui.handleInspectMenu(this, code, false);
			if(ret === 1){
				//end inInspectMenu
				this.inInspectMenu = false;
				this.inspectItem =  null;
				Game.ui.imenu((Game.display._options.width / 2)- 20, 4, 40, 12,"Inventory",this.inventory.contents, false);
				return;
			}
			else{
				return;
			}
		}

		if(this.inLootMenu === true){
			Game.map._drawWholeMap();
			var ret = Game.ui.menuHandler(code);
			if(ret === -1){
				this.inLootMenu = false;
				Game.map._drawWholeMap();
				var index = Game.map.corpses.indexOf(this.corpseInspect);
				Game.map.corpses.splice(index, 1); //remove the corpse from the array
				Game.map._drawAllEntities();
				return;
			}
			else if(ret > 0){
				ret -= 1;
				this.inLootInspect = true;
				this.inspectItem = this.corpseInspect.loot.contents[ret];
				Game.map._drawWholeMap();
				Game.ui.insMenu((Game.display._options.width /2 ) - 10, 4, 20,  12, this.inspectItem, true);
				return;
			}
			else{
				return;
			}
		}

		if(this.inInventoryMenu === true){
			Game.map._drawWholeMap();
			var ret = Game.ui.menuHandler(code);
			if (ret === -1){
				this.inInventoryMenu = false;
				Game.map._drawWholeMap();
				Game.map._drawAllEntities();			
				return;
			}
			else if(ret > 0){
				ret -= 1; //account for manual offset from menuHandler
				this.inInspectMenu = true;
				this.inspectItem = this.inventory.contents[ret];
				Game.map._drawWholeMap();
				Game.ui.insMenu((Game.display._options.width / 2) - 10, 4, 20, 12,this.inspectItem,false); //loot is false here
				return;
			}
			else{
				return;
			}
		}

		if(code === 73){ //this is the keycode for "I"
			Game.ui.imenu((Game.display._options.width / 2)- 20, 4, 40, 12,"Inventory",this.inventory.contents, false);
			this.inInventoryMenu = true;
		}
		else if(code === 87){//TODO: Maybe consider a better mapping for this. Current mapping is "W"

			//possibly controversial?
			var restBenefits = {"HP": 1}; //gain 1 HP on rest.  Maybe too powerful for current build?  (Need wandering monsters/events to affect this)
			this.modifyStats(restBenefits);
			//possibly controversial?
			window.removeEventListener("keydown",this.handleEvent);  //this is important!
			Game.engine.unlock();
			return;
		}

		if(!(code in keyMap)){
			return;
		}

		//check if keycode is movement
		//doMovement
		
		//check if keycode is other
		//do menus/interact
		var diff = ROT.DIRS[8][keyMap[code]];
		var newX = this._x + diff[0];
		var newY = this._y + diff[1];

		var newKey = newX + "," + newY;

		if(!(newKey in Game.map.currMap) || (Game.map.currMap[newKey] === "#")){
			return;
		}//can't move in this direction
		else if(Game.map.currMap[newKey] === "V"){ //"⚞"){
			//Game.map.floor += 1;
			if(Game.map.floor < 30){
				//Game._generateMapDeeper();
				//TODO: add call to change the floor the player is on to descend

				Game.map._changeFloor("Down"); //this will load the floor
				window.removeEventListener("keydown",this.handleEvent);  //this is important!
				Game.engine.unlock();
				// var msg = "You has descend to floor " + Game.floor + "!";
				// Game.ui.updateClog(msg, "white");
				return;
			}
		}
		else if(Game.map.currMap[newKey] === "^"){// "⚟"){
			Game.map._changeFloor("Up");
			window.removeEventListener("keydown",this.handleEvent);  //this is important!
			Game.engine.unlock();
			return;
		}
		else if(Game.map.monstersAlive.length > 0){
			for(var i=0; i<Game.map.monstersAlive.length; i++){
				if(newX === Game.map.monstersAlive[i]._x && newY === Game.map.monstersAlive[i]._y){
					//fight this one!
					this.fight(Game.map.monstersAlive[i]);
					window.removeEventListener("keydown",this.handleEvent);  //this is important!
					Game.engine.unlock();
					return;
				}
			}
		}

		if(Game.map.corpses.length > 0){
			for(var i=0; i<Game.map.corpses.length; i++){
				if(newX === Game.map.corpses[i]._x && newY === Game.map.corpses[i]._y){
					this.corpseInspect = Game.map.corpses[i];
					this.inLootMenu = true;
					//console.log("game corpses:");
					//console.log(Game.corpses);
					Game.ui.imenu((Game.display._options.width / 2)- 20, 4, 40, 12,"Inventory",Game.map.corpses[i].loot.contents, true);
					return;
				}
			}
		}


		Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
		this._x = newX;
		this._y = newY;
		this._draw();
		window.removeEventListener("keydown",this.handleEvent);  //this is important!
		//console.log("before unlock");
		Game.engine.unlock(); //also, so is this!
	}	
	

	//Combat functions
	fight(target){
		//console.log("wp attack: " + this.equipment.weapon.atk);
		//console.log("regular atk: " + this.ATK);
		var dmgOutput = parseInt(this.ATK) + parseInt(this.equipment.weapon.atk); // FOR LATER: this.equipment.weapon.ATK;
		//console.log("player fighting" + dmgOutput);
		target.takeDamage(dmgOutput,"PHYS");
		//console.log(target);
	}


	takeDamage(dmginput,type,enemyName){
		//console.log("taking damage");
		var dmgtaken = 0;
		var msg = "";
		if(type === "PHYS"){
			dmgtaken = Math.floor(dmginput - (dmginput * (this.DEF/100)));
			if(dmgtaken < 1){
				dmgtaken = 1;
			}
			msg = this.name + " takes " + dmgtaken + " damage from " + enemyName;
		}
		else{
			dmgtaken = Math.floor(dmginput * (dmginput * (this.MDEF/100)));
			if(dmgtaken < 1){
				dmgtaken = 1;
			}
			msg = this.name + " takes " + dmgtaken + " magic damage from " + enemyName;
		}
		//TODO:
		this.HP -= dmgtaken;
		Game.ui.updateClog(msg,"red");
		if(this.HP < 1){
			this.doDeath();
		}
		//console.log("Player HP:" + this.HP);
	}

	doDeath(){
		this.isDead = true;
	}


}

class ItemDefinitions{
	constructor(r){
		this.weapons = [];
		this.armors = [];
		this.foods = [];
		this.potions = [];
		this.trash = [];
		
		this.defineWeapons();
		this.defineConsumables();
	}

	defineWeapons(){
		this.weapons["stick"] = "stick/weap/3/0/just a measly stick/5,1";
		this.weapons["club"] = "club/weap/7/1/a club made from roughly hewn wood/10,3";
		this.weapons["shillelagh"] = "shilleglagh/weap/11/6/a nicely formed cudgel/20,5";
		this.weapons["short sword"] = "short sword/weap/15/20/a sharp sword/15,1";
		this.weapons["long sword"] = "long sword/weap/23/35/your standard sword/25,2";
		this.weapons["flail"] = "flail/weap/22/50/some people debate whether or not these actually existed/40,13";
		this.weapons["bastard sword"] = "bastard sword/weap/21/22/this sword needs 1.5 hands/30,7";
	}

	defineConsumables(){
		this.potions["inferior potion"] = "small potion/cons/1/5/a tiny vial of health/10";
		this.potions["lesser potion"] = "lesser potion/cons/1/10/a small vial of health/25";
		this.potions["potion"] = "potion/cons/1/25/a potion of health/50";
		this.potions["superior potion"] = "super potion/cons/1/100/a potion of healing/100";

	}

}

// class Equipment{
// 	constructor(pTarget){
// 		this.target = pTarget;
// 		this.weapon = null;
// 		this.armor = null;
// 	}
	
// 	//this does an unequip/equip
// 	//removes newly equipped item from inventory, and returns previously equipped item
// 	//recalculates stats
// 	equip(type,item){
// 		if(type === "weap"){
// 			//console.log("inside equipment");
// 			this.target.inventory.addItem(this.weapon);
// 			this.weapon = null;
// 			this.weapon = item;
// 			this.target.inventory.removeItem(item);
// 		}
// 		else
// 		{
// 			this.target.inventory.addItem(this.armor);
// 			this.armor = null;
// 			this.armor = item;
// 			this.target.inventory.removeItem(item);
// 		}
// 	}
	
// 	debugEquip(type, item){
// 		if(type === "weap"){
// 			this.weapon = item;
// 		}
// 		else{
// 			this.armor = item;
// 		}
// 	}
// }

// class Inventory {
// 	constructor(STR, pTarget){
// 		this.gold = 0;
// 		this.contents = [];
// 		this.weightLimit = Math.floor(STR * 10);
// 		this.weight = 0; //current weight
// 		this.target = pTarget;
// 	}


	
// 	addItem(item){
// 		//console.log(item);
// 		this.contents.push(item);
// 		this.weight += item._weight;
// 	}

// 	removeItem(item){
// 		//console.log(item);
// 		var index = this.contents.indexOf(item);
// 		this.contents.splice(index, 1); //drop from item array
// 		this.weight -= item._weight;
// 	}

// 	equipItem(item){
// 		var ty = item.constructor.name;  //should be WEAP or ARMOR or something
// 		if(ty === "Weapon"){
// 			this.target.equipment.equip("weap", item);
// 		}
// 		else if(ty === "Armor"){
// 			this.target.equipment.equip("ARMOR", item);
// 		}
// 	}

	
// 	loadFromFile(loadString){
// 		var lines = loadString.split("\n");
// 		lines.foreach(function(line){
// 			item = line.split("/"); //name type weight value desc stats
// 			switch(item[1]){
// 				case "food": var stats = item[5].split(","); //targetType target time effects
// 					var effects = stats[3].split(";");
// 					var food = new Food(item[0],item[2],item[3],stats[0],stats[1],effects,stats[2]); //this will need updated
// 					this.contents.push(food);
// 					this.weight += food._weight;
// 					break;
// 				default: //console.log("failed to load item: invalid type definition!");
// 					break;
// 			}
// 		});
// 	}
// }


class CraftingBase {
	constructor(playerRef){
		this.player = playerRef;
	}

	craftItem(itemCreated, ingredients){
		if(!checkRequiredIngredients(ingredients)){
			return;
		}
		var value;
		ingredients.forEach(function(ing){
			value += ing.value;
		});
		//TODO: decide actual formula
		var xpAward = Math.floor(value / 1000);
		this.player.applyXP(xpAward);
		createItem(itemCreated, ingredients);
	}

	createItem(itemCreated, ingredients){
		//this.player.inventory.add(itemCreated)
		//this.player.inventory.removeList(ingredients);
	}

	checkRequiredIngredients(ingredients){
		ingredients.forEach(function(ing){
			//if(!this.player.inventory.isIn(ing))
			//	return false;		
		});
		return true;
	}
}

class Cooking extends CraftingBase {
	constructor(playerRef, cookingFile){
		super(playerRef);
		this.cookingMap = [];
		//do an async fill of cooking map
		createCookingRecipes(cookingFile);
	}
	
	//Generates Recipes for Cooking.  Does NOT support multiple amounts of the same ingredient
	createCookingRecipes(cookingFile){
		//get file reference
		var reader = new FileReader();
		reader.onload = function(progressEvent){
			var lines = this.result.split('\n');
			for(var line = 0; line < lines.length; line++){
				var spl = line.splice("/");
				var recipeObj = []
				for (sec=1; sec < spl.length; sec++){
					recipeObj.push(spl[sec]); //push ingredient
				}
				this.cookingMap[spl[0]] = recipeObj;
			}
		}
	}

	//methods for UI to call
	listRecipes(){
		return Object.keys(this.cookingMap);
	}

	provideRecipe(key){
		return this.cookingMap[key];
	}
}



class UI {
	constructor(x,y,width,height){
		this._x = x;
		this._y = y;
		this.clog(x,y,width,height)
	}

	clog(x,y, width, height){
		//initialize console-log (bottom of the screen) to handle
		//update information (PLAYER picked up OBJECT)
		this._clogx = x;
		this._clogy = y;
		this._clogw = width;
		this._clogh = height;
		this.messageBuffer = [];
	}

	repaintClog(){
		var inty = 1;
		if(Game.player === null){
			for(var i=0;i<this._clogw;i++){
				Game.display.draw(this._clogx+i,this._clogy,"=");
			}
		}
		else{
			for(var i=0; i< this._clogw;i++){
				Game.display.draw(this._clogx+i,this._clogy," ");
			}
			//console.log("INSIDE OF THE REPAINT FUNCTION!!!!!");
			//console.log(Game.player);
			var str = "==========%b{red}%c{white}HP: " + Game.player.HP + "%b{}%c{white}";
			str += "=====%b{teal}%c{white}MP: " + Game.player.MP + "%b{}%c{white}";
			str += "=====%b{lightslategray}%c{white}LV: " + Game.player.level + "%b{}%c{white}";
			str += "=====%b{brown}%c{white}XP: " + Game.player.XP + "/" + Game.player.nextLevel + "%b{}%c{white}";
			str += "==========%b{blue}%c{white}FLR: " + Game.map.floor + "%b{}%c{}"
			str = this.strFormatterClog(str, this._clogw + 157); //117 is the size of the text color modifers
			// for(var h = 0;h <str.length; h++){
			// 	Game.display.draw()
			// }
			Game.display.drawText(this._clogx,this._clogy, str, this._clogw);

		}

		for(var j=1;j<this._clogh;j++){
			for(var i=0;i<this._clogw;i++){
				Game.display.draw(this._clogx+i,this._clogy+j," ");
			}
		}
		this.messageBuffer.forEach(function(value){
			var str = "%c{"+value.col+"}"+value.msg+"%c{}";
			Game.display.drawText(this._clogx, this._clogy+inty++,str,this._clogw);
			//Game.display.drawText(this._clogx,this._clogy+inty++,"c%{red}"+value.msg);//,this._clogw);
		}.bind(this));
	}

	updateClog(message, color){
		var newMessage = {"msg": message, "col": color};
		if(this.messageBuffer.length < this._clogh - 1){//account for top line
			this.messageBuffer.push(newMessage);
			this.repaintClog();
			return;
		}
		else{
			this.messageBuffer.splice(0,1);
			this.messageBuffer.push(newMessage);
			this.repaintClog();
			return;
		}
	}

	//generate a generic menu to display at some place on the screen
	//Looks like:
	//	/-------\
	//	|STUFF[]|
	//	|THINGS	|
	//	\-------/
	menuHandler(keyPress){
		if(keyPress === 40){ //down key
			console.log(this.cursorPosition);
			if(this.cursorPosition < (this.imenuContents.length - 1)){ //if cursor is at the bottom, do not move it
				this.cursorPosition++;
				console.log("Incrementing cursorposition");
				this.redrawIMenu(this.imenuX,this.imenuY,this.imenuWidth,this.imenuHeight,this.imenuTitle,this.imenuContents,this.cursorPosition,this.imenuPage);
				return 0;
			}
			else{
				this.redrawIMenu(this.imenuX,this.imenuY,this.imenuWidth,this.imenuHeight,this.imenuTitle,this.imenuContents,this.cursorPosition,this.imenuPage);
				return 0;
			}
		}
		else if(keyPress === 38){ //up key
			if(this.cursorPosition !== 0){ //if cursor is at top, do not move it
				this.cursorPosition--;
				this.redrawIMenu(this.imenuX,this.imenuY,this.imenuWidth,this.imenuHeight,this.imenuTitle,this.imenuContents,this.cursorPosition,this.imenuPage);
				return 0;
			}
			else{
				this.redrawIMenu(this.imenuX,this.imenuY,this.imenuWidth,this.imenuHeight,this.imenuTitle,this.imenuContents,this.cursorPosition,this.imenuPage);
				return 0;
			}
		}
		else if(keyPress === 37){ // left key
			if(this.imenuPage !== 0){
				this.imenuPage--;
				this.redrawIMenu(this.imenuX,this.imenuY,this.imenuWidth,this.imenuHeight,this.imenuTitle,this.imenuContents,this.cursorPosition,this.imenuPage);
				return 0;
			}
			else{
				this.redrawIMenu(this.imenuX,this.imenuY,this.imenuWidth,this.imenuHeight,this.imenuTitle,this.imenuContents,this.cursorPosition,this.imenuPage);
				return 0;
			}
		}
		else if(keyPress === 39){ // right key
			if(this.imenuPage !== this.imenuPageMax){
				this.imenuPage++;
				this.redrawIMenu(this.imenuX,this.imenuY,this.imenuWidth,this.imenuHeight,this.imenuTitle,this.imenuContents,this.cursorPosition,this.imenuPage);
				return 0;
			}
			else{
				this.redrawIMenu(this.imenuX,this.imenuY,this.imenuWidth,this.imenuHeight,this.imenuTitle,this.imenuContents,this.cursorPosition,this.imenuPage);
				return 0;
			}
		}
		else if(keyPress === 32 || keyPress === 13){//space OR enter
			var ret = this.cursorPosition + (this.imenuPage * (this.imenuHeight));
			//console.log("ret is: " + ret);
			ret += 1;
			return ret;
		}
		else if(keyPress === 27 || keyPress === 88){//escape OR x key
			return -1;
		}
	}

	handleInspectMenu(target, keyPress, isLoot){
		//this.reDrawInsMenu(this.imeuX,this.imenuY,this.imenuWdith,this.imenuHeight,"INSPECT",this.insmenuCursor,item);
		//console.log(this.insmenuItem);
		let optionSize;
		if(isLoot){
			optionSize = 2;
		}
		else{
			optionSize = 3;
		}

		if(keyPress === 40){ //down key
			console.log("Ins Menu Cursor: " + this.insmenuCursor);
			if(this.insmenuCursor < optionSize - 1){ //if cursor is at the bottom, do not move it
				this.insmenuCursor++;
				this.reDrawInsMenu(this.insmenuX,this.insmenuY,this.insmenuWidth,this.insmenuHeight,"INSPECT",this.insmenuCursor,this.insmenuItem, isLoot);
				return 0;
			}
			else{
				this.reDrawInsMenu(this.insmenuX,this.insmenuY,this.insmenuWidth,this.insmenuHeight,"INSPECT",this.insmenuCursor,this.insmenuItem, isLoot);
				return 0;
			}
		}
		else if(keyPress === 38){ //up key
			if(this.insmenuCursor > 0){ //if cursor is at top, do not move it
				this.insmenuCursor--;
				this.reDrawInsMenu(this.insmenuX,this.insmenuY,this.insmenuWidth,this.insmenuHeight,"INSPECT",this.insmenuCursor,this.insmenuItem, isLoot);
				return 0;
			}
			else{
				this.reDrawInsMenu(this.insmenuX,this.insmenuY,this.insmenuWidth,this.insmenuHeight,"INSPECT",this.insmenuCursor,this.insmenuItem, isLoot);
				return 0;
			}
		}
		//console.log("is loot:" + isLoot);
		if(!isLoot){
			if(keyPress === 32 || keyPress === 13){//space OR enter
					if(this.insmenuCursor === 0){
						if(this.insmenuItem.constructor.name === "Weapon"){
							target.equipment.equip("weap", this.insmenuItem);
							Game.map._drawWholeMap();
							return 1;				
						}
						else{
							target.modifyStats(this.insmenuItem.effects); //apply effects
							target.inventory.removeItem(this.insmenuItem); //make sure to actually consume it!
							Game.map._drawWholeMap();
							return 1;
						}
					}
				else if(this.insmenuCursor === 1){
					target.inventory.removeItem(this.insmenuItem);
					Game.map._drawWholeMap();
					return 1;
				}
				else if(this.insmenuCursor === 2){
					return 1;
				}
			}
		}
		else{
			if(keyPress === 32 || keyPress === 13){
				if(this.insmenuCursor === 0){
					target.inventory.addItem(this.insmenuItem);
					target.corpseInspect.loot.removeItem(this.insmenuItem);
					Game.map._drawWholeMap();
					return 1;
				}
				else if(this.insmenuCursor === 1){
					return 1;
				}
			}
		}

		if(keyPress === 27 || keyPress === 88){//escape OR x key
			return 1;
		}
	}

	strFormatterClog(str, width){
		if(str.length > width){
			str = str.slice(0,width-3);
		}
		else if(str.length < width){
			var pad = width - str.length;
			var ps = "";
			pad = pad - 2;
			for(var i=0; i<pad; i++){
				ps += "=";
			}
			str += ps;
		}
		return str;
	}

	strFormatter(str, width){
		if(str.length > width){
			str = str.slice(0,width-3);
		}
		else if(str.length < width){
			var pad = width - str.length;
			var ps = "";
			pad = pad - 2;
			for(var i=0; i<pad; i++){
				ps += " ";
			}
			str += ps;
		}
		return str;
	}

	reDrawInsMenu(x,y,width,height,title,cursorSelection,item, isLoot){
		//console.log("redrawing menu");
		var str="%b{burlywood}%c{white}";
		str += "/";
		for(i=0;i<width-2;i++){
			str += "-";
		}
		str += "\\";
		//console.log("item type: " + item.constructor.name)
		if(item.constructor.name === "Weapon"){
			//console.log("in this menu");
			var atk = "ATK: " + item.atk;
			var bal = "BAL: " + item.bal;
			var name = item._name;
			var use = "EQUIP";
			var drop = "DROP";
			var back = "BACK";
			
			atk = this.strFormatter(atk,width);
			bal = this.strFormatter(bal,width);
			name = this.strFormatter(name,width);
			use = this.strFormatter(use,width);
			drop = this.strFormatter(drop,width);
			back = this.strFormatter(back,width);

			str += "|" + name + "| ";
			str += "|" + atk + "| ";
			str += "|" + bal + "| ";

			if(!isLoot){
				if(cursorSelection === 0){
					str += "%b{white}%c{burlywood}";
					str += "|" + use + "| ";
				}
				else{
					str += "%b{burlywood}%c{white}";
					str += "|" + use + "| ";
				}
			}
			else{
				if(cursorSelection === 0){
					str += "%b{white}%c{burlywood}";
					var st = this.strFormatter("TAKE", width);
					str += "|" + st + "| ";
				}
				else{
					str += "%b{burlywood}%c{white}";
					var st = this.strFormatter("TAKE", width);		
					str += "|" + st + "| ";			
				}
			}
			
			if(!isLoot){
				if(cursorSelection === 1){
					str += "%b{white}%c{burlywood}";
					str += "|" + drop + "| ";
				}
				else{
					str += "%b{burlywood}%c{white}";
					str += "|" + drop + "| ";
				}
			}
			if(!isLoot){
				if(cursorSelection === 2){
					str += "%b{white}%c{burlywood}";
					str += "|" + back + "| ";
				}
				else{
					str += "%b{burlywood}%c{white}";
					str += "|" + back + "| ";
				}
			}
			else{
				if(cursorSelection === 1){
					str += "%b{white}%c{burlywood}";
					str += "|" + back + "| ";
					str += "%b{burlywood}%c{white}";
				}
				else{
					str += "%b{burlywood}%c{white}";
					str += "|" + back + "| ";
				}
			}
		}
		else{
			var heal = item.effects.HP;
			var name = item._name;
			var use = "USE";
			var drop = "DROP";
			var back = "BACK";
			
			heal = this.strFormatter(heal,width);
			name = this.strFormatter(name,width);
			use = this.strFormatter(use,width);
			drop = this.strFormatter(drop,width);
			back = this.strFormatter(back,width);

			str += "|" + name + "| ";
			str += "|" + heal + "| ";

			if(!isLoot){
				if(cursorSelection === 0){
					str += "%b{white}%c{burlywood}";
					str += "|" + use + "| ";
				}
				else{
					str += "%b{burlywood}%c{white}";
					str += "|" + use + "| ";
				}
			}
			else{
				if(cursorSelection === 0){
					str += "%b{white}%c{burlywood}";
					var st = this.strFormatter("TAKE", width);
					str += "|" + st + "| ";
				}
				else{
					str += "%b{burlywood}%c{white}";
					var st = this.strFormatter("TAKE", width);		
					str += "|" + st + "| ";			
				}
			}
			
			if(!isLoot){
				if(cursorSelection === 1){
					str += "%b{white}%c{burlywood}";
					str += "|" + drop + "| ";
				}
				else{
					str += "%b{burlywood}%c{white}";
					str += "|" + drop + "| ";
				}
			}
			if(!isLoot){
				if(cursorSelection === 2){
					str += "%b{white}%c{burlywood}";
					str += "|" + back + "| ";
				}
				else{
					str += "%b{burlywood}%c{white}";
					str += "|" + back + "| ";
				}
			}
			else{
				if(cursorSelection === 1){
					str += "%b{white}%c{burlywood}";
					str += "|" + back + "| ";
				}
				else{
					str += "%b{burlywood}%c{white}";
					str += "|" + back + "| ";
				}
			}
		}

		str += "\\";
		for(var i=0;i<width-2;i++){
			str += "-";
		}
		str += "/";
		Game.display.drawText(x,y,str,width);
	}


	//JUMP-PAD:XYZ991
	redrawCharMenu(x,y,width,height,title,cursorSelection){
		console.log("inside redraw char menu");
		var str = "%b{burlywood}%c{white}";

		console.log(this.charMenuStats);

		for(let key in this.charMenuStats){
			var stat = key + ": " + this.charMenuStats[key];
			var statL = stat.length; //length of inner string

			console.log("pad length");
			str += "|"; //start building the line
			var s = this.strFormatter(stat, width - 2);
			str += s;

			str += "|";

			console.log(str);
		}
		Game.display.drawText(x,y,str,width);

	}

	redrawIMenu(x,y,width,height,title,contents,cursorSelection,page){
		var str = "%b{blue}";
		var h = 0;

		//setup header size
		var header = "INVENTORY";
		var cWidth = width - header.length;
		str += "/";
		for(i=0;i<cWidth/2 - 1;i++){
			str += "-";
		}
		str += header;
		for(i=0;i<cWidth/2 - 2;i++){
			str += "-";
		}
		str += "\\";
		var sLength = height;
		var start = page * sLength; //page 0 = 0, page 1 = 10, page 2 = 20, etc
		var copyContents = contents.slice();
		copyContents = copyContents.splice(start, sLength);
		if(cursorSelection > (copyContents.length - 1)){
			cursorSelection = copyContents.length - 1;
		}
		copyContents.forEach(function(c){
			var bc = "";
			bc += c._name;
			bc += " " + c.constructor.name;
			bc += " " + c._weight + " kg";
			bc += " " + c._value + " nubs";

			if(bc.length > width){
				bc = bc.slice[0,width-3];
			}
			else if(bc.length < width){
				var pad = width - bc.length;
				var ps = "";
				pad = pad - 2;
				for(var i=0; i<pad; i++){
					ps += " ";
				}
				bc = bc + ps;
			}
			if(h === cursorSelection){
				str += "%b{white}%c{blue}";
			}
			else{
				str += "%b{blue}%c{}";
			}
			str += "|" + bc + "| ";
			h++;
			if(h>=height){
				return;
			}
		});
		str += "%b{blue}%c{}\\";
		for(var i=0;i<width-2;i++){
			str += "-";
		}
		str += "/";
		Game.display.drawText(x,y,str,width);
	}



	insMenu(x,y,width,height, item, loot){
		this.insmenuX = x;
		this.insmenuY = y;
		this.insmenuWidth = width;
		this.insmenuHeight = height;
		this.insmenuCursor = 0;
		this.insmenuItem = item;
		this.insLoot = loot;
		this.reDrawInsMenu(this.insmenuX, this.insmenuY, this.insmenuWidth, this.insmenuHeight, "INSPECT", this.insmenuCursor, this.insmenuItem, this.insLoot);
	}

	//displays character stats, and allows distribution of stats if level up occurs.
	charMenu(x,y,width,height, title, stats){
		this.charMenuX = x;
		this.charMenuY = y;
		this.charMenuWidth = width;
		this.charMenuHeight = height;
		this.charMenuTitle = title;
		this.charMenuStats = stats;
	}

	imenu(x,y, width, height, title, contents, loot){
		this.imenuX = x;
		this.imenuY = y;
		this.imenuWidth = width;
		this.imenuHeight = height;
		this.imenuTitle = title;
		this.imenuContents = contents;
		this.imenuPage = 0;
		this.cursorPosition = 0;
		this.iLoot = loot;
		var sLength = height;
		this.imenuPageMax = Math.ceil(this.imenuContents.length / sLength); //get max amount of pages
		//console.log(this);
		this.redrawIMenu(this.imenuX, this.imenuY, this.imenuWidth, this.imenuHeight, this.imenuTitle, this.imenuContents, this.cursorPosition, this.imenuPage);
	}

	pmenu(x,y, width, height, title, contents){
		var str = "%b{blue}";
		var h = 0;
		str += "/";
		for(i=0;i<width-2;i++){
			str += "-";
		}
		str += "\\";
		contents.forEach(function(c){
			if(c.length > width){
				c = c.slice[0,width-3];
			}
			else if(c.length < width){
				var pad = width - c.length;
				var ps = "";
				pad = pad - 2;
				for(var i=0; i<pad; i++){
					ps += " ";
				}
				c = c + ps;
			}
			str += "|" + c + "| ";
			h++;
			if(h>=height){
				return;
			}
		});
		str += "\\";
		for(var i=0;i<width-2;i++){
			str += "-";
		}
		str += "/";
		Game.display.drawText(x,y,str,width);
	}
}
//UTILITY CLASSES (data structures, etc.)

//Display Stats class
class displayStats{
	//an object mapped with current player stats, specifically for display
	//in the char menu.
	constructor(str,dex,con,int,wis,bal,hit,eva,atk,mtk,def,mdef){
		this.Stats = {
			"STR": str,
			"DEX": dex,
			"CON": con,
			"INT": int,
			"WIS": wis,
			"BAL": bal,
			"HIT": hit,
			"EVA": eva,
			"ATK": atk,
			"MTK": mtk,
			"DEF": def,
			"MDEF": mdef
		}
	}
}

//EXTREMELY NECESSARY
export class loader {
	run(){
		Game.init();
	}
}
Game.init();

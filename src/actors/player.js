import ROT from "../rot.js";
import Actor from "./actor.js";
import Inventory from "./containers/inventory.js";
import Equipment from "./containers/equipment.js";

import Weapon from "../items/weapon.js";
import Consumable from "../items/consumable.js";

export default class Player extends Actor{
	constructor(name,x,y,fromSave, gameObjectReference){
		super(name,x,y);

		//set handle so that main game loop, enemies, containers, etc. can target player, and vice-versa
		this.gameObjectReference = gameObjectReference;

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
		//need to generate a debug weapon
		//console.log(this.gameObjectReference.itemDefs);
		debugger;
		var strng = this.gameObjectReference.itemDefs.weapons["stick"];
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
			strng = this.gameObjectReference.itemDefs.potions["inferior potion"];
			var spla = strng.split("/");
			var item = new Consumable(spla[0],spla[2],spla[3],{"HP": spla[5]});
			//console.log(item);
			this.inventory.addItem(item);
		}


		this.equipment.debugEquip("weap", weap);
		//this.equipment.debugEquip = ("arm", [aaaarmor]);
		//DEBUG DEBUG DEBUG
				//console.log(this);
		
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
		this.gameObjectReference.display.draw(this._x, this._y, "@", "#ff0");
	}

	modifyStats(effects){
		for(var property in effects){
			if(property === "HP"){ //HEALTH WORKS!!!!
				this.HP += parseInt(effects[property]);
				var hpHealed = parseInt(effects[property]);
				if(this.HP > this.MAXHP){
					this.HP = this.MAXHP;
				}
				//numerical error here: FIX THIS TODO FIX
				var msg = this.name + " healed " + parseInt(effects[property]) + " health";
				this.gameObjectReference.ui.updateClog(msg,"SpringGreen");
			}
		}
	}

	gainXP(xp){
		this.XP += xp;
		var msg = this.name + " has gained " + xp + " experience!";
		this.gameObjectReference.ui.updateClog(msg, "SpringGreen");
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
		this.gameObjectReference.ui.updateClog(msg, "SpringGreen");
	}


	act(){
			this.gameObjectReference.map._drawWholeMap();
			this.gameObjectReference.map._drawAllEntities();
		this.gameObjectReference.engine.lock();
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
			this.gameObjectReference.ui.pmenu((this.gameObjectReference.display._options.width / 2)-10, 6, 20, 12, "The end!", text);
			if(code === 13 || code === 32){
				this.gameObjectReference._restartthis.gameObjectReference();
				this.gameObjectReference.engine.unlock();

			}
			return;
		}

		if(this.inCharMenu === true){
			this.gameObjectReference.map._drawWholeMap();
			this.gameObjectReference.ui.redrawCharMenu((this.gameObjectReference.display._options.width / 2) - 20, 4,20,20,this.name,0);
			//need to wait for input?
			return;
		}

		//consider switching to some custom keybind scheme
		//move to key handler section
		if(code === 67){
			this.gameObjectReference.ui.charMenu((this.gameObjectReference.display._options.width / 2) - 20, 4,20,20,this.name,new displayStats(this.STR, this.DEX, this.CON,
																this.INT, this.WIS, this.BAL, this.HIT, this.EVA,
															this.ATK, this.MTK, this.DEF, this.MDEF).Stats);
			this.gameObjectReference.ui.redrawCharMenu((this.gameObjectReference.display._options.width / 2) - 20, 4, 20,20,this.name,0);
			this.inCharMenu = true; //set CharMenuFlag
			return;
		}

		if(this.inLootInspect === true){
			var ret = this.gameObjectReference.ui.handleInspectMenu(this, code, true);
			if(ret === 1){
				//end inLootInspect
				this.inLootInspect = false;
				this.inspectItem = null;
				this.gameObjectReference.ui.imenu((this.gameObjectReference.display._options.width / 2) - 20, 4, 40, 12, "Loot", this.corpseInspect.loot.contents, true);
				return;
			}
			else{
				return;
			}
		}

		if(this.inInspectMenu === true){
			var ret = this.gameObjectReference.ui.handleInspectMenu(this, code, false);
			if(ret === 1){
				//end inInspectMenu
				this.inInspectMenu = false;
				this.inspectItem =  null;
				this.gameObjectReference.ui.imenu((this.gameObjectReference.display._options.width / 2)- 20, 4, 40, 12,"Inventory",this.inventory.contents, false);
				return;
			}
			else{
				return;
			}
		}

		if(this.inLootMenu === true){
			this.gameObjectReference.map._drawWholeMap();
			var ret = this.gameObjectReference.ui.menuHandler(code);
			if(ret === -1){
				this.inLootMenu = false;
				this.gameObjectReference.map._drawWholeMap();
				var index = this.gameObjectReference.map.corpses.indexOf(this.corpseInspect);
				this.gameObjectReference.map.corpses.splice(index, 1); //remove the corpse from the array
				this.gameObjectReference.map._drawAllEntities();
				return;
			}
			else if(ret > 0){
				ret -= 1;
				this.inLootInspect = true;
				this.inspectItem = this.corpseInspect.loot.contents[ret];
				this.gameObjectReference.map._drawWholeMap();
				this.gameObjectReference.ui.insMenu((this.gameObjectReference.display._options.width /2 ) - 10, 4, 20,  12, this.inspectItem, true);
				return;
			}
			else{
				return;
			}
		}

		if(this.inInventoryMenu === true){
			this.gameObjectReference.map._drawWholeMap();
			var ret = this.gameObjectReference.ui.menuHandler(code);
			//console.log("ret:" + ret);
			//console.log(ret);
			if (ret === -1){
				this.inInventoryMenu = false;
				this.gameObjectReference.map._drawWholeMap();
				this.gameObjectReference.map._drawAllEntities();			
				return;
			}
			else if(ret > 0){
				//console.log("hey");
				ret -= 1; //account for manual offset from menuHandler
				this.inInspectMenu = true;
				//console.log(this.inventory.contents);
				//console.log("ret: " + ret);
				this.inspectItem = this.inventory.contents[ret];
				//console.log(this.inspectItem);
				this.gameObjectReference.map._drawWholeMap();
				this.gameObjectReference.ui.insMenu((this.gameObjectReference.display._options.width / 2) - 10, 4, 20, 12,this.inspectItem,false); //loot is false here
				//this.gameObjectReference.ui.ins
				return;
			}
			else{
				return;
			}
		}

		if(code === 73){ //this is the keycode for "I"
			this.gameObjectReference.ui.imenu((this.gameObjectReference.display._options.width / 2)- 20, 4, 40, 12,"Inventory",this.inventory.contents, false);
			this.inInventoryMenu = true;
		}
		else if(code === 87){//TODO: Maybe consider a better mapping for this. Current mapping is "W"

			//possibly controversial?
			var restBenefits = {"HP": 1}; //gain 1 HP on rest.  Maybe too powerful for current build?  (Need wandering monsters/events to affect this)
			this.modifyStats(restBenefits);
			//possibly controversial?
			window.removeEventListener("keydown",this.handleEvent);  //this is important!
			this.gameObjectReference.engine.unlock();
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

		if(!(newKey in this.gameObjectReference.map.currMap) || (this.gameObjectReference.map.currMap[newKey] === "#")){
			return;
		}//can't move in this direction
		else if(this.gameObjectReference.map.currMap[newKey] === "V"){ //"⚞"){
			//this.gameObjectReference.map.floor += 1;
			if(this.gameObjectReference.map.floor < 30){
				//this.gameObjectReference._generateMapDeeper();
				//TODO: add call to change the floor the player is on to descend

				this.gameObjectReference.map._changeFloor("Down"); //this will load the floor
				window.removeEventListener("keydown",this.handleEvent);  //this is important!
				this.gameObjectReference.engine.unlock();
				// var msg = "You has descend to floor " + this.gameObjectReference.floor + "!";
				// this.gameObjectReference.ui.updateClog(msg, "white");
				return;
			}
		}
		else if(this.gameObjectReference.map.currMap[newKey] === "^"){// "⚟"){
			this.gameObjectReference.map._changeFloor("Up");
			window.removeEventListener("keydown",this.handleEvent);  //this is important!
			this.gameObjectReference.engine.unlock();
			return;
		}
		else if(this.gameObjectReference.map.monstersAlive.length > 0){
			for(var i=0; i<this.gameObjectReference.map.monstersAlive.length; i++){
				if(newX === this.gameObjectReference.map.monstersAlive[i]._x && newY === this.gameObjectReference.map.monstersAlive[i]._y){
					//fight this one!
					this.fight(this.gameObjectReference.map.monstersAlive[i]);
					window.removeEventListener("keydown",this.handleEvent);  //this is important!
					this.gameObjectReference.engine.unlock();
					return;
				}
			}
		}

		if(this.gameObjectReference.map.corpses.length > 0){
			for(var i=0; i<this.gameObjectReference.map.corpses.length; i++){
				if(newX === this.gameObjectReference.map.corpses[i]._x && newY === this.gameObjectReference.map.corpses[i]._y){
					this.corpseInspect = this.gameObjectReference.map.corpses[i];
					this.inLootMenu = true;
					//console.log("game corpses:");
					//console.log(this.gameObjectReference.corpses);
					this.gameObjectReference.ui.imenu((this.gameObjectReference.display._options.width / 2)- 20, 4, 40, 12,"Inventory",this.gameObjectReference.map.corpses[i].loot.contents, true);
					return;
				}
			}
		}


		this.gameObjectReference.display.draw(this._x, this._y, this.gameObjectReference.map[this._x+","+this._y]);
		this._x = newX;
		this._y = newY;
		this._draw();
		window.removeEventListener("keydown",this.handleEvent);  //this is important!
		//console.log("before unlock");
		this.gameObjectReference.engine.unlock(); //also, so is this!
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
		this.gameObjectReference.ui.updateClog(msg,"red");
		if(this.HP < 1){
			this.doDeath();
		}
		//console.log("Player HP:" + this.HP);
	}

	doDeath(){
		this.isDead = true;
	}


}
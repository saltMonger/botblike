import ROT from "../rot.js";
import Actor from "./actor.js";
import Inventory from "./containers/inventory.js";
import Equipment from "./containers/equipment.js";

import Weapon from "../items/weapon.js";
import Consumable from "../items/consumable.js";

//player object layout:
//STATS: object contains all stats related to the player <== this should be broken into a stat block object somewhere
//this will be extended later to hold a SKILLS object

export default class Player extends Actor{
	constructor(name,x,y,isLoadingFromSave, gameObjectReference){
		super(name,x,y);

		//set handle so that main game loop, enemies, containers, etc. can target player, and vice-versa
		this.gameObjectReference = gameObjectReference;

		if(isLoadingFromSave){
			//TODO: implement player save/restore
			//get_player_save
		}
		else{
			//generate stat block

			//generate starting equipment

			//generate all skills
			this.generateStatBlockFirstTime();
		}
		this.inventory = new Inventory(this.Strength, this);
		this.equipment = new Equipment(this);
		

		//note, this generates debug equipment and inventory
		//this should be adapted at some point to provide a starter weapon based on class
		//==============================================================================
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
		//==============================================================================
		
		//MENU HANDLER VALUES==========================
		//=============================================
		this.inInventoryMenu = false;
		this.inInspectMenu = false;
		this.inLootMenu = false;


		this.inLootMenu = false;
		this.inLootInspect = false;
		this.inspectItem = 0;
		this.corpseInspect = -1;
		//=============================================

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
		this.Strength = Math.abs(Math.floor(ROT.RNG.getNormal(0,1)*10)); //get a normal distribution
		this.Dexterity = Math.abs(Math.floor(ROT.RNG.getNormal(0,1)*10));
		this.Constitution = Math.abs(Math.floor(ROT.RNG.getNormal(0,1)*10));
		this.Intelligence = Math.abs(Math.floor(ROT.RNG.getNormal(0,1)*10));
		this.Wisdom = Math.abs(Math.floor(ROT.RNG.getNormal(0,1)*10));

		//DEBUG
		this.Balance = 1;
		//DEBUG

		this.HitChance = Math.floor(this.Dexterity / 2);
		this.Evasion = Math.floor(this.Dexterity / 2);
		this.Attack = Math.floor(this.Strength / 2);
		this.MagicAttack = Math.floor(this.Intelligence / 2);
		this.Defense = Math.floor(this.Constitution / 10);
		this.MagicDefense = Math.floor(this.Wisdom/10);
		//REAL		
		//this.HP = Math.floor(5 + this.Constitution / (1.2));
		//DEBUG:
		this.MAXHP = 10 + Math.floor(this.Constitution / 2);
		this.HP = this.MAXHP;
		this.MP = Math.floor(this.Intelligence * this.Wisdom * 4);
		this.HealingPower = Math.floor(this.Wisdom/2);
		
		this.isDead = false;
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

	//TODO: setup a more generic handler that can use any property in the stat block
	//without having to do a comparison
	modifyStats(effects){
		for(var property in effects){
			if(property === "HP"){
				this.HP += parseInt(effects[property]);
				var hpHealed = parseInt(effects[property]);
				if(this.HP > this.MAXHP){
					this.HP = this.MAXHP;
				}
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
		this.Strength = Math.floor(ROT.RNG.getUniform() * 5) + parseInt(this.Strength);
		this.Dexterity = Math.floor(ROT.RNG.getUniform() * 5) + parseInt(this.Dexterity);
		this.Constitution = Math.floor(ROT.RNG.getUniform() * 5) + parseInt(this.Constitution);
		this.Intelligence = Math.floor(ROT.RNG.getUniform() * 5) + parseInt(this.Intelligence);
		this.Wisdom = Math.floor(ROT.RNG.getUniform() * 5) + parseInt(this.Wisdom);

		this.HitChance = Math.floor(this.Dexterity / 2);
		this.Evasion = Math.floor(this.Dexterity / 2)
		this.Attack = Math.floor(this.Strength / 2);
		this.MagicAttack = Math.floor(this.Intelligence / 2);
		this.Defense = Math.floor(this.Constitution / 10);
		this.MagicDefense = Math.floor(this.Wisdom/10);

		this.MAXHP = Math.floor(this.Constitution / 2) + parseInt(this.Strength);
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

	//TODO: This will likely require a rewrite, espcially if the windowing/ui system is updated
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
			this.gameObjectReference.ui.charMenu((this.gameObjectReference.display._options.width / 2) - 20, 4,20,20,this.name,new displayStats(this.Strength, this.Dexterity, this.Constitution,
																this.Intelligence, this.Wisdom, this.Atk, this.HitChance, this.Evasion,
															this.Attack, this.MagicAttack, this.Defense, this.MagicDefense).Stats);
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
			if (ret === -1){
				this.inInventoryMenu = false;
				this.gameObjectReference.map._drawWholeMap();
				this.gameObjectReference.map._drawAllEntities();			
				return;
			}
			else if(ret > 0){
				ret -= 1; //account for manual offset from menuHandler
				this.inInspectMenu = true;
				this.inspectItem = this.inventory.contents[ret];
				this.gameObjectReference.map._drawWholeMap();
				this.gameObjectReference.ui.insMenu((this.gameObjectReference.display._options.width / 2) - 10, 4, 20, 12,this.inspectItem,false); //loot is false here
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
		//console.log("regular atk: " + this.Attack);
		var dmgOutput = parseInt(this.Attack) + parseInt(this.equipment.weapon.atk); // FOR LATER: this.equipment.weapon.ATK;
		//console.log("player fighting" + dmgOutput);
		target.takeDamage(dmgOutput,"PHYS");
		//console.log(target);
	}


	takeDamage(dmginput,type,enemyName){
		//console.log("taking damage");
		var dmgtaken = 0;
		var msg = "";
		if(type === "PHYS"){
			dmgtaken = Math.floor(dmginput - (dmginput * (this.Defense/100)));
			if(dmgtaken < 1){
				dmgtaken = 1;
			}
			msg = this.name + " takes " + dmgtaken + " damage from " + enemyName;
		}
		else{
			dmgtaken = Math.floor(dmginput * (dmginput * (this.MagicDefense/100)));
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
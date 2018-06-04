export default class Actor{
	constructor(name,x,y, gameObject){
		this.name = name;
		this._x = x;
		this._y = y;

		this.gameObjectReference = gameObject;
	}

	//todo: extend statblock to include skills in skill update
	statBlock = {
		//base stats
		Strength: 0,
		Dexterity: 0,
		Constitution: 0,
		Intelligence: 0,
		Wisdom: 0,
		//derived stats
		HitChance: 0,
		Evasion: 0,
		Attack: 0,
		MagicAttack: 0,
		Defense: 0,
		MagicDefense: 0,
		HealingPower: 0,
		//resource stats
		HP: 0,
		MP: 0,
		MAXHP: 0,
	}




	//map movement

	move(nx,ny){
		this._x = nx;
		this._y = ny;
	}


	//NOTE: This will need to be extended/rewritten when skills/damage types are introduced
	//inheriting from fight will allow enemy actors to fight one another, making more dynamic combat

	//usage: called during act-phase of an actor, 
	fight(target){
		var dmgOutput = parseInt(this.statBlock.Attack) + parseInt(this.equipment.weapon.Attack);
		target.takeDamage(dmgOutput, "PHYS");
	}

	takeDamage(dmginput, type, enemy, updateColor){
		var dmgTaken = 0;
		var msg = '';
		if(type === "PHYS"){
			dmgTaken = Math.floor(dmginput - (dmginput * (this.statBlock.Defense / 100)));
			if (dmgTaken < 1){
				dmgTaken = 1;
			}
			msg = this.name + " takes " + dmgtaken + " damage from " + enemyName;
		}
		else{
			dmgtaken = Math.floor(dmginput * (dmginput * (this.statBlock.MagicDefense/100)));
			if(dmgtaken < 1){
				dmgtaken = 1;
			}
			msg = this.name + " takes " + dmgtaken + " damage from " + enemyName;
		}
		this.HP -= dmgtaken;
		this.gameObjectReference.ui.updateClog(msg, updateColor);
		if(this.HP < 1){
			this.doDeath();
		}
	}

	doDeath(){
		this.isDead = true;
	}

}

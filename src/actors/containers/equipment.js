export default class Equipment{
	constructor(pTarget){
		this.target = pTarget;
		this.weapon = null;
		this.armor = null;
	}
	
	//this does an unequip/equip
	//removes newly equipped item from inventory, and returns previously equipped item
	//recalculates stats
	equip(type,item){
		if(type === "weap"){
			this.target.inventory.addItem(this.weapon);
			this.weapon = null;
			this.weapon = item;
			this.target.inventory.removeItem(item);
		}
		else
		{
			this.target.inventory.addItem(this.armor);
			this.armor = null;
			this.armor = item;
			this.target.inventory.removeItem(item);
		}
	}
	
	debugEquip(type, item){
		if(type === "weap"){
			this.weapon = item;
		}
		else{
			this.armor = item;
		}
	}
}
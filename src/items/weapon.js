import Item from "./item.js";

export default class Weapon extends Item {
	constructor(name,weight,value,atk,bal){
		super(name,weight,value);
		this.atk = atk;
		this.bal = bal;
	}
}
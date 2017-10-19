import Item from "./item.js";

export default class Consumable extends Item {
	constructor(name,weight,value, effects){
		super(name,weight,value);
		this.effects = effects;
	}
}
export default class Inventory {
	constructor(STR, pTarget){
		this.gold = 0;
		this.contents = [];
		this.weightLimit = Math.floor(STR * 10);
		this.weight = 0; //current weight
		this.target = pTarget;
	}


	
	addItem(item){
		this.contents.push(item);
		this.weight += item._weight;
	}

	removeItem(item){
		var index = this.contents.indexOf(item);
		this.contents.splice(index, 1); //drop from item array
		this.weight -= item._weight;
	}

	equipItem(item){
		var ty = item.constructor.name;
		if(ty === "Weapon"){
			this.target.equipment.equip("weap", item);
		}
		else if(ty === "Armor"){
			this.target.equipment.equip("ARMOR", item);
		}
	}

	
	loadFromFile(loadString){
		var lines = loadString.split("\n");
		lines.foreach(function(line){
			item = line.split("/"); //name type weight value desc stats
			switch(item[1]){
				case "food": var stats = item[5].split(","); //targetType target time effects
					var effects = stats[3].split(";");
					var food = new Food(item[0],item[2],item[3],stats[0],stats[1],effects,stats[2]); //this will need updated
					this.contents.push(food);
					this.weight += food._weight;
					break;
				default:
					break;
			}
		});
	}
}
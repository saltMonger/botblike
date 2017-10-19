export default class Corpse {
	constructor(name, x, y, inventory, gameRef){
		this._name = name;
		this._x = x;
		this._y = y;
		this.loot = inventory;
		this.Game = gameRef;

		this._drawCorpse;
	}

	removeCorpse(){
		delete this._name;
		delete this._x;
		delete this._y;
		delete this.loot;

		delete this;
	}


	_drawCorpse(){
		this.Game.display.draw(this._x, this._y, "X", "#8f0");
	}
}
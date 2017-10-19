export default class Actor{
	constructor(name,x,y){
		this.name = name;
		this._x = x;
		this._y = y;
	}

	move(nx,ny){
		this._x = nx;
		this._y = ny;
	}
}
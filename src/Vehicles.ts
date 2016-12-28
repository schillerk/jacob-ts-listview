"use strict";

interface Vehicle {
	speed:number,
	model:string
}

interface WheeledVehicle extends Vehicle {
	wheels:number
}


class EarthVehicle implements Vehicle {
	speed:number
	model:string

	constructor(speed:number, model:string) {
		this.speed=speed
		this.model=model
	}

	toString() : string {
		return "The vehicle is a " + this.model + " with speed " + this.speed; 
	}
}

class Car extends EarthVehicle implements WheeledVehicle {
	wheels:number

	constructor(speed:number, model:string, wheels:number=4) {
		super(speed,model)
		this.wheels=wheels
	}

	toString() : string {
		return "The car is a " + this.model + " with speed " + this.speed + " and " + this.wheels + " wheels"; 
	}
}

class Formula1 extends Car {
	private spoilerTilt:number=0

	constructor(speed:number, model:string) {
		super(speed,model,4)
		0
	}

	tiltSpoiler(angle:number) : void {
		this.spoilerTilt=angle
	}

	toString() : string {
		return super.toString() + " spoiler angle: " + this.spoilerTilt; 
	}

}

// function vToS(v: Vehicle) : string {
//     return "The vehicle is a " + v.model + " with speed " + v.speed;
// }

// var v = {speed:100, model: "ford freestar"};

var c = new Car(200,"lexus");

var d = new EarthVehicle(20,"destroyer boat");

var f = new Formula1(400,"lotus") 
f.tiltSpoiler(3)
// console.log(f.spoilerTilt)
console.log(c.toString())
console.log(d.toString())
console.log(f.toString())

// document.body.innerHTML = vToS(v);


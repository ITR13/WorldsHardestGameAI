class Player{
	constructor(){
		this.pos = createVector(3*tileSize + xoff,4* tileSize + yoff);
		this.vel = createVector(0,0);
		this.size = tileSize/2.0;
		this.playerSpeed = tileSize/15.0;
		this.dead = false;
		this.reachedGoal = false;
		this.fadeCounter = 255;
		this.isBest = false;
		this.deathByDot = false;
		this.deathAtStep = 0;
		this.moveCount = 0;
		this.gen =1;
		this.fitness = 0;
		this.nodes = [];
		this.fading = false;
		this.brain = new Brain(numberOfSteps);
		this.human = false;
		this.setNodes();
		
		this.deathAtPos = createVector(0,0)
	}

	setNodes() {
		this.nodes[0] = new Node(tiles[6][7]);
		this.nodes[1] = new Node(tiles[17][2]);
		this.nodes[0].setDistanceToFinish(this.nodes[1]);
	}

	show(){
		fill(255, 0, 0, this.fadeCounter);
		if (this.isBest && !showBest) {
			fill(0, 255, 0, this.fadeCounter);
		}
		stroke(0, 0, 0, this.fadeCounter);
		strokeWeight(4);
		rect(this.pos.x, this.pos.y, this.size, this.size);
		stroke(0);
	}

	move(){
		if (!humanPlaying){
			if (this.moveCount == 0) {//move in the direction for 6 frames
				if (this.brain.directions.length > this.brain.step) {//if there are still directions left then set the velocity as the next PVector in the direcitons array
					this.vel = this.brain.directions[this.brain.step];
					this.brain.step++;
				} else {//if at the end of the directions array then the player is dead
					this.dead = true;
					this.fading = true;
				}
				this.moveCount =6;
			} else {
				this.moveCount--;
			}
		}
		var temp = createVector(this.vel.x, this.vel.y);
		temp.normalize();
		temp.mult(this.playerSpeed);
		for (var i = 0; i< solids.length; i++) {
			temp = solids[i].restrictMovement(this.pos, createVector(this.pos.x+this.size, this.pos.y+this.size), temp);
		}
		this.pos.add(temp);

	}

	//checks if the player
	checkCollisions() {
		for (var i = 0; i< dots.length; i++) {
			if (dots[i].collides(this.pos, createVector(this.pos.x+this.size, this.pos.y+this.size))) {
				this.fading = true;
				this.dead = true;
				this.deathByDot = true;
				this.deathAtStep = this.brain.step;
			}
		}
		if (winArea.collision(this.pos, createVector(this.pos.x+this.size, this.pos.y+this.size))) {
			this.reachedGoal = true;
		}
		for (var i = 0; i< this.nodes.length; i++) {
			this.nodes[i].collision(this.pos, createVector(this.pos.x+this.size, this.pos.y+this.size));
		}
	}
//----------------------------------------------------------------------------------------------------------------------------------------------------------
	update() {
		if (!this.dead && !this.reachedGoal) {
			this.move();
			this.checkCollisions();
		} else if (this.fading) {
			if (this.fadeCounter > 0) {
				if(humanPlaying || replayGens){
					this.fadeCounter -=10;
				}else{
					this.fadeCounter = 0;
				}
			}
		}
	}
//----------------------------------------------------------------------------------------------------------------------------------------------------------

	calculateFitness(deathPosition) {
		if (this.reachedGoal) {//if the dot reached the goal then the fitness is based on the amount of steps it took to get there
			this.fitness = 1000 + 10000.0/(this.brain.step * this.brain.step);
			this.fitness *= this.fitness;
		} else {//if the dot didn't reach the goal then the fitness is based on how novel it is
			this.fitness = 1000;
			this.deathAtPos = createVector(this.pos.x,this.pos.y)
			for (var i = 0; i<deathPosition.length; i++){
				var x = deathPosition[i].x-this.deathAtPos.x;
				var y = deathPosition[i].y-this.deathAtPos.y;
				var fitness = x*x+y*y;
				if (this.fitness>fitness) {
					this.fitness = fitness;
				}
			}
		}
	}



//----------------------------------------------------------------------------------------------------------------------------------------------------------
	gimmeBaby() {
		var baby = new Player();
		baby.brain = this.brain.clone();//babies have the same brain as their parents
		baby.deathByDot = this.deathByDot;
		baby.deathAtStep = this.deathAtStep;
		baby.gen = this.gen;
		return baby;
	}
}

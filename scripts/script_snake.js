/*********************************************/
/** Snake (jogo da cobrinha)                **/
/** Desenvolvido por Emerson Luiz de Castro **/
/** www.emersonluiz.com.br                  **/
/** contato@emersonluiz.com.br              **/
/*********************************************/

var exec = null;
	var Cobra = {
		canvas:document.getElementById("Cenario"),
		w:420,
		h:420,
		points:0,
		coordXY:[17,45,73,101,129,157,185,213,241,269,297,325,353,381], // cordenadas possiveis da comida

		init:function(){
			/** Metodo que inicia o jogo **/
			if (Cobra.canvas.getContext){
				Cobra.context = Cobra.canvas.getContext("2d");
				Cobra.speed=500;
				Cobra.position="right";
				Cobra.cauda=new Array({"x":28,"y":28,"xa":28,"ya":28});
				Cobra.eatX=0;
				Cobra.eatY=0;
				Cobra.bombX=0;
				Cobra.bombY=0;
				Cobra.coinX=-30;
				Cobra.coinY=-30;
				Cobra.times=0;
				Cobra.timeCoin=0;
				Cobra.points=0;
				Cobra.multi=50;

				document.getElementById("DIVMascara").style.display = "none";
				document.getElementById("SPNPontos").innerHTML = Cobra.points;
				
				Cobra.scenario();
				Cobra.record();
				Cobra.execute();
			}else{
				document.getElementById("jogo").innerHTML = "<h1>Desculpe, seu browser não aceita HTML5.</h1>"
			}
		},

		execute:function(){
			/** Metodo que dispara a funcao que desenha o jogo na velocidade atual **/
			exec = setInterval(Cobra.draw,Cobra.speed);
		},

		record:function(){
			/** Metodo que ira informar o recorde do jogador **/
			var LS = localStorage; 
			if (LS.getItem("recorde") && (LS.getItem("recorde") != "undefined")){
				if (LS.getItem("recorde") < Cobra.points){
					LS.setItem("recorde", Cobra.points);
					document.getElementById("SPNMAXPontos").innerHTML = LS.getItem("recorde");
				}else{
					document.getElementById("SPNMAXPontos").innerHTML = LS.getItem("recorde");
				}
			}else{
				LS.setItem("recorde", Cobra.points);
				document.getElementById("SPNMAXPontos").innerHTML = LS.getItem("recorde");
			}
		},

		scenario:function(){
			/** Metodo que desenha o cenari do jogo **/
			Cobra.context.clearRect(0,0,Cobra.w,Cobra.h);

			Cobra.context.beginPath();
			Cobra.context.rect(0,0,12,420);
			Cobra.context.fillStyle = "rgb(189,183,107)";
			Cobra.context.fill();
			Cobra.context.closePath();

			Cobra.context.beginPath();
			Cobra.context.rect(408,0,12,420);
			Cobra.context.fillStyle = "rgb(189,183,107)";
			Cobra.context.fill();
			Cobra.context.closePath();

			Cobra.context.beginPath();
			Cobra.context.rect(0,0,420,12);
			Cobra.context.fillStyle = "rgb(189,183,107)";
			Cobra.context.fill();
			Cobra.context.closePath();

			Cobra.context.beginPath();
			Cobra.context.rect(0,408,420,12);
			Cobra.context.fillStyle = "rgb(189,183,107)";
			Cobra.context.fill();
			Cobra.context.closePath();

		},

		draw:function(){
			/** Metodo que desenha a cobra e seus movimentos **/
			var steps = Cobra.direction();
			if(steps){
				Cobra.scenario();

				Cobra.eat();
				Cobra.bomb();
				Cobra.setTimes();
				Cobra.setCoin();

				Cobra.context.beginPath();
				Cobra.context.arc(Cobra.cauda[0].x,Cobra.cauda[0].y,14,0,Math.PI*2,true);
				Cobra.context.fillStyle = "#7FFF00";
				Cobra.context.fill();
				Cobra.context.closePath();

				for (var i=1; i<Cobra.cauda.length; i++){
					Cobra.context.beginPath();
					Cobra.context.arc(Cobra.cauda[i].x,Cobra.cauda[i].y,14,0,Math.PI*2,true);
					Cobra.context.fillStyle = "#90EE90";
					Cobra.context.fill();
					Cobra.context.closePath();
				}

				Cobra.findEat();
				Cobra.findBomb();
				Cobra.findCoin();
			}
		},

		findEat:function(){
			/** Metodo que localiza a posicao da comida em relacao a cobra **/
			if (Cobra.coordXY[(Cobra.cauda[0].x/28)-1] == Cobra.eatX && Cobra.coordXY[(Cobra.cauda[0].y/28)-1] == Cobra.eatY){
				Cobra.eatX = 0;
				Cobra.eatY = 0;
				Cobra.set(Cobra.cauda[Cobra.cauda.length-1].xa-28, Cobra.cauda[Cobra.cauda.length-1].ya);
				Cobra.bombX = 0;
				Cobra.bombY = 0;
				Cobra.points += 30;
				Cobra.viewPoints();
			}
		},

		findBomb:function(){
			/** Metodo que localiza a posicao da bomba em relacao a cobra **/
			if (Cobra.coordXY[(Cobra.cauda[0].x/28)-1] == Cobra.bombX && Cobra.coordXY[(Cobra.cauda[0].y/28)-1] == Cobra.bombY){
				Cobra.bombX = 0;
				Cobra.bombY = 0;
				Cobra.points -= 100;
				Cobra.over();
				Cobra.viewPoints();
			}
		},

		findCoin:function(){
			/** Metodo que localiza a posicao da moeda em relacao a cobra **/
			if (Cobra.coordXY[(Cobra.cauda[0].x/28)-1] == Cobra.coinX && Cobra.coordXY[(Cobra.cauda[0].y/28)-1] == Cobra.coinY){
				Cobra.coinX = -30;
				Cobra.coinY = -30;
				Cobra.timeCoin = 0;
				Cobra.points += 50; 
				Cobra.viewPoints();
			}
		},

		viewPoints:function(){
			/** Metodo que ira mostrar os pontos conquistados **/
			document.getElementById("SPNPontos").innerHTML = Cobra.points;
			Cobra.record();
		},

		meet:function(){
			/** Metodo que verifica se a cabeca da cobra tocou sem proprio corpo **/
			for (var i=1; i<Cobra.cauda.length; i++){
				if (Cobra.cauda[i].x == Cobra.cauda[0].x && Cobra.cauda[i].y == Cobra.cauda[0].y){
					Cobra.over();
					return true;
				}				
			}
			return false;
		},

		eat:function(){
			/** Metodo que ira criar a comida em algum lugar do cenario **/
			if (Cobra.eatX == 0 && Cobra.eatY == 0){
				var verif;
				
				do{
					verif = false;
					Cobra.eatX = Cobra.coordXY[Math.floor(Math.random()*14)];					
					Cobra.eatY = Cobra.coordXY[Math.floor(Math.random()*14)];
					if ((Cobra.eatX > 381) || (Cobra.eatX < 17) || (Cobra.eatY > 381) || (Cobra.eatY < 17)){
						verif = true;
					}
					if ((Cobra.bombX == Cobra.eatX) && (Cobra.bombY == Cobra.eatY)){
						verif = true;
					}
					if ((Cobra.coinX == Cobra.eatX) && (Cobra.coinY == Cobra.eatY)){
						verif = true;
					}
					if (!verif){
						for (var i=0; i<Cobra.cauda.length; i++){
							if (Cobra.coordXY[(Cobra.cauda[i].x/28)-1] == Cobra.eatX && Cobra.coordXY[(Cobra.cauda[i].y/28)-1] == Cobra.eatY){
								verif = true;
								break;
							}
						}
					}
				}while(verif);
			}
			
			var image = document.getElementById("mySheep");
			Cobra.context.drawImage(image, Cobra.eatX, Cobra.eatY, 24, 23);
			
		},

		bomb:function(){
			/** Metodo que ira criar a bomba em algum lugar do cenario **/
			if (Cobra.bombX== 0 && Cobra.bombY == 0){
				var verif;
				
				do{
					verif = false;
					Cobra.bombX = Cobra.coordXY[Math.floor(Math.random()*14)];					
					Cobra.bombY = Cobra.coordXY[Math.floor(Math.random()*14)];
					if ((Cobra.bombX > 381) || (Cobra.bombX < 17) || (Cobra.bombY > 381) || (Cobra.bombY < 17)){
						verif = true;
					}
					if ((Cobra.bombX == Cobra.eatX) && (Cobra.bombY == Cobra.eatY)){
						verif = true;
					}
					if ((Cobra.bombX == Cobra.coinX) && (Cobra.bombY == Cobra.coinY)){
						verif = true;
					}
					if (!verif){
						for (var i=0; i<Cobra.cauda.length; i++){
							if (Cobra.coordXY[(Cobra.cauda[i].x/28)-1] == Cobra.bombX && Cobra.coordXY[(Cobra.cauda[i].y/28)-1] == Cobra.bombY){
								verif = true;
								break;
							}
						}
					}
				}while(verif);
			}
			
			var image = document.getElementById("mySheep1");
			Cobra.context.drawImage(image, Cobra.bombX, Cobra.bombY, 24, 23);
		},

		setCoin:function(){
			/** Metodo que ira criar ou destruir a moeda, de acordo com o escopo do tempo **/
			if (Cobra.timeCoin >= 15000){
				Cobra.timeCoin = 0;
				Cobra.coinX = 0;
				Cobra.coinY = 0;
			}
			if (Cobra.coinX != -30 && Cobra.coinY != -30){
				if (Cobra.timeCoin > 6000){
					Cobra.coinX = -30;
					Cobra.coinY = -30;
					Cobra.timeCoin = 0;
				}
			}
			Cobra.timeCoin += Cobra.speed;
			Cobra.coin();
		},

		coin:function(){
			/** Metodo que ira criar a moeda em algum lugar do cenario **/
			if (Cobra.coinX == 0 && Cobra.coinY == 0){
				var verif;
				
				do{
					verif = false;
					Cobra.coinX = Cobra.coordXY[Math.floor(Math.random()*14)];					
					Cobra.coinY = Cobra.coordXY[Math.floor(Math.random()*14)];
					if ((Cobra.coinX > 381) || (Cobra.coinX < 17) || (Cobra.coinY > 381) || (Cobra.coinY < 17)){
						verif = true;
					}
					if ((Cobra.coinX == Cobra.eatX) && (Cobra.coinY == Cobra.eatY)){
						verif = true;
					}
					if ((Cobra.bombX == Cobra.coinX) && (Cobra.bombY == Cobra.coinY)){
						verif = true;
					}
					if (!verif){
						for (var i=0; i<Cobra.cauda.length; i++){
							if (Cobra.coordXY[(Cobra.cauda[i].x/28)-1] == Cobra.coinX && Cobra.coordXY[(Cobra.cauda[i].y/28)-1] == Cobra.coinY){
								verif = true;
								break;
							}
						}
					}
				}while(verif);
			}
			
			var image = document.getElementById("mySheep2");
			Cobra.context.drawImage(image, Cobra.coinX, Cobra.coinY, 24, 23);
		},

		over:function(){
			/** Metodo que ira finalizar o jogo **/
			clearInterval(exec);
			Cobra.record();
			document.getElementById("DIVMascara").style.display = "block";
			document.getElementById("SPNFinalPontos").innerHTML = "Score: " + Cobra.points;
			document.getElementById("DIVGameOver").style.display = "block";

		},

		start:function(){
			/** Metodo que ira criar a tela inicial do jogo **/
			Cobra.context = Cobra.canvas.getContext("2d");
			Cobra.scenario();
			Cobra.record();
			document.getElementById("DIVMascara").style.display = "block";

		},

		setTimes:function(){
			/** Metodo que ira verificar e aumentar a velocidade do jogo **/
			Cobra.times += Cobra.speed;

			if (Cobra.times == (Cobra.speed * Cobra.multi)){
				Cobra.times = 0;
				Cobra.speed -= 50;
				Cobra.multi += 40;
				clearInterval(exec);
				Cobra.execute();
			}
		},

		set:function(pX, pY){
			/** Metodo que ira aumentar o corpo da cobra **/
			Cobra.cauda.push({"x":pX, "y":pY, "xa":pX, "ya":pY});
		},

		direction:function(){
			/** Metodo que ira verificar a posicao e mudar a trajetoria da cobra se necessario **/
			var stop = false;
			switch(Cobra.position){
				case "right":
					if (Cobra.cauda[0].x < (Cobra.w-28)){
						Cobra.cauda[0].xa = Cobra.cauda[0].x;
						Cobra.cauda[0].ya = Cobra.cauda[0].y;
						Cobra.cauda[0].x += 28;
					}else{
						Cobra.over();
						stop = true;
					}
					break;
				case "left":
					if (Cobra.cauda[0].x > 28){
						Cobra.cauda[0].xa = Cobra.cauda[0].x;
						Cobra.cauda[0].ya = Cobra.cauda[0].y;
						Cobra.cauda[0].x -= 28;
					}else{
						Cobra.over();
						stop = true;					}
					break;
				case "top":
					if (Cobra.cauda[0].y > 28){
						Cobra.cauda[0].ya = Cobra.cauda[0].y;
						Cobra.cauda[0].xa = Cobra.cauda[0].x;
						Cobra.cauda[0].y -= 28;
					}else{
						Cobra.over();
						stop = true;
					}
					break;
				case "bottom":
					if (Cobra.cauda[0].y < (Cobra.h-28)){
						Cobra.cauda[0].ya = Cobra.cauda[0].y;
						Cobra.cauda[0].xa = Cobra.cauda[0].x;
						Cobra.cauda[0].y += 28;
						
					}else{
						Cobra.over();
						stop = true;
					}
					break;
			}

			var stopMeet = Cobra.meet();
			
			if(!stop && !stopMeet){
				for (var i=1; i<Cobra.cauda.length; i++){
					Cobra.cauda[i].xa = Cobra.cauda[i].x;
					Cobra.cauda[i].x = Cobra.cauda[i-1].xa;
					Cobra.cauda[i].ya = Cobra.cauda[i].y;
					Cobra.cauda[i].y = Cobra.cauda[i-1].ya;
					
				}
			}else{
				return false;
			}

			return true;
		}
	}

function teclas(e){
	/** Funcao que captura o comando do usuario e informa ao jogo **/
	if(e.keyCode==37){
		Cobra.position = "left";
	}

	if(e.keyCode==39){
		Cobra.position = "right";
	}

	if(e.keyCode==38){
		Cobra.position = "top";
	}

	if(e.keyCode==40){
		Cobra.position = "bottom";
	}
}

//Chris Xiong 2017
//The MIT License
var dimpx,dimx,dimy,cc,firstclick;
var boardn=null;
var boards=null;
var boarde=null;
var ismobile,effects=true,multimine=false,sfxe=true;
var dead,st,solved,animating;
var dx=[-1,-1,-1, 0, 0, 1, 1, 1];
var dy=[-1, 0, 1,-1, 1,-1, 0, 1];
var classes=["one","two","three","four","five","six","seven","eight"];
var queue=[],newqueue=[],flags=[];
var mines=[],detx,dety,cmines=[],sfx=[];
function randomInt(min,max)
{
	seed*=214013;seed+=2531011;seed&=0xffffffff;
	return min+(seed^seed>>15)%(max-min+1);
}
function efxtoggle()
{
	effects=!effects;
	document.getElementById('efx').classList.toggle('off');
	document.getElementById('efx').innerHTML=effects?"On":"Off";
	for(var i=0;i<dimx;++i)
	for(var j=0;j<dimy;++j)
	if(effects)boarde[i][j].overlay.classList.add('trans');
	else boarde[i][j].overlay.classList.remove('trans');
}
function sfxtoggle()
{
	sfxe=!sfxe;
	document.getElementById('sfx').classList.toggle('off');
	document.getElementById('sfx').innerHTML=effects?"On":"Off";
}
function multiminetoggle()
{
	multimine=!multimine;
	document.getElementById('multim').classList.toggle('off');
	document.getElementById('multim').innerHTML=multimine?"On":"Off";
	gameInit();
}
function init()
{
	if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 )
	ismobile=true;
	setupevents();
	gameInit();
	document.getElementById("bsize").onchange=function(){gameInit();};
}
function playsound(s,v)
{
	if(!sfxe)return;var f=false,i;
	for(i=0;i<sfx.length;++i)if(!sfx[i])break;
	if(i==sfx.length){sfx.push(new Audio(s));}
	else sfx[i]=new Audio(s);
	sfx[i].id=i;sfx[i].volume=v?v:.5;
	sfx[i].onended=function(){sfx[this.id]=null;}
	sfx[i].play();
}
function gameInit(custx,custy,ccc)
{
	if((custx&&custx>40)||(custy&&custy>40)||(ccc&&custx&&custy&&(ccc>custx*custy-9)))
	{console.log("Are you insane?");return;}
	firstclick=true;dead=false;solved=false;for(var i=0;i<7;++i)flags[i]=cmines[i]=0;
	document.getElementById("result").style.opacity="0";
	document.getElementById("result").style.zIndex="-999";animating=false;
	for(var nd=document.getElementById("containerDiv");nd.hasChildNodes();nd.removeChild(nd.lastChild));
	if(document.getElementById("bsize").value=="1")
	{dimx=9;dimy=9;cc=10;}
	if(document.getElementById("bsize").value=="2")
	{dimx=16;dimy=16;cc=40;}
	if(document.getElementById("bsize").value=="3")
	{dimx=16;dimy=30;cc=99;}
	if(custx&&custy&&ccc){dimx=custx;dimy=custy;cc=ccc;}
	if((window.innerWidth>window.innerHeight)^(dimx<dimy))
	{var t=dimx;dimx=dimy;dimy=t;}
	updateflags();sfx=[];
	seed=Math.floor(Math.random()*2000000000);
	if(multimine)document.getElementById("st").style.display="inline-block";
	else document.getElementById("st").style.display="none";
	document.getElementById("st").classList.add("disabled");
	boardn=new Array(dimx+4);for(var i=0;i<dimx+4;++i){
		boardn[i]=new Array(dimy+4);
		for(var j=0;j<dimy+4;++j)boardn[i][j]=0;
	}
	if(window.innerWidth/dimy*dimx>window.innerHeight*0.8)
	{
		dimpx=window.innerHeight*(ismobile?0.9:0.8);
		document.getElementById("containerDiv").style.width=dimpx/dimx*dimy+"px";
		document.getElementById("containerDiv").style.height=dimpx+"px";
	}
	else
	{
		dimpx=window.innerWidth*(ismobile?0.9:0.8);
		document.getElementById("containerDiv").style.width=dimpx+"px";
		document.getElementById("containerDiv").style.height=dimpx/dimy*dimx+"px";
	}
	boards=new Array(dimx+4);for(var i=0;i<dimx+4;++i)boards[i]=new Array(dimy+4);
	boarde=new Array(dimx+4);for(var i=0;i<dimx+4;++i)boarde[i]=new Array(dimy+4);
	for(var i=0;i<dimx;++i)
	for(var j=0;j<dimy;++j)
	{
		boards[i][j]=0;
		boarde[i][j]=document.createElement('div');
		boarde[i][j].classList.add("clickable");
		boarde[i][j].style.top=(i*100/dimx)+'%';
		boarde[i][j].style.left=(j*100/dimy)+'%';
		boarde[i][j].x=i;boarde[i][j].y=j;
		boarde[i][j].style.width=(95/dimy)+"%";
		boarde[i][j].style.height=(95/dimx)+"%";
		boarde[i][j].classList.add('normal');
		
		boarde[i][j].overlay=document.createElement('div');
		boarde[i][j].overlay.classList.add("overlay");
		boarde[i][j].overlay.style.top=(i*100/dimx)+'%';
		boarde[i][j].overlay.style.left=(j*100/dimy)+'%';
		boarde[i][j].overlay.style.width=(95/dimy)+"%";
		boarde[i][j].overlay.style.height=(95/dimx)+"%";
		boarde[i][j].overlay.style.opacity="0";
		boarde[i][j].overlay.style.transform="scale(2,2)";
		if(effects)boarde[i][j].overlay.classList.add("trans");
		
		boarde[i][j].span=document.createElement('span');
		boarde[i][j].span.style.display="table-cell";
		boarde[i][j].span.style.fontWeight="bold";
		boarde[i][j].span.style.verticalAlign="middle";
		boarde[i][j].span.style.userSelect="none";
		boarde[i][j].span.classList.add("TText");
		boarde[i][j].overlay.appendChild(boarde[i][j].span);
		boarde[i][j].onclick=mclick;
		boarde[i][j].oncontextmenu=rclick;
		document.getElementById("containerDiv").appendChild(boarde[i][j]);
		document.getElementById("containerDiv").appendChild(boarde[i][j].overlay);
	}
}
function genmines(sx,sy)
{
	mines=[];var s=[];
	for(var i=0;i<dimx;++i)
	for(var j=0;j<dimy;++j)
	if(Math.abs(sx-i)>=2||Math.abs(sy-j)>=2)s.push(i*dimy+j);
	for(var i=0;i<cc;++i)
	{
		var t=randomInt(0,s.length-1);
		var v=s[t];
		var x=Math.trunc(v/dimy),y=v%dimy;
		s.splice(t,1);
		boardn[x][y]=-1;mines.push(new pair(x,y));
		if(multimine)
		{
			var rnd=randomInt(1,100);
			if(rnd>32)--boardn[x][y];
			if(rnd>57)--boardn[x][y];
			if(rnd>77)--boardn[x][y];
			if(rnd>87)--boardn[x][y];
			if(rnd>95)--boardn[x][y];
		}
		++cmines[-boardn[x][y]];
		for(var j=0;j<8;++j)
		{
			var cx=x+dx[j],cy=y+dy[j];
			if(cx>=0&&cx<dimx&&cy>=0&&cy<dimy&&boardn[cx][cy]>=0)
			boardn[cx][cy]-=boardn[x][y];
		}
	}st=new Date();updateflags();
}
function mclick(e)
{
	e.preventDefault();
	if(dead||solved||animating)return;
	var x=this.x,y=this.y;
	if(ismobile)
	{
		if(multimine)
		{if(boards[x][y]>=0)flag(x,y);}
		else{if(boards[x][y]==1)deflag(x,y);else if(boards[x][y]==0)flag(x,y);}
		if(boards[x][y]==-1)autodig(x,y);
	}
	else
	{
		if(boards[x][y]==0)dig(x,y);
		else if(boards[x][y]==-1)autodig(x,y);
		else if(multimine&&boards[x][y]>0)deflag(x,y);
	}
}
function rclick(e)
{
	e.preventDefault();
	if(dead||solved||animating)return;
	var x=this.x,y=this.y;
	if(ismobile)
	{
		if(boards[x][y]==0)dig(x,y);
		else if(multimine&&boards[x][y]>0)deflag(x,y);
	}
	else
	{
		if(multimine)
		{if(boards[x][y]>=0)flag(x,y);}
		else{if(boards[x][y]==1)deflag(x,y);else if(boards[x][y]==0)flag(x,y);}
	}
}
function checksolved()
{
	for(var i=0;i<dimx;++i)
	for(var j=0;j<dimy;++j)
	if(boardn[i][j]>=0&&boards[i][j]!=-1)return false;
	return true;
}
var pair=function(_x,_y){this.x=_x;this.y=_y;}
pair.prototype.toString=function()
{
	return this.x+","+this.y;
}
function dfs(x,y)
{
	if(boards[x][y]!=0)return;
	newqueue.push(new pair(x,y));
	boards[x][y]=-1;animating=true;bfs(1);
}
function bfs(s)
{
	q=newqueue.slice(0);newqueue=[];
	if(s)playsound('ding.ogg');
	for(var i=0;i<q.length;++i)
	{
		var x=q[i].x,y=q[i].y;
		if(boardn[x][y]<0){die(x,y);return;}
		if(boardn[x][y]>0)
		{
			boarde[x][y].span.innerHTML=boardn[x][y];
			boarde[x][y].span.classList.add(classes[(boardn[x][y]-1)%8]);
		}
		boarde[x][y].overlay.style.opacity="1";
		boarde[x][y].overlay.style.transform="scale(1,1)";
		boarde[x][y].overlay.classList.add("dug");
		if(boardn[x][y]==0)
		{
			for(var j=0;j<8;++j)
			{
				var c=new pair(x+dx[j],y+dy[j]);
				if(c.x>=0&&c.x<dimx&&c.y>=0&&c.y<dimy&&boards[c.x][c.y]==0)
				{newqueue.push(c);boards[c.x][c.y]=-1;}
			}
		}
	}
	if(newqueue.length){if(effects)setTimeout(bfs,50,1);else bfs(0);}
	else
	{
		animating=false;
		if(checksolved())
		{
			if(!multimine)
			{
				showresult(1);
			}else document.getElementById("st").classList.remove("disabled");
		}
	}
}
function dig(x,y)
{
	if(firstclick){genmines(x,y);firstclick=false;}
	if(boards[x][y]==0)dfs(x,y);
}
function autodig(x,y)
{
	if(boards[x][y]!=-1)return;
	var c=0;
	for(var i=0;i<8;++i)
	{
		var cx=x+dx[i],cy=y+dy[i];
		if(cx>=0&&cx<dimx&&cy>=0&&cy<=dimy&&boards[cx][cy]>0)c+=boards[cx][cy];
	}
	if(c==boardn[x][y])
	{
		newqueue=[];
		for(var i=0;i<8;++i)
		{
			var cx=x+dx[i],cy=y+dy[i];
			if(cx>=0&&cx<dimx&&cy>=0&&cy<=dimy)
			{
				if(multimine&&boardn[cx][cy]<0&&boards[cx][cy]!=-boardn[cx][cy])
				{die(cx,cy);return;}
				if(boards[cx][cy]==0){newqueue.push(new pair(cx,cy));boards[cx][cy]=-1;}
			}
		}
		if(newqueue.length){animating=true;bfs(1);}
	}
}
function flag(x,y)
{
	--flags[boards[x][y]];boards[x][y]++;
	if(multimine){if(boards[x][y]>6)boards[x][y]=6;boarde[x][y].span.innerHTML=boards[x][y];}
	else{if(boards[x][y]>1)boards[x][y]=1;boarde[x][y].span.innerHTML="X";}
	++flags[boards[x][y]];
	boarde[x][y].overlay.classList.add('flag');
	boarde[x][y].overlay.style.opacity="1";
	boarde[x][y].overlay.style.transform="scale(1,1)";
	updateflags();
}
function deflag(x,y)
{
	--flags[boards[x][y]];--boards[x][y];++flags[boards[x][y]];
	boarde[x][y].span.innerHTML=boards[x][y];
	if(boards[x][y]==0)
	{
		boarde[x][y].span.innerHTML="";
		boarde[x][y].classList.remove('flag');
		boarde[x][y].classList.add('normal');
		boarde[x][y].overlay.style.opacity="0";
		boarde[x][y].overlay.style.transform="scale(2,2)";
	}
	updateflags();
}
function updateflags()
{
	if(multimine)
	{
		var s="";
		for(var i=1;i<7;++i)s=s+" x"+i+" "+flags[i]+"/"+cmines[i];
		document.getElementById("mines").innerHTML=s;
	}
	else
	{document.getElementById("mines").innerHTML=flags[1]+"/"+cmines[1];}
}
function cmp(x,y)
{
	return (Math.abs(x.x-detx)+Math.abs(x.y-dety))-(Math.abs(y.x-detx)+Math.abs(y.y-dety));
}
function die(x,y)
{
	if(dead||boardn[x][y]>=0)return;
	dead=true;detx=x;dety=y;mines.sort(cmp);
	for(var i=0;i<dimx;++i)
	for(var j=0;j<dimy;++j)
	if(boards[i][j]>0&&boards[i][j]!=-boardn[i][j]&&(i!=x||j!=y))
	{
		boarde[i][j].overlay.classList.remove('flag');
		boarde[i][j].overlay.classList.add('flagw');
		boarde[i][j].span.innerHTML="<s>"+boarde[i][j].span.innerHTML+"</s>";
	}
	boarde[x][y].overlay.classList.add('detonated');
	boarde[x][y].overlay.classList.remove('flag');
	boarde[x][y].overlay.style.opacity="1";
	boarde[x][y].overlay.style.transform="scale(1,1)";
	if(multimine)
	{
		if(-boardn[x][y]!=boards[x][y]&&boards[x][y]>0)
		boarde[x][y].span.innerHTML="<s>"+boards[x][y]+"</s>"+(boardn[x][y]<0?-boardn[x][y]:"");
		else boarde[x][y].span.innerHTML=-boardn[x][y];
	}
	var st=1;if(mines[1].toString()!=new pair(x,y).toString)st=0;
	playsound('explode.ogg');
	if(effects)setTimeout(dieproc,10,st);else dieproc(st);
	window.navigator.vibrate([200,100,300]);
}
function dieproc(p)
{
	if(!dead||p>=mines.length){if(p>=mines.length)showresult(0);document.getElementById("containerDiv").style.transform="none";return;}
	var x=mines[p].x,y=mines[p].y;if(effects&&(p%5==0))playsound('explode.ogg',.2);
	if(boards[x][y]!=-boardn[x][y])
	{
		boarde[x][y].overlay.classList.add('mine');
		boarde[x][y].overlay.classList.remove('flag');
	}
	boarde[x][y].overlay.style.opacity="1";
	boarde[x][y].overlay.style.transform="scale(1,1)";
	if(multimine)
	{
		if(-boardn[x][y]!=boards[x][y]&&boards[x][y]>0)
		boarde[x][y].span.innerHTML="<s>"+boards[x][y]+"</s>"+(boardn[x][y]<0?-boardn[x][y]:"");
		else boarde[x][y].span.innerHTML=-boardn[x][y];
	}
	if(effects)
	document.getElementById("containerDiv").style.transform="translate("+(Math.random()*10-5)+"px,"+(Math.random()*10-5)+"px)";
	if(!effects||(cc>40&&(p&1)))dieproc(p+1);else setTimeout(dieproc,10,p+1);
}
function systemtest()
{
	if(document.getElementById("st").classList.contains("disabled")||solved||dead)return;
	for(var i=0;i<dimx;++i)for(var j=0;j<dimy;++j)
	if(boardn[i][j]<0&&boards[i][j]!=-boardn[i][j]){die(i,j);return;}
	showresult(1);
}
function t()
{
	switch(document.getElementById('bsize').value)
	{
		case "1":return "easy";
		case "2":return "normal";
		case "2":return "hard";
	}
}
function showresult(w)
{
	if(w)
	{
		solved=true;document.getElementById('result').style.opacity="1";document.getElementById('result').style.zIndex="1000";
		document.getElementById('result').innerHTML=
		"You solved this "+t()+(multimine?" multimine":"")+" field in "+
		((new Date()).getTime()-st.getTime())/1000.+" seconds!<br>Click or tap anywhere in the dialog to close it.";
	}
	else
	{
		var cs=0,ccor=0,uc=0;
		for(var i=0;i<dimx;++i)for(var j=0;j<dimy;++j)
		{
			if(boards[i][j]==-boardn[i][j]&&boardn[i][j]<0)ccor+=boards[i][j];
			if(boardn[i][j]<0)cs-=boardn[i][j];
			if(boards[i][j]==-1&&boardn[i][j]>=0)++uc;
		}
		document.getElementById('result').style.opacity="1";document.getElementById('result').style.zIndex="1000";
		document.getElementById('result').innerHTML=
		"Game Over!<br>You uncovered "+(100*uc/(dimx*dimy-cc)).toFixed(2)+"% of the field and located "+(100*ccor/cs).toFixed(2)+"% mines correctly.<br>Click or tap anywhere in the dialog to close it."
	}
}

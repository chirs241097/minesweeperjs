//Chris Xiong 2017
//The MIT License
var dimpx,dimx,dimy,cc,firstclick;
var cell=null;
var ismobile,effects=true,multimine=false,sfxe=true;
var dead,st,solved,animating;
var dx=[-1,-1,-1, 0, 0, 1, 1, 1];
var dy=[-1, 0, 1,-1, 1,-1, 0, 1];
var classes=["one","two","three","four","five","six","seven","eight"];
var queue=[],newqueue=[],flags=[];
var mines=[],detx,dety,cmines=[],sfx=[];
var ui={};
function randomInt(min,max)
{
	seed*=214013;seed+=2531011;seed&=0xffffffff;
	return min+(seed^seed>>15)%(max-min+1);
}
function setupui()
{
	ui.pbefx=document.getElementById('efx');
	ui.pbsfx=document.getElementById('sfx');
	ui.pbmul=document.getElementById('multim');
	ui.cbbsz=document.getElementById('bsize');
	ui.lbres=document.getElementById('result');
	ui.pbstt=document.getElementById('st');
	ui.lbmns=document.getElementById('mines');
	ui.cwctn=document.getElementById('containerDiv');
}
function efxtoggle()
{
	effects=!effects;
	ui.pbefx.classList.toggle('off');
	ui.pbefx.innerHTML=effects?"On":"Off";
	for(var i=0;i<dimx;++i)
	for(var j=0;j<dimy;++j)
	if(effects)cell[i][j].overlay.classList.add('trans');
	else cell[i][j].overlay.classList.remove('trans');
}
function sfxtoggle()
{
	sfxe=!sfxe;
	ui.pbsfx.classList.toggle('off');
	ui.pbsfx.innerHTML=effects?"On":"Off";
}
function multiminetoggle()
{
	multimine=!multimine;
	ui.pbmul.classList.toggle('off');
	ui.pbmul.innerHTML=multimine?"On":"Off";
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
	setupui();setupevents();gameInit();
	ui.cbbsz.onchange=gameInit;
}
function playsound(s,v)
{
	if(!sfxe)return;var i;
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
	firstclick=true;dead=solved=false;for(var i=0;i<7;++i)flags[i]=cmines[i]=0;
	ui.lbres.style.opacity="0";ui.lbres.style.zIndex="-999";animating=false;
	for(;ui.cwctn.hasChildNodes();ui.cwctn.removeChild(ui.cwctn.lastChild));
	switch(ui.cbbsz.value)
	{
		case "1":dimx=9;dimy=9;cc=10;break;
		case "2":dimx=16;dimy=16;cc=40;break;
		case "3":dimx=16;dimy=30;cc=99;break;
	}
	if(custx&&custy&&ccc){dimx=custx;dimy=custy;cc=ccc;}
	if((window.innerWidth>window.innerHeight)^(dimx<dimy))
	{var t=dimx;dimx=dimy;dimy=t;}
	updateflags();sfx=[];
	seed=Math.floor(Math.random()*2000000000);
	if(multimine)ui.pbstt.style.display="inline-block";
	else ui.pbstt.style.display="none";
	ui.pbstt.classList.add("disabled");
	if(window.innerWidth/dimy*dimx>window.innerHeight*0.8)
	{
		dimpx=window.innerHeight*(ismobile?0.9:0.8);
		ui.cwctn.style.width=dimpx/dimx*dimy+"px";
		ui.cwctn.style.height=dimpx+"px";
	}
	else
	{
		dimpx=window.innerWidth*(ismobile?0.9:0.8);
		ui.cwctn.style.width=dimpx+"px";
		ui.cwctn.style.height=dimpx/dimy*dimx+"px";
	}
	cell=new Array(dimx+4);for(var i=0;i<dimx+4;++i)cell[i]=new Array(dimy+4);
	for(var i=0;i<dimx;++i)
	for(var j=0;j<dimy;++j)
	{
		cell[i][j]=document.createElement('div');
		cell[i][j].classList.add("clickable");
		cell[i][j].style.top=(i*100/dimx)+'%';
		cell[i][j].style.left=(j*100/dimy)+'%';
		cell[i][j].x=i;cell[i][j].y=j;
		cell[i][j].s=cell[i][j].n=0;
		cell[i][j].style.width=(95/dimy)+"%";
		cell[i][j].style.height=(95/dimx)+"%";
		cell[i][j].classList.add('normal');
		
		cell[i][j].overlay=document.createElement('div');
		cell[i][j].overlay.classList.add("overlay");
		cell[i][j].overlay.style.top=(i*100/dimx)+'%';
		cell[i][j].overlay.style.left=(j*100/dimy)+'%';
		cell[i][j].overlay.style.width=(95/dimy)+"%";
		cell[i][j].overlay.style.height=(95/dimx)+"%";
		cell[i][j].overlay.style.opacity="0";
		cell[i][j].overlay.style.transform="scale(2,2)";
		if(effects)cell[i][j].overlay.classList.add("trans");
		
		cell[i][j].span=document.createElement('span');
		cell[i][j].span.style.display="table-cell";
		cell[i][j].span.style.fontWeight="bold";
		cell[i][j].span.style.verticalAlign="middle";
		cell[i][j].span.style.userSelect="none";
		cell[i][j].span.classList.add("TText");
		cell[i][j].overlay.appendChild(cell[i][j].span);
		cell[i][j].onclick=mclick;
		cell[i][j].oncontextmenu=rclick;
		ui.cwctn.appendChild(cell[i][j]);
		ui.cwctn.appendChild(cell[i][j].overlay);
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
		cell[x][y].n=-1;mines.push(new pair(x,y));
		if(multimine)
		{
			var rnd=randomInt(1,100);
			if(rnd>32)--cell[x][y].n;
			if(rnd>57)--cell[x][y].n;
			if(rnd>77)--cell[x][y].n;
			if(rnd>87)--cell[x][y].n;
			if(rnd>95)--cell[x][y].n;
		}
		++cmines[-cell[x][y].n];
		for(var j=0;j<8;++j)
		{
			var cx=x+dx[j],cy=y+dy[j];
			if(cx>=0&&cx<dimx&&cy>=0&&cy<dimy&&cell[cx][cy].n>=0)
			cell[cx][cy].n-=cell[x][y].n;
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
		{if(cell[x][y].s>=0)flag(x,y);}
		else{if(cell[x][y].s==1)deflag(x,y);else if(cell[x][y].s==0)flag(x,y);}
		if(cell[x][y].s==-1)autodig(x,y);
	}
	else
	{
		if(cell[x][y].s==0)dig(x,y);
		else if(cell[x][y].s==-1)autodig(x,y);
		else if(multimine&&cell[x][y].s>0)deflag(x,y);
	}
}
function rclick(e)
{
	e.preventDefault();
	if(dead||solved||animating)return;
	var x=this.x,y=this.y;
	if(ismobile)
	{
		if(cell[x][y].s==0)dig(x,y);
		else if(multimine&&cell[x][y].s>0)deflag(x,y);
	}
	else
	{
		if(multimine)
		{if(cell[x][y].s>=0)flag(x,y);}
		else{if(cell[x][y].s==1)deflag(x,y);else if(cell[x][y].s==0)flag(x,y);}
	}
}
function checksolved()
{
	for(var i=0;i<dimx;++i)
	for(var j=0;j<dimy;++j)
	if(cell[i][j].n>=0&&cell[i][j].s!=-1)return false;
	return true;
}
var pair=function(_x,_y){this.x=_x;this.y=_y;}
pair.prototype.toString=function()
{
	return this.x+","+this.y;
}
function bfs(s)
{
	q=newqueue.slice(0);newqueue=[];
	if(s)playsound('ding.ogg');
	for(var i=0;i<q.length;++i)
	{
		var x=q[i].x,y=q[i].y;
		if(cell[x][y].n<0){die(x,y);return;}
		if(cell[x][y].n>0)
		{
			cell[x][y].span.innerHTML=cell[x][y].n;
			cell[x][y].span.classList.add(classes[(cell[x][y].n-1)%8]);
		}
		cell[x][y].overlay.style.opacity="1";
		cell[x][y].overlay.style.transform="scale(1,1)";
		cell[x][y].overlay.classList.add("dug");
		if(cell[x][y].n==0)
		{
			for(var j=0;j<8;++j)
			{
				var c=new pair(x+dx[j],y+dy[j]);
				if(c.x>=0&&c.x<dimx&&c.y>=0&&c.y<dimy&&cell[c.x][c.y].s==0)
				{newqueue.push(c);cell[c.x][c.y].s=-1;}
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
			}else ui.pbstt.classList.remove("disabled");
		}
	}
}
function dig(x,y)
{
	if(firstclick){genmines(x,y);firstclick=false;}
	if(cell[x][y].s==0)
	{
		newqueue.push(new pair(x,y));
		cell[x][y].s=-1;animating=true;bfs(1);
	}
}
function autodig(x,y)
{
	if(cell[x][y].s!=-1)return;
	var c=0;
	for(var i=0;i<8;++i)
	{
		var cx=x+dx[i],cy=y+dy[i];
		if(cx>=0&&cx<dimx&&cy>=0&&cy<dimy&&cell[cx][cy].s>0)c+=cell[cx][cy].s;
	}
	if(c==cell[x][y].n)
	{
		newqueue=[];
		for(var i=0;i<8;++i)
		{
			var cx=x+dx[i],cy=y+dy[i];
			if(cx>=0&&cx<dimx&&cy>=0&&cy<dimy)
			{
				if(multimine&&cell[cx][cy].n<0&&cell[cx][cy].s!=-cell[cx][cy].n)
				{die(cx,cy);return;}
				if(cell[cx][cy].s==0){newqueue.push(new pair(cx,cy));cell[cx][cy].s=-1;}
			}
		}
		if(newqueue.length){animating=true;bfs(1);}
	}
}
function flag(x,y)
{
	--flags[cell[x][y].s];cell[x][y].s++;
	if(multimine){if(cell[x][y].s>6)cell[x][y].s=6;cell[x][y].span.innerHTML=cell[x][y].s;}
	else{if(cell[x][y].s>1)cell[x][y].s=1;cell[x][y].span.innerHTML="X";}
	++flags[cell[x][y].s];
	cell[x][y].overlay.classList.add('flag');
	cell[x][y].overlay.style.opacity="1";
	cell[x][y].overlay.style.transform="scale(1,1)";
	updateflags();
}
function deflag(x,y)
{
	--flags[cell[x][y].s];--cell[x][y].s;++flags[cell[x][y].s];
	cell[x][y].span.innerHTML=cell[x][y].s;
	if(cell[x][y].s==0)
	{
		cell[x][y].span.innerHTML="";
		cell[x][y].classList.remove('flag');
		cell[x][y].classList.add('normal');
		cell[x][y].overlay.style.opacity="0";
		cell[x][y].overlay.style.transform="scale(2,2)";
	}
	updateflags();
}
function updateflags()
{
	if(multimine)
	{
		var s="";
		for(var i=1;i<7;++i)s=s+" x"+i+" "+flags[i]+"/"+cmines[i];
		ui.lbmns.innerHTML=s;
	}
	else
	ui.lbmns.innerHTML=flags[1]+"/"+cmines[1];
}
function cmp(x,y)
{
	return (Math.abs(x.x-detx)+Math.abs(x.y-dety))-(Math.abs(y.x-detx)+Math.abs(y.y-dety));
}
function die(x,y)
{
	if(dead||cell[x][y].n>=0)return;
	dead=true;detx=x;dety=y;mines.sort(cmp);
	for(var i=0;i<dimx;++i)
	for(var j=0;j<dimy;++j)
	if(cell[i][j].s>0&&cell[i][j].s!=-cell[i][j].n&&(i!=x||j!=y))
	{
		cell[i][j].overlay.classList.remove('flag');
		cell[i][j].overlay.classList.add('flagw');
		cell[i][j].span.innerHTML="<s>"+cell[i][j].span.innerHTML+"</s>";
	}
	cell[x][y].overlay.classList.add('detonated');
	cell[x][y].overlay.classList.remove('flag');
	cell[x][y].overlay.style.opacity="1";
	cell[x][y].overlay.style.transform="scale(1,1)";
	if(multimine)
	{
		if(-cell[x][y].n!=cell[x][y].s&&cell[x][y].s>0)
		cell[x][y].span.innerHTML="<s>"+cell[x][y].s+"</s>"+(cell[x][y].n<0?-cell[x][y].n:"");
		else cell[x][y].span.innerHTML=-cell[x][y].n;
	}
	var st=1;if(mines[1].toString()!=new pair(x,y).toString)st=0;
	playsound('explode.ogg');
	if(effects)setTimeout(dieproc,10,st);else dieproc(st);
	window.navigator.vibrate([200,100,300]);
}
function dieproc(p)
{
	if(!dead||p>=mines.length){if(p>=mines.length)showresult(0);ui.cwctn.style.transform="none";return;}
	var x=mines[p].x,y=mines[p].y;if(effects&&(p%5==0))playsound('explode.ogg',.3*(1-p/cc/2));
	if(cell[x][y].s!=-cell[x][y].n)
	{
		cell[x][y].overlay.classList.add('mine');
		cell[x][y].overlay.classList.remove('flag');
	}
	cell[x][y].overlay.style.opacity="1";
	cell[x][y].overlay.style.transform="scale(1,1)";
	if(multimine)
	{
		if(-cell[x][y].n!=cell[x][y].s&&cell[x][y].s>0)
		cell[x][y].span.innerHTML="<s>"+cell[x][y].s+"</s>"+(cell[x][y].n<0?-cell[x][y].n:"");
		else cell[x][y].span.innerHTML=-cell[x][y].n;
	}
	if(effects)
	ui.cwctn.style.transform="translate("+(Math.random()*10-5)+"px,"+(Math.random()*10-5)+"px)";
	if(!effects||(cc>40&&(p&1)))dieproc(p+1);else setTimeout(dieproc,10,p+1);
}
function systemtest()
{
	if(ui.pbstt.classList.contains("disabled")||solved||dead)return;
	for(var i=0;i<dimx;++i)for(var j=0;j<dimy;++j)
	if(cell[i][j].n<0&&cell[i][j].s!=-cell[i][j].n){die(i,j);return;}
	showresult(1);
}
function t()
{
	switch(ui.cbbsz.value)
	{
		case "1":return "easy";
		case "2":return "normal";
		case "2":return "hard";
	}
}
function showresult(w)
{
	ui.lbres.style.opacity="1";ui.lbres.style.zIndex="1000";
	if(w)
	{
		solved=true;
		ui.lbres.innerHTML="<h3>Congratulations!</h3>You solved this "+t()+(multimine?" multimine":"")+" field in "+
		((new Date()).getTime()-st.getTime())/1000.+" seconds!<br>Click or tap anywhere in the dialog to close it.";
	}
	else
	{
		var cs=0,ccor=0,uc=0;
		for(var i=0;i<dimx;++i)for(var j=0;j<dimy;++j)
		{
			if(cell[i][j].s==-cell[i][j].n&&cell[i][j].n<0)ccor+=cell[i][j].s;
			if(cell[i][j].n<0)cs-=cell[i][j].n;
			if(cell[i][j].s==-1&&cell[i][j].n>=0)++uc;
		}
		ui.lbres.innerHTML="<h3>Game Over!</h3>You uncovered "+(100*uc/(dimx*dimy-cc)).toFixed(2)+
		"% of the field and located "+(100*ccor/cs).toFixed(2)+"% mines correctly.<br>Click or tap anywhere in the dialog to close it."
	}
}

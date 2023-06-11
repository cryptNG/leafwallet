import { isArray } from '@ember/array';
import Component from '@glimmer/component';


export default class Icon extends Component {
  constructor(){
    super(...arguments);
    this.address=this.args.address;
  }

  get height(){
    return (this.args.height||null)!==null?this.args.height:80;
  }

  generateIcon=(element)=>{
    const svg = element.querySelector('#icons');
    var svgNS = svg.namespaceURI;
    this.genIcon(svg,this.address,0,0);

  }
  genIcon=(node,address,centerX,centerY)=>{
    let s='';
    for(let i=0;i<40;i=i+2)
    {
      s=s+ (Number('0x'+address[i])).toString(16);

    }
  
    let cs=Array.from(s.toString()).reverse();
    console.log(cs);
    let cschemeIndex=Number('0x'+cs[0]+cs[1])%64;
    let colors=[];
    for(let i=0;i<4;i++)
    {
      colors.push(cmap[cschemeIndex][Number('0x'+cs[2+i])]);
    }
    let shapeIndex = Number('0x'+cs[6]);
    let p7=Number('0x'+cs[7]);
    let p8=Number('0x'+cs[8]);
    let p9=Number('0x'+cs[9]);
    let p10=Number('0x'+cs[10]);
    let p11=Number('0x'+cs[11]);

    switch(shapeIndex)
    {
      case 0:
        paintCircularShape(node,centerX,centerY,p8,p9,colors);
        paintInnerStarShape(node,centerX,centerY,Math.trunc(p7/4)+2,cmap[cschemeIndex][15-p7])
        break;
        
      case 1:
        paintTriangleShape(node,centerX,centerY,p8,p9,colors);
        
        paintInnerStarShape(node,centerX,centerY+12,p7%4+2,cmap[cschemeIndex][15-p7],11)
        
        break;
      case 2:
        paintRectShape(node,centerX,centerY,p8,p9,colors);
        paintInnerStarShape(node,centerX,centerY,Math.trunc(p7/4)+2,cmap[cschemeIndex][15-p7])
        break;
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      //case 9:
        switch(shapeIndex%2)
          {
            case 1:
              paintPolygonShape(node,centerX,centerY,shapeIndex+2,p8,p9,p10, colors);
              break;
            case 0:
              paintTriangleStripShape(node,centerX,centerY,shapeIndex+2,p8,p9,p10,colors);
              break;
          }
        if(p7<12)
        {
          paintInnerStarShape(node,centerX,centerY,Math.trunc(p7/3)+3,cmap[cschemeIndex][p8]);
        }
        break;
      // case 9:
      //   paintFlowerShape(node,centerX,centerY,p7,p8,p9,p10,p11,cmap[cschemeIndex]);
      //   break;
      default:
        paintCalaidoskopeShape(node,centerX,centerY,shapeIndex-6,p7,p8,p9,p10,cmap[cschemeIndex]);
    }
  }
  
}

function paintFlowerShape(svg, centerX,centerY,param1,param2,param3,param4,param5, colors)
{
  var svgNS = svg.namespaceURI;

  const iconGroup = document.createElementNS(svgNS,'g');
  iconGroup.setAttribute('transform',`translate(${centerX},${centerY})`);
  
  
 
  
      let leaves=param1%2===1?param1:param1-1;
      leaves= leaves<8?(12-leaves):leaves-2;
  
      
      iconGroup.setAttribute('transform',`translate(${centerX},${centerY})`);
      
    

      const distEl1=32-[0,2,4,6,8][param4%5]+param5%3;
      const rEl1=5+(param1%3)*2;
      const circles1=param1%6+1;
      const space1=param1%5+1;

      const distEl2=19-param3%4*2;
      const rEl2=12+param3%3*2;

      const distEl3=14-param2%4;
      const rEl3=2+param2%3;

      const rLine = param3%8*2;
      const dLine = (distEl3+rLine+rEl3);

      appendPolarLines(iconGroup,param5%2===0? leaves*2:leaves/2,rEl1 ,(distEl1-rEl1),colors[param3],'none');

      appendCircularCircles(iconGroup,circles1,rEl1,distEl1,space1,[colors[param1],255],[lightenRGB(colors[param1]),255],'url(#drop-shadow-normal)',0);

      if(param1%2===1)
        appendPolarDiamonds(iconGroup,leaves,(distEl1-rEl1)*0.15,360/leaves/4 *(leaves/7)*0.8,360/leaves/4*0.4*(leaves/7),0,(distEl1-rEl1)*1.1,[colors[param2],200],[lightenRGB(colors[param2]),200],'none',360/leaves*0.5);
  
        appendPolarCircles(iconGroup, leaves/2,rEl2,distEl2,[colors[param2],100],[lightenRGB(colors[param2]),100],'url(#drop-shadow-bold)',360/leaves);
    

 
  
    svg.appendChild(iconGroup);
}

function paintCalaidoskopeShape(svg, centerX,centerY,param1,param2,param3,param4,param5, colors)
{
  var svgNS = svg.namespaceURI;

  const iconGroup = document.createElementNS(svgNS,'g');
  //iconGroup.setAttribute('transform',`translate(${centerX},${centerY})`);
  
  if(param4%4===0 && param4>0)
  {
    const fact = param3 <10?2:1.5;

    appendCenterCircle(iconGroup,param3*fact,'none',[colors[param3],150],'none');

    appendCenterCircle(iconGroup,param3*(fact+0.1),'none',[colors[param3],110],'none');

    appendCenterCircle(iconGroup,param3*(fact+0.2),'none',[colors[param3],70],'none');

    appendCenterCircle(iconGroup,param3*(fact+0.3),'none',[colors[param3],30],'none');
  }
 
  
  if(param3%4===0)
  {
    appendCenterCircle(iconGroup,param4*2.3,'none',[colors[param4],150],'none');
    appendCenterCircle(iconGroup,param4*2.2,'none',[colors[param4],110],'none');
    appendCenterCircle(iconGroup,param4*2.1,'none',[colors[param4],70],'none');
    appendCenterCircle(iconGroup,param4*2,'none',[colors[param4],30],'none');
  }
  
  
 
      const isAddingComplexity = param1<5;
      const leaves=param1%2===0?param1:param1;
      const lines=param1%2===0?param1*(param5%5===0?2:1):param1;
      

      if(isAddingComplexity && param4%5===0)
      {
        appendCenterCircle(iconGroup,35-param2*2,[lightenRGB(colors[param2]),70],[lightenRGB(colors[param2],3),150],'url(#drop-shadow-bold)');
      }
      let maxR = 0;
      const distEl1=19-param4%4*2;
      const rEl1=8+param4%3;
      const cEl1 = colors[param4];
      const cEl1_i = colors[15-param4];

      if(maxR<distEl1+rEl1)maxR=distEl1+rEl1;

      const distEl2=32-param3%4*2;
      const rEl2=11+param3%3;
      const cEl2=colors[param3];
      const cEl2_b=contrastColorRGB(cEl2);
      const cEl2_i=colors[15-param3];
      const cEl2_i_b=contrastColorRGB(cEl2_i);

      if(maxR<distEl2+rEl2)maxR=distEl2+rEl2;

      const distEl3=14-param2%4;
      const rEl3=2+param2%3;
      const cEl3 = colors[param2];
      const rLine = isAddingComplexity?13-param3%6*2:16-param3%8*2;
      const dLine = (distEl3+rLine+rEl3);
      if(maxR<distEl3+rEl3)maxR=distEl3+rEl3;

      const distEl4=32-param5%4*2;
      const rEl4=6+param5%3*2;
      const cEl4 = colors[param5];
      const cEl4_b = contrastColorRGB(cEl4);
      const cEl4_i = colors[15-param5];
      const cEl4_i_b = contrastColorRGB(cEl4_i);
      if(maxR<distEl4+rEl4)maxR=distEl4+rEl4;

     appendPolarCircles(iconGroup, leaves/2,rEl2,distEl2,[cEl2,150],[cEl2_b,100],'url(#drop-shadow-normal)',isAddingComplexity?180/leaves*3:0);
   
      
     appendPolarCircles(iconGroup, leaves/2,rEl1,distEl1,[cEl1_i,200],'none','url(#drop-shadow-bold)',isAddingComplexity?180/leaves:0);

      

      appendPolarLines(iconGroup, lines,(rLine) ,dLine,cEl2,'none');


     appendPolarCircles(iconGroup, leaves,rEl3,distEl3,cEl3,darkenRGB(cEl3),'none');
      
      
      if(param2%2===0)
      {
        if(param2>7)
        {
          if(param5%3===0) appendPolarHexagons(iconGroup, leaves/4,rEl4*1.2,distEl2,[cEl4_i,150],[cEl4_i_b,150],'url(#drop-shadow-bold)',360/leaves);
          appendPolarCircles(iconGroup, leaves/2,rEl4*(param5%3===0?0.7:1),distEl2,[cEl4,255],[cEl4_b,255],param5%3===0?'none':'url(#drop-shadow-bold)',360/leaves);
        }
        else
        {
          if(param5>7)
          {
            appendPolarPentagons(iconGroup, leaves/2,rEl4,distEl2,[cEl4,180],[cEl4_b,180],'url(#drop-shadow-small)',isAddingComplexity?180/leaves*3:0);
            if(param5%3>0) appendPolarCircles(iconGroup, leaves/2,rEl4*0.3,dLine+rLine+rEl4*0.3/2,[cEl4_i,100],[cEl4_i_b,200],'none',isAddingComplexity?180/leaves*3:(param3%3>0?0:180));
          }
          else{
            if(param5%3>0) appendPolarCircles(iconGroup, leaves/2,rEl4*1.3,distEl2,[cEl4_i,100],[cEl4_i_b,200],'url(#drop-shadow-bold)',isAddingComplexity?180:360/leaves);
            appendPolarDiamonds(iconGroup,leaves/2,rEl4*0.8,360/leaves/4 *(leaves/7)*0.8,360/leaves/4*0.4*(leaves/7),0,distEl2,[cEl4,200],[cEl4_b,255],'none',isAddingComplexity?180:(param3%3>0?0:180));
             
          }
        }
      }else{
          appendPolarCircles(iconGroup, leaves/2,3+3*param3%3,param3%2===1?(3+3*param3%3): dLine+rLine+(3+3*param3%3)/2,[cEl4,255],[cEl4_b,255],'url(#drop-shadow-small)',360/leaves);
      }
  
      
      iconGroup.setAttribute('transform',`translate(${centerX},${centerY}),rotate(${360/16*(param5)}),scale(${40/maxR})`);
    svg.appendChild(iconGroup);
}


function paintInnerStarShape(svg, centerX,centerY,edges,color,size=12)
{
  if(edges<2)return;
  var svgNS = svg.namespaceURI;

  const iconGroup = document.createElementNS(svgNS,'g');
  iconGroup.setAttribute('transform',`translate(${centerX},${centerY})`);
  appendCenterStar(iconGroup,size/12*5,size,edges,color,'none','url(#inset-shadow-small)',0)
  
  svg.appendChild(iconGroup);
  
}

function paintCircularShape(svg, centerX,centerY,param1,param2,colors)
{
   var svgNS = svg.namespaceURI;

  const iconGroup = document.createElementNS(svgNS,'g');

  iconGroup.setAttribute('transform',`translate(${centerX},${centerY})`);
  for(let i=0;i<4;i++)
  {
    const r =( 80 - (80 -20)/colors.length *i )/2;
    appendCenterCircle(iconGroup,r,colors[i],'none',param2%5===0 && param2>0?'url(#inset-shadow-normal)':'url(#drop-shadow-normal)');

  }
  svg.appendChild(iconGroup);
  const numOrbs = param1%(colors.length+1);
  if(param2>0)
    for(let i=0;i<numOrbs;i++)
    {
      const dist =( 80 - (80 -20)/4 *i )/2-4;
 
    let s=0;
    if(param2%(i+3)==0) s++;
    if(param2%(i+4)==0) s++;
    if(param2%(i+5)==0) s++;
    if(param2%(i+6)==0) s++;
    if(param2%(i+7)==0) s++;
    if(param2%(i+8)==0) s++;
    if(param2%(i+9)==0) s++;
    for(let si=0;si<s;si++)
      {
   
        appendPolarEllipse(iconGroup,si*25+i*180-(s/2)*25,3,3,dist,lightenRGB(colors[i]),'none','url(#drop-shadow-normal)');
        
      }
  }
 
}

function paintRectShape(svg,centerX,centerY,param1,param2,colors)
{
  var svgNS = svg.namespaceURI;

  const iconGroup = document.createElementNS(svgNS,'g');

  iconGroup.setAttribute('transform',`translate(${centerX},${centerY})`);

  for(let i=0;i<colors.length;i++)
  {
    let r =( 80 - (80 -20)/colors.length *i )/2;
    
    appendCenterPolygon(iconGroup,4,r,colors[i],'none',param2%5===0 && param2>0?'url(#inset-shadow-normal)':'url(#drop-shadow-normal)',90);
  }
  
  const numOrbs = param1%5;
  if(param2>0)
    {

      for(let i=0;i<numOrbs;i++)
      {
        let s=0;
        if(i===0) s=param2%6;
        if(i===1) s=param1%6;
        if(i===2 && param1-6>0) s=(param1-6)%6;
        if(i===3 && param2-6>0) s =(param2-6)%6;

        let dx=i%2===0?5:-5;
        let dy=i<2?-5:5
        let sx=i%2===0?-25 -(s/2*dx) :25-(s/2*dx);
        let sy=i<2?-29-(s/2*dy):29-(s/2*dy);

        for(let si=0;si<s;si++)
          {
            appendCircle(iconGroup, si*dx+sx,si*dy+sy,3,colors[3-i],'none','url(#drop-shadow-small)');            
          }
      }
    }
    svg.appendChild(iconGroup);
}



function paintTriangleShape(svg,centerX,centerY,param1,param2,colors)
{
  var svgNS = svg.namespaceURI;

  const iconGroup = document.createElementNS(svgNS,'g');

  iconGroup.setAttribute('transform',`translate(${centerX},${centerY+12}),rotate(0)`);

  for(let i=0;i<colors.length;i++)
  {
    let r = ( 80 - (80 -20)/colors.length *i );
 
    appendCenterTriangle(iconGroup, r*0.64, colors[i],'none','url(#drop-shadow-normal)');
  }
  
  const numOrbs = param1%3;
  if(param2>0)
    {

      for(let i=0;i<numOrbs;i++)
      {
        const s=i===0?param2%6:param1%6;
        const dx=5;
        const dy=i===0?-8.5:8.5
        const sx=i===0?-25 -(s/2*dx) :30-(s/2*dx);
        const sy=i===0?(-17)-(s/2*dy):-9-(s/2*dy);

        for(let si=0;si<s;si++)
        {
          appendCircle(iconGroup,si*dx+sx,si*dy+sy,3,colors[3-i],'none','url(#drop-shadow-small)');
        }
      }
    }
    svg.appendChild(iconGroup);
}

function paintPolygonShape(svg, centerX,centerY,edges,param1, param2,param3, colors)
{
  var svgNS = svg.namespaceURI;

  const iconGroup = document.createElementNS(svgNS,'g');

  iconGroup.setAttribute('transform',`translate(${centerX},${centerY}),rotate(0)`);

  const isStar = param2%4;
  const usedEdges = isStar?edges+1:edges;
  for(let i=0;i<colors.length;i++)
  {
    let r = ( 80 - (80 -20)/colors.length *i );

    if(isStar===0)
      {
        appendCenterStar(iconGroup,r/2.6, r/2.1,usedEdges,colors[i],'none','url(#drop-shadow-normal)');
      }else{
        appendCenterPolygon(iconGroup,usedEdges,r/2,colors[i],'none','url(#drop-shadow-normal)');
      }
    
   
  }
  
  
  const numOrbs=param1%(usedEdges);
  if(isStar===0)
    {
      
      const inc=360/usedEdges;
      let step=param1%7;
      step=param2%2===0?step:-step;
      for(let i=0;i<numOrbs*2;i++)
      {
        appendPolarEllipse(iconGroup,inc*i+inc/2+step*inc, 3, 3, 39,colors[3],'none','url(#drop-shadow-small)');
      }
    }else{
      if(param3%3===0 && numOrbs>0)
        {
          let startX = usedEdges===5?-26:usedEdges===7?-32:-32;
          let startY = usedEdges===5?-20:usedEdges===7?-20:-20;
          let endX = usedEdges===5?33:usedEdges===7?38:37;
          let endY = usedEdges===5?5:usedEdges===7?5:5;
          let radiusW=usedEdges===5?40:usedEdges===7?45:45;
          let radiusH=usedEdges===5?15:usedEdges===7?15:15;
     
          appendOrbit(iconGroup,startX,startY, radiusW,radiusH,20,endX,endY,'none',lightenRGB(colors[3]),'url(#line-shadow)',0);
          const planetsGroup = document.createElementNS(svgNS,'g');
          const tlX=usedEdges===5?-2.5:usedEdges===7?1:0;
          const tlY=usedEdges===5?0:usedEdges===7?0:0;
          planetsGroup.setAttribute('transform',`translate(${tlX},${tlY}),rotate(20)`);

          const angles =[0,10,20,40,80,120,150,170];
          for(let i=0;i<numOrbs;i++)
          {
            const point = pointOnEllipse(angles[i],radiusW,radiusH);
  
            appendCircle(planetsGroup,point.x,point.y, i/2+2,lightenRGB(colors[3]),'none','url(#drop-shadow-small)');
    
          }
          iconGroup.appendChild(planetsGroup);
        }
    }
    svg.appendChild(iconGroup);
}

function paintTriangleStripShape(svg, centerX,centerY,edges,param1, param2,param3, colors)
{
let a = 0.0;
const inc = Math.PI*2 / edges;
var ci=0;
const numOrbs=param2%(edges+1);

const orbsInc=360/edges;
const isOrbit=param3%5===0;
const isFullStrip = param1%10>0 || !isOrbit || numOrbs===0;

var svgNS = svg.namespaceURI;

const iconGroup = document.createElementNS(svgNS,'g');

iconGroup.setAttribute('transform',`translate(${centerX},${centerY}),rotate(0)`);

  
if(isFullStrip)
for(let i=0;i<edges;i++)
  {
    appendPolarTriangle(iconGroup, a,inc,45,20,colors[ci],'none','url(#drop-shadow-normal)');
    a=a+inc;
    ci++;
    if(ci===2) ci=0;
  }
  ci=2;
  a = 0.0;
  for(let i=0;i<edges;i++)
  {
    appendPolarTriangle(iconGroup, a,inc,20,45,colors[ci],'none',param1%9===0?'url(#inset-shadow-small)':'url(#drop-shadow-normal)');
    a=a+inc;
    ci++;
    if(ci===4) ci=2;
  }

  ci=0;
  if(isOrbit && numOrbs>0)
    {
      
    appendCenterArc(iconGroup, 34, 34, orbsInc/2+90,orbsInc*numOrbs+90+orbsInc/4,'none',lightenRGB(colors[ci]),'url(#drop-shadow-normal)');
 
    for(let i=0;i<numOrbs;i++)
    {

      appendPolarEllipse(iconGroup,orbsInc*i+90+orbsInc/2, 3, 3, 34,lightenRGB(colors[ci]),'none','url(#drop-shadow-normal)');
      ci++;
    if(ci===2) ci=0;
  }
    }
  svg.appendChild(iconGroup);
}

function appendCenterStar(parent,innerRadius,outerRadius,edges,fill,stroke,filter,rotate=0)
{
  const poly =document.createElementNS('http://www.w3.org/2000/svg','polygon');
  
  var numPoints = edges;
  var angle  = Math.PI / numPoints;
  var points = [];  
  
  for (var i = 0; i < numPoints * 2; i++) {
    var radius = i & 1 ? innerRadius : outerRadius;  
    points.push(radius * Math.sin(i * angle));
    points.push( - radius * Math.cos(i * angle));
  }

  poly.setAttribute('points',points);
  setFillAttribute(poly,fill);
  setStrokeAttribute(poly,stroke);
  poly.setAttribute('filter',filter);
  poly.setAttribute('transform',`rotate(${rotate})`);
  parent.appendChild(poly);
}

function appendCenterTriangle(parent,radius,fill,stroke,filter,rotate=0)
{
  appendTriangle(parent,0,0,radius,fill,stroke,filter,rotate);
}

function appendTriangle(parent,centerX,centerY,radius,fill,stroke,filter,rotate=0)
{
  const poly =document.createElementNS('http://www.w3.org/2000/svg','polygon');
  var angle  = 2 * Math.PI / 3;
  const _rotate = Math.PI/180*30
  var points = []; 
  
  for (var pi = 0; pi < 3; pi++) {
    points.push( radius * Math.cos(pi * angle+_rotate));
    points.push(radius * Math.sin(pi * angle+_rotate));
  }
  poly.setAttribute('points',points);
  setFillAttribute(poly,fill);
  setStrokeAttribute(poly,stroke);
  poly.setAttribute('filter',filter);
  poly.setAttribute('transform',`translate(${centerX},${centerY}),rotate(${rotate})`);
  parent.appendChild(poly);
}

function appendCenterPolygon(parent,sides,radius,fill,stroke,filter,rotate=0)
{
  appendPolygon(parent,0,0,sides,radius,fill,stroke,filter,rotate);
}

function appendPolygon(parent,centerX,centerY,sides,radius,fill,stroke,filter,rotate=0)
{
  const g =document.createElementNS('http://www.w3.org/2000/svg','g');
  const poly =document.createElementNS('http://www.w3.org/2000/svg','polygon');
  var angle  = 2 * Math.PI / sides;
  var points = []; 
  
  for (var pi = 0; pi < sides; pi++) {
    points.push(radius * Math.cos(pi * angle));
    points.push(radius * Math.sin(pi * angle));
  }

  poly.setAttribute('points',points);
  setFillAttribute(poly,fill);
  setStrokeAttribute(poly,stroke);
  g.setAttribute('filter',filter);
  poly.setAttribute('transform',`translate(${centerX},${centerY}),rotate(${rotate})`);
  g.appendChild(poly);
  parent.appendChild(g);
}

function appendDiamond(parent,centerX,centerY,diamonRadius,baseRadius,topRadius,fill,stroke,filter,rotate=0)
{
  const g =document.createElementNS('http://www.w3.org/2000/svg','g');
  const poly =document.createElementNS('http://www.w3.org/2000/svg','polygon');
  const baseH = diamonRadius*1.5;
  var points = [
            -topRadius,-diamonRadius,
            -baseRadius,-(baseH-diamonRadius),
            0,diamonRadius,
            baseRadius,-(baseH-diamonRadius),
            topRadius,-diamonRadius]; 
  
  // for (var pi = 0; pi < sides; pi++) {
  //   points.push( radius * Math.sin(pi * angle));
  //   points.push(radius * Math.cos(pi * angle));
  // }

  //     *-----------*
  //           |
  //  *        |        *
  //           |
  //           +
  //           |
  //           |
  //           *
  poly.setAttribute('points',points);
  setFillAttribute(poly,fill);
  setStrokeAttribute(poly,stroke);
  g.setAttribute('filter',filter);
  poly.setAttribute('transform',`translate(${centerX},${centerY}),rotate(${rotate})`);
  g.appendChild(poly);
  parent.appendChild(g);
}

function appendPolarTriangle(parent,startAngle,angleSize,distLongSide,distShortSide,fill,stroke,filter,rotate=0)
{
  const poly =document.createElementNS('http://www.w3.org/2000/svg','polygon');
  var points = []; 
  if(distLongSide>distShortSide)
  {
    points.push(Math.cos(startAngle)*distLongSide);
    points.push(Math.sin(startAngle)*distLongSide);

    points.push(Math.cos(startAngle+angleSize)*distLongSide);
    points.push(Math.sin(startAngle+angleSize)*distLongSide);

    points.push(Math.cos(startAngle+angleSize/2)*distShortSide);
    points.push(Math.sin(startAngle+angleSize/2)*distShortSide);
  }else
  {
    points.push(Math.cos(startAngle-angleSize/2)*distLongSide);
    points.push(Math.sin(startAngle-angleSize/2)*distLongSide);

    points.push(Math.cos(startAngle+angleSize/2)*distLongSide);
    points.push(Math.sin(startAngle+angleSize/2)*distLongSide);

    points.push(Math.cos(startAngle)*distShortSide);
    points.push(Math.sin(startAngle)*distShortSide);

  }
 
  poly.setAttribute('points',points);
  setFillAttribute(poly,fill);
  setStrokeAttribute(poly,stroke);
  poly.setAttribute('filter',filter);
  poly.setAttribute('transform',`rotate(${rotate})`);
  parent.appendChild(poly);
}

function appendCenterCircle(parent,radius,fill, stroke,filter)
{
  appendCenterEllipse(parent,radius,radius,fill, stroke,filter);

}

function appendCircle(parent, x,y,radius,fill, stroke,filter)
{
  appendEllipse(parent, x,y,radius,radius,fill, stroke,filter);

}

function appendCenterArc(parent,radiusStart,radiusEnd,startAngle,endAngle,fill, stroke,filter,rotate=0)
{
  appendArc(parent, 0,0,radiusStart,radiusEnd,startAngle,endAngle,fill, stroke,filter,rotate);
}

function appendCenterEllipse(parent,radiusW,radiusH,fill, stroke,filter,rotate=0)
{
  appendEllipse(parent, 0,0,radiusW,radiusH,fill, stroke,filter,rotate);
}
function appendEllipse(parent, x,y,radiusW,radiusH,fill, stroke,filter,rotate=0)
{
  const ellipse =document.createElementNS('http://www.w3.org/2000/svg','ellipse');
  ellipse.setAttribute('cx',x);
  ellipse.setAttribute('cy',y);
  ellipse.setAttribute('rx',radiusW);
  ellipse.setAttribute('ry',radiusH);
  setFillAttribute(ellipse,fill);
  setStrokeAttribute(ellipse,stroke);
  ellipse.setAttribute('filter',filter);
  ellipse.setAttribute('transform',`rotate(${rotate})`);
  parent.appendChild(ellipse);
}



function appendArc(parent, x,y,radiusStart,radiusEnd,startAngle,endAngle,fill, stroke,filter,rotate=0)
{
  const arcPath =document.createElementNS('http://www.w3.org/2000/svg','path');
  arcPath.setAttribute('d',describeArc(x,y, radiusStart,radiusEnd, startAngle, endAngle));
  setFillAttribute(arcPath,fill);
  setStrokeAttribute(arcPath,stroke);
  arcPath.setAttribute('filter',filter);
  arcPath.setAttribute('transform',`rotate(${rotate})`);
  parent.appendChild(arcPath);
}

function appendOrbit(parent, startX,startY,radiusW,radiusH,arcRotation,endX,endY,fill, stroke,filter,rotate=0)
{
  const arcPath =document.createElementNS('http://www.w3.org/2000/svg','path');

  var d = [
      "M", startX, startY, 
      "A", radiusW, radiusH, arcRotation, 1, 0, endX, endY
  ].join(" ");
  arcPath.setAttribute('d',d);
  setFillAttribute(arcPath,fill);
  setStrokeAttribute(arcPath,stroke);
  arcPath.setAttribute('filter',filter);
  arcPath.setAttribute('transform',`rotate(${rotate})`);
  parent.appendChild(arcPath);
}

function appendPolarArc(parent,angleInDegrees, _radiusW, _radiusH,_angleSize, _distance,fill,stroke,filter,_rotate=0) {

  const g =document.createElementNS('http://www.w3.org/2000/svg','g');
  const g2 =document.createElementNS('http://www.w3.org/2000/svg','g');
  const arcPath =document.createElementNS('http://www.w3.org/2000/svg','path');
  const _radians =  radians(angleInDegrees);
  g.setAttribute('transform',`translate(${Math.cos(_radians)*_distance},${Math.sin(_radians)*_distance})`);
  g2.setAttribute('transform',`rotate(${angleInDegrees+90})`);
  //arcPath.setAttribute('transform',`rotate(${angleInDegrees})`);
  var start = pointOnEllipse(_angleSize>180?360-(_angleSize/2-90):90-_angleSize/2,_radiusW,_radiusH);
  var end = pointOnEllipse(90+_angleSize/2,_radiusW,_radiusH);

  //var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  var d = [
      "M", start.x, start.y, 
      "A", _radiusW, _radiusH, 0, 1, 0, end.x, end.y
  ].join(" ");

  arcPath.setAttribute('d',d);
  setFillAttribute(arcPath,fill);
  setStrokeAttribute(arcPath,stroke);
  arcPath.setAttribute('filter',filter);
  g2.appendChild(arcPath);
  g.appendChild(g2);
  parent.appendChild(g);
}

function appendPolarArcs(parent,_num, _radiusW, _radiusH,_angleSize, _distance,fill,stroke,filter,_rotate=0) {
  const _angle = 360/_num;
  for(let i=1; i<=_num; i++) {
    appendPolarArc(parent,i*_angle+_rotate, _radiusW, _radiusH,_angleSize, _distance,fill,stroke,filter);
  }
}

function appendPolarEllipse(parent,angleInDegrees, _radiusW, _radiusH, _distance,fill,stroke,filter) {

  const arcPath =document.createElementNS('http://www.w3.org/2000/svg','path');
  const _radians =  radians(angleInDegrees);
  arcPath.setAttribute('transform',`translate(${Math.sin(_radians)*_distance},${Math.cos(_radians)*-_distance})`);
  arcPath.setAttribute('d',describeArc(0, 0, _radiusW,_radiusH, 0, 359));
  setFillAttribute(arcPath,fill);
  setStrokeAttribute(arcPath,stroke);
  arcPath.setAttribute('filter',filter);
  parent.appendChild(arcPath);
}

function appendPolarEllipses(parent,_num, _radiusW, _radiusH, _distance,fill,stroke,filter,_rotate=0) {
  const _angle = 360/_num;
  for(let i=1; i<=_num; i++) {
    appendPolarEllipse(parent,i*_angle+_rotate, _radiusW, _radiusH, _distance,fill,stroke,filter);
  }
}

function appendPolarCircles(parent,_num, _radius, _distance,fill,stroke,filter,_rotate=0) {
  const _angle = 360/_num;
  for(let i=0; i<_num; i++) {
    appendPolarEllipse(parent,i*_angle+_rotate, _radius, _radius, _distance,fill,stroke,filter);
  }
}

function appendCircularCircles(parent,_num, _radius, _distance,_space,fill,stroke,filter,_rotate=0) {
  const g =document.createElementNS('http://www.w3.org/2000/svg','g');
  g.setAttribute('transform',`rotate(${_rotate})`);
  
  const _angle =angle(Math.asin(_radius/_distance)+Math.asin(_space/_distance));
  for(let i=0; i<_num; i++) {
    appendPolarEllipse(g,i*_angle, _radius, _radius, _distance,fill,stroke,filter);
  }

  parent.appendChild(g);
}

// Line
function appendPolarLine(parent,angleInDegrees, _radius, _distance,stroke,filter) {
  const line =document.createElementNS('http://www.w3.org/2000/svg','line');
  const _radians = radians(angleInDegrees);
  line.setAttribute('transform',`translate(${Math.sin(_radians)*_distance},${Math.cos(_radians)*-_distance}),rotate(${angleInDegrees})`);
  line.setAttribute('x1',0);
  line.setAttribute('y1',-_radius);
  line.setAttribute('x2',0);
  line.setAttribute('y2',_radius);
  setStrokeAttribute(line,stroke);
  line.setAttribute('filter',filter);
  parent.appendChild(line);
}

function appendPolarLines(parent,_num, _radius, _distance,stroke,filter,_rotate=0) {
  const _angleInDegrees = 360/_num;
  for(let i=0; i<_num; i++) {
    appendPolarLine(parent,i*_angleInDegrees+_rotate, _radius, _distance,stroke,filter);
  }
}

// Hexagon
function appendPolarHexagon(parent, _angle, _radius, _distance,fill,stroke,filter) {

  const _radians = radians(_angle);
  appendPolygon(parent,Math.sin(_radians)*_distance,Math.cos(_radians)*-_distance,6,_radius,fill,stroke,filter,30+_angle)
  
}

function appendPolarHexagons(parent,_num, _radius, _distance,fill,stroke,filter,_rotate=0) {
  const _angle = 360/_num;
  for(let i=0; i<_num; i++) {
    appendPolarHexagon(parent,i*_angle+_rotate, _radius, _distance,fill,stroke,filter);
  }
}

// Pentagon
function appendPolarPentagon(parent, _angle, _radius, _distance,fill,stroke,filter,_rotate=0) {

  const _radians = radians(_angle);
  appendPolygon(parent,Math.sin(_radians)*_distance,Math.cos(_radians)*-_distance,5,_radius,fill,stroke,filter,54+_angle)
  
}

function appendPolarPentagons(parent,_num, _radius, _distance,fill,stroke,filter,_rotate=0) {
  const _angle = 360/_num;
  for(let i=0; i<_num; i++) {
    appendPolarPentagon(parent,i*_angle+_rotate, _radius, _distance,fill,stroke,filter);
  }
}

// Diamond
function appendPolarDiamond(parent, _angle, _diamondRadius,_baseRadius,_topRadius, _distance,fill,stroke,filter,_rotate=0) {

  const _radians = radians(_angle);
  appendDiamond(parent,Math.sin(_radians)*_distance,Math.cos(_radians)*-_distance,_diamondRadius,_baseRadius,_topRadius,fill,stroke,filter,_angle+_rotate)
  
}

function appendPolarDiamonds(parent,_num, _diamondRadius,_baseAngle,_topAngle,_flip,_distance,fill,stroke,filter,_rotate=0) {
  const _angle = 360/_num;

  const baseHyp = (_distance+_diamondRadius*0.5)/Math.cos(radians(_baseAngle));
  const topHyp = (_distance+_diamondRadius)/Math.cos(radians(_topAngle));
  const baseR = Math.sin(radians(_baseAngle))*baseHyp;
  const topR = Math.sin(radians(_topAngle))*topHyp;
  for(let i=0; i<_num; i++) {
    appendPolarDiamond(parent,i*_angle+_rotate, _diamondRadius,baseR,topR, _distance,fill,stroke,filter,_flip?180:0);
  }
}

// Square
function appendPolarSquare(parent, _angle, _radius, _distance,fill,stroke,filter) {

  const _radians = radians(_angle);
  appendPolygon(parent,Math.sin(_radians)*_distance,Math.cos(_radians)*-_distance,4,_radius,fill,stroke,filter,45)
  
}

function appendPolarSquares(parent,_num, _radius, _distance,fill,stroke,filter,_rotate=0) {
  const _angle = 360/_num;
  for(let i=0; i<_num; i++) {
    appendPolarSquare(parent,i*_angle+_rotate, _radius, _distance,fill,stroke,filter);
  }
}

function radians(angle)
{
  return (angle) * Math.PI / 180.0;
}

function angle(rad)
{
  return (rad) / Math.PI * 180.0;
}

function lightenRGB(color,amount=2)
{
  let cr = red(color);
  if(amount>0) cr= cr+(255-cr)/amount;
  let cg = green(color);
  if(amount>0) cg = cg + (255-cg)/amount;
  let cb = blue(color);
  if(amount>0)  cb=cb + (255 - cb)/amount;
  return `rgb(${cr},${cg},${cb})`;
}

function darkenRGB(color,amount=4)
{
  let cr = red(color);
  if(amount>0) cr= cr-(cr)/amount;
  let cg = green(color);
  if(amount>0) cg = cg -(cg)/amount;
  let cb = blue(color);
  if(amount>0)  cb=cb - (cb)/amount;
  return `rgb(${cr},${cg},${cb})`;
}

function contrastColorRGB(color,lightness=200)
{
  return (red(color)+green(color)+blue(color))/3>lightness?darkenRGB(color):lightenRGB(color,3);
}

function red(color)
{
  return Number('0x'+color.substring(1,3));
}
function green(color)
{
  return Number('0x'+color.substring(3,5));
}
function blue(color)
{
  return Number('0x'+color.substring(5,7));
}

function setFillAttribute(node,fill)
{
  if(isArray(fill))
  {
    node.setAttribute('fill',fill[0]);
    node.setAttribute('fill-opacity',1/255* fill[1]);
  }else node.setAttribute('fill',fill);
}

function setStrokeAttribute(node,stroke)
{
  if(isArray(stroke))
  {
    const col = stroke[0];
    const size = stroke.length===2?1:stroke[1];
    const op = stroke.length===2?stroke[1]:stroke[2];
    node.setAttribute('stroke',col);
    node.setAttribute('stroke-width',size);
    node.setAttribute('stroke-opacity',1/255*op);
    if(stroke.length===4) node.setAttribute('stroke-linecap',stroke[3]);
  }else node.setAttribute('stroke',stroke);
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function pointOnEllipse(angle,radiusW,radiusH)
{
  const xsign = angle<=90?+1:angle<=270?-1:+1;
  const angleRad = Math.PI/180*angle;
  const a = radiusW;
  const b= radiusH;
  const x=xsign*(a*b)/Math.sqrt(b*b+a*a*Math.pow(Math.tan(angleRad),2));
  const y=x*Math.tan(angleRad);
  return {
    x: x,
    y: y
  };
}

function describeArc(x, y, radiusW,radiusH, startAngle, endAngle){

  var start = polarToCartesian(x, y, radiusW, endAngle);
  var end = polarToCartesian(x, y, radiusH, startAngle);

  var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  var d = [
      "M", start.x, start.y, 
      "A", radiusW, radiusH, 1, largeArcFlag, 0, end.x, end.y
  ].join(" ");

  return d;       
}

const cmap =[
  
    ["#f7fbff","#eaf2fb","#ddeaf6","#cfe1f2","#bfd9ec","#abcfe6","#93c3df","#79b5d9","#61a7d1","#4b97c9","#3787c0","#2676b6","#1864aa","#0d539a","#094285","#08306b"],
  ["#f7fcf5","#edf8ea","#e1f4dc","#d3eecd","#c1e6bb","#addea7","#97d494","#80c981","#66bd70","#4daf62","#38a055","#268f48","#157f3b","#076e2f","#015a24","#00441b"],
  ["#ffffff","#f7f7f7","#ededed","#e2e2e2","#d5d5d5","#c6c6c6","#b4b4b4","#a1a1a1","#8d8d8d","#7a7a7a","#686868","#555555","#404040","#292929","#141414","#000000"],
  ["#fff5eb","#feeddb","#fee4c9","#fdd8b3","#fdca99","#fdb97e","#fda762","#fc9649","#f98332","#f2701d","#e85e0e","#d94e06","#c44103","#ab3803","#942f03","#7f2704"],
  ["#fcfbfd","#f5f3f9","#edebf4","#e2e1ef","#d5d5e8","#c6c6e1","#b6b5d8","#a6a4ce","#9693c5","#8782bc","#796eb2","#6d57a6","#61409b","#562a91","#4a1587","#3f007d"],
  ["#fff5f0","#fee9e0","#fedbcc","#fdc9b4","#fcb59b","#fca082","#fc8a6b","#fb7455","#f75d43","#ef4533","#e23028","#d01f20","#bb151a","#a40f16","#870811","#67000d"],
  ["#f7fcfd","#edf8fa","#e2f4f6","#d5efed","#c2e8e1","#aadfd2","#8fd3c1","#75c8ad","#5dbd97","#49b17f","#37a266","#26904e","#157f3c","#076e2f","#015a24","#00441b"],
  ["#f7fcfd","#eaf3f8","#dce9f2","#ccddec","#bbd0e5","#aac3de","#9cb3d5","#92a0cb","#8d8ac0","#8c74b5","#8a5daa","#88469e","#852d8f","#7b177c","#680965","#4d004b"],
  ["#f7fcf0","#ebf7e5","#dff3d9","#d3eece","#c5e8c4","#b3e1bc","#9ed9bb","#87d0c0","#6fc5c8","#58b7cd","#43a5ca","#3092c1","#1d7eb7","#0f6aaa","#095597","#084081"],
  ["#fff7ec","#feefd9","#fee6c4","#fddcaf","#fdd09c","#fdc28c","#fdb07a","#fb9a66","#f88356","#f16c49","#e65339","#d93826","#c81d13","#b30a06","#9a0101","#7f0000"],
  ["#fff7fb","#f5ecf5","#e9e1ef","#dbd8ea","#c9cee4","#b3c4df","#98b9d9","#79aed2","#5ba2cb","#4096c0","#258bac","#0e8292","#037877","#016b5e","#015a49","#014636"],
  ["#fff7fb","#f5eef6","#e9e5f1","#dbdaeb","#c9cfe5","#b4c4df","#9bb9d9","#81aed2","#63a2cb","#4394c3","#2785bb","#1175b0","#0667a1","#045a8d","#034a74","#023858"],
  ["#f7f4f9","#eee9f3","#e5dbec","#dcc9e2","#d3b4d8","#cea0cd","#d08ac2","#d871b5","#e054a5","#e33890","#dd2378","#ce1661","#b70b4f","#9c0442","#810032","#67001f"],
  ["#fff7f3","#feebe7","#fddeda","#fccfcc","#fcbfc0","#fbabb8","#f993b0","#f677a7","#ee5a9f","#e03e98","#cc238e","#b40d83","#99037c","#7e0177","#630171","#49006a"],
  ["#ffffd9","#f5fbc5","#e8f6b7","#d5eeb3","#bae4b5","#97d7b9","#73c9bd","#53bbc1","#39abc2","#2897bf","#217fb7","#2166ac","#234ea0","#203990","#172a77","#081d58"],
  ["#ffffe5","#fafdce","#f2fabb","#e4f4ac","#d2eda0","#bbe395","#a2d88a","#86cc7e","#69be71","#4eaf63","#389d55","#268a48","#15793f","#076938","#015730","#004529"],
  ["#ffffe5","#fffacf","#fff4b9","#feeaa1","#fede86","#fece66","#feba4a","#fda534","#f88e25","#ee7918","#e1640e","#ce5207","#b74304","#9c3704","#812d05","#662506"],
  ["#ffffcc","#fff5b5","#ffeb9d","#fee087","#fed270","#febf5b","#feab4b","#fd9540","#fd7b37","#fa5c2e","#f23d26","#e52420","#d31121","#bc0524","#a00126","#800026"],
  ["#002051","#022c65","#14386d","#2b446e","#42506e","#575c6e","#696970","#787573","#868276","#948f78","#a49d78","#b6ab73","#caba6a","#e0c95d","#f2d950","#fdea45"],
  ["#440154","#481a6c","#472f7d","#414487","#39568c","#31688e","#2a788e","#23888e","#1f988b","#22a884","#35b779","#54c568","#7ad151","#a5db36","#d2e21b","#fde725"],
  ["#000004","#0c0826","#240c4f","#420a68","#5d126e","#781c6d","#932667","#ae305c","#c73e4c","#dd513a","#ed6925","#f8850f","#fca50a","#fac62d","#f2e661","#fcffa4"],
  ["#000004","#0b0924","#20114b","#3b0f70","#57157e","#721f81","#8c2981","#a8327d","#c43c75","#de4968","#f1605d","#fa7f5e","#fe9f6d","#febf84","#fddea0","#fcfdbf"],
  ["#0d0887","#330597","#5002a2","#6a00a8","#8405a7","#9c179e","#b12a90","#c33d80","#d35171","#e16462","#ed7953","#f68f44","#fca636","#fec029","#f9dc24","#f0f921"],
  ["#6e40aa","#883eb1","#a43db3","#bf3caf","#d83fa4","#ee4395","#fe4b83","#ff576e","#ff6659","#ff7847","#ff8c38","#f3a130","#e2b72f","#cfcc36","#bee044","#aff05b"],
  ["#6e40aa","#664dbf","#5a5dd0","#4c6edb","#3d82e1","#2f96e0","#23abd8","#1cbecb","#19d0b8","#1ddfa3","#28ea8d","#3af278","#52f667","#6ff65b","#8ff457","#aff05b"],
  ["#000000","#160c1f","#1a213e","#163d4e","#175a49","#2b6f39","#54792f","#877a3a","#b5795e","#d07e93","#d490c6","#caabe8","#c1caf3","#c8e4f0","#e0f5f0","#ffffff"],
  ["#23171b","#4a41b5","#426ff2","#2f9df5","#25c6d8","#2ee5ae","#4df884","#7bfe5f","#aff444","#dedd32","#feb927","#ff8e1f","#f65f18","#d0330e","#a51403","#900c00"],
  ["#543005","#79470a","#9d6217","#bc8435","#d4ab62","#e6cd94","#f2e4c0","#f3efe1","#e3f0ec","#c3e7e2","#97d5cc","#67bab0","#39988f","#15776e","#03584f","#003c30"],
  ["#40004b","#631d70","#814390","#9a6daa","#b493c2","#ceb4d7","#e4d2e6","#efe9ef","#ebf3e8","#d6eed1","#b6e1b0","#8ccb8b","#5cad65","#328a46","#14672e","#00441b"],
  ["#8e0152","#b1166f","#cc3d8e","#dd72ad","#eaa0ca","#f5c3e0","#fadded","#f8eef2","#f1f5e7","#e1f2ca","#c7e79f","#a5d46f","#80bb47","#5ea02d","#418220","#276419"],
  ["#2d004b","#471c72","#634293","#8170ac","#a198c5","#bebada","#d7d7e9","#ebebef","#f8eddd","#fdddb3","#fcc57f","#f2a549","#dd841f","#c2670c","#a14f07","#7f3b08"],
  ["#67001f","#971228","#bc3238","#d56050","#e98d71","#f6b69a","#fbd7c4","#f7ebe4","#e9eff2","#cde3ee","#a6cfe3","#77b3d5","#4b94c4","#2d75b1","#185490","#053061"],
  ["#67001f","#971228","#bc3238","#d56050","#e98d71","#f6b69a","#fcd8c5","#fdf0e8","#f3f1f0","#dfdfdf","#c6c6c6","#a8a8a8","#868686","#616161","#3c3c3c","#1a1a1a"],
  ["#a50026","#c52128","#e04532","#f16e43","#f99858","#fdbe72","#fedd90","#fdf2b0","#f3f9d2","#dcf1ec","#bce1ed","#99c9e1","#75abd0","#5687be","#4060aa","#313695"],
  ["#a50026","#c52128","#e04532","#f16e43","#f99858","#fdbe70","#fedd8d","#fdf2a9","#f0f7a9","#d7ee8e","#b6e076","#90cf69","#64bc61","#36a456","#148747","#006837"],
  ["#9e0142","#c12949","#de4d4a","#f0704a","#f99858","#fdbe70","#fedd8d","#fdf3a9","#f5faae","#e0f3a1","#bee5a0","#94d4a4","#69bda9","#489bb3","#4575b1","#5e4fa2"],
  ["#6e40aa","#a43db3","#d83fa4","#fe4b83","#ff6659","#ff8c38","#e2b72f","#bee044","#8ff457","#52f667","#28ea8d","#19d0b8","#23abd8","#3d82e1","#5a5dd0","#6e40aa"],
  ["#ff4040","#f47218","#d5a703","#a7d503","#72f418","#40ff40","#18f472","#03d5a7","#03a7d5","#1872f4","#4040ff","#7218f4","#a703d5","#d503a7","#f41872","#ff4040"],
  ///
  ["#f7fbff","#eaf2fb","#ddeaf6","#cfe1f2","#bfd9ec","#abcfe6","#93c3df","#79b5d9","#61a7d1","#4b97c9","#3787c0","#2676b6","#1864aa","#0d539a","#094285","#08306b"],
  ["#f7fcf5","#edf8ea","#e1f4dc","#d3eecd","#c1e6bb","#addea7","#97d494","#80c981","#66bd70","#4daf62","#38a055","#268f48","#157f3b","#076e2f","#015a24","#00441b"],
  ["#ffffff","#f7f7f7","#ededed","#e2e2e2","#d5d5d5","#c6c6c6","#b4b4b4","#a1a1a1","#8d8d8d","#7a7a7a","#686868","#555555","#404040","#292929","#141414","#000000"],
  ["#fff5eb","#feeddb","#fee4c9","#fdd8b3","#fdca99","#fdb97e","#fda762","#fc9649","#f98332","#f2701d","#e85e0e","#d94e06","#c44103","#ab3803","#942f03","#7f2704"],
  ["#fcfbfd","#f5f3f9","#edebf4","#e2e1ef","#d5d5e8","#c6c6e1","#b6b5d8","#a6a4ce","#9693c5","#8782bc","#796eb2","#6d57a6","#61409b","#562a91","#4a1587","#3f007d"],
  ["#fff5f0","#fee9e0","#fedbcc","#fdc9b4","#fcb59b","#fca082","#fc8a6b","#fb7455","#f75d43","#ef4533","#e23028","#d01f20","#bb151a","#a40f16","#870811","#67000d"],
  ["#f7fcfd","#edf8fa","#e2f4f6","#d5efed","#c2e8e1","#aadfd2","#8fd3c1","#75c8ad","#5dbd97","#49b17f","#37a266","#26904e","#157f3c","#076e2f","#015a24","#00441b"],
  ["#f7fcfd","#eaf3f8","#dce9f2","#ccddec","#bbd0e5","#aac3de","#9cb3d5","#92a0cb","#8d8ac0","#8c74b5","#8a5daa","#88469e","#852d8f","#7b177c","#680965","#4d004b"],
  ["#f7fcf0","#ebf7e5","#dff3d9","#d3eece","#c5e8c4","#b3e1bc","#9ed9bb","#87d0c0","#6fc5c8","#58b7cd","#43a5ca","#3092c1","#1d7eb7","#0f6aaa","#095597","#084081"],
  ["#fff7ec","#feefd9","#fee6c4","#fddcaf","#fdd09c","#fdc28c","#fdb07a","#fb9a66","#f88356","#f16c49","#e65339","#d93826","#c81d13","#b30a06","#9a0101","#7f0000"],
  ["#fff7fb","#f5ecf5","#e9e1ef","#dbd8ea","#c9cee4","#b3c4df","#98b9d9","#79aed2","#5ba2cb","#4096c0","#258bac","#0e8292","#037877","#016b5e","#015a49","#014636"],
  ["#fff7fb","#f5eef6","#e9e5f1","#dbdaeb","#c9cfe5","#b4c4df","#9bb9d9","#81aed2","#63a2cb","#4394c3","#2785bb","#1175b0","#0667a1","#045a8d","#034a74","#023858"],
  ["#f7f4f9","#eee9f3","#e5dbec","#dcc9e2","#d3b4d8","#cea0cd","#d08ac2","#d871b5","#e054a5","#e33890","#dd2378","#ce1661","#b70b4f","#9c0442","#810032","#67001f"],
  ["#fff7f3","#feebe7","#fddeda","#fccfcc","#fcbfc0","#fbabb8","#f993b0","#f677a7","#ee5a9f","#e03e98","#cc238e","#b40d83","#99037c","#7e0177","#630171","#49006a"],
  ["#ffffd9","#f5fbc5","#e8f6b7","#d5eeb3","#bae4b5","#97d7b9","#73c9bd","#53bbc1","#39abc2","#2897bf","#217fb7","#2166ac","#234ea0","#203990","#172a77","#081d58"],
  ["#ffffe5","#fafdce","#f2fabb","#e4f4ac","#d2eda0","#bbe395","#a2d88a","#86cc7e","#69be71","#4eaf63","#389d55","#268a48","#15793f","#076938","#015730","#004529"],
  ["#ffffe5","#fffacf","#fff4b9","#feeaa1","#fede86","#fece66","#feba4a","#fda534","#f88e25","#ee7918","#e1640e","#ce5207","#b74304","#9c3704","#812d05","#662506"],
  ["#ffffcc","#fff5b5","#ffeb9d","#fee087","#fed270","#febf5b","#feab4b","#fd9540","#fd7b37","#fa5c2e","#f23d26","#e52420","#d31121","#bc0524","#a00126","#800026"],
  ["#002051","#022c65","#14386d","#2b446e","#42506e","#575c6e","#696970","#787573","#868276","#948f78","#a49d78","#b6ab73","#caba6a","#e0c95d","#f2d950","#fdea45"],
  ["#440154","#481a6c","#472f7d","#414487","#39568c","#31688e","#2a788e","#23888e","#1f988b","#22a884","#35b779","#54c568","#7ad151","#a5db36","#d2e21b","#fde725"],
  ["#000004","#0c0826","#240c4f","#420a68","#5d126e","#781c6d","#932667","#ae305c","#c73e4c","#dd513a","#ed6925","#f8850f","#fca50a","#fac62d","#f2e661","#fcffa4"],
  ["#000004","#0b0924","#20114b","#3b0f70","#57157e","#721f81","#8c2981","#a8327d","#c43c75","#de4968","#f1605d","#fa7f5e","#fe9f6d","#febf84","#fddea0","#fcfdbf"],
  ["#0d0887","#330597","#5002a2","#6a00a8","#8405a7","#9c179e","#b12a90","#c33d80","#d35171","#e16462","#ed7953","#f68f44","#fca636","#fec029","#f9dc24","#f0f921"],
  ["#6e40aa","#883eb1","#a43db3","#bf3caf","#d83fa4","#ee4395","#fe4b83","#ff576e","#ff6659","#ff7847","#ff8c38","#f3a130","#e2b72f","#cfcc36","#bee044","#aff05b"],
  ["#6e40aa","#664dbf","#5a5dd0","#4c6edb","#3d82e1","#2f96e0","#23abd8","#1cbecb","#19d0b8","#1ddfa3","#28ea8d","#3af278","#52f667","#6ff65b","#8ff457","#aff05b"],
  ["#000000","#160c1f","#1a213e","#163d4e","#175a49","#2b6f39","#54792f","#877a3a","#b5795e","#d07e93","#d490c6","#caabe8","#c1caf3","#c8e4f0","#e0f5f0","#ffffff"],
  ["#23171b","#4a41b5","#426ff2","#2f9df5","#25c6d8","#2ee5ae","#4df884","#7bfe5f","#aff444","#dedd32","#feb927","#ff8e1f","#f65f18","#d0330e","#a51403","#900c00"],
  ["#543005","#79470a","#9d6217","#bc8435","#d4ab62","#e6cd94","#f2e4c0","#f3efe1","#e3f0ec","#c3e7e2","#97d5cc","#67bab0","#39988f","#15776e","#03584f","#003c30"],
  ["#40004b","#631d70","#814390","#9a6daa","#b493c2","#ceb4d7","#e4d2e6","#efe9ef","#ebf3e8","#d6eed1","#b6e1b0","#8ccb8b","#5cad65","#328a46","#14672e","#00441b"],
  ["#8e0152","#b1166f","#cc3d8e","#dd72ad","#eaa0ca","#f5c3e0","#fadded","#f8eef2","#f1f5e7","#e1f2ca","#c7e79f","#a5d46f","#80bb47","#5ea02d","#418220","#276419"],
  ["#2d004b","#471c72","#634293","#8170ac","#a198c5","#bebada","#d7d7e9","#ebebef","#f8eddd","#fdddb3","#fcc57f","#f2a549","#dd841f","#c2670c","#a14f07","#7f3b08"],
  ["#67001f","#971228","#bc3238","#d56050","#e98d71","#f6b69a","#fbd7c4","#f7ebe4","#e9eff2","#cde3ee","#a6cfe3","#77b3d5","#4b94c4","#2d75b1","#185490","#053061"],
  ["#67001f","#971228","#bc3238","#d56050","#e98d71","#f6b69a","#fcd8c5","#fdf0e8","#f3f1f0","#dfdfdf","#c6c6c6","#a8a8a8","#868686","#616161","#3c3c3c","#1a1a1a"],
  ["#a50026","#c52128","#e04532","#f16e43","#f99858","#fdbe72","#fedd90","#fdf2b0","#f3f9d2","#dcf1ec","#bce1ed","#99c9e1","#75abd0","#5687be","#4060aa","#313695"],
  ["#a50026","#c52128","#e04532","#f16e43","#f99858","#fdbe70","#fedd8d","#fdf2a9","#f0f7a9","#d7ee8e","#b6e076","#90cf69","#64bc61","#36a456","#148747","#006837"],
  ["#9e0142","#c12949","#de4d4a","#f0704a","#f99858","#fdbe70","#fedd8d","#fdf3a9","#f5faae","#e0f3a1","#bee5a0","#94d4a4","#69bda9","#489bb3","#4575b1","#5e4fa2"],
  ["#6e40aa","#a43db3","#d83fa4","#fe4b83","#ff6659","#ff8c38","#e2b72f","#bee044","#8ff457","#52f667","#28ea8d","#19d0b8","#23abd8","#3d82e1","#5a5dd0","#6e40aa"],
  ["#ff4040","#f47218","#d5a703","#a7d503","#72f418","#40ff40","#18f472","#03d5a7","#03a7d5","#1872f4","#4040ff","#7218f4","#a703d5","#d503a7","#f41872","#ff4040"]
  
  
  ];


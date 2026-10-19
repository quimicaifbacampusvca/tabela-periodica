/* Pure presentation rules, shared by the browser and the validation script. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CordelElementModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const EV_TO_KJ_MOL=96.48533212331002;
  const isNumber=value=>typeof value==='number'&&Number.isFinite(value);
  const format=(value,max=5)=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:max}).format(value);
  function display(model,key,units={temperature:'C',energy:'eV'}){
    const value=model[key];
    if(!isNumber(value))return 'Não disponível nesta base';
    if(key==='fusion'||key==='boiling')return units.temperature==='K'?`${format(value+273.15,2)} K`:`${format(value,2)} °C`;
    if(key==='ei')return units.energy==='kJ'?`${format(value*EV_TO_KJ_MOL,2)} kJ/mol`:`${format(value,5)} eV`;
    return `${format(value,key==='en'?3:5)}${key==='radius'?' pm':''}`;
  }
  function compare(a,b,key){
    const result={comparable:false,bars:[0,0],note:''};
    if(!isNumber(a[key])||!isNumber(b[key])){
      result.note='Falta um valor nesta base. A ausência não representa zero, por isso as barras não são exibidas.';return result;
    }
    if(key==='radius'&&a.radiusType!==b.radiusType){
      result.note='Os raios usam definições diferentes: covalente e de van der Waals. Os números podem ser consultados, mas não são colocados na mesma escala de comparação.';return result;
    }
    const temperature=key==='fusion'||key==='boiling';
    if(temperature&&(!a.temperatureComparable||!b.temperatureComparable)){
      result.note='Há estimativa, sublimação ou condição especial nesta dupla. Consulte as notas dos folhetos; as temperaturas não recebem uma comparação direta por barras.';return result;
    }
    const values=[a[key],b[key]].map(v=>temperature?v+273.15:v);
    const maximum=Math.max(...values);
    if(maximum<=0||values.some(v=>v<0))return {...result,note:'Esta escala não permite uma comparação por barras.'};
    result.comparable=true;result.bars=values.map(v=>Math.max(0,Math.min(100,100*v/maximum)));
    const larger=a[key]===b[key]?null:a[key]>b[key]?a:b;
    result.note=larger?`${larger.name} tem o maior valor tabulado nesta dupla. `:'Os valores tabulados nesta dupla são iguais. ';
    if(temperature)result.note+='As barras partem do zero absoluto (0 K), mesmo na leitura em °C. Pressão e forma da substância afetam as transições.';
    else if(key==='radius')result.note+=`Ambos os raios são ${a.radiusType==='vdW'?'de van der Waals':'covalentes'}. ${a.radiusSource===b.radiusSource?'O conjunto de referência é o mesmo.':'Os conjuntos de referência diferem; a leitura é indicativa.'}`;
    else if(key==='en')result.note+='A escala de Pauling é relativa e não tem unidade. Não leia a proporção das barras como uma proporção de força.';
    else result.note+='A medida considera o primeiro elétron de um átomo neutro no estado gasoso.';
    return result;
  }
  return {EV_TO_KJ_MOL,isNumber,display,compare};
});

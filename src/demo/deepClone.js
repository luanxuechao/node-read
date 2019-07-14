function deepClone(obj){
  let result = {}
  function copy(ret,copyObj){
    for(let key in copyObj){
      if(typeof copyObj[key] !== 'object'){
        ret[key] = copyObj[key]
      }else {
        ret[key] ={};
        copy(ret[key],copyObj[key])
      }
    }
    return ret;
  }
  return copy(result,obj);
}
let a = {
  a:1,
  b:"3",
  c:{
    a:1,
    b:{
      a:2,
      c:function(){
        console.log(111);
      }
    }
  }
}
let b = deepClone(a);
console.log(b)
b.c.a=2;
console.log(a,b)

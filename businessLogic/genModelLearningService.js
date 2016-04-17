'use strict'

var dataAccess = require('../dataAccess/learningRepository.js');
var mathService = require('./mathService.js');
/*
Recibe las colecciones historicas
{
  pos,    //arreglo de palabras positivas con su respectivo N° de apariciones
  neg     //arreglo de palabras positivas con su respectivo N° de apariciones
}
Devuelve colecciones modelo. Aquellas palabras mutuamente excluyentes
{
  pos,    //arreglo de palabras positivas con su respectivo N° de apariciones
  neg     //arreglo de palabras positivas con su respectivo N° de apariciones
}
*/
var filterByFrequency = function(historicalKnowledge){
      var totalPositiveHistoricalOccurrences, 
            totalNegativeHistoricalOccurrences,
            positiveProportion,
            negativeProportion,
            Zobs;

      totalPositiveHistoricalOccurrences = mathService.getOcurrencySum(historicalKnowledge.pos);
      totalNegativeHistoricalOccurrences = mathService.getOcurrencySum(historicalKnowledge.neg);
      for (var i = 0; i < historicalKnowledge.pos.length; i++) {

              for (var j = 0; j < historicalKnowledge.neg.length; j++) {
                    if(historicalKnowledge.pos[i].word == historicalKnowledge.neg[j].word){
                          console.log(historicalKnowledge.pos[i].word);
                          positiveProportion = historicalKnowledge.pos[i].occurrences / totalPositiveHistoricalOccurrences;
                          negativeProportion = historicalKnowledge.neg[j].occurrences / totalNegativeHistoricalOccurrences;
                          console.log('filterByFrequency: console.log(positiveProportion);');
                          console.log(positiveProportion);
                          console.log('filterByFrequency: console.log(negativeProportion);');
                          console.log(negativeProportion);

                          Zobs = mathService.getZobs(positiveProportion, negativeProportion, totalPositiveHistoricalOccurrences, totalNegativeHistoricalOccurrences);

                          if(Zobs<mathService.Zc95_neg || Zobs>mathService.Zc95_pos){

                                  if((positiveProportion) > (negativeProportion)){
                                        historicalKnowledge.neg.splice(j, 1); //se elimina el elemento
                                        j--;
                                  }else {
                                        historicalKnowledge.pos.splice(i, 1); //se elimina el elemento
                                        i--;
                                  }
                          }else{
                                  historicalKnowledge.neg.splice(j, 1); //se elimina el elemento
                                  historicalKnowledge.pos.splice(i, 1); //se elimina el elemento
                                  i--;
                                  j--;
                          }
                          break;
                    }
              }
      }

    return historicalKnowledge; //conocimiento histórico transformado a modelo
};


//Recibe un arreglo ordenado decendentemente y un número máximo de ocurrencias
//Devuelve un arreglo con las palabras más representativas
var getMostRepresentativeWords = function(wordsArray, maxOccurrences){
      var representativeWords=[];
      var sumOccurrences = 0;
      var i = 0;
      while (sumOccurrences<=maxOccurrences){
              //console.log('getMostRepresentativeWords: while: console.log(wordsArray[i]);');
              //console.log(wordsArray[i]);

              representativeWords.push(wordsArray[i]);

              //console.log('getMostRepresentativeWords: while: console.log(representativeWords);');
              //console.log(representativeWords);

              sumOccurrences += wordsArray[i].occurrences;
              i++;
      }
      return representativeWords;
};


/*Genera las colleciones modelo a partir de una histórica, para ambos sentimientos: positivo, negativo
Recibe las colecciones historicas
{
  pos,    //arreglo de palabras positivas con su respectivo N° de apariciones
  neg     //arreglo de palabras positivas con su respectivo N° de apariciones
}
Devuelve colecciones modelo. Aquellas palabras más representativas y mutuamente excluyentes
{
  pos,    //arreglo de palabras positivas con su respectivo N° de apariciones
  neg     //arreglo de palabras positivas con su respectivo N° de apariciones
}
*/
exports.generateModel = function(historicalKnowledge, callback){
      var modelKnowledge = {
                                                      "pos": [],
                                                      "neg": []
                                                };
      var maxOccur = 0; // máximo de ocurrencias

      maxOccur = mathService.getPercentilValue (historicalKnowledge.pos, 4, 3);                                                 //máximo de ocurrencias para de la colección positiva
      console.log('console.log(maxOccur);');
      console.log(maxOccur);
      modelKnowledge.pos = getMostRepresentativeWords(historicalKnowledge.pos, maxOccur);//recupera palabras más representativas
      console.log('console.log(modelKnowledge.pos);');
      console.log(modelKnowledge.pos);

      maxOccur = mathService.getPercentilValue (historicalKnowledge.neg, 4, 3);                                                   //máximo de ocurrencias para de la colección negativa
      console.log('console.log(maxOccur);');
      console.log(maxOccur);
      modelKnowledge.neg = getMostRepresentativeWords(historicalKnowledge.neg, maxOccur);//recupera palabras más representativas
      console.log('console.log(modelKnowledge.neg);');
      console.log(modelKnowledge.neg);

      modelKnowledge = filterByFrequency(modelKnowledge);                      //discrimina aquellas que se repitan y tengan una frecuencia "igual"

      callback(modelKnowledge);
};
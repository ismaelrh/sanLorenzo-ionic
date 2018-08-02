
/**
* Servicio para la gestión de la carga de eventos y listas de eventos.
*
* Copyright (C) <2016> <Ismael Rodríguez Hernández>
* All rights reserved.
*
* This software may be modified and distributed under the terms
* of the BSD license.  See the LICENSE file for details.
*/
services.service('UpdateService', ['$http', '$q','EventService','$localstorage','$cordovaDevice',
 function ($http, $q,EventService,$localstorage,$cordovaDevice) {

  /**
  * NOTA: por temas de compatibilidad con versiones de Android menor a la 5,
  * el programa actualizado se guarda en localStorage, no en ficheros.
  * Las funciones estan pensadas para ficheros, pero han sido adaptadas
  * para trabajar de momento con localStorage.
  */

  var self = this;

  var currentVersion = undefined;

  self.lastUpdated = $localstorage.get('lastUpdated',null);

  /**
  * Si es la primera vez que se ejecuta la aplicación, copia el programa local
  * incluido en el APK al storage de Android.
  */
  self.initializeData = function(){




    //Si no es Android, terminamos aquí, pues no se copia ningún fichero.

    var initialized = $localstorage.get('initialized', false);
    if(!initialized){

      //Borramos los favoritos si es la primera vez que se ejecuta -> para no conflictos con version de año pasado
      $localstorage.setObject('favList', {
          list: []
      });

      console.log("Initializing data... copying from local storage");
      return updateFromLocalFiles()
      .then(function(response){
        $localstorage.set('initialized',true);

          EventService.reloadData();


      })
      .catch(function(error){
        console.log(JSON.stringify(error));
      })
    }
    else{

      return $q.when(true);
    }

  }

  /**
  * Se encarga de actualizar, si es posible, los datos de la guía/programa.
  */
  self.update = function(){


    //1.- Leer versión actual programa
    return readCurrentVersion()
    .then(function(version){


      currentVersion = version;


      var uuid = "unknown";
      if(ionic.Platform.isAndroid()){
        uuid = $cordovaDevice.getUUID();
      }

      //2.- Se obtiene versión del servidor
      return $http.get('http://sanlorenzo.ismaelrh.com:8889/events/version?uuid=' + uuid);

    })

    .then(function(response){



      var serverVersion = response.data.version;
      //Si la del servidor es mayor -> se actualiza
      if(serverVersion>currentVersion){
        console.log("UPDATING. Current version: " + currentVersion + ", server version: " + serverVersion);

        //3.- Se obtienen ficheros nuevos
        return getNewFilesFromServer()
        .then(function(responses){

          var promiseArray = [];
          //4.- Se guardan los ficheros
          for(var i = 0; i < responses.length;i++){

            promiseArray.push(saveJSONtoFile('programa-dia'+(i+8),responses[i].data));
          }

          //5.- Una vez guardados todos, se actualiza la versión actual
          return $q.all(promiseArray)
          .then(function(all){
            //6.- Decirle al EventService que refresque.
            return saveCurrentVersion(serverVersion)
            .then(function(response){
              $localstorage.set('lastUpdated',Date.now());
              self.lastUpdated = Date.now();

              EventService.reloadData();

            })
          });
        }); //Update files
      }
      else{

        return $q.when(false); //Not updated -> false
      }
    });
  }


  /**
  * Guarda asíncronamente un objeto como JSON en un fichero.
  */
  function saveJSONtoFile(fileName,object){
     $localstorage.set(fileName,JSON.stringify(object));

     return $q.when(true);
  }

  /**
  * Lee asíncronamente la versión de los datos de programa actuales.
  * Si no hay datos, devuelve -1.
  */
  function readCurrentVersion(){

    var v = JSON.parse($localstorage.get("versionPrograma",'{"version":-1}'));

    //console.log("read version " + v.version);
    return $q.when(v.version);

  }

  /**
  * Actualiza asíncronamente la versión de los datos de programa actuales.
  */
  function saveCurrentVersion(newVersion){
    return saveJSONtoFile("versionPrograma",{"version":newVersion});
  }

  /**
  * Obtiene asíncronamente el programa del día 8 al 15 del servidor web.
  */
  function getNewFilesFromServer(){

    var promises = [];
    for(var i = 8; i <= 15; i++){
      promises.push($http.get('http://sanlorenzo.ismaelrh.com:8889/events/day/'+i));
    }

    return $q.all(promises).then(function (responses) {

      return responses;

    });

  };

  /**
  * Se encarga de actualizar falsamente desde los datos provistos por el APK. Usado una primera vez
  * por si el usuario no tiene internet para actualizar, o el servidor está apagado (se apagará al acabar las fiestas)
  */
  function updateFromLocalFiles(){


    //console.log("Actualizando desde ficheros locales...");
    //Se obtienen todos los ficheros, y cada uno de ellos se va guardando en el storage de Android
    var promises = [
      $http.get("appdata/8.json"),
      $http.get("appdata/9.json"),
      $http.get("appdata/10.json"),
      $http.get("appdata/11.json"),
      $http.get("appdata/12.json"),
      $http.get("appdata/13.json"),
      $http.get("appdata/14.json"),
      $http.get("appdata/15.json"),

    ];

    return $q.all(promises)
    .then(function(responses){



      var savePromises = [];
      //Se guarda cada uno de los archivos obtenidos
      for(var i = 0; i < responses.length; i++){

        savePromises.push(saveJSONtoFile('programa-dia'+(i+8),responses[i].data));
      }

      return $q.all(savePromises);

    })
    .catch(function(error){

    })


  }



















}]);

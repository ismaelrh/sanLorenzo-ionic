
/**
* Servicio de notificaciones. Se encarga de gestionar los recordatorios.
*
* Copyright (C) <2015> <Ismael Rodríguez Hernández>
* All rights reserved.
*
* This software may be modified and distributed under the terms
* of the BSD license.  See the LICENSE file for details.
*/
services.service('NotificationService', ['EventService', '$state','$cordovaLocalNotification', function (EventService, $state,$cordovaLocalNotification) {


  var month = 7; //Es uno menos, 7 es Agosto
  var year = 2018;

  var self = this;



  /**
  * Añade un recordatorio para el evento "id" con un adelanto de "adelanto" minutos.
  */
  this.addReminder = function (id, adelanto) {

    //Carga el evento para obtener sus datos
    EventService.get(id).
    then(function(data){
      setAlarm(data,adelanto);
    });


  };

  //Cancela una notificacion
  this.removeReminder = function (id) {
    cordova.plugins.notification.local.cancel(id, function () {
      // Se cancela la notificacion
    });
  };


  //Llama a la funcion callback con el resultado true o false de si está definido el recordatorio
  this.isScheduled = function (id, callback) {
    cordova.plugins.notification.local.isPresent(id, callback);
  };


  //Funciones privadas

  //Devuelve la hora dada una cadena de hora
  var getHour = function (hour_text) {
    dosPuntos = hour_text.indexOf(":");
    if (dosPuntos > -1) {
      return hour_text.substr(0, dosPuntos);

    }
    return undefined;
  };

  //Devuelve el minuto dada una cadena de hora
  var getMinute = function (hour_text) {
    dosPuntos = hour_text.indexOf(":");
    if (dosPuntos > -1) {
      return hour_text.substr(dosPuntos + 1, 2);
    }
    return undefined;
  }

  /*
  * Programa alarma para evento con un adelanto determinado
  */
  function setAlarm(data,adelanto) {

    var event = data;

    //Se saca la hora y el minuto
    var time = event["hour"];

    var day = event["day"];
    var hour = getHour(time);
    var minute = getMinute(time);

    //Si la hora es las 24, se suma un dia y serán las 0:00
    //Si no lo es, se queda como esta, ya que a partir de las 0:01 esta marcado
    //en los datos como siguiente dia
    if (hour == 24 || hour == "24") {
      day++;
      hour = 0;
    }


    var alarmTime = new Date(year, month, day, hour, minute, 0, 0);


    //Restamos para avisar antes
    var MS_PER_MINUTE = 60000;
    var finalAlarmTime = new Date(alarmTime.getTime() - adelanto * MS_PER_MINUTE);

    var notificationObject = {id:data.id, trigger: {at: finalAlarmTime}, icon:"res://icon.png",smallIcon:"res://ic_stat_notification.png"};

    var version = parseFloat(ionic.Platform.version());

    if(version>=4.1){ //Multiline notification
      notificationObject.title= "Evento a las " + hour + ":" + minute;
      notificationObject.text=  event.title + "\n🕗 " + hour + ":" + minute + "\n📍 " + event.place_text;
    }
    else{
      notificationObject.title =  "Evento a las " + hour + ":" + minute;
      notificationObject.text =  event["title"];
    }
    //Se programa la notificacion
    cordova.plugins.notification.local.schedule(notificationObject);


    //Llamado al clickar en una notificacion, abre la pantalla de detalle
    cordova.plugins.notification.local.on("click", function (notification, state) {
      $state.go('app.eventDetail', {eventId: notification.id})


    }, this);


  };



}]);

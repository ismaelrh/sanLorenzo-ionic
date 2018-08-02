/**
 * Controlador del detalle de un evento
 *
 *
 * Copyright (C) <2015> <Ismael Rodríguez Hernández>
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */
controllers.controller('EventDetailCtrl', ["$scope","$stateParams","$compile","EventService","FavoriteService","$ionicLoading","NotificationService","$ionicModal","$ionicPopup","$http","$cordovaToast","$cordovaSocialSharing",
    function ($scope, $stateParams, $compile, EventService, FavoriteService, $ionicLoading, NotificationService, $ionicModal, $ionicPopup,$http,$cordovaToast,$cordovaSocialSharing) {


        $scope.eventId = parseInt($stateParams.eventId); //Id del evento


        $scope.eventPeople = undefined;
        $http.get("http://sanlorenzo.ismaelrh.com:8889/events/fav/"+ $scope.eventId)
        .then(function(response){
          $scope.eventPeople= response.data.count;
        })
        .catch(function(error){

        });


        //Obtenemos los datos del evento
        EventService.get($scope.eventId)
          .then(function(data){

          $scope.event = data;
          });

        //Se obtiene si es favorito
        $scope.favorite = FavoriteService.get($scope.eventId);

        if ($scope.favorite) {
            $scope.textoFavorito = "Favorito";
        }
        else {
            $scope.textoFavorito = "No favorito";
        }


        //Miramos si hay reminder
        $scope.hasReminder = false;

        /*
         Si estamos en Android, se comprueba si tiene reminder el evento.
         Si tiene, y además ya ha pasado, se cancela.
         */
        if (ionic.Platform.isAndroid()) {
            NotificationService.isScheduled($scope.eventId, function (has) {

                $scope.hasReminder = has;

                if (has) {
                    //Si tenia recordatorio, se mira si ya ha pasado.
                    //Si es asi, se elimina.
                    cordova.plugins.notification.local.get($scope.eventId, function (notifications) {
                        var current = new Date();
                        current = current.getTime() / 1000;

                        var programada = notifications.at;
                        var haPasadoNotificacion = (programada < current);

                        $scope.hasReminder = !haPasadoNotificacion;
                        if (haPasadoNotificacion) {
                            //Se elimina si ya ha pasado la notificacion
                            NotificationService.removeReminder($scope.eventId);
                        }
                    });
                }
            });
        }


        /** Funciones **/

            //Devuelve cierto si ya ha pasado el evento indicado
        $scope.hasPassed = function (event) {
            //Se saca la hora y el minuto
            var time = event["hour"];

            var day = event["day"];
            var hour = getHour(time);
            var minute = getMinute(time);

            //Si la hora es las 24, se suma un dia y serán las 0:00
            //Si no lo es, se queda como esta, ya que a partir de las 0:01 esta marcado
            //en los datos como siguiente dia
            if (hour == 24) {
                day++;
                hour = 0;
            }


            var alarmTime = new Date(2018, 7, day, hour, minute, 0, 0);
            var now = new Date();
            return alarmTime.getTime() <= now.getTime();

        };


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
                return  hour_text.substr(dosPuntos + 1, 2);
            }
            return undefined;
        };


        /**
         * Muestra el modal para elegir el tiempo de adelanto de alarma.
         * Si el usuario cancela, devuelve undefined.
         * Si no cancela, añade el recordatorio y devuelve true.
         * Al finalizar, actualiza "hasReminder".
         */
        $scope.showDialogoAlarma = function () {
            $scope.data = {};

            $scope.time = {time:60};



            // An elaborate, custom popup
            var myPopup = $ionicPopup.show({
                templateUrl: 'templates/adelantoModal.html',
                title: '<b>¿Con cuánto tiempo quieres que te avise?</b>',
                scope: $scope,
                buttons: [
                    {text: 'Cancelar'},
                    {
                        text: '<b>Confirmar</b>',
                        type: 'button-positive',
                        onTap: function (e) {

                            //Programamos la alarma
                            var exit = NotificationService.addReminder($scope.eventId, $scope.time.time);
                            if (ionic.Platform.isAndroid()) {
                              $cordovaToast.showShortBottom('Recordatorio programado');
                            }
                            else{
                              $ionicLoading.show({template: 'Recordatorio programado', noBackdrop: true, duration: 700});
                            }


                            return true;

                        }
                    }
                ]
            });
            myPopup.then(function (res) {
                $scope.hasReminder = res;
            });
        };


        //Alterna el estado del recordatorio
        $scope.toggleReminder = function () {

            if ($scope.hasReminder) {
                //Se elimina el recordatorio
                NotificationService.removeReminder($scope.eventId);
                if (ionic.Platform.isAndroid()) {
                  $cordovaToast.showShortBottom('Recordatorio eliminado');
                }
                else{
                  $ionicLoading.show({template: 'Recordatorio eliminado', noBackdrop: true, duration: 700});
                }

                $scope.hasReminder = false;
            }
            else {
                //Se añade un recordatorio
                $scope.showDialogoAlarma();
            }


        };

        //Lanza un mapa
        $scope.launchMap = function () {
            window.open("http://maps.google.com/maps?q=loc:" + $scope.event.place_lat + "," + $scope.event.place_long, "_system");
        };



        $scope.isFav = function () {
            return FavoriteService.get($scope.eventId);
        };

        $scope.favoriteEvent = function () {

            if (!$scope.favorite) {
                //Se pone como favorito
                //$http.get('http://192.168.1.37:4567/dofav/' + $scope.eventId);
                if($scope.eventPeople!=undefined){
                  $scope.eventPeople++;
                }

                FavoriteService.add($scope.eventId);
                $scope.textoFavorito = "Favorito";
                //$ionicLoading.show({template: 'Añadido a favoritos', noBackdrop: true, duration: 1000});


            }
            else {
                //Se quita de favoritos
                  //$http.get('http://192.168.1.37:4567/unfav/' + $scope.eventId);
                FavoriteService.remove($scope.eventId);
                if($scope.eventPeople!=undefined){
                  $scope.eventPeople--;
                }
                $scope.textoFavorito = "No favorito";
                //$ionicLoading.show({template: 'Borrado de favoritos', noBackdrop: true, duration: 1000});
            }
            $scope.favorite = !$scope.favorite;
        };

        //Devuelve cierto si la plataforma es Android
        $scope.isAndroid = function(){
            return ionic.Platform.isAndroid();
        }



        $scope.share = function(){
          $cordovaSocialSharing.share("🎉 " + $scope.event.title + ".\n🕗 Día " + $scope.event.day + " a las " + $scope.event.hour + ".\n📍 " + $scope.event.place_text
          + ".\n\nDescárgate la App de San Lorenzo 2018 en http://bit.ly/2agzaQF",$scope.event.title);
        }

    }]);

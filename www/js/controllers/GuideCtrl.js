/**
 * Controlador de pagina principal de guia.
 *
 * Copyright (C) <2015> <Ismael Rodríguez Hernández>
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */
controllers.controller('GuideCtrl', ["$scope", "$stateParams", "$state", "$http", "EventService","UpdateService",
    function ($scope, $stateParams, $state, $http, EventService,UpdateService) {


    UpdateService.initializeData()
          .then(function(){
            UpdateService.update();
          });
    $scope.lastUpdated = UpdateService.lastUpdated;

        $scope.filtro = ""; //Filtro de busqueda
        $scope.buscarVisible = false; //Indica si la barra de busqueda es visible

        /** Va a la pantalla de listado de eventos, mostrando los eventos del día concreto especificado.
         Puede indicarse -1 para todos los días, o un día de 8 a 15 */
        $scope.openDay = function (d) {

            $state.go('app.eventList', {day: d});
        };


        /** Abre una categoria **/
        $scope.openCategory = function (c) {

            $state.go('app.eventList', {category: c,day:8});
        };


        /** Realiza una busqueda **/
        $scope.buscar = function () {

            $state.go('app.searchList', {term: $scope.filtro});
            $scope.buscarVisible = false;
            $scope.filtro = "";
        };

        /** Alterna la visibilidad del panel de busqueda **/
        $scope.toggleSearch = function () {
            //$scope.add();
            $scope.buscarVisible = !$scope.buscarVisible;

        }

    }]);

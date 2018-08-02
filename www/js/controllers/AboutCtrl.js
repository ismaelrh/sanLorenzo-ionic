/**
 * Controlador de la pagina de acerca de la app.
 * Servicio para la gestion de los eventos favoritos.
 *
 *
 * Copyright (C) <2015> <Ismael Rodríguez Hernández>
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */

controllers.controller('AboutCtrl', ["$scope",function ($scope) {

    //Link a mail al creador
    $scope.mail = function (phone) {
        window.open("mailto:ismaro.394@gmail.com", "_system");
    };

    //Link al twitter del creador
    $scope.twitter = function (phone) {

        window.open("https://twitter.com/ismaro3", "_system");
    };

    //Link al github del creador
    $scope.github = function (phone) {

        window.open("https://github.com/ismaro3/sanLorenzo-ionic", "_system");
    };

    $scope.datumize = function (phone) {

        window.open("https://www.datumize.com", "_system");
    };


}]);
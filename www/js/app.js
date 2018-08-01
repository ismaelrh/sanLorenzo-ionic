/**
 * Configuracion del modulo principal de la app.
 *
 * Copyright (C) <2015> <Ismael Rodríguez Hernández>
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */


app


    .run(function ($ionicPlatform,$animate) {
        $ionicPlatform.ready(function () {

           $animate.enabled(false);





            //Si es Android, se colorea la barra
            if (window.StatusBar) {
                if (ionic.Platform.isAndroid()) {
                    StatusBar.backgroundColorByHexString('#00722d');
                    window.plugins.headerColor.tint("#00722d");
                    //StatusBar.styleDefault();

                } else {
                    StatusBar.styleLightContent();
                }
            }

            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })



    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider,$ionicNativeTransitionsProvider) {

        //El native scrolling solo se activa en Android 4.4+
        if (ionic.Platform.isAndroid()) {
            var version = parseFloat(ionic.Platform.version());
            //version = version.substr(0,3);
            if (version >= 4.4) {

                $ionicConfigProvider.scrolling.jsScrolling(false);
            }
            else {
              $ionicConfigProvider.scrolling.jsScrolling(true);
            }
        }



        $ionicNativeTransitionsProvider.setDefaultOptions({
            duration: 300, // in milliseconds (ms), default 400,
            slowdownfactor: 4, // overlap views (higher number is more) or no overlap (1), default 4
            iosdelay: -1, // ms to wait for the iOS webview to update before animation kicks in, default -1
            androiddelay: -1, // same as above but for Android, default -1
            winphonedelay: -1, // same as above but for Windows Phone, default -1,
            fixedPixelsTop: 0, // the number of pixels of your fixed header, default 0 (iOS and Android)
            fixedPixelsBottom: 0, // the number of pixels of your fixed footer (f.i. a tab bar), default 0 (iOS and Android)
            triggerTransitionEvent: '$ionicView.afterEnter', // internal ionic-native-transitions option
            backInOppositeDirection: false // Takes over default back transition and state back transition to use the opposite direction transition to go back
        });

        //Descomentar para quitar animaciones de transicion entre paginas
        //$ionicConfigProvider.views.transition('none');

        $stateProvider


            //Contiene el menú lateral.
            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html",
                controller: 'AppCtrl'
            })


            //Pantalla principal, con las distintas opciones
            .state('app.main', {
                url: "/main",
                views: {
                    'menuContent': {
                        templateUrl: "templates/main.html",
                        controller: 'MainCtrl'
                    }
                }
            })
            //Pantalla principal de guía
            .state('app.guide', {
                url: "/guide",
                views: {
                    'menuContent': {
                        templateUrl: "templates/guide.html",
                        controller: 'GuideCtrl'
                    }
                }
            })

            //Listado de eventos de una categoría, un día concreto
            .state('app.eventList', {
                url: "/eventlist/:day/:category",
                views: {
                    'menuContent': {
                        templateUrl: "templates/eventList.html",
                        controller: 'EventListCtrl'
                    }
                }
            })
            //Pantalla de resultado de busqueda
            .state('app.searchList', {
                url: "/searchlist/:term",
                views: {
                    'menuContent': {
                        templateUrl: "templates/searchList.html",
                        controller: 'SearchListCtrl'
                    }
                }
            })

            //Pantalla de detalle de un evento
            .state('app.eventDetail', {
                url: "/events/:eventId",
                views: {
                    'menuContent': {
                        templateUrl: "templates/eventDetail.html",
                        controller: 'EventDetailCtrl'
                    }
                }
            })

            //Pantalla de favoritos
            .state('app.favList', {
                url: "/favList",
                views: {
                    'menuContent': {
                        templateUrl: "templates/favList.html",
                        controller: 'FavListCtrl'
                    }
                }
            })

            //Pantalla de telefonos
            .state('app.phones', {
                url: "/phones",
                views: {
                    'menuContent': {
                        templateUrl: "templates/phones.html",
                        controller: 'PhonesCtrl'
                    }
                }
            })

            //Pantalla de informacion sobre las fiestas
            .state('app.info', {
                url: "/info",
                views: {
                    'menuContent': {
                        templateUrl: "templates/info.html",
                        controller: 'InfoCtrl'
                    }
                }
            })

            //Pantalla de informacion sobre la aplicacion
            .state('app.about', {
                url: "/about",
                views: {
                    'menuContent': {
                        templateUrl: "templates/about.html",
                        controller: 'AboutCtrl'
                    }
                }
            });




        //Estado por defecto -> pantalla principal
        $urlRouterProvider.otherwise('/app/main');

    });

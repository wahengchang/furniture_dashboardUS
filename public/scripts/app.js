(function() {
    'use strict';

    angular.module('app', [
            // Angular modules
            'ngRoute',
            'ngAnimate',
            'ngAria',
            'ngCookies',

            // 3rd Party Modules
            'ui.bootstrap',
            'easypiechart',
            'ui.tree',
            'ngMap',
            'ngTagsInput',
            'textAngular',
            'angular-loading-bar',
            'duScroll',
            'ui.router',
            'restangular',

            // Custom modules
            'app.nav',
            'app.i18n',
            'app.chart',
            'app.ui',
            'app.ui.form',
            'app.ui.form.validation',
            'app.ui.map',
            'app.page',
            'app.table',
            'app.task'
        ])
        // us platform
        .value('appId', 'zOeHyoBaS5BeossH2VYOUve2-MdYXbMMI')
        .value('restKey', 'IrSIeFshPa3a4m7UjIqmnKEU')
        // development platform
        // .value('appId', '3xYQCC3PO6Y2KRogpgd6XkD4-gzGzoHsz')
        // .value('restKey', 'e9mr7cH5pL80TUoUat1mvkp7')

        // .value('appId', 'mMddyjSkBPchwip9IMchINuo-gzGzoHsz')
        // .value('restKey', 'X4vsdHjyt8yOeAKbqxddLpCH')
        .value('_', window._)
        .value('sessionKey', 'iStaging')
        .run(function($rootScope, user, $state) {
            $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
                if (toState.name !== 'login') {
                    if (!user.checkSession()) {
                        event.preventDefault();
                        user.init().then(function() {
                            $state.go(toState, toParams);
                        });
                    }
                }
            });
        })
        .factory('getSession', function($cookieStore, sessionKey) {
            return function() {
                return $cookieStore.get(sessionKey) || null;
            };
        })
        .factory('getFileRest', function(getParseRest, appId, restKey, getSession) {
            return function() {
                return getParseRest(appId, restKey, getSession(), 'https://us-api.leancloud.cn/1.1/files/', true);
                // return getParseRest(appId, restKey, getSession(), 'https://api.leancloud.cn/1.1/files/', true);
            };
        })
        .factory('getClassRest', function(getParseRest, appId, restKey, getSession) {
            return function() {
                return getParseRest(appId, restKey, getSession());
            };
        })
        .factory('getBaseRest', function(getParseRest, appId, restKey, getSession) {
            return function() {
                return getParseRest(appId, restKey, getSession(), 'https://us-api.leancloud.cn/1.1/');
                // return getParseRest(appId, restKey, getSession(), 'https://api.leancloud.cn/1.1/');
            };
        })

    .factory('getFunctionsRest', function(getParseRest, appId, restKey, getSession) {
        return function() {
            return getParseRest(appId, restKey, getSession(), 'https://us-api.leancloud.cn/1.1/functions/');
            // return getParseRest(appId, restKey, getSession(), 'https://api.leancloud.cn/1.1/functions/');
        };
    })

    .factory('getParseRest', function(Restangular) {
        return function(appId, restKey, sessionKey, baseUrl, isFile) {
            return Restangular.withConfig(function(RestangularConfigurer) {

                if (!!baseUrl) {
                    RestangularConfigurer.setBaseUrl(baseUrl);
                } else {
                    RestangularConfigurer.setBaseUrl('https://us-api.leancloud.cn/1.1/classes/');
                    // RestangularConfigurer.setBaseUrl('https://api.leancloud.cn/1.1/classes/');
                    RestangularConfigurer.addRequestInterceptor(function(element, operation) {
                        if ('put' === operation) {
                            delete element.createdAt;
                            delete element.updatedAt;
                        }

                        return element;
                    });
                }

                if (!!sessionKey) {
                    RestangularConfigurer.setDefaultHeaders({
                        'X-LC-Id': appId,
                        'X-LC-Key': restKey,
                        'X-LC-Session': sessionKey
                    });
                } else {
                    RestangularConfigurer.setDefaultHeaders({
                        'X-LC-Id': appId,
                        'X-LC-Key': restKey
                    });
                }

                if (!!isFile) {
                    RestangularConfigurer.setDefaultHttpFields({
                        transformRequest: angular.identity
                    });
                } else {
                    RestangularConfigurer.setRestangularFields({
                        id: 'objectId'
                    });
                }

                RestangularConfigurer.setResponseExtractor(function(response) {
                    if (response.count) {
                        return response;
                    } else {
                        return response.results ? response.results : response;
                    }
                });
            });
        };
    });
})();

;
(function() {
    'use strict';

    angular.module('app')
        .config(function($stateProvider, $urlRouterProvider) {
            //
            // For any unmatched url, redirect to /state1

            $urlRouterProvider.otherwise('/login');

            $stateProvider
                .state('brands', {
                    url: '^/brands?{:page:p1}&{:search:s1}&{:order:o1}',
                    templateUrl: 'views/common-list-page.html',
                    controller: 'CommonListPageCtrl',
                    data: {
                        'rows': [{
                            'title': '標題',
                            'name': 'title',
                            'class': 'col-md-4'
                        }, {
                            'title': 'description',
                            'name': 'description',
                            'class': 'col-md-4'
                        }, {
                            'func': ['edit', 'delete'],
                            'title': '#',
                            'class': 'col-md-2'
                        }],
                        'addable': true,
                        'parseClassName': 'Brands',
                        'title': '品牌',
                        'searchAble': true,
                        'searchCols': ['title']
                    }
                })
                .state('brands-edit', {
                    url: '^/brands-edit/:objectId?{:newly:date}',
                    templateUrl: 'views/common-item-page.html',
                    controller: 'CommonItemPageCtrl',
                    data: {
                        'attrs': [{
                            'name': 'title',
                            'title': '標題',
                            'type': 'text',
                            'maxlength': 30
                        }, {
                            'name': 'slug',
                            'title': 'Slug',
                            'type': 'text',
                            'maxlength': 30
                        }, {
                            'name': 'description',
                            'title': '描述',
                            'type': 'textarea',
                            'maxlength': 300
                        }],
                        'refGrid': {
                            'filter': 'brand',
                            'refClassName': 'Products',
                            'stateName': 'products-edit'
                        },
                        'parseClassName': 'Brands',
                        'title': '品牌'
                    }
                });


            $stateProvider
                .state('categories', {
                    url: '^/categories?{:page:p1}&{:search:s1}&{:order:o1}',
                    templateUrl: 'views/common-list-page.html',
                    controller: 'CommonListPageCtrl',
                    data: {
                        'rows': [{
                            'title': '標題',
                            'name': 'title',
                            'class': 'col-md-4'
                        }, {
                            'title': 'description',
                            'name': 'description',
                            'class': 'col-md-4'
                        }, {
                            'func': ['edit', 'delete'],
                            'title': '#',
                            'class': 'col-md-2'
                        }],
                        'addable': true,
                        'parseClassName': 'Categories',
                        'title': '分類',
                        'searchAble': true,
                        'searchCols': ['title']
                    }
                })
                .state('categories-edit', {
                    url: '^/categories-edit/:objectId?{:newly:date}',
                    templateUrl: 'views/common-item-page.html',
                    controller: 'CommonItemPageCtrl',
                    data: {
                        'attrs': [{
                            'name': 'title',
                            'title': '標題',
                            'type': 'text',
                            'maxlength': 30
                        }, {
                            'name': 'slug',
                            'title': 'Slug',
                            'type': 'text',
                            'maxlength': 30
                        }, {
                            'name': 'order',
                            'title': 'Order',
                            'type': 'number'
                        }, {
                            'name': 'description',
                            'title': '描述',
                            'type': 'textarea',
                            'maxlength': 300
                        }],
                        'refGrid': {
                            'filter': 'categorieIDs',
                            'refClassName': 'Products',
                            'stateName': 'products-edit',
                            'isArray': true
                        },
                        'parseClassName': 'Categories',
                        'title': '分類'
                    }
                });



            $stateProvider
                .state('interior-design', {
                    url: '^/interior-design?{:page:p1}&{:search:s1}&{:order:o1}',
                    templateUrl: 'views/common-list-page.html',
                    controller: 'CommonListPageCtrl',
                    data: {
                        'rows': [{
                            'func': ['images'],
                            'name': 'images',
                            'title': '縮圖',
                            'class': 'col-md-1'
                        }, {
                            'title': '標題',
                            'name': 'title',
                            'class': 'col-md-9'
                        }, {
                            'func': ['edit', 'delete'],
                            'title': '#',
                            'class': 'col-md-2'
                        }],
                        'addable': true,
                        'parseClassName': 'InteriorDesign',
                        'title': '風格',
                        'searchAble': true,
                        'searchCols': ['title']
                    }
                })
                .state('interior-design-edit', {
                    url: '^/interior-design-edit/:objectId?{:newly:date}',
                    templateUrl: 'views/common-item-page.html',
                    controller: 'CommonItemPageCtrl',
                    data: {
                        'attrs': [{
                            'name': 'title',
                            'title': '標題',
                            'type': 'text',
                            'maxlength': 30
                        }, {
                            'name': 'slug',
                            'title': 'Slug',
                            'type': 'text',
                            'maxlength': 30
                        }, {
                            'name': 'description',
                            'title': '描述',
                            'type': 'textarea',
                            'maxlength': 1024
                        }, {
                            'name': 'mode',
                            'title': '互動模式',
                            'type': 'radio',
                            'options': [{
                                name: 'VR',
                                value: 'VR'
                            }, {
                                name: 'AR',
                                value: 'AR'
                            }]
                        }, {
                            'name': 'productIds',
                            'title': '包含商品',
                            'type': 'refDataArray',
                            'refClassName': 'Products',
                            'tagsTpl': 'views/tags-product-tpl.html',
                            'autocompleteTpl': 'views/autocomplete-product-tpl.html'
                        }, {
                            'name': 'space',
                            'refClassName': 'Space',
                            'title': '空間',
                            'type': 'refData'
                        }, {
                            'name': 'type',
                            'refClassName': 'InteriorType',
                            'title': '類別',
                            'type': 'refData'
                        }, {
                            'name': 'images',
                            'title': '圖片',
                            'type': 'imgUploader'
                        }, {
                            'name': 'android_object_url',
                            'title': '安卓 3D 物件',
                            'type': 'objUploader'
                        }, {
                            'name': 'ios_object_url',
                            'title': 'ios 3D 物件',
                            'type': 'objUploader'

                        }, {
                            'name': ' avaiable',
                            'title': '上架確認',
                            'type': 'checkbox',
                            'label': 'Yes'
                        }],
                        'parseClassName': 'InteriorDesign',
                        'title': '風格'
                    }
                });

            $stateProvider
                .state('interior-type', {
                    url: '^/interior-type?{:page:p1}&{:search:s1}&{:order:o1}',
                    templateUrl: 'views/common-list-page.html',
                    controller: 'CommonListPageCtrl',
                    data: {
                        'rows': [{
                            'title': '標題',
                            'name': 'title',
                            'class': 'col-md-10'
                        }, {
                            'func': ['edit', 'delete'],
                            'title': '#',
                            'class': 'col-md-2'
                        }],
                        'addable': true,
                        'parseClassName': 'InteriorType',
                        'title': '類型',
                        'searchAble': true,
                        'searchCols': ['title']
                    }
                })
                .state('interior-type-edit', {
                    url: '^/interior-type-edit/:objectId?{:newly:date}',
                    templateUrl: 'views/common-item-page.html',
                    controller: 'CommonItemPageCtrl',
                    data: {
                        'attrs': [{
                            'name': 'title',
                            'title': '標題',
                            'type': 'text',
                            'maxlength': 30
                        }, {
                            'name': 'slug',
                            'title': 'Slug',
                            'type': 'text',
                            'maxlength': 30
                        }],
                        'refGrid': {
                            'filter': 'type',
                            'refClassName': 'InteriorDesign',
                            'stateName': 'interior-design-edit'
                        },
                        'parseClassName': 'InteriorType',
                        'title': '類型'
                    }
                });

            $stateProvider
                .state('products', {
                    url: '^/products?{:page:p1}&{:search:s1}&{:order:o1}',
                    templateUrl: 'views/common-list-page.html',
                    controller: 'CommonListPageCtrl',
                    data: {
                        'rows': [{
                            'func': ['images'],
                            'name': 'images',
                            'title': '縮圖',
                            'class': 'col-md-1'
                        }, {
                            'title': '標題',
                            'name': 'title',
                            'class': 'col-md-6'
                        }, {
                            'title': 'avaiable',
                            'name': 'avaiable',
                            'class': 'col-md-3'
                        }, {
                            'func': ['edit', 'delete'],
                            'title': '#',
                            'class': 'col-md-2'
                        }],
                        'addable': true,
                        'parseClassName': 'Products',
                        'title': '商品',
                        'searchAble': true,
                        'searchCols': ['title', 'sku']
                    }
                })
                .state('products-edit', {
                    url: '^/products-edit/:objectId?{:newly:date}',
                    templateUrl: 'views/common-item-page.html',
                    controller: 'CommonItemPageCtrl',
                    data: {
                        'attrs': [{
                            'name': 'title',
                            'title': '標題',
                            'type': 'text',
                            'maxlength': 100
                        }, {
                            'name': 'slug',
                            'title': 'Slug',
                            'type': 'text',
                            'maxlength': 30
                        }, {
                            'name': 'description',
                            'title': '描述',
                            'type': 'textarea',
                            'maxlength': 600
                        }, {
                            'name': 'sku',
                            'title': 'SKU',
                            'type': 'text',
                            'maxlength': 100
                        }, {
                            'name': 'currency',
                            'title': '幣別',
                            'type': 'currency'
                        }, {
                            'name': 'brand',
                            'refClassName': 'Brands',
                            'title': '廠牌',
                            'type': 'refData'
                        }, {
                            'name': 'categorieIDs',
                            'refClassName': 'Categories',
                            'title': '類別',
                            'type': 'refDataArray'
                        }, {
                            'name': 'price',
                            'title': '價格',
                            'type': 'number'
                        }, {
                            'name': 'width',
                            'title': '寬',
                            'type': 'number'
                        }, {
                            'name': 'height',
                            'title': '高',
                            'type': 'number'
                        }, {
                            'name': 'depth',
                            'title': '深',
                            'type': 'number'
                        }, {
                            'name': 'images',
                            'title': '圖片',
                            'type': 'imgUploader'
                        }, {
                            'name': 'ar',
                            'title': 'AR 開關',
                            'type': 'checkbox',
                            'label': '開啟'
                        }, {
                            'name': 'android_object_url',
                            'title': '安卓 3D 物件',
                            'type': 'objUploader'
                        }, {
                            'name': 'ios_object_url',
                            'title': 'ios 3D 物件',
                            'type': 'objUploader'
                        }, {
                            'name': ' avaiable',
                            'title': '上架確認',
                            'type': 'checkbox',
                            'label': 'Yes'
                        }],
                        'refGrid': {
                            'filter': 'productIds',
                            'refClassName': 'InteriorDesign',
                            'stateName': 'interior-design-edit',
                            'isArray': true
                        },
                        'parseClassName': 'Products',
                        'title': '產品'
                    }
                });

            $stateProvider
                .state('space', {
                    url: '^/space?{:page:p1}&{:search:s1}&{:order:o1}',
                    templateUrl: 'views/common-list-page.html',
                    controller: 'CommonListPageCtrl',
                    data: {
                        'rows': [{
                            'title': '標題',
                            'name': 'title',
                            'class': 'col-md-8'
                        }, {
                            'title': 'Seq',
                            'name': 'seq',
                            'class': 'col-md-2'
                        }, {
                            'func': ['edit', 'delete'],
                            'title': '#',
                            'class': 'col-md-2'
                        }],
                        'refGrid': {
                            'filter': 'categorieIDs',
                            'isArray': true
                        },
                        'addable': true,
                        'parseClassName': 'Space',
                        'title': '空間',
                        'searchAble': true,
                        'searchCols': ['title']
                    }
                })
                .state('space-edit', {
                    url: '^/space/:objectId?{:newly:date}',
                    templateUrl: 'views/common-item-page.html',
                    controller: 'CommonItemPageCtrl',
                    data: {
                        'attrs': [{
                            'name': 'title',
                            'title': '標題',
                            'type': 'text',
                            'maxlength': 30
                        }, {
                            'name': 'seq',
                            'title': 'Seq',
                            'type': 'number'
                        }],
                        'refGrid': {
                            'filter': 'space',
                            'refClassName': 'InteriorDesign',
                            'stateName': 'interior-design-edit'
                        },
                        'parseClassName': 'Space',
                        'title': '空間'
                    }
                });



            $stateProvider.state('login', {
                url: '/login',
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            });
        });

})();

;
(function() {
    'use strict';

    angular.module('app')
        .controller('AppCtrl', function AppCtrl($scope, $rootScope, $route, $document, $window, user) {

            var date = new Date();
            var year = date.getFullYear();

            $scope.main = {
                brand: 'Slim',
                name: 'Lisa',
                year: year
            };

            $scope.pageTransitionOpts = [{
                name: 'Fade up',
                'class': 'animate-fade-up'
            }, {
                name: 'Scale up',
                'class': 'ainmate-scale-up'
            }, {
                name: 'Slide in from right',
                'class': 'ainmate-slide-in-right'
            }, {
                name: 'Flip Y',
                'class': 'animate-flip-y'
            }];

            $scope.admin = {
                layout: 'wide', // 'boxed', 'wide'
                menu: 'vertical', // 'horizontal', 'vertical', 'collapsed'
                fixedHeader: true, // true, false
                fixedSidebar: true, // true, false
                pageTransition: $scope.pageTransitionOpts[0], // unlimited
                skin: '11' // 11,12,13,14,15,16; 21,22,23,24,25,26; 31,32,33,34,35,36
            };

            $scope.$watch('admin', function(newVal, oldVal) {
                if (newVal.menu === 'horizontal' && oldVal.menu === 'vertical') {
                    $rootScope.$broadcast('nav:reset');
                }
                if (newVal.fixedHeader === false && newVal.fixedSidebar === true) {
                    if (oldVal.fixedHeader === false && oldVal.fixedSidebar === false) {
                        $scope.admin.fixedHeader = true;
                        $scope.admin.fixedSidebar = true;
                    }
                    if (oldVal.fixedHeader === true && oldVal.fixedSidebar === true) {
                        $scope.admin.fixedHeader = false;
                        $scope.admin.fixedSidebar = false;
                    }
                }
                if (newVal.fixedSidebar === true) {
                    $scope.admin.fixedHeader = true;
                }
                if (newVal.fixedHeader === false) {
                    $scope.admin.fixedSidebar = false;
                }
            }, true);

            $scope.color = {
                primary: '#5B90BF',
                success: '#A3BE8C',
                info: '#7FABD2',
                infoAlt: '#B48EAD',
                warning: '#EBCB8B',
                danger: '#BF616A',
                gray: '#DCDCDC'
            };

            $rootScope.$on('$routeChangeSuccess', function() {
                $document.scrollTo(0, 0);
            });

            $rootScope.logout = user.logout;
            
            $rootScope.back = function() {
                $window.history.back();
            };

            // user.init(function(me) {
            //     $scope.me = me;
            // });







        }); // overall control




})();

;
(function () {

    angular.module('app.i18n', ['pascalprecht.translate'])
        .config(['$translateProvider', i18nConfig])
        .controller('LangCtrl', ['$scope', '$translate', LangCtrl]);

        // English, Español, 日本語, 中文, Deutsch, français, Italiano, Portugal, Русский язык, 한국어
        // Note: Used on Header, Sidebar, Footer, Dashboard
        // English:          EN-US
        // Spanish:          Español ES-ES
        // Chinese:          简体中文 ZH-CN
        // Chinese:          繁体中文 ZH-TW
        // French:           français FR-FR

        // Not used:
        // Portugal:         Portugal PT-BR
        // Russian:          Русский язык RU-RU
        // German:           Deutsch DE-DE
        // Japanese:         日本語 JA-JP
        // Italian:          Italiano IT-IT
        // Korean:           한국어 KO-KR


        function i18nConfig($translateProvider) {

            $translateProvider.useStaticFilesLoader({
                prefix: 'i18n/',
                suffix: '.json'
            });

            $translateProvider.preferredLanguage('en');
        }


        function LangCtrl($scope, $translate) {
            $scope.lang = 'English';

            $scope.setLang = function(lang) {
                switch (lang) {
                    case 'English':
                        $translate.use('en');
                        break;
                    case 'Español':
                        $translate.use('es');
                        break;
                    case '中文':
                        $translate.use('zh');
                        break;
                    case '日本語':
                        $translate.use('ja');
                        break;
                    case 'Portugal':
                        $translate.use('pt');
                        break;
                    case 'Русский язык':
                        $translate.use('ru');
                        break;
                }
                return $scope.lang = lang;
            };

            $scope.getFlag = function() {
                var lang;
                lang = $scope.lang;
                switch (lang) {
                    case 'English':
                        return 'flags-american';
                        break;
                    case 'Español':
                        return 'flags-spain';
                        break;
                    case '中文':
                        return 'flags-china';
                        break;
                    case 'Portugal':
                        return 'flags-portugal';
                        break;
                    case '日本語':
                        return 'flags-japan';
                        break;
                    case 'Русский язык':
                        return 'flags-russia';
                        break;
                }
            };

        }

})(); 

;
(function () {
    'use strict';

    angular.module('app.chart', []);
})(); 
;
(function () {
    'use strict';

    angular.module('app.chart')
        .controller('chartCtrl', ['$scope', chartCtrl])
        .controller('flotChartCtrl', ['$scope', flotChartCtrl])
        .controller('sparklineCtrl', ['$scope', sparklineCtrl]);

    function chartCtrl($scope) {
        $scope.easypiechartsm1 = {
            percent: 63,
            options: {
                animate: {
                    duration: 1000,
                    enabled: false
                },
                barColor: $scope.color.success,
                lineCap: 'round',
                size: 120,
                lineWidth: 5
            }
        };

        $scope.easypiechartsm2 = {
            percent: 35,
            options: {
                animate: {
                    duration: 1000,
                    enabled: false
                },
                barColor: $scope.color.info,
                lineCap: 'round',
                size: 120,
                lineWidth: 5
            }
        };

        $scope.easypiechartsm3 = {
            percent: 75,
            options: {
                animate: {
                    duration: 1000,
                    enabled: false
                },
                barColor: $scope.color.warning,
                lineCap: 'round',
                size: 120,
                lineWidth: 5
            }
        };

        $scope.easypiechartsm4 = {
            percent: 66,
            options: {
                animate: {
                    duration: 1000,
                    enabled: false
                },
                barColor: $scope.color.danger,
                lineCap: 'round',
                size: 120,
                lineWidth: 5
            }
        };

        $scope.easypiechart = {
            percent: 65,
            options: {
                animate: {
                    duration: 1000,
                    enabled: true
                },
                barColor: $scope.color.primary,
                lineCap: 'round',
                size: 180,
                lineWidth: 5
            }
        };

        $scope.easypiechart2 = {
            percent: 35,
            options: {
                animate: {
                    duration: 1000,
                    enabled: true
                },
                barColor: $scope.color.success,
                lineCap: 'round',
                size: 180,
                lineWidth: 10
            }
        };

        $scope.easypiechart3 = {
            percent: 68,
            options: {
                animate: {
                    duration: 1000,
                    enabled: true
                },
                barColor: $scope.color.info,
                lineCap: 'square',
                size: 180,
                lineWidth: 20,
                scaleLength: 0
            }
        };
    }

    function flotChartCtrl($scope) {
        var areaChart, barChart, barChartH, lineChart1, sampledata1, sampledata2;

        lineChart1 = {};

        lineChart1.data1 = [[1, 15], [2, 20], [3, 14], [4, 10], [5, 10], [6, 20], [7, 28], [8, 26], [9, 22]];

        $scope.line1 = {};

        $scope.line1.data = [
            {
                data: lineChart1.data1,
                label: 'Trend'
            }
        ];

        $scope.line1.options = {
            series: {
                lines: {
                    show: true,
                    fill: true,
                    fillColor: {
                        colors: [
                            {
                                opacity: 0
                            }, {
                                opacity: 0.3
                            }
                        ]
                    }
                },
                points: {
                    show: true,
                    lineWidth: 2,
                    fill: true,
                    fillColor: "#ffffff",
                    symbol: "circle",
                    radius: 5
                }
            },
            colors: [$scope.color.primary, $scope.color.infoAlt],
            tooltip: true,
            tooltipOpts: {
                defaultTheme: false
            },
            grid: {
                hoverable: true,
                clickable: true,
                tickColor: "#f9f9f9",
                borderWidth: 1,
                borderColor: "#eeeeee"
            },
            xaxis: {
                ticks: [[1, 'Jan.'], [2, 'Feb.'], [3, 'Mar.'], [4, 'Apr.'], [5, 'May'], [6, 'June'], [7, 'July'], [8, 'Aug.'], [9, 'Sept.'], [10, 'Oct.'], [11, 'Nov.'], [12, 'Dec.']]
            }
        };

        areaChart = {};

        areaChart.data1 = [[2007, 15], [2008, 20], [2009, 10], [2010, 5], [2011, 5], [2012, 20], [2013, 28]];

        areaChart.data2 = [[2007, 15], [2008, 16], [2009, 22], [2010, 14], [2011, 12], [2012, 19], [2013, 22]];

        $scope.area = {};

        $scope.area.data = [
            {
                data: areaChart.data1,
                label: "Value A",
                lines: {
                    fill: true
                }
            }, {
                data: areaChart.data2,
                label: "Value B",
                points: {
                    show: true
                },
                yaxis: 2
            }
        ];

        $scope.area.options = {
            series: {
                lines: {
                    show: true,
                    fill: false
                },
                points: {
                    show: true,
                    lineWidth: 2,
                    fill: true,
                    fillColor: "#ffffff",
                    symbol: "circle",
                    radius: 5
                },
                shadowSize: 0
            },
            grid: {
                hoverable: true,
                clickable: true,
                tickColor: "#f9f9f9",
                borderWidth: 1,
                borderColor: "#eeeeee"
            },
            colors: [$scope.color.success, $scope.color.danger],
            tooltip: true,
            tooltipOpts: {
                defaultTheme: false
            },
            xaxis: {
                mode: "time"
            },
            yaxes: [
                {}, {
                    position: "right"
                }
            ]
        };

        sampledata1 = [[1, 65], [2, 59], [3, 90], [4, 81], [5, 56], [6, 55], [7, 68], [8, 45], [9, 66]];

        sampledata2 = [[1, 28], [2, 48], [3, 30], [4, 60], [5, 100], [6, 50], [7, 10], [8, 25], [9, 50]];

        $scope.area1 = {};

        $scope.area1.data = [
            {
                label: " A",
                data: sampledata1,
                bars: {
                    order: 0,
                    fillColor: {
                        colors: [
                            {
                                opacity: 0.3
                            }, {
                                opacity: 0.3
                            }
                        ]
                    },
                    show: true,
                    fill: 1,
                    barWidth: 0.3,
                    align: "center",
                    horizontal: false
                }
            }, {
                data: sampledata2,
                curvedLines: {
                    apply: true
                },
                lines: {
                    show: true,
                    fill: true,
                    fillColor: {
                        colors: [
                            {
                                opacity: 0.2
                            }, {
                                opacity: 0.2
                            }
                        ]
                    }
                }
            }, {
                data: sampledata2,
                label: "D",
                points: {
                    show: true
                }
            }
        ];

        $scope.area1.options = {
            series: {
                curvedLines: {
                    active: true
                },
                points: {
                    lineWidth: 2,
                    fill: true,
                    fillColor: "#ffffff",
                    symbol: "circle",
                    radius: 4
                }
            },
            grid: {
                hoverable: true,
                clickable: true,
                tickColor: "#f9f9f9",
                borderWidth: 1,
                borderColor: "#eeeeee"
            },
            tooltip: true,
            tooltipOpts: {
                defaultTheme: false
            },
            colors: [$scope.color.gray, $scope.color.primary, $scope.color.primary]
        };

        barChart = {};

        barChart.data1 = [[2008, 20], [2009, 10], [2010, 5], [2011, 5], [2012, 20], [2013, 28]];

        barChart.data2 = [[2008, 16], [2009, 22], [2010, 14], [2011, 12], [2012, 19], [2013, 22]];

        barChart.data3 = [[2008, 12], [2009, 30], [2010, 20], [2011, 19], [2012, 13], [2013, 20]];

        $scope.barChart = {};

        $scope.barChart.data = [
            {
                label: "Value A",
                data: barChart.data1
            }, {
                label: "Value B",
                data: barChart.data2
            }, {
                label: "Value C",
                data: barChart.data3
            }
        ];

        $scope.barChart.options = {
            series: {
                stack: true,
                bars: {
                    show: true,
                    fill: 1,
                    barWidth: 0.3,
                    align: "center",
                    horizontal: false,
                    order: 1
                }
            },
            grid: {
                hoverable: true,
                borderWidth: 1,
                borderColor: "#eeeeee"
            },
            tooltip: true,
            tooltipOpts: {
                defaultTheme: false
            },
            colors: [$scope.color.success, $scope.color.info, $scope.color.warning, $scope.color.danger]
        };

        $scope.barChart1 = {};

        $scope.barChart1.data = [
            {
                label: "Value A",
                data: barChart.data1,
                bars: {
                    order: 0
                }
            }, {
                label: "Value B",
                data: barChart.data2,
                bars: {
                    order: 1
                }
            }, {
                label: "Value C",
                data: barChart.data3,
                bars: {
                    order: 2
                }
            }
        ];

        $scope.barChart1.options = {
            series: {
                stack: true,
                bars: {
                    show: true,
                    fill: 1,
                    barWidth: 0.2,
                    align: "center",
                    horizontal: false
                }
            },
            grid: {
                hoverable: true,
                borderWidth: 1,
                borderColor: "#eeeeee"
            },
            tooltip: true,
            tooltipOpts: {
                defaultTheme: false
            },
            colors: [$scope.color.success, $scope.color.info, $scope.color.warning, $scope.color.danger]
        };

        $scope.barChart3 = {};

        $scope.barChart3.data = [
            {
                label: " A",
                data: [[40, 1], [59, 2], [90, 3], [81, 4], [56, 5]],
                bars: {
                    order: 0,
                    fillColor: {
                        colors: [
                            {
                                opacity: 0.3
                            }, {
                                opacity: 0.3
                            }
                        ]
                    }
                }
            }, {
                label: " B",
                data: [[28, 1], [48, 2], [40, 3], [19, 4], [45, 5]],
                bars: {
                    order: 1,
                    fillColor: {
                        colors: [
                            {
                                opacity: 0.3
                            }, {
                                opacity: 0.3
                            }
                        ]
                    }
                }
            }
        ];

        $scope.barChart3.options = {
            series: {
                stack: true,
                bars: {
                    show: true,
                    fill: 1,
                    barWidth: .35,
                    align: "center",
                    horizontal: true
                }
            },
            grid: {
                show: true,
                aboveData: false,
                color: '#eaeaea',
                hoverable: true,
                borderWidth: 1,
                borderColor: "#eaeaea"
            },
            tooltip: true,
            tooltipOpts: {
                defaultTheme: false
            },
            colors: [$scope.color.gray, $scope.color.primary, $scope.color.info, $scope.color.danger]
        };

        barChartH = {};

        barChartH.data1 = [[85, 10], [50, 20], [55, 30]];

        barChartH.data2 = [[77, 10], [60, 20], [70, 30]];

        barChartH.data3 = [[100, 10], [70, 20], [55, 30]];

        $scope.barChart2 = {};

        $scope.barChart2.data = [
            {
                label: "Value A",
                data: barChartH.data1,
                bars: {
                    order: 1
                }
            }, {
                label: "Value B",
                data: barChartH.data2,
                bars: {
                    order: 2
                }
            }, {
                label: "Value C",
                data: barChartH.data3,
                bars: {
                    order: 3
                }
            }
        ];

        $scope.barChart2.options = {
            series: {
                stack: true,
                bars: {
                    show: true,
                    fill: 1,
                    barWidth: 1,
                    align: "center",
                    horizontal: true
                }
            },
            grid: {
                hoverable: true,
                borderWidth: 1,
                borderColor: "#eeeeee"
            },
            tooltip: true,
            tooltipOpts: {
                defaultTheme: false
            },
            colors: [$scope.color.success, $scope.color.info, $scope.color.warning, $scope.color.danger]
        };

        $scope.pieChart = {};

        $scope.pieChart.data = [
            {
                label: "Download Sales",
                data: 12
            }, {
                label: "In-Store Sales",
                data: 30
            }, {
                label: "Mail-Order Sales",
                data: 20
            }, {
                label: "Online Sales",
                data: 19
            }
        ];

        $scope.pieChart.options = {
            series: {
                pie: {
                    show: true
                }
            },
            legend: {
                show: true
            },
            grid: {
                hoverable: true,
                clickable: true
            },
            colors: [$scope.color.primary, $scope.color.success, $scope.color.info, $scope.color.warning, $scope.color.danger],
            tooltip: true,
            tooltipOpts: {
                content: "%p.0%, %s",
                defaultTheme: false
            }
        };

        $scope.donutChart = {};

        $scope.donutChart.data = [
            {
                label: "Download Sales",
                data: 12
            }, {
                label: "In-Store Sales",
                data: 30
            }, {
                label: "Mail-Order Sales",
                data: 20
            }, {
                label: "Online Sales",
                data: 19
            }
        ];

        $scope.donutChart.options = {
            series: {
                pie: {
                    show: true,
                    innerRadius: 0.5
                }
            },
            legend: {
                show: true
            },
            grid: {
                hoverable: true,
                clickable: true
            },
            colors: [$scope.color.primary, $scope.color.success, $scope.color.info, $scope.color.warning, $scope.color.danger],
            tooltip: true,
            tooltipOpts: {
                content: "%p.0%, %s",
                defaultTheme: false
            }
        };

        $scope.donutChart2 = {};

        $scope.donutChart2.data = [
            {
                label: "Download Sales",
                data: 12
            }, {
                label: "In-Store Sales",
                data: 30
            }, {
                label: "Mail-Order Sales",
                data: 20
            }, {
                label: "Online Sales",
                data: 19
            }, {
                label: "Direct Sales",
                data: 15
            }
        ];

        $scope.donutChart2.options = {
            series: {
                pie: {
                    show: true,
                    innerRadius: 0.45
                }
            },
            legend: {
                show: false
            },
            grid: {
                hoverable: true,
                clickable: true
            },
            colors: ["#1BB7A0", "#39B5B9", "#52A3BB", "#619CC4", "#6D90C5"],
            tooltip: true,
            tooltipOpts: {
                content: "%p.0%, %s",
                defaultTheme: false
            }
        };        
    }

    function sparklineCtrl($scope) {
        $scope.demoData1 = {
            data: [3, 1, 2, 2, 4, 6, 4, 5, 2, 4, 5, 3, 4, 6, 4, 7],
            options: {
                type: 'line',
                lineColor: '#fff',
                highlightLineColor: '#fff',
                fillColor: $scope.color.success,
                spotColor: false,
                minSpotColor: false,
                maxSpotColor: false,
                width: '100%',
                height: '150px'
            }
        };

        $scope.simpleChart1 = {
            data: [3, 1, 2, 3, 5, 3, 4, 2],
            options: {
                type: 'line',
                lineColor: $scope.color.primary,
                fillColor: '#fafafa',
                spotColor: false,
                minSpotColor: false,
                maxSpotColor: false
            }
        };

        $scope.simpleChart2 = {
            data: [3, 1, 2, 3, 5, 3, 4, 2],
            options: {
                type: 'bar',
                barColor: $scope.color.primary
            }
        };

        $scope.simpleChart3 = {
            data: [3, 1, 2, 3, 5, 3, 4, 2],
            options: {
                type: 'pie',
                sliceColors: [$scope.color.primary, $scope.color.success, $scope.color.info, $scope.color.infoAlt, $scope.color.warning, $scope.color.danger]
            }
        };

        $scope.tristateChart1 = {
            data: [1, 2, -3, -5, 3, 1, -4, 2],
            options: {
                type: 'tristate',
                posBarColor: $scope.color.success,
                negBarColor: $scope.color.danger
            }
        };

        $scope.largeChart1 = {
            data: [3, 1, 2, 3, 5, 3, 4, 2],
            options: {
                type: 'line',
                lineColor: $scope.color.info,
                highlightLineColor: '#fff',
                fillColor: $scope.color.info,
                spotColor: false,
                minSpotColor: false,
                maxSpotColor: false,
                width: '100%',
                height: '150px'
            }
        };

        $scope.largeChart2 = {
            data: [3, 1, 2, 3, 5, 3, 4, 2],
            options: {
                type: 'bar',
                barColor: $scope.color.success,
                barWidth: 10,
                width: '100%',
                height: '150px'
            }
        };

        $scope.largeChart3 = {
            data: [3, 1, 2, 3, 5],
            options: {
                type: 'pie',
                sliceColors: [$scope.color.primary, $scope.color.success, $scope.color.info, $scope.color.infoAlt, $scope.color.warning, $scope.color.danger],
                width: '150px',
                height: '150px'
            }
        };        
    }


})(); 
;
(function () {
    'use strict';

    angular.module('app.chart')
        .directive('flotChart', flotChart)
        .directive('flotChartRealtime', flotChartRealtime)
        .directive('sparkline', sparkline);

    function flotChart() {
        var directive = {
            restrict: 'A',
            scope: {
                data: '=',
                options: '='
            },
            link: link
        };

        return directive;

        function link(scope, ele, attrs) {
            var data, options, plot;
            data = scope.data;
            options = scope.options;
            
            // console.log data
            // console.log options

            plot = $.plot(ele[0], data, options);            
        }        
    }

    function flotChartRealtime() {
        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        function link(scope, ele, attrs) {
            var data1, data2, getRandomData1, getRandomData2, makeGetRandomData;
            var data, getRandomData, plot, totalPoints, update, updateInterval;

            data1 = [];
            data2 = [];
            totalPoints = 200;
            updateInterval = 200;


            makeGetRandomData = function(data, min, max) {

                function getRandomData() {
                    var i, prev, res, y;
                    if (data.length > 0) {
                        data = data.slice(1);
                    }
                    while (data.length < totalPoints) {
                        prev = (data.length > 0 ? data[data.length - 1] : (min + max)/2);
                        y = prev + Math.random() * 4 - 2;
                        if (y < min) {
                            y = min;
                        } else {
                            if (y > max) {
                                y = max;
                            }
                        }
                        data.push(y);
                    }
                    res = [];
                    i = 0;
                    while (i < data.length) {
                        res.push([i, data[i]]);
                        ++i;
                    }
                    return res;
                }
                return getRandomData;    
            }

            getRandomData1 = makeGetRandomData(data1, 28, 42);
            getRandomData2 = makeGetRandomData(data2, 56, 72);


            update = function() {
                plot.setData([getRandomData1(), getRandomData2()]);
                plot.draw();
                setTimeout(update, updateInterval);
            };


            plot = $.plot(ele[0], [getRandomData1(), getRandomData2()], {
                series: {
                    lines: {
                        show: true,
                        fill: true
                    },
                    shadowSize: 0
                },
                yaxis: {
                    min: 0,
                    max: 100
                },
                xaxis: {
                    show: false
                },
                grid: {
                    hoverable: true,
                    borderWidth: 1,
                    borderColor: '#eeeeee'
                },
                colors: ["#5B90BF", "#CCE7FF"]
            });

            update();
         
        }        
    }

    function sparkline() {
        var directive = {
            restrict: 'A',
            scope: {
                data: '=',
                options: '='
            },
            link: link
        };

        return directive;

        function link(scope, ele, attrs) {
            var data, options, sparkResize, sparklineDraw;

            data = scope.data;

            options = scope.options;

            sparkResize = void 0;

            sparklineDraw = function() {
                ele.sparkline(data, options);
            };

            $(window).resize(function(e) {
                clearTimeout(sparkResize);
                sparkResize = setTimeout(sparklineDraw, 200);
            });

            sparklineDraw();           
        }        
    }    

})(); 
;
(function () {
    'use strict';

    angular.module('app.ui.form', []);
})(); 
;
(function () {
    'use strict';

    // Dependencies: jQuery, related jQuery plugins

    angular.module('app.ui.form')
        .controller('TagsDemoCtrl', ['$scope', TagsDemoCtrl])
        .controller('DatepickerDemoCtrl', ['$scope', DatepickerDemoCtrl])
        .controller('TimepickerDemoCtrl', ['$scope', TimepickerDemoCtrl])
        .controller('TypeaheadCtrl', ['$scope', TypeaheadCtrl])
        .controller('RatingDemoCtrl', ['$scope', RatingDemoCtrl]);

    function TagsDemoCtrl($scope) {
        $scope.tags = ['foo', 'bar'];
    }

    function DatepickerDemoCtrl($scope) {
        $scope.today = function() {
            return $scope.dt = new Date();
        };

        $scope.today();

        $scope.showWeeks = true;

        $scope.toggleWeeks = function() {
            $scope.showWeeks = !$scope.showWeeks;
        };

        $scope.clear = function() {
            $scope.dt = null;
        };

        $scope.disabled = function(date, mode) {
            mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
        };

        $scope.toggleMin = function() {
            var _ref;
            $scope.minDate = (_ref = $scope.minDate) != null ? _ref : {
                "null": new Date()
            };
        };

        $scope.toggleMin();

        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };

        $scope.dateOptions = {
            'year-format': "'yy'",
            'starting-day': 1
        };

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate'];

        $scope.format = $scope.formats[0];
    }

    function TimepickerDemoCtrl($scope) {
        $scope.mytime = new Date();

        $scope.hstep = 1;

        $scope.mstep = 15;

        $scope.options = {
            hstep: [1, 2, 3],
            mstep: [1, 5, 10, 15, 25, 30]
        };

        $scope.ismeridian = true;

        $scope.toggleMode = function() {
            return $scope.ismeridian = !$scope.ismeridian;
        };

        $scope.update = function() {
            var d;
            d = new Date();
            d.setHours(14);
            d.setMinutes(0);
            return $scope.mytime = d;
        };

        $scope.changed = function() {
            return console.log('Time changed to: ' + $scope.mytime);
        };

        $scope.clear = function() {
            return $scope.mytime = null;
        };

    }


    function TypeaheadCtrl($scope) {
        $scope.selected = undefined;
        $scope.states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
    }

    function RatingDemoCtrl($scope) {
        $scope.rate = 7;

        $scope.max = 10;

        $scope.isReadonly = false;

        $scope.hoveringOver = function(value) {
            $scope.overStar = value;
            return $scope.percent = 100 * (value / $scope.max);
        };

        $scope.ratingStates = [
            {
                stateOn: 'glyphicon-ok-sign',
                stateOff: 'glyphicon-ok-circle'
            }, {
                stateOn: 'glyphicon-star',
                stateOff: 'glyphicon-star-empty'
            }, {
                stateOn: 'glyphicon-heart',
                stateOff: 'glyphicon-ban-circle'
            }, {
                stateOn: 'glyphicon-heart'
            }, {
                stateOff: 'glyphicon-off'
            }
        ];

    }

})(); 
;
(function () {
    'use strict';

    angular.module('app.ui.form')
        .directive('uiRangeSlider', uiRangeSlider)
        .directive('uiFileUpload', uiFileUpload)
        .directive('uiSpinner', uiSpinner)
        .directive('uiWizardForm', uiWizardForm);

    // Dependency: http://www.eyecon.ro/bootstrap-slider/ OR https://github.com/seiyria/bootstrap-slider
    function uiRangeSlider() {
        return {
            restrict: 'A',
            link: function(scope, ele) {
                ele.slider();
            }            
        }
    }
    
    // Dependency: https://github.com/grevory/bootstrap-file-input
    function uiFileUpload() {
        return {
            restrict: 'A',
            link: function(scope, ele) {
                ele.bootstrapFileInput();
            }            
        }
    }

    // Dependency: https://github.com/xixilive/jquery-spinner
    function uiSpinner() {
        return {
            restrict: 'A',
            compile: function(ele, attrs) { // link and compile do not work together
                ele.addClass('ui-spinner');
                return {
                    post: function() {
                        ele.spinner();
                    }
                };
            }
            // link: // link and compile do not work together
        }
    }


    // Dependency: https://github.com/rstaib/jquery-steps
    function uiWizardForm() {
        return {
            restrict: 'A',
            link: function(scope, ele) {
                ele.steps()
            }            
        }
    }

})(); 



;
(function () {
    'use strict';

    angular.module('app.ui.form.validation', []);
})(); 
;
(function () {
    'use strict';

    angular.module('app.ui.form.validation')
        .controller('formConstraintsCtrl', ['$scope', formConstraintsCtrl])
        .controller('signinCtrl', ['$scope', signinCtrl])
        .controller('signupCtrl', ['$scope', signupCtrl]);

    function formConstraintsCtrl($scope) {
        var original;

        $scope.form = {
            required: '',
            minlength: '',
            maxlength: '',
            length_rage: '',
            type_something: '',
            confirm_type: '',
            foo: '',
            email: '',
            url: '',
            num: '',
            minVal: '',
            maxVal: '',
            valRange: '',
            pattern: ''
        };

        original = angular.copy($scope.form);

        $scope.revert = function() {
            $scope.form = angular.copy(original);
            return $scope.form_constraints.$setPristine();
        };

        $scope.canRevert = function() {
            return !angular.equals($scope.form, original) || !$scope.form_constraints.$pristine;
        };

        $scope.canSubmit = function() {
            return $scope.form_constraints.$valid && !angular.equals($scope.form, original);
        };
    }

    function signinCtrl($scope) {
        var original;

        $scope.user = {
            email: '',
            password: ''
        };

        $scope.showInfoOnSubmit = false;

        original = angular.copy($scope.user);

        $scope.revert = function() {
            $scope.user = angular.copy(original);
            return $scope.form_signin.$setPristine();
        };

        $scope.canRevert = function() {
            return !angular.equals($scope.user, original) || !$scope.form_signin.$pristine;
        };

        $scope.canSubmit = function() {
            return $scope.form_signin.$valid && !angular.equals($scope.user, original);
        };

        $scope.submitForm = function() {
            $scope.showInfoOnSubmit = true;
            return $scope.revert();
        };
    }

    function signupCtrl($scope) {
        var original;

        $scope.user = {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            age: ''
        };

        $scope.showInfoOnSubmit = false;

        original = angular.copy($scope.user);

        $scope.revert = function() {
            $scope.user = angular.copy(original);
            $scope.form_signup.$setPristine();
            return $scope.form_signup.confirmPassword.$setPristine();
        };

        $scope.canRevert = function() {
            return !angular.equals($scope.user, original) || !$scope.form_signup.$pristine;
        };

        $scope.canSubmit = function() {
            return $scope.form_signup.$valid && !angular.equals($scope.user, original);
        };

        $scope.submitForm = function() {
            $scope.showInfoOnSubmit = true;
            return $scope.revert();
        };

    }

})(); 
;
(function () {
    'use strict';

    angular.module('app.ui.form.validation')
        .directive('validateEquals', validateEquals);

    // used for confirm password
    // Note: if you modify the "confirm" input box, and then update the target input box to match it, it'll still show invalid style though the values are the same now
    // Note2: also remember to use " ng-trim='false' " to disable the trim
    function validateEquals() {
        var directive = {
            require: 'ngModel',
            link: link
        };

        return directive;

        function link(scope, ele, attrs, ngModelCtrl) {
            var validateEqual;

            validateEqual = function(value) {
                var valid;
                valid = value === scope.$eval(attrs.validateEquals);
                ngModelCtrl.$setValidity('equal', valid);
                typeof valid === "function" ? valid({
                    value: void 0
                }) : void 0;
            };

            ngModelCtrl.$parsers.push(validateEqual);

            ngModelCtrl.$formatters.push(validateEqual);

            scope.$watch(attrs.validateEquals, function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    ngModelCtrl.$setViewValue(ngModelCtrl.$ViewValue);
                }
            });

        }
    }

})(); 
;
(function () {
    'use strict';

    angular.module('app.nav', []);

})(); 
;
(function () {
    'use strict';

    angular.module('app.nav')
        .directive('toggleNavCollapsedMin', ['$rootScope', toggleNavCollapsedMin])
        .directive('collapseNav', collapseNav)
        .directive('highlightActive', highlightActive)
        .directive('toggleOffCanvas', toggleOffCanvas);

    // swtich for mini style NAV, realted to 'collapseNav' directive
    function toggleNavCollapsedMin($rootScope) {
        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        function link(scope, ele, attrs) {
            var app;

            app = $('#app');

            ele.on('click', function(e) {
                if (app.hasClass('nav-collapsed-min')) {
                    app.removeClass('nav-collapsed-min');
                } else {
                    app.addClass('nav-collapsed-min');
                    $rootScope.$broadcast('nav:reset');
                }
                return e.preventDefault();
            });            
        }
    }

    // for accordion/collapse style NAV
    function collapseNav() {
        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        function link(scope, ele, attrs) {
            var $a, $aRest, $app, $lists, $listsRest, $nav, $window, Timer, prevWidth, slideTime, updateClass;

            slideTime = 250;

            $window = $(window);

            $lists = ele.find('ul').parent('li');

            $lists.append('<i class="ti-angle-down icon-has-ul-h"></i><i class="ti-angle-right icon-has-ul"></i>');

            $a = $lists.children('a');

            $listsRest = ele.children('li').not($lists);

            $aRest = $listsRest.children('a');

            $app = $('#app');

            $nav = $('#nav-container');

            $a.on('click', function(event) {
                var $parent, $this;
                if ($app.hasClass('nav-collapsed-min') || ($nav.hasClass('nav-horizontal') && $window.width() >= 768)) {
                    return false;
                }
                $this = $(this);
                $parent = $this.parent('li');
                $lists.not($parent).removeClass('open').find('ul').slideUp(slideTime);
                $parent.toggleClass('open').find('ul').stop().slideToggle(slideTime);
                event.preventDefault();
            });

            $aRest.on('click', function(event) {
                $lists.removeClass('open').find('ul').slideUp(slideTime);
            });

            scope.$on('nav:reset', function(event) {
                $lists.removeClass('open').find('ul').slideUp(slideTime);
            });

            Timer = void 0;

            prevWidth = $window.width();

            updateClass = function() {
                var currentWidth;
                currentWidth = $window.width();
                if (currentWidth < 768) {
                    $app.removeClass('nav-collapsed-min');
                }
                if (prevWidth < 768 && currentWidth >= 768 && $nav.hasClass('nav-horizontal')) {
                    $lists.removeClass('open').find('ul').slideUp(slideTime);
                }
                prevWidth = currentWidth;
            };

            $window.resize(function() {
                var t;
                clearTimeout(t);
                t = setTimeout(updateClass, 300);
            });
          
        }
    }

    // Add 'active' class to li based on url, muli-level supported, jquery free
    function highlightActive() {
        var directive = {
            restrict: 'A',
            controller: [ '$scope', '$element', '$attrs', '$location', toggleNavCollapsedMinCtrl]
        };

        return directive;

        function toggleNavCollapsedMinCtrl($scope, $element, $attrs, $location) {
            var highlightActive, links, path;

            links = $element.find('a');

            path = function() {
                return $location.path();
            };

            highlightActive = function(links, path) {
                path = '#' + path;
                return angular.forEach(links, function(link) {
                    var $li, $link, href;
                    $link = angular.element(link);
                    $li = $link.parent('li');
                    href = $link.attr('href');
                    if ($li.hasClass('active')) {
                        $li.removeClass('active');
                    }
                    if (path.indexOf(href) === 0) {
                        return $li.addClass('active');
                    }
                });
            };

            highlightActive(links, $location.path());

            $scope.$watch(path, function(newVal, oldVal) {
                if (newVal === oldVal) {
                    return;
                }
                return highlightActive(links, $location.path());
            });

        }

    }

    // toggle on-canvas for small screen, with CSS
    function toggleOffCanvas() {
        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        function link(scope, ele, attrs) {
            ele.on('click', function() {
                return $('#app').toggleClass('on-canvas');
            });         
        }
    }


})(); 




;
(function () {
    'use strict';

    angular.module('app.page', []);
})(); 
;
(function () {
    'use strict';

    angular.module('app.page')
        .controller('invoiceCtrl', ['$scope', '$window', invoiceCtrl])
        .controller('authCtrl', ['$scope', '$window', '$location', authCtrl]);

    function invoiceCtrl($scope, $window) {
        var printContents, originalContents, popupWin;
        
        $scope.printInvoice = function() {
            printContents = document.getElementById('invoice').innerHTML;
            originalContents = document.body.innerHTML;        
            popupWin = window.open();
            popupWin.document.open();
            popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="styles/main.css" /></head><body onload="window.print()">' + printContents + '</html>');
            popupWin.document.close();
        }
    }

    function authCtrl($scope, $window, $location) {
            $scope.login = function() {
                $location.url('/')
            }

            $scope.signup = function() {
                $location.url('/')
            }

            $scope.reset =  function() {
                $location.url('/')
            }

            $scope.unlock =  function() {
                $location.url('/')
            }   
    }

})(); 




;
(function () {
    'use strict';

    angular.module('app.page')
        .directive('customPage', customPage);


    // add class for specific pages to achieve fullscreen, custom background etc.
    function customPage() {
        var directive = {
            restrict: 'A',
            controller: ['$scope', '$element', '$location', customPageCtrl]
        };

        return directive;

        function customPageCtrl($scope, $element, $location) {
            var addBg, path;

            path = function() {
                return $location.path();
            };

            addBg = function(path) {
                $element.removeClass('body-wide body-err body-lock body-auth');
                switch (path) {
                    case '/404':
                    case '/pages/404':
                    case '/pages/500':
                        return $element.addClass('body-wide body-err');
                    case '/login':
                    case '/pages/signup':
                    case '/pages/forgot-password':
                        return $element.addClass('body-wide body-auth');
                    case '/pages/lock-screen':
                        return $element.addClass('body-wide body-lock');
                }
            };

            addBg($location.path());

            $scope.$watch(path, function(newVal, oldVal) {
                if (newVal === oldVal) {
                    return;
                }
                return addBg($location.path());
            });
        }        
    }
 
})(); 



;
(function () {
    'use strict';

    angular.module('app.table', []);
})(); 
;
(function () {
    'use strict';

    angular.module('app.table')
        .controller('tableCtrl', ['$scope', '$filter', tableCtrl]);

    function tableCtrl($scope, $filter) {
        var init;

        $scope.stores = [
            {
                name: 'Nijiya Market',
                price: '$$',
                sales: 292,
                rating: 4.0
            }, {
                name: 'Eat On Monday Truck',
                price: '$',
                sales: 119,
                rating: 4.3
            }, {
                name: 'Tea Era',
                price: '$',
                sales: 874,
                rating: 4.0
            }, {
                name: 'Rogers Deli',
                price: '$',
                sales: 347,
                rating: 4.2
            }, {
                name: 'MoBowl',
                price: '$$$',
                sales: 24,
                rating: 4.6
            }, {
                name: 'The Milk Pail Market',
                price: '$',
                sales: 543,
                rating: 4.5
            }, {
                name: 'Nob Hill Foods',
                price: '$$',
                sales: 874,
                rating: 4.0
            }, {
                name: 'Scratch',
                price: '$$$',
                sales: 643,
                rating: 3.6
            }, {
                name: 'Gochi Japanese Fusion Tapas',
                price: '$$$',
                sales: 56,
                rating: 4.1
            }, {
                name: 'Cost Plus World Market',
                price: '$$',
                sales: 79,
                rating: 4.0
            }, {
                name: 'Bumble Bee Health Foods',
                price: '$$',
                sales: 43,
                rating: 4.3
            }, {
                name: 'Costco',
                price: '$$',
                sales: 219,
                rating: 3.6
            }, {
                name: 'Red Rock Coffee Co',
                price: '$',
                sales: 765,
                rating: 4.1
            }, {
                name: '99 Ranch Market',
                price: '$',
                sales: 181,
                rating: 3.4
            }, {
                name: 'Mi Pueblo Food Center',
                price: '$',
                sales: 78,
                rating: 4.0
            }, {
                name: 'Cucina Venti',
                price: '$$',
                sales: 163,
                rating: 3.3
            }, {
                name: 'Sufi Coffee Shop',
                price: '$',
                sales: 113,
                rating: 3.3
            }, {
                name: 'Dana Street Roasting',
                price: '$',
                sales: 316,
                rating: 4.1
            }, {
                name: 'Pearl Cafe',
                price: '$',
                sales: 173,
                rating: 3.4
            }, {
                name: 'Posh Bagel',
                price: '$',
                sales: 140,
                rating: 4.0
            }, {
                name: 'Artisan Wine Depot',
                price: '$$',
                sales: 26,
                rating: 4.1
            }, {
                name: 'Hong Kong Chinese Bakery',
                price: '$',
                sales: 182,
                rating: 3.4
            }, {
                name: 'Starbucks',
                price: '$$',
                sales: 97,
                rating: 3.7
            }, {
                name: 'Tapioca Express',
                price: '$',
                sales: 301,
                rating: 3.0
            }, {
                name: 'House of Bagels',
                price: '$',
                sales: 82,
                rating: 4.4
            }
        ];

        $scope.searchKeywords = '';

        $scope.filteredStores = [];

        $scope.row = '';

        $scope.select = function(page) {
            var end, start;
            start = (page - 1) * $scope.numPerPage;
            end = start + $scope.numPerPage;
            return $scope.currentPageStores = $scope.filteredStores.slice(start, end);
        };

        $scope.onFilterChange = function() {
            $scope.select(1);
            $scope.currentPage = 1;
            return $scope.row = '';
        };

        $scope.onNumPerPageChange = function() {
            $scope.select(1);
            return $scope.currentPage = 1;
        };

        $scope.onOrderChange = function() {
            $scope.select(1);
            return $scope.currentPage = 1;
        };

        $scope.search = function() {
            $scope.filteredStores = $filter('filter')($scope.stores, $scope.searchKeywords);
            return $scope.onFilterChange();
        };

        $scope.order = function(rowName) {
            if ($scope.row === rowName) {
                return;
            }
            $scope.row = rowName;
            $scope.filteredStores = $filter('orderBy')($scope.stores, rowName);
            return $scope.onOrderChange();
        };

        $scope.numPerPageOpt = [3, 5, 10, 20];

        $scope.numPerPage = $scope.numPerPageOpt[2];

        $scope.currentPage = 1;

        $scope.currentPageStores = [];

        init = function() {
            $scope.search();
            return $scope.select($scope.currentPage);
        };

        init();
    }

})(); 
;
(function () {
    'use strict';

    angular.module('app.task', []);

})();

;
(function () {
    'use strict';

    angular.module('app.task')
        .controller('taskCtrl', [ '$scope', 'taskStorage', 'filterFilter', '$rootScope', 'logger', taskCtrl]);
        
    function taskCtrl($scope, taskStorage, filterFilter, $rootScope, logger) {
        var tasks;

        tasks = $scope.tasks = taskStorage.get();

        $scope.newTask = '';

        $scope.remainingCount = filterFilter(tasks, {completed: false}).length;

        $scope.editedTask = null;

        $scope.statusFilter = {
            completed: false
        };

        $scope.filter = function(filter) {
            switch (filter) {
                case 'all':
                    return $scope.statusFilter = '';
                case 'active':
                    return $scope.statusFilter = {
                        completed: false
                    };
                case 'completed':
                    return $scope.statusFilter = {
                        completed: true
                    };
            }
        };

        $scope.add = function() {
            var newTask;
            newTask = $scope.newTask.trim();
            if (newTask.length === 0) {
                return;
            }
            tasks.push({
                title: newTask,
                completed: false
            });
            logger.logSuccess('New task: "' + newTask + '" added');
            taskStorage.put(tasks);
            $scope.newTask = '';
            $scope.remainingCount++;
        };

        $scope.edit = function(task) {
            $scope.editedTask = task;
        };

        $scope.doneEditing = function(task) {
            $scope.editedTask = null;
            task.title = task.title.trim();
            if (!task.title) {
                $scope.remove(task);
            } else {
                logger.log('Task updated');
            }
            taskStorage.put(tasks);
        };

        $scope.remove = function(task) {
            var index;
            $scope.remainingCount -= task.completed ? 0 : 1;
            index = $scope.tasks.indexOf(task);
            $scope.tasks.splice(index, 1);
            taskStorage.put(tasks);
            logger.logError('Task removed');
        };

        $scope.completed = function(task) {
            $scope.remainingCount += task.completed ? -1 : 1;
            taskStorage.put(tasks);
            if (task.completed) {
                if ($scope.remainingCount > 0) {
                    if ($scope.remainingCount === 1) {
                        logger.log('Almost there! Only ' + $scope.remainingCount + ' task left');
                    } else {
                        logger.log('Good job! Only ' + $scope.remainingCount + ' tasks left');
                    }
                } else {
                    logger.logSuccess('Congrats! All done :)');
                }
            }
        };

        $scope.clearCompleted = function() {
            $scope.tasks = tasks = tasks.filter(function(val) {
                return !val.completed;
            });
            taskStorage.put(tasks);
        };

        $scope.markAll = function(completed) {
            tasks.forEach(function(task) {
                task.completed = completed;
            });
            $scope.remainingCount = completed ? 0 : tasks.length;
            taskStorage.put(tasks);
            if (completed) {
                logger.logSuccess('Congrats! All done :)');
            }
        };

        $scope.$watch('remainingCount == 0', function(val) {
            $scope.allChecked = val;
        });

        $scope.$watch('remainingCount', function(newVal, oldVal) {
            $rootScope.$broadcast('taskRemaining:changed', newVal);
        });

    }
})(); 
;
(function () {
    'use strict';

    angular.module('app.task')
        .directive('taskFocus', ['$timeout', taskFocus]);

    // cusor focus when dblclick to edit
    function taskFocus($timeout) {
        var directive = {
            link: link
        };

        return directive;

        function link (scope, ele, attrs) {
            scope.$watch(attrs.taskFocus, function(newVal) {
                if (newVal) {
                    $timeout(function() {
                        return ele[0].focus();
                    }, 0, false);
                }
            });
        }
    }

})(); 

;
(function () {
    'use strict';

    angular.module('app.task')
        .factory('taskStorage', taskStorage);


    function taskStorage() {
        var STORAGE_ID, DEMO_TASKS;

        STORAGE_ID = 'tasks';
        DEMO_TASKS = '[ {"title": "Upgrade to Yosemite", "completed": true},' +
            '{"title": "Finish homework", "completed": false},' +
            '{"title": "Try Google glass", "completed": false},' +
            '{"title": "Build a snowman :)", "completed": false},' +
            '{"title": "Play games with friends", "completed": true},' +
            '{"title": "Learn Swift", "completed": false},' +
            '{"title": "Shopping", "completed": true} ]';

        return {
            get: function() {
                return JSON.parse(localStorage.getItem(STORAGE_ID) || DEMO_TASKS );
            },

            put: function(tasks) {
                return localStorage.setItem(STORAGE_ID, JSON.stringify(tasks));
            }
        }
    }
})(); 
;
(function () {
    'use strict';

    angular.module('app.ui', []);
})(); 
;
(function () {
    'use strict';

    angular.module('app.ui')
        .controller('LoaderCtrl', ['$scope', 'cfpLoadingBar', LoaderCtrl])
        .controller('NotifyCtrl', ['$scope', 'logger', NotifyCtrl])
        .controller('AlertDemoCtrl', ['$scope', AlertDemoCtrl])
        .controller('ProgressDemoCtrl', ['$scope', ProgressDemoCtrl])
        .controller('AccordionDemoCtrl', ['$scope', AccordionDemoCtrl])
        .controller('CollapseDemoCtrl', ['$scope', CollapseDemoCtrl])
        .controller('ModalDemoCtrl', ['$scope', '$modal', '$log', ModalDemoCtrl])
        .controller('ModalInstanceCtrl', ['$scope', '$modalInstance', 'items', ModalInstanceCtrl])
        .controller('PaginationDemoCtrl', ['$scope', PaginationDemoCtrl])
        .controller('TabsDemoCtrl', ['$scope', TabsDemoCtrl])
        .controller('TreeDemoCtrl', ['$scope', TreeDemoCtrl])
        .controller('MapDemoCtrl', ['$scope', '$http', '$interval', MapDemoCtrl]);


    function LoaderCtrl($scope, cfpLoadingBar) {
        $scope.start = function() {
            cfpLoadingBar.start();
        }

        // increments the loading bar by a random amount.
        $scope.inc = function() {
            cfpLoadingBar.inc();
        }

        $scope.set = function() {
            cfpLoadingBar.set(0.3);
        }

        $scope.complete = function() {
            cfpLoadingBar.complete()
        }
    }

    function NotifyCtrl($scope, logger) {
        $scope.notify = function(type) {
            switch (type) {
                case 'info':
                    return logger.log("Heads up! This alert needs your attention, but it's not super important.");
                case 'success':
                    return logger.logSuccess("Well done! You successfully read this important alert message.");
                case 'warning':
                    return logger.logWarning("Warning! Best check yo self, you're not looking too good.");
                case 'error':
                    return logger.logError("Oh snap! Change a few things up and try submitting again.");
            }
        };
    }

    function AlertDemoCtrl($scope) {
        $scope.alerts = [
            {
                type: 'success',
                msg: 'Well done! You successfully read this important alert message.'
            }, {
                type: 'info',
                msg: 'Heads up! This alert needs your attention, but it is not super important.'
            }, {
                type: 'warning',
                msg: "Warning! Best check yo self, you're not looking too good."
            }, {
                type: 'danger',
                msg: 'Oh snap! Change a few things up and try submitting again.'
            }
        ];

        $scope.addAlert = function() {
            var num, type;
            num = Math.ceil(Math.random() * 4);
            type = void 0;
            switch (num) {
                case 0:
                    type = 'info';
                    break;
                case 1:
                    type = 'success';
                    break;
                case 2:
                    type = 'info';
                    break;
                case 3:
                    type = 'warning';
                    break;
                case 4:
                    type = 'danger';
            }
            return $scope.alerts.push({
                type: type,
                msg: "Another alert!"
            });
        };

        $scope.closeAlert = function(index) {
            return $scope.alerts.splice(index, 1);
        };
    }

    function ProgressDemoCtrl($scope) {
        $scope.max = 200;

        $scope.random = function() {
            var type, value;
            value = Math.floor((Math.random() * 100) + 10);
            type = void 0;
            if (value < 25) {
                type = "success";
            } else if (value < 50) {
                type = "info";
            } else if (value < 75) {
                type = "warning";
            } else {
                type = "danger";
            }
            $scope.showWarning = type === "danger" || type === "warning";
            $scope.dynamic = value;
            $scope.type = type;
        };

        $scope.random();

    }

    function AccordionDemoCtrl($scope) {
        $scope.oneAtATime = true;

        $scope.groups = [
            {
                title: "Dynamic Group Header - 1",
                content: "Dynamic Group Body - 1"
            }, {
                title: "Dynamic Group Header - 2",
                content: "Dynamic Group Body - 2"
            }, {
                title: "Dynamic Group Header - 3",
                content: "Dynamic Group Body - 3"
            }
        ];

        $scope.items = ["Item 1", "Item 2", "Item 3"];

        $scope.status = {
            isFirstOpen: true,
            isFirstOpen1: true
        };

        $scope.addItem = function() {
            var newItemNo;
            newItemNo = $scope.items.length + 1;
            $scope.items.push("Item " + newItemNo);
        };
    }

    function CollapseDemoCtrl($scope) {
        $scope.isCollapsed = false;
    }

    function ModalDemoCtrl($scope, $modal, $log) {
        $scope.items = ["item1", "item2", "item3"];

        $scope.open = function() {
            var modalInstance;
            modalInstance = $modal.open({
                templateUrl: "myModalContent.html",
                controller: 'ModalInstanceCtrl',
                resolve: {
                    items: function() {
                        return $scope.items;
                    }
                }
            });
            modalInstance.result.then((function(selectedItem) {
                $scope.selected = selectedItem;
            }), function() {
                $log.info("Modal dismissed at: " + new Date());
            });
        };

    }

    function ModalInstanceCtrl($scope, $modalInstance, items) {
        $scope.items = items;

        $scope.selected = {
            item: $scope.items[0]
        };

        $scope.ok = function() {
            $modalInstance.close($scope.selected.item);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss("cancel");
        };

    }

    function PaginationDemoCtrl($scope) {
        $scope.totalItems = 64;

        $scope.currentPage = 4;

        $scope.setPage = function(pageNo) {
            $scope.currentPage = pageNo;
        };

        $scope.maxSize = 5;

        $scope.bigTotalItems = 175;

        $scope.bigCurrentPage = 1;
    }

    function TabsDemoCtrl($scope) {
        $scope.tabs = [
            {
                title: "Dynamic Title 1",
                content: "Dynamic content 1.  Consectetur adipisicing elit. Nihil, quidem, officiis, et ex laudantium sed cupiditate voluptatum libero nobis sit illum voluptates beatae ab. Ad, repellendus non sequi et at."
            }, {
                title: "Disabled",
                content: "Dynamic content 2.  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nihil, quidem, officiis, et ex laudantium sed cupiditate voluptatum libero nobis sit illum voluptates beatae ab. Ad, repellendus non sequi et at.",
                disabled: true
            }
        ];

        $scope.navType = "pills";
    }

    function TreeDemoCtrl($scope) {
        $scope.list = [
            {
                id: 1,
                title: "Item 1",
                items: []
            }, {
                id: 2,
                title: "Item 2",
                items: [
                    {
                        id: 21,
                        title: "Item 2.1",
                        items: [
                            {
                                id: 211,
                                title: "Item 2.1.1",
                                items: []
                            }, {
                                id: 212,
                                title: "Item 2.1.2",
                                items: []
                            }
                        ]
                    }, {
                        id: 22,
                        title: "Item 2.2",
                        items: [
                            {
                                id: 221,
                                title: "Item 2.2.1",
                                items: []
                            }, {
                                id: 222,
                                title: "Item 2.2.2",
                                items: []
                            }
                        ]
                    }
                ]
            }, {
                id: 3,
                title: "Item 3",
                items: []
            }, {
                id: 4,
                title: "Item 4",
                items: [
                    {
                        id: 41,
                        title: "Item 4.1",
                        items: []
                    }
                ]
            }, {
                id: 5,
                title: "Item 5",
                items: []
            }, {
                id: 6,
                title: "Item 6",
                items: []
            }, {
                id: 7,
                title: "Item 7",
                items: []
            }
        ];

        $scope.selectedItem = {};

        $scope.options = {};

        $scope.remove = function(scope) {
            scope.remove();
        };

        $scope.toggle = function(scope) {
            scope.toggle();
        };

        $scope.newSubItem = function(scope) {
            var nodeData;
            nodeData = scope.$modelValue;
            nodeData.items.push({
                id: nodeData.id * 10 + nodeData.items.length,
                title: nodeData.title + "." + (nodeData.items.length + 1),
                items: []
            });
        };

    }

    function MapDemoCtrl($scope, $http, $interval) {
        var i, markers;

        markers = [];

        i = 0;

        while (i < 8) {
            markers[i] = new google.maps.Marker({
                title: "Marker: " + i
            });
            i++;
        }

        $scope.GenerateMapMarkers = function() {
            var d, lat, lng, loc, numMarkers;
            d = new Date();
            $scope.date = d.toLocaleString();
            numMarkers = Math.floor(Math.random() * 4) + 4;
            i = 0;
            while (i < numMarkers) {
                lat = 43.6600000 + (Math.random() / 100);
                lng = -79.4103000 + (Math.random() / 100);
                loc = new google.maps.LatLng(lat, lng);
                markers[i].setPosition(loc);
                markers[i].setMap($scope.map);
                i++;
            }
        };

        $interval($scope.GenerateMapMarkers, 2000);

    }
    
})(); 
;
(function () {
    'use strict';

    angular.module('app.ui')
        .directive('uiTime', uiTime)
        .directive('uiNotCloseOnClick', uiNotCloseOnClick)
        .directive('slimScroll', slimScroll)
        .directive('imgHolder', imgHolder);

    function uiTime() {
        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        function link(scope, ele) {
            var checkTime, startTime;

            startTime = function() {
                var h, m, s, t, time, today;
                today = new Date();
                h = today.getHours();
                m = today.getMinutes();
                s = today.getSeconds();
                m = checkTime(m);
                s = checkTime(s);
                time = h + ":" + m + ":" + s;
                ele.html(time);
                return t = setTimeout(startTime, 500);
            };

            checkTime = function(i) {
                if (i < 10) {
                    i = "0" + i;
                }
                return i;
            };

            startTime();
        }  
    }

    function uiNotCloseOnClick() {
        return {
            restrict: 'A',
            compile: function(ele, attrs) {
                return ele.on('click', function(event) {
                    return event.stopPropagation();
                });
            }
        };
    }

    function slimScroll() {
        return {
            restrict: 'A',
            link: function(scope, ele, attrs) {
                return ele.slimScroll({
                    height: attrs.scrollHeight || '100%'
                });
            }
        };
    }

    function imgHolder() {
        return {
            restrict: 'A',
            link: function(scope, ele, attrs) {
                return Holder.run({
                    images: ele[0]
                });
            }
        };
    }

})(); 
;
(function () {
    'use strict';

    angular.module('app.ui')
        .factory('logger', logger)

    function logger() {

        var logIt;

        // toastr setting.
        toastr.options = {
            "closeButton": true,
            "positionClass": "toast-bottom-right",
            "timeOut": "3000"
        };

        logIt = function(message, type) {
            return toastr[type](message);
        };

        return {
            log: function(message) {
                logIt(message, 'info');
            },
            logWarning: function(message) {
                logIt(message, 'warning');
            },
            logSuccess: function(message) {
                logIt(message, 'success');
            },
            logError: function(message) {
                logIt(message, 'error');
            }
        };

    }

})(); 
;
(function () {
    'use strict';

    angular.module('app.ui.map', []);

})(); 
;
(function () {
    'use strict';

    angular.module('app.ui.map')
        .controller('jvectormapCtrl', ['$scope', jvectormapCtrl]);

    function jvectormapCtrl($scope) {
        var marker_data;

        marker_data = [
            {
                "latLng": [40.71, -74.00],
                "name": "New York"
            }, {
                "latLng": [39.90, 116.40],
                "name": "Beijing"
            }, {
                "latLng": [31.23, 121.47],
                "name": "Shanghai"
            }, {
                "latLng": [-33.86, 151.20],
                "name": "Sydney"
            }, {
                "latLng": [-37.81, 144.96],
                "name": "Melboune"
            }, {
                "latLng": [37.33, -121.89],
                "name": "San Jose"
            }, {
                "latLng": [1.3, 103.8],
                "name": "Singapore"
            }, {
                "latLng": [47.60, -122.33],
                "name": "Seattle"
            }, {
                "latLng": [41.87, -87.62],
                "name": "Chicago"
            }, {
                "latLng": [37.77, -122.41],
                "name": "San Francisco"
            }, {
                "latLng": [32.71, -117.16],
                "name": "San Diego"
            }, {
                "latLng": [51.50, -0.12],
                "name": "London"
            }, {
                "latLng": [48.85, 2.35],
                "name": "Paris"
            }, {
                "latLng": [52.52, 13.40],
                "name": "Berlin"
            }, {
                "latLng": [-26.20, 28.04],
                "name": "Johannesburg"
            }, {
                "latLng": [35.68, 139.69],
                "name": "Tokyo"
            }, {
                "latLng": [13.72, 100.52],
                "name": "Bangkok"
            }, {
                "latLng": [37.56, 126.97],
                "name": "Seoul"
            }, {
                "latLng": [41.87, 12.48],
                "name": "Roma"
            }, {
                "latLng": [45.42, -75.69],
                "name": "Ottawa"
            }, {
                "latLng": [55.75, 37.61],
                "name": "Moscow"
            }, {
                "latLng": [-22.90, -43.19],
                "name": "Rio de Janeiro"
            }
        ];

        $scope.worldMap = {
            map: 'world_mill_en',
            markers: marker_data,
            normalizeFunction: 'polynomial',
            backgroundColor: null,
            zoomOnScroll: false,
            regionStyle: {
                initial: {
                    fill: '#EEEFF3'
                },
                hover: {
                    fill: $scope.color.primary
                }
            },
            markerStyle: {
                initial: {
                    fill: '#BF616A',
                    stroke: 'rgba(191,97,106,.8)',
                    "fill-opacity": 1,
                    "stroke-width": 9,
                    "stroke-opacity": 0.5
                },
                hover: {
                    stroke: 'black',
                    "stroke-width": 2
                }
            }
        };
        
    }



})(); 
;
(function () {
    'use strict';

    angular.module('app.ui.map')
        .directive('uiJvectormap', uiJvectormap);

    function uiJvectormap() {
        return {
            restrict: 'A',
            scope: {
                options: '='
            },
            link: function(scope, ele, attrs) {
                var options;

                options = scope.options;
                ele.vectorMap(options);
            }
        }
    }

})(); 
;
'use strict';

/**
 * @ngdoc function
 * @name slimApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the slimApp
 */
angular.module('app')
    .controller('LoginCtrl', function($scope, $state, $rootScope, user) {

        $scope.auth = {
            'username': '',
            'password': ''
        };

        $scope.login = function() {
            $scope.message = '';
            var p1 = user.login($scope.auth);
            p1 = p1.then(function() {
                $state.go('brands');
            }, function() {
                $scope.message = '您輸入的名稱或密碼有誤。';
            });
            $rootScope.myPromise = p1;
        };

    });

;
'use strict';

/**
 * @ngdoc service
 * @name appApp.user
 * @description
 * # user
 * Factory in the appApp.
 */
angular.module('app')
    .factory('user', function($cookieStore, sessionKey, getBaseRest, getClassRest, $timeout, $q, $state) {

        var _currentUser = {};

        var getSession = function() {
                return $cookieStore.get(sessionKey) || null;
            },
            setSession = function(session) {
                $cookieStore.put(sessionKey, session);
            },
            removeSession = function() {
                $cookieStore.remove(sessionKey);
            };


        var check = function(authData) {
            return getBaseRest().one('login').customGET('', authData);
        };


        var login = function(authData) {
            var p1 = check(authData);

            p1 = p1.then(function(result) {
                var userType = result.userType || "";

                if (userType == "iStagingAdmin") {
                    angular.extend(_currentUser, result);
                    setSession(result.sessionToken);
                } else {
                    return $q.reject("not admin");
                }
            }, function(error) {
                console.log("user.login");
                console.log(error);
                return $q.reject(error);
            });

            return p1;
        };

        var logout = function() {
            //angular.extend(_currentUser, {});
            delete _currentUser.sessionToken;
            removeSession();
            initPromise = null;
            $timeout(function() {
                $state.go('login', null, {
                    'reload': true,
                    'location ': true
                });
            }, 500);

            //
        };


        var checkSession = function() {
            return !!_currentUser.sessionToken;
        };



        var initPromise = null;

        var init = function(callback) {

            if (!initPromise) {
                var deferred = $q.defer();
                initPromise = deferred.promise;
                if (!!_currentUser.sessionToken) {
                    deferred.resolve(_currentUser);
                } else {
                    if (!getSession()) {
                        logout();
                        deferred.reject();
                    } else {
                        getBaseRest().one('users').customGET('me').then(function(result) {
                            angular.extend(_currentUser, result);
                            setSession(result.sessionToken);
                            deferred.resolve(_currentUser);
                        }, function() {
                            logout();
                            deferred.reject();
                        });
                    }
                }
            }

            if (angular.isFunction(callback)) {
                initPromise.then(function(me) {
                    callback(me);
                });
            }
            return initPromise;
        };

        return {
            'login': login,
            'logout': logout,
            'init': init,
            'checkSession': checkSession
        };
    });

;
'use strict';

/**
 * @ngdoc function
 * @name backendApp.controller:CommonListPageCtrl
 * @description
 * # CommonListPageCtrl
 * Controller of the backendApp
 */
angular.module('app')
    .controller('CommonListPageCtrl', function($rootScope, $scope, $state, $stateParams, getClassRest, user, _) {

        var currentPage = ($stateParams.page || 1) * 1,
            itemsPerPage = 10,
            configs = $state.current.data;

        $scope.configs = configs;
        $scope.totalItems = 0;
        $scope.itemsPerPage = itemsPerPage;
        $scope.searchText = $stateParams.search || '';
        $scope.isShowPage=false;

        //user.init(function() {


        var restGetCountParameter = {
            'count': 1,
            'limit': 0
        };

        var restGetListParameter = {
            'skip': (itemsPerPage * (currentPage - 1)),
            'limit': itemsPerPage,
            'order': '-createdAt'
        };


        if( $stateParams.order ){
            restGetListParameter.order = $stateParams.order;
        }

        var queryParameter = angular.copy(configs.queryParameter || {});


        if ($scope.searchText.length && configs.searchAble && configs.searchCols && angular.isArray(configs.searchCols)) {

            _.each(configs.searchCols, function(item) {
                if (!queryParameter.where) {
                    queryParameter.where = {};
                }
                if (!queryParameter.where.$or) {
                    queryParameter.where.$or = [];
                }

                var q = {};
                q[item] = {
                    $regex: '\\Q' + $scope.searchText + '\\E',
                    $options: 'i'
                };

                queryParameter.where.$or.push(q);
            });
        }

        angular.extend(restGetCountParameter, queryParameter);
        angular.extend(restGetListParameter, queryParameter);
        //alert(0);

        var p1 = getClassRest()
            .all(configs.parseClassName)
            .getList(restGetListParameter)
            .then(function(result) {
                $scope.list = result;
            });

        p1 = p1.then(function() {
            return getClassRest()
                .all(configs.parseClassName)
                .customGET('', restGetCountParameter)
                .then(function(result) {
                    $scope.totalItems = result.count;
                    $scope.currentPage = currentPage;
                    $scope.isShowPage=true;
                });
        });
        $rootScope.myPromise = p1;


        $scope.add = function() {
            $state.go($state.$current.name + '-edit', {
                'newly': true
            });
        };

        //});

        $scope.search = function() {
            $state.go($state.$current.name, {
                page: 1,
                search: $scope.searchText
            });
        };

        $scope.pageChanged = function() {
            $state.go($state.$current.name, {
                page: $scope.currentPage,
                search: $scope.searchText
            });
        };




    });

;
'use strict';

angular.module('app')
    .controller('CommonItemPageCtrl', function($rootScope, $scope, $state, $stateParams, getClassRest, dialog, user, _) {

        var configs = $state.current.data;

        $scope.configs = configs;


        if (configs.refGrid && $stateParams.objectId) {
            $scope.refGrid = _.extend({}, configs.refGrid);
            $scope.refGrid.objectId = $stateParams.objectId;
            $scope.refGrid.className = configs.parseClassName;
        }

        $scope.objectId = $stateParams.objectId;

        if ($stateParams.objectId) {
            var p1 = getClassRest().one(configs.parseClassName, $stateParams.objectId).get();
            p1 = p1.then(function(result) {
                $scope.item = result;
            });
            $rootScope.myPromise = p1;
        } else {
            $scope.item = {};
        }



        $scope.cancel = $scope.back;


        $scope.save = function(withBack) {
            var p1;
            if ($stateParams.objectId) {
                p1 = $scope.item.save();
            } else {
                var defaultObject = {};
                _.each(configs.defaultObject, function(value, key) {
                    if (angular.isFunction(value)) {
                        defaultObject[key] = value();
                    } else {
                        defaultObject[key] = value;
                    }
                });
                angular.extend($scope.item, defaultObject || {});
                p1 = getClassRest().all(configs.parseClassName).post($scope.item);
            }


            $rootScope.myPromise = p1.then(function(item) {
                dialog.info('已儲存設定', function() {

                    if (withBack) {
                        $scope.back();
                    } else {
                        $state.go($state.$current.name, {
                            objectId: item.objectId,
                            newly: null
                        });
                    }

                });
            });
        };
    });

;
'use strict';

angular.module('app')
    .directive('parseTable', function($compile, _, $state, $rootScope, dialog, $stateParams) {

        var save = function(item, key) {
            item.customPUT(_.pick(item, key));
        };


        var edit = function(item) {
            $state.go($state.$current.name + '-edit', {
                objectId: item.objectId
            });
        };

        var remove = function(list, item) {
            dialog.confirm('刪除確認?', '', function() {
                $rootScope.myPromise = item.remove().then(function() {
                    $state.reload();
                });
            });
        };

        var order = function(name) {
            if ($stateParams.order) {
                if ($stateParams.order === name) {
                    name = '-' + name;
                }
            }
            $state.go($state.$current.name, {
                order: name
            });
        };



        return {
            //template: '<div></div>',
            restrict: 'E',
            scope: {
                'list': '=',
                'rows': '='
            },
            transclude: true,
            link: function postLink(scope, element) {
                scope.save = save;
                scope.edit = edit;
                scope.remove = remove;
                scope.order = order;
                var $ = $ || angular.element;

                var table = $('<table class="table table-bordered table-striped table-responsive" ></table>'),
                    tHead = $('<thead></thead>'),
                    tBody = $('<tbody></tbody>'),
                    tHeadTr = $('<tr></tr>'),
                    tBodyTr = $('<tr ng-class="{odd:$odd,even:$even}" ng-repeat="item  in list"></tr>');

                _.each(scope.rows, function(item) {
                    var td = $('<td></td>'),
                        th = $('<th></th>'),
                        div = $('<div class="th" ></div>').text(item.title);

                    if (!angular.isArray(item.func)) {
                        div.css('cursor', 'pointer');
                        div.attr('ng-click', 'order(\'' + item.name + '\')');
                    }


                    th.addClass(item.class || '').append(div);

                    if (angular.isArray(item.func)) {

                        _.each(item.func, function(item) {
                            switch (item) {
                                case 'edit':
                                    td.append('<button ng-click="edit(item)" class="btn btn-warning btn-xs">編輯</button>');
                                    break;
                                case 'delete':
                                    td.append('<button ng-click="remove(list,item)" class="btn btn-default btn-xs">刪除</button>');
                                    break;
                                case 'images':
                                    $('<a class="thumbnail"  />')
                                        .attr('ui-sref', $state.$current.name + '-edit' + '({ objectId: item.objectId })')
                                        .attr('ng-if', 'item.images[0]')
                                        .append($('<img>').attr('ng-src', '{{item.images[0]}}').css('width', '100%'))
                                        .appendTo(td);
                                    break;
                                default:
                                    break;
                            }
                        });
                    } else {
                        if (item.name === 'title') {
                            $('<a>')
                                .attr('ui-sref', $state.$current.name + '-edit' + '({ objectId: item.objectId })')
                                .text('{{item.' + item.name + '}}')
                                .appendTo(td);
                        } else {
                            td.text('{{item.' + item.name + '}}');
                        }



                    }
                    tHeadTr.append(th);
                    tBodyTr.append(td);
                });

                tHead.append(tHeadTr);
                tBody.append(tBodyTr);
                table.append(tHead);
                table.append(tBody);
                element.append(table);
                $compile(element.contents())(scope);

            }
        };
    });

;
'use strict';

angular.module('app')
    .directive('parseFieldset', function($compile, _) {
        return {
            restrict: 'E',
            scope: {
                'configs': '=',
                'item': '='
            },
            link: function postLink($scope, $element) {




                $scope.currencyList = [{
                    name: '美金',
                    value: 'USD'
                }, {
                    name: '港幣',
                    value: 'HKD'
                }, {
                    name: '英鎊',
                    value: 'GBP'
                }, {
                    name: '澳幣',
                    value: 'AUD'
                }, {
                    name: '加拿大幣',
                    value: 'CAD'
                }, {
                    name: '新加坡幣',
                    value: 'SGD'
                }, {
                    name: '瑞士法郎',
                    value: 'CHF'
                }, {
                    name: '日圓',
                    value: 'JPY'
                }, {
                    name: '南非幣',
                    value: 'ZAR'
                }, {
                    name: '瑞典幣',
                    value: 'SEK'
                }, {
                    name: '紐元',
                    value: 'NZD'
                }, {
                    name: '泰幣',
                    value: 'THB'
                }, {
                    name: '菲國比索',
                    value: 'PHP'
                }, {
                    name: '印尼幣',
                    value: 'IDR'
                }, {
                    name: '歐元',
                    value: 'EUR'
                }, {
                    name: '韓元',
                    value: 'KRW'
                }, {
                    name: '越南盾',
                    value: 'VND'
                }, {
                    name: '馬來幣',
                    value: 'MYR'
                }, {
                    name: '人民幣',
                    value: 'CNY'
                }];


                var $ = $ || angular.element,
                    attrs = $scope.configs.attrs,
                    className = $scope.configs.parseClassName;

                $scope.attrs = attrs;


                _.each(attrs, function(attr, index) {

                    var formGroup = $('<div class="form-group ' + attr.name + '">');
                    if (attr.title) {
                        $('<label>')
                            .text(attr.title)
                            .appendTo(formGroup);
                    }


                    var placeholder = [];

                    if (!attr.optional) {
                        placeholder.push('必填欄位');
                    } else {
                        placeholder.push('選填');
                    }

                    if (attr.maxlength) {
                        placeholder.push('最多' + attr.maxlength + '字');
                    }


                    placeholder = placeholder.join(',');
                    switch (attr.type) {
                        case 'label':
                            var $label = $('<label class="control-label">');
                            $('<p class="text-left">')
                                .text('{{item.' + attr.name + '}}')
                                .appendTo($label);

                            $label.appendTo(formGroup);
                            break;

                        case 'thumbnail':
                            formGroup = $('<div class="col-md-6">');
                            $('<a class="thumbnail" />')
                                .attr('ng-if', 'item.' + attr.name)
                                .append($('<img />').attr('ng-src', '{{item.' + attr.name + '}}'))
                                .appendTo(formGroup);
                            break;
                        case 'text':
                            $('<input class="form-control input-md">')
                                .attr('ng-required', !attr.optional)
                                .attr('type', 'text')
                                .attr('maxlength', attr.maxlength)
                                .attr('ng-model', 'item.' + attr.name)
                                .attr('placeholder', placeholder)
                                .appendTo(formGroup);
                            break;

                        case 'currency':
                            var sel = $('<select class="form-control" >').attr('ng-model', 'item.' + attr.name),
                                opt = $('<option ng-repeat="currency in currencyList" value="{{currency.value}}">{{currency.name}}</option>');
                            opt.appendTo(sel);
                            sel.appendTo(formGroup);
                            break;

                        case 'number':
                            $('<input class="form-control input-md">')
                                .attr('ng-required', !attr.optional)
                                .attr('type', 'number')
                                .attr('ng-model', 'item.' + attr.name)
                                .attr('placeholder', placeholder)
                                .appendTo(formGroup);
                            break;

                        case 'url':
                            $('<input class="form-control input-md">')
                                .attr('ng-required', !attr.optional)
                                .attr('type', 'url')
                                .attr('ng-model', 'item.' + attr.name)
                                .attr('placeholder', placeholder)
                                .appendTo(formGroup);
                            break;
                        case 'textarea':
                            $('<textarea class="form-control input-md">')
                                .attr('ng-required', !attr.optional)
                                .attr('rows', '10')
                                .attr('maxlength', attr.maxlength)
                                .attr('ng-model', 'item.' + attr.name)
                                .attr('placeholder', placeholder)
                                .appendTo(formGroup);
                            break;
                        case 'imgUploader':
                            $('<image-uploader>')
                                .attr('attr', 'attrs[' + index + ']')
                                .attr('item', 'item')
                                .attr('class-name', className)
                                .appendTo(formGroup);
                            formGroup.attr('ng-if', 'item.objectId');
                            break;
                        case 'objUploader':
                            $('<obj-uploader>')
                                .attr('attr', 'attrs[' + index + ']')
                                .attr('item', 'item')
                                .attr('class-name', className)
                                .appendTo(formGroup);
                            formGroup.attr('ng-if', 'item.objectId');
                            break;

                        case 'refData':
                            $('<ref-data>')
                                .attr('attr', 'attrs[' + index + ']')
                                .attr('item', 'item')
                                .attr('ref-class-name', attr.refClassName)
                                .appendTo(formGroup);
                            break;

                        case 'refDataArray':
                            $('<ref-data-array>')
                                .attr('attr', 'attrs[' + index + ']')
                                .attr('item', 'item')
                                .attr('ref-class-name', attr.refClassName)
                                .appendTo(formGroup);
                            break;

                        case 'checkbox':
                            (function(formGroup) {
                                var div = $('<div class="checkbox">'),
                                    label = $('<label>'),
                                    input = $('<input>');

                                input.attr('type', 'checkbox').attr('ng-model', 'item.' + attr.name);
                                label.append(input);
                                label.append(attr.label);
                                div.append(label);
                                formGroup.append(div);
                            })(formGroup);
                            break;

                        case 'radio':
                            formGroup.append('<br>');
                            (function(formGroup) {
                                _.each(attr.options, function(item) {
                                    var label = $('<label class="radio-inline" >'),
                                        input = $('<input>');
                                    input.attr('type', 'radio').attr('ng-model', 'item.' + attr.name).attr('value', item.value);

                                    label.append(input);
                                    label.append(item.name);
                                    formGroup.append(label);

                                });
                            })(formGroup);
                            break;
                        case 'date':
                            $('<date>')
                                .attr('attr', 'attrs[' + index + ']')
                                .attr('item', 'item')
                                .appendTo(formGroup);
                            break;
                        default:
                            break;
                    }

                    formGroup.appendTo($element);
                });

                $compile($element.contents())($scope);



            }
        };
    });

;
'use strict';

/**
 * @ngdoc service
 * @name backendApp.dialog
 * @description
 * # dialog
 * Factory in the backendApp.
 */
angular.module('app')
    .factory('dialog', function($modal,$timeout) {

        var confirm = function(msg,content, okFn, cancelFn) {
            var modalInstance = $modal.open({
                templateUrl: 'views/confirm-window.html',
                controller: function($scope, $modalInstance) {
                    $scope.msg = msg;
                    $scope.content = content;
                    $scope.ok = function() {
                        $modalInstance.close();
                    };
                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };

                },
                size: ''
            });

            modalInstance.result.then(function() {
                if (angular.isFunction(okFn)) {
                    okFn();
                }
            }, function() {
                if (angular.isFunction(cancelFn)) {
                    cancelFn();
                }
            });
        };


        var info = function(msg, okFn) {
            var modalInstance = $modal.open({
                templateUrl: 'views/info-window.html',
                controller: function($scope, $modalInstance) {
                    $scope.msg = msg;
                    $scope.ok = function() {
                        $modalInstance.close();
                    };
                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };

                },
                size: ''
            });

            modalInstance.result.then(function() {
                if (angular.isFunction(okFn)) {
                    $timeout(okFn,100);
                }
            }, function() {});
        };


        var prompt = function(msg, defaultContent, okFn) {
            var modalInstance = $modal.open({
                templateUrl: 'views/prompt-window.html',
                controller: function($scope, $modalInstance) {
                    $scope.msg = msg;
                    $scope.content = defaultContent;
                    $scope.ok = function() {
                        $modalInstance.close($scope.content);
                    };
                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };

                },
                size: ''
            });

            modalInstance.result.then(function(result) {
                if (angular.isFunction(okFn)) {
                    $timeout(function(){
                        okFn(result);
                    },100);
                }
            }, function() {});
        };


        // Public API here
        return {
            'info': info,
            'confirm': confirm,
            'prompt': prompt
        };
    });

;
'use strict';

/**
 * @ngdoc service
 * @name slimApp.iStagingUpload
 * @description
 * # iStagingUpload
 * Factory in the slimApp.
 */
angular.module('app')
    .factory('iStagingUpload', function(Restangular) {



        var baseUrl = 'http://shielded-everglades-7468.herokuapp.com';


        var myRestangular = Restangular.withConfig(function(RestangularConfigurer) {

            RestangularConfigurer.setBaseUrl(baseUrl);
            RestangularConfigurer.setDefaultHttpFields({
                transformRequest: angular.identity
            });
        });
        return function(fd, urlKey) {
            return myRestangular.one('upload2').customPOST(fd, urlKey, undefined, {
                'Content-Type': undefined
            });
        };
    });

;
'use strict';

/**
 * @ngdoc directive
 * @name slimApp.directive:objUploader
 * @description
 * # objUploader
 */
angular.module('app')
    .directive('objUploader', function(iStagingUpload, dialog) {
        return {
            templateUrl: 'views/obj-uploader.html',
            restrict: 'E',
            scope: {
                'className': '@',
                'attr': '=',
                'item': '='
            },
            link: function postLink($scope, ele) {
                var $fileInput = ele.find('input:file');

                $fileInput.bootstrapFileInput();

                $scope.info = '';

                $fileInput.on('change', function() {
                    $scope.info = '上傳中...';
                    var file = this.files[0],
                        urlKey = encodeURIComponent($scope.className + '/' + $scope.item.objectId + '/3d/'),
                        fd = new FormData();

                    fd.append('file', file);

                    iStagingUpload(fd, urlKey).then(function(res) {
                        $scope.info = '';

                        dialog.info('上傳完成', function() {
                            $scope.item[$scope.attr.name] = res.downloadlink;

                            if ($scope.item.mode === 'VR' && $scope.item.route === "InteriorDesign") {
                              console.log($scope.item.route)
                              $scope.item.ios_object_url = $scope.item.android_object_url
                            }
                        });
                    });
                });
            }
        };
    });

;
'use strict';

/**
 * @ngdoc directive
 * @name slimApp.directive:objUploader
 * @description
 * # imageUploader
 */
angular.module('app')
    .directive('imageUploader', function(iStagingUpload, $timeout, dialog) {
        return {
            templateUrl: 'views/image-uploader.html',
            restrict: 'E',
            scope: {
                'className': '@',
                'attr': '=',
                'item': '='
            },
            link: function postLink($scope, ele) {
                var $fileInput = ele.find('input:file');
                $scope.info = '';
                $fileInput.bootstrapFileInput();

                $fileInput.on('change', function() {
                    $scope.info = '上傳中...';
                    var file = this.files[0],
                        urlKey = encodeURIComponent($scope.className + '/' + $scope.item.objectId + '/img/'),
                        fd = new FormData();

                    fd.append('file', file);

                    iStagingUpload(fd, urlKey).then(function(res) {
                        $scope.info = '';
                        dialog.info('上傳完成', function() {
                            $timeout(function() {

                                $scope.item[$scope.attr.name] = [res.downloadlink];
                            }, 1000);
                        });

                    });
                });
            }
        };
    });

;
'use strict';

/**
 * @ngdoc service
 * @name slimApp.refData
 * @description
 * # refData
 * Factory in the slimApp.
 */
angular.module('app')
    .factory('refData', function(getClassRest) {


        var restGetListParameter = {
            'skip': 0,
            'limit': 1000,
            'order': 'title'
        };

        var _promises = {},
            _get = function(className) {
                if (!_promises[className]) {

                    _promises[className] = getClassRest()
                        .all(className)
                        .getList(restGetListParameter);
                }
                return _promises[className];
            };

        return {
            get: _get
        };
    });

;
'use strict';

/**
 * @ngdoc directive
 * @name slimApp.directive:refData
 * @description
 * # refData
 */
angular.module('app')
    .directive('refData', function(refData) {
        return {
            templateUrl: 'views/ref-data.html',
            restrict: 'E',
            scope: {
                'refClassName': '@',
                'attr': '=',
                'item': '=',
                'required': '='
            },
            link: function postLink($scope) {



                if (!$scope.item[$scope.attr.name]) {
                    $scope.item[$scope.attr.name] = {
                        __type: 'Pointer',
                        className: $scope.refClassName
                    };
                }


                refData.get($scope.refClassName).then(function(result) {
                    $scope.list = result;
                });
            }
        };
    });

;
'use strict';

/**
 * @ngdoc directive
 * @name slimApp.directive:ref-grid
 * @description
 * # ref-grid
 */
angular.module('app')
    .directive('refGrid', function(getClassRest, $state) {
        return {
            'templateUrl': 'views/ref-grid.html',
            'restrict': 'E',
            'scope': {
                'configs': '='
            },
            'link': function postLink($scope) {
                $scope.$state = $state;
                var configs = $scope.configs;

                var restGetListParameter = {
                    'skip': 0,
                    'limit': 1000,
                    'order': 'title',
                    'where': {}
                };
                //console.log(configs);
                if (configs.isArray) {
                    restGetListParameter.where[configs.filter] = configs.objectId;
                } else {
                    restGetListParameter.where[configs.filter] = {
                        '__type': 'Pointer',
                        'className': configs.className,
                        'objectId': configs.objectId
                    };
                }

                getClassRest()
                    .all(configs.refClassName)
                    .getList(restGetListParameter)
                    .then(function(result) {
                        $scope.list = result;
                    });

            }
        };
    });

;
'use strict';

/**
 * @ngdoc directive
 * @name slimApp.directive:refDataArray
 * @description
 * # refDataArray
 */
angular.module('app')
    .directive('refDataArray', function(refData, _, $q) {
        return {
            template: '<tags-input ng-model="tags" on-tag-added="onTagAdded($tag)" on-tag-removed="onTagRemoved($tag)" add-from-autocomplete-only="true" display-property="title" key-property="objectId"  class="ui-tags-input" template="{{attr.tagsTpl}}"  >' +
                '<auto-complete source="loadTags($query)" min-length="1" template="{{attr.autocompleteTpl}}" ></auto-complete  >' +
                '</tags-input>',
            restrict: 'E',
            scope: {
                'refClassName': '@',
                'attr': '=',
                'item': '='
            },
            link: function postLink($scope) {

                if (!$scope.item[$scope.attr.name]) {
                    $scope.item[$scope.attr.name] = [];
                }

                var _refData = $scope.item[$scope.attr.name],
                    _db = [];

                refData.get($scope.refClassName).then(function(result) {
                    _db = result;
                    //console.log(_refData);
                    $scope.tags = _.filter(_db, function(item) {
                        //console.log(item.objectId);
                        return (-1 !== _refData.indexOf(item.objectId));
                    });
                    //console.log($scope.tags);
                });

                $scope.onTagAdded = function($tag) {
                    //console.log(_refData);
                    _refData.push($tag.objectId);
                    //console.log(_refData);

                };
                $scope.onTagRemoved = function($tag) {
                    //console.log(_refData);
                    var index = _refData.indexOf($tag.objectId);
                    if (-1 !== index) {
                        _refData.splice(index, 1);
                    }
                    //console.log(_refData);
                };
                $scope.loadTags = function($query) {
                    var deferred = $q.defer();
                    var re = new RegExp($query, 'i');
                    var result = _.filter(_db, function(item) {
                        return re.test(item.title);
                    });
                    deferred.resolve(result);
                    return deferred.promise;
                };
            }
        };
    });

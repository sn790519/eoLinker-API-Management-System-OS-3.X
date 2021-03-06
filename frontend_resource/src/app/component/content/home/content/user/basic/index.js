(function() {
    'use strict';
    /**
     * @Author   广州银云信息科技有限公司 eolinker
     * @function [账号管理内页相关指令js] [Account management page related instructions js]
     * @version  3.0.2
     * @service  $scope [注入作用域服务] [inject scope service]
     * @service  $rootScope [注入根作用域服务] [inject rootScope service]
     * @service  CommonResource [注入通用接口服务] [inject common API service]
     * @service  $state [注入路由服务] [inject state service]
     * @service  md5 [注入md5服务] [inject md5 service]
     * @service  NavbarService [注入NavbarService服务] [inject NavbarService service]
     * @service  $filter [注入过滤器服务] [inject filter service]
     * @constant CODE [注入状态码常量] [inject status code constant service]
     */
    angular.module('eolinker')
    .config(['$stateProvider', 'RouteHelpersProvider', function($stateProvider, helper) {
        $stateProvider
        .state('home.user.basic', {
            url: '/basic',
            template: '<user-basic></user-basic>',
        });
    }])
    .component('userBasic', {
        templateUrl: 'app/component/content/home/content/user/basic/index.html',
        controller: indexController
    })

    indexController.$inject = ['$scope', '$rootScope', 'CommonResource', '$state', 'md5', 'NavbarService', '$filter', 'CODE'];

    function indexController($scope, $rootScope, CommonResource, $state, md5, NavbarService, $filter, CODE) {
        var vm = this;
        vm.data = {
            service: NavbarService,
            info: {
                password: {
                    confirm: '',
                    oldError: false
                }
            },
            interaction: {
                request: {
                    oldPassword: '',
                    newPassword: '',
                },
                response: {
                    userInfo: {}
                }
            },
            fun: {
                changePassword: null, 
                confirm: null, 
                init: null, 
            }
        }

        /**
         * @function [初始化功能函数]
         */
        vm.data.fun.init = function() {
            var template = {
                promise: null
            }
            $scope.$emit('$WindowTitleSet', { list: [$filter('translate')('0130'), $filter('translate')('01313')] });
            template.promise = CommonResource.User.Info().$promise;
            template.promise.then(function(response) {
                switch (response.statusCode) {
                    case CODE.COMMON.SUCCESS:
                    {
                        vm.data.service.info.userInfo=vm.data.interaction.response.userInfo = response.userInfo;
                        $scope.$emit('$translateferStation', { state: '$EoNavbarSetUser', data: { userInfo: response.userInfo } });
                        break;
                    }
                }
            })
            return template.promise;
        }

        /**
         * @function [确认功能函数]
         */
        vm.data.fun.confirm = function(arg) {
            CommonResource.User.Nickname({ nickName: vm.data.interaction.response.userInfo.userNickName }).$promise
            .then(function(response) {
                switch (response.statusCode) {
                    case CODE.COMMON.SUCCESS:
                    {
                        $scope.$emit('$translateferStation', { state: '$EoNavbarChangeUser', data: vm.data.interaction.response.userInfo.userNickName });
                    }
                    case '130009':
                    {
                        $rootScope.InfoModal($filter('translate')('01314'), 'success');
                        break;
                    }
                }
            })
        }

        /**
         * @function [修改密码功能函数]
         */
        vm.data.fun.changePassword = function() {
            var template = {
                request: {
                    oldPassword: md5.createHash(vm.data.interaction.request.oldPassword),
                    newPassword: md5.createHash(vm.data.interaction.request.newPassword)
                }
            }
            if ($scope.passwordForm.$valid) {
                CommonResource.User.Password(template.request).$promise
                .then(function(response) {
                    switch (response.statusCode) {
                        case CODE.COMMON.SUCCESS:
                        case CODE.USER.UNCHANGE:
                        {
                            $rootScope.InfoModal($filter('translate')('01314'), 'success');
                            $state.reload();
                            break;
                        }
                        case CODE.USER.PASSWORD_ERROR:
                        {
                            vm.data.info.password.oldError = true;
                            $rootScope.InfoModal($filter('translate')('01315'), 'error');
                            break;
                        }
                    }
                })
            }
        }
        
    }
})();

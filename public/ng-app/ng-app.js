angular.module("myApp",["ngRoute","ngResource","ngSanitize","ngMessages","mediaCheck","satellizer"]),function(){"use strict";function t(t,n,e,i,o,c){function a(){r.btnSaved=!1,r.btnSaveText="Save"}function u(t){r.btnSaveText=""===t||null===t?"Enter Name":"Save"}var r=this;r.logins=o.LOGINS,r.isAuthenticated=function(){return n.isAuthenticated()},r.getProfile=function(){function t(t){r.user=t,r.administrator=r.user.isAdmin,r.linkedAccounts=c.getLinkedAccounts(r.user,"account"),r.showAccount=!0}e.getUser(t)},a(),t.$watch("account.user.displayName",u),r.updateProfile=function(){function t(){r.btnSaved=!0,r.btnSaveText="Saved!",i(a,2500)}function n(){r.btnSaved="error",r.btnSaveText="Error saving!",i(a,3e3)}var o={displayName:r.user.displayName};r.user.displayName&&(r.btnSaveText="Saving...",e.updateUser(o,t,n))},r.link=function(t){n.link(t).then(function(){r.getProfile()})["catch"](function(t){alert(t.data.message)})},r.unlink=function(t){n.unlink(t).then(function(){r.getProfile()})["catch"](function(n){alert(n.data?n.data.message:"Could not unlink "+t+" account")})},r.getProfile()}angular.module("myApp").controller("AccountCtrl",t),t.$inject=["$scope","$auth","userData","$timeout","OAUTH","User"]}(),function(){"use strict";angular.module("myApp").constant("MQ",{SMALL:"(max-width: 767px)",LARGE:"(min-width: 768px)"})}(),function(){"use strict";angular.module("myApp").constant("OAUTH",{LOGINS:[{account:"google",name:"Google",url:"http://accounts.google.com"},{account:"twitter",name:"Twitter",url:"http://twitter.com"},{account:"facebook",name:"Facebook",url:"http://facebook.com"},{account:"github",name:"GitHub",url:"http://github.com"}]})}(),function(){"use strict";function t(t){function n(n){var e=[];return angular.forEach(t.LOGINS,function(t){var i=t.account;n[i]&&e.push(i)}),e}return{getLinkedAccounts:n}}angular.module("myApp").factory("User",t),t.$inject=["OAUTH"]}(),function(){"use strict";function t(t){t.loginUrl="http://localhost:8080/auth/login",t.facebook({clientId:"343789249146966"}),t.google({clientId:"479651367330-trvf8efoo415ie0usfhm4i59410vk3j9.apps.googleusercontent.com"}),t.twitter({url:"/auth/twitter"}),t.github({clientId:"8096e95c2eba33b81adb"})}function n(t,n,e){t.$on("$routeChangeStart",function(i,o){o&&o.$$route&&o.$$route.secure&&(e.isAuthenticated()||t.$evalAsync(function(){n.path("/login")}))})}angular.module("myApp").config(t).run(n),t.$inject=["$authProvider"],n.$inject=["$rootScope","$location","$auth"]}(),function(){"use strict";function t(t,n){t.when("/",{templateUrl:"ng-app/home/Home.view.html",secure:!0}).when("/login",{templateUrl:"ng-app/login/Login.view.html"}).when("/account",{templateUrl:"ng-app/account/Account.view.html",secure:!0}).when("/admin",{templateUrl:"ng-app/admin/Admin.view.html",secure:!0}).otherwise({redirectTo:"/"}),n.html5Mode({enabled:!0}).hashPrefix("!")}angular.module("myApp").config(t),t.$inject=["$routeProvider","$locationProvider"]}(),function(){function t(t,n){function e(e,i){function o(){var t=i.find(".ad-test");e.ab.blocked=t.height()<=0||!i.find(".ad-test:visible").length}e.ab={},e.ab.host=n.host(),t(o,200)}return e.$inject=["$scope","$elem","$attrs"],{restrict:"EA",link:e,template:'<div class="ad-test fa-facebook fa-twitter" style="height:1px;"></div><div ng-if="ab.blocked" class="ab-message alert alert-danger"><i class="fa fa-ban"></i> <strong>AdBlock</strong> is prohibiting important functionality! Please disable ad blocking on <strong>{{ab.host}}</strong>. This site is ad-free.</div>'}}angular.module("myApp").directive("detectAdblock",t),t.$inject=["$timeout","$location"]}(),function(){"use strict";function t(t){this.getJSON=function(n){return t.get("/ng-app/data/data.json").success(n).error(function(t){alert(t.message)})}}angular.module("myApp").service("localData",t),t.$inject=["$http"]}(),function(){"use strict";var t=angular.module("mediaCheck",[]);t.service("mediaCheck",["$window","$timeout",function(t,n){this.init=function(e){var i,o,c,a,u=e.scope,r=e.mq,s=e.debounce,l=angular.element(t),d=void 0,f=void 0!==t.matchMedia&&!!t.matchMedia("!").addListener,m=void 0,h=void 0,g=s?s:250;if(f)return h=function(t){t.matches&&"function"==typeof e.enter?e.enter(t):"function"==typeof e.exit&&e.exit(t),"function"==typeof e.change&&e.change(t)},(d=function(){return m=t.matchMedia(r),o=function(){return h(m)},m.addListener(o),l.bind("orientationchange",o),u.$on("$destroy",function(){m.removeListener(o),l.unbind("orientationchange",o)}),h(m)})();i={},h=function(t){return t.matches?!!i[r]==!1&&"function"==typeof e.enter&&e.enter(t):(i[r]===!0||null==i[r])&&"function"==typeof e.exit&&e.exit(t),(t.matches&&!i[r]||!t.matches&&(i[r]===!0||null==i[r]))&&"function"==typeof e.change&&e.change(t),i[r]=t.matches};var p=function(t){var n=document.createElement("div");return n.style.width="1em",n.style.position="absolute",document.body.appendChild(n),px=t*n.offsetWidth,document.body.removeChild(n),px},v=function(t,n){var e;switch(e=void 0,n){case"em":e=p(t);break;default:e=t}return e};i[r]=null,c=function(){var n=r.match(/\((.*)-.*:\s*([\d\.]*)(.*)\)/),e=n[1],i=v(parseInt(n[2],10),n[3]),o={},c=t.innerWidth||document.documentElement.clientWidth;return o.matches="max"===e&&i>c||"min"===e&&c>i,h(o)};var $=function(){clearTimeout(a),a=n(c,g)};return l.bind("resize",$),u.$on("$destroy",function(){l.unbind("resize",$)}),c()}}])}(),function(){"use strict";function t(t){return function(n){return t.trustAsHtml(n)}}angular.module("myApp").filter("trustAsHTML",t),t.$inject=["$sce"]}(),function(){"use strict";function t(t,n){function e(){var e=this;e.isAuthenticated=function(){return n.isAuthenticated()},t.getUser(function(t){e.user=t})}return{restrict:"EA",controller:e,controllerAs:"u",template:'<div ng-if="u.isAuthenticated() && !!u.user" class="user clearfix"><img ng-if="!!u.user.picture" ng-src="{{u.user.picture}}" class="user-picture" /><span class="user-displayName">{{u.user.displayName}}</span></div>'}}angular.module("myApp").directive("user",t),t.$inject=["userData","$auth"]}(),function(){"use strict";function t(t){console.log("userData error:",t.message)}function n(n){this.getUser=function(e,i){return n.get("/api/me").success(e).error(i||t)},this.updateUser=function(e,i,o){return n.put("/api/me",e).success(i).error(o||t)},this.getAllUsers=function(e,i){return n.get("/api/users").success(e).error(i||t)}}angular.module("myApp").service("userData",n),n.$inject=["$http"]}(),function(){"use strict";function t(t,n,e){function i(i){function o(){e(function(){i.vs.viewformat="small"})}function c(){e(function(){i.vs.viewformat="large"})}i.vs={},t.init({scope:i,mq:n.SMALL,enter:o,exit:c})}return i.$inject=["$scope"],{restrict:"EA",link:i}}angular.module("myApp").directive("viewSwitch",t),t.$inject=["mediaCheck","MQ","$timeout"]}(),function(){"use strict";function t(t,n,e){function i(t){o.users=t,angular.forEach(o.users,function(t){t.linkedAccounts=e.getLinkedAccounts(t)}),o.showAdmin=!0}var o=this;o.isAuthenticated=function(){return t.isAuthenticated()},n.getAllUsers(i)}angular.module("myApp").controller("AdminCtrl",t),t.$inject=["$auth","userData","User"]}(),function(){"use strict";function t(t,n,e,i,o){function c(){i.isAuthenticated()&&void 0===a.adminUser&&o.getUser(function(t){a.adminUser=t.isAdmin})}var a=this;a.logout=function(){a.adminUser=void 0,i.logout("/login")},c(),t.$on("$locationChangeSuccess",c),a.isAuthenticated=function(){return i.isAuthenticated()},e.getJSON(function(t){a.json=t}),a.indexIsActive=function(t){return n.path()===t},a.navIsActive=function(t){return n.path().substr(0,t.length)===t}}angular.module("myApp").controller("HeaderCtrl",t),t.$inject=["$scope","$location","localData","$auth","userData"]}(),function(){"use strict";function t(t,n,e){function i(i){function o(){s.removeClass("nav-closed").addClass("nav-open"),r=!0}function c(){s.removeClass("nav-open").addClass("nav-closed"),r=!1}function a(){c(),e(function(){i.nav.toggleNav=function(){r?c():o()}}),i.$on("$locationChangeSuccess",c)}function u(){e(function(){i.nav.toggleNav=null}),s.removeClass("nav-closed nav-open")}i.nav={};var r,s=angular.element("body");t.init({scope:i,mq:n.SMALL,enter:a,exit:u})}return i.$inject=["$scope","$element","$attrs"],{restrict:"EA",link:i}}angular.module("myApp").directive("navControl",t),t.$inject=["mediaCheck","MQ","$timeout"]}(),function(){"use strict";function t(t,n){var e=this;e.isAuthenticated=function(){return t.isAuthenticated()},n.getJSON(function(t){e.localData=t}),e.stringOfHTML='<strong>Some bold text</strong> bound as HTML with a <a href="#">link</a>!'}angular.module("myApp").controller("HomeCtrl",t),t.$inject=["$auth","localData"]}(),function(){"use strict";function t(t){var n=this;n.authenticate=function(n){t.authenticate(n).then(function(){})["catch"](function(t){console.log(t.data)})}}angular.module("myApp").controller("LoginCtrl",t),t.$inject=["$auth"]}();
"use strict";window.helpers=function(){function s(){n()}function n(){var s=navigator.userAgent.toLowerCase(),n=s.lastIndexOf("chrome/")>0,r=null,o=$("html");n&&(r=s.substr(s.lastIndexOf("chrome/")+7,2),r>=12&&o.hasClass("no-csstransforms3d")&&o.removeClass("no-csstransforms3d").addClass("csstransforms3d"))}s()}();
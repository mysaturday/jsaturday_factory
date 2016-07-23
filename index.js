var debug = require('debug')('jsaturday::factory');
var extend = require('extend');

// -----------------------------------------------------------
// This is a draft!
// -----------------------------------------------------------

var maxStackLevel = 5;


module.exports = function(appSettings){
  return new JSaturday(appSettings);
};

function JSaturday(appSettings){
  var globalObject = {};
  var stackLevel = 1;

  this.get = function(moduleName){
    var module = globalObject[moduleName];
    if(module)
      return module;
    throw new Error('Module ' + moduleName + ' not loaded!');  
  };

  this.testAdd = function(test){
    globalObject[test] = 1;
  };

  this.getModules = function(){
    return Object.keys(globalObject);
  };  

  this.settings = function(){
    return settings;
  };

  this.loadModule = function(info, options){

    if(stackLevel > maxStackLevel)
      throw new Error('Max stack level in loading modules. Check for cyclic dependences...');

    debug('info', 'Loading module ' + info.name + ' (stackLevel = ' + stackLevel + ')...');

    if(!info.name)
      throw new Error('Missing info.name');

    if(globalObject[info.name]){
      debug('warning ' + info.name + ' already loaded');
      return false;
    }

    if(typeof info.dependsOn === 'string')
      info.dependsOn = [info.dependsOn];

    if(!info.dependsOn)
      info.dependsOn = [];

    // ---------------------------------------------------------
    // Dependences
    // ---------------------------------------------------------
    for(var i = 0; i < info.dependsOn.length; i++){
      if(!globalObject[ info.dependsOn[i] ]){

        stackLevel++;
        debug('info',  info.name + ' Try to import ' + info.dependsOn[i]);

        var dependentModule = require(info.dependsOn[i]);
        this.loadModule(dependentModule, options);
     
        stackLevel--;        
      }
      else{
        debug('info',  info.name + ' Skip import of' + info.dependsOn[i]);      
      }
    }

    var commonInterface = {};
    commonInterface.getModule = this.get;
    commonInterface.name = info.name;

    // ---------------------------------------------------------
    // Settings
    // ---------------------------------------------------------
    var settings = {};
    if(info.settings){
      var allSettings = require(info.settings);
      // If defined in app settings, overwrite module settings
      if(appSettings[info.name]){
        extend(true, allSettings, appSettings[info.name]);
      }
      // Returns just environment settings
      var env = process.env.NODE_ENV || 'development';
      var defaultSettings = allSettings.default || {};
      var envSettings = allSettings[env] || {};
      extend(true, defaultSettings, envSettings);
      settings = defaultSettings;
    }
    commonInterface.settings = Object.freeze(settings);

    // ---------------------------------------------------------
    // Libs
    // ---------------------------------------------------------
    var lib = {};
    if(info.lib)
      lib = require(info.lib)(commonInterface);
    commonInterface.lib = Object.freeze(lib);

    // ---------------------------------------------------------
    // Server API
    // ---------------------------------------------------------
    var api = {};
    if(info.api)
      api = require(info.api)(commonInterface);
    commonInterface.api = Object.freeze(api);

    // Add module to globalObject
    globalObject[info.name] = commonInterface;

    debug('info', 'Loaded module ' + info.name + '!\n');
    return true;

  };

}


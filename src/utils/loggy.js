//This file provides simple logging that can be enabled/disabled

export default class Logger{
    constructor(targetObj, enabled){
        this.targetObject = targetObj;
        this.enabled = enabled;
    }

    log(obj){
        var logObject = {
            origin: this.targetObject,
            log: obj
        }

        console.log(logObject);
    }
}
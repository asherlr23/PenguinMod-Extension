(function(Scratch) {
    'use strict';
class tempVars {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {runtime}
         */
        this.runtime = runtime;
    }

    getThreadVars (thread) {
        if (!thread.tempVars) {
            thread.tempVars = {};
        }
        return thread.tempVars;
    }
    
    getInfo () {
        return {
            id: 'tempVars',
            name: 'temp variables',
            color1: '#0069c2',
            color2: '#0060B4',
            color3: '#0060B4',
            blocks: [
                {
                    opcode: 'setVariable',
                    text: 'set [name] to [value]',
                    arguments: {
                        name: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'Variable'
                        },
                        value: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'Value'
                        }
                    },
                    blockType: Scratch.BlockType.COMMAND
                },
                {
                    opcode: 'changeVariable',
                    text: 'change [name] by [value]',
                    arguments: {
                        name: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'Variable'
                        },
                        value: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '1'
                        }
                    },
                    blockType: Scratch.BlockType.COMMAND
                },
                {
                    opcode: 'getVariable',
                    text: 'get [name]',
                    arguments: {
                        name: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'Variable'
                        }
                    },
                    blockType: Scratch.BlockType.REPORTER
                }
            ]
        };
    }

    setVariable (args, util) {
        const tempVars = this.getThreadVars(util.thread);
        const name = `threadVar_${args.name}`;
        tempVars[name] = args.value;
    }

    changeVariable (args, util) {
        const tempVars = this.getThreadVars(util.thread);
        const name = `threadVar_${args.name}`;
        const oldNum = Number(tempVars[name]);
        const newNum = oldNum + args.value;
        if (!oldNum) {
            tempVars[name] = Number(args.value);
            return;
        }
        tempVars[name] = newNum;
    }

    getVariable (args, util) {
        const tempVars = this.getThreadVars(util.thread);
        const name = `threadVar_${args.name}`;
        const value = tempVars[name];
        if (!value) return '';
        return value;
    }
}

Scratch.extensions.register(new tempVars());
})(Scratch);
const formatMessage = require('format-message');
const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');

/**
 * Class for Proto blocks
 * @constructor
 */
class jwProto {
    constructor(runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            autoLoad: true,
            id: 'jwProto',
            name: 'Labels', // change this back if you update the extension to have more things
            // blockIconURI: blockIconURI,
            color1: '#ffdc7a',
            color2: '#ffd45e',
            blocks: [
                {
                    opcode: 'labelHat',
                    text: formatMessage({
                        id: 'jwProto.blocks.labelHat',
                        default: 'label [LABEL]',
                        description: 'Label for some unused blocks.'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.HAT,
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: "label"
                        }
                    }
                },
                {
                    opcode: 'labelFunction',
                    text: formatMessage({
                        id: 'jwProto.blocks.labelFunction',
                        default: 'label [LABEL]',
                        description: 'Label for some blocks.'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.COMMAND,
                    branchCount: 1,
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: "label"
                        }
                    }
                },
                {
                    opcode: 'labelCommand',
                    text: formatMessage({
                        id: 'jwProto.blocks.labelCommand',
                        default: 'label [LABEL]',
                        description: 'Label for labeling.'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.COMMAND,
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: "label"
                        }
                    }
                },
                {
                    opcode: 'labelReporter',
                    text: formatMessage({
                        id: 'jwProto.blocks.labelReporter',
                        default: 'label [LABEL] [VALUE]',
                        description: 'Label for a value.'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: "label"
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: "value"
                        }
                    }
                },
                {
                    opcode: 'labelBoolean',
                    text: formatMessage({
                        id: 'jwProto.blocks.labelBoolean',
                        default: 'label [LABEL] [VALUE]',
                        description: 'Label for a boolean.'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: "label"
                        },
                        VALUE: {
                            type: ArgumentType.BOOLEAN
                        }
                    }
                }
            ]
        };
    }

    labelHat() {
        return false;
    }
    labelFunction(args) {
        args.substack1();
    }
    labelCommand() {
    }
    labelReporter(args) {
        return args.VALUE;
    }
    labelBoolean(args) {
        return args.VALUE;
    }
}

module.exports = jwProto;

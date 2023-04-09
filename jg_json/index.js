(function(Scratch) {
  'use strict';

const validateJSON = (json) => {
    let valid = false;
    let object = {};
    try {
        if (!json.startsWith('{')) throw new Error('error lol');
        object = JSON.parse(json);
        valid = true;
    } catch {}

    return {
        object: object,
        json: json,
        isValid: valid
    };
}

const validateArray = array => {
    let valid = false;
    let allay = [];
    try {
        if (!array.startsWith('[')) throw new Error('error lol');
        allay = JSON.parse(array);
        valid = true;
    } catch {}

    return {
        array: allay,
        json: array,
        isValid: valid
    };
}

const stringToEqivalint = value => {
    // is the value a valid json? if so convert to one else do nothing
    try {
        if (!(value.startsWith('{') || value.startsWith('['))) throw new Error('You must provide a valid json in order for this block to work!');
        value = JSON.parse(value);
    } catch {
        // well its not a json so what is it?
        if (String(Number(value)) === value) {
            value = Number(value);
        } else if (value.toLowerCase() === 'true') {
            value = true;
        } else if (value.toLowerCase() === 'false') {
            value = false;
        } else if (value === 'undefined') {
            value = undefined;
        } else if (value === 'null') {
            value = null;
        }
    }

    return value;
}

const valueToString = value => {
    if (typeof value === 'object') {
        value = JSON.stringify(value);
    } else {
        value = String(value);
    }

    return value;
}

const validateRegex = (value, regrule) => {
    let valid = false;
    try {
        new RegExp(value, regrule);
        valid = true;
    } catch {}

    return valid;
}

class JgJSONBlocks {
    constructor (runtime) {
        this.runtime = runtime;
    }
    getInfo () {
        return {
            id: 'jgJSON',
            name: 'JSON',
            color1: '#0FBD8C',
            color2: '#0EAF82',
            blocks: [
                {
                    opcode: 'json_validate',
                    blockType: Scratch.BlockType.BOOLEAN,
                    arguments: {
                        json: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "{}"
                        }
                    },
                    text: 'is json [json] valid?'
                }, 
                "---",
                {
                    opcode: 'getValueFromJSON',
                    text: {
                        id: 'jgJSON.blocks.getValueFromJSON',
                        default: 'get [VALUE] from [JSON]',
                        description: 'Gets a value from a JSON object.'
                   },
                    disableMonitor: true,
                    blockType: Scratch.BlockType.REPORTER,
                    arguments: {
                        VALUE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: {
                                id: 'jgJSON.getValueFromJSON_value',
                                default: 'key',
                                description: 'The name of the item you want to get from the JSON.'
                            },
                        },
                        JSON: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '{"key": "value"}'
                        }
                    }
                },
                {
                    opcode: 'setValueToKeyInJSON',
                    text: {
                        id: 'jgJSON.blocks.setValueToKeyInJSON',
                        default: 'set [KEY] to [VALUE] in [JSON]',
                        description: 'Returns the JSON with the key set to the value.'
                    },
                    disableMonitor: true,
                    blockType: Scratch.BlockType.REPORTER,
                    arguments: {
                        VALUE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: {
                                id: 'jgJSON.setValueToKeyInJSON_value',
                                default: 'value',
                                description: 'The value of the key you are setting.'
                            },
                        },
                        KEY: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: {
                                id: 'jgJSON.setValueToKeyInJSON_key',
                                default: 'key',
                                description: 'The key you are setting in the JSON.'
                            },
                        },
                        JSON: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "{}"
                        }
                    }
                }, 
                {
                    opcode: 'json_delete',
                    blockType: Scratch.BlockType.REPORTER,
                    arguments: {
                        json: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "{}"
                        },
                        key: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: {
                                id: 'jgJSON.setValueToKeyInJSON_key',
                                default: 'key',
                                description: 'The key you are setting in the JSON.'
                            },
                        }
                    },
                    text: 'in json [json] delete key [key]'
                }, 
                {
                    opcode: 'json_values',
                    blockType: Scratch.BlockType.REPORTER,
                    arguments: {
                        json: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "{}"
                        }
                    },
                    text: 'get all values from json [json]'
                }, 
                {
                    opcode: 'json_keys',
                    blockType: Scratch.BlockType.REPORTER,
                    arguments: {
                        json: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "{}"
                        }
                    },
                    text: 'get all keys from json [json]'
                }, 
                {
                    opcode: 'json_has',
                    blockType: Scratch.BlockType.BOOLEAN,
                    arguments: {
                        json: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "{}"
                        },
                        key: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: {
                                id: 'jgJSON.setValueToKeyInJSON_key',
                                default: 'key',
                                description: 'The key you are setting in the JSON.'
                            },
                        }
                    },
                    text: 'json [json] has key [key] ?'
                },
                {
                    blockType: Scratch.BlockType.LABEL,
                    text: "Arrays"
                },
                {
                    opcode: 'json_array_validate',
                    blockType: Scratch.BlockType.BOOLEAN,
                    arguments: {
                        array: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "[]"
                        }
                    },
                    text: 'is array [array] valid?'
                }, 
                {
                    opcode: 'json_array_split',
                    blockType: Scratch.BlockType.REPORTER,
                    arguments: {
                        text: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "A, B, C"
                        },
                        delimeter: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: ', '
                        }
                    },
                    text: 'create an array from text [text] with delimeter [delimeter]'
                }, 
                {
                    opcode: 'json_array_join',
                    blockType: Scratch.BlockType.REPORTER,
                    arguments: {
                        array: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "[\"A\", \"B\", \"C\"]"
                        },
                        delimeter: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: ', '
                        }
                    },
                    text: 'create text from array [array] with delimeter [delimeter]'
                }, 
                "---",
                {
                    opcode: 'json_array_push',
                    blockType: Scratch.BlockType.REPORTER,
                    arguments: {
                        array: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "[\"A\", \"B\", \"C\"]"
                        },
                        item: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: {
                                id: 'jgJSON.setValueToKeyInJSON_value',
                                default: 'value',
                                description: 'The value of the key you are setting.'
                            },
                        }
                    },
                    text: 'in array [array] add [item]'
                }, 
                "---",
                {
                    opcode: 'json_array_delete',
                    blockType: Scratch.BlockType.REPORTER,
                    arguments: {
                        array: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "[\"A\", \"B\", \"C\"]"
                        },
                        index: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 2
                        }
                    },
                    text: 'in array [array] delete [index]'
                },
                {
                    opcode: 'json_array_reverse',
                    blockType: Scratch.BlockType.REPORTER,
                    arguments: {
                        array: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "[\"A\", \"B\", \"C\"]"
                        }
                    },
                    text: 'reverse array [array]'
                }, 
                {
                    opcode: 'json_array_insert',
                    blockType: Scratch.BlockType.REPORTER,
                    arguments: {
                        array: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "[\"A\", \"B\", \"C\"]"
                        },
                        index: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 2
                        },
                        value: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: {
                                id: 'jgJSON.setValueToKeyInJSON_value',
                                default: 'value',
                                description: 'The value of the key you are setting.'
                            }
                        }
                    },
                    text: 'in array [array] insert [value] at [index]'
                },
                {
                    opcode: 'json_array_set',
                    blockType: Scratch.BlockType.REPORTER,
                    arguments: {
                        array: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "[\"A\", \"B\", \"C\"]"
                        },
                        index: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 2
                        },
                        value: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: {
                                id: 'jgJSON.setValueToKeyInJSON_value',
                                default: 'value',
                                description: 'The value of the key you are setting.'
                            },
                        }
                    },
                    text: 'in array [array] set [index] to [value]'
                },  
                "---",
                {
                    opcode: 'json_array_get',
                    blockType: Scratch.BlockType.REPORTER,
                    arguments: {
                        array: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "[\"A\", \"B\", \"C\"]"
                        },
                        index: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 2
                        }
                    },
                    text: 'in array [array] get [index]'
                }, 
                {
                    opcode: 'json_array_indexof',
                    blockType: Scratch.BlockType.REPORTER,
                    arguments: {
                        array: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "[\"A\", \"B\", \"C\"]"
                        },
                        number: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 2
                        },
                        value: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: {
                                id: 'jgJSON.setValueToKeyInJSON_value',
                                default: 'value',
                                description: 'The value of the key you are setting.'
                            },
                        }
                    },
                    text: 'in array [array] get [number] index of [value]'
                }, 
                {
                    opcode: 'json_array_length',
                    blockType: Scratch.BlockType.REPORTER,
                    arguments: {
                        array: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "[\"A\", \"B\", \"C\"]"
                        }
                    },
                    text: 'length of array [array]'
                }, 
                {
                    opcode: 'json_array_contains',
                    blockType: Scratch.BlockType.BOOLEAN,
                    arguments: {
                        array: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "[\"A\", \"B\", \"C\"]"
                        },
                        value: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: {
                                id: 'jgJSON.setValueToKeyInJSON_value',
                                default: 'value',
                                description: 'The value of the key you are setting.'
                            },
                        }
                    },
                    text: 'array [array] contains [value] ?'
                }, 
                "---",
                {
                    opcode: 'json_array_getrange',
                    blockType: Scratch.BlockType.REPORTER,
                    arguments: {
                        array: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "[\"A\", \"B\", \"C\"]"
                        },
                        index1: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 2
                        },
                        index2: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 2
                        }
                    },
                    text: 'in array [array] get all items from [index1] to [index2]'
                }, 
                "---",
                {
                    opcode: 'json_array_isempty',
                    blockType: Scratch.BlockType.BOOLEAN,
                    arguments: {
                        array: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "[\"A\", \"B\", \"C\"]"
                        }
                    },
                    text: 'is array [array] empty?'
                }, 
                "---",
                {
                    opcode: 'json_array_listtoarray',
                    blockType: Scratch.BlockType.REPORTER,
                    arguments: {
                        list: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'select a list',
                            menu: 'lists'
                        }
                    },
                    text: 'get contents of list [list] as array'
                },
                {
                    opcode: 'json_array_tolist',
                    blockType: Scratch.BlockType.COMMAND,
                    arguments: {
                        list: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'select a list',
                            menu: 'lists'
                        },
                        array: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "[\"A\", \"B\", \"C\"]"
                        }
                    },
                    text: 'set contents of list [list] to contents of array [array]'
                }
            ],
            menus: {
                lists: 'getAllLists'
            }
        };
    }

    getAllLists () {
        const variables = [].concat(
            Object.values(vm.runtime.getTargetForStage().variables),
            Object.values(vm.editingTarget.variables)
        );
        const lists = variables.filter(i => i.type === 'list');
        if (lists.length === 0) {
            return [
                {
                    text: 'select a list',
                    value: 'select a list'
                }
            ];
        }
        return lists.map(i => ({
            text: i.name,
            value: JSON.stringify({
                id: i.id,
                name: i.name
            })
        }));
    }

    getValueFromJSON (args) {
        const key = args.VALUE;
        const json = validateJSON(args.JSON).object;

        return valueToString(json[key]);
    }
    setValueToKeyInJSON (args) {
        const json = validateJSON(args.JSON).object;
        const key = args.KEY;
        const value = args.VALUE;

        json[key] = stringToEqivalint(value);

        return JSON.stringify(json);
    }

    json_has (args) {
        const json = validateJSON(args.json).object;
        const key = args.key;

        return json.hasOwnProperty(key);
    }

    json_delete (args) {
        const json = validateJSON(args.json).object;
        const key = args.key;

        if (!json.hasOwnProperty(key)) return JSON.stringify(json);

        delete json[key];

        return JSON.stringify(json);
    }

    json_values (args) {
        const json = validateJSON(args.json).object;

        return JSON.stringify(Object.values(json));
    }

    json_keys (args) {
        const json = validateJSON(args.json).object;

        return JSON.stringify(Object.keys(json));
    }

    json_array_length (args) {
        const array = validateArray(args.array).array;

        return array.length;
    }

    json_array_isempty (args) {
        const array = validateArray(args.array).array;

        return !array.length;
    }

    json_array_contains (args) {
        const array = validateArray(args.array).array;
        const value = args.value;

        return array.includes(stringToEqivalint(value));
    }

    json_array_reverse (args) {
        const array = validateArray(args.array).array;

        return JSON.stringify(array.reverse());
    }

    json_array_indexof (args) {
        const array = validateArray(args.array).array;
        const number = args.number;
        const value = args.value;

        return array.indexOf(stringToEqivalint(value), number);
    }

    json_array_set (args) {
        const array = validateArray(args.array).array;
        const index = args.index;
        const value = args.value;

        array[index] = stringToEqivalint(value);

        return JSON.stringify(array);
    }

    json_array_insert (args) {
        const array = validateArray(args.array).array;
        const index = args.index;
        const value = args.value;

        array.splice(index, 0, stringToEqivalint(value));

        return JSON.stringify(array);
    }

    json_array_get (args) {
        const array = validateArray(args.array).array;
        const index = args.index;

        return valueToString(array[index]);
    }

    json_array_getrange (args) {
        const array = validateArray(args.array).array;
        const index1 = args.index1;
        const index2 = args.index2;

        return JSON.stringify(array.slice(index1, index2));
    }

    json_array_push (args) {
        const array = validateArray(args.array).array;
        const value = args.item;

        array.push(stringToEqivalint(value));

        return JSON.stringify(array);
    }

    json_array_tolist (args, util) {
        let list;
        try {
            list = JSON.parse(args.list);
        } catch {
            return;
        }
        const array = validateArray(args.array).array;
        const content = util.target.lookupOrCreateList(list.id, list.name);

        content.value = array.map(x => valueToString(x));
    }

    json_array_listtoarray (args, util) {
        let list;
        try {
            list = JSON.parse(args.list);
        } catch {
            return;
        }
        const content = util.target.lookupOrCreateList(list.id, list.name).value;

        return JSON.stringify(content.map(x => stringToEqivalint(x)));
    }

    json_array_delete (args) {
        const array = validateArray(args.array).array;
        const index = args.index;

        array.splice(index, 1);

        return JSON.stringify(array);
    }

    json_array_split (args) {
        if (validateRegex(args.delimeter)) args.delimeter = new RegExp(args.delimeter);
        return JSON.stringify(args.text.split(args.delimeter));
    }
    json_array_join (args) {
        return validateArray(args.array).array.join(args.delimeter);
    }

    json_validate (args) {
        return validateJSON(args.json).isValid;
    }
    json_array_validate (args) {
        return validateArray(args.array).isValid;
    }
}

Scratch.extensions.register(new JgJSONBlocks());
})(Scratch);
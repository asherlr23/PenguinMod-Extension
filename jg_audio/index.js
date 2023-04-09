(function(Scratch) {
    'use strict';
function MathOver(number, max) {
    let num = number;
    while (num > max) {
        num -= max;
    }
    return num;
}
function Clamp(number, min, max) {
    if (number < min) return min;
    if (number > max) return max;
    return number;
}
function SafeNumberConvert(tonumber) {
    const n = Number(tonumber);
    if (n == null || n == undefined) return 0;
    if (isNaN(n)) return 0;
    return n;
}

const AudioNodeStorage = [];

class AudioSource {
    constructor(audioContext, audioGroup, source, data) {
        if (source == null) source = "";
        if (data == null) data = {};
        this.src = source;
        this.volume = data.volume != null ? data.volume : 1;
        this.speed = data.speed != null ? data.speed : 1;
        this.pitch = data.pitch != null ? data.pitch : 0;
        this.pan = data.pan != null ? data.pan : 0;
        this.looping = data.looping != null ? data.looping : false;

        this._startingTime = 0;
        this._endingTime = null;
        this.timePosition = data.timePosition != null ? data.timePosition : 0;
        this.resumeSpot = 0;
        this.paused = false;
        this.notPlaying = true;
        this._pauseTime = null;
        this._pauseTimeOffset = null;

        this._audioContext = audioContext == null ? new AudioContext() : audioContext;
        this._audioNode = null;
        this._audioGroup = audioGroup;
        this._audioPanner = this._audioContext.createPanner();
        this._audioPanner.panningModel = 'equalpower';
        this._audioPanner.connect(this._audioContext.destination);
        this._audioGainNode = this._audioContext.createGain();
        this._audioGainNode.gain.value = 1;
        this._audioGainNode.connect(this._audioPanner);

        this.duration = source.duration;

        this.originAudioName = "";
    }

    play() {
        try {
            if (this._audioNode) {
                this._audioNode.onended = null;
                this._audioNode.stop();
            }
        } catch {
            // do nothing
        }
        this._audioNode = this._audioContext.createBufferSource();
        AudioNodeStorage.push(this._audioNode);
        const source = this._audioNode
        this.update();
        source.buffer = this.src;
        source.connect(this._audioGainNode);
        this._endingTime = null;
        if (this.paused) {
            this.paused = false;
            source.start(0, this.resumeSpot);
            this._startingTime = this._pauseTime - this._pauseTimeOffset;
            this._pauseTime = null;
            this._pauseTimeOffset = null;
        } else {
            source.start(0, this.timePosition);
            this._startingTime = Date.now();
        }
        this.notPlaying = false;
        source.onended = () => {
            if (this.paused) return;
            this._endingTime = Date.now();
            source.onended = null;
            this.notPlaying = true;
        }
    }
    stop() {
        try {
            if (this._audioNode) {
                this._audioNode.stop();
                this._audioNode = null;
                this.notPlaying = true;
            }
            this.paused = false;
        } catch {
            // do nothing
        }
    }
    pause() {
        if (!this._audioNode) return;
        this.paused = true;
        this.resumeSpot = MathOver((Date.now() - this._startingTime) * this.speed, this.duration * 1000) / 1000;
        this._audioNode.stop();
        this._audioNode = null;
        this._pauseTime = Date.now();
        this._pauseTimeOffset = (Date.now() - this._startingTime);
        this.notPlaying = true;
    }

    update() {
        if (!this._audioNode) return;
        const audioNode = this._audioNode;
        const audioGroup = this._audioGroup;
        const audioGainNode = this._audioGainNode;
        const audioPanner = this._audioPanner;

        audioNode.loop = this.looping;
        audioNode.detune.value = this.pitch;
        audioNode.playbackRate.value = this.speed;
        audioGainNode.gain.value = this.volume;

        audioNode.detune.value += audioGroup.globalPitch;
        audioNode.playbackRate.value *= audioGroup.globalSpeed;
        audioGainNode.gain.value *= audioGroup.globalVolume;

        const position = this.calculatePannerPosition(Clamp(SafeNumberConvert(this.pan / audioGroup.globalPan), -1, 1));
        audioPanner.setPosition(position.x, position.y, position.z);
    }

    calculateTimePosition() {
        if (this._endingTime != null) return (this._endingTime - this._startingTime) * this.speed;
        return MathOver((Date.now() - this._startingTime) * this.speed, this.duration * 1000);
    }
    calculatePannerPosition(pan) {
        return {
            x: pan,
            y: 0,
            z: 1 - Math.abs(pan)
        };
    }
}
class AudioExtensionHelper {
    constructor(runtime) {
        /**
            * The runtime that the helper will use for all functions.
            * @type {runtime}
        */
        this.runtime = runtime;
        this.audioGroups = {};
        this.audioContext = null;
    }

    SetRuntime = function(runtime) {
        this.runtime = runtime;
    }
    /**
        * Creates a new AudioGroup.
        * @type {string} AudioGroup name
        * @type {object} AudioGroup settings (optional)
        * @type {object[]} AudioGroup sources (optional)
    */
    AddAudioGroup = function(name, data, sources) {
        if (data == null) data = {};
        this.audioGroups[name] = {
            id: name,
            sources: (sources == null ? {} : sources),
            globalVolume: (data.globalVolume == null ? 1 : data.globalVolume),
            globalSpeed: (data.globalSpeed == null ? 1 : data.globalSpeed),
            globalPitch: (data.globalPitch == null ? 0 : data.globalPitch),
            globalPan: (data.globalPan == null ? 0 : data.globalPan)
        };
        return this.audioGroups[name];
    }

    DeleteAudioGroup = function(name) {
        if (this.audioGroups[name] == null) return;
        delete this.audioGroups[name];
    }

    GetAudioGroup = function(name) {
        return this.audioGroups[name];
    }
    GetAllAudioGroups = function() {
        return Object.values(this.audioGroups);
    }
    UpdateAudioGroupSources = function(audioGroup) {
        const audioSources = this.GrabAllGrabAudioSources(audioGroup);
        for (let i = 0; i < audioSources.length; i++) {
            const source = audioSources[i];
            source.update();
        }
    }

    AppendAudioSource = function(parent, name, src, settings) {
        const group = typeof parent == "string" ? this.GetAudioGroup(parent) : parent;
        if (!group) return;
        if (!this.audioContext) this.audioContext = new AudioContext();
        group.sources[name] = new AudioSource(this.audioContext, group, src, settings);
        return group.sources[name];
    }
    
    RemoveAudioSource = function(parent, name) {
        const group = typeof parent == "string" ? this.GetAudioGroup(parent) : parent;
        if (!group) return;
        if (group.sources[name] == null) return;
        delete group.sources[name];
    }

    GrabAudioSource = function(audioGroup, name) {
        const group = typeof audioGroup == "string" ? this.GetAudioGroup(audioGroup) : audioGroup;
        if (!group) return;
        return group.sources[name];
    }

    GrabAllGrabAudioSources = function(audioGroup) {
        const group = typeof audioGroup == "string" ? this.GetAudioGroup(audioGroup) : audioGroup;
        if (!group) return [];
        return Object.values(group.sources);
    }

    FindSoundBySoundId = function(soundList, id) {
        for (let i = 0; i < soundList.length; i++) {
            const sound = soundList[i];
            if (sound.soundId == id) return sound;
        }
        return null;
    }

    FindSoundByName(soundList, name) {
        for (let i = 0; i < soundList.length; i++) {
            const sound = soundList[i];
            if (sound.name == name) return sound;
        }
        return null;
    }

    SafeNumberConvert(tonumber) {
        const n = Number(tonumber);
        if (n == null || n == undefined) return 0;
        if (isNaN(n)) return 0;
        return n;
    }

    Clamp(number, min, max) {
        if (number < min) return min;
        if (number > max) return max;
        return number;
    }


    KillAllProcesses() {
        function PCall(func, catc) {
            try {
                func();
            } catch (err) {
                if (catc) catc(err);
            }
        }

        console.info("Attempting to kill", AudioNodeStorage.length, "audio nodes");
        AudioNodeStorage.forEach(node => {
            PCall(() => {
                node.stop();
            })
        });
        AudioNodeStorage.splice(0, AudioNodeStorage.length);
    }
}

class AudioExtension extends AudioExtensionHelper {
    constructor(runtime) {
        this.runtime = runtime;
    }

    deserialize(data) {
        audioGroups = {};
        for (const audioGroup of data) {
            AddAudioGroup(audioGroup.id, audioGroup);
        }
    }

    serialize() {
        return GetAllAudioGroups().map(audioGroup => ({
            id: audioGroup.id,
            sources: {},
            globalVolume: audioGroup.globalVolume,
            globalSpeed: audioGroup.globalSpeed,
            globalPitch: audioGroup.globalPitch,
            globalPan: audioGroup.globalPan
        }));
    }

    orderCategoryBlocks(blocks) {
        const buttons = {
            create: blocks[0],
            delete: blocks[1]
        };
        const varBlock = blocks[2];
        blocks.splice(0, 3);
        // create the variable block xml's
        const varBlocks = GetAllAudioGroups().map(audioGroup => varBlock.replace('{audioGroupId}', audioGroup.id));
        if (!varBlocks.length) {
            return [buttons.create];
        }
        // push the button to the top of the var list
        varBlocks.reverse();
        varBlocks.push(buttons.delete);
        varBlocks.push(buttons.create);
        // merge the category blocks and variable blocks into one block list
        blocks = varBlocks
            .reverse()
            .concat(blocks);
        return blocks;
    }

    getInfo() {
        return {
            id: 'jgExtendedAudio',
            name: 'Extended Audio',
            color1: '#E256A1',
            color2: '#D33388',
            isDynamic: true,
            orderBlocks: this.orderCategoryBlocks,
            blocks: [
                { opcode: 'createAudioGroup', text: 'New Audio Group', blockType: Scratch.BlockType.BUTTON, },
                { opcode: 'deleteAudioGroup', text: 'Remove an Audio Group', blockType: Scratch.BlockType.BUTTON, },
                {
                    opcode: 'audioGroupGet', text: '[AUDIOGROUP]', blockType: Scratch.BlockType.REPORTER,
                    arguments: {
                        AUDIOGROUP: { menu: 'audioGroup', defaultValue: '{audioGroupId}', type: Scratch.ArgumentType.STRING, }
                    },
                },
                { text: "Operations", blockType: Scratch.BlockType.LABEL, },
                {
                    opcode: 'audioGroupSetVolumeSpeedPitchPan', text: 'set [AUDIOGROUP] [VSPP] to [VALUE]%', blockType: Scratch.BlockType.COMMAND,
                    arguments: {
                        AUDIOGROUP: { type: Scratch.ArgumentType.STRING, menu: 'audioGroup', defaultValue: "" },
                        VSPP: { type: Scratch.ArgumentType.STRING, menu: 'vspp', defaultValue: "" },
                        VALUE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
                    },
                },
                {
                    opcode: 'audioGroupGetModifications', text: '[AUDIOGROUP] [OPTION]', blockType: Scratch.BlockType.REPORTER, disableMonitor: true,
                    arguments: {
                        AUDIOGROUP: { type: Scratch.ArgumentType.STRING, menu: 'audioGroup', defaultValue: "" },
                        OPTION: { type: Scratch.ArgumentType.STRING, menu: 'audioGroupOptions', defaultValue: "" },
                    },
                },
                "---",
                {
                    opcode: 'audioSourceCreate', text: '[CREATEOPTION] audio source named [NAME] in [AUDIOGROUP]', blockType: Scratch.BlockType.COMMAND,
                    arguments: {
                        CREATEOPTION: { type: Scratch.ArgumentType.STRING, menu: 'createOptions', defaultValue: "" },
                        NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "AudioSource1" },
                        AUDIOGROUP: { type: Scratch.ArgumentType.STRING, menu: 'audioGroup', defaultValue: "" },
                    },
                },
                {
                    opcode: 'audioSourceDeleteAll', text: '[DELETEOPTION] all audio sources in [AUDIOGROUP]', blockType: Scratch.BlockType.COMMAND,
                    arguments: {
                        DELETEOPTION: { type: Scratch.ArgumentType.STRING, menu: 'deleteOptions', defaultValue: "" },
                        AUDIOGROUP: { type: Scratch.ArgumentType.STRING, menu: 'audioGroup', defaultValue: "" },
                    },
                },
                "---",
                {
                    opcode: 'audioSourceSetScratch', text: 'set audio source [NAME] in [AUDIOGROUP] to use [SOUND]', blockType: Scratch.BlockType.COMMAND,
                    arguments: {
                        NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "AudioSource1" },
                        AUDIOGROUP: { type: Scratch.ArgumentType.STRING, menu: 'audioGroup', defaultValue: "" },
                        SOUND: { type: Scratch.ArgumentType.STRING, menu: 'sounds', defaultValue: "" },
                    },
                },
                {
                    opcode: 'audioSourceSetUrl', text: 'set audio source [NAME] in [AUDIOGROUP] to use [URL]', blockType: Scratch.BlockType.COMMAND,
                    arguments: {
                        NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "AudioSource1" },
                        AUDIOGROUP: { type: Scratch.ArgumentType.STRING, menu: 'audioGroup', defaultValue: "" },
                        URL: { type: Scratch.ArgumentType.STRING, defaultValue: "https://pm-bapi.vercel.app/buauauau.mp3" },
                    },
                },
                {
                    opcode: 'audioSourcePlayerOption', text: '[PLAYEROPTION] audio source [NAME] in [AUDIOGROUP]', blockType: Scratch.BlockType.COMMAND,
                    arguments: {
                        PLAYEROPTION: { type: Scratch.ArgumentType.STRING, menu: 'playerOptions', defaultValue: "" },
                        NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "AudioSource1" },
                        AUDIOGROUP: { type: Scratch.ArgumentType.STRING, menu: 'audioGroup', defaultValue: "" },
                    },
                },
                "---",
                {
                    opcode: 'audioSourceSetLoop', text: 'set audio source [NAME] in [AUDIOGROUP] to [LOOP]', blockType: Scratch.BlockType.COMMAND,
                    arguments: {
                        NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "AudioSource1" },
                        AUDIOGROUP: { type: Scratch.ArgumentType.STRING, menu: 'audioGroup', defaultValue: "" },
                        LOOP: { type: Scratch.ArgumentType.STRING, menu: 'loop', defaultValue: "loop" },
                    },
                },
                {
                    opcode: 'audioSourceSetTime', text: 'set audio source [NAME] start position in [AUDIOGROUP] to [TIME] seconds', blockType: Scratch.BlockType.COMMAND,
                    arguments: {
                        NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "AudioSource1" },
                        AUDIOGROUP: { type: Scratch.ArgumentType.STRING, menu: 'audioGroup', defaultValue: "" },
                        TIME: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.3 },
                    },
                },
                {
                    opcode: 'audioSourceSetVolumeSpeedPitchPan', text: 'set audio source [NAME] [VSPP] in [AUDIOGROUP] to [VALUE]%', blockType: Scratch.BlockType.COMMAND,
                    arguments: {
                        NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "AudioSource1" },
                        VSPP: { type: Scratch.ArgumentType.STRING, menu: 'vspp', defaultValue: "" },
                        AUDIOGROUP: { type: Scratch.ArgumentType.STRING, menu: 'audioGroup', defaultValue: "" },
                        VALUE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
                    },
                },
                "---",
                {
                    opcode: 'audioSourceGetModificationsBoolean', text: 'audio source [NAME] [OPTION] in [AUDIOGROUP]', blockType: Scratch.BlockType.BOOLEAN, disableMonitor: true,
                    arguments: {
                        NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "AudioSource1" },
                        OPTION: { type: Scratch.ArgumentType.STRING, menu: 'audioSourceOptionsBooleans', defaultValue: "" },
                        AUDIOGROUP: { type: Scratch.ArgumentType.STRING, menu: 'audioGroup', defaultValue: "" },
                    },
                },
                {
                    opcode: 'audioSourceGetModificationsNormal', text: 'audio source [NAME] [OPTION] in [AUDIOGROUP]', blockType: Scratch.BlockType.REPORTER, disableMonitor: true,
                    arguments: {
                        NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "AudioSource1" },
                        OPTION: { type: Scratch.ArgumentType.STRING, menu: 'audioSourceOptions', defaultValue: "" },
                        AUDIOGROUP: { type: Scratch.ArgumentType.STRING, menu: 'audioGroup', defaultValue: "" },
                    },
                },
            ],
            menus: {
                audioGroup: 'fetchAudioGroupMenu',
                sounds: 'fetchScratchSoundMenu',
                // specific menus
                vspp: {
                    acceptReporters: true,
                    items: [
                        { text: "volume", value: "volume" },
                        { text: "speed", value: "speed" },
                        { text: "pitch", value: "pitch" },
                        { text: "pan", value: "pan" },
                    ]
                },
                playerOptions: {
                    acceptReporters: true,
                    items: [
                        { text: "play", value: "play" },
                        { text: "stop", value: "stop" },
                        // { text: "pause (buggy)", value: "pause" },
                    ]
                },
                loop: {
                    acceptReporters: true,
                    items: [
                        { text: "loop", value: "loop" },
                        { text: "not loop", value: "not loop" },
                    ]
                },
                deleteOptions: {
                    acceptReporters: true,
                    items: [
                        { text: "delete", value: "delete" },
                        { text: "stop", value: "stop" },
                    ]
                },
                createOptions: {
                    acceptReporters: true,
                    items: [
                        { text: "create", value: "create" },
                        { text: "delete", value: "delete" },
                    ]
                },
                // audio group stuff
                audioGroupOptions: {
                    acceptReporters: true,
                    items: [
                        { text: "volume", value: "volume" },
                        { text: "speed", value: "speed" },
                        { text: "pitch", value: "pitch" },
                        { text: "pan", value: "pan" },
                    ]
                },
                // audio source stuff
                audioSourceOptionsBooleans: {
                    acceptReporters: true,
                    items: [
                        { text: "playing", value: "playing" },
                        // { text: "paused", value: "paused" },
                        { text: "looping", value: "looping" },
                    ]
                },
                audioSourceOptions: {
                    acceptReporters: true,
                    items: [
                        { text: "volume", value: "volume" },
                        { text: "speed", value: "speed" },
                        { text: "pitch", value: "pitch" },
                        { text: "pan", value: "pan" },
                        { text: "start position", value: "start position" },
                        { text: "sound length", value: "sound length" },
                        { text: "origin sound", value: "origin sound" },
                    ]
                }
            }
        };
    }

    createAudioGroup() {
        const newGroup = prompt('Set a name for this Audio Group:', 'audio group ' + (GetAllAudioGroups().length + 1));
        if (GetAudioGroup(newGroup)) return;
        AddAudioGroup(newGroup);
        vm.emitWorkspaceUpdate();
        this.serialize();
    }
    deleteAudioGroup() {
        const group = prompt('Which audio group would you like to delete?');
        // helper deals with audio groups that dont exist, so we just call the function with no check
        DeleteAudioGroup(group);
        vm.emitWorkspaceUpdate();
        this.serialize();
    }

    fetchAudioGroupMenu() {
        const audioGroups = GetAllAudioGroups();
        if (audioGroups.length <= 0) {
            return [
                {
                    text: '',
                    value: ''
                }
            ];
        }
        return audioGroups.map(audioGroup => ({
            text: audioGroup.id,
            value: audioGroup.id
        }));
    }
    fetchScratchSoundMenu() {
        const sounds = vm.editingTarget.sprite.sounds; // this function only gets used in the editor so we are safe to use editingTarget
        if (sounds.length <= 0) return [{ text: '', value: '' }];
        return sounds.map(sound => ({
            text: sound.name,
            value: sound.name
        }));
    }

    audioGroupGet(args) {
        const audioGroup = GetAudioGroup(args.AUDIOGROUP);
        return JSON.stringify(Object.getOwnPropertyNames(audioGroup.sources));
    }

    audioGroupSetVolumeSpeedPitchPan(args) {
        const audioGroup = GetAudioGroup(args.AUDIOGROUP);
        switch (args.VSPP) {
            case "volume":
                audioGroup.globalVolume = Clamp(SafeNumberConvert(args.VALUE) / 100, 0, 1);
                break;
            case "speed":
                audioGroup.globalSpeed = Clamp(SafeNumberConvert(args.VALUE) / 100, 0, Infinity);
                break;
            case "pitch":
                audioGroup.globalPitch = SafeNumberConvert(args.VALUE);
                break;
            case "pan":
                audioGroup.globalPan = Clamp(SafeNumberConvert(args.VALUE), -100, 100) / 100;
                break;
        }
        UpdateAudioGroupSources(audioGroup);
    }

    audioSourceCreate(args) {
        const audioGroup = GetAudioGroup(args.AUDIOGROUP);
        switch (args.CREATEOPTION) {
            case "create":
                AppendAudioSource(audioGroup, args.NAME);
                break;
            case "delete":
                RemoveAudioSource(audioGroup, args.NAME);
                break;
        }
    }
    audioSourceDeleteAll(args) {
        const audioGroup = GetAudioGroup(args.AUDIOGROUP);
        Object.getOwnPropertyNames(audioGroup.sources).forEach(sourceName => {
            switch (args.DELETEOPTION) {
                case "delete":
                    RemoveAudioSource(audioGroup, sourceName);
                    break;
                case "stop":
                    audioGroup.sources[sourceName].stop();
                    break;
            }
        });
    }

    audioSourceSetScratch(args, util) {
        return new Promise((resolve, reject) => {
            const audioGroup = GetAudioGroup(args.AUDIOGROUP);
            if (!audioGroup) return resolve();
            const audioSource = GrabAudioSource(audioGroup, args.NAME);
            if (!audioSource) return resolve();
            const sound = FindSoundByName(util.target.sprite.sounds, args.SOUND);
            if (!sound) return resolve();
            let canUse = true;
            try {
                // eslint-disable-next-line no-unused-vars
                let abc = util.target.sprite.soundBank.getSoundPlayer(sound.soundId).buffer;
            } catch {
                canUse = false;
            }
            if (!canUse) return resolve();
            const buffer = util.target.sprite.soundBank.getSoundPlayer(sound.soundId).buffer
            audioSource.duration = buffer.duration;
            audioSource.src = buffer;
            audioSource.originAudioName = `${args.SOUND}`;
            resolve();
        })
    }
    audioSourceSetUrl(args, util) {
        return new Promise((resolve, reject) => {
            const audioGroup = GetAudioGroup(args.AUDIOGROUP);
            if (!audioGroup) return resolve();
            const audioSource = GrabAudioSource(audioGroup, args.NAME);
            if (!audioSource) return resolve();
            fetch(args.URL).then(response => response.arrayBuffer().then(arrayBuffer => {
                audioContext.decodeAudioData(arrayBuffer, buffer => {
                    audioSource.duration = buffer.duration;
                    audioSource.src = buffer;
                    audioSource.originAudioName = `${args.URL}`;
                    resolve();
                }, resolve);
            }).catch(resolve)).catch(err => {
                // this is not a url, try some other stuff instead
                const sound = FindSoundByName(util.target.sprite.sounds, args.URL);
                if (sound) {
                    // this is a scratch sound name
                    let canUse = true;
                    try {
                        // eslint-disable-next-line no-unused-vars
                        let abc = util.target.sprite.soundBank.getSoundPlayer(sound.soundId).buffer;
                    } catch {
                        canUse = false;
                    }
                    if (!canUse) return resolve();
                    const buffer = util.target.sprite.soundBank.getSoundPlayer(sound.soundId).buffer
                    audioSource.duration = buffer.duration;
                    audioSource.src = buffer;
                    audioSource.originAudioName = `${args.URL}`;
                    return resolve();
                }
                console.warn(err);
                return resolve();
            });
        })
    }

    audioSourcePlayerOption(args) {
        const audioGroup = GetAudioGroup(args.AUDIOGROUP);
        if (!audioGroup) return;
        const audioSource = GrabAudioSource(audioGroup, args.NAME);
        if (!audioSource) return;
        if (!["play", "pause", "stop"].includes(args.PLAYEROPTION)) return;
        audioSource[args.PLAYEROPTION]();
    }
    audioSourceSetLoop(args) {
        const audioGroup = GetAudioGroup(args.AUDIOGROUP);
        if (!audioGroup) return;
        const audioSource = GrabAudioSource(audioGroup, args.NAME);
        if (!audioSource) return;
        if (!["loop", "not loop"].includes(args.LOOP)) return;
        audioSource.looping = args.LOOP == "loop";
    }
    audioSourceSetTime(args) {
        const audioGroup = GetAudioGroup(args.AUDIOGROUP);
        if (!audioGroup) return;
        const audioSource = GrabAudioSource(audioGroup, args.NAME);
        if (!audioSource) return;
        audioSource.timePosition = SafeNumberConvert(args.TIME);
    }
    audioSourceSetVolumeSpeedPitchPan(args) {
        const audioGroup = GetAudioGroup(args.AUDIOGROUP);
        if (!audioGroup) return;
        const audioSource = GrabAudioSource(audioGroup, args.NAME);
        if (!audioSource) return;
        switch (args.VSPP) {
            case "volume":
                audioSource.volume = Clamp(SafeNumberConvert(args.VALUE) / 100, 0, 1);
                break;
            case "speed":
                audioSource.speed = Clamp(SafeNumberConvert(args.VALUE) / 100, 0, Infinity);
                break;
            case "pitch":
                audioSource.pitch = SafeNumberConvert(args.VALUE);
                break;
            case "pan":
                audioSource.pan = Clamp(SafeNumberConvert(args.VALUE), -100, 100) / 100;
                break;
        }
        UpdateAudioGroupSources(audioGroup);
    }

    audioGroupGetModifications(args) {
        const audioGroup = GetAudioGroup(args.AUDIOGROUP);
        switch (args.OPTION) {
            case "volume":
                return audioGroup.globalVolume * 100;
            case "speed":
                return audioGroup.globalSpeed * 100;
            case "pitch":
                return audioGroup.globalPitch;
            case "pan":
                return audioGroup.globalPan * 100;
            default:
                return 0;
        }
    }
    audioSourceGetModificationsBoolean(args) {
        const audioGroup = GetAudioGroup(args.AUDIOGROUP);
        if (!audioGroup) return false;
        const audioSource = GrabAudioSource(audioGroup, args.NAME);
        if (!audioSource) return false;
        switch (args.OPTION) {
            case "playing":
                return ((!audioSource.paused) && (!audioSource.notPlaying));
            case "paused":
                return audioSource.paused;
            case "looping":
                return audioSource.looping;
            default:
                return false;
        }
    }
    audioSourceGetModificationsNormal(args) {
        const audioGroup = GetAudioGroup(args.AUDIOGROUP);
        if (!audioGroup) return "";
        const audioSource = GrabAudioSource(audioGroup, args.NAME);
        if (!audioSource) return "";
        switch (args.OPTION) {
            case "volume":
                return audioSource.volume * 100;
            case "speed":
                return audioSource.speed * 100;
            case "pitch":
                return audioSource.pitch;
            case "pan":
                return audioSource.pan * 100;
            case "start position":
                return audioSource.timePosition;
            case "sound length":
                return audioSource.duration;
            case "origin sound":
                return audioSource.originAudioName;
            default:
                return "";
        }
    }
}

Scratch.extensions.register(new AudioExtension());
})(Scratch);
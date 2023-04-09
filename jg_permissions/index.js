const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');
const ProjectPermissionManager = require('../../util/project-permissions');

/**
 * Class for Permission blocks
 * @constructor
 */
class JgPermissionBlocks {
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
            id: 'JgPermissionBlocks',
            name: 'Permissions',
            color1: '#00C4FF',
            color2: '#0093FF',
            blocks: [
                {
                    opcode: 'requestPermission',
                    text: 'request [PERMISSION] permission',
                    disableMonitor: false,
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        PERMISSION: {
                            type: ArgumentType.STRING,
                            menu: 'permissions',
                            defaultValue: "javascript"
                        }
                    }
                },
                {
                    opcode: 'requestAllPermission',
                    text: 'request all permissions',
                    disableMonitor: false,
                    blockType: BlockType.BOOLEAN
                },
                {
                    opcode: 'requestSitePermission',
                    text: 'request permission to show [URL]',
                    disableMonitor: false,
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: "https://www.example.com"
                        }
                    }
                },
            ],
            menus: {
                permissions: "fetchPermissionsList"
            }
        };
    }

    fetchPermissionsList() {
        return Object.getOwnPropertyNames(ProjectPermissionManager.permissions).filter(name => typeof ProjectPermissionManager.permissions[name] === "boolean").map(permissionName => ({
            text: permissionName,
            value: permissionName
        }));
    }

    requestPermission(args) {
        const permission = args.PERMISSION;
        if (ProjectPermissionManager.permissions[permission] == true) return true;
        return ProjectPermissionManager.RequestPermission(permission);
    }
    requestAllPermission() {
        return ProjectPermissionManager.RequestAllPermissions();
    }
    requestSitePermission(args) {
        const site = args.URL;
        if (ProjectPermissionManager.permissions.limitedWebsites[site] == true) return true;
        return ProjectPermissionManager.RequestPermission("limitedWebsite", site);
    }
}

module.exports = JgPermissionBlocks;
